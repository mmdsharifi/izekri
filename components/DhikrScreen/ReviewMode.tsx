import React, { useState, useEffect } from "react";
import type { Dhikr } from "../../types";
import InlineAudioButton from "./InlineAudioButton";
import { BookOpenIcon } from "../icons";

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const ReviewMode = ({
  dhikrsToReview,
  onComplete,
}: {
  dhikrsToReview: Dhikr[];
  onComplete: () => void;
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [answerState, setAnswerState] = useState<{
    isCorrect: boolean | null;
    message: string;
  }>({ isCorrect: null, message: "" });

  const currentQuestion = dhikrsToReview[questionIndex];

  useEffect(() => {
    if (currentQuestion) {
      setOptions(
        shuffleArray([
          currentQuestion.translation,
          ...(currentQuestion.distractorTranslations || []),
        ])
      );
      setAnswerState({ isCorrect: null, message: "" });
    }
  }, [currentQuestion, questionIndex]);

  if (!currentQuestion) {
    return <div className="text-center">درحال آماده سازی مرور...</div>;
  }

  const handleAnswer = (answer: string) => {
    if (answerState.isCorrect !== null) return;
    if (answer === currentQuestion.translation) {
      setAnswerState({ isCorrect: true, message: "پاسخ صحیح!" });
    } else {
      setAnswerState({ isCorrect: false, message: "اشتباه بود!" });
    }
  };

  const handleNext = () => {
    if (questionIndex + 1 >= dhikrsToReview.length) {
      onComplete();
    } else {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const handleTryAgain = () => {
    setAnswerState({ isCorrect: null, message: "" });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 h-full">
      <div className="flex items-center gap-3 mb-6 text-xl font-bold text-teal-500">
        <BookOpenIcon className="w-8 h-8" />
        <span>درس مروری</span>
      </div>
      <div className="flex items-center justify-center gap-3 mb-8">
        <InlineAudioButton src={currentQuestion.audioUrl} />
        <p
          className="font-serif text-2xl md:text-3xl leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-line"
          lang="ar"
        >
          {currentQuestion.arabic}
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto mb-6">
        {options.map((option, idx) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className={`w-full px-6 py-3 rounded-xl border-4 font-bold text-lg transition bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-400 active:scale-95 text-gray-800 dark:text-gray-100 ${
              answerState.isCorrect === null
                ? ""
                : option === currentQuestion.translation
                ? "bg-green-100 dark:bg-green-900 border-green-400 text-green-700 dark:text-green-200"
                : answerState.isCorrect === false &&
                  option === options.find((o) => o === option)
                ? "bg-red-100 dark:bg-red-900 border-red-400 text-red-700 dark:text-red-200"
                : ""
            } ${answerState.isCorrect !== null ? "opacity-70" : ""}`}
            disabled={answerState.isCorrect !== null}
          >
            {option}
          </button>
        ))}
      </div>
      {answerState.isCorrect !== null && (
        <div className="mt-4">
          <p
            className={`font-bold text-lg ${
              answerState.isCorrect
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {answerState.message}
          </p>
          <div className="flex gap-4 mt-4 justify-center">
            {answerState.isCorrect ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl border-4 font-bold text-lg transition bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-400 active:scale-95 text-gray-800 dark:text-gray-100"
              >
                سوال بعدی
              </button>
            ) : (
              <button
                onClick={handleTryAgain}
                className="px-6 py-3 rounded-xl border-4 font-bold text-lg transition bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-400 active:scale-95 text-gray-800 dark:text-gray-100"
              >
                تلاش مجدد
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewMode;
