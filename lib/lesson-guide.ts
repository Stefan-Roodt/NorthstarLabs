function plainMarkdown(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getLessonGuide(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const outcomeIndex = lines.findIndex((line) =>
    /^#{1,3}\s+(your\s+outcome|learning\s+outcomes?)\s*$/i.test(line.trim())
  );
  let outcome = "";
  if (outcomeIndex >= 0) {
    const outcomeLines: string[] = [];
    for (let index = outcomeIndex + 1; index < lines.length; index += 1) {
      if (/^#{1,3}\s+/.test(lines[index].trim())) break;
      if (lines[index].trim()) outcomeLines.push(lines[index].trim());
    }
    outcome = plainMarkdown(outcomeLines.join(" "));
  }
  const outline = lines
    .map((line) => /^(#{2,3})\s+(.+)$/.exec(line.trim()))
    .filter((heading): heading is RegExpExecArray => Boolean(heading))
    .map((heading) => plainMarkdown(heading[2]))
    .filter((heading) => !/^(your\s+outcome|learning\s+outcomes?)$/i.test(heading))
    .slice(0, 5);
  return { outcome, outline };
}
