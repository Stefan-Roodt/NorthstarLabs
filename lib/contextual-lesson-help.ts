import { getLessonGuide } from "./lesson-guide.ts";

export type LessonHelpMode = "explain" | "define" | "example" | "search" | "check";

export type HelpLesson = {
  id: string;
  title: string;
  content: string;
  transcript: string;
};

export type HelpSource = {
  lessonId: string;
  lessonTitle: string;
  excerpt: string;
};

export type LessonHelpResult = {
  mode: LessonHelpMode;
  heading: string;
  answer: string;
  sources: HelpSource[];
  checkpoint: { prompt: string; options?: string[] } | null;
  enoughEvidence: boolean;
  escalationSuggestion: string;
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "i",
  "in", "is", "it", "of", "on", "or", "that", "the", "this", "to", "what", "when",
  "where", "which", "who", "why", "with", "you", "your",
]);

export function lessonHelpPlainText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return Array.from(new Set(
    lessonHelpPlainText(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]{1,}/g)
      ?.filter((token) => !STOP_WORDS.has(token)) || [],
  ));
}

function passages(lesson: HelpLesson) {
  return `${lesson.content}\n\n${lesson.transcript}`
    .split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(lessonHelpPlainText)
    .filter((passage) => passage.length >= 35)
    .map((passage) => passage.slice(0, 360));
}

function rankedSources(lessons: HelpLesson[], query: string, currentLessonId: string) {
  const queryTokens = tokens(query);
  return lessons.flatMap((lesson) => passages(lesson).map((excerpt, order) => {
    const text = excerpt.toLowerCase();
    const matches = queryTokens.reduce((sum, token) => sum + (text.includes(token) ? 1 : 0), 0);
    const exact = query.trim().length > 2 && text.includes(query.trim().toLowerCase()) ? 4 : 0;
    const current = lesson.id === currentLessonId ? 2 : 0;
    return { lessonId: lesson.id, lessonTitle: lesson.title, excerpt, score: matches * 3 + exact + current - order / 1000 };
  }))
    .filter((source) => queryTokens.length === 0 || source.score > (source.lessonId === currentLessonId ? 2 : 0))
    .sort((a, b) => b.score - a.score)
    .filter((source, index, all) => all.findIndex((item) => item.excerpt === source.excerpt) === index)
    .slice(0, 3)
    .map((source) => ({
      lessonId: source.lessonId,
      lessonTitle: source.lessonTitle,
      excerpt: source.excerpt,
    }));
}

function noEvidence(mode: LessonHelpMode, subject: string): LessonHelpResult {
  return {
    mode,
    heading: "The course does not answer that yet",
    answer: `I could not find enough evidence in this lesson or the lessons already available to explain ${subject || "that question"} accurately. I will not invent an answer.`,
    sources: [],
    checkpoint: null,
    enoughEvidence: false,
    escalationSuggestion: "Ask the educator to clarify it or add an approved source to the course.",
  };
}

export function buildContextualLessonHelp(input: {
  mode: LessonHelpMode;
  query?: string;
  currentLessonId: string;
  lessons: HelpLesson[];
  quizQuestions?: Array<{ prompt: string; options: string[] }>;
}): LessonHelpResult {
  const current = input.lessons.find((lesson) => lesson.id === input.currentLessonId);
  if (!current) return noEvidence(input.mode, "this lesson");
  const query = String(input.query || "").trim();
  const guide = getLessonGuide(current.content);

  if (input.mode === "check") {
    const existing = input.quizQuestions?.find((question) => question.prompt.trim());
    const outcome = guide.outcome || guide.outline[0] || current.title;
    return {
      mode: input.mode,
      heading: "Check your understanding",
      answer: existing
        ? "Answer without reopening the lesson. When you are ready, use the formal knowledge check for marked feedback."
        : "Explain your answer in your own words, then compare it with the cited lesson passage.",
      sources: rankedSources([current], outcome, current.id).slice(0, 1),
      checkpoint: existing
        ? { prompt: existing.prompt, options: existing.options }
        : { prompt: `Without looking back, explain: ${outcome}` },
      enoughEvidence: true,
      escalationSuggestion: "If you cannot explain it yet, ask the educator where your reasoning breaks down.",
    };
  }

  if (input.mode === "explain") {
    const subject = query || guide.outcome || guide.outline[0] || current.title;
    const sources = rankedSources(input.lessons, subject, current.id);
    if (!sources.length) return noEvidence(input.mode, subject);
    const outline = guide.outline.length ? ` The lesson develops this through ${guide.outline.slice(0, 3).join(", ")}.` : "";
    return {
      mode: input.mode,
      heading: query ? `A simpler explanation of “${query}”` : "This lesson in plain language",
      answer: query
        ? `In this course, the clearest plain-language passage is: ${sources[0].excerpt}`
        : `In simple terms: ${guide.outcome || sources[0].excerpt}${outline}`,
      sources,
      checkpoint: null,
      enoughEvidence: true,
      escalationSuggestion: "Ask the educator if you want this connected to your own situation.",
    };
  }

  if (!query) return noEvidence(input.mode, input.mode === "define" ? "a term" : "a topic");
  let sources = rankedSources(input.lessons, query, current.id);
  if (input.mode === "example") {
    sources = sources.filter((source) => /\b(example|for instance|such as|scenario|imagine|case)\b/i.test(source.excerpt));
    if (!sources.length) return noEvidence(input.mode, `a verified course example for “${query}”`);
    return {
      mode: input.mode,
      heading: `A course example for “${query}”`,
      answer: sources[0].excerpt,
      sources,
      checkpoint: null,
      enoughEvidence: true,
      escalationSuggestion: "Ask the educator for another example if this one does not fit your context.",
    };
  }
  if (!sources.length) return noEvidence(input.mode, `“${query}”`);
  if (input.mode === "define") {
    return {
      mode: input.mode,
      heading: `How this course uses “${query}”`,
      answer: `The course describes it in this context: ${sources[0].excerpt}`,
      sources,
      checkpoint: null,
      enoughEvidence: true,
      escalationSuggestion: "Ask the educator if you need a formal or industry-wide definition.",
    };
  }
  return {
    mode: input.mode,
    heading: `Where the course discusses “${query}”`,
    answer: `I found ${sources.length} relevant ${sources.length === 1 ? "passage" : "passages"} in the material available to you.`,
    sources,
    checkpoint: null,
    enoughEvidence: true,
    escalationSuggestion: "Ask the educator if these passages do not resolve your question.",
  };
}
