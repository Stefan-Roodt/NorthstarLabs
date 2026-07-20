-- Remove any empty legacy placeholder that may have been added to the live
-- source course before the review copy was created.
DELETE FROM `quiz_questions`
WHERE `quiz_id` IN (
  SELECT q.`id`
  FROM `quizzes` q
  JOIN `lessons` l ON l.`id`=q.`lesson_id`
  WHERE l.`course_id`='cognizen-bitcoin-intelligence-draft'
    AND lower(trim(l.`title`))='untitled lesson'
    AND trim(l.`content`)=''
    AND l.`primary_asset_id` IS NULL
);
--> statement-breakpoint
DELETE FROM `quizzes`
WHERE `lesson_id` IN (
  SELECT `id` FROM `lessons`
  WHERE `course_id`='cognizen-bitcoin-intelligence-draft'
    AND lower(trim(`title`))='untitled lesson'
    AND trim(`content`)=''
    AND `primary_asset_id` IS NULL
);
--> statement-breakpoint
DELETE FROM `lesson_resources`
WHERE `lesson_id` IN (
  SELECT `id` FROM `lessons`
  WHERE `course_id`='cognizen-bitcoin-intelligence-draft'
    AND lower(trim(`title`))='untitled lesson'
    AND trim(`content`)=''
    AND `primary_asset_id` IS NULL
);
--> statement-breakpoint
DELETE FROM `lessons`
WHERE `course_id`='cognizen-bitcoin-intelligence-draft'
  AND lower(trim(`title`))='untitled lesson'
  AND trim(`content`)=''
  AND `primary_asset_id` IS NULL;
--> statement-breakpoint
-- Give every activity and assessment an explicit learner outcome so the
-- course communicates purpose before asking for effort.
UPDATE `lessons`
SET `content`=
  '## Your outcome' || char(10) || char(10) ||
  CASE
    WHEN `lesson_type`='quiz'
      THEN 'Test your understanding and use the answer feedback to correct any weak reasoning.'
    WHEN lower(`title`) LIKE '%lab:%'
      OR lower(`title`) LIKE 'lab:%'
      OR lower(`title`) LIKE 'capstone:%'
      THEN 'Complete the practical activity and produce the requested evidence, analysis, or decision.'
    ELSE 'Apply the central idea from this lesson and explain your conclusion using evidence.'
  END || char(10) || char(10) || `content`,
  `updated_at`=1784582400000
WHERE `course_id`='cognizen-bitcoin-intelligence-draft'
  AND lower(`content`) NOT LIKE '%## your outcome%';
--> statement-breakpoint
UPDATE `courses`
SET `updated_at`=1784582400000
WHERE `id`='cognizen-bitcoin-intelligence-draft';
