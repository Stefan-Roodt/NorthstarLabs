CREATE TABLE `community_members` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`joined_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `community_members_community_user_unique` ON `community_members` (`community_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `communities` ADD `access_type` text DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE `communities` ADD `allow_posting` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `status` text DEFAULT 'visible' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `moderated_by` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `moderated_at` integer;