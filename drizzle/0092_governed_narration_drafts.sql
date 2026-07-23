CREATE TABLE `lesson_narration_drafts` (
  `id` text PRIMARY KEY NOT NULL,
  `school_id` text NOT NULL,
  `course_id` text NOT NULL,
  `lesson_id` text NOT NULL,
  `draft_text` text NOT NULL,
  `status` text DEFAULT 'draft' NOT NULL,
  `source` text DEFAULT 'lesson_content' NOT NULL,
  `created_by` text NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT `lesson_narration_drafts_status_check`
    CHECK (`status` IN ('draft','approved','dismissed')),
  CONSTRAINT `lesson_narration_drafts_lesson_unique`
    UNIQUE (`lesson_id`)
);
--> statement-breakpoint
CREATE INDEX `lesson_narration_drafts_course_status_idx`
  ON `lesson_narration_drafts` (`course_id`,`status`,`updated_at`);
--> statement-breakpoint
CREATE INDEX `lesson_narration_drafts_school_status_idx`
  ON `lesson_narration_drafts` (`school_id`,`status`,`updated_at`);
