import { writeFile } from "node:fs/promises";

const courseId = "cognizen-crypto-mastery-foundations-production";
const createdAt = 1784772000000;

const sources = {
  sarbPayments: "https://www.resbank.co.za/en/home/what-we-do/payments-and-settlements",
  sarbMandate: "https://www.resbank.co.za/en/home/about-us",
  boeMoney: "https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-in-the-modern-economy-an-introduction",
  boeCreation: "https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy",
  bitcoinPaper: "https://bitcoin.org/bitcoin.pdf",
  nistBlockchain: "https://doi.org/10.6028/NIST.IR.8202",
};

function scenes(eyebrow, title, intro, items, activity, takeaway) {
  return { version: 1, eyebrow, title, intro, scenes: items, activity, takeaway };
}

function classify(title, prompt, buckets, cards) {
  return { kind: "classify", title, prompt, buckets, cards };
}

function branch(title, prompt, options) {
  return { kind: "branch", title, prompt, options };
}

function meter(title, prompt, dimensions, thresholds) {
  return { kind: "meter", title, prompt, dimensions, thresholds };
}

const modules = [
  {
    number: "1.1",
    title: "Introduction to Money and Digital Assets",
    lessons: [
      {
        title: "The three jobs of money",
        outcome: "Distinguish a medium of exchange, a unit of account and a store of value in real situations.",
        reference: `The Bank of England explains money's functions and modern forms; the SARB explains the payment system that moves rand between institutions. [Bank of England](${sources.boeMoney}) · [SARB](${sources.sarbPayments})`,
        experience: scenes("Money lab", "Money is a job, not just an object", "Follow one salary payment through the three functions of money, then classify what each example actually demonstrates.", [
          { id: "earn", label: "Scene 1 · Exchange", title: "Work becomes spendable value", body: "A salary lets its recipient exchange labour for groceries without finding a shop that wants the same labour in return.", metric: "Medium of exchange", tone: "blue" },
          { id: "compare", label: "Scene 2 · Compare", title: "Prices share one language", body: "Rent, transport and food can be compared and budgeted because each is expressed in rand.", metric: "Unit of account", tone: "orange" },
          { id: "save", label: "Scene 3 · Delay", title: "Value moves through time", body: "Part of the salary is kept for next month. Inflation may reduce what it can buy, so storage is useful but imperfect.", metric: "Store of value", tone: "green" },
          { id: "trust", label: "Scene 4 · Trust", title: "The system must remain accepted", body: "Money works because people expect others to recognise it, payment rails to settle it and institutions to preserve the system.", metric: "Shared confidence", tone: "red" },
        ], classify("Name the job being performed", "Classify the direct function shown. Some objects can perform more than one job, but each card has one immediate use.", [
          { id: "exchange", label: "Medium of exchange", description: "Used to settle a purchase or debt" },
          { id: "account", label: "Unit of account", description: "Used to quote or compare value" },
          { id: "store", label: "Store of value", description: "Used to carry purchasing power forward" },
        ], [
          { id: "m1", text: "A café lists coffee at R38.", bucketId: "account", feedback: "The price uses rand as a common measuring unit." },
          { id: "m2", text: "A customer pays the café by card.", bucketId: "exchange", feedback: "The payment transfers value to settle the purchase." },
          { id: "m3", text: "A household keeps an emergency reserve for next month.", bucketId: "store", feedback: "The reserve is intended to carry purchasing power through time." },
          { id: "m4", text: "Two laptops are compared at R12,000 and R18,000.", bucketId: "account", feedback: "A shared unit makes unlike products comparable." },
        ]), "Do not ask only what money is made from. Ask which monetary job it performs, how reliably it performs it and who maintains the rules."),
      },
      {
        title: "Your bank balance is digital—but not a cryptoasset",
        outcome: "Explain the difference between a commercial-bank deposit, central-bank money and a cryptoasset record.",
        reference: `The Bank of England describes bank deposits as the dominant form of modern money and explains how lending creates deposits. [Money creation in the modern economy](${sources.boeCreation})`,
        experience: scenes("Ledger comparison", "Three digital balances, three different promises", "Digital does not mean decentralised. Compare who records the balance, who can reverse it and what gives it credibility.", [
          { id: "deposit", label: "Record 1 · Bank deposit", title: "A claim recorded by a commercial bank", body: "The bank maintains the account ledger and participates in regulated payment and settlement systems.", metric: "Institution-managed", tone: "blue" },
          { id: "reserve", label: "Record 2 · Central-bank money", title: "Settlement money for eligible institutions", body: "Central-bank reserves settle obligations between participating financial institutions; notes and coin are central-bank liabilities available to the public.", metric: "Central-bank issued", tone: "green" },
          { id: "crypto", label: "Record 3 · Cryptoasset", title: "A network applies protocol rules", body: "A cryptoasset ledger may be replicated across nodes and updated under consensus rules rather than by one account provider.", metric: "Protocol-governed", tone: "orange" },
          { id: "tradeoff", label: "Record 4 · Trade-off", title: "Different trust, different failure modes", body: "Regulation, custody, reversibility, access and operational risk differ. No architecture removes the need to evaluate trust.", metric: "Trust moves", tone: "red" },
        ], branch("A transfer appears to be wrong", "A learner sends value using three systems. Which statement is most accurate?", [
          { id: "same", label: "All digital balances are technically the same because no cash moved.", verdict: "Category error", feedback: "The records may all be digital, but the issuer, ledger operator, legal claim and reversal process differ.", tone: "risk" },
          { id: "crypto-trustless", label: "The cryptoasset needs no trust because software is involved.", verdict: "Trust was hidden", feedback: "Users still rely on software, keys, consensus, infrastructure and governance. Trust is redistributed, not eliminated.", tone: "caution" },
          { id: "compare", label: "Compare the ledger authority, legal claim, custody and reversal rules for each system.", verdict: "Correct analytical frame", feedback: "This identifies the actual promises and failure modes instead of grouping every digital record together.", tone: "good" },
        ]), "Digital is a format. The important questions are who maintains the record, what claim the holder has and how the system resolves errors."),
      },
      {
        title: "Digital scarcity without the hype",
        outcome: "Explain why verifiable scarcity can matter without treating scarcity alone as proof of value.",
        reference: `NIST describes distributed, tamper-evident ledgers and their use in cryptocurrency systems. [NISTIR 8202](${sources.nistBlockchain})`,
        experience: scenes("Scarcity simulator", "Scarce is not the same as valuable", "Trace the conditions required for a digital unit to resist duplicate spending, then test a value claim.", [
          { id: "copy", label: "Problem 1 · Copying", title: "Digital information is easy to duplicate", body: "A file can be copied perfectly. A money system must prevent one unit from being validly spent twice.", metric: "Double-spend problem", tone: "red" },
          { id: "ledger", label: "Mechanism 2 · Ledger", title: "The system agrees which transfer is valid", body: "A shared history and validation rules let participants reject conflicting attempts to spend the same unit.", metric: "State agreement", tone: "blue" },
          { id: "supply", label: "Rule 3 · Supply", title: "Issuance can be constrained by protocol", body: "A transparent supply rule can make issuance auditable, but users must still assess whether the rule is credible and durable.", metric: "Verifiable rule", tone: "green" },
          { id: "demand", label: "Reality 4 · Demand", title: "Scarcity cannot create usefulness", body: "A scarce asset with no demand, utility, credible ownership or social acceptance may still have little value.", metric: "Demand still required", tone: "orange" },
        ], meter("Test a digital-asset value claim", "Rate the fictional asset. The confidence score reflects evidence quality—not a price forecast.", [
          { id: "supply", label: "Supply rule credibility", lowLabel: "Mutable or hidden", highLabel: "Transparent and durable", weight: 1.1, initial: 45 },
          { id: "ownership", label: "Ownership verification", lowLabel: "Easy to duplicate", highLabel: "Independently verifiable", weight: 1.1, initial: 55 },
          { id: "demand", label: "Sustained demand", lowLabel: "Promotion only", highLabel: "Repeated real use", weight: 1.4, initial: 20 },
          { id: "security", label: "Operational security", lowLabel: "Unproven", highLabel: "Resilient under attack", weight: 1.2, initial: 35 },
        ], [
          { max: 39, label: "Scarcity claim only", feedback: "The asset may be technically limited, but there is not enough evidence of durable demand, ownership integrity or security.", tone: "risk" },
          { max: 69, label: "Promising but incomplete", feedback: "Some conditions are credible, while important evidence remains provisional. State the limitations clearly.", tone: "caution" },
          { max: 100, label: "Stronger evidence—not certainty", feedback: "Several independent conditions support the claim. Value and future price remain uncertain and require continued review.", tone: "good" },
        ]), "Scarcity is one input. A defensible value claim also needs credible ownership, demand, security and rules that survive pressure."),
      },
    ],
    quiz: [
      ["Which example uses money mainly as a unit of account?", ["Paying a taxi fare", "Listing two houses at different rand prices", "Keeping cash for an emergency", "Sending a bank transfer"], 1, "A unit of account is the common measure used to quote and compare value.", "Functions of money"],
      ["Why does barter become difficult at scale?", ["Goods cannot be valuable", "Both parties must want each other's offering at the same time", "Prices are always fixed", "Barter requires a central bank"], 1, "Barter depends on a coincidence of wants; money separates selling from buying.", "Functions of money"],
      ["What best describes a commercial-bank deposit?", ["A unique banknote stored for the customer", "A digital account record and claim maintained by a bank", "A decentralised cryptoasset", "A central-bank reserve held directly by every consumer"], 1, "The account is a bank-maintained digital record; it is not the same object as cash or a cryptoasset.", "Forms of money"],
      ["What changes when a payment moves from cash to a bank transfer?", ["Money stops being money", "The record and settlement mechanism change", "Trust disappears", "The value must increase"], 1, "The payment uses institutional ledgers and settlement rails rather than physical notes.", "Payment systems"],
      ["What problem must a digital money system solve?", ["Every file must be public", "The same valid unit must not be spendable twice", "All transactions must be free", "Prices must never change"], 1, "Preventing duplicate valid spending is central to digital scarcity.", "Digital scarcity"],
      ["Does verifiable scarcity guarantee market value?", ["Yes, scarcity is sufficient", "Only when supply is exactly 21 million", "No, demand and other evidence still matter", "Yes, if the asset uses cryptography"], 2, "Scarcity can support a value thesis but cannot create demand, usefulness or security by itself.", "Digital scarcity"],
      ["Which question best reveals where trust sits?", ["Is the interface attractive?", "Who records, validates, custodies and can reverse the transaction?", "How many followers does it have?", "Did its price rise yesterday?"], 1, "Authority, validation, custody and reversal rules reveal the system's trust model.", "Trust models"],
      ["Which conclusion is most defensible?", ["Cryptoassets eliminate trust", "All digital money is decentralised", "Technology redistributes trust and changes failure modes", "Bank deposits and cryptoassets are legally identical"], 2, "The technology changes where users place trust; it does not abolish reliance on people, rules and infrastructure.", "Trust models"],
    ],
  },
  {
    number: "1.2",
    title: "The Evolution of Money",
    lessons: [
      {
        title: "From barter to digital ledgers",
        outcome: "Explain monetary evolution as a sequence of solutions and trade-offs rather than a march toward one perfect form.",
        reference: `The Bank of England's introduction traces modern forms of money and the trust supporting them. [Money in the modern economy](${sources.boeMoney})`,
        experience: scenes("Timeline", "Every form of money solves one problem and creates another", "Move through five monetary forms and focus on the coordination problem each one addresses.", [
          { id: "barter", label: "Stage 1 · Barter", title: "Value is exchanged directly", body: "Useful in simple cases, but trade fails when wants, timing, divisibility or valuation do not align.", metric: "Coordination cost", tone: "red" },
          { id: "commodity", label: "Stage 2 · Commodity", title: "A widely desired good becomes an intermediary", body: "Scarcity and usefulness help, while storage, quality and transport remain difficult.", metric: "Shared acceptance", tone: "orange" },
          { id: "coin", label: "Stage 3 · Coin", title: "Standardisation reduces verification effort", body: "Recognised weights and markings improve exchange, but the issuer's integrity becomes important.", metric: "Standard unit", tone: "blue" },
          { id: "paper", label: "Stage 4 · Paper and deposits", title: "Claims become easier to move than metal", body: "Portability improves, while holders rely more directly on issuers, banks and legal systems.", metric: "Institutional trust", tone: "green" },
          { id: "digital", label: "Stage 5 · Digital ledgers", title: "Records move value at network speed", body: "Scale and programmability improve, while cyber, access, governance and concentration risks become central.", metric: "Networked money", tone: "blue" },
        ], branch("Choose the next monetary tool", "A trading community needs to pay across distance, divide value precisely and verify settlement. Which response is strongest?", [
          { id: "perfect", label: "Adopt the newest technology because newer money is automatically better.", verdict: "Technology determinism", feedback: "A new form may improve some attributes while weakening inclusion, privacy, resilience or governance.", tone: "risk" },
          { id: "reject", label: "Keep the current form because changing money always destroys trust.", verdict: "Trade-offs ignored", feedback: "Trust can also erode when the existing form no longer serves the community's needs.", tone: "caution" },
          { id: "criteria", label: "Compare portability, divisibility, verification, acceptance and failure modes.", verdict: "Evidence-led selection", feedback: "This evaluates the needs and trade-offs without assuming one form is universally superior.", tone: "good" },
        ]), "Monetary evolution is not replacement by destiny. It is repeated redesign around trust, coordination, technology and power."),
      },
      {
        title: "Debasement, inflation and the trust boundary",
        outcome: "Separate a change in money's physical or digital form from a change in its purchasing power or governance.",
        reference: `The SARB states that its constitutional mandate is to protect the value of the currency in the interest of balanced and sustainable growth. [SARB mandate](${sources.sarbMandate})`,
        experience: scenes("Trust boundary", "The unit can look unchanged while its meaning changes", "Examine how supply, governance and public confidence affect money without confusing every price movement with the same cause.", [
          { id: "standard", label: "Signal 1 · Standard", title: "A unit needs a stable definition", body: "Coins, notes and account balances depend on rules that say what counts as a valid unit.", metric: "Integrity", tone: "blue" },
          { id: "supply", label: "Signal 2 · Supply", title: "Issuance changes the monetary environment", body: "Supply is one factor among production, demand, credit, expectations and shocks that can affect purchasing power.", metric: "One causal input", tone: "orange" },
          { id: "prices", label: "Signal 3 · Prices", title: "Purchasing power is observed across a basket", body: "One product becoming expensive is not the same evidence as a broad and sustained change in the general price level.", metric: "Measure carefully", tone: "green" },
          { id: "governance", label: "Signal 4 · Governance", title: "Rules need credible stewardship", body: "Whether rules are institutional or protocol-based, participants evaluate who can change them and under what constraints.", metric: "Credibility", tone: "red" },
        ], classify("Classify the claim before accepting it", "Place each observation in the category it directly supports.", [
          { id: "form", label: "Form or payment technology", description: "How the unit is represented or moved" },
          { id: "purchasing", label: "Purchasing-power evidence", description: "What the unit buys across time" },
          { id: "governance", label: "Governance evidence", description: "Who can alter or enforce the rules" },
        ], [
          { id: "e1", text: "A retailer begins accepting contactless payments.", bucketId: "form", feedback: "The payment interface changed; this alone says nothing about purchasing power." },
          { id: "e2", text: "A broad price index rises persistently across many categories.", bucketId: "purchasing", feedback: "This is evidence about the currency's purchasing power across a basket." },
          { id: "e3", text: "A protocol vote changes the future issuance schedule.", bucketId: "governance", feedback: "The observation concerns who can change the system's supply rules." },
          { id: "e4", text: "A bank replaces paper statements with an app.", bucketId: "form", feedback: "The record interface changed, not necessarily the underlying money." },
        ]), "Separate the unit, the payment rail, purchasing power and governance. They interact, but they are not interchangeable concepts."),
      },
      {
        title: "Why monetary systems change",
        outcome: "Evaluate a proposed monetary innovation against actual user needs and measurable trade-offs.",
        reference: `SARB describes the national payment system as the instruments, procedures and rules that move funds between financial institutions. [Payments and settlements](${sources.sarbPayments})`,
        experience: scenes("Design review", "A monetary innovation needs a problem statement", "Treat a new payment or asset system like infrastructure: identify the user, failure, constraint and evidence of improvement.", [
          { id: "problem", label: "Review 1 · Problem", title: "Name the failure precisely", body: "High remittance cost, delayed settlement, exclusion and censorship risk are different problems requiring different evidence.", metric: "Specific need", tone: "blue" },
          { id: "user", label: "Review 2 · User", title: "Define who benefits and who carries risk", body: "A tool can help one group while shifting cost, volatility, surveillance or operational burden to another.", metric: "Distribution", tone: "orange" },
          { id: "comparison", label: "Review 3 · Baseline", title: "Compare with the system that actually exists", body: "Claims should measure cost, speed, access and reliability against realistic alternatives—not a caricature.", metric: "Fair benchmark", tone: "green" },
          { id: "failure", label: "Review 4 · Stress", title: "Ask what breaks under pressure", body: "Connectivity, custody, liquidity, fraud response and governance determine whether the design survives real use.", metric: "Resilience", tone: "red" },
        ], branch("Review a new payment proposal", "A project promises instant cross-border transfers. Its demo works, but users must hold a volatile token and recovery support is undefined. What should happen next?", [
          { id: "launch", label: "Approve it because the demo proves the system is superior.", verdict: "Demo mistaken for evidence", feedback: "The demo does not resolve volatility, liquidity, custody or recovery for the intended users.", tone: "risk" },
          { id: "ban", label: "Reject it because all monetary change is dangerous.", verdict: "Potential value ignored", feedback: "The transfer improvement may be real. The unresolved risks should become test conditions, not automatic rejection.", tone: "caution" },
          { id: "pilot", label: "Pilot with cost, volatility, liquidity, recovery and user-harm measures.", verdict: "Responsible experiment", feedback: "A bounded pilot tests the claimed improvement and the risks that could make it unsuitable.", tone: "good" },
        ]), "Innovation deserves a measurable problem, a realistic baseline and a failure plan—not admiration merely for being new."),
      },
    ],
    quiz: [
      ["What is the strongest way to describe monetary evolution?", ["Each new form permanently replaces every old form", "Systems change to solve coordination problems while introducing new trade-offs", "Technology removes governance", "The scarcest object always wins"], 1, "Monetary forms coexist and evolve around needs, trust and trade-offs.", "Monetary evolution"],
      ["What limitation of barter does money reduce?", ["The need for any exchange", "The coincidence of wants", "The existence of different goods", "The need to value anything"], 1, "Money lets a seller accept a common intermediary and buy from someone else later.", "Monetary evolution"],
      ["What did standardised coinage primarily improve?", ["Verification and divisibility", "Internet access", "Cryptographic security", "Elimination of issuers"], 0, "Recognised weights and values reduced repeated verification and made exchange easier.", "Monetary evolution"],
      ["A shop adopts QR payments. What has directly changed?", ["The currency's purchasing power", "The payment interface or rail", "The inflation rate", "The legal definition of money"], 1, "A new interface changes how payment instructions are made; other claims need separate evidence.", "Money and payment rails"],
      ["What is evidence of broad purchasing-power change?", ["One scarce item becomes expensive", "A sustained rise across a representative basket", "A bank launches an app", "A protocol has many followers"], 1, "Purchasing power is assessed broadly and over time, not from one isolated price.", "Purchasing power"],
      ["What question exposes monetary governance?", ["What colour is the note?", "Who may alter, enforce or override the rules?", "Is the app fast?", "How old is the user?"], 1, "Governance concerns authority over rules and enforcement.", "Monetary governance"],
      ["What should a payment innovation be compared with?", ["A perfect imaginary alternative", "The real baseline available to its intended users", "Only its marketing claims", "The oldest form of money"], 1, "A fair baseline shows whether the proposal creates a practical improvement.", "Innovation evaluation"],
      ["A successful demo proves what?", ["The system can never fail", "All users will benefit", "A limited function worked under the demo conditions", "The token will retain value"], 2, "A demo supports only a narrow claim; resilience and user outcomes require further evidence.", "Innovation evaluation"],
    ],
  },
  {
    number: "1.3",
    title: "The Origins of Bitcoin",
    lessons: [
      {
        title: "The digital cash problem Bitcoin addressed",
        outcome: "Explain the double-spend and trusted-intermediary problems without claiming Bitcoin removes every intermediary or risk.",
        reference: `Satoshi Nakamoto's paper frames Bitcoin as peer-to-peer electronic cash and proposes a network-based solution to double-spending. [Bitcoin white paper](${sources.bitcoinPaper})`,
        experience: scenes("Design problem", "How can a digital unit be spent once without one central bookkeeper?", "Follow two conflicting payment messages and see why distributed agreement matters.", [
          { id: "copy", label: "Step 1 · Copy", title: "Digital messages can be duplicated", body: "A payer can broadcast two incompatible attempts to spend the same input. The network needs one accepted history.", metric: "Conflict", tone: "red" },
          { id: "order", label: "Step 2 · Order", title: "Sequence determines validity", body: "If one spend is accepted first, the conflicting spend must be rejected under the same validation rules.", metric: "Shared chronology", tone: "blue" },
          { id: "work", label: "Step 3 · Cost", title: "Rewriting history must become difficult", body: "Bitcoin uses proof of work and chained blocks so replacing accepted history requires substantial ongoing computational work.", metric: "Tamper resistance", tone: "orange" },
          { id: "limits", label: "Step 4 · Limits", title: "Consensus does not guarantee every outcome", body: "The design addresses ledger agreement. It does not prevent key loss, fraud around the network, price volatility or software mistakes.", metric: "Claim boundaries", tone: "green" },
        ], branch("Two transactions spend the same input", "What must the network determine?", [
          { id: "both", label: "Accept both because digital information can be copied.", verdict: "Monetary integrity lost", feedback: "If both spends were valid, supply and ownership records would no longer be reliable.", tone: "risk" },
          { id: "identity", label: "Discover the payer's legal identity before choosing.", verdict: "Not the protocol's core test", feedback: "Bitcoin validation focuses on authorised inputs and accepted transaction history, not necessarily real-world identity.", tone: "caution" },
          { id: "history", label: "Apply shared validation and ordering rules so one history becomes accepted.", verdict: "Consensus objective", feedback: "The network needs consistent rules for validity and an accepted ordering that rejects the conflicting spend.", tone: "good" },
        ]), "Bitcoin's core innovation is a way for a network to agree on transaction history without one central transaction ledger—not the removal of every form of trust."),
      },
      {
        title: "The ingredients that came before Bitcoin",
        outcome: "Recognise that Bitcoin combined earlier ideas rather than appearing without technical ancestry.",
        reference: `The Bitcoin paper cites digital signatures, timestamping, Merkle trees and proof-of-work research. [References in the Bitcoin white paper](${sources.bitcoinPaper})`,
        experience: scenes("Innovation map", "The breakthrough was the combination", "Connect each earlier ingredient to the problem it helps solve.", [
          { id: "signature", label: "Ingredient 1 · Signatures", title: "Authorise a transfer", body: "Public-key cryptography lets a holder prove control needed to authorise spending without revealing the private key.", metric: "Control", tone: "blue" },
          { id: "hash", label: "Ingredient 2 · Hashes", title: "Make changes visible", body: "Hash-linked data makes an altered record produce a different result, exposing tampering.", metric: "Integrity", tone: "green" },
          { id: "work", label: "Ingredient 3 · Proof of work", title: "Attach cost to history production", body: "Computational work makes block production measurable and large-scale rewriting costly.", metric: "Sybil resistance", tone: "orange" },
          { id: "network", label: "Ingredient 4 · Peer-to-peer network", title: "Replicate and validate the ledger", body: "Independent nodes relay transactions and blocks, apply rules and converge on an accepted history.", metric: "Distribution", tone: "red" },
        ], classify("Match the ingredient to its direct role", "Choose the mechanism that most directly supports the observation.", [
          { id: "authorise", label: "Authorisation", description: "Prove control for a spend" },
          { id: "integrity", label: "Record integrity", description: "Reveal changed data" },
          { id: "consensus", label: "Distributed consensus", description: "Coordinate one accepted history" },
        ], [
          { id: "b1", text: "A valid signature proves the transaction was authorised by the relevant key.", bucketId: "authorise", feedback: "Digital signatures support authorisation without exposing the private key." },
          { id: "b2", text: "Changing an old block changes its hash and breaks later links.", bucketId: "integrity", feedback: "Hash linking makes historical alteration evident." },
          { id: "b3", text: "Nodes reject a block that violates supply rules.", bucketId: "consensus", feedback: "Independent validation keeps acceptance tied to shared rules." },
          { id: "b4", text: "Proof of work makes producing an alternative history costly.", bucketId: "consensus", feedback: "The cost helps the network converge and resist cheap history rewriting." },
        ]), "Bitcoin should be studied as a system: signatures, hashes, proof of work, incentives and node validation reinforce one another."),
      },
      {
        title: "What the white paper claims—and what it does not",
        outcome: "Read foundational material with disciplined claim boundaries rather than turning it into investment mythology.",
        reference: `Use the primary document for its stated design, and NIST for a later technical overview of blockchain characteristics and limitations. [Bitcoin paper](${sources.bitcoinPaper}) · [NISTIR 8202](${sources.nistBlockchain})`,
        experience: scenes("Primary-source reading", "A technical design is not a price prophecy", "Separate statements present in the design from later narratives attached to Bitcoin.", [
          { id: "title", label: "Claim 1 · Purpose", title: "Peer-to-peer electronic cash", body: "The paper proposes direct online payments using a peer-to-peer network rather than routine reliance on a financial institution for transaction ordering.", metric: "Design goal", tone: "blue" },
          { id: "mechanism", label: "Claim 2 · Mechanism", title: "Proof-based transaction history", body: "The paper describes timestamped blocks, proof of work, incentives and node acceptance rules.", metric: "Protocol outline", tone: "green" },
          { id: "assumption", label: "Claim 3 · Assumption", title: "Honest computing power dominates", body: "Security reasoning depends on assumptions about attacker resources, node behaviour and network operation.", metric: "Conditional security", tone: "orange" },
          { id: "myth", label: "Non-claim · Price", title: "No guaranteed investment return", body: "The paper does not promise a future market price, remove operational risk or make every service using Bitcoin trustworthy.", metric: "No price forecast", tone: "red" },
        ], classify("Primary claim or later narrative?", "Classify only what the white paper itself is designed to establish.", [
          { id: "paper", label: "Technical design claim", description: "Within the paper's stated mechanism" },
          { id: "later", label: "Later market narrative", description: "Requires separate evidence" },
          { id: "risk", label: "Risk or limitation", description: "Not removed by the protocol" },
        ], [
          { id: "w1", text: "A peer-to-peer network can order transactions into a proof-based history.", bucketId: "paper", feedback: "This reflects the paper's proposed mechanism." },
          { id: "w2", text: "Bitcoin's price must rise forever because supply is limited.", bucketId: "later", feedback: "That is a market thesis requiring demand and valuation evidence, not a white-paper conclusion." },
          { id: "w3", text: "A user can permanently lose access by losing keys.", bucketId: "risk", feedback: "Ledger integrity does not provide personal key recovery." },
          { id: "w4", text: "Digital signatures help prove authorisation of a spend.", bucketId: "paper", feedback: "The transaction chain relies on digital signatures." },
        ]), "Read the primary source for its actual design. Evaluate adoption, governance, custody and value with separate evidence."),
      },
    ],
    quiz: [
      ["What is the double-spend problem?", ["A fee being charged twice", "Two conflicting attempts to spend the same digital input", "A wallet having two addresses", "A miner finding two blocks in a year"], 1, "A digital money ledger must reject conflicting attempts to spend the same valid input.", "Bitcoin design problem"],
      ["Why does transaction ordering matter?", ["It determines which conflicting spend is accepted first", "It guarantees price stability", "It identifies every user", "It makes all transfers reversible"], 0, "A consistent ordering lets the system accept one spend and reject later conflicts.", "Bitcoin design problem"],
      ["What do digital signatures most directly support?", ["Price prediction", "Transaction authorisation", "Mining profitability", "Exchange regulation"], 1, "A valid signature demonstrates control needed to authorise a transfer.", "Bitcoin ingredients"],
      ["What do hash-linked blocks help reveal?", ["A user's legal identity", "Alteration of recorded data", "Future demand", "A guaranteed correct price"], 1, "Changing block data changes its hash and disrupts subsequent links.", "Bitcoin ingredients"],
      ["What is proof of work used for in Bitcoin?", ["Free transaction reversal", "Attaching measurable cost to block production and history rewriting", "Guaranteeing wallet recovery", "Setting exchange prices"], 1, "Proof of work makes accepted history expensive to replace at scale.", "Bitcoin ingredients"],
      ["What did Bitcoin primarily combine?", ["Only one entirely new mathematical idea", "Existing cryptographic, networking and incentive mechanisms into a working system", "A bank account with a new logo", "A legal guarantee of value"], 1, "The innovation is strongly associated with the system-level combination and incentive design.", "Bitcoin origins"],
      ["Which statement is not established by the white paper?", ["The network can order transactions", "Digital signatures authorise transfers", "Bitcoin's market price must rise", "Proof of work contributes to history security"], 2, "The document presents a payment design, not a guaranteed return.", "Primary-source reading"],
      ["What risk remains even if the ledger works as designed?", ["Private-key loss", "Every spend becomes valid", "Supply rules disappear automatically", "Hashes stop detecting changes"], 0, "Protocol operation does not recover a user's lost private key.", "Claim boundaries"],
    ],
  },
  {
    number: "1.4",
    title: "What Is Cryptocurrency?",
    lessons: [
      {
        title: "Define cryptocurrency without the buzzwords",
        outcome: "Identify the minimum technical and economic questions needed to describe a cryptocurrency accurately.",
        reference: `NIST distinguishes blockchain, blockchain networks and cryptocurrency applications while documenting multiple consensus approaches. [NISTIR 8202](${sources.nistBlockchain})`,
        experience: scenes("Definition builder", "Cryptocurrency is not one uniform thing", "Build a useful definition by separating the asset, ledger, validation, control and purpose.", [
          { id: "asset", label: "Layer 1 · Asset", title: "What unit or right exists?", body: "The unit may be native to a network, issued by an application or represent another claim. The label alone does not reveal its rights.", metric: "Object", tone: "blue" },
          { id: "ledger", label: "Layer 2 · Ledger", title: "Where is ownership recorded?", body: "A replicated blockchain, permissioned ledger or centrally controlled database creates different verification and access properties.", metric: "Record", tone: "green" },
          { id: "validation", label: "Layer 3 · Validation", title: "Who accepts state changes?", body: "Consensus and node rules determine valid transactions; participation may be open, restricted or concentrated.", metric: "Rules", tone: "orange" },
          { id: "purpose", label: "Layer 4 · Purpose", title: "Why would anyone hold or use it?", body: "Payment, network fees, governance, access and speculation are different sources of demand with different risks.", metric: "Economic role", tone: "red" },
        ], classify("Describe the claim precisely", "Classify the question by the layer it investigates.", [
          { id: "ledger", label: "Ledger and validation", description: "How records are maintained and accepted" },
          { id: "rights", label: "Rights and control", description: "What holders own and who can change it" },
          { id: "economics", label: "Economic purpose", description: "Why the unit may be used or demanded" },
        ], [
          { id: "c1", text: "Which nodes can reject an invalid transaction?", bucketId: "ledger", feedback: "This tests validation and rule enforcement." },
          { id: "c2", text: "Can the issuer freeze or mint units?", bucketId: "rights", feedback: "This reveals control and the holder's actual rights." },
          { id: "c3", text: "What recurring activity requires the token?", bucketId: "economics", feedback: "This tests whether demand is tied to a real network function." },
          { id: "c4", text: "Is participation in consensus permissionless?", bucketId: "ledger", feedback: "This concerns who can participate in maintaining state." },
        ]), "A useful cryptocurrency definition identifies the unit, ledger, validators, control rights and economic purpose—not merely the word decentralised."),
      },
      {
        title: "Centralisation and decentralisation are a spectrum",
        outcome: "Compare systems across validation, development, custody, infrastructure and governance instead of applying one label.",
        reference: `NIST documents both permissionless and permissioned blockchain networks and multiple consensus models. [NIST blockchain overview](${sources.nistBlockchain})`,
        experience: scenes("Control map", "One project can be decentralised in one layer and concentrated in another", "Inspect five control surfaces before reaching a conclusion.", [
          { id: "validation", label: "Surface 1 · Validation", title: "Who can verify and produce state?", body: "Node count alone is insufficient; hardware, stake, pools and permission rules affect effective control.", metric: "Consensus power", tone: "blue" },
          { id: "development", label: "Surface 2 · Development", title: "Who proposes and ships code?", body: "Open-source visibility does not guarantee diverse maintainership or broad review.", metric: "Change pipeline", tone: "green" },
          { id: "governance", label: "Surface 3 · Governance", title: "Who can alter parameters or recover from failure?", body: "Formal votes, informal leadership, foundations and service providers may each hold influence.", metric: "Decision power", tone: "orange" },
          { id: "custody", label: "Surface 4 · Custody", title: "Who controls user keys?", body: "A decentralised network can still be accessed mainly through centralised exchanges or custodians.", metric: "User control", tone: "red" },
          { id: "infrastructure", label: "Surface 5 · Infrastructure", title: "Where are critical dependencies?", body: "Cloud hosting, interfaces, stablecoins, bridges and data providers can create concentrated failure points.", metric: "Operational dependency", tone: "blue" },
        ], meter("Map a fictional network's decentralisation", "Set each dimension independently. The result is a system profile, not a moral score.", [
          { id: "validators", label: "Validator diversity", lowLabel: "One operator", highLabel: "Many independent operators", weight: 1.3, initial: 65 },
          { id: "clients", label: "Software-client diversity", lowLabel: "One implementation", highLabel: "Multiple maintained clients", weight: 1, initial: 35 },
          { id: "governance", label: "Governance distribution", lowLabel: "One authority", highLabel: "Broad constrained process", weight: 1.2, initial: 30 },
          { id: "custody", label: "User custody", lowLabel: "Mostly custodial", highLabel: "Practical self-custody", weight: 1, initial: 45 },
          { id: "infrastructure", label: "Infrastructure resilience", lowLabel: "Concentrated", highLabel: "Diverse", weight: 1.1, initial: 40 },
        ], [
          { max: 39, label: "Highly concentrated profile", feedback: "Several control surfaces depend on a small number of actors. Identify the consequences rather than relying on the decentralised label.", tone: "risk" },
          { max: 69, label: "Mixed control profile", feedback: "Some layers are distributed and others concentrated. Describe each layer and its failure mode separately.", tone: "caution" },
          { max: 100, label: "More distributed profile", feedback: "Control is spread across several layers, but incentives, coordination and infrastructure still require monitoring.", tone: "good" },
        ]), "Decentralisation is a multidimensional design choice. Measure control surfaces; do not award the label to the whole system by assertion."),
      },
      {
        title: "Follow a cryptocurrency transaction",
        outcome: "Trace authorisation, propagation, validation, inclusion and confirmation while identifying where a transfer can fail.",
        reference: `The Bitcoin paper and NIST overview explain transaction propagation, validation, blocks and consensus at different levels of detail. [Bitcoin paper](${sources.bitcoinPaper}) · [NISTIR 8202](${sources.nistBlockchain})`,
        experience: scenes("Transaction journey", "Signed does not mean settled", "Follow a fictional transfer from wallet intent to increasing settlement confidence.", [
          { id: "construct", label: "Stage 1 · Construct", title: "The wallet prepares a transaction", body: "The software selects inputs or account state, destination, amount and fee under the network's format.", metric: "Intent", tone: "blue" },
          { id: "sign", label: "Stage 2 · Sign", title: "The holder authorises the instruction", body: "A signature proves control needed by the protocol. It does not verify that the destination is the person the sender intended.", metric: "Authorisation", tone: "green" },
          { id: "broadcast", label: "Stage 3 · Broadcast", title: "Nodes receive and check it", body: "Peers may reject invalid format, missing funds, conflicting state or fees that do not meet relay policy.", metric: "Validation", tone: "orange" },
          { id: "include", label: "Stage 4 · Include", title: "A block producer includes the transaction", body: "Inclusion places the transfer in a candidate accepted history; the exact mechanism differs by network.", metric: "On-chain record", tone: "blue" },
          { id: "confirm", label: "Stage 5 · Confirm", title: "Later blocks increase confidence", body: "More accepted history above the transaction generally makes reversal harder, but finality rules and risk differ by system.", metric: "Settlement confidence", tone: "red" },
        ], branch("The address was copied incorrectly", "The signed transaction is valid and has been confirmed. What is the strongest conclusion?", [
          { id: "network", label: "The network must reverse it because the sender made an honest mistake.", verdict: "Protocol and support confused", feedback: "Many public-chain transfers are not reversible by a central operator. Recovery depends on the recipient or external arrangements.", tone: "risk" },
          { id: "signature", label: "The signature proves the destination was the intended person.", verdict: "Authorisation overread", feedback: "The signature proves control by the signing key, not the real-world identity or intention behind the destination string.", tone: "caution" },
          { id: "lesson", label: "The ledger can be correct while the user's instruction is wrong.", verdict: "Correct distinction", feedback: "Protocol validity and human intent are different. Address verification and safe test transfers manage this operational risk.", tone: "good" },
        ]), "A transaction can be valid, authorised and confirmed yet still be a costly mistake. Operational safety sits beside protocol security."),
      },
    ],
    quiz: [
      ["What is the most useful first question about a cryptocurrency?", ["Will its price rise?", "What unit exists, where is it recorded and who validates changes?", "Does it use the word blockchain?", "How many social followers does it have?"], 1, "Asset, ledger and validation questions define the system before valuation claims begin.", "Cryptocurrency definition"],
      ["Why is cryptocurrency not one uniform category?", ["All units have different colours", "Ledger, control, rights and economic purpose vary", "Cryptography never repeats", "Every project uses a different internet"], 1, "Projects differ materially across architecture, governance and economics.", "Cryptocurrency definition"],
      ["What does a token's economic purpose explain?", ["Why recurring activity might create demand", "Who knows the private key", "Whether every transaction is legal", "Its guaranteed future price"], 0, "Economic purpose links the unit to potential use; it does not guarantee value.", "Token economics"],
      ["Why is decentralisation a spectrum?", ["Only validator count matters", "Different control surfaces can have different concentrations", "Every project is equally decentralised", "The term has no meaning"], 1, "Validation, development, governance, custody and infrastructure can distribute control differently.", "Decentralisation"],
      ["A decentralised network accessed through one custodian has what risk?", ["No risk because the protocol is decentralised", "A concentrated custody and access failure point", "Guaranteed reversibility", "Automatic insurance"], 1, "Network architecture does not remove concentration at the custody layer.", "Decentralisation"],
      ["What does signing a transaction prove?", ["The recipient's legal identity", "Protocol-level authorisation by the relevant key", "The market value of the asset", "That the address was typed correctly"], 1, "A signature supports authorisation; it does not prove off-chain intention or identity.", "Transaction lifecycle"],
      ["When does a transaction first become part of a candidate chain history?", ["When the user thinks about it", "When a block producer includes it", "When an exchange advertises it", "When the asset price changes"], 1, "Block inclusion records the transfer in the chain's evolving accepted history.", "Transaction lifecycle"],
      ["Why can a valid confirmed transaction still be a mistake?", ["Protocol rules validate instructions, not every human intention", "Confirmations erase signatures", "Nodes always change the destination", "Valid transactions are automatically refunded"], 0, "The network may correctly execute an instruction that the user formed incorrectly.", "Operational safety"],
    ],
  },
];

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function lessonContent(lesson) {
  return `## Your outcome\n\n${lesson.outcome}\n\n## Source-backed reference notes\n\n${lesson.reference}\n\n## How to use this lesson\n\nPlay the guided story first. Complete the activity before opening the notes. The activity teaches a reasoning process; it does not predict an asset price or provide financial advice.`;
}

const statements = [];
statements.push(`INSERT OR IGNORE INTO \`courses\`
  (\`id\`,\`school_id\`,\`owner_id\`,\`title\`,\`description\`,\`status\`,\`price_cents\`,
   \`enforce_lesson_order\`,\`available_from\`,\`certificate_title\`,
   \`certificate_accent\`,\`certificate_valid_days\`,\`created_at\`,\`updated_at\`)
SELECT
  ${sql(courseId)},target.\`id\`,target.\`owner_id\`,
  'Crypto Mastery: Foundations — Production draft',
  'The production-quality opening of the three-part Digital Assets pathway. Four complete modules use guided stories, decision labs, source-backed notes and scored assessments. The remaining source modules will be added only as they pass the same standard.',
  'draft',0,1,NULL,'NorthstarLabs Certificate: Crypto Mastery Foundations','#3556d8',0,${createdAt},${createdAt}
FROM \`schools\` target WHERE target.\`slug\`='cognizen-consulting' LIMIT 1;`);

modules.forEach((module, moduleIndex) => {
  const sectionId = `cmf-module-${module.number.replace(".", "-")}`;
  statements.push(`INSERT OR IGNORE INTO \`course_sections\`
    (\`id\`,\`course_id\`,\`title\`,\`position\`,\`created_at\`)
  SELECT ${sql(sectionId)},${sql(courseId)},${sql(`Module ${module.number}: ${module.title}`)},${moduleIndex + 1},${createdAt}
  WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);

  module.lessons.forEach((lesson, lessonIndex) => {
    const lessonId = `${sectionId}-lesson-${String(lessonIndex + 1).padStart(2, "0")}`;
    statements.push(`INSERT OR IGNORE INTO \`lessons\`
      (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,
       \`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,
       \`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`)
    SELECT ${sql(lessonId)},${sql(courseId)},${sql(sectionId)},${sql(lesson.title)},'interactive',
      ${sql(lessonContent(lesson))},'markdown',6,0,0,0,'',${sql(JSON.stringify(lesson.experience))},${lessonIndex + 1},${createdAt}
    WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  });

  const quizLessonId = `${sectionId}-lesson-04`;
  const quizId = `${sectionId}-quiz`;
  statements.push(`INSERT OR IGNORE INTO \`lessons\`
    (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,
     \`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,
     \`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`)
  SELECT ${sql(quizLessonId)},${sql(courseId)},${sql(sectionId)},'Check your understanding','quiz',
    ${sql(`## Module ${module.number} assessment\n\nAnswer all eight questions. Every response returns an explanation and a concept label. Reach 80% before moving to the next module. Attempts are unlimited because correction is part of learning.`)},
    'markdown',5,0,0,0,'','',4,${createdAt}
  WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  statements.push(`INSERT OR IGNORE INTO \`quizzes\`
    (\`id\`,\`lesson_id\`,\`title\`,\`passing_score\`,\`max_attempts\`)
  SELECT ${sql(quizId)},${sql(quizLessonId)},${sql(`Module ${module.number}: ${module.title}`)},80,0
  WHERE EXISTS (SELECT 1 FROM \`lessons\` WHERE \`id\`=${sql(quizLessonId)});`);

  module.quiz.forEach(([prompt, options, correctIndex, explanation, concept], questionIndex) => {
    statements.push(`INSERT OR IGNORE INTO \`quiz_questions\`
      (\`id\`,\`quiz_id\`,\`prompt\`,\`options_json\`,\`correct_index\`,\`explanation\`,\`concept_label\`,\`position\`)
    SELECT ${sql(`${quizId}-q${String(questionIndex + 1).padStart(2, "0")}`)},${sql(quizId)},${sql(prompt)},
      ${sql(JSON.stringify(options))},${correctIndex},${sql(explanation)},${sql(concept)},${questionIndex + 1}
    WHERE EXISTS (SELECT 1 FROM \`quizzes\` WHERE \`id\`=${sql(quizId)});`);
  });
});

const output = `${statements.join("\n--> statement-breakpoint\n")}\n`;
const target = new URL("../drizzle/0049_crypto_mastery_foundations_production.sql", import.meta.url);
await writeFile(target, output, "utf8");
console.log(`Wrote ${modules.length} modules, ${modules.length * 4} lessons and ${modules.reduce((sum, module) => sum + module.quiz.length, 0)} scored questions.`);
