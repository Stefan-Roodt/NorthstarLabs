import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../lib/audit-log";
import { queueEmail, retryEmail } from "../../../../lib/email-service";
import { requirePlatformAdmin } from "../../../../lib/platform-admin";
import { sha256Hex } from "../../../../lib/security";

function safePublicUrl(value: unknown) {
  const input = String(value || "").trim().slice(0, 500);
  if (!input) return null;
  if (input.startsWith("/") && !input.startsWith("//")) return input;
  try {
    const url = new URL(input);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const user = await requirePlatformAdmin(request);
  if (!user) return Response.json({ error: "Platform administrator access required." }, { status: 403 });
  const [metrics, schools, users, messages, learningRequests, demandTopics, audit] = await Promise.all([
    env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM schools) AS schools,
        (SELECT COUNT(*) FROM schools WHERE status='active') AS activeSchools,
        (SELECT COUNT(*) FROM profiles) AS users,
        (SELECT COUNT(*) FROM profiles WHERE status='suspended') AS suspendedUsers,
        (SELECT COUNT(*) FROM courses WHERE status='published') AS publishedCourses,
        (SELECT COUNT(*) FROM enrollments WHERE status='active') AS activeEnrollments,
        (SELECT COUNT(*) FROM email_messages WHERE status='sent') AS sentEmails,
        (SELECT COUNT(*) FROM email_messages WHERE status IN ('failed','configuration_required')) AS emailAttention,
        (SELECT COUNT(*) FROM learning_requests WHERE status IN ('new','reviewing')) AS openLearningRequests,
        (SELECT COUNT(*) FROM demand_topics WHERE visibility='pending') AS pendingDemandTopics,
        (SELECT COUNT(*) FROM demand_topics WHERE visibility='published' AND status IN ('planned','building')) AS activeDemandRoadmap`,
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
      `SELECT id,requester_name AS requesterName,
        requester_email AS requesterEmail,request_type AS requestType,
        topic,detail,source,status,admin_note AS adminNote,
        created_at AS createdAt,updated_at AS updatedAt
       FROM learning_requests
       ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'reviewing' THEN 1
         WHEN 'matched' THEN 2 ELSE 3 END,created_at DESC
       LIMIT 100`,
    ).all(),
    env.DB.prepare(
      `SELECT t.id,t.learning_request_id AS learningRequestId,t.title,t.summary,t.category,
        t.preferred_format AS preferredFormat,t.status,t.visibility,
        t.public_note AS publicNote,t.matched_url AS matchedUrl,
        t.created_at AS createdAt,t.updated_at AS updatedAt,
        COALESCE(SUM(v.value),0) AS score,
        COALESCE(SUM(CASE WHEN v.value=1 THEN 1 ELSE 0 END),0) AS supporters,
        (SELECT COUNT(*) FROM demand_followers f WHERE f.topic_id=t.id AND f.status='active') AS followers
       FROM demand_topics t LEFT JOIN demand_votes v ON v.topic_id=t.id
       GROUP BY t.id
       ORDER BY CASE t.visibility WHEN 'pending' THEN 0 WHEN 'published' THEN 1 ELSE 2 END,
        CASE t.status WHEN 'building' THEN 0 WHEN 'planned' THEN 1 WHEN 'open' THEN 2 ELSE 3 END,
        t.updated_at DESC LIMIT 150`,
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
    learningRequests: learningRequests.results,
    demandTopics: demandTopics.results,
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
    note?: string;
    url?: string;
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

  if (
    body.targetType === "learning_request" &&
    ["reviewing", "matched", "closed"].includes(body.action)
  ) {
    const result = await env.DB.prepare(
      "UPDATE learning_requests SET status=?,updated_at=? WHERE id=?",
    ).bind(body.action, Date.now(), body.targetId).run();
    if (!result.meta.changes) {
      return Response.json({ error: "Learning request not found." }, { status: 404 });
    }
    await writeAuditLog({
      actorId: user.id,
      action: `platform.learning_request.${body.action}`,
      targetType: "learning_request",
      targetId: body.targetId,
      detail: { status: body.action },
    });
    return Response.json({ saved: true, status: body.action });
  }

  if (
    body.targetType === "demand_topic" &&
    ["publish", "hide", "open", "planned", "building", "released", "declined"].includes(body.action)
  ) {
    const topic = await env.DB.prepare(
      "SELECT id,title,status,visibility FROM demand_topics WHERE id=?",
    ).bind(body.targetId).first<{ id: string; title: string; status: string; visibility: string }>();
    if (!topic) return Response.json({ error: "Demand topic not found." }, { status: 404 });
    const now = Date.now();
    const visibility = body.action === "publish" ? "published" : body.action === "hide" ? "hidden" : topic.visibility;
    const status = ["open", "planned", "building", "released", "declined"].includes(body.action) ? body.action : topic.status;
    const publicNote = String(body.note || "").trim().slice(0, 1_000);
    const matchedUrl = safePublicUrl(body.url);
    if (body.action === "released" && !matchedUrl) {
      return Response.json({ error: "Add the public course, coach, or live-learning URL before marking a topic available." }, { status: 400 });
    }
    await env.DB.prepare(
      `UPDATE demand_topics SET status=?,visibility=?,public_note=?,matched_url=?,
        released_at=CASE WHEN ?='released' THEN ? ELSE released_at END,updated_at=? WHERE id=?`,
    ).bind(status, visibility, publicNote, matchedUrl, status, now, now, topic.id).run();
    await writeAuditLog({
      actorId: user.id,
      action: `platform.demand_topic.${body.action}`,
      targetType: "demand_topic",
      targetId: topic.id,
      detail: { status, visibility, matchedUrl },
    });
    if (body.action !== "hide") {
      const followers = await env.DB.prepare(
        "SELECT id,email FROM demand_followers WHERE topic_id=? AND status='active' LIMIT 1000",
      ).bind(topic.id).all<{ id: string; email: string }>();
      const origin = new URL(request.url).origin;
      await Promise.allSettled(followers.results.map(async (follower) => {
        const rawToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
        await env.DB.prepare(
          "UPDATE demand_followers SET unsubscribe_token_hash=?,updated_at=? WHERE id=?",
        ).bind(await sha256Hex(rawToken), now, follower.id).run();
        return queueEmail({
          recipientEmail: follower.email,
          templateKey: "demand_update",
          idempotencyKey: `demand-update:${topic.id}:${follower.id}:${now}`,
          variables: {
            academy: "NorthstarLabs",
            topic: topic.title,
            status: status === "building" ? "in production" : status,
            note: publicNote || "Open the Demand Board for the latest roadmap decision.",
            actionUrl: `${origin}/demand?topic=${encodeURIComponent(topic.id)}&manage=${rawToken}`,
          },
        });
      }));
    }
    return Response.json({ saved: true, status, visibility });
  }

  return Response.json({ error: "Unsupported administration action." }, { status: 400 });
}
