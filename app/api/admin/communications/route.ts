import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import { queueEmail, retryEmail } from "../../../../lib/email-service";
import { getSchoolReport } from "../../../../lib/reporting";
import { requireApiUser } from "../../../../lib/server-auth";
import { requestedSchoolId, requireCreatorSchool } from "../../../../lib/school-access";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function nextRun(frequency: string) {
  const days = frequency === "monthly" ? 30 : 7;
  return Date.now() + days * 86_400_000;
}

async function dispatchDueSchedule(input: {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  primaryColor: string;
  origin: string;
}) {
  const schedule = await env.DB.prepare(
    `SELECT id,created_by AS createdBy,frequency,recipient_email AS recipientEmail,
      next_run_at AS nextRunAt
     FROM report_schedules
     WHERE school_id=? AND status='active' AND next_run_at<=?
     ORDER BY next_run_at LIMIT 1`,
  ).bind(input.schoolId, Date.now()).first<{
    id: string;
    createdBy: string;
    frequency: string;
    recipientEmail: string;
    nextRunAt: number;
  }>();
  if (!schedule) return;
  const to = Date.now();
  const periodDays = schedule.frequency === "monthly" ? 30 : 7;
  const report = await getSchoolReport(env.DB, input.schoolId, {
    from: to - (periodDays - 1) * 86_400_000,
    to,
  });
  const summary = report.summary as Record<string, unknown>;
  const delivery = await queueEmail({
    schoolId: input.schoolId,
    recipientUserId: schedule.createdBy,
    recipientEmail: schedule.recipientEmail,
    templateKey: "creator_summary",
    variables: {
      academy: input.schoolName,
      primaryColor: input.primaryColor,
      activeLearners: Number(summary.activeLearners || 0),
      completions: Number(summary.completions || 0),
      averageProgress: Number(summary.averageProgress || 0),
      period: schedule.frequency === "monthly" ? "Last 30 days" : "Last 7 days",
      actionUrl: `${input.origin}/dashboard/analytics`,
    },
    idempotencyKey: `schedule:${schedule.id}:${schedule.nextRunAt}`,
  });
  await env.DB.prepare(
    `UPDATE report_schedules SET last_run_at=?,next_run_at=?,updated_at=? WHERE id=?`,
  ).bind(to, nextRun(schedule.frequency), to, schedule.id).run();
  await writeAuditLog({
    actorId: schedule.createdBy,
    schoolId: input.schoolId,
    action: "report.schedule.dispatch",
    targetType: "report_schedule",
    targetId: schedule.id,
    detail: { emailStatus: delivery.status, recipientEmail: schedule.recipientEmail },
  });
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });
  await dispatchDueSchedule({
    schoolId: school.id,
    schoolName: school.name,
    schoolSlug: school.slug,
    primaryColor: school.primaryColor,
    origin: new URL(request.url).origin,
  }).catch(() => null);
  const [messages, schedules, audit] = await Promise.all([
    env.DB.prepare(
      `SELECT id,recipient_email AS recipientEmail,template_key AS templateKey,
        subject,status,attempt_count AS attemptCount,last_error AS lastError,
        sent_at AS sentAt,created_at AS createdAt
       FROM email_messages WHERE school_id=?
       ORDER BY created_at DESC LIMIT 80`,
    ).bind(school.id).all(),
    env.DB.prepare(
      `SELECT id,frequency,recipient_email AS recipientEmail,status,
        next_run_at AS nextRunAt,last_run_at AS lastRunAt
       FROM report_schedules WHERE school_id=?
       ORDER BY created_at DESC`,
    ).bind(school.id).all(),
    env.DB.prepare(
      `SELECT al.id,al.action,al.target_type AS targetType,al.target_id AS targetId,
        al.detail_json AS detailJson,al.created_at AS createdAt,
        COALESCE(p.display_name,p.email,'System') AS actor
       FROM audit_logs al LEFT JOIN profiles p ON p.id=al.actor_id
       WHERE al.school_id=? ORDER BY al.created_at DESC LIMIT 40`,
    ).bind(school.id).all(),
  ]);
  return Response.json({
    school,
    currentUserEmail: user.email || "",
    provider: {
      name: "Resend",
      configured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
      sender: process.env.EMAIL_FROM || null,
    },
    messages: messages.results,
    schedules: schedules.results,
    audit: audit.results,
  });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required" }, { status: 403 });
  const body = await request.json() as {
    action?: string;
    messageId?: string;
    frequency?: string;
    recipientEmail?: string;
  };

  if (body.action === "test") {
    const result = await queueEmail({
      schoolId: school.id,
      recipientUserId: user.id,
      recipientEmail: user.email,
      templateKey: "test",
      variables: {
        academy: school.name,
        primaryColor: school.primaryColor,
        actionUrl: `${new URL(request.url).origin}/schools/${school.slug}`,
      },
      idempotencyKey: `test:${school.id}:${crypto.randomUUID()}`,
    });
    await writeAuditLog({
      actorId: user.id,
      schoolId: school.id,
      action: "email.test",
      targetType: "email_message",
      targetId: result.id || "suppressed",
      detail: { status: result.status },
    });
    return Response.json(result);
  }

  if (body.action === "retry" && body.messageId) {
    const message = await env.DB.prepare(
      "SELECT id FROM email_messages WHERE id=? AND school_id=?",
    ).bind(body.messageId, school.id).first();
    if (!message) return Response.json({ error: "Email not found." }, { status: 404 });
    const result = await retryEmail(body.messageId);
    await writeAuditLog({
      actorId: user.id,
      schoolId: school.id,
      action: "email.retry",
      targetType: "email_message",
      targetId: body.messageId,
      detail: { status: result.status },
    });
    return Response.json(result);
  }

  if (body.action === "schedule") {
    if (!["weekly", "monthly", "off"].includes(body.frequency || "")) {
      return Response.json({ error: "Choose weekly, monthly, or off." }, { status: 400 });
    }
    const recipientEmail = (body.recipientEmail || user.email).trim().toLowerCase();
    if (!validEmail(recipientEmail)) {
      return Response.json({ error: "Enter a valid report email." }, { status: 400 });
    }
    const existing = await env.DB.prepare(
      "SELECT id FROM report_schedules WHERE school_id=? ORDER BY created_at LIMIT 1",
    ).bind(school.id).first<{ id: string }>();
    const now = Date.now();
    const status = body.frequency === "off" ? "paused" : "active";
    if (existing) {
      await env.DB.prepare(
        `UPDATE report_schedules SET frequency=?,recipient_email=?,status=?,
         next_run_at=?,updated_at=? WHERE id=?`,
      ).bind(body.frequency, recipientEmail, status, nextRun(body.frequency || "weekly"), now, existing.id).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO report_schedules
          (id,school_id,created_by,frequency,recipient_email,status,next_run_at,created_at,updated_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
      ).bind(
        crypto.randomUUID(),
        school.id,
        user.id,
        body.frequency,
        recipientEmail,
        status,
        nextRun(body.frequency || "weekly"),
        now,
        now,
      ).run();
    }
    await writeAuditLog({
      actorId: user.id,
      schoolId: school.id,
      action: "report.schedule",
      targetType: "school",
      targetId: school.id,
      detail: { frequency: body.frequency, recipientEmail, status },
    });
    return Response.json({ saved: true, frequency: body.frequency, recipientEmail, status });
  }

  if (body.action === "send_summary") {
    const to = Date.now();
    const from = to - 6 * 86_400_000;
    const report = await getSchoolReport(env.DB, school.id, { from, to });
    const recipientEmail = (body.recipientEmail || user.email).trim().toLowerCase();
    if (!validEmail(recipientEmail)) {
      return Response.json({ error: "Enter a valid report email." }, { status: 400 });
    }
    const summary = report.summary as Record<string, unknown>;
    const result = await queueEmail({
      schoolId: school.id,
      recipientUserId: user.id,
      recipientEmail,
      templateKey: "creator_summary",
      variables: {
        academy: school.name,
        primaryColor: school.primaryColor,
        activeLearners: Number(summary.activeLearners || 0),
        completions: Number(summary.completions || 0),
        averageProgress: Number(summary.averageProgress || 0),
        period: "Last 7 days",
        actionUrl: `${new URL(request.url).origin}/dashboard/analytics`,
      },
      idempotencyKey: `summary:${school.id}:${recipientEmail}:${new Date().toISOString().slice(0, 10)}`,
    });
    await writeAuditLog({
      actorId: user.id,
      schoolId: school.id,
      action: "report.send",
      targetType: "email_message",
      targetId: result.id || "suppressed",
      detail: { recipientEmail, status: result.status },
    });
    return Response.json(result);
  }

  return Response.json({ error: "Choose a valid communication action." }, { status: 400 });
}
