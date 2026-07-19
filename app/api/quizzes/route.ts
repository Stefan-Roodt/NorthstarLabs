import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../lib/server-auth";
import { requireCourseStaffAccess } from "../../../lib/school-access";

type QuizQuestionInput = {
  prompt?: string;
  options?: string[];
  correctIndex?: number;
};

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    lessonId?: string;
    title?: string;
    passingScore?: number;
    maxAttempts?: number;
    questions?: QuizQuestionInput[];
  };
  if (!body.lessonId) return Response.json({ error: "Lesson required" }, { status: 400 });

  const lesson = await env.DB.prepare(
    "SELECT id,course_id AS courseId FROM lessons WHERE id=?",
  ).bind(body.lessonId).first<{ id: string; courseId: string }>();
  if (!lesson) return Response.json({ error: "Lesson not found" }, { status: 404 });
  const access = await requireCourseStaffAccess(user.id, lesson.courseId);
  if (!access) return Response.json({ error: "Lesson not found" }, { status: 404 });

  const existing = await env.DB.prepare(
    "SELECT id FROM quizzes WHERE lesson_id=?",
  ).bind(body.lessonId).first<{ id: string }>();

  const questionInputs = body.questions || [];
  if (!questionInputs.length) {
    if (existing) {
      await env.DB.batch([
        env.DB.prepare("DELETE FROM quiz_attempts WHERE quiz_id=?").bind(existing.id),
        env.DB.prepare("DELETE FROM quiz_questions WHERE quiz_id=?").bind(existing.id),
        env.DB.prepare("DELETE FROM quizzes WHERE id=?").bind(existing.id),
      ]);
    }
    return Response.json({ saved: true, removed: true });
  }

  const questions = questionInputs.map((question) => ({
    prompt: question.prompt?.trim() || "",
    options: (question.options || []).map((option) => option.trim()),
    correctIndex: Number(question.correctIndex || 0),
  }));
  for (const question of questions) {
    if (
      !question.prompt ||
      question.options.length < 2 ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length ||
      question.options.some((option) => !option)
    ) {
      return Response.json({ error: "Every question needs valid answer options." }, { status: 400 });
    }
  }

  const quizId = existing?.id || crypto.randomUUID();
  const passingScore = Math.max(1, Math.min(100, Number(body.passingScore || 80)));
  const maxAttempts = Math.max(0, Math.min(100, Number(body.maxAttempts || 0)));
  const statements = [
    env.DB.prepare(
      `INSERT INTO quizzes (id,lesson_id,title,passing_score,max_attempts) VALUES (?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET title=excluded.title,
         passing_score=excluded.passing_score,max_attempts=excluded.max_attempts`,
    ).bind(
      quizId,
      body.lessonId,
      body.title?.trim() || "Lesson quiz",
      passingScore,
      maxAttempts,
    ),
    env.DB.prepare("DELETE FROM quiz_questions WHERE quiz_id=?").bind(quizId),
    ...questions.map((question, index) =>
      env.DB.prepare(
        "INSERT INTO quiz_questions (id,quiz_id,prompt,options_json,correct_index,position) VALUES (?,?,?,?,?,?)",
      ).bind(
        crypto.randomUUID(),
        quizId,
        question.prompt,
        JSON.stringify(question.options),
        question.correctIndex,
        index,
      )
    ),
  ];
  await env.DB.batch(statements);
  return Response.json({ saved: true, id: quizId });
}
