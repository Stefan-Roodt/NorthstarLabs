INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-1-money-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-1-three-jobs-of-money.mp4','module-1-1-three-jobs-of-money.mp4','video/mp4',1771294,'video','Narrated visual lesson for Module 1.1 of Crypto Mastery.',1785391200000,1785391200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-1-money-video',`required_watch_percent`=75,`transcript`='Money is easier to understand when we stop treating it as a particular object and start treating it as a system that performs jobs.

The first job is medium of exchange. Imagine that you grow wheat and need shoes. Under barter, the shoemaker must want wheat at the same time you want shoes. Money separates the two transactions. You sell the wheat for something widely accepted, then use that money to buy the shoes. The problem being solved is coordination.

The second job is unit of account. A shared unit lets a cafe price coffee at thirty-eight rand and lets a household compare rent, transport and food in one budget. The price does not tell us whether an item is good or fairly valued. It gives different items a common measuring language.

The third job is store of value. Money earned today can be kept for later. But storage is not perfect. Inflation can reduce purchasing power, institutions can fail and access can be interrupted. Store of value therefore describes a function, not a promise that value can never fall.

The same thing can perform more than one job. A bank deposit can settle a purchase, quote a price and carry purchasing power forward. The important question is what job it is performing in the situation and how reliably the surrounding system performs it.

Every monetary system also has a trust boundary. Users rely on acceptance, rules, settlement, record keeping and institutions or networks that continue to operate. In the activity below, classify the immediate job before judging the object. That discipline will help you later when digital assets are described as money, property, technology or investment all at once.',`updated_at`=1785391200000 WHERE `id`='cmf-module-1-1-lesson-01' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-1-ledgers-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-1-digital-balances.mp4','module-1-1-digital-balances.mp4','video/mp4',1902809,'video','Narrated visual lesson for Module 1.1 of Crypto Mastery.',1785391200000,1785391200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-1-ledgers-video',`required_watch_percent`=75,`transcript`='A balance can be digital without being a cryptocurrency. The format is only the beginning of the analysis.

When your banking app shows a balance, it is displaying a record maintained by a commercial bank. The balance is generally a claim on that bank. The bank applies account rules, verifies instructions and participates in regulated clearing and settlement arrangements. In South Africa, the national payment system connects payment instruments, financial institutions and final interbank settlement through systems overseen by the South African Reserve Bank.

Central-bank money is different. Notes and coin are central-bank liabilities available to the public, while central-bank reserves are electronic settlement balances used by eligible institutions. A commercial-bank deposit and a central-bank reserve may both be digital records, but they are not the same claim and they are not available to the same users.

A cryptoasset record can use a distributed network and protocol rules rather than one account provider as the authoritative ledger. Cryptography can support authorisation and ledger integrity. Consensus rules can help nodes agree on valid state changes. But software does not remove trust. Users still rely on code, keys, governance, infrastructure, economic incentives and the behaviour of other participants.

The practical comparison has four parts. Ask who records the balance, what legal or economic claim the holder has, who controls access, and how errors or disputes are resolved. A bank transfer may be reversible through an institutional process in some circumstances. A confirmed public-chain transfer may not have a central operator able to reverse it.

Digital is a delivery format. Centralised and decentralised describe parts of an operating model. Use the ledger comparison below to locate authority and failure modes instead of assuming that every electronic balance is technically or legally equivalent.',`updated_at`=1785391200000 WHERE `id`='cmf-module-1-1-lesson-02' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-1-scarcity-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-1-digital-scarcity.mp4','module-1-1-digital-scarcity.mp4','video/mp4',1848799,'video','Narrated visual lesson for Module 1.1 of Crypto Mastery.',1785391200000,1785391200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-1-scarcity-video',`required_watch_percent`=75,`transcript`='Digital information is easy to copy. That is useful for documents, photographs and software, but it creates a problem for digital value. If one valid unit could be spent repeatedly, the record would not support reliable ownership or settlement.

Blockchain systems address this problem by maintaining a shared transaction history and applying validation rules. Nodes check whether a proposed state change follows the rules and whether the same digital asset has already been spent. NIST describes blockchains as distributed, tamper-evident and tamper-resistant ledgers. Those properties can make conflicting histories detectable and accepted records progressively harder to alter.

Some networks also make issuance rules transparent. Bitcoin is the best-known example of a protocol with a defined issuance schedule and maximum supply. A learner can inspect the rule and observe how the network enforces it. That is a form of verifiable scarcity.

Scarcity, however, is not a complete value argument. A unique password you invent can be scarce and still have no market value. A digital asset also needs credible ownership, security, demand, usefulness or social acceptance. Its rules must remain durable under economic and technical pressure. Access and custody must be practical enough for people to use it.

This distinction protects you from a common shortcut: limited supply means guaranteed price appreciation. Supply may be one input, while demand, liquidity, regulation, competition, concentration and security can change the outcome.

Use the confidence lab below as an evidence test, not a forecast. Rate the credibility of the supply rule, ownership verification, sustained demand and operational security. A high score means the claim has stronger supporting evidence. It never means the future is certain.',`updated_at`=1785391200000 WHERE `id`='cmf-module-1-1-lesson-03' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-1-field-lab',c.`school_id`,c.`owner_id`,'static:/media/course-resources/module-1-1-money-and-digital-assets-field-lab.pdf','Module 1.1 Money and Digital Assets Field Lab.pdf','application/pdf',8450,'document','Practical Module 1.1 field lab for money functions, ledger authority and scarcity claims.',1785391200000,1785391200000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `lesson_resources` (`id`,`lesson_id`,`asset_id`,`title`,`position`) VALUES ('cmf-module-1-1-field-lab-link','cmf-module-1-1-lesson-03','cmf-module-1-1-field-lab','Money and Digital Assets Field Lab',1);
