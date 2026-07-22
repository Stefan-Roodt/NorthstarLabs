INSERT OR IGNORE INTO `courses`
  (`id`,`school_id`,`owner_id`,`title`,`description`,`status`,`price_cents`,
   `enforce_lesson_order`,`available_from`,`certificate_title`,
   `certificate_accent`,`certificate_valid_days`,`created_at`,`updated_at`)
SELECT
  'cognizen-crypto-mastery-part-2-pilot',
  target.`id`,
  target.`owner_id`,
  'Crypto Mastery: Markets and Applications — Interactive pilot',
  'A continuation in the markets pilot for Module 2.4. Learners compare market regimes, match strategy intensity to evidence, and design rules for when to shift positions.',
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
  'cognizen-p2-module-04',
  'cognizen-crypto-mastery-part-2-pilot',
  'Module 2.4: Market Regimes and Strategy Selection',
  1,1785666000000
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
    'cognizen-p2m4-l01','cognizen-crypto-mastery-part-2-pilot',
    'Why strategies fail in the wrong climate','cognizen-p2-module-04','interactive',
    '## Your outcome

Your first job is to identify the market climate before choosing a strategy.

## The regime view

A market can behave as trending, ranging, shock-reactive, liquidity-thin, or unstable. Each climate favours different signals and punishments.

Trend-following strategies often do well in sustained directional phases and fail in noisy ranges. Mean-reversion ideas can look brilliant in calm oscillation and fail in breakouts.

This module teaches you to diagnose the environment from structure, flow, volatility and participation before committing.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Wrong strategy is usually right logic in the wrong climate. Start with regime and only then choose execution.',
    '{"version":1,"eyebrow":"Regime scan","title":"Which climate are we in?","intro":"Match strategy to observed structure before taking new position.","scenes":[{"id":"trend","label":"Climate 1","title":"Rising structure","body":"Higher highs, higher lows, and persistent order-flow support trend models.","metric":"Trend confidence","tone":"green"},{"id":"range","label":"Climate 2","title":"Sideways consolidation","body":"Multiple swing tests and fading extremes dominate behaviour.","metric":"Fade confidence","tone":"blue"},{"id":"shock","label":"Climate 3","title":"Shock and response","body":"Large impulse moves and fast reversals create regime uncertainty.","metric":"Model uncertainty","tone":"red"},{"id":"thin","label":"Climate 4","title":"Liquidity constriction","body":"Low depth and wide slippage make both signals and hedges expensive.","metric":"Execution risk","tone":"orange"}],"activity":{"kind":"classify","title":"Label the right climate","prompt":"Classify each scenario before proposing a strategy.","buckets":[{"id":"trend","label":"Trend","description":"Directional persistence dominates"},{"id":"range","label":"Range","description":"Bounces around bounded support/resistance"},{"id":"shock","label":"Shock","description":"Volatility regime dominates with regime breaks"},{"id":"thin","label":"Thin-liquidity","description":"Low participation and fragile execution"}],"cards":[{"id":"c1","text":"Successive pullbacks in lower timeframes keep getting bought","bucketId":"trend","feedback":"This is trend continuation behavior with directional bias."},{"id":"c2","text":"Frequent rejection at known boundaries and low trend persistence","bucketId":"range","feedback":"Range response favours controlled mean-reversion or reduced exposure."},{"id":"c3","text":"Rapid expansion in dispersion after headline news","bucketId":"shock","feedback":"Execution discipline matters more than signal conviction."},{"id":"c4","text":"Slippage increases and both bids/asks step away","bucketId":"thin","feedback":"Execution quality is the primary variable in thin liquidity."}],"takeaway":"Identify climate before position size or trigger logic."} }',
    1,1785666000000
  ),
  (
    'cognizen-p2m4-l02','cognizen-crypto-mastery-part-2-pilot',
    'Choose the matching strategy intensity','cognizen-p2-module-04','interactive',
    '## Your outcome

You should be able to choose strategy intensity that matches environment quality and avoid forcing a single plan.

## Matching matrix

Use a four-step matrix: signal strength, liquidity quality, volatility stability, and conviction confidence.

In trending regimes, stronger trend persistence can justify wider stop bands and momentum methods. In range regimes, smaller signal windows and mean-reversion logic often preserve capital better. In shock regimes, most strategies move to risk-guard mode.

## Discipline

When your evidence is incomplete, the safest strategy is usually the one with the smallest irreversible commitment.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'The highest conviction strategy is rarely the highest expected outcome strategy when execution conditions deteriorate.',
    '{"version":1,"eyebrow":"Strategy fit","title":"Pick by evidence, not preference","intro":"Different climates reward different risk posture and trigger logic.","scenes":[{"id":"matrix","label":"Step 1","title":"Measure core conditions","body":"Score trend clarity, liquidity, volatility and social attention.","metric":"Signal quality","tone":"blue"},{"id":"fit","label":"Step 2","title":"Match strategy family","body":"Assign momentum, range, carry, hedging or hold-light depending on climate.","metric":"Method fit","tone":"green"},{"id":"stress","label":"Step 3","title":"Stress the downside","body":"Test what happens if participation or volatility shifts in the opposite direction.","metric":"Robustness","tone":"orange"},{"id":"act","label":"Step 4","title":"Define action levels","body":"Set entry trigger, size, invalidation level and review trigger.","metric":"Execution readiness","tone":"green"}],"activity":{"kind":"branch","title":"Choose the least wrong starting posture","prompt":"Which approach is most suitable for a high-volatility shock regime with weak liquidity?","options":[{"id":"aggressive","label":"Increase leverage and scale quickly","verdict":"Risk-amplifying response","feedback":"In unstable regimes, leverage should usually fall before conviction rises.","tone":"risk"},{"id":"reduce","label":"Reduce size, narrow commitments, define invalidation","verdict":"Resilient response","feedback":"Lower commitment preserves optionality and gives room for uncertainty.","tone":"good"},{"id":"ignore","label":"Continue as planned and widen stop","verdict":"Inadequate adaptation","feedback":"Ignoring liquidity shock and structure change does not increase signal quality.","tone":"caution"}],"takeaway":"In poor structure, strategy adaptation beats courage."} }',
    2,1785666000000
  ),
  (
    'cognizen-p2m4-l03','cognizen-crypto-mastery-part-2-pilot',
    'Liquidity, slippage and crowding checks','cognizen-p2-module-04','interactive',
    '## Your outcome

You will learn to treat liquidity as the first risk gate, not an afterthought.

## Why it matters

If liquidity is thin, expected execution can differ sharply from modelled execution. A strategy can look statistically strong and still fail in live conditions due to slippage, order-book gaps, or sudden cancellation cascades.

Crowding and similar entry points matter. Strategies all taking the same signal can push fills into worse terms and make exits equally hard.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Liquidity checks are not separate from strategy; they are part of expected return.',
    '{"version":1,"eyebrow":"Execution risk","title":"Is there enough room to trade?","intro":"Estimate capacity before deciding position size.","scenes":[{"id":"book","label":"Evidence card","title":"Order-book depth","body":"Wide spread and shallow depth increase uncertainty.","metric":"Execution cost","tone":"red"},{"id":"crowd","label":"Evidence card","title":"Crowded entries","body":"Many participants entering the same way can turn a calm market into a squeeze.","metric":"Tail risk","tone":"orange"},{"id":"liquidity","label":"Evidence card","title":"Liquidity event","body":"Flow drops, and impact per unit becomes larger.","metric":"Uncertainty rises","tone":"blue"},{"id":"decision","label":"Evidence card","title":"Pre-commit","body":"Set a max adverse fill and hard exit threshold before you enter.","metric":"Control restored","tone":"green"}],"activity":{"kind":"classify","title":"Prioritise risk gates","prompt":"Classify each pre-trade requirement by execution urgency.","buckets":[{"id":"mandatory","label":"Mandatory before size","description":"Must be checked before committing any size"},{"id":"important","label":"Important but conditional","description":"Should be checked if market condition changes"},{"id":"optional","label":"Optional","description":"Useful but not required for this setup"}],"cards":[{"id":"g1","text":"Set a maximum acceptable slippage band","bucketId":"mandatory","feedback":"Without this, no size discipline exists."},{"id":"g2","text":"Watch headline volatility index only","bucketId":"optional","feedback":"Useful context, but not enough by itself for entry discipline."},{"id":"g3","text":"Limit order notional by observed depth","bucketId":"mandatory","feedback":"Depth-aware sizing protects against silent regime shifts."},{"id":"g4","text":"Set crowding alert from position concentration","bucketId":"important","feedback":"Crowding changes risk-reward and should influence execution size."}],"takeaway":"Execution realism is the difference between backtest confidence and live survivability."} }',
    3,1785666000000
  ),
  (
    'cognizen-p2m4-l04','cognizen-crypto-mastery-part-2-pilot',
    'Regime transitions and review triggers','cognizen-p2-module-04','interactive',
    '## Your outcome

You can prevent losses by planning transitions before transitions happen.

## Transition discipline

Most learners fail not on opening a position but on carrying one after a regime change.

Build explicit triggers: what regime switch will reduce size, widen stops, or move to cash-preserving mode. Define these before you begin.

Treat transitions as part of strategy, not exceptions.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'Without explicit transition triggers, strategy discipline collapses at the exact moment uncertainty spikes.',
    '{"version":1,"eyebrow":"Transition map","title":"When climate flips, flip the plan","intro":"Build a trigger menu that protects your process.","scenes":[{"id":"breakout","label":"Signal change","title":"Trend to range","body":"The breakout line loses follow-through and whipsaws increase.","metric":"Confidence decay","tone":"orange"},{"id":"volatility","label":"Signal change","title":"Range to shock","body":"Volatility expands and order participation thins.","metric":"Fragility rises","tone":"red"},{"id":"policy","label":"Decision","title":"Trigger action","body":"Reduce leverage, tighten reviews, and document the next validation condition.","metric":"Control regained","tone":"green"}],"activity":{"kind":"branch","title":"Select best transition policy","prompt":"What should happen first when regime evidence turns from trend to shock?","options":[{"id":"double","label":"Double position to protect average entry","verdict":"Counter-intuitive and risky response","feedback":"Volatility expansion without new evidence is usually a reason to reduce, not increase, exposure.","tone":"risk"},{"id":"flat","label":"Halt additions and define revised validation","verdict":"Discipline-first response","feedback":"Pausing and revalidating before adding aligns exposure with uncertainty.","tone":"good"},{"id":"ignore","label":"Continue unchanged for one more week","verdict":"No transition rule","feedback":"Delaying policy update is usually the highest-risk choice in fast-changing regimes.","tone":"caution"}],"takeaway":"Transitions are where process either protects you or destroys your edge."} }',
    4,1785666000000
  ),
  (
    'cognizen-p2m4-l05','cognizen-crypto-mastery-part-2-pilot',
    'Practical build: your market regime card','cognizen-p2-module-04','interactive',
    '## Your outcome

Produce a complete market regime decision card with:

- Regime identification
- Signal quality score
- Position sizing rule
- Execution pre-checks
- Review trigger and stop condition

You will leave this lesson with a reusable card you can apply to another market sample.',
    'markdown',NULL,NULL,NULL,6,0,0,0,
    'A good process is reusable, concise, and explicit enough to prevent emotional overrides.',
    '{"version":1,"eyebrow":"Build artifact","title":"Assemble your card","intro":"Use this to force pre-commit clarity.","scenes":[{"id":"climate","label":"Card step","title":"Identify climate","body":"Name the most likely regime with evidence from price structure and participation.","metric":"Context fit","tone":"blue"},{"id":"score","label":"Card step","title":"Score signals","body":"Assign confidence to each evidence stream and name the weak point.","metric":"Information quality","tone":"green"},{"id":"size","label":"Card step","title":"Pick size and execution constraints","body":"Set max size, max slippage, and max time-in-uncertainty.","metric":"Risk guard","tone":"orange"},{"id":"review","label":"Card step","title":"Define review timer","body":"Name trigger events, timeline, and what changes the plan.","metric":"Reversibility","tone":"green"}],"activity":{"kind":"quiz","title":"Build your card","prompt":"What should be the first line of a regime card?","options":["Signal and climate evidence","Emotional conviction","Portfolio balance only","Broker commission"],"correctIndex":0,"explanation":"Climate and signal evidence belongs first. Emotions, balances and costs matter, but they are secondary to execution context."},"activity":{"kind":"meter","title":"Self-check your card readiness","prompt":"Move each slider so your card can be executed without emotional exceptions.","dimensions":[{"id":"clarity","label":"Regime clarity","lowLabel":"Vague","highLabel":"Unambiguous","weight":1.1,"initial":45},{"id":"risk","label":"Risk controls","lowLabel":"No thresholds","highLabel":"Clear thresholds","weight":1.3,"initial":25},{"id":"reversibility","label":"Review trigger quality","lowLabel":"No trigger","highLabel":"Clear trigger","weight":1,"initial":20}],"thresholds":[{"max":39,"label":"Not ready","feedback":"Do not enter until climate and triggers are explicit.","tone":"risk"},{"max":69,"label":"Needs tightening","feedback":"Improve execution constraints before execution.","tone":"caution"},{"max":100,"label":"Ready","feedback":"Card is explicit enough to test and repeat.","tone":"good"}]},"takeaway":"A card is only useful if someone else could execute it from your note."}',
    5,1785666000000
  ),
  (
    'cognizen-p2m4-l06','cognizen-crypto-mastery-part-2-pilot',
    'Check your understanding','cognizen-p2-module-04','quiz',
    '## Your outcome

Confirm you can distinguish regime types, select suitable strategy fit, and enforce transition triggers.',
    'markdown',NULL,NULL,NULL,4,0,0,0,'','',6,1785666000000
  )
)
WHERE EXISTS (
  SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-part-2-pilot'
);
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
  (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
SELECT 'cognizen-p2m4-quiz','cognizen-p2m4-l06','Market Regimes and Strategy Selection',80,0
WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cognizen-p2m4-l06');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
  (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
SELECT column1,column2,column3,column4,column5,column6,column7,column8
FROM (VALUES
  ('cognizen-p2m4-q01','cognizen-p2m4-quiz','What is the primary purpose of identifying market regimes before selecting a strategy?','["To prove the strategy is superior","To reduce conviction by matching method to environment","To avoid opening any position ever","To increase leverage in all situations"]',1,'Regime identification aligns method, size and risk to observed structure before action is taken. Review: Why strategies fail in wrong climate.','Regime alignment',1),
  ('cognizen-p2m4-q02','cognizen-p2m4-quiz','Which factor most directly reduces live execution risk?','["Number of signals on social media","Liquidity depth and slippage checks","A more exciting narrative","More leverage"]',1,'Liquidity and slippage checks reduce the chance that a valid plan executes poorly in real conditions.','Execution gating',2),
  ('cognizen-p2m4-q03','cognizen-p2m4-quiz','A range regime often favours which response compared to a strong trend regime?','["The same high-beta momentum plan","A wider, faster-addition model","Smaller structures and mean-reversion-friendly logic","Ignoring review triggers"]',2,'Range conditions often require smaller and more controlled structures than trend regimes. Review: Practical build: your market regime card.','Regime-based strategy',3),
  ('cognizen-p2m4-q04','cognizen-p2m4-quiz','What should happen when a transition from trend to shock regime is detected?','["Increase size to catch the next impulse","Double down and extend holding time","Hold unchanged until confirmation","Pause additions and re-validate with revised triggers"]',3,'A transition rule should reduce irreversibility and force re-validation.','Transition management',4),
  ('cognizen-p2m4-q05','cognizen-p2m4-quiz','Which review trigger is most useful in a volatile transition?','["A fixed calendar date only","No trigger unless a loss occurs","A condition tied to liquidity and volatility changes","A trigger tied only to the news cycle"]',2,'Review triggers should be tied to structural conditions that invalidate the prior climate assumptions.','Review discipline',5),
  ('cognizen-p2m4-q06','cognizen-p2m4-quiz','In this framework, what defines a strategy error most clearly?','["Using a unique indicator","Forgetting to define execution constraints","A low confidence score","A neutral narrative"]',1,'Most avoidable errors are operational: missing thresholds for size, slippage, or review conditions.','Operational safety',6),
  ('cognizen-p2m4-q07','cognizen-p2m4-quiz','What is the role of a market regime card?','["To replace all technical analysis","To make your process transferable and less emotional","To avoid studying any evidence","To remove decision making"]',1,'A card captures climate, constraints, and review points so decisions are repeatable and less emotional.','Decision process',7),
  ('cognizen-p2m4-q08','cognizen-p2m4-quiz','What is crowding risk most directly related to?','["Network fees only","Many participants entering the same setup at once","Regulatory changes","Wallet security defaults"]',1,'Crowding risk changes execution and outcome dynamics when participants become crowded into one approach.','Crowding risk',8),
  ('cognizen-p2m4-q09','cognizen-p2m4-quiz','What should happen after creating a market card?','["Store it as decoration","Take a bigger trade immediately","Use it only for live markets","Keep the card as the action plan and review it at trigger points"]',3,'The card is an action plan, not decoration. Review it at trigger points and before re-commitment.','Plan discipline',9),
  ('cognizen-p2m4-q10','cognizen-p2m4-quiz','What is the strongest statement from this module?','["Confidence always beats evidence","Risk controls are optional when analysis is good","Climate-aware positioning limits avoid expensive regime mismatch","One strategy works in every environment"]',2,'Climate-aware positioning is central: strategy, size, and execution should adapt to regime conditions.','Core principle',10)
)
WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cognizen-p2m4-quiz');
