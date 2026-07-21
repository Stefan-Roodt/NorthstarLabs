import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import {
  configuredStudioCapabilities,
  generateCourseBlueprint,
  generateNarration,
  type StudioBlueprint,
  type StudioSource,
} from "../../../lib/creator-studio";
import { requireApiUser } from "../../../lib/server-auth";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";

type StudioProjectRow = {
  id: string;
  schoolId: string;
  ownerId: string;
  courseId: string | null;
  title: string;
  audience: string;
  outcome: string;
  lessonMinutes: number;
  sourceDeclaration: number;
  aiDisclosure: number;
  status: string;
  blueprintJson: string;
  provider: string;
  model: string;
  createdAt: number;
  updatedAt: number;
};

function projectQuery() {
  return `SELECT id,school_id AS schoolId,owner_id AS ownerId,course_id AS courseId,
    title,audience,outcome,lesson_minutes AS lessonMinutes,
    source_declaration AS sourceDeclaration,ai_disclosure AS aiDisclosure,status,
    blueprint_json AS blueprintJson,provider,model,created_at AS createdAt,updated_at AS updatedAt
    FROM creator_studio_projects`;
}

async function projectForSchool(projectId: string, schoolId: string) {
  return env.DB.prepare(`${projectQuery()} WHERE id=? AND school_id=?`)
    .bind(projectId, schoolId).first<StudioProjectRow>();
}

async function projectSources(projectId: string, schoolId: string) {
  const rows = await env.DB.prepare(
    `SELECT title,source_type AS sourceType,source_url AS sourceUrl,
      source_text AS sourceText,rights_basis AS rightsBasis,citation_label AS citationLabel
     FROM creator_studio_sources WHERE project_id=? AND school_id=? ORDER BY created_at,id`,
  ).bind(projectId, schoolId).all<StudioSource>();
  return rows.results;
}

function publicProject(project: StudioProjectRow, sources: StudioSource[] = []) {
  return {
    ...project,
    sourceDeclaration: Boolean(project.sourceDeclaration),
    aiDisclosure: Boolean(project.aiDisclosure),
    blueprint: project.blueprintJson ? JSON.parse(project.blueprintJson) as StudioBlueprint : null,
    blueprintJson: undefined,
    sources,
  };
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator academy required." }, { status: 403 });
  const rows = await env.DB.prepare(
    `${projectQuery()} WHERE school_id=? ORDER BY updated_at DESC LIMIT 25`,
  ).bind(school.id).all<StudioProjectRow>();
  const projects = await Promise.all(rows.results.map(async (project) =>
    publicProject(project, await projectSources(project.id, school.id))
  ));
  return Response.json({ capabilities: configuredStudioCapabilities(), projects });
}

export async function POST(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator academy required." }, { status: 403 });
  const body = await request.json().catch(() => null) as {
    action?: string;
    projectId?: string;
    title?: string;
    audience?: string;
    outcome?: string;
    lessonMinutes?: number;
    rightsConfirmed?: boolean;
    aiDisclosure?: boolean;
    reviewConfirmed?: boolean;
    lessonId?: string;
    sources?: StudioSource[];
  } | null;
  const action = body?.action || "";

  if (action === "create") {
    const title = String(body?.title || "").trim().slice(0, 180);
    const audience = String(body?.audience || "").trim().slice(0, 500);
    const outcome = String(body?.outcome || "").trim().slice(0, 800);
    const lessonMinutes = Math.max(3, Math.min(20, Number(body?.lessonMinutes) || 6));
    const sources = Array.isArray(body?.sources) ? body.sources.slice(0, 12) : [];
    if (!title || !audience || !outcome) {
      return Response.json({ error: "Add a title, audience, and measurable learner outcome." }, { status: 400 });
    }
    if (!body?.rightsConfirmed) {
      return Response.json({ error: "Confirm that you have the rights to use every source." }, { status: 400 });
    }
    if (!body?.aiDisclosure) {
      return Response.json({ error: "Automated or AI-assisted material must remain disclosed to reviewers and learners." }, { status: 400 });
    }
    if (!sources.length || sources.some((source) => !source.title?.trim() || !source.sourceText?.trim() || !source.rightsBasis)) {
      return Response.json({ error: "Add at least one titled source with usable source text and a rights basis." }, { status: 400 });
    }
    const allowedRights = new Set(["owned", "licensed", "public_domain", "permission"]);
    if (sources.some((source) => !allowedRights.has(source.rightsBasis))) {
      return Response.json({ error: "Choose a valid rights basis for every source." }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const now = Date.now();
    const statements = [env.DB.prepare(
      `INSERT INTO creator_studio_projects
       (id,school_id,owner_id,title,audience,outcome,lesson_minutes,source_declaration,
        ai_disclosure,status,provider,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,'sources','northstar_native',?,?)`,
    ).bind(id, school.id, user.id, title, audience, outcome, lessonMinutes, 1, 1, now, now)];
    sources.forEach((source, index) => {
      statements.push(env.DB.prepare(
        `INSERT INTO creator_studio_sources
         (id,project_id,school_id,added_by,title,source_type,source_url,source_text,
          rights_basis,citation_label,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      ).bind(
        crypto.randomUUID(), id, school.id, user.id, source.title.trim().slice(0, 240),
        ["notes", "website", "document", "recording"].includes(source.sourceType) ? source.sourceType : "notes",
        source.sourceUrl?.trim().slice(0, 2_000) || null,
        source.sourceText.trim().slice(0, 50_000), source.rightsBasis, `[S${index + 1}]`, now + index,
      ));
    });
    await env.DB.batch(statements);
    const project = await projectForSchool(id, school.id);
    await writeAuditLog({
      actorId: user.id, schoolId: school.id, action: "creator_studio.project_created",
      targetType: "creator_studio_project", targetId: id,
      detail: { sourceCount: sources.length, rightsConfirmed: true, aiDisclosure: true },
    });
    return Response.json({ project: publicProject(project!, await projectSources(id, school.id)) }, { status: 201 });
  }

  const projectId = body?.projectId?.trim() || "";
  const project = projectId ? await projectForSchool(projectId, school.id) : null;
  if (!project) return Response.json({ error: "Creator Studio project not found." }, { status: 404 });

  if (action === "generate") {
    const sources = await projectSources(project.id, school.id);
    const generationId = crypto.randomUUID();
    const startedAt = Date.now();
    const generationProvider = process.env.GEMINI_API_KEY ? "google_gemini" : "northstar_native";
    await env.DB.prepare(
      `INSERT INTO creator_studio_generations
       (id,project_id,school_id,requested_by,generation_type,provider,model,status,created_at)
       VALUES (?,?,?,?,?,?,'','processing',?)`,
    ).bind(generationId, project.id, school.id, user.id, "course_blueprint", generationProvider, startedAt).run();
    try {
      const result = await generateCourseBlueprint({
        title: project.title, audience: project.audience, outcome: project.outcome,
        lessonMinutes: project.lessonMinutes, sources,
      });
      const blueprintJson = JSON.stringify(result.blueprint);
      const completedAt = Date.now();
      await env.DB.batch([
        env.DB.prepare(
          `UPDATE creator_studio_projects SET blueprint_json=?,provider=?,model=?,status='review',updated_at=? WHERE id=?`,
        ).bind(blueprintJson, result.provider, result.model, completedAt, project.id),
        env.DB.prepare(
          `UPDATE creator_studio_generations
           SET model=?,status='completed',output_json=?,completed_at=? WHERE id=?`,
        ).bind(result.model, blueprintJson, completedAt, generationId),
      ]);
      const updated = await projectForSchool(project.id, school.id);
      await writeAuditLog({
        actorId: user.id, schoolId: school.id, action: "creator_studio.blueprint_generated",
        targetType: "creator_studio_project", targetId: project.id,
        detail: { provider: result.provider, model: result.model, sections: result.blueprint.sections.length },
      });
      return Response.json({ project: publicProject(updated!, sources) });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed.";
      await env.DB.prepare(
        `UPDATE creator_studio_generations SET status='failed',error_message=?,completed_at=? WHERE id=?`,
      ).bind(message.slice(0, 1_500), Date.now(), generationId).run();
      return Response.json({ error: message }, { status: 502 });
    }
  }

  if (action === "export") {
    if (!body?.reviewConfirmed) {
      return Response.json({ error: "Confirm that a human reviewed the generated draft." }, { status: 400 });
    }
    if (project.courseId) {
      return Response.json({ error: "This project has already been exported.", courseId: project.courseId }, { status: 409 });
    }
    if (!project.blueprintJson) return Response.json({ error: "Generate and review the blueprint first." }, { status: 409 });
    const blueprint = JSON.parse(project.blueprintJson) as StudioBlueprint;
    const courseId = crypto.randomUUID();
    const now = Date.now();
    const statements = [env.DB.prepare(
      `INSERT INTO courses
       (id,school_id,owner_id,title,description,status,price_cents,enforce_lesson_order,created_at,updated_at)
       VALUES (?,?,?,?,?,'draft',0,1,?,?)`,
    ).bind(courseId, school.id, user.id, blueprint.title, `${blueprint.promise}\n\nAI-assisted draft. Human review is required before publication.`, now, now)];
    blueprint.sections.forEach((section, sectionIndex) => {
      const sectionId = crypto.randomUUID();
      statements.push(env.DB.prepare(
        "INSERT INTO course_sections (id,course_id,title,position,created_at) VALUES (?,?,?,?,?)",
      ).bind(sectionId, courseId, section.title, sectionIndex, now + sectionIndex));
      section.lessons.forEach((lesson, lessonIndex) => {
        const lessonId = crypto.randomUUID();
        const plannedMedia = lesson.lessonType === "video" || lesson.lessonType === "audio";
        const exportedLessonType = plannedMedia
          ? lesson.lessonType
          : lesson.lessonType === "quiz" ? "quiz" : "text";
        const productionNotice = plannedMedia
          ? `\n\n> **Production check:** This lesson includes an approved narration script, but no playable ${lesson.lessonType} has been attached yet. It must remain unpublished until media review is complete.`
          : "";
        statements.push(env.DB.prepare(
          `INSERT INTO lessons
           (id,course_id,title,section_id,lesson_type,content,content_format,duration_minutes,
            required_watch_percent,transcript,position,updated_at)
           VALUES (?,?,?,?,? ,?,'markdown',?,0,?,?,?)`,
        ).bind(
          lessonId, courseId, lesson.title, sectionId, exportedLessonType,
          `${lesson.content}${productionNotice}`, lesson.durationMinutes, lesson.transcript,
          lessonIndex, now,
        ));
        if (lesson.questions.length) {
          const quizId = crypto.randomUUID();
          statements.push(env.DB.prepare(
            "INSERT INTO quizzes (id,lesson_id,title,passing_score,max_attempts) VALUES (?,?,?,80,0)",
          ).bind(quizId, lessonId, `${lesson.title} check`));
          lesson.questions.forEach((question, questionIndex) => statements.push(env.DB.prepare(
            `INSERT INTO quiz_questions
             (id,quiz_id,prompt,options_json,correct_index,explanation,concept_label,position)
             VALUES (?,?,?,?,?,?,?,?)`,
          ).bind(
            crypto.randomUUID(), quizId, question.prompt, JSON.stringify(question.options),
            question.correctIndex,
            question.explanation?.trim() || "Review the approved source and lesson reasoning before retrying.",
            question.conceptLabel?.trim().slice(0, 100) || question.prompt.slice(0, 100),
            questionIndex,
          )));
        }
      });
    });
    statements.push(env.DB.prepare(
      `UPDATE creator_studio_projects SET course_id=?,status='exported',updated_at=? WHERE id=?`,
    ).bind(courseId, Date.now(), project.id));
    await env.DB.batch(statements);
    await writeAuditLog({
      actorId: user.id, schoolId: school.id, action: "creator_studio.course_exported",
      targetType: "course", targetId: courseId,
      detail: { projectId: project.id, status: "draft", reviewedByHuman: true },
    });
    return Response.json({ courseId, status: "draft" }, { status: 201 });
  }

  if (action === "narrate") {
    const lessonId = body?.lessonId?.trim() || "";
    const lesson = await env.DB.prepare(
      `SELECT l.id,l.title,l.transcript,c.id AS courseId,c.school_id AS schoolId
       FROM lessons l JOIN courses c ON c.id=l.course_id
       WHERE l.id=? AND c.id=? AND c.school_id=?`,
    ).bind(lessonId, project.courseId || "", school.id).first<{
      id: string; title: string; transcript: string; courseId: string; schoolId: string;
    }>();
    if (!lesson) return Response.json({ error: "Export the course before generating narration." }, { status: 404 });
    if (!lesson.transcript.trim()) return Response.json({ error: "This lesson has no approved narration script." }, { status: 409 });
    try {
      const result = await generateNarration(lesson.transcript);
      const assetId = crypto.randomUUID();
      const filename = `${lesson.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 80) || "lesson"}.wav`;
      const objectKey = `schools/${school.id}/creator-studio/${assetId}-${filename}`;
      const key = `r2:${objectKey}`;
      const now = Date.now();
      await env.UPLOADS.put(objectKey, result.audio, {
        httpMetadata: { contentType: result.contentType },
        customMetadata: { owner: user.id, school: school.id, generatedBy: result.model, project: project.id },
      });
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO media_assets
           (id,school_id,owner_id,key,filename,content_type,size_bytes,kind,alt_text,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,'audio','AI-assisted narration; human review required.',?,?)`,
        ).bind(assetId, school.id, user.id, key, filename, result.contentType, result.audio.byteLength, now, now),
        env.DB.prepare(
          "UPDATE lessons SET primary_asset_id=?,lesson_type='audio',updated_at=? WHERE id=?",
        ).bind(assetId, now, lesson.id),
      ]);
      await writeAuditLog({
        actorId: user.id, schoolId: school.id, action: "creator_studio.narration_generated",
        targetType: "lesson", targetId: lesson.id,
        detail: { projectId: project.id, model: result.model, assetId, requiresHumanReview: true },
      });
      return Response.json({ assetId, lessonId: lesson.id, status: "review_required" }, { status: 201 });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Narration generation failed." }, { status: 502 });
    }
  }

  return Response.json({ error: "Unsupported Creator Studio action." }, { status: 400 });
}
