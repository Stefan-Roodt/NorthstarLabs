export type StudioSource = {
  title: string;
  sourceType: "notes" | "website" | "document" | "recording";
  sourceUrl?: string;
  sourceText: string;
  rightsBasis: "owned" | "licensed" | "public_domain" | "permission";
  citationLabel: string;
};

export type StudioQuestion = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type StudioLesson = {
  title: string;
  lessonType: "text" | "audio" | "video" | "quiz";
  durationMinutes: number;
  outcome: string;
  content: string;
  transcript: string;
  citations: string[];
  questions: StudioQuestion[];
};

export type StudioSection = { title: string; lessons: StudioLesson[] };
export type StudioBlueprint = {
  title: string;
  promise: string;
  audience: string;
  sourceNote: string;
  sections: StudioSection[];
};

type GenerateBlueprintInput = {
  title: string;
  audience: string;
  outcome: string;
  lessonMinutes: number;
  sources: StudioSource[];
};

function textPart(body: unknown) {
  const response = body as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return response.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
}

function parseModelJson(value: string) {
  const trimmed = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(trimmed) as unknown;
}

function cleanText(value: unknown, max = 12_000) {
  return String(value || "").replace(/\u0000/g, "").trim().slice(0, max);
}

function validateBlueprint(raw: unknown, input: GenerateBlueprintInput): StudioBlueprint {
  const value = raw as Partial<StudioBlueprint>;
  const sections = Array.isArray(value.sections) ? value.sections.slice(0, 12) : [];
  if (!sections.length) throw new Error("The provider returned no course sections.");
  const citationSet = new Set(input.sources.map((source) => source.citationLabel));
  const normalizedSections = sections.map((section, sectionIndex) => {
    const lessons = Array.isArray(section?.lessons) ? section.lessons.slice(0, 12) : [];
    if (!lessons.length) throw new Error(`Section ${sectionIndex + 1} has no lessons.`);
    return {
      title: cleanText(section.title, 160) || `Section ${sectionIndex + 1}`,
      lessons: lessons.map((lesson, lessonIndex) => {
        const type = ["text", "audio", "video", "quiz"].includes(String(lesson.lessonType))
          ? lesson.lessonType as StudioLesson["lessonType"]
          : "text";
        const citations = Array.isArray(lesson.citations)
          ? lesson.citations.map((item) => cleanText(item, 40)).filter((item) => citationSet.has(item))
          : [];
        const questions = Array.isArray(lesson.questions)
          ? lesson.questions.slice(0, 8).map((question) => {
              const options = Array.isArray(question.options)
                ? question.options.slice(0, 6).map((option) => cleanText(option, 300))
                : [];
              const correctIndex = Number(question.correctIndex);
              return {
                prompt: cleanText(question.prompt, 600),
                options,
                correctIndex: Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < options.length
                  ? correctIndex
                  : 0,
              };
            }).filter((question) => question.prompt && question.options.length >= 2)
          : [];
        return {
          title: cleanText(lesson.title, 180) || `Lesson ${lessonIndex + 1}`,
          lessonType: type,
          durationMinutes: Math.max(1, Math.min(30, Number(lesson.durationMinutes) || input.lessonMinutes)),
          outcome: cleanText(lesson.outcome, 600),
          content: cleanText(lesson.content),
          transcript: cleanText(lesson.transcript, 18_000),
          citations,
          questions,
        };
      }),
    };
  });
  return {
    title: cleanText(value.title, 180) || input.title,
    promise: cleanText(value.promise, 800) || input.outcome,
    audience: cleanText(value.audience, 500) || input.audience,
    sourceNote: cleanText(value.sourceNote, 500) || "Drafted only from the creator-approved sources listed in this project.",
    sections: normalizedSections,
  };
}

export function configuredStudioCapabilities() {
  const gemini = Boolean(process.env.GEMINI_API_KEY);
  return {
    blueprint: gemini,
    quizzes: gemini,
    narration: gemini,
    videoClips: gemini && Boolean(process.env.GEMINI_VIDEO_MODEL),
    provider: gemini ? "Google Gemini" : "Not connected",
  };
}

export async function generateCourseBlueprint(input: GenerateBlueprintInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Google Gemini is not connected. Add GEMINI_API_KEY to enable generation.");
  const model = process.env.GEMINI_COURSE_MODEL || "gemini-2.5-flash";
  const sources = input.sources.map((source, index) => [
    `${source.citationLabel || `[S${index + 1}]`} ${source.title}`,
    source.sourceUrl ? `URL: ${source.sourceUrl}` : "",
    `RIGHTS BASIS: ${source.rightsBasis}`,
    source.sourceText.slice(0, 18_000),
  ].filter(Boolean).join("\n")).join("\n\n---\n\n");
  const prompt = `You are NorthstarLabs Creator Studio, an instructional designer that must remain grounded in supplied sources.

Create a rigorous draft course. Do not introduce factual claims that cannot be supported by the supplied sources. Mark every lesson with one or more source labels such as [S1]. Do not claim accreditation. Use clear South African English. Lessons should take approximately ${input.lessonMinutes} minutes. Use video only where a visual explanation is genuinely useful; a video lesson must include a complete narration transcript. Add a short knowledge check at the end of every section. Each question must have 3-5 plausible options and exactly one correct answer.

COURSE TITLE: ${input.title}
AUDIENCE: ${input.audience}
PROMISED OUTCOME: ${input.outcome}

APPROVED SOURCES:
${sources}

Return JSON only with this exact shape:
{
  "title":"...",
  "promise":"...",
  "audience":"...",
  "sourceNote":"...",
  "sections":[{
    "title":"...",
    "lessons":[{
      "title":"...",
      "lessonType":"text|audio|video|quiz",
      "durationMinutes":${input.lessonMinutes},
      "outcome":"...",
      "content":"Complete learner-facing Markdown with a Sources section at the end",
      "transcript":"Complete narration for audio/video, otherwise empty",
      "citations":["[S1]"],
      "questions":[{"prompt":"...","options":["..."],"correctIndex":0}]
    }]
  }]
}`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.25 },
      }),
    },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (body as { error?: { message?: string } }).error?.message;
    throw new Error(message || "Google Gemini could not create the course draft.");
  }
  const blueprint = validateBlueprint(parseModelJson(textPart(body)), input);
  return { blueprint, model };
}

function wavFromPcm(pcm: Uint8Array, sampleRate = 24_000) {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const write = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
  };
  write(0, "RIFF");
  view.setUint32(4, pcm.byteLength + 36, true);
  write(8, "WAVE"); write(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  write(36, "data"); view.setUint32(40, pcm.byteLength, true);
  const result = new Uint8Array(44 + pcm.byteLength);
  result.set(new Uint8Array(header)); result.set(pcm, 44);
  return result;
}

export async function generateNarration(script: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Google Gemini is not connected.");
  const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Narrate clearly, calmly, and professionally in neutral English. Do not add or omit facts.\n\n${script.slice(0, 18_000)}` }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: process.env.GEMINI_TTS_VOICE || "Kore" } } },
        },
      }),
    },
  );
  const body = await response.json().catch(() => ({})) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
  };
  if (!response.ok) throw new Error(body.error?.message || "Narration generation failed.");
  const inline = body.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData;
  if (!inline?.data) throw new Error("The narration provider returned no audio.");
  const binary = atob(inline.data);
  const pcm = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const audio = inline.mimeType?.includes("wav") ? pcm : wavFromPcm(pcm);
  return { audio, model, contentType: "audio/wav" };
}
