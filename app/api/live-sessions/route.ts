import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { emitIntegrationEvent } from "../../../lib/integrations";
import {
  cancelLiveSessionReminders,
  queueLiveSessionReminders,
} from "../../../lib/live-session-reminders";
import {
  requestedSchoolId,
  requireCreatorSchool,
} from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";
import { createZoomMeeting } from "../../../lib/provider-integrations";

const sessionColumns = `ls.id,ls.school_id AS schoolId,
  ls.product_id AS productId,ls.course_id AS courseId,ls.host_id AS hostId,
  ls.title,ls.description,ls.starts_at AS startsAt,ls.ends_at AS endsAt,
  ls.timezone,ls.meeting_provider AS meetingProvider,ls.meeting_url AS meetingUrl,
  ls.capacity,ls.recording_asset_id AS recordingAssetId,ls.status,
  ls.created_at AS createdAt,ls.updated_at AS updatedAt`;

function validUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 1_000) return null;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

async function creatorContext(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return { error: Response.json({ error: "Creator access required." }, { status: 403 }) };
  return { user, school };
}

async function learnerSessions(userId: string) {
  const protectedSessionColumns = sessionColumns.replace(
    "ls.meeting_url AS meetingUrl",
    "CASE WHEN la.id IS NOT NULL THEN ls.meeting_url ELSE NULL END AS meetingUrl",
  );
  const rows = await env.DB.prepare(
    `SELECT ${protectedSessionColumns},p.name AS productName,c.title AS courseTitle,
      la.status AS attendanceStatus,la.attendance_minutes AS attendanceMinutes
     FROM live_sessions ls
     LEFT JOIN products p ON p.id=ls.product_id
     LEFT JOIN courses c ON c.id=ls.course_id
     LEFT JOIN live_attendance la ON la.session_id=ls.id AND la.user_id=?
       AND la.status IN ('registered','attended')
     WHERE ls.status<>'cancelled' AND (
       la.id IS NOT NULL
       OR EXISTS(
         SELECT 1 FROM product_entitlements pe
         WHERE pe.product_id=ls.product_id AND pe.user_id=? AND pe.status='active'
           AND pe.starts_at<=?
           AND (pe.expires_at IS NULL OR pe.expires_at>?)
       )
       OR EXISTS(
         SELECT 1 FROM enrollments e
         WHERE e.course_id=ls.course_id AND e.user_id=? AND e.status='active'
       )
     )
     ORDER BY ls.starts_at`,
  ).bind(userId, userId, Date.now(), Date.now(), userId).all();
  return rows.results;
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (new URL(request.url).searchParams.get("mode") === "learner") {
    return Response.json({ sessions: await learnerSessions(user.id) });
  }
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required." }, { status: 403 });
  const [sessions, products, courses, attendance] = await Promise.all([
    env.DB.prepare(
      `SELECT ${sessionColumns},p.name AS productName,c.title AS courseTitle,
        COUNT(la.id) AS registrations,
        COUNT(CASE WHEN la.status='attended' THEN 1 END) AS attended
       FROM live_sessions ls
       LEFT JOIN products p ON p.id=ls.product_id
       LEFT JOIN courses c ON c.id=ls.course_id
       LEFT JOIN live_attendance la ON la.session_id=ls.id
       WHERE ls.school_id=?
       GROUP BY ls.id ORDER BY ls.starts_at DESC`,
    ).bind(school.id).all(),
    env.DB.prepare(
      `SELECT id,name,product_type AS productType,status
       FROM products WHERE school_id=? AND status<>'archived' ORDER BY name`,
    ).bind(school.id).all(),
    env.DB.prepare(
      "SELECT id,title,status FROM courses WHERE school_id=? ORDER BY title",
    ).bind(school.id).all(),
    env.DB.prepare(
      `SELECT la.id,la.session_id AS sessionId,la.user_id AS userId,
        la.status,la.registered_at AS registeredAt,
        la.attended_at AS attendedAt,la.attendance_minutes AS attendanceMinutes,
        p.display_name AS displayName,p.email
       FROM live_attendance la
       JOIN live_sessions ls ON ls.id=la.session_id
       JOIN profiles p ON p.id=la.user_id
       WHERE ls.school_id=? ORDER BY p.display_name`,
    ).bind(school.id).all(),
  ]);
  return Response.json({
    school,
    sessions: sessions.results,
    products: products.results,
    courses: courses.results,
    attendance: attendance.results,
  });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;

  if (body.action === "register") {
    const session = await env.DB.prepare(
      `SELECT ${sessionColumns},
        EXISTS(
          SELECT 1 FROM product_entitlements pe
          WHERE pe.product_id=ls.product_id AND pe.user_id=? AND pe.status='active'
            AND pe.starts_at<=?
            AND (pe.expires_at IS NULL OR pe.expires_at>?)
        ) AS productAccess,
        EXISTS(
          SELECT 1 FROM enrollments e
          WHERE e.course_id=ls.course_id AND e.user_id=? AND e.status='active'
        ) AS courseAccess,
        (SELECT COUNT(*) FROM live_attendance la
          WHERE la.session_id=ls.id AND la.status IN ('registered','attended')) AS registrations
       FROM live_sessions ls WHERE ls.id=? AND ls.status='scheduled'`,
    ).bind(
      user.id,
      Date.now(),
      Date.now(),
      user.id,
      String(body.sessionId || ""),
    ).first<Record<string, unknown>>();
    if (!session) return Response.json({ error: "Live session not found." }, { status: 404 });
    if (!session.productAccess && !session.courseAccess) {
      return Response.json({ error: "Product or course access is required." }, { status: 403 });
    }
    if (Number(session.capacity || 0) > 0 &&
      Number(session.registrations || 0) >= Number(session.capacity)) {
      return Response.json({ error: "This live session is full." }, { status: 409 });
    }
    await env.DB.prepare(
      `INSERT INTO live_attendance
        (id,session_id,user_id,status,registered_at,attendance_minutes)
       VALUES (?,?,?,?,?,0)
       ON CONFLICT(session_id,user_id) DO UPDATE SET status='registered'`,
    ).bind(
      crypto.randomUUID(),
      String(session.id),
      user.id,
      "registered",
      Date.now(),
    ).run();
    await emitIntegrationEvent(
      env.DB,
      String(session.schoolId),
      "live_session.registered",
      { sessionId: session.id, userId: user.id },
    );
    const reminders = await queueLiveSessionReminders({
      sessionId: String(session.id),
      userId: user.id,
      origin: new URL(request.url).origin,
    }).catch(() => ({ recipients: 0, reminders: 0, statuses: { unavailable: 1 } }));
    return Response.json({ registered: true, sessionId: session.id, reminders });
  }

  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator access required." }, { status: 403 });
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  const provider = ["zoom", "google_meet", "microsoft_teams", "other"].includes(String(body.meetingProvider))
    ? String(body.meetingProvider)
    : "other";
  let meetingUrl = validUrl(body.meetingUrl);
  const startsAt = Number(body.startsAt);
  const endsAt = Number(body.endsAt);
  if (title.length < 2 || !Number.isFinite(startsAt) ||
    !Number.isFinite(endsAt) || endsAt <= startsAt) {
    return Response.json(
      { error: "Add a title, start time, and later end time." },
      { status: 400 },
    );
  }
  const productId = typeof body.productId === "string" && body.productId ? body.productId : null;
  const courseId = typeof body.courseId === "string" && body.courseId ? body.courseId : null;
  if (!productId && !courseId) {
    return Response.json(
      { error: "Connect the session to a product or course." },
      { status: 400 },
    );
  }
  if (productId) {
    const product = await env.DB.prepare(
      "SELECT id FROM products WHERE id=? AND school_id=? AND status<>'archived'",
    ).bind(productId, school.id).first();
    if (!product) return Response.json({ error: "Product not found." }, { status: 404 });
  }
  if (courseId) {
    const course = await env.DB.prepare(
      "SELECT id FROM courses WHERE id=? AND school_id=?",
    ).bind(courseId, school.id).first();
    if (!course) return Response.json({ error: "Course not found." }, { status: 404 });
  }
  const timezone = typeof body.timezone === "string"
    ? body.timezone.slice(0, 80)
    : "Africa/Johannesburg";
  if (!meetingUrl && provider === "zoom") {
    try {
      meetingUrl = await createZoomMeeting(env.DB, school.id, {
        title,
        description: typeof body.description === "string" ? body.description.trim().slice(0, 1_200) : "",
        startsAt,
        endsAt,
        timezone,
      });
    } catch (error) {
      return Response.json({
        error: error instanceof Error ? error.message : "Zoom could not create this meeting.",
      }, { status: 400 });
    }
  }
  if (!meetingUrl) {
    return Response.json(
      { error: "Paste a secure meeting link, or connect Zoom so Northstar can create one." },
      { status: 400 },
    );
  }
  const id = crypto.randomUUID();
  const now = Date.now();
  const capacity = Math.max(0, Math.min(Math.round(Number(body.capacity || 0)), 100_000));
  await env.DB.prepare(
    `INSERT INTO live_sessions
      (id,school_id,product_id,course_id,host_id,title,description,starts_at,
       ends_at,timezone,meeting_provider,meeting_url,capacity,status,
       created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    id,
    school.id,
    productId,
    courseId,
    user.id,
    title,
    typeof body.description === "string" ? body.description.trim().slice(0, 1_200) : "",
    startsAt,
    endsAt,
    timezone,
    provider,
    meetingUrl,
    capacity,
    "scheduled",
    now,
    now,
  ).run();

  const eligible = await env.DB.prepare(
    `SELECT DISTINCT userId FROM (
       SELECT pe.user_id AS userId
       FROM product_entitlements pe
       WHERE pe.product_id=? AND pe.status='active' AND pe.starts_at<=?
         AND (pe.expires_at IS NULL OR pe.expires_at>?)
       UNION ALL
       SELECT e.user_id AS userId FROM enrollments e
       WHERE e.course_id=? AND e.status='active'
     ) LIMIT 5000`,
  ).bind(productId || "", now, now, courseId || "").all<{ userId: string }>();
  const registrations = capacity > 0
    ? eligible.results.slice(0, capacity)
    : eligible.results;
  if (registrations.length) {
    for (let offset = 0; offset < registrations.length; offset += 75) {
      await env.DB.batch(registrations.slice(offset, offset + 75).map((learner) =>
        env.DB.prepare(
          `INSERT INTO live_attendance
            (id,session_id,user_id,status,registered_at,attendance_minutes)
           VALUES (?,?,?,?,?,0)
           ON CONFLICT(session_id,user_id) DO NOTHING`,
        ).bind(crypto.randomUUID(), id, learner.userId, "registered", now)
      ));
    }
  }
  await writeAuditLog({
    actorId: user.id,
    schoolId: school.id,
    action: "live_session.create",
    targetType: "live_session",
    targetId: id,
    detail: { productId, courseId, startsAt, registrations: registrations.length },
  });
  await emitIntegrationEvent(env.DB, school.id, "live_session.created", {
    sessionId: id,
    title,
    startsAt,
    endsAt,
    productId,
    courseId,
  });
  const reminders = await queueLiveSessionReminders({
    sessionId: id,
    origin: new URL(request.url).origin,
    limit: 50,
  }).catch(() => ({ recipients: 0, reminders: 0, statuses: { unavailable: 1 } }));
  return Response.json({
    id,
    schoolId: school.id,
    productId,
    courseId,
    title,
    description: body.description || "",
    startsAt,
    endsAt,
    meetingProvider: provider,
    meetingUrl,
    capacity,
    status: "scheduled",
    registrations: registrations.length,
    reminders,
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await creatorContext(request);
  if ("error" in context) return context.error;
  const body = await request.json() as Record<string, unknown>;
  const session = await env.DB.prepare(
    "SELECT id,title FROM live_sessions WHERE id=? AND school_id=?",
  ).bind(String(body.sessionId || ""), context.school.id).first<{ id: string; title: string }>();
  if (!session) return Response.json({ error: "Live session not found." }, { status: 404 });
  const now = Date.now();

  if (body.action === "attendance") {
    const status = ["registered", "attended", "no_show", "cancelled"].includes(String(body.status))
      ? String(body.status)
      : "";
    const attendance = await env.DB.prepare(
      "SELECT id FROM live_attendance WHERE session_id=? AND user_id=?",
    ).bind(session.id, String(body.userId || "")).first();
    if (!attendance || !status) {
      return Response.json({ error: "Attendance record not found." }, { status: 404 });
    }
    await env.DB.prepare(
      `UPDATE live_attendance SET status=?,attended_at=?,
        attendance_minutes=? WHERE id=?`,
    ).bind(
      status,
      status === "attended" ? now : null,
      Math.max(0, Math.min(Math.round(Number(body.attendanceMinutes || 0)), 10_000)),
      String(attendance.id),
    ).run();
    await emitIntegrationEvent(env.DB, context.school.id, "live_session.attendance_updated", {
      sessionId: session.id,
      userId: body.userId,
      status,
    });
    if (status === "cancelled" || status === "no_show") {
      await cancelLiveSessionReminders(session.id, String(body.userId || "")).catch(() => null);
    }
    return Response.json({ saved: true });
  }

  const status = ["scheduled", "completed", "cancelled"].includes(String(body.status))
    ? String(body.status)
    : null;
  if (!status) return Response.json({ error: "Unsupported session action." }, { status: 400 });
  await env.DB.prepare(
    "UPDATE live_sessions SET status=?,updated_at=? WHERE id=?",
  ).bind(status, now, session.id).run();
  await writeAuditLog({
    actorId: context.user.id,
    schoolId: context.school.id,
    action: `live_session.${status}`,
    targetType: "live_session",
    targetId: session.id,
  });
  await emitIntegrationEvent(env.DB, context.school.id, `live_session.${status}`, {
    sessionId: session.id,
    title: session.title,
  });
  if (status === "cancelled") {
    await cancelLiveSessionReminders(session.id).catch(() => null);
  }
  return Response.json({ saved: true, status });
}
