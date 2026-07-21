CREATE TABLE `course_import_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`created_by` text NOT NULL,
	`provider` text DEFAULT 'other' NOT NULL,
	`source_type` text DEFAULT 'course_export' NOT NULL,
	`source_filename` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'previewed' NOT NULL,
	`rights_confirmed` integer DEFAULT false NOT NULL,
	`plan_json` text NOT NULL,
	`summary_json` text DEFAULT '{}' NOT NULL,
	`warnings_json` text DEFAULT '[]' NOT NULL,
	`result_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`imported_at` integer
);
--> statement-breakpoint
CREATE INDEX `course_import_projects_school_updated_idx` ON `course_import_projects` (`school_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `course_import_projects_creator_updated_idx` ON `course_import_projects` (`created_by`,`updated_at`);--> statement-breakpoint
CREATE INDEX `course_import_projects_status_updated_idx` ON `course_import_projects` (`status`,`updated_at`);