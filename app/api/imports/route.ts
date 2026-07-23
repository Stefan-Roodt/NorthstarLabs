import { env } from "cloudflare:workers";
import { writeAuditLog } from "../../../lib/audit-log";
import {
  runCourseLaunchAutopilot,
  sanitizeImportPlan,
  type CourseImportPlan,
  type CourseImportSummary,
} from "../../../lib/course-import";
import { queueEmail } from "../../../lib/email-service";
import {
  createInvitationToken,
  hashInvitationToken,
  INVITATION_LIFETIME_MS,
} from "../../../lib/invitations";
import { oversizedJsonRequest } from "../../../lib/security";
import { requireApiUser } from "../../../lib/server-auth";
import { requestedSchoolId, requireCreatorSchool } from "../../../lib/school-access";

const PROVIDERS = new Set(["teachable", "thinkific", "podia", "documents", "other"]);
const SOURCE_TYPES = new Set(["course_export", "document_sequence", "learner_list", "combined"]);

type ImportProject = {
  id: string;
  schoolId: string;
  createdBy: string;
  provider: string;
  sourceType: string;
  sourceFilename: string;
  title: string;
  status: string;
  rightsConfirmed: number;
  planJson: string;
  summaryJson: string;
  warningsJson: string;
  resultJson: string;
  createdAt: number;
  updatedAt: number;
  importedAt: number | null;
};

type ImportResult = {
  courses: Array<{ clientId: string; id: string; title: string; originalTitle: string; editorUrl: string }>;
  documents: Array<{
    clientId: string;
    filename: string;
    courseId: string;
    lessonId: string;
    attached: boolean;
    assetId?: string;
    attachedAt?: number;
  }>;
  invitations: Array<{ email: string; courseId: string | null; inviteUrl: string }>;
};

function projectSelect() {
  return `SELECT id,school_id AS schoolId,created_by AS createdBy,provider,
    source_type AS sourceType,source_filename AS sourceFilename,title,status,
    rights_confirmed AS rightsConfirmed,plan_json AS planJson,
    summary_json AS summaryJson,warnings_json AS warningsJson,
    result_json AS resultJson,created_at AS createdAt,updated_at AS updatedAt,
    imported_at AS importedAt FROM course_import_projects`;
}

function publicProject(project: ImportProject) {
  const result = JSON.parse(project.resultJson || "{}") as Partial<ImportResult>;
  const documentTotal = result.documents?.length || 0;
  const documentAttached = project.status === "imported"
    ? documentTotal
    : result.documents?.filter((document) => document.attached).length || 0;
  return {
    id: project.id,
    provider: project.provider,
    sourceType: project.sourceType,
    sourceFilename: project.sourceFilename,
    title: project.title,
    status: project.status,
    summary: JSON.parse(project.summaryJson || "{}") as CourseImportSummary,
    warnings: JSON.parse(project.warningsJson || "[]") as string[],
    result,
    documentUpload: {
      total: documentTotal,
      attached: documentAttached,
      remaining: Math.max(0, documentTotal - documentAttached),
    },
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    importedAt: project.importedAt,
  };
}

function safeLabel(value: unknown, fallback: string, limit = 180) {
  return typeof value === "string" && value.trim()
    ? value.trim().replace(/\s+/g, " ").slice(0, limit)
    : fallback;
}

function uniqueDraftTitle(title: string, usedTitles: Set<string>) {
  const base = safeLabel(title, "Imported course", 150);
  if (!usedTitles.has(base.toLowerCase())) {
    usedTitles.add(base.toLowerCase());
    return base;
  }
  for (let copy = 1; copy < 100; copy += 1) {
    const candidate = `${base} — imported draft${copy > 1 ? ` ${copy}` : ""}`.slice(0, 160);
    if (!usedTitles.has(candidate.toLowerCase())) {
      usedTitles.add(candidate.toLowerCase());
      return candidate;
    }
  }
  return `${base.slice(0, 130)} — ${crypto.randomUUID().slice(0, 8)}`;
}

async function projectForSchool(projectId: string, schoolId: string) {
  return env.DB.prepare(
    `${projectSelect()} WHERE id=? AND school_id=?`,
  ).bind(projectId, schoolId).first<ImportProject>();
}

export async function GET(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator academy required." }, { status: 403 });
  const rows = await env.DB.prepare(
    `${projectSelect()} WHERE school_id=? ORDER BY updated_at DESC LIMIT 30`,
  ).bind(school.id).all<ImportProject>();
  return Response.json({
    school: { id: school.id, name: school.name },
    projects: rows.results.map(publicProject),
  });
}

async function previewImport(
  user: { id: string },
  school: { id: string; name: string },
  body: Record<string, unknown>,
) {
  if (body.rightsConfirmed !== true) {
    return Response.json(
      { error: "Confirm that you own or are authorised to migrate this material." },
      { status: 400 },
    );
  }
  let normalized;
  try {
    normalized = sanitizeImportPlan(body.plan);
    if (body.automationEnabled === true) {
      const automated = runCourseLaunchAutopilot(normalized.plan);
      const automatedPlan = sanitizeImportPlan(automated.plan);
      normalized = {
        ...automatedPlan,
        warnings: [...new Set([...normalized.warnings, ...automatedPlan.warnings])],
      };
    }
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "The import could not be inspected.",
    }, { status: 400 });
  }
  const planJson = JSON.stringify(normalized.plan);
  if (new TextEncoder().encode(planJson).byteLength > 4_000_000) {
    return Response.json({ error: "This import is too large. Split it into smaller course groups." }, { status: 413 });
  }
  const provider = PROVIDERS.has(String(body.provider || "")) ? String(body.provider) : "other";
  const sourceType = SOURCE_TYPES.has(String(body.sourceType || "")) ? String(body.sourceType) : "combined";
  const id = crypto.randomUUID();
  const now = Date.now();
  const title = safeLabel(body.title, normalized.plan.courses[0]?.title || `${school.name} migration`);
  await env.DB.prepare(
    `INSERT INTO course_import_projects
      (id,school_id,created_by,provider,source_type,source_filename,title,status,
       rights_confirmed,plan_json,summary_json,warnings_json,result_json,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,'previewed',1,?,?,?,'{}',?,?)`,
  ).bind(
    id,
    school.id,
    user.id,
    provider,
    sourceType,
    safeLabel(body.sourceFilename, "", 300),
    title,
    planJson,
    JSON.stringify(normalized.summary),
    JSON.stringify(normalized.warnings),
    now,
    now,
  ).run();
  await writeAuditLog({
    actorId: user.id,
    schoolId: school.id,
    action: "course_import.preview",
    targetType: "course_import_project",
    targetId: id,
    detail: { provider, sourceType, automationEnabled: body.automationEnabled === true, ...normalized.summary },
  });
  const project = await projectForSchool(id, school.id);
  return Response.json({ project: publicProject(project!) }, { status: 201 });
}

async function importProject(
  request: Request,
  user: { id: string },
  school: { id: string; name: string; primaryColor?: string },
  body: Record<string, unknown>,
) {
  const projectId = safeLabel(body.projectId, "", 100);
  const project = await projectForSchool(projectId, school.id);
  if (!project) return Response.json({ error: "Import preview not found." }, { status: 404 });
  if (["imported", "awaiting_files"].includes(project.status)) {
    return Response.json({ error: "This preview was already imported.", project: publicProject(project) }, { status: 409 });
  }
  if (!project.rightsConfirmed || !["previewed", "failed"].includes(project.status)) {
    return Response.json({ error: "Inspect the import again before creating drafts." }, { status: 409 });
  }

  let plan: CourseImportPlan;
  try {
    plan = sanitizeImportPlan(JSON.parse(project.planJson)).plan;
  } catch {
    return Response.json({ error: "The saved preview is no longer valid." }, { status: 409 });
  }
  const sendInvitations = body.sendInvitations === true;
  if (sendInvitations && plan.learners.length > 100) {
    return Response.json(
      { error: "Send invitations in groups of 100 or fewer. Split this learner list before importing." },
      { status: 400 },
    );
  }

  const now = Date.now();
  await env.DB.prepare(
    "UPDATE course_import_projects SET status='importing',updated_at=? WHERE id=? AND school_id=?",
  ).bind(now, project.id, school.id).run();

  const existingRows = await env.DB.prepare(
    "SELECT id,title FROM courses WHERE school_id=?",
  ).bind(school.id).all<{ id: string; title: string }>();
  const usedTitles = new Set(existingRows.results.map((course) => course.title.toLowerCase()));
  const courseMatches = new Map(existingRows.results.map((course) => [course.title.toLowerCase(), course.id]));
  const statements: D1PreparedStatement[] = [];
  const result: ImportResult = { courses: [], documents: [], invitations: [] };

  for (const course of plan.courses) {
    const courseId = crypto.randomUUID();
    const importedTitle = uniqueDraftTitle(course.title, usedTitles);
    result.courses.push({
      clientId: course.clientId,
      id: courseId,
      title: importedTitle,
      originalTitle: course.title,
      editorUrl: `/dashboard/courses/${courseId}`,
    });
    courseMatches.set(course.title.toLowerCase(), courseId);
    statements.push(env.DB.prepare(
      `INSERT INTO courses
        (id,school_id,owner_id,title,description,status,price_cents,created_at,updated_at)
       VALUES (?,?,?,?,?,'draft',0,?,?)`,
    ).bind(
      courseId,
      school.id,
      user.id,
      importedTitle,
      course.description || "Imported as a private draft. Review the content, rights, media, assessments and learner experience before publishing.",
      now,
      now,
    ));
    for (const [sectionIndex, section] of course.sections.entries()) {
      const sectionId = crypto.randomUUID();
      statements.push(env.DB.prepare(
        "INSERT INTO course_sections (id,course_id,title,position,created_at) VALUES (?,?,?,?,?)",
      ).bind(sectionId, courseId, section.title, sectionIndex, now));
      for (const [lessonIndex, lesson] of section.lessons.entries()) {
        const lessonId = crypto.randomUUID();
        const lessonType = lesson.questions.length ? "quiz" : lesson.lessonType;
        statements.push(env.DB.prepare(
          `INSERT INTO lessons
            (id,course_id,section_id,title,lesson_type,content,content_format,video_key,
             primary_asset_id,intro_asset_id,duration_minutes,is_preview,available_after_days,
             required_watch_percent,transcript,position,updated_at)
           VALUES (?,?,?,?,?,?,'markdown',?,NULL,NULL,?,0,0,0,?,?,?)`,
        ).bind(
          lessonId,
          courseId,
          sectionId,
          lesson.title,
          lessonType,
          lesson.content,
          lesson.mediaUrl || null,
          Math.max(0, Math.round(lesson.durationMinutes || 0)),
          lesson.transcript,
          lessonIndex,
          now,
        ));
        if (lesson.document) {
          result.documents.push({
            clientId: lesson.document.clientId,
            filename: lesson.document.filename,
            courseId,
            lessonId,
            attached: false,
          });
        }
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
            crypto.randomUUID(),
            quizId,
            question.prompt,
            JSON.stringify(question.options),
            question.correctIndex,
            question.explanation,
            question.conceptLabel,
            questionIndex,
          )));
        }
      }
    }
  }

  const invitationDrafts: Array<{
    id: string;
    email: string;
    courseId: string | null;
    token: string;
    tokenHash: string;
    expiresAt: number;
    courseTitle: string;
  }> = [];
  if (sendInvitations) {
    for (const learner of plan.learners) {
      const token = createInvitationToken();
      const courseId = learner.courseTitle
        ? courseMatches.get(learner.courseTitle.toLowerCase()) || null
        : result.courses.length === 1 ? result.courses[0].id : null;
      const invitation = {
        id: crypto.randomUUID(),
        email: learner.email,
        courseId,
        token,
        tokenHash: await hashInvitationToken(token),
        expiresAt: now + INVITATION_LIFETIME_MS,
        courseTitle: learner.courseTitle,
      };
      invitationDrafts.push(invitation);
      statements.push(env.DB.prepare(
        `UPDATE invitations SET status='revoked'
         WHERE school_id=? AND email=? AND role='learner' AND course_id IS ? AND status='pending'`,
      ).bind(school.id, learner.email, courseId));
      statements.push(env.DB.prepare(
        `INSERT INTO invitations
          (id,school_id,course_id,email,role,token_hash,status,invited_by,expires_at,created_at)
         VALUES (?,?,?,?,'learner',?,'pending',?,?,?)`,
      ).bind(
        invitation.id,
        school.id,
        courseId,
        learner.email,
        invitation.tokenHash,
        user.id,
        invitation.expiresAt,
        now,
      ));
    }
  }

  const origin = new URL(request.url).origin;
  result.invitations = invitationDrafts.map((invitation) => ({
    email: invitation.email,
    courseId: invitation.courseId,
    inviteUrl: `${origin}/invite/${encodeURIComponent(invitation.token)}`,
  }));
  const importStatus = result.documents.length ? "awaiting_files" : "imported";
  statements.push(env.DB.prepare(
    `UPDATE course_import_projects SET status=?,result_json=?,imported_at=?,updated_at=?
     WHERE id=? AND school_id=?`,
  ).bind(
    importStatus,
    JSON.stringify(result),
    importStatus === "imported" ? now : null,
    now,
    project.id,
    school.id,
  ));

  try {
    await env.DB.batch(statements);
  } catch (error) {
    await env.DB.prepare(
      "UPDATE course_import_projects SET status='failed',updated_at=? WHERE id=? AND school_id=?",
    ).bind(Date.now(), project.id, school.id).run();
    console.error("Course import failed", error);
    return Response.json(
      { error: "The draft import could not be completed. Nothing was published; you can inspect and retry it." },
      { status: 500 },
    );
  }

  if (invitationDrafts.length) {
    const inviter = await env.DB.prepare(
      "SELECT display_name AS displayName FROM profiles WHERE id=?",
    ).bind(user.id).first<{ displayName: string }>();
    await Promise.allSettled(invitationDrafts.map((invitation) => queueEmail({
      schoolId: school.id,
      recipientEmail: invitation.email,
      templateKey: "invitation",
      variables: {
        academy: school.name,
        inviter: inviter?.displayName || school.name,
        role: "learner",
        course: invitation.courseTitle || null,
        primaryColor: school.primaryColor || "#3556d8",
        actionUrl: `${origin}/invite/${encodeURIComponent(invitation.token)}`,
        expires: new Date(invitation.expiresAt).toLocaleDateString("en-ZA", { dateStyle: "long" }),
      },
      idempotencyKey: `invitation:${invitation.id}`,
      sendNow: false,
    })));
  }

  await writeAuditLog({
    actorId: user.id,
    schoolId: school.id,
    action: "course_import.commit",
    targetType: "course_import_project",
    targetId: project.id,
    detail: {
      courses: result.courses.length,
      documents: result.documents.length,
      invitations: result.invitations.length,
      published: 0,
    },
  });
  const imported = await projectForSchool(project.id, school.id);
  return Response.json({ project: publicProject(imported!), result }, { status: 201 });
}

async function attachDocument(
  user: { id: string },
  school: { id: string },
  body: Record<string, unknown>,
) {
  const project = await projectForSchool(safeLabel(body.projectId, "", 100), school.id);
  if (!project || !["awaiting_files", "imported"].includes(project.status)) {
    return Response.json({ error: "Imported draft not found." }, { status: 404 });
  }
  const result = JSON.parse(project.resultJson || "{}") as ImportResult;
  const clientId = safeLabel(body.clientId, "", 120);
  const mapping = result.documents?.find((document) => document.clientId === clientId);
  const assetId = safeLabel(body.assetId, "", 100);
  if (!mapping || !assetId) return Response.json({ error: "Document mapping not found." }, { status: 404 });
  const asset = await env.DB.prepare(
    "SELECT id,filename FROM media_assets WHERE id=? AND school_id=? AND kind IN ('document','archive')",
  ).bind(assetId, school.id).first<{ id: string; filename: string }>();
  const lesson = await env.DB.prepare(
    `SELECT l.id FROM lessons l JOIN courses c ON c.id=l.course_id
     WHERE l.id=? AND c.id=? AND c.school_id=?`,
  ).bind(mapping.lessonId, mapping.courseId, school.id).first();
  if (!asset || !lesson) return Response.json({ error: "Uploaded document not found." }, { status: 404 });
  await env.DB.prepare(
    `INSERT INTO lesson_resources (id,lesson_id,asset_id,title,position) VALUES (?,?,?,?,0)
     ON CONFLICT(lesson_id,asset_id) DO UPDATE SET title=excluded.title`,
  ).bind(crypto.randomUUID(), mapping.lessonId, asset.id, asset.filename).run();
  const now = Date.now();
  const updatedResult: ImportResult = {
    ...result,
    documents: result.documents.map((document) => document.clientId === clientId
      ? { ...document, attached: true, assetId: asset.id, attachedAt: now }
      : document),
  };
  const complete = updatedResult.documents.every((document) => document.attached);
  await env.DB.prepare(
    `UPDATE course_import_projects
     SET status=?,result_json=?,imported_at=CASE WHEN ? THEN COALESCE(imported_at,?) ELSE imported_at END,updated_at=?
     WHERE id=? AND school_id=?`,
  ).bind(
    complete ? "imported" : "awaiting_files",
    JSON.stringify(updatedResult),
    complete ? 1 : 0,
    now,
    now,
    project.id,
    school.id,
  ).run();
  await writeAuditLog({
    actorId: user.id,
    schoolId: school.id,
    action: "course_import.document_attached",
    targetType: "lesson",
    targetId: mapping.lessonId,
    detail: { projectId: project.id, assetId: asset.id },
  });
  const updatedProject = await projectForSchool(project.id, school.id);
  return Response.json({
    attached: true,
    lessonId: mapping.lessonId,
    courseId: mapping.courseId,
    project: publicProject(updatedProject!),
  });
}

export async function POST(request: Request) {
  if (oversizedJsonRequest(request, 4_200_000)) {
    return Response.json({ error: "This import is too large. Split it into smaller groups." }, { status: 413 });
  }
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator academy required." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Import data required." }, { status: 400 });
  if (body.action === "preview") return previewImport(user, school, body);
  if (body.action === "import") return importProject(request, user, school, body);
  if (body.action === "attach_document") return attachDocument(user, school, body);
  return Response.json({ error: "Choose a valid import action." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const user = await requireApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const school = await requireCreatorSchool(user, requestedSchoolId(request));
  if (!school) return Response.json({ error: "Creator academy required." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id") || "";
  const project = await projectForSchool(id, school.id);
  if (!project) return Response.json({ error: "Import preview not found." }, { status: 404 });
  if (["imported", "awaiting_files"].includes(project.status)) {
    return Response.json(
      { error: "This history records created drafts and cannot be deleted from here. Delete the drafts individually if needed." },
      { status: 409 },
    );
  }
  await env.DB.prepare("DELETE FROM course_import_projects WHERE id=? AND school_id=?").bind(id, school.id).run();
  return Response.json({ deleted: true });
}
