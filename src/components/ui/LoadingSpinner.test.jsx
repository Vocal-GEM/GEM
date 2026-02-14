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

    expect(spinner).toHaveAttribute('aria-live', 'polite');

    // It should have a visually hidden label "Loading..." by default
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
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
    expect(container.querySelector('.w-5')).toBeInTheDocument(); // sm is w-5

    rerender(<LoadingSpinner size="xl" />);
    expect(container.querySelector('.w-16')).toBeInTheDocument(); // xl is w-16
  });

  it('renders with current color variant', () => {
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
});
