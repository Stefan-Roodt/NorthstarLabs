import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import {
  runCourseLaunchAutopilot,
  sanitizeImportPlan,
  summarizeImportPlan,
} from "../lib/course-import";

async function main() {
  const sourcePaths = process.argv.slice(2);
  if (!sourcePaths.length) throw new Error("Pass one or more import-plan JSON paths to audit.");

  const reports = [];
  for (const sourcePath of sourcePaths) {
    const parsed = JSON.parse(await readFile(sourcePath, "utf8"));
    const sanitized = sanitizeImportPlan(parsed);
    const automated = runCourseLaunchAutopilot(sanitized.plan);
    const summary = summarizeImportPlan(automated.plan);
    const blankLessons = automated.plan.courses.flatMap((course) => course.sections.flatMap(
      (section) => section.lessons
        .filter((lesson) => (
          !lesson.questions.length
          && !lesson.content.trim()
          && !lesson.transcript.trim()
          && !lesson.mediaUrl
        ))
        .map((lesson) => `${course.title} / ${section.title} / ${lesson.title}`),
    ));

    reports.push({
      source: basename(sourcePath),
      summary,
      sanitizeWarnings: sanitized.warnings,
      automation: automated.report,
      blankLessons,
    });
  }

  process.stdout.write(`${JSON.stringify(reports, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
