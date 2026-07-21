export type SearchLandingPage = {
  slug: string;
  eyebrow: string;
  shortTitle: string;
  title: string;
  metaTitle: string;
  description: string;
  lead: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  chips: string[];
  problemHeading: string;
  problemText: string;
  fitItems: Array<{ title: string; text: string }>;
  route: Array<{ label: string; title: string; text: string }>;
  decisionTitle: string;
  decisionIntro: string;
  checklist: string[];
  proofNote: string;
  faqs: Array<{ question: string; answer: string }>;
  related: string[];
};

const creatorSignup = "/login?mode=signup&role=creator&next=%2Fwelcome%3Fpath%3Dcreator";
const coachSignup = "/login?mode=signup&role=coach&next=%2Fwelcome%3Fpath%3Dcoach";

export const searchLandingPages: SearchLandingPage[] = [
  {
    slug: "online-courses-south-africa",
    eyebrow: "ONLINE COURSES IN SOUTH AFRICA",
    shortTitle: "Online courses in South Africa",
    title: "Online courses that help you do something useful next.",
    metaTitle: "Online Courses in South Africa",
    description: "Explore practical online courses in South Africa with saved progress, assessments, certificates, live learning, and access to human coaching.",
    lead: "NorthstarLabs combines structured online learning with the option to ask a real coach when the difficult part becomes personal. Start with a free course, keep your progress, and move toward evidence you can use.",
    primary: { label: "Explore practical courses", href: "/courses" },
    secondary: { label: "Find my best next step", href: "/find" },
    chips: ["Free courses available", "Prices in rand", "Learn on mobile", "Human help when needed"],
    problemHeading: "A long course list is not the same as a useful learning decision.",
    problemText: "The right course should fit the result you want, your starting point, the time you have, and the proof you need at the end. NorthstarLabs makes those decisions visible and keeps coaching close when a video is not enough.",
    fitItems: [
      { title: "Start from the outcome", text: "Search by the job, project, decision, or capability you want to improve—not only by a broad category." },
      { title: "Know what you are getting", text: "Compare the learning promise, lesson structure, expected effort, assessments, certificate, and available support." },
      { title: "Keep moving when stuck", text: "Move from a self-paced course to a relevant coach, live session, or community conversation without starting over." },
    ],
    route: [
      { label: "LEARN", title: "Build the foundation", text: "Follow short, structured lessons and complete useful checks or projects." },
      { label: "ASK", title: "Resolve the roadblock", text: "Find a coach by topic when you need feedback, context, or a judgment call." },
      { label: "PROGRESS", title: "Keep useful evidence", text: "Save completion, assessment results, feedback, and certificates under one account." },
    ],
    decisionTitle: "How to choose a credible online course",
    decisionIntro: "Before enrolling, check whether the course makes these points clear. If it does not, keep looking.",
    checklist: [
      "A specific outcome rather than a vague promise",
      "A visible curriculum and realistic time commitment",
      "An identifiable creator or academy",
      "Assessments or practical work that match the outcome",
      "Clear pricing, access, support, and completion rules",
      "A next step when self-paced learning is not enough",
    ],
    proofNote: "NorthstarLabs currently offers free account creation and practical starter courses. Paid upgrades remain unavailable until live billing completes final activation and transaction testing.",
    faqs: [
      { question: "Can I take a NorthstarLabs course for free?", answer: "Yes. Free starter courses and free account creation are available now. Each course page shows its price and access terms before enrolment." },
      { question: "Do courses include certificates?", answer: "Courses can include completion rules, quizzes, and verifiable certificates. The individual course page should state exactly what completion requires." },
      { question: "Can I learn on my phone?", answer: "Yes. The public catalogue and learner experience adapt to phones, tablets, and desktop screens." },
      { question: "What if I cannot find my topic?", answer: "Submit a detailed learning request. NorthstarLabs will check the course catalogue and coach network and respond honestly if no credible match is available." },
    ],
    related: ["find-business-coach-south-africa", "bitcoin-web3-courses", "corporate-training-platform"],
  },
  {
    slug: "find-business-coach-south-africa",
    eyebrow: "FIND A BUSINESS COACH IN SOUTH AFRICA",
    shortTitle: "Find a business coach",
    title: "Find a coach for the actual roadblock—not a generic pep talk.",
    metaTitle: "Find a Business Coach in South Africa",
    description: "Find a business coach in South Africa by topic. Compare rates, credentials, availability, session formats, and verified-session learner reviews.",
    lead: "Search by the problem you are trying to solve, compare visible evidence, and contact a relevant coach without publishing your details. Each coach controls their own hourly rate and availability.",
    primary: { label: "Search coaches by topic", href: "/tutors" },
    secondary: { label: "Describe what I need", href: "/find" },
    chips: ["Self-set hourly rates", "Search by topic", "Visible availability", "Verified-session reviews"],
    problemHeading: "The hardest part is not finding someone who calls themselves a coach.",
    problemText: "It is deciding whether their experience fits your decision, whether the rate is clear, and whether the proof can be trusted. NorthstarLabs separates paid visibility from credential review and labels sponsored placement openly.",
    fitItems: [
      { title: "Topic fit first", text: "Search for the specific area you need to investigate: strategy, entrepreneurship, leadership, finance, operations, marketing, or another defined topic." },
      { title: "Compare before enquiring", text: "Review the coach’s headline, experience, qualifications, rate, session mode, location, languages, and available times." },
      { title: "Trust signals stay separate", text: "Advertising can improve placement, but it cannot purchase credential verification or a positive learner review." },
    ],
    route: [
      { label: "DEFINE", title: "Name the decision", text: "Explain the outcome, obstacle, context, and urgency in practical language." },
      { label: "COMPARE", title: "Shortlist credible fit", text: "Use topic match, evidence, rate, availability, and verified learner proof." },
      { label: "ENQUIRE", title: "Request the right session", text: "Send a protected enquiry or request an available time without exposing personal details publicly." },
    ],
    decisionTitle: "Questions worth asking before you book",
    decisionIntro: "A credible coach should be comfortable answering these clearly and without exaggerated promises.",
    checklist: [
      "What specific problems do you help people solve?",
      "What experience is most relevant to my situation?",
      "What should I prepare before the first session?",
      "What can realistically be achieved in one or three sessions?",
      "What is your hourly rate and cancellation policy?",
      "How will we know whether the session was useful?",
    ],
    proofNote: "NorthstarLabs coaches publish their own rates and availability. Featured placement is paid advertising; verification and verified-session reviews are assessed separately.",
    faqs: [
      { question: "Does NorthstarLabs set the coach’s hourly rate?", answer: "No. Each coach sets their own rate in rand and controls their availability and session format." },
      { question: "Are all coaches verified?", answer: "No. Verification is shown as a separate trust signal when supporting credentials have been reviewed. A paid listing tier does not create verification." },
      { question: "How do reviews work?", answer: "Learner reviews can be limited to verified sessions. NorthstarLabs also supports protected two-way ratings after a completed session." },
      { question: "Can I ask NorthstarLabs to find someone?", answer: "Yes. If the marketplace has no suitable match, submit a detailed request and NorthstarLabs will look across the current coach network." },
    ],
    related: ["online-courses-south-africa", "become-a-coach", "corporate-training-platform"],
  },
  {
    slug: "bitcoin-web3-courses",
    eyebrow: "BITCOIN AND WEB3 COURSES",
    shortTitle: "Bitcoin and Web3 courses",
    title: "Understand Bitcoin before you try to predict it.",
    metaTitle: "Bitcoin and Web3 Courses",
    description: "Learn Bitcoin and Web3 from first principles: origins, monetary design, mining, custody, risks, regulation, and the questions shaping what comes next.",
    lead: "NorthstarLabs courses are designed to separate the technology, monetary argument, market behaviour, and speculation. Learn in short modules, test your understanding, and ask a relevant coach when the implications become specific to your work.",
    primary: { label: "Explore Bitcoin courses", href: "/courses" },
    secondary: { label: "Build my learning route", href: "/find" },
    chips: ["First-principles learning", "Short focused modules", "Risk-aware", "No guaranteed-return claims"],
    problemHeading: "Bitcoin is usually explained by people who want you to buy it—or dismiss it.",
    problemText: "A useful course should make the strongest case on both sides. It should explain where Bitcoin came from, how the network works, what ownership really means, why people value it, where it can fail, and which future claims remain uncertain.",
    fitItems: [
      { title: "Origins and incentives", text: "Study the cypherpunk context, the double-spend problem, the 2008 white paper, issuance, scarcity, and the incentives securing the network." },
      { title: "Ownership and operation", text: "Understand keys, addresses, wallets, custody, transactions, mining, nodes, fees, privacy, and the trade-offs users accept." },
      { title: "Evidence and uncertainty", text: "Separate measurable network facts from adoption forecasts, price narratives, policy claims, and personal risk tolerance." },
    ],
    route: [
      { label: "FOUNDATION", title: "Learn what Bitcoin is", text: "Build a mental model of the ledger, consensus, mining, supply, and self-custody." },
      { label: "CONTEXT", title: "Examine where it came from", text: "Connect Bitcoin to monetary history, cryptography, internet culture, and financial infrastructure." },
      { label: "JUDGMENT", title: "Assess where it may go", text: "Compare adoption paths, regulation, scaling, energy, security, and competing scenarios." },
    ],
    decisionTitle: "A high-quality Bitcoin course should cover",
    decisionIntro: "Avoid courses that rely on price excitement, unexplained jargon, or certainty about the future.",
    checklist: [
      "The problem Bitcoin was designed to solve",
      "Proof of work, nodes, mining, and consensus",
      "The issuance schedule and monetary argument",
      "Wallets, private keys, custody, and operational risk",
      "Scaling, fees, privacy, energy, and regulation",
      "Bull, bear, and neutral future scenarios",
    ],
    proofNote: "NorthstarLabs provides education, not financial advice. No course or coach should promise returns or treat uncertain price forecasts as facts.",
    faqs: [
      { question: "Do I need technical knowledge before starting?", answer: "No. An introductory course should explain the network in plain language before adding technical depth." },
      { question: "Will the course tell me whether to buy Bitcoin?", answer: "No. The purpose is to improve your understanding and judgment. Investment decisions depend on your circumstances and may require regulated financial advice." },
      { question: "Is Bitcoin the same as Web3?", answer: "No. Bitcoin is a specific monetary network and asset. Web3 is a broader and contested label covering decentralised applications, tokens, smart contracts, and related infrastructure." },
      { question: "Can I ask someone about my industry or business?", answer: "Yes. Use the coach marketplace to look for relevant expertise, or submit a detailed request if no credible match is listed." },
    ],
    related: ["online-courses-south-africa", "find-business-coach-south-africa", "corporate-training-platform"],
  },
  {
    slug: "become-a-coach",
    eyebrow: "BECOME A NORTHSTAR COACH",
    shortTitle: "Become a Northstar coach",
    title: "Make your expertise findable when someone genuinely needs it.",
    metaTitle: "Become an Online Coach",
    description: "Create a searchable NorthstarLabs coach profile, set your own hourly rate, show credentials and availability, and receive protected learner enquiries.",
    lead: "NorthstarLabs gives coaches a public, topic-led profile inside a wider learning platform. Learners can discover your expertise after a course, through search, or when they describe a specific roadblock.",
    primary: { label: "Create my coach profile", href: coachSignup },
    secondary: { label: "See the coach marketplace", href: "/tutors" },
    chips: ["Set your own rate", "Choose your topics", "Control availability", "Pause when you are full"],
    problemHeading: "A credible coaching profile needs more than a portrait and a motivational sentence.",
    problemText: "Learners need enough detail to decide whether you fit their problem. NorthstarLabs helps you publish specific topics, evidence, rates, session modes, availability, and boundaries—then keeps paid placement visibly separate from trust.",
    fitItems: [
      { title: "Listed — R149/month", text: "A searchable public profile, topic visibility, private enquiries, and bookable availability." },
      { title: "Featured — R349/month", text: "Priority topic placement, a clear Featured label, and an enquiry performance summary." },
      { title: "Spotlight — R699/month", text: "Sponsored top-of-search rotation, a Spotlight label, and launch support for greater visibility." },
    ],
    route: [
      { label: "POSITION", title: "Name the problems you solve", text: "Use specific searchable topics and a practical headline instead of broad claims." },
      { label: "PROVE", title: "Add credible evidence", text: "Show relevant experience, qualifications, languages, location, and session format." },
      { label: "PUBLISH", title: "Set your rate and availability", text: "Choose a visibility tier, publish when ready, and pause the profile whenever you are full." },
    ],
    decisionTitle: "What makes a coach profile convert",
    decisionIntro: "The strongest profiles reduce uncertainty before the first enquiry.",
    checklist: [
      "A precise headline focused on the learner’s problem",
      "Specific topics rather than a long generic skills list",
      "A clear hourly rate in rand",
      "Relevant evidence and separately reviewed credentials",
      "Current availability and realistic session formats",
      "An honest description of what coaching can and cannot do",
    ],
    proofNote: "No advertising charge is taken today. Billing for coach listing tiers is not active yet; NorthstarLabs will ask for confirmation before billing begins.",
    faqs: [
      { question: "Can I choose my own hourly rate?", answer: "Yes. You control the rate, availability, session mode, and the topics attached to your profile." },
      { question: "Does it cost to list as a coach?", answer: "No. Every coach can create a standard profile, appear in relevant searches, set an hourly rate, and receive enquiries for free. Independently approved coaches may optionally activate Northstar Verified exposure for R200 per month; payment never buys verification." },
      { question: "Can I buy a verified badge?", answer: "No. Credential verification is reviewed separately from advertising and cannot be purchased through a higher listing tier." },
      { question: "Can I pause my profile?", answer: "Yes. You can keep a profile as a private draft, publish it when ready, and pause it when your availability changes." },
    ],
    related: ["find-business-coach-south-africa", "create-and-sell-online-course", "corporate-training-platform"],
  },
  {
    slug: "create-and-sell-online-course",
    eyebrow: "CREATE AND SELL AN ONLINE COURSE",
    shortTitle: "Create and sell an online course",
    title: "Turn expertise into a learning product people can finish.",
    metaTitle: "Create and Sell an Online Course",
    description: "Create an online course with structured lessons, protected video, quizzes, certificates, community, coaching, learner progress, and a branded storefront.",
    lead: "Build the curriculum, publish it inside a branded academy, support learners, and improve the course from real progress signals. Start creating free before deciding whether a paid platform plan is worth it.",
    primary: { label: "Open my creator workspace", href: creatorSignup },
    secondary: { label: "See a live course catalogue", href: "/courses" },
    chips: ["Start free", "Protected media", "Quizzes and certificates", "Learner reporting"],
    problemHeading: "Uploading videos is the easy part. Designing a course people finish is the real work.",
    problemText: "A learning business needs a clear promise, structured path, useful assessments, learner support, progress visibility, and a professional place to return to. NorthstarLabs connects those pieces instead of leaving creators with a folder of videos and several unrelated tools.",
    fitItems: [
      { title: "Build the learning path", text: "Create sections and lessons with text, protected video, audio, images, downloads, quizzes, prerequisites, and completion rules." },
      { title: "Package the offer", text: "Use a branded academy and combine courses with bundles, memberships, live sessions, community, or personal coaching." },
      { title: "Operate with evidence", text: "Manage access, review progress, support individual learners, export records, and see where the course needs improvement." },
    ],
    route: [
      { label: "DESIGN", title: "Define the transformation", text: "Choose the learner, starting point, promised outcome, evidence, and scope." },
      { label: "BUILD", title: "Create the minimum useful path", text: "Write focused lessons, add media only where it helps, and check understanding." },
      { label: "LAUNCH", title: "Publish, support, improve", text: "Preview the learner experience, publish clearly, invite learners, and respond to real progress data." },
    ],
    decisionTitle: "What to prepare before opening the editor",
    decisionIntro: "You do not need a finished course. These six decisions are enough to begin with clarity.",
    checklist: [
      "The specific learner you want to help",
      "The result they should achieve",
      "The shortest credible sequence of lessons",
      "The project, quiz, or evidence that proves progress",
      "Where learners are likely to need human support",
      "What belongs in the first version—and what can wait",
    ],
    proofNote: "Course creation and free accounts are available now. Paid plan upgrades and paid course checkout remain subject to final live-billing activation and transaction testing.",
    faqs: [
      { question: "Can I start building without paying?", answer: "Yes. Open a free creator account, create an academy workspace, and begin a course draft without entering payment details." },
      { question: "What lesson formats can I use?", answer: "Courses can include text, protected video, audio, images, downloads, quizzes, prerequisites, transcripts, and completion requirements." },
      { question: "Can I combine a course with coaching?", answer: "Yes. NorthstarLabs is designed to connect self-paced learning with coach profiles, live sessions, community, bundles, and memberships." },
      { question: "Is payment processing live?", answer: "Not yet. Paid upgrades and checkout remain disabled until live billing completes final activation and transaction testing." },
    ],
    related: ["become-a-coach", "corporate-training-platform", "online-courses-south-africa"],
  },
  {
    slug: "corporate-training-platform",
    eyebrow: "CORPORATE TRAINING PLATFORM",
    shortTitle: "Corporate training platform",
    title: "Give workplace learning a clear owner, path, and evidence.",
    metaTitle: "Corporate Training Platform",
    description: "Build customer, employee, partner, or member training with structured courses, protected media, live learning, coaching, progress, certificates, and reporting.",
    lead: "NorthstarLabs helps a small training team turn expertise into a repeatable programme while keeping human support available for the decisions that cannot be standardised.",
    primary: { label: "Build a training workspace", href: creatorSignup },
    secondary: { label: "Tell us what the team needs", href: "/#request-help" },
    chips: ["Branded academy", "Access management", "Progress reporting", "Live and coached learning"],
    problemHeading: "Training fails when content delivery is mistaken for capability.",
    problemText: "A video library can distribute information. A working training system also defines the outcome, guides the sequence, checks understanding, gives people somewhere to ask, and shows administrators where support is needed.",
    fitItems: [
      { title: "One learner experience", text: "Bring courses, protected media, live sessions, community, coaching, assessments, and certificates into one branded place." },
      { title: "Operational control", text: "Invite learners, manage access, view progress and completion, keep support notes, export records, and maintain an audit trail." },
      { title: "Useful for more than employees", text: "Create onboarding, customer education, partner enablement, compliance support, membership learning, or leadership programmes." },
    ],
    route: [
      { label: "ALIGN", title: "Define the business outcome", text: "Connect the programme to a capability, behaviour, customer result, or operational risk." },
      { label: "DELIVER", title: "Blend scalable and human help", text: "Use courses for the repeatable path and live or coached support for contextual decisions." },
      { label: "IMPROVE", title: "Act on learning signals", text: "Review enrolment, progress, completion, assessment, support needs, and learner feedback." },
    ],
    decisionTitle: "Questions to answer before choosing a platform",
    decisionIntro: "The technology should fit the programme and operating model—not force the programme to fit a feature list.",
    checklist: [
      "Who owns the learning outcome and content quality?",
      "Which learners need which access, and for how long?",
      "What evidence counts as completion or competence?",
      "Where will people need live or one-to-one help?",
      "Which reports must managers actually use?",
      "What data, privacy, integration, and support boundaries apply?",
    ],
    proofNote: "NorthstarLabs includes creator administration, learner records, reporting, live learning, community, coaching, integrations, and platform operations. Confirm detailed enterprise requirements before committing to a rollout.",
    faqs: [
      { question: "Can we use our own academy brand?", answer: "Yes. NorthstarLabs supports branded academies and storefronts with their own course catalogues, identity, learner community, and support details." },
      { question: "Can administrators track learner progress?", answer: "Yes. Creator and administrative workspaces can show enrolment, lesson progress, completion, learner support notes, exports, and course performance." },
      { question: "Does NorthstarLabs support live learning?", answer: "Yes. Live 1:1 and group sessions can include schedules, joining information, capacity, recordings, calendar downloads with alarms, and learner email reminders." },
      { question: "Can it integrate with other systems?", answer: "The platform includes an integration workspace and webhook foundations. Confirm each required system and data flow before planning an enterprise deployment." },
    ],
    related: ["create-and-sell-online-course", "online-courses-south-africa", "find-business-coach-south-africa"],
  },
];

export function searchLandingPage(slug: string) {
  return searchLandingPages.find((page) => page.slug === slug);
}
