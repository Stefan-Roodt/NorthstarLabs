-- Remove recycled parity media from Crypto Mastery. These assets proved the
-- playback path, but they are not lesson-specific teaching and must not create
-- a watch requirement or be presented as premium lesson video.
UPDATE `lessons`
SET
  `lesson_type`=CASE
    WHEN `lesson_type`='quiz' THEN 'quiz'
    WHEN `experience_json` IS NOT NULL AND TRIM(`experience_json`)!='' THEN 'interactive'
    ELSE 'text'
  END,
  `video_key`=NULL,
  `primary_asset_id`=NULL,
  `intro_asset_id`=NULL,
  `required_watch_percent`=0,
  `updated_at`=1785700800000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `primary_asset_id` IN (
    'cmf-module-1-fallback-premium-track',
    'cmf-module-remaining-parity-fallback-video',
    'cmf-module-2-premium-track',
    'cmf-module-3-premium-track'
  );

--> statement-breakpoint

-- Give every Foundations knowledge check a specific learner outcome using the
-- actual module title as its context. Existing teaching and questions remain
-- unchanged.
UPDATE `lessons`
SET
  `content`='## Your outcome' || CHAR(10) || CHAR(10) ||
    'Demonstrate that you can apply the key ideas from ' ||
    (
      SELECT TRIM(SUBSTR(cs.`title`, INSTR(cs.`title`, ':') + 1))
      FROM `course_sections` cs
      WHERE cs.`id`=`lessons`.`section_id`
    ) ||
    ' before continuing.' || CHAR(10) || CHAR(10) || `content`,
  `updated_at`=1785700800000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `lesson_type`='quiz'
  AND `section_id` LIKE 'cmf-module-1-%'
  AND LOWER(`content`) NOT LIKE '%your outcome%'
  AND LOWER(`content`) NOT LIKE '%learning outcome%';

--> statement-breakpoint

UPDATE `lessons`
SET
  `content`='## Your outcome' || CHAR(10) || CHAR(10) ||
    'Navigate the programme, use its learning tools and begin with a clear study plan.' ||
    CHAR(10) || CHAR(10) || `content`,
  `updated_at`=1785700800000
WHERE `id`='cmf-start-here-lesson-04'
  AND `course_id`='cognizen-crypto-mastery-foundations-production'
  AND LOWER(`content`) NOT LIKE '%your outcome%'
  AND LOWER(`content`) NOT LIKE '%learning outcome%';

--> statement-breakpoint

UPDATE `courses`
SET `updated_at`=1785700800000
WHERE `id`='cognizen-crypto-mastery-foundations-production';
