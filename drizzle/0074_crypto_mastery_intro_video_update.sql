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
  'static:/media/faculty/Crypto_Mastery_Pathway.mp4',
  'Crypto_Mastery_Pathway.mp4',
  'video/mp4',
  33482765,
  'video',
  'Narrated orientation intro for the Crypto Mastery programme.',
  1785384000000,
  1785384000000
FROM `courses` c
WHERE c.`id` = 'cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons`
SET `primary_asset_id` = 'cmf-welcome-video',
    `updated_at` = 1785384000000
WHERE `id` = 'cmf-start-here-lesson-01'
  AND `course_id` = 'cognizen-crypto-mastery-foundations-production';
