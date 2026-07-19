import { env } from "cloudflare:workers";
import { getLessonGate } from "../../../lib/learner-controls";
import { requireApiUser } from "../../../lib/server-auth";

type LearnerState = {
  completed: number;
  watchedPercent: number;
  notes: string;
  bookmarked: number;
};

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    lessonId?: string;
    watchedPercent?: number;
    notes?: string;
    bookmarked?: boolean;
  };
  if (!body.lessonId) {
    return Response.json({ error: "Lesson required" }, { status: 400 });
  }

  const gate = await getLessonGate(env.DB, user.id, body.lessonId);
  if (!gate) return Response.json({ error: "Not enrolled" }, { status: 403 });
  if (gate.locked && !gate.isStaff) {
    return Response.json({ error: gate.lockReason || "This lesson is locked." }, { status: 409 });
  }

  const existing = await env.DB.prepare(
    `SELECT completed,watched_percent AS watchedPercent,notes,bookmarked
     FROM lesson_progress WHERE user_id=? AND lesson_id=?`,
  ).bind(user.id, body.lessonId).first<LearnerState>();
  const watchedPercent = Math.max(
    Number(existing?.watchedPercent || 0),
    Math.max(0, Math.min(100, Math.round(Number(body.watchedPercent || 0)))),
  );
  const notes = body.notes === undefined
    ? existing?.notes || ""
    : body.notes.trim().slice(0, 10_000);
  const bookmarked = body.bookmarked === undefined
    ? Number(existing?.bookmarked || 0)
    : body.bookmarked ? 1 : 0;
  const now = Date.now();

  await env.DB.prepare(
    `INSERT INTO lesson_progress
      (id,user_id,lesson_id,completed,watched_percent,notes,bookmarked,updated_at)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       watched_percent=MAX(lesson_progress.watched_percent,excluded.watched_percent),
       notes=excluded.notes,bookmarked=excluded.bookmarked,updated_at=excluded.updated_at`,
  ).bind(
    `${user.id}:${body.lessonId}`,
    user.id,
    body.lessonId,
    Number(existing?.completed || 0),
    watchedPercent,
    notes,
    bookmarked,
    now,
  ).run();

  return Response.json({ saved: true, watchedPercent, notes, bookmarked: Boolean(bookmarked) });
}
