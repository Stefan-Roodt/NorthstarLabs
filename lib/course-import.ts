export type CourseImportQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptLabel: string;
};

export type CourseImportDocument = {
  clientId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
};

export type CourseImportLesson = {
  clientId: string;
  title: string;
  lessonType: "text" | "video" | "audio" | "resource" | "quiz";
  content: string;
  transcript: string;
  durationMinutes: number;
  mediaUrl: string;
  mediaFilename: string;
  questions: CourseImportQuestion[];
  document: CourseImportDocument | null;
};

export type CourseImportSection = {
  clientId: string;
  title: string;
  lessons: CourseImportLesson[];
};

export type CourseImportCourse = {
  clientId: string;
  title: string;
  description: string;
  sections: CourseImportSection[];
};

export type CourseImportLearner = {
  email: string;
  displayName: string;
  courseTitle: string;
};

export type CourseImportPlan = {
  version: 1;
  academyName: string;
  courses: CourseImportCourse[];
  learners: CourseImportLearner[];
  sourceFiles: string[];
};

export type CourseImportSummary = {
  courses: number;
  sections: number;
  lessons: number;
  quizzes: number;
  questions: number;
  mediaLinks: number;
  documents: number;
  learners: number;
};

export type LearnerDataReport = {
  rows: number;
  accepted: number;
  duplicates: number;
  invalidEmails: number;
  missingNames: number;
  missingCourse: number;
  warnings: string[];
};

export type CourseLaunchAutopilotReport = {
  score: number;
  curriculum: {
    modules: number;
    lessons: number;
    lessonsSplit: number;
    shortLessons: number;
  };
  quizzes: {
    moduleChecksCreated: number;
    questionsCreated: number;
    modulesCovered: number;
    modulesTotal: number;
  };
  learners: {
    records: number;
    matchedToCourse: number;
    needCourseReview: number;
  };
  completed: string[];
  review: string[];
};

export type SequentialDocumentInput = CourseImportDocument & { text?: string };

type CsvRow = Record<string, string>;
type UnknownRecord = Record<string, unknown>;

const COURSE_ALIASES = ["course", "course title", "course name", "product", "product name"];
const SECTION_ALIASES = ["section", "section title", "chapter", "chapter title", "module", "module title"];
const LESSON_ALIASES = ["lesson", "lesson title", "lecture", "lecture title", "content title", "unit", "unit title", "title"];
const TYPE_ALIASES = ["lesson type", "content type", "item type", "type", "format"];
const BODY_ALIASES = ["content", "body", "lesson content", "description", "text", "notes"];
const TRANSCRIPT_ALIASES = ["transcript", "captions", "script"];
const DURATION_ALIASES = ["duration", "duration minutes", "minutes", "length"];
const MEDIA_URL_ALIASES = ["media url", "video url", "audio url", "url", "embed url"];
const MEDIA_FILE_ALIASES = ["media filename", "filename", "file name", "asset"];
const EMAIL_ALIASES = ["email", "email address", "learner email", "user email"];
const NAME_ALIASES = ["name", "full name", "learner name", "student name", "display name"];
const QUESTION_ALIASES = ["question", "question prompt", "quiz question", "prompt"];
const OPTIONS_ALIASES = ["options", "answers", "answer options", "choices"];
const CORRECT_ALIASES = ["correct", "correct answer", "answer", "correct index"];
const EXPLANATION_ALIASES = ["explanation", "feedback", "answer explanation"];
const CONCEPT_ALIASES = ["concept", "concept label", "skill", "topic"];

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function cleanText(value: unknown, limit = 100_000) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function cleanTitle(value: unknown, fallback: string, limit = 160) {
  return (cleanText(value, limit) || fallback).replace(/\s+/g, " ").slice(0, limit);
}

function clientId(prefix: string, ...parts: Array<string | number>) {
  const suffix = parts.join("-").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-");
  return `${prefix}-${suffix || "1"}`.slice(0, 120);
}

function normalizedKey(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
}

function valueFrom(row: CsvRow, aliases: string[]) {
  for (const alias of aliases) {
    const found = row[normalizedKey(alias)];
    if (found?.trim()) return found.trim();
  }
  return "";
}

export function parseDelimitedText(text: string) {
  const source = text.replace(/^\uFEFF/, "");
  const firstLine = source.split(/\r?\n/, 1)[0] || "";
  const delimiter = firstLine.split("\t").length > firstLine.split(",").length ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((entry) => entry.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += character;
  }
  row.push(cell);
  if (row.some((entry) => entry.trim())) rows.push(row);
  if (!rows.length) return [] as CsvRow[];
  const headers = rows[0].map((header, index) => normalizedKey(header) || `column ${index + 1}`);
  return rows.slice(1).map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index]?.trim() || ""]),
  ));
}

function safeMediaUrl(value: unknown) {
  const candidate = cleanText(value, 2_000);
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function lessonType(value: unknown, mediaUrl = ""): CourseImportLesson["lessonType"] {
  const normalized = cleanText(value, 40).toLowerCase();
  if (normalized.includes("quiz") || normalized.includes("assessment")) return "quiz";
  if (normalized.includes("audio") || /\.(mp3|m4a|wav|ogg)(\?|$)/i.test(mediaUrl)) return "audio";
  if (normalized.includes("video") || /\.(mp4|webm|ogv)(\?|$)/i.test(mediaUrl)) return "video";
  if (normalized.includes("resource") || normalized.includes("document") || normalized.includes("download")) return "resource";
  return mediaUrl ? "video" : "text";
}

function numberValue(value: unknown, fallback = 0) {
  const match = String(value ?? "").match(/\d+(?:\.\d+)?/);
  const number = match ? Number(match[0]) : fallback;
  return Number.isFinite(number) ? number : fallback;
}

function parseOptions(value: unknown) {
  if (Array.isArray(value)) return value.map((option) => cleanText(option, 500)).filter(Boolean).slice(0, 8);
  const source = cleanText(value, 4_000);
  if (!source) return [];
  try {
    const parsed = JSON.parse(source);
    if (Array.isArray(parsed)) return parsed.map((option) => cleanText(option, 500)).filter(Boolean).slice(0, 8);
  } catch { /* Delimited answer options are handled below. */ }
  return source.split(/\s*(?:\||;|\n)\s*/).map((option) => option.replace(/^[A-H][).:\s-]+/i, "").trim()).filter(Boolean).slice(0, 8);
}

function correctIndex(value: unknown, options: string[]) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(options.length - 1, Math.round(value)));
  }
  const source = cleanText(value, 500);
  if (!source) return 0;
  const textMatch = options.findIndex((option) => option.toLowerCase() === source.toLowerCase());
  if (textMatch >= 0) return textMatch;
  if (/^[A-H]$/i.test(source)) return Math.min(options.length - 1, source.toUpperCase().charCodeAt(0) - 65);
  const number = Number(source);
  if (!Number.isFinite(number)) return 0;
  if (number === 0) return 0;
  return Math.max(0, Math.min(options.length - 1, Math.round(number) - 1));
}

function questionFromRow(row: CsvRow): CourseImportQuestion | null {
  const prompt = valueFrom(row, QUESTION_ALIASES);
  const options = parseOptions(valueFrom(row, OPTIONS_ALIASES));
  if (!prompt || options.length < 2) return null;
  return {
    prompt: cleanTitle(prompt, "Question", 1_000),
    options,
    correctIndex: correctIndex(valueFrom(row, CORRECT_ALIASES), options),
    explanation: cleanText(valueFrom(row, EXPLANATION_ALIASES), 1_200),
    conceptLabel: cleanTitle(valueFrom(row, CONCEPT_ALIASES), prompt.replace(/[?!.]+$/, ""), 100),
  };
}

function emptyLesson(title: string, sectionIndex: number, lessonIndex: number): CourseImportLesson {
  return {
    clientId: clientId("lesson", sectionIndex, lessonIndex, title),
    title,
    lessonType: "text",
    content: "",
    transcript: "",
    durationMinutes: 0,
    mediaUrl: "",
    mediaFilename: "",
    questions: [],
    document: null,
  };
}

export function parseCourseCsv(text: string, fallbackTitle = "Imported course") {
  const rows = parseDelimitedText(text);
  const courses = new Map<string, CourseImportCourse>();
  for (const [rowIndex, row] of rows.entries()) {
    const title = valueFrom(row, COURSE_ALIASES) || fallbackTitle;
    const courseKey = title.toLowerCase();
    let course = courses.get(courseKey);
    if (!course) {
      course = { clientId: clientId("course", courses.size, title), title, description: "", sections: [] };
      courses.set(courseKey, course);
    }
    const sectionTitle = valueFrom(row, SECTION_ALIASES) || "Course content";
    let section = course.sections.find((candidate) => candidate.title.toLowerCase() === sectionTitle.toLowerCase());
    if (!section) {
      section = { clientId: clientId("section", courses.size, course.sections.length, sectionTitle), title: sectionTitle, lessons: [] };
      course.sections.push(section);
    }
    const titleValue = valueFrom(row, LESSON_ALIASES);
    if (!titleValue) continue;
    const mediaUrl = safeMediaUrl(valueFrom(row, MEDIA_URL_ALIASES));
    const type = lessonType(valueFrom(row, TYPE_ALIASES), mediaUrl);
    let lesson = section.lessons.find((candidate) => candidate.title.toLowerCase() === titleValue.toLowerCase());
    if (!lesson) {
      lesson = {
        ...emptyLesson(titleValue, course.sections.length - 1, section.lessons.length),
        clientId: clientId("lesson", rowIndex, titleValue),
        lessonType: type,
        content: valueFrom(row, BODY_ALIASES),
        transcript: valueFrom(row, TRANSCRIPT_ALIASES),
        durationMinutes: numberValue(valueFrom(row, DURATION_ALIASES)),
        mediaUrl,
        mediaFilename: valueFrom(row, MEDIA_FILE_ALIASES),
      };
      section.lessons.push(lesson);
    }
    const question = questionFromRow(row);
    if (question) {
      lesson.lessonType = "quiz";
      lesson.questions.push(question);
    }
  }
  return Array.from(courses.values()).filter((course) => course.sections.some((section) => section.lessons.length));
}

function unknownArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function pick(source: UnknownRecord, names: string[]) {
  for (const name of names) {
    if (source[name] !== undefined && source[name] !== null) return source[name];
  }
  return undefined;
}

function questionFromUnknown(value: unknown): CourseImportQuestion | null {
  const source = record(value);
  const prompt = cleanText(pick(source, ["prompt", "question", "title"]), 1_000);
  const options = parseOptions(pick(source, ["options", "answers", "choices"]));
  if (!prompt || options.length < 2) return null;
  return {
    prompt,
    options,
    correctIndex: correctIndex(pick(source, ["correctIndex", "correct_index", "correct", "answer"]), options),
    explanation: cleanText(pick(source, ["explanation", "feedback"]), 1_200),
    conceptLabel: cleanTitle(pick(source, ["conceptLabel", "concept", "topic"]), prompt.replace(/[?!.]+$/, ""), 100),
  };
}

function lessonFromUnknown(value: unknown, sectionIndex: number, lessonIndex: number): CourseImportLesson {
  const source = record(value);
  const title = cleanTitle(pick(source, ["title", "name", "lesson", "lecture"]), `Lesson ${lessonIndex + 1}`);
  const mediaUrl = safeMediaUrl(pick(source, ["mediaUrl", "media_url", "videoUrl", "video_url", "audioUrl", "audio_url", "url"]));
  const questions = unknownArray(pick(source, ["questions", "quizQuestions", "quiz_questions"]))
    .map(questionFromUnknown).filter((question): question is CourseImportQuestion => Boolean(question));
  return {
    ...emptyLesson(title, sectionIndex, lessonIndex),
    clientId: cleanText(pick(source, ["clientId", "id"]), 120) || clientId("lesson", sectionIndex, lessonIndex, title),
    lessonType: questions.length ? "quiz" : lessonType(pick(source, ["lessonType", "lesson_type", "type", "format"]), mediaUrl),
    content: cleanText(pick(source, ["content", "body", "description", "text"])),
    transcript: cleanText(pick(source, ["transcript", "script", "captions"])),
    durationMinutes: numberValue(pick(source, ["durationMinutes", "duration_minutes", "duration", "minutes"])),
    mediaUrl,
    mediaFilename: cleanText(pick(source, ["mediaFilename", "media_filename", "filename"]), 180),
    questions,
  };
}

function courseFromUnknown(value: unknown, courseIndex: number): CourseImportCourse {
  const source = record(value);
  const title = cleanTitle(pick(source, ["title", "name", "course", "product"]), `Imported course ${courseIndex + 1}`);
  const rawSections = unknownArray(pick(source, ["sections", "modules", "chapters"]));
  const looseLessons = unknownArray(pick(source, ["lessons", "lectures", "items", "content"]));
  const sections = (rawSections.length ? rawSections : [{ title: "Course content", lessons: looseLessons }])
    .map((sectionValue, sectionIndex) => {
      const section = record(sectionValue);
      const sectionTitle = cleanTitle(pick(section, ["title", "name", "section", "module", "chapter"]), `Module ${sectionIndex + 1}`);
      const lessons = unknownArray(pick(section, ["lessons", "lectures", "items", "content"]))
        .map((lesson, lessonIndex) => lessonFromUnknown(lesson, sectionIndex, lessonIndex));
      return { clientId: clientId("section", courseIndex, sectionIndex, sectionTitle), title: sectionTitle, lessons };
    }).filter((section) => section.lessons.length);
  return {
    clientId: cleanText(pick(source, ["clientId", "id"]), 120) || clientId("course", courseIndex, title),
    title,
    description: cleanText(pick(source, ["description", "summary", "subtitle"]), 5_000),
    sections,
  };
}

export function parseCourseJson(text: string) {
  const root = JSON.parse(text) as unknown;
  const source = record(root);
  const values = Array.isArray(root)
    ? root
    : unknownArray(pick(source, ["courses", "products", "programmes", "programs"])).length
      ? unknownArray(pick(source, ["courses", "products", "programmes", "programs"]))
      : [root];
  return values.map(courseFromUnknown).filter((course) => course.sections.some((section) => section.lessons.length));
}

export function parseCourseOutline(text: string, fallbackTitle = "Imported course") {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  let courseTitle = fallbackTitle;
  let description = "";
  const sections: CourseImportSection[] = [];
  let currentSection: CourseImportSection | null = null;
  let currentLesson: CourseImportLesson | null = null;
  const ensureSection = () => {
    if (!currentSection) {
      currentSection = { clientId: clientId("section", sections.length, "course-content"), title: "Course content", lessons: [] };
      sections.push(currentSection);
    }
    return currentSection;
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (currentLesson?.content) currentLesson.content += "\n\n";
      continue;
    }
    const courseMatch = line.match(/^#\s+(.+)/);
    const sectionMatch = line.match(/^(?:##\s+|module\s*\d*\s*[:.-]\s*|chapter\s*\d*\s*[:.-]\s*)(.+)/i);
    const lessonMatch = line.match(/^(?:###\s+|lesson\s*\d*\s*[:.-]\s*|unit\s*\d*\s*[:.-]\s*)(.+)/i);
    const bulletMatch = line.match(/^[-*+]\s+(.+)/);
    if (courseMatch && !sections.length) {
      courseTitle = cleanTitle(courseMatch[1], fallbackTitle);
      continue;
    }
    if (sectionMatch && !line.startsWith("###")) {
      const title = cleanTitle(sectionMatch[1], `Module ${sections.length + 1}`);
      currentSection = { clientId: clientId("section", sections.length, title), title, lessons: [] };
      sections.push(currentSection);
      currentLesson = null;
      continue;
    }
    if (lessonMatch || bulletMatch) {
      const section = ensureSection();
      const title = cleanTitle((lessonMatch || bulletMatch)![1], `Lesson ${section.lessons.length + 1}`);
      currentLesson = emptyLesson(title, sections.length - 1, section.lessons.length);
      section.lessons.push(currentLesson);
      continue;
    }
    if (currentLesson) currentLesson.content = `${currentLesson.content}${currentLesson.content ? "\n" : ""}${line}`;
    else description = `${description}${description ? "\n" : ""}${line}`.slice(0, 5_000);
  }
  if (!sections.some((section) => section.lessons.length)) {
    const section = ensureSection();
    section.lessons.push({ ...emptyLesson("Imported material", 0, 0), content: text.trim() });
  }
  return [{
    clientId: clientId("course", 0, courseTitle),
    title: courseTitle,
    description,
    sections: sections.filter((section) => section.lessons.length),
  }];
}

export function parseCourseSource(text: string, filename: string, fallbackTitle = "Imported course") {
  const extension = filename.split(".").at(-1)?.toLowerCase();
  const trimmed = text.trim();
  if (extension === "json" || trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return parseCourseJson(text);
  }
  if (extension === "csv" || extension === "tsv") return parseCourseCsv(text, fallbackTitle);
  return parseCourseOutline(text, fallbackTitle);
}

export function analyseLearnerCsv(text: string) {
  const learners: CourseImportLearner[] = [];
  const seen = new Set<string>();
  const rows = parseDelimitedText(text);
  const report: LearnerDataReport = {
    rows: rows.length,
    accepted: 0,
    duplicates: 0,
    invalidEmails: 0,
    missingNames: 0,
    missingCourse: 0,
    warnings: [],
  };
  for (const row of rows) {
    const email = valueFrom(row, EMAIL_ALIASES).trim().toLowerCase();
    const courseTitle = valueFrom(row, COURSE_ALIASES);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      report.invalidEmails += 1;
      continue;
    }
    const identity = `${email}::${courseTitle.trim().toLowerCase()}`;
    if (seen.has(identity)) {
      report.duplicates += 1;
      continue;
    }
    seen.add(identity);
    const displayName = valueFrom(row, NAME_ALIASES);
    if (!displayName) report.missingNames += 1;
    if (!courseTitle) report.missingCourse += 1;
    learners.push({
      email,
      displayName,
      courseTitle,
    });
  }
  report.accepted = learners.length;
  if (report.invalidEmails) report.warnings.push(`${report.invalidEmails} learner row${report.invalidEmails === 1 ? " has" : "s have"} an invalid or missing email and will not be imported.`);
  if (report.duplicates) report.warnings.push(`${report.duplicates} exact learner-course duplicate${report.duplicates === 1 ? " was" : "s were"} removed.`);
  if (report.missingNames) report.warnings.push(`${report.missingNames} learner record${report.missingNames === 1 ? " has" : "s have"} no display name; the email address will be used until corrected.`);
  if (report.missingCourse) report.warnings.push(`${report.missingCourse} learner record${report.missingCourse === 1 ? " needs" : "s need"} a course assignment review.`);
  return { learners, report };
}

export function parseLearnerCsv(text: string) {
  return analyseLearnerCsv(text).learners;
}

export function applyMediaManifest(courses: CourseImportCourse[], text: string) {
  const rows = parseDelimitedText(text);
  const warnings: string[] = [];
  let matched = 0;
  for (const row of rows) {
    const courseTitle = valueFrom(row, COURSE_ALIASES).toLowerCase();
    const sectionTitle = valueFrom(row, SECTION_ALIASES).toLowerCase();
    const title = valueFrom(row, LESSON_ALIASES).toLowerCase();
    const url = safeMediaUrl(valueFrom(row, MEDIA_URL_ALIASES));
    if (!title || !url) continue;
    const course = courses.find((candidate) => !courseTitle || candidate.title.toLowerCase() === courseTitle);
    const sections = course?.sections.filter((candidate) => !sectionTitle || candidate.title.toLowerCase() === sectionTitle) || [];
    const lesson = sections.flatMap((section) => section.lessons).find((candidate) => candidate.title.toLowerCase() === title);
    if (!lesson) {
      warnings.push(`No lesson matched media row “${valueFrom(row, LESSON_ALIASES)}”.`);
      continue;
    }
    lesson.mediaUrl = url;
    lesson.mediaFilename = valueFrom(row, MEDIA_FILE_ALIASES);
    lesson.lessonType = lessonType(valueFrom(row, TYPE_ALIASES), url);
    matched += 1;
  }
  return { matched, warnings };
}

export function courseFromDocumentSequence(courseTitle: string, documents: SequentialDocumentInput[]) {
  const title = cleanTitle(courseTitle, "Imported document course");
  return {
    clientId: clientId("course", 0, title),
    title,
    description: "Imported from a sequence of source documents. Each document is preserved as the next module in the course.",
    sections: documents.map((document, index) => {
      const internalModuleHeading = document.text?.match(/^#{1,6}\s+(Module\s+\d+\s*\.\s*\d+\s*[-:]?\s*.+)$/im)?.[1];
      const name = cleanTitle(
        internalModuleHeading || document.filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
        `Document ${index + 1}`,
      );
      const moduleTitle = /^module\s+\d+(?:\.\d+)?\b/i.test(name)
        ? name.replace(/^module\s+(\d+(?:\.\d+)?)\s*[-:]?\s*/i, "Module $1: ")
        : `Module ${index + 1}: ${name}`;
      const lessonTitle = name.replace(/^module\s+\d+\s*\.\s*\d+\s*[-:]?\s*/i, "").trim() || name;
      const lesson = emptyLesson(lessonTitle, index, 0);
      lesson.lessonType = "resource";
      lesson.content = document.text?.trim()
        ? document.text.trim().slice(0, 100_000)
        : `Open the attached source document for this module. Add teaching notes, context and activities here before publishing.`;
      lesson.document = {
        clientId: document.clientId,
        filename: document.filename,
        contentType: document.contentType || "application/octet-stream",
        sizeBytes: document.sizeBytes,
      };
      return { clientId: clientId("section", index, moduleTitle), title: moduleTitle, lessons: [lesson] };
    }),
  } satisfies CourseImportCourse;
}

export function emptyImportPlan(): CourseImportPlan {
  return { version: 1, academyName: "", courses: [], learners: [], sourceFiles: [] };
}

export function summarizeImportPlan(plan: CourseImportPlan): CourseImportSummary {
  const lessons = plan.courses.flatMap((course) => course.sections.flatMap((section) => section.lessons));
  return {
    courses: plan.courses.length,
    sections: plan.courses.reduce((sum, course) => sum + course.sections.length, 0),
    lessons: lessons.length,
    quizzes: lessons.filter((lesson) => lesson.questions.length).length,
    questions: lessons.reduce((sum, lesson) => sum + lesson.questions.length, 0),
    mediaLinks: lessons.filter((lesson) => lesson.mediaUrl).length,
    documents: lessons.filter((lesson) => lesson.document).length,
    learners: plan.learners.length,
  };
}

function wordCount(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function meaningfulLessonContent(value: string) {
  const content = value.trim();
  return content.length >= 90 && !content.startsWith("Open the attached source document for this module.");
}

function lessonDuration(value: string, fallback = 0) {
  const words = wordCount(value);
  if (!words) return fallback;
  return Math.max(1, Math.min(6, Math.ceil(words / 135)));
}

function contentChunks(content: string, targetWords = 700) {
  const paragraphs = content.replace(/\r/g, "").split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  if (wordCount(content) <= 810) return [content.trim()];
  const units = paragraphs.length >= 2
    ? paragraphs
    : content.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
  if (units.length < 2) return [content.trim()];
  const chunks: string[] = [];
  let current: string[] = [];
  let words = 0;
  for (const paragraph of units) {
    const paragraphWords = wordCount(paragraph);
    if (current.length && words + paragraphWords > targetWords) {
      chunks.push(current.join("\n\n"));
      current = [];
      words = 0;
    }
    current.push(paragraph);
    words += paragraphWords;
  }
  if (current.length) chunks.push(current.join("\n\n"));
  return chunks.length ? chunks : [content.trim()];
}

function chunkTitle(base: string, chunk: string, index: number, total: number) {
  if (total === 1) return base;
  const heading = chunk.match(/^#{1,6}\s+(.+)$/m)?.[1]?.trim();
  return cleanTitle(heading, `${base} — Part ${index + 1}`);
}

function informativeSentences(content: string) {
  return content
    .replace(/^#{1,6}\s+.+$/gm, " ")
    .replace(/\[[^\]]+\]\([^\)]+\)/g, (match) => match.replace(/\]\([^\)]+\)/, ""))
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length >= 55 && sentence.length <= 260 && !/^https?:/i.test(sentence));
}

function rotateOptions(options: string[], offset: number) {
  const shift = offset % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

function groundedQuestion(
  lesson: CourseImportLesson,
  correctStatement: string,
  alternativeStatements: string[],
  questionIndex: number,
): CourseImportQuestion {
  const fallbacks = [
    "The lesson says the topic has no practical implications and needs no further attention.",
    "The lesson is only an administrative notice and contains no learning content.",
    "The lesson recommends ignoring evidence that could challenge its main idea.",
  ];
  const distractors = [...alternativeStatements, ...fallbacks]
    .filter((statement) => statement !== correctStatement)
    .filter((statement, index, values) => values.indexOf(statement) === index)
    .slice(0, 3);
  const baseOptions = [correctStatement, ...distractors];
  const options = rotateOptions(baseOptions, questionIndex);
  return {
    prompt: `Which statement is directly supported by “${lesson.title}”?`,
    options,
    correctIndex: options.indexOf(correctStatement),
    explanation: `The source lesson states: “${correctStatement}”`,
    conceptLabel: lesson.title.slice(0, 100),
  };
}

/**
 * Deterministic, review-first automation. It restructures only supplied material,
 * creates literal source-grounded checks, and never publishes or contacts learners.
 */
export function runCourseLaunchAutopilot(input: CourseImportPlan) {
  const plan = structuredClone(input) as CourseImportPlan;
  let lessonsSplit = 0;
  let moduleChecksCreated = 0;
  let questionsCreated = 0;

  for (const course of plan.courses) {
    for (const [sectionIndex, section] of course.sections.entries()) {
      section.title = cleanTitle(section.title, `Module ${sectionIndex + 1}`);
      const expanded: CourseImportLesson[] = [];
      for (const lesson of section.lessons) {
        if (lesson.questions.length || !meaningfulLessonContent(lesson.content)) {
          expanded.push({ ...lesson, durationMinutes: lesson.durationMinutes || lessonDuration(lesson.content) });
          continue;
        }
        const chunks = contentChunks(lesson.content);
        if (chunks.length > 1) lessonsSplit += chunks.length - 1;
        chunks.forEach((chunk, chunkIndex) => expanded.push({
          ...lesson,
          clientId: chunkIndex ? clientId("lesson", lesson.clientId, chunkIndex + 1) : lesson.clientId,
          title: chunkTitle(lesson.title, chunk, chunkIndex, chunks.length),
          lessonType: chunkIndex ? "text" : lesson.lessonType,
          content: chunk,
          durationMinutes: lessonDuration(chunk, lesson.durationMinutes),
          document: chunkIndex ? null : lesson.document,
        }));
      }
      section.lessons = expanded;

      if (!section.lessons.some((lesson) => lesson.questions.length)) {
        const teachable = section.lessons.filter((lesson) => meaningfulLessonContent(lesson.content));
        const sentencePool = teachable.flatMap((lesson) => informativeSentences(lesson.content).slice(0, 2));
        const questions = teachable.slice(0, 3).flatMap((lesson, index) => {
          const statement = informativeSentences(lesson.content)[0];
          return statement ? [groundedQuestion(lesson, statement, sentencePool.filter((item) => item !== statement), index)] : [];
        });
        if (questions.length) {
          section.lessons.push({
            ...emptyLesson(`${section.title} knowledge check`, sectionIndex, section.lessons.length),
            lessonType: "quiz",
            durationMinutes: Math.min(6, Math.max(2, questions.length)),
            questions,
          });
          moduleChecksCreated += 1;
          questionsCreated += questions.length;
        }
      }
    }
  }

  const courseTitles = new Set(plan.courses.map((course) => course.title.trim().toLowerCase()));
  const singleCourse = plan.courses.length === 1 ? plan.courses[0].title : "";
  plan.learners = plan.learners.map((learner) => ({
    ...learner,
    email: learner.email.trim().toLowerCase(),
    courseTitle: learner.courseTitle || singleCourse,
  }));
  const matchedToCourse = plan.learners.filter((learner) => courseTitles.has(learner.courseTitle.trim().toLowerCase())).length;
  const modules = plan.courses.reduce((sum, course) => sum + course.sections.length, 0);
  const lessons = plan.courses.flatMap((course) => course.sections.flatMap((section) => section.lessons));
  const modulesCovered = plan.courses.reduce((sum, course) => sum + course.sections.filter((section) => section.lessons.some((lesson) => lesson.questions.length)).length, 0);
  const contentLessons = lessons.filter((lesson) => !lesson.questions.length && meaningfulLessonContent(lesson.content));
  const shortLessons = contentLessons.filter((lesson) => (lesson.durationMinutes || lessonDuration(lesson.content)) <= 6).length;
  const emptyLessons = lessons.filter((lesson) => !lesson.questions.length && !meaningfulLessonContent(lesson.content) && !lesson.document && !lesson.mediaUrl).length;
  const learnerReview = plan.learners.length - matchedToCourse;

  const structureScore = plan.courses.length && modules && lessons.length ? 30 : 0;
  const contentScore = contentLessons.length ? Math.max(0, Math.round(30 * (1 - emptyLessons / Math.max(1, lessons.length)))) : 0;
  const quizScore = modules ? Math.round(25 * modulesCovered / modules) : 0;
  const learnerScore = !plan.learners.length ? 15 : Math.round(15 * matchedToCourse / plan.learners.length);
  const completed = [
    `${modules} module${modules === 1 ? "" : "s"} ordered into a reviewable curriculum.`,
    `${shortLessons} content lesson${shortLessons === 1 ? "" : "s"} shaped to approximately six minutes or less.`,
    `${moduleChecksCreated} source-grounded module check${moduleChecksCreated === 1 ? "" : "s"} drafted (${questionsCreated} question${questionsCreated === 1 ? "" : "s"}).`,
  ];
  if (plan.learners.length) completed.push(`${matchedToCourse} of ${plan.learners.length} learner record${plan.learners.length === 1 ? "" : "s"} matched to a course.`);
  const review: string[] = [];
  if (emptyLessons) review.push(`${emptyLessons} lesson${emptyLessons === 1 ? " needs" : "s need"} teaching content, media, or an attached resource.`);
  if (modulesCovered < modules) review.push(`${modules - modulesCovered} module${modules - modulesCovered === 1 ? " needs" : "s need"} a human-written or source-grounded assessment.`);
  if (learnerReview) review.push(`${learnerReview} learner course assignment${learnerReview === 1 ? " does" : "s do"} not match an imported course title.`);
  review.push("A subject expert must approve accuracy, rights, assessment quality, and learner experience before publishing.");

  return {
    plan,
    report: {
      score: Math.min(100, structureScore + contentScore + quizScore + learnerScore),
      curriculum: { modules, lessons: lessons.length, lessonsSplit, shortLessons },
      quizzes: { moduleChecksCreated, questionsCreated, modulesCovered, modulesTotal: modules },
      learners: { records: plan.learners.length, matchedToCourse, needCourseReview: learnerReview },
      completed,
      review,
    } satisfies CourseLaunchAutopilotReport,
  };
}

export function sanitizeImportPlan(value: unknown) {
  const source = record(value);
  const warnings: string[] = [];
  const courses = unknownArray(source.courses).slice(0, 20).map(courseFromUnknown)
    .map((course) => ({
      ...course,
      sections: course.sections.slice(0, 80).map((section) => ({
        ...section,
        lessons: section.lessons.slice(0, 200),
      })),
    })).filter((course) => course.sections.some((section) => section.lessons.length));

  // Canonical plans carry document metadata that the generic JSON normaliser intentionally ignores.
  const rawCourses = unknownArray(source.courses);
  for (const [courseIndex, course] of courses.entries()) {
    const rawSections = unknownArray(record(rawCourses[courseIndex]).sections);
    for (const [sectionIndex, section] of course.sections.entries()) {
      const rawLessons = unknownArray(record(rawSections[sectionIndex]).lessons);
      for (const [lessonIndex, lesson] of section.lessons.entries()) {
        const document = record(record(rawLessons[lessonIndex]).document);
        const filename = cleanText(document.filename, 180);
        const documentId = cleanText(document.clientId, 120);
        if (filename && documentId) {
          lesson.document = {
            clientId: documentId,
            filename,
            contentType: cleanText(document.contentType, 140) || "application/octet-stream",
            sizeBytes: Math.max(0, Math.min(100 * 1024 * 1024, numberValue(document.sizeBytes))),
          };
          lesson.lessonType = "resource";
        }
      }
    }
  }

  const totalLessons = courses.reduce((sum, course) => sum + course.sections.reduce((sectionSum, section) => sectionSum + section.lessons.length, 0), 0);
  const totalQuestions = courses.reduce((sum, course) => sum + course.sections.reduce((sectionSum, section) => sectionSum + section.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.questions.length, 0), 0), 0);
  if (totalLessons > 500) throw new Error("An import can contain at most 500 lessons.");
  if (totalQuestions > 2_000) throw new Error("An import can contain at most 2,000 quiz questions.");

  const learners: CourseImportLearner[] = [];
  const learnerAssignments = new Set<string>();
  for (const item of unknownArray(source.learners).slice(0, 500)) {
    const learner = record(item);
    const email = cleanText(learner.email, 254).toLowerCase();
    const courseTitle = cleanText(learner.courseTitle, 160);
    const assignment = `${email}::${courseTitle.toLowerCase()}`;
    if (!email || learnerAssignments.has(assignment)) continue;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      warnings.push(`Skipped invalid learner email: ${email}`);
      continue;
    }
    learnerAssignments.add(assignment);
    learners.push({
      email,
      displayName: cleanText(learner.displayName, 120),
      courseTitle,
    });
  }
  const plan: CourseImportPlan = {
    version: 1,
    academyName: cleanText(source.academyName, 120),
    courses,
    learners,
    sourceFiles: unknownArray(source.sourceFiles).map((file) => cleanText(file, 180)).filter(Boolean).slice(0, 120),
  };
  if (!courses.length && !learners.length) throw new Error("Add course material, a document sequence, or a learner list first.");
  return { plan, warnings, summary: summarizeImportPlan(plan) };
}
