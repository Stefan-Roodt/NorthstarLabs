INSERT OR IGNORE INTO `course_sections`
  (`id`,`course_id`,`title`,`position`,`created_at`)
SELECT
  'cognizen-p2-module-05',
  'cognizen-crypto-mastery-part-2-pilot',
  'Module 2.5: Introduction to Fundamental Analysis',
  2,1785667200000
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
    'cognizen-p2m5-l01','cognizen-crypto-mastery-part-2-pilot',
    'What fundamental analysis is (and is not)','cognizen-p2-module-05','interactive',
    '## Your outcome

You will define fundamental analysis for digital assets and separate it from price-chasing reactions.

Crypto prices can move because of attention, liquidity cycles, and narratives. Fundamental analysis looks at what the project, network and token are doing over time.

In this lesson, you will distinguish long-horizon evidence from short-run signal noise and identify the basic evidence domains that support a thesis.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Price tells you what happened in the market. Fundamental analysis asks what may sustain value over time.',
    '{"version":1,"eyebrow":"Analysis foundation","title":"Classify evidence by type","intro":"Identify what kind of claim each observation supports.","scenes":[{"id":"what","label":"Evidence type","title":"Price vs evidence","body":"A price move is visible data, not proof of demand, adoption, or sustainability on its own.","metric":"Signal category","tone":"blue"},{"id":"scope","label":"Evidence type","title":"Scope check","body":"Short-term indicators should not replace long-horizon evidence about use, economics and risk.","metric":"Time horizon","tone":"green"},{"id":"framework","label":"Evidence type","title":"Evidence domains","body":"Project, network, token, team, economics, governance and regulation all matter.","metric":"Coverage","tone":"orange"},{"id":"decision","label":"Evidence type","title":"Decision rule","body":"Choose conclusions that can be overturned by future evidence.","metric":"Revisability","tone":"green"}],"activity":{"kind":"classify","title":"Classify each statement","prompt":"Which statement is best described as a fundamental analysis topic?","buckets":[{"id":"fundamental","label":"Fundamental evidence","description":"Project, ecosystem, tokenomics or adoption evidence"},{"id":"technical","label":"Price chart observation","description":"Chart shape and momentum context"},{"id":"opinion","label":"Narrative preference","description":"A compelling story without verifiable evidence"}],"cards":[{"id":"c1","text":"A team announces a product launch in a verified repository update.","bucketId":"fundamental","feedback":"A verifiable product update is relevant to fundamental analysis."},{"id":"c2","text":"A token reaches a social media hashtag high.","bucketId":"opinion","feedback":"This is narrative pressure unless connected to adoption or economics."},{"id":"c3","text":"Transaction volume grows and fee demand remains meaningful.","bucketId":"fundamental","feedback":"This can be a useful adoption/economic signal if sustained."}],"takeaway":"Evidence quality and scope matter more than signal intensity."} }',
    1,1785667200000
  ),
  (
    'cognizen-p2m5-l02','cognizen-crypto-mastery-part-2-pilot',
    'Project, network, token: keep the distinctions clear','cognizen-p2-module-05','interactive',
    '## Your outcome

You will separate the project, protocol, network, and token so assumptions are precise.

A good project can have strong technology and weak token economics. A token can have real utility and weak team execution, or vice versa.

You will practice framing each part with different questions and evidence sources.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Do not assume token value, company value, and network value are the same thing.',
    '{"version":1,"eyebrow":"Component clarity","title":"The same name can hide different assets","intro":"Map what each part does before you evaluate value.","scenes":[{"id":"project","label":"Scope","title":"Project layer","body":"A product roadmap, team and mission describe an initiative.","metric":"Execution layer","tone":"blue"},{"id":"network","label":"Scope","title":"Network layer","body":"Protocol activity and participation show how the system works.","metric":"Utility layer","tone":"green"},{"id":"token","label":"Scope","title":"Token layer","body":"Token utility, ownership claims and demand are separate questions.","metric":"Economic layer","tone":"orange"},{"id":"company","label":"Scope","title":"Company layer","body":"A foundation or company can exist without giving holders the same rights.","metric":"Legal layer","tone":"blue"}],"activity":{"kind":"classify","title":"Match claim to right layer","prompt":"Place each claim under project, network, token, or company.","buckets":[{"id":"project","label":"Project","description":"Product mission, roadmap, execution"},{"id":"network","label":"Network","description":"Protocol operation and participation"},{"id":"token","label":"Token","description":"Token purpose, supply, usage, governance"},{"id":"company","label":"Company/Foundation","description":"Org structure and legal ownership"}],"cards":[{"id":"a1","text":"A token is required to pay network fees.","bucketId":"token","feedback":"Fee utility is a token-function question."},{"id":"a2","text":"Developers deliver a protocol upgrade proposal.","bucketId":"network","feedback":"This is about network operation and protocol maintenance."},{"id":"a3","text":"The foundation publishes a budget and team updates.","bucketId":"company","feedback":"That is organisational governance evidence."}],"takeaway":"Layer clarity prevents false conclusions about who benefits from what."} }',
    2,1785667200000
  ),
  (
    'cognizen-p2m5-l03','cognizen-crypto-mastery-part-2-pilot',
    'Assess demand, product, adoption and team execution','cognizen-p2-module-05','interactive',
    '## Your outcome

You will build a practical sequence for evaluating demand and execution.

First confirm there is a real problem and realistic target market. Then validate whether product delivery exists, adoption persists, and the team can execute over time.

You will also distinguish organic user behaviour from incentive-driven activity.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Demand, delivery, and execution consistency are core: no one layer compensates for another.',
    '{"version":1,"eyebrow":"Fundamental sequence","title":"Evaluate before you speculate","intro":"Use this sequence on a real project and reduce assumptions.","scenes":[{"id":"problem","label":"Step 1","title":"Problem validity","body":"Ask if the project addresses a meaningful, recurrent problem.","metric":"Problem clarity","tone":"blue"},{"id":"delivery","label":"Step 2","title":"Product evidence","body":"Check for testnet/mainnet use and operational signals.","metric":"Execution evidence","tone":"green"},{"id":"adoption","label":"Step 3","title":"Adoption persistence","body":"Look for returning users, real activity, not just one-off campaign spikes.","metric":"Retention","tone":"orange"},{"id":"team","label":"Step 4","title":"Execution team","body":"Evaluate contributor breadth, roadmap delivery and responsiveness.","metric":"Delivery reliability","tone":"green"}],"activity":{"kind":"branch","title":"What is the strongest first step?","prompt":"You find high social sentiment, low product activity, and a delayed roadmap. What is best next?","options":[{"id":"trust","label":"Trust sentiment and buy","verdict":"Narrative-first bias","feedback":"Sentiment is not enough; check demand and execution first."},{"id":"test-market","label":"Validate demand, product activity and roadmap delivery","verdict":"Evidence-first approach","feedback":"Start with problem fit, delivery and execution before valuation."},{"id":"focus-token","label":"Focus only on unlock schedules","verdict":"Narrow approach","feedback":"Unlocks are important, but first ensure demand and delivery are real."}],"takeaway":"Demand and execution are your first truth filters."} }',
    3,1785667200000
  ),
  (
    'cognizen-p2m5-l04','cognizen-crypto-mastery-part-2-pilot',
    'Tokenomics, revenue and treasury risk','cognizen-p2-module-05','interactive',
    '## Your outcome

You will evaluate whether token economics support long-term demand.

You will review supply mechanics, unlock schedules, treasury composition, and revenue channels.

This lesson focuses on sustainability and fragility: where value is created, who receives it, and what creates dilution or distribution risk.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'A strong thesis usually needs both utility and a credible resource model.',
    '{"version":1,"eyebrow":"Sustainability","title":"Find where value stays in the ecosystem","intro":"Map token supply, protocol economics and treasury habits.","scenes":[{"id":"supply","label":"Economics","title":"Supply structure","body":"Circulating and inflation dynamics change scarcity assumptions.","metric":"Supply fragility","tone":"orange"},{"id":"treasury","label":"Economics","title":"Treasury resilience","body":"A treasury mostly in own token can create sale pressure during stress.","metric":"Liquidity risk","tone":"red"},{"id":"revenue","label":"Economics","title":"Revenue channels","body":"Fees and service income need clear transfer to long-term value.","metric":"Value capture","tone":"green"},{"id":"distribution","label":"Economics","title":"Allocation and unlocks","body":"Concentration and large unlocks can shift future supply dynamics.","metric":"Investor control","tone":"blue"}],"activity":{"kind":"meter","title":"Tokenomics health check","prompt":"Move each slider to reflect the project’s current evidence quality.","dimensions":[{"id":"supply","label":"Supply discipline","lowLabel":"Dilutive risk","highLabel":"Disciplined","weight":1.2,"initial":35},{"id":"adoption","label":"Demand and retention","lowLabel":"Speculative usage","highLabel":"Organic repeat use","weight":1.3,"initial":45},{"id":"revenue","label":"Value capture","lowLabel":"Unclear beneficiaries","highLabel":"Clear and aligned","weight":1,"initial":30},{"id":"treasury","label":"Treasury sustainability","lowLabel":"Opaque and concentrated","highLabel":"Transparent and durable","weight":1.1,"initial":25}],"thresholds":[{"max":39,"label":"High fragility","feedback":"Pause valuation work and verify core economics and treasury details.","tone":"risk"},{"max":79,"label":"Medium confidence","feedback":"Some economics are clear, but test unlocks, concentration and spending quality first.","tone":"caution"},{"max":100,"label":"Higher confidence","feedback":"Economics are comparatively durable, though still conditional on execution.","tone":"good"}]} }',
    4,1785667200000
  ),
  (
    'cognizen-p2m5-l05','cognizen-crypto-mastery-part-2-pilot',
    'Build a fundamental scorecard and identify red flags','cognizen-p2-module-05','interactive',
    '## Your outcome

You will create a concise scorecard and apply it to a fictional asset.

You will learn how common red flags weaken a thesis, and how to add falsification conditions.

The lesson keeps analysis practical and non-absolute: strong evidence builds confidence, but no conclusion is permanent.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'A scorecard is useful only if it can be challenged and updated by new evidence.',
    '{"version":1,"eyebrow":"Decision quality","title":"From intuition to structured evaluation","intro":"Score and invalidate with criteria, not personality.","scenes":[{"id":"score","label":"Frame","title":"Scorecard setup","body":"Use problem fit, adoption, economics, governance, security and valuation in one view.","metric":"Consistency","tone":"blue"},{"id":"flags","label":"Frame","title":"Red-flag scan","body":"One weak sign may have an explanation; clusters indicate material risk.","metric":"Risk surface","tone":"red"},{"id":"thesis","label":"Frame","title":"Conditioned thesis","body":"State what must stay true and what changes the conclusion.","metric":"Revisability","tone":"green"},{"id":"review","label":"Frame","title":"Review trigger","body":"Set a date or metric threshold for re-assessment.","metric":"Discipline","tone":"green"}],"activity":{"kind":"branch","title":"Prioritise risk filters","prompt":"A project has strong marketing, no roadmap updates for two quarters, and a large unlock approaching. What should move confidence first?","options":[{"id":"all-green","label":"Ignore roadmap and unlocks because marketing is strong","verdict":"Unsupported optimism","feedback":"Marketing alone cannot replace execution and supply risk evidence."},{"id":"add-rules","label":"Lower confidence and add roadmap/treasury failure conditions","verdict":"Disciplined analyst move","feedback":"Execution and distribution risk are core controls on thesis quality."},{"id":"focus-price","label":"Raise confidence because price is holding this week","verdict":"Short-horizon bias","feedback":"One period of price stability is not durable fundamental confirmation."}],"takeaway":"A scorecard with falsification criteria protects you from narrative overload."} }',
    5,1785667200000
  ),
  (
    'cognizen-p2m5-l06','cognizen-crypto-mastery-part-2-pilot',
    'Check your understanding','cognizen-p2-module-05','quiz',
    '## Your outcome

Demonstrate your ability to separate fundamental evidence from narrative, score project quality, and define falsification conditions.',
    'markdown',NULL,NULL,NULL,4,0,0,0,'','',6,1785667200000
  )
)
WHERE EXISTS (
  SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-part-2-pilot'
);
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
  (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
SELECT 'cognizen-p2m5-quiz','cognizen-p2m5-l06','Introduction to Fundamental Analysis',80,0
WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cognizen-p2m5-l06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
  (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
SELECT column1,column2,column3,column4,column5,column6,column7,column8
FROM (VALUES
  ('cognizen-p2m5-q01','cognizen-p2m5-quiz','What is the central purpose of fundamental analysis in this course?','["To predict the exact future price","To replace every other method with one rule","To evaluate underlying demand, utility, and sustainability","To optimise short-term trading only"]',2,'Fundamental analysis is for judging underlying conditions, not guaranteeing future price.','Purpose',1),
  ('cognizen-p2m5-q02','cognizen-p2m5-quiz','Which statement is correct?','["A project and its token are always the same economic object","A project can be strong while token utility remains weak","A token always captures all company revenue","There is no need to separate network from governance"]',1,'A project may create value without the token receiving all that value.','Project vs token',2),
  ('cognizen-p2m5-q03','cognizen-p2m5-quiz','What is the best first step in fundamental review?','["Check one-day momentum","Choose the most expensive exchange listing","Define problem and target market, then test delivery","Find the loudest social post"]',2,'Quality analysis starts with problem-fit and then verifies delivery.','Assessment order',3),
  ('cognizen-p2m5-q04','cognizen-p2m5-quiz','Which metric is strongest for long-term adoption quality?','["One-day social volume spike","Active use and sustained repeat participation","Paid advertising spend","A single influencer endorsement"]',1,'Sustained use and repeat participation are stronger than one-off spikes.','Adoption',4),
  ('cognizen-p2m5-q05','cognizen-p2m5-quiz','Why must incentives in activity metrics be treated carefully?','["They always prove strong fundamentals","They may create temporary activity that disappears when rewards end","They are exactly equal to token demand","They only affect small projects"]',1,'Incentivised activity can be temporary and not indicate durable demand.','Activity quality',5),
  ('cognizen-p2m5-q06','cognizen-p2m5-quiz','Governance concentration can affect:','["Only marketing cost","How concentrated decision control may be","No one cares about it","Only software coding speed"]',1,'Concentrated governance may impact resilience and fairness.','Governance',6),
  ('cognizen-p2m5-q07','cognizen-p2m5-quiz','Which statement about tokenomics is true?','["A treasury of only its own token is always a strength","Supply expansion patterns can affect token economics","Tokenomics is irrelevant to valuation","Unlock schedules are only public relations"]',1,'Supply and unlock patterns are core to economics and dilution risk.','Tokenomics',7),
  ('cognizen-p2m5-q08','cognizen-p2m5-quiz','A scorecard mainly provides:','["A final buy/sell answer for life","A structured way to compare projects and track invalidation points","An emotional shortcut","A guarantee against fraud"]',1,'A scorecard gives structure and conditional decision rules; conclusions remain revisable.','Framework',8),
  ('cognizen-p2m5-q09','cognizen-p2m5-quiz','Which is most consistent with a strong thesis?','["The thesis never needs to change","No falsification conditions are needed","The thesis should include what could prove it wrong","Token unlocks can be ignored"]',2,'The strongest thesis includes explicit invalidation conditions to avoid rigid beliefs.','Thesis design',9),
  ('cognizen-p2m5-q10','cognizen-p2m5-quiz','Why are red flags used together in diagnosis?','["One red flag proves failure","Only regulators define red flags","Multiple weak signals together can materially increase risk","Red flags apply only to small projects"]',2,'No single flag is definitive, but clustered concerns increase risk materially.','Red flags',10),
  ('cognizen-p2m5-q11','cognizen-p2m5-quiz','What should you do with valuation in fundamental analysis?','["Use one method with no caveats","Ignore valuation and focus only on headlines","Use multiple lenses and compare assumptions with evidence quality","Assume tokenomics always determines value"]',2,'Use multiple lenses and compare assumptions with evidence quality.','Valuation',11),
  ('cognizen-p2m5-q12','cognizen-p2m5-quiz','What does fundamental analysis not do?','["Replace all decision-making","Guarantee outcomes","Support structured decisions with conditional evidence","Reduce emotional over-reaction"]',1,'Fundamental analysis supports structured judgment; it does not guarantee outcomes.','Limits',12)
)
WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cognizen-p2m5-quiz');
