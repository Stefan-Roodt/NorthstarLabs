CREATE TABLE `backup_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`requested_by` text NOT NULL,
	`status` text DEFAULT 'running' NOT NULL,
	`object_key` text,
	`table_count` integer DEFAULT 0 NOT NULL,
	`row_count` integer DEFAULT 0 NOT NULL,
	`size_bytes` integer DEFAULT 0 NOT NULL,
	`checksum` text,
	`failure_message` text,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	`verified_at` integer
);
--> statement-breakpoint
CREATE INDEX `backup_runs_status_created_idx` ON `backup_runs` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `backup_runs_created_idx` ON `backup_runs` (`created_at`);--> statement-breakpoint
CREATE TABLE `content_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`community_id` text NOT NULL,
	`post_id` text NOT NULL,
	`reporter_id` text NOT NULL,
	`reason` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`reviewed_by` text,
	`created_at` integer NOT NULL,
	`reviewed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_reports_post_reporter_open_unique` ON `content_reports` (`post_id`,`reporter_id`,`status`);--> statement-breakpoint
CREATE INDEX `content_reports_school_status_created_idx` ON `content_reports` (`school_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `content_reports_post_idx` ON `content_reports` (`post_id`);--> statement-breakpoint
CREATE TABLE `data_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`request_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`object_key` text,
	`failure_message` text,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	`expires_at` integer
);
--> statement-breakpoint
CREATE INDEX `data_requests_user_created_idx` ON `data_requests` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `data_requests_status_created_idx` ON `data_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limit_buckets` (
	`bucket_key` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`request_count` integer DEFAULT 0 NOT NULL,
	`window_started_at` integer NOT NULL,
	`reset_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limit_buckets_reset_idx` ON `rate_limit_buckets` (`reset_at`);--> statement-breakpoint
CREATE INDEX `rate_limit_buckets_scope_updated_idx` ON `rate_limit_buckets` (`scope`,`updated_at`);--> statement-breakpoint
CREATE TABLE `system_events` (
	`id` text PRIMARY KEY NOT NULL,
	`severity` text DEFAULT 'info' NOT NULL,
	`source` text NOT NULL,
	`event_type` text NOT NULL,
	`message` text NOT NULL,
	`request_id` text,
	`route` text,
	`detail_json` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL,
	`resolved_at` integer,
	`resolved_by` text
);
--> statement-breakpoint
CREATE INDEX `system_events_status_severity_created_idx` ON `system_events` (`status`,`severity`,`created_at`);--> statement-breakpoint
CREATE INDEX `system_events_type_created_idx` ON `system_events` (`event_type`,`created_at`);--> statement-breakpoint
CREATE INDEX `system_events_request_idx` ON `system_events` (`request_id`);--> statement-breakpoint
CREATE INDEX `community_members_user_status_idx` ON `community_members` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `media_playback_grants_asset_expiry_idx` ON `media_playback_grants` (`asset_key`,`expires_at`);--> statement-breakpoint
CREATE INDEX `memberships_user_status_idx` ON `memberships` (`user_id`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_email_unique` ON `profiles` (`email`);--> statement-breakpoint
CREATE INDEX `profiles_status_created_idx` ON `profiles` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `quiz_questions_quiz_position_idx` ON `quiz_questions` (`quiz_id`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `quizzes_lesson_unique` ON `quizzes` (`lesson_id`);