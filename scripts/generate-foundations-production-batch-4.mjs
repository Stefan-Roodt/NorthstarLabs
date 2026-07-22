import { writeFile } from "node:fs/promises";

const courseId = "cognizen-crypto-mastery-foundations-production";
const createdAt = 1784952000000;
const sources = {
  bip39: "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki",
  bip32: "https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki",
  ethereumSecurity: "https://ethereum.org/security/",
  ethereumWallets: "https://ethereum.org/wallets/",
  fscaLicensing: "https://www.fsca.co.za/New-Financial-Service-Provider/",
  fscaDefi: "https://www.fsca.co.za/Regulatory%20Frameworks/Documents/Market%20Study%20-%20Decentralised%20Finance%20in%20South%20Africa.pdf",
  ioscoMarkets: "https://www.iosco.org/library/pubdocs/pdf/IOSCOPD755.pdf",
  investorOrders: "https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/executing-order",
  ethereumDex: "https://ethereum.org/developers/docs/design-and-ux/dex-design-best-practice/",
  ethereumGlossary: "https://ethereum.org/glossary/",
};

function experience(eyebrow, title, intro, scenes, activity, takeaway) {
  return { version: 1, eyebrow, title, intro, scenes, activity, takeaway };
}
function classify(title, prompt, buckets, cards) { return { kind: "classify", title, prompt, buckets, cards }; }
function branch(title, prompt, options) { return { kind: "branch", title, prompt, options }; }
function meter(title, prompt, dimensions, thresholds) { return { kind: "meter", title, prompt, dimensions, thresholds }; }

const modules = [
  {
    number: "1.13", position: 13, title: "Seed Phrases and Wallet Recovery",
    lessons: [
      {
        title: "Understand the recovery chain",
        outcome: "Distinguish a mnemonic phrase, derived seed, private keys, wallet password and device PIN.",
        reference: `BIP-39 specifies mnemonic words as a human-readable route to a binary seed; BIP-32 specifies deterministic key derivation. [BIP-39](${sources.bip39}) - [BIP-32](${sources.bip32})`,
        experience: experience("Recovery map", "One phrase can recreate an entire key tree", "Follow recovery data from wallet creation to addresses without confusing local access controls with blockchain authority.", [
          { id: "entropy", label: "Stage 1 - Randomness", title: "Secure software creates entropy", body: "The phrase must come from a trusted wallet's random generation process, never from words invented by the user or copied from a course.", metric: "Source", tone: "blue" },
          { id: "mnemonic", label: "Stage 2 - Mnemonic", title: "Words encode recovery material", body: "BIP-39 maps entropy and a checksum into an ordered word sequence. Order and spelling are part of the backup.", metric: "Master recovery", tone: "red" },
          { id: "seed", label: "Stage 3 - Seed", title: "The phrase and optional passphrase derive a seed", body: "Every passphrase can derive a valid but different wallet. Forgetting it can be as final as losing the phrase.", metric: "Deterministic", tone: "orange" },
          { id: "keys", label: "Stage 4 - Key tree", title: "Wallet software derives many keys and addresses", body: "A restored wallet may recreate accounts only when compatible derivation paths and network settings are used.", metric: "Many accounts", tone: "green" },
        ], classify("Which credential is this?", "Classify each item by what it controls most directly.", [
          { id: "phrase", label: "Recovery phrase", description: "Recreates wallet keys" },
          { id: "private", label: "Private key", description: "Controls one account or key" },
          { id: "password", label: "App password or PIN", description: "Locks a local interface or device" },
        ], [
          { id: "r1", text: "Twelve ordered words can recreate the wallet on another compatible device.", bucketId: "phrase", feedback: "The phrase is recovery authority, not an ordinary login." },
          { id: "r2", text: "A secret number signs for one derived account.", bucketId: "private", feedback: "That describes a private key." },
          { id: "r3", text: "A code unlocks the wallet app on this phone.", bucketId: "password", feedback: "A local PIN may protect the interface but cannot neutralise a copied phrase." },
          { id: "r4", text: "Changing this does not move assets to new blockchain keys.", bucketId: "password", feedback: "Changing a local password does not replace compromised recovery authority." },
        ]), "A recovery phrase is not a password reset tool. It is portable authority capable of recreating the keys."),
      },
      {
        title: "Design a backup that survives without leaking",
        outcome: "Evaluate backup methods against theft, fire, water, cloud exposure, coercion and accidental loss.",
        reference: `Ethereum's official security guidance says never to share a recovery phrase or keep it in screenshots that may sync to cloud services. [Ethereum security](${sources.ethereumSecurity})`,
        experience: experience("Backup threat room", "Availability and secrecy pull in opposite directions", "Compare four backup designs and find the failure that each one leaves open.", [
          { id: "photo", label: "Design 1 - Phone photo", title: "Convenient but remotely exposed", body: "Screenshots can sync, enter backups or be read by malware. Convenience creates a large hidden attack surface.", metric: "Reject", tone: "red" },
          { id: "single", label: "Design 2 - One paper copy", title: "Offline but fragile", body: "It reduces online exposure but creates one failure point for fire, water, disposal or discovery.", metric: "Fragile", tone: "orange" },
          { id: "separate", label: "Design 3 - Separated durable copies", title: "Resilient when locations and access are planned", body: "Copies should not sit beside the device, and each location must be protected from both people and environmental damage.", metric: "Balanced", tone: "green" },
          { id: "split", label: "Design 4 - Improvised split", title: "Complexity can destroy recovery", body: "Splitting words without a tested standard may make every piece insecure or the complete phrase impossible to reconstruct.", metric: "Complex", tone: "blue" },
        ], branch("A website says it must verify your phrase before activating the wallet", "What should the learner do?", [
          { id: "enter", label: "Enter it because the page uses HTTPS.", verdict: "Secret transmitted", feedback: "Encryption in transit does not make the recipient trustworthy. A legitimate support page does not need the phrase.", tone: "risk" },
          { id: "partial", label: "Enter only half of the words.", verdict: "Unsafe disclosure", feedback: "Partial disclosure weakens security and validates the scammer's approach.", tone: "caution" },
          { id: "leave", label: "Leave the page, verify the wallet independently and assume the request is malicious.", verdict: "Correct response", feedback: "Recovery words should be entered only into a trusted recovery flow the user intentionally initiated.", tone: "good" },
        ]), "The best backup is recoverable by the rightful holder and useless to everyone else. Test both claims."),
      },
      {
        title: "Run a recovery rehearsal before value depends on it",
        outcome: "Create and test a recovery, compromise and continuity plan without exposing real secrets.",
        reference: `Ethereum describes the seed phrase as the only recovery path for many self-custodial wallets and warns that transactions cannot simply be reversed. [Ethereum wallets](${sources.ethereumWallets})`,
        experience: experience("Recovery rehearsal", "A backup is a hypothesis until it has been tested", "Rehearse with a new low-value test wallet, then assess operational continuity.", [
          { id: "record", label: "Step 1 - Record", title: "Capture words accurately and privately", body: "Confirm order, spelling and legibility without photographing or sharing the phrase.", metric: "Accuracy", tone: "blue" },
          { id: "restore", label: "Step 2 - Restore", title: "Use a separate trusted environment", body: "Restore the test wallet and verify expected addresses or a small test balance before relying on the backup.", metric: "Evidence", tone: "green" },
          { id: "compromise", label: "Step 3 - Compromise", title: "Know how to migrate to new keys", body: "If the phrase may be copied, a new phrase and new wallet are required; changing the app PIN is insufficient.", metric: "Response", tone: "red" },
          { id: "continuity", label: "Step 4 - Continuity", title: "Plan for incapacity or death", body: "Instructions must allow legitimate recovery without revealing the secret prematurely or depending on one unavailable person.", metric: "Succession", tone: "orange" },
        ], meter("Audit the recovery plan", "Score only controls that have been tested without real recovery words entering this lesson.", [
          { id: "accuracy", label: "Phrase accuracy", lowLabel: "Unverified", highLabel: "Checked offline", weight: 1.2, initial: 30 },
          { id: "durability", label: "Backup durability", lowLabel: "One fragile copy", highLabel: "Separated resilient copies", weight: 1.3, initial: 25 },
          { id: "restore", label: "Recovery test", lowLabel: "Never tested", highLabel: "Test wallet restored", weight: 1.3, initial: 20 },
          { id: "compromise", label: "Compromise response", lowLabel: "No plan", highLabel: "New-key migration planned", weight: 1.1, initial: 20 },
          { id: "continuity", label: "Continuity", lowLabel: "One person only", highLabel: "Secure succession path", weight: 1, initial: 15 },
        ], [
          { max: 39, label: "Recovery not dependable", feedback: "Do not place meaningful value behind an untested or single-point backup.", tone: "risk" },
          { max: 69, label: "Partially prepared", feedback: "The phrase may survive, but restoration or continuity still depends on assumptions.", tone: "caution" },
          { max: 100, label: "Stronger recovery posture", feedback: "The plan balances confidentiality, restoration evidence and continuity.", tone: "good" },
        ]), "Test the process with disposable credentials. Never type a real recovery phrase into a course, chat or support form."),
      },
    ],
    quiz: [
      ["What does a seed phrase commonly enable?", ["Guaranteed profit", "Recreation of a deterministic wallet's keys", "Resetting every exchange password", "Reversal of blockchain transactions"], 1, "The phrase can derive the seed and wallet key hierarchy.", "Seed phrases"],
      ["Why must word order be preserved?", ["The sequence encodes recovery data", "It sets the market price", "It identifies the device colour", "Order is irrelevant"], 0, "The ordered words and checksum are part of the mnemonic encoding.", "Mnemonic integrity"],
      ["How does a wallet PIN differ from a seed phrase?", ["A PIN usually protects a local interface; the phrase recreates keys", "They are identical", "The PIN is public", "The phrase only changes screen settings"], 0, "Local access control is not blockchain recovery authority.", "Credential roles"],
      ["Which backup is unsafe?", ["A verified offline durable record", "A cloud-synced screenshot", "Separated protected copies", "A tested recovery process"], 1, "Cloud copies create remote exposure to the wallet's master recovery secret.", "Backup safety"],
      ["Should support staff ever request the seed phrase?", ["Yes, for account activation", "No legitimate support process needs it", "Only by social media", "Only half of it"], 1, "Anyone with the phrase can attempt to restore and drain the wallet.", "Phishing"],
      ["What does an optional BIP-39 passphrase do?", ["Creates a different derived wallet", "Checks exchange solvency", "Reduces every fee", "Publishes the seed"], 0, "Each passphrase derives a different seed; forgetting it can prevent recovery.", "Passphrases"],
      ["What is the correct response to suspected phrase exposure?", ["Change only the app PIN", "Move assets to a wallet generated from a new secure phrase", "Post a warning containing the phrase", "Wait for automatic reset"], 1, "Compromised recovery authority requires new keys and a verified migration.", "Compromise response"],
      ["Why test wallet recovery?", ["To confirm the backup and procedure work before they are essential", "To increase token price", "To share the phrase", "To remove all risk"], 0, "A controlled rehearsal turns an assumed backup into evidence.", "Recovery testing"],
    ],
  },
  {
    number: "1.14", position: 14, title: "Centralised Cryptocurrency Exchanges",
    lessons: [
      {
        title: "Trace money through an exchange",
        outcome: "Separate bank deposits, exchange internal balances, trades and blockchain withdrawals.",
        reference: `IOSCO treats centralised crypto platforms as service providers with custody, order-handling, conflict and operational risks. [IOSCO recommendations](${sources.ioscoMarkets})`,
        experience: experience("Exchange ledger", "Most exchange activity happens before a blockchain withdrawal", "Trace rand into an account, through an internal trade and out to a self-custodial wallet.", [
          { id: "fiat", label: "Step 1 - Deposit", title: "Money enters the exchange's banking system", body: "A bank transfer creates a customer claim after reconciliation; it is not a blockchain transaction.", metric: "Fiat rail", tone: "blue" },
          { id: "internal", label: "Step 2 - Balance", title: "The platform updates an internal ledger", body: "The displayed balance depends on the exchange's database, controls and solvency rather than a unique customer blockchain address.", metric: "Account claim", tone: "orange" },
          { id: "trade", label: "Step 3 - Trade", title: "Orders match within the venue", body: "Ownership records between customers can change internally without moving assets on-chain for every trade.", metric: "Venue execution", tone: "green" },
          { id: "withdraw", label: "Step 4 - Withdrawal", title: "The exchange authorises an on-chain transfer", body: "Only now do network choice, address verification, confirmation time and withdrawal controls become visible on-chain.", metric: "Blockchain settlement", tone: "red" },
        ], classify("Internal or on-chain?", "Classify the event by where the authoritative update occurs most directly.", [
          { id: "bank", label: "Banking rail", description: "Traditional-money movement" },
          { id: "internal", label: "Exchange ledger", description: "Customer account record" },
          { id: "chain", label: "Blockchain", description: "Network transaction" },
        ], [
          { id: "c1", text: "A bank transfer is reconciled to the customer's account.", bucketId: "bank", feedback: "The funding leg uses the banking system." },
          { id: "c2", text: "A matched trade changes two customer balances.", bucketId: "internal", feedback: "The exchange's internal ledger records the trade." },
          { id: "c3", text: "A withdrawal transaction receives network confirmations.", bucketId: "chain", feedback: "The transfer is now recorded by the selected blockchain." },
          { id: "c4", text: "The platform freezes an account pending a review.", bucketId: "internal", feedback: "The exchange controls access to its customer ledger and withdrawal process." },
        ]), "An exchange balance is a claim within a company's system until an authorised withdrawal settles to an address you control."),
      },
      {
        title: "Choose an order with eyes open",
        outcome: "Distinguish market, limit and stop orders while recognising spreads, partial fills and fast-market risk.",
        reference: `Investor.gov explains that execution price can differ from a quote and that limit orders trade execution certainty for price control. [Order execution](${sources.investorOrders})`,
        experience: experience("Order simulator", "Price certainty and execution certainty are different", "Watch the order book move while selecting an instruction that matches the learner's objective.", [
          { id: "book", label: "Market - Order book", title: "Bids and asks show available liquidity", body: "The best displayed prices cover only available quantities. A larger order may consume several price levels.", metric: "Depth", tone: "blue" },
          { id: "market", label: "Order - Market", title: "Prioritises immediate execution", body: "The final average price can move through the book, especially in a thin or volatile market.", metric: "Execution focus", tone: "orange" },
          { id: "limit", label: "Order - Limit", title: "Sets a maximum buy or minimum sell price", body: "The instruction may fill partially or not at all if the market never reaches the limit.", metric: "Price control", tone: "green" },
          { id: "stop", label: "Order - Stop", title: "Triggers another order after a condition", body: "A stop price is a trigger, not a guarantee of the final execution price during gaps or fast movement.", metric: "Conditional", tone: "red" },
        ], branch("A learner must not pay more than a defined maximum", "Which instruction best expresses that constraint?", [
          { id: "market", label: "A market order because it executes quickly.", verdict: "Price constraint missing", feedback: "A market order prioritises execution and may fill above the learner's maximum." , tone: "risk" },
          { id: "limit", label: "A buy limit order at the maximum acceptable price.", verdict: "Constraint encoded", feedback: "The order protects the price ceiling but may remain unfilled or partially filled.", tone: "good" },
          { id: "stop", label: "Any stop order because stop means guaranteed price.", verdict: "Trigger mistaken for guarantee", feedback: "A stop triggers an order; fast markets can produce different execution prices.", tone: "caution" },
        ]), "Choose an order by the constraint you care about, then accept the trade-off you created."),
      },
      {
        title: "Audit the exchange before funding it",
        outcome: "Evaluate licensing, custody, asset segregation, solvency evidence, security, fees and withdrawal reliability.",
        reference: `The FSCA states that South African crypto asset service providers must be licensed; IOSCO highlights custody, conflicts, operational risk and retail distribution. [FSCA licensing](${sources.fscaLicensing}) - [IOSCO](${sources.ioscoMarkets})`,
        experience: experience("Counterparty audit", "Convenience is a service; custody is an exposure", "Score a fictional platform using evidence available before the deposit.", [
          { id: "licence", label: "Check 1 - Authority", title: "Verify the legal entity and current authorisation", body: "A licence is an important check, but it does not guarantee solvency, good execution or zero loss.", metric: "Entity match", tone: "blue" },
          { id: "custody", label: "Check 2 - Assets", title: "Understand segregation and withdrawal control", body: "Ask who controls keys, how client assets are recorded and what happens during insolvency or suspension.", metric: "Custody", tone: "red" },
          { id: "evidence", label: "Check 3 - Solvency", title: "Treat proof-of-reserves as partial evidence", body: "Asset snapshots may not reveal liabilities, encumbrances, governance or continuing solvency.", metric: "Incomplete proof", tone: "orange" },
          { id: "operations", label: "Check 4 - Operations", title: "Test security, support and withdrawals", body: "Strong authentication, address controls, transparent fees and a small withdrawal test reveal practical reliability.", metric: "Operational proof", tone: "green" },
        ], meter("Rate exchange dependence", "Higher means stronger evidence and lower avoidable exposure, not a guarantee of safety.", [
          { id: "entity", label: "Entity and licence", lowLabel: "Unverified", highLabel: "Officially verified", weight: 1.2, initial: 30 },
          { id: "custody", label: "Custody disclosure", lowLabel: "Opaque", highLabel: "Clear segregation and terms", weight: 1.3, initial: 25 },
          { id: "solvency", label: "Financial evidence", lowLabel: "Marketing only", highLabel: "Independent broad evidence", weight: 1.3, initial: 20 },
          { id: "security", label: "Account controls", lowLabel: "Password only", highLabel: "Strong MFA and withdrawal controls", weight: 1.1, initial: 35 },
          { id: "withdraw", label: "Withdrawal evidence", lowLabel: "Untested", highLabel: "Small test completed", weight: 1.1, initial: 20 },
        ], [
          { max: 39, label: "High counterparty dependence", feedback: "The learner would be trusting an opaque platform with money or keys. Do not fund it on branding alone.", tone: "risk" },
          { max: 69, label: "Material unanswered questions", feedback: "Some safeguards exist, but custody, solvency or withdrawal evidence is incomplete.", tone: "caution" },
          { max: 100, label: "Better evidenced platform", feedback: "Key checks are stronger, though exchange failure, freezes and market risk remain possible.", tone: "good" },
        ]), "Use the exchange for a defined purpose and limit the value and time exposed to its custody."),
      },
    ],
    quiz: [
      ["What is a centralised cryptocurrency exchange?", ["A company-operated trading and custody platform", "A private key", "A blockchain consensus rule", "A recovery phrase"], 0, "A CEX operates customer accounts, markets and usually custody infrastructure.", "Centralised exchanges"],
      ["Where is a typical matched exchange trade recorded first?", ["Only in a bank", "On the exchange's internal ledger", "In the learner's hardware device", "By an oracle"], 1, "Many customer trades update the venue's internal records without an on-chain movement.", "Internal ledgers"],
      ["When does an exchange withdrawal become on-chain?", ["When the platform broadcasts a valid blockchain transaction", "When the login succeeds", "When a market order is entered", "When identity is checked"], 0, "The withdrawal reaches the network only after an authorised transaction is broadcast.", "Withdrawals"],
      ["What does a market order prioritise?", ["A guaranteed price", "Prompt execution against available liquidity", "No fees", "A future trigger"], 1, "Market orders seek execution but can fill across multiple prices.", "Market orders"],
      ["What is the main trade-off of a limit order?", ["Price control but possible non-execution", "Guaranteed immediate execution", "No spread", "No custody risk"], 0, "A limit protects the stated price boundary but may not fill.", "Limit orders"],
      ["What does an FSCA licence prove most directly?", ["The identified provider has regulatory authorisation", "The provider cannot fail", "Every asset is safe", "Returns are guaranteed"], 0, "Authorisation is important evidence, not a solvency or performance guarantee.", "Regulatory checks"],
      ["Why is proof-of-reserves incomplete?", ["It may not show all liabilities or continuing solvency", "Assets never matter", "Blockchains have no records", "It guarantees too much detail"], 0, "A reserve snapshot needs liability, control and governance context.", "Solvency"],
      ["What is a sensible first operational test?", ["Deposit everything", "Complete a small deposit, trade and withdrawal while checking total costs", "Disable MFA", "Share credentials with support"], 1, "A small end-to-end test limits exposure while validating the process.", "Exchange safety"],
    ],
  },
  {
    number: "1.15", position: 15, title: "Decentralised Cryptocurrency Exchanges",
    lessons: [
      {
        title: "Trace a wallet-to-wallet swap",
        outcome: "Explain how wallet connection, token approval, an AMM pool and network settlement fit together.",
        reference: `Ethereum describes DEXs as on-chain trading applications and defines liquidity pools as smart-contract funds used for exchange. [Ethereum DeFi glossary](${sources.ethereumGlossary})`,
        experience: experience("DEX swap map", "Self-custody removes the exchange account, not the need for trust analysis", "Trace one token swap while naming each contract permission and dependency.", [
          { id: "connect", label: "Step 1 - Connect", title: "The interface reads public wallet data", body: "Connection alone should not reveal the seed phrase, but the site can still present malicious transaction requests.", metric: "Interface", tone: "blue" },
          { id: "approve", label: "Step 2 - Approve", title: "A token contract grants spending permission", body: "The approval amount and spender address matter. Unlimited approval can outlive the current swap.", metric: "Delegated authority", tone: "red" },
          { id: "quote", label: "Step 3 - Quote", title: "The route estimates output from available liquidity", body: "Pool depth, fees, price impact and routing determine the expected and minimum received amounts.", metric: "Conditional price", tone: "orange" },
          { id: "settle", label: "Step 4 - Settle", title: "The wallet signs and contracts execute on-chain", body: "The swap may involve several contracts. Network fees can be paid even when execution reverts.", metric: "On-chain", tone: "green" },
        ], classify("Which DEX layer is responsible?", "Assign the observation to the most direct layer.", [
          { id: "interface", label: "Interface", description: "Presents route and request" },
          { id: "permission", label: "Token approval", description: "Delegates spending" },
          { id: "pool", label: "Liquidity pool", description: "Supplies swap inventory" },
          { id: "network", label: "Network", description: "Executes and settles" },
        ], [
          { id: "d1", text: "A fake website substitutes a malicious router address.", bucketId: "interface", feedback: "Front-end integrity is a separate trust boundary." },
          { id: "d2", text: "A contract can transfer up to the allowed token amount later.", bucketId: "permission", feedback: "Approval delegates authority to the spender contract." },
          { id: "d3", text: "A large order changes the pool ratio and worsens the quote.", bucketId: "pool", feedback: "Pool depth and AMM pricing drive price impact." },
          { id: "d4", text: "Validators include the signed transaction and charge gas.", bucketId: "network", feedback: "The network executes the contract call and records the result." },
        ]), "A DEX trade is a chain of permissions and contracts. Verify the entire route, not just the token symbols."),
      },
      {
        title: "Separate price impact, slippage and fees",
        outcome: "Interpret expected output, minimum received, pool price impact, protocol fees and network gas before signing.",
        reference: `Ethereum's DEX design guidance identifies expected output, minimum received, slippage, price impact, gas and other fees as distinct decision information. [DEX guidance](${sources.ethereumDex})`,
        experience: experience("Quote laboratory", "A good headline rate can hide a poor executable result", "Read a fictional quote from top to bottom before choosing whether to proceed.", [
          { id: "spot", label: "Line 1 - Reference", title: "The interface shows a current pool price", body: "It is a starting point, not a promise that the full order will execute at that rate.", metric: "Indicative", tone: "blue" },
          { id: "impact", label: "Line 2 - Price impact", title: "The learner's own order moves the pool", body: "Large size relative to liquidity changes the execution curve and average received amount.", metric: "Order-caused", tone: "red" },
          { id: "slippage", label: "Line 3 - Slippage tolerance", title: "The learner sets an acceptable change before execution", body: "Too tight can revert; too loose can permit a materially worse fill or increase extraction risk.", metric: "Execution boundary", tone: "orange" },
          { id: "cost", label: "Line 4 - Total cost", title: "Protocol and network fees are separate", body: "Gas can change with network demand and may be paid even if the swap fails.", metric: "All-in cost", tone: "green" },
        ], branch("A swap shows 12% price impact and an unfamiliar token contract", "What is the strongest response?", [
          { id: "raise", label: "Increase slippage until the swap succeeds.", verdict: "Warnings overridden", feedback: "Higher tolerance does not solve thin liquidity or verify the token." , tone: "risk" },
          { id: "small", label: "Proceed because the order is small in fiat terms.", verdict: "Evidence ignored", feedback: "A high percentage impact and unverified contract are material regardless of the headline amount.", tone: "caution" },
          { id: "stop", label: "Stop, verify the contract and reassess size, pool liquidity and route.", verdict: "Correct diagnostic response", feedback: "The warning may reveal an illiquid, incorrect or malicious market.", tone: "good" },
        ]), "Slippage tolerance is not a safety-off switch. It should express an acceptable boundary after the asset and route are verified."),
      },
      {
        title: "Audit the DEX risk stack",
        outcome: "Evaluate smart contracts, tokens, front ends, oracles, governance, bridges and user approvals independently.",
        reference: `The FSCA's South African DeFi study highlights smart-contract vulnerabilities, manipulation, fraud, platform failure and limited consumer protection. [FSCA DeFi study](${sources.fscaDefi})`,
        experience: experience("DEX risk stack", "Decentralised is a description to test, not a safety badge", "Score a fictional protocol across the layers that can fail independently.", [
          { id: "contract", label: "Layer 1 - Contracts", title: "Code and admin controls hold or route assets", body: "Audits help but do not prove absence of bugs, unsafe upgrades or economic exploits.", metric: "Code risk", tone: "red" },
          { id: "asset", label: "Layer 2 - Tokens", title: "Anyone may create a convincing symbol", body: "Contract address, transfer restrictions, minting powers and liquidity ownership require verification.", metric: "Asset risk", tone: "orange" },
          { id: "access", label: "Layer 3 - Access", title: "Front ends, wallets, oracles and bridges add dependencies", body: "A protocol can be on-chain while the route used by the learner remains centralised or compromised.", metric: "Infrastructure", tone: "blue" },
          { id: "user", label: "Layer 4 - User", title: "Signatures and approvals define the blast radius", body: "Separate wallets, limited approvals and test transactions contain harm when another layer fails.", metric: "Loss containment", tone: "green" },
        ], meter("Rate the DEX operating profile", "Use evidence from official contracts and documentation, not search ads or influencer links.", [
          { id: "contracts", label: "Contract assurance", lowLabel: "Unknown", highLabel: "Verified and constrained", weight: 1.3, initial: 25 },
          { id: "token", label: "Token verification", lowLabel: "Symbol only", highLabel: "Address and controls checked", weight: 1.2, initial: 20 },
          { id: "liquidity", label: "Liquidity quality", lowLabel: "Thin or removable", highLabel: "Deep and observable", weight: 1.2, initial: 30 },
          { id: "access", label: "Access route", lowLabel: "Ad link", highLabel: "Verified interface and network", weight: 1.1, initial: 35 },
          { id: "exposure", label: "Exposure containment", lowLabel: "Main wallet", highLabel: "Limited separate wallet", weight: 1.2, initial: 20 },
        ], [
          { max: 39, label: "Unacceptable uncertainty", feedback: "The route exposes funds to several unverified contracts or dependencies.", tone: "risk" },
          { max: 69, label: "Material residual risk", feedback: "Some evidence exists, but a weak layer can still dominate the outcome.", tone: "caution" },
          { max: 100, label: "More controlled interaction", feedback: "The learner has verified key layers and limited exposure, though DeFi risk remains.", tone: "good" },
        ]), "Self-custody gives the learner control over approval. It also makes the learner responsible for refusing unsafe requests."),
      },
    ],
    quiz: [
      ["What is a decentralised exchange?", ["A company bank account", "A blockchain application that facilitates trades through smart contracts", "A recovery phrase", "A guaranteed liquidity source"], 1, "A DEX coordinates trades through on-chain contracts rather than a conventional custodial account.", "DEX fundamentals"],
      ["What does token approval do?", ["Delegates transfer authority to a spender contract", "Verifies legal ownership", "Guarantees price", "Eliminates gas"], 0, "Approval permits a contract to transfer tokens within the authorised amount.", "Token approvals"],
      ["What is a liquidity pool?", ["Assets held in a smart contract for trading", "A bank licence", "A wallet password", "A fixed exchange rate"], 0, "AMMs use pooled assets as inventory for swaps.", "Liquidity pools"],
      ["What is price impact?", ["The order's effect on its own execution price", "A wallet PIN", "Every network fee", "A regulatory licence"], 0, "Orders large relative to liquidity move along the pool's pricing curve.", "Price impact"],
      ["What does slippage tolerance express?", ["An acceptable execution change before the transaction reverts", "Guaranteed profit", "The token's legality", "A seed backup"], 0, "It sets an execution boundary, not a safety guarantee.", "Slippage"],
      ["Why verify a token contract address?", ["Symbols and names can be copied by scam tokens", "Addresses determine tax automatically", "It removes contract risk", "It guarantees liquidity"], 0, "A contract address identifies the actual token program rather than its marketing label.", "Token verification"],
      ["Does connecting a wallet make every request safe?", ["Yes", "No, the interface can still request harmful approvals or transactions", "Only on weekends", "Only with low gas"], 1, "The learner must inspect each authorisation after connection.", "Wallet safety"],
      ["What does decentralised not mean?", ["Contract-based", "Permissionless access", "Automatically safe or free of central dependencies", "On-chain settlement"], 2, "Contracts, interfaces, governance, oracles and bridges can all introduce risk and concentration.", "Risk boundaries"],
    ],
  },
  {
    number: "1.16", position: 16, title: "Buying and Selling Cryptocurrency",
    lessons: [
      {
        title: "Calculate the true transaction cost",
        outcome: "Combine quoted price, spread, trading fee, funding cost, withdrawal fee and network cost.",
        reference: `Investor.gov explains that the spread and execution route affect the price actually received, rather than the displayed quote alone. [Order execution](${sources.investorOrders})`,
        experience: experience("True-cost lab", "The headline price is only one line of the receipt", "Build the all-in cost of a fictional purchase before deciding whether the channel is suitable.", [
          { id: "quote", label: "Cost 1 - Quote", title: "The displayed reference price", body: "A quote may show a last trade or indicative rate rather than the exact price available for the full order.", metric: "Reference", tone: "blue" },
          { id: "spread", label: "Cost 2 - Spread", title: "The ask exceeds the bid", body: "Immediate buying crosses to available asks; immediate selling crosses to bids. Thin markets can widen the gap.", metric: "Execution gap", tone: "orange" },
          { id: "fees", label: "Cost 3 - Platform", title: "Trading and funding charges", body: "Percentage fees, card costs, conversion charges and hidden mark-ups must be converted into one comparable amount.", metric: "Venue cost", tone: "red" },
          { id: "exit", label: "Cost 4 - Exit", title: "Withdrawal and network costs", body: "A cheap purchase can be expensive to move. Minimum withdrawals and supported networks affect practical ownership.", metric: "Delivered cost", tone: "green" },
        ], classify("Which cost changed?", "Classify each observation by its direct source.", [
          { id: "spread", label: "Spread or slippage", description: "Execution price difference" },
          { id: "platform", label: "Platform fee", description: "Venue or funding charge" },
          { id: "network", label: "Withdrawal or network", description: "Moving assets off platform" },
        ], [
          { id: "t1", text: "The average fill is above the displayed last price.", bucketId: "spread", feedback: "Available asks and order size affected execution." },
          { id: "t2", text: "The card provider adds 2.5% to fund the account.", bucketId: "platform", feedback: "Funding method cost belongs in the total purchase price." },
          { id: "t3", text: "The exchange charges a fixed amount to send the asset out.", bucketId: "network", feedback: "Withdrawal cost affects the value delivered to self-custody." },
          { id: "t4", text: "A thin market moves through several price levels.", bucketId: "spread", feedback: "Limited depth creates slippage across the order book." },
        ]), "Compare the amount delivered to the final destination, not the marketing fee or screen quote in isolation."),
      },
      {
        title: "Match the order to the purpose",
        outcome: "Choose market, limit or recurring execution based on urgency, price boundary and behavioural discipline.",
        reference: `Investor.gov distinguishes market execution from limit-price control and warns that quoted and executed prices can differ. [Investor.gov](${sources.investorOrders})`,
        experience: experience("Order-choice lab", "An order is an instruction, not a prediction", "Choose the instruction that accurately expresses a learner's constraint.", [
          { id: "market", label: "Purpose 1 - Immediate", title: "Market order", body: "Useful when execution matters more than an exact price and liquidity is sufficient; final price remains uncertain.", metric: "Speed", tone: "orange" },
          { id: "limit", label: "Purpose 2 - Boundary", title: "Limit order", body: "Useful when the learner refuses a worse price, while accepting partial fill or no fill.", metric: "Price control", tone: "green" },
          { id: "recurring", label: "Purpose 3 - Routine", title: "Recurring order", body: "Automates timing discipline but still incurs fees, custody exposure and market risk on every purchase.", metric: "Consistency", tone: "blue" },
          { id: "none", label: "Purpose 4 - Pause", title: "No order", body: "When the asset, platform, cost or reason is unclear, not trading is a valid operational decision.", metric: "Friction", tone: "red" },
        ], branch("A learner sees a sudden social-media price spike and has not verified the asset contract", "What is the strongest immediate choice?", [
          { id: "market", label: "Use a market order before missing out.", verdict: "Urgency driving risk", feedback: "The learner has not verified the asset, venue or executable cost.", tone: "risk" },
          { id: "limit", label: "Place any limit order because limits remove investment risk.", verdict: "Order control overread", feedback: "A limit controls price, not asset legitimacy or future value.", tone: "caution" },
          { id: "pause", label: "Pause, verify the asset and write down the reason, cost and loss tolerance.", verdict: "Decision quality protected", feedback: "Operational friction prevents urgency from bypassing essential checks.", tone: "good" },
        ]), "The best order cannot rescue an unverified asset or an emotional decision."),
      },
      {
        title: "Run the pre-trade and post-trade checklist",
        outcome: "Verify asset, platform, account security, order details, destination and records before and after execution.",
        reference: `The FSCA requires South African CASPs to obtain authorisation, while IOSCO identifies retail distribution, custody, conflicts and operational risk as core platform concerns. [FSCA](${sources.fscaLicensing}) - [IOSCO](${sources.ioscoMarkets})`,
        experience: experience("Transaction cockpit", "A safe transaction begins before Buy and ends after reconciliation", "Walk through five gates that stop avoidable errors without offering an investment recommendation.", [
          { id: "asset", label: "Gate 1 - Asset", title: "Verify identity, network and reason", body: "Confirm ticker, contract where relevant, intended exposure and what evidence would change the decision.", metric: "Correct asset", tone: "blue" },
          { id: "venue", label: "Gate 2 - Venue", title: "Verify entity, costs and custody", body: "Use official regulatory and provider records; do not trust a search advertisement or cloned login page.", metric: "Correct venue", tone: "orange" },
          { id: "order", label: "Gate 3 - Order", title: "Read amount, side, price instruction and total fee", body: "A decimal, currency or Buy/Sell error can be expensive and difficult to reverse.", metric: "Correct instruction", tone: "green" },
          { id: "delivery", label: "Gate 4 - Delivery", title: "Plan storage and test external transfers", body: "Verify destination and network, then use a small test before a significant withdrawal when practical.", metric: "Correct destination", tone: "red" },
          { id: "record", label: "Gate 5 - Record", title: "Preserve confirmations and cost basis", body: "Keep deposits, trades, fees, withdrawals and transaction identifiers for reconciliation and applicable reporting.", metric: "Audit trail", tone: "blue" },
        ], meter("Measure transaction readiness", "This checks process quality only. It does not judge whether the asset should be bought or sold.", [
          { id: "thesis", label: "Reason documented", lowLabel: "Impulse", highLabel: "Specific and reviewable", weight: 1.1, initial: 25 },
          { id: "asset", label: "Asset verification", lowLabel: "Ticker only", highLabel: "Network and identity checked", weight: 1.3, initial: 30 },
          { id: "venue", label: "Venue verification", lowLabel: "Ad link", highLabel: "Entity and costs checked", weight: 1.2, initial: 35 },
          { id: "order", label: "Order preview", lowLabel: "Skipped", highLabel: "Side, size and total reviewed", weight: 1.2, initial: 35 },
          { id: "records", label: "Reconciliation", lowLabel: "No records", highLabel: "Complete audit trail", weight: 1, initial: 20 },
        ], [
          { max: 39, label: "Do not transact yet", feedback: "Important identity, cost or control checks are missing.", tone: "risk" },
          { max: 69, label: "Process gaps remain", feedback: "Complete the weakest gate before exposing money or assets.", tone: "caution" },
          { max: 100, label: "Operationally prepared", feedback: "The process is documented and reviewable, though market and asset risk remain.", tone: "good" },
        ]), "A repeatable checklist slows down the moments in which errors, scams and emotion are most expensive."),
      },
    ],
    quiz: [
      ["What is the true purchase cost?", ["Only the displayed price", "Quoted price plus spread, platform, funding and delivery costs", "Only the network fee", "Only tax"], 1, "All-in cost includes execution and every charge required to deliver the asset.", "Transaction cost"],
      ["What is the bid-ask spread?", ["The gap between available buying and selling prices", "A wallet backup", "A tax return", "A recovery phrase"], 0, "The spread contributes to immediate execution cost.", "Spread"],
      ["When may a market order be suitable?", ["When immediate execution matters and price movement is accepted", "When an exact maximum price is mandatory", "When the asset is unverified", "When no liquidity exists"], 0, "A market order prioritises execution over price certainty.", "Market orders"],
      ["What is a limit order's key trade-off?", ["Price boundary in exchange for possible non-execution", "Guaranteed profit", "No fees", "No market risk"], 0, "The market may not reach the limit or may fill only part of the order.", "Limit orders"],
      ["Does a recurring purchase remove market risk?", ["Yes", "No, it automates timing but price and asset risk remain", "Only for Bitcoin", "Only on licensed venues"], 1, "Automation changes behaviour and timing, not the asset's risk.", "Recurring orders"],
      ["Why use a small withdrawal test?", ["To verify destination, network and process before exposing more", "To guarantee recovery", "To avoid all fees", "To change the asset"], 0, "A test can catch address, network or platform problems with limited exposure.", "Withdrawal safety"],
      ["What is the best response to urgency and an unverified asset?", ["Buy immediately", "Pause and complete verification", "Increase order size", "Disable security checks"], 1, "Urgency should not bypass asset, venue and cost checks.", "Decision discipline"],
      ["Why preserve trade and withdrawal records?", ["For reconciliation, cost tracking and applicable reporting", "To reveal private keys", "To guarantee returns", "To reset the blockchain"], 0, "A complete audit trail supports review and legal obligations.", "Record keeping"],
    ],
  },
];

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}
function lessonContent(lesson) {
  return `## Your outcome\n\n${lesson.outcome}\n\n## Source-backed reference notes\n\n${lesson.reference}\n\n## How to use this lesson\n\nPlay the guided story and complete the decision activity before opening the notes. Never enter real wallet credentials into a lesson. This education does not provide financial, legal or tax advice.`;
}

const statements = [`UPDATE \`courses\` SET
  \`description\`='Sixteen production-quality modules from the Digital Assets pathway. Every module uses guided stories, decision labs, source-backed notes and scored assessments; later source modules remain excluded until they pass the same standard.',
  \`updated_at\`=${createdAt}
WHERE \`id\`=${sql(courseId)};`];

for (const courseModule of modules) {
  const sectionId = `cmf-module-${courseModule.number.replace(".", "-")}`;
  statements.push(`INSERT OR IGNORE INTO \`course_sections\` (\`id\`,\`course_id\`,\`title\`,\`position\`,\`created_at\`)
SELECT ${sql(sectionId)},${sql(courseId)},${sql(`Module ${courseModule.number}: ${courseModule.title}`)},${courseModule.position},${createdAt}
WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  courseModule.lessons.forEach((lesson, index) => {
    const lessonId = `${sectionId}-lesson-${String(index + 1).padStart(2, "0")}`;
    statements.push(`INSERT OR IGNORE INTO \`lessons\`
      (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`)
    SELECT ${sql(lessonId)},${sql(courseId)},${sql(sectionId)},${sql(lesson.title)},'interactive',${sql(lessonContent(lesson))},'markdown',6,0,0,0,'',${sql(JSON.stringify(lesson.experience))},${index + 1},${createdAt}
    WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  });
  const quizLessonId = `${sectionId}-lesson-04`;
  const quizId = `${sectionId}-quiz`;
  statements.push(`INSERT OR IGNORE INTO \`lessons\`
    (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`)
  SELECT ${sql(quizLessonId)},${sql(courseId)},${sql(sectionId)},'Check your understanding','quiz',${sql(`## Module ${courseModule.number} assessment\n\nAnswer all eight questions. Every answer returns an explanation and concept label. Reach 80% before continuing; attempts are unlimited.`)},'markdown',5,0,0,0,'','',4,${createdAt}
  WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  statements.push(`INSERT OR IGNORE INTO \`quizzes\` (\`id\`,\`lesson_id\`,\`title\`,\`passing_score\`,\`max_attempts\`)
  SELECT ${sql(quizId)},${sql(quizLessonId)},${sql(`Module ${courseModule.number}: ${courseModule.title}`)},80,0
  WHERE EXISTS (SELECT 1 FROM \`lessons\` WHERE \`id\`=${sql(quizLessonId)});`);
  courseModule.quiz.forEach(([prompt, options, correctIndex, explanation, concept], index) => {
    statements.push(`INSERT OR IGNORE INTO \`quiz_questions\` (\`id\`,\`quiz_id\`,\`prompt\`,\`options_json\`,\`correct_index\`,\`explanation\`,\`concept_label\`,\`position\`)
    SELECT ${sql(`${quizId}-q${String(index + 1).padStart(2, "0")}`)},${sql(quizId)},${sql(prompt)},${sql(JSON.stringify(options))},${correctIndex},${sql(explanation)},${sql(concept)},${index + 1}
    WHERE EXISTS (SELECT 1 FROM \`quizzes\` WHERE \`id\`=${sql(quizId)});`);
  });
}

const target = new URL("../drizzle/0052_crypto_mastery_foundations_production_batch_4.sql", import.meta.url);
await writeFile(target, `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log(`Wrote ${modules.length} modules, ${modules.length * 4} lessons and ${modules.reduce((total, item) => total + item.quiz.length, 0)} scored questions.`);
