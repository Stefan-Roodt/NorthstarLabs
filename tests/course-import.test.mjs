import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMediaManifest,
  courseFromDocumentSequence,
  parseCourseCsv,
  parseCourseOutline,
  parseDelimitedText,
  parseLearnerCsv,
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

test("handles tab-delimited exports and embedded newlines", () => {
  const rows = parseDelimitedText("Course\tLesson\tContent\nDemo\tWelcome\t\"Line one\nLine two\"");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].content, "Line one\nLine two");
});
