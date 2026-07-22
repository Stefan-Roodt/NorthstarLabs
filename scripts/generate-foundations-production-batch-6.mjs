import { writeFile } from "node:fs/promises";

const courseId = "cognizen-crypto-mastery-foundations-production";
const createdAt = 1785124800000;
const sources = {
  supply: "https://support.coingecko.com/hc/en-us/articles/32294647667865-CoinGecko-Supply-Methodology",
  methodology: "https://www.coingecko.com/en/methodology",
  fdv: "https://www.coingecko.com/learn/what-is-fully-diluted-valuation-fdv-in-crypto",
  issuance: "https://ethereum.org/roadmap/merge/issuance/",
  ether: "https://ethereum.org/developers/docs/intro-to-ether",
  tokens: "https://ethereum.org/developers/docs/standards/tokens/",
  erc20: "https://ethereum.org/developers/docs/standards/tokens/erc-20/",
  ioscoRisk: "https://www.iosco.org/library/pubdocs/pdf/IOSCOPD769.pdf",
  bisLeverage: "https://www.bis.org/publ/work1087.pdf",
  bitcoinTransactions: "https://developer.bitcoin.org/devguide/transactions.html",
  nistWallet: "https://csrc.nist.gov/glossary/term/wallet",
  ethereumContracts: "https://ethereum.org/developers/docs/smart-contracts/",
};

function experience(eyebrow, title, intro, scenes, activity, takeaway) { return { version: 1, eyebrow, title, intro, scenes, activity, takeaway }; }
function classify(title, prompt, buckets, cards) { return { kind: "classify", title, prompt, buckets, cards }; }
function branch(title, prompt, options) { return { kind: "branch", title, prompt, options }; }
function meter(title, prompt, dimensions, thresholds) { return { kind: "meter", title, prompt, dimensions, thresholds }; }

const modules = [
  {
    number: "1.21", position: 21, title: "Market Price, Supply and Market Capitalisation",
    lessons: [
      {
        title: "Calculate value beyond the token price",
        outcome: "Calculate market capitalisation and resist unit bias when comparing assets with different supplies.",
        reference: `CoinGecko calculates market capitalisation from price and verified circulating supply, while distinguishing total and maximum supply. [Supply methodology](${sources.supply}) - [Market methodology](${sources.methodology})`,
        experience: experience("Valuation bench", "A low unit price is not the same as a low valuation", "Compare two fictional assets by doing the calculation that promotional headlines often omit.", [
          { id: "price", label: "Input 1 - Price", title: "Price is the marginal exchange rate", body: "The displayed price comes from recent trades on a particular market. It does not show how much can be sold at that price.", metric: "Per unit", tone: "blue" },
          { id: "supply", label: "Input 2 - Circulating supply", title: "Count units considered available", body: "Circulating-supply estimates can exclude locked or reserved tokens and may differ between data providers.", metric: "Available units", tone: "orange" },
          { id: "cap", label: "Calculation", title: "Price × circulating supply", body: "A token at R1 with 500 million circulating units has a R500 million market cap. A token at R1,000 with 100,000 units has a R100 million cap.", metric: "Relative scale", tone: "green" },
          { id: "limit", label: "Boundary", title: "Market cap is not cash in the project", body: "It is the latest marginal price applied to circulating units—not revenue, reserves, or the amount everyone could withdraw.", metric: "Estimate", tone: "red" },
        ], classify("Which number answers the claim?", "Put each question under the metric that can address it.", [
          { id: "price", label: "Unit price", description: "Current exchange rate for one unit" },
          { id: "cap", label: "Market cap", description: "Price × circulating supply" },
          { id: "liquidity", label: "Liquidity", description: "Capacity to trade near the displayed price" },
        ], [
          { id: "c1", text: "How many rand buys one token right now?", bucketId: "price", feedback: "That is the unit price on the selected market." },
          { id: "c2", text: "How large is the circulating valuation relative to another asset?", bucketId: "cap", feedback: "Market cap normalises for different circulating supplies." },
          { id: "c3", text: "Can a large holder exit without moving the market sharply?", bucketId: "liquidity", feedback: "Depth, spread and volume matter more than the headline price." },
          { id: "c4", text: "Does a five-cent token have more upside than a R50,000 coin?", bucketId: "cap", feedback: "Unit price alone cannot answer; supply and implied valuation are required." },
        ]), "Compare percentage change and valuation, not the emotional appeal of owning more units."),
      },
      {
        title: "Audit circulating supply, FDV and unlocks",
        outcome: "Read supply definitions, calculate fully diluted valuation and identify future dilution pressure.",
        reference: `CoinGecko defines max, total and circulating supply separately and describes FDV as price multiplied by the relevant full supply measure. [Supply methodology](${sources.supply}) - [FDV guide](${sources.fdv})`,
        experience: experience("Supply x-ray", "Today’s float can hide tomorrow’s supply", "Trace how locked allocations, issuance and burns change what holders actually face.", [
          { id: "circulating", label: "Layer 1 - Circulating", title: "The units treated as available now", body: "This figure normally drives market cap, but classification depends on verifiable holdings and methodology.", metric: "Current float", tone: "blue" },
          { id: "total", label: "Layer 2 - Total", title: "Minted less permanently burned", body: "Total supply may include treasury, team and investor allocations that are not yet liquid.", metric: "Existing units", tone: "orange" },
          { id: "maximum", label: "Layer 3 - Maximum", title: "The coded ceiling—if one exists", body: "A maximum can change only if the governing rules permit and participants adopt a rule change. Some assets have no fixed cap.", metric: "Potential ceiling", tone: "red" },
          { id: "fdv", label: "Stress test - FDV", title: "Price × full supply assumption", body: "A large market-cap-to-FDV gap directs attention to unlock schedules, recipients, liquidity and expected demand.", metric: "Dilution lens", tone: "green" },
        ], meter("Rate supply pressure", "Move each control using evidence from the token contract, allocation table and unlock schedule.", [
          { id: "gap", label: "Circulating versus full supply", lowLabel: "Small float", highLabel: "Mostly circulating", weight: 1.3, initial: 30 },
          { id: "unlocks", label: "Unlock transparency", lowLabel: "Unknown", highLabel: "Dated and verifiable", weight: 1.2, initial: 35 },
          { id: "holders", label: "Recipient concentration", lowLabel: "Insiders dominate", highLabel: "Broadly distributed", weight: 1.2, initial: 30 },
          { id: "issuance", label: "Issuance control", lowLabel: "Admin can mint", highLabel: "Credible constraints", weight: 1.3, initial: 35 },
          { id: "demand", label: "Demand evidence", lowLabel: "Promotion only", highLabel: "Sustained usage", weight: 1, initial: 30 },
        ], [
          { max: 39, label: "Severe dilution uncertainty", feedback: "Future supply or control is opaque. The current market cap may tell only a small part of the valuation story.", tone: "risk" },
          { max: 69, label: "Material supply watch", feedback: "The structure is partly known, but unlock recipients, liquidity or demand need further testing.", tone: "caution" },
          { max: 100, label: "Well-evidenced supply", feedback: "Supply rules and releases are visible; valuation risk remains, but dilution is easier to model.", tone: "good" },
        ]), "FDV is a scenario lens, not a price forecast. Investigate who receives new supply and when it can trade."),
      },
      {
        title: "Challenge target-price and scarcity claims",
        outcome: "Calculate implied future valuation and test whether liquidity, demand and token rights support the narrative.",
        reference: `Supply providers caution that circulating figures require verification; Ethereum shows that issuance and burn can operate simultaneously. [CoinGecko methodology](${sources.methodology}) - [Ethereum issuance](${sources.issuance})`,
        experience: experience("Claim laboratory", "Turn ‘it can reach R10’ into a testable proposition", "Replace a price target with its implied future supply, valuation and market structure.", [
          { id: "future", label: "Step 1 - Future supply", title: "Use supply at the target date", body: "Include scheduled unlocks and net issuance rather than multiplying by today’s smaller float.", metric: "Denominator", tone: "blue" },
          { id: "implied", label: "Step 2 - Implied cap", title: "Target price × future circulating supply", body: "A R10 target with ten billion units implies a R100 billion circulating valuation.", metric: "Required scale", tone: "orange" },
          { id: "rights", label: "Step 3 - Economic meaning", title: "Ask what the token actually captures", body: "Usage, fees, governance or collateral utility do not automatically create a claim on revenue or profit.", metric: "Value capture", tone: "red" },
          { id: "market", label: "Step 4 - Market capacity", title: "Test demand and liquidity", body: "A small trade can set a high marginal price. Deep, persistent demand is a different claim.", metric: "Plausibility", tone: "green" },
        ], branch("A promoter says a R0.10 token can easily reach R10 because bitcoin trades much higher", "What is the strongest first response?", [
          { id: "units", label: "Buy because the unit price is lower.", verdict: "Unit bias", feedback: "Different supplies make cross-asset unit-price comparisons meaningless.", tone: "risk" },
          { id: "burn", label: "Assume planned burns guarantee the target.", verdict: "Mechanism overclaimed", feedback: "Net supply and demand determine the effect; a burn alone guarantees nothing.", tone: "caution" },
          { id: "math", label: "Calculate target price × expected future supply, then test demand and token rights.", verdict: "Claim converted to evidence", feedback: "The target becomes an implied valuation that can be compared with actual economic activity.", tone: "good" },
        ]), "Scarcity can support a thesis only when verified supply constraints meet credible demand and meaningful token economics."),
      },
    ],
    quiz: [
      ["How is market capitalisation normally calculated?", ["Price × circulating supply", "Price × trading volume", "Treasury ÷ holders", "Maximum supply ÷ price"], 0, "Market cap applies the current unit price to circulating units.", "Market capitalisation"],
      ["Why is a low token price not proof that an asset is cheap?", ["Supply may be enormous", "The token must be a stablecoin", "Low prices cannot change", "Wallets hide the price"], 0, "Unit price must be read with supply and implied valuation.", "Unit bias"],
      ["What does liquidity describe?", ["Ability to trade without large price impact", "The maximum token supply", "A project’s cash reserves", "The number of wallets"], 0, "Liquidity concerns executable market depth, not merely displayed price.", "Liquidity"],
      ["What does FDV estimate?", ["Valuation if the selected full supply traded at today’s price", "Guaranteed future market cap", "Project revenue", "Cash invested"], 0, "FDV is a supply-based scenario, not a forecast.", "Fully diluted valuation"],
      ["What can token unlocks create?", ["Potential dilution and selling pressure", "Guaranteed demand", "Permanent price growth", "A private key"], 0, "Previously restricted allocations can become transferable.", "Unlocks"],
      ["Does a token burn guarantee price appreciation?", ["No; net supply, scale and demand still matter", "Yes, always", "Only for stablecoins", "Only on exchanges"], 0, "Burn impact depends on net issuance and market demand.", "Burns"],
      ["What future supply belongs in target-price arithmetic?", ["Expected circulating supply at the target date", "Only today’s circulating supply", "Only lost coins", "Trading volume"], 0, "Expected unlocks and issuance change the implied valuation.", "Future supply"],
      ["What does market cap not equal?", ["Cash that every holder could withdraw", "Price multiplied by circulating supply", "A relative valuation measure", "A marginal-price estimate"], 0, "Selling the full supply would change the price and available liquidity.", "Market-cap limits"],
    ],
  },
  {
    number: "1.22", position: 22, title: "Introduction to Tokenomics",
    lessons: [
      {
        title: "Map the token’s economic machine",
        outcome: "Trace issuance, allocation, vesting, utility, incentives, governance and value capture as one system.",
        reference: `Ethereum documents token standards as interfaces, while ETH supply illustrates that issuance and burn are separate forces. [Token standards](${sources.tokens}) - [ETH issuance](${sources.issuance})`,
        experience: experience("Economic system map", "Tokenomics is a feedback system, not a pie chart", "Follow units from creation to recipients, uses and eventual selling pressure.", [
          { id: "create", label: "Flow 1 - Create", title: "Define issuance and destruction", body: "Ask who can mint, at what rate, under what rule, and whether burns exceed or merely decorate issuance.", metric: "Supply change", tone: "blue" },
          { id: "allocate", label: "Flow 2 - Allocate", title: "Identify recipients and vesting", body: "Team, investors, treasury, community and security budgets carry different time horizons and cost bases.", metric: "Distribution", tone: "orange" },
          { id: "use", label: "Flow 3 - Use", title: "Separate utility from demand", body: "A token can be technically required while users minimise holdings, borrow it briefly or immediately sell rewards.", metric: "Behaviour", tone: "red" },
          { id: "capture", label: "Flow 4 - Capture", title: "Find the path from activity to holders", body: "Fees, collateral demand, governance or burns must create a durable reason to hold—not just activity around the project.", metric: "Economic link", tone: "green" },
        ], classify("Place the tokenomic fact", "Assign each fact to the part of the system it changes most directly.", [
          { id: "supply", label: "Supply rule", description: "Mint, burn or cap" },
          { id: "distribution", label: "Distribution", description: "Who receives and when" },
          { id: "demand", label: "Demand and utility", description: "Why users need units" },
          { id: "control", label: "Control and capture", description: "Who changes rules and who benefits" },
        ], [
          { id: "t1", text: "Validator rewards add 4% new units each year.", bucketId: "supply", feedback: "Issuance changes the token count and holder dilution." },
          { id: "t2", text: "Early investors unlock 20% of supply next quarter.", bucketId: "distribution", feedback: "Recipient, timing and cost basis shape potential selling pressure." },
          { id: "t3", text: "Users must post the token as collateral to access network capacity.", bucketId: "demand", feedback: "This creates a functional holding requirement that still needs usage evidence." },
          { id: "t4", text: "A three-person multisig can change emissions and treasury spending.", bucketId: "control", feedback: "Administrative power can override the advertised economic rules." },
        ]), "A tokenomic claim is incomplete until you can show the rule, recipient, behaviour and control path."),
      },
      {
        title: "Separate utility from value capture",
        outcome: "Test whether product usage creates sustained token demand or merely passes tokens through users.",
        reference: `ERC-20 defines transferable token functions but does not guarantee economic value; Ethereum documents ETH uses for fees and security. [ERC-20](${sources.erc20}) - [Technical intro to ether](${sources.ether})`,
        experience: experience("Value-capture test", "A useful product can still have a weak token", "Trace who pays, which asset they use, where value accumulates and who can extract it.", [
          { id: "required", label: "Question 1 - Required?", title: "Does the product need this token?", body: "If a stablecoin or fiat payment works equally well, token demand may depend mostly on incentives or speculation.", metric: "Necessity", tone: "blue" },
          { id: "held", label: "Question 2 - Held?", title: "How long must users retain it?", body: "High token velocity can let the same units serve activity without creating much stored demand.", metric: "Holding demand", tone: "orange" },
          { id: "reward", label: "Question 3 - Rewarded?", title: "Where do emissions go after receipt?", body: "Rewards paid in newly issued tokens can become structural selling pressure when recipients cover expenses.", metric: "Sell flow", tone: "red" },
          { id: "capture", label: "Question 4 - Captured?", title: "Does activity benefit holders by an enforceable mechanism?", body: "Governance, fee discounts or burns have different rights and should not be described as equity-like revenue claims without evidence.", metric: "Holder link", tone: "green" },
        ], branch("A popular application has growing users, but fees are paid in a stablecoin and reward tokens are immediately sold", "Which conclusion is best supported?", [
          { id: "automatic", label: "Application growth automatically makes the token more valuable.", verdict: "Product and token conflated", feedback: "The application can succeed while its token captures little of that success.", tone: "risk" },
          { id: "useless", label: "The token must have zero value.", verdict: "Evidence overextended", feedback: "Other functions may matter, but they require separate proof.", tone: "caution" },
          { id: "trace", label: "Trace whether users must hold the token and whether activity creates net demand after emissions.", verdict: "Value path tested", feedback: "Usage matters only through a defensible token-demand and capture mechanism.", tone: "good" },
        ]), "Ask whether the token is necessary, held and economically connected to activity—not whether the product merely mentions it."),
      },
      {
        title: "Audit incentives, governance and control",
        outcome: "Score whether rewards create durable participation or subsidised activity that collapses when emissions fall.",
        reference: `Ethereum’s issuance model shows rewards tied to network security and variable participation, while token contracts can expose administrative functions. [Ethereum issuance](${sources.issuance}) - [Smart contracts](${sources.ethereumContracts})`,
        experience: experience("Incentive audit", "Yield must come from somewhere", "Investigate the payer, purpose and control behind every promised reward.", [
          { id: "source", label: "Lens 1 - Source", title: "Identify who funds the reward", body: "Fees paid by real users differ from newly minted subsidies or treasury distributions with a finite runway.", metric: "Funding", tone: "blue" },
          { id: "purpose", label: "Lens 2 - Purpose", title: "Connect reward to useful behaviour", body: "Security, liquidity and development can justify incentives only if the rewarded action creates measurable system value.", metric: "Contribution", tone: "orange" },
          { id: "exit", label: "Lens 3 - Exit", title: "Model recipient selling", body: "Recipients may sell rewards to cover hardware, payroll, taxes or impermanent loss. Gross APY hides this flow.", metric: "Pressure", tone: "red" },
          { id: "control", label: "Lens 4 - Control", title: "Locate upgrade, mint and treasury authority", body: "Governance-token voting can remain concentrated through insiders, delegation, low turnout or emergency administrators.", metric: "Power", tone: "green" },
        ], meter("Score tokenomic durability", "Use verifiable documents and on-chain permissions rather than the headline APY.", [
          { id: "revenue", label: "Reward funding", lowLabel: "New buyers or emissions", highLabel: "Durable service demand", weight: 1.3, initial: 30 },
          { id: "alignment", label: "Recipient alignment", lowLabel: "Fast insider unlocks", highLabel: "Long, credible alignment", weight: 1.2, initial: 35 },
          { id: "utility", label: "Token necessity", lowLabel: "Decorative", highLabel: "Core and evidenced", weight: 1.2, initial: 30 },
          { id: "governance", label: "Governance distribution", lowLabel: "Few actors", highLabel: "Broad effective control", weight: 1.1, initial: 35 },
          { id: "admin", label: "Administrative constraints", lowLabel: "Opaque unlimited powers", highLabel: "Limited and transparent", weight: 1.3, initial: 30 },
        ], [
          { max: 39, label: "Subsidy-dependent design", feedback: "Rewards or control appear capable of overwhelming genuine demand and holder protections.", tone: "risk" },
          { max: 69, label: "Unproven token economy", feedback: "Some mechanisms are coherent, but funding, power or value capture needs stronger evidence.", tone: "caution" },
          { max: 100, label: "Coherent, testable design", feedback: "Incentives have a visible purpose, funding source and control boundary. Execution risk still remains.", tone: "good" },
        ]), "Treat high yields as a question about funding and risk, never as free return."),
      },
    ],
    quiz: [
      ["What does tokenomics describe?", ["A token’s supply, distribution, utility, incentives and control", "Only its logo", "Only daily price", "A wallet password"], 0, "Tokenomics covers the full economic design and governance system.", "Tokenomics"],
      ["Why can inflation dilute holders?", ["New units expand supply unless demand keeps pace", "It deletes private keys", "It narrows spreads automatically", "It guarantees voting rights"], 0, "Issuance changes each existing unit’s share of the total supply.", "Dilution"],
      ["What is the key vesting question?", ["Who receives how many tokens and when they become transferable", "What colour is the chart", "Which wallet app is fastest", "What was yesterday’s price"], 0, "Recipient, amount, timing and cost basis shape unlock pressure.", "Vesting"],
      ["Does product usage automatically create token value?", ["No; the token needs a credible demand and capture path", "Yes, always", "Only if supply is large", "Only if influencers agree"], 0, "A product and its token can have different economics.", "Value capture"],
      ["What can high token velocity reduce?", ["The amount users need to hold", "Maximum supply", "Contract risk", "Validator count"], 0, "Rapid reuse can support activity with limited stored token demand.", "Token velocity"],
      ["What should a staking APY prompt first?", ["Where the reward comes from and what risk funds it", "How to borrow more", "Why price must rise", "How to hide the allocation"], 0, "Rewards can come from fees, issuance, treasury or risky strategies.", "Reward funding"],
      ["Why can governance be centralised despite token voting?", ["Ownership, delegation or turnout may concentrate effective power", "All tokens are identical", "Blocks are too fast", "Wallets cannot vote"], 0, "Formal voting rights do not prove distributed practical control.", "Governance control"],
      ["Which is a major tokenomic warning sign?", ["Opaque minting power and rapid insider unlocks", "Documented supply rules", "Transparent treasury reporting", "Measured service demand"], 0, "Unbounded control and misaligned distribution can overwhelm users.", "Tokenomic red flags"],
    ],
  },
  {
    number: "1.23", position: 23, title: "Cryptocurrency Volatility",
    lessons: [
      {
        title: "Separate volatility, drawdown and permanent loss",
        outcome: "Distinguish price variability from the broader ways capital can be permanently impaired.",
        reference: `IOSCO identifies volatility, liquidity, operational, fraud and regulatory risks as distinct crypto-asset concerns. [IOSCO investor education](${sources.ioscoRisk})`,
        experience: experience("Risk weather map", "Movement is visible; risk is wider", "Classify what a price chart can show and what it cannot.", [
          { id: "volatility", label: "Measure 1 - Volatility", title: "Magnitude and speed of price changes", body: "Volatility can move upward or downward. It describes variability, not the probability that a project survives.", metric: "Dispersion", tone: "blue" },
          { id: "drawdown", label: "Measure 2 - Drawdown", title: "Decline from a prior peak", body: "A 70% drawdown requires a 233% rise from the new level merely to recover the starting value.", metric: "Recovery burden", tone: "orange" },
          { id: "liquidity", label: "Risk 3 - Liquidity", title: "Your exit may move the price", body: "A quoted recovery is irrelevant if size cannot be sold near the displayed market price.", metric: "Executable value", tone: "red" },
          { id: "permanent", label: "Risk 4 - Permanent loss", title: "Failure can outlast volatility", body: "Fraud, exploit, insolvency, lost keys or collapsing demand can make a decline unrecoverable.", metric: "Capital impairment", tone: "green" },
        ], classify("What kind of risk is this?", "Classify the evidence before deciding how to respond.", [
          { id: "volatility", label: "Price volatility", description: "Rapid market repricing" },
          { id: "liquidity", label: "Liquidity risk", description: "Cannot trade near quote" },
          { id: "fundamental", label: "Permanent-loss risk", description: "Thesis or control failure" },
        ], [
          { id: "v1", text: "Price swings 12% in one day on unchanged project news.", bucketId: "volatility", feedback: "This is large short-term price variability." },
          { id: "v2", text: "The screen shows R1, but a moderate sell receives R0.62 average execution.", bucketId: "liquidity", feedback: "Thin depth creates slippage and price impact." },
          { id: "v3", text: "Administrators mint unlimited tokens and drain the treasury.", bucketId: "fundamental", feedback: "The economic and control failure can permanently impair holders." },
          { id: "v4", text: "A bridge exploit makes backing unavailable.", bucketId: "fundamental", feedback: "This is not merely a noisy price; the underlying claim has changed." },
        ]), "A falling chart is a symptom. Diagnose market movement, liquidity and the underlying asset separately."),
      },
      {
        title: "Trace leverage and liquidation cascades",
        outcome: "Explain how leverage, collateral thresholds and forced selling can amplify price moves.",
        reference: `BIS research links crypto contract liquidations with volatility and shows leverage as a market-risk amplifier. [BIS working paper](${sources.bisLeverage})`,
        experience: experience("Cascade simulator", "Leverage converts movement into forced action", "Follow a leveraged position from small decline to automatic market pressure.", [
          { id: "borrow", label: "Stage 1 - Leverage", title: "Control more exposure than deposited capital", body: "A 10× position leaves little room for adverse movement before collateral becomes insufficient.", metric: "Amplified exposure", tone: "blue" },
          { id: "threshold", label: "Stage 2 - Threshold", title: "Mark price approaches maintenance margin", body: "Exchanges and protocols use their own mark, oracle and collateral rules—not the trader’s preferred long-term thesis.", metric: "Mechanical trigger", tone: "orange" },
          { id: "liquidate", label: "Stage 3 - Liquidation", title: "The position is closed automatically", body: "Forced orders can execute into thin liquidity, causing slippage and losses beyond the expected trigger price.", metric: "No discretion", tone: "red" },
          { id: "feedback", label: "Stage 4 - Feedback", title: "Selling pushes price toward other thresholds", body: "One liquidation can help trigger another, especially when collateral and borrowed exposure share the same volatile asset.", metric: "Cascade", tone: "green" },
        ], branch("A trader says a 10× long is safe because the asset is likely to recover this year", "What is the decisive flaw?", [
          { id: "horizon", label: "The long-term thesis prevents short-term liquidation.", verdict: "Time horizons confused", feedback: "The position can be closed mechanically before any recovery occurs.", tone: "risk" },
          { id: "stop", label: "A stop order guarantees the planned exit price.", verdict: "Execution overpromised", feedback: "Gaps and thin liquidity can produce substantial slippage.", tone: "caution" },
          { id: "path", label: "Survival depends on the path, collateral rules and liquidity—not only the final price.", verdict: "Path risk recognised", feedback: "Leverage makes interim volatility capable of ending the position.", tone: "good" },
        ]), "With leverage, being right eventually is insufficient. The position must survive every price path in between."),
      },
      {
        title: "Build a volatility control plan",
        outcome: "Use position sizing, liquidity, diversification, time horizon and written rules to manage—not predict—volatility.",
        reference: `IOSCO investor guidance highlights volatility and difficulty exiting illiquid crypto markets, supporting controls that begin with loss capacity and liquidity. [IOSCO risks](${sources.ioscoRisk})`,
        experience: experience("Decision plan", "Control exposure before emotion arrives", "Design rules that remain usable during a sharp rally or drawdown.", [
          { id: "capacity", label: "Control 1 - Loss capacity", title: "Use only capital whose impairment is survivable", body: "Risk tolerance is emotional; risk capacity includes obligations, cash runway and consequences of permanent loss.", metric: "Survivability", tone: "blue" },
          { id: "size", label: "Control 2 - Position size", title: "Size by portfolio damage, not excitement", body: "A speculative asset can be high risk without threatening the entire plan when exposure is deliberately limited.", metric: "Damage limit", tone: "orange" },
          { id: "liquidity", label: "Control 3 - Liquidity", title: "Keep near-term needs outside volatile positions", body: "Forced selling during a drawdown converts temporary volatility into a realised funding failure.", metric: "Time buffer", tone: "red" },
          { id: "rules", label: "Control 4 - Written rules", title: "Define buy, review and exit conditions in advance", body: "A schedule is not enough: review custody, thesis, concentration, liquidity and protocol changes.", metric: "Behaviour", tone: "green" },
        ], meter("Rate plan resilience", "This is risk education, not personalised financial advice. Score the process, not an expected return.", [
          { id: "capacity", label: "Loss capacity", lowLabel: "Essential money", highLabel: "Truly risk capital", weight: 1.4, initial: 30 },
          { id: "size", label: "Position size", lowLabel: "Portfolio-defining", highLabel: "Damage contained", weight: 1.3, initial: 35 },
          { id: "cash", label: "Liquidity buffer", lowLabel: "May need to sell", highLabel: "Needs covered", weight: 1.2, initial: 35 },
          { id: "leverage", label: "Leverage exposure", lowLabel: "High and fragile", highLabel: "None or tightly bounded", weight: 1.3, initial: 40 },
          { id: "rules", label: "Decision rules", lowLabel: "Emotion-led", highLabel: "Written and reviewed", weight: 1, initial: 35 },
        ], [
          { max: 39, label: "Fragile plan", feedback: "A drawdown could force damaging action or threaten essential obligations.", tone: "risk" },
          { max: 69, label: "Partly controlled", feedback: "Some buffers exist, but sizing, liquidity or behaviour remains exposed.", tone: "caution" },
          { max: 100, label: "Resilient process", feedback: "The plan limits damage and preserves decision capacity. It cannot eliminate asset risk.", tone: "good" },
        ]), "Risk management does not make a weak asset safe. It keeps one uncertain outcome from controlling your whole financial life."),
      },
    ],
    quiz: [
      ["What does volatility measure?", ["Magnitude and speed of price variation", "Project legitimacy", "Guaranteed loss", "Wallet security"], 0, "Volatility describes price variability in either direction.", "Volatility"],
      ["Why does a 70% drawdown require more than a 70% rebound?", ["The recovery starts from a smaller base", "Fees disappear", "Supply doubles automatically", "Wallets round prices"], 0, "After losing 70%, the remaining 30 must rise about 233% to return to 100.", "Drawdowns"],
      ["What makes liquidity risk different from volatility?", ["The desired trade may not execute near the displayed price", "It guarantees rising prices", "It concerns only private keys", "It removes slippage"], 0, "Thin depth can turn a quote into poor realised execution.", "Liquidity risk"],
      ["What can create permanent loss rather than temporary price movement?", ["Fraud, insolvency, exploit or destroyed demand", "A narrow spread", "A correct confirmation", "A hardware wallet"], 0, "Fundamental failure can prevent recovery even if markets later improve.", "Permanent loss"],
      ["Why does leverage amplify risk?", ["Small moves can exhaust collateral and force closure", "It removes volatility", "It guarantees a stop price", "It increases wallet security"], 0, "Leveraged exposure has less adverse-move tolerance.", "Leverage"],
      ["What is a liquidation cascade?", ["Forced selling helps trigger more forced selling", "A scheduled token burn", "A wallet backup", "A stable peg"], 0, "Mechanical closures can amplify price movement through feedback.", "Liquidation cascade"],
      ["What should position size reflect?", ["The damage the portfolio can survive", "Social-media excitement", "The number of available tokens", "Yesterday’s highest price"], 0, "Sizing is a primary control over portfolio-level consequences.", "Position sizing"],
      ["Does diversification across many correlated tokens remove risk?", ["No; shared drivers can make them fall together", "Yes, always", "Only during weekends", "Only with leverage"], 0, "Token count is not the same as independent risk exposure.", "Diversification"],
    ],
  },
  {
    number: "1.24", position: 24, title: "Common Cryptocurrency Terminology",
    lessons: [
      {
        title: "Translate wallet, network and transaction language",
        outcome: "Use core technical terms accurately and distinguish related concepts that create dangerous mistakes.",
        reference: `NIST defines a wallet as software or hardware for managing keys and addresses; Bitcoin documentation explains transactions as spends of prior outputs. [NIST wallet glossary](${sources.nistWallet}) - [Bitcoin transactions](${sources.bitcoinTransactions})`,
        experience: experience("Language decoder", "Precise words prevent expensive assumptions", "Build a working vocabulary around control, instructions and settlement.", [
          { id: "wallet", label: "Control - Wallet", title: "A tool that manages keys and addresses", body: "A wallet does not literally contain blockchain coins. It helps create and sign instructions using cryptographic authority.", metric: "Key management", tone: "blue" },
          { id: "address", label: "Destination - Address", title: "A public destination identifier", body: "An address can be shared for receiving. A private key or seed phrase must not be shared.", metric: "Receive", tone: "orange" },
          { id: "transaction", label: "Instruction - Transaction", title: "A signed request to change ledger state", body: "A transaction hash identifies the request; a block and confirmations describe its accepted history.", metric: "Transfer", tone: "red" },
          { id: "consensus", label: "Agreement - Consensus", title: "Rules for accepting valid history", body: "Miners, validators, nodes and finality are roles and outcomes—not interchangeable labels.", metric: "Network state", tone: "green" },
        ], classify("Choose the exact term", "Match each statement to the concept it actually describes.", [
          { id: "wallet", label: "Wallet", description: "Manages keys and signing" },
          { id: "address", label: "Address", description: "Public receiving destination" },
          { id: "hash", label: "Transaction hash", description: "Identifier for one transaction" },
          { id: "confirmation", label: "Confirmation", description: "Accepted block history" },
        ], [
          { id: "g1", text: "Software that authorises transfers with managed keys.", bucketId: "wallet", feedback: "The wallet is the key-management and signing interface." },
          { id: "g2", text: "The string a sender needs to direct funds to you.", bucketId: "address", feedback: "An address is shareable; secrets are not." },
          { id: "g3", text: "The identifier pasted into an explorer to find one transfer.", bucketId: "hash", feedback: "The transaction hash locates the network event." },
          { id: "g4", text: "Evidence that a transaction is included in accepted blockchain history.", bucketId: "confirmation", feedback: "Confirmation concerns settlement history, not business legitimacy." },
        ]), "If a term controls access, money or finality, define it before acting."),
      },
      {
        title: "Decode market, token and application terms",
        outcome: "Distinguish price, market cap, liquidity, token standards, smart contracts, dapps and DeFi mechanisms.",
        reference: `Ethereum defines token standards as interoperable smart-contract interfaces and smart contracts as programs residing at blockchain addresses. [Token standards](${sources.tokens}) - [Smart contracts](${sources.ethereumContracts})`,
        experience: experience("Concept map", "Related terms answer different questions", "Connect the market layer, asset layer and application layer without collapsing them together.", [
          { id: "market", label: "Market layer", title: "Price, spread, liquidity, volume and slippage", body: "These terms describe trading conditions. None establishes the token’s legal rights or technical security.", metric: "Trading", tone: "blue" },
          { id: "asset", label: "Asset layer", title: "Coin, token, stablecoin and NFT", body: "A coin is native to a network; a token generally follows a contract standard on an existing network.", metric: "Representation", tone: "orange" },
          { id: "application", label: "Application layer", title: "Smart contract, dapp, DEX, bridge and oracle", body: "The frontend, contracts, data feeds and administrators can have different degrees of decentralisation.", metric: "Execution", tone: "red" },
          { id: "incentive", label: "Incentive layer", title: "Staking, liquidity provision, yield and governance", body: "A reward label says nothing about source, risk, lock-up, dilution or who retains control.", metric: "Participation", tone: "green" },
        ], branch("A website calls itself a ‘decentralised, audited, high-yield dapp’", "What should the learner do first?", [
          { id: "trust", label: "Treat each term as proof of safety.", verdict: "Marketing accepted", feedback: "Labels can be technically narrow, unaudited in practice or unrelated to control.", tone: "risk" },
          { id: "reject", label: "Assume every dapp is fraudulent.", verdict: "Category confused with evidence", feedback: "The correct response is investigation, not automatic acceptance or rejection.", tone: "caution" },
          { id: "define", label: "Define each claim and verify contracts, control, audit scope and reward source.", verdict: "Language converted to tests", feedback: "Each adjective becomes an evidence request with clear boundaries.", tone: "good" },
        ]), "Vocabulary is useful only when it leads to the right evidence and the right boundary."),
      },
      {
        title: "Detect jargon, social pressure and scam language",
        outcome: "Recognise when terminology is being used to replace evidence, rush action or conceal control.",
        reference: `Smart-contract documentation describes code capabilities and limitations; a contract or audit label does not remove implementation and control risk. [Ethereum smart contracts](${sources.ethereumContracts})`,
        experience: experience("Claim filter", "Technical language can illuminate—or intimidate", "Turn community slogans and security claims into questions that a legitimate provider should answer clearly.", [
          { id: "culture", label: "Culture words", title: "HODL, WAGMI, diamond hands and moon", body: "These express identity or optimism. They are not valuation models, risk controls or evidence that holding remains rational.", metric: "Emotion", tone: "blue" },
          { id: "dismissal", label: "Dismissal words", title: "FUD and paper hands", body: "A label can pressure people to ignore criticism or avoid selling. Test the underlying claim instead.", metric: "Social control", tone: "orange" },
          { id: "security", label: "Security words", title: "Audited, immutable and non-custodial", body: "Ask who performed the audit, what version and scope it covered, and which admin or upgrade powers remain.", metric: "Evidence", tone: "red" },
          { id: "scam", label: "Scam patterns", title: "Phishing, honeypot, rug pull and address poisoning", body: "The safe response depends on the mechanism: protect secrets, verify contracts, test sellability and confirm addresses independently.", metric: "Action", tone: "green" },
        ], meter("Rate claim quality", "Score the evidence behind the language—not how confident or technical the promoter sounds.", [
          { id: "definition", label: "Clear definition", lowLabel: "Buzzword", highLabel: "Specific mechanism", weight: 1.1, initial: 35 },
          { id: "evidence", label: "Independent evidence", lowLabel: "Promoter says so", highLabel: "Verifiable primary source", weight: 1.4, initial: 30 },
          { id: "control", label: "Control disclosure", lowLabel: "Hidden admins", highLabel: "Powers mapped", weight: 1.3, initial: 30 },
          { id: "risk", label: "Risk disclosure", lowLabel: "Guaranteed", highLabel: "Failure modes stated", weight: 1.2, initial: 35 },
          { id: "pressure", label: "Decision pressure", lowLabel: "Act now", highLabel: "Time to verify", weight: 1.1, initial: 30 },
        ], [
          { max: 39, label: "Jargon replacing evidence", feedback: "The language creates urgency or authority without exposing mechanism, control and risk.", tone: "risk" },
          { max: 69, label: "Partly testable claim", feedback: "Some facts are visible, but important powers, scope or failure modes remain unclear.", tone: "caution" },
          { max: 100, label: "Evidence-led explanation", feedback: "Terms are defined, bounded and supported by sources that can be independently checked.", tone: "good" },
        ]), "When someone uses a sophisticated term, ask what it means here, who controls it, and how you can verify it."),
      },
    ],
    quiz: [
      ["What does a cryptocurrency wallet manage?", ["Keys and addresses used to authorise transactions", "Coins stored inside the phone", "Market prices", "Exchange licences"], 0, "Wallets manage cryptographic authority and transaction signing.", "Wallet"],
      ["Which item must remain secret?", ["Private key or seed phrase", "Receiving address", "Transaction hash", "Block number"], 0, "Anyone with the recovery secret may control the wallet’s assets.", "Key security"],
      ["What does a transaction hash do?", ["Identifies a specific transaction", "Guarantees a refund", "Proves legal identity", "Calculates market cap"], 0, "The hash is used to locate the network transaction.", "Transaction hash"],
      ["What is the difference between a coin and token?", ["A coin is native to its chain; a token generally uses an existing chain’s contract standard", "Tokens have no supply", "Coins cannot be transferred", "There is no difference"], 0, "Network-native assets and contract-issued tokens have different technical origins.", "Coins and tokens"],
      ["What does slippage describe?", ["Difference between expected and executed price", "Maximum supply", "A validator penalty", "Wallet recovery"], 0, "Market movement and depth can change realised execution.", "Slippage"],
      ["Does ‘audited’ guarantee a smart contract is safe?", ["No; scope, version, findings and remaining control still matter", "Yes, permanently", "Only for NFTs", "Only after a price rise"], 0, "An audit reduces some uncertainty but cannot prove absence of all vulnerabilities.", "Audit limits"],
      ["Why should criticism not automatically be dismissed as FUD?", ["It may identify genuine evidence or risk", "FUD always raises price", "Criticism reveals private keys", "All projects are identical"], 0, "Evaluate the claim rather than the social label attached to it.", "FUD"],
      ["What is the best response to unexplained technical jargon?", ["Ask for a clear definition, control map and verifiable evidence", "Invest immediately", "Share a seed phrase", "Assume complexity proves quality"], 0, "A legitimate mechanism should survive plain-language explanation and independent checking.", "Terminology discipline"],
    ],
  },
];

const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const lessonContent = (lesson) => `## Outcome\n\n${lesson.outcome}\n\n## Evidence base\n\n${lesson.reference}\n\n## How to use this lesson\n\nMove through each scene, complete the decision activity, then write one sentence explaining what evidence would change your conclusion. This is education, not financial advice.`;
const statements = [
  `UPDATE \`courses\` SET \`description\`=${sql("Twenty-four production-quality modules from the Digital Assets pathway. Short interactive lessons, evidence-led decisions and explained assessments. Private CogniZen review draft; educational content, not financial advice.")},\`updated_at\`=${createdAt} WHERE \`id\`=${sql(courseId)};`,
];

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

const target = new URL("../drizzle/0054_crypto_mastery_foundations_production_batch_6.sql", import.meta.url);
await writeFile(target, `${statements.join("\n--> statement-breakpoint\n")}\n`, "utf8");
console.log(`Wrote ${modules.length} modules, ${modules.length * 4} lessons and ${modules.reduce((total, item) => total + item.quiz.length, 0)} scored questions.`);
