ALTER TABLE `memberships` ADD `payfast_token` text;--> statement-breakpoint
ALTER TABLE `memberships` ADD `payfast_payment_id` text;--> statement-breakpoint
ALTER TABLE `memberships` ADD `provider` text DEFAULT 'payfast' NOT NULL;