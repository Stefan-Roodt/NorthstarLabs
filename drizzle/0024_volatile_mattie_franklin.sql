ALTER TABLE `email_messages` ADD `scheduled_at` integer;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD `live_session_reminders` integer DEFAULT true NOT NULL;