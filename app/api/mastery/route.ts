import { env } from "cloudflare:workers";
import { nextMasteryState } from "../../../lib/mastery";
import { requireApiUser } from "../../../lib/server-auth";

type MasteryRow = {
  id: string;
  questionId: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  quizTitle: string;
  conceptLabel: string;
  status: "needs_review" | "practising" | "mastered";
  wrongCount: number;
  correctStreak: number;
  firstSeenAt: number;
  lastReviewedAt: number | null;
  nextReviewAt: number | null;
  masteredAt: number | null;
  prompt: string;
  optionsJson: string;
};

function masterySummary(items: MasteryRow[], now: number) {
  return {
    ready: items.filter((item) => item.status !== "mastered" && Number(item.nextReviewAt || 0) <= now).length,
    strengthening: items.filter((item) => item.status === "practising" && Number(item.nextReviewAt || 0) > now).length,
    mastered: items.filter((item) => item.status === "mastered").length,
    total: items.length,
  };
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId")?.trim() || "";
  const rows = await env.DB.prepare(
    `SELECT m.id,m.question_id AS questionId,m.course_id AS courseId,
      c.title AS courseTitle,m.lesson_id AS lessonId,l.title AS lessonTitle,
      q.title AS quizTitle,m.concept_label AS conceptLabel,m.status,
      m.wrong_count AS wrongCount,m.correct_streak AS correctStreak,
      m.first_seen_at AS firstSeenAt,m.last_reviewed_at AS lastReviewedAt,
      m.next_review_at AS nextReviewAt,m.mastered_at AS masteredAt,
      qq.prompt,qq.options_json AS optionsJson
     FROM learner_concept_mastery m
     JOIN quiz_questions qq ON qq.id=m.question_id
     JOIN quizzes q ON q.id=qq.quiz_id
     JOIN lessons l ON l.id=m.lesson_id
     JOIN courses c ON c.id=m.course_id
     WHERE m.user_id=? AND (?='' OR m.course_id=?)
     ORDER BY
       CASE m.status WHEN 'needs_review' THEN 0 WHEN 'practising' THEN 1 ELSE 2 END,
       COALESCE(m.next_review_at,m.updated_at),m.concept_label`,
  ).bind(user.id, courseId, courseId).all<MasteryRow>();
  const now = Date.now();
  const summary = masterySummary(rows.results, now);
  if (url.searchParams.get("summary") === "1") {
    return Response.json({ summary }, { headers: { "cache-control": "private, no-store" } });
  }
  return Response.json({
    summary,
    items: rows.results.map((item) => ({
      ...item,
      options: JSON.parse(item.optionsJson) as string[],
      optionsJson: undefined,
      due: item.status !== "mastered" && Number(item.nextReviewAt || 0) <= now,
    })),
  }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as {
    questionId?: string;
    answer?: number;
  } | null;
  const questionId = body?.questionId?.trim() || "";
  const answer = Number(body?.answer);
  const record = await env.DB.prepare(
    `SELECT m.id,m.wrong_count AS wrongCount,m.correct_streak AS correctStreak,
      qq.options_json AS optionsJson,qq.correct_index AS correctIndex,
      qq.explanation,m.concept_label AS conceptLabel
     FROM learner_concept_mastery m
     JOIN quiz_questions qq ON qq.id=m.question_id
     WHERE m.user_id=? AND m.question_id=?`,
  ).bind(user.id, questionId).first<{
    id: string;
    wrongCount: number;
    correctStreak: number;
    optionsJson: string;
    correctIndex: number;
    explanation: string;
    conceptLabel: string;
  }>();
  if (!record) return Response.json({ error: "Review concept not found." }, { status: 404 });
  const options = JSON.parse(record.optionsJson) as string[];
  if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) {
    return Response.json({ error: "Choose one valid answer." }, { status: 400 });
  }
  const now = Date.now();
  const correct = answer === Number(record.correctIndex);
  const next = nextMasteryState(record, correct, now);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO mastery_practice_attempts
        (id,user_id,question_id,selected_index,correct,answered_at)
       VALUES (?,?,?,?,?,?)`,
    ).bind(crypto.randomUUID(), user.id, questionId, answer, correct ? 1 : 0, now),
    env.DB.prepare(
      `UPDATE learner_concept_mastery SET status=?,wrong_count=?,correct_streak=?,
       last_reviewed_at=?,next_review_at=?,mastered_at=?,updated_at=?
       WHERE id=? AND user_id=?`,
    ).bind(
      next.status,
      next.wrongCount,
      next.correctStreak,
      now,
      next.nextReviewAt,
      next.masteredAt,
      now,
      record.id,
      user.id,
    ),
  ]);
  return Response.json({
    correct,
    selectedAnswer: options[answer],
    correctAnswer: options[Number(record.correctIndex)] || "the expected answer",
    explanation: record.explanation?.trim() ||
      `Revisit the lesson evidence for ${record.conceptLabel} before trying this concept again.`,
    status: next.status,
    correctStreak: next.correctStreak,
    nextReviewAt: next.nextReviewAt,
    masteredAt: next.masteredAt,
  });
}
