import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const courseId = "cognizen-crypto-mastery-foundations-production";
const sectionId = "cmf-start-here";
const createdAt = 1785384000000;
const videoPath = new URL("../public/media/faculty/Crypto_Mastery_Pathway.mp4", import.meta.url);
const guidePath = new URL("../public/media/course-resources/crypto-mastery-field-guide.pdf", import.meta.url);

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function experience(eyebrow, title, intro, scenes, activity, takeaway) {
  return JSON.stringify({ version: 1, eyebrow, title, intro, scenes, activity, takeaway });
}

const lessons = [
  {
    id: "cmf-start-here-lesson-01",
    title: "Welcome to Crypto Mastery",
    type: "video",
    duration: 4,
    watch: 75,
    assetId: "cmf-welcome-video",
    transcript: `Welcome to Crypto Mastery: Foundations. This programme is designed to help you reason clearly about digital assets - not to sell you a prediction, a token or a shortcut.

You are about to work through thirty-one focused modules. Together they move from the nature of money, through Bitcoin, blockchains, keys, wallets and transactions, into markets, tokenomics, security, regulation and a final capstone. Each lesson is intentionally short. The goal is not to rush. The goal is to make one useful distinction, apply it, and keep evidence of what you can now do.

The learning rhythm is simple: learn, do and prove. First, a guided story explains the concept. Next, you make a decision, classify evidence or test a scenario. Then a scored check shows whether the idea is usable rather than merely familiar. If you miss a question, use the explanation and try again. Correction is part of the course.

Crypto creates strong opinions. This programme will ask you to separate a technical fact from an economic claim, a possible outcome from a promised outcome, and a popular narrative from reliable evidence. It is education, not financial advice. Never share a private key or seed phrase here. Never risk money merely to complete an exercise. All practical examples can be completed without purchasing an asset.

At the end, you will not be asked to predict a price. You will build a defensible digital-asset decision framework, a personal safety plan and a capstone that states what the evidence supports, what remains uncertain and what you would do next.

Begin by choosing your purpose. Are you here to understand the technology, participate more safely, evaluate claims, support clients or prepare for deeper study? Write that purpose down. It will become your filter as the course grows more technical.

Welcome. Move deliberately, question confidently and finish with proof of progress.`,
    content: `## Your outcome

Understand the promise, structure and safety boundaries of Crypto Mastery before beginning the technical curriculum.

## The programme promise

You will learn to separate facts, claims, risks and decisions across money, Bitcoin, blockchains, custody, markets and regulation. You will finish with work that demonstrates judgement - not merely pages you have read.

## Your learning rhythm

1. **Learn:** use the short visual explanation to build a mental model.
2. **Do:** classify evidence, make a decision or test a scenario.
3. **Prove:** complete the check and keep the resulting worksheet or capstone evidence.

## Safety boundary

This programme is educational and is not financial advice. Exercises never require you to buy an asset, connect a wallet or disclose a private key, password or seed phrase.`,
    experience: experience(
      "Programme launch",
      "Thirty-one modules. One clear learning journey.",
      "See how the course moves from first principles to safe, evidence-led decisions.",
      [
        { id: "orient", label: "Stage 1 - Orient", title: "Money, Bitcoin and the digital-asset idea", body: "Build the vocabulary and first-principles models needed to understand what the technology is trying to change.", metric: "Modules 1.1-1.4", tone: "blue" },
        { id: "mechanics", label: "Stage 2 - Understand", title: "Networks, keys, wallets and transactions", body: "Follow how records change, how control is proved and where operational mistakes create loss.", metric: "Modules 1.5-1.20", tone: "green" },
        { id: "evaluate", label: "Stage 3 - Evaluate", title: "Markets, supply, tokenomics and volatility", body: "Replace headline reactions with calculations, evidence checks and conditional reasoning.", metric: "Modules 1.21-1.24", tone: "orange" },
        { id: "protect", label: "Stage 4 - Protect", title: "Security, fraud, risk and regulation", body: "Build practical controls for participation, records, recovery, tax and personal safety.", metric: "Modules 1.25-1.30", tone: "red" },
        { id: "prove", label: "Stage 5 - Prove", title: "Capstone and next-stage plan", body: "Connect the evidence, state the limits of your conclusion and produce work you can revisit or share.", metric: "Module 1.31", tone: "blue" },
      ],
      {
        kind: "branch",
        title: "Choose how you will use the programme",
        prompt: "Which approach creates the strongest learning outcome?",
        options: [
          { id: "watch", label: "Watch every lesson once and rely on memory.", verdict: "Recognition, not mastery", feedback: "Familiarity fades quickly. The programme is designed around decisions, retrieval and saved evidence.", tone: "risk" },
          { id: "trade", label: "Use each lesson to decide what to buy next.", verdict: "Wrong success measure", feedback: "The programme teaches reasoning and safety. It does not provide personalised financial advice or guaranteed outcomes.", tone: "caution" },
          { id: "apply", label: "Complete the activity, explain the idea in my own words and save one useful output.", verdict: "The Learn-Do-Prove rhythm", feedback: "This turns content into a reusable capability and gives you evidence of progress.", tone: "good" },
        ],
      },
      "Do not measure progress by time spent on the page. Measure it by the distinctions you can explain, the decisions you can defend and the controls you can use.",
    ),
  },
  {
    id: "cmf-start-here-lesson-02",
    title: "Choose your purpose and your boundaries",
    type: "interactive",
    duration: 6,
    watch: 0,
    transcript: `A useful learning goal changes how you pay attention. A vague goal such as learn crypto leaves every topic equally important. A practical goal identifies the decision or capability you want to improve.

You might want to understand Bitcoin without relying on slogans, participate in digital assets more safely, evaluate a project for work, explain the subject to clients, or prepare for advanced study. None of those goals requires a price prediction. Each gives you a different reason to collect evidence.

Now add boundaries. Decide how much time you can commit each week, what information you will never disclose, and what actions you will not take merely for an exercise. The course never requires a purchase, a live wallet connection, leverage or disclosure of credentials. If you choose to experiment outside the course, that is a separate decision and should follow your own legal, financial and security checks.

Write one sentence using this pattern: I am taking Crypto Mastery so that I can make or explain this decision more responsibly. Then name one piece of evidence that would show progress. That might be a clear explanation, a completed risk checklist, a transaction pre-flight procedure or a defensible project review.

Your purpose can change. The important thing is to make it visible. A visible purpose helps you distinguish useful depth from distracting noise.`,
    content: `## Your outcome

Write a specific learning purpose, a proof-of-progress statement and non-negotiable safety boundaries.

## Complete this before moving on

- **Purpose:** I am taking Crypto Mastery so that I can...
- **Proof:** I will know I am progressing when I can...
- **Time:** I can realistically commit...
- **Boundary:** I will never disclose or risk...

Use the downloadable field guide in the next lesson to keep these decisions.`,
    experience: experience(
      "Personal compass",
      "A clear purpose makes the course yours.",
      "Test four common intentions and choose the one that produces evidence rather than activity.",
      [
        { id: "curious", label: "Intent 1 - Understand", title: "Replace slogans with working models", body: "Aim to explain the system, its trade-offs and its failure modes in plain language.", metric: "Explain", tone: "blue" },
        { id: "safe", label: "Intent 2 - Participate safely", title: "Turn risks into operating controls", body: "Aim to use checklists, verification steps, recovery plans and clear limits before taking action.", metric: "Protect", tone: "green" },
        { id: "evaluate", label: "Intent 3 - Evaluate", title: "Judge claims against evidence", body: "Aim to identify assumptions, dependencies and missing information before reaching a conclusion.", metric: "Decide", tone: "orange" },
        { id: "communicate", label: "Intent 4 - Communicate", title: "Help someone else understand responsibly", body: "Aim to explain both the strongest case and the material limits without hype or false certainty.", metric: "Teach", tone: "red" },
      ],
      {
        kind: "branch",
        title: "Turn an intention into a usable goal",
        prompt: "A learner says: I want to know which coin will make me money. What is the best course goal?",
        options: [
          { id: "promise", label: "Find the one asset that is guaranteed to outperform.", verdict: "Impossible promise", feedback: "No responsible course can guarantee a future market outcome. This goal rewards confidence rather than evidence.", tone: "risk" },
          { id: "tips", label: "Collect as many forecasts and tips as possible.", verdict: "Noise accumulation", feedback: "More predictions do not create better judgement unless assumptions, incentives and evidence are tested.", tone: "caution" },
          { id: "framework", label: "Build a framework for assessing claims, risks, costs and uncertainty before acting.", verdict: "Defensible learning goal", feedback: "The learner can demonstrate this capability even when the future remains uncertain.", tone: "good" },
        ],
      },
      "Your purpose should describe a capability you can demonstrate. Your boundaries should still hold when excitement, urgency or social pressure increases.",
    ),
  },
  {
    id: "cmf-start-here-lesson-03",
    title: "Build your Learn-Do-Prove system",
    type: "interactive",
    duration: 6,
    watch: 0,
    resourceId: "cmf-field-guide",
    transcript: `The course is built around three moves: learn, do and prove.

Learn means building the smallest useful mental model. You do not need to memorise every term on the first pass. You need to understand the distinction the lesson is teaching and where it matters.

Do means making the model work. You may sort evidence, choose between responses, test a risk meter or follow a transaction. Make the choice before reading the feedback. The gap between your first answer and the explanation is valuable information.

Prove means keeping an output. Write a short explanation, save a checklist, record a decision rule or complete a scored check. Proof makes progress visible and gives you something to revise later.

Use a simple weekly rhythm. Complete two or three short lessons, keep one useful output and revisit one earlier explanation. If a topic remains unclear, use the lesson help to request a simpler explanation or send the educator a question with the lesson context attached.

Download the Crypto Mastery Field Guide. It contains the programme map, your learning contract, an evidence test, safety boundaries and a progress tracker. It is not extra reading. It is the working surface for the course.

Finally, choose a sustainable pace. Consistency beats a burst of activity followed by abandonment. The course will preserve your progress and return you to the next useful lesson.`,
    content: `## Your outcome

Set a sustainable study rhythm and use the field guide as the working record for the programme.

## Recommended rhythm

- Complete **two to three lessons per week**.
- Make the activity choice before opening feedback.
- Keep **one proof item** from every module.
- Revisit explanations you initially missed.
- Ask for help at the exact lesson where confusion begins.

## Your field guide

Download the field guide below. Complete the learning contract and safety boundary before starting Module 1.1.`,
    experience: experience(
      "Learning system",
      "Turn short lessons into durable capability.",
      "See what belongs in each part of the learning cycle, then score the strength of your own plan.",
      [
        { id: "learn", label: "Move 1 - Learn", title: "Build one useful mental model", body: "Focus on the lesson outcome, guided explanation and the distinction that changes a real decision.", metric: "Understand", tone: "blue" },
        { id: "do", label: "Move 2 - Do", title: "Commit before seeing feedback", body: "Classify, choose, calculate or test a scenario so the lesson reveals the quality of your reasoning.", metric: "Apply", tone: "orange" },
        { id: "prove", label: "Move 3 - Prove", title: "Keep a reusable output", body: "Save a note, checklist, explanation, score or capstone artefact that shows what you can now do.", metric: "Demonstrate", tone: "green" },
        { id: "review", label: "Move 4 - Review", title: "Return to weak explanations", body: "Use errors as a revision map and ask for contextual help before misunderstanding compounds.", metric: "Improve", tone: "red" },
      ],
      {
        kind: "meter",
        title: "Stress-test your learning plan",
        prompt: "Set each dimension honestly. This score measures the strength of the plan, not your intelligence or crypto knowledge.",
        dimensions: [
          { id: "purpose", label: "Purpose clarity", lowLabel: "Vague interest", highLabel: "Specific capability", weight: 1.3, initial: 50 },
          { id: "rhythm", label: "Sustainable rhythm", lowLabel: "No time reserved", highLabel: "Protected weekly slot", weight: 1.1, initial: 40 },
          { id: "practice", label: "Active practice", lowLabel: "Watch only", highLabel: "Decide before feedback", weight: 1.3, initial: 50 },
          { id: "evidence", label: "Proof of progress", lowLabel: "Nothing saved", highLabel: "One output per module", weight: 1.2, initial: 30 },
        ],
        thresholds: [
          { max: 39, label: "Build the system first", feedback: "The plan relies on motivation. Reserve a time, define one capability and decide what evidence you will keep.", tone: "risk" },
          { max: 69, label: "A workable beginning", feedback: "The plan has useful structure. Strengthen the weakest dimension before the technical modules become demanding.", tone: "caution" },
          { max: 100, label: "Ready for deliberate progress", feedback: "Purpose, practice and evidence are connected. Keep the rhythm modest enough to sustain it.", tone: "good" },
        ],
      },
      "The field guide is not a companion textbook. It is where you record purpose, decisions, boundaries and proof while the interactive course does the teaching.",
    ),
  },
];

const quiz = [
  ["What is the primary promise of Crypto Mastery?", ["Guaranteed market returns", "Clearer, safer and more evidence-led digital-asset decisions", "A list of tokens to buy", "A shortcut around professional advice"], 1, "The programme develops understanding, judgement and safety controls; it does not promise market outcomes.", "Programme purpose"],
  ["Which sequence describes the learning rhythm?", ["Watch, buy, repeat", "Learn, do, prove", "Predict, promote, profit", "Read, memorise, forget"], 1, "Each lesson builds a model, requires an application and produces evidence of progress.", "Learning method"],
  ["Which course activity requires purchasing a cryptoasset?", ["The transaction exercises", "The wallet lessons", "The market lessons", "None of them"], 3, "Every learning outcome can be completed without buying an asset or connecting a live wallet.", "Safety boundary"],
  ["What should you do with a missed quiz question?", ["Hide the attempt", "Treat the explanation as a revision map and try again", "Skip the module permanently", "Assume the answer key is wrong"], 1, "Correction is part of learning; explained feedback shows exactly what to revisit.", "Feedback"],
  ["Which is the strongest proof of progress?", ["Time spent with the tab open", "The number of videos started", "A decision or explanation you can defend with evidence", "A confident price forecast"], 2, "Proof is a reusable capability or artefact, not passive activity.", "Evidence of learning"],
  ["What information should never be entered into a course exercise or support request?", ["A public blockchain address used only for research", "A lesson question", "A private key, password or seed phrase", "A fictional case-study answer"], 2, "Secret credentials can transfer control of assets and must never be disclosed.", "Credential safety"],
];

const videoSize = statSync(videoPath).size;
const guideSize = statSync(guidePath).size;
const statements = [];

statements.push(`UPDATE \`courses\` SET \`description\`=${sql("A complete 31-module Crypto Mastery: Foundations production draft, preceded by a guided orientation. Short interactive lessons, evidence-led decisions, explained assessments, practical safety controls and a final capstone. Private CogniZen review draft; educational content, not financial advice.")},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(courseId)};`);
statements.push(`INSERT OR IGNORE INTO \`course_sections\` (\`id\`,\`course_id\`,\`title\`,\`position\`,\`created_at\`) SELECT ${sql(sectionId)},${sql(courseId)},${sql("Start here: Welcome to Crypto Mastery")},0,${createdAt} WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
statements.push(`INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT 'cmf-welcome-video',c.\`school_id\`,c.\`owner_id\`,'static:/media/faculty/Crypto_Mastery_Pathway.mp4','Crypto_Mastery_Pathway.mp4','video/mp4',${videoSize},'video','Narrated visual introduction to the Crypto Mastery learning journey.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`);
statements.push(`INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT 'cmf-field-guide',c.\`school_id\`,c.\`owner_id\`,'static:/media/course-resources/crypto-mastery-field-guide.pdf','Crypto Mastery Field Guide.pdf','application/pdf',${guideSize},'document','Seven-page working field guide for purpose, evidence, safety and progress.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`);

lessons.forEach((lesson, index) => {
  statements.push(`INSERT OR REPLACE INTO \`lessons\` (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,\`video_key\`,\`primary_asset_id\`,\`intro_asset_id\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`) VALUES (${sql(lesson.id)},${sql(courseId)},${sql(sectionId)},${sql(lesson.title)},${sql(lesson.type)},${sql(lesson.content)},'markdown',NULL,${sql(lesson.assetId || null)},NULL,${lesson.duration},0,0,${lesson.watch},${sql(lesson.transcript)},${sql(lesson.experience)},${index + 1},${createdAt});`);
});

statements.push(`INSERT OR IGNORE INTO \`lesson_resources\` (\`id\`,\`lesson_id\`,\`asset_id\`,\`title\`,\`position\`) VALUES ('cmf-field-guide-link','cmf-start-here-lesson-03','cmf-field-guide','Crypto Mastery Field Guide',1);`);

statements.push(`INSERT OR REPLACE INTO \`lessons\` (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,\`video_key\`,\`primary_asset_id\`,\`intro_asset_id\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`) VALUES ('cmf-start-here-lesson-04',${sql(courseId)},${sql(sectionId)},'Ready to begin','quiz','## Orientation check\n\nConfirm that you understand how the programme works and the safety boundaries that apply. Reach 80% to begin Module 1.1. Attempts are unlimited and every answer includes an explanation.','markdown',NULL,NULL,NULL,5,0,0,0,'','',4,${createdAt});`);
statements.push(`INSERT OR REPLACE INTO \`quizzes\` (\`id\`,\`lesson_id\`,\`title\`,\`passing_score\`,\`max_attempts\`) VALUES ('cmf-start-here-quiz','cmf-start-here-lesson-04','Crypto Mastery orientation check',80,0);`);
quiz.forEach(([prompt, options, correctIndex, explanation, concept], index) => {
  statements.push(`INSERT OR REPLACE INTO \`quiz_questions\` (\`id\`,\`quiz_id\`,\`prompt\`,\`options_json\`,\`correct_index\`,\`explanation\`,\`concept_label\`,\`position\`) VALUES (${sql(`cmf-start-here-quiz-q${String(index + 1).padStart(2, "0")}`)},'cmf-start-here-quiz',${sql(prompt)},${sql(JSON.stringify(options))},${correctIndex},${sql(explanation)},${sql(concept)},${index + 1});`);
});

const target = new URL("../drizzle/0057_crypto_mastery_welcome.sql", import.meta.url);
await writeFile(target, `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log(`Wrote the Crypto Mastery orientation: 1 section, 4 lessons, 3 experiences, ${quiz.length} questions, 1 video and 1 field guide.`);
