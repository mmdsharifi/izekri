import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import DhikrScreen from "./components/DhikrScreen";
import AdhkarListScreen from "./components/AdhkarListScreen";
import { SubcategoryList } from "./components/SubcategoryList";
import { CATEGORIES, ALL_DHIKR } from "./constants";
import type { Category, Subcategory, Progress } from "./types";
import { useAudio } from "./hooks/useAudio";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import ReactPlugin from "@stagewise-plugins/react";
import {
  registerServiceWorker,
  setupNetworkMonitoring,
} from "./utils/serviceWorker";
import CacheManager from "./components/CacheManager";

const defaultProgressValue = {
  completedStages: {},
  completedReviews: {},
  score: 0,
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSubcategory, setActiveSubcategory] =
    useState<Subcategory | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const savedProgress = localStorage.getItem("dhikrProgress");
      const initialProgress = savedProgress ? JSON.parse(savedProgress) : {};

      // Basic validation to ensure structure is correct
      for (const catId in initialProgress) {
        if (
          typeof initialProgress[catId] !== "object" ||
          initialProgress[catId] === null ||
          Array.isArray(initialProgress[catId])
        ) {
          console.warn(
            `Invalid progress structure for category ${catId}, resetting.`
          );
          delete initialProgress[catId];
        } else if (
          !("completedStages" in initialProgress[catId]) ||
          !("score" in initialProgress[catId])
        ) {
          console.warn(
            `Incomplete progress structure for category ${catId}, resetting.`
          );
          delete initialProgress[catId];
        } else if (!("completedReviews" in initialProgress[catId])) {
          initialProgress[catId].completedReviews = {};
        }
      }

      return initialProgress;
    } catch (error) {
      console.error(
        "Could not load or parse progress from localStorage",
        error
      );
      return {};
    }
  });
  // New state for header progress dots
  const [headerStageIndex, setHeaderStageIndex] = useState<number | undefined>(
    undefined
  );
  const [headerTotalStages, setHeaderTotalStages] = useState<
    number | undefined
  >(undefined);
  // New: itemIndex for accurate progress
  const [headerItemIndex, setHeaderItemIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"home" | "adhkar">("home");
  const [footerControls, setFooterControls] = useState<any>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showCacheManager, setShowCacheManager] = useState(false);

  // Set theme based on device preference on first load
  useEffect(() => {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  // Register service worker and setup network monitoring
  useEffect(() => {
    registerServiceWorker();
    const cleanup = setupNetworkMonitoring(
      () => setIsOnline(true),
      () => setIsOnline(false)
    );
    return cleanup;
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem("dhikrProgress", JSON.stringify(progress));
    } catch (error) {
      console.error("Could not save progress to localStorage", error);
    }
  }, [progress]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      document.documentElement.classList.toggle("dark", !prev);
      return !prev;
    });
  };

  const handleSelectCategory = (categoryId: string) => {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    if (category) {
      setActiveCategory(category);
      setActiveSubcategory(null);
    }
  };

  const handleSelectSubcategory = (subcategory: Subcategory) => {
    setActiveSubcategory(subcategory);
    setSessionStartTime(Date.now());
    setIsReviewMode(false);
  };

  const handleReviewModeSelect = (subcategory: Subcategory) => {
    // For review mode, we'll use the same subcategory but mark it as review mode
    // This will be handled in the DhikrScreen component
    setActiveSubcategory(subcategory);
    setSessionStartTime(Date.now());
    setIsReviewMode(true);
  };

  const handleBackToDashboard = () => {
    setActiveCategory(null);
    setActiveSubcategory(null);
    setSessionStartTime(null);
    setIsReviewMode(false);
  };

  const handleBackToCategory = () => {
    setActiveSubcategory(null);
    setSessionStartTime(null);
    setIsReviewMode(false);
  };

  const handleUpdateProgress = (
    categoryId: string,
    dhikrId: number,
    stage: number,
    points: number
  ) => {
    setProgress((prev) => {
      const categoryProgress = prev[categoryId] || { ...defaultProgressValue };
      const currentHighestStage =
        categoryProgress.completedStages[dhikrId] || 0;

      // Only update if this is a new, higher stage
      if (stage > currentHighestStage) {
        return {
          ...prev,
          [categoryId]: {
            ...categoryProgress,
            completedStages: {
              ...categoryProgress.completedStages,
              [dhikrId]: stage,
            },
            score: categoryProgress.score + points,
          },
        };
      }
      return prev; // Return previous state if already completed this stage
    });
  };

  const handleCompleteReview = (categoryId: string, reviewId: string) => {
    setProgress((prev) => {
      const categoryProgress = prev[categoryId] || { ...defaultProgressValue };
      if (categoryProgress.completedReviews[reviewId]) return prev; // Already completed

      return {
        ...prev,
        [categoryId]: {
          ...categoryProgress,
          completedReviews: {
            ...categoryProgress.completedReviews,
            [reviewId]: true,
          },
          score: categoryProgress.score + 15, // Points for review
        },
      };
    });
  };

  // Calculate total score across all categories
  const totalScore = Object.values(progress).reduce(
    (sum, cat) => sum + (cat?.score || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col">
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        totalScore={
          activeCategory ? progress[activeCategory.id]?.score || 0 : totalScore
        }
        categoryTitle={
          activeSubcategory ? activeSubcategory.title : activeCategory?.title
        }
        onBack={
          activeSubcategory
            ? handleBackToCategory
            : activeCategory
            ? handleBackToDashboard
            : undefined
        }
        progressPercent={(() => {
          if (!activeSubcategory) return undefined;
          const totalItems = activeSubcategory.dhikrIds.length;
          return totalItems > 0 ? (headerItemIndex / totalItems) * 100 : 0;
        })()}
        stageIndex={headerStageIndex}
        totalStages={headerTotalStages}
      />
      <div className="flex-1 w-full">
        {activeTab === "home" ? (
          activeSubcategory ? (
            <DhikrScreen
              category={activeCategory!}
              subcategory={activeSubcategory}
              onBack={handleBackToCategory}
              progressData={
                progress[activeCategory!.id] || { ...defaultProgressValue }
              }
              onUpdateProgress={handleUpdateProgress}
              onCompleteReview={handleCompleteReview}
              sessionStartTime={sessionStartTime}
              setHeaderStageIndex={setHeaderStageIndex}
              setHeaderTotalStages={setHeaderTotalStages}
              setHeaderItemIndex={setHeaderItemIndex}
              onFooterControlsChange={setFooterControls}
              isReviewMode={isReviewMode}
            />
          ) : activeCategory ? (
            <SubcategoryList
              category={activeCategory}
              onSubcategorySelect={handleSelectSubcategory}
              onReviewModeSelect={handleReviewModeSelect}
              progress={progress}
            />
          ) : (
            <Dashboard
              onSelectCategory={handleSelectCategory}
              progress={progress}
            />
          )
        ) : (
          <AdhkarListScreen categories={CATEGORIES} allDhikr={ALL_DHIKR} />
        )}
      </div>
      {/* Play/Next Buttons above Bottom Navigation */}
      {activeTab === "home" &&
        activeCategory &&
        footerControls &&
        footerControls.currentDhikr && (
          <PlayNextFooter
            audioUrl={footerControls.currentDhikr.audioUrl}
            onNext={footerControls.handleNextClick}
          />
        )}
      {/* Bottom Navigation */}
      {(!activeCategory || activeTab === "adhkar") && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-14 shadow-t">
          <button
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              activeTab === "home"
                ? "text-teal-600 dark:text-teal-400 font-bold"
                : "text-gray-500 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab("home")}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7m-9 2v6m0 0h4m0 0a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2z"
              />
            </svg>
            خانه
          </button>
          <button
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              activeTab === "adhkar"
                ? "text-teal-600 dark:text-teal-400 font-bold"
                : "text-gray-500 dark:text-gray-300"
            }`}
            onClick={() => setActiveTab("adhkar")}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
              />
            </svg>
            اذکار
          </button>
        </nav>
      )}
      {/* Network Status Indicator - Only in development */}
      {process.env.NODE_ENV === "development" && !isOnline && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg text-center text-sm">
          حالت آفلاین - فایل‌های ذخیره شده در دسترس هستند
        </div>
      )}

      {/* Cache Manager Modal */}
      {showCacheManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-w-md w-full mx-4">
            <CacheManager />
            <button
              onClick={() => setShowCacheManager(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Cache Manager Button - Only in development */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={() => setShowCacheManager(true)}
          className="fixed bottom-4 left-4 z-40 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="مدیریت فایل‌های صوتی"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
          </svg>
        </button>
      )}

      <StagewiseToolbar
        config={{
          plugins: [ReactPlugin],
        }}
      />
    </div>
  );
}

// PlayNextFooter component
function PlayNextFooter({
  audioUrl,
  onNext,
}: {
  audioUrl: string;
  onNext?: () => void;
}) {
  const { playing, toggle } = useAudio(audioUrl);
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 flex justify-end pointer-events-none px-4">
      <div className="flex gap-4 bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-lg px-4 py-2 pointer-events-auto">
        {/* دکمه پخش */}
        <button
          className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-110"
          aria-label={playing ? "توقف صوت" : "پخش صوت"}
          onClick={toggle}
        >
          {playing ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
        {/* دکمه بعدی فقط اگر onNext وجود داشت */}
        {onNext && (
          <button
            className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-110"
            aria-label="ذکر بعدی"
            onClick={onNext}
          >
            {/* آیکون > */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
