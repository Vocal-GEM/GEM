import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "./LoadingSpinner";
import React from 'react';

describe("LoadingSpinner", () => {
  it("renders with default accessibility attributes", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-live", "polite");

    // Check for hidden label
    const srText = screen.getByText("Loading...");
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it("renders with custom label", () => {
    render(<LoadingSpinner label="Processing data..." />);
    expect(screen.getByLabelText("Processing data...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<LoadingSpinner className="my-custom-class" />);
    expect(container.firstChild).toHaveClass("my-custom-class");
  });

  it("overrides default min-height when custom class is provided", () => {
    const { container } = render(<LoadingSpinner className="min-h-0" />);
    expect(container.firstChild).toHaveClass("min-h-0");
  });

  it("renders with different sizes", () => {
    const { rerender, container } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('inline-flex');

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('flex');
  });

  it("renders with current color variant", () => {
    const { container } = render(<LoadingSpinner variant="current" />);
    const spinnerSegment = container.querySelector(".border-t-current");
    expect(spinnerSegment).toBeInTheDocument();
  });

  it("renders with white color variant", () => {
    const { container } = render(<LoadingSpinner variant="white" />);
    const spinnerSegment = container.querySelector(".border-t-white");
    expect(spinnerSegment).toBeInTheDocument();
  });
});
