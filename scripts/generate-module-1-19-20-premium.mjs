import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const createdAt = 1785038400000;
const courseId = "cognizen-crypto-mastery-foundations-production";

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lessons = [
  {
    id: "cmf-module-1-19-lesson-01",
    assetId: "cmf-module-1-19-fees-and-gas-video",
    file: "module-1-19-fees-and-gas.mp4",
    transcript: `Fees are not one thing. They are a stack. A learner may pay a platform fee, a funding fee, a spread, a withdrawal fee and a blockchain fee, and each one appears at a different point in the journey. On Bitcoin, the protocol fee is linked to transaction size and fee rate. On Ethereum, gas measures computational work and the final cost depends on gas used and the effective price per unit. A failed contract transaction can still cost gas because the network already performed work before the revert. That means the learner should read the fee quote in context, not as a slogan. A cheap withdrawal can still be a bad deal if it leaves the asset on the wrong platform or on the wrong network. The smart habit is to compare the amount delivered, the network route and the total impact on the learner's actual objective.`,
  },
  {
    id: "cmf-module-1-20-lesson-01",
    assetId: "cmf-module-1-20-stablecoin-models-video",
    file: "module-1-20-stablecoin-models.mp4",
    transcript: `A stablecoin is a token designed to track a reference value, usually a fiat currency. The design matters because different stabilisation models carry different risks. Fiat-backed stablecoins rely on reserves and redemption arrangements. Crypto-collateralised models rely on extra collateral and liquidation systems because the underlying collateral can move quickly. Algorithmic models rely on market incentives and can become reflexive when confidence falls. The important lesson is that the word stable describes the target, not a guarantee. A depeg can happen when the market price moves away from the target, and reserve disclosure alone does not settle questions about liabilities, liquidity, redemption rights or governance. A learner should ask what backs the peg, who can redeem, how quickly, under what conditions and what happens if confidence drops. Stablecoins can be useful, but usefulness is not the same thing as invulnerability.`,
  },
];

const statements = [];
for (const lesson of lessons) {
  const assetPath = new URL(`../public/media/faculty/${lesson.file}`, import.meta.url);
  statements.push(`INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT ${sql(lesson.assetId)},c.\`school_id\`,c.\`owner_id\`,${sql(`static:/media/faculty/${lesson.file}`)},${sql(lesson.file)},'video/mp4',${statSync(assetPath).size},'video','Neural-narrated visual lesson for ${lesson.id}.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`);
  statements.push(`UPDATE \`lessons\` SET \`lesson_type\`='video',\`primary_asset_id\`=${sql(lesson.assetId)},\`required_watch_percent\`=75,\`transcript\`=${sql(lesson.transcript)},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(lesson.id)} AND \`course_id\`=${sql(courseId)};`);
}

await writeFile(new URL("../drizzle/0073_crypto_mastery_module_1_19_20_premium.sql", import.meta.url), `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log("Wrote the Module 1.19 to 1.20 premium migration.");
