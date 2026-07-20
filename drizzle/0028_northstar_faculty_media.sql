-- Give the flagship NorthstarLabs academy an honest, multi-faculty teaching presence.
INSERT OR IGNORE INTO `profiles`
  (`id`,`email`,`display_name`,`role`,`active_school_id`,`onboarding_path`,
   `onboarding_completed`,`status`,`created_at`)
VALUES
  ('northstar-ai-faculty','faculty-ai@northstarlabs.co.za','NorthstarLabs AI Workflow Faculty','creator','northstarlabs','creator',1,'active',1784572800000),
  ('northstar-bitcoin-faculty','faculty-bitcoin@northstarlabs.co.za','NorthstarLabs Bitcoin Research Faculty','creator','northstarlabs','creator',1,'active',1784572800000),
  ('northstar-web3-faculty','faculty-web3@northstarlabs.co.za','NorthstarLabs Web3 Product Faculty','creator','northstarlabs','creator',1,'active',1784572800000);
--> statement-breakpoint
INSERT OR IGNORE INTO `school_members`
  (`id`,`school_id`,`user_id`,`role`,`status`,`joined_at`)
VALUES
  ('northstar-ai-faculty-membership','northstarlabs','northstar-ai-faculty','instructor','active',1784572800000),
  ('northstar-bitcoin-faculty-membership','northstarlabs','northstar-bitcoin-faculty','instructor','active',1784572800000),
  ('northstar-web3-faculty-membership','northstarlabs','northstar-web3-faculty','instructor','active',1784572800000);
--> statement-breakpoint
UPDATE `courses` SET `owner_id`='northstar-ai-faculty',`updated_at`=1784572800000
WHERE `id`='northstar-ai-command-studio';
--> statement-breakpoint
UPDATE `courses` SET `owner_id`='northstar-bitcoin-faculty',`updated_at`=1784572800000
WHERE `id`='stefan-bitcoin-genesis-next-era';
--> statement-breakpoint
UPDATE `courses` SET `owner_id`='northstar-web3-faculty',`updated_at`=1784572800000
WHERE `id`='stefan-web3-foundations';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets`
  (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,
   `kind`,`alt_text`,`created_at`,`updated_at`)
VALUES
  ('faculty-media-ai-intro','northstarlabs','northstar-ai-faculty',
   'static:/media/faculty/ai-workflow-introduction.mp4',
   'AI Command Studio introduction.mp4','video/mp4',690537,'video',
   'Spoken introduction to the AI Command Studio learning journey.',1784572800000,1784572800000),
  ('faculty-media-bitcoin-intro','northstarlabs','northstar-bitcoin-faculty',
   'static:/media/faculty/bitcoin-intelligence-introduction.mp4',
   'Bitcoin Intelligence introduction.mp4','video/mp4',689164,'video',
   'Spoken introduction to the evidence-led Bitcoin Intelligence programme.',1784572800000,1784572800000),
  ('faculty-media-web3-intro','northstarlabs','northstar-web3-faculty',
   'static:/media/faculty/web3-product-introduction.mp4',
   'Web3 Product Lab introduction.mp4','video/mp4',769889,'video',
   'Spoken introduction to the responsible Web3 Product Lab.',1784572800000,1784572800000);
--> statement-breakpoint
UPDATE `lessons`
SET `lesson_type`='video',`primary_asset_id`='faculty-media-ai-intro',
    `required_watch_percent`=85,
    `transcript`='Welcome to AI Command Studio. This course is not a collection of prompt tricks. It is a practical system for identifying responsible leverage, writing decision-grade briefs, checking evidence, designing human approval points, and measuring whether artificial intelligence actually improves the work. The NorthstarLabs AI Workflow Faculty will ask you to build one real operating system, test it against a baseline, document its limitations, and present proof of the result. By the end, you should be able to use AI with more confidence precisely because you know where confidence is not justified.',
    `updated_at`=1784572800000
WHERE `id`='aic-lesson-01';
--> statement-breakpoint
UPDATE `lessons`
SET `lesson_type`='video',`primary_asset_id`='faculty-media-bitcoin-intro',
    `required_watch_percent`=85,
    `transcript`='Welcome to Bitcoin Intelligence. This programme begins before Bitcoin, with the failed attempts and design problems that shaped it. It then follows transactions, proof of work, nodes, custody, market structure, privacy, governance, scaling, regulation, and the strongest bear case. The NorthstarLabs Bitcoin Research Faculty will not ask you to believe a price prediction or repeat a slogan. You will work from evidence, separate facts from contested claims, build conditional scenarios, and finish with a board-ready briefing that states both its recommendation and its limits.',
    `updated_at`=1784572800000
WHERE `id`='btc-lesson-01';
--> statement-breakpoint
UPDATE `lessons`
SET `lesson_type`='video',`primary_asset_id`='faculty-media-web3-intro',
    `required_watch_percent`=85,
    `transcript`='Welcome to Web3 Product Lab. The central question is not whether blockchain is exciting. It is whether shared verification solves a real problem better than a simpler system. The NorthstarLabs Web3 Product Faculty will guide you through wallets, contracts, tokens, oracles, identity, scaling, bridges, governance, recovery, and human security. You will expose hidden control points, test the strongest rejection case, and design the minimum responsible architecture. Your final product defence must explain what the system proves, what it cannot prove, who still has power, and how a user recovers when something goes wrong.',
    `updated_at`=1784572800000
WHERE `id`='web3-lesson-01';
--> statement-breakpoint
INSERT OR REPLACE INTO `tutors`
  (`id`,`school_id`,`user_id`,`created_by`,`slug`,`display_name`,`headline`,`bio`,
   `service_type`,`subjects_json`,`languages_json`,`qualifications`,`experience_years`,
   `price_cents`,`price_unit`,`listing_tier`,`listing_monthly_cents`,`session_mode`,
   `location`,`timezone`,`availability`,`contact_email`,`show_direct_contact`,
   `verified`,`status`,`created_at`,`updated_at`)
VALUES
  ('northstar-ai-faculty-profile','northstarlabs','northstar-ai-faculty','northstarlabs-studio',
   'ai-workflow-faculty','AI Workflow Faculty','Build responsible AI work systems',
   'A NorthstarLabs teaching team focused on practical task analysis, evidence checks, human approval, workflow design, and measurable operating improvement.',
   'faculty','["Artificial intelligence","Workflow design","AI governance"]','["English"]',
   'NorthstarLabs faculty team; no individual professional credential is claimed.',0,0,'programme','listed',0,
   'online','Online','Africa/Johannesburg','Available through course discussions and scheduled faculty sessions.',
   'support@northstarlabs.co.za',0,0,'published',1784572800000,1784572800000),
  ('northstar-bitcoin-faculty-profile','northstarlabs','northstar-bitcoin-faculty','northstarlabs-studio',
   'bitcoin-research-faculty','Bitcoin Research Faculty','Investigate Bitcoin from primary evidence',
   'A NorthstarLabs teaching team that separates technical facts, contested economic claims, custody risks, regulation, and conditional future scenarios.',
   'faculty','["Bitcoin","Digital assets","Risk analysis"]','["English"]',
   'NorthstarLabs faculty team; no individual financial-adviser credential is claimed.',0,0,'programme','listed',0,
   'online','Online','Africa/Johannesburg','Available through course discussions and scheduled faculty sessions.',
   'support@northstarlabs.co.za',0,0,'published',1784572800000,1784572800000),
  ('northstar-web3-faculty-profile','northstarlabs','northstar-web3-faculty','northstarlabs-studio',
   'web3-product-faculty','Web3 Product Faculty','Make decentralised technology earn its complexity',
   'A NorthstarLabs teaching team focused on trust mapping, wallets, contracts, identity, bridges, recovery, governance, and responsible product decisions.',
   'faculty','["Web3","Product design","Technology risk"]','["English"]',
   'NorthstarLabs faculty team; no individual professional credential is claimed.',0,0,'programme','listed',0,
   'online','Online','Africa/Johannesburg','Available through course discussions and scheduled faculty sessions.',
   'support@northstarlabs.co.za',0,0,'published',1784572800000,1784572800000);
--> statement-breakpoint
UPDATE `schools`
SET `description`=CASE WHEN LENGTH(TRIM(`description`))<40
    THEN 'Serious, practical programmes for people who want to understand difficult subjects, make better decisions, and produce evidence of what they can do.'
    ELSE `description` END,
    `hero_title`=CASE WHEN TRIM(`hero_title`)=''
    THEN 'Learn deeply. Decide clearly. Build proof.' ELSE `hero_title` END,
    `hero_description`=CASE WHEN LENGTH(TRIM(`hero_description`))<40
    THEN 'Choose an evidence-led programme, learn with a specialist faculty team, test your understanding, and finish with work you can show.'
    ELSE `hero_description` END,
    `support_email`=CASE WHEN TRIM(`support_email`)='' THEN 'support@northstarlabs.co.za' ELSE `support_email` END,
    `seo_title`=CASE WHEN TRIM(`seo_title`)='' THEN 'NorthstarLabs | Evidence-led online learning' ELSE `seo_title` END,
    `seo_description`=CASE WHEN TRIM(`seo_description`)=''
    THEN 'Practical online programmes in applied AI, Bitcoin and responsible Web3, with assessments, progress tracking and verifiable completion certificates.'
    ELSE `seo_description` END,
    `updated_at`=1784572800000
WHERE `id`='northstarlabs';
