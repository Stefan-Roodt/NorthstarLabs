import { env } from "cloudflare:workers";
import {
  hashInvitationToken,
  invitationRoleLabel,
  maskInvitationEmail,
} from "../../../../lib/invitations";
import { ensureProfile } from "../../../../lib/school-access";
import { requireApiUser } from "../../../../lib/server-auth";

type InvitationRow = {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  courseId: string | null;
  courseTitle: string | null;
  email: string;
  role: string;
  status: string;
  expiresAt: number;
};

async function invitationByToken(token: string) {
  const tokenHash = await hashInvitationToken(token);
  return env.DB.prepare(
    `SELECT i.id,i.school_id AS schoolId,s.name AS schoolName,s.slug AS schoolSlug,
      i.course_id AS courseId,c.title AS courseTitle,i.email,i.role,i.status,
      i.expires_at AS expiresAt
     FROM invitations i
     JOIN schools s ON s.id=i.school_id AND s.status='active'
     LEFT JOIN courses c ON c.id=i.course_id
     WHERE i.token_hash=?`,
  ).bind(tokenHash).first<InvitationRow>();
}

function publicInvitation(invitation: InvitationRow) {
  const status = invitation.status === "pending" && invitation.expiresAt <= Date.now()
    ? "expired"
    : invitation.status;
  return {
    schoolName: invitation.schoolName,
    courseTitle: invitation.courseTitle,
    role: invitation.role,
    roleLabel: invitationRoleLabel(invitation.role),
    maskedEmail: maskInvitationEmail(invitation.email),
    status,
    expiresAt: invitation.expiresAt,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const invitation = await invitationByToken(token);
  if (!invitation) return Response.json({ error: "Invitation not found." }, { status: 404 });
  return Response.json(publicInvitation(invitation));
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const user = await requireApiUser(request);
  if (!user?.email) return Response.json({ error: "Sign in to accept this invitation." }, { status: 401 });
  const { token } = await context.params;
  const invitation = await invitationByToken(token);
  if (!invitation) return Response.json({ error: "Invitation not found." }, { status: 404 });
  if (invitation.status !== "pending") {
    return Response.json({ error: `This invitation is ${invitation.status}.` }, { status: 409 });
  }
  if (invitation.expiresAt <= Date.now()) {
    return Response.json({ error: "This invitation has expired. Ask the academy for a new link." }, { status: 410 });
  }
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return Response.json(
      { error: `Sign in with the invited account (${maskInvitationEmail(invitation.email)}).` },
      { status: 403 },
    );
  }

  await ensureProfile(user);
  const now = Date.now();
  const membershipId = crypto.randomUUID();
  const enrollmentId = crypto.randomUUID();
  const statements = [
    env.DB.prepare(
      `INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(school_id,user_id) DO UPDATE SET
         status='active',
         role=CASE
           WHEN school_members.role='owner' THEN 'owner'
           WHEN excluded.role='admin' THEN 'admin'
           WHEN school_members.role='admin' THEN 'admin'
           WHEN excluded.role='instructor' THEN 'instructor'
           WHEN school_members.role='instructor' THEN 'instructor'
           ELSE 'learner'
         END`,
    ).bind(membershipId, invitation.schoolId, user.id, invitation.role, "active", now),
  ];

  if (invitation.courseId) {
    statements.push(
      env.DB.prepare(
        `INSERT INTO enrollments
         (id,user_id,course_id,progress,status,support_note,last_activity_at,created_at)
         VALUES (?,?,?,?,?,?,?,?)
         ON CONFLICT(user_id,course_id) DO UPDATE SET
           status='active',last_activity_at=excluded.last_activity_at`,
      ).bind(enrollmentId, user.id, invitation.courseId, 0, "active", "", now, now),
    );
  }

  if (invitation.role === "learner") {
    statements.push(
      env.DB.prepare(
        `UPDATE profiles SET
           role=CASE WHEN role='creator' THEN role ELSE 'learner' END,
           active_school_id=CASE
             WHEN role='creator' AND active_school_id IS NOT NULL THEN active_school_id
             ELSE ?
           END,
           onboarding_path=COALESCE(onboarding_path,'learner'),
           onboarding_completed=1,onboarded_at=COALESCE(onboarded_at,?)
         WHERE id=?`,
      ).bind(invitation.schoolId, now, user.id),
    );
  } else {
    statements.push(
      env.DB.prepare(
        `UPDATE profiles SET role='creator',active_school_id=?,
         onboarding_path=COALESCE(onboarding_path,'creator'),
         onboarding_completed=1,onboarded_at=COALESCE(onboarded_at,?)
         WHERE id=?`,
      ).bind(invitation.schoolId, now, user.id),
    );
  }

  statements.push(
    env.DB.prepare(
      `UPDATE invitations SET status='accepted',accepted_by=?,accepted_at=?
       WHERE id=? AND status='pending'`,
    ).bind(user.id, now, invitation.id),
  );
  await env.DB.batch(statements);

  const destination = invitation.role !== "learner"
    ? "/dashboard"
    : invitation.courseId
      ? `/learn/${encodeURIComponent(invitation.courseId)}`
      : `/schools/${encodeURIComponent(invitation.schoolSlug)}`;
  return Response.json({ accepted: true, destination });
}
