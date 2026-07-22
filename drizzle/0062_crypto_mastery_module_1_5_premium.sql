INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-5-chain-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-5-blockchain-chain.mp4','module-1-5-blockchain-chain.mp4','video/mp4',232964,'video','Neural-narrated visual lesson for Module 1.5 of Crypto Mastery.',1785662400000,1785662400000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-5-chain-video',`required_watch_percent`=75,`transcript`='Bitcoin-style blockchains are not a mystery when you treat them as a practical system pipeline.

The first layer is transaction intent. A learner should be able to describe what changed in a transaction, who authorised it, and what spending condition was needed. Without a valid authorisation, nothing moves.

The second layer is batching. Transactions are grouped into a block, then anchored with metadata so they become an auditable history, not a pile of unconnected messages.

The third layer is integrity. A block hash is a compact fingerprint. Change the block payload and the hash changes unpredictably. This gives immediate evidence of tampering.

The final layer is linking. Each new block stores the previous block reference, making reordering and selective edits more expensive and visible. Learners should think in terms of sequence constraints, not slogans. Chain design succeeds when dependencies, rules and assumptions are explicit.

If you want stronger outcomes, test it this way: identify the transaction, the block that carries it, the previous reference, and the exact validity rule the network enforced. That is how protocol-level confidence becomes decision confidence.',`updated_at`=1785662400000 WHERE `id`='cmf-module-1-5-lesson-01' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-5-consensus-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-5-consensus-contract.mp4','module-1-5-consensus-contract.mp4','video/mp4',291861,'video','Neural-narrated visual lesson for Module 1.5 of Crypto Mastery.',1785662400000,1785662400000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-5-consensus-video',`required_watch_percent`=75,`transcript`='The phrase “consensus” is often misunderstood. In a technical system it means agreement over valid state transitions under explicit rules, not guaranteed external truth.

A transaction must pass local validity checks first: signatures, balance constraints, protocol format and policy. Then consensus logic decides whose ordered candidate becomes accepted state. This is where nodes remain consistent despite geography and timing differences.

Consensus is not a moral vote about correctness in the world outside the protocol. It is a coordination method inside bounded assumptions. If every node enforces different quality of data for external reality, they can agree on a result that still depends on faulty inputs.

This is why oracle and feed design are risk boundaries of equal importance to consensus design. In trading and operations, that distinction avoids expensive misunderstandings.

For practical reasoning, teach learners to state both parts clearly: “the network agreed on this state under rules X,” and “external truth must still be validated separately.”',`updated_at`=1785662400000 WHERE `id`='cmf-module-1-5-lesson-02' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-5-resistance-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-5-tamper-resistance.mp4','module-1-5-tamper-resistance.mp4','video/mp4',291146,'video','Neural-narrated visual lesson for Module 1.5 of Crypto Mastery.',1785662400000,1785662400000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-5-resistance-video',`required_watch_percent`=75,`transcript`='Immutability is a useful headline, but in engineering we should say tamper resistance and make the assumptions explicit.

When a block is accepted and additional valid history follows it, rewriting history generally becomes materially harder. But hardness is not the same as impossibility. It depends on cost, concentration, rule quality and governance discipline.

There are multiple security layers: node diversity, cryptographic validation, economic cost, and social process for upgrades. If one layer weakens, confidence should decline even if another remains strong.

Use the right question for learners: “What would make this history change succeed, at what cost, and by whom?” If the answer depends on a single team, one client or one oracle, the claim should be treated as conditional.

Great protocol decisions are never absolute. They are bounded statements backed by assumptions and tested continuously under stress. That mindset is safer for learners and more honest for instructors.',`updated_at`=1785662400000 WHERE `id`='cmf-module-1-5-lesson-03' AND `course_id`='cognizen-crypto-mastery-foundations-production';
