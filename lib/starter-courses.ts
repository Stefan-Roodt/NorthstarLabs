export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  lessonCount: number;
  durationMinutes?: number;
  sectionCount?: number;
  assessmentCount?: number;
  playableVideoCount?: number;
  creator: string;
  schoolId?: string;
  schoolName?: string;
  schoolSlug?: string;
};

export type StarterCourse = CatalogCourse & {
  category: string;
  duration: string;
  level: string;
  format: string;
  artClass: string;
  promise: string;
  outcomes: string[];
  audience: string[];
  curriculum: Array<{ title: string; description: string }>;
};

export const starterCourses: StarterCourse[] = [
  {
    id: "northstar-ai-command-studio",
    title: "AI Command Studio: Build Your Personal AI Operating System",
    description: "Turn generative AI from an occasional chatbot into a reliable, governed work system that saves time and improves the quality of real decisions.",
    priceCents: 0,
    lessonCount: 12,
    durationMinutes: 320,
    sectionCount: 4,
    assessmentCount: 4,
    playableVideoCount: 1,
    creator: "NorthstarLabs Studio",
    schoolId: "northstarlabs",
    schoolName: "NorthstarLabs",
    schoolSlug: "northstarlabs",
    category: "Signature programme · AI",
    duration: "5 guided hours + capstone",
    level: "Ambitious beginner to professional",
    format: "Studio labs + portfolio challenge",
    artClass: "course-art-ai",
    promise: "Leave with a working AI operating system: a task map, reusable briefs, verification protocol, automation blueprint, and a filmed proof-of-work demonstration.",
    outcomes: [
      "Diagnose where AI creates real leverage—and where it creates risk",
      "Build reusable context, prompt, and quality-control systems",
      "Turn one recurring workflow into a safe human-in-the-loop process",
      "Publish a portfolio-ready AI Operating System case study",
    ],
    audience: [
      "Professionals who want more than prompt tricks",
      "Founders and operators redesigning knowledge work",
      "Educators and consultants building responsible AI workflows",
    ],
    curriculum: [
      { title: "The 10× task audit", description: "Map one working week and find the few tasks where AI can create measurable leverage." },
      { title: "Capability without mythology", description: "Test what models can generate, transform, classify, compare, and critique—and where they fail." },
      { title: "The risk boundary", description: "Classify data, consequences, approval authority, and the work that must remain human." },
      { title: "The decision-grade brief", description: "Turn vague prompting into a reusable specification with context, constraints, evidence, and acceptance tests." },
      { title: "Context architecture", description: "Design a compact source pack that keeps outputs grounded without exposing sensitive information." },
      { title: "The verification ladder", description: "Check claims, calculations, sources, bias, omissions, and downstream consequences." },
      { title: "Build a prompt system", description: "Create modular prompts for drafting, critique, red-teaming, and final quality assurance." },
      { title: "Design the human hand-offs", description: "Assign judgement, escalation, exception handling, and final accountability." },
      { title: "Prototype one real workflow", description: "Build and test an end-to-end process using a safe, realistic case." },
      { title: "Measure the gain honestly", description: "Compare time, quality, error rate, rework, and user impact against a baseline." },
      { title: "Govern and improve", description: "Create versioning, incident, privacy, and continuous-improvement routines." },
      { title: "Capstone: the AI Operating System demo", description: "Present the problem, system, evidence, limitations, and a live before-and-after demonstration." },
    ],
  },
  {
    id: "stefan-bitcoin-genesis-next-era",
    title: "Bitcoin Intelligence: From Genesis Block to Boardroom",
    description: "An evidence-led investigation of Bitcoin’s engineering, economics, custody, governance, regulation, risks, and plausible futures—built for people who must form their own judgement.",
    priceCents: 0,
    lessonCount: 35,
    durationMinutes: 210,
    sectionCount: 7,
    assessmentCount: 7,
    playableVideoCount: 1,
    creator: "NorthstarLabs Studio",
    schoolId: "northstarlabs",
    schoolName: "NorthstarLabs",
    schoolSlug: "northstarlabs",
    category: "Signature programme · Bitcoin",
    duration: "4 guided hours + board briefing",
    level: "Foundation to strategic",
    format: "Investigations + simulations + boardroom capstone",
    artClass: "course-art-pricing",
    promise: "Leave able to explain Bitcoin without hype, interrogate the strongest claims on both sides, and deliver an evidence-backed board briefing with explicit scenarios and risks.",
    outcomes: [
      "Trace Bitcoin from its technical predecessors to today’s ecosystem",
      "Explain transactions, mining, consensus, custody, privacy, and scaling",
      "Evaluate monetary, regulatory, environmental, and security arguments",
      "Deliver a decision-grade Bitcoin intelligence briefing",
    ],
    audience: [
      "Executives and advisers who need informed judgement",
      "Curious learners tired of promotional explanations",
      "Builders, analysts, and educators seeking first-principles depth",
    ],
    curriculum: [
      { title: "The problem before Bitcoin", description: "Separate the original design problem from the myths that accumulated around it." },
      { title: "Source-verified origin investigation", description: "Build a defensible timeline from primary records and identify unsupported folklore." },
      { title: "Transactions and ownership", description: "Trace UTXOs, signatures, fees, scripts, and the difference between keys and account metaphors." },
      { title: "Mining, nodes, and consensus", description: "Model validation, proof of work, difficulty, confirmations, and the limits of each actor’s power." },
      { title: "Monetary design and security budget", description: "Interrogate issuance, scarcity, demand, fees, incentives, and long-run security." },
      { title: "Custody and market structure", description: "Compare self-custody, exchanges, funds, corporate holdings, and their distinct legal claims." },
      { title: "Privacy and surveillance", description: "Analyse public ledgers, address reuse, heuristics, privacy tools, and policy trade-offs." },
      { title: "How Bitcoin changes", description: "Study BIPs, soft forks, coordination, ossification, and the social layer behind software." },
      { title: "Scaling and Lightning", description: "Evaluate settlement layers, liquidity, channel constraints, failure recovery, and adoption conditions." },
      { title: "The strongest bear case", description: "Steelman technical, economic, environmental, governance, and regulatory objections." },
      { title: "Scenario laboratory", description: "Build conditional futures instead of price prophecy and specify evidence that would update each view." },
      { title: "Capstone: board intelligence briefing", description: "Present facts, contested claims, scenarios, risk controls, and a recommendation boundary." },
    ],
  },
  {
    id: "stefan-web3-foundations",
    title: "Web3 Product Lab: From Protocol to Proof",
    description: "A sceptical, hands-on product studio for deciding when decentralised technology earns its complexity—and designing safer systems when it does.",
    priceCents: 0,
    lessonCount: 24,
    durationMinutes: 144,
    sectionCount: 6,
    assessmentCount: 6,
    playableVideoCount: 1,
    creator: "NorthstarLabs Studio",
    schoolId: "northstarlabs",
    schoolName: "NorthstarLabs",
    schoolSlug: "northstarlabs",
    category: "Signature programme · Web3",
    duration: "2 guided hours + product defence",
    level: "Foundation to product builder",
    format: "Architecture labs + threat modelling + product defence",
    artClass: "course-art-community",
    promise: "Leave with a defensible product dossier: trust map, architecture, threat model, recovery journey, governance design, and evidence that blockchain is—or is not—the right choice.",
    outcomes: [
      "Reason clearly about ledgers, wallets, contracts, tokens, identity, and scaling",
      "Expose hidden control points and off-chain trust assumptions",
      "Design for security, privacy, recovery, accessibility, and governance",
      "Defend a responsible product decision before a sceptical review panel",
    ],
    audience: [
      "Product leaders evaluating blockchain proposals",
      "Builders who want architecture depth without token hype",
      "Entrepreneurs and analysts testing a Web3 idea responsibly",
    ],
    curriculum: [
      { title: "Web3 without the slogans", description: "Map ownership, coordination, control, and trust before choosing technology." },
      { title: "Shared state and consensus", description: "Understand what a chain can verify—and what it can never know by itself." },
      { title: "Wallet and transaction laboratory", description: "Inspect permissions, signatures, fees, finality, and safe user communication." },
      { title: "Contracts, tokens, and oracles", description: "Trace execution, upgrade power, external data, and the rights a token does not automatically confer." },
      { title: "Dapp dependency map", description: "Reveal front ends, infrastructure, storage, administrators, bridges, and exit paths." },
      { title: "Scaling and bridge trade-offs", description: "Compare rollups, sidechains, data availability, sequencers, and cross-chain risk." },
      { title: "Identity and minimum disclosure", description: "Design portable proof without turning personal information into permanent public data." },
      { title: "Threat-model the human journey", description: "Design against phishing, blind signing, unlimited approvals, and irreversible mistakes." },
      { title: "DeFi and economic risk", description: "Follow yield, leverage, liquidation, stablecoin, oracle, and governance dependencies." },
      { title: "The blockchain rejection test", description: "Prove that the design needs shared verification rather than a fashionable database." },
      { title: "Responsible product dossier", description: "Combine problem evidence, trust architecture, recovery, governance, and measurable benefit." },
      { title: "Capstone: defend the design", description: "Present the strongest case for and against the product, then defend the minimum responsible architecture." },
    ],
  },
];

export function getStarterCourse(id: string): StarterCourse | undefined {
  return starterCourses.find((course) => course.id === id);
}
