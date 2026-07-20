CREATE TABLE `school_slug_aliases` (
	`slug` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `school_slug_aliases_school_idx` ON `school_slug_aliases` (`school_id`);