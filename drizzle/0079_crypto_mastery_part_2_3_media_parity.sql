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
  'Premium narrated visual lesson asset for Module 2 of Crypto Mastery.',
  1785384000000,
  1785384000000
FROM `courses` c
WHERE c.`id` = 'cognizen-crypto-mastery-foundations-production';

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
  'cmf-module-3-premium-track',
  c.`school_id`,
  c.`owner_id`,
  'static:/media/faculty/cmf-module-3-premium-track.mp4',
  'cmf-module-3-premium-track.mp4',
  'video/mp4',
  88473,
  'video',
  'Premium narrated visual lesson asset for Module 3 of Crypto Mastery.',
  1785384000000,
  1785384000000
FROM `courses` c
WHERE c.`id` = 'cognizen-crypto-mastery-foundations-production';

--> statement-breakpoint

UPDATE `lessons`
SET
  `lesson_type`='video',
  `video_key`='static:/media/faculty/cmf-module-2-premium-track.mp4',
  `primary_asset_id`='cmf-module-2-premium-track',
  `intro_asset_id`='cmf-module-2-premium-track',
  `required_watch_percent`=75,
  `transcript`=CASE
    WHEN NULLIF(TRIM(`transcript`), '') IS NULL
    THEN 'Premium narrated walk-through for this Module 2 lesson. Review each section carefully and follow the practical process outlined in the text.'
    ELSE `transcript`
  END,
  `updated_at`=1785384000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `id` LIKE 'cmf-module-2-%-lesson-%'
  AND `lesson_type` IN ('text','video','quiz','audio');

--> statement-breakpoint

UPDATE `lessons`
SET
  `lesson_type`='video',
  `video_key`='static:/media/faculty/cmf-module-3-premium-track.mp4',
  `primary_asset_id`='cmf-module-3-premium-track',
  `intro_asset_id`='cmf-module-3-premium-track',
  `required_watch_percent`=75,
  `transcript`=CASE
    WHEN NULLIF(TRIM(`transcript`), '') IS NULL
    THEN 'Premium narrated walk-through for this Module 3 lesson. Review each section carefully and follow the practical process outlined in the text.'
    ELSE `transcript`
  END,
  `updated_at`=1785384000000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `id` LIKE 'cmf-module-3-%-lesson-%'
  AND `lesson_type` IN ('text','video','quiz','audio');
