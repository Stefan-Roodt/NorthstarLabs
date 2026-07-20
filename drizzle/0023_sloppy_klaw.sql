CREATE TABLE `learning_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`requester_name` text NOT NULL,
	`requester_email` text NOT NULL,
	`request_type` text DEFAULT 'either' NOT NULL,
	`topic` text NOT NULL,
	`detail` text NOT NULL,
	`source` text DEFAULT 'homepage' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`admin_note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `learning_requests_status_created_idx` ON `learning_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `learning_requests_email_created_idx` ON `learning_requests` (`requester_email`,`created_at`);--> statement-breakpoint
CREATE INDEX `learning_requests_type_status_idx` ON `learning_requests` (`request_type`,`status`);--> statement-breakpoint
UPDATE `schools`
SET `name`='CogniZen Consulting',
    `updated_at`=CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE `slug`='stefan-roodt-s-academy';
