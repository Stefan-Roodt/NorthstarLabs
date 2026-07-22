UPDATE `courses` SET
    `description`='Twelve production-quality modules from the Digital Assets pathway. Every module uses guided stories, decision labs, source-backed notes and scored assessments; later source modules remain excluded until they pass the same standard.',
    `updated_at`=1784865600000
  WHERE `id`='cognizen-crypto-mastery-foundations-production';
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections`
    (`id`,`course_id`,`title`,`position`,`created_at`)
  SELECT 'cmf-module-1-9','cognizen-crypto-mastery-foundations-production','Module 1.9: Ethereum Fundamentals',9,1784865600000
  WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-9-lesson-01','cognizen-crypto-mastery-foundations-production','cmf-module-1-9','Separate Ethereum, ether and tokens','interactive',
      '## Your outcome

Explain Ethereum as a programmable network, ETH as its native asset and tokens as contract-defined records.

## Source-backed reference notes

Ethereum''s current documentation distinguishes the network, its native ETH, user-controlled accounts and contract accounts. [Ethereum technical introduction](https://ethereum.org/developers/docs/intro-to-ethereum/) - [Ethereum accounts](https://ethereum.org/developers/docs/accounts/)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Network map","title":"One ecosystem, three different objects","intro":"Follow a user instruction from wallet to account to contract, without treating every object as the same asset.","scenes":[{"id":"network","label":"Layer 1 - Ethereum","title":"A shared programmable state machine","body":"Nodes execute agreed rules and maintain account balances, contract code and contract state.","metric":"Network","tone":"blue"},{"id":"eth","label":"Layer 2 - ETH","title":"The protocol''s native asset","body":"ETH transfers value, pays for computation and supports proof-of-stake security. Ethereum is the network; ETH is an asset used on it.","metric":"Native asset","tone":"green"},{"id":"account","label":"Layer 3 - Account","title":"A user key or contract controls activity","body":"An externally owned account can initiate a transaction. A contract account responds according to deployed code.","metric":"Control","tone":"orange"},{"id":"token","label":"Layer 4 - Token","title":"A contract maintains another asset record","body":"A token on Ethereum is not ETH. Its supply, permissions and transfer rules depend on its contract.","metric":"Contract-defined","tone":"red"}],"activity":{"kind":"classify","title":"Name the Ethereum object","prompt":"Classify each statement by what it describes most directly.","buckets":[{"id":"network","label":"Ethereum network","description":"Shared execution and state"},{"id":"eth","label":"ETH","description":"Native asset and fee unit"},{"id":"account","label":"Account","description":"User- or code-controlled actor"},{"id":"token","label":"Contract token","description":"Asset logic deployed on Ethereum"}],"cards":[{"id":"e1","text":"Validators and nodes agree on updated state.","bucketId":"network","feedback":"That describes the distributed network and its consensus process."},{"id":"e2","text":"The sender pays the execution fee in the native unit.","bucketId":"eth","feedback":"ETH is used to pay transaction and computation fees."},{"id":"e3","text":"A private key authorises an instruction.","bucketId":"account","feedback":"A user-controlled account uses a key to sign transactions."},{"id":"e4","text":"A deployed program tracks balances and can pause transfers.","bucketId":"token","feedback":"Those rules belong to a contract-defined token."}]},"takeaway":"Never infer the rights or safety of a token from the reputation of its host network. The network, ETH and each contract are separate layers."}',1,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-9-lesson-02','cognizen-crypto-mastery-foundations-production','cmf-module-1-9','Trace a smart-contract transaction','interactive',
      '## Your outcome

Describe how a signed transaction invokes code, consumes gas and changes shared state.

## Source-backed reference notes

Ethereum defines smart contracts as code and state at blockchain addresses, invoked by transactions and executed by the EVM. [Smart contracts](https://ethereum.org/developers/docs/smart-contracts/)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Transaction simulator","title":"A click can trigger several irreversible state changes","intro":"Trace a fictional token swap and identify what the wallet, EVM and contract each contribute.","scenes":[{"id":"intent","label":"Step 1 - Intent","title":"The interface prepares an instruction","body":"The screen proposes a contract address, function, parameters, value and fee settings. The interface can be wrong or malicious.","metric":"Unsigned request","tone":"blue"},{"id":"signature","label":"Step 2 - Signature","title":"The account authorises exact data","body":"The wallet signs the transaction. Signing proves authorisation; it does not prove the contract is safe or the trade is sensible.","metric":"Authorised","tone":"orange"},{"id":"execution","label":"Step 3 - EVM","title":"Nodes execute the same contract logic","body":"Operations consume gas while code checks conditions, reads state and proposes updates.","metric":"Computation","tone":"green"},{"id":"result","label":"Step 4 - State","title":"Success commits changes; failure may still consume gas","body":"A reverted call normally cancels its requested state changes, but computation already performed can still cost a fee.","metric":"Receipt","tone":"red"}],"activity":{"kind":"branch","title":"The wallet shows an unfamiliar contract and unlimited token approval","prompt":"The website says the approval is required to claim a free reward. What is the strongest next action?","options":[{"id":"sign","label":"Sign because the wallet keeps the private key hidden.","verdict":"Authorisation risk missed","feedback":"A harmful approval can drain tokens without revealing the private key.","tone":"risk"},{"id":"fee","label":"Sign if the gas fee is low.","verdict":"Cost confused with safety","feedback":"A cheap transaction can still grant dangerous permissions.","tone":"caution"},{"id":"stop","label":"Stop, verify the domain, contract and requested permission independently.","verdict":"Correct control point","feedback":"The safest moment is before signing. Treat unexpected unlimited approval as a serious warning.","tone":"good"}]},"takeaway":"A wallet signature is a powerful authorisation, not a security review. Understand the destination, function and permission before signing."}',2,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-9-lesson-03','cognizen-crypto-mastery-foundations-production','cmf-module-1-9','Balance programmability, gas and dependency risk','interactive',
      '## Your outcome

Assess an Ethereum application across code, oracle, upgrade, interface and scaling dependencies.

## Source-backed reference notes

Ethereum documents composability, off-chain oracle limits and the execution costs of contracts. [Ethereum smart contracts](https://ethereum.org/developers/docs/smart-contracts/) - [Ethereum introduction](https://ethereum.org/developers/docs/intro-to-ethereum/)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Application stress test","title":"The base chain can work while the application fails","intro":"Rate a fictional lending application across the dependencies that sit above Ethereum consensus.","scenes":[{"id":"code","label":"Risk 1 - Code","title":"Contract logic controls funds","body":"A bug, unsafe permission or flawed economic assumption can create loss even when Ethereum processes the transaction correctly.","metric":"Contract risk","tone":"red"},{"id":"oracle","label":"Risk 2 - Oracle","title":"External prices enter through another system","body":"Consensus can agree on the value supplied without proving the off-chain price source is accurate.","metric":"Data dependency","tone":"orange"},{"id":"upgrade","label":"Risk 3 - Admin","title":"Upgrade keys may change behaviour","body":"Upgradeable contracts add flexibility but create governance and key-compromise risk.","metric":"Control","tone":"blue"},{"id":"layer2","label":"Risk 4 - Scaling","title":"Layer 2 adds capacity and assumptions","body":"Lower fees may come with bridges, sequencers, proof systems and withdrawal procedures that require separate review.","metric":"System stack","tone":"green"}],"activity":{"kind":"meter","title":"Rate the application''s operational resilience","prompt":"Move the controls based on evidence, not branding or token price.","dimensions":[{"id":"audit","label":"Code assurance","lowLabel":"Unknown code","highLabel":"Reviewed and monitored","weight":1.3,"initial":35},{"id":"oracle","label":"Oracle resilience","lowLabel":"One opaque feed","highLabel":"Robust sources and limits","weight":1.2,"initial":30},{"id":"admin","label":"Admin constraints","lowLabel":"One unrestricted key","highLabel":"Delayed multisig controls","weight":1.2,"initial":25},{"id":"interface","label":"Interface verification","lowLabel":"Unknown link","highLabel":"Verified route and contract","weight":1,"initial":45},{"id":"exit","label":"Exit and recovery","lowLabel":"Unclear","highLabel":"Tested and documented","weight":1.1,"initial":35}],"thresholds":[{"max":39,"label":"Fragile application","feedback":"Several independent dependencies can fail. Do not mistake base-chain operation for application safety.","tone":"risk"},{"max":69,"label":"Conditional resilience","feedback":"Protections exist, but permissions, data or exit paths need stronger evidence.","tone":"caution"},{"max":100,"label":"Stronger operating profile","feedback":"The design reduces several common risks, though smart-contract and market risk remain.","tone":"good"}]},"takeaway":"Evaluate the complete application stack. Ethereum consensus is only one part of the learner''s real exposure."}',3,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
    (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
     `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
     `transcript`,`experience_json`,`position`,`updated_at`)
  SELECT 'cmf-module-1-9-lesson-04','cognizen-crypto-mastery-foundations-production','cmf-module-1-9','Check your understanding','quiz',
    '## Module 1.9 assessment

Answer all eight questions. Every answer returns an explanation and a concept label. Reach 80% before continuing. Attempts are unlimited because correcting a misconception is part of learning.',
    'markdown',5,0,0,0,'','',4,1784865600000
  WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
    (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
  SELECT 'cmf-module-1-9-quiz','cmf-module-1-9-lesson-04','Module 1.9: Ethereum Fundamentals',80,0
  WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-1-9-lesson-04');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-9-quiz-q01','cmf-module-1-9-quiz','What is Ethereum?',
      '["A company share","A programmable blockchain network","A wallet password","Every token on the network"]',1,'Ethereum is the network and execution environment.','Ethereum',1
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-9-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-9-quiz-q02','cmf-module-1-9-quiz','What is ETH?',
      '["Ethereum''s native asset","Every Ethereum token","A smart contract audit","A private key"]',0,'ETH is the native asset used for value transfer, fees and staking.','Ether',2
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-9-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-9-quiz-q03','cmf-module-1-9-quiz','Which account can initiate a transaction directly?',
      '["A user-controlled externally owned account","Only a contract account","An oracle","A token symbol"]',0,'An externally owned account signs and initiates a transaction.','Accounts',3
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-9-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-9-quiz-q04','cmf-module-1-9-quiz','What is a smart contract?',
      '["A guaranteed legal agreement","Code and state deployed at a blockchain address","A customer support promise","A market prediction"]',1,'A smart contract is an executable blockchain program; legal status is separate.','Smart contracts',4
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-9-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-9-quiz-q05','cmf-module-1-9-quiz','What does gas measure?',
      '["Token popularity","Computational work","Legal ownership","Validator identity"]',1,'Gas meters the resources consumed by Ethereum execution.','Gas',5
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-9-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-9-quiz-q06','cmf-module-1-9-quiz','Why can a failed call still cost ETH?',
      '["Computation was performed before the revert","Failure creates free tokens","The private key changed","ETH and Ethereum are identical"]',0,'Network resources were used even though the requested state change reverted.','Execution',6
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-9-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-9-quiz-q07','cmf-module-1-9-quiz','Why is an unlimited token approval risky?',
      '["It always raises gas","It can authorise later transfers by the approved contract","It reveals every public address","It stops all validators"]',1,'Approval can delegate broad spending power without exposing the private key.','Transaction safety',7
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-9-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-9-quiz-q08','cmf-module-1-9-quiz','What does Ethereum consensus not guarantee?',
      '["Consistent execution under network rules","That an application''s oracle data and business logic are correct","Transaction ordering","Shared state"]',1,'Application dependencies can fail while the base network operates correctly.','Risk boundaries',8
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-9-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections`
    (`id`,`course_id`,`title`,`position`,`created_at`)
  SELECT 'cmf-module-1-10','cognizen-crypto-mastery-foundations-production','Module 1.10: Public and Private Keys',10,1784865600000
  WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-10-lesson-01','cognizen-crypto-mastery-foundations-production','cmf-module-1-10','From private key to verifiable authority','interactive',
      '## Your outcome

Distinguish private keys, public keys, addresses and digital signatures without exposing a secret.

## Source-backed reference notes

NIST describes asymmetric-key cryptography in blockchain systems; Bitcoin and Ethereum document key pairs and transaction signatures. [NISTIR 8202](https://doi.org/10.6028/NIST.IR.8202) - [Bitcoin transactions](https://developer.bitcoin.org/devguide/transactions.html) - [Ethereum accounts](https://ethereum.org/developers/docs/accounts/)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Key laboratory","title":"Prove authority without publishing the secret","intro":"Walk through the one-way relationship from a secret key to an address and a transaction signature.","scenes":[{"id":"private","label":"Secret 1 - Private key","title":"Generates authority","body":"Secure software creates a very large random secret. Possession can authorise asset movement, so disclosure can be catastrophic.","metric":"Never share","tone":"red"},{"id":"public","label":"Output 2 - Public key","title":"Supports verification","body":"A public key is mathematically related to the private key. It can verify signatures without revealing the secret.","metric":"Verification","tone":"blue"},{"id":"address","label":"Identifier 3 - Address","title":"Receives under network rules","body":"An address is derived using network-specific processing. It can usually be shared, but using the wrong network can still cause loss.","metric":"Shareable","tone":"green"},{"id":"signature","label":"Proof 4 - Signature","title":"Binds authority to transaction data","body":"A valid signature proves that the corresponding key authorised specific data. Changing the transaction invalidates that proof.","metric":"Transaction-specific","tone":"orange"}],"activity":{"kind":"classify","title":"Secret, identifier or proof?","prompt":"Classify each item by its direct role.","buckets":[{"id":"secret","label":"Secret authority","description":"Must remain confidential"},{"id":"public","label":"Public identifier","description":"Used to receive or verify"},{"id":"proof","label":"Authorisation proof","description":"Binds approval to data"}],"cards":[{"id":"k1","text":"Used locally to create a transaction signature.","bucketId":"secret","feedback":"The private key creates signatures and must remain secret."},{"id":"k2","text":"Shared so another person can send assets to you.","bucketId":"public","feedback":"A network-compatible receiving address is public information."},{"id":"k3","text":"Lets nodes verify that transaction data was authorised.","bucketId":"proof","feedback":"The digital signature proves authorisation of the signed data."},{"id":"k4","text":"Mathematically derived and used in signature verification.","bucketId":"public","feedback":"A public key supports verification without exposing the private key."}]},"takeaway":"A blockchain does not need your secret to verify your authority. The private key stays private; the signature supplies the proof."}',1,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-10-lesson-02','cognizen-crypto-mastery-foundations-production','cmf-module-1-10','Control is not the same as legal ownership','interactive',
      '## Your outcome

Separate cryptographic control, beneficial ownership and custodial authority.

## Source-backed reference notes

Ethereum notes that control of a private key grants custody over associated funds, while a wallet is only the interface used to interact with an account. [Ethereum accounts](https://ethereum.org/developers/docs/accounts/)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Control-room case","title":"The network sees valid authority, not the whole legal story","intro":"Compare a self-custody holder, an exchange customer and a thief who copied a key.","scenes":[{"id":"self","label":"Case 1 - Self-custody","title":"The holder controls the signing key","body":"Technical control and claimed ownership sit with one person, along with recovery and security responsibility.","metric":"Direct control","tone":"green"},{"id":"exchange","label":"Case 2 - Custody","title":"The service controls pooled keys","body":"The customer has an account claim while the custodian controls blockchain movement under its systems and terms.","metric":"Delegated control","tone":"blue"},{"id":"theft","label":"Case 3 - Stolen key","title":"The attacker may gain control, not lawful title","body":"The network can accept a valid signature without knowing the key was stolen. Legal rights and recovery remain separate questions.","metric":"Illicit control","tone":"red"},{"id":"loss","label":"Case 4 - Lost key","title":"The record remains but spending authority may be gone","body":"Without a valid backup, the network cannot reset a private key like a password.","metric":"Irrecoverable risk","tone":"orange"}],"activity":{"kind":"branch","title":"An exchange customer sees a balance but cannot withdraw","prompt":"What is the most accurate statement?","options":[{"id":"chain","label":"The customer necessarily controls the on-chain keys.","verdict":"Custody misunderstood","feedback":"The service may control pooled addresses while showing an internal customer balance.","tone":"risk"},{"id":"owner","label":"The exchange automatically owns the customer''s assets in every legal sense.","verdict":"Legal conclusion overclaimed","feedback":"Custody, beneficial ownership and legal title depend on agreements and law.","tone":"caution"},{"id":"separate","label":"The customer has a claim on the custodian, which controls withdrawal capability.","verdict":"Control layers separated","feedback":"This accurately distinguishes the service''s technical control from the customer''s claim.","tone":"good"}]},"takeaway":"Ask two questions separately: who can sign now, and who has the lawful claim? A blockchain can answer the first more readily than the second."}',2,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-10-lesson-03','cognizen-crypto-mastery-foundations-production','cmf-module-1-10','Protect secrets and inspect signatures','interactive',
      '## Your outcome

Respond safely to seed-phrase requests, suspicious approvals and possible key compromise.

## Source-backed reference notes

Ethereum''s security guidance says never to share private keys or recovery phrases; its clear-signing initiative targets blind approvals. [Ethereum security](https://ethereum.org/security/) - [Clear signing](https://blog.ethereum.org/2026/05/12/clear-signing-announcement)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Authorisation firewall","title":"Most key failures happen around the cryptography","intro":"Review the human and device controls that protect a mathematically strong key.","scenes":[{"id":"secret","label":"Control 1 - Secret","title":"Keep keys and recovery data out of messages and cloud screenshots","body":"Anyone with the recovery phrase may recreate every derived account. No legitimate support agent needs it.","metric":"Confidentiality","tone":"red"},{"id":"device","label":"Control 2 - Device","title":"Reduce malware and fake-wallet exposure","body":"Use maintained software from verified sources, updated devices and separate environments for higher-risk activity.","metric":"Integrity","tone":"blue"},{"id":"meaning","label":"Control 3 - Meaning","title":"Understand what the signature authorises","body":"A private key can remain hidden while a user signs a transfer, approval or delegation that causes loss.","metric":"Clear signing","tone":"orange"},{"id":"response","label":"Control 4 - Response","title":"Move before changing superficial passwords","body":"If a private key or recovery phrase may be copied, create a new secure wallet and transfer remaining assets after verifying the plan.","metric":"New keys","tone":"green"}],"activity":{"kind":"meter","title":"Rate the signing environment","prompt":"Use the result to expose operational gaps, not to declare any wallet risk-free.","dimensions":[{"id":"source","label":"Software source","lowLabel":"Unknown link","highLabel":"Verified maintained source","weight":1.2,"initial":45},{"id":"backup","label":"Recovery protection","lowLabel":"Cloud screenshot","highLabel":"Offline separated backup","weight":1.3,"initial":30},{"id":"display","label":"Transaction clarity","lowLabel":"Blind signature","highLabel":"Human-readable verified details","weight":1.3,"initial":35},{"id":"separation","label":"Fund separation","lowLabel":"One wallet for all","highLabel":"Purpose-specific wallets","weight":1,"initial":30},{"id":"response","label":"Compromise plan","lowLabel":"No plan","highLabel":"Tested migration plan","weight":1.1,"initial":25}],"thresholds":[{"max":39,"label":"High operational exposure","feedback":"Strong cryptography cannot compensate for exposed recovery data or blind approvals.","tone":"risk"},{"max":69,"label":"Partial protection","feedback":"Improve the weakest control before increasing the value or permissions at risk.","tone":"caution"},{"max":100,"label":"Stronger operating discipline","feedback":"The controls reduce common failure paths, but every transaction still requires review.","tone":"good"}]},"takeaway":"Protect both the secret and the meaning of each signature. A hidden key can still authorise a harmful transaction."}',3,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
    (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
     `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
     `transcript`,`experience_json`,`position`,`updated_at`)
  SELECT 'cmf-module-1-10-lesson-04','cognizen-crypto-mastery-foundations-production','cmf-module-1-10','Check your understanding','quiz',
    '## Module 1.10 assessment

Answer all eight questions. Every answer returns an explanation and a concept label. Reach 80% before continuing. Attempts are unlimited because correcting a misconception is part of learning.',
    'markdown',5,0,0,0,'','',4,1784865600000
  WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
    (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
  SELECT 'cmf-module-1-10-quiz','cmf-module-1-10-lesson-04','Module 1.10: Public and Private Keys',80,0
  WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-1-10-lesson-04');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-10-quiz-q01','cmf-module-1-10-quiz','What does a private key do?',
      '["Predicts price","Creates transaction signatures","Stores the blockchain","Resets an exchange account"]',1,'The private key creates cryptographic authorisation and must remain secret.','Private keys',1
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-10-quiz-q02','cmf-module-1-10-quiz','What is a public key used for?',
      '["Recovering every password","Verifying signatures","Guaranteeing identity","Paying gas"]',1,'A public key supports verification of signatures from its paired private key.','Public keys',2
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-10-quiz-q03','cmf-module-1-10-quiz','Which item is normally safe to share for receiving assets?',
      '["Recovery phrase","Private key","Correct network address","Wallet backup"]',2,'A receiving address is public, though asset and network compatibility must be checked.','Addresses',3
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-10-quiz-q04','cmf-module-1-10-quiz','What does a digital signature prove?',
      '["The transaction is profitable","The corresponding key authorised the signed data","The signer is the legal owner","The recipient is honest"]',1,'A valid signature proves key-based authorisation of specific data.','Signatures',4
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-10-quiz-q05','cmf-module-1-10-quiz','Why is a wallet password not equivalent to a private key?',
      '["Passwords may protect an app while private keys provide blockchain authority","Private keys are usernames","Passwords are always public","They are identical"]',0,'Changing an app password cannot neutralise a copied private key.','Credentials',5
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-10-quiz-q06','cmf-module-1-10-quiz','What does custodial storage mean?',
      '["The user necessarily holds every key","A service controls keys on the customer''s behalf","No one controls withdrawals","The network restores lost keys"]',1,'Custodians manage signing capability while customers rely on their account claims.','Custody',6
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-10-quiz-q07','cmf-module-1-10-quiz','Can funds be stolen without revealing the private key?',
      '["No","Yes, by approving a harmful transaction or permission","Only if gas is free","Only from paper wallets"]',1,'A user can keep the key secret yet sign dangerous instructions.','Signing risk',7
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-10-quiz-q08','cmf-module-1-10-quiz','What is the appropriate response to suspected key exposure?',
      '["Change only the wallet app password","Publish the key","Move remaining assets to a newly generated secure wallet","Wait for the blockchain to reset it"]',2,'A compromised blockchain key cannot simply be reset; assets should be secured under new keys.','Incident response',8
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-10-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections`
    (`id`,`course_id`,`title`,`position`,`created_at`)
  SELECT 'cmf-module-1-11','cognizen-crypto-mastery-foundations-production','Module 1.11: Cryptocurrency Wallets',11,1784865600000
  WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-11-lesson-01','cognizen-crypto-mastery-foundations-production','cmf-module-1-11','Understand what a wallet actually manages','interactive',
      '## Your outcome

Explain how wallet software manages keys, addresses, signing and network interaction rather than storing coins inside an app.

## Source-backed reference notes

NIST defines a wallet as software or hardware that manages asymmetric keys and addresses; Bitcoin documentation separates key distribution, signing and network functions. [NIST wallet glossary](https://csrc.nist.gov/glossary/term/wallet) - [Bitcoin wallets](https://developer.bitcoin.org/devguide/wallets.html)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Wallet anatomy","title":"The balance is on the ledger; the authority is in the keys","intro":"Open a wallet interface and assign each visible function to the underlying responsibility.","scenes":[{"id":"keys","label":"Function 1 - Keys","title":"Generate and protect signing authority","body":"Wallets may derive many accounts and addresses from recovery material while hiding most cryptographic complexity.","metric":"Authority","tone":"red"},{"id":"view","label":"Function 2 - View","title":"Read ledger activity","body":"The interface queries a node or service to display balances and history. A display error does not rewrite the chain.","metric":"Ledger view","tone":"blue"},{"id":"build","label":"Function 3 - Build","title":"Construct a transaction","body":"The wallet selects network, destination, amount, fee and contract call data for the user to review.","metric":"Intent","tone":"orange"},{"id":"sign","label":"Function 4 - Sign and broadcast","title":"Authorise, then send to the network","body":"Signing and broadcasting are separable. Hardware and offline systems can sign without placing the secret on an internet-connected computer.","metric":"Execution","tone":"green"}],"activity":{"kind":"classify","title":"What job is the wallet doing?","prompt":"Match the visible behaviour to the wallet function.","buckets":[{"id":"manage","label":"Key management","description":"Creates or protects authority"},{"id":"observe","label":"Ledger observation","description":"Displays blockchain state"},{"id":"prepare","label":"Transaction preparation","description":"Builds the instruction"},{"id":"authorise","label":"Signing","description":"Approves exact transaction data"}],"cards":[{"id":"w1","text":"Derives a new receiving address.","bucketId":"manage","feedback":"Address derivation belongs to key and account management."},{"id":"w2","text":"Shows a confirmed transfer after reading a node service.","bucketId":"observe","feedback":"The wallet presents ledger data; it does not contain the asset itself."},{"id":"w3","text":"Estimates the fee and creates unsigned call data.","bucketId":"prepare","feedback":"Those steps construct the proposed transaction."},{"id":"w4","text":"Produces proof that the key approved the transaction.","bucketId":"authorise","feedback":"Signing provides cryptographic authorisation."}]},"takeaway":"Choose a wallet by the jobs and trust boundaries it handles, not by a glossy balance screen."}',1,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-11-lesson-02','cognizen-crypto-mastery-foundations-production','cmf-module-1-11','Choose custody and wallet type by purpose','interactive',
      '## Your outcome

Select a custodial, mobile, browser, hardware or multisignature setup for a defined use case.

## Source-backed reference notes

Ethereum publishes wallet-selection criteria covering maintenance, security review, self-custody and hardware support; Bitcoin explains full-service, offline and hardware wallet designs. [Ethereum wallet criteria](https://ethereum.org/wallets/find-wallet/) - [Bitcoin wallets](https://developer.bitcoin.org/devguide/wallets.html)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Wallet workshop","title":"There is no best wallet without a use case","intro":"Compare convenience, recovery, application access and loss impact before choosing the control model.","scenes":[{"id":"custody","label":"Option 1 - Custodial","title":"Recovery and service support","body":"Useful for some beginners and trading, but the provider controls withdrawal capability and introduces solvency, freeze and account risks.","metric":"Service trust","tone":"blue"},{"id":"mobile","label":"Option 2 - Mobile or browser","title":"Fast access and application compatibility","body":"Convenient for small active balances, but exposed to phishing, malware, device compromise and unsafe approvals.","metric":"High access","tone":"orange"},{"id":"hardware","label":"Option 3 - Hardware","title":"Keys isolated from ordinary online devices","body":"Can reduce key-extraction risk while still requiring authentic devices, secure backups and careful screen verification.","metric":"Isolated signing","tone":"green"},{"id":"multisig","label":"Option 4 - Multisignature","title":"Several approvals reduce one-key failure","body":"Suitable for organisations or significant holdings when participants, thresholds, recovery and disputes are carefully designed.","metric":"Shared authority","tone":"red"}],"activity":{"kind":"branch","title":"A learner wants to try one low-value decentralised application","prompt":"Which is the strongest starting setup?","options":[{"id":"savings","label":"Connect the long-term savings wallet for convenience.","verdict":"Risk domains combined","feedback":"A new application should not receive access near the learner''s largest holdings.","tone":"risk"},{"id":"exchange","label":"Assume an exchange login can connect to every application.","verdict":"Function mismatch","feedback":"Custodial accounts may not provide the needed direct contract interaction and add provider dependencies.","tone":"caution"},{"id":"separate","label":"Use a separate self-custody application wallet funded only with the test amount.","verdict":"Purpose and exposure aligned","feedback":"Separation limits the loss impact of a malicious application or approval.","tone":"good"}]},"takeaway":"A wallet choice is an exposure decision. Match authority, recovery and value at risk to the activity."}',2,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-11-lesson-03','cognizen-crypto-mastery-foundations-production','cmf-module-1-11','Build a layered wallet operating model','interactive',
      '## Your outcome

Separate spending, application, trading and long-term funds while planning recovery and network checks.

## Source-backed reference notes

Bitcoin''s wallet guide separates networked, watching and signing functions; Ethereum security guidance emphasises recovery protection and hardware wallets. [Bitcoin wallets](https://developer.bitcoin.org/devguide/wallets.html) - [Ethereum security](https://ethereum.org/security/)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Wallet architecture","title":"One wallet for everything creates one failure domain","intro":"Design a four-zone wallet system and expose the weakest operating control.","scenes":[{"id":"daily","label":"Zone 1 - Daily","title":"Small convenient balance","body":"Optimised for accessibility, with a deliberately limited loss ceiling.","metric":"Frequent use","tone":"blue"},{"id":"apps","label":"Zone 2 - Applications","title":"Disposable permissions","body":"Used for contract interactions and reviewed regularly for approvals that should be revoked.","metric":"High interaction","tone":"orange"},{"id":"trade","label":"Zone 3 - Trading","title":"Custodial exposure is explicit","body":"Only the amount needed for a purpose remains with a provider; withdrawals and account recovery are tested.","metric":"Counterparty risk","tone":"red"},{"id":"reserve","label":"Zone 4 - Reserve","title":"Low-frequency isolated signing","body":"Long-term holdings use strong backups, verified transactions and an inheritance or emergency plan.","metric":"Low exposure","tone":"green"}],"activity":{"kind":"meter","title":"Test the wallet operating model","prompt":"Raise a score only when the control is practical and tested.","dimensions":[{"id":"separation","label":"Purpose separation","lowLabel":"One wallet","highLabel":"Distinct risk zones","weight":1.2,"initial":25},{"id":"network","label":"Network verification","lowLabel":"Assumed","highLabel":"Asset and chain checked","weight":1.2,"initial":40},{"id":"backup","label":"Recovery resilience","lowLabel":"Single fragile copy","highLabel":"Tested separated backup","weight":1.3,"initial":30},{"id":"permissions","label":"Approval hygiene","lowLabel":"Never reviewed","highLabel":"Minimised and reviewed","weight":1.1,"initial":20},{"id":"continuity","label":"Emergency continuity","lowLabel":"No plan","highLabel":"Documented and tested","weight":1,"initial":20}],"thresholds":[{"max":39,"label":"Single-point exposure","feedback":"One mistake or device failure could affect too much. Separate funds and recovery paths first.","tone":"risk"},{"max":69,"label":"Developing wallet model","feedback":"The architecture is improving, but one or more operational controls remain untested.","tone":"caution"},{"max":100,"label":"Stronger layered model","feedback":"Purpose, authority and recovery are separated, reducing the impact of a single failure.","tone":"good"}]},"takeaway":"Security comes from the complete operating model: technology, behaviour, backups, permissions and loss containment."}',3,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
    (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
     `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
     `transcript`,`experience_json`,`position`,`updated_at`)
  SELECT 'cmf-module-1-11-lesson-04','cognizen-crypto-mastery-foundations-production','cmf-module-1-11','Check your understanding','quiz',
    '## Module 1.11 assessment

Answer all eight questions. Every answer returns an explanation and a concept label. Reach 80% before continuing. Attempts are unlimited because correcting a misconception is part of learning.',
    'markdown',5,0,0,0,'','',4,1784865600000
  WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
    (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
  SELECT 'cmf-module-1-11-quiz','cmf-module-1-11-lesson-04','Module 1.11: Cryptocurrency Wallets',80,0
  WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-1-11-lesson-04');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-11-quiz-q01','cmf-module-1-11-quiz','Where are cryptocurrency balances recorded?',
      '["Inside the phone battery","On the relevant blockchain ledger","Only in the wallet logo","Inside an email"]',1,'Wallets manage access and display ledger state; assets remain recorded on the ledger.','Wallet function',1
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-11-quiz-q02','cmf-module-1-11-quiz','What does a wallet manage most fundamentally?',
      '["Private keys, public information and transaction signing","Guaranteed returns","Legal identity","Mining hardware"]',0,'Key management and signing are core wallet functions.','Wallet function',2
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-11-quiz-q03','cmf-module-1-11-quiz','What distinguishes custodial from self-custodial wallets?',
      '["Screen colour","Who controls the private keys","Token price","Block size"]',1,'Custody is defined chiefly by who has signing authority.','Custody',3
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-11-quiz-q04','cmf-module-1-11-quiz','Why can a separate application wallet reduce risk?',
      '["It guarantees contract safety","It limits the funds and permissions exposed","It eliminates fees","It hides every transaction"]',1,'Separation contains the impact of harmful approvals or applications.','Risk separation',4
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-11-quiz-q05','cmf-module-1-11-quiz','What is a hardware wallet designed to do?',
      '["Store cryptocurrency inside the device","Isolate signing keys from ordinary online devices","Reverse confirmed payments","Choose profitable tokens"]',1,'The device protects signing authority; the asset remains on the ledger.','Hardware wallets',5
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-11-quiz-q06','cmf-module-1-11-quiz','Why does multisignature reduce one-key failure?',
      '["Several required approvals can distribute control","It makes keys public","It removes recovery planning","It prevents every dispute"]',0,'A threshold of independent keys can prevent one key from acting alone.','Multisignature',6
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-11-quiz-q07','cmf-module-1-11-quiz','Why is network compatibility important?',
      '["The same address and asset rules do not apply across every network","Every network is identical","It changes legal ownership","It guarantees lower fees"]',0,'Sending through an unsupported network can make recovery difficult or impossible.','Network compatibility',7
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-11-quiz-q08','cmf-module-1-11-quiz','What makes a wallet strategy resilient?',
      '["One wallet for all activity","Purpose separation, secure recovery and careful transaction review","A large balance screen","Frequent screenshots of the seed phrase"]',1,'Resilience combines technology with tested operating discipline.','Wallet strategy',8
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-11-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `course_sections`
    (`id`,`course_id`,`title`,`position`,`created_at`)
  SELECT 'cmf-module-1-12','cognizen-crypto-mastery-foundations-production','Module 1.12: Hot Wallets and Cold Wallets',12,1784865600000
  WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-12-lesson-01','cognizen-crypto-mastery-foundations-production','cmf-module-1-12','Map hot and cold attack surfaces','interactive',
      '## Your outcome

Explain internet exposure, offline signing and the threats neither model removes.

## Source-backed reference notes

Bitcoin documentation contrasts networked full-service wallets with offline and hardware signing; official security guidance recommends cold storage for savings. [Bitcoin wallets](https://developer.bitcoin.org/devguide/wallets.html) - [Securing a Bitcoin wallet](https://bitcoin.org/en/secure-your-wallet)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Attack-surface map","title":"Cold reduces one class of exposure; it does not remove responsibility","intro":"Place each threat where it can operate and identify the controls that remain necessary.","scenes":[{"id":"hot","label":"Hot surface - Online","title":"Keys or signing sit near networked software","body":"Mobile, desktop, browser and many exchange wallets prioritise access but face phishing, malware and remote compromise.","metric":"Convenience","tone":"orange"},{"id":"cold","label":"Cold surface - Isolated","title":"Signing authority stays away from ordinary internet devices","body":"Hardware or offline signing can reduce key extraction while transferring unsigned and signed transaction data between environments.","metric":"Isolation","tone":"green"},{"id":"shared","label":"Shared threat - Human","title":"Both can authorise the wrong instruction","body":"A convincing scam, incorrect address or misunderstood approval can defeat either model if the user signs it.","metric":"Meaning risk","tone":"red"},{"id":"physical","label":"Cold threat - Physical","title":"Backups and devices create custody obligations","body":"Theft, fire, water, tampering, loss and inheritance failure remain material risks.","metric":"Recovery","tone":"blue"}],"activity":{"kind":"classify","title":"Where does the threat operate?","prompt":"Choose the most direct exposure. Some controls help more than one category.","buckets":[{"id":"hot","label":"Primarily hot-wallet","description":"Relies on online compromise"},{"id":"cold","label":"Primarily cold-storage","description":"Relies on physical or recovery failure"},{"id":"both","label":"Affects both","description":"Exploits the user''s authorisation"}],"cards":[{"id":"h1","text":"Browser malware replaces a copied address before signing.","bucketId":"hot","feedback":"Networked devices have a larger remote-software attack surface."},{"id":"h2","text":"A paper recovery backup is destroyed in a flood.","bucketId":"cold","feedback":"Offline recovery material still needs durable, separated protection."},{"id":"h3","text":"The user approves a malicious transfer shown clearly on the signing screen.","bucketId":"both","feedback":"Neither hot nor cold storage protects a knowingly approved harmful instruction."},{"id":"h4","text":"A fake hardware wallet arrives already initialised with a recovery phrase.","bucketId":"cold","feedback":"Supply-chain and setup fraud target cold-storage users."}]},"takeaway":"Hot and cold describe key exposure, not complete safety. Review online, physical, recovery and authorisation threats separately."}',1,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-12-lesson-02','cognizen-crypto-mastery-foundations-production','cmf-module-1-12','Use offline signing without signing blind','interactive',
      '## Your outcome

Trace an unsigned transaction through an isolated signer and verify destination, amount, network and permissions.

## Source-backed reference notes

Bitcoin''s developer guide describes offline and hardware signing workflows; Ethereum''s security work emphasises readable transaction meaning instead of blind signing. [Bitcoin wallets](https://developer.bitcoin.org/devguide/wallets.html) - [Clear signing](https://blog.ethereum.org/2026/05/12/clear-signing-announcement)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Offline signing drill","title":"Isolation protects the key; verification protects the decision","intro":"Move a transaction from an online watcher to an isolated signer and back without trusting one screen blindly.","scenes":[{"id":"build","label":"Step 1 - Build online","title":"Create an unsigned transaction","body":"The networked wallet selects spendable funds, destination, amount and fee but has no private key to approve it.","metric":"No authority","tone":"blue"},{"id":"transfer","label":"Step 2 - Transfer","title":"Move transaction data to the signer","body":"QR, removable media or another channel can carry data. The transfer method itself can be manipulated.","metric":"Untrusted data","tone":"orange"},{"id":"verify","label":"Step 3 - Verify and sign","title":"Use the trusted display","body":"Confirm destination, amount, fee, network and contract permission on the isolated device before authorising.","metric":"Human control","tone":"green"},{"id":"broadcast","label":"Step 4 - Broadcast","title":"Return only the signed transaction","body":"The online wallet sends it to the network. The private key never needs to leave the signer.","metric":"Public data","tone":"red"}],"activity":{"kind":"branch","title":"The computer and hardware screen show different destinations","prompt":"What should the user do?","options":[{"id":"computer","label":"Trust the computer because it created the transaction.","verdict":"Compromised interface trusted","feedback":"The online device may be infected or the data path may have changed.","tone":"risk"},{"id":"device","label":"Trust the hardware screen and sign immediately.","verdict":"Mismatch ignored","feedback":"A mismatch is a stop signal. The intended transaction has not been safely established.","tone":"caution"},{"id":"stop","label":"Cancel, investigate the mismatch and rebuild from a trusted environment.","verdict":"Safe response","feedback":"Never sign while authoritative displays disagree about the transaction.","tone":"good"}]},"takeaway":"An isolated signer is valuable because it gives you an independent place to inspect and authorise the exact transaction."}',2,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
      (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
       `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
       `transcript`,`experience_json`,`position`,`updated_at`)
    SELECT 'cmf-module-1-12-lesson-03','cognizen-crypto-mastery-foundations-production','cmf-module-1-12','Design a practical hot-cold allocation','interactive',
      '## Your outcome

Set exposure limits by purpose, transaction frequency, recovery ability and consequence of loss.

## Source-backed reference notes

Bitcoin security guidance recommends keeping only small everyday amounts online and using offline wallets for savings; Ethereum recommends hardware protection and strict recovery secrecy. [Bitcoin wallet security](https://bitcoin.org/en/secure-your-wallet) - [Ethereum security](https://ethereum.org/security/)

## How to use this lesson

Play the guided story and complete the decision activity before opening the notes. The lesson explains technology and operational risk; it does not provide financial advice.','markdown',6,0,0,0,'','{"version":1,"eyebrow":"Exposure planner","title":"Convenience belongs near small balances; friction belongs near large consequences","intro":"Create a policy without pretending one percentage suits every learner.","scenes":[{"id":"spend","label":"Bucket 1 - Spending","title":"Hot and intentionally limited","body":"A small balance supports frequent activity while setting a clear maximum loss from device or application compromise.","metric":"Low ceiling","tone":"blue"},{"id":"apps","label":"Bucket 2 - Applications","title":"Hot but separated","body":"Experimental smart-contract activity uses a distinct wallet so approvals cannot reach reserve holdings.","metric":"Permission boundary","tone":"orange"},{"id":"reserve","label":"Bucket 3 - Reserve","title":"Cold and rarely touched","body":"Long-term assets prioritise isolated signing, durable backups and independent transaction verification.","metric":"Low frequency","tone":"green"},{"id":"continuity","label":"Bucket 4 - Recovery","title":"No system is safe if recovery is impossible","body":"Backups, instructions and trusted succession must survive device failure without exposing the secret prematurely.","metric":"Continuity","tone":"red"}],"activity":{"kind":"meter","title":"Balance security and usability","prompt":"The result estimates whether the setup fits its purpose; it does not prescribe an investment allocation.","dimensions":[{"id":"limit","label":"Hot-wallet loss limit","lowLabel":"Most holdings","highLabel":"Deliberately small","weight":1.3,"initial":30},{"id":"frequency","label":"Cold transaction discipline","lowLabel":"Frequent casual use","highLabel":"Rare planned use","weight":1,"initial":45},{"id":"display","label":"Independent verification","lowLabel":"One screen","highLabel":"Trusted signer display","weight":1.2,"initial":40},{"id":"backup","label":"Backup durability","lowLabel":"One fragile copy","highLabel":"Separated tested copies","weight":1.3,"initial":30},{"id":"succession","label":"Continuity plan","lowLabel":"None","highLabel":"Secure and tested","weight":1.1,"initial":20}],"thresholds":[{"max":39,"label":"Poor exposure fit","feedback":"Convenience or recovery failure could place too much value at risk. Reduce the blast radius first.","tone":"risk"},{"max":69,"label":"Workable but incomplete","feedback":"The hot-cold split helps, but verification, backup or continuity needs improvement.","tone":"caution"},{"max":100,"label":"Purpose-aligned design","feedback":"The setup separates active exposure from reserves and supports tested recovery.","tone":"good"}]},"takeaway":"The right split is personal and operational: limit online exposure, preserve usability and make recovery realistic."}',3,1784865600000
    WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons`
    (`id`,`course_id`,`section_id`,`title`,`lesson_type`,`content`,`content_format`,
     `duration_minutes`,`is_preview`,`available_after_days`,`required_watch_percent`,
     `transcript`,`experience_json`,`position`,`updated_at`)
  SELECT 'cmf-module-1-12-lesson-04','cognizen-crypto-mastery-foundations-production','cmf-module-1-12','Check your understanding','quiz',
    '## Module 1.12 assessment

Answer all eight questions. Every answer returns an explanation and a concept label. Reach 80% before continuing. Attempts are unlimited because correcting a misconception is part of learning.',
    'markdown',5,0,0,0,'','',4,1784865600000
  WHERE EXISTS (SELECT 1 FROM `courses` WHERE `id`='cognizen-crypto-mastery-foundations-production');
--> statement-breakpoint
INSERT OR IGNORE INTO `quizzes`
    (`id`,`lesson_id`,`title`,`passing_score`,`max_attempts`)
  SELECT 'cmf-module-1-12-quiz','cmf-module-1-12-lesson-04','Module 1.12: Hot Wallets and Cold Wallets',80,0
  WHERE EXISTS (SELECT 1 FROM `lessons` WHERE `id`='cmf-module-1-12-lesson-04');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-12-quiz-q01','cmf-module-1-12-quiz','What makes a wallet hot?',
      '["Its colour","Its signing environment is internet-connected or routinely online","It holds only ETH","It has no key"]',1,'Hot wallets operate in environments exposed to online interaction.','Hot wallets',1
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-12-quiz-q02','cmf-module-1-12-quiz','What is the primary security benefit of cold storage?',
      '["It guarantees good transactions","It reduces ordinary internet exposure of private keys","It stores assets off-chain","It removes backup needs"]',1,'Cold storage isolates signing authority from common online attack paths.','Cold storage',2
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-12-quiz-q03','cmf-module-1-12-quiz','Does a hardware wallet store cryptocurrency inside the device?',
      '["Yes, as files","No, it protects keys used to control ledger assets","Only during weekends","Only stablecoins"]',1,'The blockchain records the assets; the device protects signing keys.','Hardware wallets',3
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-12-quiz-q04','cmf-module-1-12-quiz','Why should the hardware screen be checked?',
      '["It may independently show the transaction being authorised","It predicts fees next year","It restores legal title","It changes the recipient"]',0,'The trusted display helps detect a compromised computer or altered transaction.','Transaction verification',4
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-12-quiz-q05','cmf-module-1-12-quiz','What should happen when two transaction displays disagree?',
      '["Sign the cheaper one","Cancel and investigate","Publish the seed phrase","Retry until one disappears"]',1,'A mismatch means the intended transaction has not been safely verified.','Safe signing',5
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-12-quiz-q06','cmf-module-1-12-quiz','Which risk remains with cold storage?',
      '["Recovery-phrase theft and malicious signing","No physical risks","No user error","No transaction fees"]',0,'Isolation does not remove recovery, physical or authorisation risks.','Cold-wallet risk',6
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-12-quiz-q07','cmf-module-1-12-quiz','Why separate an application wallet from a reserve wallet?',
      '["To guarantee token prices","To contain risky permissions and interactions","To eliminate networks","To avoid all backups"]',1,'Purpose separation limits how much one malicious approval can affect.','Wallet separation',7
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-12-quiz');
--> statement-breakpoint
INSERT OR IGNORE INTO `quiz_questions`
      (`id`,`quiz_id`,`prompt`,`options_json`,`correct_index`,`explanation`,`concept_label`,`position`)
    SELECT 'cmf-module-1-12-quiz-q08','cmf-module-1-12-quiz','What determines a sensible hot-cold strategy?',
      '["A universal percentage","Purpose, value at risk, transaction frequency and recovery ability","A social-media poll","Only hardware price"]',1,'Security design should match the learner''s activity and consequences of loss.','Security strategy',8
    WHERE EXISTS (SELECT 1 FROM `quizzes` WHERE `id`='cmf-module-1-12-quiz');
