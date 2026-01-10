import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "./LoadingSpinner";
import React from "react";

describe("LoadingSpinner", () => {
  it("renders with accessibility attributes", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();

    // Check for visually hidden loading text
    const label = screen.getByText("Loading...");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("sr-only");
  });

  it("renders with custom label", () => {
    render(<LoadingSpinner label="Processing data..." />);
    expect(screen.getByText("Processing data...")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with accessibility attributes', () => {
        render(<LoadingSpinner />);

        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();

        // Check for visually hidden loading text
    it('renders with default accessibility attributes', () => {
        render(<LoadingSpinner />);

        // It should have role="status"
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();

        // It should have a visually hidden label "Loading..." by default
        const srText = screen.getByText('Loading...');
        expect(srText).toHaveClass('sr-only');
    });

    it('renders with custom label', () => {
        render(<LoadingSpinner label="Processing data..." />);
        expect(screen.getByText('Processing data...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<LoadingSpinner className="my-custom-class" />);
        expect(container.firstChild).toHaveClass('my-custom-class');
    });

    it('overrides default min-height when custom class is provided', () => {
         const { container } = render(<LoadingSpinner className="min-h-0" />);
         expect(container.firstChild).toHaveClass('min-h-0');
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<LoadingSpinner size="sm" />);
        // We can't easily check for specific size classes without implementation details,
        // but we can check it renders without error.
        expect(screen.getByRole('status')).toBeInTheDocument();

        rerender(<LoadingSpinner size="xl" />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
});
