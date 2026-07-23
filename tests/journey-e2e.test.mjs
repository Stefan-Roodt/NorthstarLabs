import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  oversizedJsonRequest,
  rateLimitPolicy,
  sha256Hex,
} from "../lib/security.ts";
import { serializeTutor, tutorColumns } from "../lib/tutors.ts";

async function migratedDatabase() {
  const database = new DatabaseSync(":memory:");
  const directory = new URL("../drizzle/", import.meta.url);
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort();
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
    const sql = await readFile(new URL(file, directory), "utf8");
    for (const statement of sql
      .split(/--> statement-breakpoint\s*/)
      .map((value) => value.trim())
      .filter(Boolean)) {
      database.exec(statement);
    }
  }
  return database;
}

test("publishes Stefan's video-first Web3 course as a NorthstarLabs signature programme", async () => {
  const db = await migratedDatabase();
  const course = db.prepare(`
    SELECT c.title,c.status,c.price_cents AS priceCents,
      c.enforce_lesson_order AS enforceLessonOrder,c.certificate_title AS certificateTitle,
      c.owner_id AS ownerId,c.school_id AS schoolId
    FROM courses c
    WHERE c.id='stefan-web3-foundations'
  `).get();
  assert.deepEqual({ ...course }, {
    title: "Web3 Product Lab: From Protocol to Proof",
    status: "published",
    priceCents: 0,
    enforceLessonOrder: 1,
    certificateTitle: "NorthstarLabs Distinction: Responsible Web3 Product Design",
    ownerId: "northstar-web3-faculty",
    schoolId: "northstarlabs",
  });

  const curriculum = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM course_sections WHERE course_id='stefan-web3-foundations') AS sections,
      (SELECT COUNT(*) FROM lessons WHERE course_id='stefan-web3-foundations') AS lessons,
      (SELECT COUNT(*) FROM lessons WHERE course_id='stefan-web3-foundations' AND lesson_type='video') AS videos,
      (SELECT COUNT(*) FROM quizzes q JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id='stefan-web3-foundations') AS quizzes,
      (SELECT COUNT(*) FROM quiz_questions qq JOIN quizzes q ON q.id=qq.quiz_id JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id='stefan-web3-foundations') AS questions,
      (SELECT MIN(duration_minutes) FROM lessons WHERE course_id='stefan-web3-foundations') AS shortest,
      (SELECT MAX(duration_minutes) FROM lessons WHERE course_id='stefan-web3-foundations') AS longest,
      (SELECT COUNT(*) FROM lessons WHERE course_id='stefan-web3-foundations' AND lesson_type='video' AND LENGTH(transcript)>1800) AS scriptedVideos
  `).get();
  assert.deepEqual({ ...curriculum }, {
    sections: 6,
    lessons: 24,
    videos: 1,
    quizzes: 6,
    questions: 33,
    shortest: 6,
    longest: 6,
    scriptedVideos: 0,
  });

  const orphans = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM course_sections cs LEFT JOIN courses c ON c.id=cs.course_id WHERE c.id IS NULL) +
      (SELECT COUNT(*) FROM lessons l LEFT JOIN courses c ON c.id=l.course_id WHERE c.id IS NULL) +
      (SELECT COUNT(*) FROM quizzes q LEFT JOIN lessons l ON l.id=q.lesson_id WHERE l.id IS NULL) +
      (SELECT COUNT(*) FROM quiz_questions qq LEFT JOIN quizzes q ON q.id=qq.quiz_id WHERE q.id IS NULL)
      AS count
  `).get();
  assert.equal(orphans.count, 0);
});

test("publishes Stefan's evidence-led Bitcoin deep dive as a NorthstarLabs signature programme", async () => {
  const db = await migratedDatabase();
  const course = db.prepare(`
    SELECT c.title,c.status,c.price_cents AS priceCents,
      c.enforce_lesson_order AS enforceLessonOrder,c.certificate_title AS certificateTitle,
      c.owner_id AS ownerId,c.school_id AS schoolId
    FROM courses c
    WHERE c.id='stefan-bitcoin-genesis-next-era'
  `).get();
  assert.deepEqual({ ...course }, {
    title: "Bitcoin Intelligence: From Genesis Block to Boardroom",
    status: "published",
    priceCents: 0,
    enforceLessonOrder: 1,
    certificateTitle: "NorthstarLabs Distinction: Bitcoin Intelligence",
    ownerId: "northstar-bitcoin-faculty",
    schoolId: "northstarlabs",
  });

  const curriculum = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM course_sections WHERE course_id='stefan-bitcoin-genesis-next-era') AS sections,
      (SELECT COUNT(*) FROM lessons WHERE course_id='stefan-bitcoin-genesis-next-era') AS lessons,
      (SELECT COUNT(*) FROM lessons WHERE course_id='stefan-bitcoin-genesis-next-era' AND lesson_type='video') AS videos,
      (SELECT COUNT(*) FROM quizzes q JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id='stefan-bitcoin-genesis-next-era') AS quizzes,
      (SELECT COUNT(*) FROM quiz_questions qq JOIN quizzes q ON q.id=qq.quiz_id JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id='stefan-bitcoin-genesis-next-era') AS questions,
      (SELECT MIN(duration_minutes) FROM lessons WHERE course_id='stefan-bitcoin-genesis-next-era') AS shortest,
      (SELECT MAX(duration_minutes) FROM lessons WHERE course_id='stefan-bitcoin-genesis-next-era') AS longest,
      (SELECT COUNT(*) FROM lessons WHERE course_id='stefan-bitcoin-genesis-next-era' AND lesson_type='video' AND LENGTH(transcript)>1600) AS scriptedVideos
  `).get();
  assert.deepEqual({ ...curriculum }, {
    sections: 7,
    lessons: 35,
    videos: 1,
    quizzes: 7,
    questions: 42,
    shortest: 6,
    longest: 6,
    scriptedVideos: 0,
  });

  const sourceCoverage = db.prepare(`
    SELECT
      SUM(CASE WHEN content LIKE '%bitcoin.org/bitcoin.pdf%' THEN 1 ELSE 0 END) AS whitepaper,
      SUM(CASE WHEN content LIKE '%developer.bitcoin.org%' THEN 1 ELSE 0 END) AS developerDocs,
      SUM(CASE WHEN content LIKE '%github.com/bitcoin/bips%' THEN 1 ELSE 0 END) AS bips,
      SUM(CASE WHEN content LIKE '%lightning/bolts%' THEN 1 ELSE 0 END) AS lightning,
      SUM(CASE WHEN content LIKE '%ccaf.io/cbnsi/cbeci%' THEN 1 ELSE 0 END) AS energy
    FROM lessons
    WHERE course_id='stefan-bitcoin-genesis-next-era'
  `).get();
  assert.ok(sourceCoverage.whitepaper >= 1);
  assert.ok(sourceCoverage.developerDocs >= 3);
  assert.ok(sourceCoverage.bips >= 3);
  assert.ok(sourceCoverage.lightning >= 1);
  assert.ok(sourceCoverage.energy >= 1);
});

test("places a complete Bitcoin review draft in the CogniZen creator workspace", async () => {
  const db = await migratedDatabase();
  const course = db.prepare(`
    SELECT c.title,c.status,c.owner_id AS ownerId,s.slug AS schoolSlug,
      (SELECT COUNT(*) FROM course_sections
       WHERE course_id=c.id) AS sections,
      (SELECT COUNT(*) FROM lessons
       WHERE course_id=c.id) AS lessons,
      (SELECT COUNT(*) FROM quizzes q
       JOIN lessons l ON l.id=q.lesson_id
       WHERE l.course_id=c.id) AS quizzes,
      (SELECT COUNT(*) FROM quiz_questions qq
       JOIN quizzes q ON q.id=qq.quiz_id
       JOIN lessons l ON l.id=q.lesson_id
       WHERE l.course_id=c.id) AS questions,
      (SELECT COUNT(*) FROM lessons
       WHERE course_id=c.id
         AND (lower(trim(title))='untitled lesson' OR trim(title)='')) AS placeholders,
      (SELECT COUNT(*) FROM lessons
       WHERE course_id=c.id
         AND lower(content) NOT LIKE '%## your outcome%') AS missingOutcomes,
      (SELECT COUNT(*) FROM quiz_questions qq
       JOIN quizzes q ON q.id=qq.quiz_id
       JOIN lessons l ON l.id=q.lesson_id
       WHERE l.course_id=c.id
         AND trim(qq.explanation)='') AS missingFeedback
    FROM courses c
    JOIN schools s ON s.id=c.school_id
    WHERE c.id='cognizen-bitcoin-intelligence-draft'
  `).get();
  assert.deepEqual({ ...course }, {
    title: "Bitcoin Intelligence: From Genesis Block to Boardroom — Review draft",
    status: "draft",
    ownerId: "stefan-course-owner-fixture",
    schoolSlug: "cognizen-consulting",
    sections: 7,
    lessons: 35,
    quizzes: 7,
    questions: 42,
    placeholders: 0,
    missingOutcomes: 0,
    missingFeedback: 0,
  });
  const publishedOriginal = db.prepare(`
    SELECT status,school_id AS schoolId
    FROM courses WHERE id='stefan-bitcoin-genesis-next-era'
  `).get();
  assert.deepEqual({ ...publishedOriginal }, {
    status: "published",
    schoolId: "northstarlabs",
  });
});

test("seeds a complete interactive Module 2.3 as a private CogniZen pilot", async () => {
  const db = await migratedDatabase();
  const pilot = db.prepare(`
    SELECT c.title,c.status,s.slug AS schoolSlug,
      (SELECT COUNT(*) FROM course_sections WHERE course_id=c.id) AS sections,
      (SELECT COUNT(*) FROM lessons WHERE course_id=c.id) AS lessons,
      (SELECT COUNT(*) FROM lessons WHERE course_id=c.id AND trim(experience_json)<>'') AS interactiveLessons,
      (SELECT COUNT(*) FROM quizzes q JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id=c.id) AS quizzes,
      (SELECT COUNT(*) FROM quiz_questions qq JOIN quizzes q ON q.id=qq.quiz_id
        JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id=c.id) AS questions,
      (SELECT MAX(duration_minutes) FROM lessons WHERE course_id=c.id) AS longest
    FROM courses c JOIN schools s ON s.id=c.school_id
    WHERE c.id='cognizen-crypto-mastery-part-2-pilot'
  `).get();
  assert.deepEqual({ ...pilot }, {
    title: "Crypto Mastery: Markets and Applications — Interactive pilot",
    status: "draft",
    schoolSlug: "cognizen-consulting",
    sections: 4,
    lessons: 24,
    interactiveLessons: 20,
    quizzes: 4,
    questions: 46,
    longest: 6,
  });
  const experiences = db.prepare(`
    SELECT experience_json AS experienceJson FROM lessons
    WHERE course_id='cognizen-crypto-mastery-part-2-pilot' AND trim(experience_json)<>''
    ORDER BY position
  `).all();
  assert.equal(experiences.length, 20);
  for (const row of experiences) {
    const parsed = JSON.parse(row.experienceJson);
    assert.equal(parsed.version, 1);
    assert.ok(parsed.scenes.length >= 1);
    assert.ok(["classify", "branch", "meter"].includes(parsed.activity.kind));
  }
});

test("seeds the complete three-part Crypto Mastery programme with its guided orientation", async () => {
  const db = await migratedDatabase();
  const course = db.prepare(`
    SELECT c.title,c.status,s.slug AS schoolSlug,
      (SELECT COUNT(*) FROM course_sections WHERE course_id=c.id) AS sections,
      (SELECT COUNT(*) FROM lessons WHERE course_id=c.id) AS lessons,
      (SELECT COUNT(*) FROM lessons WHERE course_id=c.id AND trim(experience_json)<>'') AS interactiveLessons,
      (SELECT COUNT(*) FROM quizzes q JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id=c.id) AS quizzes,
      (SELECT COUNT(*) FROM quiz_questions qq JOIN quizzes q ON q.id=qq.quiz_id
        JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id=c.id) AS questions,
      (SELECT MAX(duration_minutes) FROM lessons WHERE course_id=c.id) AS longest
    FROM courses c JOIN schools s ON s.id=c.school_id
    WHERE c.id='cognizen-crypto-mastery-foundations-production'
  `).get();
  assert.deepEqual({ ...course }, {
    title: "Crypto Mastery: Digital Assets — Complete Programme",
    status: "draft",
    schoolSlug: "cognizen-consulting",
    sections: 95,
    lessons: 724,
    interactiveLessons: 96,
    quizzes: 95,
    questions: 576,
    longest: 6,
  });
  const activities = db.prepare(`
    SELECT experience_json AS experienceJson FROM lessons
    WHERE course_id='cognizen-crypto-mastery-foundations-production'
      AND trim(experience_json)<>''
  `).all().map((row) => JSON.parse(row.experienceJson).activity.kind);
  assert.equal(activities.length, 96);
  assert.ok(activities.includes("classify"));
  assert.ok(activities.includes("branch"));
  assert.ok(activities.includes("meter"));
  const incompleteQuestions = db.prepare(`
    SELECT COUNT(*) AS count FROM quiz_questions qq
    JOIN quizzes q ON q.id=qq.quiz_id JOIN lessons l ON l.id=q.lesson_id
    WHERE l.course_id='cognizen-crypto-mastery-foundations-production'
      AND (trim(qq.explanation)='' OR trim(qq.concept_label)='')
  `).get();
  assert.equal(incompleteQuestions.count, 0);
});

test("completes an isolated creator-to-learner production journey", async () => {
  const db = await migratedDatabase();
  const now = Date.UTC(2026, 6, 19);
  db.exec(`
    INSERT INTO profiles
      (id,email,display_name,role,onboarding_path,onboarding_completed,status,created_at)
    VALUES
      ('journey-creator','journey-creator@example.com','Journey Creator','creator','creator',1,'active',${now}),
      ('journey-learner','journey-learner@example.com','Journey Learner','learner','learner',1,'active',${now}),
      ('outsider','outsider@example.com','Other Creator','creator','creator',1,'active',${now});
    INSERT INTO schools
      (id,slug,name,description,primary_color,accent_color,hero_title,hero_description,
       font_theme,support_email,seo_title,seo_description,show_community,owner_id,status,created_at,updated_at)
    VALUES
      ('journey-school','journey-academy','Journey Academy','','#3556d8','#ffbd8a','','',
       'modern','','','',1,'journey-creator','active',${now},${now}),
      ('outsider-school','outsider-academy','Outsider Academy','','#3556d8','#ffbd8a','','',
       'modern','','','',1,'outsider','active',${now},${now});
    INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
    VALUES
      ('journey-owner','journey-school','journey-creator','owner','active',${now}),
      ('journey-member','journey-school','journey-learner','learner','active',${now}),
      ('outsider-owner','outsider-school','outsider','owner','active',${now});
    INSERT INTO communities
      (id,school_id,owner_id,name,description,access_type,allow_posting,created_at)
    VALUES ('journey-community','journey-school','journey-creator','Journey Community','','enrolled',1,${now});
    INSERT INTO community_members (id,community_id,user_id,role,status,joined_at)
    VALUES
      ('journey-community-owner','journey-community','journey-creator','owner','active',${now}),
      ('journey-community-member','journey-community','journey-learner','member','active',${now});
    INSERT INTO courses
      (id,school_id,owner_id,title,description,status,price_cents,created_at,updated_at)
    VALUES
      ('journey-course','journey-school','journey-creator','Launch Course',
       'A complete creator to learner journey.','published',0,${now},${now});
    INSERT INTO course_sections (id,course_id,title,position,created_at)
    VALUES ('journey-section','journey-course','Start here',0,${now});
    INSERT INTO lessons
      (id,course_id,section_id,title,lesson_type,content,content_format,
       duration_minutes,is_preview,available_after_days,required_watch_percent,
       transcript,position,updated_at)
    VALUES
      ('journey-lesson','journey-course','journey-section','First lesson','quiz',
       'Complete the practical exercise.','markdown',5,0,0,0,'Accessible transcript',0,${now});
    INSERT INTO quizzes (id,lesson_id,title,passing_score,max_attempts)
    VALUES ('journey-quiz','journey-lesson','Knowledge check',80,3);
    INSERT INTO quiz_questions
      (id,quiz_id,prompt,options_json,correct_index,position)
    VALUES ('journey-question','journey-quiz','Ready?','["Yes","No"]',0,0);
    INSERT INTO enrollments
      (id,user_id,course_id,progress,status,support_note,last_activity_at,created_at)
    VALUES
      ('journey-enrollment','journey-learner','journey-course',100,'active','',${now},${now});
    INSERT INTO lesson_progress
      (id,user_id,lesson_id,completed,watched_percent,notes,bookmarked,updated_at)
    VALUES
      ('journey-progress','journey-learner','journey-lesson',1,100,'Useful lesson',1,${now});
    INSERT INTO quiz_attempts
      (id,quiz_id,user_id,attempt_number,answers_json,score,passed,submitted_at)
    VALUES
      ('journey-attempt','journey-quiz','journey-learner',1,'[0]',100,1,${now});
    INSERT INTO certificates
      (id,user_id,course_id,code,issued_at,recipient_name,course_title,
       certificate_title,accent_color,status)
    VALUES
      ('journey-certificate','journey-learner','journey-course','NSL-JOURNEY',${now},
       'Journey Learner','Launch Course','Certificate of Completion','#3556d8','active');
    INSERT INTO posts
      (id,community_id,author_id,body,status,created_at)
    VALUES
      ('journey-post','journey-community','journey-creator','Welcome to the course.','visible',${now});
    INSERT INTO content_reports
      (id,school_id,community_id,post_id,reporter_id,reason,detail,status,created_at)
    VALUES
      ('journey-report','journey-school','journey-community','journey-post',
       'journey-learner','other','Please review.','open',${now});
  `);

  const journey = db.prepare(`
    SELECT e.progress,lp.completed,qa.score,qa.passed,cert.code,
      cr.status AS reportStatus
    FROM enrollments e
    JOIN lesson_progress lp ON lp.user_id=e.user_id
    JOIN quiz_attempts qa ON qa.user_id=e.user_id
    JOIN certificates cert ON cert.user_id=e.user_id AND cert.course_id=e.course_id
    JOIN content_reports cr ON cr.reporter_id=e.user_id
    WHERE e.user_id='journey-learner' AND e.course_id='journey-course'
  `).get();
  assert.deepEqual({ ...journey }, {
    progress: 100,
    completed: 1,
    score: 100,
    passed: 1,
    code: "NSL-JOURNEY",
    reportStatus: "open",
  });

  const outsiderAccess = db.prepare(`
    SELECT c.id FROM courses c
    JOIN schools s ON s.id=c.school_id AND s.status='active'
    JOIN school_members sm ON sm.school_id=c.school_id
    WHERE c.id='journey-course' AND sm.user_id='outsider'
      AND sm.status='active' AND sm.role IN ('owner','admin','instructor')
  `).get();
  assert.equal(outsiderAccess, undefined);
  assert.throws(() => db.exec(`
    INSERT INTO content_reports
      (id,school_id,community_id,post_id,reporter_id,reason,detail,status,created_at)
    VALUES
      ('duplicate-report','journey-school','journey-community','journey-post',
       'journey-learner','spam','','open',${now});
  `), /UNIQUE constraint failed/);
});

test("archives the legacy shelf and publishes the AI signature programme", async () => {
  const db = await migratedDatabase();
  const courseIds = [
    "design-lessons-people-remember",
    "build-a-trusted-tutoring-practice",
    "teach-with-ai-responsibly",
  ];
  for (const courseId of courseIds) {
    const course = db.prepare(`
      SELECT status,price_cents AS priceCents,
        enforce_lesson_order AS enforceLessonOrder
      FROM courses WHERE id=?
    `).get(courseId);
    assert.equal(course.status, "archived");
    assert.equal(course.priceCents, 0);
    assert.equal(course.enforceLessonOrder, 1);
    assert.equal(
      db.prepare("SELECT COUNT(*) AS count FROM course_sections WHERE course_id=?")
        .get(courseId).count,
      2,
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) AS count FROM lessons WHERE course_id=?")
        .get(courseId).count,
      6,
    );
    assert.ok(
      db.prepare("SELECT MIN(length(content)) AS shortest FROM lessons WHERE course_id=?")
        .get(courseId).shortest > 900,
    );
    assert.equal(
      db.prepare(`
        SELECT COUNT(*) AS count FROM quizzes q
        JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id=?
      `).get(courseId).count,
      1,
    );
    assert.equal(
      db.prepare(`
        SELECT COUNT(*) AS count FROM quiz_questions qq
        JOIN quizzes q ON q.id=qq.quiz_id
        JOIN lessons l ON l.id=q.lesson_id WHERE l.course_id=?
      `).get(courseId).count,
      5,
    );
  }
  const signature = db.prepare(`
    SELECT status,price_cents AS priceCents,enforce_lesson_order AS enforceLessonOrder
    FROM courses WHERE id='northstar-ai-command-studio'
  `).get();
  assert.deepEqual({ ...signature }, {
    status: "published",
    priceCents: 0,
    enforceLessonOrder: 1,
  });
  assert.equal(
    db.prepare("SELECT COUNT(*) AS count FROM lessons WHERE course_id='northstar-ai-command-studio'")
      .get().count,
    12,
  );
  assert.equal(
    db.prepare(`
      SELECT COUNT(*) AS count FROM quizzes q
      JOIN lessons l ON l.id=q.lesson_id
      WHERE l.course_id='northstar-ai-command-studio'
    `).get().count,
    4,
  );
});

test("keeps generated narration drafts separate until an educator approves them", async () => {
  const db = await migratedDatabase();
  const lesson = db.prepare(`
    SELECT id,transcript FROM lessons
    WHERE course_id='cognizen-crypto-mastery-foundations-production'
      AND lesson_type<>'quiz'
    ORDER BY id LIMIT 1
  `).get();
  assert.ok(lesson);
  const originalTranscript = lesson.transcript;
  const now = 1784840000000;
  db.prepare(`
    INSERT INTO lesson_narration_drafts
      (id,school_id,course_id,lesson_id,draft_text,status,source,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,'draft','lesson_content',?,?,?)
  `).run(
    "journey-narration-draft",
    "stefan-course-school-fixture",
    "cognizen-crypto-mastery-foundations-production",
    lesson.id,
    Array.from({ length: 60 }, (_, index) => `review-word-${index}`).join(" "),
    "stefan-course-owner-fixture",
    now,
    now,
  );

  assert.equal(
    db.prepare("SELECT status FROM lesson_narration_drafts WHERE id='journey-narration-draft'").get().status,
    "draft",
  );
  assert.equal(
    db.prepare("SELECT transcript FROM lessons WHERE id=?").get(lesson.id).transcript,
    originalTranscript,
  );
  assert.throws(() => db.prepare(`
    INSERT INTO lesson_narration_drafts
      (id,school_id,course_id,lesson_id,draft_text,status,source,created_by,created_at,updated_at)
    VALUES ('duplicate-draft','stefan-course-school-fixture',
      'cognizen-crypto-mastery-foundations-production',?,'Duplicate','draft',
      'lesson_content','stefan-course-owner-fixture',?,?)
  `).run(lesson.id, now, now), /UNIQUE constraint failed/);
  assert.throws(() => db.prepare(
    "UPDATE lesson_narration_drafts SET status='published' WHERE id='journey-narration-draft'",
  ).run(), /CHECK constraint failed/);
});

test("safe course deletion leaves no learner or assessment orphans", async () => {
  const db = await migratedDatabase();
  const now = Date.UTC(2026, 6, 19);
  db.exec(`
    INSERT INTO profiles (id,email,display_name,role,status,created_at)
    VALUES
      ('delete-creator','delete-creator@example.com','Delete Creator','creator','active',${now}),
      ('delete-learner','delete-learner@example.com','Delete Learner','learner','active',${now});
    INSERT INTO schools
      (id,slug,name,description,primary_color,accent_color,hero_title,hero_description,
       font_theme,support_email,seo_title,seo_description,show_community,owner_id,status,created_at,updated_at)
    VALUES
      ('delete-school','delete-school','Delete School','','#3556d8','#ffbd8a','','',
       'modern','','','',1,'delete-creator','active',${now},${now});
    INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
    VALUES ('delete-owner','delete-school','delete-creator','owner','active',${now});
    INSERT INTO courses
      (id,school_id,owner_id,title,description,status,price_cents,created_at,updated_at)
    VALUES ('delete-course','delete-school','delete-creator','Delete Course','Complete course','draft',0,${now},${now});
    INSERT INTO course_sections (id,course_id,title,position,created_at)
    VALUES ('delete-section','delete-course','Section',0,${now});
    INSERT INTO lessons
      (id,course_id,section_id,title,lesson_type,content,content_format,duration_minutes,
       is_preview,available_after_days,required_watch_percent,transcript,position,updated_at)
    VALUES ('delete-lesson','delete-course','delete-section','Lesson','quiz','Text','markdown',
       0,0,0,0,'',0,${now});
    INSERT INTO quizzes (id,lesson_id,title,passing_score,max_attempts)
    VALUES ('delete-quiz','delete-lesson','Quiz',80,0);
    INSERT INTO quiz_questions (id,quiz_id,prompt,options_json,correct_index,position)
    VALUES ('delete-question','delete-quiz','Question','["A","B"]',0,0);
    INSERT INTO enrollments
      (id,user_id,course_id,progress,status,support_note,created_at)
    VALUES ('delete-enrollment','delete-learner','delete-course',10,'active','',${now});
    INSERT INTO lesson_progress
      (id,user_id,lesson_id,completed,watched_percent,notes,bookmarked,updated_at)
    VALUES ('delete-progress','delete-learner','delete-lesson',0,10,'',0,${now});
    INSERT INTO quiz_attempts
      (id,quiz_id,user_id,attempt_number,answers_json,score,passed,submitted_at)
    VALUES ('delete-attempt','delete-quiz','delete-learner',1,'[1]',0,0,${now});
    INSERT INTO certificates
      (id,user_id,course_id,code,issued_at,recipient_name,course_title,
       certificate_title,accent_color,status)
    VALUES ('delete-cert','delete-learner','delete-course','DELETE-CERT',${now},
      'Delete Learner','Delete Course','Certificate','#3556d8','active');
  `);
  db.exec(`
    DELETE FROM quiz_attempts WHERE quiz_id IN (
      SELECT q.id FROM quizzes q JOIN lessons l ON l.id=q.lesson_id
      WHERE l.course_id='delete-course'
    );
    DELETE FROM quiz_questions WHERE quiz_id IN (
      SELECT q.id FROM quizzes q JOIN lessons l ON l.id=q.lesson_id
      WHERE l.course_id='delete-course'
    );
    DELETE FROM quizzes WHERE lesson_id IN (
      SELECT id FROM lessons WHERE course_id='delete-course'
    );
    DELETE FROM lesson_progress WHERE lesson_id IN (
      SELECT id FROM lessons WHERE course_id='delete-course'
    );
    DELETE FROM lesson_resources WHERE lesson_id IN (
      SELECT id FROM lessons WHERE course_id='delete-course'
    );
    DELETE FROM media_playback_grants WHERE course_id='delete-course';
    DELETE FROM lessons WHERE course_id='delete-course';
    DELETE FROM course_sections WHERE course_id='delete-course';
    DELETE FROM enrollments WHERE course_id='delete-course';
    DELETE FROM certificates WHERE course_id='delete-course';
    DELETE FROM invitations WHERE course_id='delete-course';
    DELETE FROM courses WHERE id='delete-course';
  `);
  for (const table of [
    "courses",
    "course_sections",
    "lessons",
    "quizzes",
    "quiz_questions",
    "quiz_attempts",
    "lesson_progress",
    "enrollments",
    "certificates",
  ]) {
    assert.equal(db.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE id LIKE 'delete-%'`).get().count, 0);
  }
});

test("grants and revokes bundle, community, and live-session access", async () => {
  const db = await migratedDatabase();
  const now = Date.UTC(2026, 6, 19, 10);
  db.exec(`
    INSERT INTO profiles (id,email,display_name,role,status,created_at)
    VALUES
      ('growth-owner','growth-owner@example.com','Growth Owner','creator','active',${now}),
      ('growth-learner','growth-learner@example.com','Growth Learner','learner','active',${now}),
      ('growth-outsider','growth-outsider@example.com','Growth Outsider','learner','active',${now});
    INSERT INTO schools
      (id,slug,name,description,primary_color,accent_color,hero_title,hero_description,
       font_theme,support_email,seo_title,seo_description,show_community,
       owner_id,status,created_at,updated_at)
    VALUES
      ('growth-school','growth-academy','Growth Academy','','#3556d8','#ffbd8a','','',
       'modern','','','',1,'growth-owner','active',${now},${now});
    INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
    VALUES
      ('growth-owner-membership','growth-school','growth-owner','owner','active',${now}),
      ('growth-learner-membership','growth-school','growth-learner','learner','active',${now});
    INSERT INTO communities
      (id,school_id,owner_id,name,description,access_type,allow_posting,created_at)
    VALUES
      ('growth-community','growth-school','growth-owner','Growth Community','','enrolled',1,${now});
    INSERT INTO courses
      (id,school_id,owner_id,title,description,status,price_cents,created_at,updated_at)
    VALUES
      ('growth-course','growth-school','growth-owner','Growth Course','','published',0,${now},${now});
    INSERT INTO products
      (id,school_id,owner_id,name,slug,description,product_type,price_cents,
       billing_interval,status,includes_community,access_duration_days,created_at,updated_at)
    VALUES
      ('growth-product','growth-school','growth-owner','Growth Membership','growth-membership','',
       'membership',9900,'monthly','published',1,30,${now},${now});
    INSERT INTO product_items (id,product_id,item_type,item_id,position,created_at)
    VALUES ('growth-item','growth-product','course','growth-course',0,${now});
    INSERT INTO product_entitlements
      (id,product_id,user_id,source,status,starts_at,expires_at,granted_by,created_at,updated_at)
    VALUES
      ('growth-entitlement','growth-product','growth-learner','manual','active',${now},
       ${now + 30 * 86_400_000},'growth-owner',${now},${now});
    INSERT INTO enrollments
      (id,user_id,course_id,progress,status,support_note,last_activity_at,
       access_source,access_source_id,created_at)
    VALUES
      ('growth-enrollment','growth-learner','growth-course',0,'active','',${now},
       'product','growth-entitlement',${now});
    INSERT INTO community_members
      (id,community_id,user_id,role,status,joined_at,access_source,access_source_id)
    VALUES
      ('growth-community-member','growth-community','growth-learner','member','active',${now},
       'product','growth-entitlement');
    INSERT INTO live_sessions
      (id,school_id,product_id,host_id,title,description,starts_at,ends_at,timezone,
       meeting_provider,meeting_url,capacity,status,created_at,updated_at)
    VALUES
      ('growth-session','growth-school','growth-product','growth-owner','Growth Live','','${now + 86_400_000}',
       '${now + 90_000_000}','Africa/Johannesburg','zoom','https://example.com/meeting',50,
       'scheduled',${now},${now});
    INSERT INTO live_attendance
      (id,session_id,user_id,status,registered_at,attendance_minutes)
    VALUES
      ('growth-attendance','growth-session','growth-learner','registered',${now},0);
    INSERT INTO integrations
      (id,school_id,created_by,provider,name,endpoint_url,event_types_json,signing_secret,
       status,created_at,updated_at)
    VALUES
      ('growth-webhook','growth-school','growth-owner','webhook','Growth CRM',
       'https://example.com/hooks','["entitlement.granted"]','secret','active',${now},${now});
    INSERT INTO integration_deliveries
      (id,integration_id,event_type,payload_json,status,response_status,created_at,delivered_at)
    VALUES
      ('growth-delivery','growth-webhook','entitlement.granted','{}','delivered',200,${now},${now});
  `);

  const access = db.prepare(`
    SELECT p.name,e.status AS enrollmentStatus,cm.status AS communityStatus,
      la.status AS attendanceStatus
    FROM product_entitlements pe
    JOIN products p ON p.id=pe.product_id
    JOIN enrollments e ON e.access_source_id=pe.id
    JOIN community_members cm ON cm.access_source_id=pe.id
    JOIN live_attendance la ON la.user_id=pe.user_id
    WHERE pe.user_id='growth-learner' AND pe.status='active'
  `).get();
  assert.deepEqual({ ...access }, {
    name: "Growth Membership",
    enrollmentStatus: "active",
    communityStatus: "active",
    attendanceStatus: "registered",
  });
  assert.equal(
    db.prepare(`
      SELECT COUNT(*) AS count FROM product_entitlements
      WHERE user_id='growth-outsider' AND status='active'
    `).get().count,
    0,
  );
  assert.equal(
    db.prepare(`
      SELECT status FROM integration_deliveries
      WHERE integration_id='growth-webhook'
    `).get().status,
    "delivered",
  );

  db.exec(`
    UPDATE product_entitlements SET status='revoked',updated_at=${now + 1}
    WHERE id='growth-entitlement';
    UPDATE enrollments SET status='paused' WHERE access_source_id='growth-entitlement';
    UPDATE community_members SET status='paused' WHERE access_source_id='growth-entitlement';
    UPDATE live_attendance SET status='cancelled'
    WHERE user_id='growth-learner' AND session_id='growth-session';
  `);
  assert.equal(
    db.prepare("SELECT status FROM enrollments WHERE id='growth-enrollment'").get().status,
    "paused",
  );
  assert.equal(
    db.prepare("SELECT status FROM community_members WHERE id='growth-community-member'").get().status,
    "paused",
  );
  assert.equal(
    db.prepare("SELECT status FROM live_attendance WHERE id='growth-attendance'").get().status,
    "cancelled",
  );
});

test("creates one private coach draft during onboarding and never advertises it early", async () => {
  const db = await migratedDatabase();
  const now = Date.UTC(2026, 6, 20, 10);
  db.exec(`
    INSERT INTO profiles
      (id,email,display_name,role,onboarding_path,onboarding_completed,status,created_at)
    VALUES
      ('coach-onboarding','coach@example.com','Amina Daniels','creator','coach',1,'active',${now});
    INSERT INTO schools
      (id,slug,name,description,primary_color,accent_color,hero_title,hero_description,
       font_theme,support_email,seo_title,seo_description,show_community,
       owner_id,status,created_at,updated_at)
    VALUES
      ('coach-practice','amina-coaching','Amina Coaching','','#3556d8','#ffbd8a','','',
       'modern','coach@example.com','','',1,'coach-onboarding','active',${now},${now});
    INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
    VALUES
      ('coach-practice-owner','coach-practice','coach-onboarding','owner','active',${now});
  `);
  const createDraft = (id) => db.prepare(`
    INSERT INTO tutors
      (id,school_id,user_id,created_by,slug,display_name,contact_email,status,
       created_at,updated_at)
    SELECT ?,?,?,?,?,?,?,'draft',?,?
    WHERE NOT EXISTS (
      SELECT 1 FROM tutors
      WHERE school_id=? AND status<>'archived'
        AND (user_id=? OR created_by=?)
    )
  `).run(
    id,
    "coach-practice",
    "coach-onboarding",
    "coach-onboarding",
    "amina-daniels",
    "Amina Daniels",
    "coach@example.com",
    now,
    now,
    "coach-practice",
    "coach-onboarding",
    "coach-onboarding",
  );
  createDraft("coach-draft-first");
  createDraft("coach-draft-duplicate");

  const draft = db.prepare(`
    SELECT COUNT(*) AS count,MIN(id) AS id,MIN(status) AS status,
      MIN(user_id) AS userId,MIN(display_name) AS displayName,
      MIN(contact_email) AS contactEmail
    FROM tutors
    WHERE school_id='coach-practice' AND status<>'archived'
  `).get();
  assert.deepEqual({ ...draft }, {
    count: 1,
    id: "coach-draft-first",
    status: "draft",
    userId: "coach-onboarding",
    displayName: "Amina Daniels",
    contactEmail: "coach@example.com",
  });
  assert.equal(
    db.prepare(`
      SELECT COUNT(*) AS count FROM tutors
      WHERE school_id='coach-practice' AND status='published'
    `).get().count,
    0,
  );
});

test("publishes academy tutors and protects learner enquiry details", async () => {
  const db = await migratedDatabase();
  const now = Date.UTC(2026, 6, 19, 12);
  db.exec(`
    INSERT INTO profiles (id,email,display_name,role,status,created_at)
    VALUES
      ('tutor-owner','tutor-owner@example.com','Tutor Owner','creator','active',${now}),
      ('tutor-learner','tutor-learner@example.com','Tutor Learner','learner','active',${now});
    INSERT INTO schools
      (id,slug,name,description,primary_color,accent_color,hero_title,hero_description,
       font_theme,support_email,seo_title,seo_description,show_community,
       owner_id,status,created_at,updated_at)
    VALUES
      ('tutor-school','tutor-academy','Tutor Academy','','#3556d8','#ffbd8a','','',
       'modern','academy@example.com','','',1,'tutor-owner','active',${now},${now});
    INSERT INTO school_members (id,school_id,user_id,role,status,joined_at)
    VALUES ('tutor-owner-membership','tutor-school','tutor-owner','owner','active',${now});
    INSERT INTO tutors
      (id,school_id,created_by,slug,display_name,headline,subjects_json,
       contact_email,phone_number,show_direct_contact,status,created_at,updated_at)
    VALUES
      ('tutor-profile','tutor-school','tutor-owner','lindiwe-mokoena',
       'Lindiwe Mokoena','Mathematics tutor for Grades 10–12',
       '["Mathematics","Physical Science"]','lindiwe@example.com',
       '+264 81 000 0000',0,'published',${now},${now});
    INSERT INTO tutor_slots
      (id,tutor_id,school_id,created_by,starts_at,ends_at,timezone,
       session_mode,meeting_details,status,created_at,updated_at)
    VALUES
      ('tutor-slot','tutor-profile','tutor-school','tutor-owner',
       ${now + 86_400_000},${now + 90_000_000},'Africa/Johannesburg',
       'online','https://meet.example/private','reserved',${now},${now});
    INSERT INTO tutor_inquiries
      (id,tutor_id,slot_id,school_id,learner_id,learner_name,learner_email,
       subject,message,status,created_at,updated_at)
    VALUES
      ('tutor-inquiry','tutor-profile','tutor-slot','tutor-school','tutor-learner',
       'Tutor Learner','tutor-learner@example.com','Algebra support',
       'I need help preparing for my algebra exam.','new',${now},${now});
  `);
  const privateRow = db.prepare(
    `SELECT ${tutorColumns} FROM tutors t WHERE t.id='tutor-profile'`,
  ).get();
  const publicTutor = serializeTutor(privateRow);
  assert.equal(publicTutor.displayName, "Lindiwe Mokoena");
  assert.deepEqual(publicTutor.subjects, ["Mathematics", "Physical Science"]);
  assert.equal(publicTutor.serviceType, "coaching");
  assert.equal(publicTutor.listingTier, "listed");
  assert.equal(publicTutor.listingMonthlyCents, 0);
  assert.equal(publicTutor.profileCompleteness, 20);
  assert.equal(publicTutor.reviewCount, 0);
  assert.equal(publicTutor.phoneNumber, "");
  assert.equal(publicTutor.contactEmail, undefined);

  db.exec("UPDATE tutors SET show_direct_contact=1 WHERE id='tutor-profile'");
  const directRow = db.prepare(
    `SELECT ${tutorColumns} FROM tutors t WHERE t.id='tutor-profile'`,
  ).get();
  assert.equal(serializeTutor(directRow).phoneNumber, "+264 81 000 0000");
  assert.equal(
    db.prepare(`
      SELECT COUNT(*) AS count FROM tutor_inquiries
      WHERE school_id='tutor-school' AND status='new'
    `).get().count,
    1,
  );
  assert.equal(
    db.prepare(`
      SELECT COUNT(*) AS count FROM tutor_inquiries
      WHERE school_id='another-school'
    `).get().count,
    0,
  );
  assert.equal(
    db.prepare("SELECT status FROM tutor_slots WHERE id='tutor-slot'").get().status,
    "reserved",
  );
  db.exec(`
    INSERT INTO tutor_slots
      (id,tutor_id,school_id,created_by,starts_at,ends_at,timezone,
       session_mode,meeting_details,status,created_at,updated_at)
    VALUES
      ('tutor-slot-assigned','tutor-profile','tutor-school','tutor-owner',
       ${now + 172_800_000},${now + 176_400_000},'Africa/Johannesburg',
       'online','https://meet.example/assigned','open',${now},${now});
    INSERT INTO tutor_inquiries
      (id,tutor_id,slot_id,school_id,learner_id,learner_name,learner_email,
       subject,message,status,created_at,updated_at)
    VALUES
      ('tutor-general-inquiry','tutor-profile',NULL,'tutor-school','tutor-learner',
       'Tutor Learner','tutor-learner@example.com','Geometry support',
       'I need a coach to help me understand geometry.','contacted',${now},${now});
    UPDATE tutor_slots SET status='booked'
    WHERE id='tutor-slot-assigned' AND status='open';
    UPDATE tutor_inquiries
    SET slot_id='tutor-slot-assigned',status='booked'
    WHERE id='tutor-general-inquiry' AND slot_id IS NULL
      AND status IN ('new','contacted','booked');
  `);
  const assigned = db.prepare(`
    SELECT ti.status,ti.slot_id AS slotId,ts.status AS slotStatus,
      ts.starts_at AS startsAt,ts.meeting_details AS meetingDetails
    FROM tutor_inquiries ti JOIN tutor_slots ts ON ts.id=ti.slot_id
    WHERE ti.id='tutor-general-inquiry'
  `).get();
  assert.deepEqual({ ...assigned }, {
    status: "booked",
    slotId: "tutor-slot-assigned",
    slotStatus: "booked",
    startsAt: now + 172_800_000,
    meetingDetails: "https://meet.example/assigned",
  });
  db.exec(`
    UPDATE tutor_slots SET status='booked' WHERE id='tutor-slot' AND status='reserved';
    UPDATE tutor_inquiries SET status='booked' WHERE id='tutor-inquiry';
  `);
  const booked = db.prepare(`
    SELECT ti.status,ts.status AS slotStatus,ts.meeting_details AS meetingDetails
    FROM tutor_inquiries ti JOIN tutor_slots ts ON ts.id=ti.slot_id
    WHERE ti.id='tutor-inquiry'
  `).get();
  assert.equal(booked.status, "booked");
  assert.equal(booked.slotStatus, "booked");
  assert.equal(booked.meetingDetails, "https://meet.example/private");
  db.exec(`
    UPDATE tutor_inquiries SET status='completed' WHERE id='tutor-inquiry';
    UPDATE tutor_slots SET status='completed' WHERE id='tutor-slot';
    INSERT INTO tutor_credentials
      (id,tutor_id,school_id,submitted_by,title,issuer,status,reviewer_note,
       reviewed_by,reviewed_at,created_at,updated_at)
    VALUES
      ('tutor-credential','tutor-profile','tutor-school','tutor-owner',
       'Qualified Mathematics Educator','University of Namibia','verified',
       'Issuer record checked.','platform-admin',${now},${now},${now});
    INSERT INTO tutor_reviews
      (id,inquiry_id,tutor_id,school_id,learner_id,rating,comment,status,created_at,updated_at)
    VALUES
      ('tutor-review','tutor-inquiry','tutor-profile','tutor-school','tutor-learner',
       5,'Clear explanations and a useful plan.','published',${now},${now});
    UPDATE tutors SET verified=1 WHERE id='tutor-profile';
  `);
  const trustedRow = db.prepare(
    `SELECT ${tutorColumns} FROM tutors t WHERE t.id='tutor-profile'`,
  ).get();
  const trustedTutor = serializeTutor(trustedRow);
  assert.equal(trustedTutor.verified, true);
  assert.equal(trustedTutor.verifiedCredentialCount, 1);
  assert.equal(trustedTutor.reviewCount, 1);
  assert.equal(trustedTutor.averageRating, 5);
  db.exec(`
    UPDATE tutor_slots SET status='open' WHERE id='tutor-slot';
    UPDATE tutor_inquiries SET status='closed' WHERE id='tutor-inquiry';
  `);
  assert.equal(
    db.prepare("SELECT status FROM tutor_slots WHERE id='tutor-slot'").get().status,
    "open",
  );
});

test("protects two-way session ratings until the blind reveal condition is met", async () => {
  const db = await migratedDatabase();
  const now = Date.now();
  db.exec(`
    INSERT INTO learner_session_ratings
      (id,inquiry_id,tutor_id,school_id,learner_id,rated_by,rating,tags_json,
       private_note,status,visible_after,created_at,updated_at)
    VALUES
      ('lr-one','session-one','coach-one','school-one','learner-one','owner-one',
       3,'["needs_preparation"]','Private operational context','pending',
       ${now + 604800000},${now},${now}),
      ('lr-two','session-two','coach-two','school-two','learner-one','owner-two',
       4,'["engaged"]','','published',${now},${now},${now}),
      ('lr-three','session-three','coach-three','school-three','learner-one','owner-three',
       5,'["prepared","respectful"]','','pending',${now - 1},${now},${now});
  `);
  const beforeReveal = db.prepare(`
    SELECT COUNT(*) AS count,ROUND(AVG(rating),1) AS averageRating
    FROM learner_session_ratings
    WHERE learner_id='learner-one'
      AND (status='published' OR (status='pending' AND visible_after<=?))
  `).get(now);
  assert.deepEqual({ ...beforeReveal }, { count: 2, averageRating: 4.5 });

  db.exec(`
    INSERT INTO tutor_reviews
      (id,inquiry_id,tutor_id,school_id,learner_id,rating,tags_json,comment,
       status,visible_after,created_at,updated_at)
    VALUES
      ('tr-one','session-one','coach-one','school-one','learner-one',4,
       '["supportive"]','Helpful session.','pending',${now + 604800000},${now},${now});
    UPDATE learner_session_ratings
      SET status='published',visible_after=${now},updated_at=${now}
      WHERE inquiry_id='session-one' AND status='pending';
    UPDATE tutor_reviews
      SET status='published',visible_after=${now},updated_at=${now}
      WHERE inquiry_id='session-one' AND status='pending';
  `);
  const afterReveal = db.prepare(`
    SELECT COUNT(*) AS count,ROUND(AVG(rating),1) AS averageRating
    FROM learner_session_ratings
    WHERE learner_id='learner-one'
      AND (status='published' OR (status='pending' AND visible_after<=?))
  `).get(now);
  assert.deepEqual({ ...afterReveal }, { count: 3, averageRating: 4 });
  assert.equal(
    db.prepare("SELECT status FROM tutor_reviews WHERE inquiry_id='session-one'").get().status,
    "published",
  );
  assert.throws(() => db.exec(`
    INSERT INTO learner_session_ratings
      (id,inquiry_id,tutor_id,school_id,learner_id,rated_by,rating,
       status,visible_after,created_at,updated_at)
    VALUES
      ('lr-duplicate','session-one','coach-one','school-one','learner-one',
       'owner-one',5,'published',${now},${now},${now});
  `), /UNIQUE constraint failed/);
});

test("keeps proof portfolios private until the learner explicitly publishes evidence", async () => {
  const db = await migratedDatabase();
  const now = Date.UTC(2026, 6, 21, 8);
  db.exec(`
    INSERT INTO profiles (id,email,display_name,role,status,created_at)
    VALUES ('portfolio-learner','proof@example.com','Proof Learner','learner','active',${now});
    INSERT INTO learning_portfolios
      (user_id,slug,headline,bio,visibility,created_at,updated_at)
    VALUES
      ('portfolio-learner','proof-learner-demo','Evidence, not attendance','',
       'draft',${now},${now});
    INSERT INTO portfolio_source_visibility
      (id,user_id,source_type,source_id,visible,show_score,created_at,updated_at)
    VALUES
      ('portfolio-source-private','portfolio-learner','assessment','assessment-private',0,0,${now},${now}),
      ('portfolio-source-visible','portfolio-learner','certificate','certificate-visible',1,0,${now},${now});
    INSERT INTO portfolio_evidence
      (id,user_id,evidence_type,title,description,skills,visible,sort_order,created_at,updated_at)
    VALUES
      ('portfolio-work-visible','portfolio-learner','project','Board briefing',
       'A decision-grade briefing.','Research, communication',1,0,${now},${now}),
      ('portfolio-work-private','portfolio-learner','feedback','Private feedback',
       'Personal instructor note.','',0,1,${now},${now});
  `);
  assert.equal(
    db.prepare("SELECT COUNT(*) AS count FROM learning_portfolios WHERE slug='proof-learner-demo' AND visibility='published'").get().count,
    0,
  );
  db.exec("UPDATE learning_portfolios SET visibility='published' WHERE user_id='portfolio-learner'");
  assert.deepEqual({ ...db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM portfolio_source_visibility WHERE user_id='portfolio-learner' AND visible=1) AS selectedSources,
      (SELECT COUNT(*) FROM portfolio_evidence WHERE user_id='portfolio-learner' AND visible=1) AS selectedEvidence
  `).get() }, { selectedSources: 1, selectedEvidence: 1 });
  assert.throws(() => db.exec(`
    INSERT INTO learning_portfolios
      (user_id,slug,headline,bio,visibility,created_at,updated_at)
    VALUES ('portfolio-other','proof-learner-demo','Duplicate','','draft',${now},${now});
  `), /UNIQUE constraint failed/);
  assert.throws(() => db.exec(`
    INSERT INTO portfolio_source_visibility
      (id,user_id,source_type,source_id,visible,show_score,created_at,updated_at)
    VALUES ('portfolio-source-duplicate','portfolio-learner','certificate',
      'certificate-visible',1,0,${now},${now});
  `), /UNIQUE constraint failed/);
});

test("persists one private mastery record per learner and concept", async () => {
  const db = await migratedDatabase();
  const now = 1784624500000;
  db.exec(`
    INSERT INTO profiles (id,email,display_name,role,status,created_at)
    VALUES ('mastery-learner','mastery@example.com','Mastery Learner','learner','active',${now});
  `);
  const source = db.prepare(`
    SELECT qq.id AS questionId,l.id AS lessonId,l.course_id AS courseId,
      COALESCE(NULLIF(qq.concept_label,''),'Course concept') AS conceptLabel
    FROM quiz_questions qq JOIN quizzes q ON q.id=qq.quiz_id
    JOIN lessons l ON l.id=q.lesson_id
    ORDER BY qq.id LIMIT 1
  `).get();
  assert.ok(source?.questionId);
  db.prepare(`
    INSERT INTO learner_concept_mastery
      (id,user_id,question_id,course_id,lesson_id,concept_label,status,
       wrong_count,correct_streak,first_seen_at,last_reviewed_at,next_review_at,updated_at)
    VALUES ('mastery-record','mastery-learner',?,?,?,?,
      'needs_review',1,0,?,?,?,?)
  `).run(source.questionId, source.courseId, source.lessonId, source.conceptLabel, now, now, now, now);
  assert.throws(() => db.prepare(`
    INSERT INTO learner_concept_mastery
      (id,user_id,question_id,course_id,lesson_id,concept_label,status,
       wrong_count,correct_streak,first_seen_at,updated_at)
    VALUES ('mastery-duplicate','mastery-learner',?,?,?,?,
      'needs_review',1,0,?,?)
  `).run(source.questionId, source.courseId, source.lessonId, source.conceptLabel, now, now), /UNIQUE constraint failed/);
  db.prepare(`
    INSERT INTO mastery_practice_attempts
      (id,user_id,question_id,selected_index,correct,answered_at)
    VALUES ('mastery-practice','mastery-learner',?,0,1,?)
  `).run(source.questionId, now + 1_000);
  db.prepare(`
    UPDATE learner_concept_mastery SET status='practising',correct_streak=1,
      last_reviewed_at=?,next_review_at=?,updated_at=?
    WHERE id='mastery-record' AND user_id='mastery-learner'
  `).run(now + 1_000, now + 86_401_000, now + 1_000);
  const record = db.prepare(`
    SELECT status,wrong_count AS wrongCount,correct_streak AS correctStreak,
      next_review_at AS nextReviewAt,
      (SELECT COUNT(*) FROM mastery_practice_attempts p
       WHERE p.user_id=m.user_id AND p.question_id=m.question_id) AS practiceCount
    FROM learner_concept_mastery m WHERE id='mastery-record'
  `).get();
  assert.deepEqual({ ...record }, {
    status: "practising",
    wrongCount: 1,
    correctStreak: 1,
    nextReviewAt: now + 86_401_000,
    practiceCount: 1,
  });
  db.close();
});

test("persists private lesson questions and educator responses in their academy context", async () => {
  const db = await migratedDatabase();
  const now = 1784625000000;
  db.exec(`
    INSERT INTO lesson_help_requests
      (id,school_id,course_id,lesson_id,learner_id,question,status,response,created_at,updated_at)
    SELECT 'help-request-fixture',c.school_id,c.id,l.id,'learner-fixture',
      'How does this idea connect to the worked example?','open','',${now},${now}
    FROM courses c JOIN lessons l ON l.course_id=c.id
    WHERE c.school_id='northstarlabs' ORDER BY l.position,l.id LIMIT 1;
  `);
  const open = db.prepare(`SELECT status,question,response FROM lesson_help_requests WHERE id='help-request-fixture'`).get();
  assert.deepEqual({ ...open }, {
    status: "open",
    question: "How does this idea connect to the worked example?",
    response: "",
  });
  db.prepare(`UPDATE lesson_help_requests SET status='answered',response=?,responded_by=?,responded_at=?,updated_at=? WHERE id=?`)
    .run("Connect the definition to the first decision in the example, then test the result.", "creator-fixture", now + 1_000, now + 1_000, "help-request-fixture");
  const answered = db.prepare(`SELECT status,response,responded_by AS respondedBy FROM lesson_help_requests WHERE id='help-request-fixture'`).get();
  assert.deepEqual({ ...answered }, {
    status: "answered",
    response: "Connect the definition to the first decision in the example, then test the result.",
    respondedBy: "creator-fixture",
  });
  db.close();
});

test("publishes honest starter demand and preserves one vote per browser identity", async () => {
  const db = await migratedDatabase();
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'demand_%' ORDER BY name",
  ).all().map((row) => row.name);
  assert.deepEqual(tables, ["demand_followers", "demand_topics", "demand_votes"]);
  const starters = db.prepare(`
    SELECT COUNT(*) AS topics,
      SUM(CASE WHEN visibility='published' AND status='open' THEN 1 ELSE 0 END) AS openTopics
    FROM demand_topics WHERE id LIKE 'starter-demand-%'
  `).get();
  assert.deepEqual({ ...starters }, { topics: 6, openTopics: 6 });
  assert.equal(db.prepare("SELECT COUNT(*) AS votes FROM demand_votes").get().votes, 0);
  const now = 1784630000000;
  db.prepare(`
    INSERT INTO demand_votes (id,topic_id,voter_key_hash,value,created_at,updated_at)
    VALUES ('vote-one','starter-demand-bitcoin-custody','browser-hash-one',1,?,?)
  `).run(now, now);
  assert.throws(() => db.prepare(`
    INSERT INTO demand_votes (id,topic_id,voter_key_hash,value,created_at,updated_at)
    VALUES ('vote-duplicate','starter-demand-bitcoin-custody','browser-hash-one',-1,?,?)
  `).run(now, now), /UNIQUE constraint failed/);
  db.prepare(`UPDATE demand_votes SET value=-1,updated_at=? WHERE topic_id=? AND voter_key_hash=?`)
    .run(now + 1, "starter-demand-bitcoin-custody", "browser-hash-one");
  assert.equal(db.prepare("SELECT value FROM demand_votes WHERE id='vote-one'").get().value, -1);
  db.prepare(`
    INSERT INTO demand_followers
      (id,topic_id,email,name,status,unsubscribe_token_hash,created_at,updated_at)
    VALUES ('follow-one','starter-demand-bitcoin-custody','learner@example.com','Learner','active','token-hash-one',?,?)
  `).run(now, now);
  assert.throws(() => db.prepare(`
    INSERT INTO demand_followers
      (id,topic_id,email,name,status,unsubscribe_token_hash,created_at,updated_at)
    VALUES ('follow-duplicate','starter-demand-bitcoin-custody','learner@example.com','','active','token-hash-two',?,?)
  `).run(now, now), /UNIQUE constraint failed/);
  db.prepare(`UPDATE demand_topics SET status='building',public_note='Curriculum research is under way.',updated_at=? WHERE id='starter-demand-bitcoin-custody'`)
    .run(now + 2);
  const topic = db.prepare(`
    SELECT t.status,t.public_note AS publicNote,
      COALESCE(SUM(v.value),0) AS score,
      (SELECT COUNT(*) FROM demand_followers f WHERE f.topic_id=t.id AND f.status='active') AS followers
    FROM demand_topics t LEFT JOIN demand_votes v ON v.topic_id=t.id
    WHERE t.id='starter-demand-bitcoin-custody' GROUP BY t.id
  `).get();
  assert.deepEqual({ ...topic }, {
    status: "building",
    publicNote: "Curriculum research is under way.",
    score: -1,
    followers: 1,
  });
  db.close();
});

test("security policy limits abusive writes and rejects oversized JSON", async () => {
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/uploads", { method: "POST" })),
    { scope: "uploads", limit: 20, windowMs: 3_600_000 },
  );
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/academy-exports", { method: "POST" })),
    { scope: "academy_exports", limit: 8, windowMs: 3_600_000 },
  );
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/lesson-help", { method: "POST" })),
    { scope: "lesson_help", limit: 120, windowMs: 3_600_000 },
  );
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/community", { method: "POST" })),
    { scope: "community_write", limit: 30, windowMs: 60_000 },
  );
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/tutor-inquiries", { method: "POST" })),
    { scope: "tutor_inquiry", limit: 10, windowMs: 3_600_000 },
  );
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/learning-requests", { method: "POST" })),
    { scope: "learning_request", limit: 5, windowMs: 3_600_000 },
  );
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/demand", { method: "POST" })),
    { scope: "demand_board", limit: 60, windowMs: 3_600_000 },
  );
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/tutor-reviews", { method: "POST" })),
    { scope: "tutor_review", limit: 5, windowMs: 86_400_000 },
  );
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/learner-ratings", { method: "POST" })),
    { scope: "learner_rating", limit: 10, windowMs: 86_400_000 },
  );
  assert.equal(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/catalog")),
    null,
  );
  assert.equal(oversizedJsonRequest(new Request(
    "https://northstarlabs.co.za/api/profile",
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "content-length": "1048577",
      },
    },
  )), true);
  assert.equal((await sha256Hex("same-client")).length, 64);
});
