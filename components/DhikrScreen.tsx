import React, { useState, useEffect, useMemo } from "react";
import type { Category, Dhikr } from "../types";
import { ALL_DHIKR } from "../constants";
import AudioPlayer from "./AudioPlayer";
import ProgressBar from "./ProgressBar";
import { useAudio } from "../hooks/useAudio";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  BookOpenIcon,
  SpeakerIcon,
} from "./icons";

interface DhikrScreenProps {
  category: Category;
  onBack: () => void;
  progressData: {
    completedStages: { [dhikrId: number]: number };
    completedReviews: { [reviewId: string]: boolean };
    score: number;
  };
  onUpdateProgress: (
    categoryId: string,
    dhikrId: number,
    stage: number,
    points: number
  ) => void;
  onCompleteReview: (categoryId: string, reviewId: string) => void;
  sessionStartTime: number | null;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// A small, inline audio button
const InlineAudioButton = ({ src }: { src: string }) => {
  const { playing, toggle } = useAudio(src);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={`p-2 rounded-full transition-colors flex-shrink-0 ${
        playing
          ? "text-teal-500 bg-teal-100 dark:bg-teal-800"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
      aria-label="Play audio"
    >
      <SpeakerIcon className="w-5 h-5" />
    </button>
  );
};

const STAGES_CONFIG = [
  { name: "Learn", points: 20 },
  { name: "Translate", points: 50 },
  { name: "Scramble", points: 80 },
  { name: "Complete", points: 100 },
];
const TOTAL_STAGES = STAGES_CONFIG.length;

const ProgressStepper = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <div className="flex items-center justify-center gap-2 my-4">
    {Array.from({ length: total }).map((_, index) => (
      <div
        key={index}
        className={`w-3 h-3 rounded-full transition-all ${
          index < current
            ? "bg-teal-500"
            : index === current
            ? "bg-teal-500 scale-125"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
      />
    ))}
  </div>
);

const CategorySummaryView = ({
  score,
  duration,
  onFinish,
}: {
  score: number;
  duration: number;
  onFinish: () => void;
}) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full">
      <TrophyIcon className="w-24 h-24 text-yellow-400" />
      <h2 className="text-3xl font-bold mt-4 text-gray-800 dark:text-white">
        آفرین! دسته کامل شد.
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        شما با موفقیت تمام اذکار این بخش را به پایان رساندید.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 mt-10 bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-10 h-10 text-teal-500" />
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-right">
              امتیاز کل
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {score}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ClockIcon className="w-10 h-10 text-blue-500" />
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-right">
              زمان سپری شده
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {minutes}
              <span className="text-base">m</span> {seconds}
              <span className="text-base">s</span>
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onFinish}
        className="mt-12 w-full max-w-xs px-8 py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-transform transform hover:scale-105"
      >
        بازگشت به صفحه اصلی
      </button>
    </div>
  );
};

const PostDhikrNav = ({
  onNext,
  onDashboard,
}: {
  onNext: () => void;
  onDashboard: () => void;
}) => (
  <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
    <CheckCircleIcon className="w-24 h-24 text-green-500 mb-6" />
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
      عالی بود!
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mt-2 mb-8">
      این ذکر را با موفقیت یاد گرفتی. حالا چه کار می‌کنی؟
    </p>
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
      <button
        onClick={onNext}
        className="w-full px-6 py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-transform transform hover:scale-105"
      >
        ذکر بعدی
      </button>
      <button
        onClick={onDashboard}
        className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        بازگشت به صفحه اصلی
      </button>
    </div>
  </div>
);

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
          ...currentQuestion.distractorTranslations,
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
      <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">
        ترجمه صحیح کدام است؟
      </h3>
      <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={answerState.isCorrect !== null}
            className="w-full text-right p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-800 disabled:opacity-70"
          >
            {option}
          </button>
        ))}
      </div>
      {answerState.isCorrect === true && (
        <div className="mt-6 p-4 rounded-lg w-full max-w-lg flex items-center justify-between bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
          <span className="font-bold">{answerState.message}</span>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
          >
            ادامه
          </button>
        </div>
      )}
      {answerState.isCorrect === false && (
        <div className="mt-6 p-4 rounded-lg w-full max-w-lg text-right bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
          <div className="flex items-center justify-between">
            <span className="font-bold">{answerState.message}</span>
            <button
              onClick={handleTryAgain}
              className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
            >
              تلاش مجدد
            </button>
          </div>
          <div className="border-t border-red-200 dark:border-red-700 mt-3 pt-3">
            <p className="font-semibold">پاسخ صحیح:</p>
            <p>{currentQuestion.translation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DhikrScreen({
  category,
  onBack,
  progressData,
  onUpdateProgress,
  onCompleteReview,
  sessionStartTime,
}: DhikrScreenProps) {
  const [itemIndex, setItemIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  const [showSummary, setShowSummary] = useState(false);
  const [showPostDhikrNav, setShowPostDhikrNav] = useState(false);
  const [duration, setDuration] = useState(0);

  // State for stage-specific interactions
  const [answerState, setAnswerState] = useState<{
    isCorrect: boolean | null;
    message: string;
  }>({ isCorrect: null, message: "" });
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [scrambledAnswer, setScrambledAnswer] = useState<string[]>([]);
  const [scrambleIncorrectWord, setScrambleIncorrectWord] = useState<
    string | null
  >(null);
  const [fillGaps, setFillGaps] = useState<{
    words: string[];
    hiddenIndices: number[];
    options: string[];
    filled: (string | null)[];
  }>({ words: [], hiddenIndices: [], options: [], filled: [] });

  const categoryItems = useMemo(() => category.dhikrIds, [category.id]);
  const currentItem = useMemo(
    () => categoryItems[itemIndex],
    [categoryItems, itemIndex]
  );
  const currentDhikr = useMemo(
    () =>
      typeof currentItem === "number"
        ? ALL_DHIKR.find((d) => d.id === currentItem)
        : null,
    [currentItem]
  );

  const setupStage = (itIndex: number, stIndex: number) => {
    setAnswerState({ isCorrect: null, message: "" });
    setShowPostDhikrNav(false);
    const item = categoryItems[itIndex];
    if (typeof item !== "number") return;

    const dhikr = ALL_DHIKR.find((d) => d.id === item);
    if (!dhikr) return;

    if (stIndex === 1)
      setQuizOptions(
        shuffleArray([dhikr.translation, ...dhikr.distractorTranslations])
      );
    if (stIndex === 2) {
      const words =
        dhikr.scrambleChunks || dhikr.arabic.split(/\s+/).filter(Boolean);
      setScrambledWords(shuffleArray(words));
      setScrambledAnswer([]);
      setScrambleIncorrectWord(null);
    }
    if (stIndex === 3) {
      const allWords = dhikr.arabic.split(/\s+/).filter(Boolean);
      const wordIndices = allWords.map((_, i) => i);
      const shuffledIndices = shuffleArray(wordIndices);
      const numToHide = Math.max(
        1,
        Math.min(4, Math.floor(allWords.length / 4))
      );
      const indicesToHide = shuffledIndices
        .slice(0, numToHide)
        .sort((a, b) => a - b);
      const hiddenWords = indicesToHide.map((i) => allWords[i]);
      const otherWords = allWords.filter(
        (w, i) => !indicesToHide.includes(i) && w.length > 2
      );
      const distractors = shuffleArray(otherWords).slice(0, 4);
      setFillGaps({
        words: allWords,
        hiddenIndices: indicesToHide,
        options: shuffleArray([...hiddenWords, ...distractors]),
        filled: new Array(indicesToHide.length).fill(null),
      });
    }
  };

  useEffect(() => {
    const findFirstIncomplete = () => {
      for (let i = 0; i < categoryItems.length; i++) {
        const item = categoryItems[i];
        if (typeof item === "number") {
          const completed = progressData?.completedStages?.[item] || 0;
          if (completed < TOTAL_STAGES) {
            setItemIndex(i);
            setStageIndex(completed);
            setupStage(i, completed);
            return;
          }
        } else {
          const completed = progressData?.completedReviews?.[item] || false;
          if (!completed) {
            setItemIndex(i);
            setStageIndex(0); // Not used for reviews, but good to reset
            return;
          }
        }
      }
      if (sessionStartTime)
        setDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
      setShowSummary(true);
    };
    findFirstIncomplete();
  }, [category.id, progressData]);

  const advanceToNext = () => {
    if (!currentDhikr) return;

    const nextStage = stageIndex + 1;
    // Only update progress if this stage wasn't completed before
    if ((progressData.completedStages[currentDhikr.id] || 0) < nextStage) {
      onUpdateProgress(
        category.id,
        currentDhikr.id,
        nextStage,
        STAGES_CONFIG[stageIndex].points
      );
    }

    setAnswerState({ isCorrect: null, message: "" });
    if (nextStage >= TOTAL_STAGES) {
      setShowPostDhikrNav(true);
    } else {
      setStageIndex(nextStage);
      setupStage(itemIndex, nextStage);
    }
  };

  const handleNextClick = () => {
    if (answerState.isCorrect || stageIndex === 0) {
      advanceToNext();
    }
  };

  const handleGoToNextItem = () => {
    setShowPostDhikrNav(false);
    const nextIndex = itemIndex + 1;
    if (nextIndex < categoryItems.length) {
      setItemIndex(nextIndex);
      const nextItem = categoryItems[nextIndex];
      const nextStageIndex =
        (typeof nextItem === "number" &&
          progressData?.completedStages?.[nextItem]) ||
        0;
      setStageIndex(nextStageIndex);
      setupStage(nextIndex, nextStageIndex);
    } else {
      if (sessionStartTime)
        setDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
      setShowSummary(true);
    }
  };

  const handleCompleteReview = () => {
    if (typeof currentItem === "string") {
      onCompleteReview(category.id, currentItem);
      // After review, move to the next item
      handleGoToNextItem();
    }
  };

  const handleTryAgain = () => {
    setupStage(itemIndex, stageIndex);
  };

  if (showSummary)
    return (
      <CategorySummaryView
        score={progressData.score}
        duration={duration}
        onFinish={onBack}
      />
    );

  const totalItems = category.dhikrIds.length;
  let completedItems = 0;
  category.dhikrIds.forEach((_item, i) => {
    if (i < itemIndex) completedItems++;
  });
  const overallProgressPercentage =
    totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  if (showPostDhikrNav) {
    return (
      <div className="p-4 sm:p-6 min-h-[calc(100vh-68px)] flex flex-col">
        <PostDhikrNav onNext={handleGoToNextItem} onDashboard={onBack} />
      </div>
    );
  }

  if (typeof currentItem === "string") {
    const reviewDhikrIds = category.dhikrIds
      .slice(0, itemIndex)
      .filter((id) => typeof id === "number") as number[];
    const dhikrsToReview = ALL_DHIKR.filter((d) =>
      reviewDhikrIds.includes(d.id)
    ).slice(-3);
    return (
      <div className="p-4 sm:p-6 min-h-[calc(100vh-68px)] flex flex-col">
        <ReviewMode
          dhikrsToReview={dhikrsToReview}
          onComplete={handleCompleteReview}
        />
      </div>
    );
  }

  if (!currentDhikr) return <div className="p-4">در حال بارگذاری...</div>;

  const handleQuizAnswer = (answer: string) => {
    if (answerState.isCorrect !== null) return;
    if (answer === currentDhikr.translation) {
      setAnswerState({
        isCorrect: true,
        message: `آفرین! ${STAGES_CONFIG[1].points} امتیاز گرفتی.`,
      });
    } else {
      setAnswerState({ isCorrect: false, message: "اشتباه بود!" });
    }
  };
  const handleScrambleOptionClick = (word: string, index: number) => {
    if (answerState.isCorrect) return;
    const correctSequence =
      currentDhikr.scrambleChunks ||
      currentDhikr.arabic.split(/\s+/).filter(Boolean);
    const nextCorrectWord = correctSequence[scrambledAnswer.length];
    if (word === nextCorrectWord) {
      setScrambledAnswer([...scrambledAnswer, word]);
      const newOptions = [...scrambledWords];
      newOptions.splice(index, 1);
      setScrambledWords(newOptions);
      setScrambleIncorrectWord(null);
      if (scrambledAnswer.length + 1 === correctSequence.length) {
        setAnswerState({
          isCorrect: true,
          message: `عالی بود! ${STAGES_CONFIG[2].points} امتیاز گرفتی.`,
        });
      }
    } else {
      setScrambleIncorrectWord(word);
      setTimeout(() => setScrambleIncorrectWord(null), 800);
    }
  };
  const handleScrambleAnswerClick = (word: string, index: number) => {
    if (answerState.isCorrect) return;
    if (index === scrambledAnswer.length - 1) {
      const newAnswer = scrambledAnswer.slice(0, -1);
      setScrambledAnswer(newAnswer);
      setScrambledWords([...scrambledWords, word]);
    }
  };
  const handleFillGapOptionClick = (word: string) => {
    if (answerState.isCorrect !== null) return;
    const nextGapIndex = fillGaps.filled.findIndex((g) => g === null);
    if (nextGapIndex !== -1) {
      const newFilled = [...fillGaps.filled];
      newFilled[nextGapIndex] = word;
      setFillGaps({ ...fillGaps, filled: newFilled });
    }
  };
  const handleFillGapClick = (gapIndex: number) => {
    if (answerState.isCorrect !== null) return;
    const newFilled = [...fillGaps.filled];
    newFilled[gapIndex] = null;
    setFillGaps({ ...fillGaps, filled: newFilled });
  };
  const checkFillGapsAnswer = () => {
    const correctWords = fillGaps.hiddenIndices.map((i) => fillGaps.words[i]);
    const isAnswerCorrect =
      JSON.stringify(fillGaps.filled.sort()) ===
      JSON.stringify(correctWords.sort());
    if (isAnswerCorrect) {
      setAnswerState({
        isCorrect: true,
        message: `فوق‌العاده! ${STAGES_CONFIG[3].points} امتیاز گرفتی.`,
      });
    } else {
      setAnswerState({ isCorrect: false, message: "اشتباه بود!" });
    }
  };

  const renderStageContent = () => {
    switch (stageIndex) {
      case 0:
        return (
          <div className="text-center">
            <p
              className="font-serif text-3xl md:text-4xl leading-[3.5rem] md:leading-[4rem] text-gray-800 dark:text-gray-100 mb-4 whitespace-pre-line"
              lang="ar"
            >
              {currentDhikr.arabic}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 whitespace-pre-line leading-relaxed md:leading-8">
              {currentDhikr.translation}
            </p>
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg mt-6">
              <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                فضیلت و کاربرد:
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {currentDhikr.virtue}
              </p>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <div className="flex items-center justify-center gap-4 mb-8">
              <InlineAudioButton src={currentDhikr.audioUrl} />
              <p
                className="font-serif text-2xl md:text-3xl text-center leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-line"
                lang="ar"
              >
                {currentDhikr.arabic}
              </p>
            </div>
            <h3 className="text-center font-bold text-lg mb-4 text-gray-700 dark:text-gray-200">
              کدام ترجمه صحیح است؟
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {quizOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleQuizAnswer(option)}
                  disabled={answerState.isCorrect !== null}
                  className="w-full text-right p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-800 disabled:opacity-70 whitespace-pre-line"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        const correctSequence =
          currentDhikr.scrambleChunks ||
          currentDhikr.arabic.split(/\s+/).filter(Boolean);
        const nextCorrectWord = answerState.isCorrect
          ? null
          : correctSequence[scrambledAnswer.length];
        return (
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <InlineAudioButton src={currentDhikr.audioUrl} />
              <h3 className="text-center font-bold text-lg text-gray-700 dark:text-gray-200">
                کلمات را به ترتیب صحیح بچینید:
              </h3>
            </div>
            <p className="text-center text-lg text-gray-600 dark:text-gray-300 mt-4 mb-4 whitespace-pre-line">
              {currentDhikr.translation}
            </p>
            <div
              dir="rtl"
              className="p-4 min-h-[6rem] bg-gray-100 dark:bg-gray-700/50 rounded-lg flex flex-wrap-reverse justify-center items-center gap-2 font-serif text-2xl"
            >
              {scrambledAnswer.map((word, i) => (
                <span
                  key={i}
                  onClick={() => handleScrambleAnswerClick(word, i)}
                  className="cursor-pointer p-1 px-2 bg-white dark:bg-gray-800 rounded-md shadow-sm whitespace-pre-line leading-relaxed"
                >
                  {word}
                </span>
              ))}
              {scrambledAnswer.length < correctSequence.length &&
                !answerState.isCorrect && (
                  <span className="inline-block w-8 h-1 bg-teal-500 rounded-full animate-pulse mx-1"></span>
                )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {scrambledWords.map((word, i) => {
                const isIncorrect = scrambleIncorrectWord === word;
                const isHint =
                  scrambleIncorrectWord !== null && word === nextCorrectWord;
                return (
                  <button
                    key={`${word}-${i}`}
                    onClick={() => handleScrambleOptionClick(word, i)}
                    disabled={answerState.isCorrect}
                    className={`font-serif px-4 py-2 text-gray-800 dark:text-gray-100 rounded-lg transition-all duration-200 transform ${
                      isIncorrect
                        ? "bg-red-300 dark:bg-red-700 animate-shake"
                        : isHint
                        ? "bg-green-300 dark:bg-green-700 ring-2 ring-green-500 animate-pulse"
                        : "bg-gray-200 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-900 hover:scale-105 disabled:opacity-50"
                    } whitespace-pre-line leading-relaxed`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <InlineAudioButton src={currentDhikr.audioUrl} />
              <h3 className="text-center font-bold text-lg text-gray-700 dark:text-gray-200">
                ذکر را کامل کنید:
              </h3>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 text-center whitespace-pre-line">
              {currentDhikr.translation}
            </p>
            <div className="text-center my-6">
              <p
                className="font-serif text-3xl md:text-4xl leading-[3.5rem] md:leading-[4rem] text-gray-800 dark:text-gray-100"
                lang="ar"
              >
                {fillGaps.words.map((word, index) => {
                  const hiddenIndex = fillGaps.hiddenIndices.indexOf(index);
                  if (hiddenIndex !== -1) {
                    return (
                      <span
                        key={index}
                        onClick={() => handleFillGapClick(hiddenIndex)}
                        className={`inline-block border-b-2 border-dashed border-teal-500 min-w-[70px] text-center px-2 mx-1 align-middle ${
                          fillGaps.filled[hiddenIndex]
                            ? "text-gray-800 dark:text-gray-100 cursor-pointer"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {fillGaps.filled[hiddenIndex] || "..."}
                      </span>
                    );
                  }
                  return ` ${word} `;
                })}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {fillGaps.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleFillGapOptionClick(option)}
                  disabled={
                    answerState.isCorrect !== null ||
                    fillGaps.filled.includes(option)
                  }
                  className="font-serif px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900 disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>
            {fillGaps.filled.every((g) => g !== null) &&
              answerState.isCorrect === null && (
                <div className="text-center mt-6">
                  <button
                    onClick={checkFillGapsAnswer}
                    className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600"
                  >
                    بررسی پاسخ
                  </button>
                </div>
              )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderFooter = () => {
    if (answerState.isCorrect === true) {
      return (
        <div
          className={`mt-6 p-4 rounded-lg flex items-center justify-between bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200`}
        >
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6" />
            <span className="font-bold">{answerState.message}</span>
          </div>
          <button
            onClick={handleNextClick}
            className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
          >
            ادامه
          </button>
        </div>
      );
    }
    if (answerState.isCorrect === false) {
      let correctAnswerDisplay = null;
      if (stageIndex === 1 && currentDhikr) {
        // Quiz
        correctAnswerDisplay = (
          <div className="border-t border-red-200 dark:border-red-700 mt-3 pt-3">
            <p className="font-semibold">پاسخ صحیح:</p>
            <p className="whitespace-pre-line">{currentDhikr.translation}</p>
          </div>
        );
      } else if (stageIndex === 3 && currentDhikr) {
        // Fill Gaps
        correctAnswerDisplay = (
          <div className="border-t border-red-200 dark:border-red-700 mt-3 pt-3">
            <p className="font-semibold">ذکر صحیح:</p>
            <p className="font-serif text-lg whitespace-pre-line" lang="ar">
              {currentDhikr.arabic}
            </p>
          </div>
        );
      }

      return (
        <div
          className={`mt-6 p-4 rounded-lg text-right bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-6 h-6" />
              <span className="font-bold">{answerState.message}</span>
            </div>
            <button
              onClick={handleTryAgain}
              className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
            >
              تلاش مجدد
            </button>
          </div>
          {correctAnswerDisplay}
        </div>
      );
    }
    if (stageIndex === 0 && currentDhikr) {
      return (
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <AudioPlayer
            key={`${currentDhikr.id}-audio`}
            src={currentDhikr.audioUrl}
          />
          <button
            onClick={handleNextClick}
            className="px-8 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-transform transform hover:scale-105"
          >
            یاد گرفتم، ادامه
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-68px)] flex flex-col">
      <header className="flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400"
          >
            <ArrowRightIcon className="w-5 h-5 transform rotate-180" />
            <span>بازگشت</span>
          </button>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {category.title}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mb-2 text-gray-600 dark:text-gray-300 px-1">
          <span>
            امتیاز شما:{" "}
            <span className="font-bold text-teal-500">
              {progressData.score}
            </span>
          </span>
          <span>{Math.round(overallProgressPercentage)}%</span>
        </div>
        <ProgressBar progress={overallProgressPercentage} />
        {typeof currentItem === "number" && (
          <ProgressStepper current={stageIndex} total={TOTAL_STAGES} />
        )}
      </header>

      <main className="flex-grow flex flex-col justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 my-4">
        <div className="flex-grow flex flex-col justify-center">
          {renderStageContent()}
        </div>
      </main>

      <footer className="flex-shrink-0">{renderFooter()}</footer>
    </div>
  );
}
