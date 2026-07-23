export function countNarrationWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function estimateNarrationMinutes(value: string) {
  return value.trim() ? Math.max(1, Math.ceil(countNarrationWords(value) / 140)) : 0;
}

function stableLessonHash(value: string) {
  let hash = 5381;
  for (const character of value) {
    hash = ((hash << 5) + hash) ^ character.charCodeAt(0);
  }
  return (hash >>> 0).toString(36).padStart(7, "0").slice(-7);
}

export function narrationFileStem(lessonId: string) {
  const slug = lessonId
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 64) || "lesson";
  return `narration-${slug}-${stableLessonHash(lessonId)}`;
}

export function narrationFilename(lessonId: string, extension = "mp3") {
  const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
  return `${narrationFileStem(lessonId)}.${safeExtension}`;
}

export function matchNarrationFilename(filename: string, lessonIds: string[]) {
  const leaf = filename.split(/[\\/]/).at(-1) || "";
  const stem = leaf.replace(/\.[^.]+$/, "").toLowerCase();
  const matches = lessonIds.filter((lessonId) => narrationFileStem(lessonId).toLowerCase() === stem);
  return matches.length === 1 ? matches[0] : null;
}

export type NarrationManifestLesson = {
  order: number;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  transcript: string;
  hasMedia: boolean;
};

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, "\"\"")}"`;
}

export function buildNarrationProductionCsv(lessons: NarrationManifestLesson[]) {
  const header = [
    "production_order",
    "module",
    "lesson",
    "lesson_id",
    "required_audio_filename",
    "production_status",
    "script_words",
    "estimated_minutes",
    "transcript",
  ];
  const rows = lessons.map((lesson) => {
    const words = countNarrationWords(lesson.transcript);
    const status = lesson.hasMedia
      ? "media_attached_review_needed"
      : words >= 40
        ? "ready_for_recording"
        : "script_review_required";
    return [
      lesson.order,
      lesson.moduleTitle,
      lesson.lessonTitle,
      lesson.lessonId,
      narrationFilename(lesson.lessonId),
      status,
      words,
      estimateNarrationMinutes(lesson.transcript),
      lesson.transcript,
    ].map(csvCell).join(",");
  });
  return [header.map(csvCell).join(","), ...rows].join("\r\n");
}

export function buildNarrationDraft(title: string, content: string) {
  const cleaned = content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/```(?:\w+)?\s*([\s\S]*?)```/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\[(?:S|Source)\s*\d+(?:\s*,\s*(?:S|Source)?\s*\d+)*\]/gi, "")
    .replace(/[*_~`]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\|/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) =>
      paragraph.length > 1 &&
      paragraph.toLowerCase() !== title.trim().toLowerCase()
    );
  if (countNarrationWords(paragraphs.join(" ")) < 40) return "";
  return [
    `In this lesson, we work through ${title.trim()}.`,
    ...paragraphs,
    "Before you continue, pause and explain the central idea in your own words. Then connect it to the practical decision or example in this lesson.",
  ].join("\n\n");
}
