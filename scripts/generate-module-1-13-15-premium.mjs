import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const createdAt = 1784952000000;
const courseId = "cognizen-crypto-mastery-foundations-production";

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lessons = [
  {
    id: "cmf-module-1-13-lesson-01",
    assetId: "cmf-module-1-13-recovery-chain-video",
    file: "module-1-13-recovery-chain.mp4",
    transcript: `A recovery phrase is portable authority, not a password hint. It can recreate the wallet keys associated with a compatible wallet, which is why the phrase must be treated like the highest value secret in the system. The order of the words matters, the spelling matters and the optional passphrase matters. If any part is wrong, the restored wallet can be different or inaccessible. The local wallet password or PIN is not the same thing. A password may protect the interface on one device, but the recovery phrase can recreate the wallet elsewhere. That is why cloud screenshots, photos and chat messages are risky backups even when they feel convenient. A good recovery design balances confidentiality and recoverability. The learner should keep durable copies in separated locations, test the process with disposable credentials and know what to do if the phrase is exposed. If compromise is suspected, changing the app password is not enough. The safe response is to create a new secure wallet and move value under new keys after verifying the plan.`,
  },
  {
    id: "cmf-module-1-14-lesson-01",
    assetId: "cmf-module-1-14-exchange-ledger-video",
    file: "module-1-14-exchange-ledger.mp4",
    transcript: `A centralised exchange is a service provider, not the blockchain itself. The clean way to understand it is to follow the money and the records separately. A bank deposit enters the exchange through ordinary payment rails. The platform then updates an internal customer ledger. A trade usually changes those internal records before anything moves on chain. Only when a withdrawal is made does the platform broadcast a blockchain transaction. That distinction matters because the balance visible in the account depends on the exchange's database and controls. It is not the same thing as a balance on the public network. This is why operational risk, custody risk and solvency risk matter so much. A learner must ask who holds the keys, who can freeze the account, what the fee structure is, what the withdrawal rules are and how the platform is regulated. The platform can make buying easy, but it also creates trust dependency. The right habit is to treat the exchange like a service you use, not like proof that you own the asset until you have withdrawn it to your own wallet.`,
  },
  {
    id: "cmf-module-1-15-lesson-01",
    assetId: "cmf-module-1-15-dex-risk-stack-video",
    file: "module-1-15-dex-risk-stack.mp4",
    transcript: `A decentralised exchange looks different because the trade is coordinated by smart contracts rather than a traditional custodial platform, but the learner still needs to inspect the risk stack. A DEX can reduce some custody dependence, yet it introduces contract risk, interface risk, token-approval risk, oracle risk, liquidity risk and bridge risk. A wallet approval is especially important because the user may authorise a contract to move tokens later without realising how broad the permission is. Liquidity pools also create a different execution model from an order book. Large swaps can move the price against the trader, creating slippage and price impact. That is why a low-fee swap is not automatically a safer swap. The learner should verify the contract address, inspect the permission being requested, understand the network and size the transaction against available liquidity. The lesson is not that DEXs are bad. The lesson is that decentralised is a description of architecture, not a guarantee of safety, simplicity or fairness. Good judgment still matters.`,
  },
];

const statements = [];
for (const lesson of lessons) {
  const assetPath = new URL(`../public/media/faculty/${lesson.file}`, import.meta.url);
  statements.push(`INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT ${sql(lesson.assetId)},c.\`school_id\`,c.\`owner_id\`,${sql(`static:/media/faculty/${lesson.file}`)},${sql(lesson.file)},'video/mp4',${statSync(assetPath).size},'video','Neural-narrated visual lesson for ${lesson.id}.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`);
  statements.push(`UPDATE \`lessons\` SET \`lesson_type\`='video',\`primary_asset_id\`=${sql(lesson.assetId)},\`required_watch_percent\`=75,\`transcript\`=${sql(lesson.transcript)},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(lesson.id)} AND \`course_id\`=${sql(courseId)};`);
}

await writeFile(new URL("../drizzle/0071_crypto_mastery_module_1_13_15_premium.sql", import.meta.url), `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log("Wrote the Module 1.13 to 1.15 premium migration.");
