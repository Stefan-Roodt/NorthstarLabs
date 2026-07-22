INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-8-ledger-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-8-ledger-ownership.mp4','module-1-8-ledger-ownership.mp4','video/mp4',199278,'video','Neural-narrated visual lesson for Module 1.8 of Crypto Mastery.',1785664200000,1785664200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-8-ledger-video',`required_watch_percent`=75,`transcript`='Bitcoin ownership is control of spend conditions, not a stored balance in a wallet app.

The wallet helps create and sign a transaction, but the spendable state is maintained by the network as valid unspent outputs. A learner who understands this can separate technical custody assumptions from protocol facts.

Each payment consumes existing outputs and creates new outputs that must satisfy exact rules. If an output is spent, it cannot be spent again. If a signature is wrong, the transaction fails before it reaches consensus.

This lesson teaches learners to trace money as state transitions: what inputs are consumed, what new outputs are created, and which keys were required to authorise the spend.',`updated_at`=1785664200000 WHERE `id`='cmf-module-1-8-lesson-01' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-8-mining-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-8-proof-of-work.mp4','module-1-8-proof-of-work.mp4','video/mp4',212766,'video','Neural-narrated visual lesson for Module 1.8 of Crypto Mastery.',1785664200000,1785664200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-8-mining-video',`required_watch_percent`=75,`transcript`='Proof of work is the costed process that selects candidate blocks, but it is not a substitute for validation rules.

Miners propose blocks. Independent nodes still apply the same validity checks before accepting them. More hashes make rewriting history expensive, yet confidence grows only with additional valid blocks and a sound operational environment.

Difficulty adjusts as a protocol parameter to keep block production near target pace. Confirmations are a practical risk-reduction measure, not proof of absolute finality.

When learners confuse search effort with rule authority, they overestimate security. Good course design separates these layers: computational effort, consensus validity, and independent enforcement.',`updated_at`=1785664200000 WHERE `id`='cmf-module-1-8-lesson-02' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-8-scarcity-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-8-scarcity-claims.mp4','module-1-8-scarcity-claims.mp4','video/mp4',210301,'video','Neural-narrated visual lesson for Module 1.8 of Crypto Mastery.',1785664200000,1785664200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-8-scarcity-video',`required_watch_percent`=75,`transcript`='Scarcity is a protocol property; price trajectory is not. The lesson asks learners to separate verifiable chain facts from external assumptions.

A protocol can set issuance schedules and security assumptions clearly. That gives high-quality evidence about what is controlled and what is not. But future adoption, regulation and market demand remain external systems with their own uncertainties.

This module introduces a practical rubric: protocol evidence, external evidence and market hypothesis. It keeps analysis grounded and avoids giving financial promises from technical rules alone.

When this rubric becomes habit, learners make better decisions: they can identify what is confirmed on-chain, what needs off-chain verification, and what is simply an expectation about the future.',`updated_at`=1785664200000 WHERE `id`='cmf-module-1-8-lesson-03' AND `course_id`='cognizen-crypto-mastery-foundations-production';
