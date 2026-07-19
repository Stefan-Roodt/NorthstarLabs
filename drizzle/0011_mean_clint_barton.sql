ALTER TABLE `schools` ADD `cover_image_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `accent_color` text DEFAULT '#ffbd8a' NOT NULL;--> statement-breakpoint
ALTER TABLE `schools` ADD `hero_title` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schools` ADD `hero_description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schools` ADD `font_theme` text DEFAULT 'modern' NOT NULL;--> statement-breakpoint
ALTER TABLE `schools` ADD `support_email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schools` ADD `website_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `seo_title` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schools` ADD `seo_description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schools` ADD `show_community` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `schools` ADD `terms_url` text;--> statement-breakpoint
ALTER TABLE `schools` ADD `privacy_url` text;