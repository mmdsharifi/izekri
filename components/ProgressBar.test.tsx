import React from "react";
import { render } from "@testing-library/react";
import ProgressBar from "./ProgressBar";
import "@testing-library/jest-dom";

describe("ProgressBar", () => {
  it("renders with 0% progress", () => {
    const { getByTestId } = render(<ProgressBar progress={0} />);
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("0%");
  });
  it("renders with 50% progress", () => {
    const { getByTestId } = render(<ProgressBar progress={50} />);
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("50%");
  });
  it("renders with 100% progress", () => {
    const { getByTestId } = render(<ProgressBar progress={100} />);
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("100%");
  });
  it("clamps negative progress to 0%", () => {
    const { getByTestId } = render(<ProgressBar progress={-20} />);
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("0%");
  });
  it("clamps progress over 100 to 100%", () => {
    const { getByTestId } = render(<ProgressBar progress={150} />);
    const bar = getByTestId("progress-bar-inner");
    expect(bar.style.width).toBe("100%");
  });
});
