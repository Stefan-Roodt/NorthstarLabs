import { writeFile } from "node:fs/promises";

const courseId = "cognizen-crypto-mastery-foundations-production";
const createdAt = 1785211200000;
const sources = {
  cisaMfa: "https://www.cisa.gov/more-password",
  cisaStrongMfa: "https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/require-multifactor-authentication",
  ethereumScams: "https://ethereum.org/community/support/scams/",
  ftcCrypto: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-scams",
  ic3Exchange: "https://www.ic3.gov/PSA/2024/PSA240801",
  ic3Investment: "https://www.ic3.gov/CrimeInfo/Investment",
  fscaWarning: "https://www.fsca.co.za/News%20Documents/FSCA%20Press%20Release%20-%20FSCA%20public%20warning%20Surge%20in%20impersonation%20and%20fraudulent%20investment%20schemes.pdf",
  ioscoRisk: "https://www.iosco.org/library/pubdocs/pdf/IOSCOPD769.pdf",
  sarsCrypto: "https://www.sars.gov.za/individuals/crypto-assets-tax/",
};

const experience = (eyebrow, title, intro, scenes, activity, takeaway) => ({ version: 1, eyebrow, title, intro, scenes, activity, takeaway });
const classify = (title, prompt, buckets, cards) => ({ kind: "classify", title, prompt, buckets, cards });
const branch = (title, prompt, options) => ({ kind: "branch", title, prompt, options });
const meter = (title, prompt, dimensions, thresholds) => ({ kind: "meter", title, prompt, dimensions, thresholds });

const modules = [
  {
    number: "1.25", position: 25, title: "Cryptocurrency Security Best Practices",
    lessons: [
      {
        title: "Build an account defence stack",
        outcome: "Protect email, exchange and device access with independent controls rather than one ‘strong’ password.",
        reference: `CISA recommends unique credentials and MFA, with phishing-resistant FIDO or security keys stronger than SMS codes. [More than a password](${sources.cisaMfa}) - [MFA hierarchy](${sources.cisaStrongMfa})`,
        experience: experience("Security control room", "Protect the recovery path, not only the crypto account", "Trace how an attacker moves from email or phone compromise to exchange withdrawal.", [
          { id: "email", label: "Layer 1 - Email", title: "Secure the master recovery account", body: "Use a unique password, strong MFA, reviewed recovery methods and alerts. A protected exchange can still be reset through weak email.", metric: "Recovery root", tone: "blue" },
          { id: "mfa", label: "Layer 2 - Authentication", title: "Prefer phishing-resistant MFA", body: "A security key or passkey resists fake login pages. Authenticator codes are generally stronger than SMS, which remains exposed to SIM swaps.", metric: "Second factor", tone: "orange" },
          { id: "withdraw", label: "Layer 3 - Movement", title: "Whitelist destinations and review sessions", body: "Withdrawal delays, address allowlists and device alerts can limit damage after credentials are stolen.", metric: "Loss barrier", tone: "red" },
          { id: "device", label: "Layer 4 - Device", title: "Patch, lock and reduce attack surface", body: "Untrusted extensions, pirated software and remote-access tools can observe credentials or replace addresses after login.", metric: "Endpoint trust", tone: "green" },
        ], classify("Which layer would have interrupted the attack?", "Match each control failure to its strongest defensive layer.", [
          { id: "identity", label: "Identity and email", description: "Credentials and recovery" },
          { id: "movement", label: "Withdrawal control", description: "Destination and delay" },
          { id: "device", label: "Device hygiene", description: "Software and sessions" },
        ], [
          { id: "s1", text: "A reused password from another breach opens the email account.", bucketId: "identity", feedback: "Unique credentials and MFA protect the recovery root." },
          { id: "s2", text: "A new destination receives funds seconds after account takeover.", bucketId: "movement", feedback: "Allowlisting and withdrawal delay can create a final barrier." },
          { id: "s3", text: "A browser extension silently substitutes a pasted address.", bucketId: "device", feedback: "Reduce extensions and verify destination on an independent display." },
          { id: "s4", text: "A SIM swap intercepts SMS codes.", bucketId: "identity", feedback: "Use a stronger factor that is not controlled by the phone number." },
        ]), "Security is layered: assume one control may fail and make the next control independently useful."),
      },
      {
        title: "Verify the transaction before signing",
        outcome: "Separate storage, spending and application wallets and inspect the actual permission being authorised.",
        reference: `Ethereum warns that malicious token approvals can continue draining assets and recommends moving remaining funds and revoking compromised approvals. [Scam response guidance](${sources.ethereumScams})`,
        experience: experience("Signing chamber", "A hardware wallet protects keys—not judgment", "Treat every signature as a permission request with a scope, counterparty and consequence.", [
          { id: "separate", label: "Control 1 - Separate", title: "Give wallets different jobs", body: "Keep long-term storage away from routine transfers, dapps and experiments so one bad interaction cannot reach everything.", metric: "Blast radius", tone: "blue" },
          { id: "origin", label: "Control 2 - Verify", title: "Reach the service independently", body: "Bookmarks and independently checked contract addresses reduce exposure to fake ads, cloned sites and impersonated support.", metric: "Authenticity", tone: "orange" },
          { id: "meaning", label: "Control 3 - Understand", title: "Read asset, amount, spender and approval scope", body: "An unlimited approval can authorise future transfers. A vague signature may authenticate or grant rights beyond the visible button.", metric: "Permission", tone: "red" },
          { id: "display", label: "Control 4 - Confirm", title: "Compare the trusted-device display", body: "Approve only details independently shown by the signing device. Reject blind or unclear requests.", metric: "Final check", tone: "green" },
        ], branch("A familiar dapp asks for unlimited token approval from a wallet holding long-term savings", "What is the safest action?", [
          { id: "approve", label: "Approve because the brand is familiar.", verdict: "Permission scope ignored", feedback: "A compromised frontend or contract can misuse a broad allowance.", tone: "risk" },
          { id: "hardware", label: "Approve because a hardware wallet makes the request safe.", verdict: "Key protection confused with intent", feedback: "The device signs what the user authorises, including harmful permissions.", tone: "caution" },
          { id: "limit", label: "Use a separate application wallet and grant only the amount needed after verifying the contract.", verdict: "Exposure constrained", feedback: "Separation and least privilege reduce both likelihood and impact.", tone: "good" },
        ]), "Never sign a permission you cannot explain in plain language."),
      },
      {
        title: "Respond to a suspected compromise",
        outcome: "Choose immediate actions for credential theft, seed exposure, malicious approvals and confirmed loss.",
        reference: `Ethereum’s incident guidance prioritises moving remaining funds, revoking approvals, changing linked passwords and enabling MFA; it also warns against recovery-fee scams. [Scam help](${sources.ethereumScams})`,
        experience: experience("Incident triage", "Contain first, investigate second", "Identify the compromised authority before taking actions that may expose more funds.", [
          { id: "account", label: "Incident - Account", title: "Secure email and exchange access", body: "Use a clean device, change unique passwords, revoke sessions, strengthen MFA and contact support through independently verified channels.", metric: "Identity", tone: "blue" },
          { id: "seed", label: "Incident - Seed", title: "Treat the wallet as permanently exposed", body: "Create a fresh wallet on a trusted device and move remaining assets. Changing an app password does not change the compromised keys.", metric: "Key authority", tone: "red" },
          { id: "approval", label: "Incident - Approval", title: "Revoke permissions and isolate assets", body: "A malicious spender can retain authority after the first transaction. Inspect allowances and avoid reconnecting through suspicious links.", metric: "Contract authority", tone: "orange" },
          { id: "evidence", label: "Incident - Loss", title: "Preserve evidence and report quickly", body: "Record transaction hashes, addresses, URLs, messages and times. Do not pay unsolicited recovery agents.", metric: "Response", tone: "green" },
        ], meter("Rate response readiness", "Score the documented process—not confidence that theft can be reversed.", [
          { id: "clean", label: "Clean recovery device", lowLabel: "Unknown", highLabel: "Ready", weight: 1.2, initial: 30 },
          { id: "contacts", label: "Verified support routes", lowLabel: "Search or DM", highLabel: "Pre-recorded", weight: 1.2, initial: 35 },
          { id: "backup", label: "Secure fresh-wallet process", lowLabel: "Improvised", highLabel: "Rehearsed", weight: 1.3, initial: 30 },
          { id: "records", label: "Evidence records", lowLabel: "None", highLabel: "Complete", weight: 1, initial: 40 },
          { id: "boundaries", label: "Recovery-scam boundary", lowLabel: "Will pay", highLabel: "No unsolicited fees", weight: 1.2, initial: 35 },
        ], [
          { max: 39, label: "Response likely to spread harm", feedback: "Improvised channels or devices may expose more credentials and assets.", tone: "risk" },
          { max: 69, label: "Partial response plan", feedback: "Containment is possible, but important contacts, clean tools or evidence steps are missing.", tone: "caution" },
          { max: 100, label: "Prepared to contain", feedback: "The response distinguishes account, key and contract compromise and preserves evidence.", tone: "good" },
        ]), "A compromised seed is not repaired by changing a password. Replace the authority, not merely the interface."),
      },
    ],
    quiz: [
      ["Why must the email account be strongly protected?", ["It can reset linked financial accounts", "It stores blockchain coins", "It sets token prices", "It confirms blocks"], 0, "Email is often the recovery root for exchange access.", "Recovery security"],
      ["Which MFA is most resistant to fake login pages?", ["FIDO security key or passkey", "SMS code", "Security question", "Email link"], 0, "Origin-bound FIDO authentication resists credential capture on lookalike sites.", "Phishing-resistant MFA"],
      ["What does withdrawal allowlisting reduce?", ["Ability to send to a newly added attacker address", "Market volatility", "Network fees", "Token supply"], 0, "It adds a movement control after login compromise.", "Withdrawal controls"],
      ["What does a hardware wallet not guarantee?", ["That the transaction or permission is wise", "That keys remain inside the device", "That a signature can be produced", "That details may be displayed"], 0, "Secure key storage cannot judge the user’s intended counterparty.", "Signing judgment"],
      ["Why use separate wallets for storage and dapps?", ["To limit the blast radius of one harmful interaction", "To raise token prices", "To remove taxes", "To make seeds public"], 0, "Compartmentalisation prevents one application permission reaching every asset.", "Wallet separation"],
      ["What should happen after seed-phrase exposure?", ["Move remaining assets to a freshly generated secure wallet", "Change only the app password", "Post the seed for support", "Wait for a confirmation"], 0, "The cryptographic authority itself is compromised.", "Seed compromise"],
      ["Why revoke a malicious token approval?", ["The spender may retain future transfer authority", "It restores a deleted seed", "It reverses confirmed theft", "It changes market cap"], 0, "Allowances can persist after the initial interaction.", "Token approvals"],
      ["What is the safest recovery-agent rule?", ["Never pay unsolicited agents promising recovery", "Pay a small test fee", "Share the seed first", "Use the agent’s private link"], 0, "Recovery scams commonly target people immediately after a loss.", "Recovery scams"],
    ],
  },
  {
    number: "1.26", position: 26, title: "Scams, Phishing, Rug Pulls and Fraud",
    lessons: [
      {
        title: "Recognise the scam funnel",
        outcome: "Identify how contact, trust, urgency, fake proof and blocked withdrawals turn persuasion into loss.",
        reference: `The FTC and FBI describe crypto investment fraud as trust-building followed by fake platforms, fabricated profits and demands for added fees. [FTC crypto scams](${sources.ftcCrypto}) - [IC3 investment fraud](${sources.ic3Investment})`,
        experience: experience("Fraud funnel", "The first deposit is often only the beginning", "Follow the behavioural sequence shared by romance, coaching and fake-investment schemes.", [
          { id: "contact", label: "Stage 1 - Contact", title: "An unsolicited person or advert finds you", body: "The identity may imitate a friend, celebrity, adviser, exchange or romantic interest.", metric: "Access", tone: "blue" },
          { id: "trust", label: "Stage 2 - Trust", title: "Small wins and personal attention reduce caution", body: "A first withdrawal, polished dashboard or patient coaching can be deliberately funded to create credibility.", metric: "Commitment", tone: "orange" },
          { id: "escalate", label: "Stage 3 - Escalate", title: "Urgency and fake profits push larger deposits", body: "Victims may be encouraged to borrow, recruit others or pay into a wallet controlled by the scheme.", metric: "Exposure", tone: "red" },
          { id: "trap", label: "Stage 4 - Trap", title: "Withdrawal requires tax, verification or recovery fees", body: "Numbers on the screen are not assets. Additional payments usually deepen the loss.", metric: "Extraction", tone: "green" },
        ], classify("Name the manipulation", "Match each message to the fraud technique it uses.", [
          { id: "impersonation", label: "Impersonation", description: "Borrowed identity" },
          { id: "proof", label: "Fake proof", description: "Fabricated result" },
          { id: "pressure", label: "Urgency or scarcity", description: "Remove thinking time" },
          { id: "advance", label: "Advance-fee trap", description: "Pay to release funds" },
        ], [
          { id: "f1", text: "‘I am exchange security; move funds to this safe wallet now.’", bucketId: "impersonation", feedback: "Verify through the provider’s independently sourced channel." },
          { id: "f2", text: "A dashboard shows a 40% gain, but no independent withdrawal evidence exists.", bucketId: "proof", feedback: "The operator can fabricate account balances and charts." },
          { id: "f3", text: "‘This opportunity closes in ten minutes—do not call anyone.’", bucketId: "pressure", feedback: "Isolation and urgency suppress verification." },
          { id: "f4", text: "‘Pay a tax deposit before your profits can be released.’", bucketId: "advance", feedback: "Paying more does not make a fictional balance withdrawable." },
        ]), "Treat platform numbers as claims until independently verified by a withdrawal you control—and even one withdrawal proves only that one payment occurred."),
      },
      {
        title: "Audit the platform, token and permission",
        outcome: "Investigate provider identity, licence claims, liquidity control, insider allocation and wallet permissions before funding.",
        reference: `The FSCA warns about impersonation and fraudulent investment schemes, while Ethereum explains that malicious approvals can drain wallets. [FSCA warning](${sources.fscaWarning}) - [Ethereum scam guidance](${sources.ethereumScams})`,
        experience: experience("Opportunity audit", "Professional appearance is not independent evidence", "Verify the legal provider, the economic mechanism and the technical authority separately.", [
          { id: "provider", label: "Check 1 - Provider", title: "Verify the entity outside its own website", body: "Match legal name, licence status, domain, directors and contact information using regulator and registry sources.", metric: "Identity", tone: "blue" },
          { id: "money", label: "Check 2 - Money", title: "Trace where deposits and returns come from", body: "Ponzi returns depend on new participants; fake platforms send funds to operator-controlled wallets and display invented balances.", metric: "Cash flow", tone: "orange" },
          { id: "token", label: "Check 3 - Token", title: "Inspect liquidity, sellability and insider control", body: "Rug pulls can remove pool liquidity, dump concentrated allocations or enforce malicious transfer restrictions.", metric: "Exit control", tone: "red" },
          { id: "permission", label: "Check 4 - Permission", title: "Read every wallet request", body: "A ‘claim’ or ‘verify’ button may request unlimited spending approval or an asset-transfer signature.", metric: "Authority", tone: "green" },
        ], branch("A token has an audit badge, public founder and rapidly rising price, but one wallet controls liquidity", "What is the strongest conclusion?", [
          { id: "safe", label: "The public founder and audit make a rug pull impossible.", verdict: "Signals overread", feedback: "Audit scope and public identity do not remove liquidity or insider-control risk.", tone: "risk" },
          { id: "price", label: "The rising price proves genuine demand.", verdict: "Market can be engineered", feedback: "Thin liquidity and coordinated promotion can manufacture price movement.", tone: "caution" },
          { id: "control", label: "Concentrated liquidity control remains a critical exit risk requiring verification.", verdict: "Mechanism identified", feedback: "The party able to remove liquidity can impair everyone else’s ability to sell.", tone: "good" },
        ]), "Audit badges, faces and followers are signals. Control over assets, liquidity and permissions is the mechanism."),
      },
      {
        title: "Stop harm and preserve evidence",
        outcome: "Pause safely, contain compromised access, preserve transaction evidence and report without falling for recovery fraud.",
        reference: `The FBI advises users to independently contact an exchange, avoid supplied links and never give login information; the FTC warns that extra withdrawal or recovery fees compound fraud. [IC3 exchange impersonation](${sources.ic3Exchange}) - [FTC scams](${sources.ftcCrypto})`,
        experience: experience("Fraud response desk", "Speed matters; panic helps the attacker", "Choose the next action based on what has already been exposed.", [
          { id: "pause", label: "Step 1 - Stop", title: "Do not send, sign or install anything else", body: "Break contact and independently verify the provider before following any security instruction.", metric: "Containment", tone: "blue" },
          { id: "secure", label: "Step 2 - Secure", title: "Replace compromised credentials or keys", body: "Use a clean device, revoke sessions and approvals, and move assets from any wallet whose seed was exposed.", metric: "Authority", tone: "red" },
          { id: "record", label: "Step 3 - Record", title: "Preserve hashes, addresses, URLs and messages", body: "Export chats and account records before they disappear. Record times and payment routes without further engaging the scammer.", metric: "Evidence", tone: "orange" },
          { id: "report", label: "Step 4 - Report", title: "Contact legitimate platforms and authorities", body: "Use official channels quickly. No honest investigator needs your seed phrase or an upfront crypto recovery fee.", metric: "Escalation", tone: "green" },
        ], meter("Rate the response", "Higher scores reflect containment and evidence quality, not a guarantee of asset recovery.", [
          { id: "contact", label: "Contact stopped", lowLabel: "Still engaging", highLabel: "Blocked", weight: 1.2, initial: 35 },
          { id: "access", label: "Access contained", lowLabel: "Unchanged", highLabel: "Keys and sessions secured", weight: 1.4, initial: 30 },
          { id: "evidence", label: "Evidence preserved", lowLabel: "Missing", highLabel: "Complete", weight: 1.1, initial: 35 },
          { id: "official", label: "Official reporting", lowLabel: "DM only", highLabel: "Verified channels", weight: 1.2, initial: 30 },
          { id: "fees", label: "Recovery-fee resistance", lowLabel: "Paid again", highLabel: "No further payment", weight: 1.2, initial: 40 },
        ], [
          { max: 39, label: "Harm still expanding", feedback: "Ongoing access or payment creates immediate additional exposure.", tone: "risk" },
          { max: 69, label: "Partly contained", feedback: "The scam has stopped, but access, evidence or official reporting is incomplete.", tone: "caution" },
          { max: 100, label: "Contained and documented", feedback: "Remaining assets and accounts are prioritised while evidence is preserved for legitimate escalation.", tone: "good" },
        ]), "Never let embarrassment delay containment. Fraud exploits people; reporting protects both the victim and the next target."),
      },
    ],
    quiz: [
      ["Why can a successful first withdrawal be misleading?", ["It may be deliberately allowed to build trust", "It proves every balance is real", "It removes counterparty risk", "It guarantees regulation"], 0, "Fraudsters may fund an early payout to induce larger deposits.", "Trust building"],
      ["What is an advance-fee withdrawal scam?", ["A demand for more money to release fictional funds", "A normal network fee", "A wallet backup", "A limit order"], 0, "Fake platforms invent taxes or verification fees after blocking withdrawals.", "Advance-fee fraud"],
      ["What defines a liquidity rug pull?", ["Controllers remove the pool assets supporting trading", "A token unlock is published", "A validator misses a block", "A wallet changes password"], 0, "Removing controlled liquidity destroys other holders’ exit capacity.", "Rug pull"],
      ["Why is an audit badge insufficient?", ["Scope, version, findings and control may still leave critical risk", "Audits set prices", "Audits remove private keys", "Audits guarantee liquidity"], 0, "An audit is bounded evidence, not a universal guarantee.", "Audit limits"],
      ["What can a malicious token approval permit?", ["Future transfers by the approved spender", "Guaranteed staking rewards", "A tax refund", "Block finality"], 0, "A broad allowance may persist until revoked.", "Wallet draining"],
      ["What should happen after an exchange-security impersonation message?", ["Contact the exchange through independently sourced official details", "Click the supplied link", "Share login codes", "Move funds to the caller’s wallet"], 0, "Independent contact breaks the impersonator’s controlled channel.", "Impersonation"],
      ["What evidence should be preserved?", ["Hashes, addresses, URLs, messages and times", "Only the token logo", "Only remembered details", "The seed phrase in a public post"], 0, "Concrete identifiers support legitimate investigation and reporting.", "Fraud evidence"],
      ["Who should receive an upfront crypto recovery fee?", ["Nobody claiming unsolicited guaranteed recovery", "A social-media agent", "An impersonated regulator", "A stranger with screenshots"], 0, "Recovery-fee demands are a common second scam.", "Recovery fraud"],
    ],
  },
  {
    number: "1.27", position: 27, title: "Understanding Cryptocurrency Investment Risk",
    lessons: [
      {
        title: "Map the complete risk stack",
        outcome: "Distinguish market, liquidity, project, technology, counterparty, custody, regulatory and fraud risk.",
        reference: `IOSCO investor material treats volatility, liquidity, custody, fraud and regulatory exposure as distinct risks requiring informed decisions. [IOSCO crypto risk education](${sources.ioscoRisk})`,
        experience: experience("Risk map", "One price chart hides many ways to lose", "Identify the layer that fails before choosing a control.", [
          { id: "market", label: "Layer 1 - Market", title: "Price, liquidity and concentration", body: "A valid asset can still fall sharply or become impossible to sell at the displayed price.", metric: "Trading risk", tone: "blue" },
          { id: "asset", label: "Layer 2 - Asset", title: "Project, protocol, contract and tokenomics", body: "Bugs, weak demand, insider emissions or governance capture can permanently impair the thesis.", metric: "Fundamental risk", tone: "orange" },
          { id: "access", label: "Layer 3 - Access", title: "Counterparty and custody", body: "An exchange can fail; self-custody can fail through lost or stolen keys. Different controls apply.", metric: "Control risk", tone: "red" },
          { id: "external", label: "Layer 4 - External", title: "Fraud, regulation and tax", body: "Misrepresentation, legal restrictions and reporting duties can affect value, access and obligations.", metric: "Context risk", tone: "green" },
        ], classify("Which risk failed?", "Assign the event to the primary risk category.", [
          { id: "market", label: "Market or liquidity", description: "Price and exit conditions" },
          { id: "project", label: "Project or technology", description: "Design and execution" },
          { id: "custody", label: "Counterparty or custody", description: "Who controls access" },
          { id: "external", label: "Fraud or regulatory", description: "Deception and legal environment" },
        ], [
          { id: "r1", text: "A sell order moves the price 18% because the order book is thin.", bucketId: "market", feedback: "This is executable-liquidity risk." },
          { id: "r2", text: "A smart-contract exploit empties protocol collateral.", bucketId: "project", feedback: "Technical failure changes the asset’s backing or operation." },
          { id: "r3", text: "An insolvent exchange freezes customer withdrawals.", bucketId: "custody", feedback: "The intermediary controls access and owes the customer." },
          { id: "r4", text: "A promoter fabricates a licence and guaranteed return.", bucketId: "external", feedback: "Fraudulent representation is distinct from ordinary volatility." },
        ]), "Name the risk precisely: controls for volatility do not repair fraud, custody failure or broken code."),
      },
      {
        title: "Run scenario and risk-of-ruin tests",
        outcome: "Model positive, neutral, negative and failure cases and identify outcomes that would destroy the wider plan.",
        reference: `IOSCO stresses that crypto investors may face severe volatility, illiquidity and limited protections, making failure scenarios essential. [IOSCO investor education](${sources.ioscoRisk})`,
        experience: experience("Scenario chamber", "A forecast is incomplete without a failure case", "Test how the position affects obligations and choices under four different futures.", [
          { id: "positive", label: "Scenario 1 - Positive", title: "Adoption and liquidity improve", body: "Define evidence that would support the thesis without assuming every price rise confirms it.", metric: "Upside", tone: "blue" },
          { id: "neutral", label: "Scenario 2 - Neutral", title: "Capital stagnates for years", body: "Opportunity cost, custody effort and tax records still exist even without a dramatic loss.", metric: "Patience", tone: "orange" },
          { id: "negative", label: "Scenario 3 - Negative", title: "A deep drawdown persists", body: "Ask whether essential spending, debt repayments or emotional behaviour would force a sale.", metric: "Resilience", tone: "red" },
          { id: "failure", label: "Scenario 4 - Failure", title: "Value or access approaches zero", body: "Risk of ruin exists when one outcome permanently damages housing, retirement, business continuity or family obligations.", metric: "Survival", tone: "green" },
        ], branch("A position could triple, but a total loss would prevent the investor paying high-interest debt", "What should dominate the decision?", [
          { id: "return", label: "The possible triple because return compensates for any risk.", verdict: "Risk of ruin ignored", feedback: "High potential return does not make an unaffordable loss acceptable.", tone: "risk" },
          { id: "belief", label: "Strong belief in the project makes the debt irrelevant.", verdict: "Conviction substituted for capacity", feedback: "Belief cannot pay fixed obligations after a loss.", tone: "caution" },
          { id: "capacity", label: "The failure scenario: essential obligations must survive before upside is considered.", verdict: "Survival first", feedback: "Risk capacity sets the boundary within which risk tolerance can operate.", tone: "good" },
        ]), "Avoiding ruin matters more than maximising any single opportunity."),
      },
      {
        title: "Set capacity, size and diversification controls",
        outcome: "Design position limits from loss capacity, time horizon, correlation, liquidity and leverage exposure.",
        reference: `IOSCO risk guidance emphasises informed decisions amid volatile and potentially illiquid crypto markets. [IOSCO education](${sources.ioscoRisk})`,
        experience: experience("Portfolio guardrails", "Risk starts with consequences, not conviction", "Build limits that keep decision-making intact when several risks arrive together.", [
          { id: "capacity", label: "Guardrail 1 - Capacity", title: "Separate emotional tolerance from financial ability", body: "A calm person may still lack capacity if the capital funds near-term obligations or if income is unstable.", metric: "Loss boundary", tone: "blue" },
          { id: "size", label: "Guardrail 2 - Size", title: "Cap portfolio damage from one thesis", body: "Position size should include the possibility of permanent loss, not only a normal drawdown.", metric: "Concentration", tone: "orange" },
          { id: "diversify", label: "Guardrail 3 - Diversify", title: "Diversify risk drivers, not token names", body: "Many tokens can share the same exchange, stablecoin, bridge, sector and market-cycle exposure.", metric: "Independence", tone: "red" },
          { id: "leverage", label: "Guardrail 4 - Survive", title: "Avoid forced liquidation and cash needs", body: "Leverage and inadequate emergency liquidity remove the ability to wait or reassess.", metric: "Optionality", tone: "green" },
        ], meter("Rate portfolio resilience", "This educational tool scores process quality and does not recommend an allocation.", [
          { id: "needs", label: "Near-term needs", lowLabel: "Funded by position", highLabel: "Covered separately", weight: 1.4, initial: 30 },
          { id: "size", label: "Single-thesis size", lowLabel: "Life-changing loss", highLabel: "Contained loss", weight: 1.4, initial: 30 },
          { id: "drivers", label: "Risk-driver diversity", lowLabel: "Highly correlated", highLabel: "Independent", weight: 1.1, initial: 35 },
          { id: "exit", label: "Exit liquidity", lowLabel: "Thin or locked", highLabel: "Tested", weight: 1.1, initial: 35 },
          { id: "leverage", label: "Forced-action risk", lowLabel: "High leverage", highLabel: "No forced liquidation", weight: 1.3, initial: 40 },
        ], [
          { max: 39, label: "Ruin-sensitive exposure", feedback: "One adverse path could impair essential obligations or force action at the worst time.", tone: "risk" },
          { max: 69, label: "Material portfolio fragility", feedback: "Some controls exist, but concentration, correlation or liquidity still threatens resilience.", tone: "caution" },
          { max: 100, label: "Loss is deliberately contained", feedback: "The structure preserves essential needs and decision capacity while recognising asset uncertainty.", tone: "good" },
        ]), "Diversification is about independent failure modes. Twenty tokens on one fragile exchange are not twenty independent protections."),
      },
    ],
    quiz: [
      ["What is investment risk?", ["Uncertainty that outcomes may impair capital or objectives", "A guarantee of higher return", "Only daily volatility", "Only fraud"], 0, "Risk includes both variability and permanent failure across several layers.", "Investment risk"],
      ["What distinguishes liquidity risk?", ["The asset may not trade near the displayed price", "The seed is public", "The tax rate changes", "The protocol issues rewards"], 0, "Exit capacity depends on actual market depth.", "Liquidity risk"],
      ["What is counterparty risk?", ["A relied-on provider may fail or withhold obligations", "A block is slow", "A token is volatile", "A wallet uses a QR code"], 0, "Custodians and platforms introduce dependence on another party.", "Counterparty risk"],
      ["How does self-custody risk differ?", ["The user bears key-loss and operational responsibility", "There is no risk", "The exchange holds the seed", "Prices cannot fall"], 0, "Removing a custodian transfers control and operational duties to the user.", "Custody risk"],
      ["What is risk of ruin?", ["A loss severe enough to permanently damage the wider financial plan", "A normal daily decline", "A token burn", "A narrow spread"], 0, "Survival constraints must dominate optional upside.", "Risk of ruin"],
      ["What should a failure scenario assume?", ["Value or access may approach zero", "Price always recovers", "Fees disappear", "The thesis cannot fail"], 0, "A robust analysis includes permanent impairment.", "Scenario analysis"],
      ["What should position sizing protect?", ["Essential obligations and portfolio survival", "Social status", "The number of token units", "Every possible gain"], 0, "Sizing contains the consequence of one uncertain thesis.", "Position sizing"],
      ["Why may many tokens fail to diversify risk?", ["They may share the same market, infrastructure and liquidity drivers", "Tokens cannot be traded", "Wallets allow only one asset", "Supply never changes"], 0, "Different names can remain exposed to identical failure mechanisms.", "Correlation"],
    ],
  },
  {
    number: "1.28", position: 28, title: "Responsible Cryptocurrency Participation",
    lessons: [
      {
        title: "Choose purpose, capital and boundaries",
        outcome: "Define whether an activity is investing, trading or speculation and set capital, borrowing and behaviour limits.",
        reference: `IOSCO materials emphasise informed participation under substantial crypto risk rather than treating risk disclosures as formality. [IOSCO investor education](${sources.ioscoRisk})`,
        experience: experience("Participation charter", "Purpose determines the rules", "Decide what you are doing before market movement writes the plan for you.", [
          { id: "purpose", label: "Boundary 1 - Purpose", title: "Name investing, trading or speculation honestly", body: "Each activity needs a different thesis, time horizon, evidence standard and exit discipline.", metric: "Intent", tone: "blue" },
          { id: "capital", label: "Boundary 2 - Capital", title: "Protect emergency and obligation money", body: "Risk capital excludes rent, debt payments, tax funds, payroll and money needed within the likely volatility horizon.", metric: "Capacity", tone: "orange" },
          { id: "borrow", label: "Boundary 3 - Borrowing", title: "Do not finance speculation with fixed obligations", body: "Debt compounds on schedule while a volatile asset follows no recovery timetable.", metric: "Ruin control", tone: "red" },
          { id: "behaviour", label: "Boundary 4 - Behaviour", title: "Predefine pause and review triggers", body: "Chasing losses, sleepless monitoring, secrecy and escalating stakes are signs the activity is becoming gambling-like.", metric: "Self-control", tone: "green" },
        ], classify("Which boundary is being crossed?", "Match the behaviour to the rule that should stop it.", [
          { id: "purpose", label: "Purpose", description: "Activity and thesis" },
          { id: "capital", label: "Capital", description: "Money that can be lost" },
          { id: "behaviour", label: "Behaviour", description: "Compulsion and emotion" },
        ], [
          { id: "p1", text: "A ‘long-term investment’ is sold and rebought hourly with no written thesis.", bucketId: "purpose", feedback: "The label and actual behaviour are inconsistent." },
          { id: "p2", text: "Emergency savings are moved into a leveraged token position.", bucketId: "capital", feedback: "Essential liquidity is being exposed to loss and forced timing." },
          { id: "p3", text: "The stake doubles after every loss to win it back.", bucketId: "behaviour", feedback: "Loss chasing is a gambling-like escalation pattern." },
          { id: "p4", text: "High-interest borrowing funds a speculative trade.", bucketId: "capital", feedback: "A fixed repayment is being matched with an uncertain asset path." },
        ]), "Responsible participation begins with an honest label and a loss boundary that market excitement cannot renegotiate."),
      },
      {
        title: "Communicate and promote ethically",
        outcome: "Disclose conflicts, avoid pressure and guarantees, protect vulnerable participants and respect the right to decline.",
        reference: `The FTC warns that guarantees, urgency, fabricated testimonials and relationship-based crypto coaching are common fraud patterns. [FTC crypto scams](${sources.ftcCrypto})`,
        experience: experience("Ethics desk", "A disclaimer does not cancel influence", "Examine how a truthful fact can still be presented irresponsibly.", [
          { id: "claim", label: "Duty 1 - Claims", title: "Separate evidence from opinion and possibility", body: "State material risks and uncertainty as clearly as potential benefits. Never imply that past success guarantees future outcome.", metric: "Accuracy", tone: "blue" },
          { id: "conflict", label: "Duty 2 - Conflicts", title: "Disclose payment, holdings and referral rewards", body: "People must know when the speaker benefits from attention, sign-up or price movement.", metric: "Transparency", tone: "orange" },
          { id: "pressure", label: "Duty 3 - Choice", title: "Do not shame, rush or recruit beyond understanding", body: "FOMO, group identity and ‘everyone is early’ rhetoric can override informed consent.", metric: "Autonomy", tone: "red" },
          { id: "vulnerable", label: "Duty 4 - Protection", title: "Increase care where capacity or understanding is limited", body: "Older adults, distressed people and those seeking debt relief can be especially harmed by high-pressure financial claims.", metric: "Care", tone: "green" },
        ], branch("A tutor earns a referral fee from an exchange and wants students to register during class", "What is the responsible approach?", [
          { id: "hide", label: "Hide the fee because the exchange is legitimate.", verdict: "Conflict concealed", feedback: "Provider legitimacy does not remove the tutor’s financial incentive.", tone: "risk" },
          { id: "disclaim", label: "Say ‘not financial advice’ and pressure students to join now.", verdict: "Disclaimer misused", feedback: "A phrase does not neutralise pressure or undisclosed benefit.", tone: "caution" },
          { id: "disclose", label: "Disclose the fee, present alternatives and give students time and freedom to decline.", verdict: "Informed choice protected", feedback: "Transparency and no-pressure comparison respect learner autonomy.", tone: "good" },
        ]), "Responsibility follows influence. The stronger your authority, audience or incentive, the clearer your disclosure must be."),
      },
      {
        title: "Write a personal participation policy",
        outcome: "Create repeatable rules for security, research, DeFi, records, tax, privacy and periodic review.",
        reference: `SARS states that normal tax rules apply to crypto assets and affected taxpayers must declare gains or losses; records and classification matter. [SARS crypto assets and tax](${sources.sarsCrypto})`,
        experience: experience("Policy builder", "Good intentions need operational rules", "Turn responsibility into a short policy that can be followed during excitement, loss or complexity.", [
          { id: "entry", label: "Rule 1 - Before entry", title: "Define purpose, evidence and maximum exposure", body: "Record why the asset or protocol is being used, which facts would disprove the thesis and which capital is off limits.", metric: "Decision", tone: "blue" },
          { id: "operate", label: "Rule 2 - While participating", title: "Use security and DeFi boundaries", body: "Separate wallets, cap approvals, understand smart-contract and oracle risk, and reject yields whose source cannot be explained.", metric: "Operation", tone: "orange" },
          { id: "record", label: "Rule 3 - Record", title: "Preserve transactions, cost basis and purpose", body: "Crypto-to-crypto trades, rewards and payments can create reporting consequences. Personal records should not depend on one exchange remaining available.", metric: "Accountability", tone: "red" },
          { id: "review", label: "Rule 4 - Review and exit", title: "Reassess thesis, control, behaviour and obligations", body: "Pause when limits are breached, circumstances change or participation begins harming health, relationships or financial stability.", metric: "Governance", tone: "green" },
        ], meter("Rate policy completeness", "This is educational guidance; legal and tax treatment depends on individual facts and current law.", [
          { id: "purpose", label: "Purpose and evidence", lowLabel: "Undefined", highLabel: "Written", weight: 1.1, initial: 35 },
          { id: "limit", label: "Capital boundary", lowLabel: "Flexible under pressure", highLabel: "Hard limit", weight: 1.4, initial: 30 },
          { id: "security", label: "Security process", lowLabel: "Ad hoc", highLabel: "Rehearsed", weight: 1.2, initial: 35 },
          { id: "records", label: "Tax and transaction records", lowLabel: "Missing", highLabel: "Independent and complete", weight: 1.2, initial: 30 },
          { id: "pause", label: "Review and pause triggers", lowLabel: "None", highLabel: "Specific", weight: 1.1, initial: 35 },
        ], [
          { max: 39, label: "Intent without control", feedback: "The plan depends on judgment at the exact moment emotion and pressure are strongest.", tone: "risk" },
          { max: 69, label: "Usable but incomplete policy", feedback: "Core limits exist, but security, records or pause rules need operational detail.", tone: "caution" },
          { max: 100, label: "Operational participation policy", feedback: "The rules connect purpose, limits, security, accountability and review in advance.", tone: "good" },
        ]), "A responsible policy does not promise success. It makes the boundaries, records and actions clear before they are needed."),
      },
    ],
    quiz: [
      ["Why define whether an activity is investing, trading or speculation?", ["Each needs different evidence, horizon and rules", "The labels guarantee profit", "It removes tax", "It secures the seed"], 0, "An honest activity label supports coherent decision rules.", "Participation purpose"],
      ["What is inappropriate risk capital?", ["Money required for emergencies or fixed obligations", "A deliberately limited speculative allocation", "Surplus capital", "A small learning budget"], 0, "Essential funds cannot safely wait through uncertain drawdowns.", "Risk capital"],
      ["Why avoid borrowing to speculate?", ["Debt repayments are fixed while asset outcomes are uncertain", "Borrowing removes volatility", "Debt guarantees liquidity", "It creates more confirmations"], 0, "The mismatch can turn price movement into financial ruin.", "Borrowing risk"],
      ["What is loss chasing?", ["Increasing exposure to recover prior losses emotionally", "Reviewing a thesis", "Keeping records", "Reducing leverage"], 0, "Escalating after loss is a gambling-like behavioural warning.", "Loss chasing"],
      ["What must a paid promoter disclose?", ["Compensation, holdings and referral incentives", "Private keys", "Other users’ identities", "Future prices"], 0, "Material conflicts affect how the audience should interpret the message.", "Conflict disclosure"],
      ["Does ‘not financial advice’ remove responsibility for misleading promotion?", ["No", "Yes, always", "Only on social media", "Only for stablecoins"], 0, "A disclaimer cannot excuse deception, pressure or hidden conflicts.", "Ethical communication"],
      ["Why keep independent transaction records?", ["Platforms may disappear and tax reporting depends on facts", "Records raise prices", "They replace backups", "They guarantee legal treatment"], 0, "Cost, proceeds, rewards and purpose may need later substantiation.", "Record keeping"],
      ["What should a participation policy include?", ["Purpose, limits, security, records and pause triggers", "Only target price", "Only social-media sources", "A guaranteed-return clause"], 0, "Operational rules cover entry, conduct, accountability and review.", "Personal policy"],
    ],
  },
];

const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const lessonContent = (lesson) => `## Outcome\n\n${lesson.outcome}\n\n## Evidence base\n\n${lesson.reference}\n\n## How to use this lesson\n\nMove through each scene, complete the decision activity, then write one action you would take and one fact you would verify. This is education, not financial, legal or tax advice.`;
const statements = [`UPDATE \`courses\` SET \`description\`=${sql("Twenty-eight production-quality modules from the Digital Assets pathway. Short interactive lessons, evidence-led decisions and explained assessments. Private CogniZen review draft; educational content, not financial advice.")},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(courseId)};`];

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

const target = new URL("../drizzle/0055_crypto_mastery_foundations_production_batch_7.sql", import.meta.url);
await writeFile(target, `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log(`Wrote ${modules.length} modules, ${modules.length * 4} lessons and ${modules.reduce((total, item) => total + item.quiz.length, 0)} scored questions.`);
