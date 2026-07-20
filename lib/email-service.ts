import { env } from "cloudflare:workers";

export type EmailTemplateKey =
  | "invitation"
  | "enrollment"
  | "product_access"
  | "certificate"
  | "tutor_enquiry"
  | "tutor_booking_update"
  | "tutor_review_request"
  | "learner_rating_request"
  | "tutor_booking_cancelled"
  | "learning_request_received"
  | "learning_request_admin"
  | "live_session_reminder"
  | "creator_summary"
  | "test";

type EmailVariables = Record<string, string | number | null | undefined>;

type QueueEmailInput = {
  schoolId?: string | null;
  recipientUserId?: string | null;
  recipientEmail: string;
  templateKey: EmailTemplateKey;
  variables: EmailVariables;
  idempotencyKey: string;
  scheduledFor?: number | null;
  sendNow?: boolean;
};

const RESEND_SCHEDULE_WINDOW_MS = 29 * 24 * 60 * 60_000;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeUrl(value: unknown) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "#";
  } catch {
    return "#";
  }
}

function templateContent(templateKey: EmailTemplateKey, values: EmailVariables) {
  const academy = String(values.academy || "NorthStarLabs");
  if (templateKey === "invitation") {
    const course = values.course ? ` for “${values.course}”` : "";
    return {
      subject: `You’re invited to ${academy}`,
      heading: `Your invitation to ${academy}`,
      intro: `${values.inviter || academy} invited you to join as ${values.role || "a learner"}${course}.`,
      actionLabel: "Accept invitation",
      actionUrl: safeUrl(values.actionUrl),
      detail: `This secure invitation expires ${values.expires || "soon"}.`,
    };
  }
  if (templateKey === "enrollment") {
    return {
      subject: `You’re enrolled in ${values.course || "your course"}`,
      heading: "Your course is ready",
      intro: `You now have access to “${values.course || "your course"}” from ${academy}.`,
      actionLabel: "Start learning",
      actionUrl: safeUrl(values.actionUrl),
      detail: "Your progress, notes, assessments, and certificate will stay connected to your account.",
    };
  }
  if (templateKey === "product_access") {
    return {
      subject: `Your access to ${values.product || "a learning programme"}`,
      heading: "Your programme is ready",
      intro: `You now have access to “${values.product || "your programme"}” from ${academy}.`,
      actionLabel: "Open my learning",
      actionUrl: safeUrl(values.actionUrl),
      detail: values.expires
        ? `Your access is available until ${values.expires}. Included courses, community, and live sessions are connected automatically.`
        : "Included courses, community, and live sessions are connected automatically.",
    };
  }
  if (templateKey === "certificate") {
    return {
      subject: `Your certificate for ${values.course || "course completion"}`,
      heading: "You completed the course",
      intro: `Congratulations on completing “${values.course || "your course"}” with ${academy}.`,
      actionLabel: "View certificate",
      actionUrl: safeUrl(values.actionUrl),
      detail: "Your certificate can be viewed, downloaded as a PDF, and independently verified.",
    };
  }
  if (templateKey === "tutor_enquiry") {
    return {
      subject: `New tutoring enquiry for ${values.tutor || "your academy"}`,
      heading: `A learner wants to meet with ${values.tutor || "a tutor"}`,
      intro: `${values.learner || "A learner"} is asking for personal help with ${values.subject || "their learning"}.`,
      actionLabel: "Review enquiry",
      actionUrl: safeUrl(values.actionUrl),
      detail: `Preferred contact: ${values.contactPreference || "email"}. Preferred times: ${values.preferredTimes || "Not supplied"}.`,
    };
  }
  if (templateKey === "tutor_booking_update") {
    const confirmed = values.status === "booked";
    return {
      subject: confirmed
        ? `Tutoring appointment confirmed with ${values.tutor || "your tutor"}`
        : `Tutoring appointment update from ${academy}`,
      heading: confirmed ? "Your tutoring time is confirmed" : "Your requested time is available again",
      intro: confirmed
        ? `${values.tutor || "Your tutor"} confirmed your appointment for ${values.chosenTime || "the requested time"}.`
        : `${values.tutor || "The tutor"} could not confirm ${values.chosenTime || "the requested time"}. You can choose another available slot or contact the academy.`,
      actionLabel: confirmed ? "View appointment" : "Choose another time",
      actionUrl: safeUrl(values.actionUrl),
      detail: confirmed
        ? String(values.meetingDetails || "The tutor or academy will share any final joining details before the session.")
        : "No payment has been taken. Your original enquiry remains in your tutoring history.",
    };
  }
  if (templateKey === "tutor_review_request") {
    return {
      subject: `How was your session with ${values.tutor || "your coach"}?`,
      heading: "Your session is complete",
      intro: `${values.tutor || "Your coach"} marked your session as completed. Share an honest review to help the next learner choose confidently.`,
      actionLabel: "Review my session",
      actionUrl: safeUrl(values.actionUrl),
      detail: "Only learners from completed NorthstarLabs sessions can publish a verified-session review.",
    };
  }
  if (templateKey === "learner_rating_request") {
    return {
      subject: `Rate your completed session with ${values.learner || "your learner"}`,
      heading: "Complete the two-way session rating",
      intro: `Your session with ${values.learner || "the learner"} is complete. Add a private rating while the details are still fresh.`,
      actionLabel: "Rate completed session",
      actionUrl: safeUrl(values.actionUrl),
      detail: "The learner sees only a protected aggregate after at least three ratings. Private academy notes are never shared publicly or with other coaches.",
    };
  }
  if (templateKey === "tutor_booking_cancelled") {
    return {
      subject: `Tutoring appointment cancelled by ${values.learner || "a learner"}`,
      heading: "A learner cancelled a tutoring appointment",
      intro: `${values.learner || "A learner"} cancelled the appointment with ${values.tutor || "the tutor"} for ${values.chosenTime || "the scheduled time"}.`,
      actionLabel: "Open tutor desk",
      actionUrl: safeUrl(values.actionUrl),
      detail: "The appointment time has been released so another learner can request it.",
    };
  }
  if (templateKey === "learning_request_received") {
    return {
      subject: `We received your request about ${values.topic || "what you want to learn"}`,
      heading: "Your request reached NorthstarLabs",
      intro: `Thank you, ${values.requester || "we have it"}. We will review the ${values.requestType || "learning"} support you described and check for a suitable course, coach, or expert.`,
      actionLabel: "Explore NorthstarLabs",
      actionUrl: safeUrl(values.actionUrl),
      detail: "We cannot promise that every request will have an immediate match, but we will give you an honest answer rather than send you to something unrelated.",
    };
  }
  if (templateKey === "learning_request_admin") {
    return {
      subject: `New Northstar request: ${values.topic || "topic not supplied"}`,
      heading: "A prospective user could not find what they needed",
      intro: `${values.requester || "A visitor"} requested ${values.requestType || "learning support"} for ${values.topic || "an unspecified topic"}.`,
      actionLabel: "Review request queue",
      actionUrl: safeUrl(values.actionUrl),
      detail: String(values.detail || "No additional detail was supplied."),
    };
  }
  if (templateKey === "live_session_reminder") {
    return {
      subject: `${values.session || "Your live session"} ${values.reminderLabel || "starts soon"}`,
      heading: `${values.session || "Your live session"} ${values.reminderLabel || "starts soon"}`,
      intro: `${values.learner || "Hello"}, your ${values.sessionType || "live learning"} session with ${academy} begins ${values.starts || "soon"}.`,
      actionLabel: "Open my live calendar",
      actionUrl: safeUrl(values.actionUrl),
      detail: `Time zone: ${values.timezone || "your device time"}. Your secure joining link and calendar download are available in NorthstarLabs.`,
    };
  }
  if (templateKey === "creator_summary") {
    return {
      subject: `${academy} learning report`,
      heading: `${academy} performance summary`,
      intro: `${values.activeLearners || 0} active learners, ${values.completions || 0} completions, and ${values.averageProgress || 0}% average progress.`,
      actionLabel: "Open full report",
      actionUrl: safeUrl(values.actionUrl),
      detail: `Reporting period: ${values.period || "latest activity"}.`,
    };
  }
  return {
    subject: `${academy} email delivery test`,
    heading: "Email delivery is connected",
    intro: `This test confirms that ${academy} can send platform notifications.`,
    actionLabel: "Open academy",
    actionUrl: safeUrl(values.actionUrl),
    detail: "Invitations, enrolment confirmations, certificates, and scheduled reports can now be delivered.",
  };
}

function renderEmail(templateKey: EmailTemplateKey, values: EmailVariables) {
  const content = templateContent(templateKey, values);
  const academy = escapeHtml(values.academy || "NorthStarLabs");
  const primary = /^#[0-9a-f]{6}$/i.test(String(values.primaryColor || ""))
    ? String(values.primaryColor)
    : "#3556d8";
  const actionUrl = safeUrl(content.actionUrl);
  const html = `<!doctype html>
<html><body style="margin:0;background:#f6eee5;color:#171724;font-family:Arial,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:32px 18px">
<div style="font-weight:800;letter-spacing:.04em;margin-bottom:24px">${academy}</div>
<div style="background:#fffaf4;border:1px solid #ddd0c4;border-radius:16px;padding:36px">
<p style="font-size:11px;letter-spacing:.14em;font-weight:800;color:${primary};margin:0 0 14px">NORTHSTARLABS NOTIFICATION</p>
<h1 style="font-size:34px;line-height:1.05;margin:0 0 18px">${escapeHtml(content.heading)}</h1>
<p style="font-size:16px;line-height:1.65;color:#625d58">${escapeHtml(content.intro)}</p>
<a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:${primary};color:white;text-decoration:none;font-weight:800;padding:14px 18px;border-radius:9px;margin:16px 0">${escapeHtml(content.actionLabel)}</a>
<p style="font-size:12px;line-height:1.6;color:#7c756f;border-top:1px solid #e5ddd5;padding-top:18px;margin-top:20px">${escapeHtml(content.detail)}</p>
</div>
<p style="font-size:11px;line-height:1.6;color:#817a74;margin:20px 8px">Sent by ${academy} through NorthStarLabs.</p>
</div></body></html>`;
  const text = `${content.heading}\n\n${content.intro}\n\n${content.actionLabel}: ${actionUrl}\n\n${content.detail}\n\nSent by ${values.academy || "NorthStarLabs"} through NorthStarLabs.`;
  return { subject: content.subject, html, text };
}

async function emailAllowed(userId: string | null | undefined, templateKey: EmailTemplateKey) {
  if (!userId || templateKey === "invitation" || templateKey === "test") return true;
  const preferences = await env.DB.prepare(
    `SELECT enrollment_emails AS enrollmentEmails,
      completion_emails AS completionEmails,
      live_session_reminders AS liveSessionReminders,
      creator_summaries AS creatorSummaries
     FROM notification_preferences WHERE user_id=?`,
  ).bind(userId).first<{
    enrollmentEmails: number;
    completionEmails: number;
    liveSessionReminders: number;
    creatorSummaries: number;
  }>();
  if (!preferences) return true;
  if (templateKey === "enrollment" || templateKey === "product_access") {
    return Boolean(preferences.enrollmentEmails);
  }
  if (templateKey === "certificate") return Boolean(preferences.completionEmails);
  if (templateKey === "live_session_reminder") {
    return Boolean(preferences.liveSessionReminders);
  }
  if (templateKey === "tutor_enquiry") return true;
  if (templateKey === "tutor_booking_update") return true;
  if (templateKey === "tutor_review_request") return true;
  if (templateKey === "learner_rating_request") return true;
  if (templateKey === "tutor_booking_cancelled") return true;
  if (templateKey === "creator_summary") return Boolean(preferences.creatorSummaries);
  return true;
}

export async function queueEmail(input: QueueEmailInput) {
  const existing = await env.DB.prepare(
    `SELECT id,status FROM email_messages WHERE idempotency_key=?`,
  ).bind(input.idempotencyKey).first<{ id: string; status: string }>();
  if (existing?.status === "cancelled") {
    await env.DB.prepare(
      "UPDATE email_messages SET idempotency_key=?,updated_at=? WHERE id=?",
    ).bind(`${input.idempotencyKey}:cancelled:${existing.id}`, Date.now(), existing.id).run();
  } else if (existing) {
    return existing;
  }
  if (!(await emailAllowed(input.recipientUserId, input.templateKey))) {
    return { id: "", status: "suppressed" };
  }
  const rendered = renderEmail(input.templateKey, input.variables);
  const id = crypto.randomUUID();
  const now = Date.now();
  const scheduledAt = Number.isFinite(input.scheduledFor) &&
    Number(input.scheduledFor) > now + 60_000
    ? Number(input.scheduledFor)
    : null;
  const availableAt = scheduledAt && scheduledAt > now + RESEND_SCHEDULE_WINDOW_MS
    ? scheduledAt - RESEND_SCHEDULE_WINDOW_MS
    : now;
  await env.DB.prepare(
    `INSERT INTO email_messages
      (id,school_id,recipient_user_id,recipient_email,template_key,subject,
       html_body,text_body,status,provider,idempotency_key,attempt_count,
       available_at,scheduled_at,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,'pending','resend',?,0,?,?,?,?)`,
  ).bind(
    id,
    input.schoolId || null,
    input.recipientUserId || null,
    input.recipientEmail.trim().toLowerCase(),
    input.templateKey,
    rendered.subject,
    rendered.html,
    rendered.text,
    input.idempotencyKey,
    availableAt,
    scheduledAt,
    now,
    now,
  ).run();
  if (input.sendNow !== false) return deliverEmail(id);
  return { id, status: "pending" };
}

export async function deliverEmail(id: string) {
  const message = await env.DB.prepare(
    `SELECT id,recipient_email AS recipientEmail,subject,html_body AS htmlBody,
      text_body AS textBody,status,idempotency_key AS idempotencyKey,
      attempt_count AS attemptCount,available_at AS availableAt,
      scheduled_at AS scheduledAt
     FROM email_messages WHERE id=?`,
  ).bind(id).first<{
    id: string;
    recipientEmail: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    status: string;
    idempotencyKey: string;
    attemptCount: number;
    availableAt: number;
    scheduledAt: number | null;
  }>();
  if (!message) return { id, status: "missing" };
  if (message.status === "sent") return { id, status: "sent" };
  if (message.status === "scheduled") return { id, status: "scheduled" };
  if (message.status === "cancelled") return { id, status: "cancelled" };
  const now = Date.now();
  const scheduledFor = message.scheduledAt && message.scheduledAt > now + 60_000
    ? message.scheduledAt
    : null;
  if (scheduledFor && scheduledFor > now + RESEND_SCHEDULE_WINDOW_MS) {
    await env.DB.prepare(
      "UPDATE email_messages SET available_at=?,updated_at=? WHERE id=?",
    ).bind(scheduledFor - RESEND_SCHEDULE_WINDOW_MS, now, id).run();
    return { id, status: "pending" };
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    await env.DB.prepare(
      `UPDATE email_messages SET status='configuration_required',
       attempt_count=attempt_count+1,last_error=?,updated_at=? WHERE id=?`,
    ).bind("Connect RESEND_API_KEY and EMAIL_FROM to send this message.", Date.now(), id).run();
    return { id, status: "configuration_required" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": message.idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [message.recipientEmail],
      subject: message.subject,
      html: message.htmlBody,
      text: message.textBody,
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      scheduled_at: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
    }),
  });
  const result = await response.json().catch(() => ({})) as { id?: string; message?: string; name?: string };
  if (response.ok && result.id) {
    const status = scheduledFor ? "scheduled" : "sent";
    await env.DB.prepare(
      `UPDATE email_messages SET status=?,provider_message_id=?,
       attempt_count=attempt_count+1,last_error=NULL,sent_at=?,updated_at=? WHERE id=?`,
    ).bind(status, result.id, scheduledFor ? null : now, now, id).run();
    return { id, status, providerMessageId: result.id };
  }
  const attempts = Number(message.attemptCount || 0) + 1;
  const status = attempts >= 3 ? "failed" : "retrying";
  const retryAt = now + Math.min(60, 2 ** attempts) * 60_000;
  await env.DB.prepare(
    `UPDATE email_messages SET status=?,attempt_count=?,last_error=?,
     available_at=?,updated_at=? WHERE id=?`,
  ).bind(
    status,
    attempts,
    String(result.message || result.name || `Email provider returned ${response.status}`).slice(0, 800),
    retryAt,
    now,
    id,
  ).run();
  return { id, status };
}

export async function retryEmail(id: string) {
  await env.DB.prepare(
    `UPDATE email_messages SET status='pending',available_at=?,last_error=NULL,updated_at=?
     WHERE id=? AND status<>'sent'`,
  ).bind(Date.now(), Date.now(), id).run();
  return deliverEmail(id);
}

export async function scheduleDeferredEmails(limit = 250) {
  const rows = await env.DB.prepare(
    `SELECT id FROM email_messages
     WHERE status IN ('pending','retrying','configuration_required')
       AND available_at<=?
     ORDER BY available_at LIMIT ?`,
  ).bind(Date.now(), Math.max(1, Math.min(limit, 500))).all<{
    id: string;
  }>();
  const results = [];
  for (const row of rows.results) results.push(await deliverEmail(row.id));
  return results;
}

export async function cancelEmailsByIdempotencyPattern(pattern: string) {
  const rows = await env.DB.prepare(
    `SELECT id,status,provider_message_id AS providerMessageId
     FROM email_messages
     WHERE idempotency_key LIKE ? AND status IN
       ('pending','retrying','configuration_required','scheduled')
     ORDER BY created_at`,
  ).bind(pattern).all<{
    id: string;
    status: string;
    providerMessageId: string | null;
  }>();
  const apiKey = process.env.RESEND_API_KEY;
  let cancelled = 0;
  let failed = 0;
  for (const row of rows.results) {
    if (row.status === "scheduled" && row.providerMessageId && !apiKey) {
      failed += 1;
      await env.DB.prepare(
        `UPDATE email_messages SET status='failed',last_error=?,updated_at=? WHERE id=?`,
      ).bind("Reconnect the email provider to cancel this scheduled reminder.", Date.now(), row.id).run();
      continue;
    }
    if (row.status === "scheduled" && row.providerMessageId && apiKey) {
      const response = await fetch(
        `https://api.resend.com/emails/${encodeURIComponent(row.providerMessageId)}/cancel`,
        { method: "POST", headers: { authorization: `Bearer ${apiKey}` } },
      );
      if (!response.ok) {
        failed += 1;
        await env.DB.prepare(
          `UPDATE email_messages SET status='failed',last_error=?,updated_at=? WHERE id=?`,
        ).bind("The scheduled reminder could not be cancelled at the email provider.", Date.now(), row.id).run();
        continue;
      }
    }
    await env.DB.prepare(
      `UPDATE email_messages SET status='cancelled',last_error=NULL,updated_at=? WHERE id=?`,
    ).bind(Date.now(), row.id).run();
    cancelled += 1;
  }
  return { cancelled, failed };
}

export function cancelEmailsByIdempotencyPrefix(prefix: string) {
  return cancelEmailsByIdempotencyPattern(`${prefix}%`);
}

export async function queueEnrollmentEmail(input: {
  userId: string;
  courseId: string;
  enrollmentId: string;
  origin: string;
}) {
  const details = await env.DB.prepare(
    `SELECT p.email,c.title AS courseTitle,s.id AS schoolId,s.name AS schoolName,
      s.slug AS schoolSlug,s.primary_color AS primaryColor
     FROM profiles p
     JOIN courses c ON c.id=?
     JOIN schools s ON s.id=c.school_id
     WHERE p.id=?`,
  ).bind(input.courseId, input.userId).first<{
    email: string;
    courseTitle: string;
    schoolId: string;
    schoolName: string;
    schoolSlug: string;
    primaryColor: string;
  }>();
  if (!details?.email) return { id: "", status: "missing_recipient" };
  return queueEmail({
    schoolId: details.schoolId,
    recipientUserId: input.userId,
    recipientEmail: details.email,
    templateKey: "enrollment",
    variables: {
      academy: details.schoolName,
      course: details.courseTitle,
      primaryColor: details.primaryColor,
      actionUrl: `${input.origin}/learn/${input.courseId}`,
    },
    idempotencyKey: `enrollment:${input.enrollmentId}`,
  });
}

export async function queueCertificateEmail(input: {
  userId: string;
  courseId: string;
  certificateCode: string;
  origin: string;
}) {
  const details = await env.DB.prepare(
    `SELECT p.email,c.title AS courseTitle,s.id AS schoolId,s.name AS schoolName,
      s.primary_color AS primaryColor
     FROM profiles p
     JOIN courses c ON c.id=?
     JOIN schools s ON s.id=c.school_id
     WHERE p.id=?`,
  ).bind(input.courseId, input.userId).first<{
    email: string;
    courseTitle: string;
    schoolId: string;
    schoolName: string;
    primaryColor: string;
  }>();
  if (!details?.email) return { id: "", status: "missing_recipient" };
  return queueEmail({
    schoolId: details.schoolId,
    recipientUserId: input.userId,
    recipientEmail: details.email,
    templateKey: "certificate",
    variables: {
      academy: details.schoolName,
      course: details.courseTitle,
      primaryColor: details.primaryColor,
      actionUrl: `${input.origin}/certificates/${encodeURIComponent(input.certificateCode)}`,
    },
    idempotencyKey: `certificate:${input.certificateCode}`,
  });
}

export async function queueProductAccessEmail(input: {
  userId: string;
  productId: string;
  entitlementId: string;
  grantedAt: number;
  expiresAt: number | null;
  origin: string;
}) {
  const details = await env.DB.prepare(
    `SELECT pr.email,p.name AS productName,s.id AS schoolId,s.name AS schoolName,
      s.primary_color AS primaryColor
     FROM profiles pr
     JOIN products p ON p.id=?
     JOIN schools s ON s.id=p.school_id
     WHERE pr.id=?`,
  ).bind(input.productId, input.userId).first<{
    email: string;
    productName: string;
    schoolId: string;
    schoolName: string;
    primaryColor: string;
  }>();
  if (!details?.email) return { id: "", status: "missing_recipient" };
  return queueEmail({
    schoolId: details.schoolId,
    recipientUserId: input.userId,
    recipientEmail: details.email,
    templateKey: "product_access",
    variables: {
      academy: details.schoolName,
      product: details.productName,
      primaryColor: details.primaryColor,
      expires: input.expiresAt
        ? new Date(input.expiresAt).toLocaleDateString("en-ZA")
        : null,
      actionUrl: `${input.origin}/learn`,
    },
    idempotencyKey: `product-access:${input.entitlementId}:${input.grantedAt}`,
  });
}
