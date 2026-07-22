import assert from "node:assert/strict";
import test from "node:test";
import { strToU8, zipSync } from "fflate";
import {
  extractDocxBytes,
  naturalDocumentSort,
  numberingConflicts,
  prepareDocumentSelection,
  sequenceIssues,
  wordDocumentXmlToMarkdown,
} from "../lib/document-ingestion.ts";

const wordXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
  <w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>Module 1.1: Foundations &amp; context</w:t></w:r></w:p>
  <w:p><w:r><w:t>Money lets people exchange value.</w:t></w:r></w:p>
  <w:p><w:pPr><w:numPr><w:ilvl w:val="0"/></w:numPr></w:pPr><w:r><w:t>Check primary evidence</w:t></w:r></w:p>
</w:body></w:document>`;

test("extracts headings, paragraphs and lists from WordprocessingML", () => {
  assert.equal(
    wordDocumentXmlToMarkdown(wordXml),
    "## Module 1.1: Foundations & context\n\nMoney lets people exchange value.\n\n- Check primary evidence",
  );
});

test("extracts editable Markdown from a DOCX package", () => {
  const archive = zipSync({ "word/document.xml": strToU8(wordXml) });
  assert.match(extractDocxBytes(archive), /Money lets people exchange value/);
});

test("uses natural module order and exposes missing sequence numbers", () => {
  const ordered = naturalDocumentSort([
    { name: "Module 1.10 Public keys.docx" },
    { name: "Module 1.2 Evolution.docx" },
    { name: "Module 1.1 Money.docx" },
    { name: "Module 1.3 Origins.docx" },
  ]);
  assert.deepEqual(ordered.map((item) => item.name), [
    "Module 1.1 Money.docx",
    "Module 1.2 Evolution.docx",
    "Module 1.3 Origins.docx",
    "Module 1.10 Public keys.docx",
  ]);
  assert.deepEqual(sequenceIssues(ordered), [{
    label: "Part 1",
    missing: ["1.4", "1.5", "1.6", "1.7", "1.8", "1.9"],
  }]);
});

test("removes exact content copies, keeps the canonical numbered filename and flags numbering conflicts", async () => {
  const duplicatePackage = zipSync({ "word/document.xml": strToU8(wordXml) });
  const conflictingXml = wordXml.replace(/Module 1\.1/g, "Module 2.3");
  const conflictingPackage = zipSync({ "word/document.xml": strToU8(conflictingXml) });
  const selection = await prepareDocumentSelection([
    new File([duplicatePackage], "Institutional Portfolio Integration.docx"),
    new File([duplicatePackage], "Module 1.1 Foundations.docx"),
    new File([conflictingPackage], "Module 2.2 Market Cycles.docx"),
  ]);
  assert.deepEqual(selection.documents.map((item) => item.file.name), [
    "Module 1.1 Foundations.docx",
    "Module 2.2 Market Cycles.docx",
  ]);
  assert.deepEqual(selection.excludedExactContentCopies, ["Institutional Portfolio Integration.docx"]);
  assert.deepEqual(numberingConflicts(selection.documents), [{
    filename: "Module 2.2 Market Cycles.docx",
    filenameNumber: "2.2",
    internalNumber: "2.3",
  }]);
});
