ALTER TABLE `courses` ADD `truth_outcome` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `truth_audience` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `truth_not_for` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `truth_prerequisites` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `truth_evidence` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `truth_source_standard` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `truth_level` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `truth_delivery` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `truth_reviewed_at` integer;--> statement-breakpoint
UPDATE `courses` SET
  `truth_outcome`='Build a working, governed AI operating system for one real workflow, with a measured baseline, human approval points and evidence of improvement.',
  `truth_audience`='Professionals who want repeatable AI-assisted work\nTeam leaders responsible for quality and risk\nIndependent builders ready to test a real workflow',
  `truth_not_for`='Anyone looking only for prompt tricks\nAnyone who wants AI to replace judgement or accountability',
  `truth_prerequisites`='No coding is required. Bring one recurring work task, sample non-sensitive material and access to a generative AI tool.',
  `truth_evidence`='A portfolio-ready AI operating-system case study: task map, governed instruction brief, test evidence, limitations, approval gates and a before-and-after demonstration.',
  `truth_source_standard`='Practice-led instruction grounded in explicit evidence checks, privacy-by-design, human review and documented limitations. Every workflow is tested against a learner-defined baseline.',
  `truth_level`='Beginner to intermediate',
  `truth_delivery`='Self-paced · practical labs, media and assessments',
  `truth_reviewed_at`=1784592000000
WHERE `id`='northstar-ai-command-studio';--> statement-breakpoint
UPDATE `courses` SET
  `truth_outcome`='Explain Bitcoin without hype, interrogate the strongest claims on both sides and deliver a decision-grade briefing with explicit scenarios, trade-offs and risks.',
  `truth_audience`='Decision-makers evaluating Bitcoin exposure or policy\nAnalysts and professionals who need an evidence-led foundation\nCurious learners willing to examine both the technology and its criticism',
  `truth_not_for`='Anyone seeking personalised investment advice\nAnyone expecting price predictions, trading signals or guaranteed returns',
  `truth_prerequisites`='No prior blockchain knowledge is required. Basic comfort with percentages, incentives and reading evidence will help. No purchase or wallet connection is required.',
  `truth_evidence`='A source-backed Bitcoin intelligence briefing covering origin, protocol, monetary policy, custody, governance, regulation, risks and plausible future scenarios.',
  `truth_source_standard`='Evidence-led and explicitly non-promotional. The course separates protocol facts, contested interpretations and forward-looking scenarios; learners are required to show sources and uncertainty.',
  `truth_level`='Beginner to decision-grade',
  `truth_delivery`='Self-paced · 7 modules, short lessons, labs and assessments',
  `truth_reviewed_at`=1784592000000
WHERE `id`='stefan-bitcoin-genesis-next-era';--> statement-breakpoint
UPDATE `courses` SET
  `truth_outcome`='Decide when decentralised technology earns its complexity and produce a responsible Web3 product brief with architecture, trust assumptions and a threat model.',
  `truth_audience`='Product leaders evaluating a Web3 proposal\nEntrepreneurs and analysts testing a decentralised use case\nBuilders who want safer product and governance decisions',
  `truth_not_for`='Anyone looking for token-picking advice\nAnyone expecting to trade, buy assets or connect a funded wallet',
  `truth_prerequisites`='No blockchain experience is required. You need only a modern browser and a product, service or coordination problem you want to examine.',
  `truth_evidence`='A defensible product canvas, trust map, architecture choice and threat model that can also conclude—correctly—that a blockchain is the wrong tool.',
  `truth_source_standard`='Sceptical, scenario-based instruction that distinguishes cryptographic verification from truth, documents control points and makes privacy, recovery, governance and operational risk explicit.',
  `truth_level`='Beginner to product practitioner',
  `truth_delivery`='Self-paced · 6 modules, labs, checkpoints and capstone',
  `truth_reviewed_at`=1784592000000
WHERE `id`='stefan-web3-foundations';--> statement-breakpoint
UPDATE `courses` SET
  `truth_outcome`=CASE WHEN trim(`description`)<>'' THEN `description` ELSE 'Complete a structured learning path and produce evidence of understanding.' END,
  `truth_audience`='Learners who want a structured, practical introduction\nProfessionals applying the topic in real work',
  `truth_not_for`='Anyone expecting guaranteed outcomes without completing the learning and practice',
  `truth_prerequisites`='No specialist prerequisite is stated. Review the curriculum and preview lesson before joining.',
  `truth_evidence`='Saved lesson progress, completed course work and assessment results where assessments are included.',
  `truth_source_standard`='Academy-authored material. Review the named faculty, curriculum, preview and assessment standard before joining.',
  `truth_level`='All levels',
  `truth_delivery`='Self-paced · structured lessons and guided practice',
  `truth_reviewed_at`=COALESCE(`truth_reviewed_at`,`updated_at`)
WHERE `status`='published' AND trim(`truth_outcome`)='';--> statement-breakpoint
UPDATE `lessons`
SET `is_preview`=1
WHERE `id` IN (
  SELECT first_lesson.`id`
  FROM `lessons` first_lesson
  JOIN `courses` course ON course.`id`=first_lesson.`course_id`
  WHERE course.`status`='published'
    AND NOT EXISTS (
      SELECT 1 FROM `lessons` preview_lesson
      WHERE preview_lesson.`course_id`=course.`id` AND preview_lesson.`is_preview`=1
    )
    AND first_lesson.`id`=(
      SELECT candidate.`id` FROM `lessons` candidate
      LEFT JOIN `course_sections` section ON section.`id`=candidate.`section_id`
      WHERE candidate.`course_id`=course.`id`
      ORDER BY COALESCE(section.`position`,0),candidate.`position`,candidate.`id`
      LIMIT 1
    )
);
