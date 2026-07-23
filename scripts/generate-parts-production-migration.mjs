import fs from "node:fs/promises";

const timestamp = 1785297600000;
const courseId = "cognizen-crypto-mastery-foundations-production";

const sourceFiles = {
  "part-2": {
    input: "C:/Users/Hugo/Documents/NorthstarLabs-Course-Factory/master-curriculum/part-2-import-plan.json",
    output: "drizzle/0077_crypto_mastery_part_2_production.sql",
    label: "2",
  },
  "part-3": {
    input: "C:/Users/Hugo/Documents/NorthstarLabs-Course-Factory/master-curriculum/part-3-import-plan.json",
    output: "drizzle/0078_crypto_mastery_part_3_production.sql",
    label: "3",
  },
};

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "")}'`;
}

function sqlQuestionArray(value) {
  return sqlString(JSON.stringify(value));
}

function sectionId(part, index) {
  const n = String(index).padStart(2, "0");
  return `cmf-module-${part}-${n}`;
}

function lessonId(part, secIndex, lessonIndex) {
  const s = String(secIndex).padStart(2, "0");
  const l = String(lessonIndex).padStart(2, "0");
  return `cmf-module-${part}-${s}-lesson-${l}`;
}

function buildMigration(plan, partLabel) {
  const course = plan?.courses?.[0];
  if (!course || !Array.isArray(course.sections)) {
    throw new Error(`Missing course.sections in part ${partLabel}`);
  }

  const lines = [];
  lines.push("-- Auto-generated from master-curriculum JSON");
  lines.push("-- This migration adds the full part modules to the foundations production course.");

  for (let sectionIndex = 0; sectionIndex < course.sections.length; sectionIndex++) {
    const section = course.sections[sectionIndex];
    const secPos = sectionIndex + 1;
    const secId = sectionId(partLabel, secPos);

    lines.push(`INSERT OR IGNORE INTO \`course_sections\` (\`id\`,\`course_id\`,\`title\`,\`position\`,\`created_at\`) SELECT ${sqlString(secId)},${sqlString(courseId)},${sqlString(section.title)},${secPos},${timestamp} WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sqlString(courseId)});`);
    lines.push("--> statement-breakpoint");

    for (let lessonIndex = 0; lessonIndex < section.lessons.length; lessonIndex++) {
      const lesson = section.lessons[lessonIndex];
      const lessonPos = lessonIndex + 1;
      const lessonIdValue = lessonId(partLabel, secPos, lessonPos);
      const lessonType = lesson.lessonType || "text";

      lines.push(`INSERT OR IGNORE INTO \`lessons\` (\`id\`,\`course_id\`,\`title\`,\`section_id\`,\`lesson_type\`,\`content\`,\`content_format\`,\`video_key\`,\`primary_asset_id\`,\`intro_asset_id\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`) SELECT ${sqlString(lessonIdValue)},${sqlString(courseId)},${sqlString(lesson.title)},${sqlString(secId)},${sqlString(lessonType)},${sqlString(lesson.content)},'markdown',NULL,NULL,NULL,${lesson.durationMinutes || 0},0,0,0,${sqlString(lesson.transcript || "")},${sqlString(lesson.experienceJson || null)},${lessonPos},${timestamp} WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sqlString(courseId)});`);
      lines.push("--> statement-breakpoint");

      if (lessonType === "quiz" && Array.isArray(lesson.questions) && lesson.questions.length > 0) {
        const quizId = `${lessonIdValue}-quiz`;
        const passingScore = lesson.passingScore || 80;
        lines.push(`INSERT OR IGNORE INTO \`quizzes\` (\`id\`,\`lesson_id\`,\`title\`,\`passing_score\`,\`max_attempts\`) SELECT ${sqlString(quizId)},${sqlString(lessonIdValue)},${sqlString(section.title)},${passingScore},0 WHERE EXISTS (SELECT 1 FROM \`lessons\` WHERE \`id\`=${sqlString(lessonIdValue)});`);
        lines.push("--> statement-breakpoint");

        lesson.questions.forEach((question, qIndex) => {
          const qId = `${quizId}-q${String(qIndex + 1).padStart(2, "0")}`;
          const qPos = qIndex + 1;
          lines.push(
            `INSERT OR IGNORE INTO \`quiz_questions\` (\`id\`,\`quiz_id\`,\`prompt\`,\`options_json\`,\`correct_index\`,\`explanation\`,\`concept_label\`,\`position\`) SELECT ${sqlString(
              qId,
            )},${sqlString(quizId)},${sqlString(question.prompt)},${sqlQuestionArray(question.options)},${question.correctIndex || 0},${sqlString(question.explanation)},${sqlString(question.conceptLabel)},${qPos} WHERE EXISTS (SELECT 1 FROM \`quizzes\` WHERE \`id\`=${sqlString(quizId)});`
          );
          lines.push("--> statement-breakpoint");
        });
      }
    }
  }

  return lines.join("\n");
}

async function main() {
  for (const item of Object.values(sourceFiles)) {
    const raw = await fs.readFile(item.input, "utf8");
    const plan = JSON.parse(raw);
    const sql = buildMigration(plan, item.label);
    await fs.writeFile(item.output, sql, "utf8");
    console.log(`Wrote ${item.output}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
