import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "./LoadingSpinner";
import React from "react";
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

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

    // It should have aria-live="polite"
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    // It should have a visually hidden label "Loading..." by default
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    // It should have a visually hidden label "Loading..." by default
    const srText = screen.getByText('Loading...');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    // It should have a visually hidden label "Loading..." by default
    const srText = screen.getByText('Loading...');
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

    // It should have a visually hidden label "Loading..." by default

    // Check for aria-live="polite" (default)
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    // Check for hidden label
    const srText = screen.getByText("Loading...");
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it("renders with custom label", () => {
    render(<LoadingSpinner label="Processing data..." />);
    expect(screen.getByText("Processing data...")).toBeInTheDocument();
  });

    // The label is what gives the region its accessible name or description
    expect(screen.getByLabelText('Processing data...')).toBeInTheDocument();
    expect(screen.getByText('Processing data...')).toBeInTheDocument();
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
    expect(container.querySelector('.w-5')).toBeInTheDocument(); // sm is w-5

    rerender(<LoadingSpinner size="xl" />);
    expect(container.querySelector('.w-16')).toBeInTheDocument(); // xl is w-16
  });

  it('renders with current color variant', () => {
  it('overrides default min-height when custom class is provided', () => {
    const { container } = render(<LoadingSpinner className="min-h-0" />);
    expect(container.firstChild).toHaveClass('min-h-0');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Test the new xs size
    rerender(<LoadingSpinner size="xs" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with current color variant', () => {
  it('renders with different sizes including xs', () => {
    const { rerender, container } = render(<LoadingSpinner size="xs" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(container.querySelector('.w-4.h-4')).toBeInTheDocument();
  it("applies custom className", () => {
    const { container } = render(<LoadingSpinner className="my-custom-class" />);
    expect(container.firstChild).toHaveClass("my-custom-class");
  });

  it("overrides default min-height when custom class is provided", () => {
    const { container } = render(<LoadingSpinner className="min-h-0" />);
    expect(container.firstChild).toHaveClass("min-h-0");
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses inline layout for small size", () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    expect(container.firstChild).toHaveClass("inline-flex");
  });

    const { rerender, container } = render(<LoadingSpinner size="xs" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    // xs should be inline-flex
    expect(container.firstChild).toHaveClass('inline-flex');

    rerender(<LoadingSpinner size="xl" />);
    // xl should be flex (default)
    expect(container.firstChild).toHaveClass('flex');
  });

  it("overrides default min-height when custom class is provided", () => {
    const { container } = render(<LoadingSpinner className="min-h-0" />);
    expect(container.firstChild).toHaveClass("min-h-0");
  it('uses inline layout for small sizes', () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    expect(container.firstChild).toHaveClass('inline-flex');

    rerender(<LoadingSpinner size="xs" />);
    expect(container.firstChild).toHaveClass('inline-flex');
  });

  it("renders with current color variant", () => {
    const { container } = render(<LoadingSpinner variant="current" />);
    // Check if the spinner segment uses border-t-current
    const spinnerSegment = container.querySelector(".border-t-current");
    expect(spinnerSegment).toBeInTheDocument();

    // Check if the track uses border-current
    const trackSegment = container.querySelector('.border-current');
    expect(trackSegment).toBeInTheDocument();
  });

  it('renders with default color variant (blue)', () => {
    const { container } = render(<LoadingSpinner variant="default" />);
    // Check if the spinner segment uses border-t-blue-500
    const spinnerSegment = container.querySelector('.border-t-blue-500');
    expect(spinnerSegment).toBeInTheDocument();
  });

  it('renders with white color variant', () => {
    const { container } = render(<LoadingSpinner variant="white" />);
    // Check if the spinner segment uses border-t-white
    const spinnerSegment = container.querySelector('.border-t-white');
    expect(spinnerSegment).toBeInTheDocument();
  });

  it("renders with white color variant", () => {
    const { container } = render(<LoadingSpinner variant="white" />);
    // Check if the spinner segment uses border-t-white
    const spinnerSegment = container.querySelector('.border-t-white');
    expect(spinnerSegment).toBeInTheDocument();
  });
});
