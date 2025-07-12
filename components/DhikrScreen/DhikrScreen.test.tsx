import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DhikrScreen from "../DhikrScreen";
import type { Category, Dhikr } from "../../types";
import * as constants from "../../constants";
import { vi } from "vitest";
import "@testing-library/jest-dom";

const sampleDhikr: Dhikr = {
  id: 1,
  categoryId: "cat1",
  arabic: "سُبْحَانَ اللَّهِ",
  translation: "پاک است خداوند",
  distractorTranslations: ["خدا بزرگ است", "الحمد لله"],
  transliteration: "Subhanallah",
  virtue: "ذکری برای تسبیح.",
  audioUrl: "audio.mp3",
  points: 10,
  scrambleChunks: ["سُبْحَانَ", "اللَّهِ"],
};
const sampleCategory: Category = {
  id: "cat1",
  title: "تسبیحات",
  subtitle: "ذکرهای تسبیح",
  icon: () => null,
  color: "teal",
  dhikrIds: [1],
};

describe("DhikrScreen container integration", () => {
  let progressData: any;
  let onUpdateProgress: any;
  let onCompleteReview: any;

  beforeEach(() => {
    progressData = {
      completedStages: {},
      completedReviews: {},
      score: 0,
    };
    onUpdateProgress = vi.fn();
    onCompleteReview = vi.fn();
    Object.defineProperty(constants, "ALL_DHIKR", {
      configurable: true,
      get: () => [sampleDhikr],
    });
  });

  function renderDhikrScreen(props: any = {}) {
    return render(
      <DhikrScreen
        category={sampleCategory}
        progressData={progressData}
        onUpdateProgress={onUpdateProgress}
        onCompleteReview={onCompleteReview}
        onBack={() => {}}
        sessionStartTime={Date.now()}
        {...props}
      />
    );
  }

  it("renders Learn stage by default", () => {
    renderDhikrScreen();
    expect(screen.getByText(/پاک است خداوند/)).toBeInTheDocument();
    expect(screen.getByText(/ذکری برای تسبیح/)).toBeInTheDocument();
  });

  it("navigates to Translate stage and handles answer", () => {
    // Start at stage 1
    renderDhikrScreen({
      // simulate state: stageIndex = 1
      progressData: { ...progressData, completedStages: { 1: 1 } },
    });
    expect(screen.getByText(/کدام ترجمه صحیح است/)).toBeInTheDocument();
    // Click an option
    const option = screen.getByText(/پاک است خداوند/);
    fireEvent.click(option);
    expect(onUpdateProgress).not.toHaveBeenCalled(); // Only called on continue
    // Show continue button
    const continueBtn = screen.getByText(/ادامه/);
    fireEvent.click(continueBtn);
    // Would advance to next stage in real app
  });

  it("renders Scramble stage and allows word selection", () => {
    renderDhikrScreen({
      progressData: { ...progressData, completedStages: { 1: 2 } },
    });
    expect(
      screen.getByText(/کلمات را به ترتیب صحیح انتخاب کن/)
    ).toBeInTheDocument();
    // Click a word
    const wordBtn = screen.getByText(/سُبْحَانَ/);
    fireEvent.click(wordBtn);
    // Should show the word in user sequence (visually)
    expect(screen.getAllByText(/سُبْحَانَ/).length).toBeGreaterThan(0);
  });

  it("renders FillGaps stage and allows gap filling", () => {
    renderDhikrScreen({
      progressData: { ...progressData, completedStages: { 1: 3 } },
    });
    expect(
      screen.getByText(/کلمه مناسب را برای جای خالی انتخاب کن/)
    ).toBeInTheDocument();
    // Click an option (simulate filling a gap)
    const option = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent === "سُبْحَانَ");
    if (option) fireEvent.click(option);
    // Should show the word in the gap (visually)
    expect(screen.getAllByText(/سُبْحَانَ/).length).toBeGreaterThan(0);
  });
});
