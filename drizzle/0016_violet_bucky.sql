CREATE TABLE `tutor_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`tutor_id` text NOT NULL,
	`school_id` text NOT NULL,
	`created_by` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`timezone` text DEFAULT 'Africa/Johannesburg' NOT NULL,
	`session_mode` text DEFAULT 'online' NOT NULL,
	`meeting_details` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tutor_slots_tutor_start_unique` ON `tutor_slots` (`tutor_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `tutor_slots_tutor_status_start_idx` ON `tutor_slots` (`tutor_id`,`status`,`starts_at`);--> statement-breakpoint
CREATE INDEX `tutor_slots_school_status_start_idx` ON `tutor_slots` (`school_id`,`status`,`starts_at`);--> statement-breakpoint
ALTER TABLE `tutor_inquiries` ADD `slot_id` text;--> statement-breakpoint
CREATE INDEX `tutor_inquiries_slot_status_idx` ON `tutor_inquiries` (`slot_id`,`status`);