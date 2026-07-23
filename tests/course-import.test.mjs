import assert from "node:assert/strict";
import test from "node:test";
import {
  analyseLearnerCsv,
  applyMediaManifest,
  courseFromDocumentSequence,
  parseCourseCsv,
  parseCourseOutline,
  parseDelimitedText,
  parseLearnerCsv,
  runCourseLaunchAutopilot,
  sanitizeImportPlan,
  summarizeImportPlan,
} from "../lib/course-import.ts";

test("parses quoted course CSV rows into courses, modules, lessons and quizzes", () => {
  const courses = parseCourseCsv(`Course,Module,Lesson,Type,Content,Question,Options,Correct Answer,Feedback
"Digital Assets, Explained",Foundations,Origins,text,"A comma-safe introduction",,,,
"Digital Assets, Explained",Foundations,Check the idea,quiz,,"Which came first?","Bitcoin|Ethereum|Solana",Bitcoin,"Bitcoin launched first."`);
  assert.equal(courses.length, 1);
  assert.equal(courses[0].title, "Digital Assets, Explained");
  assert.equal(courses[0].sections.length, 1);
  assert.deepEqual(courses[0].sections[0].lessons.map((lesson) => lesson.title), ["Origins", "Check the idea"]);
  assert.equal(courses[0].sections[0].lessons[1].questions.length, 1);
  assert.equal(courses[0].sections[0].lessons[1].questions[0].correctIndex, 0);
});

test("treats selected documents as sequential modules in the supplied order", () => {
  const course = courseFromDocumentSequence("Digital Assets Programme", [
    { clientId: "doc-regulation", filename: "01-regulation.pdf", contentType: "application/pdf", sizeBytes: 1200 },
    { clientId: "doc-custody", filename: "02-custody.docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", sizeBytes: 2400 },
    { clientId: "doc-risk", filename: "03-risk.md", contentType: "text/markdown", sizeBytes: 300, text: "# Risk\nReview the evidence." },
  ]);
  assert.deepEqual(course.sections.map((section) => section.title), [
    "Module 1: 01 regulation",
    "Module 2: 02 custody",
    "Module 3: 03 risk",
  ]);
  assert.deepEqual(course.sections.map((section) => section.lessons[0].document.clientId), [
    "doc-regulation",
    "doc-custody",
    "doc-risk",
  ]);
  assert.match(course.sections[2].lessons[0].content, /Review the evidence/);
});

test("preserves supplied module numbers instead of silently renumbering gaps", () => {
  const course = courseFromDocumentSequence("Foundations", [
    { clientId: "doc-14", filename: "Module 1.14 Centralised exchanges.docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", sizeBytes: 1200 },
    { clientId: "doc-16", filename: "Module 1.16 Buying and selling.docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", sizeBytes: 1200 },
  ]);
  assert.deepEqual(course.sections.map((section) => section.title), [
    "Module 1.14: Centralised exchanges",
    "Module 1.16: Buying and selling",
  ]);
});

test("uses a Word document's internal module heading when the filename is wrong", () => {
  const course = courseFromDocumentSequence("Markets", [{
    clientId: "doc-conflict",
    filename: "Module 2.2 Market Cycles.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sizeBytes: 1200,
    text: "## Module 2.3: Market Cycles and Investor Psychology\n\n### Introduction\n\nMarkets move through cycles.",
  }]);
  assert.equal(course.sections[0].title, "Module 2.3: Market Cycles and Investor Psychology");
});

test("parses outlines, learner lists and media manifests without silently inventing data", () => {
  const [course] = parseCourseOutline(`# Bitcoin Intelligence
An evidence-led course.
## Origins
### Cypherpunk lineage
Read the source material.
### Genesis block
## Architecture
- Transactions and UTXOs`, "Fallback");
  const learners = parseLearnerCsv(`Email,Full name,Course
learner@example.com,Alex Learner,Bitcoin Intelligence
LEARNER@example.com,Duplicate,Bitcoin Intelligence`);
  const media = applyMediaManifest([course], `Course,Module,Lesson,Media URL,Type
Bitcoin Intelligence,Origins,Genesis block,https://media.example.com/genesis.mp4,video`);
  assert.equal(course.sections.length, 2);
  assert.equal(course.sections[0].lessons.length, 2);
  assert.equal(learners.length, 1);
  assert.equal(media.matched, 1);
  assert.equal(course.sections[0].lessons[1].mediaUrl, "https://media.example.com/genesis.mp4");
});

test("server normalisation preserves document mappings and enforces safe totals", () => {
  const course = courseFromDocumentSequence("Ordered course", [
    { clientId: "doc-1", filename: "first.pdf", contentType: "application/pdf", sizeBytes: 500 },
    { clientId: "doc-2", filename: "second.pdf", contentType: "application/pdf", sizeBytes: 700 },
  ]);
  const { plan, summary } = sanitizeImportPlan({
    version: 1,
    academyName: "Fixture Academy",
    courses: [course],
    learners: [{ email: "person@example.com", displayName: "Person", courseTitle: "Ordered course" }],
    sourceFiles: ["first.pdf", "second.pdf"],
  });
  assert.equal(plan.courses[0].sections[0].lessons[0].document.clientId, "doc-1");
  assert.deepEqual(summary, summarizeImportPlan(plan));
  assert.deepEqual(summary, {
    courses: 1,
    sections: 2,
    lessons: 2,
    quizzes: 0,
    questions: 0,
    mediaLinks: 0,
    documents: 2,
    learners: 1,
  });
});

test("server normalisation preserves zero-based correct-answer indexes from JSON", () => {
  const { plan } = sanitizeImportPlan({
    courses: [{
      title: "Assessment fixture",
      sections: [{
        title: "Check",
        lessons: [{
          title: "Knowledge check",
          lessonType: "quiz",
          questions: [{
            prompt: "Which option is correct?",
            options: ["First", "Second", "Third"],
            correctIndex: 2,
            explanation: "The third option is correct.",
          }],
        }],
      }],
    }],
  });
  assert.equal(plan.courses[0].sections[0].lessons[0].questions[0].correctIndex, 2);
});

test("cleans malformed module punctuation and flags text-only course drafts honestly", () => {
  const { plan, warnings } = sanitizeImportPlan({
    courses: [{
      title: "Advanced strategy",
      sections: [{
        title: "Module 3.2: . Mean-Reversion Strategy",
        lessons: Array.from({ length: 5 }, (_, index) => ({
          title: `Lesson ${index + 1}`,
          content: "Evidence-led teaching content.",
        })),
      }],
    }],
  });
  assert.equal(plan.courses[0].sections[0].title, "Module 3.2: Mean-Reversion Strategy");
  assert.match(warnings.join("\n"), /text-first private draft/i);
  assert.match(warnings.join("\n"), /before publishing/i);
});

test("handles tab-delimited exports and embedded newlines", () => {
  const rows = parseDelimitedText("Course\tLesson\tContent\nDemo\tWelcome\t\"Line one\nLine two\"");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].content, "Line one\nLine two");
});

test("learner data automation preserves multi-course assignments and reports bad rows", () => {
  const { learners, report } = analyseLearnerCsv(`Email,Name,Course
LEARNER@example.com,Alex,Bitcoin Foundations
learner@example.com,Alex,Digital Assets
learner@example.com,Alex,Digital Assets
not-an-email,Nope,Bitcoin Foundations
second@example.com,,`);
  assert.equal(learners.length, 3);
  assert.deepEqual(learners.map((learner) => learner.courseTitle), ["Bitcoin Foundations", "Digital Assets", ""]);
  assert.equal(report.duplicates, 1);
  assert.equal(report.invalidEmails, 1);
  assert.equal(report.missingNames, 1);
  assert.equal(report.missingCourse, 1);
  assert.equal(report.warnings.length, 4);
  const normalised = sanitizeImportPlan({ learners }).plan.learners;
  assert.equal(normalised.filter((learner) => learner.email === "learner@example.com").length, 2);
});

test("course launch autopilot splits long supplied material and drafts grounded checks", () => {
  const paragraphs = Array.from({ length: 24 }, (_, index) => (
    `Evidence point ${index + 1} explains how a distributed ledger records transactions and why independent verification matters to participants in the network. ` +
    `The supplied material connects this mechanism to practical custody decisions, operational risk, and the need to test claims against primary evidence.`
  )).join("\n\n");
  const course = courseFromDocumentSequence("Bitcoin Foundations", [{
    clientId: "source-1",
    filename: "01-network.md",
    contentType: "text/markdown",
    sizeBytes: paragraphs.length,
    text: paragraphs,
  }]);
  const automated = runCourseLaunchAutopilot({
    version: 1,
    academyName: "Fixture Academy",
    courses: [course],
    learners: [{ email: "LEARNER@example.com", displayName: "Learner", courseTitle: "" }],
    sourceFiles: ["01-network.md"],
  });
  const lessons = automated.plan.courses[0].sections[0].lessons;
  assert.ok(automated.report.curriculum.lessonsSplit > 0);
  assert.ok(lessons.filter((lesson) => lesson.lessonType !== "quiz").every((lesson) => lesson.durationMinutes <= 6));
  assert.equal(lessons.at(-1).lessonType, "quiz");
  assert.ok(lessons.at(-1).questions.length > 0);
  assert.match(lessons.at(-1).questions[0].explanation, /The source lesson states/);
  assert.equal(automated.plan.learners[0].email, "learner@example.com");
  assert.equal(automated.plan.learners[0].courseTitle, "Bitcoin Foundations");
  assert.equal(automated.report.learners.needCourseReview, 0);
});
