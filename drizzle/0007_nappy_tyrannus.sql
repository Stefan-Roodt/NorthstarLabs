CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`course_id` text,
	`email` text NOT NULL,
	`role` text DEFAULT 'learner' NOT NULL,
	`token_hash` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`invited_by` text NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_by` text,
	`accepted_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_token_hash_unique` ON `invitations` (`token_hash`);--> statement-breakpoint
CREATE INDEX `invitations_school_status_created_idx` ON `invitations` (`school_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `invitations_email_status_idx` ON `invitations` (`email`,`status`);--> statement-breakpoint
ALTER TABLE `profiles` ADD `onboarding_path` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `onboarding_completed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `onboarded_at` integer;