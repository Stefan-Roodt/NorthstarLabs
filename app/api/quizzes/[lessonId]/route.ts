import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { updateCourseProgress } from "../../../../lib/course-progress";
import { getLessonGate } from "../../../../lib/learner-controls";
import { queueCertificateEmail } from "../../../../lib/email-service";
import { buildQuizFeedback } from "../../../../lib/quiz-feedback";

export async function POST(
  request: Request,
  context: { params: Promise<{ lessonId: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { lessonId } = await context.params;
  const { answers } = await request.json() as { answers?: number[] };

  const gate = await getLessonGate(env.DB, user.id, lessonId);
  if (!gate) return Response.json({ error: "Not enrolled" }, { status: 403 });
  if (gate.locked && !gate.isStaff) {
    return Response.json({ error: gate.lockReason || "This lesson is locked." }, { status: 409 });
  }
  if (
    gate.requiredWatchPercent > gate.watchedPercent &&
    !gate.isStaff
  ) {
    return Response.json({
      error: `Watch at least ${gate.requiredWatchPercent}% of the lesson video before taking the quiz.`,
    }, { status: 409 });
  }

  const quiz = await env.DB.prepare(
    `SELECT id,passing_score AS passingScore,max_attempts AS maxAttempts
     FROM quizzes WHERE lesson_id=?`,
  ).bind(lessonId).first<{ id: string; passingScore: number; maxAttempts: number }>();
  if (!quiz) return Response.json({ error: "Quiz not found" }, { status: 404 });

  const attemptStats = await env.DB.prepare(
    `SELECT COUNT(*) AS attemptCount,MAX(score) AS bestScore,
      MAX(CASE WHEN passed=1 THEN 1 ELSE 0 END) AS passed
     FROM quiz_attempts WHERE quiz_id=? AND user_id=?`,
  ).bind(quiz.id, user.id).first<{
    attemptCount: number;
    bestScore: number | null;
    passed: number | null;
  }>();
  const attemptCount = Number(attemptStats?.attemptCount || 0);
  if (!attemptStats?.passed && quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts) {
    return Response.json({
      error: `You have used all ${quiz.maxAttempts} quiz attempts.`,
      attemptCount,
      attemptsRemaining: 0,
      bestScore: Number(attemptStats?.bestScore || 0),
    }, { status: 409 });
  }

  const questions = await env.DB.prepare(
    `SELECT id,options_json AS optionsJson,correct_index AS correctIndex,explanation
     FROM quiz_questions WHERE quiz_id=? ORDER BY position,id`,
  ).bind(quiz.id).all<{
    id: string;
    optionsJson: string;
    correctIndex: number;
    explanation: string;
  }>();
  if (!questions.results.length) {
    return Response.json({ error: "This quiz has no questions." }, { status: 409 });
  }

  const submitted = Array.isArray(answers) ? answers : [];
  const feedbackQuestions = questions.results.map((question) => ({
    id: question.id,
    options: JSON.parse(question.optionsJson) as string[],
    correctIndex: Number(question.correctIndex),
    explanation: question.explanation || "",
  }));
  if (
    submitted.length !== feedbackQuestions.length ||
    submitted.some((answer, index) =>
      !Number.isInteger(answer) ||
      answer < 0 ||
      answer >= feedbackQuestions[index].options.length
    )
  ) {
    return Response.json({ error: "Choose one valid answer for every question." }, { status: 400 });
  }
  const { correct, feedback } = buildQuizFeedback(feedbackQuestions, submitted);
  const score = Math.round((correct / questions.results.length) * 100);
  const passed = score >= quiz.passingScore;
  const submittedAt = Date.now();

  await env.DB.prepare(
    `INSERT INTO quiz_attempts
      (id,quiz_id,user_id,attempt_number,answers_json,score,passed,submitted_at)
     VALUES (?,?,?,?,?,?,?,?)`,
  ).bind(
    crypto.randomUUID(),
    quiz.id,
    user.id,
    attemptCount + 1,
    JSON.stringify(submitted),
    score,
    passed ? 1 : 0,
    submittedAt,
  ).run();

  if (passed) {
    await env.DB.prepare(
      `INSERT INTO lesson_progress (id,user_id,lesson_id,completed,updated_at)
       VALUES (?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET completed=excluded.completed,updated_at=excluded.updated_at`,
    ).bind(`${user.id}:${lessonId}`, user.id, lessonId, 1, Date.now()).run();
  }

  const result = await updateCourseProgress(env.DB, user.id, gate.courseId);
  if (result.certificateCode) {
    await queueCertificateEmail({
      userId: user.id,
      courseId: gate.courseId,
      certificateCode: result.certificateCode,
      origin: new URL(request.url).origin,
    }).catch(() => null);
  }
  const nextAttemptCount = attemptCount + 1;
  return Response.json({
    score,
    passed,
    passingScore: quiz.passingScore,
    attemptCount: nextAttemptCount,
    bestScore: Math.max(Number(attemptStats?.bestScore || 0), score),
    attemptsRemaining: quiz.maxAttempts > 0
      ? Math.max(0, quiz.maxAttempts - nextAttemptCount)
      : null,
    feedback,
    ...result,
  });
}
