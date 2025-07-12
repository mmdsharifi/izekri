import React from "react";
import { render } from "@testing-library/react";
import ProgressStepper from "./ProgressStepper";

describe("ProgressStepper", () => {
  it("renders correct number of steps and highlights current", () => {
    const { container } = render(<ProgressStepper current={2} total={4} />);
    const dots = container.querySelectorAll("div.w-3.h-3");
    expect(dots.length).toBe(4);
    // نقطه فعال باید scale-125 داشته باشد
    expect(dots[2].className).toMatch(/scale-125/);
    // نقاط قبل از current باید فقط bg-teal-500 داشته باشند
    expect(dots[0].className).toMatch(/bg-teal-500/);
    expect(dots[1].className).toMatch(/bg-teal-500/);
    // نقاط بعدی باید bg-gray-300 داشته باشند
    expect(dots[3].className).toMatch(/bg-gray-300/);
  });
});
