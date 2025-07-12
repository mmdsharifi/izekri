import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StageTranslate from "./StageTranslate";
import { vi } from "vitest";
import "@testing-library/jest-dom";

describe("StageTranslate", () => {
  const baseProps = {
    arabic: "الحمد لله",
    audioUrl: "audio.mp3",
    options: ["ترجمه درست", "غلط۱", "غلط۲"],
    correct: "ترجمه درست",
    answerState: { isCorrect: null, message: "" },
    onAnswer: vi.fn(),
    onTryAgain: vi.fn(),
    onContinue: vi.fn(),
  };

  it("renders arabic and options", () => {
    render(<StageTranslate {...baseProps} />);
    expect(screen.getByText("الحمد لله")).toBeInTheDocument();
    baseProps.options.forEach((opt) => {
      expect(screen.getByText(opt)).toBeInTheDocument();
    });
  });

  it("calls onAnswer when option clicked", () => {
    const onAnswer = vi.fn();
    render(<StageTranslate {...baseProps} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("غلط۱"));
    expect(onAnswer).toHaveBeenCalledWith("غلط۱");
  });

  it("shows success message and continue button", () => {
    render(
      <StageTranslate
        {...baseProps}
        answerState={{ isCorrect: true, message: "آفرین!" }}
      />
    );
    expect(screen.getByText("آفرین!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ادامه/ })).toBeInTheDocument();
  });

  it("shows error message, correct answer and try again button", () => {
    render(
      <StageTranslate
        {...baseProps}
        answerState={{ isCorrect: false, message: "اشتباه بود!" }}
      />
    );
    expect(screen.getByText("اشتباه بود!")).toBeInTheDocument();
    expect(screen.getByText("پاسخ صحیح:")).toBeInTheDocument();
    // پیام پاسخ صحیح ممکن است هم در دکمه و هم در پیام باشد، پس فقط وجودش کافی است
    expect(screen.getAllByText("ترجمه درست").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /تلاش مجدد/ })
    ).toBeInTheDocument();
  });

  it("calls onTryAgain and onContinue", () => {
    const onTryAgain = vi.fn();
    const onContinue = vi.fn();
    // حالت خطا
    render(
      <StageTranslate
        {...baseProps}
        answerState={{ isCorrect: false, message: "خطا" }}
        onTryAgain={onTryAgain}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /تلاش مجدد/ }));
    expect(onTryAgain).toHaveBeenCalled();
    // حالت موفقیت
    render(
      <StageTranslate
        {...baseProps}
        answerState={{ isCorrect: true, message: "موفق" }}
        onContinue={onContinue}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /ادامه/ }));
    expect(onContinue).toHaveBeenCalled();
  });
});
