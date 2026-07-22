import { writeFile } from "node:fs/promises";

const courseId = "cognizen-crypto-mastery-foundations-production";
const createdAt = 1785038400000;
const sources = {
  bitcoinTransactions: "https://developer.bitcoin.org/devguide/transactions.html",
  bitcoinPayments: "https://developer.bitcoin.org/devguide/payment_processing.html",
  ethereumTransactions: "https://ethereum.org/developers/docs/transactions/",
  ethereumScaling: "https://ethereum.org/developers/docs/scaling/",
  bisStablecoins: "https://www.bis.org/fsi/publ/insights57.htm",
  bisTrust: "https://www.bis.org/publ/arpdf/ar2026e3.htm",
  fsbReview: "https://www.fsb.org/uploads/P161025-1.pdf",
};

function experience(eyebrow, title, intro, scenes, activity, takeaway) {
  return { version: 1, eyebrow, title, intro, scenes, activity, takeaway };
}
function classify(title, prompt, buckets, cards) { return { kind: "classify", title, prompt, buckets, cards }; }
function branch(title, prompt, options) { return { kind: "branch", title, prompt, options }; }
function meter(title, prompt, dimensions, thresholds) { return { kind: "meter", title, prompt, dimensions, thresholds }; }

const modules = [
  {
    number: "1.17", position: 17, title: "Sending and Receiving Cryptocurrency",
    lessons: [
      {
        title: "Run a transfer pre-flight check",
        outcome: "Verify recipient, network, asset, address, amount, fee and memo before signing.",
        reference: `Bitcoin and Ethereum documentation describe transfers as signed instructions whose destination and value are encoded before broadcast. [Bitcoin transactions](${sources.bitcoinTransactions}) - [Ethereum transactions](${sources.ethereumTransactions})`,
        experience: experience("Transfer cockpit", "The safest transaction is the one checked before it exists", "Move through the exact fields that turn an intention into an irreversible network instruction.", [
          { id: "recipient", label: "Gate 1 - Recipient", title: "Confirm who controls the destination", body: "Obtain the address through a trusted channel. A name, QR code or clipboard entry can still point to an attacker.", metric: "Identity", tone: "blue" },
          { id: "network", label: "Gate 2 - Network", title: "Match sender, receiver and asset rails", body: "The same token name can exist on several networks. The receiving service must support the exact network selected.", metric: "Compatibility", tone: "red" },
          { id: "instruction", label: "Gate 3 - Instruction", title: "Read address, amount, fee and memo", body: "Compare the address beginning and end, verify units, and include a required destination tag or memo exactly.", metric: "Accuracy", tone: "orange" },
          { id: "authorise", label: "Gate 4 - Authorise", title: "Sign only the reviewed transaction", body: "The signature approves the encoded destination and amount. Customer support cannot edit the signed instruction later.", metric: "Final control", tone: "green" },
        ], classify("Which field failed?", "Assign each mistake to the control that would have caught it.", [
          { id: "recipient", label: "Recipient identity", description: "Who should receive" },
          { id: "network", label: "Network and asset", description: "Which rail and token" },
          { id: "details", label: "Transaction details", description: "Address, amount, fee or memo" },
        ], [
          { id: "s1", text: "A copied address belongs to an impersonator in a direct message.", bucketId: "recipient", feedback: "Verify the recipient through a trusted independent channel." },
          { id: "s2", text: "The exchange accepts the token only on another chain.", bucketId: "network", feedback: "Asset name alone does not establish network compatibility." },
          { id: "s3", text: "The address is correct but the required destination tag is blank.", bucketId: "details", feedback: "Shared exchange addresses may require a memo or tag to credit the account." },
          { id: "s4", text: "The amount uses the wrong decimal unit.", bucketId: "details", feedback: "Unit and amount belong in the final transaction preview." },
        ]), "Verify meaning first, syntax second. A perfectly valid transaction can still be sent to the wrong person or network."),
      },
      {
        title: "Use a test transaction as evidence",
        outcome: "Send and reconcile a small test before a significant transfer without treating the test as a universal guarantee.",
        reference: `Bitcoin payment guidance separates payment creation, broadcast and confirmation, allowing each stage to be independently checked. [Bitcoin payment processing](${sources.bitcoinPayments})`,
        experience: experience("Transfer rehearsal", "A small test buys information cheaply", "Run an end-to-end rehearsal from address request to recipient confirmation.", [
          { id: "request", label: "Step 1 - Request", title: "Recipient supplies address, network and memo", body: "The sender repeats the details back through the same agreed process and records the intended amount.", metric: "Shared intent", tone: "blue" },
          { id: "small", label: "Step 2 - Test", title: "Send an amount large enough to observe, small enough to lose", body: "The test validates address format, network support, fees and the recipient's crediting process.", metric: "Limited exposure", tone: "green" },
          { id: "reconcile", label: "Step 3 - Reconcile", title: "Check explorer and recipient account", body: "A transaction hash proves the network event. The recipient must separately confirm correct account credit.", metric: "Two systems", tone: "orange" },
          { id: "repeat", label: "Step 4 - Recheck", title: "Build the larger transfer fresh", body: "Clipboard malware, address rotation and changed network conditions mean the final transaction still needs full review.", metric: "No autopilot", tone: "red" },
        ], branch("The test arrived, but the recipient now sends a different address", "What should the sender do before the larger transfer?", [
          { id: "old", label: "Use the old address because the test proved it works.", verdict: "Changed instruction ignored", feedback: "The recipient may intentionally rotate addresses, but the new instruction must be verified." , tone: "risk" },
          { id: "new", label: "Use the new address immediately because it came from the same chat.", verdict: "Channel not independently verified", feedback: "A compromised account can substitute a new destination after the test." , tone: "caution" },
          { id: "verify", label: "Pause and independently verify why the address changed; retest if necessary.", verdict: "Evidence preserved", feedback: "The earlier test applies only to the earlier address and route.", tone: "good" },
        ]), "A test transaction validates one specific route at one point in time. It does not replace the final review."),
      },
      {
        title: "Diagnose transfer problems without making them worse",
        outcome: "Distinguish pending, failed, rejected, wrong-network and exchange-crediting problems.",
        reference: `Ethereum documents transaction hashes, pools, block inclusion and finalisation as distinct lifecycle stages. [Ethereum transactions](${sources.ethereumTransactions})`,
        experience: experience("Transfer triage", "First find the layer that failed", "Use a transaction identifier and the recipient's account status to choose the safest next step.", [
          { id: "notfound", label: "State 1 - Not found", title: "The transaction may never have broadcast", body: "Check the wallet's network, sender address and hash. Do not pay a stranger to recover a transaction that does not exist.", metric: "Broadcast", tone: "blue" },
          { id: "pending", label: "State 2 - Pending", title: "The network has seen it but not included it", body: "Low fees, congestion or nonce ordering can delay inclusion. Replacement rules vary by network and wallet.", metric: "Waiting", tone: "orange" },
          { id: "failed", label: "State 3 - Failed", title: "The chain executed or rejected under its rules", body: "A failed contract call may consume gas while reverting its requested state changes. Read the explorer outcome before retrying.", metric: "No intended state", tone: "red" },
          { id: "confirmed", label: "State 4 - Confirmed but uncredited", title: "The recipient platform has a separate process", body: "Correct network confirmation does not guarantee an exchange credits a missing memo or unsupported asset.", metric: "Platform issue", tone: "green" },
        ], meter("Rate transfer recoverability", "This is a diagnostic aid, not a promise that funds can be recovered.", [
          { id: "hash", label: "Transaction evidence", lowLabel: "No valid hash", highLabel: "Explorer-verified hash", weight: 1.2, initial: 35 },
          { id: "network", label: "Network match", lowLabel: "Unsupported", highLabel: "Exact network supported", weight: 1.3, initial: 30 },
          { id: "address", label: "Destination control", lowLabel: "Unknown", highLabel: "Recipient confirms control", weight: 1.3, initial: 40 },
          { id: "memo", label: "Memo or tag", lowLabel: "Missing when required", highLabel: "Correctly included", weight: 1.1, initial: 45 },
          { id: "support", label: "Legitimate support route", lowLabel: "Direct-message stranger", highLabel: "Official verified channel", weight: 1, initial: 25 },
        ], [
          { max: 39, label: "High loss risk", feedback: "Evidence or compatibility is missing. Stop sending additional funds and use only verified support routes.", tone: "risk" },
          { max: 69, label: "Diagnosis possible", feedback: "Some facts are known, but the responsible layer or recovery path remains uncertain.", tone: "caution" },
          { max: 100, label: "Well-evidenced case", feedback: "The records support a focused network or platform investigation, though recovery is not guaranteed.", tone: "good" },
        ]), "Never send another payment because an unsolicited recovery agent promises to unlock the first one."),
      },
    ],
    quiz: [
      ["What must match before a transfer?", ["Asset, sending network and receiving network support", "Only token symbol", "Only fiat price", "Screen colour"], 0, "Network and asset compatibility are essential to reliable crediting.", "Network compatibility"],
      ["Why may an exchange require a memo or destination tag?", ["To identify the customer behind a shared address", "To set market price", "To reveal a private key", "To remove fees"], 0, "The memo can route a shared deposit address to the correct internal account.", "Memos and tags"],
      ["What does signing approve?", ["The encoded transaction details", "A guaranteed refund", "The recipient's legal identity", "Future price"], 0, "The signature authorises the specific destination, amount and call data.", "Transaction signing"],
      ["What does a test transaction prove?", ["That one specific route worked at that time", "Every future address is safe", "The asset is valuable", "All transfers are reversible"], 0, "A test supplies limited operational evidence, not a universal guarantee.", "Test transfers"],
      ["What does a transaction hash identify?", ["A specific network transaction", "A wallet password", "An exchange licence", "A stablecoin reserve"], 0, "The hash is used to locate and inspect the network event.", "Transaction identifiers"],
      ["What can cause a transaction to remain pending?", ["Congestion or insufficient fee priority", "A correct confirmation", "A higher balance display", "A recovery phrase"], 0, "The transaction may wait in a pool until selected or dropped.", "Pending transactions"],
      ["Can a confirmed transaction remain uncredited by an exchange?", ["Yes, because platform processing and memo rules are separate", "No, never", "Only if the price falls", "Only on paper wallets"], 0, "The blockchain and receiving platform maintain separate processing states.", "Platform crediting"],
      ["What is the safest response to a recovery agent requesting another payment?", ["Pay immediately", "Stop and use only independently verified official channels", "Share the seed phrase", "Send to a new address they provide"], 1, "Unsolicited recovery offers are a common follow-on scam.", "Recovery scams"],
    ],
  },
  {
    number: "1.18", position: 18, title: "Blockchain Transactions and Confirmations",
    lessons: [
      {
        title: "Follow the transaction lifecycle",
        outcome: "Explain creation, signing, broadcast, validation, pool entry, block inclusion and finalisation.",
        reference: `Ethereum documents transaction fields and the path from signed instruction to pool, validated block and finalisation. [Ethereum transactions](${sources.ethereumTransactions})`,
        experience: experience("Lifecycle tracker", "Visible is not the same as settled", "Follow one instruction through the distinct states that wallets often compress into a single spinner.", [
          { id: "create", label: "Stage 1 - Create", title: "The wallet encodes an instruction", body: "Sender, destination, value, nonce, fee limits and optional contract data must satisfy the network's format.", metric: "Unsigned", tone: "blue" },
          { id: "sign", label: "Stage 2 - Sign", title: "The key holder authorises exact data", body: "A valid signature proves key authority; it does not prove the destination or application is trustworthy.", metric: "Authorised", tone: "orange" },
          { id: "pool", label: "Stage 3 - Broadcast", title: "Nodes validate and hold a pending candidate", body: "Invalid transactions can be rejected. Valid pending transactions compete for limited block space.", metric: "Pending", tone: "red" },
          { id: "block", label: "Stage 4 - Include", title: "A producer includes the transaction in a valid block", body: "The containing block provides the first confirmation or inclusion event under that network's terminology.", metric: "Included", tone: "green" },
          { id: "final", label: "Stage 5 - Finalise", title: "Later consensus makes reversal progressively harder", body: "Finality rules differ. Wallet labels and exchange deposit policies may require more evidence than one inclusion.", metric: "Higher confidence", tone: "blue" },
        ], classify("Name the transaction state", "Match the evidence to the lifecycle stage.", [
          { id: "local", label: "Created or signed", description: "Exists in the wallet" },
          { id: "pending", label: "Broadcast and pending", description: "Seen but not included" },
          { id: "included", label: "Included or confirmed", description: "Recorded in a block" },
          { id: "final", label: "Finalised", description: "Consensus reversal threshold reached" },
        ], [
          { id: "l1", text: "The wallet has raw signed data but no explorer can find the hash.", bucketId: "local", feedback: "The transaction may not have been broadcast successfully." },
          { id: "l2", text: "Nodes show it in their transaction pool.", bucketId: "pending", feedback: "It is visible but still awaiting block inclusion." },
          { id: "l3", text: "The transaction appears in block 1,234,567.", bucketId: "included", feedback: "The block provides inclusion evidence." },
          { id: "l4", text: "The network's finality rule has accepted the containing history.", bucketId: "final", feedback: "This is stronger than simple visibility or initial inclusion." },
        ]), "Use precise states. Created, broadcast, pending, included and finalised answer different questions."),
      },
      {
        title: "Treat confirmations as confidence, not legitimacy",
        outcome: "Explain why later accepted history reduces reversal risk without validating the asset, recipient or transaction purpose.",
        reference: `Bitcoin payment guidance discusses confirmation depth as protection against competing spends, while Ethereum describes justified and finalised blocks. [Bitcoin payments](${sources.bitcoinPayments}) - [Ethereum transactions](${sources.ethereumTransactions})`,
        experience: experience("Confidence ladder", "More confirmations strengthen history, not judgment", "Separate settlement evidence from every claim a transaction does not prove.", [
          { id: "zero", label: "Level 0 - Seen", title: "A pending transaction can still be replaced, rejected or dropped", body: "A recipient accepting zero-confirmation payment takes network-specific double-spend and propagation risk.", metric: "Low confidence", tone: "red" },
          { id: "one", label: "Level 1 - Included", title: "The transaction is inside an accepted block", body: "A short competing history or reorganisation may still matter under some consensus conditions.", metric: "Initial evidence", tone: "orange" },
          { id: "depth", label: "Level 2 - Deeper", title: "Later accepted blocks build on the history", body: "Replacing the transaction generally becomes harder as accepted depth increases.", metric: "Growing confidence", tone: "green" },
          { id: "boundary", label: "Boundary - Meaning", title: "Consensus does not verify the business story", body: "A confirmed scam payment, wrong-address transfer or worthless token is still confirmed.", metric: "Not legitimacy", tone: "blue" },
        ], branch("A token purchase has 30 confirmations, but the token contract was an impersonator", "What do the confirmations prove?", [
          { id: "legit", label: "The token must be legitimate because the chain confirmed it.", verdict: "Consensus overread", feedback: "The network confirms valid execution under protocol rules, not brand authenticity." , tone: "risk" },
          { id: "refund", label: "The network will refund the buyer after more confirmations.", verdict: "Finality misunderstood", feedback: "More accepted history generally makes the transfer harder to reverse." , tone: "caution" },
          { id: "execution", label: "The network accepted the transaction; the asset-verification failure remains separate.", verdict: "Correct boundary", feedback: "Settlement confidence and transaction legitimacy are independent questions.", tone: "good" },
        ]), "Confirmation answers 'Did the network accept this history?' It does not answer 'Was this a good or legitimate transaction?'"),
      },
      {
        title: "Use an explorer to diagnose status",
        outcome: "Read transaction hash, status, block, confirmations, fee, addresses and failure information without trusting a screenshot.",
        reference: `Transaction hashes and fields in official network documentation allow independent inspection of public status. [Ethereum transactions](${sources.ethereumTransactions}) - [Bitcoin transactions](${sources.bitcoinTransactions})`,
        experience: experience("Explorer lab", "Verify the public record directly", "Inspect a fictional transaction and decide which facts are on-chain and which still need platform evidence.", [
          { id: "identity", label: "Panel 1 - Identity", title: "Hash, network and block", body: "A hash is meaningful only on the correct network. Confirm the explorer and chain before interpreting the result.", metric: "Locate", tone: "blue" },
          { id: "flow", label: "Panel 2 - Flow", title: "Sender, destination, asset and amount", body: "Token transfers may appear in event logs rather than the native-value field. Contract interactions require more than one line.", metric: "Interpret", tone: "orange" },
          { id: "status", label: "Panel 3 - Status", title: "Pending, success or failure", body: "A successful receipt means the network accepted the state change. A failed receipt can still show a paid fee.", metric: "Outcome", tone: "green" },
          { id: "limits", label: "Panel 4 - Limits", title: "No legal identity or exchange account mapping", body: "The explorer cannot usually prove who legally controls an address or why a custodial platform has not credited it.", metric: "Boundary", tone: "red" },
        ], meter("Rate the evidence quality", "Raise the score only when the learner independently verified the correct network record.", [
          { id: "explorer", label: "Explorer source", lowLabel: "Screenshot", highLabel: "Official trusted explorer", weight: 1.1, initial: 35 },
          { id: "network", label: "Network identity", lowLabel: "Assumed", highLabel: "Confirmed", weight: 1.3, initial: 30 },
          { id: "hash", label: "Transaction hash", lowLabel: "Missing", highLabel: "Exact match", weight: 1.2, initial: 40 },
          { id: "status", label: "Status interpretation", lowLabel: "Icon only", highLabel: "Block and receipt read", weight: 1.2, initial: 35 },
          { id: "boundary", label: "Off-chain boundary", lowLabel: "Ignored", highLabel: "Platform evidence separated", weight: 1, initial: 25 },
        ], [
          { max: 39, label: "Weak transaction evidence", feedback: "The learner may be looking at the wrong network, a fabricated screenshot or an incomplete status.", tone: "risk" },
          { max: 69, label: "Partial verification", feedback: "The transaction is located, but status or off-chain processing needs clearer evidence.", tone: "caution" },
          { max: 100, label: "Strong public verification", feedback: "The on-chain facts are independently established and their limits are understood.", tone: "good" },
        ]), "Use the explorer as a ledger window, not as a guarantee of identity, value or customer-service outcome."),
      },
    ],
    quiz: [
      ["What is a blockchain transaction?", ["A signed instruction requesting a state change", "A guaranteed payment refund", "A market forecast", "A password reset"], 0, "Transactions encode and authorise state-changing instructions.", "Transactions"],
      ["What happens after broadcast but before block inclusion?", ["The transaction may wait in a pool", "It is legally final everywhere", "The private key becomes public", "The fee is always refunded"], 0, "Valid transactions can remain pending while competing for block space.", "Mempool"],
      ["What is the first confirmation generally associated with?", ["Inclusion in an accepted block", "Creating the wallet", "Reading a quote", "Opening an exchange account"], 0, "Block inclusion supplies initial confirmation evidence.", "Confirmations"],
      ["Why do additional confirmations matter?", ["They generally make history replacement harder", "They prove legal ownership", "They guarantee asset value", "They identify every user"], 0, "Later accepted history raises reversal difficulty under the network's rules.", "Confirmation depth"],
      ["Is confirmation identical to finality?", ["Always", "No, finality rules and terminology differ by network", "Only for failed transactions", "Only on exchanges"], 1, "Initial inclusion and stronger finality are distinct concepts.", "Finality"],
      ["What can an explorer verify?", ["Public transaction status and fields", "The legal identity behind every address", "Future price", "Exchange solvency"], 0, "Explorers expose public ledger data, not every off-chain fact.", "Explorers"],
      ["Can a failed Ethereum transaction consume gas?", ["Yes, computation can be charged before the revert", "No, never", "Only if the recipient refunds it", "Only when no signature exists"], 0, "Execution resources can be used even when state changes revert.", "Failed transactions"],
      ["What do many confirmations not prove?", ["That the recorded transaction is legitimate or valuable", "That the transaction is in accepted history", "That a hash exists", "That a block includes data"], 0, "Consensus evidence does not validate the transaction's business purpose.", "Claim boundaries"],
    ],
  },
  {
    number: "1.19", position: 19, title: "Network Fees and Gas Fees",
    lessons: [
      {
        title: "Separate network, platform and execution costs",
        outcome: "Distinguish Bitcoin fee rate and transaction size, Ethereum gas, exchange withdrawal fees and application charges.",
        reference: `Bitcoin fees depend on signed transaction size and block-space demand; Ethereum fees depend on gas used and fee per gas. [Bitcoin transactions](${sources.bitcoinTransactions}) - [Ethereum transactions](${sources.ethereumTransactions})`,
        experience: experience("Fee anatomy", "One screen can combine four unrelated costs", "Break a withdrawal and contract interaction into the actor charging each component.", [
          { id: "bitcoin", label: "Model 1 - Bitcoin", title: "Fee rate multiplied by transaction data size", body: "The amount sent does not directly determine size. More inputs can make a small-value payment use more block space.", metric: "Sats per data unit", tone: "blue" },
          { id: "ethereum", label: "Model 2 - Ethereum", title: "Gas used multiplied by the effective fee per gas", body: "Simple transfers and complex contract calls consume different computation and storage resources.", metric: "Computation", tone: "green" },
          { id: "platform", label: "Model 3 - Platform", title: "A custodian sets its own withdrawal charge", body: "The platform fee can exceed, subsidise or bundle the current network fee.", metric: "Provider price", tone: "orange" },
          { id: "app", label: "Model 4 - Application", title: "Protocols may add swap, routing or service fees", body: "Application charges are separate from gas and must be included in total cost.", metric: "Service fee", tone: "red" },
        ], classify("Who or what charges it?", "Classify each cost by its direct origin.", [
          { id: "network", label: "Network fee", description: "Block space or computation" },
          { id: "platform", label: "Platform fee", description: "Custodian or venue" },
          { id: "application", label: "Application fee", description: "Protocol or service" },
        ], [
          { id: "f1", text: "A Bitcoin transaction with many inputs has more signed data.", bucketId: "network", feedback: "More data can require a higher total network fee at the same fee rate." },
          { id: "f2", text: "An exchange quotes a fixed withdrawal charge.", bucketId: "platform", feedback: "The venue sets this price independently of the protocol." },
          { id: "f3", text: "A swap pool deducts 0.3% from the trade.", bucketId: "application", feedback: "That is a protocol-level trading fee." },
          { id: "f4", text: "A smart-contract call consumes additional EVM operations.", bucketId: "network", feedback: "Execution complexity increases gas used." },
        ]), "Ask who receives each fee and what resource or service it pays for."),
      },
      {
        title: "Read an Ethereum gas quote",
        outcome: "Explain gas used, gas limit, base fee, priority fee, maximum fee and refund of unused gas.",
        reference: `Ethereum documents gasLimit, maxFeePerGas, maxPriorityFeePerGas and the transaction lifecycle. [Ethereum transactions](${sources.ethereumTransactions})`,
        experience: experience("Gas console", "Limit is capacity, not necessarily cost", "Inspect a type-2 transaction without confusing its maximum values with the final fee.", [
          { id: "used", label: "Field 1 - Gas used", title: "Actual computation consumed", body: "Contract paths and storage updates determine how many gas units execution needs.", metric: "Work performed", tone: "blue" },
          { id: "limit", label: "Field 2 - Gas limit", title: "Maximum units the transaction may consume", body: "Unused gas is not consumed. Too little can cause out-of-gas failure after computation has begun.", metric: "Safety ceiling", tone: "orange" },
          { id: "base", label: "Field 3 - Base fee", title: "Network-priced fee per gas", body: "The protocol adjusts the base fee with demand. On Ethereum it is burned rather than paid to the validator.", metric: "Demand", tone: "red" },
          { id: "priority", label: "Field 4 - Priority and maximum", title: "Inclusion incentive and total ceiling", body: "The priority fee rewards the validator; maxFeePerGas caps what the sender is willing to pay per gas.", metric: "User bounds", tone: "green" },
        ], branch("The estimated gas limit doubles but expected gas used stays the same", "What is the most accurate interpretation?", [
          { id: "double", label: "The final fee must double.", verdict: "Limit confused with use", feedback: "The limit is a ceiling; unused gas is not charged as consumed gas." , tone: "risk" },
          { id: "free", label: "The transaction becomes free.", verdict: "Fee mechanics ignored", feedback: "Actual gas used still multiplies by the effective fee per gas." , tone: "caution" },
          { id: "ceiling", label: "The execution has more headroom; final cost still depends on gas actually used and effective fee.", verdict: "Correct distinction", feedback: "Read the maximum exposure and expected execution separately.", tone: "good" },
        ]), "Gas limit answers 'How much work may this consume?' Gas used answers 'How much work did it consume?'"),
      },
      {
        title: "Manage fees without creating a security failure",
        outcome: "Choose timing, batching, Layer 2 or replacement methods while preserving network and transaction safety.",
        reference: `Ethereum explains that rollups batch activity and can reduce user fees while adding their own fee components and withdrawal assumptions. [Ethereum scaling](${sources.ethereumScaling})`,
        experience: experience("Fee planner", "Cheaper is useful only when the route remains correct", "Compare ways to reduce cost without switching blindly to an unsupported network or scam service.", [
          { id: "timing", label: "Control 1 - Timing", title: "Non-urgent transactions can wait for lower demand", body: "Fee estimates change. The learner must still understand pending and replacement behaviour.", metric: "Flexible", tone: "blue" },
          { id: "batch", label: "Control 2 - Structure", title: "Batching and input management can reduce overhead", body: "The available method depends on the wallet, asset and transaction model.", metric: "Efficient", tone: "green" },
          { id: "layer2", label: "Control 3 - Scaling", title: "Layer 2 can lower execution cost", body: "The recipient must support the exact Layer 2, and bridges, sequencers and exits add separate risk.", metric: "New assumptions", tone: "orange" },
          { id: "scam", label: "Control 4 - Safety", title: "No service needs a seed phrase to lower gas", body: "Fee-refund, stuck-transaction and airdrop sites can use urgency to solicit secrets or malicious signatures.", metric: "Stop signal", tone: "red" },
        ], meter("Rate the fee plan", "Higher means the plan reduces avoidable cost without bypassing safety checks.", [
          { id: "urgency", label: "Timing flexibility", lowLabel: "Must send now", highLabel: "Can wait and compare", weight: 1, initial: 35 },
          { id: "estimate", label: "Fee visibility", lowLabel: "Unknown", highLabel: "Total cost previewed", weight: 1.2, initial: 40 },
          { id: "support", label: "Destination support", lowLabel: "Assumed", highLabel: "Exact network confirmed", weight: 1.3, initial: 30 },
          { id: "replacement", label: "Pending plan", lowLabel: "Improvised", highLabel: "Wallet-supported method understood", weight: 1.1, initial: 20 },
          { id: "security", label: "Security boundary", lowLabel: "Third-party recovery link", highLabel: "No secret or blind signature", weight: 1.3, initial: 45 },
        ], [
          { max: 39, label: "Cheap route, high risk", feedback: "Cost reduction is undermining network compatibility or signing safety.", tone: "risk" },
          { max: 69, label: "Usable with gaps", feedback: "The fee is understood, but destination or replacement handling needs stronger evidence.", tone: "caution" },
          { max: 100, label: "Purpose-fit fee plan", feedback: "The learner has balanced urgency, total cost, compatibility and security.", tone: "good" },
        ]), "Never save a small fee by creating a large recovery problem."),
      },
    ],
    quiz: [
      ["What primarily determines a Bitcoin transaction fee?", ["Signed transaction size and fee rate", "The fiat value sent", "Wallet colour", "Recipient age"], 0, "Bitcoin block-space use depends on transaction data size, not only value.", "Bitcoin fees"],
      ["What does Ethereum gas measure?", ["Computational work", "Token legitimacy", "Exchange solvency", "Legal ownership"], 0, "Gas units meter execution and storage operations.", "Gas"],
      ["What is gas limit?", ["Maximum gas units allowed", "Guaranteed final fee", "Minimum token price", "Exchange withdrawal delay"], 0, "It is an execution ceiling rather than gas necessarily consumed.", "Gas limit"],
      ["What is gas used?", ["Actual execution work consumed", "The wallet password", "The quoted token price", "A stablecoin reserve"], 0, "Final network cost depends on actual gas used and effective fee per gas.", "Gas used"],
      ["Can a failed contract transaction cost gas?", ["Yes", "No", "Only if unsigned", "Only after a refund"], 0, "The network performed work before the failure or revert.", "Failed execution"],
      ["Is an exchange withdrawal fee the same as the network fee?", ["Always", "No, the platform sets its own charge", "Only on Bitcoin", "Only when free"], 1, "The venue may price withdrawals independently of current protocol cost.", "Platform fees"],
      ["Why can Layer 2 be cheaper?", ["It batches activity and uses more capacity", "It eliminates every dependency", "It guarantees token value", "It removes signatures"], 0, "Rollups aggregate transactions but introduce route-specific assumptions.", "Scaling fees"],
      ["What should a fee-recovery service never request?", ["A public transaction hash", "A seed phrase or blind wallet signature", "The network name", "A public address"], 1, "Secrets and unexplained signatures can transfer authority rather than fix fees.", "Fee scams"],
    ],
  },
  {
    number: "1.20", position: 20, title: "Stablecoins",
    lessons: [
      {
        title: "Classify the stabilisation model",
        outcome: "Distinguish reserve-backed, crypto-collateralised, algorithmic and commodity-linked stablecoins.",
        reference: `BIS analysis emphasises that stablecoin designs rely on different reserve, collateral, governance and redemption arrangements. [BIS stablecoin regulation](${sources.bisStablecoins})`,
        experience: experience("Stability engine", "The same one-dollar target can hide entirely different risks", "Inspect what supports each peg and who can create or redeem the token.", [
          { id: "fiat", label: "Model 1 - Fiat reserve", title: "Issuer holds assets and promises redemption", body: "Safety depends on reserve quality, custody, liabilities, legal rights, liquidity and the issuer's operations.", metric: "Issuer-backed", tone: "blue" },
          { id: "crypto", label: "Model 2 - Crypto collateral", title: "On-chain collateral exceeds issued value", body: "Volatile collateral, oracle data and liquidation mechanisms try to protect the peg during market stress.", metric: "Overcollateralised", tone: "green" },
          { id: "algorithmic", label: "Model 3 - Algorithmic", title: "Incentives and supply adjustment defend the target", body: "Confidence can become reflexive: falling demand weakens the mechanism designed to restore demand.", metric: "Reflexive", tone: "red" },
          { id: "commodity", label: "Model 4 - Commodity claim", title: "A token references custody of an external asset", body: "Verification, storage, fees, legal title and redemption location determine the real claim.", metric: "Off-chain asset", tone: "orange" },
        ], classify("What supports the peg?", "Classify each fictional design by its principal stabilisation mechanism.", [
          { id: "reserve", label: "Fiat-reserve backed", description: "Issuer and reserve assets" },
          { id: "crypto", label: "Crypto-collateralised", description: "On-chain collateral and liquidation" },
          { id: "algorithm", label: "Algorithmic", description: "Incentives and supply mechanics" },
          { id: "commodity", label: "Commodity-linked", description: "Claim on stored external asset" },
        ], [
          { id: "st1", text: "Cash and short government instruments back redeemable tokens.", bucketId: "reserve", feedback: "The issuer's reserve and redemption structure support the target." },
          { id: "st2", text: "Vaults lock volatile assets above the debt value and liquidate when ratios fall.", bucketId: "crypto", feedback: "Overcollateralisation and liquidation defend the peg." },
          { id: "st3", text: "A paired token expands and contracts supply through market incentives.", bucketId: "algorithm", feedback: "The mechanism relies on continuing incentive and market confidence." },
          { id: "st4", text: "Each token claims a measured quantity of vaulted gold.", bucketId: "commodity", feedback: "The peg depends on external custody and enforceable redemption." },
        ]), "Do not analyse a stablecoin by ticker alone. Identify the stabilisation engine and every dependency behind it."),
      },
      {
        title: "Stress-test the peg and redemption loop",
        outcome: "Explain how minting, redemption, arbitrage, reserves and market liquidity maintain or break a peg.",
        reference: `BIS states that credible money-like stablecoins require reliable par redemption, low-risk reserves and operational capacity during stress. [BIS annual report 2026](${sources.bisTrust})`,
        experience: experience("Peg stress test", "A market price near one is the output of a functioning redemption system", "Push a fictional stablecoin through ordinary arbitrage and a mass-redemption shock.", [
          { id: "mint", label: "Normal 1 - Mint", title: "Eligible users deliver reserve value and receive tokens", body: "Issuance should increase reserves and liabilities together under clear legal and operational rules.", metric: "Creation", tone: "blue" },
          { id: "redeem", label: "Normal 2 - Redeem", title: "Tokens return for the reference asset", body: "Accessible redemption helps anchor secondary-market price near the peg, subject to eligibility, timing and fees.", metric: "Anchor", tone: "green" },
          { id: "arbitrage", label: "Normal 3 - Arbitrage", title: "Price differences motivate minting or redemption", body: "Arbitrage works only if traders trust the process and can move assets through functioning markets.", metric: "Price pressure", tone: "orange" },
          { id: "run", label: "Stress 4 - Run", title: "Many holders demand cash at once", body: "Illiquid or risky reserves, banking disruption, unclear rights or operational limits can delay redemption and deepen depegging.", metric: "Run risk", tone: "red" },
        ], branch("A stablecoin trades at 0.94 and direct redemption is suspended", "What is the strongest conclusion?", [
          { id: "cheap", label: "It is automatically a bargain because the peg must return.", verdict: "Design intent mistaken for guarantee", feedback: "The broken redemption channel may signal reserve, liquidity, legal or operational stress." , tone: "risk" },
          { id: "gone", label: "It is certainly permanently worthless.", verdict: "Evidence overclaimed", feedback: "The discount is serious evidence, but the eventual outcome depends on reserves, rights and restoration." , tone: "caution" },
          { id: "stress", label: "Treat the peg as impaired and investigate reserves, redemption rights, liquidity and cause.", verdict: "Correct risk response", feedback: "The market price and redemption mechanism must be assessed together.", tone: "good" },
        ]), "A peg is maintained by credible conversion and liquidity. The word stable does not compel the market price."),
      },
      {
        title: "Audit a stablecoin before using it",
        outcome: "Evaluate legal claim, reserve assets, disclosures, redemption, liquidity, contract controls, networks and yield dependencies.",
        reference: `FSB and Basel work emphasise conservative reserves, liquidity, transparent governance, disclosure, independent verification and credible redemption. [FSB review](${sources.fsbReview}) - [BIS](${sources.bisStablecoins})`,
        experience: experience("Stablecoin audit", "Stability is a chain of promises and mechanisms", "Rate the weakest link rather than averaging away a critical failure.", [
          { id: "claim", label: "Check 1 - Claim", title: "Who owes the holder what?", body: "Terms should identify the issuer, governing law, eligible redeemers, fees, timing and holder rights during insolvency.", metric: "Legal route", tone: "blue" },
          { id: "reserve", label: "Check 2 - Reserve", title: "What assets exist and who controls them?", body: "Quality, maturity, concentration, custody, encumbrance and liabilities determine whether reserves can meet redemptions.", metric: "Backing", tone: "green" },
          { id: "evidence", label: "Check 3 - Evidence", title: "How often and independently is the system verified?", body: "An attestation or snapshot has a scope and date. Read what it does not test as carefully as what it does.", metric: "Disclosure", tone: "orange" },
          { id: "market", label: "Check 4 - Use", title: "Which network, contract and liquidity route?", body: "Bridged versions, smart-contract controls, freezes, exchange concentration and thin markets create risks beyond the reserve.", metric: "Operating route", tone: "red" },
        ], meter("Rate the stablecoin evidence", "This does not recommend holding the token. It identifies where the stability claim depends on trust.", [
          { id: "rights", label: "Redemption rights", lowLabel: "No direct claim", highLabel: "Clear enforceable par route", weight: 1.3, initial: 25 },
          { id: "reserves", label: "Reserve quality", lowLabel: "Opaque or risky", highLabel: "Liquid conservative assets", weight: 1.4, initial: 30 },
          { id: "verification", label: "Independent evidence", lowLabel: "Marketing claim", highLabel: "Frequent scoped verification", weight: 1.2, initial: 30 },
          { id: "liquidity", label: "Market liquidity", lowLabel: "Thin and concentrated", highLabel: "Deep across credible venues", weight: 1, initial: 40 },
          { id: "route", label: "Contract and network", lowLabel: "Unverified bridge", highLabel: "Official contract and route", weight: 1.2, initial: 35 },
        ], [
          { max: 39, label: "Fragile stability claim", feedback: "A weak redemption, reserve or route can dominate every other strength.", tone: "risk" },
          { max: 69, label: "Conditional stability", feedback: "The peg has support, but material legal, reserve or operating assumptions remain.", tone: "caution" },
          { max: 100, label: "Stronger evidence profile", feedback: "Multiple stabilisation controls are visible, though depeg, counterparty and regulatory risk remain.", tone: "good" },
        ]), "Evaluate the token, the issuer, the reserve, the legal claim and the exact blockchain route as separate objects."),
      },
    ],
    quiz: [
      ["What is a stablecoin?", ["A token designed to track a reference value", "A guaranteed bank deposit", "A hardware wallet", "A mining algorithm"], 0, "Stable describes the design target, not a guaranteed outcome.", "Stablecoin definition"],
      ["What is a peg?", ["The target relationship to a reference asset", "A wallet PIN", "A transaction hash", "An exchange licence"], 0, "A dollar stablecoin typically targets a price near one dollar.", "Peg"],
      ["What primarily supports a fiat-backed stablecoin?", ["Issuer reserves and redemption arrangements", "Only token demand", "Mining difficulty", "A recovery phrase"], 0, "Reserve assets and credible conversion support the peg.", "Fiat-backed model"],
      ["Why can crypto-collateralised stablecoins require overcollateralisation?", ["Collateral is volatile", "Gas is always free", "Addresses expire", "Tokens have no contracts"], 0, "Extra collateral creates a buffer against price declines.", "Crypto collateral"],
      ["Why can an algorithmic design become reflexive?", ["Falling confidence can weaken the incentives defending the peg", "It has cash by definition", "It guarantees redemption", "It eliminates markets"], 0, "The mechanism may depend on continuing demand for a paired or governance asset.", "Algorithmic risk"],
      ["What does depegging mean?", ["The market price materially departs from its target", "The wallet disconnects", "The blockchain stops", "The issuer changes its logo"], 0, "A depeg is evidence that stabilisation or market confidence is under stress.", "Depegging"],
      ["Why is reserve disclosure alone insufficient?", ["Rights, liabilities, liquidity, custody and redemption also matter", "Reserves never matter", "Disclosure guarantees everything", "Only token price matters"], 0, "Stability depends on the full claim and operating structure.", "Stablecoin evidence"],
      ["Is a stablecoin the same as a central bank digital currency?", ["Always", "No, stablecoins are generally privately issued tokens", "Only on Ethereum", "Only when depegged"], 1, "Issuer, legal status and liability structure differ fundamentally.", "Stablecoins and CBDCs"],
    ],
  },
];

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}
function lessonContent(lesson) {
  return `## Your outcome\n\n${lesson.outcome}\n\n## Source-backed reference notes\n\n${lesson.reference}\n\n## How to use this lesson\n\nPlay the guided story and complete the decision activity before opening the notes. Use only fictional transaction details. This education does not provide financial, legal or tax advice.`;
}

const statements = [`UPDATE \`courses\` SET
  \`description\`='Twenty production-quality modules from the Digital Assets pathway. Every module uses guided stories, decision labs, source-backed notes and scored assessments; later source modules remain excluded until they pass the same standard.',
  \`updated_at\`=${createdAt}
WHERE \`id\`=${sql(courseId)};`];

for (const courseModule of modules) {
  const sectionId = `cmf-module-${courseModule.number.replace(".", "-")}`;
  statements.push(`INSERT OR IGNORE INTO \`course_sections\` (\`id\`,\`course_id\`,\`title\`,\`position\`,\`created_at\`)
SELECT ${sql(sectionId)},${sql(courseId)},${sql(`Module ${courseModule.number}: ${courseModule.title}`)},${courseModule.position},${createdAt}
WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  courseModule.lessons.forEach((lesson, index) => {
    const lessonId = `${sectionId}-lesson-${String(index + 1).padStart(2, "0")}`;
    statements.push(`INSERT OR IGNORE INTO \`lessons\` (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`)
    SELECT ${sql(lessonId)},${sql(courseId)},${sql(sectionId)},${sql(lesson.title)},'interactive',${sql(lessonContent(lesson))},'markdown',6,0,0,0,'',${sql(JSON.stringify(lesson.experience))},${index + 1},${createdAt}
    WHERE EXISTS (SELECT 1 FROM \`courses\` WHERE \`id\`=${sql(courseId)});`);
  });
  const quizLessonId = `${sectionId}-lesson-04`;
  const quizId = `${sectionId}-quiz`;
  statements.push(`INSERT OR IGNORE INTO \`lessons\` (\`id\`,\`course_id\`,\`section_id\`,\`title\`,\`lesson_type\`,\`content\`,\`content_format\`,\`duration_minutes\`,\`is_preview\`,\`available_after_days\`,\`required_watch_percent\`,\`transcript\`,\`experience_json\`,\`position\`,\`updated_at\`)
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

const target = new URL("../drizzle/0053_crypto_mastery_foundations_production_batch_5.sql", import.meta.url);
await writeFile(target, `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log(`Wrote ${modules.length} modules, ${modules.length * 4} lessons and ${modules.reduce((total, item) => total + item.quiz.length, 0)} scored questions.`);
