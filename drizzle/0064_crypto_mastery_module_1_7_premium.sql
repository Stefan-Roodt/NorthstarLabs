INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-7-definition-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-7-asset-taxonomy.mp4','module-1-7-asset-taxonomy.mp4','video/mp4',246827,'video','Neural-narrated visual lesson for Module 1.7 of Crypto Mastery.',1785663600000,1785663600000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-7-definition-video',`required_watch_percent`=75,`transcript`='A network-native unit is one thing, a smart-contract token can be another, and a tokenised claim can be something else again.

When you map digital assets, begin with one question: what is the ledger object, and what is the claim attached to it? A native unit is part of protocol accounting. A contract token follows the rules of its issuing code. A represented claim may point beyond the chain to custodians, reserve assets, debt contracts or redemption promises.

If a learner confuses these categories, they will overvalue slogans and underestimate legal, operational and liquidity risk. The right decision starts by identifying ownership, control and enforceability separately.

Strong analysis asks: who can issue, who can redeem, who bears failure risk, and what evidence the promise actually has. That is the difference between a ledger entry and a reliable claim.',`updated_at`=1785663600000 WHERE `id`='cmf-module-1-7-lesson-01' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-7-rights-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-7-token-rights.mp4','module-1-7-token-rights.mp4','video/mp4',225432,'video','Neural-narrated visual lesson for Module 1.7 of Crypto Mastery.',1785663600000,1785663600000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-7-rights-video',`required_watch_percent`=75,`transcript`='The strongest lesson in token markets is to inspect rights, not labels. A token may be transferable, liquid and easy to trade, while providing little beyond access to a contract transfer method.

Ask three layers: code rights, governance rights and legal rights. Code rights answer what the smart contract can do automatically. Governance rights answer who can alter those rules. Legal rights answer who must deliver what to whom when the promise is not fully on-chain.

Marketing words like "equity", "income", or "guaranteed value" are clues, not proofs. Learners need an evidence ladder: permissions, jurisdiction, remedy, and enforcement pathway. If any layer is opaque, confidence is conditional.

This lesson helps learners stop conflating a transfer mechanism with a legal right and decide what risk is actually being purchased.',`updated_at`=1785663600000 WHERE `id`='cmf-module-1-7-lesson-02' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-7-dependency-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-7-stable-nft-rwa.mp4','module-1-7-stable-nft-rwa.mp4','video/mp4',213609,'video','Neural-narrated visual lesson for Module 1.7 of Crypto Mastery.',1785663600000,1785663600000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-7-dependency-video',`required_watch_percent`=75,`transcript`='Represented assets work only as strong as their dependency chain. For stablecoins, that chain includes reserves, access procedures and operational operations. For NFTs, it includes metadata location, content licensing and marketplace integrity. For tokenised assets, it includes custody and legal treatment of the underlying asset.

Wrapped assets add one extra layer: the original value chain must remain intact while tokens remain tradable in a new layer. Bridges and custodians are part of the claim, even when on-chain logic looks neat.

The practical method is to trace the chain end-to-end and stress-test one link at a time: what fails first, who controls the failure response, and what the learner should assume when the chain is stressed.

When the chain is visible and tested, users can compare alternatives without guessing. Good design choices reduce one dependency risk at a time.',`updated_at`=1785663600000 WHERE `id`='cmf-module-1-7-lesson-03' AND `course_id`='cognizen-crypto-mastery-foundations-production';
