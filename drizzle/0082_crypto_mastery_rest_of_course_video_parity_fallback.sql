-- Final parity sweep for the entire Crypto Mastery course:
-- ensure every non-quiz Module 1/2/3 lesson has a playable video track.

-- Module 1 fallback asset (used when lesson-specific assets are not yet attached).
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
  'Fallback narrated visual lesson asset for remaining Module 1 lessons.',
  1785670000000,
  1785670000000
FROM `courses` c
WHERE c.`id`='cognizen-crypto-mastery-foundations-production';

-- Module 2 fallback asset (all module 2 lessons without dedicated lesson-specific assets).
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
  83578,
  'video',
  'Fallback narrated visual lesson asset for remaining Module 2 lessons.',
  1785670000000,
  1785670000000
FROM `courses` c
WHERE c.`id`='cognizen-crypto-mastery-foundations-production';

-- Module 3 fallback asset (all module 3 lessons without dedicated lesson-specific assets).
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
  88473,
  'video',
  'Fallback narrated visual lesson asset for remaining Module 3 lessons.',
  1785670000000,
  1785670000000
FROM `courses` c
WHERE c.`id`='cognizen-crypto-mastery-foundations-production';

--> statement-breakpoint

-- Fill missing non-quiz Module 1 assets.
UPDATE `lessons`
SET
  `lesson_type`='video',
  `video_key`='static:/media/faculty/crypto-mastery-welcome.mp4',
  `primary_asset_id`='cmf-module-1-fallback-premium-track',
  `intro_asset_id`='cmf-module-1-fallback-premium-track',
  `required_watch_percent`=75,
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `lesson_type`!='quiz'
  AND `id` LIKE 'cmf-module-1-%-lesson-%'
  AND (`primary_asset_id` IS NULL OR TRIM(`primary_asset_id`)='');

--> statement-breakpoint

-- Fill remaining module 2 non-quiz lessons with module fallback.
UPDATE `lessons`
SET
  `lesson_type`='video',
  `video_key`='static:/media/faculty/cmf-module-2-premium-track.mp4',
  `primary_asset_id`='cmf-module-2-premium-track',
  `intro_asset_id`='cmf-module-2-premium-track',
  `required_watch_percent`=75,
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `lesson_type`!='quiz'
  AND `id` LIKE 'cmf-module-2-%-lesson-%'
  AND (`primary_asset_id` IS NULL OR TRIM(`primary_asset_id`)='');

--> statement-breakpoint

-- Fill remaining module 3 non-quiz lessons with module fallback.
UPDATE `lessons`
SET
  `lesson_type`='video',
  `video_key`='static:/media/faculty/cmf-module-3-premium-track.mp4',
  `primary_asset_id`='cmf-module-3-premium-track',
  `intro_asset_id`='cmf-module-3-premium-track',
  `required_watch_percent`=75,
  `updated_at`=1785670000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `lesson_type`!='quiz'
  AND `id` LIKE 'cmf-module-3-%-lesson-%'
  AND (`primary_asset_id` IS NULL OR TRIM(`primary_asset_id`)='');

--> statement-breakpoint

-- Keep intros and video keys aligned for all non-quiz lessons that already have a primary asset.
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
  AND `lesson_type`!='quiz'
  AND `primary_asset_id` IS NOT NULL
  AND TRIM(`primary_asset_id`)!=''
  AND (
    `video_key` IS NULL OR TRIM(`video_key`)=''
    OR `intro_asset_id` IS NULL OR TRIM(`intro_asset_id`)=''
    OR `required_watch_percent` IS NULL OR `required_watch_percent`=0
  );
