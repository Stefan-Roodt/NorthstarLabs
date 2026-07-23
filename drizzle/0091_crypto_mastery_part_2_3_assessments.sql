-- Source-grounded applied assessments for every Part 2 and Part 3 module.
-- Existing written retrieval prompts are retained; native scoring, answer feedback,
-- mastery tracking, lesson gating and certificate progress now use the quiz engine.
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.1: How Cryptocurrency Markets Operate, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a cryptocurrency market?

- What is the difference between a primary and secondary market?

- What role does a market maker perform?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-01-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-01-lesson-06-quiz','cmf-module-2-01-lesson-06','Module 2.1: How Cryptocurrency Markets Operate: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-01-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-01-lesson-06-quiz-q01','cmf-module-2-01-lesson-06-quiz','Which explanation best matches “Liquidity” in this module?','["How easily an asset can be bought or sold without causing a substantial price change.","The number and size of orders available at different prices.","The process through which market participants determine an asset’s current value.","Individuals buying, selling or holding cryptocurrency using personal capital."]',0,'The module explains “Liquidity” as follows: How easily an asset can be bought or sold without causing a substantial price change.','Liquidity',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-01-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-01-lesson-06-quiz-q02','cmf-module-2-01-lesson-06-quiz','Which explanation best matches “Price Discovery” in this module?','["How easily an asset can be bought or sold without causing a substantial price change.","The number and size of orders available at different prices.","Individuals buying, selling or holding cryptocurrency using personal capital.","The process through which market participants determine an asset’s current value."]',3,'The module explains “Price Discovery” as follows: The process through which market participants determine an asset’s current value.','Price Discovery',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-01-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-01-lesson-06-quiz-q03','cmf-module-2-01-lesson-06-quiz','Which explanation best matches “Retail Participants” in this module?','["The number and size of orders available at different prices.","The process through which market participants determine an asset’s current value.","Individuals buying, selling or holding cryptocurrency using personal capital.","How easily an asset can be bought or sold without causing a substantial price change."]',2,'The module explains “Retail Participants” as follows: Individuals buying, selling or holding cryptocurrency using personal capital.','Retail Participants',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-01-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-01-lesson-06-quiz-q04','cmf-module-2-01-lesson-06-quiz','Which explanation best matches “A Low Spread Means the Asset Is Safe” in this module?','["The process through which market participants determine an asset’s current value.","A narrow spread reflects trading conditions, not project quality.","How easily an asset can be bought or sold without causing a substantial price change.","The number and size of orders available at different prices."]',1,'The module explains “A Low Spread Means the Asset Is Safe” as follows: A narrow spread reflects trading conditions, not project quality.','A Low Spread Means the Asset Is Safe',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-01-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-01-lesson-06-quiz-q05','cmf-module-2-01-lesson-06-quiz','Which explanation best matches “Market Depth” in this module?','["The number and size of orders available at different prices.","How easily an asset can be bought or sold without causing a substantial price change.","The process through which market participants determine an asset’s current value.","Individuals buying, selling or holding cryptocurrency using personal capital."]',0,'The module explains “Market Depth” as follows: The number and size of orders available at different prices.','Market Depth',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-01-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.2: Market Cycles and Investor Psychology, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a market cycle?

- What commonly occurs during the accumulation phase?

- How does investor psychology change during market expansion?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-02-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-02-lesson-06-quiz','cmf-module-2-02-lesson-06','Module 2.2: Market Cycles and Investor Psychology: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-02-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-02-lesson-06-quiz-q01','cmf-module-2-02-lesson-06-quiz','Which explanation best matches “Anchoring” in this module?','["A person relies too heavily on one reference point.","People follow the actions of a group.","A favourable market cycle can temporarily reward poor decisions.","Leverage can accelerate falling markets."]',0,'The module explains “Anchoring” as follows: A person relies too heavily on one reference point.','Anchoring',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-02-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-02-lesson-06-quiz-q02','cmf-module-2-02-lesson-06-quiz','Which explanation best matches “Herd Behaviour” in this module?','["A person relies too heavily on one reference point.","A favourable market cycle can temporarily reward poor decisions.","Leverage can accelerate falling markets.","People follow the actions of a group."]',3,'The module explains “Herd Behaviour” as follows: People follow the actions of a group.','Herd Behaviour',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-02-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-02-lesson-06-quiz-q03','cmf-module-2-02-lesson-06-quiz','Which explanation best matches “A Profitable Trade Proves Skill” in this module?','["People follow the actions of a group.","Leverage can accelerate falling markets.","A favourable market cycle can temporarily reward poor decisions.","A person relies too heavily on one reference point."]',2,'The module explains “A Profitable Trade Proves Skill” as follows: A favourable market cycle can temporarily reward poor decisions.','A Profitable Trade Proves Skill',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-02-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-02-lesson-06-quiz-q04','cmf-module-2-02-lesson-06-quiz','Which explanation best matches “Leverage and the Decline” in this module?','["A favourable market cycle can temporarily reward poor decisions.","Leverage can accelerate falling markets.","A person relies too heavily on one reference point.","People follow the actions of a group."]',1,'The module explains “Leverage and the Decline” as follows: Leverage can accelerate falling markets.','Leverage and the Decline',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-02-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-02-lesson-06-quiz-q05','cmf-module-2-02-lesson-06-quiz','Which explanation best matches “Psychology During Accumulation” in this module?','["Ironically, this pessimism may exist when risk has already reduced significantly from the previous peak.","A person relies too heavily on one reference point.","People follow the actions of a group.","A favourable market cycle can temporarily reward poor decisions."]',0,'The module explains “Psychology During Accumulation” as follows: Ironically, this pessimism may exist when risk has already reduced significantly from the previous peak.','Psychology During Accumulation',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-02-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.4: Bull Markets, Bear Markets and Consolidation, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a market trend?

- What market structure commonly defines an uptrend?

- What market structure commonly defines a downtrend?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-04-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-04-lesson-06-quiz','cmf-module-2-04-lesson-06','Module 2.4: Bull Markets, Bear Markets and Consolidation: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-04-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-04-lesson-06-quiz-q01','cmf-module-2-04-lesson-06-quiz','Which explanation best matches “Resistance” in this module?','["An area where selling supply has previously been strong enough to slow or reverse a rise.","Weak or poorly designed projects can decline during broad market strength.","Volatility may increase during panic, liquidations and exchange failures.","A bull market does not move upward continuously."]',0,'The module explains “Resistance” as follows: An area where selling supply has previously been strong enough to slow or reverse a rise.','Resistance',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-04-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-04-lesson-06-quiz-q02','cmf-module-2-04-lesson-06-quiz','Which explanation best matches “A Bull Market Means Every Asset Will Rise” in this module?','["An area where selling supply has previously been strong enough to slow or reverse a rise.","A downtrend commonly forms a sequence of: Lower highs, Lower lows.","Volatility may increase during panic, liquidations and exchange failures.","Weak or poorly designed projects can decline during broad market strength."]',3,'The module explains “A Bull Market Means Every Asset Will Rise” as follows: Weak or poorly designed projects can decline during broad market strength.','A Bull Market Means Every Asset Will Rise',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-04-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-04-lesson-06-quiz-q03','cmf-module-2-04-lesson-06-quiz','Which explanation best matches “Bear Market” in this module?','["A downtrend commonly forms a sequence of: Lower highs, Lower lows.","Weak or poorly designed projects can decline during broad market strength.","Volatility may increase during panic, liquidations and exchange failures.","An area where selling supply has previously been strong enough to slow or reverse a rise."]',2,'The module explains “Bear Market” as follows: Volatility may increase during panic, liquidations and exchange failures.','Bear Market',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-04-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-04-lesson-06-quiz-q04','cmf-module-2-04-lesson-06-quiz','Which explanation best matches “Bull Market Corrections” in this module?','["Volatility may increase during panic, liquidations and exchange failures.","A bull market does not move upward continuously.","An area where selling supply has previously been strong enough to slow or reverse a rise.","A downtrend commonly forms a sequence of: Lower highs, Lower lows."]',1,'The module explains “Bull Market Corrections” as follows: A bull market does not move upward continuously.','Bull Market Corrections',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-04-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-04-lesson-06-quiz-q05','cmf-module-2-04-lesson-06-quiz','Which explanation best matches “Downtrend” in this module?','["A downtrend commonly forms a sequence of: Lower highs, Lower lows.","An area where selling supply has previously been strong enough to slow or reverse a rise.","Weak or poorly designed projects can decline during broad market strength.","Volatility may increase during panic, liquidations and exchange failures."]',0,'The module explains “Downtrend” as follows: A downtrend commonly forms a sequence of: Lower highs, Lower lows.','Downtrend',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-04-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.5: Introduction to Fundamental Analysis, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is fundamental analysis?

- How does fundamental analysis differ from technical analysis?

- Why is a successful project not automatically a valuable token?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-05-lesson-05' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-05-lesson-05-quiz','cmf-module-2-05-lesson-05','Module 2.5: Introduction to Fundamental Analysis: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-05-lesson-05');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-05-lesson-05-quiz-q01','cmf-module-2-05-lesson-05-quiz','Which explanation best matches “A Famous Team Guarantees Success” in this module?','["Experienced people can still fail, mismanage funds or face stronger competition.","The token may capture little value, or the market price may already be excessive.","Some protocols reward users with tokens for participating.","Fundamental analysis focuses on the asset, network and ecosystem."]',0,'The module explains “A Famous Team Guarantees Success” as follows: Experienced people can still fail, mismanage funds or face stronger competition.','A Famous Team Guarantees Success',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-05-lesson-05-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-05-lesson-05-quiz-q02','cmf-module-2-05-lesson-05-quiz','Which explanation best matches “Active Users Versus Incentivised Users” in this module?','["Experienced people can still fail, mismanage funds or face stronger competition.","The token may capture little value, or the market price may already be excessive.","Fundamental analysis focuses on the asset, network and ecosystem.","Some protocols reward users with tokens for participating."]',3,'The module explains “Active Users Versus Incentivised Users” as follows: Some protocols reward users with tokens for participating.','Active Users Versus Incentivised Users',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-05-lesson-05-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-05-lesson-05-quiz-q03','cmf-module-2-05-lesson-05-quiz','Which explanation best matches “Fundamental Analysis” in this module?','["The token may capture little value, or the market price may already be excessive.","Some protocols reward users with tokens for participating.","Fundamental analysis focuses on the asset, network and ecosystem.","Experienced people can still fail, mismanage funds or face stronger competition."]',2,'The module explains “Fundamental Analysis” as follows: Fundamental analysis focuses on the asset, network and ecosystem.','Fundamental Analysis',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-05-lesson-05-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-05-lesson-05-quiz-q04','cmf-module-2-05-lesson-05-quiz','Which explanation best matches “Protocol Revenue Versus Token-Holder Value” in this module?','["Fundamental analysis focuses on the asset, network and ecosystem.","A protocol may collect fees without transferring value to token holders.","Experienced people can still fail, mismanage funds or face stronger competition.","The token may capture little value, or the market price may already be excessive."]',1,'The module explains “Protocol Revenue Versus Token-Holder Value” as follows: A protocol may collect fees without transferring value to token holders.','Protocol Revenue Versus Token-Holder Value',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-05-lesson-05-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-05-lesson-05-quiz-q05','cmf-module-2-05-lesson-05-quiz','Which explanation best matches “A Good Project Is Always a Good Investment” in this module?','["The token may capture little value, or the market price may already be excessive.","Experienced people can still fail, mismanage funds or face stronger competition.","Some protocols reward users with tokens for participating.","Fundamental analysis focuses on the asset, network and ecosystem."]',0,'The module explains “A Good Project Is Always a Good Investment” as follows: The token may capture little value, or the market price may already be excessive.','A Good Project Is Always a Good Investment',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-05-lesson-05-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.6: Evaluating Cryptocurrency Projects, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- Why should a project, company and token be evaluated separately?

- What should a one-sentence project description explain?

- Why must the underlying problem be evaluated before the solution?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-06-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-06-lesson-06-quiz','cmf-module-2-06-lesson-06','Module 2.6: Evaluating Cryptocurrency Projects: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-06-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-06-lesson-06-quiz-q01','cmf-module-2-06-lesson-06-quiz','Which explanation best matches “1. Problem and Market Need” in this module?','["Is the problem genuine and economically meaningful?","Can the project continue operating without constant token sales?","Does the project have an advantage that is difficult to copy?","Independent audits may identify vulnerabilities in smart contracts or protocol code."]',0,'The module explains “1. Problem and Market Need” as follows: Is the problem genuine and economically meaningful?','1. Problem and Market Need',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-06-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-06-lesson-06-quiz-q02','cmf-module-2-06-lesson-06-quiz','Which explanation best matches “Audits and Bug Bounties” in this module?','["Is the problem genuine and economically meaningful?","Can the project continue operating without constant token sales?","Does the project have an advantage that is difficult to copy?","Independent audits may identify vulnerabilities in smart contracts or protocol code."]',3,'The module explains “Audits and Bug Bounties” as follows: Independent audits may identify vulnerabilities in smart contracts or protocol code.','Audits and Bug Bounties',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-06-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-06-lesson-06-quiz-q03','cmf-module-2-06-lesson-06-quiz','Which explanation best matches “10. Financial Sustainability” in this module?','["Does the project have an advantage that is difficult to copy?","Are legal, liquidity and exchange risks manageable?","Can the project continue operating without constant token sales?","Is the problem genuine and economically meaningful?"]',2,'The module explains “10. Financial Sustainability” as follows: Can the project continue operating without constant token sales?','10. Financial Sustainability',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-06-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-06-lesson-06-quiz-q04','cmf-module-2-06-lesson-06-quiz','Which explanation best matches “11. Competition and Defensibility” in this module?','["Are legal, liquidity and exchange risks manageable?","Does the project have an advantage that is difficult to copy?","Is the problem genuine and economically meaningful?","Can the project continue operating without constant token sales?"]',1,'The module explains “11. Competition and Defensibility” as follows: Does the project have an advantage that is difficult to copy?','11. Competition and Defensibility',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-06-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-06-lesson-06-quiz-q05','cmf-module-2-06-lesson-06-quiz','Which explanation best matches “12. Regulation and Market Risk” in this module?','["Are legal, liquidity and exchange risks manageable?","Can the project continue operating without constant token sales?","Does the project have an advantage that is difficult to copy?","Independent audits may identify vulnerabilities in smart contracts or protocol code."]',0,'The module explains “12. Regulation and Market Risk” as follows: Are legal, liquidity and exchange risks manageable?','12. Regulation and Market Risk',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-06-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.7: Understanding Cryptocurrency White Papers, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a cryptocurrency white paper?

- Why should it be treated as a primary but not independent source?

- How does a litepaper differ from a technical paper?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-07-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-07-lesson-06-quiz','cmf-module-2-07-lesson-06','Module 2.7: Understanding Cryptocurrency White Papers: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-07-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-07-lesson-06-quiz-q01','cmf-module-2-07-lesson-06-quiz','Which explanation best matches “A Famous White Paper Guarantees Token Value” in this module?','["A strong technical design does not automatically create investment value.","Provides practical information for developers and users, such as: How to use the network, Application programming interfaces, Smart contract addresses, Node instructions.","Demand, distribution and minting authority must also be examined.","Length can reflect detail, repetition or deliberate complexity."]',0,'The module explains “A Famous White Paper Guarantees Token Value” as follows: A strong technical design does not automatically create investment value.','A Famous White Paper Guarantees Token Value',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-07-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-07-lesson-06-quiz-q02','cmf-module-2-07-lesson-06-quiz','Which explanation best matches “Common White-Paper Warning Signs” in this module?','["Demand, distribution and minting authority must also be examined.","Provides practical information for developers and users, such as: How to use the network, Application programming interfaces, Smart contract addresses, Node instructions.","A strong technical design does not automatically create investment value.","Vague or copied technical explanations"]',3,'The module explains “Common White-Paper Warning Signs” as follows: Vague or copied technical explanations','Common White-Paper Warning Signs',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-07-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-07-lesson-06-quiz-q03','cmf-module-2-07-lesson-06-quiz','Which explanation best matches “Documentation” in this module?','["Demand, distribution and minting authority must also be examined.","Length can reflect detail, repetition or deliberate complexity.","Provides practical information for developers and users, such as: How to use the network, Application programming interfaces, Smart contract addresses, Node instructions.","A strong technical design does not automatically create investment value."]',2,'The module explains “Documentation” as follows: Provides practical information for developers and users, such as: How to use the network, Application programming interfaces, Smart contract addresses, Node instructions.','Documentation',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-07-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-07-lesson-06-quiz-q04','cmf-module-2-07-lesson-06-quiz','Which explanation best matches “A Fixed Supply Guarantees Scarcity” in this module?','["Provides practical information for developers and users, such as: How to use the network, Application programming interfaces, Smart contract addresses, Node instructions.","Demand, distribution and minting authority must also be examined.","Length can reflect detail, repetition or deliberate complexity.","Vague or copied technical explanations"]',1,'The module explains “A Fixed Supply Guarantees Scarcity” as follows: Demand, distribution and minting authority must also be examined.','A Fixed Supply Guarantees Scarcity',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-07-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-07-lesson-06-quiz-q05','cmf-module-2-07-lesson-06-quiz','Which explanation best matches “A Long White Paper Is More Credible” in this module?','["Length can reflect detail, repetition or deliberate complexity.","Demand, distribution and minting authority must also be examined.","Provides practical information for developers and users, such as: How to use the network, Application programming interfaces, Smart contract addresses, Node instructions.","A strong technical design does not automatically create investment value."]',0,'The module explains “A Long White Paper Is More Credible” as follows: Length can reflect detail, repetition or deliberate complexity.','A Long White Paper Is More Credible',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-07-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.8: Evaluating Project Teams and Roadmaps, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- Why does the project team matter in a decentralised ecosystem?

- What is execution risk?

- Why should team credentials be independently verified?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-08-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-08-lesson-06-quiz','cmf-module-2-08-lesson-06','Module 2.8: Evaluating Project Teams and Roadmaps: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-08-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-08-lesson-06-quiz-q01','cmf-module-2-08-lesson-06-quiz','Which explanation best matches “Roadmap Inflation” in this module?','["A project lists a large number of ambitious features to create excitement.","The roadmap should allow responsible changes when new information emerges.","Projects often display respected advisers to increase credibility.","Founders often shape the project’s purpose, culture and initial governance."]',0,'The module explains “Roadmap Inflation” as follows: A project lists a large number of ambitious features to create excitement.','Roadmap Inflation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-08-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-08-lesson-06-quiz-q02','cmf-module-2-08-lesson-06-quiz','Which explanation best matches “A Detailed Roadmap Guarantees Delivery” in this module?','["The roadmap should allow responsible changes when new information emerges.","Projects often display respected advisers to increase credibility.","Founders often shape the project’s purpose, culture and initial governance.","A roadmap records intention, not achievement."]',3,'The module explains “A Detailed Roadmap Guarantees Delivery” as follows: A roadmap records intention, not achievement.','A Detailed Roadmap Guarantees Delivery',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-08-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-08-lesson-06-quiz-q03','cmf-module-2-08-lesson-06-quiz','Which explanation best matches “Adaptable” in this module?','["A roadmap records intention, not achievement.","Projects often display respected advisers to increase credibility.","The roadmap should allow responsible changes when new information emerges.","A project lists a large number of ambitious features to create excitement."]',2,'The module explains “Adaptable” as follows: The roadmap should allow responsible changes when new information emerges.','Adaptable',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-08-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-08-lesson-06-quiz-q04','cmf-module-2-08-lesson-06-quiz','Which explanation best matches “Advisers” in this module?','["The roadmap should allow responsible changes when new information emerges.","Projects often display respected advisers to increase credibility.","A project lists a large number of ambitious features to create excitement.","A roadmap records intention, not achievement."]',1,'The module explains “Advisers” as follows: Projects often display respected advisers to increase credibility.','Advisers',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-08-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-08-lesson-06-quiz-q05','cmf-module-2-08-lesson-06-quiz','Which explanation best matches “Founder Evaluation” in this module?','["Founders often shape the project’s purpose, culture and initial governance.","A project lists a large number of ambitious features to create excitement.","A roadmap records intention, not achievement.","The roadmap should allow responsible changes when new information emerges."]',0,'The module explains “Founder Evaluation” as follows: Founders often shape the project’s purpose, culture and initial governance.','Founder Evaluation',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-08-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.9: Community, Adoption and Network Effects, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is the difference between an audience and a community?

- How can a strong community support a cryptocurrency network?

- What behaviours may indicate an unhealthy community culture?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-09-lesson-05' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-09-lesson-05-quiz','cmf-module-2-09-lesson-05','Module 2.9: Community, Adoption and Network Effects: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-09-lesson-05');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-09-lesson-05-quiz-q01','cmf-module-2-09-lesson-05-quiz','Which explanation best matches “Multi-Homing” in this module?','["Users participate in several networks or platforms simultaneously.","Whether users continue using a product after their first interaction.","The difficulties users face when moving to another platform or network.","A simple scorecard may assess each area from one to five."]',0,'The module explains “Multi-Homing” as follows: Users participate in several networks or platforms simultaneously.','Multi-Homing',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-09-lesson-05-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-09-lesson-05-quiz-q02','cmf-module-2-09-lesson-05-quiz','Which explanation best matches “Retention” in this module?','["Users participate in several networks or platforms simultaneously.","The difficulties users face when moving to another platform or network.","A simple scorecard may assess each area from one to five.","Whether users continue using a product after their first interaction."]',3,'The module explains “Retention” as follows: Whether users continue using a product after their first interaction.','Retention',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-09-lesson-05-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-09-lesson-05-quiz-q03','cmf-module-2-09-lesson-05-quiz','Which explanation best matches “A Community and Adoption Scorecard” in this module?','["Whether users continue using a product after their first interaction.","The difficulties users face when moving to another platform or network.","A simple scorecard may assess each area from one to five.","Users participate in several networks or platforms simultaneously."]',2,'The module explains “A Community and Adoption Scorecard” as follows: A simple scorecard may assess each area from one to five.','A Community and Adoption Scorecard',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-09-lesson-05-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-09-lesson-05-quiz-q04','cmf-module-2-09-lesson-05-quiz','Which explanation best matches “Audience Versus Community” in this module?','["The difficulties users face when moving to another platform or network.","A project may have a large audience because its token price has risen or because influencers are promoting it.","Users participate in several networks or platforms simultaneously.","Whether users continue using a product after their first interaction."]',1,'The module explains “Audience Versus Community” as follows: A project may have a large audience because its token price has risen or because influencers are promoting it.','Audience Versus Community',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-09-lesson-05-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-09-lesson-05-quiz-q05','cmf-module-2-09-lesson-05-quiz','Which explanation best matches “Switching Costs” in this module?','["The difficulties users face when moving to another platform or network.","Users participate in several networks or platforms simultaneously.","Whether users continue using a product after their first interaction.","A simple scorecard may assess each area from one to five."]',0,'The module explains “Switching Costs” as follows: The difficulties users face when moving to another platform or network.','Switching Costs',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-09-lesson-05-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.10: Advanced Tokenomics, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What are token sources and token sinks?

- How is net issuance calculated?

- Why should burns be compared with new token issuance?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-10-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-10-lesson-06-quiz','cmf-module-2-10-lesson-06','Module 2.10: Advanced Tokenomics: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-10-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-10-lesson-06-quiz-q01','cmf-module-2-10-lesson-06-quiz','Which explanation best matches “Annualised Supply Inflation” in this module?','["The rate at which token supply increases over a year.","How quickly tokens circulate through the economy.","High velocity, supply growth and weak value capture may limit demand.","A circular token economy occurs when apparent demand depends mainly on participants seeking additional tokens."]',0,'The module explains “Annualised Supply Inflation” as follows: The rate at which token supply increases over a year.','Annualised Supply Inflation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-10-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-10-lesson-06-quiz-q02','cmf-module-2-10-lesson-06-quiz','Which explanation best matches “Token Velocity” in this module?','["The rate at which token supply increases over a year.","Different groups may acquire tokens at dramatically different prices.","High velocity, supply growth and weak value capture may limit demand.","How quickly tokens circulate through the economy."]',3,'The module explains “Token Velocity” as follows: How quickly tokens circulate through the economy.','Token Velocity',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-10-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-10-lesson-06-quiz-q03','cmf-module-2-10-lesson-06-quiz','Which explanation best matches “A Useful Token Must Increase in Price” in this module?','["Different groups may acquire tokens at dramatically different prices.","How quickly tokens circulate through the economy.","High velocity, supply growth and weak value capture may limit demand.","The rate at which token supply increases over a year."]',2,'The module explains “A Useful Token Must Increase in Price” as follows: High velocity, supply growth and weak value capture may limit demand.','A Useful Token Must Increase in Price',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-10-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-10-lesson-06-quiz-q04','cmf-module-2-10-lesson-06-quiz','Which explanation best matches “Circular Token Economies” in this module?','["How quickly tokens circulate through the economy.","A circular token economy occurs when apparent demand depends mainly on participants seeking additional tokens.","The rate at which token supply increases over a year.","Different groups may acquire tokens at dramatically different prices."]',1,'The module explains “Circular Token Economies” as follows: A circular token economy occurs when apparent demand depends mainly on participants seeking additional tokens.','Circular Token Economies',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-10-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-10-lesson-06-quiz-q05','cmf-module-2-10-lesson-06-quiz','Which explanation best matches “Cost Basis Differences” in this module?','["Different groups may acquire tokens at dramatically different prices.","The rate at which token supply increases over a year.","How quickly tokens circulate through the economy.","High velocity, supply growth and weak value capture may limit demand."]',0,'The module explains “Cost Basis Differences” as follows: Different groups may acquire tokens at dramatically different prices.','Cost Basis Differences',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-10-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.11: Token Supply and Distribution, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is circulating supply?

- How does total supply differ from maximum supply?

- How is fully diluted valuation calculated?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-11-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-11-lesson-06-quiz','cmf-module-2-11-lesson-06','Module 2.11: Token Supply and Distribution: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-11-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-11-lesson-06-quiz-q01','cmf-module-2-11-lesson-06-quiz','Which explanation best matches “Circulating Supply” in this module?','["The number of tokens considered available in the market.","New tokens reduce an existing holder’s percentage ownership of the total supply.","The supply realistically available for active trading.","The gradual release of restricted tokens over time."]',0,'The module explains “Circulating Supply” as follows: The number of tokens considered available in the market.','Circulating Supply',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-11-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-11-lesson-06-quiz-q02','cmf-module-2-11-lesson-06-quiz','Which explanation best matches “Dilution” in this module?','["The number of tokens considered available in the market.","The supply realistically available for active trading.","The gradual release of restricted tokens over time.","New tokens reduce an existing holder’s percentage ownership of the total supply."]',3,'The module explains “Dilution” as follows: New tokens reduce an existing holder’s percentage ownership of the total supply.','Dilution',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-11-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-11-lesson-06-quiz-q03','cmf-module-2-11-lesson-06-quiz','Which explanation best matches “Free Float” in this module?','["New tokens reduce an existing holder’s percentage ownership of the total supply.","The gradual release of restricted tokens over time.","The supply realistically available for active trading.","The number of tokens considered available in the market."]',2,'The module explains “Free Float” as follows: The supply realistically available for active trading.','Free Float',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-11-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-11-lesson-06-quiz-q04','cmf-module-2-11-lesson-06-quiz','Which explanation best matches “Vesting” in this module?','["The supply realistically available for active trading.","The gradual release of restricted tokens over time.","The number of tokens considered available in the market.","New tokens reduce an existing holder’s percentage ownership of the total supply."]',1,'The module explains “Vesting” as follows: The gradual release of restricted tokens over time.','Vesting',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-11-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-11-lesson-06-quiz-q05','cmf-module-2-11-lesson-06-quiz','Which explanation best matches “A Low Token Price Means the Asset Is Cheap” in this module?','["Supply and valuation determine scale, not the price of one unit.","The number of tokens considered available in the market.","New tokens reduce an existing holder’s percentage ownership of the total supply.","The supply realistically available for active trading."]',0,'The module explains “A Low Token Price Means the Asset Is Cheap” as follows: Supply and valuation determine scale, not the price of one unit.','A Low Token Price Means the Asset Is Cheap',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-11-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.12: Inflation, Deflation and Token Burns, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is token inflation?

- How does supply inflation differ from price inflation?

- How is an annual token inflation rate estimated?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-12-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-12-lesson-06-quiz','cmf-module-2-12-lesson-06','Module 2.12: Inflation, Deflation and Token Burns: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-12-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-12-lesson-06-quiz-q01','cmf-module-2-12-lesson-06-quiz','Which explanation best matches “Disinflation” in this module?','["Supply continues increasing, but at a progressively slower rate.","The total number of new tokens created during a period.","Scarcity also depends on demand, ownership distribution, utility and the credibility of the supply rules.","Token burns are highly visible and easy to promote."]',0,'The module explains “Disinflation” as follows: Supply continues increasing, but at a progressively slower rate.','Disinflation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-12-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-12-lesson-06-quiz-q02','cmf-module-2-12-lesson-06-quiz','Which explanation best matches “Gross Issuance” in this module?','["Supply continues increasing, but at a progressively slower rate.","Scarcity also depends on demand, ownership distribution, utility and the credibility of the supply rules.","Token burns are highly visible and easy to promote.","The total number of new tokens created during a period."]',3,'The module explains “Gross Issuance” as follows: The total number of new tokens created during a period.','Gross Issuance',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-12-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-12-lesson-06-quiz-q03','cmf-module-2-12-lesson-06-quiz','Which explanation best matches “A Deflationary Token Is Scarce” in this module?','["The total number of new tokens created during a period.","Token burns are highly visible and easy to promote.","Scarcity also depends on demand, ownership distribution, utility and the credibility of the supply rules.","Supply continues increasing, but at a progressively slower rate."]',2,'The module explains “A Deflationary Token Is Scarce” as follows: Scarcity also depends on demand, ownership distribution, utility and the credibility of the supply rules.','A Deflationary Token Is Scarce',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-12-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-12-lesson-06-quiz-q04','cmf-module-2-12-lesson-06-quiz','Which explanation best matches “Burns as Marketing” in this module?','["Scarcity also depends on demand, ownership distribution, utility and the credibility of the supply rules.","Token burns are highly visible and easy to promote.","Supply continues increasing, but at a progressively slower rate.","The total number of new tokens created during a period."]',1,'The module explains “Burns as Marketing” as follows: Token burns are highly visible and easy to promote.','Burns as Marketing',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-12-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-12-lesson-06-quiz-q05','cmf-module-2-12-lesson-06-quiz','Which explanation best matches “Inflation and Ownership Dilution” in this module?','["Inflation can dilute existing holders.","Supply continues increasing, but at a progressively slower rate.","The total number of new tokens created during a period.","Scarcity also depends on demand, ownership distribution, utility and the credibility of the supply rules."]',0,'The module explains “Inflation and Ownership Dilution” as follows: Inflation can dilute existing holders.','Inflation and Ownership Dilution',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-12-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.13: Token Vesting and Unlock Schedules, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is token vesting?

- Why do projects use vesting schedules?

- What is the difference between locked, vested and unlocked tokens?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-13-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-13-lesson-06-quiz','cmf-module-2-13-lesson-06','Module 2.13: Token Vesting and Unlock Schedules: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-13-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-13-lesson-06-quiz-q01','cmf-module-2-13-lesson-06-quiz','Which explanation best matches “Circulating Tokens” in this module?','["Considered available within the market.","Comparison with average trading volume","Founders, employees, investors or community?","Some agreements allow tokens to vest earlier under certain conditions."]',0,'The module explains “Circulating Tokens” as follows: Considered available within the market.','Circulating Tokens',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-13-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-13-lesson-06-quiz-q02','cmf-module-2-13-lesson-06-quiz','Which explanation best matches “2. Measure Its Scale” in this module?','["Considered available within the market.","Founders, employees, investors or community?","Some agreements allow tokens to vest earlier under certain conditions.","Comparison with average trading volume"]',3,'The module explains “2. Measure Its Scale” as follows: Comparison with average trading volume','2. Measure Its Scale',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-13-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-13-lesson-06-quiz-q03','cmf-module-2-13-lesson-06-quiz','Which explanation best matches “3. Analyse Recipients” in this module?','["Comparison with average trading volume","Some agreements allow tokens to vest earlier under certain conditions.","Founders, employees, investors or community?","Considered available within the market."]',2,'The module explains “3. Analyse Recipients” as follows: Founders, employees, investors or community?','3. Analyse Recipients',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-13-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-13-lesson-06-quiz-q04','cmf-module-2-13-lesson-06-quiz','Which explanation best matches “Accelerated Vesting” in this module?','["Founders, employees, investors or community?","Some agreements allow tokens to vest earlier under certain conditions.","Considered available within the market.","Comparison with average trading volume"]',1,'The module explains “Accelerated Vesting” as follows: Some agreements allow tokens to vest earlier under certain conditions.','Accelerated Vesting',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-13-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-13-lesson-06-quiz-q05','cmf-module-2-13-lesson-06-quiz','Which explanation best matches “Adviser Unlocks” in this module?','["Advisers may receive tokens for strategic, technical or commercial support.","Considered available within the market.","Comparison with average trading volume","Founders, employees, investors or community?"]',0,'The module explains “Adviser Unlocks” as follows: Advisers may receive tokens for strategic, technical or commercial support.','Adviser Unlocks',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-13-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.14: Cryptocurrency Portfolio Construction, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a cryptocurrency portfolio?

- Why should portfolio construction begin with an objective?

- What is the difference between risk tolerance and risk capacity?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-14-lesson-07' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-14-lesson-07-quiz','cmf-module-2-14-lesson-07','Module 2.14: Cryptocurrency Portfolio Construction: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-14-lesson-07');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-14-lesson-07-quiz-q01','cmf-module-2-14-lesson-07-quiz','Which explanation best matches “Correlation” in this module?','["The degree to which two assets move together.","The investor’s financial ability to absorb loss.","Smaller positions intended to provide exposure to: Emerging technologies, Specific sectors, Higher-growth opportunities, Experimental applications.","Time cannot repair fraud, insolvency or permanent project failure."]',0,'The module explains “Correlation” as follows: The degree to which two assets move together.','Correlation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-14-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-14-lesson-07-quiz-q02','cmf-module-2-14-lesson-07-quiz','Which explanation best matches “Risk Capacity” in this module?','["The degree to which two assets move together.","Smaller positions intended to provide exposure to: Emerging technologies, Specific sectors, Higher-growth opportunities, Experimental applications.","Adding to a position after its price declines is sometimes called averaging down.","The investor’s financial ability to absorb loss."]',3,'The module explains “Risk Capacity” as follows: The investor’s financial ability to absorb loss.','Risk Capacity',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-14-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-14-lesson-07-quiz-q03','cmf-module-2-14-lesson-07-quiz','Which explanation best matches “Satellite Holdings” in this module?','["The investor’s financial ability to absorb loss.","Time cannot repair fraud, insolvency or permanent project failure.","Smaller positions intended to provide exposure to: Emerging technologies, Specific sectors, Higher-growth opportunities, Experimental applications.","The degree to which two assets move together."]',2,'The module explains “Satellite Holdings” as follows: Smaller positions intended to provide exposure to: Emerging technologies, Specific sectors, Higher-growth opportunities, Experimental applications.','Satellite Holdings',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-14-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-14-lesson-07-quiz-q04','cmf-module-2-14-lesson-07-quiz','Which explanation best matches “A Long Time Horizon Allows Unlimited Risk” in this module?','["Adding to a position after its price declines is sometimes called averaging down.","Time cannot repair fraud, insolvency or permanent project failure.","The degree to which two assets move together.","Smaller positions intended to provide exposure to: Emerging technologies, Specific sectors, Higher-growth opportunities, Experimental applications."]',1,'The module explains “A Long Time Horizon Allows Unlimited Risk” as follows: Time cannot repair fraud, insolvency or permanent project failure.','A Long Time Horizon Allows Unlimited Risk',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-14-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-14-lesson-07-quiz-q05','cmf-module-2-14-lesson-07-quiz','Which explanation best matches “Adding to Losing Positions” in this module?','["Adding to a position after its price declines is sometimes called averaging down.","The degree to which two assets move together.","The investor’s financial ability to absorb loss.","Smaller positions intended to provide exposure to: Emerging technologies, Specific sectors, Higher-growth opportunities, Experimental applications."]',0,'The module explains “Adding to Losing Positions” as follows: Adding to a position after its price declines is sometimes called averaging down.','Adding to Losing Positions',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-14-lesson-07-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.15: Diversification and Asset Allocation, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is diversification?

- How does asset allocation differ from diversification?

- What is asset-specific risk?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-15-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-15-lesson-06-quiz','cmf-module-2-15-lesson-06','Module 2.15: Diversification and Asset Allocation: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-15-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-15-lesson-06-quiz-q01','cmf-module-2-15-lesson-06-quiz','Which explanation best matches “Concentration Risk” in this module?','["Too much of the portfolio depends on one exposure.","The degree to which assets move together.","It may be deliberate, but the investor must accept the greater consequences of being wrong.","A useful diversification map may include the following columns: Asset, Portfolio category, Blockchain, Use case."]',0,'The module explains “Concentration Risk” as follows: Too much of the portfolio depends on one exposure.','Concentration Risk',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-15-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-15-lesson-06-quiz-q02','cmf-module-2-15-lesson-06-quiz','Which explanation best matches “Correlation” in this module?','["Too much of the portfolio depends on one exposure.","It may be deliberate, but the investor must accept the greater consequences of being wrong.","A useful diversification map may include the following columns: Asset, Portfolio category, Blockchain, Use case.","The degree to which assets move together."]',3,'The module explains “Correlation” as follows: The degree to which assets move together.','Correlation',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-15-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-15-lesson-06-quiz-q03','cmf-module-2-15-lesson-06-quiz','Which explanation best matches “A Concentrated Portfolio Is Always Wrong” in this module?','["The degree to which assets move together.","A useful diversification map may include the following columns: Asset, Portfolio category, Blockchain, Use case.","It may be deliberate, but the investor must accept the greater consequences of being wrong.","Too much of the portfolio depends on one exposure."]',2,'The module explains “A Concentrated Portfolio Is Always Wrong” as follows: It may be deliberate, but the investor must accept the greater consequences of being wrong.','A Concentrated Portfolio Is Always Wrong',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-15-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-15-lesson-06-quiz-q04','cmf-module-2-15-lesson-06-quiz','Which explanation best matches “A Diversification Map” in this module?','["It may be deliberate, but the investor must accept the greater consequences of being wrong.","A useful diversification map may include the following columns: Asset, Portfolio category, Blockchain, Use case.","Too much of the portfolio depends on one exposure.","The degree to which assets move together."]',1,'The module explains “A Diversification Map” as follows: A useful diversification map may include the following columns: Asset, Portfolio category, Blockchain, Use case.','A Diversification Map',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-15-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-15-lesson-06-quiz-q05','cmf-module-2-15-lesson-06-quiz','Which explanation best matches “Asset Allocation” in this module?','["How much capital belongs in each category?","Too much of the portfolio depends on one exposure.","The degree to which assets move together.","It may be deliberate, but the investor must accept the greater consequences of being wrong."]',0,'The module explains “Asset Allocation” as follows: How much capital belongs in each category?','Asset Allocation',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-15-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.16: Position Sizing, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is position sizing?

- How does position size differ from capital at risk?

- How is a portfolio allocation percentage calculated?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-16-lesson-07' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-16-lesson-07-quiz','cmf-module-2-16-lesson-07','Module 2.16: Position Sizing: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-16-lesson-07');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-16-lesson-07-quiz-q01','cmf-module-2-16-lesson-07-quiz','Which explanation best matches “Averaging Down” in this module?','["Purchasing more after the price falls, reducing the average acquisition price.","The actual market value controlled after accounting for leverage and derivatives.","Unit price does not determine risk or valuation.","The exit level should be based on a reasoned assessment rather than an arbitrary percentage."]',0,'The module explains “Averaging Down” as follows: Purchasing more after the price falls, reducing the average acquisition price.','Averaging Down',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-16-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-16-lesson-07-quiz-q02','cmf-module-2-16-lesson-07-quiz','Which explanation best matches “Effective Exposure” in this module?','["Purchasing more after the price falls, reducing the average acquisition price.","Unit price does not determine risk or valuation.","The exit level should be based on a reasoned assessment rather than an arbitrary percentage.","The actual market value controlled after accounting for leverage and derivatives."]',3,'The module explains “Effective Exposure” as follows: The actual market value controlled after accounting for leverage and derivatives.','Effective Exposure',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-16-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-16-lesson-07-quiz-q03','cmf-module-2-16-lesson-07-quiz','Which explanation best matches “A Small Token Price Allows Me to Buy More Safely” in this module?','["The actual market value controlled after accounting for leverage and derivatives.","The exit level should be based on a reasoned assessment rather than an arbitrary percentage.","Unit price does not determine risk or valuation.","Purchasing more after the price falls, reducing the average acquisition price."]',2,'The module explains “A Small Token Price Allows Me to Buy More Safely” as follows: Unit price does not determine risk or valuation.','A Small Token Price Allows Me to Buy More Safely',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-16-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-16-lesson-07-quiz-q04','cmf-module-2-16-lesson-07-quiz','Which explanation best matches “Choosing a Risk-Control Level” in this module?','["Unit price does not determine risk or valuation.","The exit level should be based on a reasoned assessment rather than an arbitrary percentage.","Purchasing more after the price falls, reducing the average acquisition price.","The actual market value controlled after accounting for leverage and derivatives."]',1,'The module explains “Choosing a Risk-Control Level” as follows: The exit level should be based on a reasoned assessment rather than an arbitrary percentage.','Choosing a Risk-Control Level',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-16-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-16-lesson-07-quiz-q05','cmf-module-2-16-lesson-07-quiz','Which explanation best matches “Example: Long-Term Speculative Position” in this module?','["Cryptocurrency portfolio: 30,000 units","Purchasing more after the price falls, reducing the average acquisition price.","The actual market value controlled after accounting for leverage and derivatives.","Unit price does not determine risk or valuation."]',0,'The module explains “Example: Long-Term Speculative Position” as follows: Cryptocurrency portfolio: 30,000 units','Example: Long-Term Speculative Position',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-16-lesson-07-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.17: Risk-to-Reward Principles, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What does a risk-to-reward ratio measure?

- How is the ratio calculated for a long position?

- Why should the invalidation level be defined before the profit target?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-17-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-17-lesson-06-quiz','cmf-module-2-17-lesson-06','Module 2.17: Risk-to-Reward Principles: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-17-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-17-lesson-06-quiz-q01','cmf-module-2-17-lesson-06-quiz','Which explanation best matches “Risk of Ruin” in this module?','["The possibility that one or several losses reduce capital so severely that the participant cannot continue.","The percentage of positions that produce a profit.","The direction changes, but the principle remains the same.","Large losses can outweigh many small gains."]',0,'The module explains “Risk of Ruin” as follows: The possibility that one or several losses reduce capital so severely that the participant cannot continue.','Risk of Ruin',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-17-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-17-lesson-06-quiz-q02','cmf-module-2-17-lesson-06-quiz','Which explanation best matches “Win Rate” in this module?','["The possibility that one or several losses reduce capital so severely that the participant cannot continue.","The direction changes, but the principle remains the same.","A target may appear attractive on a chart but be impossible to realise for a large position.","The percentage of positions that produce a profit."]',3,'The module explains “Win Rate” as follows: The percentage of positions that produce a profit.','Win Rate',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-17-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-17-lesson-06-quiz-q03','cmf-module-2-17-lesson-06-quiz','Which explanation best matches “1 to 3” in this module?','["The percentage of positions that produce a profit.","Large losses can outweigh many small gains.","The direction changes, but the principle remains the same.","The possibility that one or several losses reduce capital so severely that the participant cannot continue."]',2,'The module explains “1 to 3” as follows: The direction changes, but the principle remains the same.','1 to 3',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-17-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-17-lesson-06-quiz-q04','cmf-module-2-17-lesson-06-quiz','Which explanation best matches “A High Win Rate Means a Profitable Strategy” in this module?','["A target may appear attractive on a chart but be impossible to realise for a large position.","Large losses can outweigh many small gains.","The possibility that one or several losses reduce capital so severely that the participant cannot continue.","The direction changes, but the principle remains the same."]',1,'The module explains “A High Win Rate Means a Profitable Strategy” as follows: Large losses can outweigh many small gains.','A High Win Rate Means a Profitable Strategy',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-17-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-17-lesson-06-quiz-q05','cmf-module-2-17-lesson-06-quiz','Which explanation best matches “Liquidity and Risk-to-Reward” in this module?','["A target may appear attractive on a chart but be impossible to realise for a large position.","The percentage of positions that produce a profit.","The direction changes, but the principle remains the same.","Large losses can outweigh many small gains."]',0,'The module explains “Liquidity and Risk-to-Reward” as follows: A target may appear attractive on a chart but be impossible to realise for a large position.','Liquidity and Risk-to-Reward',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-17-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.18: Technical Analysis Foundations, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is technical analysis?

- How does technical analysis differ from fundamental analysis?

- What are the three broad assumptions often associated with technical analysis?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-18-lesson-06' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-18-lesson-06-quiz','cmf-module-2-18-lesson-06','Module 2.18: Technical Analysis Foundations: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-18-lesson-06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-18-lesson-06-quiz-q01','cmf-module-2-18-lesson-06-quiz','Which explanation best matches “Chart Patterns” in this module?','["Recognisable price formations associated with recurring market behaviour.","Several indicators measure the same underlying information.","The sequence of important price highs and lows.","Market prices respond to information, expectations, emotions and liquidity."]',0,'The module explains “Chart Patterns” as follows: Recognisable price formations associated with recurring market behaviour.','Chart Patterns',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-18-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-18-lesson-06-quiz-q02','cmf-module-2-18-lesson-06-quiz','Which explanation best matches “Indicator Redundancy” in this module?','["Recognisable price formations associated with recurring market behaviour.","The sequence of important price highs and lows.","Market prices respond to information, expectations, emotions and liquidity.","Several indicators measure the same underlying information."]',3,'The module explains “Indicator Redundancy” as follows: Several indicators measure the same underlying information.','Indicator Redundancy',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-18-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-18-lesson-06-quiz-q03','cmf-module-2-18-lesson-06-quiz','Which explanation best matches “Market Structure” in this module?','["Several indicators measure the same underlying information.","Market prices respond to information, expectations, emotions and liquidity.","The sequence of important price highs and lows.","Recognisable price formations associated with recurring market behaviour."]',2,'The module explains “Market Structure” as follows: The sequence of important price highs and lows.','Market Structure',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-18-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-18-lesson-06-quiz-q04','cmf-module-2-18-lesson-06-quiz','Which explanation best matches “1. Price Reflects Available Information” in this module?','["The sequence of important price highs and lows.","Market prices respond to information, expectations, emotions and liquidity.","Recognisable price formations associated with recurring market behaviour.","Several indicators measure the same underlying information."]',1,'The module explains “1. Price Reflects Available Information” as follows: Market prices respond to information, expectations, emotions and liquidity.','1. Price Reflects Available Information',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-18-lesson-06-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-18-lesson-06-quiz-q05','cmf-module-2-18-lesson-06-quiz','Which explanation best matches “A Correct Analysis Guarantees Profit” in this module?','["Execution, timing, costs and position size determine financial results.","Recognisable price formations associated with recurring market behaviour.","Several indicators measure the same underlying information.","The sequence of important price highs and lows."]',0,'The module explains “A Correct Analysis Guarantees Profit” as follows: Execution, timing, costs and position size determine financial results.','A Correct Analysis Guarantees Profit',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-18-lesson-06-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.19: Understanding Candlestick Charts, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What four price points does a candlestick display?

- What does the candle body represent?

- What do the upper and lower wicks represent?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-19-lesson-07' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-19-lesson-07-quiz','cmf-module-2-19-lesson-07','Module 2.19: Understanding Candlestick Charts: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-19-lesson-07');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-19-lesson-07-quiz-q01','cmf-module-2-19-lesson-07-quiz','Which explanation best matches “Candle Overlap” in this module?','["Several candles trade within similar price ranges.","Later price action supports the message of the original candle.","The distance between the opening and closing prices.","It indicates balance or indecision and may occur during continuation."]',0,'The module explains “Candle Overlap” as follows: Several candles trade within similar price ranges.','Candle Overlap',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-19-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-19-lesson-07-quiz-q02','cmf-module-2-19-lesson-07-quiz','Which explanation best matches “Follow-Through” in this module?','["Several candles trade within similar price ranges.","The distance between the opening and closing prices.","It indicates balance or indecision and may occur during continuation.","Later price action supports the message of the original candle."]',3,'The module explains “Follow-Through” as follows: Later price action supports the message of the original candle.','Follow-Through',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-19-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-19-lesson-07-quiz-q03','cmf-module-2-19-lesson-07-quiz','Which explanation best matches “The Body” in this module?','["Later price action supports the message of the original candle.","It indicates balance or indecision and may occur during continuation.","The distance between the opening and closing prices.","Several candles trade within similar price ranges."]',2,'The module explains “The Body” as follows: The distance between the opening and closing prices.','The Body',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-19-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-19-lesson-07-quiz-q04','cmf-module-2-19-lesson-07-quiz','Which explanation best matches “A Doji Means the Trend Must Reverse” in this module?','["The distance between the opening and closing prices.","It indicates balance or indecision and may occur during continuation.","Several candles trade within similar price ranges.","Later price action supports the message of the original candle."]',1,'The module explains “A Doji Means the Trend Must Reverse” as follows: It indicates balance or indecision and may occur during continuation.','A Doji Means the Trend Must Reverse',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-19-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-19-lesson-07-quiz-q05','cmf-module-2-19-lesson-07-quiz','Which explanation best matches “Bearish Engulfing Pattern” in this module?','["A bearish engulfing pattern generally involves: A bullish candle, Followed by a larger bearish candle whose body covers the previous body, After an upward move, At resistance.","Several candles trade within similar price ranges.","Later price action supports the message of the original candle.","The distance between the opening and closing prices."]',0,'The module explains “Bearish Engulfing Pattern” as follows: A bearish engulfing pattern generally involves: A bullish candle, Followed by a larger bearish candle whose body covers the previous body, After an upward move, At resistance.','Bearish Engulfing Pattern',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-19-lesson-07-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.20: Support and Resistance, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is support?

- What is resistance?

- Why do support and resistance form?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-20-lesson-07' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-20-lesson-07-quiz','cmf-module-2-20-lesson-07','Module 2.20: Support and Resistance: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-20-lesson-07');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-20-lesson-07-quiz-q01','cmf-module-2-20-lesson-07-quiz','Which explanation best matches “Psychological Levels” in this module?','["Prices that attract attention because they are simple or memorable.","Role reversal requires evidence and market acceptance.","Price moves through the level and continues trading beyond it.","A useful way to evaluate a level is to examine whether the market accepts or rejects prices beyond it."]',0,'The module explains “Psychological Levels” as follows: Prices that attract attention because they are simple or memorable.','Psychological Levels',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-20-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-20-lesson-07-quiz-q02','cmf-module-2-20-lesson-07-quiz','Which explanation best matches “A Previous All-Time High Must Become Support” in this module?','["Prices that attract attention because they are simple or memorable.","Price moves through the level and continues trading beyond it.","A useful way to evaluate a level is to examine whether the market accepts or rejects prices beyond it.","Role reversal requires evidence and market acceptance."]',3,'The module explains “A Previous All-Time High Must Become Support” as follows: Role reversal requires evidence and market acceptance.','A Previous All-Time High Must Become Support',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-20-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-20-lesson-07-quiz-q03','cmf-module-2-20-lesson-07-quiz','Which explanation best matches “Acceptance” in this module?','["Role reversal requires evidence and market acceptance.","A technical support break does not automatically mean a long-term project has failed.","Price moves through the level and continues trading beyond it.","Prices that attract attention because they are simple or memorable."]',2,'The module explains “Acceptance” as follows: Price moves through the level and continues trading beyond it.','Acceptance',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-20-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-20-lesson-07-quiz-q04','cmf-module-2-20-lesson-07-quiz','Which explanation best matches “Acceptance Versus Rejection” in this module?','["A technical support break does not automatically mean a long-term project has failed.","A useful way to evaluate a level is to examine whether the market accepts or rejects prices beyond it.","Prices that attract attention because they are simple or memorable.","Role reversal requires evidence and market acceptance."]',1,'The module explains “Acceptance Versus Rejection” as follows: A useful way to evaluate a level is to examine whether the market accepts or rejects prices beyond it.','Acceptance Versus Rejection',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-20-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-20-lesson-07-quiz-q05','cmf-module-2-20-lesson-07-quiz','Which explanation best matches “Broken Support and the Investment Thesis” in this module?','["A technical support break does not automatically mean a long-term project has failed.","Prices that attract attention because they are simple or memorable.","Price moves through the level and continues trading beyond it.","A useful way to evaluate a level is to examine whether the market accepts or rejects prices beyond it."]',0,'The module explains “Broken Support and the Investment Thesis” as follows: A technical support break does not automatically mean a long-term project has failed.','Broken Support and the Investment Thesis',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-20-lesson-07-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.21: Trends and Market Structure, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a market trend?

- What is a swing high?

- What is a swing low?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-21-lesson-07' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-21-lesson-07-quiz','cmf-module-2-21-lesson-07','Module 2.21: Trends and Market Structure: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-21-lesson-07');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-21-lesson-07-quiz-q01','cmf-module-2-21-lesson-07-quiz','Which explanation best matches “Absorption” in this module?','["Aggressive buying or selling is met by sufficient opposing liquidity to prevent further price movement.","The existing directional structure remains intact.","A trend-direction break may provide early evidence, but new opposite structure should develop.","Close back inside the previous structure"]',0,'The module explains “Absorption” as follows: Aggressive buying or selling is met by sufficient opposing liquidity to prevent further price movement.','Absorption',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-21-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-21-lesson-07-quiz-q02','cmf-module-2-21-lesson-07-quiz','Which explanation best matches “Trend Continuation” in this module?','["Aggressive buying or selling is met by sufficient opposing liquidity to prevent further price movement.","A trend-direction break may provide early evidence, but new opposite structure should develop.","Close back inside the previous structure","The existing directional structure remains intact."]',3,'The module explains “Trend Continuation” as follows: The existing directional structure remains intact.','Trend Continuation',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-21-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-21-lesson-07-quiz-q03','cmf-module-2-21-lesson-07-quiz','Which explanation best matches “A Break of Structure Confirms a Reversal” in this module?','["The existing directional structure remains intact.","Close back inside the previous structure","A trend-direction break may provide early evidence, but new opposite structure should develop.","Aggressive buying or selling is met by sufficient opposing liquidity to prevent further price movement."]',2,'The module explains “A Break of Structure Confirms a Reversal” as follows: A trend-direction break may provide early evidence, but new opposite structure should develop.','A Break of Structure Confirms a Reversal',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-21-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-21-lesson-07-quiz-q04','cmf-module-2-21-lesson-07-quiz','Which explanation best matches “Evidence Supporting a Sweep” in this module?','["A trend-direction break may provide early evidence, but new opposite structure should develop.","Close back inside the previous structure","Aggressive buying or selling is met by sufficient opposing liquidity to prevent further price movement.","The existing directional structure remains intact."]',1,'The module explains “Evidence Supporting a Sweep” as follows: Close back inside the previous structure','Evidence Supporting a Sweep',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-21-lesson-07-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-21-lesson-07-quiz-q05','cmf-module-2-21-lesson-07-quiz','Which explanation best matches “Higher High” in this module?','["A higher high forms when price rises above the previous important swing high.","Aggressive buying or selling is met by sufficient opposing liquidity to prevent further price movement.","The existing directional structure remains intact.","A trend-direction break may provide early evidence, but new opposite structure should develop."]',0,'The module explains “Higher High” as follows: A higher high forms when price rises above the previous important swing high.','Higher High',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-21-lesson-07-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.22: Trading Volume and Liquidity, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is trading volume?

- What is liquidity?

- How does volume differ from liquidity?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-22-lesson-08' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-22-lesson-08-quiz','cmf-module-2-22-lesson-08','Module 2.22: Trading Volume and Liquidity: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-22-lesson-08');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-22-lesson-08-quiz-q01','cmf-module-2-22-lesson-08-quiz','Which explanation best matches “Absorption” in this module?','["Aggressive orders are met by substantial opposing liquidity.","Buyers available when a holder wants to sell.","The volume of buy and sell orders available at different prices.","The same participant or coordinated accounts trade with one another to create artificial activity."]',0,'The module explains “Absorption” as follows: Aggressive orders are met by substantial opposing liquidity.','Absorption',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-22-lesson-08-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-22-lesson-08-quiz-q02','cmf-module-2-22-lesson-08-quiz','Which explanation best matches “Exit Liquidity” in this module?','["Aggressive orders are met by substantial opposing liquidity.","The volume of buy and sell orders available at different prices.","The same participant or coordinated accounts trade with one another to create artificial activity.","Buyers available when a holder wants to sell."]',3,'The module explains “Exit Liquidity” as follows: Buyers available when a holder wants to sell.','Exit Liquidity',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-22-lesson-08-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-22-lesson-08-quiz-q03','cmf-module-2-22-lesson-08-quiz','Which explanation best matches “Order-Book Depth” in this module?','["Buyers available when a holder wants to sell.","The same participant or coordinated accounts trade with one another to create artificial activity.","The volume of buy and sell orders available at different prices.","Aggressive orders are met by substantial opposing liquidity."]',2,'The module explains “Order-Book Depth” as follows: The volume of buy and sell orders available at different prices.','Order-Book Depth',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-22-lesson-08-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-22-lesson-08-quiz-q04','cmf-module-2-22-lesson-08-quiz','Which explanation best matches “Wash Trading” in this module?','["The volume of buy and sell orders available at different prices.","The same participant or coordinated accounts trade with one another to create artificial activity.","Aggressive orders are met by substantial opposing liquidity.","Buyers available when a holder wants to sell."]',1,'The module explains “Wash Trading” as follows: The same participant or coordinated accounts trade with one another to create artificial activity.','Wash Trading',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-22-lesson-08-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-22-lesson-08-quiz-q05','cmf-module-2-22-lesson-08-quiz','Which explanation best matches “A High-Market-Cap Asset Must Be Liquid” in this module?','["Market capitalisation and liquidity measure different things.","Aggressive orders are met by substantial opposing liquidity.","Buyers available when a holder wants to sell.","The volume of buy and sell orders available at different prices."]',0,'The module explains “A High-Market-Cap Asset Must Be Liquid” as follows: Market capitalisation and liquidity measure different things.','A High-Market-Cap Asset Must Be Liquid',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-22-lesson-08-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.23: Common Technical Indicators, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a technical indicator?

- What market information is commonly used to calculate indicators?

- What are the four main indicator categories?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-23-lesson-09' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-23-lesson-09-quiz','cmf-module-2-23-lesson-09','Module 2.23: Common Technical Indicators: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-23-lesson-09');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-23-lesson-09-quiz-q01','cmf-module-2-23-lesson-09-quiz','Which explanation best matches “Bollinger Bands” in this module?','["A volatility tool generally consisting of: A central moving average, An upper band, A lower band.","Several different forms of evidence support the same scenario.","A drawing tool rather than a conventional mathematical indicator applied automatically to each candle.","May support a bullish directional interpretation."]',0,'The module explains “Bollinger Bands” as follows: A volatility tool generally consisting of: A central moving average, An upper band, A lower band.','Bollinger Bands',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-23-lesson-09-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-23-lesson-09-quiz-q02','cmf-module-2-23-lesson-09-quiz','Which explanation best matches “Confluence” in this module?','["A volatility tool generally consisting of: A central moving average, An upper band, A lower band.","A drawing tool rather than a conventional mathematical indicator applied automatically to each candle.","May support a bullish directional interpretation.","Several different forms of evidence support the same scenario."]',3,'The module explains “Confluence” as follows: Several different forms of evidence support the same scenario.','Confluence',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-23-lesson-09-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-23-lesson-09-quiz-q03','cmf-module-2-23-lesson-09-quiz','Which explanation best matches “Fibonacci Retracement” in this module?','["Several different forms of evidence support the same scenario.","May support a bullish directional interpretation.","A drawing tool rather than a conventional mathematical indicator applied automatically to each candle.","A volatility tool generally consisting of: A central moving average, An upper band, A lower band."]',2,'The module explains “Fibonacci Retracement” as follows: A drawing tool rather than a conventional mathematical indicator applied automatically to each candle.','Fibonacci Retracement',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-23-lesson-09-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-23-lesson-09-quiz-q04','cmf-module-2-23-lesson-09-quiz','Which explanation best matches “+DI Above −DI” in this module?','["A drawing tool rather than a conventional mathematical indicator applied automatically to each candle.","May support a bullish directional interpretation.","A volatility tool generally consisting of: A central moving average, An upper band, A lower band.","Several different forms of evidence support the same scenario."]',1,'The module explains “+DI Above −DI” as follows: May support a bullish directional interpretation.','+DI Above −DI',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-23-lesson-09-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-23-lesson-09-quiz-q05','cmf-module-2-23-lesson-09-quiz','Which explanation best matches “Acting Before the Candle Closes” in this module?','["The signal disappears before completion.","A volatility tool generally consisting of: A central moving average, An upper band, A lower band.","Several different forms of evidence support the same scenario.","A drawing tool rather than a conventional mathematical indicator applied automatically to each candle."]',0,'The module explains “Acting Before the Candle Closes” as follows: The signal disappears before completion.','Acting Before the Candle Closes',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-23-lesson-09-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.24: Introduction to Decentralised Finance, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is decentralised finance?

- How does DeFi differ from centralised finance?

- What role does a blockchain play in a DeFi protocol?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-24-lesson-10' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-24-lesson-10-quiz','cmf-module-2-24-lesson-10','Module 2.24: Introduction to Decentralised Finance: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-24-lesson-10');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-24-lesson-10-quiz-q01','cmf-module-2-24-lesson-10-quiz','Which explanation best matches “Composability” in this module?','["The ability of DeFi protocols to connect and interact with one another.","A borrower’s collateral position no longer satisfies the protocol’s risk requirements.","The possibility that software fails or is exploited.","Token-price decline, inflation, fees and losses may outweigh the rewards."]',0,'The module explains “Composability” as follows: The ability of DeFi protocols to connect and interact with one another.','Composability',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-24-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-24-lesson-10-quiz-q02','cmf-module-2-24-lesson-10-quiz','Which explanation best matches “Liquidation” in this module?','["The ability of DeFi protocols to connect and interact with one another.","The possibility that software fails or is exploited.","Token-price decline, inflation, fees and losses may outweigh the rewards.","A borrower’s collateral position no longer satisfies the protocol’s risk requirements."]',3,'The module explains “Liquidation” as follows: A borrower’s collateral position no longer satisfies the protocol’s risk requirements.','Liquidation',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-24-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-24-lesson-10-quiz-q03','cmf-module-2-24-lesson-10-quiz','Which explanation best matches “Smart Contract Risk” in this module?','["A borrower’s collateral position no longer satisfies the protocol’s risk requirements.","Token-price decline, inflation, fees and losses may outweigh the rewards.","The possibility that software fails or is exploited.","The ability of DeFi protocols to connect and interact with one another."]',2,'The module explains “Smart Contract Risk” as follows: The possibility that software fails or is exploited.','Smart Contract Risk',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-24-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-24-lesson-10-quiz-q04','cmf-module-2-24-lesson-10-quiz','Which explanation best matches “A High APY Means a High Return” in this module?','["The possibility that software fails or is exploited.","Token-price decline, inflation, fees and losses may outweigh the rewards.","The ability of DeFi protocols to connect and interact with one another.","A borrower’s collateral position no longer satisfies the protocol’s risk requirements."]',1,'The module explains “A High APY Means a High Return” as follows: Token-price decline, inflation, fees and losses may outweigh the rewards.','A High APY Means a High Return',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-24-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-24-lesson-10-quiz-q05','cmf-module-2-24-lesson-10-quiz','Which explanation best matches “Accessibility” in this module?','["Users may interact globally through a wallet and internet connection.","The ability of DeFi protocols to connect and interact with one another.","A borrower’s collateral position no longer satisfies the protocol’s risk requirements.","The possibility that software fails or is exploited."]',0,'The module explains “Accessibility” as follows: Users may interact globally through a wallet and internet connection.','Accessibility',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-24-lesson-10-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.25: Decentralised Exchanges, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a decentralised exchange?

- How does a DEX differ from a centralised exchange?

- What role does a self-custodial wallet play in DEX trading?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-25-lesson-10' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-25-lesson-10-quiz','cmf-module-2-25-lesson-10','Module 2.25: Decentralised Exchanges: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-25-lesson-10');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-25-lesson-10-quiz-q01','cmf-module-2-25-lesson-10-quiz','Which explanation best matches “DEX Volume” in this module?','["The value of trades executed through the protocol.","Another participant detects a pending transaction and submits a competing transaction intended to execute first.","The change in the exchange rate caused by the trade itself.","If a trader buys Asset A from the pool: The quantity of Asset A decreases, The quantity of Asset B increases, Asset A becomes more expensive within the pool."]',0,'The module explains “DEX Volume” as follows: The value of trades executed through the protocol.','DEX Volume',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-25-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-25-lesson-10-quiz-q02','cmf-module-2-25-lesson-10-quiz','Which explanation best matches “Front-Running” in this module?','["The value of trades executed through the protocol.","The change in the exchange rate caused by the trade itself.","If a trader buys Asset A from the pool: The quantity of Asset A decreases, The quantity of Asset B increases, Asset A becomes more expensive within the pool.","Another participant detects a pending transaction and submits a competing transaction intended to execute first."]',3,'The module explains “Front-Running” as follows: Another participant detects a pending transaction and submits a competing transaction intended to execute first.','Front-Running',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-25-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-25-lesson-10-quiz-q03','cmf-module-2-25-lesson-10-quiz','Which explanation best matches “Price Impact” in this module?','["Another participant detects a pending transaction and submits a competing transaction intended to execute first.","If a trader buys Asset A from the pool: The quantity of Asset A decreases, The quantity of Asset B increases, Asset A becomes more expensive within the pool.","The change in the exchange rate caused by the trade itself.","The value of trades executed through the protocol."]',2,'The module explains “Price Impact” as follows: The change in the exchange rate caused by the trade itself.','Price Impact',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-25-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-25-lesson-10-quiz-q04','cmf-module-2-25-lesson-10-quiz','Which explanation best matches “1 Asset A = 100 Asset B” in this module?','["The change in the exchange rate caused by the trade itself.","If a trader buys Asset A from the pool: The quantity of Asset A decreases, The quantity of Asset B increases, Asset A becomes more expensive within the pool.","The value of trades executed through the protocol.","Another participant detects a pending transaction and submits a competing transaction intended to execute first."]',1,'The module explains “1 Asset A = 100 Asset B” as follows: If a trader buys Asset A from the pool: The quantity of Asset A decreases, The quantity of Asset B increases, Asset A becomes more expensive within the pool.','1 Asset A = 100 Asset B',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-25-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-25-lesson-10-quiz-q05','cmf-module-2-25-lesson-10-quiz','Which explanation best matches “A Decentralised Exchange Is Outside Regulation” in this module?','["Users, developers and front-end operators may still have legal obligations.","The value of trades executed through the protocol.","Another participant detects a pending transaction and submits a competing transaction intended to execute first.","The change in the exchange rate caused by the trade itself."]',0,'The module explains “A Decentralised Exchange Is Outside Regulation” as follows: Users, developers and front-end operators may still have legal obligations.','A Decentralised Exchange Is Outside Regulation',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-25-lesson-10-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.26: Liquidity Pools and Automated Market Makers, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a liquidity pool?

- What is an automated market maker?

- What does the formula x × y = k represent?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-26-lesson-11' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-26-lesson-11-quiz','cmf-module-2-26-lesson-11','Module 2.26: Liquidity Pools and Automated Market Makers: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-26-lesson-11');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-26-lesson-11-quiz-q01','cmf-module-2-26-lesson-11-quiz','Which explanation best matches “Mercenary Liquidity” in this module?','["Capital that moves between protocols primarily to capture the highest incentives.","The change in the pool’s exchange rate caused directly by a trade.","The higher yield may compensate for greater risk, inflation or instability.","Later, Asset A rises from 100 to 400 units."]',0,'The module explains “Mercenary Liquidity” as follows: Capital that moves between protocols primarily to capture the highest incentives.','Mercenary Liquidity',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-26-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-26-lesson-11-quiz-q02','cmf-module-2-26-lesson-11-quiz','Which explanation best matches “Price Impact” in this module?','["Capital that moves between protocols primarily to capture the highest incentives.","The higher yield may compensate for greater risk, inflation or instability.","Later, Asset A rises from 100 to 400 units.","The change in the pool’s exchange rate caused directly by a trade."]',3,'The module explains “Price Impact” as follows: The change in the pool’s exchange rate caused directly by a trade.','Price Impact',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-26-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-26-lesson-11-quiz-q03','cmf-module-2-26-lesson-11-quiz','Which explanation best matches “A Higher APY Means a Better Pool” in this module?','["The change in the pool’s exchange rate caused directly by a trade.","Later, Asset A rises from 100 to 400 units.","The higher yield may compensate for greater risk, inflation or instability.","Capital that moves between protocols primarily to capture the highest incentives."]',2,'The module explains “A Higher APY Means a Better Pool” as follows: The higher yield may compensate for greater risk, inflation or instability.','A Higher APY Means a Better Pool',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-26-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-26-lesson-11-quiz-q04','cmf-module-2-26-lesson-11-quiz','Which explanation best matches “A Simplified Impermanent-Loss Example” in this module?','["The higher yield may compensate for greater risk, inflation or instability.","Later, Asset A rises from 100 to 400 units.","Capital that moves between protocols primarily to capture the highest incentives.","The change in the pool’s exchange rate caused directly by a trade."]',1,'The module explains “A Simplified Impermanent-Loss Example” as follows: Later, Asset A rises from 100 to 400 units.','A Simplified Impermanent-Loss Example',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-26-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-26-lesson-11-quiz-q05','cmf-module-2-26-lesson-11-quiz','Which explanation best matches “A Stablecoin Depegs” in this module?','["The pool may become dominated by the weaker stablecoin.","Capital that moves between protocols primarily to capture the highest incentives.","The change in the pool’s exchange rate caused directly by a trade.","The higher yield may compensate for greater risk, inflation or instability."]',0,'The module explains “A Stablecoin Depegs” as follows: The pool may become dominated by the weaker stablecoin.','A Stablecoin Depegs',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-26-lesson-11-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.27: Staking and Yield Generation, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is staking?

- How does proof of stake use committed capital to secure a network?

- What is a validator?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-27-lesson-12' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-27-lesson-12-quiz','cmf-module-2-27-lesson-12','Module 2.27: Staking and Yield Generation: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-27-lesson-12');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-27-lesson-12-quiz-q01','cmf-module-2-27-lesson-12-quiz','Which explanation best matches “Custodial Staking” in this module?','["A centralised provider stakes assets on behalf of customers.","The value placed at risk by participants who must follow the protocol’s rules.","A leveraged strategy in which an asset is repeatedly deposited and borrowed.","A protocol penalty that removes part of a validator’s stake for prohibited or harmful behaviour."]',0,'The module explains “Custodial Staking” as follows: A centralised provider stakes assets on behalf of customers.','Custodial Staking',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-27-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-27-lesson-12-quiz-q02','cmf-module-2-27-lesson-12-quiz','Which explanation best matches “Economic Security” in this module?','["A centralised provider stakes assets on behalf of customers.","A leveraged strategy in which an asset is repeatedly deposited and borrowed.","Native staking occurs through the blockchain’s own consensus mechanism.","The value placed at risk by participants who must follow the protocol’s rules."]',3,'The module explains “Economic Security” as follows: The value placed at risk by participants who must follow the protocol’s rules.','Economic Security',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-27-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-27-lesson-12-quiz-q03','cmf-module-2-27-lesson-12-quiz','Which explanation best matches “Looping” in this module?','["The value placed at risk by participants who must follow the protocol’s rules.","Native staking occurs through the blockchain’s own consensus mechanism.","A leveraged strategy in which an asset is repeatedly deposited and borrowed.","A centralised provider stakes assets on behalf of customers."]',2,'The module explains “Looping” as follows: A leveraged strategy in which an asset is repeatedly deposited and borrowed.','Looping',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-27-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-27-lesson-12-quiz-q04','cmf-module-2-27-lesson-12-quiz','Which explanation best matches “Native Staking” in this module?','["A protocol penalty that removes part of a validator’s stake for prohibited or harmful behaviour.","Native staking occurs through the blockchain’s own consensus mechanism.","The value placed at risk by participants who must follow the protocol’s rules.","A leveraged strategy in which an asset is repeatedly deposited and borrowed."]',1,'The module explains “Native Staking” as follows: Native staking occurs through the blockchain’s own consensus mechanism.','Native Staking',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-27-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-27-lesson-12-quiz-q05','cmf-module-2-27-lesson-12-quiz','Which explanation best matches “Slashing” in this module?','["A protocol penalty that removes part of a validator’s stake for prohibited or harmful behaviour.","A centralised provider stakes assets on behalf of customers.","The value placed at risk by participants who must follow the protocol’s rules.","A leveraged strategy in which an asset is repeatedly deposited and borrowed."]',0,'The module explains “Slashing” as follows: A protocol penalty that removes part of a validator’s stake for prohibited or harmful behaviour.','Slashing',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-27-lesson-12-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.28: Lending and Borrowing Protocols, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is cryptocurrency lending?

- How does centralised lending differ from decentralised lending?

- Why are most permissionless DeFi loans overcollateralised?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-28-lesson-13' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-28-lesson-13-quiz','cmf-module-2-28-lesson-13','Module 2.28: Lending and Borrowing Protocols: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-28-lesson-13');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-28-lesson-13-quiz-q01','cmf-module-2-28-lesson-13-quiz','Which explanation best matches “Bad Debt” in this module?','["The value recovered from collateral is insufficient to repay the borrower’s debt fully.","One user allows another user to borrow against their supplied capital or credit line.","Lenders expect short-term access while borrowers use funds for longer or less liquid activities.","Borrowing costs rise above the yield earned."]',0,'The module explains “Bad Debt” as follows: The value recovered from collateral is insufficient to repay the borrower’s debt fully.','Bad Debt',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-28-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-28-lesson-13-quiz-q02','cmf-module-2-28-lesson-13-quiz','Which explanation best matches “Credit Delegation” in this module?','["The value recovered from collateral is insufficient to repay the borrower’s debt fully.","Lenders expect short-term access while borrowers use funds for longer or less liquid activities.","Borrowing costs rise above the yield earned.","One user allows another user to borrow against their supplied capital or credit line."]',3,'The module explains “Credit Delegation” as follows: One user allows another user to borrow against their supplied capital or credit line.','Credit Delegation',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-28-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-28-lesson-13-quiz-q03','cmf-module-2-28-lesson-13-quiz','Which explanation best matches “Liquidity Mismatch” in this module?','["One user allows another user to borrow against their supplied capital or credit line.","Borrowing costs rise above the yield earned.","Lenders expect short-term access while borrowers use funds for longer or less liquid activities.","The value recovered from collateral is insufficient to repay the borrower’s debt fully."]',2,'The module explains “Liquidity Mismatch” as follows: Lenders expect short-term access while borrowers use funds for longer or less liquid activities.','Liquidity Mismatch',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-28-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-28-lesson-13-quiz-q04','cmf-module-2-28-lesson-13-quiz','Which explanation best matches “Rate Inversion” in this module?','["Lenders expect short-term access while borrowers use funds for longer or less liquid activities.","Borrowing costs rise above the yield earned.","The value recovered from collateral is insufficient to repay the borrower’s debt fully.","One user allows another user to borrow against their supplied capital or credit line."]',1,'The module explains “Rate Inversion” as follows: Borrowing costs rise above the yield earned.','Rate Inversion',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-28-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-28-lesson-13-quiz-q05','cmf-module-2-28-lesson-13-quiz','Which explanation best matches “A Borrowing Stress Test” in this module?','["Before borrowing, model several scenarios.","The value recovered from collateral is insufficient to repay the borrower’s debt fully.","One user allows another user to borrow against their supplied capital or credit line.","Lenders expect short-term access while borrowers use funds for longer or less liquid activities."]',0,'The module explains “A Borrowing Stress Test” as follows: Before borrowing, model several scenarios.','A Borrowing Stress Test',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-28-lesson-13-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.29: Layer 1 and Layer 2 Networks, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a Layer 1 blockchain?

- Which core functions may a Layer 1 provide?

- What is blockchain execution?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-29-lesson-14' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-29-lesson-14-quiz','cmf-module-2-29-lesson-14','Module 2.29: Layer 1 and Layer 2 Networks: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-29-lesson-14');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-29-lesson-14-quiz-q01','cmf-module-2-29-lesson-14-quiz','Which explanation best matches “Block Space” in this module?','["The limited capacity available for transactions and data within a blockchain block.","The ability of applications and smart contracts to interact.","A family of scaling designs using child chains and Layer 1 exit mechanisms.","A transaction signed for one chain can be valid on another related chain."]',0,'The module explains “Block Space” as follows: The limited capacity available for transactions and data within a blockchain block.','Block Space',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-29-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-29-lesson-14-quiz-q02','cmf-module-2-29-lesson-14-quiz','Which explanation best matches “Composability” in this module?','["The limited capacity available for transactions and data within a blockchain block.","A family of scaling designs using child chains and Layer 1 exit mechanisms.","A transaction signed for one chain can be valid on another related chain.","The ability of applications and smart contracts to interact."]',3,'The module explains “Composability” as follows: The ability of applications and smart contracts to interact.','Composability',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-29-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-29-lesson-14-quiz-q03','cmf-module-2-29-lesson-14-quiz','Which explanation best matches “Plasma” in this module?','["The ability of applications and smart contracts to interact.","A transaction signed for one chain can be valid on another related chain.","A family of scaling designs using child chains and Layer 1 exit mechanisms.","The limited capacity available for transactions and data within a blockchain block."]',2,'The module explains “Plasma” as follows: A family of scaling designs using child chains and Layer 1 exit mechanisms.','Plasma',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-29-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-29-lesson-14-quiz-q04','cmf-module-2-29-lesson-14-quiz','Which explanation best matches “Replay Risk” in this module?','["A family of scaling designs using child chains and Layer 1 exit mechanisms.","A transaction signed for one chain can be valid on another related chain.","The limited capacity available for transactions and data within a blockchain block.","The ability of applications and smart contracts to interact."]',1,'The module explains “Replay Risk” as follows: A transaction signed for one chain can be valid on another related chain.','Replay Risk',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-29-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-29-lesson-14-quiz-q05','cmf-module-2-29-lesson-14-quiz','Which explanation best matches “A Sidechain Is Simply Another Type of Rollup” in this module?','["A sidechain generally relies on its own consensus rather than Layer 1 verification.","The limited capacity available for transactions and data within a blockchain block.","The ability of applications and smart contracts to interact.","A family of scaling designs using child chains and Layer 1 exit mechanisms."]',0,'The module explains “A Sidechain Is Simply Another Type of Rollup” as follows: A sidechain generally relies on its own consensus rather than Layer 1 verification.','A Sidechain Is Simply Another Type of Rollup',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-29-lesson-14-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 2.30: Personal Digital Asset Investment Framework, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a personal digital asset investment framework?

- How does a framework differ from a market prediction?

- Why should broader personal finances be reviewed before investing?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-2-30-lesson-12' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-30-lesson-12-quiz','cmf-module-2-30-lesson-12','Module 2.30: Personal Digital Asset Investment Framework: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-30-lesson-12');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-30-lesson-12-quiz-q01','cmf-module-2-30-lesson-12-quiz','Which explanation best matches “Anchoring” in this module?','["One number influences judgement excessively.","The financial ability to absorb loss.","Why the digital asset portfolio exists.","Cooling-off periods, social-media rules and leverage restrictions."]',0,'The module explains “Anchoring” as follows: One number influences judgement excessively.','Anchoring',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-30-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-30-lesson-12-quiz-q02','cmf-module-2-30-lesson-12-quiz','Which explanation best matches “Risk Capacity” in this module?','["One number influences judgement excessively.","Why the digital asset portfolio exists.","Cooling-off periods, social-media rules and leverage restrictions.","The financial ability to absorb loss."]',3,'The module explains “Risk Capacity” as follows: The financial ability to absorb loss.','Risk Capacity',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-30-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-30-lesson-12-quiz-q03','cmf-module-2-30-lesson-12-quiz','Which explanation best matches “1. Purpose” in this module?','["The financial ability to absorb loss.","Cooling-off periods, social-media rules and leverage restrictions.","Why the digital asset portfolio exists.","One number influences judgement excessively."]',2,'The module explains “1. Purpose” as follows: Why the digital asset portfolio exists.','1. Purpose',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-30-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-30-lesson-12-quiz-q04','cmf-module-2-30-lesson-12-quiz','Which explanation best matches “12. Behavioural Controls” in this module?','["Why the digital asset portfolio exists.","Cooling-off periods, social-media rules and leverage restrictions.","One number influences judgement excessively.","The financial ability to absorb loss."]',1,'The module explains “12. Behavioural Controls” as follows: Cooling-off periods, social-media rules and leverage restrictions.','12. Behavioural Controls',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-30-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-30-lesson-12-quiz-q05','cmf-module-2-30-lesson-12-quiz','Which explanation best matches “A Falling Price Means I Should Buy More” in this module?','["The decline may reflect permanent deterioration.","One number influences judgement excessively.","The financial ability to absorb loss.","Why the digital asset portfolio exists."]',0,'The module explains “A Falling Price Means I Should Buy More” as follows: The decline may reflect permanent deterioration.','A Falling Price Means I Should Buy More',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-30-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,`video_key`,`primary_asset_id`,`intro_asset_id`,`duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,`transcript`,`experience_json`,`position`,`updated_at`) SELECT 'cmf-module-2-31-lesson-02','cognizen-crypto-mastery-foundations-production','Apply and check your understanding','cmf-module-2-31','quiz','## Your outcome

Retrieve and apply the key ideas from Module 2.31: Completion Crypto Mastery  Markets and Applications, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- State the module''s central decision or analytical principle in your own words.

- Identify one assumption, limitation or risk that could change the conclusion.

- Name one practical situation in which you would apply the module.

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.','markdown',NULL,NULL,NULL,6,0,0,0,'','',2,1785384000000 WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-2-31-lesson-02-quiz','cmf-module-2-31-lesson-02','Module 2.31: Completion Crypto Mastery  Markets and Applications: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-2-31-lesson-02');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-31-lesson-02-quiz-q01','cmf-module-2-31-lesson-02-quiz','Which explanation best matches “Retail Participants” in this course?','["Individuals buying, selling or holding cryptocurrency using personal capital.","A volatility tool generally consisting of: A central moving average, An upper band, A lower band.","Adding to a position as the market moves in the expected direction.","The investor’s emotional willingness to experience uncertainty and loss."]',0,'The module explains “Retail Participants” as follows: Individuals buying, selling or holding cryptocurrency using personal capital.','Retail Participants',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-31-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-31-lesson-02-quiz-q02','cmf-module-2-31-lesson-02-quiz','Which explanation best matches “Roadmap Inflation” in this course?','["A volatility tool generally consisting of: A central moving average, An upper band, A lower band.","Adding to a position as the market moves in the expected direction.","Individuals buying, selling or holding cryptocurrency using personal capital.","A project lists a large number of ambitious features to create excitement."]',3,'The module explains “Roadmap Inflation” as follows: A project lists a large number of ambitious features to create excitement.','Roadmap Inflation',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-31-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-31-lesson-02-quiz-q03','cmf-module-2-31-lesson-02-quiz','Which explanation best matches “Pyramiding” in this course?','["Individuals buying, selling or holding cryptocurrency using personal capital.","The investor’s emotional willingness to experience uncertainty and loss.","Adding to a position as the market moves in the expected direction.","A volatility tool generally consisting of: A central moving average, An upper band, A lower band."]',2,'The module explains “Pyramiding” as follows: Adding to a position as the market moves in the expected direction.','Pyramiding',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-31-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-31-lesson-02-quiz-q04','cmf-module-2-31-lesson-02-quiz','Which explanation best matches “Bollinger Bands” in this course?','["The investor’s emotional willingness to experience uncertainty and loss.","A volatility tool generally consisting of: A central moving average, An upper band, A lower band.","Adding to a position as the market moves in the expected direction.","Individuals buying, selling or holding cryptocurrency using personal capital."]',1,'The module explains “Bollinger Bands” as follows: A volatility tool generally consisting of: A central moving average, An upper band, A lower band.','Bollinger Bands',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-31-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-2-31-lesson-02-quiz-q05','cmf-module-2-31-lesson-02-quiz','Which explanation best matches “Risk Tolerance” in this course?','["The investor’s emotional willingness to experience uncertainty and loss.","A volatility tool generally consisting of: A central moving average, An upper band, A lower band.","Adding to a position as the market moves in the expected direction.","Individuals buying, selling or holding cryptocurrency using personal capital."]',0,'The module explains “Risk Tolerance” as follows: The investor’s emotional willingness to experience uncertainty and loss.','Risk Tolerance',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-2-31-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,`video_key`,`primary_asset_id`,`intro_asset_id`,`duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,`transcript`,`experience_json`,`position`,`updated_at`) SELECT 'cmf-module-3-00-lesson-02','cognizen-crypto-mastery-foundations-production','Apply and check your understanding','cmf-module-3-00','quiz','## Your outcome

Retrieve and apply the key ideas from Start here: Welcome to Advanced Digital Asset Strategy, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- State the module''s central decision or analytical principle in your own words.

- Identify one assumption, limitation or risk that could change the conclusion.

- Name one practical situation in which you would apply the module.

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.','markdown',NULL,NULL,NULL,6,0,0,0,'','',2,1785384000000 WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-00-lesson-02-quiz','cmf-module-3-00-lesson-02','Start here: Welcome to Advanced Digital Asset Strategy: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-00-lesson-02');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-00-lesson-02-quiz-q01','cmf-module-3-00-lesson-02-quiz','Which explanation best matches “Integrated evidence” in this module?','["Compare different sources of evidence rather than relying on one chart, one indicator or one market opinion.","Use leverage control, position sizing, drawdown management and preservation of capital as central disciplines.","Understand the complete risk structure behind a decision and determine whether the potential return justifies that risk.","Question confident predictions, examine assumptions and avoid allowing excitement or fear to replace disciplined analysis."]',0,'The module explains “Integrated evidence” as follows: Compare different sources of evidence rather than relying on one chart, one indicator or one market opinion.','Integrated evidence',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-00-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-00-lesson-02-quiz-q02','cmf-module-3-00-lesson-02-quiz','Which explanation best matches “Capital preservation” in this module?','["Compare different sources of evidence rather than relying on one chart, one indicator or one market opinion.","Understand the complete risk structure behind a decision and determine whether the potential return justifies that risk.","Question confident predictions, examine assumptions and avoid allowing excitement or fear to replace disciplined analysis.","Use leverage control, position sizing, drawdown management and preservation of capital as central disciplines."]',3,'The module explains “Capital preservation” as follows: Use leverage control, position sizing, drawdown management and preservation of capital as central disciplines.','Capital preservation',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-00-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-00-lesson-02-quiz-q03','cmf-module-3-00-lesson-02-quiz','Which explanation best matches “Advanced strategy” in this module?','["Use leverage control, position sizing, drawdown management and preservation of capital as central disciplines.","Question confident predictions, examine assumptions and avoid allowing excitement or fear to replace disciplined analysis.","Understand the complete risk structure behind a decision and determine whether the potential return justifies that risk.","Compare different sources of evidence rather than relying on one chart, one indicator or one market opinion."]',2,'The module explains “Advanced strategy” as follows: Understand the complete risk structure behind a decision and determine whether the potential return justifies that risk.','Advanced strategy',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-00-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-00-lesson-02-quiz-q04','cmf-module-3-00-lesson-02-quiz','Which explanation best matches “Independent analysis” in this module?','["Understand the complete risk structure behind a decision and determine whether the potential return justifies that risk.","Question confident predictions, examine assumptions and avoid allowing excitement or fear to replace disciplined analysis.","Compare different sources of evidence rather than relying on one chart, one indicator or one market opinion.","Use leverage control, position sizing, drawdown management and preservation of capital as central disciplines."]',1,'The module explains “Independent analysis” as follows: Question confident predictions, examine assumptions and avoid allowing excitement or fear to replace disciplined analysis.','Independent analysis',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-00-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-00-lesson-02-quiz-q05','cmf-module-3-00-lesson-02-quiz','Which explanation best matches “Managing uncertainty” in this module?','["Create realistic scenarios, identify important risks, determine what evidence matters, control exposure and respond when conditions change.","Compare different sources of evidence rather than relying on one chart, one indicator or one market opinion.","Use leverage control, position sizing, drawdown management and preservation of capital as central disciplines.","Understand the complete risk structure behind a decision and determine whether the potential return justifies that risk."]',0,'The module explains “Managing uncertainty” as follows: Create realistic scenarios, identify important risks, determine what evidence matters, control exposure and respond when conditions change.','Managing uncertainty',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-00-lesson-02-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.1: Advanced Trend-Following Strategy, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is trend following?

- How does trend following differ from forecasting?

- Why are trend-following entries usually delayed?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-01-lesson-11' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-01-lesson-11-quiz','cmf-module-3-01-lesson-11','Module 3.1: Advanced Trend-Following Strategy: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-01-lesson-11');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-01-lesson-11-quiz-q01','cmf-module-3-01-lesson-11-quiz','Which explanation best matches “Look-Ahead Bias” in this module?','["The test uses information that would not have been available at the time of the decision.","The largest decline from a previous portfolio peak to a later trough.","The total planned risk across open positions.","A return distribution containing: Many small losses, Some modest gains, A few very large gains, Taking profits too early."]',0,'The module explains “Look-Ahead Bias” as follows: The test uses information that would not have been available at the time of the decision.','Look-Ahead Bias',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-01-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-01-lesson-11-quiz-q02','cmf-module-3-01-lesson-11-quiz','Which explanation best matches “Maximum Drawdown” in this module?','["The test uses information that would not have been available at the time of the decision.","The total planned risk across open positions.","A return distribution containing: Many small losses, Some modest gains, A few very large gains, Taking profits too early.","The largest decline from a previous portfolio peak to a later trough."]',3,'The module explains “Maximum Drawdown” as follows: The largest decline from a previous portfolio peak to a later trough.','Maximum Drawdown',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-01-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-01-lesson-11-quiz-q03','cmf-module-3-01-lesson-11-quiz','Which explanation best matches “Portfolio Heat” in this module?','["The largest decline from a previous portfolio peak to a later trough.","A return distribution containing: Many small losses, Some modest gains, A few very large gains, Taking profits too early.","The total planned risk across open positions.","The test uses information that would not have been available at the time of the decision."]',2,'The module explains “Portfolio Heat” as follows: The total planned risk across open positions.','Portfolio Heat',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-01-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-01-lesson-11-quiz-q04','cmf-module-3-01-lesson-11-quiz','Which explanation best matches “Positive Skew” in this module?','["The total planned risk across open positions.","A return distribution containing: Many small losses, Some modest gains, A few very large gains, Taking profits too early.","The test uses information that would not have been available at the time of the decision.","The largest decline from a previous portfolio peak to a later trough."]',1,'The module explains “Positive Skew” as follows: A return distribution containing: Many small losses, Some modest gains, A few very large gains, Taking profits too early.','Positive Skew',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-01-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-01-lesson-11-quiz-q05','cmf-module-3-01-lesson-11-quiz','Which explanation best matches “Trend Continuation” in this module?','["Price resumes movement in the established direction after a pause or correction.","The test uses information that would not have been available at the time of the decision.","The largest decline from a previous portfolio peak to a later trough.","The total planned risk across open positions."]',0,'The module explains “Trend Continuation” as follows: Price resumes movement in the established direction after a pause or correction.','Trend Continuation',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-01-lesson-11-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.2: .  Mean-Reversion Strategy, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is mean reversion?

- What can be used as a market mean?

- Why is a mean not necessarily fixed?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-02-lesson-14' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-02-lesson-14-quiz','cmf-module-3-02-lesson-14','Module 3.2: .  Mean-Reversion Strategy: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-02-lesson-14');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-02-lesson-14-quiz-q01','cmf-module-3-02-lesson-14-quiz','Which explanation best matches “Leverage” in this module?','["Especially dangerous in mean reversion because the strategy intentionally enters against recent movement.","A return pattern containing: Many small gains, Occasional large losses, Stops are too wide, Losses are averaged into.","A relative-value strategy involving two related assets.","How dispersed values are around an average."]',0,'The module explains “Leverage” as follows: Especially dangerous in mean reversion because the strategy intentionally enters against recent movement.','Leverage',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-02-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-02-lesson-14-quiz-q02','cmf-module-3-02-lesson-14-quiz','Which explanation best matches “Negative Skew” in this module?','["Especially dangerous in mean reversion because the strategy intentionally enters against recent movement.","A relative-value strategy involving two related assets.","How dispersed values are around an average.","A return pattern containing: Many small gains, Occasional large losses, Stops are too wide, Losses are averaged into."]',3,'The module explains “Negative Skew” as follows: A return pattern containing: Many small gains, Occasional large losses, Stops are too wide, Losses are averaged into.','Negative Skew',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-02-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-02-lesson-14-quiz-q03','cmf-module-3-02-lesson-14-quiz','Which explanation best matches “Pairs Trading” in this module?','["A return pattern containing: Many small gains, Occasional large losses, Stops are too wide, Losses are averaged into.","How dispersed values are around an average.","A relative-value strategy involving two related assets.","Especially dangerous in mean reversion because the strategy intentionally enters against recent movement."]',2,'The module explains “Pairs Trading” as follows: A relative-value strategy involving two related assets.','Pairs Trading',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-02-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-02-lesson-14-quiz-q04','cmf-module-3-02-lesson-14-quiz','Which explanation best matches “Standard Deviation” in this module?','["A relative-value strategy involving two related assets.","How dispersed values are around an average.","Especially dangerous in mean reversion because the strategy intentionally enters against recent movement.","A return pattern containing: Many small gains, Occasional large losses, Stops are too wide, Losses are averaged into."]',1,'The module explains “Standard Deviation” as follows: How dispersed values are around an average.','Standard Deviation',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-02-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-02-lesson-14-quiz-q05','cmf-module-3-02-lesson-14-quiz','Which explanation best matches “Statistical Arbitrage” in this module?','["Quantitative relationships to identify temporary mispricing across one or more assets.","Especially dangerous in mean reversion because the strategy intentionally enters against recent movement.","A return pattern containing: Many small gains, Occasional large losses, Stops are too wide, Losses are averaged into.","A relative-value strategy involving two related assets."]',0,'The module explains “Statistical Arbitrage” as follows: Quantitative relationships to identify temporary mispricing across one or more assets.','Statistical Arbitrage',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-02-lesson-14-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.3: Breakout and Momentum Strategy, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a breakout?

- What is a breakdown?

- How does momentum differ from a structural breakout?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-03-lesson-13' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-03-lesson-13-quiz','cmf-module-3-03-lesson-13','Module 3.3: Breakout and Momentum Strategy: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-03-lesson-13');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-03-lesson-13-quiz-q01','cmf-module-3-03-lesson-13-quiz','Which explanation best matches “Flags and Pennants” in this module?','["Short consolidations that occur after strong movement.","That price moves beyond an established level and continues to trade there.","How widely participation is distributed.","The total value or number of outstanding derivative positions."]',0,'The module explains “Flags and Pennants” as follows: Short consolidations that occur after strong movement.','Flags and Pennants',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-03-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-03-lesson-13-quiz-q02','cmf-module-3-03-lesson-13-quiz','Which explanation best matches “Market Acceptance” in this module?','["Short consolidations that occur after strong movement.","The total value or number of outstanding derivative positions.","The market must demonstrate acceptance and follow-through.","That price moves beyond an established level and continues to trade there."]',3,'The module explains “Market Acceptance” as follows: That price moves beyond an established level and continues to trade there.','Market Acceptance',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-03-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-03-lesson-13-quiz-q03','cmf-module-3-03-lesson-13-quiz','Which explanation best matches “Market Breadth” in this module?','["The total value or number of outstanding derivative positions.","The market must demonstrate acceptance and follow-through.","How widely participation is distributed.","Short consolidations that occur after strong movement."]',2,'The module explains “Market Breadth” as follows: How widely participation is distributed.','Market Breadth',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-03-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-03-lesson-13-quiz-q04','cmf-module-3-03-lesson-13-quiz','Which explanation best matches “Open Interest” in this module?','["How widely participation is distributed.","The total value or number of outstanding derivative positions.","Short consolidations that occur after strong movement.","That price moves beyond an established level and continues to trade there."]',1,'The module explains “Open Interest” as follows: The total value or number of outstanding derivative positions.','Open Interest',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-03-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-03-lesson-13-quiz-q05','cmf-module-3-03-lesson-13-quiz','Which explanation best matches “A Break Above Resistance Confirms a New Trend” in this module?','["The market must demonstrate acceptance and follow-through.","Short consolidations that occur after strong movement.","That price moves beyond an established level and continues to trade there.","How widely participation is distributed."]',0,'The module explains “A Break Above Resistance Confirms a New Trend” as follows: The market must demonstrate acceptance and follow-through.','A Break Above Resistance Confirms a New Trend',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-03-lesson-13-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.4: Market Regimes and Strategy Selection, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- 1. What is a market regime?

- 2. Why is market direction alone insufficient to define a regime?

- 3. How does a low-volatility regime differ from a high-volatility regime?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-04-lesson-11' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-04-lesson-11-quiz','cmf-module-3-04-lesson-11','Module 3.4: Market Regimes and Strategy Selection: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-04-lesson-11');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-04-lesson-11-quiz-q01','cmf-module-3-04-lesson-11-quiz','Which explanation best matches “A Practical Regime-Assessment Process” in this module?','["Begin with the higher timeframe and identify the dominant structure.","An adaptive strategy changes rules or exposure according to regime evidence.","It may improve alignment but cannot prevent misclassification or unexpected events.","Rather than applying one strategy continuously, a participant may create a decision framework."]',0,'The module explains “A Practical Regime-Assessment Process” as follows: Begin with the higher timeframe and identify the dominant structure.','A Practical Regime-Assessment Process',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-04-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-04-lesson-11-quiz-q02','cmf-module-3-04-lesson-11-quiz','Which explanation best matches “A Regime Filter Eliminates Losing Trades” in this module?','["An adaptive strategy changes rules or exposure according to regime evidence.","Begin with the higher timeframe and identify the dominant structure.","Rather than applying one strategy continuously, a participant may create a decision framework.","It may improve alignment but cannot prevent misclassification or unexpected events."]',3,'The module explains “A Regime Filter Eliminates Losing Trades” as follows: It may improve alignment but cannot prevent misclassification or unexpected events.','A Regime Filter Eliminates Losing Trades',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-04-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-04-lesson-11-quiz-q03','cmf-module-3-04-lesson-11-quiz','Which explanation best matches “A Regime-to-Strategy Framework” in this module?','["Begin with the higher timeframe and identify the dominant structure.","It may improve alignment but cannot prevent misclassification or unexpected events.","Rather than applying one strategy continuously, a participant may create a decision framework.","An adaptive strategy changes rules or exposure according to regime evidence."]',2,'The module explains “A Regime-to-Strategy Framework” as follows: Rather than applying one strategy continuously, a participant may create a decision framework.','A Regime-to-Strategy Framework',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-04-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-04-lesson-11-quiz-q04','cmf-module-3-04-lesson-11-quiz','Which explanation best matches “Accumulation Regime” in this module?','["It may improve alignment but cannot prevent misclassification or unexpected events.","Accumulation may occur after a prolonged decline when stronger participants build positions gradually.","An adaptive strategy changes rules or exposure according to regime evidence.","Begin with the higher timeframe and identify the dominant structure."]',1,'The module explains “Accumulation Regime” as follows: Accumulation may occur after a prolonged decline when stronger participants build positions gradually.','Accumulation Regime',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-04-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-04-lesson-11-quiz-q05','cmf-module-3-04-lesson-11-quiz','Which explanation best matches “Adaptive Strategies” in this module?','["An adaptive strategy changes rules or exposure according to regime evidence.","Begin with the higher timeframe and identify the dominant structure.","It may improve alignment but cannot prevent misclassification or unexpected events.","Rather than applying one strategy continuously, a participant may create a decision framework."]',0,'The module explains “Adaptive Strategies” as follows: An adaptive strategy changes rules or exposure according to regime evidence.','Adaptive Strategies',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-04-lesson-11-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.5: Multi-Timeframe Analysis and Trade Planning, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is multi-timeframe analysis?

- Why can one asset appear bullish and bearish simultaneously?

- What is the difference between major and minor market structure?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-05-lesson-09' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-05-lesson-09-quiz','cmf-module-3-05-lesson-09','Module 3.5: Multi-Timeframe Analysis and Trade Planning: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-05-lesson-09');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-05-lesson-09-quiz-q01','cmf-module-3-05-lesson-09-quiz','Which explanation best matches “Invalidation” in this module?','["The market evidence that shows the trade thesis is no longer sufficiently credible.","The selected charts support the same directional interpretation.","The plan must specify entry, invalidation, size and exit.","Begin by opening the higher-timeframe chart without lower-timeframe indicators."]',0,'The module explains “Invalidation” as follows: The market evidence that shows the trade thesis is no longer sufficiently credible.','Invalidation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-05-lesson-09-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-05-lesson-09-quiz-q02','cmf-module-3-05-lesson-09-quiz','Which explanation best matches “Timeframe Alignment” in this module?','["The market evidence that shows the trade thesis is no longer sufficiently credible.","The plan must specify entry, invalidation, size and exit.","A trend strategy may permit pyramiding after price confirms continuation.","The selected charts support the same directional interpretation."]',3,'The module explains “Timeframe Alignment” as follows: The selected charts support the same directional interpretation.','Timeframe Alignment',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-05-lesson-09-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-05-lesson-09-quiz-q03','cmf-module-3-05-lesson-09-quiz','Which explanation best matches “A Detailed Analysis Is a Trade Plan” in this module?','["The selected charts support the same directional interpretation.","Begin by opening the higher-timeframe chart without lower-timeframe indicators.","The plan must specify entry, invalidation, size and exit.","The market evidence that shows the trade thesis is no longer sufficiently credible."]',2,'The module explains “A Detailed Analysis Is a Trade Plan” as follows: The plan must specify entry, invalidation, size and exit.','A Detailed Analysis Is a Trade Plan',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-05-lesson-09-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-05-lesson-09-quiz-q04','cmf-module-3-05-lesson-09-quiz','Which explanation best matches “A Practical Multi-Timeframe Process” in this module?','["A trend strategy may permit pyramiding after price confirms continuation.","Begin by opening the higher-timeframe chart without lower-timeframe indicators.","The market evidence that shows the trade thesis is no longer sufficiently credible.","The plan must specify entry, invalidation, size and exit."]',1,'The module explains “A Practical Multi-Timeframe Process” as follows: Begin by opening the higher-timeframe chart without lower-timeframe indicators.','A Practical Multi-Timeframe Process',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-05-lesson-09-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-05-lesson-09-quiz-q05','cmf-module-3-05-lesson-09-quiz','Which explanation best matches “Adding to the Position” in this module?','["A trend strategy may permit pyramiding after price confirms continuation.","The market evidence that shows the trade thesis is no longer sufficiently credible.","The selected charts support the same directional interpretation.","The plan must specify entry, invalidation, size and exit."]',0,'The module explains “Adding to the Position” as follows: A trend strategy may permit pyramiding after price confirms continuation.','Adding to the Position',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-05-lesson-09-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.6: Advanced Order Types and Trade Execution, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is the difference between a trading decision and an order?

- What are the bid and ask?

- How is the bid-ask spread calculated?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-06-lesson-10' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-06-lesson-10-quiz','cmf-module-3-06-lesson-10','Module 3.6: Advanced Order Types and Trade Execution: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-06-lesson-10');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-06-lesson-10-quiz-q01','cmf-module-3-06-lesson-10-quiz','Which explanation best matches “Implementation Shortfall” in this module?','["The difference between the theoretical decision price and the actual final execution result.","A related manipulation technique involving several misleading orders at different price levels.","The full market value controlled by the position.","It remains exposed to price impact, slippage, MEV, network delay and smart contract risk."]',0,'The module explains “Implementation Shortfall” as follows: The difference between the theoretical decision price and the actual final execution result.','Implementation Shortfall',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-06-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-06-lesson-10-quiz-q02','cmf-module-3-06-lesson-10-quiz','Which explanation best matches “Layering” in this module?','["The difference between the theoretical decision price and the actual final execution result.","The full market value controlled by the position.","It remains exposed to price impact, slippage, MEV, network delay and smart contract risk.","A related manipulation technique involving several misleading orders at different price levels."]',3,'The module explains “Layering” as follows: A related manipulation technique involving several misleading orders at different price levels.','Layering',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-06-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-06-lesson-10-quiz-q03','cmf-module-3-06-lesson-10-quiz','Which explanation best matches “Notional Exposure” in this module?','["A related manipulation technique involving several misleading orders at different price levels.","It remains exposed to price impact, slippage, MEV, network delay and smart contract risk.","The full market value controlled by the position.","The difference between the theoretical decision price and the actual final execution result."]',2,'The module explains “Notional Exposure” as follows: The full market value controlled by the position.','Notional Exposure',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-06-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-06-lesson-10-quiz-q04','cmf-module-3-06-lesson-10-quiz','Which explanation best matches “A DEX Swap Has No Order-Execution Risk” in this module?','["The full market value controlled by the position.","It remains exposed to price impact, slippage, MEV, network delay and smart contract risk.","The difference between the theoretical decision price and the actual final execution result.","A related manipulation technique involving several misleading orders at different price levels."]',1,'The module explains “A DEX Swap Has No Order-Execution Risk” as follows: It remains exposed to price impact, slippage, MEV, network delay and smart contract risk.','A DEX Swap Has No Order-Execution Risk',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-06-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-06-lesson-10-quiz-q05','cmf-module-3-06-lesson-10-quiz','Which explanation best matches “Advantages and Limitations of Trailing Stops” in this module?','["Distinguish normal volatility from reversal","The difference between the theoretical decision price and the actual final execution result.","A related manipulation technique involving several misleading orders at different price levels.","The full market value controlled by the position."]',0,'The module explains “Advantages and Limitations of Trailing Stops” as follows: Distinguish normal volatility from reversal','Advantages and Limitations of Trailing Stops',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-06-lesson-10-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.7: Futures and Perpetual Contracts, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a derivative?

- How does a futures contract differ from spot ownership?

- What is the difference between a dated future and a perpetual contract?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-07-lesson-12' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-07-lesson-12-quiz','cmf-module-3-07-lesson-12','Module 3.7: Futures and Perpetual Contracts: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-07-lesson-12');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-07-lesson-12-quiz-q01','cmf-module-3-07-lesson-12-quiz','Which explanation best matches “Backwardation” in this module?','["Futures trade below the current spot price.","The risk that the derivative and underlying exposure do not move as expected relative to each other.","The collateral required to open a leveraged position.","A leveraged position no longer has sufficient margin to meet the platform’s maintenance requirements."]',0,'The module explains “Backwardation” as follows: Futures trade below the current spot price.','Backwardation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-07-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-07-lesson-12-quiz-q02','cmf-module-3-07-lesson-12-quiz','Which explanation best matches “Basis Risk” in this module?','["Futures trade below the current spot price.","The collateral required to open a leveraged position.","A leveraged position no longer has sufficient margin to meet the platform’s maintenance requirements.","The risk that the derivative and underlying exposure do not move as expected relative to each other."]',3,'The module explains “Basis Risk” as follows: The risk that the derivative and underlying exposure do not move as expected relative to each other.','Basis Risk',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-07-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-07-lesson-12-quiz-q03','cmf-module-3-07-lesson-12-quiz','Which explanation best matches “Initial Margin” in this module?','["The risk that the derivative and underlying exposure do not move as expected relative to each other.","A leveraged position no longer has sufficient margin to meet the platform’s maintenance requirements.","The collateral required to open a leveraged position.","Futures trade below the current spot price."]',2,'The module explains “Initial Margin” as follows: The collateral required to open a leveraged position.','Initial Margin',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-07-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-07-lesson-12-quiz-q04','cmf-module-3-07-lesson-12-quiz','Which explanation best matches “Liquidation” in this module?','["The collateral required to open a leveraged position.","A leveraged position no longer has sufficient margin to meet the platform’s maintenance requirements.","Futures trade below the current spot price.","The risk that the derivative and underlying exposure do not move as expected relative to each other."]',1,'The module explains “Liquidation” as follows: A leveraged position no longer has sufficient margin to meet the platform’s maintenance requirements.','Liquidation',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-07-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-07-lesson-12-quiz-q05','cmf-module-3-07-lesson-12-quiz','Which explanation best matches “Open Interest” in this module?','["The total outstanding derivative positions that remain open.","Futures trade below the current spot price.","The risk that the derivative and underlying exposure do not move as expected relative to each other.","The collateral required to open a leveraged position."]',0,'The module explains “Open Interest” as follows: The total outstanding derivative positions that remain open.','Open Interest',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-07-lesson-12-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.8: Options Fundamentals and Strategic Uses, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is an option?

- How does a call differ from a put?

- What right does a call buyer receive?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-08-lesson-14' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-08-lesson-14-quiz','cmf-module-3-08-lesson-14','Module 3.8: Options Fundamentals and Strategic Uses: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-08-lesson-14');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-08-lesson-14-quiz-q01','cmf-module-3-08-lesson-14-quiz','Which explanation best matches “Convexity” in this module?','["How an option’s payoff can accelerate as the underlying moves favourably.","The portion of the option premium beyond intrinsic value.","How quickly delta changes as the underlying price moves.","The underlying trades close to the strike near expiry."]',0,'The module explains “Convexity” as follows: How an option’s payoff can accelerate as the underlying moves favourably.','Convexity',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-08-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-08-lesson-14-quiz-q02','cmf-module-3-08-lesson-14-quiz','Which explanation best matches “Extrinsic Value” in this module?','["How an option’s payoff can accelerate as the underlying moves favourably.","How quickly delta changes as the underlying price moves.","The underlying trades close to the strike near expiry.","The portion of the option premium beyond intrinsic value."]',3,'The module explains “Extrinsic Value” as follows: The portion of the option premium beyond intrinsic value.','Extrinsic Value',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-08-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-08-lesson-14-quiz-q03','cmf-module-3-08-lesson-14-quiz','Which explanation best matches “Gamma” in this module?','["The portion of the option premium beyond intrinsic value.","The underlying trades close to the strike near expiry.","How quickly delta changes as the underlying price moves.","How an option’s payoff can accelerate as the underlying moves favourably."]',2,'The module explains “Gamma” as follows: How quickly delta changes as the underlying price moves.','Gamma',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-08-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-08-lesson-14-quiz-q04','cmf-module-3-08-lesson-14-quiz','Which explanation best matches “Pin Risk” in this module?','["How quickly delta changes as the underlying price moves.","The underlying trades close to the strike near expiry.","How an option’s payoff can accelerate as the underlying moves favourably.","The portion of the option premium beyond intrinsic value."]',1,'The module explains “Pin Risk” as follows: The underlying trades close to the strike near expiry.','Pin Risk',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-08-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-08-lesson-14-quiz-q05','cmf-module-3-08-lesson-14-quiz','Which explanation best matches “Realised Volatility” in this module?','["How much the underlying asset actually moved over a historical period.","How an option’s payoff can accelerate as the underlying moves favourably.","The portion of the option premium beyond intrinsic value.","How quickly delta changes as the underlying price moves."]',0,'The module explains “Realised Volatility” as follows: How much the underlying asset actually moved over a historical period.','Realised Volatility',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-08-lesson-14-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.9: Options Greeks and Advanced Strategies, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What does delta measure?

- Why does an option’s delta change?

- How can delta be used to estimate portfolio directional exposure?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-09-lesson-12' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-09-lesson-12-quiz','cmf-module-3-09-lesson-12','Module 3.9: Options Greeks and Advanced Strategies: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-09-lesson-12');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-09-lesson-12-quiz-q01','cmf-module-3-09-lesson-12-quiz','Which explanation best matches “Forward Volatility” in this module?','["The volatility implied for a future period between two option expiries.","The rate at which delta changes when the underlying asset moves.","The components of a multi-leg strategy are not executed simultaneously.","A theoretical relationship between calls, puts, the underlying asset and financing for options with the same strike and expiry."]',0,'The module explains “Forward Volatility” as follows: The volatility implied for a future period between two option expiries.','Forward Volatility',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-09-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-09-lesson-12-quiz-q02','cmf-module-3-09-lesson-12-quiz','Which explanation best matches “Gamma” in this module?','["The volatility implied for a future period between two option expiries.","The components of a multi-leg strategy are not executed simultaneously.","A theoretical relationship between calls, puts, the underlying asset and financing for options with the same strike and expiry.","The rate at which delta changes when the underlying asset moves."]',3,'The module explains “Gamma” as follows: The rate at which delta changes when the underlying asset moves.','Gamma',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-09-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-09-lesson-12-quiz-q03','cmf-module-3-09-lesson-12-quiz','Which explanation best matches “Legging Risk” in this module?','["The rate at which delta changes when the underlying asset moves.","A theoretical relationship between calls, puts, the underlying asset and financing for options with the same strike and expiry.","The components of a multi-leg strategy are not executed simultaneously.","The volatility implied for a future period between two option expiries."]',2,'The module explains “Legging Risk” as follows: The components of a multi-leg strategy are not executed simultaneously.','Legging Risk',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-09-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-09-lesson-12-quiz-q04','cmf-module-3-09-lesson-12-quiz','Which explanation best matches “Put-Call Parity” in this module?','["The components of a multi-leg strategy are not executed simultaneously.","A theoretical relationship between calls, puts, the underlying asset and financing for options with the same strike and expiry.","The volatility implied for a future period between two option expiries.","The rate at which delta changes when the underlying asset moves."]',1,'The module explains “Put-Call Parity” as follows: A theoretical relationship between calls, puts, the underlying asset and financing for options with the same strike and expiry.','Put-Call Parity',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-09-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-09-lesson-12-quiz-q05','cmf-module-3-09-lesson-12-quiz','Which explanation best matches “Rho” in this module?','["An option’s sensitivity to interest rates.","The volatility implied for a future period between two option expiries.","The rate at which delta changes when the underlying asset moves.","The components of a multi-leg strategy are not executed simultaneously."]',0,'The module explains “Rho” as follows: An option’s sensitivity to interest rates.','Rho',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-09-lesson-12-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.10: Derivatives Positioning, Funding and Liquidation Analysis, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What does open interest measure?

- How does open interest differ from trading volume?

- What may rising price and rising open interest suggest?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-10-lesson-11' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-10-lesson-11-quiz','cmf-module-3-10-lesson-11','Module 3.10: Derivatives Positioning, Funding and Liquidation Analysis: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-10-lesson-11');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-10-lesson-11-quiz-q01','cmf-module-3-10-lesson-11-quiz','Which explanation best matches “Absorption” in this module?','["Substantial aggressive buying or selling fails to move price significantly.","The reduction of borrowed or leveraged exposure.","The exposure held through futures, perpetual contracts, options and related instruments.","Periodic payments exchanged between long and short holders of perpetual contracts."]',0,'The module explains “Absorption” as follows: Substantial aggressive buying or selling fails to move price significantly.','Absorption',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-10-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-10-lesson-11-quiz-q02','cmf-module-3-10-lesson-11-quiz','Which explanation best matches “Deleveraging” in this module?','["Substantial aggressive buying or selling fails to move price significantly.","The exposure held through futures, perpetual contracts, options and related instruments.","Periodic payments exchanged between long and short holders of perpetual contracts.","The reduction of borrowed or leveraged exposure."]',3,'The module explains “Deleveraging” as follows: The reduction of borrowed or leveraged exposure.','Deleveraging',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-10-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-10-lesson-11-quiz-q03','cmf-module-3-10-lesson-11-quiz','Which explanation best matches “Derivatives Positioning” in this module?','["The reduction of borrowed or leveraged exposure.","Periodic payments exchanged between long and short holders of perpetual contracts.","The exposure held through futures, perpetual contracts, options and related instruments.","Substantial aggressive buying or selling fails to move price significantly."]',2,'The module explains “Derivatives Positioning” as follows: The exposure held through futures, perpetual contracts, options and related instruments.','Derivatives Positioning',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-10-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-10-lesson-11-quiz-q04','cmf-module-3-10-lesson-11-quiz','Which explanation best matches “Funding Rates” in this module?','["The exposure held through futures, perpetual contracts, options and related instruments.","Periodic payments exchanged between long and short holders of perpetual contracts.","Substantial aggressive buying or selling fails to move price significantly.","The reduction of borrowed or leveraged exposure."]',1,'The module explains “Funding Rates” as follows: Periodic payments exchanged between long and short holders of perpetual contracts.','Funding Rates',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-10-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-10-lesson-11-quiz-q05','cmf-module-3-10-lesson-11-quiz','Which explanation best matches “Futures Basis” in this module?','["The difference between a futures price and the underlying spot price.","Substantial aggressive buying or selling fails to move price significantly.","The reduction of borrowed or leveraged exposure.","The exposure held through futures, perpetual contracts, options and related instruments."]',0,'The module explains “Futures Basis” as follows: The difference between a futures price and the underlying spot price.','Futures Basis',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-10-lesson-11-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.11: Introduction to On-Chain Analysis, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is on-chain analysis?

- How does on-chain data differ from exchange-market data?

- What information may a blockchain transaction contain?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-11-lesson-10' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-11-lesson-10-quiz','cmf-module-3-11-lesson-10','Module 3.11: Introduction to On-Chain Analysis: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-11-lesson-10');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-11-lesson-10-quiz-q01','cmf-module-3-11-lesson-10-quiz','Which explanation best matches “Address Clustering” in this module?','["The process of grouping addresses that may be controlled by the same entity.","The average age of moved coins or coin days destroyed relative to transaction volume.","Payments made to miners, validators or other transaction processors.","Do not start with dozens of indicators."]',0,'The module explains “Address Clustering” as follows: The process of grouping addresses that may be controlled by the same entity.','Address Clustering',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-11-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-11-lesson-10-quiz-q02','cmf-module-3-11-lesson-10-quiz','Which explanation best matches “Dormancy” in this module?','["The process of grouping addresses that may be controlled by the same entity.","Payments made to miners, validators or other transaction processors.","Do not start with dozens of indicators.","The average age of moved coins or coin days destroyed relative to transaction volume."]',3,'The module explains “Dormancy” as follows: The average age of moved coins or coin days destroyed relative to transaction volume.','Dormancy',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-11-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-11-lesson-10-quiz-q03','cmf-module-3-11-lesson-10-quiz','Which explanation best matches “Network Fees” in this module?','["The average age of moved coins or coin days destroyed relative to transaction volume.","Do not start with dozens of indicators.","Payments made to miners, validators or other transaction processors.","The process of grouping addresses that may be controlled by the same entity."]',2,'The module explains “Network Fees” as follows: Payments made to miners, validators or other transaction processors.','Network Fees',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-11-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-11-lesson-10-quiz-q04','cmf-module-3-11-lesson-10-quiz','Which explanation best matches “A Practical On-Chain Analysis Process” in this module?','["Payments made to miners, validators or other transaction processors.","Do not start with dozens of indicators.","The process of grouping addresses that may be controlled by the same entity.","The average age of moved coins or coin days destroyed relative to transaction volume."]',1,'The module explains “A Practical On-Chain Analysis Process” as follows: Do not start with dozens of indicators.','A Practical On-Chain Analysis Process',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-11-lesson-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-11-lesson-10-quiz-q05','cmf-module-3-11-lesson-10-quiz','Which explanation best matches “An Exact Dashboard Number Is Objectively Correct” in this module?','["Derived metrics depend on classification, filtering and valuation assumptions.","The process of grouping addresses that may be controlled by the same entity.","The average age of moved coins or coin days destroyed relative to transaction volume.","Payments made to miners, validators or other transaction processors."]',0,'The module explains “An Exact Dashboard Number Is Objectively Correct” as follows: Derived metrics depend on classification, filtering and valuation assumptions.','An Exact Dashboard Number Is Objectively Correct',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-11-lesson-10-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.12: Blockchain Activity and Network Health, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What does blockchain network health describe?

- Why is high activity not automatically evidence of good health?

- What are the main limitations of raw transaction count?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-12-lesson-11' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-12-lesson-11-quiz','cmf-module-3-12-lesson-11','Module 3.12: Blockchain Activity and Network Health: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-12-lesson-11');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-12-lesson-11-quiz-q01','cmf-module-3-12-lesson-11-quiz','Which explanation best matches “Bad Debt” in this module?','["Collateral value is insufficient to repay an obligation.","The ability of users to submit valid transactions without one party consistently preventing them.","The point at which a transaction is considered irreversible under the network’s consensus rules.","A small group can direct the protocol for its own benefit."]',0,'The module explains “Bad Debt” as follows: Collateral value is insufficient to repay an obligation.','Bad Debt',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-12-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-12-lesson-11-quiz-q02','cmf-module-3-12-lesson-11-quiz','Which explanation best matches “Censorship Resistance” in this module?','["Collateral value is insufficient to repay an obligation.","The point at which a transaction is considered irreversible under the network’s consensus rules.","A small group can direct the protocol for its own benefit.","The ability of users to submit valid transactions without one party consistently preventing them."]',3,'The module explains “Censorship Resistance” as follows: The ability of users to submit valid transactions without one party consistently preventing them.','Censorship Resistance',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-12-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-12-lesson-11-quiz-q03','cmf-module-3-12-lesson-11-quiz','Which explanation best matches “Finality” in this module?','["The ability of users to submit valid transactions without one party consistently preventing them.","A small group can direct the protocol for its own benefit.","The point at which a transaction is considered irreversible under the network’s consensus rules.","Collateral value is insufficient to repay an obligation."]',2,'The module explains “Finality” as follows: The point at which a transaction is considered irreversible under the network’s consensus rules.','Finality',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-12-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-12-lesson-11-quiz-q04','cmf-module-3-12-lesson-11-quiz','Which explanation best matches “Governance Capture” in this module?','["The point at which a transaction is considered irreversible under the network’s consensus rules.","A small group can direct the protocol for its own benefit.","Collateral value is insufficient to repay an obligation.","The ability of users to submit valid transactions without one party consistently preventing them."]',1,'The module explains “Governance Capture” as follows: A small group can direct the protocol for its own benefit.','Governance Capture',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-12-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-12-lesson-11-quiz-q05','cmf-module-3-12-lesson-11-quiz','Which explanation best matches “Settlement Value” in this module?','["The financial value finalised through the network.","Collateral value is insufficient to repay an obligation.","The ability of users to submit valid transactions without one party consistently preventing them.","The point at which a transaction is considered irreversible under the network’s consensus rules."]',0,'The module explains “Settlement Value” as follows: The financial value finalised through the network.','Settlement Value',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-12-lesson-11-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.13: Wallet Behaviour and Holder Cohorts, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is a holder cohort?

- How does an address differ from a wallet and an entity?

- Why is entity adjustment important?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-13-lesson-12' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-13-lesson-12-quiz','cmf-module-3-13-lesson-12','Module 3.13: Wallet Behaviour and Holder Cohorts: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-13-lesson-12');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-13-lesson-12-quiz-q01','cmf-module-3-13-lesson-12-quiz','Which explanation best matches “Accumulation” in this module?','["A period during which holders increase exposure, often without immediately selling.","The coin age consumed when assets move.","Estimated when assets move below their previous last-moved price.","Estimated when assets move at a higher market price than the price at which they last moved."]',0,'The module explains “Accumulation” as follows: A period during which holders increase exposure, often without immediately selling.','Accumulation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-13-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-13-lesson-12-quiz-q02','cmf-module-3-13-lesson-12-quiz','Which explanation best matches “Coin Days Destroyed” in this module?','["A period during which holders increase exposure, often without immediately selling.","Estimated when assets move below their previous last-moved price.","Estimated when assets move at a higher market price than the price at which they last moved.","The coin age consumed when assets move."]',3,'The module explains “Coin Days Destroyed” as follows: The coin age consumed when assets move.','Coin Days Destroyed',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-13-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-13-lesson-12-quiz-q03','cmf-module-3-13-lesson-12-quiz','Which explanation best matches “Realised Loss” in this module?','["The coin age consumed when assets move.","Assets remain inactive long enough to move into older age categories.","Estimated when assets move below their previous last-moved price.","A period during which holders increase exposure, often without immediately selling."]',2,'The module explains “Realised Loss” as follows: Estimated when assets move below their previous last-moved price.','Realised Loss',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-13-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-13-lesson-12-quiz-q04','cmf-module-3-13-lesson-12-quiz','Which explanation best matches “Realised Profit” in this module?','["Assets remain inactive long enough to move into older age categories.","Estimated when assets move at a higher market price than the price at which they last moved.","A period during which holders increase exposure, often without immediately selling.","The coin age consumed when assets move."]',1,'The module explains “Realised Profit” as follows: Estimated when assets move at a higher market price than the price at which they last moved.','Realised Profit',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-13-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-13-lesson-12-quiz-q05','cmf-module-3-13-lesson-12-quiz','Which explanation best matches “Supply Maturation” in this module?','["Assets remain inactive long enough to move into older age categories.","A period during which holders increase exposure, often without immediately selling.","The coin age consumed when assets move.","Estimated when assets move below their previous last-moved price."]',0,'The module explains “Supply Maturation” as follows: Assets remain inactive long enough to move into older age categories.','Supply Maturation',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-13-lesson-12-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.14: Exchange Inflows, Outflows and Reserve Analysis, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is an exchange inflow?

- What is an exchange outflow?

- How is exchange net flow calculated?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-14-lesson-11' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-14-lesson-11-quiz','cmf-module-3-14-lesson-11','Module 3.14: Exchange Inflows, Outflows and Reserve Analysis: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-14-lesson-11');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-14-lesson-11-quiz-q01','cmf-module-3-14-lesson-11-quiz','Which explanation best matches “Proof of Reserves” in this module?','["A process through which a custodian or exchange attempts to demonstrate control over customer-related assets.","Begin by deciding whether the analysis concerns the overall market or one particular exchange.","The deposit makes selling possible but does not prove it will occur.","Aggregate reserves combine the balances of multiple exchanges."]',0,'The module explains “Proof of Reserves” as follows: A process through which a custodian or exchange attempts to demonstrate control over customer-related assets.','Proof of Reserves',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-14-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-14-lesson-11-quiz-q02','cmf-module-3-14-lesson-11-quiz','Which explanation best matches “A Practical Exchange-Flow Process” in this module?','["A process through which a custodian or exchange attempts to demonstrate control over customer-related assets.","Aggregate reserves combine the balances of multiple exchanges.","The deposit makes selling possible but does not prove it will occur.","Begin by deciding whether the analysis concerns the overall market or one particular exchange."]',3,'The module explains “A Practical Exchange-Flow Process” as follows: Begin by deciding whether the analysis concerns the overall market or one particular exchange.','A Practical Exchange-Flow Process',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-14-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-14-lesson-11-quiz-q03','cmf-module-3-14-lesson-11-quiz','Which explanation best matches “Aggregate Exchange Reserves” in this module?','["Begin by deciding whether the analysis concerns the overall market or one particular exchange.","The deposit makes selling possible but does not prove it will occur.","Aggregate reserves combine the balances of multiple exchanges.","A process through which a custodian or exchange attempts to demonstrate control over customer-related assets."]',2,'The module explains “Aggregate Exchange Reserves” as follows: Aggregate reserves combine the balances of multiple exchanges.','Aggregate Exchange Reserves',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-14-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-14-lesson-11-quiz-q04','cmf-module-3-14-lesson-11-quiz','Which explanation best matches “An Exchange Deposit Means the Holder Is Selling” in this module?','["Aggregate reserves combine the balances of multiple exchanges.","The deposit makes selling possible but does not prove it will occur.","A process through which a custodian or exchange attempts to demonstrate control over customer-related assets.","Begin by deciding whether the analysis concerns the overall market or one particular exchange."]',1,'The module explains “An Exchange Deposit Means the Holder Is Selling” as follows: The deposit makes selling possible but does not prove it will occur.','An Exchange Deposit Means the Holder Is Selling',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-14-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-14-lesson-11-quiz-q05','cmf-module-3-14-lesson-11-quiz','Which explanation best matches “Cross-Chain Exchange Reserves” in this module?','["Exchanges may hold the same economic asset across several networks.","A process through which a custodian or exchange attempts to demonstrate control over customer-related assets.","Begin by deciding whether the analysis concerns the overall market or one particular exchange.","The deposit makes selling possible but does not prove it will occur."]',0,'The module explains “Cross-Chain Exchange Reserves” as follows: Exchanges may hold the same economic asset across several networks.','Cross-Chain Exchange Reserves',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-14-lesson-11-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.15: Realised Value and On-Chain Cost Basis, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- How is market capitalisation calculated?

- Why does market capitalisation not measure the exact capital invested?

- What is realised capitalisation?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-15-lesson-13' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-15-lesson-13-quiz','cmf-module-3-15-lesson-13','Module 3.15: Realised Value and On-Chain Cost Basis: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-15-lesson-13');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-15-lesson-13-quiz-q01','cmf-module-3-15-lesson-13-quiz','Which explanation best matches “Market Capitalisation” in this module?','["Calculated by multiplying current market price by circulating supply.","Assets held by investors whose estimated cost basis lies above the current market price.","Calculated by dividing realised capitalisation by circulating supply.","A Bitcoin-related metric representing the cumulative value paid to miners through block rewards, valued when those rewards were issued."]',0,'The module explains “Market Capitalisation” as follows: Calculated by multiplying current market price by circulating supply.','Market Capitalisation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-15-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-15-lesson-13-quiz-q02','cmf-module-3-15-lesson-13-quiz','Which explanation best matches “Overhead Supply” in this module?','["Calculated by multiplying current market price by circulating supply.","Calculated by dividing realised capitalisation by circulating supply.","A Bitcoin-related metric representing the cumulative value paid to miners through block rewards, valued when those rewards were issued.","Assets held by investors whose estimated cost basis lies above the current market price."]',3,'The module explains “Overhead Supply” as follows: Assets held by investors whose estimated cost basis lies above the current market price.','Overhead Supply',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-15-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-15-lesson-13-quiz-q03','cmf-module-3-15-lesson-13-quiz','Which explanation best matches “Realised Price” in this module?','["Assets held by investors whose estimated cost basis lies above the current market price.","A Bitcoin-related metric representing the cumulative value paid to miners through block rewards, valued when those rewards were issued.","Calculated by dividing realised capitalisation by circulating supply.","Calculated by multiplying current market price by circulating supply."]',2,'The module explains “Realised Price” as follows: Calculated by dividing realised capitalisation by circulating supply.','Realised Price',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-15-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-15-lesson-13-quiz-q04','cmf-module-3-15-lesson-13-quiz','Which explanation best matches “Thermocap” in this module?','["Calculated by dividing realised capitalisation by circulating supply.","A Bitcoin-related metric representing the cumulative value paid to miners through block rewards, valued when those rewards were issued.","Calculated by multiplying current market price by circulating supply.","Assets held by investors whose estimated cost basis lies above the current market price."]',1,'The module explains “Thermocap” as follows: A Bitcoin-related metric representing the cumulative value paid to miners through block rewards, valued when those rewards were issued.','Thermocap',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-15-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-15-lesson-13-quiz-q05','cmf-module-3-15-lesson-13-quiz','Which explanation best matches “Unrealised Profit” in this module?','["The difference between current market value and estimated cost basis for supply that has not yet moved.","Calculated by multiplying current market price by circulating supply.","Assets held by investors whose estimated cost basis lies above the current market price.","Calculated by dividing realised capitalisation by circulating supply."]',0,'The module explains “Unrealised Profit” as follows: The difference between current market value and estimated cost basis for supply that has not yet moved.','Unrealised Profit',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-15-lesson-13-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.16: On-Chain Valuation Metrics and Cycle Indicators, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- How does valuation differ from price prediction?

- What is relative valuation?

- How is MVRV calculated?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-16-lesson-12' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-16-lesson-12-quiz','cmf-module-3-16-lesson-12','Module 3.16: On-Chain Valuation Metrics and Cycle Indicators: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-16-lesson-12');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-16-lesson-12-quiz-q01','cmf-module-3-16-lesson-12-quiz','Which explanation best matches “Investor Capitalisation” in this module?','["A derived measure intended to separate investor cost basis from miner issuance value.","The relationship between coin-age destruction and coin-age creation.","Much of the yield may come from token inflation.","Raw transaction volume can be heavily distorted."]',0,'The module explains “Investor Capitalisation” as follows: A derived measure intended to separate investor cost basis from miner issuance value.','Investor Capitalisation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-16-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-16-lesson-12-quiz-q02','cmf-module-3-16-lesson-12-quiz','Which explanation best matches “Liveliness” in this module?','["A derived measure intended to separate investor cost basis from miner issuance value.","Much of the yield may come from token inflation.","Raw transaction volume can be heavily distorted.","The relationship between coin-age destruction and coin-age creation."]',3,'The module explains “Liveliness” as follows: The relationship between coin-age destruction and coin-age creation.','Liveliness',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-16-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-16-lesson-12-quiz-q03','cmf-module-3-16-lesson-12-quiz','Which explanation best matches “A High Staking Yield Is Real Income” in this module?','["The relationship between coin-age destruction and coin-age creation.","Raw transaction volume can be heavily distorted.","Much of the yield may come from token inflation.","A derived measure intended to separate investor cost basis from miner issuance value."]',2,'The module explains “A High Staking Yield Is Real Income” as follows: Much of the yield may come from token inflation.','A High Staking Yield Is Real Income',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-16-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-16-lesson-12-quiz-q04','cmf-module-3-16-lesson-12-quiz','Which explanation best matches “Adjusting Transaction Volume” in this module?','["Much of the yield may come from token inflation.","Raw transaction volume can be heavily distorted.","A derived measure intended to separate investor cost basis from miner issuance value.","The relationship between coin-age destruction and coin-age creation."]',1,'The module explains “Adjusting Transaction Volume” as follows: Raw transaction volume can be heavily distorted.','Adjusting Transaction Volume',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-16-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-16-lesson-12-quiz-q05','cmf-module-3-16-lesson-12-quiz','Which explanation best matches “Avoiding a Single-Number Valuation” in this module?','["Digital assets have highly uncertain future demand.","A derived measure intended to separate investor cost basis from miner issuance value.","The relationship between coin-age destruction and coin-age creation.","Much of the yield may come from token inflation."]',0,'The module explains “Avoiding a Single-Number Valuation” as follows: Digital assets have highly uncertain future demand.','Avoiding a Single-Number Valuation',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-16-lesson-12-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.17: Macroeconomic Liquidity and Digital Asset Markets, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What does macroeconomics study?

- How does monetary liquidity differ from market liquidity?

- What is funding liquidity?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-17-lesson-13' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-17-lesson-13-quiz','cmf-module-3-17-lesson-13','Module 3.17: Macroeconomic Liquidity and Digital Asset Markets: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-17-lesson-13');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-17-lesson-13-quiz-q01','cmf-module-3-17-lesson-13-quiz','Which explanation best matches “Credit Contraction” in this module?','["Lenders reduce exposure, borrowers repay debt or defaults impair lending capacity.","Currency debasement refers broadly to a decline in purchasing power caused by inflation or excessive monetary expansion.","Commonly measured through changes in total production and spending.","How easily market participants can obtain financing."]',0,'The module explains “Credit Contraction” as follows: Lenders reduce exposure, borrowers repay debt or defaults impair lending capacity.','Credit Contraction',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-17-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-17-lesson-13-quiz-q02','cmf-module-3-17-lesson-13-quiz','Which explanation best matches “Currency Debasement” in this module?','["Lenders reduce exposure, borrowers repay debt or defaults impair lending capacity.","Commonly measured through changes in total production and spending.","How easily market participants can obtain financing.","Currency debasement refers broadly to a decline in purchasing power caused by inflation or excessive monetary expansion."]',3,'The module explains “Currency Debasement” as follows: Currency debasement refers broadly to a decline in purchasing power caused by inflation or excessive monetary expansion.','Currency Debasement',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-17-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-17-lesson-13-quiz-q03','cmf-module-3-17-lesson-13-quiz','Which explanation best matches “Economic Growth” in this module?','["Currency debasement refers broadly to a decline in purchasing power caused by inflation or excessive monetary expansion.","How easily market participants can obtain financing.","Commonly measured through changes in total production and spending.","Lenders reduce exposure, borrowers repay debt or defaults impair lending capacity."]',2,'The module explains “Economic Growth” as follows: Commonly measured through changes in total production and spending.','Economic Growth',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-17-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-17-lesson-13-quiz-q04','cmf-module-3-17-lesson-13-quiz','Which explanation best matches “Funding Liquidity” in this module?','["Commonly measured through changes in total production and spending.","How easily market participants can obtain financing.","Lenders reduce exposure, borrowers repay debt or defaults impair lending capacity.","Currency debasement refers broadly to a decline in purchasing power caused by inflation or excessive monetary expansion."]',1,'The module explains “Funding Liquidity” as follows: How easily market participants can obtain financing.','Funding Liquidity',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-17-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-17-lesson-13-quiz-q05','cmf-module-3-17-lesson-13-quiz','Which explanation best matches “Monetary Liquidity” in this module?','["Influenced by the amount of money and central bank reserves within the financial system.","Lenders reduce exposure, borrowers repay debt or defaults impair lending capacity.","Currency debasement refers broadly to a decline in purchasing power caused by inflation or excessive monetary expansion.","Commonly measured through changes in total production and spending."]',0,'The module explains “Monetary Liquidity” as follows: Influenced by the amount of money and central bank reserves within the financial system.','Monetary Liquidity',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-17-lesson-13-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.18: Monetary Policy and Digital Assets, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is monetary policy?

- What are the broad phases of a monetary policy cycle?

- What is the neutral interest rate?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-18-lesson-13' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-18-lesson-13-quiz','cmf-module-3-18-lesson-13','Module 3.18: Monetary Policy and Digital Assets: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-18-lesson-13');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-18-lesson-13-quiz-q01','cmf-module-3-18-lesson-13-quiz','Which explanation best matches “Financial Repression” in this module?','["Policies that keep borrowing costs below inflation or direct capital toward government debt.","Communication intended to influence expectations about future monetary policy.","It can tighten global funding and increase pressure on dollar borrowers.","A practical framework can examine four layers."]',0,'The module explains “Financial Repression” as follows: Policies that keep borrowing costs below inflation or direct capital toward government debt.','Financial Repression',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-18-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-18-lesson-13-quiz-q02','cmf-module-3-18-lesson-13-quiz','Which explanation best matches “Forward Guidance” in this module?','["Policies that keep borrowing costs below inflation or direct capital toward government debt.","How changes in asset values and borrower balance sheets amplify the economic cycle.","It can tighten global funding and increase pressure on dollar borrowers.","Communication intended to influence expectations about future monetary policy."]',3,'The module explains “Forward Guidance” as follows: Communication intended to influence expectations about future monetary policy.','Forward Guidance',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-18-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-18-lesson-13-quiz-q03','cmf-module-3-18-lesson-13-quiz','Which explanation best matches “The Financial Accelerator” in this module?','["It can tighten global funding and increase pressure on dollar borrowers.","A practical framework can examine four layers.","How changes in asset values and borrower balance sheets amplify the economic cycle.","Communication intended to influence expectations about future monetary policy."]',2,'The module explains “The Financial Accelerator” as follows: How changes in asset values and borrower balance sheets amplify the economic cycle.','The Financial Accelerator',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-18-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-18-lesson-13-quiz-q04','cmf-module-3-18-lesson-13-quiz','Which explanation best matches “A Strong Dollar Only Affects Currency Traders” in this module?','["How changes in asset values and borrower balance sheets amplify the economic cycle.","It can tighten global funding and increase pressure on dollar borrowers.","Policies that keep borrowing costs below inflation or direct capital toward government debt.","Communication intended to influence expectations about future monetary policy."]',1,'The module explains “A Strong Dollar Only Affects Currency Traders” as follows: It can tighten global funding and increase pressure on dollar borrowers.','A Strong Dollar Only Affects Currency Traders',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-18-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-18-lesson-13-quiz-q05','cmf-module-3-18-lesson-13-quiz','Which explanation best matches “Building a Liquidity-Cycle Framework” in this module?','["A practical framework can examine four layers.","Policies that keep borrowing costs below inflation or direct capital toward government debt.","Communication intended to influence expectations about future monetary policy.","How changes in asset values and borrower balance sheets amplify the economic cycle."]',0,'The module explains “Building a Liquidity-Cycle Framework” as follows: A practical framework can examine four layers.','Building a Liquidity-Cycle Framework',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-18-lesson-13-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.19: Cross-Asset Correlations and Intermarket Analysis, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is intermarket analysis?

- What does correlation measure?

- What range can a correlation coefficient take?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-19-lesson-14' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-19-lesson-14-quiz','cmf-module-3-19-lesson-14','Module 3.19: Cross-Asset Correlations and Intermarket Analysis: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-19-lesson-14');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-19-lesson-14-quiz-q01','cmf-module-3-19-lesson-14-quiz','Which explanation best matches “Alpha” in this module?','["Return not explained by the benchmark exposure under a selected model.","Bitcoin’s market capitalisation relative to the broader digital asset market.","A more stable long-term relationship between non-stationary price series.","Whether two assets tend to move in the same or opposite direction."]',0,'The module explains “Alpha” as follows: Return not explained by the benchmark exposure under a selected model.','Alpha',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-19-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-19-lesson-14-quiz-q02','cmf-module-3-19-lesson-14-quiz','Which explanation best matches “Bitcoin Dominance” in this module?','["Return not explained by the benchmark exposure under a selected model.","A more stable long-term relationship between non-stationary price series.","Whether two assets tend to move in the same or opposite direction.","Bitcoin’s market capitalisation relative to the broader digital asset market."]',3,'The module explains “Bitcoin Dominance” as follows: Bitcoin’s market capitalisation relative to the broader digital asset market.','Bitcoin Dominance',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-19-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-19-lesson-14-quiz-q03','cmf-module-3-19-lesson-14-quiz','Which explanation best matches “Cointegration” in this module?','["Bitcoin’s market capitalisation relative to the broader digital asset market.","Whether two assets tend to move in the same or opposite direction.","A more stable long-term relationship between non-stationary price series.","Return not explained by the benchmark exposure under a selected model."]',2,'The module explains “Cointegration” as follows: A more stable long-term relationship between non-stationary price series.','Cointegration',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-19-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-19-lesson-14-quiz-q04','cmf-module-3-19-lesson-14-quiz','Which explanation best matches “Covariance” in this module?','["A more stable long-term relationship between non-stationary price series.","Whether two assets tend to move in the same or opposite direction.","Return not explained by the benchmark exposure under a selected model.","Bitcoin’s market capitalisation relative to the broader digital asset market."]',1,'The module explains “Covariance” as follows: Whether two assets tend to move in the same or opposite direction.','Covariance',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-19-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-19-lesson-14-quiz-q05','cmf-module-3-19-lesson-14-quiz','Which explanation best matches “Gold and Bitcoin” in this module?','["Often compared because both can be viewed as scarce assets outside ordinary corporate liabilities.","Return not explained by the benchmark exposure under a selected model.","A more stable long-term relationship between non-stationary price series.","Whether two assets tend to move in the same or opposite direction."]',0,'The module explains “Gold and Bitcoin” as follows: Often compared because both can be viewed as scarce assets outside ordinary corporate liabilities.','Gold and Bitcoin',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-19-lesson-14-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.20: Advanced Portfolio Allocation and Risk Budgeting, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- How does asset selection differ from portfolio construction?

- What is capital allocation?

- What is risk allocation?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-20-lesson-13' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-20-lesson-13-quiz','cmf-module-3-20-lesson-13','Module 3.20: Advanced Portfolio Allocation and Risk Budgeting: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-20-lesson-13');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-20-lesson-13-quiz-q01','cmf-module-3-20-lesson-13-quiz','Which explanation best matches “Calendar Rebalancing” in this module?','["Calendar rebalancing occurs at fixed intervals such as monthly, quarterly or annually.","How much of the portfolio’s monetary value is assigned to each asset or strategy.","The sum of the absolute market value of all long and short positions.","The tendency to experience losses more strongly than equivalent gains."]',0,'The module explains “Calendar Rebalancing” as follows: Calendar rebalancing occurs at fixed intervals such as monthly, quarterly or annually.','Calendar Rebalancing',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-20-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-20-lesson-13-quiz-q02','cmf-module-3-20-lesson-13-quiz','Which explanation best matches “Capital Allocation” in this module?','["Calendar rebalancing occurs at fixed intervals such as monthly, quarterly or annually.","The sum of the absolute market value of all long and short positions.","The tendency to experience losses more strongly than equivalent gains.","How much of the portfolio’s monetary value is assigned to each asset or strategy."]',3,'The module explains “Capital Allocation” as follows: How much of the portfolio’s monetary value is assigned to each asset or strategy.','Capital Allocation',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-20-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-20-lesson-13-quiz-q03','cmf-module-3-20-lesson-13-quiz','Which explanation best matches “Gross Exposure” in this module?','["How much of the portfolio’s monetary value is assigned to each asset or strategy.","The tendency to experience losses more strongly than equivalent gains.","The sum of the absolute market value of all long and short positions.","Calendar rebalancing occurs at fixed intervals such as monthly, quarterly or annually."]',2,'The module explains “Gross Exposure” as follows: The sum of the absolute market value of all long and short positions.','Gross Exposure',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-20-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-20-lesson-13-quiz-q04','cmf-module-3-20-lesson-13-quiz','Which explanation best matches “Loss Aversion” in this module?','["The sum of the absolute market value of all long and short positions.","The tendency to experience losses more strongly than equivalent gains.","Calendar rebalancing occurs at fixed intervals such as monthly, quarterly or annually.","How much of the portfolio’s monetary value is assigned to each asset or strategy."]',1,'The module explains “Loss Aversion” as follows: The tendency to experience losses more strongly than equivalent gains.','Loss Aversion',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-20-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-20-lesson-13-quiz-q05','cmf-module-3-20-lesson-13-quiz','Which explanation best matches “Risk of Ruin” in this module?','["The probability that a sequence of losses reduces capital to an unrecoverable level.","Calendar rebalancing occurs at fixed intervals such as monthly, quarterly or annually.","How much of the portfolio’s monetary value is assigned to each asset or strategy.","The sum of the absolute market value of all long and short positions."]',0,'The module explains “Risk of Ruin” as follows: The probability that a sequence of losses reduces capital to an unrecoverable level.','Risk of Ruin',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-20-lesson-13-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.21: Portfolio Optimisation and Drawdown Control, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is portfolio optimisation?

- What does the efficient frontier represent?

- Why is expected return usually the most uncertain optimisation input?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-21-lesson-13' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-21-lesson-13-quiz','cmf-module-3-21-lesson-13','Module 3.21: Portfolio Optimisation and Drawdown Control: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-21-lesson-13');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-21-lesson-13-quiz-q01','cmf-module-3-21-lesson-13-quiz','Which explanation best matches “Calendar Rebalancing” in this module?','["Calendar rebalancing occurs according to a fixed schedule.","How long the portfolio remains below its previous peak.","The maximum decline an investor can withstand financially and behaviourally.","The return an investor anticipates over a defined period."]',0,'The module explains “Calendar Rebalancing” as follows: Calendar rebalancing occurs according to a fixed schedule.','Calendar Rebalancing',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-21-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-21-lesson-13-quiz-q02','cmf-module-3-21-lesson-13-quiz','Which explanation best matches “Drawdown Duration” in this module?','["Calendar rebalancing occurs according to a fixed schedule.","The return an investor anticipates over a defined period.","An asset’s economic outlook changes.","How long the portfolio remains below its previous peak."]',3,'The module explains “Drawdown Duration” as follows: How long the portfolio remains below its previous peak.','Drawdown Duration',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-21-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-21-lesson-13-quiz-q03','cmf-module-3-21-lesson-13-quiz','Which explanation best matches “Drawdown Tolerance” in this module?','["The return an investor anticipates over a defined period.","An asset’s economic outlook changes.","The maximum decline an investor can withstand financially and behaviourally.","Calendar rebalancing occurs according to a fixed schedule."]',2,'The module explains “Drawdown Tolerance” as follows: The maximum decline an investor can withstand financially and behaviourally.','Drawdown Tolerance',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-21-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-21-lesson-13-quiz-q04','cmf-module-3-21-lesson-13-quiz','Which explanation best matches “Expected Return” in this module?','["The maximum decline an investor can withstand financially and behaviourally.","The return an investor anticipates over a defined period.","Calendar rebalancing occurs according to a fixed schedule.","How long the portfolio remains below its previous peak."]',1,'The module explains “Expected Return” as follows: The return an investor anticipates over a defined period.','Expected Return',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-21-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-21-lesson-13-quiz-q05','cmf-module-3-21-lesson-13-quiz','Which explanation best matches “Fundamental Rebalancing” in this module?','["An asset’s economic outlook changes.","How long the portfolio remains below its previous peak.","The maximum decline an investor can withstand financially and behaviourally.","The return an investor anticipates over a defined period."]',0,'The module explains “Fundamental Rebalancing” as follows: An asset’s economic outlook changes.','Fundamental Rebalancing',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-21-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,`video_key`,`primary_asset_id`,`intro_asset_id`,`duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,`transcript`,`experience_json`,`position`,`updated_at`) SELECT 'cmf-module-3-22-lesson-14','cognizen-crypto-mastery-foundations-production','Apply and check your understanding','cmf-module-3-22','quiz','## Your outcome

Retrieve and apply the key ideas from Module 3.22: Performance Measurement, Benchmarking and Attribution, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- State the module''s central decision or analytical principle in your own words.

- Identify one assumption, limitation or risk that could change the conclusion.

- Name one practical situation in which you would apply the module.

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.','markdown',NULL,NULL,NULL,6,0,0,0,'','',14,1785384000000 WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-22-lesson-14-quiz','cmf-module-3-22-lesson-14','Module 3.22: Performance Measurement, Benchmarking and Attribution: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-22-lesson-14');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-22-lesson-14-quiz-q01','cmf-module-3-22-lesson-14-quiz','Which explanation best matches “Active Drawdown” in this module?','["The decline in cumulative performance relative to the benchmark.","The return not explained by the selected benchmark or factor model.","The total change over the complete evaluation period.","Returns falling below the selected minimum acceptable return."]',0,'The module explains “Active Drawdown” as follows: The decline in cumulative performance relative to the benchmark.','Active Drawdown',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-22-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-22-lesson-14-quiz-q02','cmf-module-3-22-lesson-14-quiz','Which explanation best matches “Active Return” in this module?','["The return not explained by the selected benchmark or factor model.","Returns falling below the selected minimum acceptable return.","The decline in cumulative performance relative to the benchmark.","The portfolio return minus the benchmark return."]',3,'The module explains “Active Return” as follows: The portfolio return minus the benchmark return.','Active Return',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-22-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-22-lesson-14-quiz-q03','cmf-module-3-22-lesson-14-quiz','Which explanation best matches “Alpha” in this module?','["The portfolio return minus the benchmark return.","The total change over the complete evaluation period.","The return not explained by the selected benchmark or factor model.","The decline in cumulative performance relative to the benchmark."]',2,'The module explains “Alpha” as follows: The return not explained by the selected benchmark or factor model.','Alpha',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-22-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-22-lesson-14-quiz-q04','cmf-module-3-22-lesson-14-quiz','Which explanation best matches “Cumulative Return” in this module?','["Returns falling below the selected minimum acceptable return.","The total change over the complete evaluation period.","The decline in cumulative performance relative to the benchmark.","The return not explained by the selected benchmark or factor model."]',1,'The module explains “Cumulative Return” as follows: The total change over the complete evaluation period.','Cumulative Return',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-22-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-22-lesson-14-quiz-q05','cmf-module-3-22-lesson-14-quiz','Which explanation best matches “Downside Deviation” in this module?','["Returns falling below the selected minimum acceptable return.","The decline in cumulative performance relative to the benchmark.","The portfolio return minus the benchmark return.","The return not explained by the selected benchmark or factor model."]',0,'The module explains “Downside Deviation” as follows: Returns falling below the selected minimum acceptable return.','Downside Deviation',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-22-lesson-14-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.23: Advanced DeFi Strategy and Protocol Risk, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What makes a DeFi strategy advanced?

- Why must every sustainable return have an economic source?

- How does nominal yield differ from real economic return?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-23-lesson-14' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-23-lesson-14-quiz','cmf-module-3-23-lesson-14','Module 3.23: Advanced DeFi Strategy and Protocol Risk: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-23-lesson-14');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-23-lesson-14-quiz-q01','cmf-module-3-23-lesson-14-quiz','Which explanation best matches “DeFi Portfolio Heat” in this module?','["Combined loss exposure across protocols and dependencies.","The difference between the value of a liquidity-provider position and the value of simply holding the deposited assets.","A borrower’s collateral no longer provides sufficient protection.","The portion of user fees retained by the protocol, treasury or token holders."]',0,'The module explains “DeFi Portfolio Heat” as follows: Combined loss exposure across protocols and dependencies.','DeFi Portfolio Heat',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-23-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-23-lesson-14-quiz-q02','cmf-module-3-23-lesson-14-quiz','Which explanation best matches “Impermanent Loss” in this module?','["Combined loss exposure across protocols and dependencies.","A borrower’s collateral no longer provides sufficient protection.","The portion of user fees retained by the protocol, treasury or token holders.","The difference between the value of a liquidity-provider position and the value of simply holding the deposited assets."]',3,'The module explains “Impermanent Loss” as follows: The difference between the value of a liquidity-provider position and the value of simply holding the deposited assets.','Impermanent Loss',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-23-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-23-lesson-14-quiz-q03','cmf-module-3-23-lesson-14-quiz','Which explanation best matches “Liquidation” in this module?','["The difference between the value of a liquidity-provider position and the value of simply holding the deposited assets.","The portion of user fees retained by the protocol, treasury or token holders.","A borrower’s collateral no longer provides sufficient protection.","Combined loss exposure across protocols and dependencies."]',2,'The module explains “Liquidation” as follows: A borrower’s collateral no longer provides sufficient protection.','Liquidation',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-23-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-23-lesson-14-quiz-q04','cmf-module-3-23-lesson-14-quiz','Which explanation best matches “Protocol Revenue” in this module?','["A borrower’s collateral no longer provides sufficient protection.","The portion of user fees retained by the protocol, treasury or token holders.","Combined loss exposure across protocols and dependencies.","The difference between the value of a liquidity-provider position and the value of simply holding the deposited assets."]',1,'The module explains “Protocol Revenue” as follows: The portion of user fees retained by the protocol, treasury or token holders.','Protocol Revenue',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-23-lesson-14-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-23-lesson-14-quiz-q05','cmf-module-3-23-lesson-14-quiz','Which explanation best matches “Restaking” in this module?','["Already staked assets or staking claims to secure additional services.","Combined loss exposure across protocols and dependencies.","The difference between the value of a liquidity-provider position and the value of simply holding the deposited assets.","A borrower’s collateral no longer provides sufficient protection."]',0,'The module explains “Restaking” as follows: Already staked assets or staking claims to secure additional services.','Restaking',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-23-lesson-14-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.24: Cross-Chain Interoperability and Bridge Risk, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- Why do blockchains require interoperability systems?

- What is a blockchain bridge?

- Why does a native asset not usually move physically to another blockchain?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-24-lesson-15' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-24-lesson-15-quiz','cmf-module-3-24-lesson-15','Module 3.24: Cross-Chain Interoperability and Bridge Risk: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-24-lesson-15');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-24-lesson-15-quiz-q01','cmf-module-3-24-lesson-15-quiz','Which explanation best matches “Formal Verification” in this module?','["Mathematical methods to prove that code satisfies selected properties.","A bridge creates destination tokens without valid backing.","Enough bridge validators cooperate to approve an invalid transaction.","Some audits cover only selected contracts, versions or chains."]',0,'The module explains “Formal Verification” as follows: Mathematical methods to prove that code satisfies selected properties.','Formal Verification',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-24-lesson-15-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-24-lesson-15-quiz-q02','cmf-module-3-24-lesson-15-quiz','Which explanation best matches “Fraudulent Minting” in this module?','["Mathematical methods to prove that code satisfies selected properties.","The destination environment verifies source-chain state through mechanisms closely tied to the connected chains’ consensus.","Enough bridge validators cooperate to approve an invalid transaction.","A bridge creates destination tokens without valid backing."]',3,'The module explains “Fraudulent Minting” as follows: A bridge creates destination tokens without valid backing.','Fraudulent Minting',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-24-lesson-15-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-24-lesson-15-quiz-q03','cmf-module-3-24-lesson-15-quiz','Which explanation best matches “Native Verification” in this module?','["Enough bridge validators cooperate to approve an invalid transaction.","Some audits cover only selected contracts, versions or chains.","The destination environment verifies source-chain state through mechanisms closely tied to the connected chains’ consensus.","A bridge creates destination tokens without valid backing."]',2,'The module explains “Native Verification” as follows: The destination environment verifies source-chain state through mechanisms closely tied to the connected chains’ consensus.','Native Verification',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-24-lesson-15-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-24-lesson-15-quiz-q04','cmf-module-3-24-lesson-15-quiz','Which explanation best matches “Validator Collusion” in this module?','["The destination environment verifies source-chain state through mechanisms closely tied to the connected chains’ consensus.","Enough bridge validators cooperate to approve an invalid transaction.","Mathematical methods to prove that code satisfies selected properties.","A bridge creates destination tokens without valid backing."]',1,'The module explains “Validator Collusion” as follows: Enough bridge validators cooperate to approve an invalid transaction.','Validator Collusion',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-24-lesson-15-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-24-lesson-15-quiz-q05','cmf-module-3-24-lesson-15-quiz','Which explanation best matches “A Bridge Audit Covers the Complete System” in this module?','["Some audits cover only selected contracts, versions or chains.","Mathematical methods to prove that code satisfies selected properties.","A bridge creates destination tokens without valid backing.","The destination environment verifies source-chain state through mechanisms closely tied to the connected chains’ consensus."]',0,'The module explains “A Bridge Audit Covers the Complete System” as follows: Some audits cover only selected contracts, versions or chains.','A Bridge Audit Covers the Complete System',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-24-lesson-15-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.25: Decentralised Governance, DAOs and Treasury Risk, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What is governance?

- What is a DAO?

- Why are most DAOs not fully autonomous?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-25-lesson-17' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-25-lesson-17-quiz','cmf-module-3-25-lesson-17','Module 3.25: Decentralised Governance, DAOs and Treasury Risk: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-25-lesson-17');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-25-lesson-17-quiz-q01','cmf-module-3-25-lesson-17-quiz','Which explanation best matches “Decentralisation Theatre” in this module?','["A project presents the appearance of community governance while control remains concentrated.","One participant or coordinated group gains enough influence to control decisions.","How much eligible voting power takes part in decisions.","Governance controlled primarily by wealth."]',0,'The module explains “Decentralisation Theatre” as follows: A project presents the appearance of community governance while control remains concentrated.','Decentralisation Theatre',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-25-lesson-17-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-25-lesson-17-quiz-q02','cmf-module-3-25-lesson-17-quiz','Which explanation best matches “Governance Capture” in this module?','["A project presents the appearance of community governance while control remains concentrated.","Governance controlled primarily by wealth.","Liquidity positions owned by the DAO rather than rented through temporary incentives.","One participant or coordinated group gains enough influence to control decisions."]',3,'The module explains “Governance Capture” as follows: One participant or coordinated group gains enough influence to control decisions.','Governance Capture',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-25-lesson-17-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-25-lesson-17-quiz-q03','cmf-module-3-25-lesson-17-quiz','Which explanation best matches “Governance Participation” in this module?','["Governance controlled primarily by wealth.","Liquidity positions owned by the DAO rather than rented through temporary incentives.","How much eligible voting power takes part in decisions.","A project presents the appearance of community governance while control remains concentrated."]',2,'The module explains “Governance Participation” as follows: How much eligible voting power takes part in decisions.','Governance Participation',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-25-lesson-17-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-25-lesson-17-quiz-q04','cmf-module-3-25-lesson-17-quiz','Which explanation best matches “Plutocracy” in this module?','["How much eligible voting power takes part in decisions.","Governance controlled primarily by wealth.","A project presents the appearance of community governance while control remains concentrated.","One participant or coordinated group gains enough influence to control decisions."]',1,'The module explains “Plutocracy” as follows: Governance controlled primarily by wealth.','Plutocracy',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-25-lesson-17-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-25-lesson-17-quiz-q05','cmf-module-3-25-lesson-17-quiz','Which explanation best matches “Protocol-Owned Liquidity” in this module?','["Liquidity positions owned by the DAO rather than rented through temporary incentives.","A project presents the appearance of community governance while control remains concentrated.","One participant or coordinated group gains enough influence to control decisions.","How much eligible voting power takes part in decisions."]',0,'The module explains “Protocol-Owned Liquidity” as follows: Liquidity positions owned by the DAO rather than rented through temporary incentives.','Protocol-Owned Liquidity',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-25-lesson-17-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.26: Institutional Custody and Market Infrastructure, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- What does digital asset custody involve?

- How can legal ownership differ from technical control?

- What is institutional self-custody?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-26-lesson-12' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-26-lesson-12-quiz','cmf-module-3-26-lesson-12','Module 3.26: Institutional Custody and Market Infrastructure: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-26-lesson-12');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-26-lesson-12-quiz-q01','cmf-module-3-26-lesson-12-quiz','Which explanation best matches “Best Execution” in this module?','["Taking reasonable steps to achieve favourable outcomes for clients.","The ability to continue providing important services during disruption.","The owner controls the keys or signing process directly.","Authorisation reduces some risks but does not guarantee solvency or uninterrupted service."]',0,'The module explains “Best Execution” as follows: Taking reasonable steps to achieve favourable outcomes for clients.','Best Execution',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-26-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-26-lesson-12-quiz-q02','cmf-module-3-26-lesson-12-quiz','Which explanation best matches “Operational Resilience” in this module?','["Taking reasonable steps to achieve favourable outcomes for clients.","The owner controls the keys or signing process directly.","Authorisation reduces some risks but does not guarantee solvency or uninterrupted service.","The ability to continue providing important services during disruption."]',3,'The module explains “Operational Resilience” as follows: The ability to continue providing important services during disruption.','Operational Resilience',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-26-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-26-lesson-12-quiz-q03','cmf-module-3-26-lesson-12-quiz','Which explanation best matches “Self-Custody” in this module?','["The ability to continue providing important services during disruption.","Authorisation reduces some risks but does not guarantee solvency or uninterrupted service.","The owner controls the keys or signing process directly.","Taking reasonable steps to achieve favourable outcomes for clients."]',2,'The module explains “Self-Custody” as follows: The owner controls the keys or signing process directly.','Self-Custody',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-26-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-26-lesson-12-quiz-q04','cmf-module-3-26-lesson-12-quiz','Which explanation best matches “A Regulated Exchange Cannot Fail” in this module?','["The owner controls the keys or signing process directly.","Authorisation reduces some risks but does not guarantee solvency or uninterrupted service.","Taking reasonable steps to achieve favourable outcomes for clients.","The ability to continue providing important services during disruption."]',1,'The module explains “A Regulated Exchange Cannot Fail” as follows: Authorisation reduces some risks but does not guarantee solvency or uninterrupted service.','A Regulated Exchange Cannot Fail',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-26-lesson-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-26-lesson-12-quiz-q05','cmf-module-3-26-lesson-12-quiz','Which explanation best matches “Address Whitelisting” in this module?','["Whitelisting restricts withdrawals to approved blockchain addresses.","Taking reasonable steps to achieve favourable outcomes for clients.","The ability to continue providing important services during disruption.","The owner controls the keys or signing process directly."]',0,'The module explains “Address Whitelisting” as follows: Whitelisting restricts withdrawals to approved blockchain addresses.','Address Whitelisting',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-26-lesson-12-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.27: Institutional Investment Products and Digital Asset Market Access, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- How does direct digital asset exposure differ from indirect exposure?

- Why may an institution prefer an investment product to direct token ownership?

- What is a legal wrapper?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-27-lesson-13' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-27-lesson-13-quiz','cmf-module-3-27-lesson-13','Module 3.27: Institutional Investment Products and Digital Asset Market Access: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-27-lesson-13');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-27-lesson-13-quiz-q01','cmf-module-3-27-lesson-13-quiz','Which explanation best matches “Authorised Participants” in this module?','["Institutions permitted to create or redeem large blocks of product shares.","The difference between the futures price and spot price.","The final product result depends on the sequence of market returns, not only the starting and ending prices.","The variability of the product’s return difference from its benchmark."]',0,'The module explains “Authorised Participants” as follows: Institutions permitted to create or redeem large blocks of product shares.','Authorised Participants',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-27-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-27-lesson-13-quiz-q02','cmf-module-3-27-lesson-13-quiz','Which explanation best matches “Futures Basis” in this module?','["Institutions permitted to create or redeem large blocks of product shares.","The final product result depends on the sequence of market returns, not only the starting and ending prices.","The variability of the product’s return difference from its benchmark.","The difference between the futures price and spot price."]',3,'The module explains “Futures Basis” as follows: The difference between the futures price and spot price.','Futures Basis',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-27-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-27-lesson-13-quiz-q03','cmf-module-3-27-lesson-13-quiz','Which explanation best matches “Path Dependence” in this module?','["The difference between the futures price and spot price.","The variability of the product’s return difference from its benchmark.","The final product result depends on the sequence of market returns, not only the starting and ending prices.","Institutions permitted to create or redeem large blocks of product shares."]',2,'The module explains “Path Dependence” as follows: The final product result depends on the sequence of market returns, not only the starting and ending prices.','Path Dependence',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-27-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-27-lesson-13-quiz-q04','cmf-module-3-27-lesson-13-quiz','Which explanation best matches “Tracking Error” in this module?','["The final product result depends on the sequence of market returns, not only the starting and ending prices.","The variability of the product’s return difference from its benchmark.","Institutions permitted to create or redeem large blocks of product shares.","The difference between the futures price and spot price."]',1,'The module explains “Tracking Error” as follows: The variability of the product’s return difference from its benchmark.','Tracking Error',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-27-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-27-lesson-13-quiz-q05','cmf-module-3-27-lesson-13-quiz','Which explanation best matches “A Covered-Call Yield Is Free Income” in this module?','["The product sells part of its future upside.","Institutions permitted to create or redeem large blocks of product shares.","The difference between the futures price and spot price.","The final product result depends on the sequence of market returns, not only the starting and ending prices."]',0,'The module explains “A Covered-Call Yield Is Free Income” as follows: The product sells part of its future upside.','A Covered-Call Yield Is Free Income',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-27-lesson-13-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,`video_key`,`primary_asset_id`,`intro_asset_id`,`duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,`transcript`,`experience_json`,`position`,`updated_at`) SELECT 'cmf-module-3-28-lesson-02','cognizen-crypto-mastery-foundations-production','Apply and check your understanding','cmf-module-3-28','quiz','## Your outcome

Retrieve and apply the key ideas from Module 3.28: Institutional Portfolio Integration and Strategic Digital Asset Allocation, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- State the module''s central decision or analytical principle in your own words.

- Identify one assumption, limitation or risk that could change the conclusion.

- Name one practical situation in which you would apply the module.

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.','markdown',NULL,NULL,NULL,6,0,0,0,'','',2,1785384000000 WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-28-lesson-02-quiz','cmf-module-3-28-lesson-02','Module 3.28: Institutional Portfolio Integration and Strategic Digital Asset Allocation: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-28-lesson-02');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-28-lesson-02-quiz-q01','cmf-module-3-28-lesson-02-quiz','Which explanation best matches “Expected Return” in this module?','["Difficult to estimate for digital assets because their histories are limited and their adoption paths remain uncertain.","Digital assets require consistent valuation and accounting policies.","A digital asset strategy can outperform because it carries greater market beta rather than because of superior skill.","One year of underperformance is not necessarily sufficient to abandon a long-term allocation."]',0,'The module explains “Expected Return” as follows: Difficult to estimate for digital assets because their histories are limited and their adoption paths remain uncertain.','Expected Return',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-28-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-28-lesson-02-quiz-q02','cmf-module-3-28-lesson-02-quiz','Which explanation best matches “Accounting and Valuation” in this module?','["Difficult to estimate for digital assets because their histories are limited and their adoption paths remain uncertain.","A digital asset strategy can outperform because it carries greater market beta rather than because of superior skill.","One year of underperformance is not necessarily sufficient to abandon a long-term allocation.","Digital assets require consistent valuation and accounting policies."]',3,'The module explains “Accounting and Valuation” as follows: Digital assets require consistent valuation and accounting policies.','Accounting and Valuation',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-28-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-28-lesson-02-quiz-q03','cmf-module-3-28-lesson-02-quiz','Which explanation best matches “Alpha and Beta” in this module?','["Digital assets require consistent valuation and accounting policies.","One year of underperformance is not necessarily sufficient to abandon a long-term allocation.","A digital asset strategy can outperform because it carries greater market beta rather than because of superior skill.","Difficult to estimate for digital assets because their histories are limited and their adoption paths remain uncertain."]',2,'The module explains “Alpha and Beta” as follows: A digital asset strategy can outperform because it carries greater market beta rather than because of superior skill.','Alpha and Beta',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-28-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-28-lesson-02-quiz-q04','cmf-module-3-28-lesson-02-quiz','Which explanation best matches “Annual Policy Review” in this module?','["A digital asset strategy can outperform because it carries greater market beta rather than because of superior skill.","One year of underperformance is not necessarily sufficient to abandon a long-term allocation.","Difficult to estimate for digital assets because their histories are limited and their adoption paths remain uncertain.","Digital assets require consistent valuation and accounting policies."]',1,'The module explains “Annual Policy Review” as follows: One year of underperformance is not necessarily sufficient to abandon a long-term allocation.','Annual Policy Review',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-28-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-28-lesson-02-quiz-q05','cmf-module-3-28-lesson-02-quiz','Which explanation best matches “Approved Asset Universe” in this module?','["An institution should define which assets are eligible.","Difficult to estimate for digital assets because their histories are limited and their adoption paths remain uncertain.","Digital assets require consistent valuation and accounting policies.","A digital asset strategy can outperform because it carries greater market beta rather than because of superior skill."]',0,'The module explains “Approved Asset Universe” as follows: An institution should define which assets are eligible.','Approved Asset Universe',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-28-lesson-02-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,`video_key`,`primary_asset_id`,`intro_asset_id`,`duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,`transcript`,`experience_json`,`position`,`updated_at`) SELECT 'cmf-module-3-29-lesson-11','cognizen-crypto-mastery-foundations-production','Apply and check your understanding','cmf-module-3-29','quiz','## Your outcome

Retrieve and apply the key ideas from Module 3.29: Institutional Governance and Compliance, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- State the module''s central decision or analytical principle in your own words.

- Identify one assumption, limitation or risk that could change the conclusion.

- Name one practical situation in which you would apply the module.

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.','markdown',NULL,NULL,NULL,6,0,0,0,'','',11,1785384000000 WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-29-lesson-11-quiz','cmf-module-3-29-lesson-11','Module 3.29: Institutional Governance and Compliance: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-29-lesson-11');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-29-lesson-11-quiz-q01','cmf-module-3-29-lesson-11-quiz','Which explanation best matches “Front-Running” in this module?','["A person trades ahead of a known client or institutional order to benefit from the expected price movement.","The idea that a wallet becomes risky because it received assets connected with illicit activity.","It provides less intermediary identity information but is not inherently illicit.","An approved asset list identifies the digital assets that may be held or traded."]',0,'The module explains “Front-Running” as follows: A person trades ahead of a known client or institutional order to benefit from the expected price movement.','Front-Running',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-29-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-29-lesson-11-quiz-q02','cmf-module-3-29-lesson-11-quiz','Which explanation best matches “Wallet Contamination” in this module?','["A person trades ahead of a known client or institutional order to benefit from the expected price movement.","An approved asset list identifies the digital assets that may be held or traded.","Beneficial ownership identifies the individuals who ultimately own or control an organisation or account.","The idea that a wallet becomes risky because it received assets connected with illicit activity."]',3,'The module explains “Wallet Contamination” as follows: The idea that a wallet becomes risky because it received assets connected with illicit activity.','Wallet Contamination',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-29-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-29-lesson-11-quiz-q03','cmf-module-3-29-lesson-11-quiz','Which explanation best matches “A Self-Hosted Wallet Is Automatically Suspicious” in this module?','["An approved asset list identifies the digital assets that may be held or traded.","Beneficial ownership identifies the individuals who ultimately own or control an organisation or account.","It provides less intermediary identity information but is not inherently illicit.","A person trades ahead of a known client or institutional order to benefit from the expected price movement."]',2,'The module explains “A Self-Hosted Wallet Is Automatically Suspicious” as follows: It provides less intermediary identity information but is not inherently illicit.','A Self-Hosted Wallet Is Automatically Suspicious',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-29-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-29-lesson-11-quiz-q04','cmf-module-3-29-lesson-11-quiz','Which explanation best matches “Approved Asset List” in this module?','["It provides less intermediary identity information but is not inherently illicit.","An approved asset list identifies the digital assets that may be held or traded.","A person trades ahead of a known client or institutional order to benefit from the expected price movement.","The idea that a wallet becomes risky because it received assets connected with illicit activity."]',1,'The module explains “Approved Asset List” as follows: An approved asset list identifies the digital assets that may be held or traded.','Approved Asset List',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-29-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-29-lesson-11-quiz-q05','cmf-module-3-29-lesson-11-quiz','Which explanation best matches “Beneficial Ownership” in this module?','["Beneficial ownership identifies the individuals who ultimately own or control an organisation or account.","A person trades ahead of a known client or institutional order to benefit from the expected price movement.","The idea that a wallet becomes risky because it received assets connected with illicit activity.","It provides less intermediary identity information but is not inherently illicit."]',0,'The module explains “Beneficial Ownership” as follows: Beneficial ownership identifies the individuals who ultimately own or control an organisation or account.','Beneficial Ownership',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-29-lesson-11-quiz');
--> statement-breakpoint
UPDATE `lessons` SET `title`='Apply and check your understanding',`lesson_type`='quiz',`content`='## Your outcome

Retrieve and apply the key ideas from Module 3.30: Advanced Digital Asset Strategy Framework, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- 1. What is the primary purpose of a digital asset strategy framework?

- 2. Why should the framework begin with an objective?

- 3. What is an investment mandate?

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.',`content_format`='markdown',`duration_minutes`=6,`updated_at`=1785384000000 WHERE `id`='cmf-module-3-30-lesson-11' AND `course_id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-30-lesson-11-quiz','cmf-module-3-30-lesson-11','Module 3.30: Advanced Digital Asset Strategy Framework: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-30-lesson-11');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-30-lesson-11-quiz-q01','cmf-module-3-30-lesson-11-quiz','Which explanation best matches “A Good Outcome Proves the Framework Worked” in this module?','["The result may have come from luck, leverage or an unplanned risk.","Alerts should be connected to predefined actions.","Eligible assets should be classified according to their economic role.","Scenario analysis prevents the strategy from depending on one forecast."]',0,'The module explains “A Good Outcome Proves the Framework Worked” as follows: The result may have come from luck, leverage or an unplanned risk.','A Good Outcome Proves the Framework Worked',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-30-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-30-lesson-11-quiz-q02','cmf-module-3-30-lesson-11-quiz','Which explanation best matches “Alerts and Escalation” in this module?','["The result may have come from luck, leverage or an unplanned risk.","Eligible assets should be classified according to their economic role.","Scenario analysis prevents the strategy from depending on one forecast.","Alerts should be connected to predefined actions."]',3,'The module explains “Alerts and Escalation” as follows: Alerts should be connected to predefined actions.','Alerts and Escalation',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-30-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-30-lesson-11-quiz-q03','cmf-module-3-30-lesson-11-quiz','Which explanation best matches “Asset Classification” in this module?','["Alerts should be connected to predefined actions.","Scenario analysis prevents the strategy from depending on one forecast.","Eligible assets should be classified according to their economic role.","The result may have come from luck, leverage or an unplanned risk."]',2,'The module explains “Asset Classification” as follows: Eligible assets should be classified according to their economic role.','Asset Classification',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-30-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-30-lesson-11-quiz-q04','cmf-module-3-30-lesson-11-quiz','Which explanation best matches “Base, Bull and Bear Scenarios” in this module?','["Eligible assets should be classified according to their economic role.","Scenario analysis prevents the strategy from depending on one forecast.","The result may have come from luck, leverage or an unplanned risk.","Alerts should be connected to predefined actions."]',1,'The module explains “Base, Bull and Bear Scenarios” as follows: Scenario analysis prevents the strategy from depending on one forecast.','Base, Bull and Bear Scenarios',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-30-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-30-lesson-11-quiz-q05','cmf-module-3-30-lesson-11-quiz','Which explanation best matches “Begin With the Objective” in this module?','["Every strategy should begin with a clear objective.","The result may have come from luck, leverage or an unplanned risk.","Alerts should be connected to predefined actions.","Eligible assets should be classified according to their economic role."]',0,'The module explains “Begin With the Objective” as follows: Every strategy should begin with a clear objective.','Begin With the Objective',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-30-lesson-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,`video_key`,`primary_asset_id`,`intro_asset_id`,`duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,`transcript`,`experience_json`,`position`,`updated_at`) SELECT 'cmf-module-3-31-lesson-03','cognizen-crypto-mastery-foundations-production','Apply and check your understanding','cmf-module-3-31','quiz','## Your outcome

Retrieve and apply the key ideas from Module 3.31: Congratulations on completing Crypto Mastery, then confirm your understanding with immediate, source-grounded feedback.

## Think before you choose

- State the module''s central decision or analytical principle in your own words.

- Identify one assumption, limitation or risk that could change the conclusion.

- Name one practical situation in which you would apply the module.

## Scored knowledge check

Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.','markdown',NULL,NULL,NULL,6,0,0,0,'','',3,1785384000000 WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`) SELECT 'cmf-module-3-31-lesson-03-quiz','cmf-module-3-31-lesson-03','Module 3.31: Congratulations on completing Crypto Mastery: applied knowledge check',80,0 WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-3-31-lesson-03');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-31-lesson-03-quiz-q01','cmf-module-3-31-lesson-03-quiz','Which explanation best matches “Trend Continuation” in this course?','["Price resumes movement in the established direction after a pause or correction.","A borrower’s collateral no longer provides sufficient protection.","The market reference on which the option is based.","The cumulative value paid to proof-of-work miners through newly issued block rewards, valued at the time those rewards were created."]',0,'The module explains “Trend Continuation” as follows: Price resumes movement in the established direction after a pause or correction.','Trend Continuation',1 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-31-lesson-03-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-31-lesson-03-quiz-q02','cmf-module-3-31-lesson-03-quiz','Which explanation best matches “The Underlying Asset” in this course?','["A borrower’s collateral no longer provides sufficient protection.","The cumulative value paid to proof-of-work miners through newly issued block rewards, valued at the time those rewards were created.","Price resumes movement in the established direction after a pause or correction.","The market reference on which the option is based."]',3,'The module explains “The Underlying Asset” as follows: The market reference on which the option is based.','The Underlying Asset',2 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-31-lesson-03-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-31-lesson-03-quiz-q03','cmf-module-3-31-lesson-03-quiz','Which explanation best matches “Thermocap” in this course?','["The market reference on which the option is based.","Price resumes movement in the established direction after a pause or correction.","The cumulative value paid to proof-of-work miners through newly issued block rewards, valued at the time those rewards were created.","A borrower’s collateral no longer provides sufficient protection."]',2,'The module explains “Thermocap” as follows: The cumulative value paid to proof-of-work miners through newly issued block rewards, valued at the time those rewards were created.','Thermocap',3 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-31-lesson-03-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-31-lesson-03-quiz-q04','cmf-module-3-31-lesson-03-quiz','Which explanation best matches “Liquidation” in this course?','["Price resumes movement in the established direction after a pause or correction.","A borrower’s collateral no longer provides sufficient protection.","The market reference on which the option is based.","The cumulative value paid to proof-of-work miners through newly issued block rewards, valued at the time those rewards were created."]',1,'The module explains “Liquidation” as follows: A borrower’s collateral no longer provides sufficient protection.','Liquidation',4 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-31-lesson-03-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions` (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`) SELECT 'cmf-module-3-31-lesson-03-quiz-q05','cmf-module-3-31-lesson-03-quiz','Which explanation best matches “The Purpose of a Strategy Framework” in this course?','["A strategy framework converts information into consistent decisions.","A borrower’s collateral no longer provides sufficient protection.","The market reference on which the option is based.","The cumulative value paid to proof-of-work miners through newly issued block rewards, valued at the time those rewards were created."]',0,'The module explains “The Purpose of a Strategy Framework” as follows: A strategy framework converts information into consistent decisions.','The Purpose of a Strategy Framework',5 WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-3-31-lesson-03-quiz');
--> statement-breakpoint
