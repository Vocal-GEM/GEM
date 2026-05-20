import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');

    const srText = screen.getByText('Loading...');
    expect(srText).toBeInTheDocument();
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

  it('uses inline layout for small sizes', () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    expect(container.firstChild).toHaveClass('inline-flex');

    rerender(<LoadingSpinner size="xs" />);
    expect(container.firstChild).toHaveClass('inline-flex');
  });

  it('renders with current color variant', () => {
    const { container } = render(<LoadingSpinner variant="current" />);
    const spinnerSegment = container.querySelector('.border-t-current');
    expect(spinnerSegment).toBeInTheDocument();
  });

  it('renders with white color variant', () => {
    const { container } = render(<LoadingSpinner variant="white" />);
    const spinnerSegment = container.querySelector('.border-t-white');
    expect(spinnerSegment).toBeInTheDocument();
  });
});
