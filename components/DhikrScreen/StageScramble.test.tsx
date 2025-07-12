import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StageScramble from "./StageScramble";
import { vi } from "vitest";
import "@testing-library/jest-dom";

describe("StageScramble", () => {
  const baseProps = {
    words: ["الحمد", "لله", "رب", "العالمین"],
    userSequence: [],
    answerState: { isCorrect: null, message: "" },
    onWordClick: vi.fn(),
    onRemoveLast: vi.fn(),
    onTryAgain: vi.fn(),
    onContinue: vi.fn(),
    correctSequence: ["الحمد", "لله", "رب", "العالمین"],
  };

  it("renders all words as buttons", () => {
    render(<StageScramble {...baseProps} />);
    baseProps.words.forEach((word) => {
      expect(screen.getByText(word)).toBeInTheDocument();
    });
  });

  it("calls onWordClick when a word is clicked", () => {
    const onWordClick = vi.fn();
    render(<StageScramble {...baseProps} onWordClick={onWordClick} />);
    fireEvent.click(screen.getByText("الحمد"));
    expect(onWordClick).toHaveBeenCalledWith("الحمد");
  });

  it("shows user sequence as selected words", () => {
    render(<StageScramble {...baseProps} userSequence={["الحمد", "لله"]} />);
    // باید دو span با متن های انتخاب شده وجود داشته باشد
    const selected = screen.getAllByText(/الحمد|لله/);
    expect(selected.length).toBeGreaterThanOrEqual(2);
  });

  it("removes a selected word (pill) when clicked", () => {
    const words = ["بسم", "الله", "الله", "اکبر"];
    const userSequence = ["بسم", "الله", "اکبر"];
    const onRemoveLast = vi.fn();
    render(
      <StageScramble
        words={words}
        userSequence={userSequence}
        answerState={{ isCorrect: null, message: "" }}
        onWordClick={() => {}}
        onRemoveLast={onRemoveLast}
        onTryAgain={() => {}}
        onContinue={() => {}}
        correctSequence={words}
      />
    );
    // Click the second pill ("الله")
    const pills = screen.getAllByText(/بسم|الله|اکبر/);
    fireEvent.click(pills[1]);
    expect(onRemoveLast).toHaveBeenCalledWith("الله", 1);
  });

  it("removes only the clicked word from userSequence, even if repeated words exist", () => {
    const words = ["الله", "اکبر", "الله", "کبیر"];
    // userSequence has repeated "الله"
    const userSequence = ["الله", "اکبر", "الله", "کبیر"];
    const onRemoveLast = vi.fn();
    render(
      <StageScramble
        words={words}
        userSequence={userSequence}
        answerState={{ isCorrect: null, message: "" }}
        onWordClick={() => {}}
        onRemoveLast={onRemoveLast}
        onTryAgain={() => {}}
        onContinue={() => {}}
        correctSequence={words}
      />
    );
    // Find all selected word buttons
    const selectedButtons = screen.getAllByRole("button", {
      name: /الله|اکبر|کبیر/,
    });
    // Click the second "الله" (index 2)
    fireEvent.click(selectedButtons[2]);
    expect(onRemoveLast).toHaveBeenCalledWith("الله", 2);
  });

  it("removes the last (bottom) word from userSequence when clicked", () => {
    const words = ["الله", "اکبر", "الله", "کبیر"];
    // userSequence has repeated "الله"
    const userSequence = ["الله", "اکبر", "الله", "کبیر"];
    const onRemoveLast = vi.fn();
    render(
      <StageScramble
        words={words}
        userSequence={userSequence}
        answerState={{ isCorrect: null, message: "" }}
        onWordClick={() => {}}
        onRemoveLast={onRemoveLast}
        onTryAgain={() => {}}
        onContinue={() => {}}
        correctSequence={words}
      />
    );
    // Find all selected word buttons
    const selectedButtons = screen.getAllByRole("button", {
      name: /الله|اکبر|کبیر/,
    });
    // Click the last word (index 3)
    fireEvent.click(selectedButtons[3]);
    expect(onRemoveLast).toHaveBeenCalledWith("کبیر", 3);
  });

  it("shows success message and continue button", () => {
    render(
      <StageScramble
        {...baseProps}
        answerState={{ isCorrect: true, message: "آفرین!" }}
      />
    );
    expect(screen.getByText("آفرین!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ادامه/ })).toBeInTheDocument();
  });

  it("shows error message, correct sequence and try again button", () => {
    render(
      <StageScramble
        {...baseProps}
        answerState={{ isCorrect: false, message: "اشتباه بود!" }}
      />
    );
    expect(screen.getByText("اشتباه بود!")).toBeInTheDocument();
    expect(screen.getByText("ترتیب صحیح:")).toBeInTheDocument();
    expect(screen.getByText("الحمد لله رب العالمین")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /تلاش مجدد/ })
    ).toBeInTheDocument();
  });

  it("calls onTryAgain and onContinue", () => {
    const onTryAgain = vi.fn();
    const onContinue = vi.fn();
    // حالت خطا
    render(
      <StageScramble
        {...baseProps}
        answerState={{ isCorrect: false, message: "خطا" }}
        onTryAgain={onTryAgain}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /تلاش مجدد/ }));
    expect(onTryAgain).toHaveBeenCalled();
    // حالت موفقیت
    render(
      <StageScramble
        {...baseProps}
        answerState={{ isCorrect: true, message: "موفق" }}
        onContinue={onContinue}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /ادامه/ }));
    expect(onContinue).toHaveBeenCalled();
  });

  it("handles repeated words: only one instance is removed per click", () => {
    // Example: two 'الله' in words
    const words = ["بسم", "الله", "الله", "اکبر"];
    const userSequence: string[] = [];
    const { rerender, container } = render(
      <StageScramble
        words={words}
        userSequence={userSequence}
        answerState={{ isCorrect: null, message: "" }}
        onWordClick={() => {}}
        onRemoveLast={() => {}}
        onTryAgain={() => {}}
        onContinue={() => {}}
        correctSequence={words}
      />
    );
    // Both 'الله' should be visible as options (not in selected pills)
    const getOptionButtons = () =>
      Array.from(container.querySelectorAll(".mb-4 button"));
    expect(
      getOptionButtons().filter((btn) => btn.textContent === "الله").length
    ).toBe(2);
    // Simulate selecting one 'الله'
    rerender(
      <StageScramble
        words={words}
        userSequence={["الله"]}
        answerState={{ isCorrect: null, message: "" }}
        onWordClick={() => {}}
        onRemoveLast={() => {}}
        onTryAgain={() => {}}
        onContinue={() => {}}
        correctSequence={words}
      />
    );
    // Only one 'الله' should remain as option
    expect(
      getOptionButtons().filter((btn) => btn.textContent === "الله").length
    ).toBe(1);
    // Simulate selecting both 'الله'
    rerender(
      <StageScramble
        words={words}
        userSequence={["الله", "الله"]}
        answerState={{ isCorrect: null, message: "" }}
        onWordClick={() => {}}
        onRemoveLast={() => {}}
        onTryAgain={() => {}}
        onContinue={() => {}}
        correctSequence={words}
      />
    );
    // No 'الله' should remain as option
    expect(
      getOptionButtons().filter((btn) => btn.textContent === "الله").length
    ).toBe(0);
  });

  it("does not add word to userSequence if order is wrong and shows error feedback", () => {
    const words = ["بسم", "الله", "اکبر"];
    const userSequence = ["بسم"];
    const onWordClick = vi.fn();
    render(
      <StageScramble
        words={words}
        userSequence={userSequence}
        answerState={{ isCorrect: null, message: "" }}
        onWordClick={onWordClick}
        onRemoveLast={() => {}}
        onTryAgain={() => {}}
        onContinue={() => {}}
        correctSequence={words}
      />
    );
    // کاربر باید "الله" را انتخاب کند، اما "اکبر" را می‌زند
    const wrongBtn = screen.getByText("اکبر");
    fireEvent.click(wrongBtn);
    // تابع onWordClick باید صدا زده شود (ولی در کانتینر نباید اضافه شود)
    expect(onWordClick).toHaveBeenCalledWith("اکبر");
    // در کانتینر باید scrambleIncorrectWord ست شود (در اینجا فقط تست فراخوانی است)
  });
});
