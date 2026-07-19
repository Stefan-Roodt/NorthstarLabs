export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  lessonCount: number;
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
    id: "launch-your-first-online-course",
    title: "Launch Your First Online Course",
    description: "Turn one teachable idea into a focused course people can understand, finish, and recommend.",
    priceCents: 0,
    lessonCount: 6,
    creator: "NorthstarLabs Studio",
    schoolId: "northstarlabs",
    schoolName: "NorthstarLabs",
    schoolSlug: "northstarlabs",
    category: "Course creation",
    duration: "90 minutes",
    level: "Beginner",
    format: "Self-paced",
    artClass: "course-art-launch",
    promise: "Leave with a clear promise, a six-lesson curriculum, and a launch plan you can execute this week.",
    outcomes: [
      "Choose a specific learner and outcome",
      "Shape your expertise into a finishable curriculum",
      "Create a minimum viable launch plan",
      "Measure whether learners are getting results",
    ],
    audience: [
      "Experts creating their first paid or free course",
      "Coaches turning repeat advice into a programme",
      "Training teams validating a new learning offer",
    ],
    curriculum: [
      { title: "Find the transformation", description: "Define the learner, problem, and result your course is responsible for." },
      { title: "Write a clear course promise", description: "Turn the transformation into a specific, credible reason to enrol." },
      { title: "Design the shortest useful path", description: "Sequence six practical lessons around action rather than information." },
      { title: "Create lessons people finish", description: "Use a repeatable structure for explanation, example, action, and reflection." },
      { title: "Prepare a minimum viable launch", description: "Choose your first audience, invitation, and feedback loop." },
      { title: "Measure learning and improve", description: "Track progress, completion, questions, and evidence of learner success." },
    ],
  },
  {
    id: "price-your-expertise",
    title: "Price Your Expertise",
    description: "Build a simple, defensible price for your course without guessing, copying competitors, or undercutting your value.",
    priceCents: 0,
    lessonCount: 5,
    creator: "NorthstarLabs Studio",
    schoolId: "northstarlabs",
    schoolName: "NorthstarLabs",
    schoolSlug: "northstarlabs",
    category: "Creator business",
    duration: "75 minutes",
    level: "Beginner",
    format: "Self-paced",
    artClass: "course-art-pricing",
    promise: "Finish with a pricing range, a value story, and a launch offer that feels fair to you and your learners.",
    outcomes: [
      "Separate content volume from learner value",
      "Estimate delivery cost and support load",
      "Set a confident pricing range",
      "Explain the offer without pressure tactics",
    ],
    audience: [
      "Creators preparing a first paid learning product",
      "Educators moving beyond hourly pricing",
      "Teams packaging internal expertise for customers",
    ],
    curriculum: [
      { title: "Price the result, not the files", description: "Understand what learners are truly paying to achieve." },
      { title: "Calculate your delivery floor", description: "Account for support, tools, time, and the cost of a good experience." },
      { title: "Choose a pricing position", description: "Match price, learner commitment, access, and depth of transformation." },
      { title: "Build the value story", description: "Describe the offer with evidence, boundaries, and clear expectations." },
      { title: "Test and refine", description: "Use a small founding cohort to learn before scaling the offer." },
    ],
  },
  {
    id: "build-a-learning-community",
    title: "Build a Learning Community",
    description: "Create a community rhythm that helps members participate, learn from one another, and keep making progress.",
    priceCents: 0,
    lessonCount: 6,
    creator: "NorthstarLabs Studio",
    schoolId: "northstarlabs",
    schoolName: "NorthstarLabs",
    schoolSlug: "northstarlabs",
    category: "Community",
    duration: "2 hours",
    level: "Intermediate",
    format: "Self-paced",
    artClass: "course-art-community",
    promise: "Design a purposeful member journey, weekly rhythm, and moderation approach without manufacturing constant activity.",
    outcomes: [
      "Define why the community should exist",
      "Create a useful first-week member journey",
      "Plan repeatable participation rituals",
      "Moderate with clear, human boundaries",
    ],
    audience: [
      "Course creators adding peer learning",
      "Membership owners improving participation",
      "Customer education teams building an academy",
    ],
    curriculum: [
      { title: "Give the community one job", description: "Anchor participation to a clear member outcome." },
      { title: "Design the first seven days", description: "Help new members understand, introduce themselves, and take one useful action." },
      { title: "Create participation rituals", description: "Use prompts, reviews, office hours, and celebrations that members recognise." },
      { title: "Connect discussion to learning", description: "Bring course progress, questions, and peer examples into the community." },
      { title: "Moderate for trust", description: "Set expectations, respond consistently, and protect member attention." },
      { title: "Measure useful participation", description: "Track contribution quality, returning members, and progress—not noise." },
    ],
  },
  {
    id: "design-lessons-people-remember",
    title: "Design Lessons People Remember",
    description: "Use practical learning science to reduce overload, build useful practice, improve feedback, and help learners retain what matters.",
    priceCents: 0,
    lessonCount: 6,
    creator: "NorthstarLabs Studio",
    schoolId: "northstarlabs",
    schoolName: "NorthstarLabs",
    schoolSlug: "northstarlabs",
    category: "Learning design",
    duration: "2 hours",
    level: "Intermediate",
    format: "Self-paced + knowledge check",
    artClass: "course-art-memory",
    promise: "Redesign one real lesson using observable outcomes, worked examples, retrieval, spacing, inclusive access, and actionable feedback.",
    outcomes: [
      "Write observable performance outcomes",
      "Reduce cognitive friction without lowering standards",
      "Use worked examples and fade support",
      "Plan retrieval, spacing, and useful feedback",
    ],
    audience: [
      "Course creators improving completion and retention",
      "Tutors who want stronger lesson structure",
      "Training teams building evidence-informed learning",
    ],
    curriculum: [
      { title: "Start with evidence of performance", description: "Define the real action, standard, and evidence the lesson must produce." },
      { title: "Reduce overload without reducing the standard", description: "Remove avoidable friction and make the next learner action visible." },
      { title: "Teach with examples, then fade the support", description: "Expose expert reasoning and move deliberately towards independence." },
      { title: "Use retrieval to strengthen memory", description: "Build low-stakes recall and correction into the learning journey." },
      { title: "Space practice and vary the context", description: "Plan deliberate returns that make learning more durable and transferable." },
      { title: "Build an inclusive lesson quality plan", description: "Complete a practical capstone and evidence-informed knowledge check." },
    ],
  },
  {
    id: "build-a-trusted-tutoring-practice",
    title: "Build a Trusted Tutoring Practice",
    description: "Create a credible tutor offer, diagnose learner needs, run focused sessions, communicate progress, and put safeguarding first.",
    priceCents: 0,
    lessonCount: 6,
    creator: "NorthstarLabs Studio",
    schoolId: "northstarlabs",
    schoolName: "NorthstarLabs",
    schoolSlug: "northstarlabs",
    category: "Tutoring",
    duration: "2 hours 10 minutes",
    level: "Beginner",
    format: "Self-paced + knowledge check",
    artClass: "course-art-tutoring",
    promise: "Leave with a focused tutor offer, diagnostic process, repeatable session plan, safeguarding checklist, and progress-reporting rhythm.",
    outcomes: [
      "Position tutoring services credibly",
      "Diagnose needs and decide responsible fit",
      "Structure sessions around learner thinking",
      "Build safeguarding and progress practices",
    ],
    audience: [
      "New independent tutors",
      "Teachers beginning one-to-one services",
      "Academies onboarding tutors consistently",
    ],
    curriculum: [
      { title: "Choose the learner and problem you serve", description: "Define responsible fit, boundaries, and a credible progress promise." },
      { title: "Create a profile that earns trust", description: "Present evidence, price boundaries, and a clear next step." },
      { title: "Run a diagnostic first conversation", description: "Understand the need, establish a baseline, and accept or refer responsibly." },
      { title: "Structure a session around learner thinking", description: "Move from evidence and modelling to independent learner performance." },
      { title: "Put safeguarding and professional boundaries first", description: "Create safer communication, session, recording, and reporting procedures." },
      { title: "Show progress and improve the practice", description: "Build an operating pack and complete the tutor knowledge check." },
    ],
  },
  {
    id: "teach-with-ai-responsibly",
    title: "Teach With AI Responsibly",
    description: "Use generative AI with human judgement, privacy safeguards, verification habits, and learning activities that preserve learner agency.",
    priceCents: 0,
    lessonCount: 6,
    creator: "NorthstarLabs Studio",
    schoolId: "northstarlabs",
    schoolName: "NorthstarLabs",
    schoolSlug: "northstarlabs",
    category: "AI for educators",
    duration: "2 hours 10 minutes",
    level: "All levels",
    format: "Self-paced + knowledge check",
    artClass: "course-art-ai",
    promise: "Finish with a human-centred AI activity plan covering learning value, privacy, verification, access, disclosure, and accountability.",
    outcomes: [
      "Decide when AI adds genuine learning value",
      "Protect privacy, rights, and learner agency",
      "Prompt for coaching rather than answer generation",
      "Verify outputs for accuracy, bias, and access",
    ],
    audience: [
      "Educators exploring generative AI",
      "Course creators setting responsible usage rules",
      "Training teams reviewing AI-enabled activities",
    ],
    curriculum: [
      { title: "Decide when AI belongs in the learning", description: "Use a human-first benefit, risk, control, and accountability decision." },
      { title: "Understand what a language model can and cannot do", description: "Build calibrated trust through generation, verification, adaptation, and approval." },
      { title: "Protect privacy, rights, and learner agency", description: "Apply data minimisation, consent, authorship, and meaningful learner choice." },
      { title: "Prompt for learning, not answer vending", description: "Design progressive help that preserves productive learner thinking." },
      { title: "Verify outputs for accuracy, bias, and access", description: "Run explicit checks and use clear stop-and-escalation rules." },
      { title: "Write a responsible AI learning plan", description: "Complete a twelve-part activity plan and knowledge check." },
    ],
  },
];

export function getStarterCourse(id: string): StarterCourse | undefined {
  return starterCourses.find((course) => course.id === id);
}
