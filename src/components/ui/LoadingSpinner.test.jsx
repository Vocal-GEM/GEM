import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "./LoadingSpinner";
import React from "react";

describe("LoadingSpinner", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-live", "polite");

    // Check for visually hidden label
    expect(screen.getByText("Loading...")).toHaveClass("sr-only");
  });

  it("applies custom size", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    // Check for size classes (implementation detail, but good for regression)
    // lg uses w-16 h-16
    const inner = container.querySelector(".w-16");
    expect(inner).toBeInTheDocument();
  });

  it("applies custom label", () => {
    render(<LoadingSpinner label="Please wait" />);
    expect(screen.getByText("Please wait")).toBeInTheDocument();
  });

  it("applies custom variant", () => {
    // This is visual, but we can check if it renders without crashing
    render(<LoadingSpinner variant="white" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
