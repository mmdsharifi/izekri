import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CategorySummaryView from "./CategorySummaryView";
import { vi } from "vitest";
import "@testing-library/jest-dom";

describe("CategorySummaryView", () => {
  it("renders score, duration, and finish button", () => {
    const onFinish = vi.fn();
    render(
      <CategorySummaryView score={123} duration={75} onFinish={onFinish} />
    );
    expect(screen.getByText("123")).toBeInTheDocument();
    // بررسی وجود زمان به صورت رشته کامل با matcher تابعی
    expect(
      screen.getByText((content, node) => {
        const hasText = (node: Element | null) =>
          node?.textContent?.replace(/\s+/g, "") === "1m15s";
        const nodeHasText = hasText(node as Element);
        const childrenDontHaveText = Array.from(node?.children || []).every(
          (child) => !hasText(child as Element)
        );
        return nodeHasText && childrenDontHaveText;
      })
    ).toBeInTheDocument();
    expect(screen.getAllByText("m")[0]).toBeInTheDocument();
    expect(screen.getAllByText("s")[0]).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /بازگشت به صفحه اصلی/ });
    fireEvent.click(btn);
    expect(onFinish).toHaveBeenCalled();
  });
});
