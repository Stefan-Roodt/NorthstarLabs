import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("defines NorthstarLabs production metadata", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /NorthstarLabs — Learn\. Ask\. Progress\./);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /og-value\.png/);
  assert.match(layout, /summary_large_image/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project/);
});

test("publishes complete terms and privacy pages", async () => {
  const [terms, privacy] = await Promise.all([
    readFile(new URL("../app/legal/terms/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/privacy/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(terms, /Terms of Service/);
  assert.match(terms, /Creator responsibilities/);
  assert.match(privacy, /Privacy Policy/);
  assert.match(privacy, /Creators and learner data/);
});

test("adds browser security headers to every response", async () => {
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(worker, /frame-ancestors 'none'/);
  assert.match(worker, /x-content-type-options/);
  assert.match(worker, /x-frame-options/);
  assert.match(worker, /strict-origin-when-cross-origin/);
  assert.match(worker, /max-age=31536000/);
  assert.match(worker, /private, no-store/);
});

test("prevents cross-school lesson edits and external sign-in redirects", async () => {
  const [lessons, schoolAccess, login] = await Promise.all([
    readFile(new URL("../app/api/lessons/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/school-access.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(lessons, /requireCourseStaffAccess\(user\.id,\s*body\.courseId\)/);
  assert.match(schoolAccess, /sm\.role IN \('owner','admin','instructor'\)/);
  assert.match(schoolAccess, /JOIN school_members sm ON sm\.school_id=c\.school_id/);
  assert.doesNotMatch(lessons, /ON CONFLICT\(id\) DO UPDATE/);
  assert.match(login, /safeDestination/);
  assert.match(login, /value\?\.startsWith\("\/"\)/);
  assert.match(login, /value\.startsWith\("\/\/"\)/);
});

test("isolates creator schools, memberships, courses, and communities", async () => {
  const [schema, migration, profile, welcome, community] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0006_conscious_talisman.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/welcome/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/community-access.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const schools/);
  assert.match(schema, /export const schoolMembers/);
  assert.match(schema, /schoolId: text\("school_id"\)/);
  assert.match(migration, /CREATE TABLE `schools`/);
  assert.match(migration, /CREATE TABLE `school_members`/);
  assert.match(migration, /ALTER TABLE `courses` ADD `school_id`/);
  assert.match(migration, /ALTER TABLE `communities` ADD `school_id`/);
  assert.match(profile, /createCreatorSchool/);
  assert.match(welcome, /Name your academy/);
  assert.match(welcome, /role: "creator"/);
  assert.match(community, /FROM communities WHERE school_id=\?/);
  assert.doesNotMatch(community, /northstar-circle/);
});

test("ships a real starter catalogue without placeholder proof", async () => {
  const [home, catalog, courseData, migration, collectionMigration] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/starter-courses.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0005_starter_course_catalog.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0017_free_course_collection.sql", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(home, /href="#"/);
  assert.doesNotMatch(home, /32k\+|\$1\.4B|96M|4\.8\/5|Avery Lin|21% less/);
  assert.match(home, /THE PRODUCT, IN PLAIN ENGLISH/);
  assert.match(home, /One place to find what to learn, who can help, and what to do next/);
  assert.match(home, /Frequently asked questions/i);
  assert.match(catalog, /NORTHSTARLABS ORIGINALS/);
  assert.match(courseData, /Launch Your First Online Course/);
  assert.match(courseData, /Price Your Expertise/);
  assert.match(courseData, /Build a Learning Community/);
  assert.match(courseData, /Design Lessons People Remember/);
  assert.match(courseData, /Build a Trusted Tutoring Practice/);
  assert.match(courseData, /Teach With AI Responsibly/);
  assert.match(migration, /launch-your-first-online-course/);
  assert.match(migration, /starter-community-06/);
  assert.match(collectionMigration, /remember-course-quiz/);
  assert.match(collectionMigration, /tutor-practice-course-quiz/);
  assert.match(collectionMigration, /responsible-ai-course-quiz/);
  assert.match(collectionMigration, /CAST Universal Design for Learning Guidelines/);
  assert.match(collectionMigration, /NSPCC safeguarding guidance for tutors/);
  assert.match(collectionMigration, /UNESCO AI Competency Framework for Teachers/);
});

test("ships Stefan's source-grounded Web3 course production draft", async () => {
  const migration = await readFile(
    new URL("../drizzle/0018_stefan_web3_foundations.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /Web3 Foundations: From Blocks to Builders/);
  assert.match(migration, /WHERE s\.slug='stefan-roodt-s-academy'/);
  assert.match(migration, /'draft'/);
  assert.match(migration, /'video'/);
  assert.match(migration, /required_watch_percent/);
  assert.match(migration, /Capstone: pitch, architecture, and threat model/);
  assert.match(migration, /Final assessment: think like a Web3 builder/);
  assert.match(migration, /https:\/\/ethereum\.org\/web3\//);
  assert.match(migration, /https:\/\/bitcoin\.org\/bitcoin\.pdf/);
  assert.match(migration, /https:\/\/eips\.ethereum\.org\/EIPS\/eip-20/);
  assert.match(migration, /https:\/\/docs\.ipfs\.tech\/concepts\/what-is-ipfs\//);
  assert.match(migration, /https:\/\/www\.w3\.org\/TR\/vc-data-model\//);
  assert.match(migration, /Never share a recovery phrase or private key/);
  assert.doesNotMatch(migration, /buy this token|guaranteed profit|risk-free return/i);
});

test("ships Stefan's evidence-led Bitcoin history and futures course", async () => {
  const migration = await readFile(
    new URL("../drizzle/0019_stefan_bitcoin_deep_dive.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /Bitcoin: From Genesis to the Next Era/);
  assert.match(migration, /WHERE s\.slug='stefan-roodt-s-academy'/);
  assert.match(migration, /'draft'/);
  assert.match(migration, /The cypherpunk lineage/);
  assert.match(migration, /Transactions are UTXOs/);
  assert.match(migration, /The 21 million schedule/);
  assert.match(migration, /From SegWit to Taproot/);
  assert.match(migration, /Four credible Bitcoin futures/);
  assert.match(migration, /Bitcoin 2036 board briefing/);
  assert.match(migration, /https:\/\/bitcoin\.org\/bitcoin\.pdf/);
  assert.match(migration, /https:\/\/bitcoincore\.org\/en\/releases\/31\.0\//);
  assert.match(migration, /https:\/\/github\.com\/lightning\/bolts/);
  assert.match(migration, /https:\/\/ccaf\.io\/cbnsi\/cbeci\/methodology/);
  assert.match(migration, /not investment, legal, or tax advice/i);
  assert.doesNotMatch(migration, /guaranteed profit|risk-free return|price will reach/i);
});

test("guides new members into creating or learning with a low-friction join flow", async () => {
  const [home, login, welcome, course] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/welcome/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(home, /Three clear steps\. No blank dashboard/);
  assert.match(home, /Build my academy free/);
  assert.match(login, /No payment details/);
  assert.match(login, /emailRedirectTo: new URL\(destination/);
  assert.match(welcome, /Build my first course/);
  assert.match(welcome, /Start a practical free course/);
  assert.match(course, /enrol=1/);
  assert.match(course, /Joining your course/);
});

test("persists onboarding and supports secure invitations for new or existing accounts", async () => {
  const [schema, migration, helper, invitationApi, acceptApi, invitePage, learners, profile, login] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0007_nappy_tyrannus.sql", import.meta.url), "utf8"),
    readFile(new URL("../lib/invitations.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/invitations/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/invitations/[token]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/invite/[token]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/learners/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /onboardingPath: text\("onboarding_path"\)/);
  assert.match(schema, /export const invitations/);
  assert.match(migration, /CREATE TABLE `invitations`/);
  assert.match(migration, /`token_hash` text NOT NULL/);
  assert.doesNotMatch(migration, /`token` text/);
  assert.match(helper, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(invitationApi, /INVITATION_LIFETIME_MS/);
  assert.match(invitationApi, /status='revoked'/);
  assert.match(acceptApi, /user\.email\.toLowerCase\(\) !== invitation\.email\.toLowerCase\(\)/);
  assert.match(acceptApi, /ON CONFLICT\(user_id,course_id\)/);
  assert.match(invitePage, /Create account and accept/);
  assert.match(invitePage, /Your invitation is kept while you join/);
  assert.match(learners, /Pending invitations/);
  assert.match(learners, /Copy link/);
  assert.match(profile, /onboarding_completed=1/);
  assert.match(login, /onboarding_path/);
  assert.match(login, /searchParams\.get\("mode"\)/);
});

test("ships a structured course editor, reusable media library, and safe learner rendering", async () => {
  const [schema, migration, builder, lessonsApi, uploadsApi, courseApi, learnApi, learner, renderer] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0008_rainy_molten_man.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/lessons/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/uploads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/courses/[courseId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/learn/[courseId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/lesson-content.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const courseSections/);
  assert.match(schema, /export const mediaAssets/);
  assert.match(schema, /export const lessonResources/);
  assert.match(migration, /CREATE TABLE `course_sections`/);
  assert.match(migration, /CREATE TABLE `media_assets`/);
  assert.match(migration, /INSERT INTO `course_sections`/);
  assert.match(migration, /UPDATE `lessons`[\s\S]+`section_id`/);
  assert.match(lessonsApi, /requireCourseStaffAccess\(user\.id, body\.courseId\)/);
  assert.match(lessonsApi, /media_assets WHERE id=\? AND school_id=\?/);
  assert.match(lessonsApi, /DELETE FROM lesson_resources WHERE lesson_id=\?/);
  assert.match(uploadsApi, /await env\.UPLOADS\.put/);
  assert.match(uploadsApi, /INSERT INTO media_assets/);
  assert.match(uploadsApi, /Remove this file from its lessons before deleting it/);
  assert.match(courseApi, /publishing checklist first/i);
  assert.match(courseApi, /Finish every lesson title and add content or media/);
  assert.match(builder, /Autosave pending/);
  assert.match(builder, /Academy media library/);
  assert.match(builder, /draggable/);
  assert.match(builder, /Learner preview/);
  assert.match(builder, /Upload files/);
  assert.match(learnApi, /lesson_resources/);
  assert.match(learner, /LessonContent/);
  assert.match(learner, /Files to keep and use/);
  assert.match(learner, /Creator preview · progress is disabled/);
  assert.doesNotMatch(renderer, /dangerouslySetInnerHTML/);
});

test("streams protected lesson media with short-lived grants and byte ranges", async () => {
  const [schema, migration, playback, stream, learnApi, learner, helper] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0009_high_giant_man.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/media/playback/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/media/stream/[token]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/learn/[courseId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/media-stream.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const mediaPlaybackGrants/);
  assert.match(migration, /CREATE TABLE `media_playback_grants`/);
  assert.match(migration, /`token_hash` text PRIMARY KEY NOT NULL/);
  assert.match(playback, /requireApiUser/);
  assert.match(playback, /e\.status='active'/);
  assert.match(playback, /sm\.role IN \('owner','admin','instructor'\)/);
  assert.match(playback, /hashPlaybackToken/);
  assert.match(playback, /INSERT INTO media_playback_grants/);
  assert.match(stream, /g\.expires_at>\?/);
  assert.match(stream, /env\.UPLOADS\.head/);
  assert.match(stream, /range: \{ offset: range\.start, length: range\.length \}/);
  assert.match(stream, /content-range/);
  assert.match(stream, /accept-ranges/);
  assert.match(helper, /PLAYBACK_GRANT_TTL_MS/);
  assert.match(helper, /header\.includes\(","\)/);
  assert.match(learnApi, /"r2:protected"/);
  assert.match(learnApi, /key: learnerMediaKey\(lesson\.primaryKey\)/);
  assert.match(learner, /\/api\/media\/playback/);
  assert.match(learner, /controlsList="nodownload"/);
  assert.doesNotMatch(learner, /\/api\/uploads\?key=\$\{encodeURIComponent\(asset\.key\)\}/);
});

test("enforces learner controls, saves assessment history, and issues verifiable PDFs", async () => {
  const [schema, migration, controls, progress, quiz, state, learnApi, learner, builder, certificateApi, pdfRoute] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0010_numerous_lady_ursula.sql", import.meta.url), "utf8"),
    readFile(new URL("../lib/learner-controls.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/progress/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/quizzes/[lessonId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/learner-state/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/learn/[courseId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/certificates/[code]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/certificates/[code]/pdf/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const quizAttempts/);
  assert.match(schema, /requiredWatchPercent/);
  assert.match(schema, /certificateValidDays/);
  assert.match(migration, /CREATE TABLE `quiz_attempts`/);
  assert.match(migration, /ALTER TABLE `lesson_progress` ADD `notes`/);
  assert.match(migration, /CREATE UNIQUE INDEX `certificates_code_unique`/);
  assert.match(controls, /Complete the earlier lessons first/);
  assert.match(controls, /availableAfterDays/);
  assert.match(progress, /Watch at least/);
  assert.match(quiz, /INSERT INTO quiz_attempts/);
  assert.match(quiz, /attemptsRemaining/);
  assert.match(state, /watched_percent=MAX/);
  assert.match(learnApi, /quiz_attempts/);
  assert.match(learnApi, /lockReason/);
  assert.match(learner, /Search this course/);
  assert.match(learner, /Private notes/);
  assert.match(learner, /Read captions \/ transcript/);
  assert.match(builder, /Require lessons in order/);
  assert.match(builder, /Maximum attempts/);
  assert.match(builder, /PDF CERTIFICATE/);
  assert.match(certificateApi, /status='replaced'/);
  assert.match(pdfRoute, /application\/pdf/);

  const { createCertificatePdf } = await import("../lib/certificate-pdf.ts");
  const pdf = createCertificatePdf({
    certificateTitle: "Certificate of Completion",
    learnerName: "Ada Learner",
    courseTitle: "Practical Course Design",
    issuerName: "NorthStarLabs",
    code: "NSL-TEST123",
    issuedAt: Date.UTC(2026, 6, 19),
    expiresAt: null,
    accentColor: "#3556d8",
    verificationUrl: "https://northstarlabs.co.za/certificates/NSL-TEST123",
  });
  assert.equal(new TextDecoder().decode(pdf.slice(0, 8)), "%PDF-1.4");
  assert.ok(pdf.byteLength > 1_000);
});

test("publishes branded school storefronts and routes communities by academy", async () => {
  const [schema, migration, schoolApi, editor, storefront, community, learner, metadata] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0011_mean_clint_barton.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/schools/[slug]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/academy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/community/community-view.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /coverImageUrl: text\("cover_image_url"\)/);
  assert.match(schema, /showCommunity: integer\("show_community"/);
  assert.match(migration, /ALTER TABLE `schools` ADD `accent_color`/);
  assert.match(migration, /ALTER TABLE `schools` ADD `seo_description`/);
  assert.match(schoolApi, /Owner or admin access required/);
  assert.match(schoolApi, /UPDATE schools SET/);
  assert.match(editor, /Save and publish storefront/);
  assert.match(editor, /Storefront saved and live/);
  assert.match(storefront, /PRIVATE LEARNING COMMUNITY/);
  assert.match(storefront, /school\.termsUrl \|\| "\/legal\/terms"/);
  assert.match(community, /schoolId=/);
  assert.match(community, /\/schools\/\$\{data\.school\.slug\}/);
  assert.match(learner, /school\?\.showCommunity/);
  assert.match(metadata, /generateMetadata/);
});

test("queues transactional email and ships reporting plus secured administration", async () => {
  const [schema, migration, email, invitations, enrollment, progress, reporting, analytics, operations, platform, admin, auth, preferences] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0012_sudden_baron_strucker.sql", import.meta.url), "utf8"),
    readFile(new URL("../lib/email-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/invitations/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/enrollments/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/progress/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/reporting.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/analytics/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/operations/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/platform/overview/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/server-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/notifications/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const emailMessages/);
  assert.match(schema, /export const reportSchedules/);
  assert.match(schema, /export const auditLogs/);
  assert.match(migration, /CREATE TABLE `email_messages`/);
  assert.match(migration, /CREATE TABLE `report_schedules`/);
  assert.match(migration, /ALTER TABLE `profiles` ADD `status`/);
  assert.match(email, /https:\/\/api\.resend\.com\/emails/);
  assert.match(email, /idempotency-key/);
  assert.match(email, /configuration_required/);
  assert.match(invitations, /templateKey: "invitation"/);
  assert.match(enrollment, /queueEnrollmentEmail/);
  assert.match(progress, /queueCertificateEmail/);
  assert.match(reporting, /quiz_attempts/);
  assert.match(reporting, /email_messages/);
  assert.match(analytics, /Export CSV/);
  assert.match(analytics, /Assessment attempts/);
  assert.match(operations, /scheduled summary/i);
  assert.match(operations, /Every platform email/);
  assert.match(platform, /requirePlatformAdmin/);
  assert.match(platform, /You cannot suspend your own administrator account/);
  assert.match(admin, /PLATFORM ADMIN/);
  assert.match(auth, /access\?\.status === "suspended"/);
  assert.match(auth, /access\?\.deletionPending/);
  assert.match(preferences, /notification_preferences/);
});

test("hardens production with rate limits, monitoring, backups, safe deletion, and journey tests", async () => {
  const [schema, migration, worker, security, uploads, backup, reliability, health, account, courseDelete, reports, admin, journeys] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0013_crazy_reaper.sql", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/security.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/uploads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/platform-backup.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/platform/reliability/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/health/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/account/data/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/course-deletion.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/community/reports/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("./journey-e2e.test.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const rateLimitBuckets/);
  assert.match(schema, /export const systemEvents/);
  assert.match(schema, /export const backupRuns/);
  assert.match(schema, /export const contentReports/);
  assert.match(schema, /export const dataRequests/);
  assert.match(migration, /CREATE TABLE `rate_limit_buckets`/);
  assert.match(migration, /CREATE TABLE `system_events`/);
  assert.match(migration, /CREATE TABLE `backup_runs`/);
  assert.match(migration, /CREATE UNIQUE INDEX `profiles_email_unique`/);
  assert.match(worker, /consumeRateLimit/);
  assert.match(worker, /http\.unhandled_exception/);
  assert.match(worker, /x-request-id/);
  assert.match(worker, /cross-origin-opener-policy/);
  assert.match(security, /Too many requests/);
  assert.match(security, /uploads.*limit: 20/s);
  assert.match(uploads, /SCHOOL_STORAGE_QUOTA_BYTES/);
  assert.match(uploads, /academy storage quota/);
  assert.match(backup, /northstarlabs-d1-backup/);
  assert.match(backup, /checksum verification failed/);
  assert.match(reliability, /createPlatformBackup/);
  assert.match(reliability, /hide_reported_post/);
  assert.match(health, /recentBackup/);
  assert.match(account, /northstarlabs-personal-data-export/);
  assert.match(account, /auth\.admin\.deleteUser/);
  assert.match(courseDelete, /DELETE FROM quiz_attempts/);
  assert.match(courseDelete, /media\.cleanup_failed/);
  assert.match(reports, /already reported this post/);
  assert.match(admin, /Production reliability/);
  assert.match(admin, /Moderation queue/);
  assert.match(journeys, /creator-to-learner production journey/);
  assert.match(journeys, /safe course deletion/);
});

test("ships bundles, memberships, live learning, mobile installation, and integrations", async () => {
  const [
    schema,
    migration,
    productsApi,
    grantsApi,
    access,
    liveApi,
    calendar,
    integrationsApi,
    integrations,
    productStudio,
    liveStudio,
    learnerLive,
    manifest,
    serviceWorker,
    storefront,
  ] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0014_hot_mauler.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/products/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/products/grants/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/product-access.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/live-sessions/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/live-sessions/[sessionId]/calendar/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/integrations/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/integrations.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/products/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/live/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/live/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/page.tsx", import.meta.url), "utf8"),
  ]);
  for (const table of [
    "products",
    "productItems",
    "productEntitlements",
    "liveSessions",
    "liveAttendance",
    "integrations",
    "integrationDeliveries",
  ]) {
    assert.match(schema, new RegExp(`export const ${table}`));
  }
  assert.match(migration, /CREATE TABLE `products`/);
  assert.match(migration, /CREATE TABLE `product_entitlements`/);
  assert.match(migration, /CREATE TABLE `live_sessions`/);
  assert.match(migration, /CREATE TABLE `integrations`/);
  assert.match(migration, /ALTER TABLE `enrollments` ADD `access_source`/);
  assert.match(productsApi, /productTypes.*bundle.*membership.*live_program/s);
  assert.match(productsApi, /product\.publish/);
  assert.match(grantsApi, /activateProductAccess/);
  assert.match(grantsApi, /revokeProductAccess/);
  assert.match(access, /access_source_id/);
  assert.match(access, /status='paused'/);
  assert.match(liveApi, /live_session\.created/);
  assert.match(liveApi, /attendance_minutes/);
  assert.match(calendar, /BEGIN:VCALENDAR/);
  assert.match(calendar, /live_attendance/);
  assert.match(calendar, /la\.id IS NOT NULL OR sm\.id IS NOT NULL/);
  assert.match(integrationsApi, /public HTTPS webhook endpoint/);
  assert.match(integrations, /HMAC/);
  assert.match(integrations, /x-northstar-signature/);
  assert.match(productStudio, /Create a product/);
  assert.match(productStudio, /Grant product access/);
  assert.match(liveStudio, /Schedule a session/);
  assert.match(liveStudio, /Attendance register/);
  assert.match(learnerLive, /Reserve my place/);
  assert.match(manifest, /display: "standalone"/);
  assert.match(serviceWorker, /northstarlabs-shell-v1/);
  assert.match(serviceWorker, /request\.mode === "navigate"/);
  assert.match(storefront, /Join free/);
  assert.match(storefront, /PROGRAMMES & MEMBERSHIPS/);
});

test("guides creators, learners, and academy visitors to their next useful action", async () => {
  const [dashboard, learnerHome, storefront, styles] = await Promise.all([
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  assert.match(dashboard, /YOUR LAUNCH PATH/);
  assert.match(dashboard, /launchProgress/);
  assert.match(dashboard, /Invite learners/);
  assert.match(learnerHome, /JUMP BACK IN/);
  assert.match(learnerHome, /Welcome back/);
  assert.match(learnerHome, /Progress worth keeping/);
  assert.match(storefront, /How do you learn best/);
  assert.match(storefront, /What happens after you join/);
  assert.match(storefront, /BEST FOR/);
  assert.match(styles, /\.school-mobile-join/);
});

test("ships academy tutor discovery, direct contact, and protected enquiries", async () => {
  const [
    schema,
    migration,
    bookingMigration,
    tutorsApi,
    inquiriesApi,
    slotsApi,
    tutorDirectory,
    tutorProfile,
    tutorAdmin,
    tutoring,
    marketplace,
    learnerHome,
    storefront,
    email,
  ] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0015_special_kang.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0016_violet_bucky.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/tutors/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/tutor-inquiries/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/tutor-slots/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/tutors/[tutorSlug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tutoring/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/email-service.ts", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const tutors/);
  assert.match(schema, /export const tutorInquiries/);
  assert.match(schema, /export const tutorSlots/);
  assert.match(migration, /CREATE TABLE `tutors`/);
  assert.match(migration, /CREATE TABLE `tutor_inquiries`/);
  assert.match(bookingMigration, /CREATE TABLE `tutor_slots`/);
  assert.match(bookingMigration, /ALTER TABLE `tutor_inquiries` ADD `slot_id`/);
  assert.match(tutorsApi, /showDirectContact/);
  assert.match(tutorsApi, /Creator access required/);
  assert.match(tutorsApi, /publicTutorMarketplace/);
  assert.match(tutorsApi, /availableSlotCount/);
  assert.match(inquiriesApi, /Sign in to contact a tutor/);
  assert.match(inquiriesApi, /tutor\.inquiry_created/);
  assert.match(inquiriesApi, /learner_cancel/);
  assert.match(slotsApi, /slot\.status !== "open"/);
  assert.match(slotsApi, /overlaps an existing tutor slot/);
  assert.match(tutorDirectory, /Find a tutor who fits how you learn/);
  assert.match(tutorProfile, /Send a private enquiry/);
  assert.match(tutorProfile, /Call tutor/);
  assert.match(tutorProfile, /Request appointment/);
  assert.match(tutorAdmin, /Learner enquiries/);
  assert.match(tutorAdmin, /Bookable appointment times/);
  assert.match(tutoring, /Personal help, without the admin chase/);
  assert.match(tutoring, /Cancel request/);
  assert.match(marketplace, /Find the person who can get you/);
  assert.match(marketplace, /Compare what matters/);
  assert.match(marketplace, /View profile & times/);
  assert.match(learnerHome, /My tutoring/);
  assert.match(storefront, /ONE-TO-ONE SUPPORT/);
  assert.match(email, /tutor_enquiry/);
  assert.match(email, /tutor_booking_update/);
  assert.match(email, /tutor_booking_cancelled/);
});

test("ships coach advertising plans, direct onboarding, hourly rates, and topic discovery", async () => {
  const [migration, plans, welcome, profile, admin, marketplace, home] = await Promise.all([
    readFile(new URL("../drizzle/0020_clammy_sally_floyd.sql", import.meta.url), "utf8"),
    readFile(new URL("../lib/coach-listing-plans.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/welcome/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /ADD `service_type`/);
  assert.match(migration, /ADD `listing_tier`/);
  assert.match(migration, /ADD `listing_monthly_cents`/);
  assert.match(plans, /monthlyCents: 14_900/);
  assert.match(plans, /monthlyCents: 34_900/);
  assert.match(plans, /monthlyCents: 69_900/);
  assert.match(welcome, /I WANT TO COACH/);
  assert.match(welcome, /dashboard\/tutors\?setup=1/);
  assert.match(profile, /body\.role === "coach"/);
  assert.match(admin, /Your hourly rate in rand/);
  assert.match(admin, /Advertising billing is not active yet/);
  assert.match(marketplace, /EXPLORE BY TOPIC/);
  assert.match(marketplace, /setSubject\(canonicalTopic\)/);
  assert.match(marketplace, /scrollIntoView/);
  assert.match(marketplace, /url\.searchParams\.set\("topic", topic\)/);
  assert.match(marketplace, /Your \$\{selectedTopic\} selection worked/);
  assert.match(marketplace, /Offer this topic/);
  assert.match(marketplace, /SPONSORED SPOTLIGHT/);
  assert.match(marketplace, /Verification is assessed separately/);
  assert.match(home, /Create my coach profile/);
});

test("ships independent coach verification and completed-session learner proof", async () => {
  const [migration, credentialsApi, trustApi, reviewApi, inquiriesApi, admin, coachDesk, learnerDesk, publicProfile, tutorHelper, email] = await Promise.all([
    readFile(new URL("../drizzle/0021_nasty_sally_floyd.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/tutor-credentials/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/platform/tutor-trust/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/tutor-reviews/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/tutor-inquiries/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tutoring/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/tutors/[tutorSlug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/tutors.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/email-service.ts", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /CREATE TABLE `tutor_credentials`/);
  assert.match(migration, /CREATE TABLE `tutor_reviews`/);
  assert.match(migration, /tutor_reviews_inquiry_unique/);
  assert.match(credentialsApi, /status<>'withdrawn'/);
  assert.match(credentialsApi, /evidence_url AS evidenceUrl/);
  assert.match(trustApi, /requirePlatformAdmin/);
  assert.match(trustApi, /status='verified'/);
  assert.match(trustApi, /UPDATE tutors SET verified=/);
  assert.match(trustApi, /platform\.tutor_review/);
  assert.match(reviewApi, /inquiry\.status !== "completed"/);
  assert.match(reviewApi, /verifiedSession: true/);
  assert.match(inquiriesApi, /"completed"/);
  assert.match(inquiriesApi, /Confirm the booking before marking the session completed/);
  assert.match(admin, /Coach trust/);
  assert.match(coachDesk, /Profile strength/);
  assert.match(coachDesk, /Submit for verification/);
  assert.match(learnerDesk, /Submit anonymous rating/);
  assert.match(publicProfile, /VERIFIED LEARNER PROOF/);
  assert.match(tutorHelper, /tutorProfileCompleteness/);
  assert.match(email, /tutor_review_request/);
});

test("ships protected two-way ratings after completed coaching sessions", async () => {
  const [migration, learnerRatingsApi, tutorReviewsApi, inquiriesApi, policy, coachDesk, learnerDesk, admin] = await Promise.all([
    readFile(new URL("../drizzle/0022_good_microbe.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/learner-ratings/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/tutor-reviews/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/tutor-inquiries/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/tutor-rating-policy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tutoring/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /CREATE TABLE `learner_session_ratings`/);
  assert.match(migration, /learner_session_ratings_inquiry_unique/);
  assert.match(migration, /`visible_after` integer/);
  assert.match(learnerRatingsApi, /inquiry\.status !== "completed"/);
  assert.match(learnerRatingsApi, /The 14-day rating window/);
  assert.match(learnerRatingsApi, /UPDATE tutor_reviews/);
  assert.match(tutorReviewsApi, /UPDATE learner_session_ratings/);
  assert.match(tutorReviewsApi, /reviewerName: "Verified learner"/);
  assert.match(inquiriesApi, /learnerAverageRating/);
  assert.match(policy, /BLIND_RATING_PERIOD_MS = 7/);
  assert.match(policy, /MINIMUM_LEARNER_RATINGS = 3/);
  assert.match(coachDesk, /Submit private rating/);
  assert.match(learnerDesk, /PRIVATE LEARNER REPUTATION/);
  assert.match(learnerDesk, /seven-day blind period/);
  assert.match(admin, /Private reputation safeguards/);
});

test("makes NorthstarLabs clear, memorable, discoverable, and responsive to unmet demand", async () => {
  const [
    home,
    requestForm,
    requestApi,
    schema,
    migration,
    admin,
    about,
    robots,
    sitemap,
    llms,
    dashboard,
    academy,
    navigator,
    catalogue,
  ] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learning-request-form.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/learning-requests/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0023_sloppy_klaw.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/about/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/academy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/find/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(home, /LEARN/);
  assert.match(home, /GET UNSTUCK/);
  assert.match(home, /TEACH/);
  assert.match(home, /Find my next step/);
  assert.match(home, /Learn\. Ask\. Progress\./);
  assert.match(home, /If we do not have what you need/);
  assert.match(home, /LearningRequestForm/);
  assert.match(requestForm, /Ask Northstar to help/);
  assert.match(requestApi, /INSERT INTO learning_requests/);
  assert.match(requestApi, /learning_request_received/);
  assert.match(schema, /export const learningRequests/);
  assert.match(migration, /CREATE TABLE `learning_requests`/);
  assert.match(migration, /CogniZen Consulting/);
  assert.match(admin, /Requests/);
  assert.match(admin, /Mark matched/);
  assert.match(about, /WHAT NORTHSTARLABS IS/);
  assert.match(about, /Learn\. Ask\. Progress\./);
  assert.match(robots, /OAI-SearchBot/);
  assert.match(robots, /Claude-SearchBot/);
  assert.match(robots, /PerplexityBot/);
  assert.match(sitemap, /FROM courses/);
  assert.match(sitemap, /FROM tutors/);
  assert.match(sitemap, /\/find/);
  assert.match(llms, /NorthstarLabs/);
  assert.match(llms, /Courses for the path/);
  assert.match(dashboard, /workspaceIdentity/);
  assert.match(dashboard, /Edit identity/);
  assert.match(academy, /id="academy-identity"/);
  assert.match(navigator, /Start with the result you want/);
  assert.match(navigator, /Show my best next step/);
  assert.match(navigator, /No credible match/);
  assert.match(navigator, /LearningRequestForm/);
  assert.match(catalogue, /GOAL-MATCHED RESULTS/);
  assert.match(catalogue, /No forced matches/i);
});

test("parses browser byte ranges safely", async () => {
  const { parseByteRange } = await import("../lib/media-stream.ts");
  assert.deepEqual(parseByteRange("bytes=10-19", 100), { start: 10, end: 19, length: 10 });
  assert.deepEqual(parseByteRange("bytes=90-", 100), { start: 90, end: 99, length: 10 });
  assert.deepEqual(parseByteRange("bytes=-8", 100), { start: 92, end: 99, length: 8 });
  assert.deepEqual(parseByteRange("bytes=95-200", 100), { start: 95, end: 99, length: 5 });
  assert.equal(parseByteRange("bytes=100-120", 100), "invalid");
  assert.equal(parseByteRange("bytes=0-1,4-5", 100), "invalid");
  assert.equal(parseByteRange(null, 100), null);
});
