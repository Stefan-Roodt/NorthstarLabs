-- Normalise the original Foundations heading so the learner guide, creator
-- review and authoring copy all use the same explicit label.
UPDATE `lessons`
SET
  `content`=REPLACE(`content`, '## Outcome', '## Your outcome'),
  `updated_at`=1785701700000
WHERE `course_id`='cognizen-crypto-mastery-foundations-production'
  AND `content` LIKE '%## Outcome%';

--> statement-breakpoint

UPDATE `courses`
SET `updated_at`=1785701700000
WHERE `id`='cognizen-crypto-mastery-foundations-production';
