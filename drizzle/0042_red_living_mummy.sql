CREATE TABLE `demand_followers` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`unsubscribe_token_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demand_followers_topic_email_unique` ON `demand_followers` (`topic_id`,`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `demand_followers_unsubscribe_token_unique` ON `demand_followers` (`unsubscribe_token_hash`);--> statement-breakpoint
CREATE INDEX `demand_followers_topic_status_idx` ON `demand_followers` (`topic_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `demand_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`learning_request_id` text,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`summary` text NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`preferred_format` text DEFAULT 'either' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`visibility` text DEFAULT 'pending' NOT NULL,
	`public_note` text DEFAULT '' NOT NULL,
	`matched_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`released_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demand_topics_slug_unique` ON `demand_topics` (`slug`);--> statement-breakpoint
CREATE INDEX `demand_topics_visibility_status_updated_idx` ON `demand_topics` (`visibility`,`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `demand_topics_category_visibility_idx` ON `demand_topics` (`category`,`visibility`,`updated_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `demand_topics_learning_request_unique` ON `demand_topics` (`learning_request_id`);--> statement-breakpoint
CREATE TABLE `demand_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`voter_key_hash` text NOT NULL,
	`value` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `demand_votes_topic_voter_unique` ON `demand_votes` (`topic_id`,`voter_key_hash`);--> statement-breakpoint
CREATE INDEX `demand_votes_topic_value_idx` ON `demand_votes` (`topic_id`,`value`,`updated_at`);--> statement-breakpoint
INSERT INTO `demand_topics`
  (`id`,`learning_request_id`,`title`,`slug`,`summary`,`category`,`preferred_format`,`status`,`visibility`,`public_note`,`matched_url`,`created_at`,`updated_at`,`released_at`)
VALUES
  ('starter-demand-bitcoin-custody',NULL,'Bitcoin custody and security for organisations','bitcoin-custody-and-security-for-organisations','A practical learning path for teams that need to understand custody models, key management, governance, operational risk, and incident readiness without sales hype.','finance','course','open','published','',NULL,1784629800000,1784629800000,NULL),
  ('starter-demand-ai-governance',NULL,'AI governance for small and medium businesses','ai-governance-for-small-and-medium-businesses','Plain-language guidance for adopting AI responsibly: policy, data boundaries, human review, vendor questions, staff use, and a workable first governance plan.','technology','live','open','published','',NULL,1784629800001,1784629800001,NULL),
  ('starter-demand-entrepreneurship',NULL,'Practical entrepreneurship: from idea to first customer','practical-entrepreneurship-from-idea-to-first-customer','A field-tested sequence for choosing a real problem, validating demand, shaping an offer, pricing it, and reaching a first paying customer.','business','course','open','published','',NULL,1784629800002,1784629800002,NULL),
  ('starter-demand-personal-finance',NULL,'Personal finance foundations for Southern Africa','personal-finance-foundations-for-southern-africa','A locally relevant foundation covering cash flow, emergency funds, debt decisions, risk protection, long-term investing, and common financial traps.','finance','course','open','published','',NULL,1784629800003,1784629800003,NULL),
  ('starter-demand-train-trainer',NULL,'Train the trainer: build learning people finish','train-the-trainer-build-learning-people-finish','A hands-on programme for subject experts who want to turn knowledge into clear modules, useful practice, strong assessments, and a learning experience people complete.','education','course','open','published','',NULL,1784629800004,1784629800004,NULL),
  ('starter-demand-data-ai-career',NULL,'Career transition into data and AI','career-transition-into-data-and-ai','A realistic roadmap for working adults to assess transferable skills, choose a role, build evidence, practise the right tools, and become interview-ready.','career','either','open','published','',NULL,1784629800005,1784629800005,NULL);
