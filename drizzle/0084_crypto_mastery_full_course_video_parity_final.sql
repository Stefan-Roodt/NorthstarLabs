-- Final production-safe parity pass for Crypto Mastery modules 1/2/3.
-- Ensure every non-quiz lesson has an assigned fallback module asset if none exists.

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
  `primary_asset_id`=CASE
    WHEN (`primary_asset_id` IS NULL OR TRIM(`primary_asset_id`)='')
      OR NOT EXISTS (SELECT 1 FROM `media_assets` ma WHERE ma.`id`=`lessons`.`primary_asset_id`)
    THEN 'cmf-module-1-fallback-premium-track'
    ELSE `primary_asset_id`
  END,
  `video_key`=CASE
    WHEN `video_key` IS NULL OR TRIM(`video_key`)='' THEN 'static:/media/faculty/crypto-mastery-welcome.mp4'
    WHEN `primary_asset_id` IS NOT NULL AND TRIM(`primary_asset_id`)='' THEN 'static:/media/faculty/crypto-mastery-welcome.mp4'
    ELSE `video_key`
  END,
  `intro_asset_id`=COALESCE(NULLIF(TRIM(`intro_asset_id`), ''), `primary_asset_id`, 'cmf-module-1-fallback-premium-track'),
  `required_watch_percent`=COALESCE(NULLIF(`required_watch_percent`,0),75),
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `lesson_type` != 'quiz'
  AND `id` LIKE 'cmf-module-1-%-lesson-%';

--> statement-breakpoint

UPDATE `lessons`
SET
  `lesson_type`=CASE WHEN `lesson_type`='quiz' THEN 'quiz' ELSE 'video' END,
  `primary_asset_id`=CASE
    WHEN (`primary_asset_id` IS NULL OR TRIM(`primary_asset_id`)='')
      OR NOT EXISTS (SELECT 1 FROM `media_assets` ma WHERE ma.`id`=`lessons`.`primary_asset_id`)
    THEN 'cmf-module-2-premium-track'
    ELSE `primary_asset_id`
  END,
  `video_key`=CASE
    WHEN `video_key` IS NULL OR TRIM(`video_key`)='' THEN 'static:/media/faculty/cmf-module-2-premium-track.mp4'
    WHEN `primary_asset_id` IS NOT NULL AND TRIM(`primary_asset_id`)='' THEN 'static:/media/faculty/cmf-module-2-premium-track.mp4'
    ELSE `video_key`
  END,
  `intro_asset_id`=COALESCE(NULLIF(TRIM(`intro_asset_id`), ''), `primary_asset_id`, 'cmf-module-2-premium-track'),
  `required_watch_percent`=COALESCE(NULLIF(`required_watch_percent`,0),75),
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `lesson_type` != 'quiz'
  AND `id` LIKE 'cmf-module-2-%-lesson-%';

--> statement-breakpoint

UPDATE `lessons`
SET
  `lesson_type`=CASE WHEN `lesson_type`='quiz' THEN 'quiz' ELSE 'video' END,
  `primary_asset_id`=CASE
    WHEN (`primary_asset_id` IS NULL OR TRIM(`primary_asset_id`)='')
      OR NOT EXISTS (SELECT 1 FROM `media_assets` ma WHERE ma.`id`=`lessons`.`primary_asset_id`)
    THEN 'cmf-module-3-premium-track'
    ELSE `primary_asset_id`
  END,
  `video_key`=CASE
    WHEN `video_key` IS NULL OR TRIM(`video_key`)='' THEN 'static:/media/faculty/cmf-module-3-premium-track.mp4'
    WHEN `primary_asset_id` IS NOT NULL AND TRIM(`primary_asset_id`)='' THEN 'static:/media/faculty/cmf-module-3-premium-track.mp4'
    ELSE `video_key`
  END,
  `intro_asset_id`=COALESCE(NULLIF(TRIM(`intro_asset_id`), ''), `primary_asset_id`, 'cmf-module-3-premium-track'),
  `required_watch_percent`=COALESCE(NULLIF(`required_watch_percent`,0),75),
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `lesson_type` != 'quiz'
  AND `id` LIKE 'cmf-module-3-%-lesson-%';

--> statement-breakpoint

-- Re-alias known assets to authoritative media table keys for every lesson with a primary asset.
UPDATE `lessons`
SET
  `video_key`=(
    SELECT `key`
    FROM `media_assets` ma
    WHERE ma.`id` = `lessons`.`primary_asset_id`
    LIMIT 1
  ),
  `intro_asset_id`=CASE
    WHEN `lesson_type`='quiz' THEN NULL
    ELSE COALESCE(NULLIF(TRIM(`intro_asset_id`), ''), `primary_asset_id`)
  END,
  `required_watch_percent`=COALESCE(NULLIF(`required_watch_percent`,0),75),
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `lesson_type` != 'quiz'
  AND `primary_asset_id` IS NOT NULL
  AND TRIM(`primary_asset_id`) != ''
  AND EXISTS (SELECT 1 FROM `media_assets` ma WHERE ma.`id` = `lessons`.`primary_asset_id`);
