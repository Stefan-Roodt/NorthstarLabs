CREATE TABLE `payment_orders` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `school_id` text,
  `purpose` text NOT NULL,
  `target_id` text NOT NULL,
  `item_name` text NOT NULL,
  `amount_cents` integer NOT NULL,
  `currency` text DEFAULT 'ZAR' NOT NULL,
  `billing_interval` text DEFAULT 'one_time' NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `payfast_payment_id` text,
  `payfast_token` text,
  `payment_status` text,
  `failure_reason` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `payment_orders_user_created_idx` ON `payment_orders` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `payment_orders_status_updated_idx` ON `payment_orders` (`status`,`updated_at`);
--> statement-breakpoint
CREATE INDEX `payment_orders_target_idx` ON `payment_orders` (`purpose`,`target_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_orders_payfast_payment_unique` ON `payment_orders` (`payfast_payment_id`);
--> statement-breakpoint
CREATE TABLE `payment_events` (
  `id` text PRIMARY KEY NOT NULL,
  `order_id` text NOT NULL,
  `payfast_payment_id` text NOT NULL,
  `payment_status` text NOT NULL,
  `amount_cents` integer NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_events_payfast_payment_unique` ON `payment_events` (`payfast_payment_id`);
--> statement-breakpoint
CREATE INDEX `payment_events_order_created_idx` ON `payment_events` (`order_id`,`created_at`);
