CREATE TABLE `integration_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`integration_id` text NOT NULL,
	`event_type` text NOT NULL,
	`payload_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`response_status` integer,
	`error_message` text,
	`created_at` integer NOT NULL,
	`delivered_at` integer
);
--> statement-breakpoint
CREATE INDEX `integration_deliveries_integration_created_idx` ON `integration_deliveries` (`integration_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `integration_deliveries_status_created_idx` ON `integration_deliveries` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`created_by` text NOT NULL,
	`provider` text DEFAULT 'webhook' NOT NULL,
	`name` text NOT NULL,
	`endpoint_url` text,
	`event_types_json` text DEFAULT '[]' NOT NULL,
	`signing_secret` text,
	`status` text DEFAULT 'active' NOT NULL,
	`last_delivery_at` integer,
	`last_delivery_status` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `integrations_school_status_idx` ON `integrations` (`school_id`,`status`,`provider`);--> statement-breakpoint
CREATE TABLE `live_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'registered' NOT NULL,
	`registered_at` integer NOT NULL,
	`attended_at` integer,
	`attendance_minutes` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `live_attendance_session_user_unique` ON `live_attendance` (`session_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `live_attendance_user_status_idx` ON `live_attendance` (`user_id`,`status`,`registered_at`);--> statement-breakpoint
CREATE INDEX `live_attendance_session_status_idx` ON `live_attendance` (`session_id`,`status`);--> statement-breakpoint
CREATE TABLE `live_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`product_id` text,
	`course_id` text,
	`host_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`timezone` text DEFAULT 'Africa/Johannesburg' NOT NULL,
	`meeting_provider` text DEFAULT 'other' NOT NULL,
	`meeting_url` text NOT NULL,
	`capacity` integer DEFAULT 0 NOT NULL,
	`recording_asset_id` text,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `live_sessions_school_start_idx` ON `live_sessions` (`school_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `live_sessions_product_start_idx` ON `live_sessions` (`product_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `live_sessions_course_start_idx` ON `live_sessions` (`course_id`,`starts_at`);--> statement-breakpoint
CREATE TABLE `product_entitlements` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`source_reference` text,
	`status` text DEFAULT 'active' NOT NULL,
	`starts_at` integer NOT NULL,
	`expires_at` integer,
	`granted_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_entitlements_product_user_unique` ON `product_entitlements` (`product_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `product_entitlements_user_status_idx` ON `product_entitlements` (`user_id`,`status`,`expires_at`);--> statement-breakpoint
CREATE INDEX `product_entitlements_product_status_idx` ON `product_entitlements` (`product_id`,`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `product_items` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`item_type` text DEFAULT 'course' NOT NULL,
	`item_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_items_product_target_unique` ON `product_items` (`product_id`,`item_type`,`item_id`);--> statement-breakpoint
CREATE INDEX `product_items_target_idx` ON `product_items` (`item_type`,`item_id`);--> statement-breakpoint
CREATE INDEX `product_items_product_position_idx` ON `product_items` (`product_id`,`position`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`product_type` text DEFAULT 'bundle' NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`billing_interval` text DEFAULT 'one_time' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`includes_community` integer DEFAULT false NOT NULL,
	`access_duration_days` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_school_slug_unique` ON `products` (`school_id`,`slug`);--> statement-breakpoint
CREATE INDEX `products_school_status_updated_idx` ON `products` (`school_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `products_school_type_status_idx` ON `products` (`school_id`,`product_type`,`status`);--> statement-breakpoint
ALTER TABLE `community_members` ADD `access_source` text DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE `community_members` ADD `access_source_id` text;--> statement-breakpoint
CREATE INDEX `community_members_access_source_idx` ON `community_members` (`access_source`,`access_source_id`);--> statement-breakpoint
ALTER TABLE `enrollments` ADD `access_source` text DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `access_source_id` text;--> statement-breakpoint
CREATE INDEX `enrollments_access_source_idx` ON `enrollments` (`access_source`,`access_source_id`);