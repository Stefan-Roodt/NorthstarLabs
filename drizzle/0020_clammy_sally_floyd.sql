ALTER TABLE `tutors` ADD `service_type` text DEFAULT 'coaching' NOT NULL;--> statement-breakpoint
ALTER TABLE `tutors` ADD `listing_tier` text DEFAULT 'listed' NOT NULL;--> statement-breakpoint
ALTER TABLE `tutors` ADD `listing_monthly_cents` integer DEFAULT 14900 NOT NULL;