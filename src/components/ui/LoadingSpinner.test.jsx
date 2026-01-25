import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';
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
    expect(screen.getByText("Processing data...")).toBeInTheDocument();
    // Also check accessibility
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveAttribute('aria-label', 'Processing data...');
  });

  it("applies custom className", () => {
    const { container } = render(<LoadingSpinner className="my-custom-class" />);
    expect(container.firstChild).toHaveClass("my-custom-class");
  });

  it("renders with different sizes including xs", () => {
    const { rerender, container } = render(<LoadingSpinner size="xs" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('inline-flex');

    rerender(<LoadingSpinner size="sm" />);
    expect(container.firstChild).toHaveClass('inline-flex');

    rerender(<LoadingSpinner size="xl" />);
    expect(container.firstChild).toHaveClass('flex');
  });

  it("renders with current color variant", () => {
    const { container } = render(<LoadingSpinner variant="current" />);
    // Check if the spinner segment uses border-t-current
    const spinnerSegment = container.querySelector(".border-t-current");
    expect(spinnerSegment).toBeInTheDocument();
  });

  it('renders with default color variant (blue)', () => {
    const { container } = render(<LoadingSpinner variant="default" />);
    const spinnerSegment = container.querySelector('.border-t-blue-500');
    expect(spinnerSegment).toBeInTheDocument();
  });
});
