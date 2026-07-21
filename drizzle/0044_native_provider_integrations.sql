ALTER TABLE `integrations` ADD `settings_json` text DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE `integrations` ADD `credentials_json` text;
