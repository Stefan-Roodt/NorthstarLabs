export type ExperienceScene = {
  id: string;
  label: string;
  title: string;
  body: string;
  metric?: string;
  tone?: "blue" | "orange" | "green" | "red";
};

export type ClassificationActivity = {
  kind: "classify";
  title: string;
  prompt: string;
  buckets: Array<{ id: string; label: string; description: string }>;
  cards: Array<{ id: string; text: string; bucketId: string; feedback: string }>;
};

export type BranchActivity = {
  kind: "branch";
  title: string;
  prompt: string;
  options: Array<{
    id: string;
    label: string;
    verdict: string;
    feedback: string;
    tone: "good" | "caution" | "risk";
  }>;
};

export type MeterActivity = {
  kind: "meter";
  title: string;
  prompt: string;
  dimensions: Array<{
    id: string;
    label: string;
    lowLabel: string;
    highLabel: string;
    weight: number;
    initial: number;
  }>;
  thresholds: Array<{
    max: number;
    label: string;
    feedback: string;
    tone: "good" | "caution" | "risk";
  }>;
};

export type LessonExperience = {
  version: 1;
  eyebrow: string;
  title: string;
  intro: string;
  scenes: ExperienceScene[];
  activity: ClassificationActivity | BranchActivity | MeterActivity;
  takeaway: string;
};

type UnknownRecord = Record<string, unknown>;

type DerivedLessonExperienceInput = {
  lessonTitle: string;
  content: string;
  courseTitle?: string;
};

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function text(value: unknown, max = 1_000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function array(value: unknown, max: number) {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

function plainMarkdown(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#]/g, "")
    .replace(/^\s*(?:[-+]|\d+\.)\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function concise(value: string, maxWords = 48) {
  const words = plainMarkdown(value).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;]$/, "")}\u2026`;
}

function derivedSections(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const sections: Array<{ title: string; body: string }> = [];
  let currentTitle = "";
  let currentBody: string[] = [];
  const flush = () => {
    const body = concise(currentBody.join(" "), 58);
    if (currentTitle && body) sections.push({ title: plainMarkdown(currentTitle), body });
    currentBody = [];
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = /^#{1,4}\s+(.+)$/.exec(line);
    if (heading) {
      flush();
      currentTitle = heading[1];
      continue;
    }
    if (!line || /^---+$/.test(line) || /^!\[[^\]]*\]\([^)]+\)$/.test(line)) continue;
    currentBody.push(line);
  }
  flush();
  return sections.filter((section) =>
    !/^(sources?|references?|further reading|transcript|captions?)$/i.test(section.title)
  );
}

function fallbackParagraphs(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => concise(paragraph, 58))
    .filter((paragraph) => paragraph.length >= 70 && !/^sources?\b/i.test(paragraph));
}

/**
 * Gives source-backed text lessons a useful visual teaching layer when an
 * educator has not authored a bespoke interactive experience. It deliberately
 * derives only from the lesson itself: no invented facts, external model call,
 * or hidden source is introduced.
 */
export function deriveLessonExperience({
  lessonTitle,
  content,
  courseTitle = "",
}: DerivedLessonExperienceInput): LessonExperience | null {
  const cleanTitle = plainMarkdown(lessonTitle).slice(0, 160);
  const cleanContent = content.trim();
  if (!cleanTitle || plainMarkdown(cleanContent).length < 180) return null;

  const sections = derivedSections(cleanContent);
  const outcomeSection = sections.find((section) =>
    /^(your outcome|learning outcomes?|learning objectives?|what you(?:'|’)ll learn)$/i.test(section.title)
  );
  const teachingSections = sections.filter((section) =>
    !/^(your outcome|learning outcomes?|learning objectives?|what you(?:'|’)ll learn|quiz|knowledge check)$/i.test(section.title)
  );
  const paragraphFallbacks = fallbackParagraphs(cleanContent);
  const sceneSources = teachingSections.length
    ? teachingSections
    : paragraphFallbacks.map((body, index) => ({
        title: index === 0 ? "Start with the central idea" : `Build the idea: step ${index + 1}`,
        body,
      }));
  const tones: ExperienceScene["tone"][] = ["blue", "orange", "green", "red"];
  const scenes = sceneSources.slice(0, 4).map((section, index) => ({
    id: `guided-scene-${index + 1}`,
    label: `Part ${index + 1} of ${Math.min(4, sceneSources.length)}`,
    title: concise(section.title, 12).slice(0, 160),
    body: concise(section.body, 58).slice(0, 1_200),
    metric: index === 0
      ? "Core idea"
      : index === sceneSources.length - 1 || index === 3
        ? "Transfer"
        : "Evidence",
    tone: tones[index],
  })).filter((scene) => scene.title && scene.body);
  if (!scenes.length) return null;

  const outcome = concise(outcomeSection?.body || scenes[0].body, 42);
  const context = courseTitle ? ` in ${plainMarkdown(courseTitle)}` : "";
  return {
    version: 1,
    eyebrow: "Guided lesson map",
    title: `See how ${cleanTitle} fits together`,
    intro: outcome || `Follow the core ideas, evidence and practical meaning of this lesson${context}.`,
    scenes,
    activity: {
      kind: "meter",
      title: "Prove that the lesson is usable",
      prompt: "Move each slider only as far as you can support with a specific explanation, example or decision. This is a private rehearsal, not a grade.",
      dimensions: [
        {
          id: "explain",
          label: "I can explain the central idea without jargon",
          lowLabel: "Not yet",
          highLabel: "Clearly",
          weight: 1.2,
          initial: 30,
        },
        {
          id: "evidence",
          label: "I can point to evidence or an example",
          lowLabel: "No evidence",
          highLabel: "Specific evidence",
          weight: 1.1,
          initial: 30,
        },
        {
          id: "apply",
          label: "I can use it in a real situation",
          lowLabel: "Unsure",
          highLabel: "Ready to apply",
          weight: 1.3,
          initial: 25,
        },
      ],
      thresholds: [
        {
          max: 39,
          label: "Replay the guided map",
          feedback: "Return to the scene you cannot yet explain. Write one sentence in your own words before moving on.",
          tone: "risk",
        },
        {
          max: 69,
          label: "Understanding is forming",
          feedback: "You have the outline. Add one concrete example or source-backed fact, then test the idea in the lesson activity.",
          tone: "caution",
        },
        {
          max: 100,
          label: "Ready for the knowledge check",
          feedback: "You can explain, support and apply the idea. Continue and use the scored check to test whether that confidence holds.",
          tone: "good",
        },
      ],
    },
    takeaway: outcome || scenes.at(-1)!.body,
  };
}

export function parseLessonExperience(value: unknown): LessonExperience | null {
  let source: UnknownRecord;
  try {
    source = record(typeof value === "string" ? JSON.parse(value) : value);
  } catch {
    return null;
  }
  const activitySource = record(source.activity);
  const kind = text(activitySource.kind, 20);
  const scenes = array(source.scenes, 8).map((item, index) => {
    const scene = record(item);
    return {
      id: text(scene.id, 80) || `scene-${index + 1}`,
      label: text(scene.label, 80) || `Scene ${index + 1}`,
      title: text(scene.title, 160),
      body: text(scene.body, 1_200),
      metric: text(scene.metric, 100) || undefined,
      tone: (["blue", "orange", "green", "red"] as const).find((tone) => tone === scene.tone),
    };
  }).filter((scene) => scene.title && scene.body);

  let activity: LessonExperience["activity"] | null = null;
  if (kind === "classify") {
    const buckets = array(activitySource.buckets, 5).map((item, index) => {
      const bucket = record(item);
      return {
        id: text(bucket.id, 80) || `bucket-${index + 1}`,
        label: text(bucket.label, 100),
        description: text(bucket.description, 300),
      };
    }).filter((bucket) => bucket.label);
    const bucketIds = new Set(buckets.map((bucket) => bucket.id));
    const cards = array(activitySource.cards, 12).map((item, index) => {
      const card = record(item);
      return {
        id: text(card.id, 80) || `card-${index + 1}`,
        text: text(card.text, 400),
        bucketId: text(card.bucketId, 80),
        feedback: text(card.feedback, 500),
      };
    }).filter((card) => card.text && bucketIds.has(card.bucketId));
    if (buckets.length >= 2 && cards.length >= 2) {
      activity = {
        kind: "classify",
        title: text(activitySource.title, 160),
        prompt: text(activitySource.prompt, 600),
        buckets,
        cards,
      };
    }
  } else if (kind === "branch") {
    const options = array(activitySource.options, 6).map((item, index) => {
      const option = record(item);
      return {
        id: text(option.id, 80) || `option-${index + 1}`,
        label: text(option.label, 220),
        verdict: text(option.verdict, 120),
        feedback: text(option.feedback, 700),
        tone: (["good", "caution", "risk"] as const).find((tone) => tone === option.tone) || "caution",
      };
    }).filter((option) => option.label && option.feedback);
    if (options.length >= 2) {
      activity = {
        kind: "branch",
        title: text(activitySource.title, 160),
        prompt: text(activitySource.prompt, 600),
        options,
      };
    }
  } else if (kind === "meter") {
    const dimensions = array(activitySource.dimensions, 8).map((item, index) => {
      const dimension = record(item);
      return {
        id: text(dimension.id, 80) || `dimension-${index + 1}`,
        label: text(dimension.label, 140),
        lowLabel: text(dimension.lowLabel, 100),
        highLabel: text(dimension.highLabel, 100),
        weight: Math.max(0, number(dimension.weight, 1)),
        initial: Math.max(0, Math.min(100, number(dimension.initial, 50))),
      };
    }).filter((dimension) => dimension.label);
    const thresholds = array(activitySource.thresholds, 6).map((item) => {
      const threshold = record(item);
      return {
        max: Math.max(0, Math.min(100, number(threshold.max, 100))),
        label: text(threshold.label, 120),
        feedback: text(threshold.feedback, 600),
        tone: (["good", "caution", "risk"] as const).find((tone) => tone === threshold.tone) || "caution",
      };
    }).filter((threshold) => threshold.label && threshold.feedback).sort((a, b) => a.max - b.max);
    if (dimensions.length >= 2 && thresholds.length >= 1) {
      activity = {
        kind: "meter",
        title: text(activitySource.title, 160),
        prompt: text(activitySource.prompt, 600),
        dimensions,
        thresholds,
      };
    }
  }

  const title = text(source.title, 180);
  const intro = text(source.intro, 1_000);
  if (Number(source.version) !== 1 || !title || !intro || !scenes.length || !activity) return null;
  return {
    version: 1,
    eyebrow: text(source.eyebrow, 100) || "Interactive lesson",
    title,
    intro,
    scenes,
    activity,
    takeaway: text(source.takeaway, 700),
  };
}
