import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  oversizedJsonRequest,
  rateLimitPolicy,
  sha256Hex,
} from "../lib/security.ts";

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

test("security policy limits abusive writes and rejects oversized JSON", async () => {
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/uploads", { method: "POST" })),
    { scope: "uploads", limit: 20, windowMs: 3_600_000 },
  );
  assert.deepEqual(
    rateLimitPolicy(new Request("https://northstarlabs.co.za/api/community", { method: "POST" })),
    { scope: "community_write", limit: 30, windowMs: 60_000 },
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
