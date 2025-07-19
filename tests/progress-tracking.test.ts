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

// Helper function to calculate subcategory progress
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

describe("Progress Tracking Tests", () => {
  // Test 1: Progress calculation
  describe("Progress Calculation", () => {
    it("should calculate progress correctly for empty progress", () => {
      const subcategoryDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );
      const progress: ProgressData = {};

      const result = getSubcategoryProgress(subcategoryDhikr, progress);

      expect(result.completed).toBe(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.percentage).toBe(0);
      expect(result.isComplete).toBe(false);
    });

    it("should calculate progress correctly for partial completion", () => {
      const subcategoryDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );
      const progress: ProgressData = {
        [subcategoryDhikr[0].id]: {
          stages: {
            learn: true,
            translate: true,
            scramble: false,
            fillGaps: false,
          },
          reviewCompleted: false,
        },
      };

      const result = getSubcategoryProgress(subcategoryDhikr, progress);

      expect(result.completed).toBe(0); // Not complete because not all stages are done
      expect(result.total).toBeGreaterThan(0);
      expect(result.percentage).toBe(0);
      expect(result.isComplete).toBe(false);
    });

    it("should calculate progress correctly for complete dhikr", () => {
      const subcategoryDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );
      const progress: ProgressData = {
        [subcategoryDhikr[0].id]: {
          stages: {
            learn: true,
            translate: true,
            scramble: true,
            fillGaps: true,
          },
          reviewCompleted: false,
        },
      };

      const result = getSubcategoryProgress(subcategoryDhikr, progress);

      expect(result.completed).toBe(1);
      expect(result.total).toBeGreaterThan(0);
      expect(result.percentage).toBeGreaterThan(0);
      expect(result.isComplete).toBe(result.completed === result.total);
    });

    it("should calculate progress correctly for complete subcategory", () => {
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

      expect(result.completed).toBe(result.total);
      expect(result.percentage).toBe(100);
      expect(result.isComplete).toBe(true);
    });
  });

  // Test 2: Review mode activation
  describe("Review Mode Activation", () => {
    it("should enable review mode when subcategory is complete", () => {
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

      // Review mode should be available when subcategory is complete
      expect(result.isComplete).toBe(true);
      expect(result.completed).toBe(result.total);
    });

    it("should not enable review mode when subcategory is incomplete", () => {
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

      // Review mode should not be available when subcategory is incomplete
      expect(result.isComplete).toBe(false);
      expect(result.completed).toBeLessThan(result.total);
    });
  });

  // Test 3: Progress data structure validation
  describe("Progress Data Structure", () => {
    it("should validate progress data structure", () => {
      const validProgress: ProgressData = {
        1: {
          stages: {
            learn: true,
            translate: false,
            scramble: true,
            fillGaps: false,
          },
          reviewCompleted: false,
        },
      };

      // Test that the structure is valid
      expect(validProgress[1]).toBeDefined();
      expect(validProgress[1].stages).toBeDefined();
      expect(validProgress[1].stages.learn).toBe(true);
      expect(validProgress[1].stages.translate).toBe(false);
      expect(validProgress[1].stages.scramble).toBe(true);
      expect(validProgress[1].stages.fillGaps).toBe(false);
      expect(validProgress[1].reviewCompleted).toBe(false);
    });

    it("should handle missing progress data gracefully", () => {
      const subcategoryDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );
      const progress: ProgressData = {};

      const result = getSubcategoryProgress(subcategoryDhikr, progress);

      // Should handle missing data without errors
      expect(result.completed).toBe(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.percentage).toBe(0);
      expect(result.isComplete).toBe(false);
    });
  });

  // Test 4: Subcategory filtering
  describe("Subcategory Filtering", () => {
    it("should filter dhikr by category and subcategory correctly", () => {
      const sujoodDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );
      const rukuDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" && dhikr.subcategoryId === "ruku"
      );

      // Each subcategory should have dhikr
      expect(sujoodDhikr.length).toBeGreaterThan(0);
      expect(rukuDhikr.length).toBeGreaterThan(0);

      // All dhikr should have correct category and subcategory
      for (const dhikr of sujoodDhikr) {
        expect(dhikr.categoryId).toBe("during-prayer");
        expect(dhikr.subcategoryId).toBe("sujood");
      }

      for (const dhikr of rukuDhikr) {
        expect(dhikr.categoryId).toBe("during-prayer");
        expect(dhikr.subcategoryId).toBe("ruku");
      }

      // Subcategories should be different
      expect(sujoodDhikr).not.toEqual(rukuDhikr);
    });

    it("should handle non-existent subcategories", () => {
      const nonExistentDhikr = ALL_DHIKR.filter(
        (dhikr) =>
          dhikr.categoryId === "non-existent" &&
          dhikr.subcategoryId === "non-existent"
      );

      expect(nonExistentDhikr.length).toBe(0);
    });
  });

  // Test 5: Progress percentage calculation
  describe("Progress Percentage Calculation", () => {
    it("should calculate percentage correctly for various scenarios", () => {
      const testCases = [
        { completed: 0, total: 5, expected: 0 },
        { completed: 1, total: 5, expected: 20 },
        { completed: 2, total: 5, expected: 40 },
        { completed: 3, total: 5, expected: 60 },
        { completed: 4, total: 5, expected: 80 },
        { completed: 5, total: 5, expected: 100 },
        { completed: 0, total: 0, expected: 0 }, // Edge case
      ];

      for (const testCase of testCases) {
        const mockDhikr = Array(testCase.total)
          .fill(null)
          .map(
            (_, index) =>
              ({
                id: index + 1,
                categoryId: "test",
                subcategoryId: "test",
                arabic: "test",
                translation: "test",
                audioUrl: "test",
              } as Dhikr)
          );

        const progress: ProgressData = {};

        // Mark completed dhikr as complete
        for (let i = 0; i < testCase.completed; i++) {
          progress[i + 1] = {
            stages: {
              learn: true,
              translate: true,
              scramble: true,
              fillGaps: true,
            },
            reviewCompleted: false,
          };
        }

        const result = getSubcategoryProgress(mockDhikr, progress);
        expect(result.percentage).toBe(testCase.expected);
      }
    });
  });
});
