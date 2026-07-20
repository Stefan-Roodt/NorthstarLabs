CREATE TABLE `tutor_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`tutor_id` text NOT NULL,
	`school_id` text NOT NULL,
	`submitted_by` text NOT NULL,
	`title` text NOT NULL,
	`issuer` text DEFAULT '' NOT NULL,
	`awarded_year` integer,
	`evidence_url` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewer_note` text DEFAULT '' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tutor_credentials_tutor_status_idx` ON `tutor_credentials` (`tutor_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `tutor_credentials_school_status_idx` ON `tutor_credentials` (`school_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `tutor_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_id` text NOT NULL,
	`tutor_id` text NOT NULL,
	`school_id` text NOT NULL,
	`learner_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tutor_reviews_inquiry_unique` ON `tutor_reviews` (`inquiry_id`);--> statement-breakpoint
CREATE INDEX `tutor_reviews_tutor_status_created_idx` ON `tutor_reviews` (`tutor_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `tutor_reviews_learner_created_idx` ON `tutor_reviews` (`learner_id`,`created_at`);