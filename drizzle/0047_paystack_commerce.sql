ALTER TABLE `memberships` ADD `provider_subscription_id` text;
--> statement-breakpoint
ALTER TABLE `memberships` ADD `provider_customer_id` text;
--> statement-breakpoint
ALTER TABLE `payment_orders` ADD `provider` text DEFAULT 'payfast' NOT NULL;
--> statement-breakpoint
ALTER TABLE `payment_orders` ADD `provider_payment_id` text;
--> statement-breakpoint
ALTER TABLE `payment_orders` ADD `provider_subscription_id` text;
--> statement-breakpoint
ALTER TABLE `payment_orders` ADD `provider_customer_id` text;
--> statement-breakpoint
ALTER TABLE `payment_orders` ADD `provider_plan_id` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_orders_provider_payment_unique` ON `payment_orders` (`provider`,`provider_payment_id`);
--> statement-breakpoint
CREATE INDEX `payment_orders_provider_subscription_idx` ON `payment_orders` (`provider`,`provider_subscription_id`);
--> statement-breakpoint
ALTER TABLE `payment_events` ADD `provider` text DEFAULT 'payfast' NOT NULL;
--> statement-breakpoint
ALTER TABLE `payment_events` ADD `provider_event_id` text;
--> statement-breakpoint
ALTER TABLE `payment_events` ADD `provider_payment_id` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_events_provider_event_unique` ON `payment_events` (`provider`,`provider_event_id`);
--> statement-breakpoint
CREATE TABLE `payment_provider_plans` (
  `id` text PRIMARY KEY NOT NULL,
  `provider` text NOT NULL,
  `purpose` text NOT NULL,
  `target_key` text NOT NULL,
  `provider_plan_id` text NOT NULL,
  `name` text NOT NULL,
  `amount_cents` integer NOT NULL,
  `currency` text DEFAULT 'ZAR' NOT NULL,
  `interval` text NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_provider_plans_target_unique` ON `payment_provider_plans` (`provider`,`purpose`,`target_key`,`amount_cents`,`currency`,`interval`);
