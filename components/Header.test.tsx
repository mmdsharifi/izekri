import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "./Header";
import "@testing-library/jest-dom";
import { vi } from "vitest";

describe("Header", () => {
  it("renders total score", () => {
    render(
      <Header isDarkMode={false} toggleDarkMode={() => {}} totalScore={42} />
    );
    // Find the diamond emoji by role, then check its parent for the score
    const diamond = screen.getByRole("img", { name: "diamond" });
    expect(diamond).toBeInTheDocument();
    expect(diamond.parentElement).toHaveTextContent("42");
  });

  it("renders progress bar and stepper when in category", () => {
    const { getByTestId } = render(
      <Header
        isDarkMode={false}
        toggleDarkMode={() => {}}
        totalScore={100}
        categoryTitle="دسته تست"
        progressPercent={75}
        stageIndex={2}
        totalStages={4}
      />
    );
    const diamond = screen.getByRole("img", { name: "diamond" });
    expect(diamond).toBeInTheDocument();
    expect(diamond.parentElement).toHaveTextContent("100");
    // Progress bar
    expect(getByTestId("progress-bar-inner").style.width).toBe("75%");
    // چهار دایره مرحله باید وجود داشته باشد (stepper dots)
    expect(screen.getAllByTestId("step-dot").length).toBe(4);
  });

  it("renders with 0% progress", () => {
    const { getByTestId } = render(
      <Header
        isDarkMode={false}
        toggleDarkMode={() => {}}
        totalScore={0}
        progressPercent={0}
        stageIndex={0}
        totalStages={1}
        categoryTitle="تست"
      />
    );
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("0%");
  });
  it("renders with 50% progress", () => {
    const { getByTestId } = render(
      <Header
        isDarkMode={false}
        toggleDarkMode={() => {}}
        totalScore={0}
        progressPercent={50}
        stageIndex={0}
        totalStages={1}
        categoryTitle="تست"
      />
    );
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("50%");
  });
  it("renders with 100% progress", () => {
    const { getByTestId } = render(
      <Header
        isDarkMode={false}
        toggleDarkMode={() => {}}
        totalScore={0}
        progressPercent={100}
        stageIndex={0}
        totalStages={1}
        categoryTitle="تست"
      />
    );
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("100%");
  });
  it("clamps negative progress to 0%", () => {
    const { getByTestId } = render(
      <Header
        isDarkMode={false}
        toggleDarkMode={() => {}}
        totalScore={0}
        progressPercent={-20}
        stageIndex={0}
        totalStages={1}
        categoryTitle="تست"
      />
    );
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("0%");
  });
  it("clamps progress over 100 to 100%", () => {
    const { getByTestId } = render(
      <Header
        isDarkMode={false}
        toggleDarkMode={() => {}}
        totalScore={0}
        progressPercent={150}
        stageIndex={0}
        totalStages={1}
        categoryTitle="تست"
      />
    );
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("100%");
  });

  it("calls toggleDarkMode when dark mode button is clicked", () => {
    const toggleDarkMode = vi.fn();
    render(
      <Header
        isDarkMode={false}
        toggleDarkMode={toggleDarkMode}
        totalScore={0}
      />
    );
    const btn = screen.getByRole("button", { name: /dark mode/i });
    btn && btn.click();
    expect(toggleDarkMode).toHaveBeenCalled();
  });
});
