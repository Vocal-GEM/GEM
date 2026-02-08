import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "./LoadingSpinner";
import React from "react";

describe('LoadingSpinner', () => {
  it('renders with default accessibility attributes', () => {
    render(<LoadingSpinner />);

    // It should have role="status"
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    // It should have a visually hidden label "Loading..." by default
    const srText = screen.getByText('Loading...');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(srText).toHaveClass('sr-only');
  });

  it("renders with custom label", () => {
    render(<LoadingSpinner label="Processing data..." />);
    expect(screen.getByText("Processing data...")).toBeInTheDocument();
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
    expect(container.querySelector('.w-5')).toBeInTheDocument();

    rerender(<LoadingSpinner size="xl" />);
    expect(container.querySelector('.w-16')).toBeInTheDocument();
  });

  it("uses inline layout for small size", () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    expect(container.firstChild).toHaveClass("inline-flex");
  });

  it("renders with current color variant", () => {
    const { container } = render(<LoadingSpinner variant="current" />);
    expect(container.querySelector(".border-t-current")).toBeInTheDocument();
    expect(container.querySelector('.border-current')).toBeInTheDocument();
  });

  it('renders with default color variant (blue)', () => {
    const { container } = render(<LoadingSpinner variant="default" />);
    expect(container.querySelector('.border-t-blue-500')).toBeInTheDocument();
  });

  it("renders with white color variant", () => {
    const { container } = render(<LoadingSpinner variant="white" />);
    expect(container.querySelector('.border-t-white')).toBeInTheDocument();
  });
});
