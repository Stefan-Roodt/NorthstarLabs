INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-9-network-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-9-ethereum-vs-ether.mp4','module-1-9-ethereum-vs-ether.mp4','video/mp4',207373,'video','Neural-narrated visual lesson for Module 1.9 of Crypto Mastery.',1785664800000,1785664800000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-9-network-video',`required_watch_percent`=75,`transcript`='Ethereum is a programmable world computer, not just another payment rail. That one distinction changes everything: the base chain tracks assets and rules, while its environment lets people run applications as programmable contracts.

Bitcoin taught people that money can move without a central bank. Ethereum extends the same decentralisation logic to digital computation. People build protocols where the chain verifies data and state transitions according to deterministic code.

For learners, this means you separate the network from the asset. Ethereum describes the platform and its security model. Ether is the native fuel and base settlement asset.

Keeping this distinction sharp helps avoid wrong assumptions about custody, scalability and pricing.',`updated_at`=1785664800000 WHERE `id`='cmf-module-1-9-lesson-01' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-9-contract-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-9-smart-contracts-evm.mp4','module-1-9-smart-contracts-evm.mp4','video/mp4',222564,'video','Neural-narrated visual lesson for Module 1.9 of Crypto Mastery.',1785664800000,1785664800000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-9-contract-video',`required_watch_percent`=75,`transcript`='A smart contract is executable logic recorded on-chain, triggered when a valid transaction calls it. The Ethereum Virtual Machine is the execution environment that all nodes simulate, so everyone reaches the same outcome for valid input.

Ethereum uses account-based state, so you can think in terms of balances and storage updates rather than UTXO chains alone. Users control externally owned accounts through signatures. Contract accounts execute instructions when called and do not act on intent by themselves.

This model is powerful for building tokens, lending, exchanges and governance systems. The risk is that one insecure function, key mistake, or bad dependency can move real money. Good design documents assumptions, failure modes, and who can reverse or pause actions.',`updated_at`=1785664800000 WHERE `id`='cmf-module-1-9-lesson-02' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR REPLACE INTO `media_assets` (`id`,`school_id`,`owner_id`,`key`,`filename`,`content_type`,`size_bytes`,`kind`,`alt_text`,`created_at`,`updated_at`) SELECT 'cmf-module-1-9-gas-video',c.`school_id`,c.`owner_id`,'static:/media/faculty/module-1-9-gas-staking-layer2.mp4','module-1-9-gas-staking-layer2.mp4','video/mp4',230054,'video','Neural-narrated visual lesson for Module 1.9 of Crypto Mastery.',1785664800000,1785664800000 FROM `courses` c WHERE c.`id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
UPDATE `lessons` SET `lesson_type`='video',`primary_asset_id`='cmf-module-1-9-gas-video',`required_watch_percent`=75,`transcript`='Every Ethereum transaction consumes gas. Gas is not a tax; it is a unit of work. Simple transfers consume little computation. Complex DeFi paths, or long contract logic, consume more. Users set both a gas limit and price to reflect priority and risk.

Ethereum moved from Proof of Work to Proof of Stake, which changes how security is achieved and reduces resource intensity. Fees still remain because the network can be overloaded. Layer 2s can handle more action cheaply, but they introduce bridge and operational complexity.

Learners who understand this model can assess trade-offs: base-layer security versus speed, transparency versus cost, and flexibility versus custody risk. That is how you keep experimentation safe and grounded in evidence.',`updated_at`=1785664800000 WHERE `id`='cmf-module-1-9-lesson-03' AND `course_id`='cognizen-crypto-mastery-foundations-production';
