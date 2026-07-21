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
  explanation?: string;
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

function sourcePassages(source: StudioSource) {
  const blocks = source.sourceText
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => cleanText(block, 1_600))
    .filter((block) => block.length >= 40);
  if (blocks.length) return blocks.slice(0, 4);
  const fallback = cleanText(source.sourceText, 4_800);
  return fallback ? [fallback] : [];
}

function shortTitle(value: string) {
  const title = cleanText(value, 90);
  return title.length > 62 ? `${title.slice(0, 59).trim()}…` : title;
}

function sourceLesson(source: StudioSource, input: GenerateBlueprintInput): StudioLesson {
  const passages = sourcePassages(source);
  const evidence = passages
    .map((passage) => `> ${passage.replace(/\n+/g, "\n> ")}`)
    .join("\n\n");
  return {
    title: `Read the evidence: ${shortTitle(source.title)}`,
    lessonType: "text",
    durationMinutes: input.lessonMinutes,
    outcome: `Identify the central ideas in ${source.title} and relate them to the course outcome.`,
    content: `## Your outcome

Identify the central ideas in ${source.title} and relate them to the promised course outcome.

## Source-led briefing

The extracts below come directly from the creator-approved source ${source.citationLabel}. Read them before drawing a conclusion.

${evidence}

## Evidence check

- What does the source state directly?
- What conclusion can reasonably be drawn from it?
- What remains unanswered or would need another approved source?

## Apply it

Write a short explanation for ${input.audience}. Support every factual statement with ${source.citationLabel} and clearly label any open question.

## Sources

- ${source.citationLabel} ${source.title}${source.sourceUrl ? ` — ${source.sourceUrl}` : ""}`,
    transcript: "",
    citations: [source.citationLabel],
    questions: [],
  };
}

function practiceLesson(source: StudioSource, input: GenerateBlueprintInput): StudioLesson {
  return {
    title: `Apply the source: ${shortTitle(source.title)}`,
    lessonType: "text",
    durationMinutes: input.lessonMinutes,
    outcome: `Use ${source.citationLabel} to produce a defensible explanation or decision.`,
    content: `## Your outcome

Use ${source.citationLabel} to produce a defensible explanation or decision connected to this course outcome:

> ${input.outcome}

## Practical task

1. Select three statements from ${source.citationLabel} that matter to the outcome.
2. For each statement, record the exact evidence and its context.
3. Separate what the source proves from what you infer.
4. Turn the evidence into one useful explanation, recommendation, or worked example for ${input.audience}.
5. Add one limitation or unanswered question that a reviewer should see.

## Quality check

- Every factual claim points back to ${source.citationLabel}.
- The conclusion does not go beyond the approved evidence.
- The language is clear enough for the stated audience.
- A human reviewer could trace how the conclusion was reached.

## Sources

- ${source.citationLabel} ${source.title}${source.sourceUrl ? ` — ${source.sourceUrl}` : ""}`,
    transcript: "",
    citations: [source.citationLabel],
    questions: [],
  };
}

function sourceCheck(source: StudioSource, input: GenerateBlueprintInput): StudioLesson {
  const excerpt = sourcePassages(source)[0]?.replace(/\s+/g, " ").slice(0, 360) ||
    "No usable source extract was supplied.";
  return {
    title: `Check your use of ${shortTitle(source.title)}`,
    lessonType: "quiz",
    durationMinutes: Math.max(3, Math.min(input.lessonMinutes, 8)),
    outcome: `Confirm that you can use ${source.citationLabel} without inventing or overstating evidence.`,
    content: `## Your outcome

Confirm that you can use ${source.citationLabel} without inventing or overstating evidence.

## Evidence reminder

> ${excerpt}

Answer the questions, then use the feedback to correct any weak reasoning.`,
    transcript: "",
    citations: [source.citationLabel],
    questions: [
      {
        prompt: `Which approved source supports the learning in this section?`,
        options: [source.title, "An unattributed internet summary", "A claim recalled from memory", "No source is required"],
        correctIndex: 0,
        explanation: `${source.citationLabel} ${source.title} is the recorded, rights-checked source for this section.`,
      },
      {
        prompt: "What should you do when the approved source does not support a claim?",
        options: [
          "Exclude the claim or label it as an unanswered question",
          "Add a plausible detail so the lesson feels complete",
          "Repeat the claim without a citation",
          "Present the claim as established fact",
        ],
        correctIndex: 0,
        explanation: "Grounded course material must stay within the supplied evidence and make uncertainty visible.",
      },
      {
        prompt: "Which action best demonstrates careful use of evidence?",
        options: [
          `Trace the conclusion back to ${source.citationLabel} and state its limits`,
          "Copy the source without explaining its relevance",
          "Remove the citation after drafting",
          "Publish before a human review",
        ],
        correctIndex: 0,
        explanation: "Traceable evidence, context, limitations, and human review make an automated draft defensible.",
      },
    ],
  };
}

export function generateNativeCourseBlueprint(input: GenerateBlueprintInput): StudioBlueprint {
  const selectedSources = input.sources.slice(0, 6);
  if (!selectedSources.length) throw new Error("Add at least one approved source before building the course.");
  const sourceList = selectedSources
    .map((source) => `- ${source.citationLabel} ${source.title}${source.sourceUrl ? ` — ${source.sourceUrl}` : ""}`)
    .join("\n");
  const sections: StudioSection[] = [
    {
      title: "1. Outcome, audience, and evidence",
      lessons: [
        {
          title: "Know what this course must achieve",
          lessonType: "text",
          durationMinutes: input.lessonMinutes,
          outcome: `Explain the promised result and how the course will prove it.`,
          content: `## Your outcome

Explain the promised result and how the course will prove it.

## Course promise

> ${input.outcome}

## Who this is for

${input.audience}

## Approved evidence

${sourceList}

## Your learning contract

Work from the approved evidence, make your reasoning visible, complete the practical activities, and use assessment feedback to improve the final result.`,
          transcript: "",
          citations: selectedSources.map((source) => source.citationLabel),
          questions: [],
        },
        {
          title: "Use sources without overstating them",
          lessonType: "text",
          durationMinutes: input.lessonMinutes,
          outcome: "Separate direct evidence, reasonable inference, and unanswered questions.",
          content: `## Your outcome

Separate direct evidence, reasonable inference, and unanswered questions.

## Three evidence labels

- **Supported:** the approved source states or demonstrates it directly.
- **Inferred:** the conclusion is reasonable, but the source does not state it directly.
- **Unanswered:** another source, test, or expert review is needed.

## Practice

Choose one statement from each approved source. Label it supported, inferred, or unanswered, and record why. This habit prevents a polished draft from creating false confidence.`,
          transcript: "",
          citations: selectedSources.map((source) => source.citationLabel),
          questions: [],
        },
        {
          title: "Check the evidence rules",
          lessonType: "quiz",
          durationMinutes: Math.max(3, Math.min(input.lessonMinutes, 8)),
          outcome: "Confirm that you can distinguish evidence, inference, and an unanswered question.",
          content: `## Your outcome

Confirm that you can distinguish evidence, inference, and an unanswered question.

Use the answer feedback to correct your evidence labels before starting the source-led sections.`,
          transcript: "",
          citations: selectedSources.map((source) => source.citationLabel),
          questions: [
            {
              prompt: "When should a statement be labelled supported?",
              options: [
                "When an approved source states or demonstrates it directly",
                "When it sounds plausible",
                "When the creator remembers reading it elsewhere",
                "When it makes the course more persuasive",
              ],
              correctIndex: 0,
              explanation: "Supported claims have a traceable basis in the approved source material.",
            },
            {
              prompt: "What is an inference?",
              options: [
                "A reasoned conclusion that the source does not state directly",
                "A direct quotation",
                "A fact that needs no source",
                "A claim that has already passed human review",
              ],
              correctIndex: 0,
              explanation: "An inference can be useful, but it must be distinguished from what the source directly establishes.",
            },
            {
              prompt: "What should happen to an important unanswered question?",
              options: [
                "Make it visible and identify the additional evidence or review needed",
                "Replace it with a confident assumption",
                "Remove it from the reviewer notes",
                "Present it as settled",
              ],
              correctIndex: 0,
              explanation: "Visible uncertainty helps learners and reviewers understand the limits of the current evidence.",
            },
          ],
        },
      ],
    },
    ...selectedSources.map((source, index) => ({
      title: `${index + 2}. ${shortTitle(source.title)}`,
      lessons: [
        sourceLesson(source, input),
        practiceLesson(source, input),
        sourceCheck(source, input),
      ],
    })),
    {
      title: `${selectedSources.length + 2}. Synthesis and proof`,
      lessons: [
        {
          title: "Connect the evidence",
          lessonType: "text",
          durationMinutes: input.lessonMinutes,
          outcome: "Combine the approved sources into one coherent, traceable conclusion.",
          content: `## Your outcome

Combine the approved sources into one coherent, traceable conclusion.

## Synthesis task

1. Restate the promised outcome in your own words.
2. Select the strongest evidence from every source.
3. Identify where sources agree, differ, or answer different parts of the problem.
4. Build a conclusion that a reviewer can trace back to the source labels.
5. State at least one limitation and one next question.

## Approved sources

${sourceList}`,
          transcript: "",
          citations: selectedSources.map((source) => source.citationLabel),
          questions: [],
        },
        {
          title: "Produce the final evidence",
          lessonType: "text",
          durationMinutes: input.lessonMinutes,
          outcome: input.outcome,
          content: `## Your outcome

${input.outcome}

## Final deliverable

Create one useful piece of evidence for ${input.audience}: a briefing, worked example, recommendation, demonstration, or decision record.

Your submission must include:

- the decision or result;
- the evidence used, labelled with the approved source references;
- the reasoning that connects evidence to the result;
- limitations and unanswered questions;
- a short note explaining what changed after review.

## Human review gate

Ask a reviewer to check factual accuracy, citation fit, audience clarity, and whether the deliverable genuinely demonstrates the promised outcome.`,
          transcript: "",
          citations: selectedSources.map((source) => source.citationLabel),
          questions: [],
        },
        {
          title: "Final readiness check",
          lessonType: "quiz",
          durationMinutes: Math.max(3, Math.min(input.lessonMinutes, 8)),
          outcome: "Confirm that the final work is traceable, honest, and ready for human review.",
          content: `## Your outcome

Confirm that the final work is traceable, honest, and ready for human review.

Use the feedback to correct the final submission before it is shared.`,
          transcript: "",
          citations: selectedSources.map((source) => source.citationLabel),
          questions: [
            {
              prompt: "What makes the final conclusion defensible?",
              options: [
                "A clear chain from approved evidence to reasoning, conclusion, and limitations",
                "Confident language without citations",
                "The number of pages in the submission",
                "Publishing before review",
              ],
              correctIndex: 0,
              explanation: "A reviewer must be able to trace the result back to approved evidence and see where uncertainty remains.",
            },
            {
              prompt: "When is the automated draft ready to publish?",
              options: [
                "After a human has reviewed the claims, citations, assessments, and learner experience",
                "Immediately after generation",
                "When the title sounds persuasive",
                "As soon as one source has been added",
              ],
              correctIndex: 0,
              explanation: "Automation accelerates drafting; it does not replace subject-matter, rights, or learner-experience review.",
            },
            {
              prompt: "What should the final deliverable include?",
              options: [
                "Evidence, reasoning, result, limitations, and a review note",
                "Only the final answer",
                "Unverified claims added for completeness",
                "No record of the sources used",
              ],
              correctIndex: 0,
              explanation: "The final evidence should show both the result and the disciplined process used to reach it.",
            },
          ],
        },
      ],
    },
  ];
  return {
    title: input.title,
    promise: input.outcome,
    audience: input.audience,
    sourceNote: "Built locally by Northstar Native from the creator-approved source text. No source material was sent to an external AI provider.",
    sections,
  };
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
                explanation: cleanText(question.explanation, 1_000),
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
    blueprint: true,
    quizzes: true,
    narration: true,
    videoClips: true,
    aiNarration: gemini,
    aiVideoClips: gemini && Boolean(process.env.GEMINI_VIDEO_MODEL),
    provider: gemini ? "Northstar Native + Google Gemini" : "Northstar Native",
  };
}

export async function generateCourseBlueprint(input: GenerateBlueprintInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      blueprint: generateNativeCourseBlueprint(input),
      model: "northstar-native-1",
      provider: "northstar_native",
    };
  }
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
      "questions":[{"prompt":"...","options":["..."],"correctIndex":0,"explanation":"Why the correct answer is right"}]
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
  return { blueprint, model, provider: "google_gemini" };
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
