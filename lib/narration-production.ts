export function countNarrationWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function estimateNarrationMinutes(value: string) {
  return value.trim() ? Math.max(1, Math.ceil(countNarrationWords(value) / 140)) : 0;
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
