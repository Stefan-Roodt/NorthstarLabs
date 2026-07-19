INSERT OR IGNORE INTO `courses`
  (`id`,`school_id`,`owner_id`,`title`,`description`,`status`,`price_cents`,
   `enforce_lesson_order`,`certificate_title`,`certificate_accent`,
   `certificate_valid_days`,`created_at`,`updated_at`)
VALUES
  (
    'design-lessons-people-remember','northstarlabs','northstarlabs-studio',
    'Design Lessons People Remember',
    'Use practical learning science to reduce overload, build useful practice, improve feedback, and help learners retain what matters.',
    'published',0,1,'Certificate: Evidence-Informed Lesson Design','#3556d8',0,
    1784480000000,1784480000000
  ),
  (
    'build-a-trusted-tutoring-practice','northstarlabs','northstarlabs-studio',
    'Build a Trusted Tutoring Practice',
    'Create a credible tutor offer, diagnose learner needs, run focused sessions, communicate progress, and put safeguarding first.',
    'published',0,1,'Certificate: Trusted Tutoring Practice','#8a5fd0',0,
    1784480000000,1784480000000
  ),
  (
    'teach-with-ai-responsibly','northstarlabs','northstarlabs-studio',
    'Teach With AI Responsibly',
    'Use generative AI with human judgement, privacy safeguards, verification habits, and learning activities that preserve learner agency.',
    'published',0,1,'Certificate: Responsible AI for Educators','#167b72',0,
    1784480000000,1784480000000
  );
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections` (`id`,`course_id`,`title`,`position`,`created_at`)
VALUES
  ('remember-section-design','design-lessons-people-remember','Design for understanding',1,1784480000000),
  ('remember-section-practice','design-lessons-people-remember','Design for retention and transfer',2,1784480000000),
  ('tutor-section-foundation','build-a-trusted-tutoring-practice','Build a trustworthy foundation',1,1784480000000),
  ('tutor-section-delivery','build-a-trusted-tutoring-practice','Deliver safe, useful sessions',2,1784480000000),
  ('ai-section-judgement','teach-with-ai-responsibly','Start with human judgement',1,1784480000000),
  ('ai-section-practice','teach-with-ai-responsibly','Design responsible classroom practice',2,1784480000000);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
  (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,
   `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
   `transcript`,`position`,`updated_at`)
VALUES
(
  'remember-lesson-01','design-lessons-people-remember',
  'Start with evidence of performance','remember-section-design','text',
'# Start with evidence of performance

A strong lesson is designed backwards from what a learner should be able to **do**, not from everything an educator could say. “Understand the topic” is too vague to guide teaching or assessment. A useful outcome names a condition, an action, and an acceptable standard.

## Write a performance outcome

Use this pattern:

> Given **this situation**, the learner can **perform this action** well enough to meet **this standard**.

Example: “Given a new tutoring enquiry, the tutor can ask five diagnostic questions and use the answers to propose an appropriate first-session goal.”

The condition prevents an outcome from floating without context. The action makes it observable. The standard tells both educator and learner what “good enough” means.

## Decide what would count as evidence

Choose evidence that resembles the real performance:

- A decision with a short explanation
- A completed plan, calculation, draft, demonstration, or conversation
- A comparison that applies clear criteria
- A corrected attempt that explains what changed

A multiple-choice question can check recognition, but it cannot prove every kind of skill. If the intended result is a performance, include a performance.

## Remove attractive distractions

For every topic you want to add, ask: **Does the learner need this to produce the evidence?** If not, move it to an optional resource. This protects attention and makes the learning promise more credible.

## Your action

Create a one-page performance brief:

1. Name one real learner.
2. Describe the situation in which the skill is needed.
3. Write one observable action.
4. Define two or three quality criteria.
5. Choose the smallest piece of evidence that would convince you the learner can do it.

The [CAST Universal Design for Learning Guidelines](https://udlguidelines.cast.org/) encourage clear goals while allowing flexible ways to engage, access information, and express learning. Use that principle here: keep the destination stable, but do not assume every learner must take an identical route.',
  'markdown',18,1,0,0,'',1,1784480000000
),
(
  'remember-lesson-02','design-lessons-people-remember',
  'Reduce overload without reducing the standard','remember-section-design','text',
'# Reduce overload without reducing the standard

Working memory is limited. When a lesson asks learners to decode unfamiliar language, navigate a confusing screen, remember several instructions, and solve a new problem at the same time, effort is spent on the interface instead of the learning.

The answer is not to make the goal easier. The answer is to remove effort that does not serve the goal.

## Separate three kinds of material

- **Essential:** directly required for the performance outcome
- **Supportive:** an example, definition, cue, or reference that helps the learner
- **Distracting:** detail that is interesting but competes with the next action

Teach one meaningful chunk, then create a pause in which the learner must use it. Long explanations feel efficient to the presenter but often transfer the burden to the learner.

## Make the path visible

At the start of a lesson, tell learners:

1. What they will be able to do
2. Why it matters
3. What they will produce
4. Roughly how long it should take

Use headings that describe decisions or actions. Replace “Module 2.3” with “Choose the right evidence.” Keep instructions beside the task they control. Define technical terms before using them in a complex explanation.

## Combine words and visuals carefully

A visual should explain a relationship, sequence, location, or comparison. Do not add decoration that forces learners to search for meaning. When a diagram carries essential information, provide a text explanation and meaningful labels so the idea remains accessible.

## Your action: the friction audit

Open one existing lesson and mark every paragraph, media element, instruction, and link as essential, supportive, or distracting. Then:

- Remove or relocate one distraction
- Break one dense explanation into two chunks
- Rewrite one heading as an action
- Put one instruction closer to the task
- Add a plain-language explanation for one difficult term

Finish by asking a colleague to state the next required action after looking at the lesson for ten seconds. If they cannot, the path is still carrying unnecessary friction.',
  'markdown',20,0,0,0,'',2,1784480000000
),
(
  'remember-lesson-03','design-lessons-people-remember',
  'Teach with examples, then fade the support','remember-section-design','text',
'# Teach with examples, then fade the support

Novices cannot always see the hidden decisions inside expert work. A finished answer shows the destination, but it often hides the route. A **worked example** makes the route visible by showing both the steps and the reasoning behind them.

## Build an example that teaches

Choose a realistic task and show:

- The situation and goal
- The information that matters
- The decision made at each step
- A common alternative and why it is weaker
- The finished result checked against quality criteria

Think aloud in short, precise statements. Instead of “I just know this is the best option,” say, “I chose this example because it matches the learner level and contains only one new variable.”

## Move from watching to doing

Support should fade in stages:

1. **Complete example:** every decision is explained.
2. **Completion problem:** the learner finishes the final steps.
3. **Prompted attempt:** the learner works with a checklist or cues.
4. **Independent attempt:** the learner performs without the scaffold.
5. **Variation:** the learner applies the skill in a different situation.

Do not remove support according to the clock. Remove it when the learner shows readiness. If an attempt fails, return to the smallest useful scaffold rather than repeating the whole explanation.

## Ask comparison questions

Examples become more powerful when learners compare them:

- What is the same across both examples?
- Which detail changes the decision?
- Where would this method fail?
- Which quality criterion is strongest or weakest?

The Institute of Education Sciences practice guide recommends alternating worked examples with problem-solving practice rather than separating all demonstration from all practice. See [Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1).

## Your action

Select one task learners commonly get wrong. Create a four-column worked example:

1. Step
2. What the educator does
3. Why that decision is made
4. What the learner should check

Then create a completion problem with the last two steps missing. The learner should have to think, but should not have to guess what kind of thinking the task requires.',
  'markdown',22,0,0,0,'',3,1784480000000
),
(
  'remember-lesson-04','design-lessons-people-remember',
  'Use retrieval to strengthen memory','remember-section-practice','text',
'# Use retrieval to strengthen memory

Rereading can create familiarity without reliable recall. Retrieval practice asks the learner to bring an idea or procedure to mind **before** seeing the answer. That effort strengthens access to the learning and reveals what needs more work.

## Retrieval is more than a test

Use low-stakes retrieval throughout the learning journey:

- Begin with two questions from the previous lesson
- Pause after an explanation and ask for the idea in the learner’s own words
- Present a new scenario and ask which principle applies
- Ask the learner to sketch the process from memory
- End with a one-minute summary and one remaining question

The goal is useful effort, not surprise. Tell learners that retrieval is practice. Give enough time to think, and always provide feedback or a trustworthy model afterwards.

## Ask questions that match the outcome

If the outcome is to make a decision, retrieve the decision criteria. If the outcome is to perform a process, ask learners to recall and use the steps. Avoid trivia that is easy to score but irrelevant to the promised performance.

Good retrieval prompts include:

- “Without looking back, list the three checks you would make.”
- “Which principle applies here, and what detail led you to it?”
- “Complete the next step, then explain your reasoning.”
- “What mistake is most likely, and how would you detect it?”

## Make errors productive

An error is useful only when it leads to correction. Feedback should identify the gap, reconnect the learner to the principle, and invite another attempt. Do not use public ranking or humiliation to create effort.

## Your action: build a retrieval ladder

For one important concept, write:

1. A simple recall prompt
2. A recognition question with plausible alternatives
3. A scenario that requires application
4. A comparison that requires explanation
5. A delayed prompt to use three days later

Answer every prompt yourself and check that each answer can be justified from the lesson. The IES practice guide identifies active retrieval through quizzing as a practical way to support long-lasting memory; the value comes from the act of retrieval and the correction that follows, not from the score alone.',
  'markdown',20,0,0,0,'',1,1784480000000
),
(
  'remember-lesson-05','design-lessons-people-remember',
  'Space practice and vary the context','remember-section-practice','text',
'# Space practice and vary the context

One successful attempt immediately after an explanation shows short-term performance. It does not yet show durable learning. Spacing revisits important knowledge after some forgetting has begun. Variation asks the learner to recognise when and how to use the skill outside the original example.

## Plan deliberate returns

For a short course, use a simple rhythm:

- **Same lesson:** one guided and one independent attempt
- **Next lesson:** a two-minute retrieval prompt
- **Several days later:** a new example using the same principle
- **End of course:** a mixed task that requires choosing among several ideas

Do not repeat the exact same question. Keep the underlying principle stable while changing surface details.

## Interleave when choice matters

Blocked practice repeats one type of task. Interleaved practice mixes related tasks so the learner must first decide **which approach fits**. Interleaving may feel harder because it removes the cue provided by repetition. That difficulty can be useful when the real world also requires diagnosis.

Example: instead of completing ten identical pricing calculations, mix three cases in which the learner must choose between hourly, session, and programme pricing before calculating.

## Protect learners from overload

Variation should deepen judgement, not create random difficulty. Change one or two meaningful features at a time. Explain what remains constant and what has changed. If learners cannot yet perform the basic process, return to a worked example before adding more variation.

## Your action: create a retention map

Choose three ideas that learners must remember after the course. For each idea, schedule:

1. The first explanation
2. The first retrieval
3. A delayed retrieval
4. A varied application
5. A final mixed task

Add these returns to the course calendar before adding new content. Spacing is not an optional revision activity; it is part of the instructional design. The [IES learning and memory practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) recommends spacing key content over time and combining examples with problem solving.',
  'markdown',20,0,0,0,'',2,1784480000000
),
(
  'remember-lesson-06','design-lessons-people-remember',
  'Build an inclusive lesson quality plan','remember-section-practice','quiz',
'# Build an inclusive lesson quality plan

A high-quality lesson does more than transmit accurate information. It gives different learners a fair route to the same meaningful goal, makes practice visible, and produces evidence that can guide the next decision.

## Review access, support, and expression

Use three questions inspired by the [CAST UDL Guidelines 3.0](https://udlguidelines.cast.org/more/about-guidelines-3-0/):

- **Engagement:** Is the purpose relevant, clear, and psychologically safe?
- **Representation:** Can learners perceive and make sense of the essential information?
- **Action and expression:** Can learners practise and show the intended learning in an appropriate way?

Flexibility does not mean lowering the standard. Keep the performance criteria stable while removing barriers that are unrelated to the skill.

## Make feedback actionable

Useful feedback answers three questions:

1. What was the learner trying to achieve?
2. What evidence in the work meets or misses the criteria?
3. What is the smallest useful next action?

“Good job” can encourage, but it does not guide. A page of corrections can overwhelm. Prioritise the one change most likely to improve the next attempt, then let the learner use the feedback.

## Your capstone

Choose one lesson and produce a quality plan containing:

- One performance outcome
- The evidence learners will create
- One worked example and one faded practice task
- Five retrieval prompts scheduled across time
- One accessibility or language barrier you will remove
- The criteria used for feedback
- The change you will make after reviewing learner evidence

Run the knowledge check below. Passing confirms that you can distinguish outcomes, scaffolds, retrieval, spacing, and inclusive design. The real evidence is the revised lesson you create.',
  'markdown',25,0,0,0,'',3,1784480000000
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
  (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,
   `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
   `transcript`,`position`,`updated_at`)
VALUES
(
  'tutor-practice-lesson-01','build-a-trusted-tutoring-practice',
  'Choose the learner and problem you serve','tutor-section-foundation','text',
'# Choose the learner and problem you serve

“I tutor everyone” sounds flexible, but it makes trust harder. Learners and parents need to recognise themselves quickly. A focused offer explains who you help, the problem you address, and the kind of progress you are equipped to support.

## Define a responsible fit

Write down:

- The subjects or skills you can teach confidently
- The learner stages you understand
- The outcomes you can reasonably support
- The situations that require a different specialist
- The formats and times you can deliver reliably

Your qualifications matter, but fit also includes communication style, language, experience with the learner stage, and the boundaries of your competence.

## Describe progress without promising certainty

Avoid guarantees about marks, admissions, or speed. Tutoring is a partnership influenced by attendance, prior knowledge, practice, wellbeing, and the wider learning environment.

A credible promise sounds like:

> “I help Grade 10–12 learners diagnose gaps in algebra, practise the reasoning behind each step, and build a weekly exam-preparation routine.”

It names the learner, skill, method, and useful direction without pretending the tutor controls every result.

## Create a fit screen

Before accepting a learner, ask:

1. What does the learner want to do more confidently?
2. What evidence or feedback describes the current difficulty?
3. What has already been tried?
4. Is there a deadline or assessment?
5. Does the learner need teaching, practice, accountability, language support, or a regulated professional service?

Refer or decline when the need falls outside your competence, when expectations are unsafe or unrealistic, or when the required schedule cannot be delivered reliably.

## Your action

Write a four-sentence positioning statement:

1. Who you help
2. The problem you address
3. How sessions work
4. What a learner can reasonably expect

Then write a “not the right fit” sentence. A professional boundary does not reduce opportunity; it directs learners towards appropriate help and protects trust.',
  'markdown',18,1,0,0,'',1,1784480000000
),
(
  'tutor-practice-lesson-02','build-a-trusted-tutoring-practice',
  'Create a profile that earns trust','tutor-section-foundation','text',
'# Create a profile that earns trust

A tutor profile should help a learner make a sound decision. It should not rely on vague enthusiasm, inflated claims, or hidden conditions.

## Show the evidence a learner needs

Include:

- A specific professional headline
- Relevant qualifications and experience
- Subjects, levels, languages, and session formats
- A short explanation of your teaching approach
- Transparent price units and what a session includes
- General availability and location
- Verification claims only when they are current and documented

Use a recent, professional photograph when possible. Write in the first person and explain what happens during a typical session.

## Make price boundaries clear

State whether the price covers an hour, a session, preparation, materials, or follow-up. Explain:

- Payment timing and method
- Cancellation and rescheduling rules
- Late arrival and no-show treatment
- Any minimum commitment
- What is not included

Do not collect sensitive information before it is needed. Keep platform enquiries and appointment details inside the protected workflow where possible.

## Use proof responsibly

Testimonials should be genuine, permission-based, and specific. Do not disclose a learner’s identity, marks, diagnosis, or personal circumstances without informed permission. Avoid selective claims that imply every learner will achieve the same result.

## Your action: the five-second test

Ask someone unfamiliar with your work to scan your profile for five seconds and answer:

1. Who is this tutor for?
2. What can they help with?
3. How do sessions happen?
4. What does it cost?
5. What should I do next?

If any answer is unclear, rewrite the first screen before adding more detail. Trust comes from clarity, evidence, and consistent boundaries—not from sounding impressive.',
  'markdown',18,0,0,0,'',2,1784480000000
),
(
  'tutor-practice-lesson-03','build-a-trusted-tutoring-practice',
  'Run a diagnostic first conversation','tutor-section-foundation','text',
'# Run a diagnostic first conversation

The first conversation is not a sales performance and it is not yet a full lesson. Its job is to understand the need, test fit, set expectations, and agree on a useful first goal.

## Listen before proposing

Invite both the learner and, where appropriate, a parent or responsible adult to describe the situation. Ask open questions first, then use specific follow-ups.

A practical sequence:

1. **Goal:** What would the learner like to do more confidently?
2. **Evidence:** What work, marks, feedback, or examples show the current position?
3. **History:** What has helped or failed before?
4. **Conditions:** What deadline, schedule, technology, language, or access needs matter?
5. **Motivation:** Why does this goal matter to the learner?
6. **Fit:** Is tutoring the right support, and are you the right tutor?

Do not diagnose a medical, psychological, or learning condition unless you are appropriately qualified and authorised. Describe observable learning evidence and refer to qualified professionals when necessary.

## Create a small baseline

Use one representative task, not a high-pressure exam. Ask the learner to think aloud. Notice:

- What they recognise
- Where their process breaks
- Which misconceptions appear
- What prompts help
- How they respond to feedback

The baseline should inform teaching, not label the learner.

## Agree on the first useful result

Finish with a short written summary:

- The learner’s goal
- What the initial evidence suggests
- The first two or three priorities
- Session format and frequency
- Responsibilities between sessions
- How progress will be reviewed

## Your action

Create a reusable diagnostic form with no more than ten questions and one baseline task. Add a final decision field: **accept, refer, or gather more information**. This small discipline prevents a confident sales conversation from becoming an unsuitable tutoring arrangement.',
  'markdown',22,0,0,0,'',3,1784480000000
),
(
  'tutor-practice-lesson-04','build-a-trusted-tutoring-practice',
  'Structure a session around learner thinking','tutor-section-delivery','text',
'# Structure a session around learner thinking

A tutoring session should not become a private lecture. The tutor needs enough learner thinking to diagnose, respond, and decide what happens next.

## Use a repeatable session rhythm

For a sixty-minute session, try:

1. **Reconnect — 5 minutes:** retrieve the previous goal and review between-session practice.
2. **Diagnose — 8 minutes:** use a short task to locate today’s need.
3. **Model — 10 minutes:** demonstrate one process with the reasoning visible.
4. **Guided practice — 12 minutes:** solve together while reducing prompts.
5. **Independent attempt — 15 minutes:** the learner performs and explains.
6. **Review — 7 minutes:** compare the evidence with the goal.
7. **Next step — 3 minutes:** agree on one realistic practice action.

Adjust the timing, but preserve the movement from evidence to instruction to independent performance.

## Ask questions that reveal reasoning

Replace “Do you understand?” with:

- “What would you do first, and why?”
- “Which detail matters most here?”
- “Where did the answer stop making sense?”
- “How could you check this?”
- “What would change your decision?”

Wait after asking. Do not rescue the learner so quickly that you remove the thinking the session was designed to develop.

## Correct without taking over

When an error appears:

1. Ask the learner to locate it.
2. Return to the relevant principle.
3. Offer the smallest useful cue.
4. Let the learner correct the work.
5. Test the correction with a similar but different task.

## Your action

Plan the next session on one page. Include the goal, retrieval prompt, diagnostic task, worked example, guided attempt, independent attempt, likely misconception, cue you will use, and between-session action. If the plan contains more tutor talk than learner activity, redesign it.',
  'markdown',22,0,0,0,'',1,1784480000000
),
(
  'tutor-practice-lesson-05','build-a-trusted-tutoring-practice',
  'Put safeguarding and professional boundaries first','tutor-section-delivery','text',
'# Put safeguarding and professional boundaries first

Tutors often work one-to-one and may work with children or vulnerable learners. Trust requires more than good teaching. It requires clear procedures, appropriate checks, safe communication, accurate records, and a plan for responding to concerns.

> This lesson gives general good-practice guidance. It does not replace the safeguarding law, vetting requirements, reporting duties, or professional standards that apply in your country and context.

## Before tutoring begins

- Complete the legally required vetting and reference checks
- Keep a written safeguarding and complaints procedure
- Identify the person or authority to contact when a concern arises
- Agree communication channels, session location, attendance, recording, and cancellation rules
- For minors, communicate through the parent, carer, school, or approved organisational channel
- Collect only the personal information genuinely needed

## Make the session environment safer

For in-person work, use an appropriate common or professional space. For online work, check what can be seen and heard, use approved accounts, and avoid personal direct messages. Parents or carers should know when and how sessions occur. Do not record a session without a clear purpose, informed permission, secure handling, and a retention plan.

The [NSPCC safeguarding guidance for tutors](https://learning.nspcc.org.uk/safeguarding-child-protection/tutors) recommends agreeing expectations with parents and carers, maintaining professional boundaries, taking practical steps to make one-to-one settings safer, and keeping appropriate session records.

## Respond, do not investigate

If a learner discloses harm or you observe a concern:

1. Stay calm and listen.
2. Do not promise secrecy.
3. Do not interrogate or conduct your own investigation.
4. Record the learner’s words and relevant facts accurately.
5. Follow the applicable reporting procedure promptly.
6. Escalate immediate danger to the appropriate emergency authority.

## Your action

Create a safeguarding readiness checklist for your context. It must name the applicable law or professional guidance, required checks, reporting contact, parent or carer communication rule, approved session locations, recording rule, record-retention approach, and annual review date. Do not advertise services to minors until this checklist is complete.',
  'markdown',25,0,0,0,'',2,1784480000000
),
(
  'tutor-practice-lesson-06','build-a-trusted-tutoring-practice',
  'Show progress and improve the practice','tutor-section-delivery','quiz',
'# Show progress and improve the practice

Tutoring quality becomes visible through learner work, not the number of sessions delivered. Use a small evidence loop that helps the learner, communicates appropriately with stakeholders, and improves your teaching.

## Keep a concise session record

After each session, record:

- The goal
- The task or evidence used
- What the learner could do independently
- The misconception or barrier addressed
- The feedback given
- The agreed next action
- Any attendance, safeguarding, or follow-up note required

Keep records factual, necessary, access-controlled, and retained only as long as your legal and operational duties require.

## Report progress with evidence

Instead of “The session went well,” say:

> “The learner solved two-step equations independently in four of five examples and correctly explained the inverse operation. Sign errors remain when negative numbers are introduced. Next session will begin with a short retrieval task before mixed practice.”

This summary is specific, balanced, and useful. For minors, use the agreed parent, carer, or school channel while respecting the learner’s dignity and privacy.

## Review the practice monthly

Track a small set of signals:

- Attendance and cancellation patterns
- Goal attainment
- Independent performance
- Learner confidence described in their own words
- Referrals and unsuitable enquiries
- Recurring misconceptions
- Preparation and administration time

Do not publish outcomes selectively or compare learners publicly.

## Your capstone

Create a complete tutor operating pack: positioning statement, profile, fit screen, diagnostic form, session plan, safeguarding checklist, session record, and monthly review. Then complete the knowledge check below. Passing shows that you can identify responsible fit, evidence-based sessions, professional boundaries, and appropriate progress communication.',
  'markdown',25,0,0,0,'',3,1784480000000
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
  (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,
   `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
   `transcript`,`position`,`updated_at`)
VALUES
(
  'responsible-ai-lesson-01','teach-with-ai-responsibly',
  'Decide when AI belongs in the learning','ai-section-judgement','text',
'# Decide when AI belongs in the learning

Generative AI is a tool, not a learning objective and not a substitute for professional judgement. Begin with the learner, the intended performance, and the risk of the task. Add AI only when it improves access, practice, feedback, creativity, or educator capacity without removing the thinking learners need to develop.

## Use a human-first decision

Before using AI, ask:

1. What should the learner be able to do?
2. Which part of that performance requires human thinking or relationship?
3. What specific role would AI play?
4. What could go wrong?
5. Who checks the output and remains accountable?
6. Can the same benefit be achieved more simply?

Reasonable uses may include generating varied practice examples, rewriting instructions at a different reading level for educator review, brainstorming misconceptions, or offering a critique that a learner must evaluate.

High-risk uses include making consequential decisions about learners, processing sensitive personal data, producing unverified factual teaching material, impersonating a learner, or replacing feedback that requires empathy and context.

## Protect productive struggle

If AI completes the exact thinking named in the outcome, the activity may produce a polished artefact without learning. A learner who must build an argument should not outsource the argument and then submit it unchanged.

Better patterns include:

- Ask the learner to attempt first, then compare with AI feedback
- Give two AI answers and require an evidence-based critique
- Use AI to vary surface details while the learner chooses the method
- Require a process note that explains decisions, checks, and revisions

UNESCO frames responsible teacher capability around a human-centred mindset, ethics, AI foundations, AI pedagogy, and professional learning. See the [AI Competency Framework for Teachers](https://www.unesco.org/en/articles/ai-competency-framework-teachers).

## Your action

Choose one teaching task and complete a benefit–risk–control table. Name the expected benefit, the plausible harm, the person affected, the control, and the accountable human. If you cannot name a meaningful benefit or a workable control, do not use AI for that task.',
  'markdown',20,1,0,0,'',1,1784480000000
),
(
  'responsible-ai-lesson-02','teach-with-ai-responsibly',
  'Understand what a language model can and cannot do','ai-section-judgement','text',
'# Understand what a language model can and cannot do

A language model generates likely sequences from patterns learned during training and shaped by instructions and context. It can produce fluent explanations, examples, summaries, and drafts. Fluency does not prove truth, originality, fairness, or suitability.

## Treat outputs as proposals

Common failure modes include:

- Invented facts, citations, quotations, or links
- Confident answers to ambiguous questions
- Stereotypes or uneven performance across languages and groups
- Missing context, exceptions, or recent changes
- Inconsistent answers when the prompt changes slightly
- Explanations that sound plausible but use faulty reasoning

The educator remains responsible for deciding whether an output is accurate, appropriate, lawful, and educationally useful.

## Separate four activities

1. **Generate:** create possible material.
2. **Verify:** check claims against trustworthy sources or direct evidence.
3. **Adapt:** align language, examples, difficulty, and accessibility with the learner.
4. **Approve:** make the final professional decision.

Do not collapse these activities into one click.

## Make uncertainty visible

Ask the system to state assumptions, identify information it would need, and mark claims requiring verification. This can improve the review process, but it does not make the output self-verifying.

When facts matter, trace them to primary or authoritative sources. When judgement matters, use clear criteria and human review. When a learner’s welfare, placement, mark, or access is affected, follow the institution’s approved process rather than delegating the decision.

## Your action: the verification drill

Generate a short explanation in a subject you know well. Mark every factual claim, example, citation, and recommendation. Verify each one independently. Record:

- What was correct
- What was incomplete
- What was misleading
- What could have harmed learning if accepted
- Which prompt change improved reviewability

This exercise builds calibrated trust: neither blind acceptance nor blanket rejection, but evidence-based use.',
  'markdown',20,0,0,0,'',2,1784480000000
),
(
  'responsible-ai-lesson-03','teach-with-ai-responsibly',
  'Protect privacy, rights, and learner agency','ai-section-judgement','text',
'# Protect privacy, rights, and learner agency

An educator should not paste information into an AI service simply because it is convenient. Learner records, assessment results, disability information, behaviour notes, contact details, unpublished work, and confidential organisational material may be personal, sensitive, or protected.

## Use data minimisation

Before entering information:

- Check the institution’s approved tools and policy
- Understand whether prompts or outputs are stored or used for training
- Remove names and direct identifiers
- Remove combinations of details that could re-identify a person
- Use synthetic examples when the real record is unnecessary
- Confirm the lawful basis and permission required in your context
- Set an appropriate retention and deletion approach

Anonymisation is not merely replacing a name. “The only 14-year-old learner in a small town with a named condition” may still be identifiable.

## Respect authorship and intellectual property

Do not assume generated material is original, accurate, or free of rights concerns. Check licences and institutional policy before uploading third-party content or publishing outputs. Attribute human and AI contributions according to the rules of the learning context.

## Preserve meaningful consent and choice

Learners should know when AI meaningfully shapes a learning activity, feedback process, or assessment. Offer a reasonable non-AI route where policy, access, age, disability, culture, or personal choice makes that necessary. Do not require a learner to create an account with an unapproved service.

UNESCO guidance emphasises privacy protection, age-appropriate use, human agency, accountability, and social responsibility in educational AI. See [UNESCO’s overview of the teacher and student AI competency frameworks](https://www.unesco.org/en/articles/what-you-need-know-about-unescos-new-ai-competency-frameworks-students-and-teachers).

## Your action

Create a red–amber–green data guide:

- **Green:** public, non-personal, approved material
- **Amber:** internal or learner-related material requiring policy review and strong minimisation
- **Red:** sensitive, confidential, high-stakes, or prohibited material that must not enter the tool

Add the approved escalation contact and review the guide before every new AI workflow.',
  'markdown',22,0,0,0,'',3,1784480000000
),
(
  'responsible-ai-lesson-04','teach-with-ai-responsibly',
  'Prompt for learning, not answer vending','ai-section-practice','text',
'# Prompt for learning, not answer vending

A good educational prompt defines a role for AI that preserves learner thinking. The goal is not the longest or most complicated instruction. The goal is a reliable interaction that supports the intended practice.

## Use a compact prompt structure

Include:

- **Learning goal:** the capability being developed
- **Learner context:** level, prior knowledge, language, and constraints without personal identifiers
- **AI role:** coach, questioner, simulator, example generator, or critic
- **Task:** what the system should do
- **Boundaries:** what it must not do
- **Criteria:** what a useful response should contain
- **Interaction:** how the learner must respond before more help is given

Example:

> “Act as a Socratic practice coach for an introductory economics learner. Present one short opportunity-cost scenario. Ask the learner to identify the choice and next-best alternative before giving feedback. Do not provide the answer first. Use plain English and challenge unsupported reasoning.”

## Design progressive help

Use a support ladder:

1. Ask the learner to explain the current attempt.
2. Ask one diagnostic question.
3. Point to the relevant principle.
4. Offer a partial cue.
5. Show a worked example using different details.
6. Return to the original task.

This turns AI into a scaffold rather than an answer machine.

## Require evidence of thinking

Ask learners to submit:

- Their first attempt
- The prompt or interaction used
- The output they rejected or revised
- Sources checked
- A short explanation of final decisions

Do not reward prompt theatrics. Assess the learning outcome and the quality of judgement.

## Your action

Rewrite one answer-generating prompt as a coaching prompt. Test it with three learner responses: correct, partly correct, and confidently wrong. Check whether the interaction diagnoses before explaining, keeps the learner active, and avoids revealing the complete answer too early.',
  'markdown',22,0,0,0,'',1,1784480000000
),
(
  'responsible-ai-lesson-05','teach-with-ai-responsibly',
  'Verify outputs for accuracy, bias, and access','ai-section-practice','text',
'# Verify outputs for accuracy, bias, and access

Review must be designed into the workflow. “Check the answer” is too vague. Use explicit criteria, independent sources, and representative tests.

## Run an accuracy check

- Break the output into individual claims
- Confirm important claims with primary or authoritative sources
- Open and read every citation
- Recalculate numbers
- Test code or procedures safely
- Check dates, jurisdiction, units, and assumptions
- Ask a subject expert when the consequence of error is high

## Run a fairness check

Test whether examples, language, and recommendations change unfairly when identity cues, names, locations, dialects, or disability-related needs change. Look for whose knowledge is treated as standard, who is absent, and whether stereotypes are reinforced.

Do not “solve” bias by deleting identity. Relevant identity and context may be essential to good teaching. The goal is respectful, accurate representation and equitable opportunity.

## Run an accessibility check

Review reading level, headings, alternatives for visual or audio information, keyboard and screen-reader usability, colour dependence, and the cognitive effort required by the interface. Offer information in useful forms without changing the core learning goal.

CAST describes Universal Design for Learning through multiple means of engagement, representation, and action and expression. See [About Universal Design for Learning](https://www.cast.org/resources/about-universal-design-for-learning/).

## Use a stop rule

Stop and escalate when:

- Verification is impossible
- The output affects a high-stakes decision
- Sensitive data may have been exposed
- Bias could cause material harm
- The learner cannot reasonably opt out
- The tool behaves outside approved policy

## Your action

Create a reusable review checklist with four headings: accuracy, fairness, accessibility, and policy. Test one AI-generated lesson resource with at least two different learner contexts. Record every change made and keep the final human-approved version separate from the raw output.',
  'markdown',22,0,0,0,'',2,1784480000000
),
(
  'responsible-ai-lesson-06','teach-with-ai-responsibly',
  'Write a responsible AI learning plan','ai-section-practice','quiz',
'# Write a responsible AI learning plan

Responsible use becomes real when it is translated into a repeatable plan that learners, educators, and administrators can understand.

## Include the full learning workflow

For one activity, document:

1. The human learning outcome
2. Why AI adds educational value
3. The approved tool and access route
4. Data that may and may not be entered
5. The learner’s required first attempt
6. The role AI is allowed to play
7. Verification and bias checks
8. Evidence of learner thinking
9. The assessment criteria
10. A non-AI alternative
11. The accountable educator
12. The stop and escalation rule

## Communicate the rule in plain language

Learners should be able to answer:

- May I use AI?
- For which part?
- What must remain my own work?
- What must I disclose?
- How will the work be assessed?
- What happens if I cannot or choose not to use the tool?

Avoid a policy that says only “use AI responsibly.” Give examples of permitted, restricted, and prohibited use.

## Keep the educator in the loop

Review samples of interactions and outcomes. Ask whether the activity improved learning, saved meaningful time, created new barriers, or changed learner behaviour. Retire the workflow when harms outweigh benefits or when the tool, terms, law, or institutional policy changes.

The [UNESCO AI Competency Framework for Teachers](https://www.unesco.org/en/articles/ai-competency-framework-teachers) treats responsible AI capability as a progression involving human-centred values, ethics, foundations, pedagogy, and professional learning—not a one-time tool tutorial.

## Your capstone

Complete the twelve-part plan for one real activity. Ask a colleague to identify the learning goal, privacy rule, verification process, and accountable human without further explanation. Revise any part they cannot find. Then complete the knowledge check below.',
  'markdown',25,0,0,0,'',3,1784480000000
);
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes` (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
VALUES
  ('remember-course-quiz','remember-lesson-06','Lesson design knowledge check',80,0),
  ('tutor-practice-course-quiz','tutor-practice-lesson-06','Trusted tutoring knowledge check',80,0),
  ('responsible-ai-course-quiz','responsible-ai-lesson-06','Responsible AI knowledge check',80,0);
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
  (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`position`)
VALUES
  ('remember-q1','remember-course-quiz','Which outcome is most useful for lesson design?','["Learners will understand pricing","Given three offers, learners can select a pricing position and justify it against two criteria","Learners will watch five videos","The educator will explain pricing clearly"]',1,1),
  ('remember-q2','remember-course-quiz','What is the best reason to use a worked example?','["It makes a lesson look longer","It removes all learner effort","It makes expert decisions and reasoning visible before support is faded","It replaces independent practice"]',2,2),
  ('remember-q3','remember-course-quiz','Which activity is retrieval practice?','["Rereading highlighted notes","Copying a displayed definition","Recalling the three checks before revealing the answer","Watching the same explanation twice"]',2,3),
  ('remember-q4','remember-course-quiz','When is interleaving most useful?','["When learners must choose which related method fits","When every task is completely unrelated","Before learners have seen any example","Only when a course has no assessment"]',0,4),
  ('remember-q5','remember-course-quiz','What should remain stable when offering flexible ways to express learning?','["The file format","The performance goal and quality criteria","The amount of educator talk","The device every learner uses"]',1,5),
  ('tutor-practice-q1','tutor-practice-course-quiz','Which tutor promise is most responsible?','["I guarantee a 20% mark increase","I help Grade 10–12 learners diagnose algebra gaps and build a weekly practice routine","I can teach every learner and every subject","Results are certain after three sessions"]',1,1),
  ('tutor-practice-q2','tutor-practice-course-quiz','What is the main purpose of the first diagnostic conversation?','["Close the sale immediately","Deliver the whole first lesson","Understand the need, test fit, and agree on a useful first goal","Collect as much personal information as possible"]',2,2),
  ('tutor-practice-q3','tutor-practice-course-quiz','Which session pattern provides the strongest evidence of learning?','["The tutor explains for the full hour","The learner watches several examples","The learner completes an independent attempt and explains the reasoning","The tutor gives the final answer quickly"]',2,3),
  ('tutor-practice-q4','tutor-practice-course-quiz','If a child discloses a safeguarding concern, what should a tutor do?','["Promise complete secrecy","Investigate every detail","Listen, record facts, and follow the applicable reporting procedure","Post about it in a tutor group"]',2,4),
  ('tutor-practice-q5','tutor-practice-course-quiz','Which progress note is most useful?','["The session went well","The learner was good","The learner solved four of five equations independently; sign errors remain with negative numbers","We covered chapter five"]',2,5),
  ('responsible-ai-q1','responsible-ai-course-quiz','When should an educator avoid AI for a task?','["When it would remove the thinking named in the learning outcome without a clear educational benefit","Whenever a task contains text","Only when the tool is slow","When learners ask questions"]',0,1),
  ('responsible-ai-q2','responsible-ai-course-quiz','Why must fluent AI output still be verified?','["Fluency proves originality but not style","Language models can produce plausible but false or incomplete material","Verification is needed only for mathematics","AI outputs never contain citations"]',1,2),
  ('responsible-ai-q3','responsible-ai-course-quiz','What is the safest data-minimisation choice?','["Paste a full learner record for better context","Replace only the learner name","Use a synthetic, non-identifiable example when real data is unnecessary","Assume every paid tool is approved"]',2,3),
  ('responsible-ai-q4','responsible-ai-course-quiz','Which prompt best preserves learner agency?','["Write the learner’s final answer","Give the answer, then ask whether it makes sense","Ask for the learner’s attempt, diagnose with one question, and offer progressive cues","Complete every difficult step automatically"]',2,4),
  ('responsible-ai-q5','responsible-ai-course-quiz','What belongs in a responsible AI learning plan?','["Only the name of the tool","A learning goal, permitted role, data rule, verification, non-AI route, and accountable human","A promise that AI is unbiased","A list of fashionable prompts"]',1,5);
