import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const createdAt = 1785567600000;
const courseId = "cognizen-crypto-mastery-foundations-production";

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lessons = [
  {
    id: "cmf-module-1-4-lesson-01",
    assetId: "cmf-module-1-4-definition-video",
    file: "module-1-4-define-cryptocurrency.mp4",
    transcript: `What is cryptocurrency without the buzzwords? Start with the question of function and governance, not a label.
So let us define the question carefully: what is being promised, by whom, and under what rule set?

Some projects call themselves a cryptocurrency because they use a blockchain-like ledger. Others use crypto-based mechanics for governance, access or settlement and never present that promise as money. Learners get confused if we skip the distinction between asset, ledger and rights.

The minimum practical definition has five parts. First, identify the unit or claim being tracked. Second, identify the ledger that tracks ownership and transfer. Third, identify who validates state changes and the rule of acceptance. Fourth, identify who controls key rights in custody and recovery pathways. Fifth, identify economic purpose: settlement, access, utility, governance or speculation.

If any of these five parts is missing or unknown, avoid a broad claim. A precise definition is not restrictive; it protects your decision quality. It also makes it easier to compare two offerings without hype.

Do not reduce this to “digital currency versus not”. Ask: what exactly is the project trying to optimise, and for whom, under what assumptions?`,
  },
  {
    id: "cmf-module-1-4-lesson-02",
    assetId: "cmf-module-1-4-spectrum-video",
    file: "module-1-4-decentralisation-spectrum.mp4",
    transcript: `Learners often hear one network described as fully decentralised, but real systems are layered.
Centralisation and decentralisation are a spectrum.
Let us map three likely blind spots.

First, validation. Does a broad set of independent actors observe and validate state transitions, or is one family of participants effectively dominant? Second, custody. Do users hold practical control over their own claims, or must they rely on intermediaries for routine actions? Third, governance. Who changes protocol rules, emergency responses and dispute pathways?

An honest architecture map uses a multi-dimensional score instead of a binary statement. You can have open participation in one layer and concentrated control in another. Both outcomes are acceptable in some contexts and dangerous in others.

For example, a protocol may have strong user access and many validators, yet still depend operationally on a small number of major infrastructure stacks. Another project may be governance-heavy but under-serve everyday users in recovery and key management.

The best practical habit: never reward “decentralised” as an emotional outcome. Reward explicit evidence across layers because learners need to match risk, not slogans.

The outcome is a decision framework. It reduces argument and improves practical planning.`,
  },
  {
    id: "cmf-module-1-4-lesson-03",
    assetId: "cmf-module-1-4-transaction-video",
    file: "module-1-4-transaction-flow.mp4",
    transcript: `Follow a cryptocurrency transaction from intent to finality. A protocol success path is built from events and constraints, not slogans. A transfer becomes a useful unit to reason about only when you separate authority steps.

Step one is authorisation. The signer proves control under the relevant key model. That is why backup discipline, key storage and device security matter first. Step two is propagation and validation. Nodes check format, funds, signatures, conflicts and policy gates. Some checks fail before the transfer reaches inclusion.

Step three is inclusion into a candidate ordered history. This gives a place in a shared sequence. Step four is added confirmation weight over time, which changes reversal risk under that protocol's assumptions.

Even when this works, operational risk remains. If the recipient address is wrong, if the user misunderstood a fee model, or if custody is custodial and compromised, the network remains correct while the outcome can still be costly.

The discipline you want for learners is simple: first describe what the protocol guarantees, then list what it does not guarantee. That is honest teaching and better outcomes.`,
  },
];

const statements = [];
for (const lesson of lessons) {
  const assetPath = new URL(`../public/media/faculty/${lesson.file}`, import.meta.url);
  statements.push(`INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT ${sql(lesson.assetId)},c.\`school_id\`,c.\`owner_id\`,${sql(`static:/media/faculty/${lesson.file}`)},${sql(lesson.file)},'video/mp4',${statSync(assetPath).size},'video','Neural-narrated visual lesson for Module 1.4 of Crypto Mastery.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`);
  statements.push(`UPDATE \`lessons\` SET \`lesson_type\`='video',\`primary_asset_id\`=${sql(lesson.assetId)},\`required_watch_percent\`=75,\`transcript\`=${sql(lesson.transcript)},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(lesson.id)} AND \`course_id\`=${sql(courseId)};`);
}

const guide = new URL("../public/media/course-resources/module-1-4-what-is-cryptocurrency-design-map.pdf", import.meta.url);
statements.push(`INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT 'cmf-module-1-4-design-map',c.\`school_id\`,c.\`owner_id\`,'static:/media/course-resources/module-1-4-what-is-cryptocurrency-design-map.pdf','Module 1.4 What Is Cryptocurrency Design Map.pdf','application/pdf',${statSync(guide).size},'document','Practical Module 1.4 map for definition, decentralisation scope and transaction flow.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`);
statements.push(`INSERT OR REPLACE INTO \`lesson_resources\` (\`id\`,\`lesson_id\`,\`asset_id\`,\`title\`,\`position\`) VALUES ('cmf-module-1-4-design-map-link','cmf-module-1-4-lesson-03','cmf-module-1-4-design-map','What Is Cryptocurrency Design Map',1);`);

await writeFile(new URL("../drizzle/0061_crypto_mastery_module_1_4_premium.sql", import.meta.url), `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log("Wrote the Module 1.4 premium media and design-map migration.");
