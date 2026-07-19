import { readdir, readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";

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

const tables = database.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
).all();
const schools = database.prepare(
  "SELECT id,name FROM schools ORDER BY id",
).all();
const courseScopes = database.prepare(
  "SELECT school_id AS schoolId,COUNT(*) AS courses FROM courses GROUP BY school_id",
).all();
const stefanWeb3Course = database.prepare(`
  SELECT c.id,c.status,c.owner_id AS ownerId,c.school_id AS schoolId,
    COUNT(DISTINCT cs.id) AS sections,COUNT(DISTINCT l.id) AS lessons,
    COUNT(DISTINCT q.id) AS quizzes
  FROM courses c
  LEFT JOIN course_sections cs ON cs.course_id=c.id
  LEFT JOIN lessons l ON l.course_id=c.id
  LEFT JOIN quizzes q ON q.lesson_id=l.id
  WHERE c.id='stefan-web3-foundations'
  GROUP BY c.id
`).get();

if (!tables.some((table) => table.name === "schools")) {
  throw new Error("The schools table was not created.");
}
if (!stefanWeb3Course ||
    stefanWeb3Course.status !== "draft" ||
    stefanWeb3Course.ownerId !== "stefan-course-owner-fixture" ||
    stefanWeb3Course.schoolId !== "stefan-course-school-fixture" ||
    stefanWeb3Course.sections !== 6 ||
    stefanWeb3Course.lessons !== 24 ||
    stefanWeb3Course.quizzes !== 6) {
  throw new Error("The Stefan Web3 draft course did not migrate with its complete curriculum.");
}
if (!tables.some((table) => table.name === "school_members")) {
  throw new Error("The school_members table was not created.");
}
if (!tables.some((table) => table.name === "invitations")) {
  throw new Error("The invitations table was not created.");
}
for (const table of ["course_sections", "media_assets", "lesson_resources"]) {
  if (!tables.some((item) => item.name === table)) {
    throw new Error(`The ${table} course-authoring table was not created.`);
  }
}
for (const table of [
  "rate_limit_buckets",
  "system_events",
  "backup_runs",
  "content_reports",
  "data_requests",
]) {
  if (!tables.some((item) => item.name === table)) {
    throw new Error(`The ${table} production-hardening table was not created.`);
  }
}
for (const table of [
  "products",
  "product_items",
  "product_entitlements",
  "live_sessions",
  "live_attendance",
  "integrations",
  "integration_deliveries",
]) {
  if (!tables.some((item) => item.name === table)) {
    throw new Error(`The ${table} product-growth table was not created.`);
  }
}
if (!tables.some((item) => item.name === "quiz_attempts")) {
  throw new Error("The quiz_attempts assessment table was not created.");
}
const profileColumns = database.prepare(
  "PRAGMA table_info(profiles)",
).all();
for (const column of ["onboarding_path", "onboarding_completed", "onboarded_at"]) {
  if (!profileColumns.some((item) => item.name === column)) {
    throw new Error(`The profiles.${column} onboarding column was not created.`);
  }
}
const invitationIndexes = database.prepare(
  "PRAGMA index_list(invitations)",
).all();
if (!invitationIndexes.some((item) => item.name === "invitations_token_hash_unique" && item.unique === 1)) {
  throw new Error("Invitation tokens are not protected by a unique hash index.");
}
const profileIndexes = database.prepare(
  "PRAGMA index_list(profiles)",
).all();
if (!profileIndexes.some((item) => item.name === "profiles_email_unique" && item.unique === 1)) {
  throw new Error("Profile email addresses are not protected by a unique index.");
}
const lessonColumns = database.prepare(
  "PRAGMA table_info(lessons)",
).all();
for (const column of [
  "section_id",
  "lesson_type",
  "content_format",
  "primary_asset_id",
  "duration_minutes",
  "is_preview",
  "updated_at",
]) {
  if (!lessonColumns.some((item) => item.name === column)) {
    throw new Error(`The lessons.${column} authoring column was not created.`);
  }
}
const courseColumns = database.prepare(
  "PRAGMA table_info(courses)",
).all();
for (const column of [
  "enforce_lesson_order",
  "available_from",
  "certificate_title",
  "certificate_accent",
  "certificate_valid_days",
]) {
  if (!courseColumns.some((item) => item.name === column)) {
    throw new Error(`The courses.${column} learner-control column was not created.`);
  }
}
for (const column of ["available_after_days", "required_watch_percent", "transcript"]) {
  if (!lessonColumns.some((item) => item.name === column)) {
    throw new Error(`The lessons.${column} learner-control column was not created.`);
  }
}
const progressColumns = database.prepare(
  "PRAGMA table_info(lesson_progress)",
).all();
for (const column of ["watched_percent", "notes", "bookmarked"]) {
  if (!progressColumns.some((item) => item.name === column)) {
    throw new Error(`The lesson_progress.${column} learning-state column was not created.`);
  }
}
const enrollmentColumns = database.prepare(
  "PRAGMA table_info(enrollments)",
).all();
for (const column of ["access_source", "access_source_id"]) {
  if (!enrollmentColumns.some((item) => item.name === column)) {
    throw new Error(`The enrollments.${column} entitlement column was not created.`);
  }
}
const communityMemberColumns = database.prepare(
  "PRAGMA table_info(community_members)",
).all();
for (const column of ["access_source", "access_source_id"]) {
  if (!communityMemberColumns.some((item) => item.name === column)) {
    throw new Error(`The community_members.${column} entitlement column was not created.`);
  }
}
const certificateColumns = database.prepare(
  "PRAGMA table_info(certificates)",
).all();
for (const column of [
  "recipient_name",
  "course_title",
  "certificate_title",
  "accent_color",
  "status",
  "expires_at",
  "revoked_at",
  "replaced_by_code",
]) {
  if (!certificateColumns.some((item) => item.name === column)) {
    throw new Error(`The certificates.${column} verification column was not created.`);
  }
}
if (!schools.some((school) => school.id === "northstarlabs")) {
  throw new Error("The existing NorthstarLabs school was not migrated.");
}
if (courseScopes.some((scope) => !scope.schoolId)) {
  throw new Error("At least one course was left without a school.");
}
const legacyCourse = database.prepare(
  "SELECT school_id AS schoolId FROM courses WHERE id='legacy-fixture-course'",
).get();
if (legacyCourse?.schoolId !== "school-creator-fixture") {
  throw new Error("An existing creator course was not moved into its own school.");
}
const legacySection = database.prepare(
  "SELECT id,title FROM course_sections WHERE course_id='legacy-fixture-course'",
).get();
if (legacySection?.id !== "section-legacy-fixture-course") {
  throw new Error("The existing course was not given a default curriculum section.");
}
const legacyLessonSection = database.prepare(
  "SELECT section_id AS sectionId FROM lessons WHERE course_id='legacy-fixture-course' LIMIT 1",
).get();
if (legacyLessonSection && legacyLessonSection.sectionId !== legacySection.id) {
  throw new Error("An existing lesson was not moved into the migrated course section.");
}
const unsectionedLessons = database.prepare(
  "SELECT COUNT(*) AS count FROM lessons WHERE section_id IS NULL",
).get();
if (unsectionedLessons.count !== 0) {
  throw new Error("At least one existing lesson was left outside a curriculum section.");
}
const legacyRoles = database.prepare(
  `SELECT user_id AS userId,role FROM school_members
   WHERE school_id='school-creator-fixture' ORDER BY user_id`,
).all();
if (!legacyRoles.some((member) =>
  member.userId === "creator-fixture" && member.role === "owner"
)) {
  throw new Error("The existing creator was not made the school owner.");
}
if (!legacyRoles.some((member) =>
  member.userId === "learner-fixture" && member.role === "learner"
)) {
  throw new Error("The existing learner was not moved into the creator's school.");
}
const migratedCommunity = database.prepare(
  "SELECT school_id AS schoolId,owner_id AS ownerId FROM communities WHERE id='northstar-circle'",
).get();
if (
  migratedCommunity?.schoolId !== "northstarlabs" ||
  migratedCommunity?.ownerId !== "northstarlabs-studio"
) {
  throw new Error("The shared legacy community was not returned to the platform school.");
}

console.log(JSON.stringify({
  migrations: files.length,
  tables: tables.length,
  invitationIndexes: invitationIndexes.map((item) => item.name),
  authoringTables: ["course_sections", "media_assets", "lesson_resources"],
  learnerControlTables: ["lesson_progress", "quiz_attempts", "certificates"],
  reliabilityTables: [
    "rate_limit_buckets",
    "system_events",
    "backup_runs",
    "content_reports",
    "data_requests",
  ],
  growthTables: [
    "products",
    "product_items",
    "product_entitlements",
    "live_sessions",
    "live_attendance",
    "integrations",
    "integration_deliveries",
  ],
  schools,
  courseScopes,
}, null, 2));
