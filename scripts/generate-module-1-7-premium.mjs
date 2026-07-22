import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const createdAt = 1785663600000;
const courseId = "cognizen-crypto-mastery-foundations-production";

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lessons = [
  {
    id: "cmf-module-1-7-lesson-01",
    assetId: "cmf-module-1-7-definition-video",
    file: "module-1-7-asset-taxonomy.mp4",
    transcript: `A network-native unit is one thing, a smart-contract token can be another, and a tokenised claim can be something else again.

When you map digital assets, begin with one question: what is the ledger object, and what is the claim attached to it? A native unit is part of protocol accounting. A contract token follows the rules of its issuing code. A represented claim may point beyond the chain to custodians, reserve assets, debt contracts or redemption promises.

If a learner confuses these categories, they will overvalue slogans and underestimate legal, operational and liquidity risk. The right decision starts by identifying ownership, control and enforceability separately.

Strong analysis asks: who can issue, who can redeem, who bears failure risk, and what evidence the promise actually has. That is the difference between a ledger entry and a reliable claim.`
  },
  {
    id: "cmf-module-1-7-lesson-02",
    assetId: "cmf-module-1-7-rights-video",
    file: "module-1-7-token-rights.mp4",
    transcript: `The strongest lesson in token markets is to inspect rights, not labels. A token may be transferable, liquid and easy to trade, while providing little beyond access to a contract transfer method.

Ask three layers: code rights, governance rights and legal rights. Code rights answer what the smart contract can do automatically. Governance rights answer who can alter those rules. Legal rights answer who must deliver what to whom when the promise is not fully on-chain.

Marketing words like "equity", "income", or "guaranteed value" are clues, not proofs. Learners need an evidence ladder: permissions, jurisdiction, remedy, and enforcement pathway. If any layer is opaque, confidence is conditional.

This lesson helps learners stop conflating a transfer mechanism with a legal right and decide what risk is actually being purchased.`
  },
  {
    id: "cmf-module-1-7-lesson-03",
    assetId: "cmf-module-1-7-dependency-video",
    file: "module-1-7-stable-nft-rwa.mp4",
    transcript: `Represented assets work only as strong as their dependency chain. For stablecoins, that chain includes reserves, access procedures and operational operations. For NFTs, it includes metadata location, content licensing and marketplace integrity. For tokenised assets, it includes custody and legal treatment of the underlying asset.

Wrapped assets add one extra layer: the original value chain must remain intact while tokens remain tradable in a new layer. Bridges and custodians are part of the claim, even when on-chain logic looks neat.

The practical method is to trace the chain end-to-end and stress-test one link at a time: what fails first, who controls the failure response, and what the learner should assume when the chain is stressed.

When the chain is visible and tested, users can compare alternatives without guessing. Good design choices reduce one dependency risk at a time.`
  },
];

const statements = [];
for (const lesson of lessons) {
  const assetPath = new URL(`../public/media/faculty/${lesson.file}`, import.meta.url);
  statements.push(
    `INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT ${sql(lesson.assetId)},c.\`school_id\`,c.\`owner_id\`,${sql(`static:/media/faculty/${lesson.file}`)},${sql(lesson.file)},'video/mp4',${statSync(assetPath).size},'video','Neural-narrated visual lesson for Module 1.7 of Crypto Mastery.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`
  );
  statements.push(
    `UPDATE \`lessons\` SET \`lesson_type\`='video',\`primary_asset_id\`=${sql(lesson.assetId)},\`required_watch_percent\`=75,\`transcript\`=${sql(lesson.transcript)},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(lesson.id)} AND \`course_id\`=${sql(courseId)};`
  );
}

await writeFile(
  new URL("../drizzle/0064_crypto_mastery_module_1_7_premium.sql", import.meta.url),
  `${statements.join("\n--> statement-breakpoint\n")}\n`,
  "utf8",
);
console.log("Wrote the Module 1.7 premium migration.");
