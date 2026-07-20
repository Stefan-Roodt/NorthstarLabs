export type QuizFeedbackQuestion = {
  id: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type QuizAnswerFeedback = {
  questionId: string;
  correct: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
};

export function buildQuizFeedback(
  questions: QuizFeedbackQuestion[],
  answers: number[],
) {
  const feedback = questions.map((question, index): QuizAnswerFeedback => {
    const correctAnswer = question.options[question.correctIndex] || "the expected answer";
    return {
      questionId: question.id,
      correct: answers[index] === question.correctIndex,
      selectedAnswer: question.options[answers[index]] || "No answer selected",
      correctAnswer,
      explanation: question.explanation.trim() ||
        `The expected answer is “${correctAnswer}”. Revisit the lesson example or evidence that supports it before trying again.`,
    };
  });

  return {
    correct: feedback.filter((item) => item.correct).length,
    feedback,
  };
}
