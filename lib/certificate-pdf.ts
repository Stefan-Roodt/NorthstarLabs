type CertificatePdfData = {
  certificateTitle: string;
  learnerName: string;
  courseTitle: string;
  issuerName: string;
  code: string;
  issuedAt: number;
  expiresAt: number | null;
  accentColor: string;
  verificationUrl: string;
};

function pdfSafe(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .trim();
}

function splitTitle(value: string, max = 48) {
  const words = pdfSafe(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || `${current} ${word}`.length > max) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  return lines.slice(0, 2);
}

function centerX(value: string, size: number) {
  return Math.max(70, 421 - pdfSafe(value).length * size * 0.24);
}

function colorParts(hex: string) {
  const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "3556d8";
  return [0, 2, 4].map((index) =>
    (Number.parseInt(value.slice(index, index + 2), 16) / 255).toFixed(3)
  );
}

function textLine(value: string, size: number, y: number, font = "F1") {
  const safe = pdfSafe(value);
  return `BT /${font} ${size} Tf ${centerX(safe, size).toFixed(1)} ${y} Td (${safe}) Tj ET`;
}

export function createCertificatePdf(data: CertificatePdfData) {
  const [red, green, blue] = colorParts(data.accentColor);
  const headingLines = splitTitle(data.certificateTitle, 34);
  const courseLines = splitTitle(data.courseTitle, 56);
  const issued = new Date(data.issuedAt).toISOString().slice(0, 10);
  const expires = data.expiresAt
    ? new Date(data.expiresAt).toISOString().slice(0, 10)
    : "No expiry";
  const content = [
    "q",
    `${red} ${green} ${blue} RG`,
    "8 w 24 24 794 547 re S",
    "0.12 0.15 0.18 RG",
    "1 w 40 40 762 515 re S",
    "Q",
    textLine(data.issuerName.toUpperCase(), 12, 515, "F2"),
    ...headingLines.map((line, index) => textLine(line, 38, 452 - index * 43, "F2")),
    textLine("This certifies that", 13, 355),
    textLine(data.learnerName, 30, 312, "F2"),
    `${red} ${green} ${blue} RG 2 w 170 294 m 672 294 l S`,
    textLine("has successfully completed", 13, 263),
    ...courseLines.map((line, index) => textLine(line, 22, 224 - index * 28, "F2")),
    textLine(`Issued ${issued}   |   Valid until ${expires}`, 10, 138),
    textLine(`Certificate ID ${data.code}`, 10, 116, "F2"),
    textLine(`Verify: ${data.verificationUrl}`, 8, 82),
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`,
  ];
  let document = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(new TextEncoder().encode(document).length);
    document += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = new TextEncoder().encode(document).length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    document += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(document);
}
