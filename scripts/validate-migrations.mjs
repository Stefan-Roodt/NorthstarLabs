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
const cognizenAcademy = database.prepare(`
  SELECT s.id,s.name,s.slug,c.name AS communityName
  FROM schools s
  LEFT JOIN communities c ON c.school_id=s.id
  WHERE s.slug='cognizen-consulting'
`).get();
const stefanAcademy = database.prepare(`
  SELECT s.id,s.name,s.slug,c.name AS communityName,
    sm.role AS ownerRole
  FROM schools s
  LEFT JOIN communities c ON c.school_id=s.id
  LEFT JOIN school_members sm ON sm.school_id=s.id
    AND sm.user_id=s.owner_id AND sm.status='active'
  WHERE s.slug='stefan-roodt-s-academy'
`).get();
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
const stefanBitcoinCourse = database.prepare(`
  SELECT c.id,c.status,c.owner_id AS ownerId,c.school_id AS schoolId,
    COUNT(DISTINCT cs.id) AS sections,COUNT(DISTINCT l.id) AS lessons,
    COUNT(DISTINCT q.id) AS quizzes
  FROM courses c
  LEFT JOIN course_sections cs ON cs.course_id=c.id
  LEFT JOIN lessons l ON l.course_id=c.id
  LEFT JOIN quizzes q ON q.lesson_id=l.id
  WHERE c.id='stefan-bitcoin-genesis-next-era'
  GROUP BY c.id
`).get();
const aiCommandCourse = database.prepare(`
  SELECT c.id,c.status,c.owner_id AS ownerId,c.school_id AS schoolId,
    COUNT(DISTINCT cs.id) AS sections,COUNT(DISTINCT l.id) AS lessons,
    COUNT(DISTINCT q.id) AS quizzes
  FROM courses c
  LEFT JOIN course_sections cs ON cs.course_id=c.id
  LEFT JOIN lessons l ON l.course_id=c.id
  LEFT JOIN quizzes q ON q.lesson_id=l.id
  WHERE c.id='northstar-ai-command-studio'
  GROUP BY c.id
`).get();

if (!tables.some((table) => table.name === "schools")) {
  throw new Error("The schools table was not created.");
}
if (!cognizenAcademy ||
    cognizenAcademy.name !== "CogniZen Consulting" ||
    (cognizenAcademy.communityName !== null &&
      cognizenAcademy.communityName !== "CogniZen Consulting Community")) {
  throw new Error("CogniZen Consulting did not retain its own academy identity.");
}
if (!stefanAcademy ||
    stefanAcademy.name !== "Stéfan Roodt's Academy" ||
    stefanAcademy.communityName !== "Stéfan Roodt's Academy Community" ||
    stefanAcademy.ownerRole !== "owner") {
  throw new Error("Stéfan Roodt's Academy was not restored as a separate academy.");
}
if (!stefanWeb3Course ||
    stefanWeb3Course.status !== "published" ||
    stefanWeb3Course.ownerId !== "northstar-web3-faculty" ||
    stefanWeb3Course.schoolId !== "northstarlabs" ||
    stefanWeb3Course.sections !== 6 ||
    stefanWeb3Course.lessons !== 24 ||
    stefanWeb3Course.quizzes !== 6) {
  throw new Error("The Web3 signature course did not migrate with its complete curriculum.");
}
if (!stefanBitcoinCourse ||
    stefanBitcoinCourse.status !== "published" ||
    stefanBitcoinCourse.ownerId !== "northstar-bitcoin-faculty" ||
    stefanBitcoinCourse.schoolId !== "northstarlabs" ||
    stefanBitcoinCourse.sections !== 7 ||
    stefanBitcoinCourse.lessons !== 35 ||
    stefanBitcoinCourse.quizzes !== 7) {
  throw new Error("The Bitcoin signature course did not migrate with its complete curriculum.");
}
if (!aiCommandCourse ||
    aiCommandCourse.status !== "published" ||
    aiCommandCourse.ownerId !== "northstar-ai-faculty" ||
    aiCommandCourse.schoolId !== "northstarlabs" ||
    aiCommandCourse.sections !== 4 ||
    aiCommandCourse.lessons !== 12 ||
    aiCommandCourse.quizzes !== 4) {
  throw new Error("The AI Command Studio course did not migrate with its complete curriculum.");
}
if (!tables.some((table) => table.name === "school_members")) {
  throw new Error("The school_members table was not created.");
}
if (!tables.some((table) => table.name === "invitations")) {
  throw new Error("The invitations table was not created.");
}
const facultyMedia = database.prepare(
  "SELECT COUNT(*) AS count FROM media_assets WHERE key LIKE 'static:/media/faculty/%'",
).get();
if (facultyMedia.count < 10) {
  throw new Error("The playable programme introductions and opening premium modules were not registered.");
}
const facultyProfiles = database.prepare(
  "SELECT COUNT(*) AS count FROM tutors WHERE school_id='northstarlabs' AND service_type='faculty' AND status='published'",
).get();
if (facultyProfiles.count !== 3) {
  throw new Error("The NorthstarLabs faculty profiles were not published.");
}
const attachedFacultyMedia = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE primary_asset_id IN ('faculty-media-ai-intro','faculty-media-bitcoin-intro','faculty-media-web3-intro')
     AND course_id IN ('northstar-ai-command-studio','stefan-bitcoin-genesis-next-era','stefan-web3-foundations')
     AND lesson_type='video' AND required_watch_percent=85`,
).get();
if (attachedFacultyMedia.count !== 3) {
  throw new Error("The playable faculty videos were not attached to their lessons.");
}
const premiumModuleOne = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND id IN ('cmf-module-1-1-lesson-01','cmf-module-1-1-lesson-02','cmf-module-1-1-lesson-03')
     AND lesson_type='video' AND required_watch_percent=75
     AND primary_asset_id IS NOT NULL AND transcript IS NOT NULL`,
).get();
if (premiumModuleOne.count !== 3) {
  throw new Error("Crypto Mastery Module 1.1 was not upgraded to narrated premium lessons.");
}
const premiumModuleTwo = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND id IN ('cmf-module-1-2-lesson-01','cmf-module-1-2-lesson-02','cmf-module-1-2-lesson-03')
     AND lesson_type='video' AND required_watch_percent=75
     AND primary_asset_id IS NOT NULL AND transcript IS NOT NULL`,
).get();
if (premiumModuleTwo.count !== 3) {
  throw new Error("Crypto Mastery Module 1.2 was not upgraded to narrated premium lessons.");
}
const premiumModuleThree = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND id IN ('cmf-module-1-3-lesson-01','cmf-module-1-3-lesson-02','cmf-module-1-3-lesson-03')
     AND lesson_type='video' AND required_watch_percent=75
     AND primary_asset_id IS NOT NULL AND transcript IS NOT NULL`,
).get();
if (premiumModuleThree.count !== 3) {
  throw new Error("Crypto Mastery Module 1.3 was not upgraded to narrated premium lessons.");
}
const premiumModuleFour = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND id IN ('cmf-module-1-4-lesson-01','cmf-module-1-4-lesson-02','cmf-module-1-4-lesson-03')
     AND lesson_type='video' AND required_watch_percent=75
     AND primary_asset_id IS NOT NULL AND transcript IS NOT NULL`,
).get();
if (premiumModuleFour.count !== 3) {
  throw new Error("Crypto Mastery Module 1.4 was not upgraded to narrated premium lessons.");
}
const premiumModuleFive = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND id IN ('cmf-module-1-5-lesson-01','cmf-module-1-5-lesson-02','cmf-module-1-5-lesson-03')
     AND lesson_type='video' AND required_watch_percent=75
     AND primary_asset_id IS NOT NULL AND transcript IS NOT NULL`,
).get();
if (premiumModuleFive.count !== 3) {
  throw new Error("Crypto Mastery Module 1.5 was not upgraded to narrated premium lessons.");
}
const premiumModuleSix = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND id IN ('cmf-module-1-6-lesson-01','cmf-module-1-6-lesson-02','cmf-module-1-6-lesson-03')
     AND lesson_type='video' AND required_watch_percent=75
     AND primary_asset_id IS NOT NULL AND transcript IS NOT NULL`,
).get();
if (premiumModuleSix.count !== 3) {
  throw new Error("Crypto Mastery Module 1.6 was not upgraded to narrated premium lessons.");
}
const premiumModuleSeven = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND id IN ('cmf-module-1-7-lesson-01','cmf-module-1-7-lesson-02','cmf-module-1-7-lesson-03')
     AND lesson_type='video' AND required_watch_percent=75
     AND primary_asset_id IS NOT NULL AND transcript IS NOT NULL`,
).get();
if (premiumModuleSeven.count !== 3) {
  throw new Error("Crypto Mastery Module 1.7 was not upgraded to narrated premium lessons.");
}
const premiumModuleEight = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND id IN ('cmf-module-1-8-lesson-01','cmf-module-1-8-lesson-02','cmf-module-1-8-lesson-03')
     AND lesson_type='video' AND required_watch_percent=75
     AND primary_asset_id IS NOT NULL AND transcript IS NOT NULL`,
).get();
if (premiumModuleEight.count !== 3) {
  throw new Error("Crypto Mastery Module 1.8 was not upgraded to narrated premium lessons.");
}
const premiumModuleNine = database.prepare(
  `SELECT COUNT(*) AS count FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND id IN ('cmf-module-1-9-lesson-01','cmf-module-1-9-lesson-02','cmf-module-1-9-lesson-03')
     AND lesson_type='video' AND required_watch_percent=75
     AND primary_asset_id IS NOT NULL AND transcript IS NOT NULL`,
).get();
if (premiumModuleNine.count !== 3) {
  throw new Error("Crypto Mastery Module 1.9 was not upgraded to narrated premium lessons.");
}
const cryptoMasteryProgramme = database.prepare(
  `SELECT title,description FROM courses
   WHERE id='cognizen-crypto-mastery-foundations-production'`,
).get();
const cryptoMasterySequence = database.prepare(
  `SELECT id,position FROM course_sections
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
   ORDER BY position,id`,
).all();
const expectedCryptoMasterySequence = [
  ["cmf-start-here", 0],
  ["cmf-module-1-1", 1],
  ["cmf-module-1-31", 31],
  ["cmf-module-2-01", 32],
  ["cmf-module-2-31", 62],
  ["cmf-module-3-00", 63],
  ["cmf-module-3-01", 64],
  ["cmf-module-3-31", 94],
];
if (
  cryptoMasteryProgramme?.title !==
    "Crypto Mastery: Digital Assets — Complete Programme" ||
  !cryptoMasteryProgramme.description.includes("three-part")
) {
  throw new Error("Crypto Mastery does not identify itself as the complete three-part programme.");
}
for (const [id, position] of expectedCryptoMasterySequence) {
  const section = cryptoMasterySequence.find((item) => item.id === id);
  if (!section || section.position !== position) {
    throw new Error(`Crypto Mastery section ${id} is not in programme order.`);
  }
}
if (cryptoMasterySequence.some((section, index) =>
  index > 0 && section.position <= cryptoMasterySequence[index - 1].position
)) {
  throw new Error("Crypto Mastery contains duplicate or reversed section positions.");
}
const cryptoMasteryLessonProfiles = database.prepare(
  `SELECT lesson_type AS lessonType,COUNT(*) AS count
   FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
   GROUP BY lesson_type`,
).all();
const cryptoMasteryProfileCount = (lessonType) =>
  cryptoMasteryLessonProfiles.find((item) => item.lessonType === lessonType)?.count || 0;
if (
  cryptoMasteryProfileCount("video") !== 39 ||
  cryptoMasteryProfileCount("interactive") !== 57 ||
  cryptoMasteryProfileCount("quiz") !== 32
) {
  throw new Error("Crypto Mastery does not preserve the intended dedicated-video, interactive and quiz lesson mix.");
}
const cryptoMasteryPlaceholderLessons = database.prepare(
  `SELECT COUNT(*) AS count
   FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND primary_asset_id IN (
       'cmf-module-1-fallback-premium-track',
       'cmf-module-remaining-parity-fallback-video',
       'cmf-module-2-premium-track',
       'cmf-module-3-premium-track'
     )`,
).get();
if (cryptoMasteryPlaceholderLessons.count !== 0) {
  throw new Error("Crypto Mastery still presents recycled parity media as lesson-specific teaching.");
}
const cryptoMasteryOutcomeGaps = database.prepare(
  `SELECT COUNT(*) AS count
   FROM lessons
   WHERE course_id='cognizen-crypto-mastery-foundations-production'
     AND LOWER(content) NOT LIKE '%## your outcome%'
     AND LOWER(content) NOT LIKE '%## learning outcome%'
     AND LOWER(content) NOT LIKE '%## outcome%'`,
).get();
if (cryptoMasteryOutcomeGaps.count !== 0) {
  throw new Error("At least one Crypto Mastery lesson is missing a learner outcome.");
}
for (const table of ["course_sections", "media_assets", "lesson_resources"]) {
  if (!tables.some((item) => item.name === table)) {
    throw new Error(`The ${table} course-authoring table was not created.`);
  }
}
for (const table of [
  "creator_studio_projects",
  "creator_studio_sources",
  "creator_studio_generations",
]) {
  if (!tables.some((item) => item.name === table)) {
    throw new Error(`The ${table} governed-creation table was not created.`);
  }
}
if (!tables.some((item) => item.name === "school_slug_aliases")) {
  throw new Error("The school_slug_aliases professional-address table was not created.");
}
for (const table of [
  "rate_limit_buckets",
  "system_events",
  "backup_runs",
  "content_reports",
  "data_requests",
  "learning_requests",
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
  "payment_orders",
  "payment_events",
]) {
  if (!tables.some((item) => item.name === table)) {
    throw new Error(`The ${table} product-growth table was not created.`);
  }
}
if (!tables.some((item) => item.name === "quiz_attempts")) {
  throw new Error("The quiz_attempts assessment table was not created.");
}
const quizQuestionColumns = database.prepare(
  "PRAGMA table_info(quiz_questions)",
).all();
if (!quizQuestionColumns.some((item) => item.name === "explanation")) {
  throw new Error("The quiz_questions.explanation feedback column was not created.");
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
  creatorStudioTables: [
    "creator_studio_projects",
    "creator_studio_sources",
    "creator_studio_generations",
  ],
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
