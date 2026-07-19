CREATE TABLE `course_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`title` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `course_sections_course_position_idx` ON `course_sections` (`course_id`,`position`);--> statement-breakpoint
CREATE TABLE `lesson_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`title` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_resources_lesson_asset_unique` ON `lesson_resources` (`lesson_id`,`asset_id`);--> statement-breakpoint
CREATE INDEX `lesson_resources_asset_idx` ON `lesson_resources` (`asset_id`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`kind` text NOT NULL,
	`alt_text` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_key_unique` ON `media_assets` (`key`);--> statement-breakpoint
CREATE INDEX `media_assets_school_kind_created_idx` ON `media_assets` (`school_id`,`kind`,`created_at`);--> statement-breakpoint
DROP INDEX `lessons_course_position_idx`;--> statement-breakpoint
ALTER TABLE `lessons` ADD `section_id` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `lesson_type` text DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `content_format` text DEFAULT 'markdown' NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `primary_asset_id` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `duration_minutes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `is_preview` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `updated_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
INSERT INTO `course_sections` (`id`,`course_id`,`title`,`position`,`created_at`)
SELECT 'section-' || `id`,`id`,'Course content',0,`created_at`
FROM `courses`;--> statement-breakpoint
UPDATE `lessons`
SET `section_id`='section-' || `course_id`,
    `updated_at`=COALESCE(
      (SELECT `updated_at` FROM `courses` WHERE `courses`.`id`=`lessons`.`course_id`),
      0
    )
WHERE `section_id` IS NULL;--> statement-breakpoint
CREATE INDEX `lessons_course_position_idx` ON `lessons` (`course_id`,`section_id`,`position`);
