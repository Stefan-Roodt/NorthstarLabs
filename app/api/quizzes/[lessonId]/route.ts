import { env } from "cloudflare:workers";
import { requireApiUser } from "../../../../lib/server-auth";
import { updateCourseProgress } from "../../../../lib/course-progress";
import { getLessonGate } from "../../../../lib/learner-controls";
import { queueCertificateEmail } from "../../../../lib/email-service";
import { buildQuizFeedback } from "../../../../lib/quiz-feedback";
import { nextMasteryState, normaliseConceptLabel } from "../../../../lib/mastery";

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
    `SELECT id,prompt,options_json AS optionsJson,correct_index AS correctIndex,
      explanation,concept_label AS conceptLabel
     FROM quiz_questions WHERE quiz_id=? ORDER BY position,id`,
  ).bind(quiz.id).all<{
    id: string;
    prompt: string;
    optionsJson: string;
    correctIndex: number;
    explanation: string;
    conceptLabel: string;
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
  const placeholders = questions.results.map(() => "?").join(",");
  const currentRows = await env.DB.prepare(
    `SELECT id,question_id AS questionId,status,wrong_count AS wrongCount,
      correct_streak AS correctStreak,first_seen_at AS firstSeenAt
     FROM learner_concept_mastery
     WHERE user_id=? AND question_id IN (${placeholders})`,
  ).bind(user.id, ...questions.results.map((question) => question.id)).all<{
    id: string;
    questionId: string;
    status: string;
    wrongCount: number;
    correctStreak: number;
    firstSeenAt: number;
  }>();
  const currentMastery = new Map(currentRows.results.map((row) => [row.questionId, row]));
  let newConcepts = 0;
  let masteredConcepts = 0;
  const masteryStatements = questions.results.flatMap((question, index) => {
    const correct = feedback[index]?.correct || false;
    const current = currentMastery.get(question.id);
    if (correct && !current) return [];
    const next = nextMasteryState(current || null, correct, submittedAt);
    if (!correct && !current) newConcepts += 1;
    if (next.status === "mastered" && current?.status !== "mastered") masteredConcepts += 1;
    return [env.DB.prepare(
      `INSERT INTO learner_concept_mastery
        (id,user_id,question_id,course_id,lesson_id,concept_label,status,
         wrong_count,correct_streak,first_seen_at,last_reviewed_at,
         next_review_at,mastered_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(user_id,question_id) DO UPDATE SET
         course_id=excluded.course_id,lesson_id=excluded.lesson_id,
         concept_label=excluded.concept_label,status=excluded.status,
         wrong_count=excluded.wrong_count,correct_streak=excluded.correct_streak,
         last_reviewed_at=excluded.last_reviewed_at,
         next_review_at=excluded.next_review_at,mastered_at=excluded.mastered_at,
         updated_at=excluded.updated_at`,
    ).bind(
      current?.id || crypto.randomUUID(),
      user.id,
      question.id,
      gate.courseId,
      lessonId,
      normaliseConceptLabel(question.conceptLabel, question.prompt),
      next.status,
      next.wrongCount,
      next.correctStreak,
      current?.firstSeenAt || submittedAt,
      submittedAt,
      next.nextReviewAt,
      next.masteredAt,
      submittedAt,
    )];
  });

  await env.DB.batch([
    env.DB.prepare(
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
    ),
    ...masteryStatements,
  ]);

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
    mastery: {
      weakConcepts: feedback.filter((item) => !item.correct).length,
      newConcepts,
      masteredConcepts,
    },
    ...result,
  });
}
