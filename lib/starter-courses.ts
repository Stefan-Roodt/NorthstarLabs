export type CatalogCourse = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  lessonCount: number;
  creator: string;
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
];

export function getStarterCourse(id: string): StarterCourse | undefined {
  return starterCourses.find((course) => course.id === id);
}
