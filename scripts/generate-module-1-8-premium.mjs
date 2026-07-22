import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const createdAt = 1785664200000;
const courseId = "cognizen-crypto-mastery-foundations-production";

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lessons = [
  {
    id: "cmf-module-1-8-lesson-01",
    assetId: "cmf-module-1-8-ledger-video",
    file: "module-1-8-ledger-ownership.mp4",
    transcript: `Bitcoin ownership is control of spend conditions, not a stored balance in a wallet app.

The wallet helps create and sign a transaction, but the spendable state is maintained by the network as valid unspent outputs. A learner who understands this can separate technical custody assumptions from protocol facts.

Each payment consumes existing outputs and creates new outputs that must satisfy exact rules. If an output is spent, it cannot be spent again. If a signature is wrong, the transaction fails before it reaches consensus.

This lesson teaches learners to trace money as state transitions: what inputs are consumed, what new outputs are created, and which keys were required to authorise the spend.`
  },
  {
    id: "cmf-module-1-8-lesson-02",
    assetId: "cmf-module-1-8-mining-video",
    file: "module-1-8-proof-of-work.mp4",
    transcript: `Proof of work is the costed process that selects candidate blocks, but it is not a substitute for validation rules.

Miners propose blocks. Independent nodes still apply the same validity checks before accepting them. More hashes make rewriting history expensive, yet confidence grows only with additional valid blocks and a sound operational environment.

Difficulty adjusts as a protocol parameter to keep block production near target pace. Confirmations are a practical risk-reduction measure, not proof of absolute finality.

When learners confuse search effort with rule authority, they overestimate security. Good course design separates these layers: computational effort, consensus validity, and independent enforcement.` 
  },
  {
    id: "cmf-module-1-8-lesson-03",
    assetId: "cmf-module-1-8-scarcity-video",
    file: "module-1-8-scarcity-claims.mp4",
    transcript: `Scarcity is a protocol property; price trajectory is not. The lesson asks learners to separate verifiable chain facts from external assumptions.

A protocol can set issuance schedules and security assumptions clearly. That gives high-quality evidence about what is controlled and what is not. But future adoption, regulation and market demand remain external systems with their own uncertainties.

This module introduces a practical rubric: protocol evidence, external evidence and market hypothesis. It keeps analysis grounded and avoids giving financial promises from technical rules alone.

When this rubric becomes habit, learners make better decisions: they can identify what is confirmed on-chain, what needs off-chain verification, and what is simply an expectation about the future.`
  },
];

const statements = [];
for (const lesson of lessons) {
  const assetPath = new URL(`../public/media/faculty/${lesson.file}`, import.meta.url);
  statements.push(
    `INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT ${sql(lesson.assetId)},c.\`school_id\`,c.\`owner_id\`,${sql(`static:/media/faculty/${lesson.file}`)},${sql(lesson.file)},'video/mp4',${statSync(assetPath).size},'video','Neural-narrated visual lesson for Module 1.8 of Crypto Mastery.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`
  );
  statements.push(
    `UPDATE \`lessons\` SET \`lesson_type\`='video',\`primary_asset_id\`=${sql(lesson.assetId)},\`required_watch_percent\`=75,\`transcript\`=${sql(lesson.transcript)},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(lesson.id)} AND \`course_id\`=${sql(courseId)};`
  );
}

await writeFile(
  new URL("../drizzle/0065_crypto_mastery_module_1_8_premium.sql", import.meta.url),
  `${statements.join("\n--> statement-breakpoint\n")}\n`,
  "utf8",
);
console.log("Wrote the Module 1.8 premium migration.");
