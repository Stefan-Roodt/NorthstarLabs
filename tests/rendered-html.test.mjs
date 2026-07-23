import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("defines NorthstarLabs production metadata", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /NorthstarLabs — Learn\. Ask\. Progress\./);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /og-decision\.png/);
  assert.match(layout, /summary_large_image/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project/);
});

test("self-hosts production fonts without leaking local workspace paths", async () => {
  const [layout, styles] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(layout, /next\/font/);
  assert.doesNotMatch(layout, /DM_Sans|Space_Grotesk|\.variable/);
  assert.match(styles, /url\("\/fonts\/space-grotesk-latin\.woff2"\)/);
  assert.match(styles, /url\("\/fonts\/dm-sans-latin\.woff2"\)/);
  assert.doesNotMatch(styles, /file:\/\/\/|[A-Z]:\/Users\//);
});

test("keeps the public homepage authentication-light until an OAuth callback arrives", async () => {
  const callback = await readFile(new URL("../app/auth-callback-redirect.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(callback, /^import .*supabase-client/m);
  assert.match(callback, /void import\("\.\.\/lib\/supabase-client"\)/);
  assert.match(callback, /if \(!isOAuthReturn\) return/);
  assert.match(callback, /unsubscribe\(\)/);
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
  assert.match(terms, /Freedom Guarantee and academy exports/);
  assert.match(privacy, /Complete academy exports/);
});

test("gives academy owners one operational control centre without payment dependencies", async () => {
  const [page, api, dashboard] = await Promise.all([
    readFile(new URL("../app/dashboard/control/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/control-center/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /Do the right work next/);
  assert.match(page, /Every operational area, without the maze/);
  assert.match(page, /Learners & invitations/);
  assert.match(api, /Academy owner or administrator access is required/);
  assert.match(api, /lesson_help_requests/);
  assert.match(api, /course_import_projects/);
  assert.match(api, /academy_exports/);
  assert.match(api, /status='scheduled' AND ends_at<\?/);
  assert.doesNotMatch(page, /payfast|checkout|payment/i);
  assert.doesNotMatch(api, /payfast|checkout|payment/i);
  assert.match(dashboard, /Control centre/);
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

test("publishes honest Course Truth Cards and secure no-account lesson previews", async () => {
  const [coursePage, previewPage, previewApi, streamApi, courseEditor, schema, migration] = await Promise.all([
    readFile(new URL("../app/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/[courseId]/preview/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/catalog/[courseId]/preview/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/media/stream/[token]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0036_tidy_barracuda.sql", import.meta.url), "utf8"),
  ]);
  assert.match(coursePage, /Before you commit/);
  assert.match(coursePage, /Preview a real lesson - no sign-up/);
  assert.match(previewPage, /TRY THE TEACHING - NO ACCOUNT REQUIRED/);
  assert.match(previewPage, /Test what you understood/);
  assert.match(previewApi, /c\.status='published'/);
  assert.match(previewApi, /l\.is_preview=1/);
  assert.match(streamApi, /g\.user_id='public-preview'/);
  assert.match(streamApi, /l\.is_preview=1/);
  assert.match(courseEditor, /COURSE TRUTH CARD/);
  assert.match(courseEditor, /Mark reviewed today/);
  assert.match(schema, /truthOutcome: text\("truth_outcome"\)/);
  assert.match(migration, /personalised investment advice/);
  assert.match(migration, /SET `is_preview`=1/);
});

test("provides course-grounded lesson help with a human educator escalation path", async () => {
  const [learnerPage, learnerHelp, helpApi, creatorDesk, schema, migration] = await Promise.all([
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/lesson-help.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/lesson-help/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/questions/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0041_glorious_krista_starr.sql", import.meta.url), "utf8"),
  ]);
  assert.match(learnerPage, /ContextualLessonHelp/);
  assert.match(learnerHelp, /Built only from/);
  assert.match(learnerHelp, /Ask a person, not a bot/);
  assert.match(helpApi, /getLessonGate/);
  assert.match(helpApi, /allowedLessons/);
  assert.match(helpApi, /lesson_help\.question_created/);
  assert.doesNotMatch(helpApi, /correct_index AS|correctIndex/);
  assert.match(creatorDesk, /Educator response desk/i);
  assert.match(schema, /export const lessonHelpRequests/);
  assert.match(migration, /CREATE TABLE `lesson_help_requests`/);
});

test("isolates creator schools, memberships, courses, and communities", async () => {
  const [schema, migration, profile, welcome, dashboard, builder, community] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0006_conscious_talisman.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/welcome/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
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
  assert.match(welcome, /dashboard\?welcome=creator&area=courses/);
  assert.match(dashboard, /ACADEMY CREATED/);
  assert.match(dashboard, /Start with a blank course/);
  assert.match(dashboard, /Import my existing material/);
  assert.match(dashboard, /dashboard\/courses\/\$\{course\.id\}\?created=1/);
  assert.match(builder, /PRIVATE COURSE DRAFT/);
  assert.match(builder, /Build this course in three moves/);
  assert.match(builder, /Add my first lesson/);
  assert.match(welcome, /role: "creator"/);
  assert.match(community, /FROM communities WHERE school_id=\?/);
  assert.doesNotMatch(community, /northstar-circle/);
});

test("ships a real signature catalogue without placeholder proof", async () => {
  const [home, catalog, courseData, migration, collectionMigration, signatureMigration] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/starter-courses.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0005_starter_course_catalog.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0017_free_course_collection.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0025_signature_course_studio.sql", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(home, /href="#"/);
  assert.doesNotMatch(home, /32k\+|\$1\.4B|96M|4\.8\/5|Avery Lin|21% less/);
  assert.match(home, /COURSES THAT LEAD TO PROGRESS/);
  assert.match(home, /Find a coach/);
  assert.match(home, /Take a course/);
  assert.match(catalog, /NORTHSTARLABS ORIGINALS/);
  assert.match(courseData, /AI Command Studio/);
  assert.match(courseData, /Bitcoin Intelligence/);
  assert.match(courseData, /Web3 Product Lab/);
  assert.match(migration, /launch-your-first-online-course/);
  assert.match(migration, /starter-community-06/);
  assert.match(collectionMigration, /remember-course-quiz/);
  assert.match(collectionMigration, /tutor-practice-course-quiz/);
  assert.match(collectionMigration, /responsible-ai-course-quiz/);
  assert.match(collectionMigration, /CAST Universal Design for Learning Guidelines/);
  assert.match(collectionMigration, /NSPCC safeguarding guidance for tutors/);
  assert.match(collectionMigration, /UNESCO AI Competency Framework for Teachers/);
  assert.match(signatureMigration, /SET `status`='archived'/);
  assert.match(signatureMigration, /northstar-ai-command-studio/);
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

test("copies the complete Bitcoin programme into CogniZen as a review draft", async () => {
  const [migration, polish, feedback] = await Promise.all([
    readFile(
      new URL("../drizzle/0032_cognizen_bitcoin_review_draft.sql", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../drizzle/0033_polish_cognizen_bitcoin_draft.sql", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../drizzle/0034_bitcoin_assessment_feedback.sql", import.meta.url),
      "utf8",
    ),
  ]);
  assert.match(migration, /cognizen-bitcoin-intelligence-draft/);
  assert.match(migration, /target\.`slug`='cognizen-consulting'/);
  assert.match(migration, /'draft'/);
  assert.match(migration, /FROM `course_sections` source/);
  assert.match(migration, /FROM `lessons` source/);
  assert.match(migration, /FROM `quizzes` source/);
  assert.match(migration, /FROM `quiz_questions` source/);
  assert.match(polish, /lower\(trim\(`title`\)\)='untitled lesson'/);
  assert.match(polish, /## Your outcome/);
  assert.match(feedback, /Make every Bitcoin assessment teach after it scores/);
  assert.match(feedback, /A BIP number documents a proposal/);
  assert.match(feedback, /Bitcoin''s future is conditional/);
});

test("turns Module 2.3 into a native interactive learning pilot", async () => {
  const [migration, experience, learnerPage] = await Promise.all([
    readFile(new URL("../drizzle/0048_interactive_module_2_3.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/lesson-experience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /Market Sentiment, Narratives and Evidence/);
  assert.match(migration, /ALTER TABLE `lessons` ADD `experience_json`/);
  assert.match(migration, /cognizen-crypto-mastery-part-2-pilot/);
  assert.match(migration, /'draft',0,1/);
  assert.match(migration, /Attention is not conviction/);
  assert.match(migration, /Build an evidence ladder/);
  assert.match(migration, /Investigate a market story/);
  assert.match(migration, /Make a confidence-rated decision/);
  assert.match(migration, /cognizen-p2m3-q12/);
  assert.match(experience, /Play guided story/);
  assert.match(experience, /SIGNAL SORT/);
  assert.match(experience, /DECISION POINT/);
  assert.match(experience, /CONFIDENCE LAB/);
  assert.match(experience, /speechSynthesis/);
  assert.match(experience, /Accessibility read-aloud/);
  assert.match(experience, /allowBrowserNarration/);
  assert.match(learnerPage, /InteractiveLessonExperience/);
  assert.match(learnerPage, /Open the source-backed reference notes/);
});

test("adds Module 2.4 market regime strategy pilot", async () => {
  const migration = await readFile(
    new URL("../drizzle/0067_crypto_mastery_module_2_4_pilot.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /Module 2.4: Market Regimes and Strategy Selection/);
  assert.match(migration, /cognizen-p2-module-04/);
  assert.match(migration, /cognizen-p2m4-l01/);
  assert.match(migration, /cognizen-p2m4-l02/);
  assert.match(migration, /cognizen-p2m4-l03/);
  assert.match(migration, /cognizen-p2m4-l04/);
  assert.match(migration, /cognizen-p2m4-l05/);
  assert.match(migration, /cognizen-p2m4-quiz/);
  assert.match(migration, /\"kind\":\"classify\"/);
  assert.match(migration, /\"kind\":\"branch\"/);
  assert.match(migration, /\"kind\":\"meter\"/);
  assert.match(migration, /Market Regime/);
});

test("adds Module 2.5 fundamental analysis pilot", async () => {
  const migration = await readFile(
    new URL("../drizzle/0068_crypto_mastery_module_2_5_pilot.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /Module 2.5: Introduction to Fundamental Analysis/);
  assert.match(migration, /cognizen-p2-module-05/);
  assert.match(migration, /cognizen-p2m5-l01/);
  assert.match(migration, /cognizen-p2m5-l02/);
  assert.match(migration, /cognizen-p2m5-l03/);
  assert.match(migration, /cognizen-p2m5-l04/);
  assert.match(migration, /cognizen-p2m5-l05/);
  assert.match(migration, /cognizen-p2m5-quiz/);
  assert.match(migration, /"kind":"classify"/);
  assert.match(migration, /"kind":"branch"/);
  assert.match(migration, /"kind":"meter"/);
});

test("adds Module 2.6 project evaluation pilot", async () => {
  const migration = await readFile(
    new URL("../drizzle/0069_crypto_mastery_module_2_6_pilot.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /Module 2.6: Evaluating Cryptocurrency Projects/);
  assert.match(migration, /cognizen-p2-module-06/);
  assert.match(migration, /cognizen-p2m6-l01/);
  assert.match(migration, /cognizen-p2m6-l02/);
  assert.match(migration, /cognizen-p2m6-l03/);
  assert.match(migration, /cognizen-p2m6-l04/);
  assert.match(migration, /cognizen-p2m6-l05/);
  assert.match(migration, /cognizen-p2m6-quiz/);
  assert.match(migration, /"kind":"classify"/);
  assert.match(migration, /"kind":"branch"/);
  assert.match(migration, /"kind":"meter"/);
});

test("productionises the opening Crypto Mastery arc instead of importing an online book", async () => {
  const [generator, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-foundations-production-batch.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0049_crypto_mastery_foundations_production.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /The three jobs of money/);
  assert.match(generator, /Your bank balance is digital/);
  assert.match(generator, /The digital cash problem Bitcoin addressed/);
  assert.match(generator, /Centralisation and decentralisation are a spectrum/);
  assert.match(generator, /resbank\.co\.za/);
  assert.match(generator, /bankofengland\.co\.uk/);
  assert.match(generator, /bitcoin\.org\/bitcoin\.pdf/);
  assert.match(generator, /NIST\.IR\.8202/);
  assert.match(generator, /kind: "classify"/);
  assert.match(generator, /kind: "branch"/);
  assert.match(generator, /kind: "meter"/);
  assert.match(migration, /Crypto Mastery: Foundations — Production draft/);
  assert.match(migration, /The remaining source modules will be added only as they pass the same standard/);
  assert.match(migration, /cmf-module-1-4-quiz-q08/);
});

test("extends Crypto Mastery through blockchain, decentralisation, asset taxonomy and Bitcoin fundamentals", async () => {
  const [generator, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-foundations-production-batch-2.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0050_crypto_mastery_foundations_production_batch_2.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Build a blockchain from first principles/);
  assert.match(generator, /Consensus is agreement under rules/);
  assert.match(generator, /Map decentralisation across five control surfaces/);
  assert.match(generator, /Coin, token or represented claim/);
  assert.match(generator, /Bitcoin's ledger: keys, UTXOs and rules/);
  assert.match(generator, /Protocol scarcity versus investment narrative/);
  assert.match(generator, /nist\.gov\/blockchain/);
  assert.match(generator, /developer\.bitcoin\.org/);
  assert.match(generator, /ethereum\.org\/developers\/docs/);
  assert.match(generator, /bis\.org\/fsi/);
  assert.match(migration, /Eight production-quality modules/);
  assert.match(migration, /cmf-module-1-8-quiz-q08/);
});

test("turns Ethereum, keys and wallet security into interactive production learning", async () => {
  const [generator, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-foundations-production-batch-3.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0051_crypto_mastery_foundations_production_batch_3.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Separate Ethereum, ether and tokens/);
  assert.match(generator, /Trace a smart-contract transaction/);
  assert.match(generator, /From private key to verifiable authority/);
  assert.match(generator, /Choose custody and wallet type by purpose/);
  assert.match(generator, /Map hot and cold attack surfaces/);
  assert.match(generator, /Use offline signing without signing blind/);
  assert.match(generator, /ethereum\.org\/security/);
  assert.match(generator, /developer\.bitcoin\.org\/devguide\/wallets/);
  assert.match(generator, /csrc\.nist\.gov\/glossary\/term\/wallet/);
  assert.match(migration, /Twelve production-quality modules/);
  assert.match(migration, /cmf-module-1-12-quiz-q08/);
});

test("upgrades Module 1.4 to narrated premium teaching with a practical design map", async () => {
  const [generator, mediaScript, migration, lab, schema] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-4-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-4-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0061_crypto_mastery_module_1_4_premium.sql", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-4-cryptocurrency-map.py", import.meta.url), "utf8"),
    readFile(new URL("../scripts/validate-migrations.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /What is cryptocurrency without the buzzwords/);
  assert.match(generator, /Centralisation and decentralisation are a spectrum/);
  assert.match(generator, /Follow a cryptocurrency transaction/);
  assert.match(mediaScript, /MODULE 1.4/);
  assert.match(migration, /cmf-module-1-4-definition-video/);
  assert.match(migration, /cmf-module-1-4-design-map/);
  assert.match(migration, /UPDATE `lessons`/);
  assert.match(lab, /module-1-4-what-is-cryptocurrency-design-map.pdf/);
  assert.match(schema, /premiumModuleFour/);
});

test("upgrades Module 1.5 to narrated premium teaching with consensus and tamper-resistance clarity", async () => {
  const [generator, mediaScript, migration, validator] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-5-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-5-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0062_crypto_mastery_module_1_5_premium.sql", import.meta.url), "utf8"),
    readFile(new URL("../scripts/validate-migrations.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Bitcoin-style blockchains are not a mystery/);
  assert.match(generator, /Consensus/);
  assert.match(generator, /tamper resistance/);
  assert.match(mediaScript, /MODULE 1.5/);
  assert.match(mediaScript, /MODULE 1.5  \|  CHAIN ENGINE/);
  assert.match(migration, /cmf-module-1-5-lesson-01/);
  assert.match(migration, /cmf-module-1-5-lesson-02/);
  assert.match(migration, /cmf-module-1-5-lesson-03/);
  assert.match(migration, /cmf-module-1-5-chain-video/);
  assert.match(migration, /cmf-module-1-5-consensus-video/);
  assert.match(migration, /cmf-module-1-5-resistance-video/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /'video'/);
  assert.match(migration, /Neural-narrated visual lesson for Module 1.5 of Crypto Mastery/);
  assert.match(validator, /premiumModuleFive/);
  for (const file of [
    "module-1-5-blockchain-chain.mp4",
    "module-1-5-consensus-contract.mp4",
    "module-1-5-tamper-resistance.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url)),
    );
    assert.ok(media.size > 150_000, `${file} must contain a genuine narrated video`);
  }
});

test("upgrades Module 1.6 to narrated premium teaching with control-surface judgement", async () => {
  const [generator, mediaScript, migration, validator] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-6-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-6-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0063_crypto_mastery_module_1_6_premium.sql", import.meta.url), "utf8"),
    readFile(new URL("../scripts/validate-migrations.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Decentralisation is a useful concept/);
  assert.match(generator, /control surfaces/);
  assert.match(generator, /controlled model may/);
  assert.match(mediaScript, /module-1-6-validator-user-role/);
  assert.match(mediaScript, /module-1-6-decentralisation-surfaces/);
  assert.match(migration, /cmf-module-1-6-lesson-01/);
  assert.match(migration, /cmf-module-1-6-lesson-02/);
  assert.match(migration, /cmf-module-1-6-lesson-03/);
  assert.match(migration, /cmf-module-1-6-surfaces-video/);
  assert.match(migration, /cmf-module-1-6-roles-video/);
  assert.match(migration, /cmf-module-1-6-purpose-video/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /'video'/);
  assert.match(migration, /Neural-narrated visual lesson for Module 1.6 of Crypto Mastery/);
  assert.match(validator, /premiumModuleSix/);
  for (const file of [
    "module-1-6-decentralisation-surfaces.mp4",
    "module-1-6-validator-user-role.mp4",
    "module-1-6-decentralise-for-purpose.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url)),
    );
    assert.ok(media.size > 150_000, `${file} must contain a genuine narrated video`);
  }
});

test("upgrades Module 1.7 to narrated premium teaching with asset taxonomy clarity", async () => {
  const [generator, mediaScript, migration, validator] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-7-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-7-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0064_crypto_mastery_module_1_7_premium.sql", import.meta.url), "utf8"),
    readFile(new URL("../scripts/validate-migrations.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /digital assets/);
  assert.match(generator, /A network-native unit/);
  assert.match(generator, /token-rights/);
  assert.match(mediaScript, /module-1-7-asset-taxonomy/);
  assert.match(mediaScript, /module-1-7-token-rights/);
  assert.match(mediaScript, /module-1-7-stable-nft-rwa/);
  assert.match(migration, /cmf-module-1-7-lesson-01/);
  assert.match(migration, /cmf-module-1-7-lesson-02/);
  assert.match(migration, /cmf-module-1-7-lesson-03/);
  assert.match(migration, /cmf-module-1-7-definition-video/);
  assert.match(migration, /cmf-module-1-7-rights-video/);
  assert.match(migration, /cmf-module-1-7-dependency-video/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /'video'/);
  assert.match(migration, /Neural-narrated visual lesson for Module 1.7 of Crypto Mastery/);
  assert.match(validator, /premiumModuleSeven/);
  for (const file of [
    "module-1-7-asset-taxonomy.mp4",
    "module-1-7-token-rights.mp4",
    "module-1-7-stable-nft-rwa.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url)),
    );
    assert.ok(media.size > 150_000, `${file} must contain a genuine narrated video`);
  }
});

test("upgrades Module 1.8 to narrated premium teaching with Bitcoin fundamentals", async () => {
  const [generator, mediaScript, migration, validator] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-8-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-8-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0065_crypto_mastery_module_1_8_premium.sql", import.meta.url), "utf8"),
    readFile(new URL("../scripts/validate-migrations.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Bitcoin ownership is control of spend conditions/);
  assert.match(generator, /Proof of work/);
  assert.match(generator, /Scarcity is a protocol property/);
  assert.match(mediaScript, /module-1-8-ledger-ownership/);
  assert.match(mediaScript, /module-1-8-proof-of-work/);
  assert.match(mediaScript, /module-1-8-scarcity-claims/);
  assert.match(migration, /cmf-module-1-8-lesson-01/);
  assert.match(migration, /cmf-module-1-8-lesson-02/);
  assert.match(migration, /cmf-module-1-8-lesson-03/);
  assert.match(migration, /cmf-module-1-8-ledger-video/);
  assert.match(migration, /cmf-module-1-8-mining-video/);
  assert.match(migration, /cmf-module-1-8-scarcity-video/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /Neural-narrated visual lesson for Module 1.8 of Crypto Mastery/);
  assert.match(validator, /premiumModuleEight/);
  for (const file of [
    "module-1-8-ledger-ownership.mp4",
    "module-1-8-proof-of-work.mp4",
    "module-1-8-scarcity-claims.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url)),
    );
    assert.ok(media.size > 150_000, `${file} must contain a genuine narrated video`);
  }
});

test("upgrades Module 1.9 to narrated premium teaching with Ethereum fundamentals", async () => {
  const [generator, mediaScript, migration, validator] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-9-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-9-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0066_crypto_mastery_module_1_9_premium.sql", import.meta.url), "utf8"),
    readFile(new URL("../scripts/validate-migrations.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Ethereum is a programmable world computer/);
  assert.match(generator, /smart contract is executable logic/i);
  assert.match(generator, /Gas is not a tax/);
  assert.match(mediaScript, /module-1-9-ethereum-vs-ether/);
  assert.match(mediaScript, /module-1-9-smart-contracts-evm/);
  assert.match(mediaScript, /module-1-9-gas-staking-layer2/);
  assert.match(migration, /cmf-module-1-9-lesson-01/);
  assert.match(migration, /cmf-module-1-9-lesson-02/);
  assert.match(migration, /cmf-module-1-9-lesson-03/);
  assert.match(migration, /cmf-module-1-9-network-video/);
  assert.match(migration, /cmf-module-1-9-contract-video/);
  assert.match(migration, /cmf-module-1-9-gas-video/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /Neural-narrated visual lesson for Module 1.9 of Crypto Mastery/);
  assert.match(validator, /premiumModuleNine/);
  for (const file of [
    "module-1-9-ethereum-vs-ether.mp4",
    "module-1-9-smart-contracts-evm.mp4",
    "module-1-9-gas-staking-layer2.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url)),
    );
    assert.ok(media.size > 150_000, `${file} must contain a genuine narrated video`);
  }
});

test("keeps the complete three-part Crypto Mastery programme in learning order", async () => {
  const migration = await readFile(
    new URL("../drizzle/0086_crypto_mastery_programme_sequence.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /Crypto Mastery: Digital Assets — Complete Programme/);
  assert.match(migration, /WHEN `id` LIKE 'cmf-module-1-%'/);
  assert.match(migration, /31 \+ CAST\(substr\(`id`,14\) AS INTEGER\)/);
  assert.match(migration, /63 \+ CAST\(substr\(`id`,14\) AS INTEGER\)/);
  assert.match(migration, /Module 3\.2: Mean-Reversion Strategy/);
});

test("upgrades Modules 1.10 to 1.12 to narrated premium teaching", async () => {
  const [generator, mediaScript, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-10-12-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-10-12-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0070_crypto_mastery_module_1_10_12_premium.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /module-1-10-key-authority-video/);
  assert.match(generator, /module-1-11-wallet-anatomy-video/);
  assert.match(generator, /module-1-12-hot-cold-wallets-video/);
  assert.match(mediaScript, /generate-neural-voice\.py/);
  assert.match(mediaScript, /bm_george/);
  assert.match(migration, /cmf-module-1-10-lesson-01/);
  assert.match(migration, /cmf-module-1-11-lesson-01/);
  assert.match(migration, /cmf-module-1-12-lesson-01/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /Neural-narrated visual lesson for cmf-module-1-10-lesson-01/);
  for (const file of [
    "module-1-10-key-authority.mp4",
    "module-1-11-wallet-anatomy.mp4",
    "module-1-12-hot-cold-wallets.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url)),
    );
    assert.ok(media.size > 1_000_000, `${file} must contain a genuine narrated video`);
  }
});

test("upgrades Modules 1.13 to 1.15 to narrated premium teaching", async () => {
  const [generator, mediaScript, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-13-15-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-13-15-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0071_crypto_mastery_module_1_13_15_premium.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /module-1-13-recovery-chain-video/);
  assert.match(generator, /module-1-14-exchange-ledger-video/);
  assert.match(generator, /module-1-15-dex-risk-stack-video/);
  assert.match(mediaScript, /generate-neural-voice\.py/);
  assert.match(mediaScript, /bm_george/);
  assert.match(migration, /cmf-module-1-13-lesson-01/);
  assert.match(migration, /cmf-module-1-14-lesson-01/);
  assert.match(migration, /cmf-module-1-15-lesson-01/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /Neural-narrated visual lesson for cmf-module-1-13-lesson-01/);
  for (const file of [
    "module-1-13-recovery-chain.mp4",
    "module-1-14-exchange-ledger.mp4",
    "module-1-15-dex-risk-stack.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url)),
    );
    assert.ok(media.size > 1_000_000, `${file} must contain a genuine narrated video`);
  }
});

test("upgrades Modules 1.16 to 1.18 to narrated premium teaching", async () => {
  const [generator, mediaScript, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-16-18-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-16-18-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0072_crypto_mastery_module_1_16_18_premium.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /module-1-16-true-cost-video/);
  assert.match(generator, /module-1-17-transfer-flow-video/);
  assert.match(generator, /module-1-18-confirmations-video/);
  assert.match(mediaScript, /generate-neural-voice\.py/);
  assert.match(mediaScript, /bm_george/);
  assert.match(migration, /cmf-module-1-16-lesson-01/);
  assert.match(migration, /cmf-module-1-17-lesson-01/);
  assert.match(migration, /cmf-module-1-18-lesson-01/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /Neural-narrated visual lesson for cmf-module-1-16-lesson-01/);
  for (const file of [
    "module-1-16-true-cost.mp4",
    "module-1-17-transfer-flow.mp4",
    "module-1-18-confirmations.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url)),
    );
    assert.ok(media.size > 1_000_000, `${file} must contain a genuine narrated video`);
  }
});

test("upgrades Modules 1.19 to 1.20 to narrated premium teaching", async () => {
  const [generator, mediaScript, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-19-20-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-19-20-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0073_crypto_mastery_module_1_19_20_premium.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /module-1-19-fees-and-gas-video/);
  assert.match(generator, /module-1-20-stablecoin-models-video/);
  assert.match(mediaScript, /generate-neural-voice\.py/);
  assert.match(mediaScript, /bm_george/);
  assert.match(migration, /cmf-module-1-19-lesson-01/);
  assert.match(migration, /cmf-module-1-20-lesson-01/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /Neural-narrated visual lesson for cmf-module-1-19-lesson-01/);
  for (const file of [
    "module-1-19-fees-and-gas.mp4",
    "module-1-20-stablecoin-models.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url)),
    );
    assert.ok(media.size > 1_000_000, `${file} must contain a genuine narrated video`);
  }
});

test("turns recovery, exchange use and transaction execution into practical production learning", async () => {
  const [generator, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-foundations-production-batch-4.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0052_crypto_mastery_foundations_production_batch_4.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Run a recovery rehearsal before value depends on it/);
  assert.match(generator, /Trace money through an exchange/);
  assert.match(generator, /Audit the exchange before funding it/);
  assert.match(generator, /Trace a wallet-to-wallet swap/);
  assert.match(generator, /Separate price impact, slippage and fees/);
  assert.match(generator, /Calculate the true transaction cost/);
  assert.match(generator, /github\.com\/bitcoin\/bips/);
  assert.match(generator, /fsca\.co\.za/);
  assert.match(generator, /iosco\.org/);
  assert.match(migration, /Sixteen production-quality modules/);
  assert.match(migration, /cmf-module-1-16-quiz-q08/);
});

test("turns transfers, confirmations, fees and stablecoins into practical production learning", async () => {
  const [generator, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-foundations-production-batch-5.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0053_crypto_mastery_foundations_production_batch_5.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Run a transfer pre-flight check/);
  assert.match(generator, /Follow the transaction lifecycle/);
  assert.match(generator, /Treat confirmations as confidence, not legitimacy/);
  assert.match(generator, /Separate network, platform and execution costs/);
  assert.match(generator, /Read an Ethereum gas quote/);
  assert.match(generator, /Stress-test the peg and redemption loop/);
  assert.match(generator, /ethereum\.org\/developers\/docs\/transactions/);
  assert.match(generator, /developer\.bitcoin\.org\/devguide\/transactions/);
  assert.match(generator, /bis\.org\/fsi\/publ\/insights57/);
  assert.match(migration, /Twenty production-quality modules/);
  assert.match(migration, /cmf-module-1-20-quiz-q08/);
});

test("turns valuation, tokenomics, volatility and terminology into practical production learning", async () => {
  const [generator, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-foundations-production-batch-6.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0054_crypto_mastery_foundations_production_batch_6.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Calculate value beyond the token price/);
  assert.match(generator, /Audit circulating supply, FDV and unlocks/);
  assert.match(generator, /Separate utility from value capture/);
  assert.match(generator, /Trace leverage and liquidation cascades/);
  assert.match(generator, /Translate wallet, network and transaction language/);
  assert.match(generator, /Detect jargon, social pressure and scam language/);
  assert.match(generator, /coingecko\.com\/hc\/en-us\/articles\/32294647667865/);
  assert.match(generator, /ethereum\.org\/roadmap\/merge\/issuance/);
  assert.match(generator, /iosco\.org\/library\/pubdocs/);
  assert.match(generator, /csrc\.nist\.gov\/glossary\/term\/wallet/);
  assert.match(migration, /Twenty-four production-quality modules/);
  assert.match(migration, /cmf-module-1-24-quiz-q08/);
});

test("turns security, fraud, investment risk and responsible participation into practical learning", async () => {
  const [generator, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-foundations-production-batch-7.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0055_crypto_mastery_foundations_production_batch_7.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Build an account defence stack/);
  assert.match(generator, /Respond to a suspected compromise/);
  assert.match(generator, /Recognise the scam funnel/);
  assert.match(generator, /Stop harm and preserve evidence/);
  assert.match(generator, /Run scenario and risk-of-ruin tests/);
  assert.match(generator, /Write a personal participation policy/);
  assert.match(generator, /cisa\.gov\/more-password/);
  assert.match(generator, /ethereum\.org\/community\/support\/scams/);
  assert.match(generator, /fsca\.co\.za\/News%20Documents/);
  assert.match(generator, /sars\.gov\.za\/individuals\/crypto-assets-tax/);
  assert.match(migration, /Twenty-eight production-quality modules/);
  assert.match(migration, /cmf-module-1-28-quiz-q08/);
});

test("completes foundations with regulation, a safety plan and an evidence-led capstone", async () => {
  const [generator, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-foundations-production-batch-8.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0056_crypto_mastery_foundations_production_batch_8.sql", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Classify the asset, activity and provider/);
  assert.match(generator, /Build a defensible crypto tax record/);
  assert.match(generator, /Build the asset and custody inventory/);
  assert.match(generator, /Plan succession, privacy and review/);
  assert.match(generator, /Complete the capstone decision/);
  assert.match(generator, /Create the next-stage learning plan/);
  assert.match(generator, /fsca\.co\.za\/New-Financial-Service-Provider/);
  assert.match(generator, /fatf-gafi\.org\/en\/topics\/virtual-assets/);
  assert.match(generator, /oecd\.org\/en\/publications\/international-standards/);
  assert.match(generator, /sars\.gov\.za\/individuals\/crypto-assets-tax/);
  assert.match(migration, /Complete 31-module Crypto Mastery/);
  assert.match(migration, /cmf-module-1-31-quiz-q08/);
});

test("opens Crypto Mastery with a narrated, interactive and downloadable orientation", async () => {
  const [generator, migration, uploads] = await Promise.all([
    readFile(new URL("../scripts/generate-crypto-mastery-welcome.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0057_crypto_mastery_welcome.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/uploads/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(generator, /Welcome to Crypto Mastery/);
  assert.match(generator, /Learn-Do-Prove/);
  assert.match(generator, /Choose your purpose and your boundaries/);
  assert.match(generator, /Build your Learn-Do-Prove system/);
  assert.match(generator, /Crypto Mastery Field Guide/);
  assert.match(generator, /Exercises never require you to buy an asset/);
  assert.match(migration, /Start here: Welcome to Crypto Mastery/);
  assert.match(migration, /static:\/media\/faculty\/crypto-mastery-welcome\.mp4/);
  assert.match(migration, /static:\/media\/course-resources\/crypto-mastery-field-guide\.pdf/);
  assert.match(migration, /cmf-start-here-quiz-q06/);
  assert.match(uploads, /\/media\/course-resources\//);
  assert.match(uploads, /release-managed resource cannot be deleted/);
});

test("turns Crypto Mastery Module 1.1 into narrated, interactive and applied learning", async () => {
  const [generator, migration, learner] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-1-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0058_crypto_mastery_module_1_1_premium.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
  ]);
  const videos = [
    "module-1-1-three-jobs-of-money.mp4",
    "module-1-1-digital-balances.mp4",
    "module-1-1-digital-scarcity.mp4",
  ];
  for (const file of videos) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url))
    );
    assert.ok(media.size > 1_000_000, `${file} must contain genuine narrated video data`);
    assert.match(migration, new RegExp(file.replace(".", "\\.")));
  }
  const fieldLab = await import("node:fs/promises").then(({ stat }) =>
    stat(new URL("../public/media/course-resources/module-1-1-money-and-digital-assets-field-lab.pdf", import.meta.url))
  );
  assert.ok(fieldLab.size > 5_000, "the Module 1.1 field lab must be a genuine PDF resource");
  assert.match(generator, /Money and Digital Assets Field Lab/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /static:\/media\/course-resources\/module-1-1-money-and-digital-assets-field-lab\.pdf/);
  assert.match(learner, /Narrated video \+ interactive lab/);
});

test("uses one local neural voice and upgrades Crypto Mastery Module 1.2", async () => {
  const [voice, welcomeMedia, moduleOneMedia, moduleTwoMedia, generator, migration] = await Promise.all([
    readFile(new URL("../scripts/generate-neural-voice.py", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-crypto-mastery-welcome-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-1-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-2-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-2-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0059_crypto_mastery_module_1_2_premium.sql", import.meta.url), "utf8"),
  ]);
  assert.match(voice, /from kokoro import KPipeline/);
  assert.match(voice, /default="bm_george"/);
  for (const script of [welcomeMedia, moduleOneMedia, moduleTwoMedia]) {
    assert.match(script, /generate-neural-voice\.py/);
    assert.match(script, /bm_george/);
    assert.doesNotMatch(script, /System\.Speech/);
  }
  for (const file of [
    "module-1-2-obligations-to-coins.mp4",
    "module-1-2-claims-ledgers-fiat.mp4",
    "module-1-2-why-money-changes.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url))
    );
    assert.ok(media.size > 1_000_000, `${file} must contain genuine neural narration and video`);
    assert.match(migration, new RegExp(file.replace(".", "\\.")));
  }
  assert.match(generator, /Evolution of Money Field Lab/);
  assert.match(migration, /required_watch_percent`=75/);
  assert.match(migration, /module-1-2-evolution-of-money-field-lab\.pdf/);
});

test("upgrades Crypto Mastery Module 1.3 into a source-disciplined Bitcoin origins lab", async () => {
  const [mediaScript, generator, migration, workbookScript] = await Promise.all([
    readFile(new URL("../scripts/generate-module-1-3-media.ps1", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-3-premium.mjs", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0060_crypto_mastery_module_1_3_premium.sql", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-module-1-3-evidence-lab.py", import.meta.url), "utf8"),
  ]);
  assert.match(mediaScript, /generate-neural-voice\.py/);
  assert.match(mediaScript, /bm_george/);
  assert.match(mediaScript, /A DESIGN DOCUMENT\. NOT A PRICE PROPHECY/);
  assert.match(generator, /Origins of Bitcoin Evidence Lab/);
  assert.match(generator, /required_watch_percent/);
  assert.match(workbookScript, /THE CLAIM AUDIT/);
  for (const file of [
    "module-1-3-digital-cash-problem.mp4",
    "module-1-3-technical-ancestry.mp4",
    "module-1-3-white-paper-claims.mp4",
  ]) {
    const media = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url))
    );
    assert.ok(media.size > 1_000_000, `${file} must contain genuine neural narration and video`);
    assert.match(migration, new RegExp(file.replace(".", "\\.")));
  }
  const workbook = await import("node:fs/promises").then(({ stat }) =>
    stat(new URL("../public/media/course-resources/module-1-3-origins-of-bitcoin-evidence-lab.pdf", import.meta.url))
  );
  assert.ok(workbook.size > 5_000, "the Module 1.3 evidence lab must be a genuine PDF resource");
  assert.match(migration, /module-1-3-origins-of-bitcoin-evidence-lab\.pdf/);
});

test("guides new members into creating or learning with a low-friction join flow", async () => {
  const [home, login, welcome, course, profile, tutorHelper, coachDesk] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/welcome/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/tutors.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/tutors/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(home, /Become a coach/);
  assert.match(home, /Open an academy/);
  assert.match(home, /No credit card required/);
  assert.match(login, /No card or sales call/);
  assert.match(login, /emailRedirectTo: new URL\(destination/);
  assert.match(login, /START FREE IN ABOUT 60 SECONDS/);
  assert.match(login, /What do you want to do first/);
  assert.match(login, /const needsRoleChoice/);
  assert.doesNotMatch(login, /requestedDestination === "\/welcome" \? "learner"/);
  assert.match(welcome, /Name your academy/);
  assert.match(welcome, /Start a practical free course/);
  assert.match(welcome, /welcomeDestination/);
  assert.match(welcome, /location\.replace\("\/courses\?welcome=1"\)/);
  assert.match(welcome, /location\.replace\(role === "coach"/);
  assert.match(profile, /ensureCoachDraft/);
  assert.match(tutorHelper, /WHERE NOT EXISTS/);
  assert.match(tutorHelper, /status<>'archived'/);
  assert.match(coachDesk, /Your private coach draft is ready/);
  assert.match(coachDesk, /Finish your coach listing in three clear steps/);
  assert.match(coachDesk, /Save profile and continue/);
  assert.match(coachDesk, /Your public listing is free/);
  assert.doesNotMatch(coachDesk, /<legend>Choose how you are seen<\/legend>/);
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
  assert.match(profile, /CASE WHEN role='creator' THEN role ELSE 'learner' END/);
  assert.match(login, /onboarding_path/);
  assert.match(login, /searchParams\.get\("mode"\)/);
});

test("ships a free inspect-first academy and course migration studio", async () => {
  const [page, api, parser, schema, migration, home, backup, terms, privacy] = await Promise.all([
    readFile(new URL("../app/dashboard/import/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/imports/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/course-import.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0039_thick_gertrude_yorkes.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/platform-backup.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/terms/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/privacy/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /Move in without starting over/);
  assert.match(page, /NorthstarLabs \/ \{academy\.name\} \/ Import/);
  assert.match(page, /\/dashboard\?area=courses/);
  assert.match(page, /natural filename order/);
  assert.match(page, /Nothing was published/);
  assert.match(page, /Create private drafts/);
  assert.match(page, /Finish file upload/);
  assert.match(page, /resumeProjectDocuments/);
  assert.match(api, /status='importing'/);
  assert.match(api, /awaiting_files/);
  assert.match(api, /attachedAt/);
  assert.match(api, /documentUpload/);
  assert.match(api, /'draft',0/);
  assert.match(api, /sendInvitations === true/);
  assert.match(api, /attach_document/);
  assert.match(parser, /courseFromDocumentSequence/);
  assert.match(parser, /Module \$\{index \+ 1\}/);
  assert.match(schema, /export const courseImportProjects/);
  assert.match(migration, /CREATE TABLE `course_import_projects`/);
  assert.match(home, /Build an academy/);
  assert.match(backup, /"course_import_projects"/);
  assert.match(terms, /Course and learner migration/);
  assert.match(privacy, /normalised course structure/);
});

test("blocks publication until imported source files are fully attached", async () => {
  const [courseApi, builder, readiness] = await Promise.all([
    readFile(new URL("../app/api/courses/[courseId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/course-readiness.ts", import.meta.url), "utf8"),
  ]);
  assert.match(courseApi, /pendingImportForCourse/);
  assert.match(courseApi, /status='awaiting_files'/);
  assert.match(courseApi, /pendingSourceFiles/);
  assert.match(readiness, /course-import-files/);
  assert.match(readiness, /Finish attaching the imported source files/);
  assert.match(builder, /IMPORT NOT YET VERIFIED/);
  assert.match(builder, /Finish file upload/);
});

test("ships a structured course editor, reusable media library, and safe learner rendering", async () => {
  const [schema, migration, cleanupMigration, builder, lessonsApi, uploadsApi, courseApi, learnApi, learner, renderer] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0008_rainy_molten_man.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0043_remove_empty_bitcoin_placeholder.sql", import.meta.url), "utf8"),
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
  assert.match(courseApi, /Complete the publishing checklist first/);
  assert.match(courseApi, /blockers\.map/);
  assert.match(courseApi, /s\.name AS schoolName,s\.slug AS schoolSlug/);
  assert.match(courseApi, /JOIN schools s ON s\.id=c\.school_id/);
  assert.match(builder, /NorthstarLabs \/ \{course\.schoolName\} \/ Course editor/);
  assert.match(builder, /\/dashboard\?area=courses/);
  assert.match(builder, /Autosave pending/);
  assert.match(builder, /Academy media library/);
  assert.match(builder, /draggable/);
  assert.match(builder, /Learner preview/);
  assert.match(builder, /Upload files/);
  assert.match(builder, /Search curriculum/);
  assert.match(builder, /Collapse all/);
  assert.match(builder, /Current lesson/);
  assert.match(builder, /openSectionIds\.has\(section\.id\)/);
  assert.match(builder, /isOpen && <div className="curriculum-lessons">/);
  assert.match(builder, /isBlankNewLesson/);
  assert.doesNotMatch(builder, /markDirty\(lesson\.id\);\s*setMessage\("New lesson created/);
  assert.match(lessonsApi, /Add a title or lesson material before saving/);
  assert.match(cleanupMigration, /DELETE FROM `lessons`/);
  assert.match(cleanupMigration, /stefan-bitcoin-genesis-next-era/);
  assert.match(learnApi, /lesson_resources/);
  assert.match(learner, /LessonContent/);
  assert.match(learner, /Files to keep and use/);
  assert.match(learner, /Creator preview - progress is disabled/);
  assert.doesNotMatch(renderer, /dangerouslySetInnerHTML/);
});

test("streams protected lesson media with short-lived grants and byte ranges", async () => {
  const [schema, migration, playback, stream, learnApi, previewApi, learner, helper] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0009_high_giant_man.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/media/playback/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/media/stream/[token]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/learn/[courseId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/catalog/[courseId]/preview/route.ts", import.meta.url), "utf8"),
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
  assert.match(learnApi, /key: learnerMediaKey\(primaryAssetKey\)/);
  assert.doesNotMatch(learnApi, /COURSE_VIDEO_FALLBACKS|fallbackAssetForLesson/);
  assert.doesNotMatch(previewApi, /COURSE_VIDEO_FALLBACKS|fallbackAssetForLesson/);
  assert.match(learner, /\/api\/media\/playback/);
  assert.match(learner, /function isProtectedMediaKey/);
  assert.match(learner, /key\.startsWith\("static:"\)/);
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

test("queues transactional and in-app notifications with reporting plus secured administration", async () => {
  const [schema, migration, notificationMigration, email, invitations, enrollment, progress, reporting, analytics, operations, platform, admin, auth, preferences, account] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0012_sudden_baron_strucker.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0085_in_app_notifications.sql", import.meta.url), "utf8"),
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
    readFile(new URL("../app/account/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const emailMessages/);
  assert.match(schema, /export const inAppNotifications/);
  assert.match(schema, /export const reportSchedules/);
  assert.match(schema, /export const auditLogs/);
  assert.match(migration, /CREATE TABLE `email_messages`/);
  assert.match(migration, /CREATE TABLE `report_schedules`/);
  assert.match(migration, /ALTER TABLE `profiles` ADD `status`/);
  assert.match(notificationMigration, /CREATE TABLE IF NOT EXISTS `in_app_notifications`/);
  assert.match(notificationMigration, /in_app_notifications_idempotency_unique/);
  assert.match(email, /https:\/\/api\.resend\.com\/emails/);
  assert.match(email, /idempotency-key/);
  assert.match(email, /configuration_required/);
  assert.match(email, /INSERT INTO in_app_notifications/);
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
  assert.match(preferences, /mark_all_read/);
  assert.match(preferences, /unreadCount/);
  assert.match(account, /YOUR UPDATES/);
  assert.match(account, /Notifications \{unreadCount/);
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
  assert.match(backup, /"in_app_notifications"/);
  assert.match(backup, /checksum verification failed/);
  assert.match(reliability, /createPlatformBackup/);
  assert.match(reliability, /hide_reported_post/);
  assert.match(health, /recentBackup/);
  assert.match(account, /northstarlabs-personal-data-export/);
  assert.match(account, /notifications: notifications\.results/);
  assert.match(account, /DELETE FROM in_app_notifications/);
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
    integrationStudio,
    learnerLive,
    manifest,
    serviceWorker,
    pwaRegister,
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
    readFile(new URL("../app/dashboard/integrations/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/live/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manifest.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
    readFile(new URL("../app/pwa-register.tsx", import.meta.url), "utf8"),
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
  assert.match(productStudio, /Choose service provider/);
  assert.match(productStudio, /switchServiceProvider/);
  assert.match(productStudio, /This product stays inside/);
  assert.match(productStudio, /Include this provider&apos;s community/);
  assert.match(liveStudio, /Schedule a session/);
  assert.match(liveStudio, /Attendance register/);
  assert.doesNotMatch(
    [productStudio, liveStudio, integrationStudio, learnerLive].join("\n"),
    /[âÂÃ]/,
  );
  assert.match(learnerLive, /Reserve my place/);
  assert.match(manifest, /display: "standalone"/);
  assert.match(serviceWorker, /northstarlabs-shell-v2/);
  assert.match(serviceWorker, /request\.mode === "navigate"/);
  assert.match(serviceWorker, /isApplicationCode/);
  assert.match(serviceWorker, /fetch\(request\).*caches\.match\(request\)/s);
  assert.match(pwaRegister, /registration\.update\(\)/);
  assert.match(pwaRegister, /controllerchange/);
  assert.match(storefront, /Join free/);
  assert.match(storefront, /PROGRAMMES & MEMBERSHIPS/);
});

test("connects email, Zoom, Mailchimp, Zapier, and consent-based Google Analytics", async () => {
  const [
    schema,
    migration,
    integrationsApi,
    provider,
    integrationEvents,
    liveApi,
    liveStudio,
    integrationStudio,
    analyticsApi,
    analyticsClient,
    layout,
    academyExport,
    privacy,
  ] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0044_native_provider_integrations.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/integrations/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/provider-integrations.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/integrations.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/live-sessions/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/live/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/integrations/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/analytics-config/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/google-analytics.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/academy-export.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/privacy/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /settingsJson: text\("settings_json"\)/);
  assert.match(schema, /credentialsJson: text\("credentials_json"\)/);
  assert.match(migration, /ALTER TABLE `integrations` ADD `settings_json`/);
  assert.match(migration, /ALTER TABLE `integrations` ADD `credentials_json`/);
  assert.match(integrationsApi, /connect_provider/);
  assert.match(integrationsApi, /test_provider/);
  assert.match(integrationsApi, /resend.*zoom.*mailchimp.*zapier.*google_analytics/s);
  assert.match(provider, /AES-GCM/);
  assert.match(provider, /testResendConnection/);
  assert.match(provider, /provider='resend'/);
  assert.match(provider, /grant_type=account_credentials/);
  assert.match(provider, /\/meetings/);
  assert.match(provider, /status: "pending"/);
  assert.match(integrationEvents, /provider IN \('webhook','zapier'\)/);
  assert.match(integrationEvents, /syncMailchimpLearner/);
  assert.match(liveApi, /createZoomMeeting/);
  assert.match(liveStudio, /Leave this blank to create the Zoom meeting automatically/);
  for (const label of ["Resend", "Zoom", "Mailchimp", "Zapier", "Google Analytics"]) {
    assert.match(integrationStudio, new RegExp(label));
  }
  assert.match(analyticsApi, /provider='google_analytics'/);
  assert.match(analyticsClient, /northstar_analytics_consent/);
  assert.match(analyticsClient, /send_page_view: false/);
  assert.match(layout, /GoogleAnalytics/);
  assert.doesNotMatch(academyExport, /credentials_json/);
  assert.match(privacy, /pending subscription/);
});

test("lets each academy verify and use its own encrypted email sender", async () => {
  const [provider, integrationsApi, communicationsApi, email, operations, studio] = await Promise.all([
    readFile(new URL("../lib/provider-integrations.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/integrations/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/communications/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/email-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/operations/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/integrations/page.tsx", import.meta.url), "utf8"),
  ]);
  const { resendSettings } = await import("../lib/provider-integrations.ts");
  const valid = resendSettings(
    "re_1234567890",
    "NorthstarLabs <learn@northstarlabs.co.za>",
    "support@northstarlabs.co.za",
  );
  assert.equal(valid.settings.domain, "northstarlabs.co.za");
  assert.equal(valid.settings.replyTo, "support@northstarlabs.co.za");
  assert.throws(() => resendSettings("bad", "not-an-email", ""), /valid Resend API key/);
  assert.match(provider, /https:\/\/api\.resend\.com\/domains\?limit=100/);
  assert.match(provider, /domain\.status !== "verified"/);
  assert.match(integrationsApi, /Resend email delivery/);
  assert.match(communicationsApi, /resendDeliveryConnection/);
  assert.match(email, /school_id AS schoolId/);
  assert.match(email, /academyConnection\?\.credentials\.apiKey/);
  assert.match(email, /"user-agent": "NorthstarLabs\/1\.0"/);
  assert.match(operations, /Connect email delivery/);
  assert.match(studio, /id="email-delivery"/);
  assert.match(studio, /Secrets are encrypted/);
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

test("ships academy tutor discovery, direct contact, protected enquiries, and session-aware navigation", async () => {
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
    signedInHook,
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
    readFile(new URL("../lib/use-signed-in.ts", import.meta.url), "utf8"),
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
  assert.match(inquiriesApi, /Choose an available appointment time before confirming/);
  assert.match(inquiriesApi, /slot_id IS NULL/);
  assert.match(inquiriesApi, /Someone else just booked that time/);
  assert.match(slotsApi, /slot\.status !== "open"/);
  assert.match(slotsApi, /overlaps an existing tutor slot/);
  assert.match(tutorDirectory, /Find a tutor who fits how you learn/);
  assert.match(tutorDirectory, /useSignedIn/);
  assert.match(tutorDirectory, /My coaching/);
  assert.match(tutorProfile, /Choose an appointment/);
  assert.match(tutorProfile, /Send a private enquiry/);
  assert.match(tutorProfile, /useSignedIn/);
  assert.match(tutorProfile, /My learning/);
  assert.match(tutorProfile, /Call tutor/);
  assert.match(tutorProfile, /Request this appointment/);
  assert.match(tutorProfile, /Open My coaching/);
  assert.match(tutorAdmin, /Learner enquiries/);
  assert.match(tutorAdmin, /Bookable appointment times/);
  assert.match(tutorAdmin, /coach-workspace-nav/);
  assert.match(tutorAdmin, /workspaceView/);
  assert.match(tutorAdmin, /Set availability/);
  assert.match(tutorAdmin, /Turn this enquiry into an appointment/);
  assert.match(tutorAdmin, /Assign time & confirm/);
  assert.doesNotMatch(tutorAdmin, />Mark booked</);
  assert.match(tutoring, /Every session\. One clear next step/);
  assert.match(tutoring, /Coaching journey/);
  assert.match(tutoring, /Find a coach/);
  assert.match(tutoring, /Cancel request/);
  assert.match(marketplace, /Find the person who can get you/);
  assert.match(marketplace, /Compare what matters/);
  assert.match(marketplace, /View times & request/);
  assert.match(marketplace, /View profile & enquire/);
  assert.match(marketplace, /Coach workspace/);
  assert.match(marketplace, /List coaching free/);
  assert.match(signedInHook, /onAuthStateChange/);
  assert.match(learnerHome, /My live classes/);
  assert.match(learnerHome, /My coaching/);
  assert.match(learnerHome, /learner-nav-mobile/);
  assert.match(learnerHome, /OPTIONAL HUMAN SUPPORT/);
  assert.match(learnerHome, /tutor-inquiries\?view=learner/);
  assert.match(storefront, /ONE-TO-ONE SUPPORT/);
  assert.match(email, /tutor_enquiry/);
  assert.match(email, /tutor_booking_update/);
  assert.match(email, /tutor_booking_cancelled/);
});

test("ships a free coach marketplace with optional verified exposure", async () => {
  const [migration, openMarketplaceMigration, plans, welcome, profile, admin, marketplace, publicProfile, home] = await Promise.all([
    readFile(new URL("../drizzle/0020_clammy_sally_floyd.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0046_open_coach_marketplace.sql", import.meta.url), "utf8"),
    readFile(new URL("../lib/coach-listing-plans.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/welcome/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tutors/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/tutors/[tutorSlug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /ADD `service_type`/);
  assert.match(migration, /ADD `listing_tier`/);
  assert.match(migration, /ADD `listing_monthly_cents`/);
  assert.match(openMarketplaceMigration, /listing_monthly_cents`=0/);
  assert.match(plans, /monthlyCents: 0/);
  assert.match(plans, /monthlyCents: 20_000/);
  assert.match(plans, /Northstar Verified/);
  assert.match(welcome, /FINAL STEP \{"\\u00B7"\} COACHING/);
  assert.match(welcome, /dashboard\/tutors\?setup=1/);
  assert.match(profile, /body\.role === "coach"/);
  assert.match(admin, /Your hourly rate in rand/);
  assert.match(admin, /Your public listing is free/);
  assert.match(admin, /verification remains a separate optional step/);
  assert.match(admin, /Verification cannot be purchased/);
  assert.match(admin, /Activate Verified - R200\/month/);
  assert.match(marketplace, /EXPLORE BY TOPIC/);
  assert.match(marketplace, /setSubject\(canonicalTopic\)/);
  assert.match(marketplace, /scrollIntoView/);
  assert.match(marketplace, /url\.searchParams\.set\("topic", topic\)/);
  assert.match(marketplace, /Your \$\{selectedTopic\} selection worked/);
  assert.match(marketplace, /Offer this topic/);
  assert.match(marketplace, /Every coach can be listed free/);
  assert.match(marketplace, /VERIFIED PROFESSIONAL/);
  assert.match(marketplace, /List my coaching free/);
  assert.match(publicProfile, /sessionStorage\.setItem\(inquiryDraftKey/);
  assert.match(publicProfile, /Your saved request is ready/);
  assert.match(publicProfile, /Continue to sign in & send/);
  assert.match(publicProfile, /sessionStorage\.removeItem\(inquiryDraftKey/);
  assert.match(publicProfile, /Track confirmation in My coaching/);
  assert.match(home, /Become a coach/);
  assert.match(home, /Open an academy/);
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
  assert.match(home, /LEARN AT YOUR PACE/);
  assert.match(home, /PERSONAL LEARNING HELP/);
  assert.match(home, /OFFER ONE-TO-ONE HELP/);
  assert.match(home, /BUILD AND TEACH/);
  assert.match(home, /Learn with a clear path/);
  assert.match(home, /Courses for the path\. Human help for the roadblocks\./);
  assert.match(home, /Can&apos;t find it\?/);
  assert.match(home, /href="\/demand"/);
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
  assert.match(dashboard, /Edit this academy/);
  assert.match(academy, /id="academy-identity"/);
  assert.match(navigator, /Choose an academy\. Then choose your module/);
  assert.match(navigator, /Your academy\. Your modules/);
  assert.match(navigator, /A coach is the tailored option/);
  assert.match(navigator, /fetch\("\/api\/catalog"\)/);
  assert.match(navigator, /\/schools\/\$\{academy\.slug\}/);
  assert.doesNotMatch(navigator, /Show my best next step/);
  assert.match(catalogue, /GOAL-MATCHED RESULTS/);
  assert.match(catalogue, /No forced matches/i);
});

test("publishes high-intent solution guides with crawlable internal routes", async () => {
  const [home, hub, guide, content, sitemap, robots, llms, styles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/solutions/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/solutions/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/search-landing-pages.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
    readFile(new URL("../app/search-landing.css", import.meta.url), "utf8"),
  ]);
  assert.match(home, /href="\/solutions"/);
  assert.match(home, /All solutions/);
  assert.match(hub, /CollectionPage/);
  assert.match(hub, /ItemList/);
  assert.match(guide, /FAQPage/);
  assert.match(guide, /BreadcrumbList/);
  assert.match(guide, /generateStaticParams/);
  for (const slug of [
    "online-courses-south-africa",
    "find-business-coach-south-africa",
    "bitcoin-web3-courses",
    "become-a-coach",
    "create-and-sell-online-course",
    "corporate-training-platform",
  ]) {
    assert.match(content, new RegExp(slug));
  }
  assert.match(sitemap, /searchLandingPages/);
  assert.match(robots, /\/solutions/);
  assert.match(llms, /Learning, coaching, and training guides/);
  assert.match(styles, /\.search-hub-grid/);
  assert.match(styles, /\.search-hero/);
});

test("schedules opt-out live-session reminders and calendar alarms", async () => {
  const [migration, reminders, email, liveApi, calendar, notifications, account, maintenance] = await Promise.all([
    readFile(new URL("../drizzle/0024_volatile_mattie_franklin.sql", import.meta.url), "utf8"),
    readFile(new URL("../lib/live-session-reminders.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/email-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/live-sessions/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/live-sessions/[sessionId]/calendar/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/notifications/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/account/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/platform/maintenance/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(migration, /ADD `scheduled_at`/);
  assert.match(migration, /ADD `live_session_reminders`/);
  assert.match(reminders, /24h/);
  assert.match(reminders, /1h/);
  assert.match(reminders, /capacity === 1 \? "1:1 coaching" : "group learning"/);
  assert.match(reminders, /cancelLiveSessionReminders/);
  assert.match(email, /scheduled_at/);
  assert.match(email, /\/cancel/);
  assert.match(email, /live_session_reminder/);
  assert.match(liveApi, /queueLiveSessionReminders/);
  assert.match(liveApi, /cancelLiveSessionReminders/);
  assert.match(calendar, /BEGIN:VALARM/);
  assert.match(calendar, /TRIGGER:-PT1H/);
  assert.match(calendar, /TRIGGER:-PT15M/);
  assert.match(notifications, /liveSessionReminders/);
  assert.match(notifications, /cancelUserLiveSessionReminders/);
  assert.match(notifications, /queueUserLiveSessionReminders/);
  assert.match(account, /Live session reminders/);
  assert.match(maintenance, /backfillLiveSessionReminders/);
});

test("turns confirmed coaching requests into private calendar appointments", async () => {
  const [calendar, tutoring] = await Promise.all([
    readFile(new URL("../app/api/tutor-inquiries/[inquiryId]/calendar/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/tutoring/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(calendar, /ti\.learner_id=\?/);
  assert.match(calendar, /ti\.status IN \('booked','completed'\)/);
  assert.match(calendar, /BEGIN:VCALENDAR/);
  assert.match(calendar, /TRIGGER:-PT1H/);
  assert.match(calendar, /TRIGGER:-PT15M/);
  assert.match(calendar, /cache-control": "private, no-store"/);
  assert.match(tutoring, /Add to calendar/);
  assert.match(tutoring, /Calendar file ready/);
  assert.match(tutoring, /authorization: `Bearer \$\{session\.access_token\}`/);
});

test("keeps learner catalogue facts and completion language trustworthy", async () => {
  const [catalogue, catalogApi, courseData, learner, styles] = await Promise.all([
    readFile(new URL("../app/courses/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/catalog/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/starter-courses.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  assert.match(catalogApi, /SUM\(l\.duration_minutes\)/);
  assert.match(catalogApi, /AS sectionCount/);
  assert.match(catalogApi, /AS assessmentCount/);
  assert.match(catalogue, /Choose a course that moves you forward/);
  assert.match(catalogue, /View course syllabus/);
  assert.match(catalogue, /catalog-card-proof/);
  assert.doesNotMatch(catalogue, /Choose a module to take/);
  assert.match(courseData, /durationMinutes: 210/);
  assert.match(courseData, /4 guided hours \+ board briefing/);
  assert.doesNotMatch(courseData, /14 hours \+ board briefing/);
  assert.match(learner, /Watch target reached/);
  assert.match(learner, /Finish now or keep exploring/);
  assert.match(learner, /REQUIRED VIEWING COMPLETE/);
  assert.match(styles, /\.catalog-card-proof/);
});

test("replaces the starter shelf with three substantive signature programmes", async () => {
  const [catalogue, migration] = await Promise.all([
    readFile(new URL("../lib/starter-courses.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0025_signature_course_studio.sql", import.meta.url), "utf8"),
  ]);
  assert.match(catalogue, /AI Command Studio/);
  assert.match(catalogue, /Bitcoin Intelligence/);
  assert.match(catalogue, /Web3 Product Lab/);
  assert.match(migration, /SET `status`='archived'/);
  assert.match(migration, /northstar-ai-command-studio/);
  assert.match(migration, /NorthstarLabs Distinction/);
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

test("integrates a governed, source-grounded Creator Studio without auto-publishing", async () => {
  const [page, route, provider, schema, migration, editor, terms, privacy, env] = await Promise.all([
    readFile(new URL("../app/dashboard/studio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/creator-studio/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/creator-studio.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0026_productive_triton.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/terms/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);
  assert.match(page, /NORTHSTAR CREATOR STUDIO/);
  assert.match(page, /URLs are recorded for citation; they are not silently scraped/);
  assert.match(page, /Build my course draft/);
  assert.match(page, /Draft built automatically/);
  assert.match(page, /ONE GUIDED RUN/);
  assert.match(route, /rightsConfirmed/);
  assert.match(route, /reviewConfirmed/);
  assert.match(route, /northstar_native/);
  assert.match(route, /'draft'/);
  assert.doesNotMatch(route, /status='published'/);
  assert.match(route, /requiresHumanReview: true/);
  assert.match(provider, /must remain grounded in supplied sources/);
  assert.match(provider, /GEMINI_API_KEY/);
  assert.match(provider, /generateNativeCourseBlueprint/);
  assert.match(provider, /provider: gemini \? "Northstar Native \+ Google Gemini" : "Northstar Native"/);
  assert.match(provider, /blueprint: true/);
  assert.match(provider, /quizzes: true/);
  assert.match(schema, /export const creatorStudioProjects/);
  assert.match(schema, /export const creatorStudioSources/);
  assert.match(schema, /export const creatorStudioGenerations/);
  assert.match(migration, /CREATE TABLE `creator_studio_projects`/);
  assert.match(editor, /generateStudioNarration/);
  assert.match(terms, /Creator Studio and AI-assisted content/);
  assert.match(privacy, /AI-assisted creation/);
  assert.match(env, /GEMINI_COURSE_MODEL/);
  assert.match(env, /GEMINI_TTS_MODEL/);
});

test("supports separate academies, professional addresses, and field-level storefront guidance", async () => {
  const [dashboard, coursesApi, academy, profile, schoolApi, access, worker, migration, boundaryMigration, storefront, styles] = await Promise.all([
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/courses/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/academy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/schools/[slug]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/school-access.ts", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0027_motionless_screwball.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0031_clear_academy_boundaries.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/schools/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  assert.match(dashboard, /Switch academy/);
  assert.match(dashboard, /Create a separate academy/);
  assert.match(dashboard, /Nothing from .* is moved/);
  assert.match(dashboard, /\/api\/courses\?schoolId=/);
  assert.match(dashboard, /course\.schoolId === activeSchoolId/);
  assert.match(dashboard, /cache: "no-store"/);
  assert.match(coursesApi, /c\.school_id AS schoolId/);
  assert.match(coursesApi, /private, no-store, max-age=0/);
  assert.match(profile, /createSchoolName/);
  assert.match(access, /allowAdditional/);
  assert.match(academy, /YOUR COMPLETION GUIDE/);
  assert.match(academy, /Each problem is marked below with exactly how to fix it/);
  assert.match(academy, /northstarlabs\.co\.za\/schools/);
  assert.match(schoolApi, /school_slug_aliases/);
  assert.match(schoolApi, /previousSlug/);
  assert.match(schoolApi, /updateDefaultCommunityName/);
  assert.match(worker, /northstar-learning-platform\.pikster\.chatgpt\.site/);
  assert.match(worker, /northstarlabs\.co\.za/);
  assert.match(migration, /CREATE TABLE `school_slug_aliases`/);
  assert.match(boundaryMigration, /`slug`='cognizen-consulting'/);
  assert.match(boundaryMigration, /'Stéfan Roodt''s Academy'/);
  assert.match(boundaryMigration, /'CogniZen Consulting Community'/);
  assert.match(storefront, /school-account-actions/);
  assert.match(storefront, />Sign out</);
  assert.match(styles, /\.academy-completion/);
  assert.match(styles, /\.workspace-controls/);
  assert.match(styles, /\.school-account-actions/);
  assert.match(styles, /\.dashboard-community-actions a\{min-height:50px/);
  assert.match(styles, /\.empty-dashboard \.dashboard-community-actions \.sys-primary\{margin-top:0\}/);
  assert.match(styles, /\.studio-capabilities\{margin-bottom:18px\}/);
  assert.match(styles, /\.studio-new-project \.studio-review-check\{[^}]*grid-template-columns:18px minmax\(0,1fr\)/);
  assert.match(styles, /\.studio-new-project \.studio-review-check input\{width:18px!important/);
  assert.match(styles, /\.studio-capabilities button\{width:100%/);
  assert.match(styles, /\.studio-automation-flow/);
  assert.match(styles, /\.studio-build-readiness/);
  assert.match(styles, /\.creator-provider-summary/);
});

test("ships real Northstar-produced faculty videos and attaches them behind lesson grants", async () => {
  const [migration, honestLabels, playback, stream, worker] = await Promise.all([
    readFile(new URL("../drizzle/0028_northstar_faculty_media.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0029_honest_media_labels.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/media/playback/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/media/stream/[token]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
  ]);
  for (const file of [
    "ai-workflow-introduction.mp4",
    "bitcoin-intelligence-introduction.mp4",
    "web3-product-introduction.mp4",
  ]) {
    const stat = await import("node:fs/promises").then(({ stat }) =>
      stat(new URL(`../public/media/faculty/${file}`, import.meta.url))
    );
    assert.ok(stat.size > 500_000, `${file} must contain genuine audio and video data`);
    assert.match(migration, new RegExp(file.replace(".", "\\.")));
  }
  assert.match(migration, /AI Workflow Faculty/);
  assert.match(migration, /Bitcoin Research Faculty/);
  assert.match(migration, /Web3 Product Faculty/);
  assert.match(migration, /required_watch_percent`=85/);
  assert.match(honestLabels, /A script is not a playable video/);
  assert.match(honestLabels, /primary_asset_id` IS NULL/);
  assert.match(playback, /static:/);
  assert.match(stream, /env\.ASSETS\.fetch/);
  assert.match(worker, /Media access requires a current lesson grant/);
});

test("shows prospective learners the real curriculum, faculty, assessments, and certificate standard", async () => {
  const [page, detailApi, styles] = await Promise.all([
    readFile(new URL("../app/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/catalog/[courseId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /See exactly what you will learn/);
  assert.match(page, /A CERTIFICATE THAT MEANS SOMETHING/);
  assert.match(page, /This is not a click-through certificate/);
  assert.match(page, /course\.sections/);
  assert.match(detailApi, /facultyHeadline/);
  assert.match(detailApi, /playableVideoCount/);
  assert.match(detailApi, /assessmentCount/);
  assert.match(detailApi, /certificateTitle/);
  assert.match(detailApi, /FROM lessons l/);
  assert.match(styles, /\.course-module-list/);
  assert.match(styles, /\.course-completion-standard/);
});

test("keeps course context through registration and welcomes new enrolments into lesson one", async () => {
  const [login, catalogue, course, enrolments, learn, styles] = await Promise.all([
    readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/enrollments/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  assert.match(login, /YOU ARE JOINING/);
  assert.match(login, /joiningCourseDetail\.title/);
  assert.match(login, /assessmentCount/);
  assert.match(enrolments, /newEnrollment: !existing/);
  assert.match(enrolments, /AS nextLessonTitle/);
  assert.match(enrolments, /ORDER BY e\.last_activity_at DESC/);
  assert.match(course, /newEnrollment \? "\?welcome=1"/);
  assert.match(course, /Continue learning/);
  assert.match(course, /split\(\/\\r\?\\n\|\\\\n\|;\//);
  assert.match(course, /fetch\("\/api\/enrollments"/);
  assert.match(catalogue, /signedIn/);
  assert.match(catalogue, /My learning/);
  const learnerHome = await readFile(new URL("../app/learn/page.tsx", import.meta.url), "utf8");
  assert.match(learnerHome, /nextLessonTitle/);
  assert.match(learnerHome, /Next lesson/);
  assert.match(learn, /YOU ARE ENROLLED/);
  assert.match(learn, /Start my first lesson/);
  assert.match(learn, /history\.replaceState/);
  assert.match(learn, /Preparing your recorded lesson/);
  assert.match(learn, /hasRecordedMedia/);
  assert.match(learn, /allowBrowserNarration=\{!hasRecordedMedia\}/);
  assert.match(styles, /\.auth-course-context/);
  assert.match(styles, /\.first-lesson-welcome/);
});

test("makes every lesson easy to understand, focus on, and complete", async () => {
  const [learn, guideSource, styles] = await Promise.all([
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/lesson-guide.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  const { getLessonGuide } = await import("../lib/lesson-guide.ts");
  const guide = getLessonGuide(`# Lesson title

## Your outcome

Explain the idea clearly.

## Core idea

Read this.

## Reflection

Apply it.`);
  assert.equal(guide.outcome, "Explain the idea clearly.");
  assert.deepEqual(guide.outline, ["Core idea", "Reflection"]);
  assert.match(learn, /TO FINISH/);
  assert.match(learn, /YOUR OUTCOME/);
  assert.match(learn, /IN THIS LESSON/);
  assert.match(learn, /Focus mode/);
  assert.match(learn, /omitLessonIntro/);
  assert.match(learn, /Saved lessons:/);
  assert.match(learn, /&larr; Previous/);
  assert.doesNotMatch(learn, /\? Previous/);
  assert.doesNotMatch(learn, /\? Save lesson/);
  assert.doesNotMatch(learn, /Download \?/);
  assert.doesNotMatch(learn, /continue \?/i);
  assert.match(guideSource, /getLessonGuide/);
  assert.match(styles, /\.lesson-brief/);
  assert.match(styles, /\.media-loading-card/);
  assert.match(styles, /\.learn-page\.focus-mode/);
});

test("keeps learner and creator navigation free of broken placeholder glyphs", async () => {
  const sources = await Promise.all([
    "../app/learn/[courseId]/page.tsx",
    "../app/learn/page.tsx",
    "../app/mastery/page.tsx",
    "../app/courses/page.tsx",
    "../app/tutors/page.tsx",
    "../app/dashboard/page.tsx",
    "../app/dashboard/integrations/page.tsx",
    "../app/dashboard/courses/[courseId]/page.tsx",
    "../app/dashboard/tutors/page.tsx",
    "../app/tutoring/page.tsx",
    "../app/courses/[courseId]/page.tsx",
    "../app/portfolio/[slug]/page.tsx",
    "../app/schools/[slug]/tutors/page.tsx",
    "../app/schools/[slug]/tutors/[tutorSlug]/page.tsx",
    "../app/account/page.tsx",
    "../app/layout.tsx",
    "../app/manifest.ts",
    "../lib/email-service.ts",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));
  for (const source of sources) {
    assert.doesNotMatch(source, />\s*\?\s*</);
    assert.doesNotMatch(source, /\w+ \?["<]/);
    assert.doesNotMatch(source, /\[OK\]/);
    assert.doesNotMatch(source, />o</);
    assert.doesNotMatch(source, /NorthStarLabs/);
  }
});

test("makes assessments teach with explanations, answer feedback, and guided retries", async () => {
  const [editor, authoringApi, submissionApi, learner, styles, migration] = await Promise.all([
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/quizzes/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/quizzes/[lessonId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0030_nice_franklin_storm.sql", import.meta.url), "utf8"),
  ]);
  const { buildQuizFeedback } = await import("../lib/quiz-feedback.ts");
  const result = buildQuizFeedback([
    {
      id: "q1",
      options: ["Proof", "Opinion"],
      correctIndex: 0,
      explanation: "Proof can be independently checked against evidence.",
    },
    {
      id: "q2",
      options: ["Guess", "Verify"],
      correctIndex: 1,
      explanation: "",
    },
  ], [0, 0]);

  assert.equal(result.correct, 1);
  assert.equal(result.feedback[0].correct, true);
  assert.equal(result.feedback[1].correct, false);
  assert.equal(result.feedback[1].selectedAnswer, "Guess");
  assert.equal(result.feedback[1].correctAnswer, "Verify");
  assert.match(result.feedback[1].explanation, /Revisit the lesson/);
  assert.match(editor, /Why is the correct answer right/);
  assert.match(editor, /assessment teaches, not only scores/);
  assert.match(authoringApi, /question\.explanation/);
  assert.match(submissionApi, /buildQuizFeedback/);
  assert.match(submissionApi, /Choose one valid answer for every question/);
  assert.match(learner, /Correct answer:/);
  assert.match(learner, /Review lesson/);
  assert.match(learner, /Try again/);
  assert.match(styles, /\.quiz-answer-feedback/);
  assert.match(migration, /ADD `explanation`/);
});

test("gives creators an honest, actionable learner-quality review", async () => {
  const [editor, readinessSource, readinessApi, styles] = await Promise.all([
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/course-readiness.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/courses/readiness/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/builder.css", import.meta.url), "utf8"),
  ]);
  const { getCourseReadiness } = await import("../lib/course-readiness.ts");
  const review = getCourseReadiness({
    title: "Practical Research",
    description: "A practical programme for people who want to test claims, compare evidence, and make better decisions in real work.",
    certificateTitle: "Certificate of completion",
    sections: [{ id: "section-1", title: "Test the evidence" }],
    lessons: [
      {
        id: "lesson-1",
        sectionId: "section-1",
        title: "Recognise a useful claim",
        lessonType: "video",
        content: "Read the explanation and compare the examples.",
        primaryAssetId: "asset-1",
        primaryAsset: { id: "asset-1", filename: "lesson.mp4", kind: "video", altText: "" },
        durationMinutes: 6,
        transcript: "",
        resources: [],
        quiz: null,
      },
      {
        id: "lesson-2",
        sectionId: "section-1",
        title: "Check your understanding",
        lessonType: "quiz",
        content: "Complete the knowledge check.",
        primaryAssetId: null,
        primaryAsset: null,
        durationMinutes: 4,
        transcript: "",
        resources: [],
        quiz: {
          questions: [{
            prompt: "What should you check first?",
            options: ["Evidence", "Popularity"],
            explanation: "",
          }],
        },
      },
    ],
  });

  assert.equal(review.blockers.length, 0);
  assert.ok(review.score < 90);
  assert.ok(review.improvements.some((issue) => issue.id === "lesson-1-transcript"));
  assert.ok(review.improvements.some((issue) => issue.id === "lesson-2-quiz-depth"));
  assert.ok(review.improvements.some((issue) => issue.id === "lesson-2-quiz-feedback"));
  assert.match(editor, /PRODUCTION READINESS REVIEW/);
  assert.match(editor, /Production \{readiness\?\.score/);
  assert.match(editor, /See the course a learner will experience/);
  assert.match(editor, /Preview as learner/);
  assert.match(editor, /not accreditation or subject approval/);
  assert.match(editor, /productionCoverage/);
  assert.match(editor, /PRODUCTION QUEUE/);
  assert.match(editor, /Continue production/);
  assert.match(editor, /Narration needed/);
  assert.match(editor, /openProductionLesson/);
  assert.match(readinessSource, /Add a learner outcome/);
  assert.match(readinessSource, /course-narrated-teaching/);
  assert.match(readinessSource, /productionQueue/);
  assert.match(readinessSource, /This course cannot honestly claim a fully narrated standard yet/);
  assert.match(readinessSource, /transcript improves accessibility/);
  assert.match(readinessSource, /quiz teaches as well as scores/);
  assert.match(readinessSource, /Fallback and parity assets prove that playback works/);
  assert.match(styles, /\.quality-score-card/);
  assert.match(styles, /\.production-coverage-grid/);
  assert.match(styles, /\.production-queue-list/);
  assert.match(styles, /\.lesson-quality-signal/);
  assert.match(readinessApi, /ma\.filename AS primaryFilename/);
  assert.match(readinessApi, /id: lesson\.primaryAssetId/);
  assert.match(readinessSource, /Attach playable primary media before learners reach this lesson/);
  assert.match(readinessSource, /needs an assessment/);

  const placeholderReview = getCourseReadiness({
    title: "Practical Research",
    description: "A practical programme for people who want to test claims, compare evidence, and make better decisions in real work.",
    certificateTitle: "Certificate of completion",
    sections: [{ id: "section-1", title: "Test the evidence" }],
    lessons: [{
      id: "lesson-placeholder",
      sectionId: "section-1",
      title: "Recognise a useful claim",
      lessonType: "video",
      content: "## Outcome\n\nRecognise whether a claim can be tested.\n\nRead the explanation and compare the examples.",
      primaryAssetId: "course-fallback-video",
      primaryAsset: { id: "course-fallback-video", filename: "fallback.mp4", kind: "video", altText: "" },
      durationMinutes: 6,
      transcript: "This transcript contains enough words to pass the accessibility check, but the asset is deliberately identified as fallback media and must not be treated as publishable teaching for a real lesson.",
      resources: [],
      quiz: null,
    }],
  });
  assert.ok(placeholderReview.blockers.some((issue) => issue.id === "lesson-placeholder-placeholder-media"));
  assert.ok(!placeholderReview.improvements.some((issue) => issue.id === "lesson-placeholder-outcome"));
});

test("makes narration and branded cinematic intros usable without an external provider", async () => {
  const [editor, uploads, provider, studio, integrations, styles] = await Promise.all([
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/uploads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/creator-studio.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/studio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/integrations/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/builder.css", import.meta.url), "utf8"),
  ]);

  assert.match(editor, /navigator\.mediaDevices\?\.getUserMedia/);
  assert.match(editor, /new MediaRecorder/);
  assert.match(editor, /canvas\.captureStream\(30\)/);
  assert.match(editor, /Record narration/);
  assert.match(editor, /Stop &amp; attach/);
  assert.match(editor, /Create branded intro/);
  assert.match(editor, /attachProducedMedia/);
  assert.match(editor, /Nothing is published automatically/);
  assert.match(uploads, /"audio\/webm"/);
  assert.match(provider, /narration: true/);
  assert.match(provider, /videoClips: true/);
  assert.match(provider, /aiNarration: gemini/);
  assert.match(provider, /aiVideoClips: gemini/);
  assert.match(studio, /Narration studio/);
  assert.match(studio, /Generate locally in your browser/);
  assert.match(integrations, /Self-service ready/);
  assert.match(styles, /\.self-media-studio/);
  assert.match(styles, /@keyframes northstar-wave/);
});

test("gives learners a private, shareable proof-of-learning portfolio", async () => {
  const [schema, migration, privateApi, publicApi, studio, publicPage, publicLayout, learnerHome, certificate, accountData, backup, deletion, styles] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0037_gigantic_tombstone.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/portfolio/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/portfolio/[slug]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio/[slug]/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/certificates/[code]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/account/data/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/platform-backup.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/course-deletion.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const learningPortfolios/);
  assert.match(schema, /export const portfolioSourceVisibility/);
  assert.match(schema, /export const portfolioEvidence/);
  assert.match(migration, /CREATE TABLE `learning_portfolios`/);
  assert.match(migration, /CREATE UNIQUE INDEX `learning_portfolios_slug_unique`/);
  assert.match(migration, /CREATE TABLE `portfolio_source_visibility`/);
  assert.match(migration, /CREATE TABLE `portfolio_evidence`/);
  assert.match(privateApi, /requireApiUser/);
  assert.match(privateApi, /Nothing is shared by default|portfolio_source_visibility/);
  assert.match(privateApi, /Only a currently valid certificate can be shared/);
  assert.match(privateApi, /qa\.passed=1/);
  assert.match(privateApi, /url\.protocol === "https:"/);
  assert.match(publicApi, /lp\.visibility='published'/);
  assert.match(publicApi, /psv\.visible=1/);
  assert.match(publicApi, /cert\.status='active'/);
  assert.doesNotMatch(publicApi, /email/);
  assert.match(studio, /Your learning should be visible/);
  assert.match(studio, /Show score/);
  assert.match(studio, /learner-submitted/);
  assert.match(publicPage, /ACADEMY-VERIFIED/);
  assert.match(publicPage, /NORTHSTAR-RECORDED/);
  assert.match(publicPage, /LEARNER-SUBMITTED/);
  assert.match(publicPage, /Score kept private/);
  assert.match(publicLayout, /index: false/);
  assert.match(learnerHome, /Proof portfolio/);
  assert.match(certificate, /Add to proof portfolio/);
  assert.match(accountData, /portfolioSourceChoices/);
  assert.match(accountData, /portfolioEvidence/);
  assert.match(backup, /"learning_portfolios"/);
  assert.match(deletion, /DELETE FROM portfolio_source_visibility/);
  assert.match(styles, /\.portfolio-studio/);
  assert.match(styles, /\.public-portfolio/);
  assert.match(learnerHome, /Build my proof portfolio/);
  assert.match(learnerHome, /href="\/portfolio"/);
});

test("turns assessment mistakes into a private, spaced personal mastery loop", async () => {
  const [schema, migration, submission, masteryApi, masteryPage, masteryLayout, learnerHome, courseEditor, accountData, backup, deletion, privacy, styles] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0038_adorable_komodo.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/api/quizzes/[lessonId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/mastery/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/mastery/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mastery/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/courses/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/account/data/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/platform-backup.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/course-deletion.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  const { nextMasteryState, normaliseConceptLabel } = await import("../lib/mastery.ts");
  const missed = nextMasteryState(null, false, 1_000);
  assert.deepEqual(missed, {
    status: "needs_review", wrongCount: 1, correctStreak: 0,
    nextReviewAt: 1_000, masteredAt: null,
  });
  const strengthening = nextMasteryState(missed, true, 2_000);
  assert.equal(strengthening.status, "practising");
  assert.equal(strengthening.correctStreak, 1);
  assert.equal(strengthening.nextReviewAt, 2_000 + 86_400_000);
  const mastered = nextMasteryState(strengthening, true, 3_000);
  assert.equal(mastered.status, "mastered");
  assert.equal(mastered.correctStreak, 2);
  assert.equal(mastered.masteredAt, 3_000);
  assert.equal(normaliseConceptLabel("  Fixed   supply  ", "ignored"), "Fixed supply");
  assert.match(schema, /export const learnerConceptMastery/);
  assert.match(schema, /export const masteryPracticeAttempts/);
  assert.match(migration, /CREATE TABLE `learner_concept_mastery`/);
  assert.match(migration, /CREATE TABLE `mastery_practice_attempts`/);
  assert.match(migration, /ADD `concept_label`/);
  assert.match(submission, /nextMasteryState/);
  assert.match(submission, /weakConcepts/);
  assert.match(submission, /ON CONFLICT\(user_id,question_id\)/);
  assert.match(masteryApi, /requireApiUser/);
  assert.match(masteryApi, /private, no-store/);
  assert.match(masteryApi, /mastery_practice_attempts/);
  assert.match(masteryApi, /optionsJson: undefined/);
  assert.match(masteryPage, /Turn every mistake into something you master/);
  assert.match(masteryPage, /answer it correctly twice/);
  assert.match(masteryLayout, /index: false/);
  assert.match(learnerHome, /Personal Mastery Loop|PERSONAL MASTERY LOOP/);
  assert.match(courseEditor, /Concept to master/);
  assert.match(accountData, /masteryConcepts/);
  assert.match(accountData, /masteryPracticeAttempts/);
  assert.match(backup, /"learner_concept_mastery"/);
  assert.match(deletion, /DELETE FROM learner_concept_mastery/);
  assert.match(privacy, /private concept-mastery and practice records/);
  assert.match(styles, /\.mastery-page/);
  assert.match(styles, /\.quiz-mastery-callout/);
  assert.match(learnerHome, /href="\/mastery"/);
  assert.match(learnerHome, /Start focused review|See my concept map/);
});

test("turns public learning demand into a moderated, honest product roadmap", async () => {
  const [schema, migration, page, board, api, adminApi, admin, home, sitemap, robots, security, accountData, backup, privacy, terms, email, styles] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0042_red_living_mummy.sql", import.meta.url), "utf8"),
    readFile(new URL("../app/demand/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demand/demand-board.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/demand/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/platform/overview/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/security.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/account/data/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/platform-backup.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/privacy/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/legal/terms/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/email-service.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /export const demandTopics/);
  assert.match(schema, /export const demandVotes/);
  assert.match(schema, /export const demandFollowers/);
  assert.match(migration, /CREATE TABLE `demand_topics`/);
  assert.match(migration, /CREATE UNIQUE INDEX `demand_votes_topic_voter_unique`/);
  assert.match(migration, /starter-demand-bitcoin-custody/);
  assert.doesNotMatch(migration, /INSERT INTO `demand_votes`/);
  assert.match(page, /Demand Board/);
  assert.match(board, /Real signals\./);
  assert.match(board, /No fake votes\./);
  assert.match(board, /Help decide what Northstar builds next\./);
  assert.match(board, /Upvote|Support/);
  assert.match(board, /Follow/);
  assert.match(api, /__Host-northstar-demand-voter/);
  assert.match(api, /HttpOnly; Secure; SameSite=Lax/);
  assert.match(api, /sha256Hex\(`demand-voter:/);
  assert.match(api, /only the topic and summary can become public/);
  assert.match(api, /visibility='published'/);
  assert.match(adminApi, /targetType === "demand_topic"/);
  assert.match(adminApi, /demand_update/);
  assert.match(admin, /PUBLIC DEMAND BOARD/);
  assert.match(admin, /Mark available/);
  assert.match(home, /href="\/demand"/);
  assert.match(sitemap, /\/demand/);
  assert.match(robots, /\/demand/);
  assert.match(security, /scope: "demand_board"/);
  assert.match(accountData, /demandBoardFollows/);
  assert.match(accountData, /DELETE FROM demand_followers/);
  assert.match(backup, /"demand_topics"/);
  assert.match(privacy, /random browser identifier/);
  assert.match(terms, /signals, not purchases/);
  assert.match(email, /demand_following/);
  assert.match(email, /demand_update/);
  assert.match(styles, /\.demand-page/);
  assert.match(styles, /\.demand-admin-section/);
});

test("gives learners a persistent low-bandwidth, text-first course mode", async () => {
  const [mode, player, learnerHome, learnApi, styles] = await Promise.all([
    readFile(new URL("../lib/low-bandwidth.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/learn/[courseId]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
  ]);
  assert.match(mode, /northstarlabs:low-bandwidth/);
  assert.match(mode, /connection\?\.saveData/);
  assert.match(mode, /window\.localStorage\.setItem/);
  assert.match(learnApi, /url\.searchParams\.get\("compact"\) === "1"/);
  assert.match(learnApi, /requestedLessonId/);
  assert.match(learnApi, /content: includeDetail \? lesson\.content : ""/);
  assert.match(learnApi, /resources: includeDetail/);
  assert.match(learnApi, /detailLoaded: includeDetail/);
  assert.match(learnApi, /publicLessonFields/);
  assert.match(learnApi, /"videoKey", "primaryKey"/);
  assert.ok(player.indexOf("if (!mediaRequested) return;") < player.indexOf('fetch("/api/media/playback"'));
  assert.match(player, /setMediaRequested\(true\)/);
  assert.match(player, /preload=\{effectiveLowBandwidth \? "none" : "metadata"\}/);
  assert.doesNotMatch(player, /autoPlay=\{!effectiveLowBandwidth/);
  assert.match(player, /Only the open lesson&apos;s text and activities are transferred/);
  assert.match(player, /Text-first lesson ready/);
  assert.match(player, /school\?\.logoUrl && !effectiveLowBandwidth/);
  assert.match(learnerHome, /Low-data on/);
  assert.match(learnerHome, /Courses will load text first/);
  assert.match(styles, /\.low-bandwidth-media/);
  assert.match(styles, /\.bandwidth-notice/);
  assert.match(styles, /\.learner-bandwidth-notice/);
});

test("adds purposeful learner guidance, motion, and milestone recognition", async () => {
  const [learner, help, layout, styles, pkg] = await Promise.all([
    readFile(new URL("../app/learn/[courseId]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/learn/[courseId]/lesson-help.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/system.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(pkg, /"motion"/);
  assert.match(pkg, /"driver\.js"/);
  assert.match(pkg, /"canvas-confetti"/);
  assert.match(layout, /driver\.js\/dist\/driver\.css/);
  assert.match(learner, /Show me around/);
  assert.match(learner, /useReducedMotion/);
  assert.match(learner, /disableForReducedMotion: true/);
  assert.match(learner, /effectiveLowBandwidth \|\| shouldReduceMotion/);
  assert.match(learner, /A real milestone\. Keep the momentum going\./);
  assert.match(help, /data-tour="lesson-help"/);
  assert.match(styles, /\.learning-celebration/);
  assert.match(styles, /\.northstar-course-tour/);
});
