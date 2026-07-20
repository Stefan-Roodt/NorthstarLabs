import { env } from "cloudflare:workers";
import { queueEmail } from "../../../lib/email-service";

const requestTypes = new Set(["course", "coach", "either"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  if (cleanText(body.companyWebsite, 200)) {
    return Response.json({ received: true });
  }

  const requesterName = cleanText(body.requesterName, 100);
  const requesterEmail = cleanText(body.requesterEmail, 200).toLowerCase();
  const requestType = requestTypes.has(String(body.requestType))
    ? String(body.requestType)
    : "either";
  const topic = cleanText(body.topic, 160);
  const detail = cleanText(body.detail, 3_000);
  const source = cleanText(body.source, 120) || "homepage";

  if (
    requesterName.length < 2 ||
    !emailPattern.test(requesterEmail) ||
    topic.length < 2 ||
    detail.length < 20
  ) {
    return Response.json({
      error: "Add your name, a valid email, the topic, and enough detail for us to understand what you need.",
    }, { status: 400 });
  }

  const recent = await env.DB.prepare(
    `SELECT id FROM learning_requests
     WHERE requester_email=? AND lower(topic)=lower(?) AND created_at>?
     LIMIT 1`,
  ).bind(requesterEmail, topic, Date.now() - 15 * 60_000).first();
  if (recent) {
    return Response.json({
      error: "We already received this request. Give us a little time to review it.",
    }, { status: 409 });
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO learning_requests
      (id,requester_name,requester_email,request_type,topic,detail,source,
       status,admin_note,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,'new','',?,?)`,
  ).bind(
    id,
    requesterName,
    requesterEmail,
    requestType,
    topic,
    detail,
    source,
    now,
    now,
  ).run();

  const origin = new URL(request.url).origin;
  try {
    await queueEmail({
      recipientEmail: requesterEmail,
      templateKey: "learning_request_received",
      variables: {
        academy: "NorthstarLabs",
        requester: requesterName,
        requestType,
        topic,
        actionUrl: `${origin}/courses`,
      },
      idempotencyKey: `learning-request:${id}:received`,
    });
    const adminEmails = (process.env.PLATFORM_ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    await Promise.all(adminEmails.map((recipientEmail) => queueEmail({
      recipientEmail,
      templateKey: "learning_request_admin",
      variables: {
        academy: "NorthstarLabs",
        requester: `${requesterName} (${requesterEmail})`,
        requestType,
        topic,
        detail,
        actionUrl: `${origin}/admin`,
      },
      idempotencyKey: `learning-request:${id}:admin:${recipientEmail}`,
    })));
  } catch {
    // The request is safely stored even if outbound email is not configured yet.
  }

  return Response.json({
    received: true,
    id,
    message: "Request received. We will check the current catalogue and coach network, then reply honestly by email.",
  }, { status: 201 });
}
