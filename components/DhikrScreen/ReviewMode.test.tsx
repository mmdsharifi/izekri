import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ReviewMode from "./ReviewMode";
import { vi } from "vitest";
import "@testing-library/jest-dom";

const mockDhikrs = [
  {
    id: 1,
    categoryId: "cat1",
    arabic: "ذکر اول",
    translation: "ترجمه اول",
    distractorTranslations: ["غلط۱", "غلط۲"],
    transliteration: "",
    virtue: "",
    audioUrl: "audio1.mp3",
    points: 10,
  },
  {
    id: 2,
    categoryId: "cat1",
    arabic: "ذکر دوم",
    translation: "ترجمه دوم",
    distractorTranslations: ["غلط۳", "غلط۴"],
    transliteration: "",
    virtue: "",
    audioUrl: "audio2.mp3",
    points: 10,
  },
];

describe("ReviewMode", () => {
  it("renders question and options", () => {
    render(
      <ReviewMode dhikrsToReview={[mockDhikrs[0]]} onComplete={vi.fn()} />
    );
    expect(screen.getByText("ذکر اول")).toBeInTheDocument();
    expect(screen.getByText("ترجمه اول")).toBeInTheDocument();
    expect(screen.getByText("غلط۱")).toBeInTheDocument();
    expect(screen.getByText("غلط۲")).toBeInTheDocument();
  });

  it("shows correct answer feedback and next button", () => {
    render(
      <ReviewMode dhikrsToReview={[mockDhikrs[0]]} onComplete={vi.fn()} />
    );
    fireEvent.click(screen.getByText("ترجمه اول"));
    expect(screen.getByText("پاسخ صحیح!")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /سوال بعدی/ })
    ).toBeInTheDocument();
  });

  it("shows wrong answer feedback and try again button", () => {
    render(
      <ReviewMode dhikrsToReview={[mockDhikrs[0]]} onComplete={vi.fn()} />
    );
    fireEvent.click(screen.getByText("غلط۱"));
    expect(screen.getByText("اشتباه بود!")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /تلاش مجدد/ })
    ).toBeInTheDocument();
  });

  it("resets after try again", () => {
    render(
      <ReviewMode dhikrsToReview={[mockDhikrs[0]]} onComplete={vi.fn()} />
    );
    fireEvent.click(screen.getByText("غلط۱"));
    fireEvent.click(screen.getByRole("button", { name: /تلاش مجدد/ }));
    expect(screen.queryByText("اشتباه بود!")).not.toBeInTheDocument();
  });

  it("calls onComplete after last question", () => {
    const onComplete = vi.fn();
    render(<ReviewMode dhikrsToReview={mockDhikrs} onComplete={onComplete} />);
    // سوال اول صحیح
    fireEvent.click(screen.getByText("ترجمه اول"));
    fireEvent.click(screen.getByRole("button", { name: /سوال بعدی/ }));
    // سوال دوم صحیح
    fireEvent.click(screen.getByText("ترجمه دوم"));
    fireEvent.click(screen.getByRole("button", { name: /سوال بعدی/ }));
    expect(onComplete).toHaveBeenCalled();
  });
});
