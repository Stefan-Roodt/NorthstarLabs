import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const courseId = "cognizen-crypto-mastery-foundations-production";
const timestamp = 1785384000000;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "drizzle", "0091_crypto_mastery_part_2_3_assessments.sql");
const auditOutput = path.join(root, "outputs", "crypto-mastery-part-2-3-assessment-audit.json");

const sourceFiles = [
  {
    part: "2",
    input: "C:/Users/Hugo/Documents/NorthstarLabs-Course-Factory/master-curriculum/part-2-import-plan.json",
  },
  {
    part: "3",
    input: "C:/Users/Hugo/Documents/NorthstarLabs-Course-Factory/master-curriculum/part-3-import-plan.json",
  },
];

const genericHeadings = new Set([
  "learning objectives",
  "introduction",
  "module summary",
  "summary",
  "conclusion",
  "key takeaways",
  "key takeaway",
  "final perspective",
  "final checklist",
  "practical exercise",
  "worked example",
  "example",
  "case study",
  "references",
  "sources",
  "education and risk note",
  "important note",
  "check your understanding",
  "course completion",
  "complete the course",
]);

const stopWords = new Set([
  "about", "after", "again", "against", "also", "because", "been", "before", "being",
  "between", "both", "could", "does", "each", "from", "have", "into", "itself", "more",
  "most", "other", "over", "same", "should", "than", "that", "their", "there", "these",
  "they", "this", "those", "through", "under", "using", "very", "what", "when", "where",
  "which", "while", "with", "would", "your",
]);

function sql(value) {
  return `'${String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\r/g, "")}'`;
}

function sectionId(part, moduleNumber) {
  return `cmf-module-${part}-${String(moduleNumber).padStart(2, "0")}`;
}

function sourceLessonId(part, moduleNumber, lessonNumber) {
  return `cmf-module-${part}-${String(moduleNumber).padStart(2, "0")}-lesson-${String(lessonNumber).padStart(2, "0")}`;
}

function plain(value) {
  return String(value || "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, (match) => match.replace(/\]\([^)]+\)/, ""))
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHeading(value) {
  return plain(value)
    .replace(/^[“”"'‘’]+|[“”"'‘’]+$/g, "")
    .trim();
}

function shorten(value, maximum = 220) {
  const text = plain(value);
  if (text.length <= maximum) return text;
  const clipped = text.slice(0, maximum - 1);
  const boundary = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, Math.max(boundary, maximum - 35)).replace(/[,:;\s]+$/, "")}…`;
}

function headingKey(value) {
  return plain(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isUsefulHeading(value) {
  const key = headingKey(value);
  if (key.length < 3 || key.length > 78 || genericHeadings.has(key)) return false;
  if (/^(step|phase|part|lesson)\s+\d+\b/.test(key)) return false;
  if (/^(why|how|what)\s+(this|the)\s+(module|course)\b/.test(key)) return false;
  return true;
}

function sentences(value) {
  return plain(value)
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 38 && item.length <= 280)
    .filter((item) => !/^(for example|for instance|suppose|imagine|remember that)\b/i.test(item));
}

function blocksFromMarkdown(content) {
  const lines = String(content || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let current = null;
  for (const [index, line] of lines.entries()) {
    const heading = line.match(/^#{3,4}\s+(.+?)\s*$/);
    const trimmed = line.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const titleWords = words.filter((word) =>
      /^(?:and|or|of|the|to|in|for|with|a|an)$/i.test(word) ||
      /^[A-Z0-9][A-Za-z0-9’'-]*$/.test(word)
    );
    const nextText = lines.slice(index + 1).find((item) => item.trim())?.trim() || "";
    const plainHeading = !heading &&
      words.length >= 2 &&
      words.length <= 10 &&
      trimmed.length <= 78 &&
      !/[.!?:]$/.test(trimmed) &&
      titleWords.length / words.length >= 0.8 &&
      nextText.length >= 35;
    if (heading || plainHeading) {
      if (current) blocks.push(current);
      current = { heading: cleanHeading(heading?.[1] || trimmed), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

function firstUsefulAnswer(block) {
  const raw = block.lines.join("\n");
  const paragraphCandidates = raw
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !/^(?:[-*]|\d+[.)])\s+/m.test(item))
    .flatMap(sentences)
    .filter((item) => !/^[“"']/.test(item));
  const preferred = paragraphCandidates.find((item) =>
    !/^(this|these|it|they|such|possible|common)\b/i.test(item)
  ) || paragraphCandidates[0];

  const bullets = raw
    .split("\n")
    .map((item) => item.match(/^\s*(?:[-*]|\d+[.)])\s+(.+)$/)?.[1])
    .filter(Boolean)
    .map(plain)
    .filter((item) => item.length >= 3)
    .slice(0, 4);
  const plainContinuations = block.lines
    .map((item) => plain(item))
    .filter((item) => item && item !== preferred)
    .filter((item) => item.length >= 3 && item.length <= 72)
    .filter((item) => !/[.!?:]$/.test(item))
    .slice(0, 4);
  const listedItems = bullets.length >= 2 ? bullets : plainContinuations;
  if (preferred?.endsWith(":") && listedItems.length >= 2) {
    return shorten(`${preferred} ${listedItems.join(", ")}.`);
  }
  if (preferred) return shorten(preferred);
  if (bullets.length >= 2) {
    return shorten(`The module associates this concept with ${bullets.join(", ")}.`);
  }
  return "";
}

function answerWithoutGiveaway(heading, answer) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const result = shorten(
    answer
      .replace(
        new RegExp(`^${escaped}\\s+(?:is|are|means|describes|refers to|occurs when|uses|measures|represents)\\s+`, "i"),
        "",
      )
      .replace(/^it\s+(?:is|means|describes|refers to|occurs when|uses|measures|represents)\s+/i, ""),
  );
  return result ? `${result[0].toUpperCase()}${result.slice(1)}` : result;
}

function conceptCards(section, sectionOrder = 0) {
  const cards = [];
  for (const lesson of section.lessons) {
    if (lesson.lessonType === "quiz" || /check your understanding/i.test(lesson.title)) continue;
    const blocks = blocksFromMarkdown(lesson.content);
    for (const block of blocks) {
      if (!isUsefulHeading(block.heading)) continue;
      const rawAnswer = firstUsefulAnswer(block);
      const answer = answerWithoutGiveaway(block.heading, rawAnswer);
      if (answer.length < 35 || answer.endsWith(":")) continue;
      const key = headingKey(block.heading);
      const definitionScore = new RegExp(
        `^${block.heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(?:is|are|means|describes|refers|occurs|uses|measures|represents)\\b`,
        "i",
      ).test(rawAnswer) ? 5 : 0;
      const score = definitionScore + (answer.length <= 180 ? 2 : 0) + (block.heading.length <= 48 ? 1 : 0);
      cards.push({
        heading: block.heading,
        key,
        answer,
        lessonTitle: lesson.title,
        sectionOrder,
        score,
      });
    }
  }

  const unique = new Map();
  for (const card of cards) {
    if (!unique.has(card.key) || unique.get(card.key).score < card.score) unique.set(card.key, card);
  }
  return [...unique.values()];
}

function welcomeCards(section) {
  if (!/^Start here: Welcome to Advanced Digital Asset Strategy/i.test(section.title)) return [];
  return [
    {
      heading: "Integrated evidence",
      answer: "Compare different sources of evidence rather than relying on one chart, one indicator or one market opinion.",
    },
    {
      heading: "Capital preservation",
      answer: "Use leverage control, position sizing, drawdown management and preservation of capital as central disciplines.",
    },
    {
      heading: "Advanced strategy",
      answer: "Understand the complete risk structure behind a decision and determine whether the potential return justifies that risk.",
    },
    {
      heading: "Independent analysis",
      answer: "Question confident predictions, examine assumptions and avoid allowing excitement or fear to replace disciplined analysis.",
    },
    {
      heading: "Managing uncertainty",
      answer: "Create realistic scenarios, identify important risks, determine what evidence matters, control exposure and respond when conditions change.",
    },
    {
      heading: "Course progression",
      answer: "Take time with each module because the material is designed to build progressively into an advanced digital asset strategy.",
    },
    {
      heading: "Professional applications",
      answer: "Apply the knowledge as an investor, trader, business leader, adviser, entrepreneur or informed digital-economy participant.",
    },
    {
      heading: "Knowing when not to act",
      answer: "Recognise that sound advanced strategy includes knowing when the available evidence does not justify taking risk.",
    },
  ].map((card, index) => ({
    ...card,
    key: headingKey(card.heading),
    lessonTitle: section.lessons[0]?.title || section.title,
    sectionOrder: 0,
    score: 10 - index,
  }));
}

function headingTokens(value) {
  return new Set(
    headingKey(value)
      .split(" ")
      .filter((word) => word.length > 3 && !stopWords.has(word)),
  );
}

function overlap(left, right) {
  const a = headingTokens(left);
  const b = headingTokens(right);
  return [...a].filter((word) => b.has(word)).length;
}

function selectCards(cards, count = 5) {
  const sorted = [...cards].sort((left, right) =>
    right.score - left.score ||
    left.heading.localeCompare(right.heading)
  );
  const selected = [];
  const lessons = new Set();
  for (const card of sorted) {
    if (selected.length >= count) break;
    if (lessons.has(card.lessonTitle)) continue;
    selected.push(card);
    lessons.add(card.lessonTitle);
  }
  for (const card of sorted) {
    if (selected.length >= count) break;
    if (!selected.includes(card)) selected.push(card);
  }
  return selected;
}

function selectCourseReviewCards(cards, count = 5) {
  const groups = [...cards.reduce((result, card) => {
    const bucket = result.get(card.sectionOrder) || [];
    bucket.push(card);
    result.set(card.sectionOrder, bucket);
    return result;
  }, new Map()).entries()]
    .sort((left, right) => left[0] - right[0])
    .filter(([, group]) => group.length >= 4);
  if (groups.length < count) return selectCards(cards, count);
  const selected = [];
  for (let index = 0; index < count; index++) {
    const groupIndex = Math.round(index * (groups.length - 1) / (count - 1));
    const group = groups[groupIndex][1];
    selected.push([...group].sort((left, right) => right.score - left.score)[0]);
  }
  return selected;
}

function buildQuestion(card, pool, index, scope = "module") {
  const distractors = pool
    .filter((candidate) => candidate !== card && candidate.answer !== card.answer)
    .sort((left, right) =>
      overlap(card.heading, left.heading) - overlap(card.heading, right.heading) ||
      right.score - left.score ||
      left.heading.localeCompare(right.heading)
    )
    .slice(0, 3);
  if (distractors.length < 3) {
    throw new Error(`Not enough distinct distractors for ${card.heading}`);
  }
  const base = [card.answer, ...distractors.map((item) => item.answer)];
  const shift = index % base.length;
  const options = [...base.slice(shift), ...base.slice(0, shift)];
  return {
    prompt: `Which explanation best matches “${card.heading}” in this ${scope}?`,
    options,
    correctIndex: options.indexOf(card.answer),
    explanation: `The module explains “${card.heading}” as follows: ${card.answer}`,
    conceptLabel: card.heading,
  };
}

function retrievalPrompts(lesson) {
  return String(lesson?.content || "")
    .split("\n")
    .map((line) => line.match(/^\s*\d+[.)]\s+(.+?)\s*$/)?.[1])
    .filter(Boolean)
    .map(plain)
    .filter((item) => item.length >= 12)
    .slice(0, 3);
}

function assessmentContent(section, checkLesson) {
  const prompts = retrievalPrompts(checkLesson);
  return [
    "## Your outcome",
    "",
    `Retrieve and apply the key ideas from ${section.title}, then confirm your understanding with immediate, source-grounded feedback.`,
    "",
    "## Think before you choose",
    "",
    ...(prompts.length
      ? prompts.flatMap((prompt) => [`- ${prompt}`, ""])
      : [
          "- State the module's central decision or analytical principle in your own words.",
          "",
          "- Identify one assumption, limitation or risk that could change the conclusion.",
          "",
          "- Name one practical situation in which you would apply the module.",
          "",
        ]),
    "## Scored knowledge check",
    "",
    "Answer all five questions. Each answer returns an explanation tied to the approved module material. Reach 80% to complete the module; attempts are unlimited.",
  ].join("\n").trim();
}

function quizStatements({ part, section, sectionIndex, partCards }) {
  const moduleNumber = part === "3" ? sectionIndex : sectionIndex + 1;
  const secId = sectionId(part, moduleNumber);
  const existingQuiz = section.lessons.find((lesson) =>
    lesson.lessonType === "quiz" && Array.isArray(lesson.questions) && lesson.questions.length > 0
  );
  if (existingQuiz) return null;

  const specialCards = welcomeCards(section);
  const sectionCards = specialCards.length ? specialCards : conceptCards(section, sectionIndex);
  const useCourseReview = sectionCards.length < 8;
  const cards = useCourseReview ? partCards : sectionCards;
  const selected = useCourseReview ? selectCourseReviewCards(cards) : selectCards(cards);
  if (selected.length < 5 || cards.length < 8) {
    throw new Error(`${section.title} produced only ${selected.length} selected cards from ${cards.length} candidates`);
  }
  const questions = selected.map((card, index) =>
    buildQuestion(card, selected, index, useCourseReview ? "course" : "module")
  );
  const checkIndex = section.lessons.findIndex((lesson) => /check your understanding/i.test(lesson.title));
  const converted = checkIndex >= 0;
  const checkLesson = converted ? section.lessons[checkIndex] : null;
  const lessonNumber = converted ? checkIndex + 1 : section.lessons.length + 1;
  const lessonId = sourceLessonId(part, moduleNumber, lessonNumber);
  const quizId = `${lessonId}-quiz`;
  const content = assessmentContent(section, checkLesson);
  const lines = [];

  if (converted) {
    lines.push(
      `UPDATE \`lessons\` SET \`title\`='Apply and check your understanding',\`lesson_type\`='quiz',\`content\`=${sql(content)},\`content_format\`='markdown',\`duration_minutes\`=6,\`updated_at\`=${timestamp} WHERE \`id\`=${sql(lessonId)} AND \`course_id\`=${sql(courseId)};`,
    );
  } else {
    lines.push(
      `INSERT OR IGNORE INTO \`lessons\` (\`id\`,\`course_id\`,\`title\`,\`section_id\`,\`lesson_type\`,\`content\`,\`content_format\`,\`video_key\`,\`primary_asset_id\`,\`intro_asset_id\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`) SELECT ${sql(lessonId)},${sql(courseId)},'Apply and check your understanding',${sql(secId)},'quiz',${sql(content)},'markdown',NULL,NULL,NULL,6,0,0,0,'','',${lessonNumber},${timestamp} WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`,
    );
  }
  lines.push("--> statement-breakpoint");
  lines.push(
    `INSERT OR IGNORE INTO \`quizzes\` (\`id\`,\`lesson_id\`,\`title\`,\`passing_score\`,\`max_attempts\`) SELECT ${sql(quizId)},${sql(lessonId)},${sql(`${section.title}: applied knowledge check`)},80,0 WHERE EXISTS (SELECT 1 FROM \`lessons\` WHERE \`id\`=${sql(lessonId)});`,
  );
  lines.push("--> statement-breakpoint");
  questions.forEach((question, index) => {
    const questionId = `${quizId}-q${String(index + 1).padStart(2, "0")}`;
    lines.push(
      `INSERT OR IGNORE INTO \`quiz_questions\` (\`id\`,\`quiz_id\`,\`prompt\`,\`options_json\`,\`correct_index\`,\`explanation\`,\`concept_label\`,\`position\`) SELECT ${sql(questionId)},${sql(quizId)},${sql(question.prompt)},${sql(JSON.stringify(question.options))},${question.correctIndex},${sql(question.explanation)},${sql(question.conceptLabel)},${index + 1} WHERE EXISTS (SELECT 1 FROM \`quizzes\` WHERE \`id\`=${sql(quizId)});`,
    );
    lines.push("--> statement-breakpoint");
  });
  return {
    lines,
    audit: {
      part,
      section: section.title,
      sectionId: secId,
      lessonId,
      convertedExistingCheck: converted,
      courseReview: useCourseReview,
      questions,
    },
  };
}

async function main() {
  const lines = [
    "-- Source-grounded applied assessments for every Part 2 and Part 3 module.",
    "-- Existing written retrieval prompts are retained; native scoring, answer feedback,",
    "-- mastery tracking, lesson gating and certificate progress now use the quiz engine.",
  ];
  const audit = [];
  for (const source of sourceFiles) {
    const plan = JSON.parse(await fs.readFile(source.input, "utf8"));
    const sections = plan?.courses?.[0]?.sections;
    if (!Array.isArray(sections)) throw new Error(`Missing sections in ${source.input}`);
    const partCards = sections.flatMap((section, index) => conceptCards(section, index));
    for (const [sectionIndex, section] of sections.entries()) {
      const result = quizStatements({ part: source.part, section, sectionIndex, partCards });
      if (!result) continue;
      lines.push(...result.lines);
      audit.push(result.audit);
    }
  }
  if (audit.length !== 62) throw new Error(`Expected 62 missing assessments; generated ${audit.length}`);
  if (audit.some((item) => item.questions.length !== 5)) {
    throw new Error("Every generated assessment must contain five questions");
  }
  await fs.mkdir(path.dirname(auditOutput), { recursive: true });
  await fs.writeFile(output, `${lines.join("\n")}\n`, "utf8");
  await fs.writeFile(auditOutput, `${JSON.stringify({
    courseId,
    generatedAt: new Date(timestamp).toISOString(),
    assessmentCount: audit.length,
    questionCount: audit.reduce((sum, item) => sum + item.questions.length, 0),
    convertedChecks: audit.filter((item) => item.convertedExistingCheck).length,
    appendedChecks: audit.filter((item) => !item.convertedExistingCheck).length,
    assessments: audit,
  }, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(root, output)} with ${audit.length} assessments and ${audit.length * 5} questions.`);
  console.log(`Wrote ${path.relative(root, auditOutput)} for human review.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
