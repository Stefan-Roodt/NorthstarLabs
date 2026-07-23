type LessonConceptVisualProps = {
  academyName: string;
  lessonType: string;
  moduleTitle: string;
  title: string;
  outline: string[];
};

type ConceptTheme =
  | "evidence"
  | "market"
  | "network"
  | "portfolio"
  | "risk"
  | "strategy";

const genericOutline = /^(learning objectives?|introduction|summary|module summary|conclusion|key takeaways?)$/i;

function visualTheme(value: string): ConceptTheme {
  const text = value.toLowerCase();
  if (/(risk|security|fraud|scam|custody|compliance|governance|safe)/.test(text)) return "risk";
  if (/(portfolio|allocation|position|diversif|rebalanc|performance)/.test(text)) return "portfolio";
  if (/(market|price|trend|volume|liquidity|cycle|trading|candlestick)/.test(text)) return "market";
  if (/(blockchain|network|node|layer|bridge|protocol|exchange|defi)/.test(text)) return "network";
  if (/(evidence|analysis|research|evaluate|white paper|sentiment|metric)/.test(text)) return "evidence";
  return "strategy";
}

function conceptLabels(outline: string[], title: string) {
  const labels = outline
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !genericOutline.test(item))
    .filter((item, index, values) => values.indexOf(item) === index)
    .slice(0, 3);
  const titleParts = title
    .split(/\s+(?:and|versus|vs\.?)\s+|:\s+/i)
    .map((item) => item.trim())
    .filter((item) => item.length >= 4);
  for (const part of titleParts) {
    if (labels.length >= 3) break;
    if (!labels.some((label) => label.toLowerCase() === part.toLowerCase())) labels.push(part);
  }
  return labels.length ? labels.slice(0, 3) : ["Understand", "Distinguish", "Apply"];
}

function ConceptArtwork({ theme }: { theme: ConceptTheme }) {
  if (theme === "market") {
    return (
      <svg viewBox="0 0 360 210" role="img" aria-label="Market evidence moving through changing conditions">
        <path className="concept-grid" d="M30 35H330M30 80H330M30 125H330M30 170H330M80 20V190M145 20V190M210 20V190M275 20V190" />
        <path className="concept-line concept-line-muted" d="M35 157L83 132L128 143L177 91L224 111L276 48L326 68" />
        <path className="concept-line" d="M35 171L83 149L128 154L177 116L224 126L276 72L326 82" />
        <circle cx="177" cy="116" r="7" />
        <circle cx="276" cy="72" r="7" />
      </svg>
    );
  }
  if (theme === "network") {
    return (
      <svg viewBox="0 0 360 210" role="img" aria-label="Connected systems and dependencies">
        <path className="concept-line concept-line-muted" d="M70 58L180 105L292 52M70 158L180 105L295 160M70 58V158M292 52L295 160" />
        <circle cx="180" cy="105" r="32" />
        <circle cx="70" cy="58" r="18" />
        <circle cx="292" cy="52" r="18" />
        <circle cx="70" cy="158" r="18" />
        <circle cx="295" cy="160" r="18" />
        <path className="concept-line" d="M166 105H194M180 91V119" />
      </svg>
    );
  }
  if (theme === "risk") {
    return (
      <svg viewBox="0 0 360 210" role="img" aria-label="Layered risk controls around a protected decision">
        <path className="concept-shape" d="M180 20L300 62V112C300 158 254 186 180 198C106 186 60 158 60 112V62L180 20Z" />
        <path className="concept-line concept-line-muted" d="M180 45L270 76V112C270 142 238 163 180 176C122 163 90 142 90 112V76L180 45Z" />
        <path className="concept-line" d="M143 108L169 133L222 79" />
      </svg>
    );
  }
  if (theme === "portfolio") {
    return (
      <svg viewBox="0 0 360 210" role="img" aria-label="Portfolio components balanced around a shared objective">
        <circle className="concept-shape" cx="180" cy="105" r="76" />
        <path className="concept-line concept-line-muted" d="M180 29V105L246 143M180 105L119 150M180 105L126 52" />
        <circle cx="180" cy="105" r="13" />
        <circle cx="180" cy="29" r="7" />
        <circle cx="246" cy="143" r="7" />
        <circle cx="119" cy="150" r="7" />
        <circle cx="126" cy="52" r="7" />
      </svg>
    );
  }
  if (theme === "evidence") {
    return (
      <svg viewBox="0 0 360 210" role="img" aria-label="Evidence moving from observation to a defensible conclusion">
        <rect className="concept-shape" x="55" y="38" width="150" height="135" rx="12" />
        <path className="concept-line concept-line-muted" d="M82 75H177M82 105H165M82 135H145" />
        <circle className="concept-shape" cx="235" cy="118" r="51" />
        <path className="concept-line" d="M271 156L315 192M214 118L230 134L259 99" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 360 210" role="img" aria-label="A decision path connecting evidence, choice and action">
      <path className="concept-line concept-line-muted" d="M42 105H124M124 105L208 48M124 105L208 105M124 105L208 162M208 48H320M208 105H320M208 162H320" />
      <circle cx="42" cy="105" r="17" />
      <circle cx="124" cy="105" r="23" />
      <circle cx="208" cy="48" r="13" />
      <circle cx="208" cy="105" r="13" />
      <circle cx="208" cy="162" r="13" />
      <path className="concept-line" d="M278 105H320M307 92L320 105L307 118" />
    </svg>
  );
}

export function LessonConceptVisual({
  academyName,
  lessonType,
  moduleTitle,
  title,
  outline,
}: LessonConceptVisualProps) {
  const theme = visualTheme(`${moduleTitle} ${title}`);
  const labels = conceptLabels(outline, title);
  const format = lessonType === "quiz" ? "Applied assessment" : "Guided concept map";

  return (
    <section
      className="lesson-concept-visual"
      data-theme={theme}
      aria-label={`${title} visual overview`}
    >
      <div className="concept-visual-heading">
        <p>{academyName.toUpperCase()} · {format.toUpperCase()}</p>
        <strong>{moduleTitle}</strong>
        <span>See the relationships first. Then explore the lesson in depth.</span>
      </div>
      <div className="concept-visual-art">
        <ConceptArtwork theme={theme} />
      </div>
      <ol aria-label="Lesson concepts">
        {labels.map((label, index) => (
          <li key={`${label}-${index}`}>
            <small>{String(index + 1).padStart(2, "0")}</small>
            <span>{label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
