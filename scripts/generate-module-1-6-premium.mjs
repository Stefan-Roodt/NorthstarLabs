import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const createdAt = 1785663000000;
const courseId = "cognizen-crypto-mastery-foundations-production";

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lessons = [
  {
    id: "cmf-module-1-6-lesson-01",
    assetId: "cmf-module-1-6-surfaces-video",
    file: "module-1-6-decentralisation-surfaces.mp4",
    transcript: `Decentralisation is a useful concept only when we can identify the control surfaces and their trade-offs.

A protocol can decentralise one layer and concentrate another, and both facts can be true at once. The first decision is to separate what learners need to decide: access control, consensus process, key management, governance updates, and infrastructure dependencies.

For each surface, ask three questions. Who can participate, who can influence outcomes, and who can recover when something fails? If one entity controls all three questions in a layer, that surface is effectively centralised even if marketing language disagrees.

Map the system this way: transaction validation, state maintenance, upgrade control, custody, and operational tooling. A strong design can be transparent on one layer and weaker on another. That does not make it good or bad by itself; it makes the risk profile explicit.

For learners, this avoids the single-story trap. They learn to score every claim against explicit control surfaces and the practical cost of being wrong.`
  },
  {
    id: "cmf-module-1-6-lesson-02",
    assetId: "cmf-module-1-6-roles-video",
    file: "module-1-6-validator-user-role.mp4",
    transcript: `Nodes, validators and users do different jobs, and mixing these roles confuses risk.

Nodes observe and propagate system state. They are not always the same as users. Validators may propose and finalise ordering, while users hold intentions and keys that express ownership claims. Governance participants can change protocol rules, and custodians may control practical access.

A robust learner model keeps responsibilities separate: 
- who submits a request,
- who checks validity,
- who reaches final agreement,
- who can amend the rules,
- and who can recover operations after fault.

When these roles are not separated, outages, coercion or censorship can create a hidden single point of failure. When they are clearly separated, the design usually becomes easier to evaluate, especially under stress.

Good design is not “all distributed.” It is deliberate role clarity and transparent assumptions.`
  },
  {
    id: "cmf-module-1-6-lesson-03",
    assetId: "cmf-module-1-6-purpose-video",
    file: "module-1-6-decentralise-for-purpose.mp4",
    transcript: `The best decentralisation question is practical: why is this layer spread and at what cost?

In some contexts, decentralising governance first creates resilience against unilateral change. In others, operational simplicity is the priority and a narrower control model is safer for users. Learners need a decision framework that starts from use case, not ideology.

Ask four things before choosing a more distributed architecture.
First, what failures are most likely?
Second, which control is most dangerous if captured?
Third, what does auditability require?
Fourth, what value is created if control is distributed versus reduced?

If decentralisation raises complexity beyond learner capability or increases cost without clear safety value, a controlled model may be the better result.

This is the most mature habit: make the decentralisation choice explicit, measured and reversible when evidence changes.`
  },
];

const statements = [];
for (const lesson of lessons) {
  const assetPath = new URL(`../public/media/faculty/${lesson.file}`, import.meta.url);
  statements.push(
    `INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT ${sql(lesson.assetId)},c.\`school_id\`,c.\`owner_id\`,${sql(`static:/media/faculty/${lesson.file}`)},${sql(lesson.file)},'video/mp4',${statSync(assetPath).size},'video','Neural-narrated visual lesson for Module 1.6 of Crypto Mastery.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`
  );
  statements.push(
    `UPDATE \`lessons\` SET \`lesson_type\`='video',\`primary_asset_id\`=${sql(lesson.assetId)},\`required_watch_percent\`=75,\`transcript\`=${sql(lesson.transcript)},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(lesson.id)} AND \`course_id\`=${sql(courseId)};`
  );
}

await writeFile(
  new URL("../drizzle/0063_crypto_mastery_module_1_6_premium.sql", import.meta.url),
  `${statements.join("\n--> statement-breakpoint\n")}\n`,
  "utf8",
);
console.log("Wrote the Module 1.6 premium migration.");
