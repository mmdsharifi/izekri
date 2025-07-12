import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StageFillGaps from "./StageFillGaps";
import { vi } from "vitest";
import "@testing-library/jest-dom";

describe("StageFillGaps", () => {
  const baseProps = {
    sentenceParts: ["الحمد", "", "رب العالمین"],
    options: ["لله", "کتاب", "شکر"],
    filled: [null],
    answerState: { isCorrect: null, message: "" },
    onSelect: vi.fn(),
    onGapClick: vi.fn(),
    onTryAgain: vi.fn(),
    onContinue: vi.fn(),
    correct: "لله",
    disabled: false,
  };

  it("renders sentence with gap and options", () => {
    render(<StageFillGaps {...baseProps} />);
    expect(screen.getByText("الحمد")).toBeInTheDocument();
    expect(screen.getByText("رب العالمین")).toBeInTheDocument();
    baseProps.options.forEach((opt) => {
      expect(screen.getByText(opt)).toBeInTheDocument();
    });
    expect(screen.getByText("____")).toBeInTheDocument();
  });

  it("shows selected word in gap", () => {
    render(<StageFillGaps {...baseProps} filled={["لله"]} />);
    // باید span مربوط به gap مقدار لله را داشته باشد
    const gapSpan = screen.getByTestId("gap-span-0");
    expect(gapSpan).toHaveTextContent("لله");
  });

  it("calls onSelect when option clicked for active gap", () => {
    const onSelect = vi.fn();
    render(<StageFillGaps {...baseProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("لله"));
    expect(onSelect).toHaveBeenCalledWith("لله", 0);
  });

  it("calls onGapClick when gap is clicked and filled", () => {
    const onGapClick = vi.fn();
    render(
      <StageFillGaps {...baseProps} filled={["لله"]} onGapClick={onGapClick} />
    );
    const gapSpan = screen.getByTestId("gap-span-0");
    fireEvent.click(gapSpan);
    expect(onGapClick).toHaveBeenCalledWith(0);
  });

  it("shows success message and continue button", () => {
    render(
      <StageFillGaps
        {...baseProps}
        filled={["لله"]}
        answerState={{ isCorrect: true, message: "آفرین!" }}
      />
    );
    expect(screen.getByText("آفرین!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ادامه/ })).toBeInTheDocument();
  });

  it("shows error message, correct answer and try again button", () => {
    render(
      <StageFillGaps
        {...baseProps}
        filled={["کتاب"]}
        answerState={{ isCorrect: false, message: "اشتباه بود!" }}
      />
    );
    expect(screen.getByText("اشتباه بود!")).toBeInTheDocument();
    expect(screen.getByText("پاسخ صحیح:")).toBeInTheDocument();
    // باید حداقل یک المنت با متن لله وجود داشته باشد (در پیام یا دکمه)
    expect(screen.getAllByText("لله").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /تلاش مجدد/ })
    ).toBeInTheDocument();
  });

  it("calls onTryAgain and onContinue", () => {
    const onTryAgain = vi.fn();
    const onContinue = vi.fn();
    // حالت خطا
    render(
      <StageFillGaps
        {...baseProps}
        filled={["کتاب"]}
        answerState={{ isCorrect: false, message: "خطا" }}
        onTryAgain={onTryAgain}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /تلاش مجدد/ }));
    expect(onTryAgain).toHaveBeenCalled();
    // حالت موفقیت
    render(
      <StageFillGaps
        {...baseProps}
        filled={["لله"]}
        answerState={{ isCorrect: true, message: "موفق" }}
        onContinue={onContinue}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /ادامه/ }));
    expect(onContinue).toHaveBeenCalled();
  });

  it("handles multiple gaps and repeated words", () => {
    // جمله: ["بسم", "", "الله", "", "اکبر"], gaps: 2
    const props = {
      ...baseProps,
      sentenceParts: ["بسم", "", "الله", "", "اکبر"],
      options: ["الله", "الرحمن"],
      filled: [null, null],
    };
    render(<StageFillGaps {...props} />);
    // دو جای خالی باید وجود داشته باشد
    expect(screen.getByTestId("gap-span-0")).toHaveTextContent("____");
    expect(screen.getByTestId("gap-span-1")).toHaveTextContent("____");
    // انتخاب اولین gap و کلیک روی گزینه (دکمه)
    const optionBtns = screen.getAllByRole("button", { name: "الله" });
    fireEvent.click(optionBtns[0]);
    // (در تست واقعی باید state مدیریت شود، اینجا فقط رندر را چک می‌کنیم)
  });

  it("shows correct/incorrect feedback when all gaps are filled", () => {
    // فرض: دو gap داریم و جواب صحیح ["الله", "الرحمن"] است
    const answerState = { isCorrect: null, message: "" };
    const correct = "الله الرحمن";
    const base = {
      sentenceParts: ["بسم", "", "الله", "", "اکبر"],
      options: ["الله", "الرحمن"],
      filled: ["الله", "الرحمن"],
      answerState,
      onSelect: vi.fn(),
      onGapClick: vi.fn(),
      onTryAgain: vi.fn(),
      onContinue: vi.fn(),
      correct,
      disabled: false,
    };
    // حالت صحیح
    const { rerender } = render(
      <StageFillGaps
        {...base}
        answerState={{ isCorrect: true, message: "آفرین!" }}
      />
    );
    expect(screen.getByText("آفرین!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ادامه/ })).toBeInTheDocument();
    // حالت غلط
    rerender(
      <StageFillGaps
        {...base}
        filled={["الله", "اشتباه"]}
        answerState={{ isCorrect: false, message: "اشتباه بود!" }}
      />
    );
    expect(screen.getByText("اشتباه بود!")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /تلاش مجدد/ })
    ).toBeInTheDocument();
  });
});
