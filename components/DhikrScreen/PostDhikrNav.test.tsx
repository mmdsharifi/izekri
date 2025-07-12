import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PostDhikrNav from "./PostDhikrNav";
import { vi } from "vitest";

describe("PostDhikrNav", () => {
  it("renders next and dashboard buttons and calls handlers", () => {
    const onNext = vi.fn();
    const onDashboard = vi.fn();
    render(<PostDhikrNav onNext={onNext} onDashboard={onDashboard} />);
    const nextBtn = screen.getByRole("button", { name: /ذکر بعدی/ });
    const dashBtn = screen.getByRole("button", { name: /بازگشت به صفحه اصلی/ });
    fireEvent.click(nextBtn);
    fireEvent.click(dashBtn);
    expect(onNext).toHaveBeenCalled();
    expect(onDashboard).toHaveBeenCalled();
  });
});
