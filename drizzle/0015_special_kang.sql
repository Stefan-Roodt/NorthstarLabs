CREATE TABLE `tutor_inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`tutor_id` text NOT NULL,
	`school_id` text NOT NULL,
	`learner_id` text NOT NULL,
	`learner_name` text NOT NULL,
	`learner_email` text NOT NULL,
	`phone_number` text DEFAULT '' NOT NULL,
	`subject` text DEFAULT '' NOT NULL,
	`message` text NOT NULL,
	`preferred_times` text DEFAULT '' NOT NULL,
	`contact_preference` text DEFAULT 'email' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`creator_note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tutor_inquiries_tutor_status_created_idx` ON `tutor_inquiries` (`tutor_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `tutor_inquiries_school_status_created_idx` ON `tutor_inquiries` (`school_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `tutor_inquiries_learner_created_idx` ON `tutor_inquiries` (`learner_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `tutors` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`user_id` text,
	`created_by` text NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`headline` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`subjects_json` text DEFAULT '[]' NOT NULL,
	`languages_json` text DEFAULT '[]' NOT NULL,
	`qualifications` text DEFAULT '' NOT NULL,
	`experience_years` integer DEFAULT 0 NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`price_unit` text DEFAULT 'hour' NOT NULL,
	`session_mode` text DEFAULT 'online' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`timezone` text DEFAULT 'Africa/Johannesburg' NOT NULL,
	`availability` text DEFAULT '' NOT NULL,
	`photo_url` text,
	`contact_email` text DEFAULT '' NOT NULL,
	`phone_number` text DEFAULT '' NOT NULL,
	`whatsapp_number` text DEFAULT '' NOT NULL,
	`booking_url` text,
	`show_direct_contact` integer DEFAULT false NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tutors_school_slug_unique` ON `tutors` (`school_id`,`slug`);--> statement-breakpoint
CREATE INDEX `tutors_school_status_updated_idx` ON `tutors` (`school_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `tutors_user_status_idx` ON `tutors` (`user_id`,`status`);