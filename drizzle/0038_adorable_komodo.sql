CREATE TABLE `learner_concept_mastery` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`course_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`concept_label` text NOT NULL,
	`status` text DEFAULT 'needs_review' NOT NULL,
	`wrong_count` integer DEFAULT 0 NOT NULL,
	`correct_streak` integer DEFAULT 0 NOT NULL,
	`first_seen_at` integer NOT NULL,
	`last_reviewed_at` integer,
	`next_review_at` integer,
	`mastered_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learner_concept_mastery_user_question_unique` ON `learner_concept_mastery` (`user_id`,`question_id`);--> statement-breakpoint
CREATE INDEX `learner_concept_mastery_user_status_review_idx` ON `learner_concept_mastery` (`user_id`,`status`,`next_review_at`);--> statement-breakpoint
CREATE INDEX `learner_concept_mastery_course_user_idx` ON `learner_concept_mastery` (`course_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `mastery_practice_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_id` text NOT NULL,
	`selected_index` integer NOT NULL,
	`correct` integer DEFAULT false NOT NULL,
	`answered_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `mastery_practice_attempts_user_answered_idx` ON `mastery_practice_attempts` (`user_id`,`answered_at`);--> statement-breakpoint
CREATE INDEX `mastery_practice_attempts_question_user_idx` ON `mastery_practice_attempts` (`question_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `concept_label` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `quiz_questions`
SET `concept_label`=substr(rtrim(trim(`prompt`),'?!. '),1,100)
WHERE trim(`concept_label`)='';
