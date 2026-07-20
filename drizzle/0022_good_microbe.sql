CREATE TABLE `learner_session_ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_id` text NOT NULL,
	`tutor_id` text NOT NULL,
	`school_id` text NOT NULL,
	`learner_id` text NOT NULL,
	`rated_by` text NOT NULL,
	`rating` integer NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`private_note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`visible_after` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learner_session_ratings_inquiry_unique` ON `learner_session_ratings` (`inquiry_id`);--> statement-breakpoint
CREATE INDEX `learner_session_ratings_learner_status_created_idx` ON `learner_session_ratings` (`learner_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `learner_session_ratings_school_status_created_idx` ON `learner_session_ratings` (`school_id`,`status`,`created_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tutor_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`inquiry_id` text NOT NULL,
	`tutor_id` text NOT NULL,
	`school_id` text NOT NULL,
	`learner_id` text NOT NULL,
	`rating` integer NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`visible_after` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tutor_reviews`("id", "inquiry_id", "tutor_id", "school_id", "learner_id", "rating", "tags_json", "comment", "status", "visible_after", "created_at", "updated_at") SELECT "id", "inquiry_id", "tutor_id", "school_id", "learner_id", "rating", '[]', "comment", "status", 0, "created_at", "updated_at" FROM `tutor_reviews`;--> statement-breakpoint
DROP TABLE `tutor_reviews`;--> statement-breakpoint
ALTER TABLE `__new_tutor_reviews` RENAME TO `tutor_reviews`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `tutor_reviews_inquiry_unique` ON `tutor_reviews` (`inquiry_id`);--> statement-breakpoint
CREATE INDEX `tutor_reviews_tutor_status_created_idx` ON `tutor_reviews` (`tutor_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `tutor_reviews_learner_created_idx` ON `tutor_reviews` (`learner_id`,`created_at`);
