import React from 'react';
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
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it('renders with custom label', () => {
    render(<LoadingSpinner label="Processing data..." />);

    // Check for visually hidden custom label
    const srText = screen.getByText('Processing data...');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it('applies custom className', () => {
    const { container } = render(
      <LoadingSpinner className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    // Small uses inline-flex
    expect(container.firstChild).toHaveClass('inline-flex');
    expect(container.querySelector('.w-6')).toBeInTheDocument();

    rerender(<LoadingSpinner size="xl" />);
    // XL uses flex (default)
    expect(container.firstChild).toHaveClass('flex');
    expect(container.querySelector('.w-24')).toBeInTheDocument();
  });

  it('renders with current color variant', () => {
    const { container } = render(<LoadingSpinner variant="current" />);
    // Check if the spinner segment uses border-t-current
    const spinnerSegment = container.querySelector('.border-t-current');
    expect(spinnerSegment).toBeInTheDocument();
  });
});
