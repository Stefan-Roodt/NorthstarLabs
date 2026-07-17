import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { updateCourseProgress } from "../../../../lib/course-progress";

export async function POST(
  request: Request,
  context: { params: Promise<{ lessonId: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { lessonId } = await context.params;
  const { answers } = await request.json() as { answers?: number[] };

  const access = await env.DB.prepare(
    `SELECT l.course_id AS courseId,c.owner_id AS ownerId
     FROM lessons l JOIN courses c ON c.id=l.course_id
     LEFT JOIN enrollments e ON e.course_id=c.id AND e.user_id=? AND e.status='active'
     WHERE l.id=? AND (c.owner_id=? OR e.id IS NOT NULL)`,
  ).bind(user.id, lessonId, user.id).first<{ courseId: string; ownerId: string }>();
  if (!access) return Response.json({ error: "Not enrolled" }, { status: 403 });

  const quiz = await env.DB.prepare(
    "SELECT id,passing_score AS passingScore FROM quizzes WHERE lesson_id=?",
  ).bind(lessonId).first<{ id: string; passingScore: number }>();
  if (!quiz) return Response.json({ error: "Quiz not found" }, { status: 404 });

  const questions = await env.DB.prepare(
    "SELECT correct_index AS correctIndex FROM quiz_questions WHERE quiz_id=? ORDER BY position,id",
  ).bind(quiz.id).all<{ correctIndex: number }>();
  if (!questions.results.length) {
    return Response.json({ error: "This quiz has no questions." }, { status: 409 });
  }

  const submitted = Array.isArray(answers) ? answers : [];
  const correct = questions.results.reduce(
    (total, question, index) => total + (submitted[index] === question.correctIndex ? 1 : 0),
    0,
  );
  const score = Math.round((correct / questions.results.length) * 100);
  const passed = score >= quiz.passingScore;

  if (passed) {
    await env.DB.prepare(
      `INSERT INTO lesson_progress (id,user_id,lesson_id,completed,updated_at)
       VALUES (?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET completed=excluded.completed,updated_at=excluded.updated_at`,
    ).bind(`${user.id}:${lessonId}`, user.id, lessonId, 1, Date.now()).run();
  }

  const result = await updateCourseProgress(env.DB, user.id, access.courseId);
  return Response.json({ score, passed, passingScore: quiz.passingScore, ...result });
}
