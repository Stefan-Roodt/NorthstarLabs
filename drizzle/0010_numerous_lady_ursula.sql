CREATE TABLE `quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`user_id` text NOT NULL,
	`attempt_number` integer NOT NULL,
	`answers_json` text NOT NULL,
	`score` integer NOT NULL,
	`passed` integer DEFAULT false NOT NULL,
	`submitted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_attempts_quiz_user_number_unique` ON `quiz_attempts` (`quiz_id`,`user_id`,`attempt_number`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_user_submitted_idx` ON `quiz_attempts` (`user_id`,`submitted_at`);--> statement-breakpoint
ALTER TABLE `certificates` ADD `recipient_name` text DEFAULT 'NorthStarLabs learner' NOT NULL;--> statement-breakpoint
ALTER TABLE `certificates` ADD `course_title` text DEFAULT 'NorthStarLabs course' NOT NULL;--> statement-breakpoint
ALTER TABLE `certificates` ADD `certificate_title` text DEFAULT 'Certificate of Completion' NOT NULL;--> statement-breakpoint
ALTER TABLE `certificates` ADD `accent_color` text DEFAULT '#3556d8' NOT NULL;--> statement-breakpoint
ALTER TABLE `certificates` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `certificates` ADD `expires_at` integer;--> statement-breakpoint
ALTER TABLE `certificates` ADD `revoked_at` integer;--> statement-breakpoint
ALTER TABLE `certificates` ADD `replaced_by_code` text;--> statement-breakpoint
CREATE UNIQUE INDEX `certificates_code_unique` ON `certificates` (`code`);--> statement-breakpoint
CREATE INDEX `certificates_user_course_idx` ON `certificates` (`user_id`,`course_id`,`issued_at`);--> statement-breakpoint
CREATE INDEX `certificates_course_status_idx` ON `certificates` (`course_id`,`status`,`issued_at`);--> statement-breakpoint
ALTER TABLE `courses` ADD `enforce_lesson_order` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `available_from` integer;--> statement-breakpoint
ALTER TABLE `courses` ADD `certificate_title` text DEFAULT 'Certificate of Completion' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `certificate_accent` text DEFAULT '#3556d8' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `certificate_valid_days` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD `watched_percent` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD `notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD `bookmarked` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_progress_user_lesson_unique` ON `lesson_progress` (`user_id`,`lesson_id`);--> statement-breakpoint
CREATE INDEX `lesson_progress_user_bookmarked_idx` ON `lesson_progress` (`user_id`,`bookmarked`,`updated_at`);--> statement-breakpoint
ALTER TABLE `lessons` ADD `available_after_days` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `required_watch_percent` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `transcript` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `max_attempts` integer DEFAULT 0 NOT NULL;