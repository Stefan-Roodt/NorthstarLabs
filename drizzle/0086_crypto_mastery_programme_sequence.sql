UPDATE `courses`
SET
  `title`='Crypto Mastery: Digital Assets — Complete Programme',
  `description`='A three-part, evidence-led pathway covering Foundations, Markets and Applications, and Advanced Digital Asset Strategy, arranged in programme order for guided review before publication.',
  `updated_at`=1784817000000
WHERE `id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `course_sections`
SET `position`=CASE
  WHEN `id`='cmf-start-here' THEN 0
  WHEN `id` LIKE 'cmf-module-1-%' THEN CAST(substr(`id`,14) AS INTEGER)
  WHEN `id` LIKE 'cmf-module-2-%' THEN 31 + CAST(substr(`id`,14) AS INTEGER)
  WHEN `id` LIKE 'cmf-module-3-%' THEN 63 + CAST(substr(`id`,14) AS INTEGER)
  ELSE `position`
END
WHERE `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `course_sections`
SET `title`='Module 3.2: Mean-Reversion Strategy'
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `id`='cmf-module-3-02';
