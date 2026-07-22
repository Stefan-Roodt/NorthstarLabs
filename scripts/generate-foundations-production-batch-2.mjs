import { writeFile } from "node:fs/promises";

const courseId = "cognizen-crypto-mastery-foundations-production";
const createdAt = 1784779200000;
const sources = {
  nist: "https://doi.org/10.6028/NIST.IR.8202",
  nistBlockchain: "https://www.nist.gov/blockchain",
  bitcoinPaper: "https://bitcoin.org/bitcoin.pdf",
  bitcoinChain: "https://developer.bitcoin.org/devguide/block_chain.html",
  ethereumAccounts: "https://ethereum.org/developers/docs/accounts/",
  ethereumContracts: "https://ethereum.org/developers/docs/smart-contracts/",
  ethereumIntro: "https://ethereum.org/developers/docs/intro-to-ethereum/",
  bisTokenisation: "https://www.bis.org/fsi/fsisummaries/exsum_23905.pdf",
};

function experience(eyebrow, title, intro, scenes, activity, takeaway) {
  return { version: 1, eyebrow, title, intro, scenes, activity, takeaway };
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
    number: "1.5",
    position: 5,
    title: "What Is Blockchain Technology?",
    lessons: [
      {
        title: "Build a blockchain from first principles",
        outcome: "Explain how transactions, blocks, hashes and previous-block references create a tamper-evident history.",
        reference: `NIST describes a blockchain as a distributed ledger whose records are grouped into cryptographically linked blocks. [NIST blockchain overview](${sources.nistBlockchain})`,
        experience: experience("Ledger builder", "A chain is useful because each layer constrains the next", "Assemble a four-block history, then identify the direct role of each component.", [
          { id: "transactions", label: "Layer 1 · Transactions", title: "State changes are proposed", body: "A transaction expresses an authorised change under the network's rules. Invalid instructions should be rejected before inclusion.", metric: "Proposed change", tone: "blue" },
          { id: "block", label: "Layer 2 · Block", title: "Transactions are grouped", body: "A block packages accepted transactions with metadata so participants can process an ordered batch.", metric: "Ordered batch", tone: "green" },
          { id: "hash", label: "Layer 3 · Hash", title: "The block receives a compact fingerprint", body: "A cryptographic hash changes unpredictably when the underlying data changes, making alteration detectable.", metric: "Tamper evidence", tone: "orange" },
          { id: "link", label: "Layer 4 · Link", title: "Each block commits to prior history", body: "Including the previous block's hash connects the sequence. Altering old data breaks the later references unless the history is rebuilt and accepted.", metric: "Chained history", tone: "red" },
        ], classify("Name the component's direct job", "Classify what each observation directly describes. Avoid giving one component credit for the whole system.", [
          { id: "authorise", label: "Transaction authorisation", description: "A valid participant instruction" },
          { id: "integrity", label: "Integrity evidence", description: "Makes alteration detectable" },
          { id: "ordering", label: "History ordering", description: "Connects accepted batches over time" },
        ], [
          { id: "b1", text: "A signature satisfies the spending condition for an input.", bucketId: "authorise", feedback: "The signature supports authorisation under the transaction rules." },
          { id: "b2", text: "One changed character produces a different block hash.", bucketId: "integrity", feedback: "Hash sensitivity makes the altered data evident." },
          { id: "b3", text: "A block header commits to the previous block's hash.", bucketId: "ordering", feedback: "The reference links the new batch to an earlier accepted history." },
          { id: "b4", text: "A node checks that a transaction does not violate protocol rules.", bucketId: "authorise", feedback: "Validation checks whether the proposed state change is permitted." },
        ]), "A blockchain is not one magic object. Transactions, validation, batching, hashes and consensus work together to create its properties."),
      },
      {
        title: "Consensus is agreement under rules—not universal truth",
        outcome: "Distinguish transaction validity, consensus ordering and external truth.",
        reference: `NIST documents consensus models as mechanisms by which distributed participants agree on ledger state. [NISTIR 8202](${sources.nist})`,
        experience: experience("Consensus room", "A network can agree perfectly about a false external input", "Watch nodes move from a proposed transaction to an accepted state while tracking what consensus does not verify.", [
          { id: "proposal", label: "Round 1 · Proposal", title: "A state change enters the network", body: "The transaction must satisfy format, signature, balance and other deterministic protocol checks.", metric: "Local validation", tone: "blue" },
          { id: "candidate", label: "Round 2 · Candidate", title: "A participant proposes an ordered batch", body: "The consensus mechanism determines who may propose and how competing histories are resolved.", metric: "Coordination", tone: "orange" },
          { id: "accept", label: "Round 3 · Acceptance", title: "Independent nodes apply the same rules", body: "Nodes accept only state transitions their software considers valid, then converge under the network's fork-choice or finality rules.", metric: "Shared state", tone: "green" },
          { id: "oracle", label: "Boundary · External world", title: "Consensus cannot inspect reality by itself", body: "If a contract receives incorrect off-chain data, nodes may faithfully agree on the incorrect input. The oracle remains a separate trust boundary.", metric: "Truth boundary", tone: "red" },
        ], branch("A crop-insurance contract receives a weather reading", "Every node agrees that the oracle reported no rain, but the sensor was defective. What happened?", [
          { id: "chain-failed", label: "Consensus failed because the real weather was different.", verdict: "Wrong boundary", feedback: "Consensus may have correctly agreed on the data supplied. It did not independently observe the weather.", tone: "risk" },
          { id: "truth", label: "Blockchain agreement proves the sensor reading was objectively true.", verdict: "Agreement overread", feedback: "Shared ledger state proves what input was processed, not that the external input was accurate.", tone: "caution" },
          { id: "oracle", label: "The ledger agreed correctly, while the oracle supplied bad external data.", verdict: "Trust boundary identified", feedback: "The design must manage oracle quality, redundancy, incentives and dispute handling separately from consensus.", tone: "good" },
        ]), "Consensus establishes a shared ledger state under defined rules. It does not turn every recorded claim into external truth."),
      },
      {
        title: "Immutability is a security outcome, not an absolute adjective",
        outcome: "Assess tamper resistance using history depth, consensus security, validation diversity and governance assumptions.",
        reference: `NIST uses the more precise terms tamper evident and tamper resistant; Bitcoin's developer guide explains why modifying older proof-of-work history becomes progressively more costly. [NIST](${sources.nistBlockchain}) · [Bitcoin developer guide](${sources.bitcoinChain})`,
        experience: experience("History stress test", "Ask how hard a record is to change—and who must cooperate", "Move the security assumptions and see why not every blockchain record deserves the same confidence.", [
          { id: "recent", label: "State 1 · Recent", title: "A new record has limited history above it", body: "Competing histories and temporary reorganisations are more plausible near the chain tip than deep in accepted history.", metric: "Low depth", tone: "orange" },
          { id: "deep", label: "State 2 · Deep", title: "Later accepted work or finality accumulates", body: "Rewriting the record may require replacing later history or violating finality assumptions, increasing the attack burden.", metric: "Higher resistance", tone: "green" },
          { id: "power", label: "State 3 · Control", title: "Security depends on concentrated resources", body: "Hash power, stake, validator keys, client software and coordination can each become attack or governance surfaces.", metric: "Assumption set", tone: "red" },
          { id: "correct", label: "State 4 · Correction", title: "Communities may still coordinate changes", body: "Forks, upgrades and emergency responses show that social and technical governance remain part of the system.", metric: "Not metaphysically fixed", tone: "blue" },
        ], meter("Estimate record-change resistance", "Rate a fictional network. This measures security assumptions, not investment quality.", [
          { id: "depth", label: "History depth or finality", lowLabel: "Just proposed", highLabel: "Deep or finalised", weight: 1.2, initial: 45 },
          { id: "validators", label: "Independent validation", lowLabel: "One controller", highLabel: "Many diverse validators", weight: 1.3, initial: 40 },
          { id: "attack", label: "Attack cost", lowLabel: "Cheap to dominate", highLabel: "Economically prohibitive", weight: 1.4, initial: 35 },
          { id: "clients", label: "Client diversity", lowLabel: "One implementation", highLabel: "Multiple implementations", weight: 1, initial: 30 },
          { id: "governance", label: "Governance constraints", lowLabel: "Unilateral rewrite", highLabel: "Broad transparent process", weight: 1.1, initial: 40 },
        ], [
          { max: 39, label: "Weak change resistance", feedback: "The record depends on concentrated or inexpensive control. Treat permanence claims cautiously.", tone: "risk" },
          { max: 69, label: "Conditional resistance", feedback: "Several protections exist, but material technical or governance assumptions remain.", tone: "caution" },
          { max: 100, label: "Stronger resistance", feedback: "Changing accepted history appears difficult under current assumptions, but no system is free of software, governance or operational risk.", tone: "good" },
        ]), "Replace 'immutable' with a testable question: resistant to which change, by which actor, at what cost and under which governance rules?"),
      },
    ],
    quiz: [
      ["What does linking a block to the previous block's hash provide most directly?", ["Guaranteed truth", "A detectable commitment to prior history", "A legal ownership certificate", "A fixed market price"], 1, "The previous hash links the new block to earlier data and exposes alteration.", "Blockchain structure"],
      ["What happens to a cryptographic hash when the input changes?", ["It normally remains identical", "It changes unpredictably", "It reveals the private key", "It guarantees the input is true"], 1, "A small input change should produce a substantially different output.", "Cryptographic hashes"],
      ["What does consensus primarily establish?", ["Objective truth about the world", "A shared ledger state under network rules", "The identity of every user", "A fair asset price"], 1, "Consensus coordinates participants around accepted state and ordering.", "Consensus"],
      ["Why can nodes agree on an incorrect weather value?", ["Hashes do not work", "The external oracle can supply bad data", "Blocks have no transactions", "Consensus always changes the weather"], 1, "Consensus validates processing of the supplied input, not the sensor's real-world accuracy.", "Oracle boundary"],
      ["Why is 'tamper resistant' more precise than 'unchangeable'?", ["Records are always easy to edit", "Resistance depends on technical, economic and governance assumptions", "Blockchains contain no history", "Only paper can be immutable"], 1, "Security is conditional on control, cost, depth and governance.", "Tamper resistance"],
      ["What generally happens as more accepted Bitcoin blocks follow a transaction?", ["Rewriting its history becomes more costly", "The signature disappears", "The transaction becomes private", "Its fiat value is guaranteed"], 0, "Later proof of work increases the work needed to replace that history.", "Confirmations"],
      ["Which factor can weaken ledger resilience?", ["Diverse independent validators", "Concentrated validation or client implementation", "Transparent rules", "Multiple checks"], 1, "Concentration can create a single point of technical or governance failure.", "Blockchain security"],
      ["A blockchain record proves what most directly?", ["The recorded external claim is true", "The network accepted the recorded state under its rules", "The asset is valuable", "Every participant was honest"], 1, "Ledger acceptance and external truth are separate claims.", "Claim boundaries"],
    ],
  },
  {
    number: "1.6",
    position: 6,
    title: "How Decentralisation Works",
    lessons: [
      {
        title: "Map decentralisation across five control surfaces",
        outcome: "Evaluate validation, software, governance, custody and infrastructure independently.",
        reference: `NIST distinguishes distributed ledger architecture and consensus participation; Ethereum's documentation separately covers nodes, clients, accounts and contract control. [NISTIR 8202](${sources.nist}) · [Ethereum documentation](${sources.ethereumIntro})`,
        experience: experience("Control-surface map", "Decentralised where—and against which failure?", "Inspect a fictional network whose validators are diverse but whose other layers are concentrated.", [
          { id: "validation", label: "Surface 1 · Validation", title: "Many operators check state", body: "Independent validation can reduce reliance on one ledger operator, provided participation is practically achievable.", metric: "70 operators", tone: "green" },
          { id: "client", label: "Surface 2 · Software", title: "Almost everyone runs one client", body: "A shared software defect can affect diverse operators simultaneously. Operator count is not client diversity.", metric: "92% one client", tone: "red" },
          { id: "governance", label: "Surface 3 · Governance", title: "One foundation controls upgrades", body: "Formal and informal influence over releases, standards and emergency decisions may remain concentrated.", metric: "One upgrade key", tone: "orange" },
          { id: "custody", label: "Surface 4 · Custody", title: "Most users enter through two exchanges", body: "A distributed base layer can coexist with concentrated custody, liquidity and user access.", metric: "81% custodial", tone: "red" },
          { id: "infrastructure", label: "Surface 5 · Infrastructure", title: "Nodes share cloud and data dependencies", body: "Hosting, interfaces, bridges and oracles can create correlated operational failure.", metric: "Three key providers", tone: "blue" },
        ], meter("Create the network's control profile", "Adjust each layer independently. A single average can hide a dangerous concentration, so read the feedback with the individual sliders.", [
          { id: "validation", label: "Validator distribution", lowLabel: "One controller", highLabel: "Many independent operators", weight: 1.3, initial: 70 },
          { id: "clients", label: "Client diversity", lowLabel: "One dominant client", highLabel: "Several maintained clients", weight: 1.2, initial: 15 },
          { id: "governance", label: "Upgrade governance", lowLabel: "Unilateral", highLabel: "Broad constrained process", weight: 1.2, initial: 20 },
          { id: "custody", label: "Practical user custody", lowLabel: "Concentrated custodians", highLabel: "Accessible self-custody", weight: 1, initial: 20 },
          { id: "infrastructure", label: "Infrastructure diversity", lowLabel: "Correlated dependencies", highLabel: "Resilient alternatives", weight: 1.1, initial: 35 },
        ], [
          { max: 39, label: "Concentrated system profile", feedback: "The decentralised label hides major control or dependency risks. Name each concentration explicitly.", tone: "risk" },
          { max: 69, label: "Mixed system profile", feedback: "Some layers distribute power while others do not. Security analysis must preserve that nuance.", tone: "caution" },
          { max: 100, label: "More distributed profile", feedback: "Several control surfaces are diverse, but incentives and emergency coordination still require review.", tone: "good" },
        ]), "Decentralisation is not one score or badge. A secure design states which power is distributed and which dependency remains concentrated."),
      },
      {
        title: "Nodes, validators and users do different jobs",
        outcome: "Distinguish rule verification, consensus participation, block production and custody.",
        reference: `Ethereum documentation describes nodes, clients, validators and user-controlled versus contract accounts; Bitcoin documentation describes collaborative chain maintenance and proof of work. [Ethereum accounts](${sources.ethereumAccounts}) · [Bitcoin chain guide](${sources.bitcoinChain})`,
        experience: experience("Role lab", "The network is not one crowd doing one job", "Follow one transaction and assign responsibility to the actor that performs it.", [
          { id: "user", label: "Actor 1 · User", title: "Forms and authorises an instruction", body: "A key holder signs a transaction. Safe custody and correct destination selection remain the user's operational responsibility.", metric: "Intent and key", tone: "blue" },
          { id: "node", label: "Actor 2 · Node", title: "Applies validation rules", body: "A node checks transactions and blocks against the protocol rules implemented by its client software.", metric: "Independent check", tone: "green" },
          { id: "producer", label: "Actor 3 · Block producer", title: "Proposes ordered state", body: "A miner or validator selects transactions and proposes a block under the consensus mechanism.", metric: "Proposal", tone: "orange" },
          { id: "custodian", label: "Actor 4 · Custodian", title: "May control keys for customers", body: "An exchange can offer convenience while becoming a separate trust and failure boundary distinct from the base network.", metric: "Delegated control", tone: "red" },
        ], classify("Assign the responsibility", "Choose the role that most directly performs the action.", [
          { id: "user", label: "Key holder or user", description: "Creates and authorises intent" },
          { id: "node", label: "Validating node", description: "Checks protocol rules" },
          { id: "producer", label: "Block producer", description: "Proposes ordered transactions" },
          { id: "custodian", label: "Custodial service", description: "Controls keys on a customer's behalf" },
        ], [
          { id: "r1", text: "Rejects a block that creates units outside the protocol rules.", bucketId: "node", feedback: "Independent nodes enforce the rules they run." },
          { id: "r2", text: "Chooses the receiving address and signs the payment.", bucketId: "user", feedback: "The key holder creates and authorises the instruction." },
          { id: "r3", text: "Selects pending transactions for a candidate block.", bucketId: "producer", feedback: "Block producers order eligible transactions into proposals." },
          { id: "r4", text: "Processes a withdrawal from pooled customer wallets.", bucketId: "custodian", feedback: "The service controls keys and internal account records for its users." },
        ]), "Security improves when roles are explicit. A decentralised base network does not automatically decentralise wallets, exchanges, interfaces or development."),
      },
      {
        title: "Choose decentralisation for a reason",
        outcome: "Decide when distributed control justifies additional coordination, performance and governance complexity.",
        reference: `NIST presents blockchain as one architecture with particular characteristics, not a universal replacement for ordinary databases. [NISTIR 8202](${sources.nist})`,
        experience: experience("Architecture review", "Decentralisation is a cost paid to reduce a defined trust dependency", "Compare three systems and select the architecture whose control model fits the problem.", [
          { id: "payroll", label: "Case 1 · Company payroll", title: "One employer owns the records", body: "Clear legal authority, privacy requirements and correction duties may favour a conventional controlled database.", metric: "Known authority", tone: "blue" },
          { id: "consortium", label: "Case 2 · Shared trade registry", title: "Several organisations need one record", body: "A permissioned shared ledger may help when no participant should unilaterally rewrite the common history.", metric: "Multi-party coordination", tone: "orange" },
          { id: "public", label: "Case 3 · Open digital bearer asset", title: "Unknown participants need common rules", body: "Permissionless validation may reduce dependence on one issuer or ledger operator, at the cost of complexity and resource constraints.", metric: "Open participation", tone: "green" },
          { id: "tradeoff", label: "Decision · Trade-off", title: "More distribution is not automatically more useful", body: "Throughput, latency, privacy, recovery, compliance and governance must be weighed against the trust dependency being reduced.", metric: "Fit, not fashion", tone: "red" },
        ], branch("A hospital stores confidential patient notes", "It has one accountable operator, strict correction duties and no need for public verification. What is the strongest starting architecture?", [
          { id: "public", label: "A permissionless public blockchain because decentralisation is always safer.", verdict: "Problem mismatch", feedback: "Public replication, privacy limits and difficult correction can conflict with the hospital's duties and threat model.", tone: "risk" },
          { id: "ignore", label: "Any spreadsheet because architecture does not matter.", verdict: "Control without safeguards", feedback: "The system still needs access control, auditability, backups, integrity and accountable change processes.", tone: "caution" },
          { id: "controlled", label: "A well-governed controlled database with strong audit and access controls.", verdict: "Fit-for-purpose starting point", feedback: "The design matches known authority and legal duties. A shared ledger would need a specific additional coordination problem to justify itself.", tone: "good" },
        ]), "The right question is not 'Can blockchain be used?' It is 'Which trust dependency must be reduced, and is the added complexity worth it?'"),
      },
    ],
    quiz: [
      ["Why can validator count mislead?", ["Validators never matter", "Many validators may still share one client or operator dependency", "Every validator is a bank", "Count determines market price"], 1, "Diverse operators can remain correlated through software, hosting or governance.", "Decentralisation dimensions"],
      ["Which is a separate control surface from validation?", ["Software-client diversity", "Block height", "Transaction amount", "Token colour"], 0, "A dominant client can create shared failure even across many validators.", "Decentralisation dimensions"],
      ["What does a validating node do?", ["Guarantees profit", "Checks transactions and blocks against protocol rules", "Stores every user's password", "Sets legal policy"], 1, "Nodes independently apply the rules implemented by their software.", "Network roles"],
      ["What does a block producer do most directly?", ["Proposes an ordered batch of transactions", "Recovers every lost key", "Defines external truth", "Approves all investments"], 0, "A miner or validator proposes a block under the consensus mechanism.", "Network roles"],
      ["Why is a custodian a separate trust boundary?", ["It may control keys and internal customer records", "It changes cryptographic hashes", "It creates every protocol", "It eliminates account risk"], 0, "Users relying on a custodian depend on that service's controls and solvency.", "Custody"],
      ["When is decentralisation most clearly justified?", ["When it is fashionable", "When reducing a defined central trust dependency outweighs added complexity", "Whenever a database is needed", "Only when transactions are free"], 1, "The architecture should address a specific control or coordination problem.", "Architecture fit"],
      ["Why might a hospital prefer a controlled database?", ["It needs public anonymous writers", "It has accountable authority, privacy and correction duties", "Databases cannot be audited", "Blockchains have no security"], 1, "Known authority and legal duties can make a strongly governed central system appropriate.", "Architecture fit"],
      ["What is the best decentralisation conclusion?", ["More is always better", "It is a multidimensional trade-off evaluated against a threat model", "It has no measurable meaning", "One label describes every layer"], 1, "Distribution should be measured by layer and justified by the problem.", "Decentralisation reasoning"],
    ],
  },
  {
    number: "1.7",
    position: 7,
    title: "Coins, Tokens and Digital Assets",
    lessons: [
      {
        title: "Coin, token or represented claim?",
        outcome: "Distinguish a network-native asset, a smart-contract token and a tokenised claim on another asset.",
        reference: `Ethereum documentation distinguishes native ETH, token balances and contract-controlled state; BIS defines tokenisation as issuing or representing assets digitally using technologies including DLT. [Ethereum accounts](${sources.ethereumAccounts}) · [BIS tokenisation summary](${sources.bisTokenisation})`,
        experience: experience("Asset taxonomy", "The token label does not tell you what you own", "Inspect where the unit is issued, what ledger records it and whether another legal or economic claim sits behind it.", [
          { id: "coin", label: "Type 1 · Native coin", title: "The network's own accounting unit", body: "A native asset is defined by the base protocol and often pays fees, rewards consensus participation or transfers value on that network.", metric: "Protocol-native", tone: "blue" },
          { id: "token", label: "Type 2 · Contract token", title: "A program maintains token balances", body: "A smart contract can define supply, transfer rules, permissions and other behaviour on an existing network.", metric: "Application-issued", tone: "green" },
          { id: "claim", label: "Type 3 · Tokenised claim", title: "The token points beyond the ledger", body: "A token may represent a claim on currency, securities, property or another asset. Legal rights and redemption mechanisms become essential.", metric: "Off-chain dependency", tone: "orange" },
          { id: "nft", label: "Type 4 · Non-fungible token", title: "The unit is designed to be distinguishable", body: "Uniqueness in the token record does not automatically transfer copyright, guarantee authenticity of linked media or establish market value.", metric: "Distinct identifier", tone: "red" },
        ], classify("Classify the architecture, not the marketing name", "Choose the most precise category for each fictional asset.", [
          { id: "native", label: "Native network asset", description: "Defined by the base protocol" },
          { id: "contract", label: "Smart-contract token", description: "Issued by code on another network" },
          { id: "claim", label: "Tokenised external claim", description: "Depends on an issuer or underlying asset" },
        ], [
          { id: "a1", text: "The base protocol uses the unit to pay transaction fees.", bucketId: "native", feedback: "The unit is part of the network's own protocol accounting." },
          { id: "a2", text: "An ERC-style contract tracks balances and can pause transfers.", bucketId: "contract", feedback: "The token's rules live in an application contract on the host network." },
          { id: "a3", text: "Each token promises redemption for one unit held by a custodian.", bucketId: "claim", feedback: "Value depends on reserves, legal rights and the redemption process outside the ledger." },
          { id: "a4", text: "A governance token is minted by a protocol contract on Ethereum.", bucketId: "contract", feedback: "It is an application token rather than Ethereum's native asset." },
        ]), "Always identify the ledger object and the holder's enforceable claim separately. A token record may be real while the promised underlying asset is not."),
      },
      {
        title: "Read token rights like a contract",
        outcome: "Determine whether a token grants payment utility, access, governance, redemption, revenue exposure or no enforceable right.",
        reference: `Ethereum describes smart contracts as programs whose code and state live at blockchain addresses; contract logic can define token behaviour but does not by itself create off-chain legal rights. [Smart contracts](${sources.ethereumContracts})`,
        experience: experience("Rights inspection", "A token can be transferable and still grant almost nothing", "Audit a fictional token from code permissions to off-chain promises before considering its label.", [
          { id: "code", label: "Check 1 · Code", title: "What can the contract do?", body: "Mint, burn, pause, blacklist, upgrade and transfer permissions reveal technical control and holder constraints.", metric: "On-chain rules", tone: "blue" },
          { id: "governance", label: "Check 2 · Governance", title: "What does a vote control?", body: "Some votes are binding; others are advisory. Concentrated delegation or admin keys may dominate the formal process.", metric: "Decision rights", tone: "orange" },
          { id: "legal", label: "Check 3 · Legal", title: "Who owes the holder what?", body: "Redemption, revenue or asset claims require an identifiable obligor, terms, jurisdiction and enforcement path.", metric: "Enforceable claim", tone: "green" },
          { id: "economics", label: "Check 4 · Economics", title: "Why should demand persist?", body: "A token can be useful to a protocol without capturing value for holders. Supply, incentives and substitutes still matter.", metric: "Value capture", tone: "red" },
        ], branch("A token is called an 'equity token'", "Its website promises profit participation, but the contract grants only transferability and the terms identify no company obligation. What is the strongest conclusion?", [
          { id: "equity", label: "The name proves holders own company equity.", verdict: "Label mistaken for a right", feedback: "A marketing name cannot create ownership, voting, dividend or enforcement rights by itself.", tone: "risk" },
          { id: "worthless", label: "The token is certainly worthless.", verdict: "Evidence overreach", feedback: "The missing legal claim is a major warning, but market utility and other facts still need separate assessment.", tone: "caution" },
          { id: "rights", label: "Treat the equity claim as unverified until legal terms and enforceable obligations support it.", verdict: "Rights-based conclusion", feedback: "This distinguishes a functioning token record from the off-chain right being advertised.", tone: "good" },
        ]), "Code can define token behaviour. Only clear terms, accountable parties and enforceable mechanisms define many real-world rights."),
      },
      {
        title: "Stablecoins, NFTs and tokenised assets: trace the dependency",
        outcome: "Map reserve, issuer, oracle, custody, smart-contract and legal dependencies behind specialised digital assets.",
        reference: `BIS highlights that tokenisation can create links between token price and reference-asset value, while Ethereum documents contract and oracle limitations. [BIS](${sources.bisTokenisation}) · [Ethereum smart contracts](${sources.ethereumContracts})`,
        experience: experience("Dependency map", "The blockchain may be only one link in the promise", "Compare three digital assets and identify the component whose failure would break the advertised outcome.", [
          { id: "stable", label: "Case 1 · Stablecoin", title: "A token targets a reference value", body: "Reserve assets, issuer solvency, redemption access, banking partners and market liquidity can matter as much as the token contract.", metric: "Redemption chain", tone: "blue" },
          { id: "nft", label: "Case 2 · NFT", title: "A token points to identity or content", body: "The token can prove its own history while metadata hosting, creator authority, intellectual-property terms and marketplace integrity remain separate.", metric: "Reference chain", tone: "orange" },
          { id: "rwa", label: "Case 3 · Tokenised security", title: "A ledger entry represents legal rights", body: "Custody of the underlying asset, investor register rules, transfer restrictions and insolvency treatment determine the holder's real claim.", metric: "Legal chain", tone: "green" },
          { id: "bridge", label: "Case 4 · Wrapped asset", title: "A token represents value locked elsewhere", body: "The bridge, custodian or smart contract must preserve the backing relationship across systems.", metric: "Technical backing", tone: "red" },
        ], meter("Rate a represented-asset claim", "Assess the structure, not expected return. Lower one dependency when it is opaque or concentrated.", [
          { id: "reserve", label: "Backing verification", lowLabel: "Opaque", highLabel: "Independent and frequent", weight: 1.3, initial: 35 },
          { id: "redemption", label: "Redemption reliability", lowLabel: "Discretionary", highLabel: "Clear and tested", weight: 1.3, initial: 30 },
          { id: "legal", label: "Legal claim", lowLabel: "Undefined", highLabel: "Enforceable", weight: 1.2, initial: 25 },
          { id: "contract", label: "Contract security", lowLabel: "Unreviewed", highLabel: "Audited and constrained", weight: 1, initial: 45 },
          { id: "liquidity", label: "Exit liquidity", lowLabel: "Shallow", highLabel: "Resilient", weight: 1, initial: 40 },
        ], [
          { max: 39, label: "Fragile represented claim", feedback: "The token record may work while backing, redemption or legal rights fail. Do not treat the peg or representation as self-enforcing.", tone: "risk" },
          { max: 69, label: "Partially evidenced claim", feedback: "Some dependencies are credible and others remain material. State which link can break the promise.", tone: "caution" },
          { max: 100, label: "Stronger claim structure", feedback: "Backing and rights are better evidenced, but market, operational and legal risks remain conditional.", tone: "good" },
        ]), "For represented assets, follow the full claim from token holder to contract, issuer, custodian, reserve and legal enforcement."),
      },
    ],
    quiz: [
      ["What defines a network-native coin?", ["It is always expensive", "It is part of the base protocol's own accounting", "It represents company shares", "It must be an NFT"], 1, "A native asset is defined by and used within the base network protocol.", "Asset taxonomy"],
      ["What defines a smart-contract token?", ["Its balances and rules are maintained by application code on a host network", "It is physical cash", "It has no issuer or permissions", "It always represents gold"], 0, "Contract code can define issuance, balances, transfer and control functions.", "Asset taxonomy"],
      ["What extra dependency does a tokenised claim introduce?", ["A claim on an issuer or underlying asset outside the token record", "A second private key for every node", "A guaranteed market maker", "A fixed transaction fee"], 0, "The holder relies on off-chain rights, custody or redemption as well as the ledger.", "Tokenised claims"],
      ["Does an NFT automatically transfer copyright?", ["Always", "Only if the associated legal terms do so", "Never under any circumstances", "Only when the price rises"], 1, "The token record and intellectual-property rights are separate unless terms connect them.", "NFT rights"],
      ["Why inspect mint and pause permissions?", ["They reveal technical control over supply and transfers", "They predict future price", "They identify every holder", "They prove legal ownership"], 0, "Administrative permissions can materially change holder risk.", "Token controls"],
      ["A governance vote is necessarily binding. True or false?", ["True", "False"], 1, "Some token votes are advisory or can be overridden by concentrated technical or legal control.", "Governance rights"],
      ["What most directly supports a stablecoin redemption claim?", ["Social-media popularity", "Verified backing, clear terms and a functioning redemption mechanism", "A colourful wallet", "An NFT marketplace"], 1, "The claim depends on reserves, obligors, terms and operational access.", "Stablecoin dependencies"],
      ["What is the best way to analyse a wrapped asset?", ["Assume the name guarantees backing", "Trace custody or bridge mechanisms linking the token to locked value", "Ignore the source network", "Use only the token price"], 1, "The representation is only as reliable as the mechanism preserving backing across systems.", "Represented assets"],
    ],
  },
  {
    number: "1.8",
    position: 8,
    title: "Bitcoin Fundamentals",
    lessons: [
      {
        title: "Bitcoin's ledger: keys, UTXOs and rules",
        outcome: "Explain Bitcoin ownership as control over spendable outputs rather than coins stored inside a wallet application.",
        reference: `The Bitcoin paper describes a chain of digital signatures, while the developer guide explains transactions, outputs and blockchain validation. [White paper](${sources.bitcoinPaper}) · [Developer guide](${sources.bitcoinChain})`,
        experience: experience("Ownership lab", "Your wallet stores keys; the network stores spendable state", "Trace one payment from an existing output to newly created outputs.", [
          { id: "output", label: "State 1 · Existing output", title: "Value is locked by a spending condition", body: "An unspent transaction output records an amount and the condition that must be satisfied to spend it.", metric: "UTXO", tone: "blue" },
          { id: "key", label: "State 2 · Key", title: "The wallet controls signing material", body: "The wallet helps the user construct and sign a transaction. It does not hold bitcoin as a file separate from the ledger.", metric: "Authorisation capability", tone: "green" },
          { id: "transaction", label: "State 3 · Transaction", title: "Old outputs are consumed and new ones created", body: "A payment may create one output for the recipient and another change output returning remaining value to the sender's control.", metric: "State transition", tone: "orange" },
          { id: "node", label: "State 4 · Validation", title: "Nodes independently enforce rules", body: "Nodes check signatures, available inputs, value constraints and block validity before accepting state.", metric: "Rule enforcement", tone: "red" },
        ], classify("Where does each thing live?", "Classify the component by its most direct location or role.", [
          { id: "wallet", label: "Wallet or key control", description: "Signing and transaction construction" },
          { id: "ledger", label: "Bitcoin ledger state", description: "Outputs and accepted transaction history" },
          { id: "rules", label: "Node validation rules", description: "Checks permitted state transitions" },
        ], [
          { id: "u1", text: "The private key used to authorise a spend.", bucketId: "wallet", feedback: "Wallets manage the signing secrets or access to them." },
          { id: "u2", text: "An unspent output available under a locking condition.", bucketId: "ledger", feedback: "The spendable state is recorded in the network's accepted ledger." },
          { id: "u3", text: "The check that inputs have not already been spent.", bucketId: "rules", feedback: "Nodes reject transactions that conflict with accepted state." },
          { id: "u4", text: "A change output created by the new transaction.", bucketId: "ledger", feedback: "The transaction creates new ledger outputs, including change where applicable." },
        ]), "Bitcoin is not a file inside a wallet. The ledger records spendable outputs; keys let a user satisfy the conditions for spending them."),
      },
      {
        title: "Mining, difficulty and confirmations",
        outcome: "Explain how proof of work, difficulty adjustment and confirmations contribute to Bitcoin's security without implying instant certainty.",
        reference: `Bitcoin's developer guide explains proof of work and the increasing cost of modifying blocks as later blocks accumulate. [Block chain guide](${sources.bitcoinChain})`,
        experience: experience("Mining simulator", "Mining proposes history; nodes decide whether it follows the rules", "Follow a candidate block from transaction selection through proof of work and independent validation.", [
          { id: "mempool", label: "Stage 1 · Candidate", title: "A miner selects valid-looking transactions", body: "Selection can reflect fees and policy, but inclusion does not let the miner create arbitrary valid state.", metric: "Candidate block", tone: "blue" },
          { id: "hash", label: "Stage 2 · Proof of work", title: "The miner searches for a qualifying header hash", body: "The search is costly to perform and easy for other nodes to verify once found.", metric: "Computational work", tone: "orange" },
          { id: "validate", label: "Stage 3 · Node checks", title: "Work does not excuse invalid rules", body: "Nodes reject a block that violates transaction, supply or structural rules even if the miner spent energy producing it.", metric: "Independent enforcement", tone: "green" },
          { id: "confirm", label: "Stage 4 · Later history", title: "Confirmations raise reversal cost", body: "Additional accepted blocks build on the transaction's history. Risk generally falls rather than becoming mathematically zero.", metric: "Increasing confidence", tone: "red" },
        ], branch("A miner produces a block paying itself too much", "The proof of work is valid, but the reward violates Bitcoin's rules. What should validating nodes do?", [
          { id: "accept-work", label: "Accept it because proof of work is the only rule.", verdict: "Consensus reduced to energy", feedback: "Proof of work contributes to ordering and attack cost; nodes still enforce transaction and supply validity.", tone: "risk" },
          { id: "vote", label: "Accept it if the miner is large enough.", verdict: "Hash power mistaken for rule authority", feedback: "Mining power does not automatically make an invalid block valid to independently verifying nodes.", tone: "caution" },
          { id: "reject", label: "Reject the block for violating the independently checked reward rule.", verdict: "Correct rule enforcement", feedback: "A miner proposes a block; nodes decide whether it is valid under the rules they run.", tone: "good" },
        ]), "Proof of work makes history expensive to replace. Independent validation prevents block producers from unilaterally redefining valid Bitcoin."),
      },
      {
        title: "Protocol scarcity versus investment narrative",
        outcome: "Separate Bitcoin's issuance rules and technical properties from uncertain adoption, regulation, custody and market-price outcomes.",
        reference: `The Bitcoin paper specifies issuance incentives and a peer-to-peer payment design; neither the paper nor protocol rules promise a future fiat price. [Bitcoin white paper](${sources.bitcoinPaper})`,
        experience: experience("Claim separator", "A fixed protocol rule can support—but cannot complete—a value thesis", "Sort what can be verified from the network from what remains an economic or market hypothesis.", [
          { id: "rule", label: "Evidence 1 · Rule", title: "Issuance follows publicly inspectable protocol rules", body: "Nodes can verify block rewards and supply constraints in accepted history under the software rules they run.", metric: "Protocol evidence", tone: "green" },
          { id: "security", label: "Evidence 2 · Security", title: "The ledger has measurable technical properties", body: "Hash rate, node behaviour, client software, fee markets and custody practices contribute different forms of evidence and risk.", metric: "Operational evidence", tone: "blue" },
          { id: "adoption", label: "Hypothesis 3 · Adoption", title: "Future demand depends on human systems", body: "Users, institutions, regulation, competing technologies and macroeconomic conditions can strengthen or weaken demand.", metric: "Uncertain trajectory", tone: "orange" },
          { id: "price", label: "Hypothesis 4 · Price", title: "Scarcity does not specify a future exchange rate", body: "Market price reflects supply and demand, liquidity, leverage, narratives and risk appetite. It can move violently in both directions.", metric: "No guarantee", tone: "red" },
        ], classify("Protocol fact, external evidence or market hypothesis?", "Classify the strongest category directly supported by each statement.", [
          { id: "protocol", label: "Protocol-verifiable", description: "Can be checked from rules or ledger state" },
          { id: "external", label: "External-system evidence", description: "Depends on services, laws or behaviour" },
          { id: "hypothesis", label: "Market hypothesis", description: "A conditional future claim" },
        ], [
          { id: "p1", text: "A node rejects a block reward above the permitted amount.", bucketId: "protocol", feedback: "The reward constraint is enforced through validation rules." },
          { id: "p2", text: "A regulated custodian reports growing institutional accounts.", bucketId: "external", feedback: "This is adoption evidence from an external service and requires verification." },
          { id: "p3", text: "Limited issuance means the fiat price must rise every year.", bucketId: "hypothesis", feedback: "The price conclusion depends on future demand, liquidity and many other conditions." },
          { id: "p4", text: "A transaction has six accepted blocks built after its inclusion block.", bucketId: "protocol", feedback: "Confirmation depth can be observed from accepted ledger history." },
        ]), "A disciplined Bitcoin thesis labels protocol facts, external evidence and market hypotheses separately—and never turns scarcity into financial advice."),
      },
    ],
    quiz: [
      ["What does a Bitcoin wallet primarily manage?", ["Physical coins", "Keys and transaction construction", "The entire internet", "A guaranteed exchange rate"], 1, "Wallet software manages signing capability and helps form transactions.", "Bitcoin ownership"],
      ["Where is spendable Bitcoin state recorded?", ["Inside a photo file", "In accepted ledger outputs", "Only on an exchange website", "In the user's password"], 1, "Unspent outputs in accepted ledger state define available value under spending conditions.", "UTXO model"],
      ["What can a Bitcoin transaction create?", ["New outputs for recipients and change", "A guaranteed profit", "A legal identity", "Unlimited supply"], 0, "Transactions consume existing outputs and create new outputs under conservation rules.", "UTXO model"],
      ["What is proof of work designed to make easy?", ["Producing a qualifying hash", "Verifying completed work", "Reversing every payment", "Recovering lost keys"], 1, "Finding proof is costly; checking it should be efficient for nodes.", "Proof of work"],
      ["Can a miner make an invalid reward valid by using more hash power?", ["Yes", "No, validating nodes can reject rule-breaking blocks"], 1, "Block production and rule validation are distinct responsibilities.", "Node validation"],
      ["What do confirmations provide?", ["Absolute certainty in every situation", "Increasing confidence as more accepted history builds", "A fixed fiat price", "Identity verification"], 1, "Later history generally raises the cost or difficulty of reversal.", "Confirmations"],
      ["Which statement is protocol-verifiable?", ["Bitcoin will be adopted by every country", "A block reward follows the configured issuance rule", "The price will double", "All custodians are solvent"], 1, "Nodes can check block rewards against the protocol rules they enforce.", "Protocol facts"],
      ["Why does limited issuance not guarantee price appreciation?", ["Supply does not exist", "Future demand, liquidity and market conditions remain uncertain", "Hashes determine price", "Wallets choose the exchange rate"], 1, "Scarcity is one side of a market; demand and other conditions determine outcomes.", "Investment reasoning"],
    ],
  },
];

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function lessonContent(lesson) {
  return `## Your outcome\n\n${lesson.outcome}\n\n## Source-backed reference notes\n\n${lesson.reference}\n\n## How to use this lesson\n\nPlay the guided story and complete the decision activity before opening the notes. The lesson explains technology and risk; it does not provide financial advice or predict market prices.`;
}

const statements = [
  `UPDATE \`courses\` SET
    \`description\`='Eight production-quality modules from the Digital Assets pathway. Every module uses guided stories, decision labs, source-backed notes and scored assessments; later source modules remain excluded until they pass the same standard.',
    \`updated_at\`=${createdAt}
  WHERE \`id\`=${sql(courseId)};`,
];

for (const courseModule of modules) {
  const sectionId = `cmf-module-${courseModule.number.replace(".", "-")}`;
  statements.push(`INSERT OR IGNORE INTO \`course_sections\`
    (\`id\`,\`course_id\`,\`title\`,\`position\`,\`created_at\`)
  SELECT ${sql(sectionId)},${sql(courseId)},${sql(`Module ${courseModule.number}: ${courseModule.title}`)},${courseModule.position},${createdAt}
  WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);

  courseModule.lessons.forEach((lesson, lessonIndex) => {
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
    ${sql(`## Module ${courseModule.number} assessment\n\nAnswer all eight questions. Every answer returns an explanation and a concept label. Reach 80% before continuing. Attempts are unlimited because correcting a misconception is part of learning.`)},
    'markdown',5,0,0,0,'','',4,${createdAt}
  WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  statements.push(`INSERT OR IGNORE INTO \`quizzes\`
    (\`id\`,\`lesson_id\`,\`title\`,\`passing_score\`,\`max_attempts\`)
  SELECT ${sql(quizId)},${sql(quizLessonId)},${sql(`Module ${courseModule.number}: ${courseModule.title}`)},80,0
  WHERE EXISTS (SELECT 1 FROM \`lessons\` WHERE \`id\`=${sql(quizLessonId)});`);

  courseModule.quiz.forEach(([prompt, options, correctIndex, explanation, concept], questionIndex) => {
    statements.push(`INSERT OR IGNORE INTO \`quiz_questions\`
      (\`id\`,\`quiz_id\`,\`prompt\`,\`options_json\`,\`correct_index\`,\`explanation\`,\`concept_label\`,\`position\`)
    SELECT ${sql(`${quizId}-q${String(questionIndex + 1).padStart(2, "0")}`)},${sql(quizId)},${sql(prompt)},
      ${sql(JSON.stringify(options))},${correctIndex},${sql(explanation)},${sql(concept)},${questionIndex + 1}
    WHERE EXISTS (SELECT 1 FROM \`quizzes\` WHERE \`id\`=${sql(quizId)});`);
  });
}

const target = new URL("../drizzle/0050_crypto_mastery_foundations_production_batch_2.sql", import.meta.url);
await writeFile(target, `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log(`Wrote ${modules.length} modules, ${modules.length * 4} lessons and ${modules.reduce((total, courseModule) => total + courseModule.quiz.length, 0)} scored questions.`);
