-- Make every Bitcoin assessment teach after it scores. Apply the same
-- evidence-led feedback to the public original and the CogniZen review copy.
WITH `feedback` (`id`,`explanation`) AS (VALUES
  ('btc-q01-01','Digital information can be copied perfectly, so a bearer-money system needs a shared way to prevent the same unit being spent twice.'),
  ('btc-q01-02','Bitcoin''s innovation was the working combination of existing cryptographic and networking tools with a native incentive system, not the invention of every component.'),
  ('btc-q01-03','The newspaper reference establishes a not-before timestamp and historical context; it does not prove every later claim about Satoshi''s political intent.'),
  ('btc-q01-04','No public evidence has conclusively linked the Satoshi pseudonym to a verified legal identity, so certainty would exceed the available evidence.'),
  ('btc-q01-05','Hashcash demonstrated proof of computational work; Bitcoin adapted that idea to order block history and make rewriting it costly.'),

  ('btc-q02-01','Bitcoin tracks spendable transaction outputs rather than one editable account balance; a wallet adds the UTXOs it can authorise.'),
  ('btc-q02-02','The fee is the difference between total inputs and total outputs: 110,000 minus 109,000 equals 1,000 satoshis.'),
  ('btc-q02-03','Proof of work makes a candidate history expensive to create but easy for nodes to verify; it does not prove legality or override consensus rules.'),
  ('btc-q02-04','Full nodes independently apply the subsidy rule and reject a block that creates more bitcoin than the consensus rules allow.'),
  ('btc-q02-05','A confirmation means the transaction is included in accepted block history; additional cumulative work generally makes a reorganisation less likely, not impossible.'),

  ('btc-q03-01','The block subsidy is programmed to halve every 210,000 blocks; existing balances and transaction values do not halve.'),
  ('btc-q03-02','A predictable supply schedule controls issuance, not demand, liquidity, leverage, regulation, or the purchasing power people assign to bitcoin.'),
  ('btc-q03-03','Pools combine contributed work and distribute rewards more regularly, reducing the extreme payout variance faced by a small solo miner.'),
  ('btc-q03-04','A pool may coordinate block templates while participating machines remain separately owned and can move to another pool, so pool share and hardware ownership are not identical.'),
  ('btc-q03-05','As the subsidy declines, the open question is whether fees and bitcoin''s value will support enough mining expenditure to deter attacks.'),

  ('btc-q04-01','An exchange balance is a claim on a company whose custody system controls withdrawals; the customer does not unilaterally control the underlying keys.'),
  ('btc-q04-02','A spot bitcoin ETP gives the investor shares in a regulated product; custody, redemption, fees, and legal rights remain part of the wrapper.'),
  ('btc-q04-03','Wrapped bitcoin adds dependencies on an issuer or bridge, smart-contract code, and another network, so it is not operationally identical to native BTC.'),
  ('btc-q04-04','Addresses are not names, but the public transaction graph can be clustered and linked to identities using behaviour, exchange records, and other external data.'),
  ('btc-q04-05','Silent Payments aim to let someone publish a reusable payment address while reducing the obvious on-chain link created by repeatedly paying one static address.'),

  ('btc-q05-01','SegWit moved signature data into a witness structure, addressed transaction malleability for modern inputs, and introduced block weight accounting.'),
  ('btc-q05-02','With Taproot, a cooperative spend of a complex policy can use the key path and avoid revealing every unused script condition.'),
  ('btc-q05-03','Lightning channels rely on Bitcoin spending conditions, so a dispute can ultimately be resolved by publishing the appropriate transaction on-chain.'),
  ('btc-q05-04','Lightning payments depend on available inbound and outbound liquidity, channel state, routing, and operational reliability.'),
  ('btc-q05-05','A BIP number documents a proposal; implementation, deployment, activation, and real adoption must each be established separately.'),

  ('btc-q06-01','When hardware becomes more efficient, competition can add more machines and hash rate, so total electricity use does not automatically fall.'),
  ('btc-q06-02','Mining secures the shared ledger and settlement history, while many economic transfers can be batched, custodial, or performed on higher layers.'),
  ('btc-q06-03','Majority hash power can censor or reorganise recent transactions while sustained, but it cannot forge valid signatures or force nodes to accept invalid supply.'),
  ('btc-q06-04','Many losses arise at the human and institutional edges: phishing, fraudulent schemes, leverage, poor custody, and misleading promotion.'),
  ('btc-q06-05','The protocol is global, but countries regulate exchanges, custody, promotion, taxation, payments, and other activities in different ways.'),

  ('btc-final-01','Bitcoin is best described narrowly as a distributed protocol and bearer asset governed by independently verifiable rules; that description does not promise investment returns.'),
  ('btc-final-02','Combining inputs is evidence of possible common control, but collaborative transactions and other techniques make it a heuristic rather than proof of one legal owner.'),
  ('btc-final-03','Full nodes verify blocks and transactions against the rules they accept, limiting the need to trust miners or a central ledger operator.'),
  ('btc-final-04','A changed rule becomes economically meaningful only if the relevant network adopts it; editing one copy of the software or mining one invalid block is insufficient.'),
  ('btc-final-05','A responsible forecast states a condition and a plausible consequence; it does not turn a halving, proposal, or narrative into a guaranteed outcome.'),
  ('btc-final-06','Custody design should begin with a threat model and deliberately allocate authority, recovery options, operating procedures, and independent checks.'),
  ('btc-final-07','Institutional wrappers can simplify access while adding reliance on custodians, product rules, fees, counterparties, and the surrounding legal structure.'),
  ('btc-final-08','Lightning may expand economic activity while still requiring base-layer transactions for channel opening, closing, rebalancing, and dispute settlement.'),
  ('btc-final-09','Proposal, implementation, deployment, activation, and adoption describe different evidence states; none should be inferred merely from the existence of a document.'),
  ('btc-final-10','Credible energy analysis discloses estimation limits, generation mix, local effects, comparison choices, and the value judgement behind the conclusion.'),
  ('btc-final-11','A quantum transition would involve cryptographic choices, software deployment, user migration, exposed keys, dormant coins, and broad consensus coordination.'),
  ('btc-final-12','Bitcoin''s future is conditional on engineering, incentives, custody, regulation, energy, and user behaviour, so a single inevitable destination or precise price is not evidence-led.')
)
UPDATE `quiz_questions`
SET `explanation`=(
  SELECT `feedback`.`explanation`
  FROM `feedback`
  WHERE `feedback`.`id`=replace(`quiz_questions`.`id`,'cognizen-','')
)
WHERE `quiz_id` IN (
  SELECT q.`id`
  FROM `quizzes` q
  JOIN `lessons` l ON l.`id`=q.`lesson_id`
  WHERE l.`course_id` IN (
    'stefan-bitcoin-genesis-next-era',
    'cognizen-bitcoin-intelligence-draft'
  )
)
AND EXISTS (
  SELECT 1 FROM `feedback`
  WHERE `feedback`.`id`=replace(`quiz_questions`.`id`,'cognizen-','')
);
--> statement-breakpoint
UPDATE `courses`
SET `updated_at`=1784586000000
WHERE `id` IN (
  'stefan-bitcoin-genesis-next-era',
  'cognizen-bitcoin-intelligence-draft'
);
