INSERT OR IGNORE INTO `courses`
  (`id`,`school_id`,`owner_id`,`title`,`description`,`status`,`price_cents`,
   `enforce_lesson_order`,`certificate_title`,`certificate_accent`,
   `certificate_valid_days`,`created_at`,`updated_at`)
SELECT
  'stefan-bitcoin-genesis-next-era',
  s.id,
  s.owner_id,
  'Bitcoin: From Genesis to the Next Era',
  'An evidence-led deep dive into where Bitcoin came from, how it actually works, why its monetary and security design remains contested, and which credible paths could shape its next era.',
  'draft',
  0,
  1,
  'Certificate: Bitcoin Foundations and Futures',
  '#f7931a',
  0,
  1784488000000,
  1784488000000
FROM `schools` s
WHERE s.slug='stefan-roodt-s-academy'
LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections` (`id`,`course_id`,`title`,`position`,`created_at`)
SELECT column1,column2,column3,column4,column5
FROM (VALUES
  ('btc-section-01','stefan-bitcoin-genesis-next-era','1. Before Bitcoin and the Genesis moment',1,1784488000000),
  ('btc-section-02','stefan-bitcoin-genesis-next-era','2. How the Bitcoin machine works',2,1784488000000),
  ('btc-section-03','stefan-bitcoin-genesis-next-era','3. Monetary policy, mining, and incentives',3,1784488000000),
  ('btc-section-04','stefan-bitcoin-genesis-next-era','4. Ownership, custody, markets, and privacy',4,1784488000000),
  ('btc-section-05','stefan-bitcoin-genesis-next-era','5. How Bitcoin evolves and scales',5,1784488000000),
  ('btc-section-06','stefan-bitcoin-genesis-next-era','6. The strongest criticisms and real risks',6,1784488000000),
  ('btc-section-07','stefan-bitcoin-genesis-next-era','7. Where Bitcoin could go next',7,1784488000000)
)
WHERE EXISTS (SELECT 1 FROM `courses` WHERE id='stefan-bitcoin-genesis-next-era');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
  (`id`,`course_id`,`title`,`section_id`,`lesson_type`,`content`,`content_format`,
   `video_key`,`duration_minutes`,`is_preview`,`available_after_days`,
   `required_watch_percent`,`transcript`,`position`,`updated_at`)
SELECT
  column1,column2,column3,column4,column5,column6,column7,column8,column9,
  column10,column11,column12,column13,column14,column15
FROM (VALUES
(
  'btc-lesson-01','stefan-bitcoin-genesis-next-era',
  'The problem Bitcoin tried to solve','btc-section-01','video',
'# The problem Bitcoin tried to solve

## Your outcome

Explain why digital scarcity is hard and why earlier electronic money normally required a trusted ledger operator.

## The central problem

A digital file can be copied. Money cannot allow one unit to be spent twice. Centralised payment systems solve this with an authoritative database, identity controls, reversals, and institutional rules.

Bitcoin asked whether strangers could agree on payment history without appointing one operator.

## Three design requirements

- Prevent double-spending
- Decide transaction order
- Make rewriting history prohibitively costly

> Bitcoin did not invent digital signatures, peer-to-peer networking, or proof of work. Its breakthrough was combining existing ideas into a working incentive system.

## Reflection

Which functions of a bank or payment processor are technical, which are legal, and which are customer-service functions? Bitcoin addresses only part of that stack.

Start with the [Bitcoin whitepaper](https://bitcoin.org/bitcoin.pdf).',
  'markdown',NULL,6,1,0,80,
'Before Bitcoin, sending information across the internet was easy. Sending a scarce digital object was not.

If Alice emails a photograph to Bob, Alice still has a copy. That is useful for information and fatal for bearer money. A digital payment system must prevent Alice from spending the same unit once with Bob and again with Carol. This is the double-spending problem.

Centralised systems solve it by appointing an authority. A bank maintains account balances. A card network orders messages, rejects duplicates, manages disputes, and can reverse transactions. Users trust the institution, its database, its legal environment, and its security.

Earlier digital-cash research explored privacy-preserving bank money, cryptographic scarcity, and distributed records. The difficult combination was to remove the central issuer while keeping one accepted order of payments in an open network where participants could be anonymous, messages could arrive late, and attackers could create many identities.

Bitcoin combined digital signatures, a peer-to-peer network, proof of work, a chain of timestamped blocks, and an incentive paid in the system’s own asset. Transactions propose who may spend particular outputs. Nodes independently verify rules. Miners compete to order valid transactions into blocks. Rewriting accepted history requires redoing proof of work and overtaking the honest chain.

The incentive is essential. Miners spend real resources and receive new bitcoin plus transaction fees. The asset funds the security process that protects the asset. That circular-looking design can become a reinforcing system if people value the asset and miners expect valid rewards. It can also weaken if the economics fail.

Bitcoin did not remove every intermediary. Most people still use wallet developers, internet providers, exchanges, custodians, and payment services. It did not solve identity, consumer refunds, taxation, or the truth of off-chain claims. It created a narrow but important capability: a public bearer-asset ledger whose rules can be verified independently and whose history is costly to alter.

Keep the scope precise. Bitcoin is a protocol for issuing and transferring a scarce digital asset under a distributed consensus rule set. Whether it is good money, an investment, a settlement system, or a social movement requires additional economic and political arguments. This course will examine those arguments without confusing them with the protocol facts.',
  1,1784488000000
),
(
  'btc-lesson-02','stefan-bitcoin-genesis-next-era',
  'The cypherpunk lineage: useful pieces, not a lone miracle','btc-section-01','video',
'# The cypherpunk lineage

## Your outcome

Connect Bitcoin to the earlier ideas it assembled.

## Building blocks

- Public-key cryptography and digital signatures
- Hash functions and Merkle trees
- Chaumian digital cash
- Hashcash proof of work
- b-money and Bit Gold proposals
- Peer-to-peer file-sharing networks

## Historical discipline

Similarity does not prove authorship. Satoshi Nakamoto remains a pseudonym; claims about identity need extraordinary evidence.

## Source exercise

For each predecessor, record the problem it addressed and the piece that Bitcoin changed.

Read Adam Back’s [Hashcash material](https://www.hashcash.org/papers/) and the primary-source [Bitcoin announcement archive](https://www.metzdowd.com/pipermail/cryptography/2008-October/014810.html).',
  'markdown',NULL,6,0,0,80,
'Bitcoin arrived from a long conversation about privacy, cryptography, and digital money.

Public-key cryptography made it possible to publish a verification key while retaining a secret signing key. Digital signatures let a network verify authorisation without learning the secret. Cryptographic hashes produced compact fingerprints and linked data so changes became visible. Merkle trees summarised many transactions efficiently.

David Chaum’s work on blind signatures showed that digital payments could protect privacy, but practical systems still depended on an issuer. Adam Back introduced Hashcash as an anti-spam mechanism: a sender performed computational work that was costly to produce and cheap to verify. Bitcoin repurposed proof of work to select block history and make alteration expensive.

Wei Dai’s b-money described anonymous participants maintaining a shared accounting system, while Nick Szabo’s Bit Gold discussed scarce digital objects created through computational work. Peer-to-peer systems demonstrated that networks could continue without one central server. None of these predecessors, alone, produced Bitcoin’s complete operational design.

Satoshi Nakamoto’s synthesis linked proof of work to a public chain, adjusted difficulty to target a block interval, rewarded block production with newly issued units, and specified a supply schedule. The network could bootstrap security by issuing the very asset it secured.

This lineage matters for two reasons. First, it replaces mythology with engineering. Bitcoin was innovative because of the combination and incentives, not because every component appeared for the first time. Second, it helps us evaluate future proposals. Bitcoin has always evolved through careful reuse, review, adversarial testing, and trade-offs.

The identity of Satoshi remains unproven. Writing style, time zones, early mining patterns, and technical similarities are clues, not conclusive identity evidence. A high-quality history distinguishes primary records from inference and inference from speculation.

The deeper cypherpunk idea was that privacy and individual autonomy could be supported by software rather than promises alone. Bitcoin turned one part of that philosophy into a running network. It also exposed the limits: public ledgers create surveillance opportunities, physical infrastructure concentrates, and users often reintroduce trusted custodians for convenience.',
  2,1784488000000
),
(
  'btc-lesson-03','stefan-bitcoin-genesis-next-era',
  'Whitepaper, Genesis Block, and the first network','btc-section-01','video',
'# Whitepaper, Genesis Block, and the first network

## Your outcome

Place the announcement, software release, Genesis Block, and first transaction in the correct sequence.

## Anchor dates

- 31 October 2008: whitepaper announcement
- 3 January 2009: Genesis Block timestamp
- 8 January 2009: Bitcoin v0.1 announcement
- 12 January 2009: first recorded person-to-person bitcoin transaction

## Read carefully

The Genesis coinbase text references a newspaper headline about bank bailouts. It provides a timestamp and context; interpretations of Satoshi’s full political intention remain inference.

## Primary-source habit

Separate what the source directly shows, what is strongly supported, and what is later mythology.

Review the [original paper](https://bitcoin.org/en/bitcoin-paper) and [v0.1 release archive](https://www.metzdowd.com/pipermail/cryptography/2009-January/014994.html).',
  'markdown',NULL,6,0,0,80,
'On 31 October 2008, Satoshi Nakamoto announced “Bitcoin: A Peer-to-Peer Electronic Cash System” to a cryptography mailing list. The paper proposed direct online payments without a financial institution, using a peer-to-peer timestamp network and proof of work to order transactions.

The timing mattered. A global financial crisis had exposed failures in banking, credit, and institutional trust. On 3 January 2009, the Genesis Block included the text “The Times 03/Jan/2009 Chancellor on brink of second bailout for banks.” The text proves the block could not have been created before that headline and places the launch in its historical moment. It does not, by itself, settle every claim about Satoshi’s politics.

The first public software release followed in January. Early participants could run a node and mine with ordinary computer processors because competition was minimal. Hal Finney received the first widely recognised person-to-person bitcoin transaction from Satoshi on 12 January.

Early Bitcoin had no established market price, mature wallet ecosystem, specialised mining hardware, or expectation of institutional adoption. Security was low in absolute computing terms because the network was small. Its value was experimental. Participants were testing whether the system could remain coherent.

Satoshi continued contributing code and discussion before stepping back. That disappearance removed a natural founder authority but did not make the system leaderless in every sense. Developers still maintained software, miners selected transactions, node operators chose rules, businesses shaped adoption, and users assigned economic value.

The Genesis story is often compressed into destiny: crisis produced perfect digital money. The primary sources show something more interesting and less certain—a working experiment launched into sceptical technical debate. Critics questioned scaling, incentives, network attacks, and law from the beginning.

For this course, history is not decoration. The original objectives become a benchmark. Does modern Bitcoin still support peer-to-peer electronic cash? Has it become mainly digital collateral or a savings asset? Do custodial platforms recreate the intermediaries the paper tried to avoid? Those tensions lead directly to the question of where Bitcoin may go next.',
  3,1784488000000
),
(
  'btc-lesson-04','stefan-bitcoin-genesis-next-era',
  'Lab: build a source-verified Bitcoin timeline','btc-section-01','text',
'# Lab: build a source-verified Bitcoin timeline

Create a timeline with ten events between 1997 and 2011.

## For every event include

1. Date
2. Direct primary source
3. What the source proves
4. What it does **not** prove
5. Why the event matters

Include Hashcash, the Bitcoin announcement, Genesis Block, software release, first transaction, an early difficulty change, the first documented market exchange, and Satoshi’s departure.

## Evidence labels

- **Documented:** directly supported by source material
- **Corroborated:** supported by several independent records
- **Inferred:** reasonable but not directly stated
- **Speculative:** possible without strong evidence

## Deliverable

Write a 250-word origin story using only documented and corroborated claims. Add one paragraph identifying a popular Bitcoin myth that your evidence could not confirm.',
  'markdown',NULL,6,0,0,0,'',4,1784488000000
),
(
  'btc-lesson-05','stefan-bitcoin-genesis-next-era',
  'Checkpoint: origins and evidence','btc-section-01','quiz',
'# Checkpoint: origins and evidence

Distinguish historical records, engineering lineage, and later interpretation. A confident answer is not necessarily an evidenced answer.',
  'markdown',NULL,6,0,0,0,'',5,1784488000000
),
(
  'btc-lesson-06','stefan-bitcoin-genesis-next-era',
  'Transactions are UTXOs, not account balances','btc-section-02','video',
'# Transactions are UTXOs

## Your outcome

Trace inputs, outputs, change, and fees through a Bitcoin transaction.

## Core model

A wallet balance is the sum of spendable **unspent transaction outputs**.

- Inputs reference earlier outputs.
- Outputs lock specific amounts to spending conditions.
- Change returns surplus to a new output.
- Fee equals input value minus output value.

## Worked example

Inputs: 70,000 and 40,000 sats  
Payment: 75,000 sats  
Change: 34,000 sats  
Fee: 1,000 sats

## Privacy warning

Change detection and input grouping are inferences used by chain-analysis tools. Reusing addresses makes linkage easier.

Use the [Bitcoin transaction guide](https://developer.bitcoin.org/devguide/transactions.html).',
  'markdown',NULL,6,0,0,80,
'Bitcoin does not maintain one editable balance number for each user. It tracks transaction outputs.

When a transaction creates an output, that output contains an amount in satoshis and a script defining how it may be spent. Until a later transaction consumes it, the output is a UTXO—an unspent transaction output.

A new transaction selects one or more UTXOs as inputs. Each input identifies a previous transaction and output index, then provides witness data that satisfies the earlier spending condition. The transaction creates new outputs. Nodes verify that inputs exist, remain unspent, satisfy their scripts, and do not create more value than they consume.

Suppose a wallet controls UTXOs worth 70,000 and 40,000 satoshis. It wants to pay 75,000. If it selects both, the inputs total 110,000. The transaction might create 75,000 to the recipient and 34,000 to a fresh change output. The remaining 1,000 becomes the fee. There is no special fee field; the fee is the difference.

This model has practical consequences. Fees depend mainly on transaction weight, not the amount transferred. Spending many small UTXOs can cost more than spending one large output. “Dust” can become uneconomic when fees rise. Wallet coin selection affects privacy and future cost.

Ownership is shorthand. The chain does not know names or legal owners. It knows whether a proposed spend satisfies the script for a UTXO. A private key is not attached to a coin; it is used to produce evidence that satisfies a spending condition.

The public graph also leaks structure. Analysts infer that inputs spent together may share control and identify which output is change. Those heuristics can be wrong, especially with collaborative transactions, but repeated address use and predictable wallet behaviour reduce privacy.

The UTXO model is central to Bitcoin’s direction. Lightning channels, vault proposals, coinjoins, silent payments, inscriptions, fee markets, and covenant debates all operate through the creation and spending of outputs. If you understand UTXOs, you can reason about Bitcoin without relying on wallet-interface metaphors.',
  6,1784488000000
),
(
  'btc-lesson-07','stefan-bitcoin-genesis-next-era',
  'Keys, addresses, Script, and spending policy','btc-section-02','video',
'# Keys, addresses, Script, and spending policy

## Your outcome

Distinguish a key, address, output script, signature, wallet seed, and descriptor.

## Important boundaries

- An address encodes information used to construct an output.
- A private key authorises a compatible spend.
- Script defines the conditions.
- A wallet coordinates keys, policies, transactions, and backups.
- A descriptor expresses how a wallet finds and spends outputs.

## Beyond one key

Bitcoin supports multisignature, timelocks, recovery paths, and Taproot policies.

> Never enter a real seed phrase, private key, or extended private key into a course activity.

See [Bitcoin Core wallet management](https://github.com/bitcoin/bitcoin/blob/master/doc/managing-wallets.md) and [BIP 32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).',
  'markdown',NULL,6,0,0,80,
'A Bitcoin address is not an account and does not contain bitcoin. It is an encoded instruction that helps a sender create a standard output script.

The output script defines a condition. A later transaction supplies witness data, often a public key and signature, that satisfies it. Nodes execute the relevant validation rules. A valid signature proves control of a private key for the signed transaction data.

Bitcoin Script is deliberately limited. It supports signature checks, hashes, timelocks, and conditional paths while avoiding unrestricted computation. Simple payments use standard templates; more advanced policies can require multiple keys or delayed recovery.

A wallet manages this complexity. Modern hierarchical deterministic wallets derive many keys from one seed. BIP 32 describes a tree of extended keys. That improves backup and address generation, but it creates powerful secrets: an extended private key can control an entire branch, while an extended public key can reveal transaction history for that branch.

Seed phrases are human-readable encodings used by many wallets to restore key material. They are master secrets, not passwords. A device password may protect one installation; the seed can recreate the wallet elsewhere. Course staff and legitimate support should never request it.

Descriptors are a newer way to define wallet policy explicitly. A descriptor can say which keys, script type, derivation paths, and multisignature threshold belong to a wallet. This makes backups and watch-only coordination more precise than a loose collection of keys.

Multisignature distributes authority. A two-of-three arrangement can tolerate one lost key and prevent one compromised signer from spending alone. Timelocks can create delayed recovery or staged controls. Taproot and MuSig2 can make cooperative multisignature spends more efficient and less distinguishable from single-key spends.

Security is not only cryptography. Backup location, inheritance, signer independence, device supply chain, transaction verification, and recovery rehearsal matter. A mathematically strong key stored in one fragile place is weak custody.

When evaluating a wallet, ask what policy controls the UTXOs, how keys are generated, what backup restores, whether addresses are verified on a trusted display, and what happens after loss or compromise. That is more useful than the label “cold” or “hardware” alone.',
  7,1784488000000
),
(
  'btc-lesson-08','stefan-bitcoin-genesis-next-era',
  'Blocks, proof of work, and difficulty adjustment','btc-section-02','video',
'# Blocks, proof of work, and difficulty

## Your outcome

Explain what miners search for, why verification is cheap, and how difficulty stabilises block production.

## Block header ingredients

- Version
- Previous block hash
- Merkle root
- Timestamp
- Target encoding
- Nonce

Miners hash candidate headers until a value falls below the target.

## Difficulty adjustment

Every 2,016 blocks, the target changes according to how long the previous period took, within protocol limits. The goal is roughly ten minutes per block on average—not exactly ten minutes each.

## Important distinction

Proof of work proposes history. Full nodes still reject blocks that violate consensus rules.

Use the [Bitcoin mining guide](https://developer.bitcoin.org/devguide/mining.html).',
  'markdown',NULL,6,0,0,80,
'Mining is the process that orders valid transactions into blocks and attaches measurable work to the chain.

A miner constructs a candidate block with a coinbase transaction and selected mempool transactions. The block header commits to the previous block and to a Merkle root representing the included transactions. Mining hardware repeatedly changes available data and computes the header hash.

For a block to be valid, the hash interpreted as a number must fall below the current target. There is no shortcut known for finding such a hash; miners perform enormous numbers of trials. Verification requires one hash and the normal block checks, so proof is expensive to produce and cheap to verify.

Hashing is probabilistic. A miner with ten percent of total hash rate does not produce every tenth block on schedule. Over time, the expected share approaches ten percent, but short-term results vary.

If more machines join, blocks would arrive faster. Bitcoin therefore adjusts the target every 2,016 blocks based on the elapsed time for the previous period, with limits on each adjustment. The design aims for an average interval near ten minutes. Individual blocks may be seconds or hours apart.

The chain with the greatest cumulative proof of work becomes the reference history under Bitcoin’s consensus logic. Rewriting an old block changes its hash and every descendant reference. An attacker must redo the work and catch the honest chain.

Miners do not decide validity by themselves. A miner may create a block, but full nodes independently verify its proof of work, transaction rules, subsidy, scripts, and limits. An invalid block is rejected even if substantial energy produced it. Hash power provides ordering and resistance to history revision within rules enforced by nodes.

Proof of work has costs and benefits. The expenditure anchors security in physical resources and makes attacks observable and costly. It also consumes electricity, creates specialised industry, and can concentrate around cheap energy, hardware supply, and pools.

The correct description is neither “miners solve useful equations” nor “energy creates value.” Miners search for valid proof. The market value of bitcoin makes that search economically worthwhile, while the resulting work helps protect the accepted history.',
  8,1784488000000
),
(
  'btc-lesson-09','stefan-bitcoin-genesis-next-era',
  'Nodes, consensus, confirmations, and finality','btc-section-02','video',
'# Nodes, consensus, confirmations, and finality

## Your outcome

Explain who enforces Bitcoin’s rules and why confirmations provide probabilistic rather than absolute finality.

## Roles

- Wallet: constructs and signs
- Full node: verifies and relays
- Miner: proposes a proof-of-work block
- Economic actor: chooses which rules and asset it recognises

## Confirmation reasoning

A payment in a block has one confirmation. Later blocks add cumulative work. The appropriate waiting policy depends on value, counterparty, and attack risk.

## Governance lesson

Bitcoin consensus is not a simple vote of miners, developers, nodes, or coin holders. Changes succeed only when enough of the ecosystem coordinates around compatible rules.

Read the [blockchain guide](https://developer.bitcoin.org/devguide/block_chain.html).',
  'markdown',NULL,6,0,0,80,
'A Bitcoin full node receives transactions and blocks, checks them against its software’s consensus rules, and maintains the valid chain with the most cumulative proof of work.

The node verifies that inputs exist and remain unspent, scripts succeed, amounts balance, block proof meets the target, the coinbase does not overpay, and every other consensus limit is respected. It does not need to trust a miner or block explorer.

Miners choose transaction ordering and produce candidate blocks. They cannot force an upgraded rule on nodes that reject it. Developers write and review software, but users choose whether to run it. Exchanges, merchants, custodians, and holders affect which chain has economic relevance. This distributed dependency is why Bitcoin governance is slow and difficult to summarise.

A transaction seen in the mempool has zero confirmations and may be replaced, conflicted, or never mined. Inclusion creates the first confirmation. Each later block adds work above it, reducing the probability that an alternative branch replaces that history.

Bitcoin finality is probabilistic. There is no central operator declaring an irreversible moment. The correct confirmation threshold depends on context. A low-value retail payment may accept more risk than a high-value settlement. Lightning uses a different mechanism for fast conditional settlement backed by on-chain enforcement.

Temporary chain reorganisations can occur when valid blocks are discovered nearly simultaneously. Nodes converge as one branch accumulates more work. A deep reorganisation is far less likely under honest majority hash power but not mathematically impossible.

Light clients reduce resource requirements by verifying headers or using compact filters, but their trust assumptions differ. A full node provides the strongest independent verification of consensus. It still relies on software correctness, network connectivity, and hardware.

The phrase “nodes control Bitcoin” also needs care. A node can enforce rules for its operator, but one isolated node cannot create market acceptance. Consensus emerges from technical validation and social-economic coordination.

This model explains conservative upgrades. A change that splits rule interpretation can create incompatible assets and histories. Bitcoin values verification and continuity, so proposals need implementation, review, testing, deployment design, and broad adoption—not a CEO’s approval.',
  9,1784488000000
),
(
  'btc-lesson-10','stefan-bitcoin-genesis-next-era',
  'Lab: audit a transaction and block','btc-section-02','text',
'# Lab: audit a transaction and block

No wallet or funds are required.

## Part A: transaction

Use a reputable explorer linked from Bitcoin documentation. Record:

- Transaction ID
- Inputs and referenced outputs
- New outputs
- Total input and output value
- Fee and virtual size
- Fee rate
- Confirmation count

Identify likely payment and change outputs, then label that conclusion as an **inference**.

## Part B: block

Record height, hash, previous-block hash, timestamp, difficulty, transaction count, size or weight, coinbase value, subsidy, and fees.

## Verification limits

An explorer presents its own interpretation. Explain which claims a local full node could verify independently and which claims still depend on off-chain identity evidence.

## Deliverable

Create a one-page audit note explaining the difference between transaction validity, confirmation, identity, and legal ownership.',
  'markdown',NULL,6,0,0,0,'',10,1784488000000
),
(
  'btc-lesson-11','stefan-bitcoin-genesis-next-era',
  'Checkpoint: the Bitcoin machine','btc-section-02','quiz',
'# Checkpoint: the Bitcoin machine

Trace the data. Correct answers distinguish wallet display from consensus state, mining from validation, and confirmation from identity.',
  'markdown',NULL,6,0,0,0,'',11,1784488000000
),
(
  'btc-lesson-12','stefan-bitcoin-genesis-next-era',
  'The 21 million schedule and halving logic','btc-section-03','video',
'# The 21 million schedule

## Your outcome

Explain issuance, halvings, satoshis, and why “21 million” is an asymptotic protocol result rather than a vault inventory.

## Schedule

- Initial subsidy: 50 BTC per block
- Halving interval: 210,000 blocks
- Current subsidy after the 2024 halving: 3.125 BTC
- One bitcoin: 100,000,000 satoshis

The geometric issuance series approaches 21 million BTC. Fees are separate from subsidy.

## Critical distinction

Fixed protocol issuance does not create fixed purchasing power. Demand, liquidity, leverage, regulation, and macro conditions still move price.

Read the [Bitcoin block reference](https://developer.bitcoin.org/reference/block_chain.html).',
  'markdown',NULL,6,0,0,80,
'Bitcoin’s monetary policy is encoded in consensus rules.

The coinbase transaction in a valid block may claim transaction fees plus a block subsidy. The subsidy began at 50 bitcoin and halves every 210,000 blocks, roughly every four years. After the April 2024 halving, the subsidy became 3.125 BTC.

The sequence 50, 25, 12.5, 6.25, 3.125 and onward forms a geometric series. Across all eras, issuance approaches 21 million bitcoin. Integer accounting in satoshis eventually drives the subsidy to zero. The last fractions are expected far in the future, while exact calendar timing depends on block production.

“Twenty-one million” is not a pile pre-created at launch. New units become spendable through valid coinbase outputs. Some coins are likely lost because keys disappeared, so spendable supply may be lower. The protocol cannot distinguish intentional long-term holding from permanent loss.

The schedule is credible because full nodes reject blocks that claim too much. Changing it would require users and economic actors to adopt incompatible rules. Code can be modified, but unilateral modification does not change the network recognised as Bitcoin.

Scarcity is necessary for the monetary thesis but not sufficient for value. Many scarce objects have little demand. Bitcoin’s market value also depends on security, liquidity, custody, legal treatment, network effects, and belief that future participants will accept the same rules.

Halvings reduce new supply flow and miner subsidy revenue. They do not mechanically guarantee a price increase. Market participants can anticipate scheduled events, and demand can fall. Historical price patterns involve a small sample and changing macro environments.

The future debate follows directly. As subsidy declines, fees must represent a larger share of miner revenue unless price appreciation offsets the lower BTC amount. Will base-layer settlement create a strong fee market? Will second layers preserve enough demand for block space? Could security remain adequate with lower revenue? The issuance schedule is fixed under current rules; the economic outcome is not.',
  12,1784488000000
),
(
  'btc-lesson-13','stefan-bitcoin-genesis-next-era',
  'Mining economics, pools, and geographic power','btc-section-03','video',
'# Mining economics and pools

## Your outcome

Model miner revenue, costs, variance, and the difference between a pool operator and underlying hashers.

## Simplified equation

Revenue = expected share of subsidy and fees × BTC price  
Profit = revenue − electricity − hardware − hosting − finance − operations

## Why pools exist

Solo mining has extreme variance. Pools aggregate proof contributions and distribute more frequent payouts.

## Concentration questions

- Who builds the ASICs?
- Who controls pool templates?
- Where is electricity available?
- Can miners switch pools?
- Does Stratum allow individual transaction selection?

## Activity

Explain why high hash rate can strengthen attack resistance while pool concentration can still create censorship concerns.',
  'markdown',NULL,6,0,0,80,
'Mining is a competitive business built around probability.

A miner’s expected bitcoin revenue depends on its share of network hash rate, the block subsidy, fees, and uptime. Fiat profitability also depends on BTC price. Costs include electricity, specialised ASIC hardware, cooling, hosting, staff, financing, and downtime.

Difficulty adjusts when total hash power changes. If price and fees rise, mining can become more profitable, attracting machines. Difficulty later increases and compresses margins. If revenue falls, inefficient miners shut down, difficulty eventually decreases, and surviving miners gain a larger expected share.

Solo mining has high variance. A small miner might wait years for a block. Pools allow many hashers to submit lower-difficulty shares that prove contributed work. When the pool finds a network-valid block, it distributes revenue according to its payout scheme.

Pool statistics can be misread. A pool coordinating a large percentage of recent blocks does not necessarily own all underlying machines. Hashers may switch pools. Yet the pool can still influence block templates, transaction selection, and payout policy, which creates operational and censorship risk.

Hardware manufacturing can concentrate because ASIC design and fabrication require capital and supply-chain access. Mining location concentrates around cheap power, favourable regulation, cooling, and grid connections. Political restrictions can move hash rate, but physical relocation takes time and capital.

Mining decentralisation has several dimensions: ownership of machines, pool coordination, geography, firmware, financing, hosting, and transaction-template control. A single percentage cannot capture them all.

The network can tolerate individual miner failure. A majority-hash attacker could reorder recent transactions, censor, or attempt double-spends, but cannot create coins beyond rules or spend UTXOs without valid authorisation. Sustaining an attack is costly and visible, though economic damage may occur before response.

Future mining will be shaped by declining subsidy, fee demand, energy markets, regulation, hardware efficiency, and template decentralisation. The relevant question is not whether mining is perfectly decentralised. It is whether concentration creates affordable coercion or attack relative to the value the network secures.',
  13,1784488000000
),
(
  'btc-lesson-14','stefan-bitcoin-genesis-next-era',
  'Fees, the mempool, and the long-term security budget','btc-section-03','video',
'# Fees and the security budget

## Your outcome

Explain fee rates, mempool competition, replacement, child-pays-for-parent, and the security-budget question.

## Fee market

Wallets bid satoshis per virtual byte. Miners generally prefer transaction packages with higher expected fee rates.

## Useful tools

- RBF: replace an unconfirmed transaction with a higher-fee version under policy
- CPFP: spend an output with a high-fee child so the package becomes attractive
- Package relay: communicate related transactions more effectively

## Long-term question

As subsidy declines, can demand for scarce block space support sufficient mining revenue?

Bitcoin Core 31 introduced a cluster-mempool design for package-aware ordering and replacement. Review the [Core 31 release notes](https://bitcoincore.org/en/releases/31.0/).',
  'markdown',NULL,6,0,0,80,
'Unconfirmed transactions compete for scarce block space.

A wallet chooses inputs and outputs, then sets a fee. Because transaction capacity is constrained by weight, the useful bidding unit is satoshis per virtual byte. A large-value transfer can pay a low fee if structurally small; a small payment can be expensive if it consolidates many inputs.

Nodes maintain mempools under local policy. Mempools are not identical: transactions arrive at different times, policies differ, and nodes evict when limits are reached. Miners assemble packages they expect to maximise revenue while respecting consensus and policy constraints.

Replace-by-fee lets a sender create a higher-fee replacement under accepted policy. Child-pays-for-parent lets a spender attach a high-fee child to a low-fee parent, making the combined package attractive. These tools matter for wallets and for protocols such as Lightning that may need timely confirmation.

Bitcoin Core 31 reimplemented mempool handling around transaction clusters. Instead of evaluating every transaction in isolation, the software can reason about connected parents and children, package ordering, eviction, and replacement quality. This is engineering progress without a consensus-rule change.

Fees also fund security. Miner revenue equals subsidy plus fees. Each halving reduces subsidy in BTC terms. A rising BTC price can offset that in fiat terms, but relying on price growth forever is not a protocol guarantee.

One future is a robust settlement fee market: high-value users and second-layer protocols compete for block space, producing substantial revenue. Another is weaker demand and lower security expenditure. A third involves changing miner economics through new uses of block space. Each path creates trade-offs for affordability, censorship resistance, and decentralisation.

The “security budget” has no agreed minimum. Attack incentives depend on hash-equipment availability, energy, derivative markets, duration, coordination, and the value at risk. Higher revenue generally attracts more work, but security is not a simple dollar threshold.

Fees therefore connect user experience to long-term security. Scaling aims to serve more economic activity without requiring every retail action on-chain, while still creating enough demand for final settlement. Whether that balance succeeds is one of Bitcoin’s most important open economic questions.',
  14,1784488000000
),
(
  'btc-lesson-15','stefan-bitcoin-genesis-next-era',
  'Lab: test a Bitcoin economic claim','btc-section-03','text',
'# Lab: test a Bitcoin economic claim

Choose one statement:

- “A halving always causes price to rise.”
- “Fees will definitely replace the subsidy.”
- “More hash rate makes every attack impossible.”
- “Fixed supply makes bitcoin an inflation hedge.”
- “Mining always finds the cheapest wasted energy.”

## Build the test

1. Rewrite the statement as a falsifiable claim.
2. Define the variable and time horizon.
3. Identify protocol facts that are fixed.
4. Identify market variables that are not fixed.
5. Find a counterexample or competing mechanism.
6. State the evidence that would change your conclusion.

## Deliverable

Produce a one-page claim card with:

- Claim
- Mechanism
- Evidence
- Counterevidence
- Confidence level
- Unknowns

> Quality test: Never infer future certainty from a small number of historical cycles.',
  'markdown',NULL,6,0,0,0,'',15,1784488000000
),
(
  'btc-lesson-16','stefan-bitcoin-genesis-next-era',
  'Checkpoint: money, mining, and incentives','btc-section-03','quiz',
'# Checkpoint: money, mining, and incentives

Protocol rules are not price predictions. Select answers that preserve the difference between a fixed schedule and an uncertain market response.',
  'markdown',NULL,6,0,0,0,'',16,1784488000000
),
(
  'btc-lesson-17','stefan-bitcoin-genesis-next-era',
  'Custody: from one seed to institutional controls','btc-section-04','video',
'# Custody: from one seed to institutional controls

## Your outcome

Design custody around threats, recovery, and authority rather than slogans.

## Custody spectrum

- Single-key self-custody
- Hardware signer
- Multisignature
- Collaborative custody
- Qualified or institutional custodian
- Exchange balance

## Questions that matter

- Who can authorise a spend?
- What is needed to recover?
- Can one device, person, company, or jurisdiction fail the system?
- Can the user verify the destination?
- How is inheritance handled?

## Rule

“Not your keys” identifies counterparty risk. It does not prove every self-custody setup is safe.

No course activity requires real keys or funds.',
  'markdown',NULL,6,0,0,80,
'Bitcoin makes direct key control possible. It does not make key management easy.

Single-key self-custody gives one secret unilateral authority. It is simple but creates one failure point. A hardware signer can isolate keys and show transaction details on a trusted display, yet backup, firmware, supply chain, and user verification still matter.

Multisignature distributes control. A two-of-three policy can survive one lost signer and resist one compromise. Its safety depends on independent key generation, geographically and organisationally separate backups, correct policy records, and tested recovery.

Collaborative custody divides keys between a user and service. It may improve recovery and support while preventing the provider from spending alone. The provider remains a dependency. Institutional custody can add controls, insurance arrangements, audit, governance, and regulated processes, but users hold a claim against the custodian rather than independently controlling every transaction.

An exchange balance is generally an internal liability, not a UTXO assigned to the customer. The platform may pool assets, freeze withdrawals, fail operationally, or become insolvent. Proof-of-reserves can show selected assets but does not automatically prove complete liabilities, control quality, or absence of encumbrance.

Good custody begins with a threat model. Consider theft, device failure, fire, coercion, insider abuse, legal seizure, forgotten procedures, death, and malicious software. Then design prevention, detection, response, and recovery.

Backups should be durable and private. Recovery must be rehearsed with safe test material. Inheritance requires authorised people to discover and execute a plan without exposing it prematurely. Organisations need approval thresholds, role separation, transaction limits, address verification, logging, and incident response.

Self-custody preserves Bitcoin’s bearer property and reduces intermediary dependence. Custody services improve convenience, recovery, and institutional integration. The future is likely plural: different users will accept different trust models.

The honest standard is not ideological purity. It is whether the custody design makes authority explicit, avoids hidden single points of failure, and can recover from realistic mistakes without exposing the asset to easier theft.',
  17,1784488000000
),
(
  'btc-lesson-18','stefan-bitcoin-genesis-next-era',
  'Exchanges, ETPs, treasuries, and wrapped exposure','btc-section-04','video',
'# Markets and wrappers

## Your outcome

Distinguish native bitcoin, a custodial claim, an exchange-traded product, a derivative, and a wrapped token.

## Exposure layers

- **Native BTC:** control of a Bitcoin UTXO under Bitcoin consensus
- **Exchange balance:** claim on a platform
- **Spot ETP share:** regulated security backed through a product and custodian structure
- **Futures or option:** contract referencing price
- **Wrapped BTC:** token on another network backed by a custodian or bridge

## Why it matters

Price exposure is not identical to censorship resistance, portability, settlement, or self-custody.

The US SEC approved spot bitcoin ETP listings in January 2024. Read the [SEC statement](https://www.sec.gov/newsroom/speeches-statements/gensler-statement-spot-bitcoin-011023).',
  'markdown',NULL,6,0,0,80,
'Bitcoin now exists inside several different market structures.

Native bitcoin is a UTXO controlled under Bitcoin’s rules. A holder can verify supply and receive directly, subject to custody and network access. An exchange balance is a contractual claim on a company’s pooled system. The customer may gain liquidity and convenience but depends on withdrawals, solvency, controls, and law.

A spot exchange-traded product offers price exposure through a conventional brokerage account. The product owns bitcoin through custodial arrangements while investors own shares. The structure can improve regulated access, reporting, and portfolio integration. It does not give the shareholder a private key or the ability to make a peer-to-peer Bitcoin payment.

Futures and options reference bitcoin price through contracts. They add leverage, expiry, margin, counterparty, and market-structure risks. Wrapped bitcoin represents value on another blockchain; users depend on the issuer, federation, smart contracts, bridge, and destination network.

Corporate treasuries and government holdings introduce another layer. Accounting rules, board mandates, debt, custody, and political authority determine how exposure is managed. A US executive order in March 2025 established a Strategic Bitcoin Reserve initially capitalised with certain forfeited BTC. That is a policy fact, not proof of a universal government trend.

Institutional access can deepen liquidity and legitimacy while concentrating custody and influence. Large custodians become operational targets. ETP creation and redemption can connect traditional capital markets to spot demand, but market price still reflects global trading, leverage, sentiment, and macro conditions.

The distinction between asset and wrapper is central to Bitcoin’s future. If most economic exposure moves into custodial products, price adoption may grow while peer-to-peer use and individual verification weaken. If withdrawals and self-custody remain common, institutions may coexist with bearer ownership.

When comparing products, ask what is legally owned, who controls keys, how redemption works, what fees apply, which market sets price, what happens in insolvency, and whether the holder can use Bitcoin’s native capabilities. “Bitcoin exposure” describes several materially different things.',
  18,1784488000000
),
(
  'btc-lesson-19','stefan-bitcoin-genesis-next-era',
  'Privacy, surveillance, and fungibility','btc-section-04','video',
'# Privacy, surveillance, and fungibility

## Your outcome

Explain why Bitcoin is pseudonymous, not anonymous, and how wallet behaviour changes privacy.

## Public by design

Transactions expose amounts, scripts, timing, and UTXO relationships. Addresses do not display legal names, but exchanges and network metadata may connect activity to identity.

## Privacy practices

- Avoid address reuse
- Use fresh change
- Separate UTXOs by purpose
- Run a node or privacy-preserving backend
- Understand collaborative transactions
- Avoid broadcasting identity with transaction data

## Trade-off

Transparency enables public verification and also durable surveillance.

## Future direction

Silent Payments, BIP 352, specifies reusable payment addresses that generate unique outputs without obvious on-chain linkage. It is a wallet protocol, not an activated consensus change.',
  'markdown',NULL,6,0,0,80,
'Bitcoin’s ledger is public. Addresses are pseudonyms, not anonymity.

Anyone can inspect transaction inputs, outputs, amounts, timing, and script types. Addresses do not directly contain names, but identity can enter through exchanges, merchants, donation pages, reused addresses, IP metadata, or seized records. Once an address is linked, historical activity can become easier to cluster.

Wallet behaviour matters. Spending several inputs together suggests common control. One output often resembles payment and another change. Reusing an address creates direct linkage. These are heuristics, not consensus facts, and collaborative transactions can weaken them, but many users create predictable patterns.

Fungibility means units are treated as interchangeable. At the protocol level, valid UTXOs of equal value can satisfy the same payment. In markets and compliance systems, transaction history may lead custodians to flag or refuse particular coins. That creates practical differences among UTXOs.

Users improve privacy by generating fresh receive addresses, controlling coin selection, separating identities, and avoiding unnecessary data sharing. Running a node prevents a wallet from telling one external server every address it is watching. Network-layer privacy tools can reduce IP linkage.

CoinJoin coordinates several users into one transaction to make input-output mapping less certain. It can improve privacy but creates coordination, cost, liquidity, and policy challenges. Lightning keeps most individual payments off the base chain, though channel and routing metadata have their own privacy limits.

BIP 352 Silent Payments proposes a reusable address from which senders derive unique Taproot outputs. Outside observers cannot trivially link those payments to the published address. Receivers need additional scanning, and wallet support is still developing. The BIP is an application specification, not a promise of universal adoption.

Privacy improvements can conflict with audit, light-client efficiency, regulation, and usability. They also matter for personal safety, commercial confidentiality, and fungibility.

Bitcoin’s future may include stronger wallet privacy while base-layer transparency remains. The result will depend less on one protocol switch than on defaults, node access, exchange policy, user education, and whether privacy-preserving tools become reliable for ordinary people.',
  19,1784488000000
),
(
  'btc-lesson-20','stefan-bitcoin-genesis-next-era',
  'Lab: design a custody decision','btc-section-04','text',
'# Lab: design a custody decision

Choose one persona:

- A learner experimenting with a negligible amount
- A family saving over ten years
- A small business accepting payments
- A nonprofit treasury
- A regulated investment fund

## Threat model

Rank theft, loss, coercion, insider risk, company failure, legal restriction, privacy leakage, and inheritance failure.

## Compare three designs

For each design state:

- Spending authority
- Recovery authority
- Single points of failure
- Required expertise
- Ongoing cost
- Privacy
- Auditability
- Exit path

## Deliverable

Recommend a design and explain why the rejected options fail the persona’s needs.

> Do not create real wallets, reveal existing holdings, or use real seed material.',
  'markdown',NULL,6,0,0,0,'',20,1784488000000
),
(
  'btc-lesson-21','stefan-bitcoin-genesis-next-era',
  'Checkpoint: ownership and market structure','btc-section-04','quiz',
'# Checkpoint: ownership and market structure

Identify the actual asset, claim, custodian, spending authority, and privacy consequence in each scenario.',
  'markdown',NULL,6,0,0,0,'',21,1784488000000
),
(
  'btc-lesson-22','stefan-bitcoin-genesis-next-era',
  'From SegWit to Taproot: how Bitcoin upgrades','btc-section-05','video',
'# From SegWit to Taproot

## Your outcome

Explain soft forks, deployment risk, and the concrete benefits of SegWit and Taproot.

## SegWit

BIP 141 separated witness data, fixed transaction malleability for modern spends, introduced block weight, and enabled more reliable payment channels.

## Taproot

BIPs 340–342 introduced Schnorr signatures, Taproot output rules, and Tapscript. Cooperative complex spends can look like simple key spends; only an executed script path needs revelation.

## Governance reality

A merged BIP or software implementation is not the same as network activation. Users ultimately decide which rules and chain they recognise.

Read [BIP 141](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki) and [BIP 341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).',
  'markdown',NULL,6,0,0,80,
'Bitcoin can change, but consensus changes require compatibility and coordination.

A hard fork relaxes rules so blocks valid under new rules may be rejected by old nodes. Without universal coordination, the chain can split. A soft fork tightens rules so upgraded nodes enforce new conditions while older nodes may still accept upgraded blocks as valid. Soft forks reduce one compatibility problem but still require careful activation and adoption.

Segregated Witness, BIP 141, moved signature witness data into a separate structure and introduced transaction weight. It fixed transaction malleability for SegWit inputs, improved capacity accounting, and created a versioned witness programme for future upgrades. Reliable transaction identifiers helped Lightning construction.

SegWit’s activation became a governance conflict involving miners, businesses, developers, and users. The episode showed that no single group has uncomplicated control. Coordination methods themselves can become politically contested.

Taproot combined BIP 340 Schnorr signatures, BIP 341 output and spending rules, and BIP 342 Tapscript. A Taproot output can be spent through a key path or by revealing one committed script path. Cooperative complex arrangements can use aggregated keys and resemble simple payments, improving efficiency and some forms of privacy.

Taproot does not make every transaction private. Script-path spends reveal the executed condition and tree information. Wallet adoption matters. Privacy gains improve when many users share common output types and avoid identifying behaviour.

Upgrade status has several stages: idea, discussion, specification, implementation, review, test deployment, activation design, mainnet activation, and wallet adoption. Confusing them fuels bad forecasts.

Bitcoin’s conservative culture treats ossification as both strength and risk. Stable rules protect monetary credibility and reduce attack surface. Excessive rigidity can prevent improvements needed for custody, scaling, privacy, or quantum migration.

The future of Bitcoin will likely continue through narrow changes with long review. The important skill is to ask exactly what rule changes, who must upgrade, what old nodes see, which failure modes appear, and whether the benefit justifies consensus risk.',
  22,1784488000000
),
(
  'btc-lesson-23','stefan-bitcoin-genesis-next-era',
  'Lightning: bitcoin payments beyond the base layer','btc-section-05','video',
'# Lightning Network

## Your outcome

Explain channels, commitment states, routing, liquidity, and on-chain enforcement.

## Core flow

1. Two parties lock BTC in a funding output.
2. They exchange updated commitment transactions off-chain.
3. Conditional payments route across connected channels.
4. Either party can settle on-chain under protocol rules.

## Benefits

Fast, low-cost, high-frequency bitcoin payments without recording each transfer on-chain.

## Constraints

Inbound and outbound liquidity, online monitoring, routing failure, channel management, backup, service concentration, and base-layer fees.

Read the [BOLT introduction](https://github.com/lightning/bolts/blob/master/00-introduction.md).',
  'markdown',NULL,6,0,0,80,
'The Lightning Network moves repeated bitcoin payments into channels while using the base chain for funding and enforcement.

Two participants create a funding transaction whose output requires cooperative control. They then exchange signed commitment states reflecting how channel value is allocated. A new state replaces the economic relevance of the old one. Protocol penalties or newer channel constructions discourage broadcasting revoked states.

Conditional payments allow routing. Alice can pay Carol through Bob without trusting Bob by linking conditions and timeouts. Onion routing limits what each forwarding node learns. The receiver reveals the payment secret, allowing the linked updates to settle.

Lightning payments can complete in seconds with small routing fees and no base-layer transaction per payment. That supports retail payments and machine-scale activity while conserving block space.

Channels require liquidity. A node can send only where outbound capacity exists and receive only where inbound capacity reaches it. Routes may fail because capacity is private, fees changed, or a node is offline. Wallets hide much of this complexity, sometimes by introducing custodial or service-provider trust.

Users must monitor for channel disputes or rely on watchtower-style services. Backups differ from ordinary on-chain wallet backups because channel state changes. Forced closure uses base-layer block space and may be expensive during congestion.

The Lightning specification evolves through BOLTs. Current work includes better channel construction, Taproot channels, splicing, onion messaging, and BOLT 12-style offers. Implementation support varies; a feature in one client is not universal network deployment.

Lightning changes the security and privacy model. Payments are not globally broadcast, which can improve privacy, but routing nodes see partial information and network topology creates analysis opportunities. Large service nodes can concentrate liquidity and reliability.

Lightning is neither “not Bitcoin” nor identical to an on-chain payment. It is a protocol backed by bitcoin UTXOs and on-chain enforcement. Its future depends on usability, liquidity markets, interoperability, mobile reliability, and affordable base-layer settlement. If those improve, Bitcoin can support frequent payments without increasing base-layer throughput linearly.',
  23,1784488000000
),
(
  'btc-lesson-24','stefan-bitcoin-genesis-next-era',
  'The proposal frontier: covenants, privacy, and quantum readiness','btc-section-05','video',
'# The proposal frontier

## Your outcome

Describe major proposal families without pretending that discussion equals adoption.

## Current areas

- Covenants and vaults: constrain how an output may be spent later
- `OP_CAT` and restored script capability
- `SIGHASH_ANYPREVOUT` for advanced channel designs
- Silent Payments for reusable private receive identifiers
- MuSig2 and Miniscript for safer policy coordination
- Post-quantum migration proposals

## Status discipline

Record each proposal as draft, complete, deployed, implemented, or activated. Those words are not interchangeable.

## Balanced question

What user problem is solved, what new attack surface appears, and can the change be deployed without forcing ecosystem agreement prematurely?

Browse the canonical [BIP repository](https://github.com/bitcoin/bips).',
  'markdown',NULL,6,0,0,80,
'Bitcoin’s future is a portfolio of competing proposals, not one official roadmap.

Covenants constrain where or how a UTXO can be spent in the future. BIP 119 CHECKTEMPLATEVERIFY proposes committing to parts of a future transaction template. Supporters see efficient vaults, congestion control, and contract patterns. Critics examine expressiveness, misuse, activation risk, and whether the design is the right primitive.

OP_CAT would restore controlled concatenation capability to Script, enabling additional constructions. Its apparent simplicity can create broad consequences, so analysis must include computational limits and interactions.

BIP 118 SIGHASH_ANYPREVOUT changes signature commitment for specialised protocols, particularly advanced Lightning channel designs. It can reduce the need to publish new commitment transactions when channel state changes, but altered signature semantics require careful wallet isolation.

Silent Payments, BIP 352, provides static payment addresses that generate unique Taproot outputs without obvious linkage. It needs sender and receiver wallet support and imposes scanning considerations. It does not require a consensus soft fork.

MuSig2 allows multiple signers to create an aggregated Schnorr key and signature. Bitcoin Core 31 added signing support for MuSig2 descriptors. Miniscript and descriptors help software reason about spending policies, backups, and satisfactions.

Quantum computing creates a long-horizon migration problem. Bitcoin’s current elliptic-curve signatures would be vulnerable to a sufficiently capable fault-tolerant quantum computer. Such machines do not exist at the necessary scale today, and timelines are uncertain. BIP proposals explore quantum-resistant output paths and transition strategies. Migration would involve cryptography, wallet support, dormant coins, deadlines, and contentious redistribution questions.

None of these ideas is “the next Bitcoin upgrade” merely because it has a BIP number. The BIP process documents proposals; acceptance rests with users and implementations. Status can change, proposals compete, and some never activate.

Evaluate each proposal using a matrix: problem severity, benefit, consensus change, implementation maturity, review depth, composability, worst-case failure, activation plan, and exit. Bitcoin’s deliberate pace frustrates builders but protects an asset whose core promise depends on rule stability.',
  24,1784488000000
),
(
  'btc-lesson-25','stefan-bitcoin-genesis-next-era',
  'Lab: read a BIP without mistaking it for a roadmap','btc-section-05','text',
'# Lab: read a BIP

Choose BIP 119, 118, 352, or 360.

## Extract

1. Status and type
2. Problem statement
3. Proposed mechanism
4. Consensus change required
5. Backward compatibility
6. Security considerations
7. Reference implementation or test vectors
8. Open questions

## Adoption ladder

Mark where it sits:

**Idea → discussed → specified → implemented → reviewed → deployed in software → activated → adopted by wallets**

## Deliverable

Write a 300-word briefing with three headings:

- What it could enable
- What could go wrong
- What evidence would justify broader adoption

> Never describe “Complete” in the BIP repository as “activated on Bitcoin” unless deployment evidence supports it.',
  'markdown',NULL,6,0,0,0,'',25,1784488000000
),
(
  'btc-lesson-26','stefan-bitcoin-genesis-next-era',
  'Checkpoint: upgrades and scaling','btc-section-05','quiz',
'# Checkpoint: upgrades and scaling

Separate base-layer consensus, node policy, wallet protocols, and second-layer specifications. State the actual deployment status.',
  'markdown',NULL,6,0,0,0,'',26,1784488000000
),
(
  'btc-lesson-27','stefan-bitcoin-genesis-next-era',
  'Energy and emissions: measure before arguing','btc-section-06','video',
'# Energy and emissions

## Your outcome

Distinguish electricity consumption, power demand, energy source, emissions, and social value.

## What proof of work requires

Mining consumes electricity by design. More efficient hardware can increase hash rate rather than automatically reduce total network consumption because mining responds to revenue.

## Measurement limits

Bitcoin’s decentralised mining fleet is not fully observable. Cambridge estimates a range using hardware and economic assumptions. Emissions require additional estimates about location and electricity mix.

## Reject weak comparisons

“Energy per transaction” incorrectly assigns all network energy only to transactions in one block and ignores settlement layers and security over time.

Use the [Cambridge CBECI methodology](https://ccaf.io/cbnsi/cbeci/methodology).',
  'markdown',NULL,6,0,0,80,
'Bitcoin mining consumes substantial electricity because proof of work makes block production costly. That fact should not be minimised, and it should not end the analysis.

Power is a rate measured in watts. Energy is power used over time, commonly measured in watt-hours. Carbon emissions depend on the generation mix, location, time, and additional factors. Renewable share does not automatically mean zero impact; fossil electricity does not have one universal intensity.

The global mining fleet is not fully observable. Cambridge’s Bitcoin Electricity Consumption Index estimates lower, upper, and best-guess demand using hardware efficiency, profitability, and other assumptions. Its emissions model adds geographic and electricity-mix estimates. Good reporting presents ranges and methodology rather than a falsely exact number.

Mining economics can seek cheap energy. That may include stranded hydro, curtailed renewables, flare gas, or low-cost fossil generation. Claims that mining always uses waste energy are too strong. Claims that every mining load prevents renewable development are also too strong. Local grid conditions, contracts, opportunity cost, and emissions matter.

Efficiency gains do not guarantee lower total consumption. More efficient ASICs lower cost per hash, but competition can convert savings into more hash rate until margins compress.

Energy per transaction is usually a misleading allocation. Mining secures the entire UTXO history and provides settlement, while individual payments may occur on Lightning or within custodial systems. Total network energy remains relevant; dividing it only by base-layer transaction count answers a poorly defined question.

The normative debate is what social value justifies the cost. Supporters point to censorship-resistant settlement, savings, grid flexibility, and monetisation of otherwise unusable energy. Critics point to emissions, grid stress, noise, electronic waste, and alternative uses. Evidence varies by facility and jurisdiction.

Bitcoin’s future will face stricter demands for transparent energy sourcing, grid coordination, emissions accounting, and community benefit. Mining may become more integrated with energy markets, or regulation may restrict it. A credible analysis measures actual systems and avoids treating either energy use or claimed value as self-evident.',
  27,1784488000000
),
(
  'btc-lesson-28','stefan-bitcoin-genesis-next-era',
  'Centralisation, attacks, bugs, and governance failure','btc-section-06','video',
'# Centralisation and attack surfaces

## Your outcome

Map realistic failures without claiming that Bitcoin has either perfect security or one fatal switch.

## Attack surfaces

- Majority hash attacks and censorship
- Mining pool and hardware concentration
- Software vulnerabilities and supply chain
- Network partition and eclipse attacks
- Custodian failure
- Developer and funding concentration
- Governance deadlock or rushed activation
- Weak wallet defaults

## Scope an attack

A majority hash attacker can reorganise recent history and censor. It cannot create arbitrary valid signatures or exceed the subsidy rules accepted by nodes.

## Resilience question

How quickly can users detect, coordinate, switch providers, patch software, or exit custody?',
  'markdown',NULL,6,0,0,80,
'Bitcoin security is layered. A failure in one layer does not automatically break every property, but failures can compound.

A majority-hash attacker can attempt double-spends by building an alternative branch, censor transactions, or destabilise confidence. It cannot spend arbitrary UTXOs without valid signatures or make full nodes accept an excessive subsidy. The cost, duration, detectability, and economic response determine impact.

Pool concentration creates censorship and template risk even when underlying machines have many owners. Hashers can switch pools, but switching speed, payout dependence, firmware, and network access matter.

Full-node software can contain bugs. Bitcoin Core uses review, reproducible builds, testing, staged disclosure, and multiple contributors, but no software process proves absence of defects. A consensus bug could split nodes or disrupt availability. Alternative implementations improve diversity in one sense and can increase consensus divergence risk in another.

Network attacks can isolate nodes, delay blocks, infer transaction origin, or partition regions. Bitcoin Core’s v2 transport encrypts peer traffic against passive observation and opportunistic tampering, but endpoint, routing, and denial-of-service risks remain.

Custodians are major systemic points. A protocol can continue while millions of users lose access through insolvency, fraud, or seizure. Wallet and exchange concentration can also influence upgrade adoption and privacy defaults.

Developer influence is real but bounded. Maintainers decide what enters a software repository; operators decide what to run. Funding sources can shape research priorities. Slow governance protects against capture and can create deadlock when urgent changes are needed.

Quantum risk is an example of coordination pressure. Waiting too long could expose keys; moving too early to immature cryptography could introduce new failures. Dormant and lost coins create controversial choices.

Resilience depends on substitutability and verification: can miners switch pools, users withdraw, nodes reject invalid blocks, developers patch, and markets distinguish competing rule sets? The future is strongest when critical functions have alternatives and users understand which trust they delegated.',
  28,1784488000000
),
(
  'btc-lesson-29','stefan-bitcoin-genesis-next-era',
  'Regulation, crime, consumer harm, and political adoption','btc-section-06','video',
'# Regulation and political adoption

## Your outcome

Separate protocol operation from the regulated activities built around it.

## Common regulatory surfaces

- Exchange and custody
- Anti-money-laundering controls
- Tax reporting
- Securities and derivatives products
- Mining and energy
- Payments and consumer protection
- Sanctions and asset seizure

## Balanced reality

Bitcoin can support lawful savings and payments, capital flight, ransomware settlement, fraud proceeds, donations, and political finance. The protocol does not determine the legitimacy of a use.

## Safety

No guaranteed return exists. Irreversible settlement and impersonation make fraud recovery difficult.

> This course is educational and not investment, legal, or tax advice. Verify local rules with qualified professionals.',
  'markdown',NULL,6,0,0,80,
'Bitcoin is a global protocol operating through local legal systems.

Running software and holding keys may be treated differently from operating an exchange, safeguarding client assets, transmitting money, issuing a product, advising investors, or mining at industrial scale. Rules vary by jurisdiction and change.

Regulated gateways collect identity, monitor transactions, report taxes, and respond to legal orders. This can reduce fraud and support institutional access while weakening privacy and permissionless use. A government may restrict services without stopping every peer-to-peer transaction, but enforcement can make access costly.

Bitcoin’s public ledger supports forensic tracing, yet users can employ privacy tools, cross borders, or transact outside regulated platforms. Criminal use exists alongside ordinary saving, remittance, commerce, and political donation. Comparisons require consistent definitions and reliable data, not slogans.

Consumer harm often occurs outside consensus: fake investment platforms, phishing, recovery scams, exchange failure, leverage, and misleading promotions. Irreversible transfers limit recourse. Strong education should focus on authority, custody, and verification rather than promising that blockchain transparency prevents fraud.

Institutional and political adoption has changed the landscape. US spot bitcoin ETPs brought brokerage access. A US Strategic Bitcoin Reserve policy created a government holding framework. Other countries may regulate, adopt, restrict, or ignore Bitcoin for different monetary and political reasons.

These policies are reversible. An executive order is not permanent constitutional settlement. A favourable licensing regime can tighten after fraud or financial stress. Tax treatment can alter incentives without changing the protocol.

Bitcoin’s neutrality claim means valid transactions follow rules regardless of purpose. Society still judges people and institutions. Courts can seize devices or order custodians. Miners and pools can face censorship pressure. Developers can debate filters, but nodes verify protocol validity rather than legality.

The likely future is uneven integration: regulated products and custodians grow while permissionless self-custody remains technically possible but operationally demanding. Learners should distinguish what the protocol permits, what services allow, what law requires, and what ethical judgement supports.',
  29,1784488000000
),
(
  'btc-lesson-30','stefan-bitcoin-genesis-next-era',
  'Debate lab: make the strongest case on both sides','btc-section-06','text',
'# Debate lab: make the strongest case on both sides

Choose one question:

- Does Bitcoin justify its energy use?
- Can Bitcoin remain secure on fees?
- Does institutional custody strengthen or weaken Bitcoin?
- Is Bitcoin more useful as money or as digital collateral?
- Is protocol ossification a feature or a failure?

## Steelman both positions

For each side provide:

1. Strongest mechanism
2. Best primary evidence
3. Most serious uncertainty
4. Evidence that would change the conclusion

## Rules

- No price prediction
- No personal attacks
- No “everyone knows”
- Separate facts, models, and values
- State data limitations

## Deliverable

Record a four-minute argument: 90 seconds for each side, 30 seconds of shared ground, and 30 seconds with your provisional conclusion and confidence level.',
  'markdown',NULL,6,0,0,0,'',30,1784488000000
),
(
  'btc-lesson-31','stefan-bitcoin-genesis-next-era',
  'Checkpoint: criticisms and resilience','btc-section-06','quiz',
'# Checkpoint: criticisms and resilience

The best answer identifies the mechanism, scope, evidence limit, and possible response. Avoid absolute claims.',
  'markdown',NULL,6,0,0,0,'',31,1784488000000
),
(
  'btc-lesson-32','stefan-bitcoin-genesis-next-era',
  'The engineering direction visible in 2026','btc-section-07','video',
'# The engineering direction visible in 2026

## Your outcome

Identify deployed trends without converting them into promises.

## Visible directions

- Better mempool and package reasoning
- More private peer broadcast and encrypted transport
- Descriptor, Miniscript, PSBT, and MuSig2 coordination
- Taproot Lightning channels and improved messaging
- Silent Payment implementation work
- Safer fee management for second layers
- Active research into covenants and quantum migration

## Current reference point

Bitcoin Core 31 includes cluster mempool and MuSig2 signing support. LND 0.21 includes production-ready simple Taproot channels and onion-messaging groundwork. Other implementations and wallets differ.

## Forecast rule

Project only from deployed evidence, adoption constraints, and explicit assumptions.',
  'markdown',NULL,6,0,0,80,
'Bitcoin’s near-term direction is visible in engineering work, but it is not guaranteed.

Bitcoin Core 31 replaced mempool internals with a cluster design. This improves package-aware selection, replacement, and eviction. It supports more reliable fee management for wallets and contract protocols without changing consensus.

Peer-to-peer transport has improved through BIP 324 v2 encryption. Bitcoin Core has also added privacy-oriented broadcast options, though release history shows that privacy features can contain bugs and require cautious updates.

Wallet architecture is becoming more explicit. Descriptors define policies, Miniscript supports analysis of spending conditions, PSBT coordinates partially signed transactions, and MuSig2 enables efficient aggregated Schnorr signing. Core 31 added MuSig2 signing support for descriptors.

Lightning implementations continue toward Taproot channels, splicing, onion messaging, reusable offers, and better liquidity management. LND 0.21 made simple Taproot channels production-ready in that implementation and added onion-messaging groundwork. Interoperability depends on BOLT specifications and adoption across clients.

Silent Payments has a complete BIP specification and implementation work, but scanning, light clients, wallet support, and user experience remain adoption constraints.

Consensus proposals remain contested. Covenant families, OP_CAT, ANYPREVOUT, and other script changes promise vaults, better channels, and new contracts. Their breadth also creates review and activation risk. No proposal should be presented as scheduled.

Quantum readiness is moving from abstract concern toward concrete design discussion because migration could take years. There is no evidence that current machines can break Bitcoin signatures at required scale. Responsible work nevertheless evaluates post-quantum output types, transition periods, and treatment of exposed or dormant keys.

The pattern is layered and conservative: improve node policy, transport, wallets, and Lightning where possible; reserve consensus changes for benefits that justify coordination risk. Adoption often arrives through software defaults, not dramatic protocol moments.

Near-term progress is therefore likely to feel incremental: safer custody, more reliable fees, better private receiving, improved Lightning usability, and stronger operational tooling. Whether those increments produce mass payments, institutional settlement, or mainly robust savings infrastructure remains a market and social question.',
  32,1784488000000
),
(
  'btc-lesson-33','stefan-bitcoin-genesis-next-era',
  'Four credible Bitcoin futures—not a price target','btc-section-07','video',
'# Four credible futures

## Your outcome

Build scenarios from drivers rather than presenting one preferred future as destiny.

## Scenario A: digital reserve collateral

Institutional custody, ETPs, and treasury holdings dominate; base-layer settlement is valuable but user self-custody declines.

## Scenario B: open payment network

Lightning and wallet improvements deliver reliable global payments while on-chain activity provides settlement.

## Scenario C: regulated financial rail

Bitcoin remains technically open, but most users interact through identified custodians and policy-controlled gateways.

## Scenario D: fragmented niche asset

Security, regulation, usability, competition, or governance limits broader adoption.

## Method

For every scenario name leading indicators, blockers, winners, harmed users, and evidence that would raise or lower probability.',
  'markdown',NULL,6,0,0,80,
'Forecasting Bitcoin should begin with scenarios, not a single price.

In the reserve-collateral scenario, bitcoin functions mainly as a scarce asset held by individuals, companies, funds, and some governments. Base-layer transactions settle large transfers. Custodians and ETPs dominate access. Market depth grows, but concentrated custody weakens peer-to-peer practice and creates policy chokepoints.

In the open-payment scenario, Lightning and related wallet systems become reliable enough for ordinary domestic and cross-border payments. Liquidity is hidden behind good interfaces. Users can move between custodial convenience and self-custody. Base-layer fees are supported by channel operations and settlement. Privacy and compliance find workable boundaries.

In the regulated-rail scenario, the protocol remains open but most economic use occurs through licensed institutions. Identity-linked wallets, surveillance, tax reporting, and transaction controls become normal at gateways. Bitcoin gains integration and loses some practical permissionlessness for mainstream users.

In the fragmented-niche scenario, volatility, custody failures, environmental restrictions, technical stagnation, weak fee revenue, or better alternatives limit adoption. Bitcoin survives as a specialised asset and political network without becoming global money.

These scenarios can coexist. One country may use custodial products while another relies on peer-to-peer payments. One user may hold ETP shares in a retirement account and self-custody a small balance.

Track leading indicators instead of social-media confidence: distribution of custody, withdrawal behaviour, full-node accessibility, Lightning payment success, fee composition, miner concentration, protocol adoption, regulatory access, energy transparency, developer diversity, and real merchant use.

Price is an outcome influenced by demand, supply, leverage, liquidity, macro policy, and narratives. It can rise while decentralised use weakens, or fall while engineering improves. A price target hides assumptions and invites false precision.

The strongest forecast states conditions. “If reliable non-custodial Lightning wallets reduce failure and recovery risk, payment use becomes more plausible.” “If fees remain weak and subsidy falls without price offset, mining-security pressure rises.” Conditional forecasts can be tested.

Bitcoin is neither guaranteed global money nor merely a historical curiosity. It is a live system whose next era will emerge from technical capability, economic incentives, institutional structure, law, energy, and human preference.',
  33,1784488000000
),
(
  'btc-lesson-34','stefan-bitcoin-genesis-next-era',
  'Capstone: Bitcoin 2036 board briefing','btc-section-07','resource',
'# Capstone: Bitcoin 2036 board briefing

Prepare a decision briefing for a board, public institution, nonprofit, or family office. This is analysis—not an investment recommendation.

## Part 1: origin in one page

Explain the problem Bitcoin addressed, its inherited building blocks, and the significance of the 2008–2009 launch using primary sources.

## Part 2: system map

Diagram UTXOs, wallets, nodes, miners, pools, exchanges, custodians, ETPs, Lightning, and regulators. Mark every delegated trust point.

## Part 3: monetary and security model

Explain issuance, halvings, fees, miner revenue, difficulty, confirmations, and the open security-budget question.

## Part 4: strongest bull and bear cases

Steelman both. Separate protocol facts, economic models, empirical evidence, and values.

## Part 5: three 2036 scenarios

For each include:

- Preconditions
- Leading indicators
- Failure modes
- User impact
- Governance and custody implications
- Evidence that would change probability

## Part 6: recommendation

Recommend **study, pilot, adopt, limit, or avoid** for your chosen organisation. Include custody, compliance, energy, privacy, and exit conditions.

## Rubric

- Source quality and historical accuracy: **15%**
- Technical model: **20%**
- Economics and uncertainty: **20%**
- Risk, custody, and governance: **20%**
- Scenario reasoning: **15%**
- Clarity and decision usefulness: **10%**

> Distinction standard: The conclusion remains useful even if the bitcoin price moves sharply in either direction.',
  'markdown',NULL,6,0,0,0,'',34,1784488000000
),
(
  'btc-lesson-35','stefan-bitcoin-genesis-next-era',
  'Final assessment: explain Bitcoin without ideology','btc-section-07','quiz',
'# Final assessment

Apply the full model: history, UTXOs, consensus, incentives, custody, markets, scaling, criticism, and scenarios.

## Pass standard

Score at least 80%. Review the linked lesson before another attempt.

## Completion reflection

Write one belief that became stronger, one that became weaker, and one important uncertainty you can now explain precisely.',
  'markdown',NULL,6,0,0,0,'',35,1784488000000
)
)
WHERE EXISTS (SELECT 1 FROM `courses` WHERE id='stefan-bitcoin-genesis-next-era');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
  (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
SELECT column1,column2,column3,column4,column5
FROM (VALUES
  ('btc-quiz-01','btc-lesson-05','Origins and evidence',80,3),
  ('btc-quiz-02','btc-lesson-11','The Bitcoin machine',80,3),
  ('btc-quiz-03','btc-lesson-16','Money, mining, and incentives',80,3),
  ('btc-quiz-04','btc-lesson-21','Ownership and market structure',80,3),
  ('btc-quiz-05','btc-lesson-26','Upgrades and scaling',80,3),
  ('btc-quiz-06','btc-lesson-31','Criticisms and resilience',80,3),
  ('btc-final-exam','btc-lesson-35','Final: explain Bitcoin without ideology',80,3)
)
WHERE EXISTS (SELECT 1 FROM `courses` WHERE id='stefan-bitcoin-genesis-next-era');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
  (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`position`)
SELECT column1,column2,column3,column4,column5,column6
FROM (VALUES
  ('btc-q01-01','btc-quiz-01','What core problem makes bearer digital money difficult?','["Files cannot be encrypted","A digital unit can be copied and spent more than once without an ordering authority","Banks cannot use databases","Digital signatures reveal every private key"]',1,1),
  ('btc-q01-02','btc-quiz-01','What was Bitcoin’s principal innovation relative to its building blocks?','["Inventing every cryptographic primitive","Combining signatures, peer networking, proof of work, block history, and native incentives into a working system","Creating the first internet message","Replacing all law with code"]',1,2),
  ('btc-q01-03','btc-quiz-01','What does the Genesis Block newspaper text directly establish?','["Satoshi’s complete political ideology","The block could not predate the referenced headline and was launched in that context","Every bank bailout is invalid","Bitcoin’s future price"]',1,3),
  ('btc-q01-04','btc-quiz-01','Which claim about Satoshi’s identity is academically responsible?','["One named candidate has been conclusively proven","Writing-style clues prove legal identity","The pseudonymous identity remains unproven","Satoshi was definitely one person"]',2,4),
  ('btc-q01-05','btc-quiz-01','Why study Hashcash in Bitcoin history?','["It was an earlier proof-of-work system that Bitcoin adapted for a different coordination role","It was the first Bitcoin exchange","It introduced Taproot","It fixed Bitcoin’s supply"]',0,5),

  ('btc-q02-01','btc-quiz-02','What does a displayed bitcoin wallet balance represent?','["One editable account field on-chain","The sum of spendable UTXOs the wallet recognises","The value guaranteed by an exchange","A list of private keys published in blocks"]',1,1),
  ('btc-q02-02','btc-quiz-02','A transaction has 110,000 sats of inputs and 109,000 sats of outputs. What is its fee?','["1,000 sats","109,000 sats","110,000 sats","The fee cannot exist without a fee field"]',0,2),
  ('btc-q02-03','btc-quiz-02','What does proof of work do?','["Proves every transaction is legal","Makes candidate history costly to produce and cheap to verify","Allows miners to ignore node rules","Encrypts all transaction amounts"]',1,3),
  ('btc-q02-04','btc-quiz-02','Who rejects a block that claims an excessive subsidy?','["Only the newspaper","Full nodes applying consensus rules","The recipient wallet alone","Any miner regardless of its software"]',1,4),
  ('btc-q02-05','btc-quiz-02','What does a confirmation prove?','["The recipient’s legal identity","Inclusion in accepted block history with cumulative work building above it","Permanent immunity from every reorganisation","That an exchange will permit withdrawal"]',1,5),

  ('btc-q03-01','btc-quiz-03','What halves every 210,000 blocks?','["All wallet balances","The allowed block subsidy","Transaction output amounts","The number of nodes"]',1,1),
  ('btc-q03-02','btc-quiz-03','Why does fixed issuance not guarantee purchasing power?','["The schedule is secret","Demand, liquidity, leverage, policy, and market conditions remain variable","Bitcoin has no units","Miners set any supply they want"]',1,2),
  ('btc-q03-03','btc-quiz-03','Why do small miners join pools?','["To change consensus rules","To reduce payout variance by sharing contributed work and rewards","To eliminate electricity costs","To create coins above the subsidy"]',1,3),
  ('btc-q03-04','btc-quiz-03','Which statement best describes pool concentration?','["A pool always owns every connected machine","Pool coordination can affect templates even when hashers have separate owners","Hashers can never switch","Pool share proves geographic ownership"]',1,4),
  ('btc-q03-05','btc-quiz-03','What is the long-term security-budget question?','["Whether fees and remaining economics support adequate mining as subsidy declines","Whether 21 million can be printed every year","Whether signatures will become optional","Whether blocks stop at the next halving"]',0,5),

  ('btc-q04-01','btc-quiz-04','Which setup gives one company unilateral withdrawal control?','["A personally controlled two-of-three multisig","An exchange account balance","A verified hardware multisig with independent keys","A full node"]',1,1),
  ('btc-q04-02','btc-quiz-04','What does an investor in a spot bitcoin ETP own directly?','["A private key to the fund’s UTXOs","Shares in a product with its own custody and legal structure","A Lightning channel","Mining hardware"]',1,2),
  ('btc-q04-03','btc-quiz-04','Why is wrapped bitcoin not identical to native BTC?','["It has no price","It adds issuer, bridge, contract, and destination-network dependencies","It cannot be transferred","It increases Bitcoin’s subsidy"]',1,3),
  ('btc-q04-04','btc-quiz-04','Why is Bitcoin pseudonymous rather than anonymous?','["Addresses display passports","The public transaction graph can be linked to identities through behaviour and external data","Every amount is encrypted","Nodes delete history"]',1,4),
  ('btc-q04-05','btc-quiz-04','What does BIP 352 Silent Payments aim to improve?','["Static receiving without obvious on-chain linkage to repeated payments","Block subsidy size","ASIC efficiency","ETP redemption"]',0,5),

  ('btc-q05-01','btc-quiz-05','What did SegWit help fix for modern inputs?','["Transaction malleability while introducing witness structure and block weight","Bitcoin’s legal classification","Every privacy leak","Mining hardware concentration"]',0,1),
  ('btc-q05-02','btc-quiz-05','What is a Taproot key-path advantage?','["It reveals every possible script","A cooperative complex policy can appear like a simple key spend","It eliminates signatures","It creates unlimited block space"]',1,2),
  ('btc-q05-03','btc-quiz-05','What ultimately enforces a Lightning dispute?','["A social-media vote","Bitcoin on-chain spending conditions","An ETP issuer","The exchange order book"]',1,3),
  ('btc-q05-04','btc-quiz-05','Which Lightning limitation is real?','["No bitcoin is involved","Liquidity and channel management affect payment reliability","Every payment needs a new on-chain transaction","Routing nodes learn every private key"]',1,4),
  ('btc-q05-05','btc-quiz-05','What does a BIP number prove?','["The change is scheduled for activation","The proposal is documented in the BIP process; adoption status needs separate evidence","Every wallet supports it","Miners approved it"]',1,5),

  ('btc-q06-01','btc-quiz-06','Why does more efficient mining hardware not guarantee lower total electricity use?','["Difficulty never changes","Competition can convert efficiency gains into more hash rate","Hardware uses no power","Fees are fixed in watts"]',1,1),
  ('btc-q06-02','btc-quiz-06','Why is energy per base-layer transaction a weak metric?','["Energy cannot be measured","Mining secures ledger history and settlement while activity also occurs on other layers","Bitcoin has no transactions","Every miner uses identical energy"]',1,2),
  ('btc-q06-03','btc-quiz-06','What can a majority-hash attacker plausibly do?','["Forge any user signature","Reorganise recent history or censor while the attack persists","Make full nodes accept unlimited subsidy","Read seed phrases from the chain"]',1,3),
  ('btc-q06-04','btc-quiz-06','Where does much Bitcoin consumer harm occur?','["Only inside SHA-256","At phishing, custody, leverage, fraud, and misleading-promotion layers","Only when a block is valid","Because every transaction is anonymous"]',1,4),
  ('btc-q06-05','btc-quiz-06','Which regulatory statement is most accurate?','["One global law controls Bitcoin","Jurisdictions regulate gateways and activities differently while the protocol remains global","Protocol validity proves legal compliance","An ETP removes every custody risk"]',1,5),

  ('btc-final-01','btc-final-exam','Which sentence most accurately describes Bitcoin?','["A guaranteed-return investment","A distributed protocol for issuing and transferring a scarce bearer asset under verifiable rules","A private company database","A fully anonymous bank"]',1,1),
  ('btc-final-02','btc-final-exam','A wallet spends three UTXOs together. What can an observer conclude?','["One legal person certainly owns all inputs","Common control is a useful but fallible heuristic","The outputs are invalid","The fee equals the largest input"]',1,2),
  ('btc-final-03','btc-final-exam','Why are full nodes important?','["They independently verify consensus rules rather than trusting block producers","They guarantee price","They manufacture ASICs","They reverse exchange fraud"]',0,3),
  ('btc-final-04','btc-final-exam','What would change Bitcoin’s recognised supply rule in practice?','["Editing one local source file","Broad adoption of incompatible consensus rules by the relevant economic network","One miner claiming extra subsidy","A new newspaper headline"]',1,4),
  ('btc-final-05','btc-final-exam','Which forecast is responsible?','["The next halving guarantees a price multiple","If Lightning reliability and recovery improve, payment adoption becomes more plausible","Bitcoin must replace all currencies","A BIP number guarantees activation"]',1,5),
  ('btc-final-06','btc-final-exam','Which custody recommendation is strongest?','["Everyone should use the same wallet","Match authority, recovery, and operational controls to a documented threat model","Never test recovery","Share the seed with support"]',1,6),
  ('btc-final-07','btc-final-exam','What is the main trade-off of institutional wrappers?','["They provide access while adding custodial, product, and legal dependencies","They eliminate bitcoin price exposure","They give every shareholder a private key","They increase block size"]',0,7),
  ('btc-final-08','btc-final-exam','Why is Lightning relevant to the security-budget debate?','["It removes base-layer settlement forever","It may scale economic activity while still creating demand for channel and settlement transactions","It changes the 21 million limit","It makes mining free"]',1,8),
  ('btc-final-09','btc-final-exam','Which statement about proposal status is correct?','["Draft, complete, implemented, deployed, activated, and adopted are distinct stages","All complete BIPs are consensus rules","Core release notes control every wallet","A mailing-list post changes Bitcoin"]',0,9),
  ('btc-final-10','btc-final-exam','What is the strongest energy analysis?','["Energy use is irrelevant","Use transparent estimates, generation context, local impact, and an explicit value judgement","Every miner uses stranded renewable power","Divide one estimate by transaction count and stop"]',1,10),
  ('btc-final-11','btc-final-exam','What could make a quantum transition difficult?','["Only hash rate","Cryptography selection, wallet migration, exposed keys, dormant coins, and consensus coordination","Bitcoin has no signatures","The change requires no users"]',1,11),
  ('btc-final-12','btc-final-exam','What is the best answer to “Where is Bitcoin going?”','["One inevitable destination","Several conditional futures shaped by engineering, incentives, custody, law, energy, and user behaviour","A precise price on a precise date","Wherever one developer decides"]',1,12)
)
WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE id='btc-final-exam');
