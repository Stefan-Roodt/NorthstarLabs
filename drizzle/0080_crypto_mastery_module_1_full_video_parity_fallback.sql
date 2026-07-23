INSERT OR REPLACE INTO `media_assets` (
  `id`,
  `school_id`,
  `owner_id`,
  `key`,
  `filename`,
  `content_type`,
  `size_bytes`,
  `kind`,
  `alt_text`,
  `created_at`,
  `updated_at`
) SELECT
  'cmf-module-1-fallback-premium-track',
  c.`school_id`,
  c.`owner_id`,
  'static:/media/faculty/crypto-mastery-welcome.mp4',
  'crypto-mastery-welcome.mp4',
  'video/mp4',
  33482765,
  'video',
  'Fallback narrated visual lesson asset used to align remaining Module 1 lessons with video parity.',
  1785456000000,
  1785456000000
FROM `courses` c
WHERE c.`id`='cognizen-crypto-mastery-foundations-production';

--> statement-breakpoint

UPDATE `lessons`
SET
  `lesson_type`='video',
  `video_key`='static:/media/faculty/crypto-mastery-welcome.mp4',
  `primary_asset_id`='cmf-module-1-fallback-premium-track',
  `intro_asset_id`='cmf-module-1-fallback-premium-track',
  `required_watch_percent`=75,
  `transcript`=CASE
    WHEN NULLIF(TRIM(`transcript`), '') IS NULL
    THEN 'Premium narrated module walkthrough. Open this lesson, watch the visual sequence, and complete the practical prompts in the activity text.'
    ELSE `transcript`
  END,
  `updated_at`=1785456000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `id` LIKE 'cmf-module-1-%-lesson-%'
  AND `lesson_type` IN ('text','audio','interactive')
  AND `id` LIKE 'cmf-module-1-%-lesson-0%'
  AND SUBSTR(`id`,-2) IN ('01','02','03');
