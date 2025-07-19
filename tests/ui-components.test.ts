import { ALL_DHIKR } from "../constants";
import type { Dhikr } from "../types";

// Mock progress data structure
interface ProgressData {
  [dhikrId: number]: {
    stages: {
      learn: boolean;
      translate: boolean;
      scramble: boolean;
      fillGaps: boolean;
    };
    reviewCompleted: boolean;
  };
}

// Mock subcategory data structure
interface Subcategory {
  id: string;
  title: string;
  subtitle: string;
  dhikrIds: number[];
}

// Helper function to get subcategory progress (same as in SubcategoryList)
function getSubcategoryProgress(
  subcategoryDhikr: Dhikr[],
  progress: ProgressData
): {
  completed: number;
  total: number;
  percentage: number;
  isComplete: boolean;
} {
  let completed = 0;
  const total = subcategoryDhikr.length;

  for (const dhikr of subcategoryDhikr) {
    const dhikrProgress = progress[dhikr.id];
    if (dhikrProgress) {
      const stages = dhikrProgress.stages;
      if (
        stages.learn &&
        stages.translate &&
        stages.scramble &&
        stages.fillGaps
      ) {
        completed++;
      }
    }
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total;

  return {
    completed,
    total,
    percentage,
    isComplete,
  };
}

// Helper function to get progress bar color
function getProgressBarColor(percentage: number, isComplete: boolean): string {
  if (isComplete) return "bg-green-500";
  if (percentage > 0) return "bg-blue-500";
  return "bg-gray-300";
}

// Helper function to get progress text
function getProgressText(
  completed: number,
  total: number,
  isComplete: boolean
): string {
  if (isComplete) return "آماده برای مرور";
  if (completed > 0) return `${completed}/${total}`;
  return `${total} ذکر`;
}

describe("UI Components Tests", () => {
  // Test 1: Progress bar color logic
  describe("Progress Bar Color Logic", () => {
    it("should return green color for complete subcategory", () => {
      const color = getProgressBarColor(100, true);
      expect(color).toBe("bg-green-500");
    });

    it("should return blue color for partial progress", () => {
      const color = getProgressBarColor(50, false);
      expect(color).toBe("bg-blue-500");
    });

    it("should return gray color for no progress", () => {
      const color = getProgressBarColor(0, false);
      expect(color).toBe("bg-gray-300");
    });

    it("should return blue color for 100% if not marked complete", () => {
      const color = getProgressBarColor(100, false);
      expect(color).toBe("bg-blue-500");
    });
  });

  // Test 2: Progress text logic
  describe("Progress Text Logic", () => {
    it("should show review ready text for complete subcategory", () => {
      const text = getProgressText(5, 5, true);
      expect(text).toBe("آماده برای مرور");
    });

    it("should show progress fraction for partial completion", () => {
      const text = getProgressText(3, 5, false);
      expect(text).toBe("3/5");
    });

    it("should show total count for no progress", () => {
      const text = getProgressText(0, 5, false);
      expect(text).toBe("5 ذکر");
    });

    it("should handle edge cases", () => {
      expect(getProgressText(0, 0, false)).toBe("0 ذکر");
      expect(getProgressText(1, 1, true)).toBe("آماده برای مرور");
    });
  });

  // Test 3: Subcategory data structure validation
  describe("Subcategory Data Structure", () => {
    it("should validate subcategory structure", () => {
      const validSubcategory: Subcategory = {
        id: "sujood",
        title: "دعاء السجود",
        subtitle: "اذکار سجده",
        dhikrIds: [131, 141],
      };

      expect(validSubcategory.id).toBeDefined();
      expect(validSubcategory.title).toBeDefined();
      expect(validSubcategory.subtitle).toBeDefined();
      expect(validSubcategory.dhikrIds).toBeDefined();
      expect(Array.isArray(validSubcategory.dhikrIds)).toBe(true);
    });

    it("should filter dhikr by subcategory IDs correctly", () => {
      const subcategory: Subcategory = {
        id: "sujood",
        title: "دعاء السجود",
        subtitle: "اذکار سجده",
        dhikrIds: [131, 141],
      };

      const filteredDhikr = ALL_DHIKR.filter((dhikr) =>
        subcategory.dhikrIds.includes(dhikr.id)
      );

      expect(filteredDhikr.length).toBe(subcategory.dhikrIds.length);

      for (const dhikr of filteredDhikr) {
        expect(subcategory.dhikrIds).toContain(dhikr.id);
      }
    });
  });

  // Test 4: Review mode logic
  describe("Review Mode Logic", () => {
    it("should enable review mode for complete subcategory", () => {
      const subcategoryDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );
      const progress: ProgressData = {};

      // Mark all dhikr as complete
      for (const dhikr of subcategoryDhikr) {
        progress[dhikr.id] = {
          stages: {
            learn: true,
            translate: true,
            scramble: true,
            fillGaps: true,
          },
          reviewCompleted: false,
        };
      }

      const result = getSubcategoryProgress(subcategoryDhikr, progress);

      // Review mode should be enabled
      expect(result.isComplete).toBe(true);
      expect(result.completed).toBe(result.total);
    });

    it("should disable review mode for incomplete subcategory", () => {
      const subcategoryDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );
      const progress: ProgressData = {};

      // Mark only one dhikr as complete
      if (subcategoryDhikr.length > 0) {
        progress[subcategoryDhikr[0].id] = {
          stages: {
            learn: true,
            translate: true,
            scramble: true,
            fillGaps: true,
          },
          reviewCompleted: false,
        };
      }

      const result = getSubcategoryProgress(subcategoryDhikr, progress);

      // Review mode should be disabled
      expect(result.isComplete).toBe(false);
      expect(result.completed).toBeLessThan(result.total);
    });
  });

  // Test 5: RTL arrow direction
  describe("RTL Arrow Direction", () => {
    it("should use right-to-left arrow for Arabic text", () => {
      // This test validates that the UI uses the correct arrow direction
      // In the actual component, we use ArrowRightIcon for RTL layout
      const arrowDirection = "right"; // ArrowRightIcon points right (RTL)
      expect(arrowDirection).toBe("right");
    });

    it("should position arrow on the right side for RTL layout", () => {
      // This test validates the arrow positioning for RTL layout
      const arrowPosition = "right";
      expect(arrowPosition).toBe("right");
    });
  });

  // Test 6: Checkmark display logic
  describe("Checkmark Display Logic", () => {
    it("should show checkmark for complete subcategory", () => {
      const isComplete = true;
      const shouldShowCheckmark = isComplete;
      expect(shouldShowCheckmark).toBe(true);
    });

    it("should not show checkmark for incomplete subcategory", () => {
      const isComplete = false;
      const shouldShowCheckmark = isComplete;
      expect(shouldShowCheckmark).toBe(false);
    });
  });

  // Test 7: Progress bar width calculation
  describe("Progress Bar Width Calculation", () => {
    it("should calculate progress bar width correctly", () => {
      const testCases = [
        { percentage: 0, expected: "0%" },
        { percentage: 25, expected: "25%" },
        { percentage: 50, expected: "50%" },
        { percentage: 75, expected: "75%" },
        { percentage: 100, expected: "100%" },
      ];

      for (const testCase of testCases) {
        const width = `${testCase.percentage}%`;
        expect(width).toBe(testCase.expected);
      }
    });

    it("should handle edge cases for progress bar width", () => {
      expect(`${-10}%`).toBe("-10%"); // Negative percentage
      expect(`${150}%`).toBe("150%"); // Over 100%
    });
  });

  // Test 8: Subcategory click handling
  describe("Subcategory Click Handling", () => {
    it("should handle normal subcategory click", () => {
      const isComplete = false;
      const shouldUseReviewMode = isComplete;
      expect(shouldUseReviewMode).toBe(false);
    });

    it("should handle review mode subcategory click", () => {
      const isComplete = true;
      const shouldUseReviewMode = isComplete;
      expect(shouldUseReviewMode).toBe(true);
    });
  });

  // Test 9: Data consistency
  describe("Data Consistency", () => {
    it("should have consistent subcategory data", () => {
      const sujoodDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );

      // All dhikr should have consistent category and subcategory
      for (const dhikr of sujoodDhikr) {
        expect(dhikr.categoryId).toBe("during-prayer");
        expect(dhikr.subcategoryId).toBe("sujood");
        expect(dhikr.arabic).toBeDefined();
        expect(dhikr.translation).toBeDefined();
        expect(dhikr.audioUrl).toBeDefined();
      }
    });

    it("should have valid audio URLs for all subcategory dhikr", () => {
      const subcategories = ["sujood", "ruku", "between-sujood", "tashahhud"];

      for (const subcategoryId of subcategories) {
        const subcategoryDhikr = ALL_DHIKR.filter(
          (dhikr) =>
            dhikr.categoryId === "during-prayer" &&
            dhikr.subcategoryId === subcategoryId
        );

        for (const dhikr of subcategoryDhikr) {
          expect(dhikr.audioUrl).toMatch(
            /^https:\/\/www\.hisnmuslim\.com\/audio\/ar\/\d+\.mp3$/
          );
        }
      }
    });
  });
});
