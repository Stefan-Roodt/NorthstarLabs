INSERT OR IGNORE INTO `profiles` (`id`,`email`,`display_name`,`role`,`created_at`)
VALUES ('northstarlabs-studio','studio@northstarlabs.local','NorthstarLabs Studio','creator',1784304000000);
--> statement-breakpoint
INSERT OR IGNORE INTO `courses` (`id`,`owner_id`,`title`,`description`,`status`,`price_cents`,`created_at`,`updated_at`)
VALUES (
  'launch-your-first-online-course',
  'northstarlabs-studio',
  'Launch Your First Online Course',
  'Turn one teachable idea into a focused course people can understand, finish, and recommend.',
  'published',
  0,
  1784304000000,
  1784304000000
);
--> statement-breakpoint
INSERT OR IGNORE INTO `courses` (`id`,`owner_id`,`title`,`description`,`status`,`price_cents`,`created_at`,`updated_at`)
VALUES (
  'price-your-expertise',
  'northstarlabs-studio',
  'Price Your Expertise',
  'Build a simple, defensible price for your course without guessing, copying competitors, or undercutting your value.',
  'published',
  0,
  1784304000000,
  1784304000000
);
--> statement-breakpoint
INSERT OR IGNORE INTO `courses` (`id`,`owner_id`,`title`,`description`,`status`,`price_cents`,`created_at`,`updated_at`)
VALUES (
  'build-a-learning-community',
  'northstarlabs-studio',
  'Build a Learning Community',
  'Create a community rhythm that helps members participate, learn from one another, and keep making progress.',
  'published',
  0,
  1784304000000,
  1784304000000
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-launch-01',
  'launch-your-first-online-course',
  'Find the transformation',
  'A useful course begins with a specific change. Describe one learner, the situation they are in now, and what they should be able to do differently after the course. Keep the outcome observable: a completed plan, a confident decision, a new habit, or a finished piece of work. Your action: write one sentence that begins, “By the end of this course, the learner can…”',
  1
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-launch-02',
  'launch-your-first-online-course',
  'Write a clear course promise',
  'Turn the transformation into a promise that is specific without becoming unbelievable. Name the result, the learner, and the boundary of the course. Avoid promises about money, speed, or certainty that you cannot support. Your action: create three versions of the promise, then choose the one a learner could repeat to a colleague.',
  2
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-launch-03',
  'launch-your-first-online-course',
  'Design the shortest useful path',
  'List every topic you could teach, then remove anything that is not required for the promised result. Group the remaining actions into a beginning, middle, and finish. Six strong lessons are often more valuable than twenty disconnected lectures. Your action: give each lesson an action verb and one visible output.',
  3
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-launch-04',
  'launch-your-first-online-course',
  'Create lessons people finish',
  'Use a repeatable lesson rhythm: explain one idea, show a concrete example, ask the learner to act, and help them reflect on the result. Make the action small enough to complete in the same sitting. Your action: draft one lesson using four headings—Idea, Example, Action, Reflection.',
  4
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-launch-05',
  'launch-your-first-online-course',
  'Prepare a minimum viable launch',
  'Your first launch is a learning cycle, not a final verdict. Invite a small group that clearly experiences the problem, explain what the course helps them do, and set expectations about the founding version. Your action: write a personal invitation for ten relevant people and choose one date to begin.',
  5
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-launch-06',
  'launch-your-first-online-course',
  'Measure learning and improve',
  'Completion is useful, but evidence of learner action matters more. Review where learners stop, what they ask, and whether they create the intended outputs. Improve one confusing lesson at a time. Your action: choose four signals to review after the first cohort—progress, completion, questions, and learner results.',
  6
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-pricing-01',
  'price-your-expertise',
  'Price the result, not the files',
  'Learners do not value a course by counting videos and downloads. They value the quality of the result, the confidence of the path, and the effort or risk the course helps reduce. Your action: list the practical, emotional, and strategic value of the outcome your course supports.',
  1
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-pricing-02',
  'price-your-expertise',
  'Calculate your delivery floor',
  'A sustainable price must cover more than production. Include platform costs, payment fees, live support, administration, updates, and the attention required to serve each learner well. Your action: estimate a conservative cost per learner and the minimum cohort size that makes delivery worthwhile.',
  2
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-pricing-03',
  'price-your-expertise',
  'Choose a pricing position',
  'Price communicates the level of support, depth, and commitment expected. A self-paced introduction, a guided cohort, and a high-touch transformation should not carry the same price. Your action: choose a lower, target, and premium price, then describe what changes between each version.',
  3
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-pricing-04',
  'price-your-expertise',
  'Build the value story',
  'A strong value story explains the learner, the problem, the outcome, the process, and the limits of the offer. It does not rely on false urgency or inflated promises. Your action: write five sentences that explain why the course exists and what a serious learner receives.',
  4
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-pricing-05',
  'price-your-expertise',
  'Test and refine',
  'Treat the first price as a well-reasoned hypothesis. Offer a founding version to a small, relevant audience and pay attention to questions, objections, completion, support demand, and outcomes. Your action: decide what evidence would justify keeping, increasing, or restructuring the price.',
  5
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-community-01',
  'build-a-learning-community',
  'Give the community one job',
  'A learning community is not successful because it is busy. It is successful when interaction helps members make progress. Define the one job the community performs: accountability, feedback, peer examples, expert access, or continued practice. Your action: complete the sentence, “Members come here to…”',
  1
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-community-02',
  'build-a-learning-community',
  'Design the first seven days',
  'New members need orientation and one early win. Show them where to begin, how to introduce themselves meaningfully, and which action creates value for them and the group. Your action: design a welcome sequence with three steps that can be completed in twenty minutes.',
  2
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-community-03',
  'build-a-learning-community',
  'Create participation rituals',
  'Predictable rituals lower the effort required to participate. A weekly intention, work review, question clinic, or progress celebration can create rhythm without constant posting. Your action: choose two weekly rituals and define the prompt, timing, owner, and useful response.',
  3
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-community-04',
  'build-a-learning-community',
  'Connect discussion to learning',
  'Community becomes more useful when it surrounds the learning journey. Invite questions after difficult lessons, ask members to share examples of completed work, and turn recurring confusion into teaching improvements. Your action: add one discussion prompt to every major course milestone.',
  4
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-community-05',
  'build-a-learning-community',
  'Moderate for trust',
  'Clear boundaries make participation safer. Explain what belongs, how disagreement should work, and what happens when behaviour harms the group. Apply rules consistently and communicate with dignity. Your action: write five short community agreements in plain language.',
  5
);
--> statement-breakpoint
INSERT OR IGNORE INTO `lessons` (`id`,`course_id`,`title`,`content`,`position`)
VALUES (
  'starter-community-06',
  'build-a-learning-community',
  'Measure useful participation',
  'Avoid judging community health by message volume alone. Look for returning contributors, unanswered questions, peer support, completed learning actions, and member progress. Your action: choose a monthly review that combines three participation signals with two learning signals.',
  6
);
