import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DhikrScreen from "./DhikrScreen";
import { vi } from "vitest";
import * as constants from "../constants";
import type { Category, Dhikr } from "../types";

describe("DhikrScreen FillGaps integration", () => {
  const sampleDhikr: Dhikr = {
    id: 1,
    categoryId: "cat1",
    arabic: "الحمد لله رب العالمین", // جمله کامل برای FillGaps
    translation: "ستایش مخصوص خداوند است، پروردگار جهانیان",
    distractorTranslations: [],
    scrambleChunks: ["الحمد", "لله", "رب", "العالمین"],
    virtue: "شروع سوره فاتحه",
    audioUrl: "audio.mp3",
    points: 10,
    transliteration: "alhamdu lillahi rabbil 'alamin",
  };
  const sampleCategory: Category = {
    id: "cat1",
    dhikrIds: [1],
    title: "سوره فاتحه",
    subtitle: "سوره اول قرآن",
    icon: () => null,
    color: "teal",
  };
  let progressData: {
    completedStages: { [dhikrId: number]: number };
    completedReviews: { [reviewId: string]: boolean };
    score: number;
  };
  let onUpdateProgress: ReturnType<typeof vi.fn>;
  let onCompleteReview: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    progressData = {
      completedStages: { 1: 3 },
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

  async function renderDhikrScreen(props = {}) {
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

  it("FillGaps stage: shows feedback and allows retry until correct", async () => {
    await renderDhikrScreen();
    expect(
      screen.getByText(/کلمه مناسب را برای جای خالی انتخاب کن/)
    ).toBeInTheDocument();
    // گزینه‌ها را پیدا کن
    const optionBtns = screen.getAllByRole("button");
    // گزینه صحیح gap را پیدا کن (gap باید "لله" باشد)
    const correctBtn = screen
      .getAllByText("لله")
      .find((el) => el.tagName === "BUTTON");
    if (!correctBtn) throw new Error("Correct button for لله not found");
    // انتخاب گزینه اشتباه (مثلاً الحمد)
    const wrongBtn = screen
      .getAllByText("الحمد")
      .find((el) => el.tagName === "BUTTON");
    if (!wrongBtn) throw new Error("Wrong button for الحمد not found");
    fireEvent.click(screen.getByTestId("gap-span-0"));
    await waitFor(() => {
      expect(screen.getByTestId("gap-span-0")).toHaveClass("ring-2");
      expect(correctBtn).not.toBeDisabled();
    });
    fireEvent.click(correctBtn);
    await waitFor(() => {
      expect(screen.getByTestId("gap-span-0")).toHaveTextContent("لله");
    });
  });

  it("does not show bottom tab bar during dhikr/quiz", async () => {
    const mockCategory = {
      id: "cat1",
      dhikrIds: [1],
      title: "دسته تست",
      subtitle: "",
      icon: () => null,
      color: "teal",
    };
    const mockProgress = {
      completedStages: {},
      completedReviews: {},
      score: 0,
    };
    const noop = () => {};
    const { container } = render(
      <DhikrScreen
        category={mockCategory}
        progressData={mockProgress}
        onUpdateProgress={noop}
        onCompleteReview={noop}
        onBack={noop}
        sessionStartTime={Date.now()}
      />
    );
    expect(
      container.querySelector('[data-testid="bottom-tab-bar"]')
    ).toBeNull();
  });
});
