INSERT OR IGNORE INTO `courses`
  (`id`,`school_id`,`owner_id`,`title`,`description`,`status`,`price_cents`,
   `enforce_lesson_order`,`certificate_title`,`certificate_accent`,
   `certificate_valid_days`,`created_at`,`updated_at`)
SELECT
  'stefan-web3-foundations',
  s.id,
  s.owner_id,
  'Web3 Foundations: From Blocks to Builders',
  'A balanced, practical introduction to blockchains, wallets, smart contracts, tokens, decentralised applications, digital identity, governance, security, and responsible Web3 product design.',
  'draft',
  0,
  1,
  'Certificate: Web3 Foundations',
  '#6957d8',
  0,
  1784484000000,
  1784484000000
FROM `schools` s
WHERE s.slug='stefan-roodt-s-academy'
LIMIT 1;
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections` (`id`,`course_id`,`title`,`position`,`created_at`)
SELECT column1,column2,column3,column4,column5
FROM (VALUES
  ('web3-section-01','stefan-web3-foundations','1. The Web3 mental model',1,1784484000000),
  ('web3-section-02','stefan-web3-foundations','2. Wallets, keys, and transactions',2,1784484000000),
  ('web3-section-03','stefan-web3-foundations','3. Smart contracts, tokens, and dapps',3,1784484000000),
  ('web3-section-04','stefan-web3-foundations','4. Scaling, coordination, and identity',4,1784484000000),
  ('web3-section-05','stefan-web3-foundations','5. Security, DeFi, and real-world risk',5,1784484000000),
  ('web3-section-06','stefan-web3-foundations','6. From idea to responsible product',6,1784484000000)
)
WHERE EXISTS (SELECT 1 FROM `courses` WHERE id='stefan-web3-foundations');
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
  'web3-lesson-01','stefan-web3-foundations',
  'Web3 without the hype','web3-section-01','video',
'# Web3 without the hype

## Your outcome

Explain Web3 as a design choice about **ownership, coordination, and trust**, not as a synonym for cryptocurrency.

## Watch for three questions

1. Who controls the rules?
2. Who controls the data or assets?
3. What must a participant trust?

> Reality check: Decentralisation is a spectrum. A product can use a blockchain and still depend on a central website, company, administrator, or data provider.

## Two-minute application

Choose a familiar service such as a social network, marketplace, or loyalty programme. Identify the operator, the database owner, the rule-maker, and the person who can reverse a decision. Then imagine which role, if any, could be shared across a network.

## Key idea

Web3 is useful when reducing reliance on one operator creates enough value to justify public infrastructure, unfamiliar user experience, fees, and new security responsibilities.

Read the official [ethereum.org introduction to Web3](https://ethereum.org/web3/).',
  'markdown',NULL,6,1,0,80,
'Web3 is often introduced with slogans: a new internet, digital ownership, decentralisation, or the internet of value. Those phrases point toward something real, but none is precise enough to guide a product decision.

Start with Web1, Web2, and Web3 as loose mental models, not strict historical periods. Web1 made publishing information widely accessible. Web2 made participation easy: people could post, collaborate, buy, sell, and build an identity on platforms. The trade-off was concentration. A platform usually controls the account, the rules, the database, and the commercial relationship.

Web3 asks whether some of those powers can move from a platform to a shared protocol and its users. A blockchain can provide a shared record that no single participant edits at will. Cryptographic keys can let a person authorise actions without first asking a platform to recognise a password. Tokens can represent transferable rights. Smart contracts can apply public rules to shared state.

That does not mean there is no trust. Trust moves. A learner might trust wallet software, contract code, network validators, an oracle, a bridge, a governance process, and the device holding a key. A website can still censor its interface even when the underlying contract is open. An administrator may retain an upgrade key. Decentralisation is therefore a spectrum with technical, operational, and governance dimensions.

The useful question is not, “Can we put this on a blockchain?” Almost anything can be represented somehow. Ask, “What coordination problem improves when control is shared, and is that improvement worth the cost?” Public verification can be valuable where participants do not share one trusted operator. Portability can matter when users need to take assets or credentials between services. Programmable settlement can matter when rules should execute consistently across organisations.

Now apply three questions to any Web3 claim. Who controls the rules? Who controls the data or assets? What must a participant trust? If the answer is still one company in every case, the blockchain may be decoration. If control is genuinely distributed, identify the new burdens: fees, irreversible mistakes, key recovery, privacy exposure, governance conflict, and software risk.

This course will not ask you to buy a token or connect a real wallet. It will teach you to inspect systems, model trust, recognise risk, and decide when Web3 is useful. That is a stronger foundation than hype because it remains valuable when prices and product names change.',
  1,1784484000000
),
(
  'web3-lesson-02','stefan-web3-foundations',
  'How a blockchain creates shared state','web3-section-01','video',
'# How a blockchain creates shared state

## Your outcome

Describe how transactions, blocks, hashes, nodes, and consensus work together to maintain a shared history.

## The five-part model

- **Transaction:** a proposed state change
- **Signature:** evidence that an account authorised it
- **Block:** an ordered batch of transactions
- **Hash link:** a compact fingerprint connecting history
- **Consensus:** the process for agreeing on the accepted history

> Reality check: A blockchain makes accepted history tamper-evident and costly to rewrite. It does not make every input truthful.

## Worked example

A certificate registry can prove that a specific issuer recorded a credential at a certain time. It cannot prove that the learner really completed the work unless the issuer and assessment process are trustworthy.

## Quick retrieval

Without looking back, name the five parts and explain the role of each in one sentence.

For the original peer-to-peer cash design, read the [Bitcoin whitepaper](https://bitcoin.org/bitcoin.pdf).',
  'markdown',NULL,6,0,0,80,
'Imagine four organisations that need one shared record, but none wants another organisation to own the master database. A blockchain is one way to coordinate that record.

The process begins with a transaction. A transaction is a proposed state change: transfer an asset, call a programme, register a credential, or vote on a proposal. The sender signs the transaction with a private key. Other participants can verify the signature with the corresponding public information. Verification shows that the holder of the key authorised the message; it does not reveal the private key.

Transactions are distributed to network participants. A block producer selects and orders a batch. Every block contains a cryptographic reference to earlier history. A hash acts like a compact fingerprint: a small change to the input produces a different output. If someone changes an old transaction, the later references no longer line up. This makes tampering visible.

The network still needs a way to choose one accepted history when messages arrive at different times or participants disagree. That is the role of consensus. Bitcoin uses proof of work. Ethereum now uses proof of stake. The mechanisms differ, but both combine rules and economic incentives so independent nodes can converge on a canonical state.

Each node can verify the relevant rules for itself. That is an important difference from a normal replicated database. Replicas in one company ultimately obey one administrator. Public blockchain nodes can reject an invalid block even when another participant proposes it.

Three cautions matter. First, immutability is practical, not magical. Rewriting finalised history should become economically or computationally prohibitive, but networks have governance, software, and social layers. Second, consensus only agrees on data submitted to the chain. If an oracle reports a false temperature or an issuer records a fraudulent certificate, the network can faithfully preserve bad input. This is the oracle problem in its broadest form. Third, transparency is not the same as privacy. Public addresses are pseudonyms, and transaction histories can often be analysed.

Use the shared-state lens. A blockchain combines a proposed change, cryptographic authorisation, ordered batches, tamper-evident history, and consensus among independent participants. Its advantage is not that it stores data better than every database. Its advantage appears when several parties need a common state without granting unilateral control to one operator.',
  2,1784484000000
),
(
  'web3-lesson-03','stefan-web3-foundations',
  'Lab: map the trust in a familiar product','web3-section-01','text',
'# Lab: map the trust in a familiar product

## Scenario

A professional association wants portable course certificates. Learners should be able to present a credential to employers even if the original course platform closes.

## Build a trust map

Create five headings: **actors, assets, actions, trust, failure**.

1. List the learner, academy, assessor, employer, platform, and any registry.
2. Name the asset: a certificate, evidence of assessment, or a public status record.
3. Mark who can issue, revoke, verify, correct, or delete.
4. State what each actor must trust today.
5. Describe three failures: a dishonest issuer, leaked personal data, and a lost key.

## Compare two designs

- **Conventional:** signed PDF plus an academy verification page
- **Web3:** W3C verifiable credential, with integrity evidence and a status mechanism

Do not assume the Web3 design wins. Compare portability, privacy, cost, recovery, governance, and operational complexity.

## Deliverable

Write a six-sentence recommendation:

1. The user problem
2. The parties who do not share trust
3. The minimum shared fact
4. The best conventional solution
5. What decentralisation adds
6. Your decision and strongest reason

> Quality test: If a signed credential and ordinary public-key infrastructure solve the problem, say so.',
  'markdown',NULL,6,0,0,0,'',3,1784484000000
),
(
  'web3-lesson-04','stefan-web3-foundations',
  'Checkpoint: shared state and trust','web3-section-01','quiz',
'# Checkpoint: shared state and trust

Answer from the mental model, not from slogans. You may retry after reviewing the lesson that supports your answer.

## Before you begin

Can you distinguish authorisation from truth, and decentralisation from mere use of a blockchain?',
  'markdown',NULL,6,0,0,0,'',4,1784484000000
),
(
  'web3-lesson-05','stefan-web3-foundations',
  'Wallets, keys, addresses, and signatures','web3-section-02','video',
'# Wallets, keys, addresses, and signatures

## Your outcome

Explain what a wallet actually manages and distinguish an address, a private key, a recovery phrase, and a signature.

## Safe mental model

- The blockchain records state.
- The wallet manages keys and helps construct messages.
- The private key authorises actions.
- The address identifies an account.
- The recovery phrase can recreate a set of keys.

> Safety rule: Never paste a recovery phrase or private key into a lesson, form, direct message, cloud note, or support chat.

## Paper exercise

Write a pretend address such as `0xLEARNER` and a pretend transaction. Mark which information may be public and which secret would authorise it. Use invented values only.

Read [Ethereum security and scam prevention](https://ethereum.org/security/).',
  'markdown',NULL,6,0,0,80,
'A crypto wallet does not hold coins in the way a physical wallet holds cash. Assets are represented in blockchain state. The wallet manages the keys that let a user prove authority over an account, displays relevant state, and helps create and sign transactions.

Begin with the private key. It is secret data used to create digital signatures. A valid signature proves that the transaction was authorised by the corresponding key without revealing the key itself. Whoever controls the private key can usually control the account. That is why support staff, course instructors, wallet providers, and legitimate applications should never ask for it.

An address is public. It identifies an account and can receive assets or be inspected in a block explorer. Think of it as an account identifier, not a secret password. Reusing one public address can expose a detailed activity trail, so public does not mean harmless from a privacy perspective.

Many wallets create several accounts from one recovery phrase, also called a seed phrase or secret recovery phrase. The phrase can recreate the keys. That makes it a master secret, not merely a password reset code. A password may only lock one installation of a wallet. If the device is lost, the password alone may not restore access. The recovery phrase can, which is precisely why anyone who obtains it can also take control.

A signature is not always a payment. A site may ask a wallet to sign a login message, a vote, a typed-data permission, or a transaction. The wallet should show what is being signed, but interfaces vary. Blindly approving an unreadable request is dangerous because signatures can grant real authority.

Custody describes who controls the keys. In self-custody, the user holds them and carries responsibility for backup and safe use. In custodial services, an organisation controls keys on the user’s behalf and typically provides account recovery, policy controls, and support. Neither model is automatically right for every user. The decision changes the threat model: self-custody reduces dependence on an intermediary but increases personal operational risk.

Keep one sentence in mind: a wallet is an interface to keys and blockchain state. The address can be shared. The private key and recovery phrase cannot. A signature is an authorisation event and should receive the same care as approving a bank instruction or signing a legal document.',
  5,1784484000000
),
(
  'web3-lesson-06','stefan-web3-foundations',
  'Transactions, gas, and finality','web3-section-02','video',
'# Transactions, gas, and finality

## Your outcome

Read the essential fields of an Ethereum transaction and explain why a transaction can be pending, successful, or failed.

## Transaction anatomy

- `from`: the signing account
- `to`: an account or contract
- `value`: native asset transferred
- `data`: optional contract instruction
- `nonce`: sender sequence number
- `gas limit` and fee settings: computation budget and price

## Important distinction

A failed transaction may still consume gas because the network performed work before the state change reverted.

## Explain it simply

Complete this sentence: “Gas is not fuel stored in a wallet; it is…”

Use the official [Ethereum transaction guide](https://ethereum.org/developers/docs/transactions/) as your reference.',
  'markdown',NULL,6,0,0,80,
'An Ethereum transaction is a cryptographically signed instruction from an externally owned account. It asks the network to change state. That might mean transferring ETH, deploying a contract, or calling a contract function.

Several fields tell the story. The from address identifies the signer. The to field identifies a recipient or contract, unless the transaction is deploying a new contract. Value states how much native ETH is transferred. Input data can encode a contract function and its arguments. The nonce is a sequence number for transactions from that account, which prevents an old signed transaction from being replayed as if it were new.

Every state-changing operation requires network computation and storage. Gas measures the units of work. The sender sets a gas limit, which caps how much work the transaction may consume, and fee parameters that determine the maximum price per gas unit. A simple transfer needs less gas than a complex contract call.

When a wallet submits the signed transaction, it is broadcast to the network and enters a pool of pending transactions. A validator chooses transactions for a block, usually influenced by valid ordering rules and fees. Inclusion in a block gives a confirmation, but confirmation is not the same as finality. As more protocol milestones are reached, confidence grows that the state will not be reorganised. On Ethereum, finality is a protocol state after which reversal would require an extreme network failure or attack.

Success also requires care. A transaction can be included but fail during execution. Perhaps a contract condition was not met, the call ran out of gas, or the submitted state was no longer current. The intended state change reverts, but gas can still be charged because validators performed the computation.

Users should inspect four things before signing: the network, destination, action, and maximum cost. The same address format may appear on different compatible networks, and assets can be sent to the wrong context. Contract calls may ask for token approval rather than an immediate transfer. A clear interface should translate raw data into a human-readable consequence.

Gas is best understood as metered payment for scarce network computation, not as a separate liquid poured into an account. Fees discourage spam and compensate the system for processing. They also create a user-experience trade-off. A product may be technically decentralised yet impractical if routine actions are slow, expensive, or impossible for its intended users.',
  6,1784484000000
),
(
  'web3-lesson-07','stefan-web3-foundations',
  'Lab: read a real transaction without spending','web3-section-02','text',
'# Lab: read a real transaction without spending

You do **not** need a wallet, funds, or a signature.

## Safe procedure

1. Open a reputable public block explorer from the official network documentation.
2. Select any recent transaction.
3. Record the transaction hash, status, block number, timestamp, from, to, value, fee, and input-data label.
4. Decide whether the destination is another account or a contract.
5. Explain what you can verify and what remains an inference.

## Evidence versus interpretation

You can verify the recorded addresses, value, status, and block inclusion. You cannot conclude that an address belongs to a particular person unless reliable off-chain evidence connects them.

## Challenge

Find a failed transaction and compare it with a successful one. Did the failed transaction still have a fee? What does the error or execution trace suggest?

## Deliverable

Write a 100-word “transaction receipt for a non-technical client” without promising identity, intention, or legal ownership that the chain itself does not prove.',
  'markdown',NULL,6,0,0,0,'',7,1784484000000
),
(
  'web3-lesson-08','stefan-web3-foundations',
  'Checkpoint: wallets and transactions','web3-section-02','quiz',
'# Checkpoint: wallets and transactions

This scenario-based check covers key custody, signatures, transaction status, and fees.

> Never use a real recovery phrase or private key in any course activity.',
  'markdown',NULL,6,0,0,0,'',8,1784484000000
),
(
  'web3-lesson-09','stefan-web3-foundations',
  'Smart contracts and the EVM','web3-section-03','video',
'# Smart contracts and the EVM

## Your outcome

Explain how deployed code and state respond to transactions, and identify what a smart contract cannot know by itself.

## Core model

A smart contract is code plus state at a blockchain address. A transaction calls a function. Every validating node applies the same rules and reaches the same result.

## Limits that matter

- Contracts cannot fetch arbitrary web data by themselves.
- Public state is not private.
- Deployed behaviour may be difficult or impossible to change.
- A bug can create irreversible consequences.

## Design prompt

For an escrow contract, list its states, allowed transitions, authorised actors, and failure paths before thinking about code.

Read the official [introduction to smart contracts](https://ethereum.org/developers/docs/smart-contracts/).',
  'markdown',NULL,6,0,0,80,
'A smart contract is a programme deployed to a blockchain address. On Ethereum it contains code and persistent state. Users and other contracts interact with it by sending transactions that call defined functions.

The Ethereum Virtual Machine, or EVM, is the execution environment. Validators run the same transaction against the same prior state. Deterministic execution is essential: if honest nodes produced different answers, they could not agree on the next state. That is why a contract cannot simply call a changing web page, read the local clock of one computer, or use an unpredictable external service during execution.

Consider a simple escrow. State might record a buyer, seller, amount, deadline, and status. A deposit function accepts funds. A release function transfers them when conditions are met. A refund function handles a defined failure. The contract is useful because every participant can inspect the rule set and the network applies it consistently.

But “smart” does not mean legally intelligent or factually aware. The contract does only what its code specifies. If it needs the result of a football match, a weather measurement, or an identity check, an oracle or trusted process must bring that fact on-chain. The contract can verify the format and source of the message, but the external fact still depends on a trust model.

Deployment creates additional constraints. Contract interactions are public by default. Transactions cost gas. Once deployed, code may be immutable. Upgradeable systems introduce administrators, proxy patterns, and governance, which restore flexibility but also create control and security risks. Composability lets one contract call another like an open API, but dependencies can spread failures.

Good contract design starts with states and invariants, not syntax. What must always remain true? Who may cause each transition? What happens when a call fails, a deadline passes, an oracle stops, or an administrator key is compromised? Which escape hatch is legitimate, and who controls it?

The phrase “code is law” is therefore incomplete. Code executes rules, but people choose the code, interfaces shape consent, governance changes systems, courts can still matter, and external facts need interpretation. Treat smart contracts as shared, deterministic automation with unusual transparency and settlement properties, not as perfect replacements for judgement.',
  9,1784484000000
),
(
  'web3-lesson-10','stefan-web3-foundations',
  'Tokens: fungible, non-fungible, and misunderstood','web3-section-03','video',
'# Tokens: fungible, non-fungible, and misunderstood

## Your outcome

Distinguish a token record from the legal, physical, or digital thing it claims to represent.

## Standards

- **ERC-20:** interchangeable units with transfer and allowance interfaces
- **ERC-721:** individually identifiable tokens with ownership and transfer interfaces

## Reality check

Owning an NFT does not automatically grant copyright, access, authenticity, or ownership of a physical item. Those rights depend on the contract, metadata, issuer, and applicable law.

## Classification exercise

For a loyalty point, event ticket, artwork edition, and property claim, decide whether fungibility matters and name the off-chain promise required.

Read [ERC-20](https://eips.ethereum.org/EIPS/eip-20) and [ERC-721](https://eips.ethereum.org/EIPS/eip-721).',
  'markdown',NULL,6,0,0,80,
'A token is a record managed by a smart contract according to an interface. Standards make different token contracts understandable to wallets, exchanges, marketplaces, and other applications.

ERC-20 defines common functions and events for fungible tokens. Fungible means units are intended to be interchangeable: one unit of the same token is treated like another. The standard supports balances, transfers, and allowances that let another address spend up to an approved amount. The interface creates interoperability, but it says almost nothing about economic value, governance quality, legal rights, or the honesty of an issuer.

ERC-721 defines an interface for non-fungible tokens. Each token has an identifier, so applications can distinguish one item from another. The contract can record which address owns a token and who is authorised to transfer it. Optional metadata can point to a name, description, image, or other attributes.

This is where careful language matters. The chain records ownership of the token according to the contract. It does not automatically convey copyright in an image, title to a house, admission to an event, or the truth of metadata. Those outcomes depend on licences, legal agreements, issuer behaviour, redemption systems, and reliable links between on-chain and off-chain objects.

Metadata may live outside the chain because storing large files on-chain is expensive. If a token points to an ordinary server, the content can disappear or change. Content-addressed storage can improve integrity, but availability still requires someone to retain and serve the content. Even an immutable pointer cannot make a false claim true.

Token design should begin with the right being represented. Who issues it? Can it be transferred? Can it be revoked or frozen? Does the holder need privacy? What happens when an account is compromised? Is the right recognised outside the application? Would a conventional database and signed record offer a better recovery experience?

Tokens are powerful coordination primitives because standard interfaces make rights programmable and portable across compatible applications. They are also easy to oversell. Separate the on-chain fact from the surrounding promise. The token contract can prove that address A owns token 42 under specific code. Every claim beyond that needs its own evidence and trust model.',
  10,1784484000000
),
(
  'web3-lesson-11','stefan-web3-foundations',
  'Dapps, oracles, and content addressing','web3-section-03','video',
'# Dapps, oracles, and content addressing

## Your outcome

Trace a decentralised application from interface to wallet, contract, external data, and storage.

## Five layers to inspect

1. User interface
2. Wallet or signer
3. Smart contracts
4. Data providers or oracles
5. File and metadata storage

> Reality check: A decentralised back end can still be reached through one centrally controlled domain and interface.

## Architecture exercise

Draw a dapp request from “click” to “confirmed result.” Put a trust label on every arrow.

Learn what IPFS is and is not in the official [IPFS concepts guide](https://docs.ipfs.tech/concepts/what-is-ipfs/).',
  'markdown',NULL,6,0,0,80,
'A decentralised application, or dapp, is not usually one decentralised object. It is a stack.

The visible layer may be a normal website served from a conventional cloud provider. The interface reads public data and prepares requests. A wallet provides account access and asks the user to sign. Smart contracts validate calls and update shared state. An indexing service may make historical data easier to query. Oracles provide facts that the chain cannot obtain itself. Images and large files may live on ordinary servers or content-addressed networks.

Follow a token purchase as an example. The interface asks a wallet for the active address and network. It reads a contract quote. The user selects an amount. The wallet displays a proposed transaction. After the user signs, the transaction is broadcast. A validator includes it. The contract checks its conditions and changes balances. The interface watches for confirmation and updates its display.

Every arrow has a trust question. Is the interface showing the same contract address it claims? Is the wallet translating the action clearly? Is the price supplied by a robust oracle? Can the contract be upgraded? Is an indexer delayed? Does the file linked in metadata remain available?

IPFS addresses content by a content identifier derived from the data, rather than by one server location. If the content changes, the identifier changes. That helps a client verify that retrieved bytes match the requested content. IPFS is a set of protocols, not a guarantee that every file will remain stored. Persistence requires nodes or storage providers to keep providing the data. Content is not private merely because its address looks unfamiliar; public IPFS data and network metadata need explicit privacy analysis.

Oracles solve a different problem: they deliver external facts such as exchange rates or weather results. They can use multiple sources, signatures, economic incentives, or dispute mechanisms, but no technique eliminates the need to judge sources and failure modes.

Assess decentralisation layer by layer. A contract may be open while an interface is censorable. Storage may be verifiable while availability is centralised. A protocol may be permissionless while governance can upgrade it. The strongest architecture description names these dependencies rather than hiding them behind the word “dapp.”',
  11,1784484000000
),
(
  'web3-lesson-12','stefan-web3-foundations',
  'Checkpoint: contracts, tokens, and dapps','web3-section-03','quiz',
'# Checkpoint: contracts, tokens, and dapps

Use the stack model. Separate what the blockchain verifies from what an interface, oracle, issuer, or storage provider contributes.',
  'markdown',NULL,6,0,0,0,'',12,1784484000000
),
(
  'web3-lesson-13','stefan-web3-foundations',
  'Layer 1, layer 2, sidechains, and bridges','web3-section-04','video',
'# Layer 1, layer 2, sidechains, and bridges

## Your outcome

Explain where a transaction executes, where its data is available, and which security model settles disputes.

## Distinctions

- **Layer 1:** the base consensus and settlement network
- **Layer 2:** executes outside layer 1 while deriving security from it
- **Sidechain:** an independent chain with its own consensus
- **Bridge:** moves or represents messages and assets across environments

## Risk prompt

When an interface says “move this token to a cheaper network,” ask what is locked, what is minted, who verifies messages, how exits work, and what happens if the bridge fails.

Read the official guides to [Ethereum scaling](https://ethereum.org/developers/docs/scaling/) and [bridges](https://ethereum.org/developers/docs/bridges/).',
  'markdown',NULL,6,0,0,80,
'Blockchains face a practical tension among throughput, decentralisation, and security. If every validating node performs every action and stores every detail, the system can be easier to verify independently but harder to scale.

Layer 1 is the base blockchain where consensus and final settlement occur. Ethereum is a layer 1. Layer 2 is a broad label for systems that execute transactions outside the layer 1 execution path while deriving security from layer 1. Rollups batch many transactions and post data or commitments back to the base chain.

Optimistic rollups assume submitted results are valid unless challenged during a defined period. Zero-knowledge rollups submit cryptographic validity proofs. Both can reduce per-transaction cost, but their implementations, upgrade controls, data availability, sequencers, proof systems, and withdrawal processes create different risks.

A sidechain is different. It runs its own consensus and does not inherit the same settlement security simply because it is compatible with Ethereum software. It may offer speed or specialised features, but users trust its validators and bridge design.

Bridges connect otherwise isolated networks. A common design locks an asset in one environment and creates a representation in another. That introduces contract risk, message-verification risk, operational risk, and sometimes a trusted validator group. If the bridge is compromised, a perfectly functioning destination chain may still accept illegitimate wrapped assets.

When selecting a network, do not compare fees alone. Ask where execution occurs, where transaction data is published, who can sequence or censor, how state is proven, how long finality and withdrawals take, whether users can force an exit, and who can upgrade the system.

From a learner perspective, network confusion is a major hazard. The same wallet can display multiple networks, and a token name can refer to different contracts or bridged representations. A low fee is not a sufficient reason to move assets.

Scaling is an architecture of trade-offs. Layer 2 can make applications more usable while leveraging layer 1 settlement, but the exact security model matters. Sidechains offer independent environments. Bridges add connectivity and additional attack surfaces. Replace the vague claim “it is secured by blockchain” with a precise sentence about execution, data, proof, settlement, control, and exit.',
  13,1784484000000
),
(
  'web3-lesson-14','stefan-web3-foundations',
  'DAOs and governance beyond token voting','web3-section-04','video',
'# DAOs and governance beyond token voting

## Your outcome

Design a governance process that separates discussion, decision, execution, and accountability.

## Governance stack

1. Membership and proposal rights
2. Deliberation and information
3. Voting or consent mechanism
4. Treasury execution
5. Emergency and dispute process

## Failure modes

- Low participation
- Wealth concentration
- Delegation capture
- Voter fatigue
- Malicious proposals
- Unclear legal responsibility

## Design prompt

For a community learning fund, define who may propose spending, what threshold applies, who executes, and how conflicts of interest are disclosed.

Read the official [ethereum.org DAO overview](https://ethereum.org/dao/).',
  'markdown',NULL,6,0,0,80,
'A decentralised autonomous organisation, or DAO, is a group that uses shared rules and blockchain-based tools to coordinate decisions or assets. The label covers a wide range: a multisignature treasury with a community forum, a token-voting protocol, a grant programme, or a fully on-chain system.

The useful model separates five layers. Membership determines who can participate. Deliberation is where proposals are explained and challenged. Decision rules specify voting, consent, quorum, delegation, or reputation. Execution turns an accepted decision into an action, such as a treasury transfer. Accountability covers reporting, conflicts, disputes, and emergency response.

Smart contracts can make treasury rules visible and prevent one person from moving funds alone. A multisignature wallet might require three of five authorised signers. On-chain voting can record results and trigger execution. These tools reduce some forms of discretion, but they do not create good governance by themselves.

Token voting often equates economic holdings with voting power. That can align risk and influence, but it can also concentrate control among large holders. One-person-one-vote needs a credible identity or membership system and may create privacy or exclusion concerns. Delegation helps voters use expertise, yet powerful delegates can become a new centre. Quadratic methods, reputation, councils, and bicameral designs each solve some problems and create others.

Participation is another constraint. Complex proposals and frequent votes produce fatigue. A small active group may dominate a large passive membership. Governance attacks can exploit borrowed voting power, rushed proposals, unclear interfaces, or control of the discussion venue.

Legal and human responsibilities do not disappear. Contributors may sign contracts, hold intellectual property, employ people, or face regulatory duties. A DAO should state which parts are on-chain, which entity acts off-chain, who is accountable, and how participants resolve harm.

For a learning community, begin with the decision, not the token. Perhaps members propose workshop topics, an elected council screens conflicts, participants rank choices, and a multisignature team pays approved instructors. That can be more credible than a tradeable governance token.

A DAO is best understood as an organisation design with programmable coordination. Evaluate it using the same standards as any institution: legitimacy, informed participation, checks and balances, operational competence, transparency, inclusion, and a workable response when something goes wrong.',
  14,1784484000000
),
(
  'web3-lesson-15','stefan-web3-foundations',
  'Decentralised identity and verifiable credentials','web3-section-04','video',
'# Decentralised identity and verifiable credentials

## Your outcome

Distinguish identifiers, credentials, proofs, and trust in an issuer.

## Three roles

- **Issuer:** makes claims and secures the credential
- **Holder:** receives and presents it
- **Verifier:** checks integrity, status, relevance, and issuer trust

## Important distinction

Cryptographic verification can show that a credential came from an issuer and was not altered. It does not force a verifier to trust the issuer or accept the claim.

## Apply it

Design the minimum disclosure needed to prove “completed an introductory Web3 course” without revealing unrelated learner data.

Read the W3C standards for [decentralised identifiers](https://www.w3.org/TR/did-core/) and [verifiable credentials](https://www.w3.org/TR/vc-data-model/).',
  'markdown',NULL,6,0,0,80,
'Digital identity is not one global profile. It is a set of relationships, identifiers, claims, credentials, and proofs used in a context.

A decentralised identifier, or DID, is a standard form of identifier designed to be controlled through a DID method rather than assigned only by a central identity provider. Resolving a DID can produce a DID document with verification methods and service information. Different DID methods use different registries and trust models; a blockchain is one possible registry, not a requirement for every digital identity system.

A verifiable credential is a structured set of claims made by an issuer. The W3C model describes an ecosystem with an issuer, holder, and verifier. A training academy might issue a completion credential to a learner. The learner stores it and presents it to an employer. The employer verifies its integrity and status, then decides whether the academy is trusted for that claim.

Cryptography solves only part of the problem. It can help show that the credential was issued by the controller of a verification method and has not been altered. It cannot prove that the issuer assessed the learner properly. The verifier still decides whether the issuer is authoritative, the credential is current, the claim fits the purpose, and the presentation belongs to the relevant holder.

Privacy must be designed deliberately. A globally reusable identifier can enable correlation across services. A credential may reveal more information than a verifier needs. Good systems minimise data, support purpose limitation, protect stored credentials, and use selective disclosure where appropriate. Revocation or status checks can also leak when and where a credential is used.

Recovery and governance matter. What happens if a holder loses keys, an issuer rotates keys, a credential must be corrected, or the registry method disappears? The answer belongs in the product design, not in a footnote.

For education, a sensible credential might state course title, issuer, completion date, assessment basis, and status. It should avoid unnecessary personal attributes. A verification page or signed PDF may be sufficient in many cases; a verifiable credential adds value when portable machine-verification and multi-platform use justify the complexity.

Identity technology should give people useful control without forcing them to become security experts. Evaluate not only whether a claim can be verified, but also whether it can be understood, recovered, corrected, selectively shared, and responsibly governed.',
  15,1784484000000
),
(
  'web3-lesson-16','stefan-web3-foundations',
  'Checkpoint: scaling, governance, and identity','web3-section-04','quiz',
'# Checkpoint: scaling, governance, and identity

Choose the answer that states the security or trust model most precisely. Avoid assuming that lower fees, on-chain voting, or cryptographic proof resolves every product requirement.',
  'markdown',NULL,6,0,0,0,'',16,1784484000000
),
(
  'web3-lesson-17','stefan-web3-foundations',
  'Wallet security: stop, inspect, verify','web3-section-05','video',
'# Wallet security: stop, inspect, verify

## Your outcome

Use a repeatable safety routine before connecting, signing, approving, or sending.

## The SIV routine

- **Stop:** resist urgency and unsolicited support
- **Inspect:** domain, network, destination, action, amount, and approval
- **Verify:** use an independent trusted source and a small reversible test where possible

## Non-negotiable rules

- Never share a recovery phrase or private key.
- Never enter a recovery phrase because a website says “verify” or “synchronise.”
- Treat signatures and token approvals as consequential actions.
- Use a separate low-value learning wallet only when a supervised activity truly requires one.

Study the official [Ethereum security guidance](https://ethereum.org/security/).',
  'markdown',NULL,6,0,0,80,
'Web3 moves responsibility toward the user, and attackers exploit that responsibility with urgency, confusion, and authority. A safety routine must work before panic begins.

Use three words: stop, inspect, verify. Stop when a message creates urgency, promises guaranteed returns, claims your wallet must be synchronised, or offers unsolicited support. Legitimate support does not need a recovery phrase. No one can safely “validate” that phrase for you. Anyone who has it can reconstruct keys and control the accounts.

Inspect the domain character by character. Search advertisements, copied links, direct messages, and lookalike spelling can lead to phishing interfaces. Bookmark important sites from a trusted official source. Check the active network and the exact destination. A familiar token symbol or logo is not proof of the correct contract.

Inspect the requested action. A wallet connection may reveal addresses but is different from a signature. A login signature is different from a transaction. A token approval can give a contract permission to transfer tokens later. Unlimited approval increases the amount at risk if the contract or authorised spender is compromised. Clear signing should translate technical data into the human consequence.

Verify through a second path. If a community announcement asks for action, confirm it on the official website or another established channel. If an address is supplied, compare it with a trusted source. When a legitimate transfer is necessary, a small test can reduce address and network mistakes, though fees and minimums may apply.

Separate purposes. A wallet used for public experiments should not hold important assets. Higher-value custody may justify a hardware wallet, multisignature controls, spending limits, transaction simulation, and documented recovery procedures. Organisations need role separation, approval policy, key rotation, incident response, and rehearsed recovery.

Remember that blockchain settlement is often irreversible. A help desk cannot simply reverse a signed transfer. Malware, clipboard replacement, compromised browser extensions, malicious approvals, and social engineering can all defeat a technically secure protocol.

This course does not require a real wallet or funds. If you later experiment, use an established test network, invented data, official documentation, and a fresh low-risk environment. The most valuable Web3 habit is not speed. It is the ability to pause long enough to understand exactly what authority you are about to grant.',
  17,1784484000000
),
(
  'web3-lesson-18','stefan-web3-foundations',
  'DeFi, stablecoins, and layered risk','web3-section-05','video',
'# DeFi, stablecoins, and layered risk

## Your outcome

Map a DeFi product as a stack of contract, market, oracle, governance, custody, bridge, and regulatory risks.

## Do not confuse

- Automation with safety
- Transparency with comprehension
- A stable target with guaranteed redemption
- High yield with low risk
- An audit with a warranty

## Scenario

A protocol advertises a stable return using a bridged stablecoin deposited into an upgradeable lending contract. Name at least six independent ways a user could lose access or value.

> This course provides technology education, not investment, legal, or tax advice. Do not deposit funds for any course activity.

Read the official [ethereum.org DeFi overview](https://ethereum.org/defi/).',
  'markdown',NULL,6,0,0,80,
'Decentralised finance, or DeFi, uses smart contracts and digital assets to provide services such as exchange, lending, borrowing, payments, derivatives, and asset management. The programmes can be open for inspection and available without a traditional account application. Those properties are meaningful, but they do not make the products low-risk.

Analyse DeFi in layers. Contract risk includes bugs, unsafe upgrades, incorrect economic logic, and interactions with other contracts. Oracle risk appears when decisions depend on an external price. Market risk includes volatility, illiquidity, and liquidation. Governance risk includes malicious proposals, concentrated voting power, and compromised administrators. Custody risk depends on who controls keys. Bridge risk appears when assets move across networks. Interface risk includes phishing or a compromised front end. Regulatory and tax obligations depend on jurisdiction and activity.

A stablecoin targets a stable reference such as a national currency. Different designs support that target differently. A reserve-backed token depends on an issuer, reserve quality, custody, redemption policy, banking access, and legal structure. Crypto-collateralised designs depend on volatile collateral, liquidation, oracle quality, and governance. Algorithmic designs introduce further feedback and confidence risks. “Stable” describes a goal, not a guarantee.

Yield must come from somewhere: borrower payments, trading fees, token incentives, leverage, liquidity provision, or another source of risk. A very high yield can reflect temporary subsidies or severe risk. A transparent contract can still be too complex for most users to evaluate.

Audits reduce risk but do not eliminate it. An audit covers a version, scope, assumptions, and time. Later upgrades or dependencies can change the system. Insurance-like products have exclusions and their own counterparty or contract risk.

For the scenario in the lesson, risk exists in the stablecoin issuer, bridge, lending contract, upgrade administrator, oracle, borrowers, collateral market, user wallet, interface, and legal environment. These risks can compound rather than remain independent.

The responsible beginner activity is analysis, not deposit. Read documentation, identify contracts and control points, inspect risk disclosures, and explain the loss pathways in plain language. Never treat a course, influencer, community message, or protocol interface as personal financial advice. Technical literacy helps you ask better questions; it does not remove uncertainty.',
  18,1784484000000
),
(
  'web3-lesson-19','stefan-web3-foundations',
  'Lab: threat-model a wallet interaction','web3-section-05','text',
'# Lab: threat-model a wallet interaction

## Scenario

A learner receives a direct message: “Your free course NFT expires in ten minutes. Connect your wallet and approve the claim.”

## Build the threat model

Identify:

1. The protected assets
2. The attacker goal
3. The trust signals being imitated
4. The permissions the site might request
5. The irreversible outcomes
6. The safest response

## Use the SIV routine

- **Stop:** name the urgency and emotional trigger.
- **Inspect:** domain, sender, network, contract, requested signature, and token approval.
- **Verify:** navigate independently to the academy and confirm through an official channel.

## Write the learner warning

Create a 60-word notice that is specific, calm, and actionable. It must say that no course administrator will request a recovery phrase and that learners never need to spend funds to complete this course.

## Extension

Draft an incident checklist for someone who already signed: disconnect the site, inspect approvals, revoke suspicious permissions using a trusted tool, move remaining assets when appropriate, preserve evidence, and seek help only through verified channels.',
  'markdown',NULL,6,0,0,0,'',19,1784484000000
),
(
  'web3-lesson-20','stefan-web3-foundations',
  'Checkpoint: security and DeFi risk','web3-section-05','quiz',
'# Checkpoint: security and DeFi risk

Apply the safest interpretation. The correct response should reduce irreversible exposure and name the layer where risk occurs.',
  'markdown',NULL,6,0,0,0,'',20,1784484000000
),
(
  'web3-lesson-21','stefan-web3-foundations',
  'When a blockchain is the wrong tool','web3-section-06','video',
'# When a blockchain is the wrong tool

## Your outcome

Reject weak Web3 use cases with a clear, evidence-based explanation.

## Use the necessity test

Ask:

1. Are there multiple parties who need shared state?
2. Is unilateral control a material problem?
3. Must independent participants verify the history?
4. Is public or consortium infrastructure acceptable for privacy and performance?
5. Does decentralisation outweigh recovery, cost, and governance complexity?

## Strong alternatives

Consider a signed database record, append-only log, public-key signatures, escrow service, shared API, or conventional consortium database.

## Red flag

If the real goal is “issue a token” rather than solve a user problem, return to discovery.

## Activity

Choose one fashionable Web3 idea and write the strongest case **against** using a blockchain.',
  'markdown',NULL,6,0,0,80,
'The ability to build a blockchain solution is not evidence that one should exist. Mature design includes the confidence to reject an attractive technology.

Begin with shared state. If one organisation legitimately owns the process, serves all users, and can be held accountable, a well-designed database is usually faster, cheaper, more private, easier to correct, and easier to support. Cryptographic signatures can prove who approved a record without requiring global consensus. An append-only audit log can make changes traceable. A public verification page can validate a certificate. Escrow and contractual governance may solve coordination with familiar legal remedies.

A blockchain becomes more plausible when independent parties need a common state, do not accept one party as the unilateral administrator, and benefit from verifying rules or history themselves. Even then, ask whether the data can be public or safely minimised, whether participants can manage keys, and whether the governance model is credible.

Avoid “blockchain for immutable truth.” A chain preserves accepted inputs; it cannot verify reality without issuers, sensors, or oracles. Avoid “NFT for ownership” unless the off-chain rights and enforcement are explicit. Avoid “DAO for community” when the group mainly needs communication and transparent budgeting. Avoid a token when ordinary membership, points, or revenue-sharing contracts are clearer.

Performance and recovery matter. Public consensus can be costly and slow. Irreversible actions conflict with consumer expectations and administrative correction. Self-custody can exclude people who cannot safely manage keys. Public activity can expose sensitive relationships. Upgrade mechanisms can undermine decentralisation while immutable code can preserve bugs.

Use a decision record. State the user problem, parties, disputed trust, minimum shared fact, candidate architectures, costs, privacy impact, failure modes, and exit strategy. Compare a conventional baseline honestly. If blockchain wins only because of vague future interoperability or marketing value, it has not passed.

Rejecting a weak use case is not anti-Web3. It protects users and reserves the technology for problems where shared verification, portable rights, programmable settlement, or resistance to unilateral control creates real value. A responsible builder optimises for the user outcome, not for the number of blockchain components.',
  21,1784484000000
),
(
  'web3-lesson-22','stefan-web3-foundations',
  'Design a responsible Web3 product','web3-section-06','video',
'# Design a responsible Web3 product

## Your outcome

Turn a user problem into an architecture with explicit trust, safety, governance, and success measures.

## The Web3 product canvas

1. User and job
2. Existing failure
3. Parties and trust gap
4. Minimum on-chain state
5. Off-chain services
6. Key and recovery model
7. Governance and upgrades
8. Threats and safeguards
9. Legal and ethical review
10. Success and exit metrics

## Design principle

Minimise what goes on-chain. Public permanence is a liability when data is personal, incorrect, or legally erasable.

## Learner promise

Your capstone will be judged on reasoning, not on whether you include a token.

Use the canvas to prepare your capstone in the next lesson.',
  'markdown',NULL,6,0,0,80,
'A strong Web3 product brief begins with a person and a job to be done. “Create a marketplace token” is a solution. “Help independent educators prove completion across platforms after a provider closes” is a problem worth exploring.

Describe the current failure with evidence. Who is blocked, what does it cost, and why do existing institutions or databases fail? Then list every party and the trust relationship between them. Decentralisation is relevant only where the trust gap is material.

Define the minimum on-chain state. Do not publish personal data, confidential documents, or large files because storage is public and difficult to correct. A hash, status reference, ownership record, or settlement instruction may be enough. Keep sensitive material off-chain with access control, retention rules, and a clear controller.

Map the complete stack: interface, wallet, contracts, storage, indexing, oracles, identity, analytics, and support. For every component, name the operator, upgrade authority, data collected, and failure consequence.

Design keys and recovery for the actual audience. A product for first-time learners cannot pretend seed-phrase management is effortless. Consider custodial onboarding, account abstraction, social or institutional recovery, transaction simulation, spending limits, or progressive self-custody. Explain the trade-off rather than hiding it.

Governance needs an upgrade path, emergency process, and legitimate decision rights. If an administrator can change the contract, disclose it. If the contract cannot change, explain how defects and legal requirements will be handled. Define an exit: can users retrieve data or assets if the company, interface, or protocol stops?

Threat-model both technical and human failure. Include phishing, malicious approvals, lost keys, contract bugs, oracle manipulation, bridge failure, privacy leakage, governance capture, misinformation, and customer-support impersonation. Pair each threat with prevention, detection, response, and recovery.

Finally, define success without token price. Measure task completion, time, cost, error rate, recovery success, accessibility, user comprehension, decentralisation of critical control, and real-world adoption. Add a stop condition: what evidence would cause the team to return to a conventional architecture?

The best Web3 product may use one small blockchain component and excellent conventional software around it. It may also conclude that no blockchain is needed. The quality lies in explicit reasoning, humane recovery, transparent power, and measurable benefit.',
  22,1784484000000
),
(
  'web3-lesson-23','stefan-web3-foundations',
  'Capstone: pitch, architecture, and threat model','web3-section-06','resource',
'# Capstone: pitch, architecture, and threat model

## Choose one brief

- Portable learning credentials
- Community-funded local training
- Creator licensing and royalty records
- Supply-chain provenance for a high-risk product
- Your own problem, approved by the instructor

## Submit a six-part product dossier

### 1. One-page decision brief

Define the user, problem, conventional baseline, trust gap, and blockchain necessity test.

### 2. Architecture map

Show the interface, signer, contracts, storage, external data, governance, and settlement. Mark every central control point.

### 3. State and rights model

List what is on-chain, what stays off-chain, who can read or change it, and what legal or contractual right each token or credential represents.

### 4. Threat model

Cover keys, phishing, permissions, contract bugs, upgrades, oracle or bridge failure, privacy, and recovery. Rank severity and likelihood.

### 5. Learner-safe prototype

Create screens or a clickable mock-up. Do not deploy a contract, request a real signature, or use real funds.

### 6. Three-minute defence

Explain the strongest argument against your design, the evidence that would change your decision, and one metric that matters more than token price.

## Assessment rubric

- Problem and evidence: **20%**
- Trust and architecture reasoning: **25%**
- Safety, privacy, and recovery: **25%**
- Governance and off-chain reality: **15%**
- Clarity, accessibility, and measurement: **15%**

> Distinction standard: The submission makes limits visible and removes unnecessary blockchain components.',
  'markdown',NULL,6,0,0,0,'',23,1784484000000
),
(
  'web3-lesson-24','stefan-web3-foundations',
  'Final assessment: think like a Web3 builder','web3-section-06','quiz',
'# Final assessment: think like a Web3 builder

The final assessment tests transfer, not vocabulary. Choose the response that best identifies the trust boundary, user consequence, or responsible design decision.

## Pass standard

Score at least 80%. Review the relevant module before another attempt.

## After passing

Revisit your capstone and change one design decision using what the assessment revealed.',
  'markdown',NULL,6,0,0,0,'',24,1784484000000
)
)
WHERE EXISTS (SELECT 1 FROM `courses` WHERE id='stefan-web3-foundations');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
  (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
SELECT column1,column2,column3,column4,column5
FROM (VALUES
  ('web3-quiz-01','web3-lesson-04','Shared state and trust',80,3),
  ('web3-quiz-02','web3-lesson-08','Wallets and transactions',80,3),
  ('web3-quiz-03','web3-lesson-12','Contracts, tokens, and dapps',80,3),
  ('web3-quiz-04','web3-lesson-16','Scaling, governance, and identity',80,3),
  ('web3-quiz-05','web3-lesson-20','Security and DeFi risk',80,3),
  ('web3-final-exam','web3-lesson-24','Final: think like a Web3 builder',80,3)
)
WHERE EXISTS (SELECT 1 FROM `courses` WHERE id='stefan-web3-foundations');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
  (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`position`)
SELECT column1,column2,column3,column4,column5,column6
FROM (VALUES
  ('web3-q01-01','web3-quiz-01','Which statement best describes decentralisation?','["A system with no organisations involved","A spectrum of distributed control across technical and governance layers","Any product that accepts cryptocurrency","A database with several backups"]',1,1),
  ('web3-q01-02','web3-quiz-01','What does consensus primarily help independent blockchain nodes do?','["Agree on an accepted history and state","Verify that every external claim is true","Keep all transaction activity private","Reverse user mistakes"]',0,2),
  ('web3-q01-03','web3-quiz-01','A credential is recorded on-chain by a dishonest issuer. What has the chain established?','["The learner definitely earned it","The issuer was legally authorised","The accepted record contains that issuer action","Every employer must accept it"]',2,3),
  ('web3-q01-04','web3-quiz-01','When is a blockchain most plausible?','["One trusted operator needs a faster private database","Several parties need shared state without unilateral control by one party","A marketing team wants a token","Personal data must be easy to erase"]',1,4),

  ('web3-q02-01','web3-quiz-02','What does a self-custody wallet primarily manage?','["Coins stored inside the application","Private keys and signed interactions with blockchain state","A guaranteed identity record","Reversible bank transfers"]',1,1),
  ('web3-q02-02','web3-quiz-02','A support agent asks for a recovery phrase. What is the correct response?','["Share half of it","Enter it only on a video call","Refuse and use a verified support channel","Encrypt it and send by email"]',2,2),
  ('web3-q02-03','web3-quiz-02','Why can a failed transaction still cost gas?','["The network performed computation before reverting the state change","The wallet keeps the fee as a penalty","The recipient always receives half","Failure means the fee display is incorrect"]',0,3),
  ('web3-q02-04','web3-quiz-02','Which evidence is safe to share in the explorer lab?','["A real private key","A recovery phrase","A public transaction hash","A wallet backup file"]',2,4),

  ('web3-q03-01','web3-quiz-03','What can a smart contract know about an off-chain event by itself?','["Anything on a public website","Only information made available through its state and inputs","The legal meaning of every transaction","A user private key"]',1,1),
  ('web3-q03-02','web3-quiz-03','What does ERC-20 mainly standardise?','["A guarantee of token value","Interfaces for fungible token balances, transfers, and approvals","Legal ownership of company shares","Private storage for artwork"]',1,2),
  ('web3-q03-03','web3-quiz-03','An ERC-721 token points to an image. What is automatically proven?','["The holder owns copyright","The image will remain available forever","The contract records ownership of that token identifier","The issuer owns the physical artwork"]',2,3),
  ('web3-q03-04','web3-quiz-03','What does a content identifier improve?','["Verification that retrieved content matches the address","A guarantee that the content is true","Automatic privacy","Permanent availability without storage providers"]',0,4),
  ('web3-q03-05','web3-quiz-03','Why does a price-dependent contract need an oracle?','["The EVM cannot fetch arbitrary changing web data during deterministic execution","Oracles remove every trust assumption","The wallet does not have an address","Tokens cannot store numbers"]',0,5),

  ('web3-q04-01','web3-quiz-04','Which statement distinguishes a sidechain from an Ethereum layer 2?','["A sidechain has no transactions","A sidechain runs independent consensus rather than deriving the same security from Ethereum settlement","A layer 2 never uses a bridge","A sidechain cannot run smart contracts"]',1,1),
  ('web3-q04-02','web3-quiz-04','What additional risk does a bridge introduce?','["Cross-network message, contract, and custody assumptions","Guaranteed lower fees","Automatic transaction reversal","Private addresses"]',0,2),
  ('web3-q04-03','web3-quiz-04','Why is token voting not automatically democratic?','["Tokens cannot be counted","Voting power and participation can be concentrated","All proposals execute off-chain","A DAO has no treasury"]',1,3),
  ('web3-q04-04','web3-quiz-04','What can cryptographic verification of a credential establish?','["Every verifier must trust the issuer","The claim is legally binding everywhere","Integrity and issuer-linked proof under the chosen method","The subject never shared extra data"]',2,4),
  ('web3-q04-05','web3-quiz-04','Which identity design is most privacy-aware?','["Reuse one identifier everywhere","Publish the full learner record","Disclose only the claims needed for the verification purpose","Put passport data directly on a public chain"]',2,5),

  ('web3-q05-01','web3-quiz-05','A direct message says a free NFT expires in ten minutes. What should happen first?','["Connect quickly","Stop and verify through an independent official channel","Send a small payment","Share the wallet screenshot"]',1,1),
  ('web3-q05-02','web3-quiz-05','Why is unlimited token approval risky?','["It always doubles gas","An authorised contract may transfer more tokens later if compromised or malicious","It reveals the recovery phrase","It closes the wallet"]',1,2),
  ('web3-q05-03','web3-quiz-05','What does stablecoin stability describe?','["A target supported by a design and trust model, not a guarantee","A government guarantee in every country","No exposure to banks or collateral","An immutable one-to-one price"]',0,3),
  ('web3-q05-04','web3-quiz-05','What does a smart-contract audit provide?','["A lifetime warranty","Risk reduction for a defined scope, version, and time","Proof that no administrator exists","Insurance for every user loss"]',1,4),
  ('web3-q05-05','web3-quiz-05','Which course activity is appropriate for a beginner?','["Deposit funds to test yield","Import a real recovery phrase","Threat-model a simulated interaction without funds","Approve an unknown contract"]',2,5),

  ('web3-final-01','web3-final-exam','A university controls issuance and all employers already trust it. The goal is online certificate verification. What is the best first baseline?','["A tradeable token","A signed credential and public verification service","A DAO treasury","A cross-chain bridge"]',1,1),
  ('web3-final-02','web3-final-exam','A product stores personal health data directly on a public chain for immutability. What is the strongest concern?','["Block times may be too fast","Public permanence conflicts with privacy, correction, and minimisation needs","Wallet addresses are too short","The data cannot be hashed"]',1,2),
  ('web3-final-03','web3-final-exam','A dapp contract is immutable, but its only website is centrally controlled. Which statement is accurate?','["The whole product is fully decentralised","The protocol may be open while interface access remains a central control point","The contract cannot be used","The website controls blockchain consensus"]',1,3),
  ('web3-final-04','web3-final-exam','A wallet asks the user to approve an unfamiliar spender. What information matters most?','["The logo colour","The human-readable consequence, spender, token, amount, network, and source","The number of social followers","The token price chart"]',1,4),
  ('web3-final-05','web3-final-exam','A project claims an NFT proves ownership of a physical artwork. What is missing?','["A larger token ID","A reliable legal and operational link between token, issuer, rights, and object","More gas","A public wallet password"]',1,5),
  ('web3-final-06','web3-final-exam','A rollup has low fees. What should an architect investigate next?','["Only the token symbol","Data availability, proof model, sequencer, upgrades, finality, and exit path","Whether it calls itself Web3","The founder profile picture"]',1,6),
  ('web3-final-07','web3-final-exam','A DAO has 10,000 token holders but five addresses decide most votes. What has the design demonstrated?','["Guaranteed inclusion","Concentrated governance despite broad nominal membership","One-person-one-vote","No need for accountability"]',1,7),
  ('web3-final-08','web3-final-exam','A DeFi return comes from token incentives and leveraged borrowers. How should it be described?','["Risk-free passive income","A return with market, contract, incentive, and liquidation dependencies","A bank deposit","Guaranteed by transparency"]',1,8),
  ('web3-final-09','web3-final-exam','Which capstone metric best reflects responsible product value?','["Token price","Number of blockchain components","Successful user task completion with low error and recoverable failure","Social-media mentions"]',2,9),
  ('web3-final-10','web3-final-exam','What is the strongest Web3 design conclusion?','["Every product needs a token","Decentralisation removes trust","Use the minimum architecture that solves a real trust and coordination problem","Immutability makes governance unnecessary"]',2,10)
)
WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE id='web3-final-exam');
