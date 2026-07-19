CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`school_id` text,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`detail_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_logs_school_created_idx` ON `audit_logs` (`school_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_created_idx` ON `audit_logs` (`actor_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `email_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text,
	`recipient_user_id` text,
	`recipient_email` text NOT NULL,
	`template_key` text NOT NULL,
	`subject` text NOT NULL,
	`html_body` text NOT NULL,
	`text_body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`provider` text DEFAULT 'resend' NOT NULL,
	`provider_message_id` text,
	`idempotency_key` text NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`available_at` integer NOT NULL,
	`sent_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_messages_idempotency_unique` ON `email_messages` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `email_messages_status_available_idx` ON `email_messages` (`status`,`available_at`);--> statement-breakpoint
CREATE INDEX `email_messages_school_created_idx` ON `email_messages` (`school_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `email_messages_recipient_created_idx` ON `email_messages` (`recipient_email`,`created_at`);--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`enrollment_emails` integer DEFAULT true NOT NULL,
	`completion_emails` integer DEFAULT true NOT NULL,
	`community_emails` integer DEFAULT true NOT NULL,
	`creator_summaries` integer DEFAULT true NOT NULL,
	`product_updates` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_preferences_user_unique` ON `notification_preferences` (`user_id`);--> statement-breakpoint
CREATE TABLE `report_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`created_by` text NOT NULL,
	`frequency` text DEFAULT 'weekly' NOT NULL,
	`recipient_email` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`next_run_at` integer NOT NULL,
	`last_run_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `report_schedules_due_idx` ON `report_schedules` (`status`,`next_run_at`);--> statement-breakpoint
CREATE INDEX `report_schedules_school_idx` ON `report_schedules` (`school_id`,`status`);--> statement-breakpoint
ALTER TABLE `profiles` ADD `status` text DEFAULT 'active' NOT NULL;