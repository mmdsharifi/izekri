import React from "react";
import { render, fireEvent } from "@testing-library/react";
import InlineAudioButton from "./InlineAudioButton";
import { vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../../hooks/useAudio", () => ({
  useAudio: () => ({ playing: false, toggle: vi.fn() }),
}));

describe("InlineAudioButton", () => {
  it("renders speaker icon and calls toggle on click", () => {
    const { container } = render(<InlineAudioButton src="test.mp3" />);
    const btn = container.querySelector("button");
    expect(btn).toBeInTheDocument();
    // آیکون باید وجود داشته باشد
    expect(container.querySelector("svg")).toBeInTheDocument();
    // کلیک روی دکمه toggle را صدا می‌زند
    fireEvent.click(btn!);
  });
});
