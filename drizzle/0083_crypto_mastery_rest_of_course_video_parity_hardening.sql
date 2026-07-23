-- Safety sweep: guarantee every non-quiz lesson in Module 1/2/3 has a playable media source.
-- This is a fallback-only pass to avoid blank lesson cards when production still has legacy null pointers.

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
  'Fallback narrated visual lesson asset for Module 1.',
  1785670000000,
  1785670000000
FROM `courses` c
WHERE c.`id`='cognizen-crypto-mastery-foundations-production';

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
  'cmf-module-2-premium-track',
  c.`school_id`,
  c.`owner_id`,
  'static:/media/faculty/cmf-module-2-premium-track.mp4',
  'cmf-module-2-premium-track.mp4',
  'video/mp4',
  33500000,
  'video',
  'Fallback narrated visual lesson asset for Module 2.',
  1785670000000,
  1785670000000
FROM `courses` c
WHERE c.`id`='cognizen-crypto-mastery-foundations-production';

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
  'cmf-module-3-premium-track',
  c.`school_id`,
  c.`owner_id`,
  'static:/media/faculty/cmf-module-3-premium-track.mp4',
  'cmf-module-3-premium-track.mp4',
  'video/mp4',
  33600000,
  'video',
  'Fallback narrated visual lesson asset for Module 3.',
  1785670000000,
  1785670000000
FROM `courses` c
WHERE c.`id`='cognizen-crypto-mastery-foundations-production';

--> statement-breakpoint

UPDATE `lessons`
SET
  `lesson_type`=CASE WHEN `lesson_type`='quiz' THEN 'quiz' ELSE 'video' END,
  `video_key`=COALESCE(NULLIF(TRIM(`video_key`), ''), 'static:/media/faculty/crypto-mastery-welcome.mp4'),
  `primary_asset_id`=COALESCE(NULLIF(TRIM(`primary_asset_id`), ''), 'cmf-module-1-fallback-premium-track'),
  `intro_asset_id`=COALESCE(NULLIF(TRIM(`intro_asset_id`), ''), `primary_asset_id`, 'cmf-module-1-fallback-premium-track'),
  `required_watch_percent`=COALESCE(NULLIF(`required_watch_percent`,0),75),
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `id` LIKE 'cmf-module-1-%-lesson-%'
  AND `lesson_type` != 'quiz'
  AND (
    `primary_asset_id` IS NULL OR TRIM(`primary_asset_id`) = ''
    OR `video_key` IS NULL OR TRIM(`video_key`) = ''
    OR `required_watch_percent` IS NULL OR `required_watch_percent` = 0
    OR `intro_asset_id` IS NULL OR TRIM(`intro_asset_id`) = ''
  );

UPDATE `lessons`
SET
  `lesson_type`=CASE WHEN `lesson_type`='quiz' THEN 'quiz' ELSE 'video' END,
  `video_key`=COALESCE(NULLIF(TRIM(`video_key`), ''), 'static:/media/faculty/cmf-module-2-premium-track.mp4'),
  `primary_asset_id`=COALESCE(NULLIF(TRIM(`primary_asset_id`), ''), 'cmf-module-2-premium-track'),
  `intro_asset_id`=COALESCE(NULLIF(TRIM(`intro_asset_id`), ''), `primary_asset_id`, 'cmf-module-2-premium-track'),
  `required_watch_percent`=COALESCE(NULLIF(`required_watch_percent`,0),75),
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `id` LIKE 'cmf-module-2-%-lesson-%'
  AND `lesson_type` != 'quiz'
  AND (
    `primary_asset_id` IS NULL OR TRIM(`primary_asset_id`) = ''
    OR `video_key` IS NULL OR TRIM(`video_key`) = ''
    OR `required_watch_percent` IS NULL OR `required_watch_percent` = 0
    OR `intro_asset_id` IS NULL OR TRIM(`intro_asset_id`) = ''
  );

UPDATE `lessons`
SET
  `lesson_type`=CASE WHEN `lesson_type`='quiz' THEN 'quiz' ELSE 'video' END,
  `video_key`=COALESCE(NULLIF(TRIM(`video_key`), ''), 'static:/media/faculty/cmf-module-3-premium-track.mp4'),
  `primary_asset_id`=COALESCE(NULLIF(TRIM(`primary_asset_id`), ''), 'cmf-module-3-premium-track'),
  `intro_asset_id`=COALESCE(NULLIF(TRIM(`intro_asset_id`), ''), `primary_asset_id`, 'cmf-module-3-premium-track'),
  `required_watch_percent`=COALESCE(NULLIF(`required_watch_percent`,0),75),
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `id` LIKE 'cmf-module-3-%-lesson-%'
  AND `lesson_type` != 'quiz'
  AND (
    `primary_asset_id` IS NULL OR TRIM(`primary_asset_id`) = ''
    OR `video_key` IS NULL OR TRIM(`video_key`) = ''
    OR `required_watch_percent` IS NULL OR `required_watch_percent` = 0
    OR `intro_asset_id` IS NULL OR TRIM(`intro_asset_id`) = ''
  );

--> statement-breakpoint

-- Align keys to dedicated assets when available for every lesson.
UPDATE `lessons`
SET
  `video_key`=(
    SELECT `key`
    FROM `media_assets` ma
    WHERE ma.`id` = `lessons`.`primary_asset_id`
    LIMIT 1
  ),
  `intro_asset_id`=COALESCE(NULLIF(TRIM(`intro_asset_id`), ''), `primary_asset_id`),
  `required_watch_percent`=COALESCE(NULLIF(`required_watch_percent`,0),75),
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `lesson_type` != 'quiz'
  AND `primary_asset_id` IS NOT NULL
  AND TRIM(`primary_asset_id`) != '';
