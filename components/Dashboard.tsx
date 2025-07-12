import React, { useState } from "react";
import { CATEGORIES } from "../constants";
import type { Category, Progress } from "../types";
import CategoryCard from "./CategoryCard";
import { HeartIcon } from "./icons";

interface DashboardProps {
  onSelectCategory: (categoryId: string) => void;
  progress: Progress;
}

const TOTAL_STAGES_PER_DHIKR = 4; // Should match stages in DhikrScreen

const HADITH_SLIDES = [
  {
    arabic:
      "أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي، فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي، وَإِنْ ذَكَرَنِي فِي مَلَإٍ ذَكَرْتُهُ فِي مَلَإٍ خَيْرٍ مِنْهُمْ.",
    source: "صحیح بخاری و مسلم",
    translation:
      "من نزد گمان بنده‌ام به خود هستم، و با اویم هرگاه مرا یاد کند. اگر مرا در دل خود یاد کند، او را در دل خود یاد می‌کنم، و اگر مرا در جمعی یاد کند، او را در جمعی بهتر از آنان (یعنی در جمع فرشتگان) یاد می‌کنم.",
  },
  {
    arabic:
      "أَلَا أُنَبِّئُكُمْ بِخَيْرِ أَعْمَالِكُمْ، وَأَزْكَاهَا عِنْدَ مَلِيكِكُمْ، وَأَرْفَعِهَا فِي دَرَجَاتِكُمْ، وَخَيْرٍ لَكُمْ مِنْ إِنْفَاقِ الذَّهَبِ وَالْوَرِقِ، وَخَيْرٍ لَكُمْ مِنْ أَنْ تَلْقَوْا عَدُوَّكُمْ فَتَضْرِبُوا أَعْنَاقَهُمْ وَيَضْرِبُوا أَعْنَاقَكُمْ؟ قَالُوا: بَلَى يَا رَسُولَ اللَّهِ. قَالَ: ذِكْرُ اللَّهِ.",
    source: "سنن ترمذی",
    translation:
      "آیا شما را به بهترین اعمالتان، پاکیزه‌ترین آن‌ها نزد پروردگارتان، و بالاترین آن‌ها در درجاتتان، و بهتر از انفاق طلا و نقره، و بهتر از رویارویی با دشمنتان که گردن‌هایشان را بزنید و گردن‌هایتان را بزنند، آگاه نکنم؟ گفتند: بله، ای رسول خدا. فرمود: ذکر خدا.",
  },
];

const Dashboard = ({ onSelectCategory, progress }: DashboardProps) => {
  const [hadithIndex, setHadithIndex] = useState(0);
  const [showArabic, setShowArabic] = useState(false);
  const getProgressForCategory = (category: Category) => {
    const categoryProgress = progress[category.id];
    if (!categoryProgress) {
      return { percentage: 0, score: 0 };
    }

    const totalItems = category.dhikrIds.length;
    if (totalItems === 0) {
      return { percentage: 0, score: categoryProgress.score || 0 };
    }

    let completedItems = 0;
    category.dhikrIds.forEach((item) => {
      if (typeof item === "number") {
        if (
          (categoryProgress.completedStages?.[item] || 0) >=
          TOTAL_STAGES_PER_DHIKR
        ) {
          completedItems++;
        }
      } else {
        // It's a review string
        if (categoryProgress.completedReviews?.[item]) {
          completedItems++;
        }
      }
    });

    const percentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    return { percentage, score: categoryProgress.score || 0 };
  };

  const handlePrev = () =>
    setHadithIndex((prev) =>
      prev === 0 ? HADITH_SLIDES.length - 1 : prev - 1
    );
  const handleNext = () =>
    setHadithIndex((prev) =>
      prev === HADITH_SLIDES.length - 1 ? 0 : prev + 1
    );
  const handleToggleArabic = () => setShowArabic((prev) => !prev);

  const currentHadith = HADITH_SLIDES[hadithIndex];
  // Estimate max height for the slider (based on the largest hadith text)
  const maxArabicLength = Math.max(
    ...HADITH_SLIDES.map((h) => h.arabic.length)
  );
  // Tune this value as needed for your font/size
  const minHeight = maxArabicLength > 300 ? "260px" : "200px";

  return (
    <main className="p-4 sm:p-6 pb-24">
      <div className="mb-8 p-6 bg-teal-500/10 dark:bg-teal-500/20 rounded-2xl border border-teal-500/20">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-full max-w-2xl text-right relative"
            style={{ minHeight }}
          >
            <div className="flex flex-col items-center w-full mb-3">
              <div className="flex flex-row-reverse items-center gap-2 justify-center w-full">
                <h3 className="text-lg md:text-xl font-bold text-teal-700 dark:text-teal-300 whitespace-nowrap text-center">
                  فضیلت و شیرینی ذکر
                </h3>
                <HeartIcon className="w-6 h-6 text-teal-500" />
              </div>
            </div>
            <p
              className="font-serif text-xl md:text-2xl text-gray-800 dark:text-white mt-4 mb-0 text-center"
              lang="ar"
            >
              {currentHadith.arabic}{" "}
              <span className="text-xs">({currentHadith.source})</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-4 text-base md:text-lg text-center">
              {currentHadith.translation}
            </p>

            <div className="flex flex-row-reverse items-center justify-center gap-2 mt-6">
              <button
                onClick={handlePrev}
                className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-200 dark:hover:bg-teal-800 transition"
              >
                قبلی
              </button>
              <button
                onClick={handleNext}
                className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-200 dark:hover:bg-teal-800 transition"
              >
                بعدی
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => {
          const { percentage, score } = getProgressForCategory(category);
          return (
            <CategoryCard
              key={category.id}
              category={category}
              onSelect={onSelectCategory}
              progress={percentage}
              score={score}
            />
          );
        })}
      </div>
    </main>
  );
};

export default Dashboard;
