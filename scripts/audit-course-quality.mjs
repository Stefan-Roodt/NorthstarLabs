import { readdir, readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { getCourseReadiness } from "../lib/course-readiness.ts";
import { parseLessonExperience } from "../lib/lesson-experience.ts";

const courseId = process.argv[2] || "cognizen-crypto-mastery-foundations-production";
const migrationDirectory = new URL("../drizzle/", import.meta.url);
const files = (await readdir(migrationDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const database = new DatabaseSync(":memory:");

for (const file of files) {
  if (file.startsWith("0006_")) {
    database.exec(`
      INSERT INTO profiles (id,email,display_name,role,created_at)
      VALUES
        ('creator-fixture','creator@example.com','Fixture Creator','creator',1784400000000),
        ('learner-fixture','learner@example.com','Fixture Learner','creator',1784400000000);
      INSERT INTO courses
        (id,owner_id,title,description,status,price_cents,created_at,updated_at)
      VALUES
        ('legacy-fixture-course','creator-fixture','Legacy Fixture Course','','published',0,1784400000000,1784400000000);
      INSERT INTO enrollments
        (id,user_id,course_id,progress,status,support_note,last_activity_at,created_at)
      VALUES
        ('legacy-fixture-enrollment','learner-fixture','legacy-fixture-course',25,'active','',1784400000000,1784400000000);
      INSERT INTO communities
        (id,owner_id,name,description,access_type,allow_posting,created_at)
      VALUES
        ('northstar-circle','creator-fixture','Northstar Circle','','open',1,1784400000000);
      INSERT INTO community_members
        (id,community_id,user_id,role,status,joined_at)
      VALUES
        ('legacy-community-owner','northstar-circle','creator-fixture','owner','active',1784400000000);
    `);
  }
  if (file.startsWith("0018_")) {
    database.exec(`
      INSERT OR IGNORE INTO profiles
        (id,email,display_name,role,active_school_id,onboarding_path,
         onboarding_completed,status,created_at)
      VALUES
        ('stefan-course-owner-fixture','stefan@example.com','Stefan Roodt','creator',
         'stefan-course-school-fixture','creator',1,'active',1784483000000);
      INSERT OR IGNORE INTO schools
        (id,slug,name,description,primary_color,accent_color,hero_title,
         hero_description,font_theme,support_email,seo_title,seo_description,
         show_community,owner_id,status,created_at,updated_at)
      VALUES
        ('stefan-course-school-fixture','stefan-roodt-s-academy',
         'Stefan Roodt''s Academy','','#3556d8','#ffbd8a','','','modern','','','',
         1,'stefan-course-owner-fixture','active',1784483000000,1784483000000);
    `);
  }
  const sql = await readFile(new URL(file, migrationDirectory), "utf8");
  const statements = sql
    .split(/--> statement-breakpoint\s*/)
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) database.exec(statement);
}

const course = database.prepare(`
  SELECT title,description,certificate_title AS certificateTitle
  FROM courses WHERE id=?
`).get(courseId);
if (!course) throw new Error(`Course not found: ${courseId}`);

const sections = database.prepare(`
  SELECT id,title FROM course_sections WHERE course_id=? ORDER BY position,id
`).all(courseId);
const lessons = database.prepare(`
  SELECT l.id,l.section_id AS sectionId,l.title,l.lesson_type AS lessonType,
    l.content,l.video_key AS videoKey,l.primary_asset_id AS primaryAssetId,
    l.duration_minutes AS durationMinutes,l.transcript,l.experience_json AS experienceJson,
    ma.id AS primaryJoinedId,ma.filename AS primaryFilename,
    ma.kind AS primaryKind,ma.alt_text AS primaryAltText
  FROM lessons l
  LEFT JOIN media_assets ma ON ma.id=l.primary_asset_id
  WHERE l.course_id=?
  ORDER BY l.section_id,l.position,l.id
`).all(courseId);
const quizRows = database.prepare(`
  SELECT q.lesson_id AS lessonId,qq.prompt,qq.options_json AS optionsJson,
    qq.explanation
  FROM quizzes q
  LEFT JOIN quiz_questions qq ON qq.quiz_id=q.id
  JOIN lessons l ON l.id=q.lesson_id
  WHERE l.course_id=?
  ORDER BY q.id,qq.position,qq.id
`).all(courseId);
const resourceRows = database.prepare(`
  SELECT lr.lesson_id AS lessonId,lr.id
  FROM lesson_resources lr
  JOIN lessons l ON l.id=lr.lesson_id
  WHERE l.course_id=?
`).all(courseId);

const quizzes = new Map();
for (const row of quizRows) {
  const quiz = quizzes.get(row.lessonId) || { questions: [] };
  if (row.prompt) {
    let options = [];
    try {
      const parsed = JSON.parse(row.optionsJson || "[]");
      if (Array.isArray(parsed)) options = parsed;
    } catch {
      // The readiness check will report malformed/empty quiz options elsewhere.
    }
    quiz.questions.push({
      prompt: row.prompt,
      options,
      explanation: row.explanation || "",
    });
  }
  quizzes.set(row.lessonId, quiz);
}
const resources = new Map();
for (const row of resourceRows) {
  const bucket = resources.get(row.lessonId) || [];
  bucket.push(row);
  resources.set(row.lessonId, bucket);
}

const readiness = getCourseReadiness({
  ...course,
  sections,
  lessons: lessons.map((lesson) => ({
    ...lesson,
    primaryAsset: lesson.primaryAssetId && lesson.primaryJoinedId
      ? {
          id: lesson.primaryJoinedId,
          filename: lesson.primaryFilename || "",
          kind: lesson.primaryKind || "",
          altText: lesson.primaryAltText || "",
        }
      : null,
    transcript: lesson.transcript || "",
    resources: resources.get(lesson.id) || [],
    quiz: quizzes.get(lesson.id) || null,
  })),
});

const issueType = (issue) => issue.id.slice(issue.id.lastIndexOf("-") + 1);
const counts = readiness.issues.reduce((result, issue) => {
  const type = issueType(issue);
  result[type] = (result[type] || 0) + 1;
  return result;
}, {});
const mediaUsage = [...lessons.reduce((usage, lesson) => {
  if (!lesson.primaryAssetId) return usage;
  usage.set(lesson.primaryAssetId, (usage.get(lesson.primaryAssetId) || 0) + 1);
  return usage;
}, new Map())]
  .map(([assetId, count]) => ({ assetId, count }))
  .sort((left, right) => right.count - left.count);
const orphanedPrimaryAssets = lessons
  .filter((lesson) => lesson.primaryAssetId && !lesson.primaryJoinedId)
  .map((lesson) => ({ lessonId: lesson.id, assetId: lesson.primaryAssetId }));
const lessonProfiles = [...lessons.reduce((profiles, lesson) => {
  const profile = [
    lesson.lessonType,
    parseLessonExperience(lesson.experienceJson) ? "experience" : "no-experience",
    lesson.primaryAssetId?.includes("fallback") ? "fallback" : lesson.primaryAssetId ? "dedicated-media" : "no-media",
  ].join(" / ");
  profiles.set(profile, (profiles.get(profile) || 0) + 1);
  return profiles;
}, new Map())]
  .map(([profile, count]) => ({ profile, count }))
  .sort((left, right) => right.count - left.count);

console.log(JSON.stringify({
  courseId,
  score: readiness.score,
  label: readiness.label,
  lessons: lessons.length,
  quizzes: quizzes.size,
  quizQuestions: quizRows.filter((row) => row.prompt).length,
  blockers: readiness.blockers.length,
  improvements: readiness.improvements.length,
  counts,
  validExperiences: lessons.filter((lesson) => parseLessonExperience(lesson.experienceJson)).length,
  uniquePrimaryAssets: mediaUsage.length,
  orphanedPrimaryAssets,
  repeatedPrimaryAssets: mediaUsage.filter((item) => item.count > 1),
  lessonProfiles,
  issues: readiness.issues.map((issue) => ({
    id: issue.id,
    level: issue.level,
    title: issue.title,
    lessonId: issue.lessonId,
    lessonTitle: issue.lessonTitle,
    sectionTitle: issue.lessonId
      ? sections.find((section) =>
          lessons.find((lesson) => lesson.id === issue.lessonId)?.sectionId === section.id
        )?.title
      : undefined,
  })),
}, null, 2));
