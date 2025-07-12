import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Category, Dhikr } from "../types";
import { ALL_DHIKR } from "../constants";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  BookOpenIcon,
  SpeakerIcon,
} from "./icons";
import StageLearn from "./DhikrScreen/StageLearn";
import StageTranslate from "./DhikrScreen/StageTranslate";
import StageScramble from "./DhikrScreen/StageScramble";
import StageFillGaps from "./DhikrScreen/StageFillGaps";

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
  setHeaderStageIndex?: (n: number) => void;
  setHeaderTotalStages?: (n: number) => void;
  setHeaderItemIndex?: (n: number) => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// A small, inline audio button
// Removed: const InlineAudioButton = ({ src }: { src: string }) => { ... }

const STAGES_CONFIG = [
  { name: "Learn", points: 20 },
  { name: "Translate", points: 50 },
  { name: "Scramble", points: 80 },
  { name: "Complete", points: 100 },
];
const TOTAL_STAGES = STAGES_CONFIG.length;

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
        {currentQuestion.audioUrl && (
          <audio src={currentQuestion.audioUrl} controls className="mx-2" />
        )}
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
  setHeaderStageIndex,
  setHeaderTotalStages,
  setHeaderItemIndex,
  onFooterControlsChange, // تابع جدید برای ارسال کنترل‌ها به App
}: DhikrScreenProps & { onFooterControlsChange?: (controls: any) => void }) {
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

  useEffect(() => {
    if (setHeaderStageIndex) setHeaderStageIndex(stageIndex);
    if (setHeaderTotalStages) setHeaderTotalStages(TOTAL_STAGES);
    if (setHeaderItemIndex) setHeaderItemIndex(itemIndex);
  }, [
    stageIndex,
    setHeaderStageIndex,
    setHeaderTotalStages,
    itemIndex,
    setHeaderItemIndex,
  ]);

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

  const handleQuizAnswer = (answer: string) => {
    if (answerState.isCorrect !== null) return;
    if (answer === currentDhikr?.translation) {
      setAnswerState({
        isCorrect: true,
        message: `فوق‌العاده! ${STAGES_CONFIG[1].points} 💎 گرفتی.`,
      });
    } else {
      setAnswerState({ isCorrect: false, message: "اشتباه بود!" });
    }
  };

  const handleScrambleOptionClick = (word: string, index: number) => {
    if (answerState.isCorrect !== null) return;
    if (!currentDhikr) return;
    if (scrambledAnswer.length < scrambledWords.length) {
      // Determine the correct sequence
      const correctSequence =
        currentDhikr.scrambleChunks ||
        currentDhikr.arabic.split(/\s+/).filter(Boolean);
      const expectedWord = correctSequence[scrambledAnswer.length];
      if (word === expectedWord) {
        setScrambledAnswer([...scrambledAnswer, word]);
        setScrambleIncorrectWord(null);
      } else {
        setScrambleIncorrectWord(word);
      }
    }
  };

  const handleScrambleAnswerClick = (word: string, index: number) => {
    if (answerState.isCorrect !== null) return;
    if (scrambledAnswer.length > 0) {
      if (scrambledAnswer[index] === word) {
        setScrambledAnswer([
          ...scrambledAnswer.slice(0, index),
          ...scrambledAnswer.slice(index + 1),
        ]);
      } else {
        setScrambleIncorrectWord(word);
      }
    }
  };

  const handleFillGapOptionClick = (word: string) => {
    if (answerState.isCorrect !== null) return;
    const currentGapIndex = fillGaps.filled.findIndex((w) => w === null);
    if (currentGapIndex === -1) return;

    const newFilled = [...fillGaps.filled];
    newFilled[currentGapIndex] = word;
    setFillGaps({ ...fillGaps, filled: newFilled });
  };

  const checkFillGapsAnswer = useCallback(() => {
    const correctWords = fillGaps.hiddenIndices.map((i) => fillGaps.words[i]);
    const isAnswerCorrect = fillGaps.filled.every(
      (w, i) => w === correctWords[i]
    );
    if (isAnswerCorrect) {
      setAnswerState({
        isCorrect: true,
        message: `فوق‌العاده! ${STAGES_CONFIG[3].points} 💎 گرفتی.`,
      });
    } else {
      setAnswerState({ isCorrect: false, message: "اشتباه بود!" });
    }
  }, [fillGaps.hiddenIndices, fillGaps.words, fillGaps.filled]);

  useEffect(() => {
    // Only run in FillGaps stage
    if (stageIndex === 3 && answerState.isCorrect === null) {
      // If all gaps are filled (no nulls)
      if (
        fillGaps.filled.length > 0 &&
        fillGaps.filled.every((w) => w !== null)
      ) {
        checkFillGapsAnswer();
      }
    }
  }, [fillGaps.filled, stageIndex, answerState.isCorrect, checkFillGapsAnswer]);

  useEffect(() => {
    // Only run in Scramble stage
    if (stageIndex === 2 && answerState.isCorrect === null) {
      if (
        scrambledAnswer.length > 0 &&
        scrambledAnswer.length === scrambledWords.length
      ) {
        const correctSequence =
          currentDhikr?.scrambleChunks ||
          currentDhikr?.arabic.split(/\s+/).filter(Boolean) ||
          [];
        const isCorrect = scrambledAnswer.every(
          (w, i) => w === correctSequence[i]
        );
        if (isCorrect) {
          setAnswerState({
            isCorrect: true,
            message: `فوق‌العاده! ${STAGES_CONFIG[2].points} 💎 گرفتی.`,
          });
        } else {
          setAnswerState({ isCorrect: false, message: "اشتباه بود!" });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrambledAnswer, scrambledWords, stageIndex]);

  // Place renderStageContent after all handlers
  const renderStageContent = () => {
    if (!currentDhikr) return null;
    switch (stageIndex) {
      case 0:
        return (
          <StageLearn
            arabic={currentDhikr.arabic}
            translation={currentDhikr.translation}
            virtue={currentDhikr.virtue}
            audioUrl={currentDhikr.audioUrl}
            onContinue={handleNextClick}
          />
        );
      case 1:
        return (
          <StageTranslate
            arabic={currentDhikr.arabic}
            audioUrl={currentDhikr.audioUrl}
            options={quizOptions}
            correct={currentDhikr.translation}
            answerState={answerState}
            onAnswer={handleQuizAnswer}
            onTryAgain={handleTryAgain}
            onContinue={handleNextClick}
          />
        );
      case 2:
        return (
          <StageScramble
            words={scrambledWords}
            userSequence={scrambledAnswer}
            answerState={answerState}
            onWordClick={(word) =>
              handleScrambleOptionClick(word, scrambledWords.indexOf(word))
            }
            onRemoveLast={(word, idx) => handleScrambleAnswerClick(word, idx)}
            onTryAgain={handleTryAgain}
            onContinue={handleNextClick}
            correctSequence={
              currentDhikr.scrambleChunks ||
              currentDhikr.arabic.split(/\s+/).filter(Boolean)
            }
            scrambleIncorrectWord={scrambleIncorrectWord}
            audioUrl={currentDhikr.audioUrl}
          />
        );
      case 3:
        return (
          <StageFillGaps
            sentenceParts={fillGaps.words.map((w, i) =>
              fillGaps.hiddenIndices.includes(i) ? "" : w
            )}
            options={fillGaps.options}
            filled={fillGaps.filled}
            answerState={answerState}
            onSelect={(word, gapIdx) => handleFillGapOptionClick(word)}
            onGapClick={(gapIdx) => {
              if (answerState.isCorrect !== null) return;
              // Remove word from gap
              const newFilled = [...fillGaps.filled];
              newFilled[gapIdx] = null;
              setFillGaps({ ...fillGaps, filled: newFilled });
            }}
            onTryAgain={handleTryAgain}
            onContinue={handleNextClick}
            correct={fillGaps.hiddenIndices
              .map((i) => fillGaps.words[i])
              .join(" ")}
            disabled={answerState.isCorrect !== null}
            audioUrl={currentDhikr.audioUrl}
          />
        );
      default:
        return null;
    }
  };

  // Remove all early returns and use a single content variable
  let content = null;
  if (showSummary) {
    content = (
      <CategorySummaryView
        score={progressData.score}
        duration={duration}
        onFinish={onBack}
      />
    );
  } else if (showPostDhikrNav) {
    content = (
      <div className="p-4 sm:p-6 min-h-[calc(100vh-68px)] flex flex-col">
        <PostDhikrNav onNext={handleGoToNextItem} onDashboard={onBack} />
      </div>
    );
  } else if (typeof currentItem === "string") {
    const reviewDhikrIds = category.dhikrIds
      .slice(0, itemIndex)
      .filter((id) => typeof id === "number") as number[];
    const dhikrsToReview = ALL_DHIKR.filter((d) =>
      reviewDhikrIds.includes(d.id)
    ).slice(-3);
    content = (
      <div className="p-4 sm:p-6 min-h-[calc(100vh-68px)] flex flex-col">
        <ReviewMode
          dhikrsToReview={dhikrsToReview}
          onComplete={handleCompleteReview}
        />
      </div>
    );
  } else if (!currentDhikr) {
    content = <div className="p-4">در حال بارگذاری...</div>;
  } else {
    content = (
      <div className="flex-1 flex flex-col justify-center p-2 sm:p-4 mt-4 mb-2">
        {renderStageContent()}
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6 flex flex-col min-h-[calc(100vh-68px-56px)] h-[calc(100vh-68px-56px)]">
      {/* Removed: Top score and percentage bar, ProgressBar, ProgressStepper */}
      {/* حذف تب‌بار پایین */}
      {/* هیچ NavBar یا BottomTabBar در این صفحه رندر نشود */}
      {content}
    </div>
  );
}
