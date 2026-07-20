-- CogniZen Consulting and Stéfan Roodt's Academy are separate academies.
-- Preserve the existing CogniZen workspace and restore the Stéfan academy at
-- its established public address with its own membership and community.
UPDATE `schools`
SET `slug`='cognizen-consulting',
    `updated_at`=1784570400000
WHERE `slug`='stefan-roodt-s-academy'
  AND `name`='CogniZen Consulting'
  AND NOT EXISTS (
    SELECT 1 FROM `schools` WHERE `slug`='cognizen-consulting'
  );
--> statement-breakpoint
UPDATE `communities`
SET `name`='CogniZen Consulting Community'
WHERE `school_id`=(
  SELECT `id` FROM `schools`
  WHERE `slug`='cognizen-consulting'
  LIMIT 1
)
AND `name`='Stéfan Roodt''s Academy Community';
--> statement-breakpoint
INSERT OR IGNORE INTO `schools`
  (`id`,`slug`,`name`,`description`,`logo_url`,`primary_color`,`owner_id`,`status`,`created_at`,`updated_at`)
SELECT
  'stefan-roodt-academy',
  'stefan-roodt-s-academy',
  'Stéfan Roodt''s Academy',
  'Practical learning and original programmes from Stéfan Roodt.',
  NULL,
  '#3556d8',
  `owner_id`,
  'active',
  1784570400000,
  1784570400000
FROM `schools`
WHERE `slug`='cognizen-consulting'
LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO `school_members`
  (`id`,`school_id`,`user_id`,`role`,`status`,`joined_at`)
SELECT
  'stefan-roodt-academy-owner',
  'stefan-roodt-academy',
  `owner_id`,
  'owner',
  'active',
  1784570400000
FROM `schools`
WHERE `id`='stefan-roodt-academy';
--> statement-breakpoint
INSERT OR IGNORE INTO `communities`
  (`id`,`school_id`,`owner_id`,`name`,`description`,`access_type`,`allow_posting`,`created_at`)
SELECT
  'stefan-roodt-academy-community',
  'stefan-roodt-academy',
  `owner_id`,
  'Stéfan Roodt''s Academy Community',
  'A private space for learners to ask questions, share progress, and support one another.',
  'enrolled',
  1,
  1784570400000
FROM `schools`
WHERE `id`='stefan-roodt-academy';
--> statement-breakpoint
INSERT OR IGNORE INTO `community_members`
  (`id`,`community_id`,`user_id`,`role`,`status`,`joined_at`)
SELECT
  'stefan-roodt-academy-community-owner',
  'stefan-roodt-academy-community',
  `owner_id`,
  'owner',
  'active',
  1784570400000
FROM `schools`
WHERE `id`='stefan-roodt-academy';
--> statement-breakpoint
DELETE FROM `school_slug_aliases`
WHERE `slug`='stefan-roodt-s-academy';
