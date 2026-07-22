ALTER TABLE `lessons` ADD `experience_json` text DEFAULT '' NOT NULL;
--> statement-breakpoint
INSERT OR IGNORE INTO `courses`
  (`id`,`school_id`,`owner_id`,`title`,`description`,`status`,`price_cents`,
   `enforce_lesson_order`,`available_from`,`certificate_title`,
   `certificate_accent`,`certificate_valid_days`,`created_at`,`updated_at`)
SELECT
  'cognizen-crypto-mastery-part-2-pilot',
  target.`id`,
  target.`owner_id`,
  'Crypto Mastery: Markets and Applications — Interactive pilot',
  'A private production pilot for Module 2.3. Learners investigate market sentiment, test narratives against evidence, recognise manipulation, and make a confidence-rated conclusion.',
  'draft',0,1,NULL,
  'NorthstarLabs Module Distinction: Market Evidence',
  '#3556d8',0,1784682000000,1784682000000
FROM `schools` target
WHERE target.`slug`='cognizen-consulting'
LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections`
  (`id`,`course_id`,`title`,`position`,`created_at`)
SELECT
  'cognizen-p2-module-03',
  'cognizen-crypto-mastery-part-2-pilot',
  'Module 2.3: Market Sentiment, Narratives and Evidence',
  1,1784682000000
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
    'cognizen-p2m3-l01','cognizen-crypto-mastery-part-2-pilot',
    'Attention is not conviction','cognizen-p2-module-03','interactive',
    '## Your outcome

Separate attention, expressed sentiment, positioning and fundamental evidence before drawing a market conclusion.

## Four signals that look similar but are not

**Attention** measures how much notice a topic receives. **Sentiment** describes the attitude expressed. **Positioning** is partial evidence of exposure actually taken. **Fundamentals** concern use, economics, security and value capture.

A spike in searches, mentions or views may reflect curiosity, criticism, fear, promotion or reaction to price. It does not by itself demonstrate belief, capital commitment or adoption.

## Evidence rule

Write the narrowest claim that the evidence supports. “Search interest rose” is defensible. “New long-term buyers arrived” requires independent evidence.

Sources: [Google Trends data FAQ](https://support.google.com/trends/answer/4365533?hl=en-GB) and [FINRA overview of social-media-influenced investing](https://www.finra.org/rules-guidance/key-topics/fintech/report/social-media-influenced-investing/overview).',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Attention is visibility. Sentiment is an expressed attitude. Positioning is exposure taken. Fundamentals are evidence about use and economics. Treat each as a different signal. A popular topic may still have weak conviction and weak adoption.',
    '{"version":1,"eyebrow":"Market signal lab","title":"The chart moved. What actually changed?","intro":"Follow a fictional token through four evidence states, then classify the signals yourself.","scenes":[{"id":"spark","label":"Scene 1 · The spark","title":"A token doubles in forty-eight hours","body":"Price attracts attention. Search activity and social mentions rise after the move has already started.","metric":"Price +102%","tone":"orange"},{"id":"noise","label":"Scene 2 · The noise","title":"Everyone appears to be talking","body":"Most posts repeat the same claim. Several large accounts disclose no evidence, method or financial incentive.","metric":"Mentions +640%","tone":"red"},{"id":"behaviour","label":"Scene 3 · The behaviour","title":"Committed use is still flat","body":"Verified active use, fee demand and developer delivery show no comparable change. Attention has not become adoption.","metric":"Verified use +1%","tone":"blue"},{"id":"conclusion","label":"Scene 4 · The conclusion","title":"Make only the claim the evidence earns","body":"The defensible finding is rising attention and price, not durable conviction or fundamental improvement.","metric":"Confidence: low","tone":"green"}],"activity":{"kind":"classify","title":"Name the signal before interpreting it","prompt":"Place each observation in the category it directly measures. Do not infer more than the evidence shows.","buckets":[{"id":"attention","label":"Attention","description":"Notice, searches, views or mentions"},{"id":"positioning","label":"Positioning","description":"Capital or exposure actually taken"},{"id":"fundamentals","label":"Fundamentals","description":"Use, economics, security or delivery"}],"cards":[{"id":"c1","text":"Search interest reaches its highest relative level of the year.","bucketId":"attention","feedback":"Relative search interest measures attention, not belief or purchases."},{"id":"c2","text":"Regulated fund flows remain positive for four consecutive weeks.","bucketId":"positioning","feedback":"Flows provide partial evidence that exposure was actually taken."},{"id":"c3","text":"Verified fee-paying use grows while incentives decline.","bucketId":"fundamentals","feedback":"Sustained use and economics are closer to fundamental evidence."}]},"takeaway":"Always label the evidence type before deciding what it means."}',
    1,1784682000000
  ),
  (
    'cognizen-p2m3-l02','cognizen-crypto-mastery-part-2-pilot',
    'How market narratives spread','cognizen-p2-module-03','interactive',
    '## Your outcome

Recognise the stages of a market narrative and identify what would validate or break it.

## The lifecycle

A narrative commonly moves through emergence, validation, diffusion, monetisation, saturation, and either fracture or maturity. The sequence is not automatic. Evidence can strengthen a story, weaken it, or reveal that promotion has replaced substance.

## Turn stories into tests

Replace “this sector is the future” with observable conditions: sustained users, economic activity, technical delivery, broad participation and manageable risk. Define the evidence that would invalidate the claim before excitement is high.

## Narrative discipline

A good narrative is a hypothesis that can be updated. A bad narrative absorbs every outcome and can never be disproved.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Narratives help markets organise complex information, but a memorable story is not evidence. Track the story from emergence through validation, diffusion, monetisation and saturation. Decide in advance what observable result would weaken or invalidate it.',
    '{"version":1,"eyebrow":"Narrative lifecycle","title":"When does a story become evidence?","intro":"Watch a credible idea move from an early hypothesis to either durable adoption or promotional excess.","scenes":[{"id":"emerge","label":"Stage 1 · Emergence","title":"A useful claim appears","body":"A new technical capability creates a plausible hypothesis. Awareness is limited and evidence is incomplete.","metric":"Hypothesis","tone":"blue"},{"id":"validate","label":"Stage 2 · Validation","title":"Independent behaviour changes","body":"Users, developers and economic activity begin to confirm parts of the claim through different processes.","metric":"Evidence grows","tone":"green"},{"id":"diffuse","label":"Stage 3 · Diffusion","title":"The explanation becomes simple","body":"Media and promoters compress nuance into a memorable story. Reach expands faster than understanding.","metric":"Attention accelerates","tone":"orange"},{"id":"saturate","label":"Stage 4 · Saturation","title":"The story explains everything","body":"Expectations become crowded. Contradictory evidence is dismissed and price itself is treated as proof.","metric":"Fragility rises","tone":"red"}],"activity":{"kind":"branch","title":"You are reviewing a fast-moving narrative","prompt":"A scaling project announces a partnership. Mentions triple, price rises, and the announcement contains no implementation dates. What is the strongest next step?","options":[{"id":"buy-story","label":"Treat the price move as proof that adoption has arrived.","verdict":"Narrative captured the analysis","feedback":"Price and attention are observations, but neither establishes implementation, use or economic value.","tone":"risk"},{"id":"dismiss","label":"Dismiss every partnership announcement as promotion.","verdict":"Too absolute","feedback":"Scepticism is useful, but the evidence may improve. Record what would validate delivery instead of deciding in advance.","tone":"caution"},{"id":"test","label":"Define implementation, usage and economic milestones, then monitor them.","verdict":"Evidence-led response","feedback":"This converts the story into a revisable hypothesis with observable validation and failure conditions.","tone":"good"}]},"takeaway":"A narrative becomes useful when it states assumptions that evidence can confirm or disprove."}',
    2,1784682000000
  ),
  (
    'cognizen-p2m3-l03','cognizen-crypto-mastery-part-2-pilot',
    'Build an evidence ladder','cognizen-p2-module-03','interactive',
    '## Your outcome

Rank market claims by proximity, independence, transparency and incentive.

## Four levels

Primary evidence includes official technical documents, reproducible code, verifiable network data and formal filings. Reputable analysis explains methods and limitations. Public commentary can supply hypotheses but often lacks verification. Anonymous or promotional claims deserve the least confidence.

## Independence matters

Five indicators derived from the same price series are not five independent confirmations. Several accounts repeating one press release are still one information source. Prefer evidence produced by different processes that could genuinely disagree.

## Contradictions are information

Record evidence against the claim. If contrary evidence cannot change the conclusion, the exercise is advocacy rather than analysis.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Build an evidence ladder. Put verifiable primary material at the top, transparent analysis below it, commentary below that, and anonymous promotion at the bottom. Then check whether apparently different signals come from the same underlying source.',
    '{"version":1,"eyebrow":"Evidence ladder","title":"Not every source deserves equal weight","intro":"Compare evidence by proximity to the event, independence, transparency and incentive.","scenes":[{"id":"primary","label":"Level 1 · Primary","title":"Closest to the behaviour","body":"Formal filings, reproducible code, verified network activity and signed announcements can be inspected directly.","metric":"Highest starting weight","tone":"green"},{"id":"analysis","label":"Level 2 · Analysis","title":"Method and limitations are visible","body":"Credible analysts disclose data, assumptions, conflicts and what the method cannot establish.","metric":"Useful with review","tone":"blue"},{"id":"commentary","label":"Level 3 · Commentary","title":"A source of hypotheses","body":"Public opinions may identify a question but usually need independent verification before supporting a conclusion.","metric":"Low starting weight","tone":"orange"},{"id":"promotion","label":"Level 4 · Promotion","title":"Incentive overwhelms evidence","body":"Anonymous urgency, guaranteed outcomes and undisclosed sponsorship are warnings, not confirmation.","metric":"Do not rely on it","tone":"red"}],"activity":{"kind":"classify","title":"Place each claim on the evidence ladder","prompt":"Classify the source by what it actually provides, not by how confident it sounds.","buckets":[{"id":"primary","label":"Primary evidence","description":"Direct and independently inspectable"},{"id":"analysis","label":"Transparent analysis","description":"Method, assumptions and limitations disclosed"},{"id":"promotion","label":"Promotion or assertion","description":"Weak verification or strong incentive"}],"cards":[{"id":"e1","text":"A public repository shows the released code and reproducible test results.","bucketId":"primary","feedback":"The release can be inspected directly, although quality and adoption still require evaluation."},{"id":"e2","text":"A research note publishes its dataset, method and sensitivity analysis.","bucketId":"analysis","feedback":"Transparent method improves credibility while leaving assumptions open to challenge."},{"id":"e3","text":"An anonymous account promises a guaranteed return before a secret announcement.","bucketId":"promotion","feedback":"Urgency, anonymity and guaranteed outcomes are classic warning signs."},{"id":"e4","text":"Six influencers repeat one sponsored press release without disclosure.","bucketId":"promotion","feedback":"Repetition does not create independent confirmation."}]},"takeaway":"Count independent evidence-generating processes, not the number of charts or people repeating the claim."}',
    3,1784682000000
  ),
  (
    'cognizen-p2m3-l04','cognizen-crypto-mastery-part-2-pilot',
    'Investigate a market story','cognizen-p2-module-03','interactive',
    '## Your outcome

Investigate a market story without being captured by urgency, social proof or price action.

## The fictional case

NovaBridge claims that its token will become essential infrastructure. Price rises 180% in ten days. Promoters cite a partnership, but the partner announcement describes only an exploratory pilot. Wallet activity rises, while most new activity comes from incentive farming. Token liquidity remains shallow and insiders have a large unlock in six weeks.

## Investigation sequence

State the question, define the timeframe, record the narrative, collect independent evidence, check incentives, search for contradictions, assign confidence, and specify what would change the assessment.

Sources on manipulation risk: [CFTC pump-and-dump advisory](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/beware_virtual_currency_pump_dump.html), [SEC Investor.gov social-media fraud guidance](https://www.investor.gov/protect-your-investments/fraud/types-fraud/internet-and-social-media-fraud), and the [FSCA public warning on impersonation and fraudulent investment schemes](https://www.fsca.co.za/News%20Documents/FSCA%20Press%20Release%20-%20FSCA%20public%20warning%20Surge%20in%20impersonation%20and%20fraudulent%20investment%20schemes.pdf).',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Investigate a market story in a fixed order. State the question and timeframe. Record the claim. Collect independent evidence. Check authenticity and incentives. Search for contradictions. Assign confidence rather than certainty, and define what would change your assessment.',
    '{"version":1,"eyebrow":"Branching investigation","title":"NovaBridge is everywhere. What do you do next?","intro":"The project is fictional, but the evidence pattern is realistic. Your decision changes the quality of the investigation.","scenes":[{"id":"headline","label":"Evidence card 1","title":"Price rises 180% in ten days","body":"The move is real, but it cannot tell you whether adoption caused price or attention followed price.","metric":"Strong market reaction","tone":"orange"},{"id":"partner","label":"Evidence card 2","title":"The partnership is exploratory","body":"The primary announcement describes a pilot with no production commitment, volume target or implementation date.","metric":"Claim exceeds source","tone":"red"},{"id":"usage","label":"Evidence card 3","title":"Activity is incentive-driven","body":"Wallet counts rise, but most activity receives rewards that end next month. Durable demand is not established.","metric":"Use quality uncertain","tone":"blue"},{"id":"unlock","label":"Evidence card 4","title":"A large insider unlock approaches","body":"Shallow liquidity and concentrated supply could amplify volatility regardless of the technology.","metric":"Risk elevated","tone":"red"}],"activity":{"kind":"branch","title":"Choose the research conclusion","prompt":"Which conclusion is strongest at this evidence stage?","options":[{"id":"confirmed","label":"The partnership confirms durable adoption and justifies high confidence.","verdict":"Evidence overreach","feedback":"The primary source confirms only an exploratory pilot. Incentivised activity and supply risk contradict the stronger claim.","tone":"risk"},{"id":"fraud","label":"The project is definitely fraudulent and has no possible value.","verdict":"Unsupported certainty","feedback":"Several warnings justify caution, but the evidence does not prove fraud or permanent failure. Define validation conditions.","tone":"caution"},{"id":"conditional","label":"Attention is high, adoption is unproven, and confidence stays low until independent milestones appear.","verdict":"Proportionate conclusion","feedback":"This conclusion separates what is observed from what remains unknown and identifies the need for new evidence.","tone":"good"}]},"takeaway":"Urgency is a reason to slow the investigation, not lower the evidence standard."}',
    4,1784682000000
  ),
  (
    'cognizen-p2m3-l05','cognizen-crypto-mastery-part-2-pilot',
    'Make a confidence-rated decision','cognizen-p2-module-03','interactive',
    '## Your outcome

Produce a conclusion that states evidence, limitations, confidence and a review trigger.

## The decision record

Use four sentences: what is observed, what it may mean, what contradicts it, and what evidence would change the assessment. This prevents a provisional view from becoming an identity.

## Confidence is not probability

Low, moderate or high confidence describes the quality and completeness of the evidence supporting the conclusion. It is not a guaranteed price forecast.

## Review trigger

Specify a date, event or measurable threshold for reassessment. New primary evidence, changed economics, a security failure, broader participation or the end of incentives may each justify an update.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'A professional conclusion is revisable. State the observation, interpretation, contradiction, confidence level and review trigger. Confidence describes evidence quality, not certainty about future price.',
    '{"version":1,"eyebrow":"Analyst workbench","title":"Turn mixed evidence into a disciplined conclusion","intro":"Adjust the evidence dimensions. The result changes as source quality, independence, behaviour and contradiction change.","scenes":[{"id":"question","label":"Step 1 · Question","title":"Write one narrow question","body":"Use a specific timeframe and outcome. Avoid asking whether an asset is simply good, bad or destined to rise.","metric":"Scope first","tone":"blue"},{"id":"evidence","label":"Step 2 · Evidence","title":"Collect signals that can disagree","body":"Combine primary material, behaviour, economics and market structure instead of repeating one source in several forms.","metric":"Independence matters","tone":"green"},{"id":"contradict","label":"Step 3 · Contradiction","title":"Search for the strongest opposing fact","body":"A useful conclusion explains adverse evidence rather than hiding it.","metric":"Actively challenge","tone":"orange"},{"id":"trigger","label":"Step 4 · Review","title":"Decide what would change your mind","body":"A dated review trigger keeps the assessment falsifiable and prevents emotional attachment.","metric":"Stay revisable","tone":"green"}],"activity":{"kind":"meter","title":"Build an evidence confidence rating","prompt":"Move each slider to describe the fictional NovaBridge case after your investigation.","dimensions":[{"id":"source","label":"Primary-source quality","lowLabel":"Anonymous","highLabel":"Directly verified","weight":1.2,"initial":40},{"id":"independence","label":"Independent confirmation","lowLabel":"One repeated source","highLabel":"Different processes agree","weight":1.3,"initial":30},{"id":"behaviour","label":"Durable user behaviour","lowLabel":"Incentive-driven","highLabel":"Sustained organic use","weight":1.1,"initial":20},{"id":"economics","label":"Economic evidence","lowLabel":"Unclear value capture","highLabel":"Defensible economics","weight":1,"initial":30},{"id":"contradiction","label":"Contradictions resolved","lowLabel":"Major conflicts remain","highLabel":"Conflicts explained","weight":1.2,"initial":20}],"thresholds":[{"max":39,"label":"Low confidence","feedback":"State only the observations. Do not convert the narrative into a directional claim. Define the evidence needed for reassessment.","tone":"risk"},{"max":69,"label":"Moderate confidence","feedback":"Some independent evidence exists, but important limitations remain. Keep exposure to the conclusion provisional.","tone":"caution"},{"max":100,"label":"Higher confidence","feedback":"Multiple independent processes support the claim, but the conclusion remains conditional and needs a review trigger.","tone":"good"}]},"takeaway":"The strongest conclusion is not the boldest. It is the one whose confidence matches the evidence."}',
    5,1784682000000
  ),
  (
    'cognizen-p2m3-l06','cognizen-crypto-mastery-part-2-pilot',
    'Check your understanding','cognizen-p2-module-03','quiz',
    '## Your outcome

Demonstrate that you can separate attention from conviction, test narratives, rank evidence and recognise manipulation.

Answer all twelve questions. After submission, use the explanation and concept-specific remediation to correct weak reasoning before trying again.',
    'markdown',NULL,NULL,NULL,4,0,0,0,'','',6,1784682000000
  )
)
WHERE EXISTS (
  SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-part-2-pilot'
);
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
  (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
SELECT 'cognizen-p2m3-quiz','cognizen-p2m3-l06','Market Sentiment, Narratives and Evidence',80,0
WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cognizen-p2m3-l06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
  (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
SELECT column1,column2,column3,column4,column5,column6,column7,column8
FROM (VALUES
  ('cognizen-p2m3-q01','cognizen-p2m3-quiz','Which statement best distinguishes attention from conviction?','["Attention measures notice; conviction concerns belief or commitment","Attention is on-chain; conviction is search data","Attention is always positive","There is no difference"]',0,'Searches, mentions and views can increase because of curiosity, criticism or fear. They do not prove belief or capital commitment. Review: Attention is not conviction.','Attention versus conviction',1),
  ('cognizen-p2m3-q02','cognizen-p2m3-quiz','Why is a Google Trends score of 100 not an absolute search count?','["It is normalised to the selected comparison and peak interest","It excludes every search outside the United States","It measures only advertisements","It represents exactly one hundred searches"]',0,'Google Trends publishes sampled and normalised relative interest, not an absolute number of searches. Review: Attention is not conviction.','Search-data interpretation',2),
  ('cognizen-p2m3-q03','cognizen-p2m3-quiz','Which combination gives the strongest independent confirmation?','["Five sentiment scores derived from the same posts","Search interest, verified use, sustainable economics and broad liquid participation","Three influencers repeating one claim","Price plus two indicators derived from that price"]',1,'Independent confirmation comes from meaningfully different processes that can disagree. Review: Build an evidence ladder.','Independent evidence',3),
  ('cognizen-p2m3-q04','cognizen-p2m3-quiz','Positive posts surge immediately after a token doubles. What can be concluded safely?','["Durable adoption is proven","Fundamentals improved","Attention and expressed optimism increased; causality and adoption remain unproven","The price cannot fall"]',2,'Social activity after appreciation may be reactive, coordinated or promotional. It does not establish adoption or value. Review: Attention is not conviction.','Causality and social data',4),
  ('cognizen-p2m3-q05','cognizen-p2m3-quiz','Which is the clearest pump-and-dump warning sign?','["Reproducible released code","Anonymous urgency around an illiquid token with unusually high return promises","A dated regulator consultation","Disclosed risks and token unlocks"]',1,'Urgency, anonymity, unrealistic return claims and low liquidity are prominent manipulation warnings. Review: Investigate a market story.','Manipulation risk',5),
  ('cognizen-p2m3-q06','cognizen-p2m3-quiz','What should happen when fundamental evidence contradicts a popular narrative?','["Delete the contradiction","Record it, reduce confidence and define what would resolve it","Assume critics manipulated it","Increase exposure immediately"]',1,'Contradictory evidence should change confidence or risk rather than be suppressed. Review: Build an evidence ladder.','Contradictory evidence',6),
  ('cognizen-p2m3-q07','cognizen-p2m3-quiz','Which statement correctly describes a sentiment index?','["It is objective regardless of method","It predicts the next price move","It summarises selected inputs and weights that must be understood","It is reliable only with social data"]',2,'A composite score inherits the assumptions, overlap and limitations of its inputs and weights. Review: Make a confidence-rated decision.','Composite sentiment indices',7),
  ('cognizen-p2m3-q08','cognizen-p2m3-quiz','What does positioning evidence add that public opinion does not?','["Every participant identity and motive","Partial evidence of exposure actually taken","A guarantee that positions stay open","No need to analyse liquidity"]',1,'Flows and positions provide evidence of action, but not complete identity, motive or future behaviour. Review: Attention is not conviction.','Positioning versus opinion',8),
  ('cognizen-p2m3-q09','cognizen-p2m3-quiz','Which question turns a narrative into a testable claim?','["How exciting is the story?","How often was it repeated?","Which observable facts must become true for durable value?","How quickly can price double?"]',2,'A useful narrative states assumptions that can be tested against use, economics, participation and risk. Review: How market narratives spread.','Narrative testing',9),
  ('cognizen-p2m3-q10','cognizen-p2m3-quiz','Why include a review trigger in a sentiment assessment?','["To guarantee the view never changes","To define evidence that would strengthen, weaken or invalidate it","To schedule automatic purchases","To prevent contradictory evidence"]',1,'A review trigger makes analysis revisable and prevents an unfalsifiable belief. Review: Make a confidence-rated decision.','Review discipline',10),
  ('cognizen-p2m3-q11','cognizen-p2m3-quiz','Which belongs highest on the evidence ladder?','["An anonymous partnership promise","Undisclosed paid promotion","Official technical documentation and verifiable network data","An undated screenshot"]',2,'Primary evidence is closest to the event or behaviour and can be verified more directly. Review: Build an evidence ladder.','Evidence hierarchy',11),
  ('cognizen-p2m3-q12','cognizen-p2m3-quiz','What is the principal limitation of sentiment analysis?','["It cannot use numbers","It observes incomplete mood and attention indicators but cannot guarantee future price direction","It applies only to securities","It never changes"]',1,'Sentiment is inferred from imperfect evidence. It provides context, not certainty or a stand-alone forecast. Review: Make a confidence-rated decision.','Limits of sentiment analysis',12)
)
WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cognizen-p2m3-quiz');
