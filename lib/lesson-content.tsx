import type { ReactNode } from "react";

const MAX_WORDS_PER_SLIDE = 280;
const AVERAGE_READ_WPM = 145;
const MAX_CODE_LINES_PER_SLIDE = 24;

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

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
}

function splitTextIntoChunks(value: string, maxWords: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const chunks: string[] = [];
  for (let start = 0; start < words.length; start += maxWords) {
    chunks.push(words.slice(start, start + maxWords).join(" "));
  }
  return chunks;
}

function splitCodeIntoChunks(value: string, maxLines: number): string[] {
  const lines = value.replace(/\r\n/g, "\n").trim().split("\n");
  if (!lines.length || (lines.length === 1 && !lines[0]!.trim())) return [];
  const chunks: string[] = [];
  for (let start = 0; start < lines.length; start += maxLines) {
    chunks.push(lines.slice(start, start + maxLines).join("\n"));
  }
  return chunks;
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
      nodes.push(
        href
          ? <a key={key} href={href} rel="noreferrer" target={href.startsWith("/") ? undefined : "_blank"}>{parts![1]}</a>
          : token
      );
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    cursor = match.index + token.length;
    index += 1;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}

function headingNode(level: 1 | 2 | 3, children: ReactNode, key: string) {
  return level === 1
    ? <h2 key={key}>{children}</h2>
    : level === 2
      ? <h3 key={key}>{children}</h3>
      : <h4 key={key}>{children}</h4>;
}

function paragraphNode(text: string, key: string, callout = false) {
  return <p key={key} className={callout ? "lesson-slide-callout" : undefined}>
    {inlineMarkdown(text, `${key}-content`)}
  </p>;
}

function quoteNode(text: string, key: string, callout = false) {
  return <blockquote key={key} className={callout ? "lesson-slide-callout" : undefined}>{inlineMarkdown(text, `${key}-content`)}</blockquote>;
}

function listNode(items: string[], ordered: boolean, key: string, callout = false) {
  return ordered
    ? <ol key={key} className={callout ? "lesson-slide-callout" : undefined}>{items.map((item, itemIndex) =>
      <li key={`${key}-${itemIndex}`}>{inlineMarkdown(item, `${key}-${itemIndex}`)}</li>
    )}</ol>
    : <ul key={key} className={callout ? "lesson-slide-callout" : undefined}>{items.map((item, itemIndex) =>
      <li key={`${key}-${itemIndex}`}>{inlineMarkdown(item, `${key}-${itemIndex}`)}</li>
    )}</ul>;
}

function codeNode(code: string, language: string, key: string) {
  return (
    <pre key={key}>
      <code className={language ? `language-${language}` : ""}>{code}</code>
    </pre>
  );
}

function imageNode(url: string, alt: string, key: string) {
  return (
    <figure key={key} className="lesson-slide-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt || "Slide visual"} loading="lazy" />
      {alt ? <figcaption>{alt}</figcaption> : null}
    </figure>
  );
}

type ParsedLessonBlock = {
  key: string;
  node: ReactNode;
  headingLevel?: 1 | 2 | 3;
  headingText?: string;
  kind: "heading" | "paragraph" | "list" | "ordered-list" | "quote" | "code" | "image" | "hr";
  text: string;
  callout?: boolean;
  words: number;
  listItems?: string[];
  imageUrl?: string;
  imageAlt?: string;
  language?: string;
};

function parseLessonContent(content: string, omitLessonIntro: boolean): ParsedLessonBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let nextAsCallout = false;

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

  const blocks: ParsedLessonBlock[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index].trimEnd();
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim() === "---") {
      blocks.push({
        key: `hr-${index}`,
        kind: "hr",
        text: "",
        words: 0,
        callout: false,
        node: <hr key={`hr-${index}`} />,
      });
      index += 1;
      nextAsCallout = false;
      continue;
    }

    const imageMatch = /^!\[[^\]]*\]\(([^)]+)\)$/.exec(line.trim());
    if (imageMatch && imageMatch[1]) {
      const src = imageMatch[1];
      const alt = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line.trim())?.[1] || "Slide visual";
      const href = safeLink(src);
      if (href) {
        blocks.push({
          key: `img-${index}`,
          kind: "image",
          text: line,
          callout: false,
          words: 0,
          imageUrl: href,
          imageAlt: alt,
          node: imageNode(href, alt, `img-${index}`),
        });
      } else {
        blocks.push({
          key: `img-${index}`,
          kind: "paragraph",
          text: line,
          callout: false,
          words: countWords(line),
          node: paragraphNode(line, `p-${index}`),
        });
      }
      index += 1;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const language = line.trim().replace(/^```/, "").trim();
      const rawLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        rawLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length && /^```/.test(lines[index].trim())) {
        index += 1;
      }
      const code = rawLines.join("\n");
      blocks.push({
        key: `code-${index}`,
        kind: "code",
        text: code,
        callout: false,
        words: countWords(code),
        language,
        node: codeNode(code, language, `code-${index}`),
      });
      nextAsCallout = false;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      const callout = nextAsCallout;
      const node = listNode(items, false, `ul-${index}`, callout);
      blocks.push({
        key: `ul-${index}`,
        kind: "list",
        listItems: items,
        callout,
        text: items.join(" "),
        words: items.reduce((count, item) => count + countWords(item), 0),
        node,
      });
      nextAsCallout = false;
      continue;
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      const callout = nextAsCallout;
      const node = listNode(items, true, `ol-${index}`, callout);
      blocks.push({
        key: `ol-${index}`,
        kind: "ordered-list",
        listItems: items,
        callout,
        text: items.join(" "),
        words: items.reduce((count, item) => count + countWords(item), 0),
        node,
      });
      nextAsCallout = false;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3;
      const text = heading[2].trim();
      const children = inlineMarkdown(text, `h-${index}`);
      blocks.push({
        key: `h-${index}`,
        kind: "heading",
        headingLevel: level,
        headingText: text,
        text,
        callout: false,
        words: countWords(text),
        node: headingNode(level, children, `h-${index}`),
      });
      nextAsCallout = /^(learning outcomes?|learning objectives?|key takeaways?|key points|what you.?ll learn|what will you.?ll learn|exam focus)$/i.test(text.trim());
      index += 1;
      continue;
    }

    if (line.trim().startsWith("> ")) {
      const text = line.trim().slice(2);
      blocks.push({
        key: `quote-${index}`,
        kind: "quote",
        text,
        callout: nextAsCallout,
        words: countWords(text),
        node: quoteNode(text, `quote-${index}`, nextAsCallout),
      });
      nextAsCallout = false;
      index += 1;
      continue;
    }

    const paragraphLines = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s+|^[-*]\s+|^\d+\.\s+|^>\s+|^---$|^!\[[^\]]*\]\([^)]+\)$|^```/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    const text = paragraphLines.join(" ");
    blocks.push({
      key: `p-${index}`,
      kind: "paragraph",
      text,
      callout: nextAsCallout,
      words: countWords(text),
      node: paragraphNode(text, `p-${index}`, nextAsCallout),
    });
    nextAsCallout = false;
  }

  return blocks;
}

function splitBlocksForSlides(blocks: ParsedLessonBlock[]) {
  const expanded: ParsedLessonBlock[] = [];
  for (const block of blocks) {
    if (block.kind === "code" && block.words > MAX_WORDS_PER_SLIDE) {
      const chunks = splitCodeIntoChunks(block.text, MAX_CODE_LINES_PER_SLIDE);
      if (chunks.length === 0) {
        expanded.push(block);
        continue;
      }
      chunks.forEach((chunk, chunkIndex) => {
        const chunkWords = countWords(chunk);
        expanded.push({
          ...block,
          key: `${block.key}-${chunkIndex + 1}`,
          text: chunk,
          words: chunkWords,
          node: codeNode(chunk, block.language || "", `${block.key}-${chunkIndex + 1}`),
        });
      });
      continue;
    }

    if (block.words <= MAX_WORDS_PER_SLIDE || block.kind === "image" || block.kind === "hr" || block.kind === "heading") {
      expanded.push(block);
      continue;
    }

    if (block.kind === "paragraph" || block.kind === "quote") {
      const chunks = splitTextIntoChunks(block.text, MAX_WORDS_PER_SLIDE);
      chunks.forEach((chunk, chunkIndex) => {
        expanded.push({
          ...block,
          key: `${block.key}-${chunkIndex + 1}`,
          text: chunk,
          words: countWords(chunk),
          node: block.kind === "quote"
            ? quoteNode(chunk, `${block.key}-${chunkIndex + 1}`, block.callout)
            : paragraphNode(chunk, `${block.key}-${chunkIndex + 1}`, block.callout),
        });
      });
      continue;
    }

    if (block.kind === "list" || block.kind === "ordered-list") {
      const ordered = block.kind === "ordered-list";
      const items = block.listItems || [];
      let chunk: string[] = [];
      let chunkWords = 0;
      let part = 1;

      const flush = () => {
        if (!chunk.length) return;
        const chunkText = chunk.join(" ");
        expanded.push({
          ...block,
          key: `${block.key}-${part}`,
          listItems: [...chunk],
          text: chunkText,
          words: chunkWords,
          node: listNode(chunk, ordered, `${block.key}-${part}`, block.callout),
        });
        part += 1;
        chunk = [];
        chunkWords = 0;
      };

      for (const item of items) {
        const itemWords = countWords(item);
        if (chunk.length > 0 && chunkWords + itemWords > MAX_WORDS_PER_SLIDE) {
          flush();
        }
        chunk.push(item);
        chunkWords += itemWords;
      }
      flush();
      continue;
    }

    expanded.push(block);
  }

  return expanded;
}

function estimateReadMinutes(words: number) {
  return Math.max(1, Math.round(words / AVERAGE_READ_WPM));
}

function shouldStartNewSlide(currentWordCount: number, blockWords: number) {
  return currentWordCount > 0 && currentWordCount + blockWords > MAX_WORDS_PER_SLIDE;
}

function isSectionHeading(block: ParsedLessonBlock) {
  return block.kind === "heading" && block.headingLevel && block.headingLevel <= 3;
}

function normalizeSlideTitle(baseTitle: string, fallbackTitle: string, headingText?: string) {
  return headingText?.trim() ? headingText.trim() : baseTitle || fallbackTitle;
}

export function LessonContent({
  content,
  omitLessonIntro = false,
  lessonTitle,
  slideDeckMode = true,
}: {
  content: string;
  omitLessonIntro?: boolean;
  lessonTitle?: string;
  slideDeckMode?: boolean;
}) {
  const parsed = parseLessonContent(content, omitLessonIntro);
  if (!slideDeckMode) {
    return <div className="lesson-rich-content">
      {parsed.map((block) => block.node)}
    </div>;
  }

  const blocks = splitBlocksForSlides(parsed);
  const fallbackTitle = lessonTitle?.trim() || "Lesson slide";
  const slides: Array<{ title: string; key: string; nodes: ReactNode[]; wordCount: number; hasVisual: boolean; }> = [];

  let current = {
    title: fallbackTitle,
    key: "slide-1",
    nodes: [] as ReactNode[],
    wordCount: 0,
    hasVisual: false,
  };

  for (const block of blocks) {
    if (isSectionHeading(block)) {
      if (current.nodes.length > 0) {
        slides.push(current);
        current = {
          title: normalizeSlideTitle(block.headingText || fallbackTitle, fallbackTitle, block.headingText),
          key: `slide-${slides.length + 1}`,
          nodes: [],
          wordCount: 0,
          hasVisual: false,
        };
      } else if (current.title === fallbackTitle) {
        current.title = normalizeSlideTitle(current.title, fallbackTitle, block.headingText);
      }
      current.nodes.push(block.node);
      current.wordCount += block.words;
      current.hasVisual = current.hasVisual || block.kind === "image" || block.kind === "code";
      continue;
    }

    if (shouldStartNewSlide(current.wordCount, block.words)) {
      slides.push(current);
      current = {
        title: current.title,
        key: `slide-${slides.length + 1}`,
        nodes: [],
        wordCount: 0,
        hasVisual: false,
      };
    }

    current.nodes.push(block.node);
    current.wordCount += block.words;
    current.hasVisual = current.hasVisual || block.kind === "image" || block.kind === "code";
  }

  if (current.nodes.length > 0) {
    slides.push(current);
  }

  if (slides.length === 0) {
    return <div className="lesson-rich-content lesson-slide-deck">
      <section className="lesson-slide has-visual">
        <header className="lesson-slide-header">
          <div className="lesson-slide-kicker">
            <span>Slide 1 of 1</span>
            <p>{fallbackTitle}</p>
          </div>
          <p className="lesson-slide-meta"><span>0 words</span><span>1 min read</span></p>
        </header>
        <div className="lesson-slide-body"><p>No lesson copy available.</p></div>
      </section>
    </div>;
  }

  return <div className="lesson-rich-content lesson-slide-deck">
    {slides.map((item, index) => <section key={item.key} className={`lesson-slide${item.hasVisual ? " has-visual" : ""}`}>
      <header className="lesson-slide-header">
        <div className="lesson-slide-kicker">
          <span>{`Slide ${index + 1} of ${slides.length}`}</span>
          <p>{item.title}</p>
        </div>
        <p className="lesson-slide-meta">
          <span>{`${item.wordCount} words`}</span>
          <span>{`${estimateReadMinutes(item.wordCount)} min read`}</span>
        </p>
      </header>
      <div className="lesson-slide-body">{item.nodes}</div>
    </section>)}
  </div>;
}
