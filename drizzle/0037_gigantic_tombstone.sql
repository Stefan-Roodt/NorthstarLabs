CREATE TABLE `learning_portfolios` (
	`user_id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`headline` text DEFAULT 'Learning made visible' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`visibility` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_portfolios_slug_unique` ON `learning_portfolios` (`slug`);--> statement-breakpoint
CREATE INDEX `learning_portfolios_visibility_updated_idx` ON `learning_portfolios` (`visibility`,`updated_at`);--> statement-breakpoint
CREATE TABLE `portfolio_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text,
	`evidence_type` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`skills` text DEFAULT '' NOT NULL,
	`evidence_url` text,
	`achieved_at` integer,
	`visible` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `portfolio_evidence_user_visible_sort_idx` ON `portfolio_evidence` (`user_id`,`visible`,`sort_order`);--> statement-breakpoint
CREATE INDEX `portfolio_evidence_course_idx` ON `portfolio_evidence` (`course_id`);--> statement-breakpoint
CREATE TABLE `portfolio_source_visibility` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`visible` integer DEFAULT false NOT NULL,
	`show_score` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portfolio_source_user_type_id_unique` ON `portfolio_source_visibility` (`user_id`,`source_type`,`source_id`);--> statement-breakpoint
CREATE INDEX `portfolio_source_user_visible_idx` ON `portfolio_source_visibility` (`user_id`,`visible`,`updated_at`);