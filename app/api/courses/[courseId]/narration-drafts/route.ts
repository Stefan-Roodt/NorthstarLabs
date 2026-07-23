import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../../../lib/audit-log";
import {
  buildNarrationDraft,
  countNarrationWords,
} from "../../../../../lib/narration-production";
import { requireCourseStaffAccess } from "../../../../../lib/school-access";
import { requireApiUser } from "../../../../../lib/server-auth";

type NarrationLessonRow = {
  id: string;
  sectionTitle: string;
  title: string;
  content: string | null;
  transcript: string | null;
  draftId: string | null;
  draftText: string | null;
  draftStatus: string | null;
};

const MAX_GENERATION_BATCH = 25;

async function courseLessons(courseId: string) {
  return env.DB.prepare(
    `SELECT l.id,COALESCE(cs.title,'Unsectioned lessons') AS sectionTitle,l.title,l.content,l.transcript,
      nd.id AS draftId,nd.draft_text AS draftText,nd.status AS draftStatus
     FROM lessons l
     LEFT JOIN course_sections cs ON cs.id=l.section_id
     LEFT JOIN lesson_narration_drafts nd ON nd.lesson_id=l.id
     WHERE l.course_id=? AND l.lesson_type<>'quiz'
     ORDER BY cs.position,l.position,l.id`,
  ).bind(courseId).all<NarrationLessonRow>();
}

function draftFor(row: NarrationLessonRow) {
  return buildNarrationDraft(row.title, row.content || "");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ courseId: string }> },
) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await context.params;
  const course = await requireCourseStaffAccess(user.id, courseId);
  if (!course) return Response.json({ error: "Course not found." }, { status: 404 });
  const body = await request.json().catch(() => ({})) as {
    action?: "preview" | "get" | "generate" | "approve" | "dismiss";
    lessonIds?: string[];
    lessonId?: string;
    draftText?: string;
  };

  if (body.action === "preview") {
    const result = await courseLessons(courseId);
    const ready = result.results.filter((row) => countNarrationWords(row.transcript || "") >= 40);
    const existingDrafts = result.results.filter((row) =>
      countNarrationWords(row.transcript || "") < 40 &&
      row.draftStatus === "draft"
    );
    const draftable = result.results.map((row) => ({
      row,
      draft: countNarrationWords(row.transcript || "") < 40 &&
        !row.draftStatus
        ? draftFor(row)
        : "",
    })).filter(({ draft }) => countNarrationWords(draft) >= 40);
    const educatorAttention = result.results.filter((row) =>
      countNarrationWords(row.transcript || "") < 40 &&
      row.draftStatus !== "draft" &&
      !draftable.some((candidate) => candidate.row.id === row.id)
    );
    return Response.json({
      totalInstructional: result.results.length,
      reviewedScripts: ready.length,
      draftsWaiting: existingDrafts.length,
      draftable: draftable.length,
      educatorAttention: educatorAttention.length,
      candidateIds: draftable.map(({ row }) => row.id),
      draftLessonIds: existingDrafts.map((row) => row.id),
      samples: draftable.slice(0, 3).map(({ row, draft }) => ({
        lessonId: row.id,
        sectionTitle: row.sectionTitle,
        lessonTitle: row.title,
        currentWords: countNarrationWords(row.transcript || ""),
        draftWords: countNarrationWords(draft),
        draft,
      })),
      educatorAttentionSamples: educatorAttention.slice(0, 5).map((row) => ({
        lessonId: row.id,
        sectionTitle: row.sectionTitle,
        lessonTitle: row.title,
      })),
    });
  }

  if (body.action === "get") {
    if (!body.lessonId) return Response.json({ error: "Lesson required." }, { status: 400 });
    const draft = await env.DB.prepare(
      `SELECT nd.id,nd.lesson_id AS lessonId,nd.draft_text AS draftText,
        nd.created_at AS createdAt,nd.updated_at AS updatedAt
       FROM lesson_narration_drafts nd
       JOIN lessons l ON l.id=nd.lesson_id
       WHERE nd.lesson_id=? AND nd.course_id=? AND l.course_id=? AND nd.status='draft'`,
    ).bind(body.lessonId, courseId, courseId).first<{
      id: string;
      lessonId: string;
      draftText: string;
      createdAt: number;
      updatedAt: number;
    }>();
    return Response.json({ draft: draft || null });
  }

  if (body.action === "generate") {
    const lessonIds = Array.from(new Set(body.lessonIds || []));
    if (!lessonIds.length || lessonIds.length > MAX_GENERATION_BATCH) {
      return Response.json(
        { error: `Choose between 1 and ${MAX_GENERATION_BATCH} lessons per generation batch.` },
        { status: 400 },
      );
    }
    const placeholders = lessonIds.map(() => "?").join(",");
    const rows = await env.DB.prepare(
      `SELECT l.id,COALESCE(cs.title,'Unsectioned lessons') AS sectionTitle,l.title,l.content,l.transcript,
        nd.id AS draftId,nd.draft_text AS draftText,nd.status AS draftStatus
       FROM lessons l
       LEFT JOIN course_sections cs ON cs.id=l.section_id
       LEFT JOIN lesson_narration_drafts nd ON nd.lesson_id=l.id
       WHERE l.course_id=? AND l.lesson_type<>'quiz'
         AND l.id IN (${placeholders})`,
    ).bind(courseId, ...lessonIds).all<NarrationLessonRow>();
    const prepared = rows.results.map((row) => ({ row, draft: draftFor(row) }))
      .filter(({ row, draft }) =>
        countNarrationWords(row.transcript || "") < 40 &&
        !row.draftStatus &&
        countNarrationWords(draft) >= 40
      );
    const now = Date.now();
    if (prepared.length) {
      await env.DB.batch(prepared.map(({ row, draft }) =>
        env.DB.prepare(
          `INSERT INTO lesson_narration_drafts
            (id,school_id,course_id,lesson_id,draft_text,status,source,created_by,created_at,updated_at)
           VALUES (?,?,?,?,?,'draft','lesson_content',?,?,?)
           ON CONFLICT(lesson_id) DO UPDATE SET
             draft_text=excluded.draft_text,
             status='draft',
             source='lesson_content',
             created_by=excluded.created_by,
             updated_at=excluded.updated_at`,
        ).bind(
          row.draftId || crypto.randomUUID(),
          course.schoolId,
          courseId,
          row.id,
          draft,
          user.id,
          now,
          now,
        )
      ));
      await writeAuditLog({
        actorId: user.id,
        schoolId: course.schoolId,
        action: "narration_drafts.generated",
        targetType: "course",
        targetId: courseId,
        detail: { generated: prepared.length, requested: lessonIds.length },
      });
    }
    return Response.json({
      generatedIds: prepared.map(({ row }) => row.id),
      skipped: lessonIds.length - prepared.length,
    });
  }

  if (body.action === "approve") {
    const draftText = (body.draftText || "").trim();
    if (!body.lessonId || countNarrationWords(draftText) < 40 || draftText.length > 100_000) {
      return Response.json(
        { error: "Review a substantive narration draft before approving it." },
        { status: 400 },
      );
    }
    const draft = await env.DB.prepare(
      `SELECT nd.id,l.transcript
       FROM lesson_narration_drafts nd
       JOIN lessons l ON l.id=nd.lesson_id
       WHERE nd.lesson_id=? AND nd.course_id=? AND l.course_id=? AND nd.status='draft'`,
    ).bind(body.lessonId, courseId, courseId).first<{ id: string; transcript: string | null }>();
    if (!draft) return Response.json({ error: "Narration draft not found." }, { status: 404 });
    if (countNarrationWords(draft.transcript || "") >= 40) {
      return Response.json(
        { error: "This lesson already has a reviewed narration script." },
        { status: 409 },
      );
    }
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE lessons SET transcript=?,updated_at=? WHERE id=? AND course_id=?",
      ).bind(draftText, now, body.lessonId, courseId),
      env.DB.prepare(
        "UPDATE lesson_narration_drafts SET draft_text=?,status='approved',updated_at=? WHERE id=?",
      ).bind(draftText, now, draft.id),
      env.DB.prepare("UPDATE courses SET updated_at=? WHERE id=?").bind(now, courseId),
    ]);
    await writeAuditLog({
      actorId: user.id,
      schoolId: course.schoolId,
      action: "narration_draft.approved",
      targetType: "lesson",
      targetId: body.lessonId,
      detail: { words: countNarrationWords(draftText) },
    });
    return Response.json({ approved: true, lessonId: body.lessonId, transcript: draftText, updatedAt: now });
  }

  if (body.action === "dismiss") {
    if (!body.lessonId) return Response.json({ error: "Lesson required." }, { status: 400 });
    const updated = await env.DB.prepare(
      `UPDATE lesson_narration_drafts SET status='dismissed',updated_at=?
       WHERE lesson_id=? AND course_id=? AND status='draft'`,
    ).bind(Date.now(), body.lessonId, courseId).run();
    if (!updated.meta.changes) return Response.json({ error: "Narration draft not found." }, { status: 404 });
    await writeAuditLog({
      actorId: user.id,
      schoolId: course.schoolId,
      action: "narration_draft.dismissed",
      targetType: "lesson",
      targetId: body.lessonId,
    });
    return Response.json({ dismissed: true, lessonId: body.lessonId });
  }

  return Response.json({ error: "Unsupported narration draft action." }, { status: 400 });
}
