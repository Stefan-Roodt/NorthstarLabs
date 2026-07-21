CREATE TABLE `lesson_help_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`course_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`learner_id` text NOT NULL,
	`question` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`response` text DEFAULT '' NOT NULL,
	`responded_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`responded_at` integer
);
--> statement-breakpoint
CREATE INDEX `lesson_help_requests_school_status_updated_idx` ON `lesson_help_requests` (`school_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `lesson_help_requests_course_lesson_created_idx` ON `lesson_help_requests` (`course_id`,`lesson_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `lesson_help_requests_learner_status_created_idx` ON `lesson_help_requests` (`learner_id`,`status`,`created_at`);