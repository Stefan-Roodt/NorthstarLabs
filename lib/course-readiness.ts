import { getLessonGuide } from "./lesson-guide.ts";

type ReadinessQuestion = {
  prompt: string;
  options: string[];
  explanation?: string;
};

type ReadinessQuiz = {
  questions: ReadinessQuestion[];
};

type ReadinessAsset = {
  id?: string | null;
  filename?: string | null;
  kind: string;
  altText?: string;
};

type ReadinessLesson = {
  id: string;
  sectionId: string;
  title: string;
  lessonType: string;
  content: string;
  videoKey?: string;
  primaryAssetId?: string | null;
  primaryAsset?: ReadinessAsset | null;
  durationMinutes: number;
  transcript: string;
  resources: unknown[];
  quiz?: ReadinessQuiz | null;
};

type ReadinessSection = {
  id: string;
  title: string;
};

type ReadinessCourse = {
  title: string;
  description: string;
  certificateTitle: string;
  pendingSourceFiles?: number;
  sections: ReadinessSection[];
  lessons: ReadinessLesson[];
};

export type CourseReadinessIssue = {
  id: string;
  level: "blocker" | "improvement";
  title: string;
  detail: string;
  action: string;
  tab: "settings" | "lesson" | "media";
  lessonId?: string;
  lessonTitle?: string;
};

export type CourseReadiness = ReturnType<typeof getCourseReadiness>;

export type CourseReadinessPayload = {
  title: string;
  description: string;
  certificateTitle: string;
  pendingSourceFiles?: number;
  sections: ReadinessSection[];
  lessons: ReadinessLesson[];
};

function wordCount(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function isPlaceholderMedia(lesson: ReadinessLesson) {
  const identifiers = [
    lesson.primaryAssetId || "",
    lesson.primaryAsset?.id || "",
    lesson.primaryAsset?.filename || "",
    lesson.videoKey || "",
  ].join(" ").toLowerCase();
  return /(^|[-_ /])(fallback|parity|placeholder)([-_ /.]|$)/.test(identifiers) ||
    /\bcmf-module-[23]-premium-track\b/.test(identifiers);
}

export function getCourseReadiness(course: ReadinessCourse) {
  const issues: CourseReadinessIssue[] = [];
  let earned = 0;
  let possible = 0;

  function check(
    condition: boolean,
    weight: number,
    issue: CourseReadinessIssue,
  ) {
    possible += weight;
    if (condition) earned += weight;
    else issues.push(issue);
  }

  check(course.title.trim().length >= 3, 3, {
    id: "course-title",
    level: "blocker",
    title: "Give the course a clear title",
    detail: "Learners need to understand what they are opening before they can trust it.",
    action: "Fix course title",
    tab: "settings",
  });
  check(course.description.trim().length >= 20, 3, {
    id: "course-description",
    level: "blocker",
    title: "Explain the learning promise",
    detail: "State who the course is for and what useful result they should expect.",
    action: "Fix description",
    tab: "settings",
  });
  check(!course.pendingSourceFiles, 3, {
    id: "course-import-files",
    level: "blocker",
    title: "Finish attaching the imported source files",
    detail: `${course.pendingSourceFiles || 0} source file${course.pendingSourceFiles === 1 ? "" : "s"} still need to be attached to their modules before this course can be published.`,
    action: "Finish file upload",
    tab: "settings",
  });
  if (course.description.trim().length >= 20) {
    check(course.description.trim().length >= 80, 1, {
      id: "course-description-depth",
      level: "improvement",
      title: "Make the course promise more persuasive",
      detail: "A fuller description helps learners judge the outcome, audience, and practical value.",
      action: "Improve description",
      tab: "settings",
    });
  }
  check(course.lessons.length > 0, 3, {
    id: "course-lessons",
    level: "blocker",
    title: "Add the first complete lesson",
    detail: "A course cannot be published without a real learning activity.",
    action: "Add a lesson",
    tab: "lesson",
  });
  check(
    course.sections.length > 0 && course.sections.every((section) => section.title.trim()),
    3,
    {
      id: "course-sections",
      level: "blocker",
      title: "Organise the curriculum into named sections",
      detail: "Clear sections show learners where they are and why the next lesson matters.",
      action: "Fix curriculum",
      tab: "lesson",
    },
  );
  check(course.certificateTitle.trim().length >= 3, 1, {
    id: "certificate-title",
    level: "improvement",
    title: "Name the completion certificate",
    detail: "A specific certificate heading makes the completion evidence feel intentional.",
    action: "Fix certificate",
    tab: "settings",
  });

  for (const lesson of course.lessons) {
    const lessonTitle = lesson.title.trim() || "Untitled lesson";
    const hasMedia = Boolean(lesson.primaryAssetId || lesson.primaryAsset || lesson.videoKey);
    const hasSubstance = lesson.content.trim().length > 0 || hasMedia || lesson.resources.length > 0;
    const guide = getLessonGuide(lesson.content);
    const isMediaLesson = ["video", "audio"].includes(lesson.lessonType);
    const isQuizLesson = lesson.lessonType === "quiz";

    check(
      lesson.title.trim().length >= 3 &&
        !/^untitled lesson$/i.test(lesson.title.trim()),
      3,
      {
        id: `${lesson.id}-title`,
        level: "blocker",
        title: "Name this lesson clearly",
        detail: "Replace the placeholder with a title that tells learners what they will do.",
        action: "Fix lesson",
        tab: "lesson",
        lessonId: lesson.id,
        lessonTitle,
      },
    );
    check(hasSubstance, 3, {
      id: `${lesson.id}-substance`,
      level: "blocker",
      title: `${lessonTitle} has no learning material`,
      detail: "Add written guidance, primary media, or a useful downloadable resource.",
      action: "Add lesson material",
      tab: "lesson",
      lessonId: lesson.id,
      lessonTitle,
    });
    check(lesson.durationMinutes > 0 && lesson.durationMinutes <= 20, 1, {
      id: `${lesson.id}-duration`,
      level: "improvement",
      title: `Set a realistic duration for ${lessonTitle}`,
      detail: "Short, honest time estimates reduce uncertainty and help learners make progress.",
      action: "Set duration",
      tab: "lesson",
      lessonId: lesson.id,
      lessonTitle,
    });
    check(Boolean(guide.outcome), 1, {
      id: `${lesson.id}-outcome`,
      level: "improvement",
      title: `Add a learner outcome to ${lessonTitle}`,
      detail: 'Use a “Your outcome” heading followed by one clear sentence about what the learner will be able to do.',
      action: "Add outcome",
      tab: "lesson",
      lessonId: lesson.id,
      lessonTitle,
    });

    if (isMediaLesson) {
      check(hasMedia, 3, {
        id: `${lesson.id}-media`,
        level: "blocker",
        title: `${lessonTitle} is missing its ${lesson.lessonType}`,
        detail: "Attach playable primary media before learners reach this lesson.",
        action: "Attach media",
        tab: "media",
        lessonId: lesson.id,
        lessonTitle,
      });
      if (hasMedia) {
        check(!isPlaceholderMedia(lesson), 3, {
          id: `${lesson.id}-placeholder-media`,
          level: "blocker",
          title: `Replace the placeholder media in ${lessonTitle}`,
          detail: "Fallback and parity assets prove that playback works, but they are not lesson-specific teaching.",
          action: "Attach the real lesson media",
          tab: "media",
          lessonId: lesson.id,
          lessonTitle,
        });
        check(wordCount(lesson.transcript) >= 40, 1, {
          id: `${lesson.id}-transcript`,
          level: "improvement",
          title: `Add a useful transcript to ${lessonTitle}`,
          detail: "A transcript improves accessibility, search, revision, and support for low-bandwidth learners.",
          action: "Add transcript",
          tab: "lesson",
          lessonId: lesson.id,
          lessonTitle,
        });
      }
    }

    if (lesson.primaryAsset?.kind === "image") {
      check(Boolean(lesson.primaryAsset.altText?.trim()), 1, {
        id: `${lesson.id}-alt-text`,
        level: "improvement",
        title: `Describe the image in ${lessonTitle}`,
        detail: "Add a concise description for learners using assistive technology.",
        action: "Describe image",
        tab: "media",
        lessonId: lesson.id,
        lessonTitle,
      });
    }

    if (isQuizLesson) {
      check(Boolean(lesson.quiz), 3, {
        id: `${lesson.id}-quiz`,
        level: "blocker",
        title: `${lessonTitle} needs an assessment`,
        detail: "Add the quiz questions that learners must complete.",
        action: "Build assessment",
        tab: "lesson",
        lessonId: lesson.id,
        lessonTitle,
      });
    }
    if (lesson.quiz) {
      check(lesson.quiz.questions.length >= 2, 1, {
        id: `${lesson.id}-quiz-depth`,
        level: "improvement",
        title: `Strengthen the assessment in ${lessonTitle}`,
        detail: "Use at least two clear questions so the result reflects more than one guess.",
        action: "Add questions",
        tab: "lesson",
        lessonId: lesson.id,
        lessonTitle,
      });
      check(
        lesson.quiz.questions.length > 0 &&
          lesson.quiz.questions.every((question) => question.explanation?.trim()),
        1,
        {
          id: `${lesson.id}-quiz-feedback`,
          level: "improvement",
          title: `Explain the answers in ${lessonTitle}`,
          detail: "Tell learners why each correct answer is right so the quiz teaches as well as scores.",
          action: "Add explanations",
          tab: "lesson",
          lessonId: lesson.id,
          lessonTitle,
        },
      );
    }
  }

  for (const section of course.sections) {
    const sectionLessons = course.lessons.filter((lesson) => lesson.sectionId === section.id);
    if (!sectionLessons.length) continue;
    check(sectionLessons.some((lesson) => lesson.quiz), 1, {
      id: `${section.id}-assessment`,
      level: "improvement",
      title: `Check understanding in ${section.title || "this section"}`,
      detail: "Add a short knowledge check to help learners confirm what they can now do.",
      action: "Add knowledge check",
      tab: "lesson",
      lessonId: sectionLessons.at(-1)?.id,
      lessonTitle: sectionLessons.at(-1)?.title,
    });
  }

  const score = possible ? Math.round((earned / possible) * 100) : 0;
  const blockers = issues.filter((issue) => issue.level === "blocker");
  const improvements = issues.filter((issue) => issue.level === "improvement");
  const label = blockers.length
    ? "Not ready to publish"
    : score >= 90
      ? "Ready to impress"
      : score >= 75
        ? "Strong, with a few improvements"
        : "Needs a quality pass";
  const lessonIssueCounts = issues.reduce<Record<string, number>>((counts, issue) => {
    if (issue.lessonId) counts[issue.lessonId] = (counts[issue.lessonId] || 0) + 1;
    return counts;
  }, {});

  return {
    score,
    label,
    issues,
    blockers,
    improvements,
    lessonIssueCounts,
    earnedPoints: earned,
    totalPoints: possible,
  };
}
