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
