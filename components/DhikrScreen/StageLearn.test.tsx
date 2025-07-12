import React from "react";
import { render, screen } from "@testing-library/react";
import StageLearn from "./StageLearn";
import "@testing-library/jest-dom";

describe("StageLearn", () => {
  it("renders arabic, translation, and virtue", () => {
    render(
      <StageLearn
        arabic="الحمد لله"
        translation="سپاس برای خداست"
        virtue="ذکری برای شکرگزاری"
      />
    );
    expect(screen.getByText("الحمد لله")).toBeInTheDocument();
    expect(screen.getByText("سپاس برای خداست")).toBeInTheDocument();
    expect(screen.getByText("ذکری برای شکرگزاری")).toBeInTheDocument();
    expect(screen.getByText("فضیلت و کاربرد:")).toBeInTheDocument();
  });
});
