-- Replace the starter shelf with three intentional NorthstarLabs signature programmes.
UPDATE `courses`
SET `status`='archived',`updated_at`=1784556000000
WHERE `id` IN (
  'launch-your-first-online-course','price-your-expertise','build-a-learning-community',
  'design-lessons-people-remember','build-a-trusted-tutoring-practice','teach-with-ai-responsibly'
);
--> statement-breakpoint
UPDATE `courses`
SET `school_id`='northstarlabs',
    `owner_id`='northstarlabs-studio',
    `title`='Bitcoin Intelligence: From Genesis Block to Boardroom',
    `description`='An evidence-led investigation of Bitcoin’s engineering, economics, custody, governance, regulation, risks, and plausible futures—built for people who must form their own judgement.',
    `status`='published',
    `certificate_title`='NorthstarLabs Distinction: Bitcoin Intelligence',
    `updated_at`=1784556000000
WHERE `id`='stefan-bitcoin-genesis-next-era';
--> statement-breakpoint
UPDATE `courses`
SET `school_id`='northstarlabs',
    `owner_id`='northstarlabs-studio',
    `title`='Web3 Product Lab: From Protocol to Proof',
    `description`='A sceptical, hands-on product studio for deciding when decentralised technology earns its complexity—and designing safer systems when it does.',
    `status`='published',
    `certificate_title`='NorthstarLabs Distinction: Responsible Web3 Product Design',
    `updated_at`=1784556000000
WHERE `id`='stefan-web3-foundations';
--> statement-breakpoint
INSERT OR IGNORE INTO `courses`
  (`id`,`school_id`,`owner_id`,`title`,`description`,`status`,`price_cents`,
   `enforce_lesson_order`,`certificate_title`,`certificate_accent`,
   `certificate_valid_days`,`created_at`,`updated_at`)
VALUES (
  'northstar-ai-command-studio','northstarlabs','northstarlabs-studio',
  'AI Command Studio: Build Your Personal AI Operating System',
  'Turn generative AI from an occasional chatbot into a reliable, governed work system that saves time and improves the quality of real decisions.',
  'published',0,1,'NorthstarLabs Distinction: Applied AI Work Systems','#20a486',0,
  1784556000000,1784556000000
);
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections` (`id`,`course_id`,`title`,`position`,`created_at`)
VALUES
  ('aic-section-01','northstar-ai-command-studio','1. Find responsible leverage',1,1784556000000),
  ('aic-section-02','northstar-ai-command-studio','2. Engineer decision-grade instructions',2,1784556000000),
  ('aic-section-03','northstar-ai-command-studio','3. Build and test the workflow',3,1784556000000),
  ('aic-section-04','northstar-ai-command-studio','4. Prove, govern, and present the system',4,1784556000000);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
  (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,
   `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
   `transcript`,`position`,`updated_at`)
VALUES
(
 'aic-lesson-01','northstar-ai-command-studio','The 10× task audit','aic-section-01','text',
'# The 10× task audit

The goal is not to “use more AI.” The goal is to improve a real outcome without quietly multiplying risk.

## Map one working week

List ten recurring tasks. For each, record frequency, minutes, consequence of error, sensitivity of the inputs, and what “excellent” looks like. Then score four possible forms of leverage:

1. **Generate** — create a first draft or alternatives.
2. **Transform** — summarise, restructure, translate, or extract.
3. **Reason with structure** — compare options against explicit criteria.
4. **Review** — find omissions, contradictions, weak evidence, or unclear language.

Do not automate a task simply because it is repetitive. A frequent high-consequence task may need more human attention, not less.

## Select the studio workflow

Choose one task that is frequent, time-consuming, reviewable, and safe to simulate. Write a baseline: current time, typical quality problems, rework, and who approves the result.

## Artifact

Create a one-page **AI Leverage Map** with your ten tasks, risk classification, selected workflow, baseline, and a one-sentence success measure.

> Distinction standard: the chosen use case is narrow enough to test and important enough to matter.',
 'markdown',25,1,0,0,'',1,1784556000000
),
(
 'aic-lesson-02','northstar-ai-command-studio','Capability without mythology','aic-section-01','text',
'# Capability without mythology

A language model predicts useful continuations from patterns. It can produce excellent work and confident nonsense through the same interface. Calibrated use begins by testing capabilities rather than adopting slogans.

## Run the five-test laboratory

Using invented or public information, test the same model on:

- faithful extraction from a supplied source;
- transformation into a defined format;
- generation of three materially different options;
- comparison against a written rubric;
- critique that identifies missing evidence.

For every result, mark **supported**, **plausible but unverified**, or **incorrect**. Notice which tasks are grounded in supplied material and which invite invention.

## The operating principle

Use models to widen options and accelerate structured work. Do not delegate truth, authority, professional accountability, or irreversible decisions to fluent text.

## Artifact

Add a **Capability Card** to your system: approved uses, prohibited uses, required source material, and the human check required before use.',
 'markdown',25,0,0,0,'',2,1784556000000
),
(
 'aic-lesson-03','northstar-ai-command-studio','Checkpoint: risk before speed','aic-section-01','quiz',
'# Checkpoint: risk before speed

Apply the risk model to realistic work. Pass at 80% before designing the workflow.',
 'markdown',10,0,0,0,'',3,1784556000000
),
(
 'aic-lesson-04','northstar-ai-command-studio','The decision-grade brief','aic-section-02','text',
'# The decision-grade brief

Weak prompts force the model to guess. A decision-grade brief makes the job, evidence, boundaries, and acceptance test visible.

## The seven-part brief

1. **Decision or deliverable:** what must exist at the end?
2. **User and situation:** who will use it, and for what?
3. **Source boundary:** which supplied facts may be treated as evidence?
4. **Constraints:** tone, length, law, policy, time, and excluded actions.
5. **Method:** the reasoning steps or comparison criteria.
6. **Output contract:** exact headings, table fields, or data structure.
7. **Acceptance tests:** what must be true before a human approves it?

Ask the model to list missing information before drafting. If critical information is absent, it should stop rather than fabricate.

## Artifact

Rewrite the instruction for your studio workflow using all seven parts. Test it against one easy case and one awkward edge case. Record what changed.',
 'markdown',30,1,0,0,'',4,1784556000000
),
(
 'aic-lesson-05','northstar-ai-command-studio','Context architecture','aic-section-02','text',
'# Context architecture

More context is not automatically better. The useful context is authoritative, necessary, current, and safe to disclose.

## Build a source pack

Create four small components:

- **Operating facts:** the stable facts the workflow needs.
- **Voice and standards:** one good example plus the reason it is good.
- **Decision rules:** priorities, thresholds, escalation triggers, and prohibited conclusions.
- **Case input:** only the information required for the current task.

Label every source with owner, date, and authority. Remove secrets, personal information, privileged material, and irrelevant history. Where information conflicts, instruct the system to surface the conflict.

## The context budget

For each item ask: Will removing this reduce correctness? If not, remove it. Compact context improves reviewability and reduces accidental leakage.

## Artifact

Produce a sanitised **Context Pack v1** and a data-classification note explaining what must never be pasted into an unapproved system.',
 'markdown',30,0,0,0,'',5,1784556000000
),
(
 'aic-lesson-06','northstar-ai-command-studio','The verification ladder','aic-section-02','quiz',
'# The verification ladder

Verification is a designed process, not a final instruction saying “be accurate.” Test grounding, calculations, omissions, bias, and consequences.',
 'markdown',15,0,0,0,'',6,1784556000000
),
(
 'aic-lesson-07','northstar-ai-command-studio','Build a modular prompt system','aic-section-03','text',
'# Build a modular prompt system

A reliable workflow uses separate stages because drafting and judging are different jobs.

## The four modules

**Draft:** produce the deliverable from the approved brief and context.

**Ground:** attach each important claim to a supplied source or label it unverified.

**Red-team:** search for missing stakeholders, contrary evidence, unsafe assumptions, and edge cases.

**Quality gate:** score the result against the acceptance tests and return revise, escalate, or ready-for-human-review.

Do not ask a critique stage merely to “improve” the answer. Give it failure modes and a rubric. The final human should see the draft, evidence notes, unresolved questions, and quality score—not only polished prose.

## Artifact

Create and version the four modules for your workflow. Run the same case through v1 and v2 and keep a short change log.',
 'markdown',35,0,0,0,'',7,1784556000000
),
(
 'aic-lesson-08','northstar-ai-command-studio','Design human hand-offs','aic-section-03','text',
'# Design human hand-offs

Human-in-the-loop is meaningless unless the human has a defined decision, enough evidence, time to review, and authority to reject.

## Assign responsibility

For each stage specify:

- what the system proposes;
- what the reviewer must inspect;
- what evidence appears beside the proposal;
- which conditions force escalation;
- who owns the final consequence.

Create explicit stop rules for sensitive data, legal or medical interpretation, financial commitments, safety concerns, missing sources, and high-impact decisions. Design exception handling before the happy path.

## Artifact

Draw a **Responsibility Map** from input to release. Mark automated actions, human decisions, escalation routes, data boundaries, and the audit record created at each step.',
 'markdown',30,0,0,0,'',8,1784556000000
),
(
 'aic-lesson-09','northstar-ai-command-studio','Studio gate: prototype under pressure','aic-section-03','quiz',
'# Studio gate: prototype under pressure

Test whether your workflow fails safely when the input is incomplete, contradictory, sensitive, or designed to push it beyond authority.',
 'markdown',20,0,0,0,'',9,1784556000000
),
(
 'aic-lesson-10','northstar-ai-command-studio','Measure the gain honestly','aic-section-04','text',
'# Measure the gain honestly

Speed alone can hide rework and downstream harm. Compare the new workflow with the baseline using a small, representative test set.

## The scorecard

Measure:

- total human minutes, including review and correction;
- acceptance-test pass rate;
- material error and omission rate;
- number of escalations and whether they were correct;
- consistency across similar cases;
- user usefulness;
- privacy or policy incidents.

Run at least five cases, including one edge case. Keep the original output and the corrected version. If faster work produces more consequential errors, the system has not improved.

## Artifact

Create a one-page **Evidence Scorecard** with baseline, results, failures, changes, and a go / revise / stop recommendation.',
 'markdown',30,0,0,0,'',10,1784556000000
),
(
 'aic-lesson-11','northstar-ai-command-studio','Govern and improve the system','aic-section-04','text',
'# Govern and improve the system

An AI workflow is a living operating process. Models, policies, sources, users, and risks change.

## Minimum governance

Maintain an owner, version number, approved model and data boundary, test set, known limitations, review date, incident route, and retirement rule. Re-test after changes to prompts, sources, tools, model versions, or decision authority.

Record meaningful failures without blaming the user. Ask whether the interface, context, incentive, or review design made the failure likely.

## Artifact

Complete an **AI System Card** covering purpose, users, inputs, outputs, model role, human authority, data treatment, evaluations, known limitations, incidents, and next review.',
 'markdown',25,0,0,0,'',11,1784556000000
),
(
 'aic-lesson-12','northstar-ai-command-studio','Capstone: the AI Operating System demo','aic-section-04','quiz',
'# Capstone: the AI Operating System demo

Package the work into a proof others can inspect:

1. the original problem and measured baseline;
2. the task and risk map;
3. the decision-grade brief and sanitised context pack;
4. the modular workflow and responsibility map;
5. a before-and-after demonstration;
6. the evidence scorecard;
7. limitations, stop rules, and the next experiment.

Record a five-minute demonstration or present it live. Do not claim “10×” without evidence. The strongest showcase is a narrow system that works, shows its limits, and makes human accountability obvious.

## Distinction rubric

- Outcome and baseline: 15%
- Instruction and context engineering: 20%
- Verification and safety: 25%
- Measured evidence: 20%
- Clarity, honesty, and demonstration: 20%

Pass the final scenario assessment at 80%, then revise one element using what the assessment exposed.',
 'markdown',45,0,0,0,'',12,1784556000000
);
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
  (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
VALUES
  ('aic-quiz-01','aic-lesson-03','Risk before speed',80,3),
  ('aic-quiz-02','aic-lesson-06','Verification ladder',80,3),
  ('aic-quiz-03','aic-lesson-09','Prototype under pressure',80,3),
  ('aic-final','aic-lesson-12','AI Operating System defence',80,3);
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
  (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`position`)
VALUES
  ('aic-q01-01','aic-quiz-01','Which task is the strongest first AI workflow candidate?','["An irreversible safety decision","A frequent draft-and-review task using non-sensitive data","A confidential disciplinary decision","Any task that takes more than five minutes"]',1,1),
  ('aic-q01-02','aic-quiz-01','What does fluent output prove?','["The claim is true","The model understood the consequence","Only that a plausible response was generated","The sources were verified"]',2,2),
  ('aic-q01-03','aic-quiz-01','Who owns the consequence of an AI-assisted professional decision?','["The model vendor in every case","The human or organisation with decision authority","Nobody if AI was disclosed","The prompt writer only"]',1,3),
  ('aic-q01-04','aic-quiz-01','What should happen when required information is missing?','["Invent a reasonable value","Hide the uncertainty","Stop or ask for the missing information","Produce a longer answer"]',2,4),
  ('aic-q02-01','aic-quiz-02','Which is the strongest grounding method?','["Ask the model to be factual","Require important claims to map to approved sources","Use a confident role prompt","Generate the answer twice"]',1,1),
  ('aic-q02-02','aic-quiz-02','Why separate drafting and critique?','["Long prompts are illegal","Generation and evaluation benefit from distinct instructions and criteria","Critique guarantees correctness","It removes human review"]',1,2),
  ('aic-q02-03','aic-quiz-02','What belongs in an acceptance test?','["The output feels impressive","Observable conditions a reviewer can check","The model used many tokens","The wording matches a competitor"]',1,3),
  ('aic-q02-04','aic-quiz-02','A source conflicts with another approved source. What should the workflow do?','["Choose the newest silently","Expose the conflict and request a decision rule","Blend both claims","Delete both"]',1,4),
  ('aic-q03-01','aic-quiz-03','What makes a human hand-off meaningful?','["A human is copied on email","A named decision, relevant evidence, authority, and time to review","The output says draft","There are two models"]',1,1),
  ('aic-q03-02','aic-quiz-03','Which test case best improves confidence?','["Only the easiest successful example","A representative set including contradictory and edge cases","One very long prompt","A public benchmark unrelated to the task"]',1,2),
  ('aic-q03-03','aic-quiz-03','What is a safe response to sensitive data outside the approved boundary?','["Continue but shorten it","Stop and route through the approved process","Store it in the prompt template","Ask the model not to remember"]',1,3),
  ('aic-q03-04','aic-quiz-03','Why measure review time?','["Review is part of the true workflow cost","Humans should review more slowly","It makes the model faster","It guarantees user satisfaction"]',0,4),
  ('aic-final-01','aic-final','A workflow is 60% faster but doubles material errors. What is the honest conclusion?','["Deploy immediately","The workflow has not demonstrated net improvement","Errors do not matter if disclosed","Remove the error metric"]',1,1),
  ('aic-final-02','aic-final','Which capstone claim is strongest?','["AI transformed everything","Five tested cases reduced median time while meeting every acceptance test; these limitations remain","The prompt is proprietary","The model said the workflow is safe"]',1,2),
  ('aic-final-03','aic-final','What change should trigger re-evaluation?','["Only a new logo","A model, prompt, source, tool, policy, or authority change","A spelling correction","A successful run"]',1,3),
  ('aic-final-04','aic-final','What is the best automation boundary?','["Automate the entire job","Automate defined transformations; keep consequential judgement and exceptions under accountable human control","Never use AI","Let the model choose its authority"]',1,4),
  ('aic-final-05','aic-final','What makes the demonstration portfolio-worthy?','["A dramatic claim","Inspectible artifacts, measured evidence, visible limitations, and a real before-and-after case","A long list of prompts","A certificate alone"]',1,5),
  ('aic-final-06','aic-final','A system repeatedly fails on unusual cases. What is the responsible next action?','["Hide the cases","Define detection, escalation, and redesign before wider use","Increase temperature","Remove human review"]',1,6);
