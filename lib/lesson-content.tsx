import type { ReactNode } from "react";

function safeLink(value: string) {
  if (!value.startsWith("/") && !/^(https?:|mailto:)/i.test(value)) return null;
  try {
    const url = new URL(value, "https://northstarlabs.local");
    if (!["http:", "https:", "mailto:"].includes(url.protocol)) return null;
    return value.startsWith("/") ? `${url.pathname}${url.search}${url.hash}` : url.toString();
  } catch {
    return null;
  }
}

function inlineMarkdown(value: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(value))) {
    if (match.index > cursor) nodes.push(value.slice(cursor, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index}`;
    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const parts = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const href = parts ? safeLink(parts[2]) : null;
      nodes.push(href
        ? <a key={key} href={href} rel="noreferrer" target={href.startsWith("/") ? undefined : "_blank"}>{parts![1]}</a>
        : token);
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    cursor = match.index + token.length;
    index += 1;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

export function LessonContent({
  content,
  omitLessonIntro = false,
}: {
  content: string;
  omitLessonIntro?: boolean;
}) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  if (omitLessonIntro) {
    const firstContent = lines.findIndex((line) => line.trim());
    if (firstContent >= 0 && /^#\s+/.test(lines[firstContent].trim())) {
      lines.splice(firstContent, 1);
    }
    const outcomeIndex = lines.findIndex((line) =>
      /^#{1,3}\s+(your\s+outcome|learning\s+outcomes?)\s*$/i.test(line.trim())
    );
    if (outcomeIndex >= 0) {
      let outcomeEnd = outcomeIndex + 1;
      while (
        outcomeEnd < lines.length &&
        !/^#{1,3}\s+/.test(lines[outcomeEnd].trim())
      ) {
        outcomeEnd += 1;
      }
      lines.splice(outcomeIndex, outcomeEnd - outcomeIndex);
    }
  }
  const blocks: ReactNode[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index].trimEnd();
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(<ul key={`ul-${index}`}>{items.map((item, itemIndex) =>
        <li key={itemIndex}>{inlineMarkdown(item, `ul-${index}-${itemIndex}`)}</li>
      )}</ul>);
      continue;
    }
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(<ol key={`ol-${index}`}>{items.map((item, itemIndex) =>
        <li key={itemIndex}>{inlineMarkdown(item, `ol-${index}-${itemIndex}`)}</li>
      )}</ol>);
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (heading) {
      const children = inlineMarkdown(heading[2], `h-${index}`);
      blocks.push(heading[1].length === 1
        ? <h2 key={`h-${index}`}>{children}</h2>
        : heading[1].length === 2
          ? <h3 key={`h-${index}`}>{children}</h3>
          : <h4 key={`h-${index}`}>{children}</h4>);
      index += 1;
      continue;
    }
    if (line.trim().startsWith("> ")) {
      blocks.push(
        <blockquote key={`quote-${index}`}>
          {inlineMarkdown(line.trim().slice(2), `quote-${index}`)}
        </blockquote>,
      );
      index += 1;
      continue;
    }
    const paragraphs = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s+|^[-*]\s+|^\d+\.\s+|^>\s+/.test(lines[index].trim())
    ) {
      paragraphs.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p key={`p-${index}`}>{inlineMarkdown(paragraphs.join(" "), `p-${index}`)}</p>,
    );
  }
  return <div className="lesson-rich-content">{blocks}</div>;
}
