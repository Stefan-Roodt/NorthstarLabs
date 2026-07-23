CREATE TABLE IF NOT EXISTS `in_app_notifications` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `school_id` text,
  `template_key` text NOT NULL,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `action_label` text NOT NULL DEFAULT 'Open',
  `action_url` text NOT NULL DEFAULT '/',
  `idempotency_key` text NOT NULL,
  `read_at` integer,
  `created_at` integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `in_app_notifications_idempotency_unique`
  ON `in_app_notifications` (`idempotency_key`);
CREATE INDEX IF NOT EXISTS `in_app_notifications_user_read_created_idx`
  ON `in_app_notifications` (`user_id`,`read_at`,`created_at`);
