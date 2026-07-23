-- Restore the dedicated welcome video after earlier fallback assets reused its
-- unique static key. The fallback references were removed in migration 0087.
DELETE FROM `media_assets`
WHERE `id` IN (
  'cmf-module-1-fallback-premium-track',
  'cmf-module-remaining-parity-fallback-video'
)
AND `key`='static:/media/faculty/crypto-mastery-welcome.mp4';

--> statement-breakpoint

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
  'cmf-welcome-video',
  c.`school_id`,
  c.`owner_id`,
  'static:/media/faculty/crypto-mastery-welcome.mp4',
  'crypto-mastery-welcome.mp4',
  'video/mp4',
  7684990,
  'video',
  'Narrated visual introduction to the Crypto Mastery learning journey.',
  1785384000000,
  1784821200000
FROM `courses` c
WHERE c.`id`='cognizen-crypto-mastery-foundations-production';

--> statement-breakpoint

UPDATE `lessons`
SET
  `lesson_type`='video',
  `video_key`='static:/media/faculty/crypto-mastery-welcome.mp4',
  `primary_asset_id`='cmf-welcome-video',
  `intro_asset_id`=NULL,
  `required_watch_percent`=75,
  `updated_at`=1784821200000
WHERE `id`='cmf-start-here-lesson-01'
  AND `course_id`='cognizen-crypto-mastery-foundations-production';
