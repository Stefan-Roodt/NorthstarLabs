-- Keep the published NorthstarLabs original intact, while placing a complete
-- reviewable copy in the CogniZen creator workspace.
INSERT OR IGNORE INTO `courses`
  (`id`,`school_id`,`owner_id`,`title`,`description`,`status`,`price_cents`,
   `enforce_lesson_order`,`available_from`,`certificate_title`,
   `certificate_accent`,`certificate_valid_days`,`created_at`,`updated_at`)
SELECT
  'cognizen-bitcoin-intelligence-draft',
  target.`id`,
  target.`owner_id`,
  source.`title` || ' — Review draft',
  source.`description`,
  'draft',
  source.`price_cents`,
  source.`enforce_lesson_order`,
  NULL,
  source.`certificate_title`,
  source.`certificate_accent`,
  source.`certificate_valid_days`,
  1784578800000,
  1784578800000
FROM `courses` source
JOIN `schools` target ON target.`slug`='cognizen-consulting'
WHERE source.`id`='stefan-bitcoin-genesis-next-era'
LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections`
  (`id`,`course_id`,`title`,`position`,`created_at`)
SELECT
  'cognizen-' || source.`id`,
  'cognizen-bitcoin-intelligence-draft',
  source.`title`,
  source.`position`,
  1784578800000
FROM `course_sections` source
WHERE source.`course_id`='stefan-bitcoin-genesis-next-era'
  AND EXISTS (
    SELECT 1 FROM `courses`
    WHERE `id`='cognizen-bitcoin-intelligence-draft'
  );
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
  (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,
   `content_format`,`video_key`,`primary_asset_id`,`duration_minutes`,
   `is_preview`,`available_after_days`,`required_watch_percent`,`transcript`,
   `position`,`updated_at`)
SELECT
  'cognizen-' || source.`id`,
  'cognizen-bitcoin-intelligence-draft',
  source.`title`,
  CASE
    WHEN source.`section_id` IS NULL THEN NULL
    ELSE 'cognizen-' || source.`section_id`
  END,
  source.`lesson_type`,
  source.`content`,
  source.`content_format`,
  source.`video_key`,
  source.`primary_asset_id`,
  source.`duration_minutes`,
  source.`is_preview`,
  source.`available_after_days`,
  source.`required_watch_percent`,
  source.`transcript`,
  source.`position`,
  1784578800000
FROM `lessons` source
WHERE source.`course_id`='stefan-bitcoin-genesis-next-era'
  AND EXISTS (
    SELECT 1 FROM `courses`
    WHERE `id`='cognizen-bitcoin-intelligence-draft'
  );
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
  (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
SELECT
  'cognizen-' || source.`id`,
  'cognizen-' || source.`lesson_id`,
  source.`title`,
  source.`passing_score`,
  source.`max_attempts`
FROM `quizzes` source
JOIN `lessons` original_lesson ON original_lesson.`id`=source.`lesson_id`
WHERE original_lesson.`course_id`='stefan-bitcoin-genesis-next-era'
  AND EXISTS (
    SELECT 1 FROM `courses`
    WHERE `id`='cognizen-bitcoin-intelligence-draft'
  );
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
  (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`position`)
SELECT
  'cognizen-' || source.`id`,
  'cognizen-' || source.`quiz_id`,
  source.`prompt`,
  source.`options_json`,
  source.`correct_index`,
  source.`explanation`,
  source.`position`
FROM `quiz_questions` source
JOIN `quizzes` original_quiz ON original_quiz.`id`=source.`quiz_id`
JOIN `lessons` original_lesson ON original_lesson.`id`=original_quiz.`lesson_id`
WHERE original_lesson.`course_id`='stefan-bitcoin-genesis-next-era'
  AND EXISTS (
    SELECT 1 FROM `courses`
    WHERE `id`='cognizen-bitcoin-intelligence-draft'
  );
--> statement-breakpoint
INSERT OR IGNORE INTO `lesson_resources`
  (`id`,`lesson_id`,`asset_id`,`title`,`position`)
SELECT
  'cognizen-' || source.`id`,
  'cognizen-' || source.`lesson_id`,
  source.`asset_id`,
  source.`title`,
  source.`position`
FROM `lesson_resources` source
JOIN `lessons` original_lesson ON original_lesson.`id`=source.`lesson_id`
WHERE original_lesson.`course_id`='stefan-bitcoin-genesis-next-era'
  AND EXISTS (
    SELECT 1 FROM `courses`
    WHERE `id`='cognizen-bitcoin-intelligence-draft'
  );
