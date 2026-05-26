import React from 'react';
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders with default accessibility attributes", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();

    // Check for aria-live="polite" (default)
    expect(spinner).toHaveAttribute("aria-live", "polite");

    // Check for hidden label
    const srText = screen.getByText("Loading...");
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass("sr-only");
  });

  it("renders with custom label", () => {
    render(<LoadingSpinner label="Processing data..." />);
    const srText = screen.getByText("Processing data...");
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass("sr-only");

    // The label is what gives the region its accessible name or description
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

  it("renders with different sizes including xs", () => {
    const { rerender, container } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("inline-flex"); // sm should be inline-flex

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("flex"); // xl should be flex (default)

    rerender(<LoadingSpinner size="xs" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(container.querySelector(".w-4.h-4")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("inline-flex"); // xs should be inline-flex
  });

  it("renders with current color variant", () => {
    const { container } = render(<LoadingSpinner variant="current" />);
    // Check if the spinner segment uses border-t-current
    const spinnerSegment = container.querySelector(".border-t-current");
    expect(spinnerSegment).toBeInTheDocument();

    // Check if the track uses border-current
    const trackSegment = container.querySelector(".border-current");
    expect(trackSegment).toBeInTheDocument();
  });

  it("renders with default color variant (blue)", () => {
    const { container } = render(<LoadingSpinner variant="default" />);
    // Check if the spinner segment uses border-t-blue-500
    const spinnerSegment = container.querySelector(".border-t-blue-500");
    expect(spinnerSegment).toBeInTheDocument();
  });

  it("renders with white color variant", () => {
    const { container } = render(<LoadingSpinner variant="white" />);
    // Check if the spinner segment uses border-t-white
    const spinnerSegment = container.querySelector(".border-t-white");
    expect(spinnerSegment).toBeInTheDocument();
  });
});
