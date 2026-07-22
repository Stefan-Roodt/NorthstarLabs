import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const createdAt = 1785664800000;
const courseId = "cognizen-crypto-mastery-foundations-production";

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lessons = [
  {
    id: "cmf-module-1-9-lesson-01",
    assetId: "cmf-module-1-9-network-video",
    file: "module-1-9-ethereum-vs-ether.mp4",
    transcript: `Ethereum is a programmable world computer, not just another payment rail. That one distinction changes everything: the base chain tracks assets and rules, while its environment lets people run applications as programmable contracts.` +
`\n\nBitcoin taught people that money can move without a central bank. Ethereum extends the same decentralisation logic to digital computation. People build protocols where the chain verifies data and state transitions according to deterministic code.` +
`\n\nFor learners, this means you separate the network from the asset. Ethereum describes the platform and its security model. Ether is the native fuel and base settlement asset.\n\nKeeping this distinction sharp helps avoid wrong assumptions about custody, scalability and pricing.`
  },
  {
    id: "cmf-module-1-9-lesson-02",
    assetId: "cmf-module-1-9-contract-video",
    file: "module-1-9-smart-contracts-evm.mp4",
    transcript: `A smart contract is executable logic recorded on-chain, triggered when a valid transaction calls it. The Ethereum Virtual Machine is the execution environment that all nodes simulate, so everyone reaches the same outcome for valid input.` +
`\n\nEthereum uses account-based state, so you can think in terms of balances and storage updates rather than UTXO chains alone. Users control externally owned accounts through signatures. Contract accounts execute instructions when called and do not act on intent by themselves.` +
`\n\nThis model is powerful for building tokens, lending, exchanges and governance systems. The risk is that one insecure function, key mistake, or bad dependency can move real money. Good design documents assumptions, failure modes, and who can reverse or pause actions.`
  },
  {
    id: "cmf-module-1-9-lesson-03",
    assetId: "cmf-module-1-9-gas-video",
    file: "module-1-9-gas-staking-layer2.mp4",
    transcript: `Every Ethereum transaction consumes gas. Gas is not a tax; it is a unit of work. Simple transfers consume little computation. Complex DeFi paths, or long contract logic, consume more. Users set both a gas limit and price to reflect priority and risk.` +
`\n\nEthereum moved from Proof of Work to Proof of Stake, which changes how security is achieved and reduces resource intensity. Fees still remain because the network can be overloaded. Layer 2s can handle more action cheaply, but they introduce bridge and operational complexity.` +
`\n\nLearners who understand this model can assess trade-offs: base-layer security versus speed, transparency versus cost, and flexibility versus custody risk. That is how you keep experimentation safe and grounded in evidence.`
  },
];

const statements = [];
for (const lesson of lessons) {
  const assetPath = new URL(`../public/media/faculty/${lesson.file}`, import.meta.url);
  statements.push(
    `INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT ${sql(lesson.assetId)},c.\`school_id\`,c.\`owner_id\`,${sql(`static:/media/faculty/${lesson.file}`)},${sql(lesson.file)},'video/mp4',${statSync(assetPath).size},'video','Neural-narrated visual lesson for Module 1.9 of Crypto Mastery.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`
  );
  statements.push(
    `UPDATE \`lessons\` SET \`lesson_type\`='video',\`primary_asset_id\`=${sql(lesson.assetId)},\`required_watch_percent\`=75,\`transcript\`=${sql(lesson.transcript)},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(lesson.id)} AND \`course_id\`=${sql(courseId)};`
  );
}

await writeFile(
  new URL("../drizzle/0066_crypto_mastery_module_1_9_premium.sql", import.meta.url),
  `${statements.join("\n--> statement-breakpoint\n")}\n`,
  "utf8",
);
console.log("Wrote the Module 1.9 premium migration.");
