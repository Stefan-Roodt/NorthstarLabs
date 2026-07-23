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
    id: "cmf-module-1-16-lesson-01",
    assetId: "cmf-module-1-16-true-cost-video",
    file: "module-1-16-true-cost.mp4",
    transcript: `A quoted price is only the beginning of the cost story. A learner must think in terms of the full receipt, not the marketing banner. The true cost of buying crypto can include the displayed quote, the spread between bids and asks, trading or funding fees, conversion costs, withdrawal charges and the network cost required to actually control the asset. A cheap-looking buy can become expensive if the spread is wide or if moving the asset off the platform is costly. The right habit is to compare the amount delivered to the final destination. Ask what the final all-in cost is, what amount you actually receive, and what it will cost to get the asset where you need it. This lesson turns that into a process rather than a guess. Once the learner can calculate the true cost, they are less likely to choose a platform because of a small headline fee and more likely to choose one that is operationally honest.`,
  },
  {
    id: "cmf-module-1-17-lesson-01",
    assetId: "cmf-module-1-17-transfer-flow-video",
    file: "module-1-17-transfer-flow.mp4",
    transcript: `Sending and receiving cryptocurrency is not just a button click. It is a sequence of checks that should happen before and after the transfer. First, the asset must match the receiving network. A token on one network is not automatically the same thing on another. Second, the destination must be correct, including any memo or destination tag if the platform uses one. Third, the signature authorises the exact transaction details, so the learner must inspect what is actually being signed. Fourth, a small test transaction can provide evidence before larger value moves. Fifth, the transaction hash and platform status can be used to diagnose what happened if the transfer is delayed. If a transfer goes wrong, the safest response is not panic. It is to stop, identify whether the problem is on the blockchain or on the platform, and avoid adding a second mistake while trying to fix the first. Good transfer practice is really about controlling error rates, not chasing speed.`,
  },
  {
    id: "cmf-module-1-18-lesson-01",
    assetId: "cmf-module-1-18-confirmations-video",
    file: "module-1-18-confirmations.mp4",
    transcript: `A blockchain transaction has a lifecycle, and confirmations are just one part of that lifecycle. A signed transaction is first broadcast to the network and may wait in a pool before a block includes it. Once included, it gains its first confirmation. Additional confirmations make it harder for the history to be replaced under that network's rules. But confirmations do not prove that the original instruction was wise, lawful or safe. They only strengthen the network evidence that the transaction happened. That is why a learner should separate technical confirmation from business legitimacy. An explorer can show public status, block height, transaction fields and whether a transaction is pending, included or replaced. It cannot tell you whether the counterparty is honest or whether the transfer was a good idea. The useful habit is to treat confirmations as confidence-building evidence, not as a substitute for judgment or due diligence.`,
  },
];

const statements = [];
for (const lesson of lessons) {
  const assetPath = new URL(`../public/media/faculty/${lesson.file}`, import.meta.url);
  statements.push(`INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT ${sql(lesson.assetId)},c.\`school_id\`,c.\`owner_id\`,${sql(`static:/media/faculty/${lesson.file}`)},${sql(lesson.file)},'video/mp4',${statSync(assetPath).size},'video','Neural-narrated visual lesson for ${lesson.id}.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`);
  statements.push(`UPDATE \`lessons\` SET \`lesson_type\`='video',\`primary_asset_id\`=${sql(lesson.assetId)},\`required_watch_percent\`=75,\`transcript\`=${sql(lesson.transcript)},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(lesson.id)} AND \`course_id\`=${sql(courseId)};`);
}

await writeFile(new URL("../drizzle/0072_crypto_mastery_module_1_16_18_premium.sql", import.meta.url), `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log("Wrote the Module 1.16 to 1.18 premium migration.");
