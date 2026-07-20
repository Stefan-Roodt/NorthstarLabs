CREATE TABLE `creator_studio_generations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`school_id` text NOT NULL,
	`requested_by` text NOT NULL,
	`generation_type` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`output_json` text DEFAULT '' NOT NULL,
	`error_message` text,
	`created_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `creator_studio_generations_project_created_idx` ON `creator_studio_generations` (`project_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `creator_studio_generations_school_status_idx` ON `creator_studio_generations` (`school_id`,`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `creator_studio_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`course_id` text,
	`title` text NOT NULL,
	`audience` text NOT NULL,
	`outcome` text NOT NULL,
	`lesson_minutes` integer DEFAULT 6 NOT NULL,
	`source_declaration` integer DEFAULT false NOT NULL,
	`ai_disclosure` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'sources' NOT NULL,
	`blueprint_json` text DEFAULT '' NOT NULL,
	`provider` text DEFAULT 'google_gemini' NOT NULL,
	`model` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `creator_studio_projects_school_updated_idx` ON `creator_studio_projects` (`school_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `creator_studio_projects_owner_updated_idx` ON `creator_studio_projects` (`owner_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `creator_studio_projects_course_idx` ON `creator_studio_projects` (`course_id`);--> statement-breakpoint
CREATE TABLE `creator_studio_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`school_id` text NOT NULL,
	`added_by` text NOT NULL,
	`title` text NOT NULL,
	`source_type` text DEFAULT 'notes' NOT NULL,
	`source_url` text,
	`source_text` text DEFAULT '' NOT NULL,
	`rights_basis` text NOT NULL,
	`citation_label` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `creator_studio_sources_project_idx` ON `creator_studio_sources` (`project_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `creator_studio_sources_school_idx` ON `creator_studio_sources` (`school_id`,`created_at`);