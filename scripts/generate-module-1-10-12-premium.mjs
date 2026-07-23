import { statSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const createdAt = 1784865600000;
const courseId = "cognizen-crypto-mastery-foundations-production";

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lessons = [
  {
    id: "cmf-module-1-10-lesson-01",
    assetId: "cmf-module-1-10-key-authority-video",
    file: "module-1-10-key-authority.mp4",
    transcript: `Start with authority, not with jargon. A blockchain wallet is easier to understand when we separate what is secret, what can be shared and what proves approval. The private key is the secret. It creates a valid signature and must stay private. The public key is the paired value used to verify signatures without revealing the secret. The address is the receiving label people share when they want assets sent to them. These three items are related, but they are not interchangeable. That is why beginners need a clean model before they start moving value. A signature proves that the holder of the private key authorised specific transaction data. It does not prove that the transaction is wise, safe or lawful. A receiving address can usually be shared openly, but the learner still has to check the correct network and asset before using it. The practical rule is simple: keep the secret secret, verify with the public key or address when needed, and sign only when the destination and permission are correct.`,
  },
  {
    id: "cmf-module-1-11-lesson-01",
    assetId: "cmf-module-1-11-wallet-anatomy-video",
    file: "module-1-11-wallet-anatomy.mp4",
    transcript: `A wallet does not store coins in the way a safe stores cash. The ledger holds the balance. The wallet manages the authority needed to interact with that balance. Once learners see that, many false assumptions disappear. Wallet software can derive keys and addresses, display balances, help construct transactions and sign those transactions with the correct key. That means the wallet is both a control surface and a user interface. It is not the asset itself. Different wallet types solve different problems. A custodial wallet reduces complexity but asks the learner to trust a service. A self-custodial wallet gives the learner more direct control but also places more responsibility on the learner. The best practice is to select the wallet by purpose rather than by brand hype. Ask who can sign, who can recover, who can observe the balance and what happens if the device is lost or compromised.`,
  },
  {
    id: "cmf-module-1-12-lesson-01",
    assetId: "cmf-module-1-12-hot-cold-wallets-video",
    file: "module-1-12-hot-cold-wallets.mp4",
    transcript: `Hot and cold wallets are not competing religions. They are tools for different exposure levels. A hot wallet stays connected to the internet or to routine online activity and is useful for spending, learning and experimentation. A cold wallet keeps signing authority away from ordinary network exposure and is better suited to reserves, larger balances and long-term storage. The trade-off is obvious: hot wallets are convenient, while cold wallets reduce one set of attack paths but increase the discipline required for recovery and verification. Neither model removes every risk. A hot wallet can be drained through phishing, malware or blind approval. A cold wallet can still fail through a bad backup, a stolen recovery phrase, a mistaken destination or a supply-chain problem. The practical answer is to separate roles. Keep only what you need for active use online. Keep reserve value in a colder setup. Test recovery before you need it. And whenever a transaction crosses from a hot environment into a cold one, verify the destination on the trusted display before you sign.`,
  },
];

const statements = [];
for (const lesson of lessons) {
  const assetPath = new URL(`../public/media/faculty/${lesson.file}`, import.meta.url);
  statements.push(`INSERT OR REPLACE INTO \`media_assets\` (\`id\`,\`school_id\`,\`owner_id\`,\`key\`,\`filename\`,\`content_type\`,\`size_bytes\`,\`kind\`,\`alt_text\`,\`created_at\`,\`updated_at\`) SELECT ${sql(lesson.assetId)},c.\`school_id\`,c.\`owner_id\`,${sql(`static:/media/faculty/${lesson.file}`)},${sql(lesson.file)},'video/mp4',${statSync(assetPath).size},'video','Neural-narrated visual lesson for ${lesson.id}.',${createdAt},${createdAt} FROM \`courses\` c WHERE c.\`id\`=${sql(courseId)};`);
  statements.push(`UPDATE \`lessons\` SET \`lesson_type\`='video',\`primary_asset_id\`=${sql(lesson.assetId)},\`required_watch_percent\`=75,\`transcript\`=${sql(lesson.transcript)},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(lesson.id)} AND \`course_id\`=${sql(courseId)};`);
}

await writeFile(new URL("../drizzle/0070_crypto_mastery_module_1_10_12_premium.sql", import.meta.url), `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log("Wrote the Module 1.10 to 1.12 premium migration.");
