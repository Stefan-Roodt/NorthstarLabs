import { env } from "cloudflare:workers";
import {
  createInvitationToken,
  hashInvitationToken,
  INVITATION_LIFETIME_MS,
  INVITATION_ROLES,
  isValidInvitationEmail,
  normalizeInvitationEmail,
  type InvitationRole,
} from "../../../lib/invitations";
import { requireApiUser } from "../../../lib/server-auth";
import {
  requestedSchoolId,
  requireCreatorSchool,
} from "../../../lib/school-access";

const invitationSelect = `
  SELECT i.id,i.email,i.role,i.status,i.school_id AS schoolId,
    i.course_id AS courseId,i.invited_by AS invitedBy,
    i.expires_at AS expiresAt,i.accepted_by AS acceptedBy,
    i.accepted_at AS acceptedAt,i.created_at AS createdAt,
    c.title AS courseTitle
  FROM invitations i
  LEFT JOIN courses c ON c.id=i.course_id`;

function canInviteRole(memberRole: string, invitationRole: InvitationRole) {
  if (invitationRole === "admin") return memberRole === "owner";
  if (invitationRole === "instructor") {
    return memberRole === "owner" || memberRole === "admin";
  }
  return ["owner", "admin", "instructor"].includes(memberRole);
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });
  const rows = await env.DB.prepare(
    `${invitationSelect}
     WHERE i.school_id=?
     ORDER BY CASE i.status WHEN 'pending' THEN 0 ELSE 1 END,i.created_at DESC
     LIMIT 100`,
  ).bind(school.id).all();
  const invitations = (rows.results as Array<{ status: string; expiresAt: number }>).map((invitation) => ({
    ...invitation,
    status: invitation.status === "pending" && invitation.expiresAt <= Date.now()
      ? "expired"
      : invitation.status,
  }));
  return Response.json({ school, invitations });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });
  const body = await request.json() as {
    email?: string;
    courseId?: string | null;
    role?: string;
  };
  const email = normalizeInvitationEmail(body.email || "");
  const role = (body.role || "learner") as InvitationRole;
  if (!isValidInvitationEmail(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!INVITATION_ROLES.includes(role)) {
    return Response.json({ error: "Choose a valid invitation role." }, { status: 400 });
  }
  if (!canInviteRole(school.memberRole, role)) {
    return Response.json(
      { error: role === "admin" ? "Only the academy owner can invite an admin." : "You cannot invite that role." },
      { status: 403 },
    );
  }

  const courseId = role === "learner" ? body.courseId || null : null;
  if (courseId) {
    const course = await env.DB.prepare(
      "SELECT id FROM courses WHERE id=? AND school_id=?",
    ).bind(courseId, school.id).first();
    if (!course) return Response.json({ error: "Course not found." }, { status: 404 });
  }

  const token = createInvitationToken();
  const tokenHash = await hashInvitationToken(token);
  const invitationId = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + INVITATION_LIFETIME_MS;
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE invitations SET status='revoked'
       WHERE school_id=? AND email=? AND role=? AND course_id IS ? AND status='pending'`,
    ).bind(school.id, email, role, courseId),
    env.DB.prepare(
      `INSERT INTO invitations
       (id,school_id,course_id,email,role,token_hash,status,invited_by,expires_at,created_at)
       VALUES (?,?,?,?,?,?,'pending',?,?,?)`,
    ).bind(
      invitationId,
      school.id,
      courseId,
      email,
      role,
      tokenHash,
      user.id,
      expiresAt,
      now,
    ),
  ]);
  const invitation = await env.DB.prepare(
    `${invitationSelect} WHERE i.id=? AND i.school_id=?`,
  ).bind(invitationId, school.id).first();
  const origin = new URL(request.url).origin;
  const inviteUrl = `${origin}/invite/${encodeURIComponent(token)}`;
  return Response.json({ invitation, inviteUrl }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });
  const { invitationId } = await request.json() as { invitationId?: string };
  if (!invitationId) {
    return Response.json({ error: "Invitation required." }, { status: 400 });
  }
  const invitation = await env.DB.prepare(
    "SELECT id,role,status FROM invitations WHERE id=? AND school_id=?",
  ).bind(invitationId, school.id).first<{ id: string; role: InvitationRole; status: string }>();
  if (!invitation) return Response.json({ error: "Invitation not found." }, { status: 404 });
  if (!canInviteRole(school.memberRole, invitation.role)) {
    return Response.json({ error: "You cannot revoke that invitation." }, { status: 403 });
  }
  if (invitation.status !== "pending") {
    return Response.json({ error: "Only pending invitations can be revoked." }, { status: 409 });
  }
  await env.DB.prepare(
    "UPDATE invitations SET status='revoked' WHERE id=? AND school_id=? AND status='pending'",
  ).bind(invitation.id, school.id).run();
  return Response.json({ saved: true, status: "revoked" });
}
