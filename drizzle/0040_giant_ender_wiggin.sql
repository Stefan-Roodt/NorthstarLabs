CREATE TABLE `academy_exports` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`requested_by` text NOT NULL,
	`status` text DEFAULT 'preparing' NOT NULL,
	`format_version` integer DEFAULT 1 NOT NULL,
	`object_key` text,
	`filename` text NOT NULL,
	`size_bytes` integer DEFAULT 0 NOT NULL,
	`file_count` integer DEFAULT 0 NOT NULL,
	`record_count` integer DEFAULT 0 NOT NULL,
	`original_file_count` integer DEFAULT 0 NOT NULL,
	`manifest_checksum` text,
	`failure_message` text,
	`download_token_hash` text,
	`download_token_expires_at` integer,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	`expires_at` integer,
	`downloaded_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `academy_exports_school_created_idx` ON `academy_exports` (`school_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `academy_exports_status_expiry_idx` ON `academy_exports` (`status`,`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `academy_exports_download_token_unique` ON `academy_exports` (`download_token_hash`);