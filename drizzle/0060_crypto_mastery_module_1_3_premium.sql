INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-3-double-spend-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-3-digital-cash-problem.mp4','module-1-3-digital-cash-problem.mp4','video/mp4',1749748,'video','Neural-narrated visual lesson for Module 1.3 of Crypto Mastery.',1785481200000,1785481200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-3-double-spend-video',`required_watch_percent`=75,`transcript`='Before Bitcoin, digital payment systems could already move value quickly. The difficult question was narrower: how could a native digital unit be transferred without a central operator preventing it from being spent twice?

Digital information is easy to copy. If Alice sends the same signed input to Bob and Carol, signatures can prove that Alice authorised both messages. A signature alone cannot tell the network which conflicting spend should count. The system also needs common validity rules and an accepted ordering of events.

Traditional payment systems solve this with an authoritative ledger. A bank or payment operator checks the account, records one transaction, rejects the conflict and handles disputes. That model can be efficient, but the operator becomes the trusted coordinator.

Bitcoin proposed a different coordination structure. Transactions are broadcast to a peer-to-peer network. Nodes independently test them against shared rules. Miners group valid transactions into blocks and perform proof of work. Hash links connect each accepted block to the history before it. The network follows the valid chain with the most accumulated work, making large-scale history replacement costly.

This is not magic and it does not remove every intermediary. Wallets, exchanges, internet access and custody services can still introduce trust and risk. The protocol addresses agreement over ledger history. Use the conflict lab below to separate that achievement from claims it never made.',`updated_at`=1785481200000 WHERE `id`='cmf-module-1-3-lesson-01' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-3-ancestry-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-3-technical-ancestry.mp4','module-1-3-technical-ancestry.mp4','video/mp4',1797104,'video','Neural-narrated visual lesson for Module 1.3 of Crypto Mastery.',1785481200000,1785481200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-3-ancestry-video',`required_watch_percent`=75,`transcript`='Bitcoin did not appear without ancestors. Its design combined decades of research into cryptography, distributed systems and digital money.

Public-key signatures provided a way to authorise transfers without revealing the private signing key. Cryptographic hashes made a compact fingerprint of data, so a changed record produced a changed result. Merkle trees let many transactions be summarised and checked efficiently.

Timestamping research showed how records could be chained so that later evidence strengthened earlier evidence. Hashcash used computational puzzles to make abusive activity costly. Proposals such as b-money and bit gold explored scarce digital objects, distributed records and incentive structures. Peer-to-peer networks demonstrated how participants could communicate without one central server.

Bitcoin''s breakthrough was the system-level combination. Proof of work did more than rate-limit messages: it helped order blocks and made alternative histories expensive. The block reward and transaction fees gave participants an economic reason to contribute resources. Full nodes applied the rules independently, so producing work did not give a miner permission to create invalid money.

Do not reduce this ancestry to a single inventor or ingredient. The learning value lies in seeing how authorisation, integrity, ordering, incentives and verification reinforce one another. In the systems map below, match each component to its direct job, then explain why no component is sufficient on its own.',`updated_at`=1785481200000 WHERE `id`='cmf-module-1-3-lesson-02' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-3-claims-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-3-white-paper-claims.mp4','module-1-3-white-paper-claims.mp4','video/mp4',1719090,'video','Neural-narrated visual lesson for Module 1.3 of Crypto Mastery.',1785481200000,1785481200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-3-claims-video',`required_watch_percent`=75,`transcript`='The Bitcoin white paper is a design document, not an investment prospectus. Read its claims at the level they are made.

The stated goal is peer-to-peer electronic cash: online payments sent directly without relying on a financial institution to order every transaction. The paper outlines a chain of digital signatures, public transaction broadcast, timestamped blocks, proof of work, node acceptance rules and incentives.

Its security reasoning is conditional. It assumes honest participants control more computing power than a coordinated attacker, and it discusses probabilities rather than absolute impossibility. Later implementations, governance practices and market infrastructure also extend beyond the paper''s nine-page design.

The document does not guarantee price appreciation. It does not prove that every exchange, wallet or token is safe. It does not recover a lost private key, eliminate software defects or settle every legal question. Limited supply is a protocol property; future value still depends on demand, use, regulation, competition and human behaviour.

A disciplined reader separates four layers: what the primary source states, what mechanism supports the claim, what assumption limits it, and what later evidence is required. Use the claim audit below before repeating any story about Bitcoin. The objective is not belief or disbelief. It is a conclusion whose boundaries another person can inspect.',`updated_at`=1785481200000 WHERE `id`='cmf-module-1-3-lesson-03' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-3-evidence-lab',c.`school_id`,c.`owner_id`,'static:/media/course-resources/module-1-3-origins-of-bitcoin-evidence-lab.pdf','Module 1.3 Origins of Bitcoin Evidence Lab.pdf','application/pdf',10475,'document','Primary-source and system-design workbook for the origins of Bitcoin.',1785481200000,1785481200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `lesson_resources` (`id`,`lesson_id`,`asset_id`,`title`,`position`) VALUES ('cmf-module-1-3-evidence-lab-link','cmf-module-1-3-lesson-03','cmf-module-1-3-evidence-lab','Origins of Bitcoin Evidence Lab',1);
