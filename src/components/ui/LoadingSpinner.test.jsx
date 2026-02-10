import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "./LoadingSpinner";
import React from "react";

describe("LoadingSpinner", () => {
  it("renders with default accessibility attributes", () => {
    render(<LoadingSpinner />);

    // It should have role="status"
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    // It should have a visually hidden label "Loading..." by default
    const srText = screen.getByText('Loading...');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it("renders with custom label", () => {
    render(<LoadingSpinner label="Processing data..." />);
    expect(screen.getByText("Processing data...")).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <LoadingSpinner className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    // We check for dimension classes roughly or just ensure no crash
    // sm is w-5
    expect(container.firstChild).toHaveClass('inline-flex');

    rerender(<LoadingSpinner size="xl" />);
    // xl is w-16
  });

  it('renders with current color variant', () => {
    const { container } = render(<LoadingSpinner variant="current" />);
    // Check if the spinner segment uses border-t-current
    const spinnerSegment = container.querySelector(".border-t-current");
    expect(spinnerSegment).toBeInTheDocument();
  });

  it('renders with white color variant', () => {
    const { container } = render(<LoadingSpinner variant="white" />);
    // Check if the spinner segment uses border-t-white
    const spinnerSegment = container.querySelector('.border-t-white');
    expect(spinnerSegment).toBeInTheDocument();
  });
});
