import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import { retryEmail } from "../../../../lib/email-service";
import { requirePlatformAdmin } from "../../../../lib/platform-admin";

export async function GET(request: Request) {
  const user = await requirePlatformAdmin(request);
  if (!user) return Response.json({ error: "Platform administrator access required." }, { status: 403 });
  const [metrics, schools, users, messages, audit] = await Promise.all([
    env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM schools) AS schools,
        (SELECT COUNT(*) FROM schools WHERE status='active') AS activeSchools,
        (SELECT COUNT(*) FROM profiles) AS users,
        (SELECT COUNT(*) FROM profiles WHERE status='suspended') AS suspendedUsers,
        (SELECT COUNT(*) FROM courses WHERE status='published') AS publishedCourses,
        (SELECT COUNT(*) FROM enrollments WHERE status='active') AS activeEnrollments,
        (SELECT COUNT(*) FROM email_messages WHERE status='sent') AS sentEmails,
        (SELECT COUNT(*) FROM email_messages WHERE status IN ('failed','configuration_required')) AS emailAttention`,
    ).first(),
    env.DB.prepare(
      `SELECT s.id,s.name,s.slug,s.status,s.updated_at AS updatedAt,
        COALESCE(p.display_name,p.email,s.owner_id) AS owner,
        (SELECT COUNT(*) FROM courses c WHERE c.school_id=s.id) AS courses,
        (SELECT COUNT(*) FROM school_members sm WHERE sm.school_id=s.id AND sm.status='active') AS members
       FROM schools s LEFT JOIN profiles p ON p.id=s.owner_id
       ORDER BY s.updated_at DESC LIMIT 100`,
    ).all(),
    env.DB.prepare(
      `SELECT id,email,display_name AS displayName,role,status,created_at AS createdAt
       FROM profiles ORDER BY created_at DESC LIMIT 100`,
    ).all(),
    env.DB.prepare(
      `SELECT em.id,em.recipient_email AS recipientEmail,em.subject,em.status,
        em.attempt_count AS attemptCount,em.last_error AS lastError,
        em.created_at AS createdAt,s.name AS schoolName
       FROM email_messages em LEFT JOIN schools s ON s.id=em.school_id
       ORDER BY em.created_at DESC LIMIT 80`,
    ).all(),
    env.DB.prepare(
      `SELECT al.id,al.action,al.target_type AS targetType,al.target_id AS targetId,
        al.detail_json AS detailJson,al.created_at AS createdAt,
        COALESCE(p.display_name,p.email,'System') AS actor,s.name AS schoolName
       FROM audit_logs al
       LEFT JOIN profiles p ON p.id=al.actor_id
       LEFT JOIN schools s ON s.id=al.school_id
       ORDER BY al.created_at DESC LIMIT 100`,
    ).all(),
  ]);
  return Response.json({
    metrics,
    schools: schools.results,
    users: users.results,
    messages: messages.results,
    audit: audit.results,
    provider: {
      configured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
      sender: process.env.EMAIL_FROM || null,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await requirePlatformAdmin(request);
  if (!user) return Response.json({ error: "Platform administrator access required." }, { status: 403 });
  const body = await request.json() as {
    targetType?: string;
    targetId?: string;
    action?: string;
  };
  if (!body.targetId || !body.action) {
    return Response.json({ error: "Target and action are required." }, { status: 400 });
  }

  if (body.targetType === "school" && ["suspend", "reactivate"].includes(body.action)) {
    const status = body.action === "suspend" ? "suspended" : "active";
    const result = await env.DB.prepare(
      "UPDATE schools SET status=?,updated_at=? WHERE id=?",
    ).bind(status, Date.now(), body.targetId).run();
    if (!result.meta.changes) return Response.json({ error: "School not found." }, { status: 404 });
    await writeAuditLog({
      actorId: user.id,
      action: `platform.school.${body.action}`,
      targetType: "school",
      targetId: body.targetId,
      schoolId: body.targetId,
      detail: { status },
    });
    return Response.json({ saved: true, status });
  }

  if (body.targetType === "user" && ["suspend", "reactivate"].includes(body.action)) {
    if (body.targetId === user.id) {
      return Response.json({ error: "You cannot suspend your own administrator account." }, { status: 400 });
    }
    const status = body.action === "suspend" ? "suspended" : "active";
    const result = await env.DB.prepare(
      "UPDATE profiles SET status=? WHERE id=?",
    ).bind(status, body.targetId).run();
    if (!result.meta.changes) return Response.json({ error: "User not found." }, { status: 404 });
    await writeAuditLog({
      actorId: user.id,
      action: `platform.user.${body.action}`,
      targetType: "user",
      targetId: body.targetId,
      detail: { status },
    });
    return Response.json({ saved: true, status });
  }

  if (body.targetType === "email" && body.action === "retry") {
    const message = await env.DB.prepare(
      "SELECT id,school_id AS schoolId FROM email_messages WHERE id=?",
    ).bind(body.targetId).first<{ id: string; schoolId: string | null }>();
    if (!message) return Response.json({ error: "Email not found." }, { status: 404 });
    const result = await retryEmail(message.id);
    await writeAuditLog({
      actorId: user.id,
      schoolId: message.schoolId,
      action: "platform.email.retry",
      targetType: "email_message",
      targetId: message.id,
      detail: { status: result.status },
    });
    return Response.json(result);
  }

  return Response.json({ error: "Unsupported administration action." }, { status: 400 });
}
