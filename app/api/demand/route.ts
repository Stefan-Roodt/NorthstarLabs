import { env } from "cloudflare:workers";
import {
  DEMAND_CATEGORIES,
  DEMAND_FORMATS,
  publicDemandTopics,
  uniqueDemandSlug,
} from "../../../lib/demand-board";
import { queueEmail } from "../../../lib/email-service";
import { sha256Hex } from "../../../lib/security";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VOTER_COOKIE = "__Host-northstar-demand-voter";

function clean(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function cookieValue(request: Request, name: string) {
  const cookies = request.headers.get("cookie") || "";
  for (const entry of cookies.split(";")) {
    const [key, ...value] = entry.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

async function voterIdentity(request: Request, create = false) {
  let value = cookieValue(request, VOTER_COOKIE);
  let created = false;
  if (!value && create) {
    value = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
    created = true;
  }
  return { value, hash: value ? await sha256Hex(`demand-voter:${value}`) : "", created };
}

function voterCookie(value: string) {
  return `${VOTER_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`;
}

async function publicTopic(topicId: string) {
  return env.DB.prepare(
    "SELECT id,title,visibility,status FROM demand_topics WHERE id=? AND visibility='published'",
  ).bind(topicId).first<{ id: string; title: string; visibility: string; status: string }>();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const voter = await voterIdentity(request);
  const topics = await publicDemandTopics({
    voterKeyHash: voter.hash,
    category: url.searchParams.get("category") || "",
    status: url.searchParams.get("status") || "",
    query: url.searchParams.get("query") || "",
    sort: url.searchParams.get("sort") || "popular",
  });
  const manageToken = url.searchParams.get("manage") || "";
  let managedFollow = null;
  if (manageToken.length >= 32) {
    managedFollow = await env.DB.prepare(
      `SELECT f.id,f.status,t.id AS topicId,t.title
       FROM demand_followers f JOIN demand_topics t ON t.id=f.topic_id
       WHERE f.unsubscribe_token_hash=?`,
    ).bind(await sha256Hex(manageToken)).first();
  }
  return Response.json({ topics, managedFollow });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = clean(body?.action, 40);

  if (action === "vote") {
    const topicId = clean(body?.topicId, 100);
    const value = Number(body?.value);
    if (![-1, 0, 1].includes(value)) return Response.json({ error: "Choose a valid vote." }, { status: 400 });
    if (!await publicTopic(topicId)) return Response.json({ error: "That topic is not open for public voting." }, { status: 404 });
    const voter = await voterIdentity(request, true);
    const now = Date.now();
    if (value === 0) {
      await env.DB.prepare("DELETE FROM demand_votes WHERE topic_id=? AND voter_key_hash=?").bind(topicId, voter.hash).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO demand_votes (id,topic_id,voter_key_hash,value,created_at,updated_at)
         VALUES (?,?,?,?,?,?) ON CONFLICT(topic_id,voter_key_hash) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`,
      ).bind(crypto.randomUUID(), topicId, voter.hash, value, now, now).run();
    }
    const topics = await publicDemandTopics({ voterKeyHash: voter.hash });
    const response = Response.json({ topic: topics.find((topic) => topic.id === topicId) });
    if (voter.created) response.headers.append("set-cookie", voterCookie(voter.value));
    return response;
  }

  if (action === "follow") {
    const topicId = clean(body?.topicId, 100);
    const email = clean(body?.email, 200).toLowerCase();
    const name = clean(body?.name, 100);
    const topic = await publicTopic(topicId);
    if (!topic) return Response.json({ error: "That topic is no longer available." }, { status: 404 });
    if (!emailPattern.test(email)) return Response.json({ error: "Add a valid email for roadmap updates." }, { status: 400 });
    const rawToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
    const tokenHash = await sha256Hex(rawToken);
    const now = Date.now();
    await env.DB.prepare(
      `INSERT INTO demand_followers
        (id,topic_id,email,name,status,unsubscribe_token_hash,created_at,updated_at)
       VALUES (?,?,?,?,'active',?,?,?)
       ON CONFLICT(topic_id,email) DO UPDATE SET name=excluded.name,status='active',
         unsubscribe_token_hash=excluded.unsubscribe_token_hash,updated_at=excluded.updated_at`,
    ).bind(crypto.randomUUID(), topicId, email, name, tokenHash, now, now).run();
    const origin = new URL(request.url).origin;
    await queueEmail({
      recipientEmail: email,
      templateKey: "demand_following",
      idempotencyKey: `demand-follow:${topicId}:${email}:${now}`,
      variables: {
        academy: "NorthstarLabs",
        topic: topic.title,
        actionUrl: `${origin}/demand?topic=${encodeURIComponent(topicId)}&manage=${rawToken}`,
      },
    }).catch(() => undefined);
    return Response.json({ followed: true, message: "You will receive an email when this topic moves forward." });
  }

  if (action === "unfollow") {
    const token = clean(body?.token, 200);
    if (token.length < 32) return Response.json({ error: "This update link is invalid." }, { status: 400 });
    const result = await env.DB.prepare(
      "UPDATE demand_followers SET status='unsubscribed',updated_at=? WHERE unsubscribe_token_hash=?",
    ).bind(Date.now(), await sha256Hex(token)).run();
    if (!result.meta.changes) return Response.json({ error: "This update link is invalid or expired." }, { status: 404 });
    return Response.json({ unfollowed: true });
  }

  if (action === "submit") {
    if (clean(body?.companyWebsite, 200)) return Response.json({ received: true });
    const requesterName = clean(body?.requesterName, 100);
    const requesterEmail = clean(body?.requesterEmail, 200).toLowerCase();
    const title = clean(body?.title, 120);
    const summary = clean(body?.summary, 1_200);
    const category = DEMAND_CATEGORIES.includes(String(body?.category) as typeof DEMAND_CATEGORIES[number]) ? String(body?.category) : "other";
    const preferredFormat = DEMAND_FORMATS.includes(String(body?.preferredFormat) as typeof DEMAND_FORMATS[number]) ? String(body?.preferredFormat) : "either";
    if (requesterName.length < 2 || !emailPattern.test(requesterEmail) || title.length < 5 || summary.length < 40) {
      return Response.json({ error: "Add your name, a valid email, a clear topic, and at least 40 characters explaining the need." }, { status: 400 });
    }
    const duplicate = await env.DB.prepare(
      `SELECT id,title,visibility FROM demand_topics WHERE lower(title)=lower(?) ORDER BY created_at DESC LIMIT 1`,
    ).bind(title).first<{ id: string; title: string; visibility: string }>();
    if (duplicate) {
      return Response.json({
        received: true,
        existingTopicId: duplicate.visibility === "published" ? duplicate.id : null,
        message: duplicate.visibility === "published"
          ? "That topic is already on the board. Support it there so demand stays in one clear signal."
          : "A closely matching topic is already awaiting review. We keep matching ideas together instead of publishing duplicates.",
      });
    }
    const recent = await env.DB.prepare(
      `SELECT id FROM learning_requests WHERE requester_email=? AND created_at>? LIMIT 1`,
    ).bind(requesterEmail, Date.now() - 60 * 60_000).first();
    if (recent) return Response.json({ error: "We already received a request from this email recently. Please give us time to review it." }, { status: 409 });
    const requestId = crypto.randomUUID();
    const topicId = crypto.randomUUID();
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO learning_requests
          (id,requester_name,requester_email,request_type,topic,detail,source,status,admin_note,created_at,updated_at)
         VALUES (?,?,?,?,?,?,'demand-board','new','',?,?)`,
      ).bind(requestId, requesterName, requesterEmail, preferredFormat === "coach" ? "coach" : preferredFormat === "course" ? "course" : "either", title, summary, now, now),
      env.DB.prepare(
        `INSERT INTO demand_topics
          (id,learning_request_id,title,slug,summary,category,preferred_format,status,visibility,public_note,created_at,updated_at)
         VALUES (?,?,?,?,?,?,?,'open','pending','',?,?)`,
      ).bind(topicId, requestId, title, await uniqueDemandSlug(title), summary, category, preferredFormat, now, now),
    ]);
    const origin = new URL(request.url).origin;
    await queueEmail({
      recipientEmail: requesterEmail,
      templateKey: "learning_request_received",
      variables: { academy: "NorthstarLabs", requester: requesterName, requestType: preferredFormat, topic: title, actionUrl: `${origin}/demand` },
      idempotencyKey: `demand-submit:${topicId}:received`,
    }).catch(() => undefined);
    return Response.json({ received: true, topicId, message: "Submitted for moderation. Your contact details stay private; only the topic and summary can become public." }, { status: 201 });
  }

  return Response.json({ error: "Choose a valid Demand Board action." }, { status: 400 });
}
