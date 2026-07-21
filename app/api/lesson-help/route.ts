import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import { buildContextualLessonHelp, type HelpLesson, type LessonHelpMode } from "../../../lib/contextual-lesson-help";
import { queueEmail } from "../../../lib/email-service";
import { getLessonGate } from "../../../lib/learner-controls";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";
import { requireApiUser } from "../../../lib/server-auth";

const MODES = new Set<LessonHelpMode>(["explain", "define", "example", "search", "check"]);

type LessonContext = HelpLesson & {
  courseId: string;
  courseTitle: string;
  schoolId: string;
  schoolName: string;
  sectionPosition: number;
  lessonPosition: number;
};

async function lessonContext(lessonId: string) {
  return env.DB.prepare(
    `SELECT l.id,l.title,l.content,l.transcript,l.course_id AS courseId,
      c.title AS courseTitle,c.school_id AS schoolId,s.name AS schoolName,
      COALESCE(cs.position,0) AS sectionPosition,l.position AS lessonPosition
     FROM lessons l JOIN courses c ON c.id=l.course_id JOIN schools s ON s.id=c.school_id
     LEFT JOIN course_sections cs ON cs.id=l.section_id WHERE l.id=?`,
  ).bind(lessonId).first<LessonContext>();
}

async function allowedLessons(context: LessonContext) {
  const rows = await env.DB.prepare(
    `SELECT l.id,l.title,l.content,l.transcript
     FROM lessons l LEFT JOIN course_sections cs ON cs.id=l.section_id
     WHERE l.course_id=? AND (
       COALESCE(cs.position,0) < ? OR
       (COALESCE(cs.position,0)=? AND (l.position < ? OR (l.position=? AND l.id=?)))
     ) ORDER BY COALESCE(cs.position,0),l.position,l.id`,
  ).bind(
    context.courseId,
    context.sectionPosition,
    context.sectionPosition,
    context.lessonPosition,
    context.lessonPosition,
    context.id,
  ).all<HelpLesson>();
  return rows.results;
}

async function learnerQuestions(learnerId: string, lessonId: string) {
  const rows = await env.DB.prepare(
    `SELECT id,question,status,response,created_at AS createdAt,
      updated_at AS updatedAt,responded_at AS respondedAt
     FROM lesson_help_requests WHERE learner_id=? AND lesson_id=?
     ORDER BY created_at DESC LIMIT 20`,
  ).bind(learnerId, lessonId).all();
  return rows.results;
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  if (url.searchParams.get("view") === "staff") {
    const school = await requireCreatorSchool(user, requestedSchoolId(request));
    if (!school) return Response.json({ error: "Academy staff access required." }, { status: 403 });
    const status = ["open", "answered", "closed"].includes(url.searchParams.get("status") || "")
      ? url.searchParams.get("status")
      : null;
    const rows = await env.DB.prepare(
      `SELECT r.id,r.question,r.status,r.response,r.created_at AS createdAt,
        r.updated_at AS updatedAt,r.responded_at AS respondedAt,
        p.display_name AS learnerName,p.email AS learnerEmail,
        c.title AS courseTitle,l.title AS lessonTitle
       FROM lesson_help_requests r
       JOIN profiles p ON p.id=r.learner_id JOIN courses c ON c.id=r.course_id
       JOIN lessons l ON l.id=r.lesson_id
       WHERE r.school_id=? AND (? IS NULL OR r.status=?)
       ORDER BY CASE r.status WHEN 'open' THEN 0 WHEN 'answered' THEN 1 ELSE 2 END,r.updated_at DESC LIMIT 100`,
    ).bind(school.id, status, status).all();
    return Response.json({ questions: rows.results, school: { id: school.id, name: school.name } });
  }
  const lessonId = url.searchParams.get("lessonId") || "";
  const gate = lessonId ? await getLessonGate(env.DB, user.id, lessonId) : null;
  if (!gate || gate.locked) return Response.json({ error: gate?.lockReason || "Lesson access required." }, { status: 403 });
  return Response.json({ questions: await learnerQuestions(user.id, lessonId) });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as {
    action?: string; lessonId?: string; mode?: LessonHelpMode; question?: string;
  } | null;
  const lessonId = String(body?.lessonId || "");
  const gate = lessonId ? await getLessonGate(env.DB, user.id, lessonId) : null;
  if (!gate || gate.locked) return Response.json({ error: gate?.lockReason || "Lesson access required." }, { status: 403 });
  const context = await lessonContext(lessonId);
  if (!context || context.courseId !== gate.courseId) return Response.json({ error: "Lesson not found." }, { status: 404 });

  if (body?.action === "help") {
    if (!body.mode || !MODES.has(body.mode)) return Response.json({ error: "Choose a valid help action." }, { status: 400 });
    const quizRows = body.mode === "check" ? await env.DB.prepare(
      `SELECT qq.prompt,qq.options_json AS optionsJson FROM quiz_questions qq
       JOIN quizzes q ON q.id=qq.quiz_id WHERE q.lesson_id=? ORDER BY qq.position LIMIT 1`,
    ).bind(lessonId).all<{ prompt: string; optionsJson: string }>() : { results: [] };
    const quizQuestions = quizRows.results.map((row) => ({
      prompt: row.prompt,
      options: JSON.parse(row.optionsJson || "[]") as string[],
    }));
    return Response.json({
      help: buildContextualLessonHelp({
        mode: body.mode,
        query: String(body.question || "").slice(0, 500),
        currentLessonId: lessonId,
        lessons: await allowedLessons(context),
        quizQuestions,
      }),
    });
  }

  if (body?.action === "ask_educator") {
    if (gate.isStaff) return Response.json({ error: "Use the educator question desk to respond to learners." }, { status: 400 });
    const question = String(body.question || "").trim().slice(0, 1_000);
    if (question.length < 10) return Response.json({ error: "Add a little more detail so the educator can help." }, { status: 400 });
    const id = crypto.randomUUID();
    const now = Date.now();
    await env.DB.prepare(
      `INSERT INTO lesson_help_requests
        (id,school_id,course_id,lesson_id,learner_id,question,status,response,created_at,updated_at)
       VALUES (?,?,?,?,?,?,'open','',?,?)`,
    ).bind(id, context.schoolId, context.courseId, lessonId, user.id, question, now, now).run();
    await writeAuditLog({ actorId: user.id, schoolId: context.schoolId, action: "lesson_help.question_created", targetType: "lesson_help_request", targetId: id });
    const support = await env.DB.prepare(
      `SELECT COALESCE(NULLIF(s.support_email,''),p.email) AS email
       FROM schools s JOIN profiles p ON p.id=s.owner_id WHERE s.id=?`,
    ).bind(context.schoolId).first<{ email: string }>();
    if (support?.email) {
      await queueEmail({
        schoolId: context.schoolId,
        recipientEmail: support.email,
        templateKey: "lesson_question",
        idempotencyKey: `lesson-question:${id}`,
        variables: { academy: context.schoolName, course: context.courseTitle, lesson: context.title, actionUrl: `${new URL(request.url).origin}/dashboard/questions` },
        sendNow: true,
      }).catch(() => undefined);
    }
    return Response.json({ question: (await learnerQuestions(user.id, lessonId))[0] }, { status: 201 });
  }
  return Response.json({ error: "Unknown help action." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Academy staff access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as { requestId?: string; response?: string; status?: string } | null;
  const item = await env.DB.prepare(
      `SELECT r.id,r.learner_id AS learnerId,r.lesson_id AS lessonId,r.course_id AS courseId,
      p.email,c.title AS courseTitle,l.title AS lessonTitle
     FROM lesson_help_requests r JOIN profiles p ON p.id=r.learner_id
     JOIN courses c ON c.id=r.course_id JOIN lessons l ON l.id=r.lesson_id
     WHERE r.id=? AND r.school_id=?`,
  ).bind(String(body?.requestId || ""), school.id).first<{ id: string; learnerId: string; email: string; courseId: string; courseTitle: string; lessonTitle: string }>();
  if (!item) return Response.json({ error: "Question not found." }, { status: 404 });
  const status = body?.status === "closed" ? "closed" : "answered";
  const response = String(body?.response || "").trim().slice(0, 3_000);
  if (status === "answered" && response.length < 2) return Response.json({ error: "Write a response before sending it." }, { status: 400 });
  const now = Date.now();
  await env.DB.prepare(
    `UPDATE lesson_help_requests SET response=?,status=?,responded_by=?,responded_at=?,updated_at=? WHERE id=? AND school_id=?`,
  ).bind(response, status, user.id, now, now, item.id, school.id).run();
  await writeAuditLog({ actorId: user.id, schoolId: school.id, action: "lesson_help.response_sent", targetType: "lesson_help_request", targetId: item.id, detail: { status } });
  if (status === "answered") {
    await queueEmail({
      schoolId: school.id,
      recipientUserId: item.learnerId,
      recipientEmail: item.email,
      templateKey: "lesson_question_answered",
      idempotencyKey: `lesson-question-answered:${item.id}:${now}`,
      variables: { academy: school.name, course: item.courseTitle, lesson: item.lessonTitle, actionUrl: `${new URL(request.url).origin}/learn/${item.courseId}` },
      sendNow: true,
    }).catch(() => undefined);
  }
  return Response.json({ updated: true });
}
