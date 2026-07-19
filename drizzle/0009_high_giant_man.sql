CREATE TABLE `media_playback_grants` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`asset_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`kind` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `media_playback_grants_user_expiry_idx` ON `media_playback_grants` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE INDEX `media_playback_grants_course_expiry_idx` ON `media_playback_grants` (`course_id`,`expires_at`);