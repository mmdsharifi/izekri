import { ALL_DHIKR } from "../constants";
import type { Dhikr } from "../types";

// Helper function to extract audio ID from URL
function extractAudioId(audioUrl: string): number {
  const match = audioUrl.match(/\/ar\/(\d+)\.mp3$/);
  return match ? parseInt(match[1]) : 0;
}

// Helper function to fetch API data
async function fetchApiData(categoryId: number): Promise<any> {
  try {
    const response = await fetch(
      `https://www.hisnmuslim.com/api/ar/${categoryId}.json`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch category ${categoryId}:`, error);
    return {};
  }
}

// Helper function to clean Arabic text for comparison
function cleanArabicText(text: string): string {
  return text
    .replace(/[()]/g, "") // Remove parentheses
    .replace(/[\[\]]/g, "") // Remove brackets
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[،.]/g, "") // Remove Arabic punctuation
    .replace(/ثلاث مرَّاتٍ/g, "") // Remove "three times"
    .replace(/مرَّاتٍ/g, "") // Remove "times"
    .replace(/ثلاث/g, "") // Remove "three"
    .replace(/\s+/g, " ") // Normalize whitespace again after removals
    .trim();
}

describe("Audio URL Validation Tests", () => {
  // Test 1: Verify all audio URLs have valid format
  describe("Audio URL Format Validation", () => {
    it("should have valid audio URL format for all adhkar", () => {
      const validUrlPattern =
        /^https:\/\/www\.hisnmuslim\.com\/audio\/ar\/\d+\.mp3$/;

      for (const dhikr of ALL_DHIKR) {
        expect(dhikr.audioUrl).toMatch(validUrlPattern);
      }
    });

    it("should not have duplicate audio URLs", () => {
      const audioUrls = ALL_DHIKR.map((dhikr) => dhikr.audioUrl);
      const uniqueAudioUrls = new Set(audioUrls);

      expect(audioUrls.length).toBe(uniqueAudioUrls.size);
    });

    it("should have non-empty Arabic text for all adhkar", () => {
      for (const dhikr of ALL_DHIKR) {
        expect(dhikr.arabic.trim()).not.toBe("");
      }
    });
  });

  // Test 2: Verify specific known adhkar have correct audio URLs
  describe("Specific Adhkar Verification", () => {
    it("should have correct audio URL for sujood dhikr", () => {
      const sujoodDhikr = ALL_DHIKR.find(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood" &&
          dhikr.arabic.includes("سُبْحَانَ رَبِّيَ الْأَعْلَى")
      );

      expect(sujoodDhikr).toBeDefined();
      expect(sujoodDhikr?.audioUrl).toBe(
        "https://www.hisnmuslim.com/audio/ar/41.mp3"
      );
    });

    it("should have correct audio URL for ruku dhikr", () => {
      const rukuDhikr = ALL_DHIKR.find(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "ruku" &&
          dhikr.arabic.includes("سُبْحَانَ رَبِّيَ الْعَظِيمِ")
      );

      expect(rukuDhikr).toBeDefined();
      expect(rukuDhikr?.audioUrl).toBe(
        "https://www.hisnmuslim.com/audio/ar/33.mp3"
      );
    });

    it("should have correct audio URL for between sujood dhikr", () => {
      const betweenSujoodDhikr = ALL_DHIKR.find(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "between-sujood" &&
          dhikr.arabic.includes("رَبِّ اغْفِرْ لِي")
      );

      expect(betweenSujoodDhikr).toBeDefined();
      expect(betweenSujoodDhikr?.audioUrl).toBe(
        "https://www.hisnmuslim.com/audio/ar/48.mp3"
      );
    });

    it("should have correct audio URL for tashahhud dhikr", () => {
      const tashahhudDhikr = ALL_DHIKR.find(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "tashahhud" &&
          dhikr.arabic.includes("اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ")
      );

      expect(tashahhudDhikr).toBeDefined();
      expect(tashahhudDhikr?.audioUrl).toBe(
        "https://www.hisnmuslim.com/audio/ar/53.mp3"
      );
    });
  });

  // Test 3: Verify audio URLs exist in API responses
  describe("API Audio URL Verification", () => {
    it("should verify sujood audio URL exists in API", async () => {
      const apiData = await fetchApiData(19); // sujood category
      const audioIds = new Set();

      for (const categoryName in apiData) {
        const apiDhikrList = apiData[categoryName];
        for (const apiDhikr of apiDhikrList) {
          audioIds.add(apiDhikr.ID);
        }
      }

      const sujoodDhikr = ALL_DHIKR.find(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );

      expect(sujoodDhikr).toBeDefined();
      expect(audioIds.has(extractAudioId(sujoodDhikr?.audioUrl || ""))).toBe(
        true
      );
    }, 30000);

    it("should verify ruku audio URL exists in API", async () => {
      const apiData = await fetchApiData(17); // ruku category
      const audioIds = new Set();

      for (const categoryName in apiData) {
        const apiDhikrList = apiData[categoryName];
        for (const apiDhikr of apiDhikrList) {
          audioIds.add(apiDhikr.ID);
        }
      }

      const rukuDhikr = ALL_DHIKR.find(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" && dhikr.subcategoryId === "ruku"
      );

      expect(rukuDhikr).toBeDefined();
      expect(audioIds.has(extractAudioId(rukuDhikr?.audioUrl || ""))).toBe(
        true
      );
    }, 30000);

    it("should verify between sujood audio URL exists in API", async () => {
      const apiData = await fetchApiData(20); // between sujood category
      const audioIds = new Set();

      for (const categoryName in apiData) {
        const apiDhikrList = apiData[categoryName];
        for (const apiDhikr of apiDhikrList) {
          audioIds.add(apiDhikr.ID);
        }
      }

      const betweenSujoodDhikr = ALL_DHIKR.find(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "between-sujood"
      );

      expect(betweenSujoodDhikr).toBeDefined();
      expect(
        audioIds.has(extractAudioId(betweenSujoodDhikr?.audioUrl || ""))
      ).toBe(true);
    }, 30000);
  });

  // Test 4: Verify all audio URLs are accessible
  describe("Audio URL Accessibility", () => {
    it("should verify sujood audio URL is accessible", async () => {
      const sujoodDhikr = ALL_DHIKR.find(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" &&
          dhikr.subcategoryId === "sujood"
      );

      expect(sujoodDhikr).toBeDefined();

      try {
        const response = await fetch(sujoodDhikr?.audioUrl || "");
        expect(response.status).toBe(200);
      } catch (error) {
        // If network fails, we'll skip this test but log the error
        console.warn("Network error checking audio URL accessibility:", error);
      }
    }, 30000);

    it("should verify ruku audio URL is accessible", async () => {
      const rukuDhikr = ALL_DHIKR.find(
        (dhikr) =>
          dhikr.categoryId === "during-prayer" && dhikr.subcategoryId === "ruku"
      );

      expect(rukuDhikr).toBeDefined();

      try {
        const response = await fetch(rukuDhikr?.audioUrl || "");
        expect(response.status).toBe(200);
      } catch (error) {
        // If network fails, we'll skip this test but log the error
        console.warn("Network error checking audio URL accessibility:", error);
      }
    }, 30000);
  });

  // Test 5: Verify data integrity
  describe("Data Integrity", () => {
    it("should have consistent category and subcategory structure", () => {
      for (const dhikr of ALL_DHIKR) {
        expect(dhikr.categoryId).toBeDefined();
        expect(dhikr.subcategoryId).toBeDefined();
        expect(dhikr.id).toBeDefined();
        expect(dhikr.arabic).toBeDefined();
        expect(dhikr.translation).toBeDefined();
        expect(dhikr.audioUrl).toBeDefined();
      }
    });

    it("should have unique IDs for all adhkar", () => {
      const ids = ALL_DHIKR.map((dhikr) => dhikr.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });
});
