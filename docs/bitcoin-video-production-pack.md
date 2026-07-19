# Bitcoin: From Genesis to the Next Era — video production pack

The 21 video lessons in `drizzle/0019_stefan_bitcoin_deep_dive.sql` are designed
as calm, six-minute explainers. Their transcript fields are the approved
narration and accessible caption source.

## Six-minute episode grammar

- `00:00–00:25` — a misconception, decision, or historical question
- `00:25–01:10` — the learner outcome and one mental model
- `01:10–03:30` — a worked diagram or primary-source walkthrough
- `03:30–04:35` — the strongest limitation or counterargument
- `04:35–05:25` — a pause-and-apply prompt
- `05:25–06:00` — three takeaways and the next lesson

Narration should leave room for visual reading and deliberate pauses. Do not
speed-read the transcript to fill the runtime.

## Visual system

- Background: deep charcoal `#111315`
- Bitcoin accent: `#f7931a`
- Evidence blue: `#4d8fe8`
- Risk amber: `#f2b84b`
- Text: warm white `#f5f1e8`
- Typeface: a legible grotesk for explanation and a monospace face only for
  hashes, transaction fields, block heights, and code

Use diagrams and real primary-source excerpts. Avoid coin piles, rockets,
trading-chart wallpaper, anonymous hooded figures, and price-prediction imagery.
Every chart needs a source, date, unit, and visible uncertainty.

## Episode visual briefs

1. **The problem Bitcoin tried to solve** — duplicate one digital coin into two
   payments, then show a central ledger resolving it before replacing the centre
   with signatures, blocks, proof, nodes, and incentives.
2. **The cypherpunk lineage** — animate a provenance map from public-key
   cryptography, Chaum, Hashcash, b-money, Bit Gold, and peer-to-peer networks
   into the Bitcoin synthesis. Label contribution, not authorship.
3. **Whitepaper, Genesis, and launch** — use a dated source timeline, a restrained
   Genesis coinbase excerpt, the v0.1 announcement, and the first transaction.
   Visually separate documented fact from interpretation.
4. **UTXOs, not balances** — break 110,000 sats of selected inputs into a 75,000
   sat payment, 34,000 sat change output, and 1,000 sat fee.
5. **Keys, addresses, and Script** — show an address creating an output condition,
   a signature satisfying it, an HD key tree, and a two-of-three recovery policy.
6. **Blocks, proof of work, and difficulty** — build an 80-byte block header,
   sweep candidate hashes toward the target, then compress 2,016 blocks into the
   difficulty adjustment.
7. **Nodes, consensus, and finality** — place wallet, node, miner, and economic
   actor in separate lanes. Reject an invalid high-subsidy block at the node lane.
8. **The 21 million schedule** — animate the subsidy staircase and geometric
   series. Keep price entirely off-screen; place uncertain miner economics beside
   the fixed issuance rule.
9. **Mining economics and pools** — move from ASIC to hasher, pool, candidate
   block, and payout. Split ownership concentration from template coordination.
10. **Fees and the security budget** — demonstrate sat/vB, RBF, CPFP, and a
    parent-child cluster, then open the unresolved subsidy-to-fee transition.
11. **Custody architectures** — compare single key, hardware signer, two-of-three
    multisig, collaborative custody, and exchange liability against the same
    threat model.
12. **Markets and wrappers** — stack native UTXO, exchange claim, ETP share,
    derivative, and wrapped token. Show exactly where keys and redemption sit.
13. **Privacy and fungibility** — trace address reuse and common-input heuristics,
    then contrast fresh receive addresses, coin control, node privacy, Lightning,
    and Silent Payments.
14. **SegWit to Taproot** — show the activation ladder and the exact problem each
    upgrade addressed. Reveal one Taproot script leaf while keeping unused paths
    hidden.
15. **Lightning** — open a channel, exchange three off-chain commitment states,
    route one conditional payment through an intermediary, and close on-chain.
16. **The proposal frontier** — place BIP 119, 118, 352, MuSig2, Miniscript, and
    post-quantum work on a visible status ladder. Never animate draft as activated.
17. **Energy and emissions** — distinguish GW, TWh, energy source, and emissions.
    Visualise the Cambridge lower, upper, and best-guess methodology as ranges.
18. **Centralisation and attacks** — build a layered threat map for hash power,
    pools, software, network, custody, funding, and governance. Constrain every
    attack description to what it can and cannot do.
19. **Regulation and political adoption** — map protocol, self-custody, exchange,
    ETP, miner, and government reserve into separate legal surfaces. Include dates
    and make policy reversibility visible.
20. **The engineering direction in 2026** — show deployed evidence from Core 31,
    BIP 324, descriptors, MuSig2, Lightning Taproot channels, and active wallet
    work. Put proposals in a clearly separate panel.
21. **Four credible futures** — develop reserve collateral, open payments,
    regulated rail, and fragmented niche as scenario cards with leading
    indicators—not price targets.

## 50-second course trailer

> Bitcoin began as a nine-page proposal for peer-to-peer electronic cash. It is
> now a global network, a scarce bearer asset, a mining industry, a payment
> protocol, and an institutional market. But what did it actually inherit from
> the cypherpunks? Who enforces the 21 million limit? Can fees secure the network?
> Can Lightning make bitcoin useful for everyday payments? And what happens when
> regulation, concentrated custody, energy constraints, or quantum computing
> challenge the system? In this course, you will inspect the evidence, audit real
> transactions without spending money, read Bitcoin proposals correctly, and
> build credible 2036 scenarios without a single price prediction. Learn Bitcoin
> deeply enough to explain both its promise and its limits.

## Quality and accessibility checklist

- Record at 1080p, 16:9, with clear speech and no music beneath explanation.
- Display source title, publisher, URL, and access date for every excerpt.
- Use transcripts as editable captions; check names, BIP numbers, units, and
  block terminology manually.
- Never display a real seed phrase, private key, wallet balance, receive address,
  or transaction approval.
- Describe diagrams in narration and do not encode status by colour alone.
- Upload through the academy media library and attach the correct asset to each
  matching video lesson.
- Confirm each runtime is approximately six minutes before enabling the seeded
  80% watch requirement.
- Test every lesson and quiz in learner preview on desktop and mobile.
- Recheck current release and proposal status immediately before course launch.
