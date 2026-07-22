import { writeFile } from "node:fs/promises";

const courseId = "cognizen-crypto-mastery-foundations-production";
const createdAt = 1785297600000;
const sources = {
  fsca: "https://www.fsca.co.za/New-Financial-Service-Provider/",
  sars: "https://www.sars.gov.za/individuals/crypto-assets-tax/",
  fatf: "https://www.fatf-gafi.org/en/topics/virtual-assets.html",
  travelRule: "https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html",
  oecdCarf: "https://www.oecd.org/en/publications/international-standards-for-automatic-exchange-of-information-in-tax-matters_896d79d1-en/full-report/component-5.html",
  iosco: "https://www.iosco.org/news/pdf/IOSCONEWS712.pdf",
  cisaMfa: "https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/require-multifactor-authentication",
  ethereumScams: "https://ethereum.org/community/support/scams/",
  nistWallet: "https://csrc.nist.gov/glossary/term/wallet",
};

const experience = (eyebrow, title, intro, scenes, activity, takeaway) => ({ version: 1, eyebrow, title, intro, scenes, activity, takeaway });
const classify = (title, prompt, buckets, cards) => ({ kind: "classify", title, prompt, buckets, cards });
const branch = (title, prompt, options) => ({ kind: "branch", title, prompt, options });
const meter = (title, prompt, dimensions, thresholds) => ({ kind: "meter", title, prompt, dimensions, thresholds });

const modules = [
  {
    number: "1.29", position: 29, title: "Global Cryptocurrency Regulation and Taxation Overview",
    lessons: [
      {
        title: "Classify the asset, activity and provider",
        outcome: "Separate the legal treatment of a crypto asset from the rules governing an activity or service provider.",
        reference: `The FSCA states that South African crypto-asset service providers must be licensed, while IOSCO’s international recommendations focus on the activities and risks of intermediaries. [FSCA licensing](${sources.fsca}) - [IOSCO recommendations](${sources.iosco})`,
        experience: experience("Regulatory map", "The blockchain is global; obligations are local", "Analyse the same transaction through three legal lenses before assuming one label controls everything.", [
          { id: "asset", label: "Lens 1 - Asset", title: "What rights and economic function exist?", body: "A payment token, stablecoin, governance token and tokenised share can trigger different rules even when all use a blockchain.", metric: "Classification", tone: "blue" },
          { id: "activity", label: "Lens 2 - Activity", title: "What is the person actually doing?", body: "Trading, advice, custody, payments, lending, staking, fundraising and derivatives can each carry separate obligations.", metric: "Conduct", tone: "orange" },
          { id: "provider", label: "Lens 3 - Provider", title: "Who performs the regulated function?", body: "Exchange, broker, issuer, custodian and adviser labels matter less than the real service and jurisdiction served.", metric: "Accountability", tone: "red" },
          { id: "boundary", label: "Boundary", title: "A licence is not investment approval", body: "Authorisation can establish minimum conduct and supervision; it does not guarantee token quality, solvency or returns.", metric: "Protection limit", tone: "green" },
        ], classify("Which regulatory lens applies?", "Assign each question to the first lens it tests.", [
          { id: "asset", label: "Asset", description: "Rights and economic function" },
          { id: "activity", label: "Activity", description: "What is being done" },
          { id: "provider", label: "Provider", description: "Who offers the service" },
        ], [
          { id: "r1", text: "Does the token represent a claim on company shares?", bucketId: "asset", feedback: "Rights and promises shape the legal classification." },
          { id: "r2", text: "Is a person managing portfolios or merely publishing education?", bucketId: "activity", feedback: "The actual conduct can determine whether advice or management rules apply." },
          { id: "r3", text: "Is the exchange authorised to serve South African customers?", bucketId: "provider", feedback: "Verify the legal entity and permission through the regulator." },
          { id: "r4", text: "Does a platform hold customer private keys?", bucketId: "provider", feedback: "Custody creates provider responsibilities and counterparty exposure." },
        ]), "Never infer legal treatment from the word ‘crypto’. Identify the asset, activity, provider and jurisdiction."),
      },
      {
        title: "Recognise compliance and transfer controls",
        outcome: "Explain why KYC, AML monitoring, source-of-funds checks and travel-rule information may accompany crypto transfers.",
        reference: `FATF calls for licensing, customer due diligence, records and suspicious-transaction reporting by virtual-asset providers; its Travel Rule covers originator and beneficiary information. [FATF virtual assets](${sources.fatf}) - [2025 payment transparency update](${sources.travelRule})`,
        experience: experience("Transfer compliance desk", "Identity checks follow regulated services—not every wallet", "Trace how an exchange transfer can require information beyond the on-chain address.", [
          { id: "kyc", label: "Control 1 - KYC", title: "Identify the customer", body: "A regulated provider may request legal identity, residence, account purpose and supporting documents before enabling services.", metric: "Who", tone: "blue" },
          { id: "aml", label: "Control 2 - AML", title: "Understand activity and source of funds", body: "Monitoring may identify patterns, sanctions exposure or activity inconsistent with the customer profile.", metric: "Why", tone: "orange" },
          { id: "travel", label: "Control 3 - Travel Rule", title: "Carry originator and beneficiary information", body: "Provider-to-provider transfers can require structured identity information in addition to the public blockchain transaction.", metric: "Counterparties", tone: "red" },
          { id: "self", label: "Boundary - Self-custody", title: "No provider does not mean no law", body: "A self-custodial wallet may not perform KYC, but the user remains responsible for tax, sanctions, fraud and other applicable rules.", metric: "Personal duty", tone: "green" },
        ], branch("An exchange asks who controls a withdrawal address and why funds are being sent", "What is the most accurate interpretation?", [
          { id: "accused", label: "The customer has automatically been accused of a crime.", verdict: "Control overread", feedback: "The request can be routine risk-based due diligence or travel-rule compliance.", tone: "risk" },
          { id: "ignore", label: "Blockchain transfers are exempt, so false details are acceptable.", verdict: "Obligation ignored", feedback: "Regulated providers may be required to obtain accurate information.", tone: "caution" },
          { id: "verify", label: "Verify the request through the official platform and provide accurate information where lawfully required.", verdict: "Compliance understood", feedback: "The control is separate from the transaction’s technical validity.", tone: "good" },
        ]), "Compliance questions do not change the blockchain; they govern the regulated service connecting people to it."),
      },
      {
        title: "Build a defensible crypto tax record",
        outcome: "Identify common disposal and income questions, preserve cost-basis evidence and recognise when professional advice is needed.",
        reference: `SARS says normal tax rules apply to crypto assets and affected taxpayers must declare gains or losses; OECD CARF supports cross-border collection and exchange of crypto transaction information. [SARS crypto tax](${sources.sars}) - [OECD CARF](${sources.oecdCarf})`,
        experience: experience("Tax evidence lab", "No cash withdrawal does not mean no tax question", "Classify common events, then assemble the records needed to analyse them under the applicable rules.", [
          { id: "event", label: "Step 1 - Event", title: "Record sale, swap, spend, reward and protocol action", body: "Crypto-to-crypto exchange, payment for goods, staking reward or liquidity transaction may require analysis even without fiat cash-out.", metric: "What happened", tone: "blue" },
          { id: "value", label: "Step 2 - Value", title: "Capture reporting-currency value at the event time", body: "Use a reasonable, consistent source and retain the quote, exchange statement or calculation.", metric: "Measurement", tone: "orange" },
          { id: "basis", label: "Step 3 - Basis", title: "Connect disposed units to acquisition cost and fees", body: "The permitted identification or pooling method depends on jurisdiction; an exchange summary may omit other wallets and platforms.", metric: "Gain or loss", tone: "red" },
          { id: "evidence", label: "Step 4 - Evidence", title: "Keep hashes, addresses, statements and ownership records", body: "Export records before accounts close and document transfers between wallets you control without including private keys.", metric: "Defensibility", tone: "green" },
        ], meter("Rate record completeness", "This educational check does not determine anyone’s tax liability.", [
          { id: "events", label: "All platforms and wallets", lowLabel: "One exchange only", highLabel: "Complete inventory", weight: 1.3, initial: 30 },
          { id: "values", label: "Time-of-event values", lowLabel: "Missing", highLabel: "Consistent source", weight: 1.2, initial: 35 },
          { id: "basis", label: "Cost basis and fees", lowLabel: "Unlinked", highLabel: "Traceable", weight: 1.3, initial: 30 },
          { id: "purpose", label: "Transfer purpose", lowLabel: "Unknown", highLabel: "Documented", weight: 1, initial: 40 },
          { id: "complexity", label: "Professional escalation", lowLabel: "Complex events guessed", highLabel: "Advice sought where needed", weight: 1.2, initial: 35 },
        ], [
          { max: 39, label: "Tax position cannot be reconstructed", feedback: "Missing events, values or ownership evidence make reliable analysis difficult.", tone: "risk" },
          { max: 69, label: "Partial audit trail", feedback: "Core records exist, but gaps or complex protocol events need reconciliation.", tone: "caution" },
          { max: 100, label: "Defensible evidence set", feedback: "The activity can be analysed using traceable values, basis and ownership records.", tone: "good" },
        ]), "Tax treatment follows facts and local law—not the terminology used by a wallet or protocol."),
      },
    ],
    quiz: [
      ["Why is crypto not legally uniform?", ["Assets, activities and jurisdictions differ", "All blockchains are private", "Every token is a share", "Wallets choose the law"], 0, "Economic rights, conduct and location can trigger different rules.", "Legal classification"],
      ["What should a CASP licence establish?", ["Permission for specified services—not token safety or profit", "Guaranteed solvency", "Guaranteed returns", "Tax exemption"], 0, "Licensing creates conduct obligations but cannot remove market and business risk.", "Licensing limits"],
      ["What is KYC?", ["Customer identification and verification", "A consensus algorithm", "A token burn", "A trading strategy"], 0, "KYC helps regulated providers establish customer identity.", "KYC"],
      ["What does the Travel Rule concern?", ["Originator and beneficiary information for qualifying transfers", "Wallet recovery phrases", "Future prices", "Token voting"], 0, "It supports payment transparency and financial-crime controls.", "Travel Rule"],
      ["Can a crypto-to-crypto swap create a tax question?", ["Yes, depending on applicable law and facts", "Never", "Only after cash withdrawal", "Only on paper"], 0, "A swap can be analysed as a disposal even without fiat proceeds.", "Tax events"],
      ["What is cost basis used for?", ["Calculating gain or loss on disposal", "Finding a private key", "Setting block time", "Approving a wallet"], 0, "Basis connects acquisition cost and permitted expenses to disposed units.", "Cost basis"],
      ["Why document transfers between owned wallets?", ["To show ownership continuity and distinguish them from disposals", "To guarantee tax exemption", "To expose seeds", "To raise liquidity"], 0, "Evidence supports the factual character of the movement.", "Wallet transfers"],
      ["Why export records independently?", ["No single exchange contains every event or guarantees permanent access", "Exports remove tax", "Blockchain data is secret", "Fees cannot be recorded"], 0, "Complete reporting may require several providers, wallets and off-chain details.", "Record keeping"],
    ],
  },
  {
    number: "1.30", position: 30, title: "Creating a Personal Cryptocurrency Safety Plan",
    lessons: [
      {
        title: "Build the asset and custody inventory",
        outcome: "Document assets, locations, key control and wallet purpose without placing secrets in the inventory.",
        reference: `NIST defines a wallet as a tool for managing keys and addresses, supporting an inventory that records control arrangements rather than exposing the keys themselves. [NIST wallet definition](${sources.nistWallet})`,
        experience: experience("Safety-plan builder", "You cannot protect assets you cannot locate", "Create a useful inventory that remains harmless if the document itself is found.", [
          { id: "asset", label: "Field 1 - Asset", title: "Record asset, network and approximate importance", body: "Use enough detail to identify holdings and priority without including passwords, seeds or private keys.", metric: "What", tone: "blue" },
          { id: "location", label: "Field 2 - Location", title: "Name exchange, wallet or protocol", body: "Record official provider identity and device or wallet label so access is not dependent on memory.", metric: "Where", tone: "orange" },
          { id: "control", label: "Field 3 - Control", title: "Identify who controls the keys", body: "Custodian, self-custody, smart contract and multisig arrangements create different recovery and counterparty risks.", metric: "Who", tone: "red" },
          { id: "purpose", label: "Field 4 - Purpose", title: "Separate storage, transactions, applications and experiments", body: "Purpose-based wallets constrain the impact of a compromised dapp, device or account.", metric: "Why", tone: "green" },
        ], classify("Where does this holding belong?", "Assign each use to the safest functional compartment.", [
          { id: "storage", label: "Long-term storage", description: "Rarely moved, strongest controls" },
          { id: "transaction", label: "Transaction wallet", description: "Routine small transfers" },
          { id: "app", label: "Application wallet", description: "Known dapps with limited value" },
          { id: "experiment", label: "Experimental wallet", description: "Unknown, disposable exposure" },
        ], [
          { id: "i1", text: "Core savings that should never touch a dapp.", bucketId: "storage", feedback: "Keep the highest-value holdings away from routine interaction." },
          { id: "i2", text: "A small weekly payment balance.", bucketId: "transaction", feedback: "Routine use needs convenience with a deliberate balance ceiling." },
          { id: "i3", text: "A vetted lending protocol used with a capped amount.", bucketId: "app", feedback: "Application risk is separated from storage." },
          { id: "i4", text: "A first interaction with an unfamiliar test protocol.", bucketId: "experiment", feedback: "Use only value that can be lost completely." },
        ]), "The inventory identifies control and recovery paths; it must never become a single document that unlocks everything."),
      },
      {
        title: "Design recovery and emergency procedures",
        outcome: "Prepare tested steps for device loss, account takeover, seed exposure, malicious approvals and wrong transfers.",
        reference: `Ethereum recommends moving remaining funds after wallet compromise, revoking approvals and avoiding recovery-fee scams; CISA ranks phishing-resistant MFA above SMS. [Ethereum scam response](${sources.ethereumScams}) - [CISA MFA](${sources.cisaMfa})`,
        experience: experience("Emergency rehearsal", "A plan written during calm beats improvisation during loss", "Choose the authority that failed, then follow a verified response path.", [
          { id: "device", label: "Event 1 - Device lost", title: "Secure accounts and assess wallet exposure", body: "Lock the device, revoke sessions, protect the mobile number and restore only through trusted tools.", metric: "Access", tone: "blue" },
          { id: "account", label: "Event 2 - Exchange compromised", title: "Secure email, sessions, API keys and withdrawals", body: "Contact the provider through a recorded official channel, not a search advert or incoming message.", metric: "Custodian", tone: "orange" },
          { id: "seed", label: "Event 3 - Seed exposed", title: "Replace the cryptographic authority", body: "Generate a fresh wallet securely and move remaining assets. A password change cannot repair a copied seed.", metric: "Keys", tone: "red" },
          { id: "approval", label: "Event 4 - Approval signed", title: "Revoke, disconnect and isolate", body: "Persistent token permissions may allow further transfers even when the first transaction appears complete.", metric: "Contract", tone: "green" },
        ], branch("A recovery test restores a wallet, but the expected addresses do not appear", "What should happen before adding value?", [
          { id: "fund", label: "Fund it anyway because the seed words were accepted.", verdict: "Recovery unproven", feedback: "A valid seed can restore a different wallet if passphrase, path or phrase was wrong.", tone: "risk" },
          { id: "support", label: "Enter the seed into an online support form.", verdict: "Secret exposed", feedback: "No legitimate helper needs the recovery phrase.", tone: "caution" },
          { id: "diagnose", label: "Stop and diagnose phrase, passphrase, derivation and trusted software privately.", verdict: "Evidence required", feedback: "Only the appearance of expected addresses proves the intended recovery path.", tone: "good" },
        ]), "A backup is an assumption until a private recovery test reproduces the expected wallet."),
      },
      {
        title: "Plan succession, privacy and review",
        outcome: "Protect against incapacity, physical coercion, obsolete instructions and overcomplicated recovery systems.",
        reference: `Security guidance favours layered controls and strong authentication; a personal plan must preserve legitimate recovery without consolidating every secret. [CISA MFA guidance](${sources.cisaMfa})`,
        experience: experience("Continuity table", "Security includes the future owner and the future you", "Balance theft resistance against the risk that legitimate successors can never recover the assets.", [
          { id: "succession", label: "Continuity 1 - Succession", title: "Document existence, roles and lawful intent", body: "Estate professionals or trusted people need to know assets exist and where instructions are held—without receiving unrestricted current access.", metric: "Incapacity", tone: "blue" },
          { id: "separation", label: "Continuity 2 - Separation", title: "Keep inventory, instructions and secrets apart", body: "One stolen document should not reveal holdings, devices, backup locations and every credential.", metric: "Compartment", tone: "orange" },
          { id: "privacy", label: "Continuity 3 - Privacy", title: "Limit disclosure of value and backup location", body: "Public boasting, visible hardware and predictable storage can convert digital wealth into physical risk.", metric: "Operational security", tone: "red" },
          { id: "review", label: "Continuity 4 - Review", title: "Update after life, device and value changes", body: "Quarterly or six-monthly checks should reconcile inventory, sessions, approvals, backups, records and trusted contacts.", metric: "Freshness", tone: "green" },
        ], meter("Rate safety-plan maturity", "A higher score means the plan is usable and recoverable—not impossible to compromise.", [
          { id: "inventory", label: "Asset inventory", lowLabel: "Memory only", highLabel: "Current, no secrets", weight: 1.1, initial: 35 },
          { id: "recovery", label: "Recovery testing", lowLabel: "Never tested", highLabel: "Expected addresses restored", weight: 1.4, initial: 30 },
          { id: "emergency", label: "Emergency procedures", lowLabel: "Improvised", highLabel: "Rehearsed", weight: 1.2, initial: 35 },
          { id: "succession", label: "Incapacity plan", lowLabel: "Assets disappear", highLabel: "Controlled succession", weight: 1.2, initial: 30 },
          { id: "review", label: "Review schedule", lowLabel: "None", highLabel: "Dated and triggered", weight: 1, initial: 35 },
        ], [
          { max: 39, label: "Single points of failure", feedback: "The plan may fail through memory, untested recovery, lost contacts or consolidated secrets.", tone: "risk" },
          { max: 69, label: "Useful but fragile", feedback: "Core procedures exist, but recovery, succession or review needs practical testing.", tone: "caution" },
          { max: 100, label: "Layered and recoverable", feedback: "The system balances current security, emergency action and legitimate future access.", tone: "good" },
        ]), "The best safety plan is simple enough to follow, strong enough to resist theft and tested enough to trust."),
      },
    ],
    quiz: [
      ["What belongs in an asset inventory?", ["Asset, network, location, control and purpose", "Seed phrases", "Every password", "Private keys"], 0, "The inventory maps holdings and authority without exposing access secrets.", "Asset inventory"],
      ["Why identify who controls the keys?", ["Custodial and self-custodial risks require different controls", "It sets market price", "It avoids all regulation", "It creates a token"], 0, "Key control reveals the responsible party and recovery model.", "Custody mapping"],
      ["Why separate wallets by purpose?", ["To limit the impact of one compromise", "To increase returns", "To eliminate fees", "To hide taxes"], 0, "Compartmentalisation constrains application and device risk.", "Wallet separation"],
      ["What proves a recovery backup works?", ["Restoring the expected addresses privately", "Writing words down once", "Uploading a photograph", "Giving it to support"], 0, "A tested restore validates phrase, passphrase, path and software assumptions.", "Recovery testing"],
      ["What follows seed exposure?", ["Create a new secure wallet and move remaining assets", "Change only the interface password", "Wait for theft", "Post the phrase"], 0, "The old wallet’s signing authority can no longer be trusted.", "Seed response"],
      ["Why include incapacity and inheritance?", ["Overprotection can otherwise make assets permanently inaccessible", "It removes market risk", "It guarantees legal classification", "It reveals every secret"], 0, "Continuity requires controlled legitimate access after life events.", "Succession"],
      ["What is operational security?", ["Controlling information that could expose assets or people", "Only installing antivirus", "Trading with leverage", "Calculating market cap"], 0, "Privacy about value, devices and backups reduces targeting risk.", "Operational security"],
      ["When should the plan be reviewed?", ["On schedule and after material life, device or security changes", "Never after setup", "Only after theft", "Only when prices rise"], 0, "Plans decay as accounts, devices, people and holdings change.", "Security review"],
    ],
  },
  {
    number: "1.31", position: 31, title: "Foundations Completion and Capstone",
    lessons: [
      {
        title: "Connect the foundation knowledge",
        outcome: "Relate money, networks, keys, markets, tokenomics, risk and regulation as one decision system.",
        reference: `The programme’s final synthesis uses the primary sources embedded across Modules 1.1–1.30; completion means connecting the concepts, not merely recalling definitions.`,
        experience: experience("Foundation map", "Mastery is knowing which question comes next", "Sort the evidence needed before a learner buys, stores, transfers or evaluates a digital asset.", [
          { id: "system", label: "Domain 1 - System", title: "Network, consensus and transaction rules", body: "Ask what ledger changes, who validates them and which failure assumptions the protocol makes.", metric: "How it works", tone: "blue" },
          { id: "control", label: "Domain 2 - Control", title: "Keys, custody and permissions", body: "Identify who can sign, recover, freeze, upgrade or move the assets.", metric: "Who controls", tone: "orange" },
          { id: "economics", label: "Domain 3 - Economics", title: "Supply, liquidity, incentives and value capture", body: "Translate token price into valuation and test whether usage creates durable demand.", metric: "Why value", tone: "red" },
          { id: "responsibility", label: "Domain 4 - Responsibility", title: "Risk, fraud, regulation, tax and safety planning", body: "Decide what can go wrong, which rules apply and whether the consequences remain survivable.", metric: "Should I act", tone: "green" },
        ], classify("Which foundation domain answers first?", "Match each practical question to the starting domain.", [
          { id: "system", label: "System", description: "Network and transaction mechanics" },
          { id: "control", label: "Control", description: "Keys, custody and authority" },
          { id: "economics", label: "Economics", description: "Supply, liquidity and incentives" },
          { id: "responsibility", label: "Responsibility", description: "Risk, compliance and conduct" },
        ], [
          { id: "c1", text: "Why is this transaction still unconfirmed?", bucketId: "system", feedback: "Start with broadcast, fees, mempool and confirmation rules." },
          { id: "c2", text: "Can this smart contract move my tokens later?", bucketId: "control", feedback: "Inspect approvals and administrative authority." },
          { id: "c3", text: "What valuation does the target price imply after unlocks?", bucketId: "economics", feedback: "Use future supply, liquidity and demand evidence." },
          { id: "c4", text: "Can I afford total loss and what records must I keep?", bucketId: "responsibility", feedback: "Risk capacity and compliance precede optional upside." },
        ]), "A foundation is not a list of terms. It is a sequence of better questions."),
      },
      {
        title: "Complete the capstone decision",
        outcome: "Apply the full foundation framework to a realistic opportunity without giving or receiving investment advice.",
        reference: `The capstone combines the course’s source-backed controls into a single evidence-led decision rehearsal.`,
        experience: experience("Capstone scenario", "A polished opportunity arrives under time pressure", "A learner is offered a high-yield token through a licensed exchange, with an audit badge and a same-day deadline.", [
          { id: "claim", label: "Evidence 1 - Claim", title: "The token promises 18% yield", body: "Identify reward source, issuance, counterparty and smart-contract risk rather than accepting the annual percentage alone.", metric: "Economics", tone: "blue" },
          { id: "licence", label: "Evidence 2 - Provider", title: "The exchange is licensed", body: "Verify the entity and service scope, then retain separate analysis of the token, custody and liquidity.", metric: "Regulation", tone: "orange" },
          { id: "audit", label: "Evidence 3 - Technology", title: "A contract audit exists", body: "Check auditor, code version, scope, findings, upgrade powers and whether the deployed address matches.", metric: "Security", tone: "red" },
          { id: "deadline", label: "Evidence 4 - Behaviour", title: "The offer expires today", body: "Urgency is not an economic benefit. A decision that cannot survive verification should be declined.", metric: "Pressure", tone: "green" },
        ], branch("The learner cannot verify the reward source or admin powers before the deadline", "What is the foundation-level decision?", [
          { id: "small", label: "Invest a small amount so the opportunity is not missed.", verdict: "Unpriced unknowns accepted", feedback: "Small exposure limits loss but does not transform missing evidence into a sound decision.", tone: "risk" },
          { id: "licence", label: "Proceed because the exchange licence covers the token.", verdict: "Regulatory boundary ignored", feedback: "Provider authorisation does not approve each listed asset or promise.", tone: "caution" },
          { id: "decline", label: "Decline or pause; unresolved funding and control questions are decision-relevant facts.", verdict: "Evidence threshold protected", feedback: "Walking away preserves capital and decision quality when time prevents verification.", tone: "good" },
        ]), "The ability to say ‘not enough evidence’ is a mark of mastery, not a failure to participate."),
      },
      {
        title: "Create the next-stage learning plan",
        outcome: "Identify strengths, gaps and evidence needed before progressing to markets and applications.",
        reference: `The next stage should build on demonstrated foundation competence in security, transactions, economics and responsible participation.`,
        experience: experience("Progress compass", "Completion is a checkpoint, not an endpoint", "Use evidence from assessments and activities to choose the next learning priority.", [
          { id: "secure", label: "Readiness 1 - Operate safely", title: "Recover, verify and respond", body: "Demonstrate wallet separation, transaction checks, tested recovery and compromise procedures before increasing complexity.", metric: "Security", tone: "blue" },
          { id: "analyse", label: "Readiness 2 - Analyse claims", title: "Calculate valuation and trace incentives", body: "Use market cap, FDV, unlocks, liquidity and value capture to challenge promotional narratives.", metric: "Economics", tone: "orange" },
          { id: "govern", label: "Readiness 3 - Govern behaviour", title: "Apply position, record and participation rules", body: "A written policy should protect essential obligations and define when to pause or seek professional advice.", metric: "Responsibility", tone: "red" },
          { id: "advance", label: "Next - Markets and applications", title: "Progress only with the foundation intact", body: "Advanced market structure, portfolio analysis and DeFi amplify both capability and consequence.", metric: "Next pathway", tone: "green" },
        ], meter("Rate foundation readiness", "Use assessment evidence honestly. A lower score selects revision—it does not diminish the learner.", [
          { id: "transactions", label: "Transaction competence", lowLabel: "Needs guidance", highLabel: "Independent checks", weight: 1.2, initial: 50 },
          { id: "security", label: "Safety-plan competence", lowLabel: "Untested", highLabel: "Documented and rehearsed", weight: 1.4, initial: 45 },
          { id: "economics", label: "Valuation and tokenomics", lowLabel: "Unit-price focus", highLabel: "Evidence-led", weight: 1.2, initial: 50 },
          { id: "risk", label: "Risk and fraud judgment", lowLabel: "Pressure-led", highLabel: "Scenario-led", weight: 1.3, initial: 50 },
          { id: "records", label: "Compliance records", lowLabel: "Fragmented", highLabel: "Reconstructable", weight: 1, initial: 45 },
        ], [
          { max: 49, label: "Revise the critical foundations", feedback: "Return to the weakest security, transaction or responsibility modules before adding complexity.", tone: "risk" },
          { max: 74, label: "Foundation formed; targeted practice needed", feedback: "The learner can progress selectively while closing specific operational gaps.", tone: "caution" },
          { max: 100, label: "Ready for the next pathway", feedback: "The learner demonstrates a connected, evidence-led foundation and knows when to pause or escalate.", tone: "good" },
        ]), "The certificate marks demonstrated foundation learning. It never guarantees investment results or removes the need for continuing review."),
      },
    ],
    quiz: [
      ["What does foundation mastery primarily provide?", ["A method for asking and verifying the next question", "Guaranteed returns", "A professional licence", "A price forecast"], 0, "Connected reasoning matters more than isolated vocabulary.", "Foundation mastery"],
      ["Which domain asks who can sign, freeze or upgrade?", ["Control", "Price", "Marketing", "Block time only"], 0, "Keys, custody, approvals and administration determine practical authority.", "Control"],
      ["What should follow an unverified high-yield claim?", ["Trace funding, risk, recipients and control", "Assume yield is revenue", "Borrow to act quickly", "Ignore token issuance"], 0, "Yield is an output whose source and failure modes must be explained.", "Yield analysis"],
      ["Does a licensed exchange validate every listed token?", ["No", "Yes, always", "Only when price rises", "Only for stablecoins"], 0, "Provider licensing and asset quality are separate questions.", "Regulatory limits"],
      ["What does an audit badge not prove?", ["That the deployed contract and all admin powers are safe", "That some review occurred", "That a document exists", "That code has an address"], 0, "Scope, version, findings and live controls remain relevant.", "Audit boundaries"],
      ["What is the best response when material facts cannot be verified before a deadline?", ["Pause or decline", "Invest first", "Trust urgency", "Share a seed phrase"], 0, "A legitimate decision process protects its evidence threshold.", "Decision discipline"],
      ["What should guide the next learning stage?", ["Assessment evidence and operational gaps", "Social-media popularity", "Token price", "A guarantee"], 0, "Progression should target demonstrated weaknesses while preserving safety.", "Learning progression"],
      ["What does the completion certificate not guarantee?", ["Investment success or absence of future risk", "Course completion", "A learning milestone", "Eligibility to keep learning"], 0, "Education improves judgment but cannot determine market outcomes.", "Certificate boundary"],
    ],
  },
];

const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const lessonContent = (lesson) => `## Outcome\n\n${lesson.outcome}\n\n## Evidence base\n\n${lesson.reference}\n\n## How to use this lesson\n\nMove through each scene, complete the decision activity, then record the evidence behind your answer. This is education, not financial, legal or tax advice.`;
const statements = [`UPDATE \`courses\` SET \`description\`=${sql("Complete 31-module Crypto Mastery: Foundations production draft. Short interactive lessons, evidence-led decisions, explained assessments and a final capstone. Private CogniZen review draft; educational content, not financial advice.")},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(courseId)};`];

for (const courseModule of modules) {
  const sectionId = `cmf-module-${courseModule.number.replace(".", "-")}`;
  statements.push(`INSERT OR IGNORE INTO \`course_sections\` (\`id\`,\`course_id\`,\`title\`,\`position\`,\`created_at\`) SELECT ${sql(sectionId)},${sql(courseId)},${sql(`Module ${courseModule.number}: ${courseModule.title}`)},${courseModule.position},${createdAt} WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  courseModule.lessons.forEach((lesson, index) => {
    const lessonId = `${sectionId}-lesson-${String(index + 1).padStart(2, "0")}`;
    statements.push(`INSERT OR IGNORE INTO \`lessons\` (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`) SELECT ${sql(lessonId)},${sql(courseId)},${sql(sectionId)},${sql(lesson.title)},'interactive',${sql(lessonContent(lesson))},'markdown',6,0,0,0,'',${sql(JSON.stringify(lesson.experience))},${index + 1},${createdAt} WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  });
  const quizLessonId = `${sectionId}-lesson-04`;
  const quizId = `${sectionId}-quiz`;
  statements.push(`INSERT OR IGNORE INTO \`lessons\` (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`) SELECT ${sql(quizLessonId)},${sql(courseId)},${sql(sectionId)},'Check your understanding','quiz',${sql(`## Module ${courseModule.number} assessment\n\nAnswer all eight questions. Every answer returns an explanation and concept label. Reach 80% before continuing; attempts are unlimited.`)},'markdown',5,0,0,0,'','',4,${createdAt} WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  statements.push(`INSERT OR IGNORE INTO \`quizzes\` (\`id\`,\`lesson_id\`,\`title\`,\`passing_score\`,\`max_attempts\`) SELECT ${sql(quizId)},${sql(quizLessonId)},${sql(`Module ${courseModule.number}: ${courseModule.title}`)},80,0 WHERE EXISTS (SELECT 1 FROM \`lessons\` WHERE \`id\`=${sql(quizLessonId)});`);
  courseModule.quiz.forEach(([prompt, options, correctIndex, explanation, concept], index) => statements.push(`INSERT OR IGNORE INTO \`quiz_questions\` (\`id\`,\`quiz_id\`,\`prompt\`,\`options_json\`,\`correct_index\`,\`explanation\`,\`concept_label\`,\`position\`) SELECT ${sql(`${quizId}-q${String(index + 1).padStart(2, "0")}`)},${sql(quizId)},${sql(prompt)},${sql(JSON.stringify(options))},${correctIndex},${sql(explanation)},${sql(concept)},${index + 1} WHERE EXISTS (SELECT 1 FROM \`quizzes\` WHERE \`id\`=${sql(quizId)});`));
}

const target = new URL("../drizzle/0056_crypto_mastery_foundations_production_batch_8.sql", import.meta.url);
await writeFile(target, `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log(`Wrote ${modules.length} modules, ${modules.length * 4} lessons and ${modules.reduce((total, item) => total + item.quiz.length, 0)} scored questions.`);
