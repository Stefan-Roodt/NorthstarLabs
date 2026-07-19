CREATE TABLE `school_members` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'learner' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`joined_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `school_members_school_user_unique` ON `school_members` (`school_id`,`user_id`);
--> statement-breakpoint
CREATE INDEX `school_members_user_status_idx` ON `school_members` (`user_id`,`status`);
--> statement-breakpoint
CREATE INDEX `school_members_school_role_idx` ON `school_members` (`school_id`,`role`,`status`);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`logo_url` text,
	`primary_color` text DEFAULT '#3556d8' NOT NULL,
	`owner_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `schools_slug_unique` ON `schools` (`slug`);
--> statement-breakpoint
CREATE INDEX `schools_owner_idx` ON `schools` (`owner_id`);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'learner' NOT NULL,
	`active_school_id` text,
	`stripe_customer_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_profiles`
	(`id`,`email`,`display_name`,`role`,`active_school_id`,`stripe_customer_id`,`created_at`)
SELECT
	`id`,
	`email`,
	`display_name`,
	CASE WHEN `id` IN (SELECT DISTINCT `owner_id` FROM `courses`)
		THEN 'creator' ELSE 'learner' END,
	NULL,
	`stripe_customer_id`,
	`created_at`
FROM `profiles`;
--> statement-breakpoint
DROP TABLE `profiles`;
--> statement-breakpoint
ALTER TABLE `__new_profiles` RENAME TO `profiles`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
ALTER TABLE `communities` ADD `school_id` text DEFAULT 'northstarlabs' NOT NULL;
--> statement-breakpoint
ALTER TABLE `courses` ADD `school_id` text DEFAULT 'northstarlabs' NOT NULL;
--> statement-breakpoint
INSERT OR IGNORE INTO `schools`
	(`id`,`slug`,`name`,`description`,`logo_url`,`primary_color`,`owner_id`,`status`,`created_at`,`updated_at`)
VALUES
	('northstarlabs','northstarlabs','NorthstarLabs','Practical learning for independent creators and their learners.',NULL,'#3556d8','northstarlabs-studio','active',1784304000000,1784304000000);
--> statement-breakpoint
INSERT OR IGNORE INTO `schools`
	(`id`,`slug`,`name`,`description`,`logo_url`,`primary_color`,`owner_id`,`status`,`created_at`,`updated_at`)
SELECT
	'school-' || c.owner_id,
	'academy-' || lower(replace(c.owner_id,'-','')),
	COALESCE(NULLIF(p.display_name,''),'Creator') || '''s Academy',
	'',
	NULL,
	'#3556d8',
	c.owner_id,
	'active',
	MIN(c.created_at),
	MAX(c.updated_at)
FROM courses c
LEFT JOIN profiles p ON p.id=c.owner_id
WHERE c.owner_id<>'northstarlabs-studio'
GROUP BY c.owner_id;
--> statement-breakpoint
UPDATE `courses`
SET `school_id`=CASE
	WHEN `owner_id`='northstarlabs-studio' THEN 'northstarlabs'
	ELSE 'school-' || `owner_id`
END;
--> statement-breakpoint
UPDATE `communities`
SET `school_id`='northstarlabs',`owner_id`='northstarlabs-studio'
WHERE `id`='northstar-circle';
--> statement-breakpoint
UPDATE `community_members`
SET `role`='member'
WHERE `community_id`='northstar-circle'
	AND `user_id`<>'northstarlabs-studio'
	AND `role`='owner';
--> statement-breakpoint
INSERT OR IGNORE INTO `school_members`
	(`id`,`school_id`,`user_id`,`role`,`status`,`joined_at`)
VALUES
	('northstarlabs-studio-owner','northstarlabs','northstarlabs-studio','owner','active',1784304000000);
--> statement-breakpoint
INSERT OR IGNORE INTO `school_members`
	(`id`,`school_id`,`user_id`,`role`,`status`,`joined_at`)
SELECT
	'school-owner-' || c.owner_id,
	c.school_id,
	c.owner_id,
	'owner',
	'active',
	MIN(c.created_at)
FROM courses c
WHERE c.owner_id<>'northstarlabs-studio'
GROUP BY c.school_id,c.owner_id;
--> statement-breakpoint
INSERT OR IGNORE INTO `school_members`
	(`id`,`school_id`,`user_id`,`role`,`status`,`joined_at`)
SELECT
	'school-learner-' || c.school_id || '-' || e.user_id,
	c.school_id,
	e.user_id,
	'learner',
	CASE WHEN MAX(CASE WHEN e.status='active' THEN 1 ELSE 0 END)=1
		THEN 'active' ELSE 'paused' END,
	MIN(e.created_at)
FROM enrollments e
JOIN courses c ON c.id=e.course_id
GROUP BY c.school_id,e.user_id;
--> statement-breakpoint
INSERT OR IGNORE INTO `communities`
	(`id`,`school_id`,`owner_id`,`name`,`description`,`access_type`,`allow_posting`,`created_at`)
SELECT
	'community-' || s.id,
	s.id,
	s.owner_id,
	s.name || ' Community',
	'A private space for learners to ask questions, share progress, and support one another.',
	'enrolled',
	1,
	s.created_at
FROM schools s
WHERE NOT EXISTS (SELECT 1 FROM communities c WHERE c.school_id=s.id);
--> statement-breakpoint
INSERT OR IGNORE INTO `community_members`
	(`id`,`community_id`,`user_id`,`role`,`status`,`joined_at`)
SELECT
	'community-owner-' || c.id,
	c.id,
	c.owner_id,
	'owner',
	'active',
	c.created_at
FROM communities c;
--> statement-breakpoint
UPDATE `profiles`
SET
	`role`='creator',
	`active_school_id`=(
		SELECT sm.school_id FROM school_members sm
		WHERE sm.user_id=profiles.id AND sm.role='owner' AND sm.status='active'
		ORDER BY sm.joined_at LIMIT 1
	)
WHERE EXISTS (
	SELECT 1 FROM school_members sm
	WHERE sm.user_id=profiles.id AND sm.role IN ('owner','admin','instructor') AND sm.status='active'
);
--> statement-breakpoint
UPDATE `profiles`
SET `active_school_id`=(
	SELECT c.school_id FROM enrollments e
	JOIN courses c ON c.id=e.course_id
	WHERE e.user_id=profiles.id AND e.status='active'
	ORDER BY e.created_at DESC LIMIT 1
)
WHERE `active_school_id` IS NULL;
--> statement-breakpoint
DELETE FROM `enrollments`
WHERE rowid NOT IN (
	SELECT MIN(rowid) FROM enrollments GROUP BY user_id,course_id
);
--> statement-breakpoint
CREATE UNIQUE INDEX `communities_school_unique` ON `communities` (`school_id`);
--> statement-breakpoint
CREATE INDEX `courses_school_status_idx` ON `courses` (`school_id`,`status`,`updated_at`);
--> statement-breakpoint
CREATE INDEX `courses_owner_idx` ON `courses` (`owner_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrollments_user_course_unique` ON `enrollments` (`user_id`,`course_id`);
--> statement-breakpoint
CREATE INDEX `enrollments_course_status_idx` ON `enrollments` (`course_id`,`status`);
--> statement-breakpoint
CREATE INDEX `enrollments_user_status_idx` ON `enrollments` (`user_id`,`status`);
--> statement-breakpoint
CREATE INDEX `lessons_course_position_idx` ON `lessons` (`course_id`,`position`);
--> statement-breakpoint
CREATE INDEX `posts_community_status_created_idx` ON `posts` (`community_id`,`status`,`created_at`);
