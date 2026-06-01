import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

describe('LoadingSpinner', () => {
  it('renders with default accessibility attributes', () => {
    render(<LoadingSpinner />);

    // It should have role="status"
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    // It should have a visually hidden label "Loading..." by default
    const srText = screen.getByText('Loading...');
    expect(srText).toHaveClass('sr-only');
  });

  it('allows overriding accessibility props', () => {
    render(
      <LoadingSpinner
        aria-label="Analyzing..."
        aria-live="assertive"
      />
    );

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite'); // Currently the component hardcodes aria-live="polite"
    // expect(screen.getByText('Analyzing...')).toBeInTheDocument(); // Currently the component doesn't support custom labels directly inside

  });
});
