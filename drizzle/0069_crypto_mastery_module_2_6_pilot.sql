INSERT OR IGNORE INTO `courses`
  (`id`,`school_id`,`owner_id`,`title`,`description`,`status`,`price_cents`,
   `enforce_lesson_order`,`available_from`,`certificate_title`,
   `certificate_accent`,`certificate_valid_days`,`created_at`,`updated_at`)
SELECT
  'cognizen-crypto-mastery-part-2-pilot',
  target.`id`,
  target.`owner_id`,
  'Crypto Mastery: Markets and Applications â€” Interactive pilot',
  'A continuation in the markets pilot for Module 2.6. Learners evaluate real projects using governance, token, and execution evidence before deciding attention level.',
  'draft',0,1,NULL,
  'NorthstarLabs Market Regime Systems',
  '#3556d8',0,1785666000000,1785666000000
FROM `schools` target
WHERE target.`slug`='cognizen-consulting'
LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections`
  (`id`,`course_id`,`title`,`position`,`created_at`)
SELECT
  'cognizen-p2-module-06',
  'cognizen-crypto-mastery-part-2-pilot',
  'Module 2.6: Evaluating Cryptocurrency Projects',
  4,1785666000000
WHERE EXISTS (
  SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-part-2-pilot'
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
  (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,
   `video_key`,`primary_asset_id`,`intro_asset_id`,`duration_minutes`,`is_preview`,
   `available_after_days`,`required_watch_percent`,`transcript`,`experience_json`,
   `position`,`updated_at`)
SELECT column1,column2,column3,column4,column5,column6,column7,column8,column9,
  column10,column11,column12,column13,column14,column15,column16,column17,column18
FROM (VALUES
  (
    'cognizen-p2m6-l01','cognizen-crypto-mastery-part-2-pilot',
    'What should you trust first?','cognizen-p2-module-06','interactive',
    '## Your outcome

Project diligence starts with a clear claim. Is this a utility, infrastructure, speculation, or settlement play?

This lesson gives you a practical order for evidence when comparing projects.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Trust is earned in layers: team, code, controls, and real usage. Skip the most visible layer first.',
    '{"version":1,"eyebrow":"Evidence order","title":"Start with the claim","intro":"Judge claims with the least reversible evidence first.","scenes":[{"id":"claim","label":"Claim check","title":"Define what the project says","body":"Write one testable sentence for the project proposition.","metric":"Clarity","tone":"blue"},{"id":"category","label":"Claim check","title":"Classify the project type","body":"Use the category system (wallet, exchange, protocol, infrastructure) before deep valuation.","metric":"Context fit","tone":"green"},{"id":"evidence","label":"Claim check","title":"Select non-reactive sources","body":"Prefer code links, governance docs and verifiable events over marketing posts.","metric":"Verifiability","tone":"orange"}],"activity":{"kind":"classify","title":"Put first-step evidence in order","prompt":"Classify each item by when you should check it.","buckets":[{"id":"claim","label":"Project thesis","description":"What exact problem is claimed?"},{"id":"team","label":"Team and incentives","description":"Who benefits and how is power allocated?"},{"id":"tech","label":"Protocol integrity","description":"What controls and verifiable implementation exist?"},{"id":"usage","label":"Usage evidence","description":"Who actually uses it and how?"}],"cards":[{"id":"p1","text":"A glossy launch thread announcing launch date","bucketId":"claim","feedback":"Marketing may be true but comes before hard evidence."},{"id":"p2","text":"A public team page and founder-linked identity","bucketId":"team","feedback":"Team context creates accountability and helps interpret intent."},{"id":"p3","text":"Published smart-contract addresses and audits","bucketId":"tech","feedback":"Technical controls are crucial before assigning conviction."},{"id":"p4","text":"On-chain volume and liquidity trend","bucketId":"usage","feedback":"Usage shows sustained ecosystem participation, not guaranteed quality."}],"takeaway":"Treat flashy claims as the last step in this sequence unless independently verified."}}',
    1,1785666000000
  ),
  (
    'cognizen-p2m6-l02','cognizen-crypto-mastery-part-2-pilot',
    'Team quality and incentive alignment','cognizen-p2-module-06','interactive',
    '## Your outcome

You will separate founder narratives from durable alignment.

Team quality is not charisma. It is clarity, history, responsibility, and governance transparency under stress.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Strong narratives break under stress when incentives are hidden or concentrated.',
    '{"version":1,"eyebrow":"Human layer","title":"Incentives before features","intro":"Map ownership, vesting, and decision rights before adopting a project.","scenes":[{"id":"ownership","label":"Layer 1","title":"Who controls issuance","body":"Look for clear multisig, treasury and vesting governance around scarce resources.","metric":"Control clarity","tone":"blue"},{"id":"vesting","label":"Layer 2","title":"Release schedule transparency","body":"Unknown unlock schedules can distort future supply and incentives.","metric":"Dilution risk","tone":"orange"},{"id":"accountability","label":"Layer 3","title":"Response history","body":"Teams that acknowledge issues publicly tend to reduce hidden risk.","metric":"Trust repair","tone":"green"},{"id":"redteam","label":"Layer 4","title":"Adversarial incentives","body":"Check who profits if the project fails versus succeeds.","metric":"Alignment","tone":"red"}],"activity":{"kind":"branch","title":"Which sign is most warning for hidden misalignment?","prompt":"Choose the strongest early warning in project review.","options":[{"id":"a","label":"A clear roadmap with fixed dates","verdict":"Not enough alone","feedback":"A roadmap is useful, but misalignment depends on incentives and controls.","tone":"caution"},{"id":"b","label":"Unknown vesting cliffs for key holders","verdict":"High-risk warning","feedback":"Unknown dilution terms can alter long-term value for all holders.","tone":"risk"},{"id":"c","label":"No code commits in 6 months","verdict":"Could be mature or dormant","feedback":"Dormancy may be fine for mature infrastructure, but verify usage and support model first.","tone":"caution"},{"id":"d","label":"Transparent treasury and upgrade policy","verdict":"Positive governance sign","feedback":"Transparent controls improve trust, but still assess technical and usage evidence.","tone":"good"}],"takeaway":"Incentive clarity reduces surprises in volatility and governance stress."} }',
    2,1785666000000
  ),
  (
    'cognizen-p2m6-l03','cognizen-crypto-mastery-part-2-pilot',
    'Tokenomics and supply control under stress','cognizen-p2-module-06','interactive',
    '## Your outcome

You will test whether token design is aligned with long-term usage or short-term extraction.

Supply, inflation, fees, and unlocking are often where promises become obligations.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'A token can sound healthy in price action but still carry undisclosed future supply and governance pressure.',
    '{"version":1,"eyebrow":"Token design","title":"From inflation to extraction","intro":"Use token mechanics to check whether the reward model matches user value.","scenes":[{"id":"supply","label":"Mechanic","title":"Hard cap versus emissions","body":"A clearly explained supply regime is the baseline for any long horizon claim.","metric":"Discipline","tone":"green"},{"id":"inflation","label":"Mechanic","title":"Minting and emission pressure","body":"Ongoing dilution is a direct transfer risk to late entrants.","metric":"Pressure","tone":"red"},{"id":"fees","label":"Mechanic","title":"Fee capture and value retention","body":"High fee extraction can still exist inside healthy throughput systems.","metric":"Economic extraction","tone":"orange"},{"id":"burn","label":"Mechanic","title":"Burn and sink mechanisms","body":"Burns help only when tied to transparent policy and objective conditions.","metric":"Supply quality","tone":"blue"}],"activity":{"kind":"classify","title":"Prioritise tokenomic red flags","prompt":"Classify each signal by immediate investigation urgency.","buckets":[{"id":"critical","label":"Critical","description":"Must be understood before risk sizing"},{"id":"review","label":"Review","description":"Important, but less time critical"},{"id":"context","label":"Context","description":"Useful for comparison, not an immediate block"},{"id":"low","label":"Low","description":"Nice-to-know context"}],"cards":[{"id":"t1","text":"Unlocked investor allocations with no cadence","bucketId":"critical","feedback":"Unscheduled unlocks can be a major future supply shock."},{"id":"t2","text":"No explicit treasury budgeting policy","bucketId":"review","feedback":"Treasury policy matters for long-term stability and support decisions."},{"id":"t3","text":"Clear governance proposal cadence","bucketId":"low","feedback":"Good if combined with public execution evidence and controls."},{"id":"t4","text":"Large periodic emission tied to protocol obligations","bucketId":"critical","feedback":"Sustained emissions must be explicitly modelled in your own outcome assumptions."}],"takeaway":"Tokenomics are a stress test, not a branding line."} }',
    3,1785666000000
  ),
  (
    'cognizen-p2m6-l04','cognizen-crypto-mastery-part-2-pilot',
    'Usage proof and liquidity realism','cognizen-p2-module-06','interactive',
    '## Your outcome

You will separate one-off volume from reliable usage patterns.

Learning to read usage quality helps you avoid projects with high novelty but weak persistence.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'High short-term liquidity without durable usage often reverses abruptly under stress.',
    '{"version":1,"eyebrow":"Usage evidence","title":"Quality over hype volume","intro":"Evidence of recurring and resilient usage beats one-day spikes.","scenes":[{"id":"volume","label":"Metric 1","title":"Volume quality","body":"Look for recurring usage cohorts, not only headline bursts.","metric":"Stickiness","tone":"blue"},{"id":"liquidity","label":"Metric 2","title":"Depth and resilience","body":"Test whether liquidity holds when volatility increases.","metric":"Execution quality","tone":"green"},{"id":"repeat","label":"Metric 3","title":"Repeat cohorts","body":"Usage by the same participants over time suggests real activity.","metric":"Retention","tone":"orange"},{"id":"failure","label":"Metric 4","title":"Failure mode","body":"Map what happens when incentives or fees change.","metric":"Resilience","tone":"red"}],"activity":{"kind":"meter","title":"Read usage quality by condition","prompt":"Move sliders on project usage evidence before increasing commitment.","dimensions":[{"id":"repeat","label":"Repeat usage","lowLabel":"One-time spikes","highLabel":"Recurring cohorts","weight":1.3,"initial":30},{"id":"depth","label":"Depth resilience","lowLabel":"Fragile","highLabel":"Robust under stress","weight":1.2,"initial":28},{"id":"transparency","label":"Data transparency","lowLabel":"Narrative-only","highLabel":"On-chain + docs","weight":1.1,"initial":38},{"id":"cost","label":"Fee burden","lowLabel":"Opaque","highLabel":"Clear + predictable","weight":1,"initial":35}],"thresholds":[{"max":39,"label":"Usage unclear","feedback":"Use a smaller position and verify additional evidence first.","tone":"risk"},{"max":69,"label":"Useful but incomplete","feedback":"Usage signals are promising but missing key durability checks.","tone":"caution"},{"max":100,"label":"Usage supports cautious commitment","feedback":"Recurring usage and depth resilience are strong directional evidence.","tone":"good"}]},"takeaway":"Demand is stronger when usage survives routine stress, not only launch moments."}',
    4,1785666000000
  ),
  (
    'cognizen-p2m6-l05','cognizen-crypto-mastery-part-2-pilot',
    'Build your project evaluation dossier','cognizen-p2-module-06','interactive',
    '## Your outcome

Create a compact, portable project review that includes:

- Thesis and category
- Team/incentive risk summary
- Tokenomic exposures
- Usage and liquidity checks
- A go/no-go trigger list

This lesson turns analysis into a repeatable artifact.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'A reusable dossier prevents emotional or attention-led choices when comparing projects.',
    '{"version":1,"eyebrow":"Build artifact","title":"Create a practical review","intro":"Force hard boundaries before position sizing.","scenes":[{"id":"thesis","label":"Checklist","title":"Write the thesis","body":"State exactly what the project claims and whom it serves.","metric":"Precision","tone":"blue"},{"id":"incentives","label":"Checklist","title":"Map incentives","body":"Name dilution, vesting, and treasury vulnerabilities.","metric":"Control","tone":"orange"},{"id":"usage","label":"Checklist","title":"Measure quality","body":"Assign confidence to recurring usage metrics.","metric":"Durability","tone":"green"},{"id":"decide","label":"Checklist","title":"Define next action","body":"Choose whether to learn, monitor, scale down, or avoid.","metric":"Decision quality","tone":"blue"}],"activity":{"kind":"meter","title":"Dossier readiness","prompt":"Move each dial and only proceed if the dossier is ready.","dimensions":[{"id":"thesis","label":"Thesis clarity","lowLabel":"Unclear","highLabel":"Clear","weight":1.2,"initial":34},{"id":"control","label":"Governance control","lowLabel":"Low","highLabel":"High","weight":1.1,"initial":20},{"id":"tokens","label":"Tokenomic stress","lowLabel":"Unknown","highLabel":"Modelled","weight":1.3,"initial":22},{"id":"execution","label":"Execution realism","lowLabel":"Assumed","highLabel":"Tested","weight":1.3,"initial":18}],"thresholds":[{"max":39,"label":"Not ready","feedback":"Gather missing evidence before risk-taking.","tone":"risk"},{"max":69,"label":"Needs tightening","feedback":"Clear thesis but missing one critical control dimension.","tone":"caution"},{"max":100,"label":"Ready","feedback":"You now have enough evidence quality to proceed with a controlled action.","tone":"good"}]}}',
    5,1785666000000
  ),
  (
    'cognizen-p2m6-l06','cognizen-crypto-mastery-part-2-pilot',
    'Check your understanding','cognizen-p2-module-06','quiz',
    '## Your outcome

Review your project evaluation workflow and choose safer next action under uncertainty.',
    'markdown',NULL,NULL,NULL,4,0,0,0,'','',6,1785666000000
  )
)
WHERE EXISTS (
  SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-part-2-pilot'
);
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
  (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
SELECT 'cognizen-p2m6-quiz','cognizen-p2m6-l06','Evaluating Cryptocurrency Projects',80,0
WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cognizen-p2m6-l06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
  (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
SELECT column1,column2,column3,column4,column5,column6,column7,column8
FROM (VALUES
  ('cognizen-p2m6-q01','cognizen-p2m6-quiz','What is the best first check when evaluating a new project?', '["Token price action","Project thesis and category","Twitter engagement","Exchange price trend"]',1,'Start with the thesis and category so later evidence is interpreted correctly.','Evaluation order',1),
  ('cognizen-p2m6-q02','cognizen-p2m6-quiz','Which signal is most urgent in a governance review?', '["Marketing campaign cadence","Team control and vesting disclosures","Number of Telegram messages","Logo consistency"]',1,'Governance and vesting explain who benefits and how risks can become concentrated.','Governance',2),
  ('cognizen-p2m6-q03','cognizen-p2m6-quiz','An unknown unlock schedule is mainly a risk to:','["Brand value","Execution simplicity","Supply dilution","Social sentiment"]',2,'Unknown unlock mechanics can distort long-term fairness and user expectations.','Tokenomics',3),
  ('cognizen-p2m6-q04','cognizen-p2m6-quiz','What indicates recurring usage rather than hype spikes?', '["One-time exchange liquidity","Recurring on-chain cohorts","A single launch thread","A large number of emojis on social media"]',1,'Recurring cohorts and repeated usage are stronger indicators of lasting ecosystem activity.','Demand quality',4),
  ('cognizen-p2m6-q05','cognizen-p2m6-quiz','Which rule helps reduce premature commitments?', '["Skip all checks when price rises","Define a dossier before sizing","Follow top traders immediately","Ignore vesting and focus on charts"]',1,'A dossier-first process preserves optionality and reduces irreversible decisions.','Process discipline',5),
  ('cognizen-p2m6-q06','cognizen-p2m6-quiz','In this module, a strong tokenomic signal to avoid is:', '["No emissions","Transparent treasury rules","Unknown dilution cliffs","Clear upgrade proposals"]',0,'Unknown dilution cliffs increase execution and valuation risk and deserve immediate attention.','Tokenomics',6),
  ('cognizen-p2m6-q07','cognizen-p2m6-quiz','Project usability under stress is best judged by:', '["Only headline liquidity","Depth and resilience tests","How often founders post","Number of partnerships"]',1,'Depth and resilience reveal whether the project can handle adverse conditions.','Stress resilience',7),
  ('cognizen-p2m6-q08','cognizen-p2m6-quiz','What is the purpose of a project review dossier?', '["To hide decisions","To support fast emotional reactions","To make commitments repeatable","To track followers"]',2,'A dossier captures thesis, risks, and action rules so decisions are repeatable.','Decision quality',8),
  ('cognizen-p2m6-q09','cognizen-p2m6-quiz','If team credibility is unclear, the prudent next step is:', '["Increase leverage","Define missing evidence and monitor","Assume best case","Shorten review steps"]',1,'When critical evidence is unclear, reduce speed and gather hard evidence.','Risk control',9),
  ('cognizen-p2m6-q10','cognizen-p2m6-quiz','Which is the strongest statement from this module?', '["Attention is always enough","Evidence sequence reduces bias","One indicator should rule all","No need to document triggers"]',1,'A reliable sequence of evidence checks is what reduces bias and overconfidence.','Core principle',10),
  ('cognizen-p2m6-q11','cognizen-p2m6-quiz','Which element belongs in the final trigger list?', '["Favourite influencer","Clear review condition","Latest meme","Random token name"]',1,'Triggers should be objective conditions tied to your evidence gaps.','Triggers',11),
  ('cognizen-p2m6-q12','cognizen-p2m6-quiz','Before changing position size, the strongest next action is usually:', '["Only increasing exposure","Re-check thesis and evidence","Doubling watch time","Reducing all data"]',1,'Re-checking thesis and evidence protects you from regime, governance, and supply surprises.','Execution discipline',12)
)
WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cognizen-p2m6-quiz');
