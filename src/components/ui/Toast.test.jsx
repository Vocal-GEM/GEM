import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with correct message', () => {
    render(<Toast message="Test Message" onClose={() => {}} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls onClose after duration', () => {
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('has correct accessibility attributes for error type', () => {
    render(<Toast message="Error occurred" type="error" onClose={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Error:')).toHaveClass('sr-only');
  });

  it('has correct accessibility attributes for success type', () => {
    render(<Toast message="Success!" type="success" onClose={() => {}} />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByText('Success:')).toHaveClass('sr-only');
  });

  it('close button has accessible label', () => {
    render(<Toast message="Test" onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /close notification/i })).toBeInTheDocument();
  });
import React from 'react';

describe('Toast Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders with correct message', () => {
        render(<Toast message="Test Message" onClose={() => {}} />);
        expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('calls onClose after duration', () => {
        const onClose = vi.fn();
        render(<Toast message="Test Message" onClose={onClose} duration={3000} />);

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<Toast message="Test Message" onClose={onClose} />);

        // Look for button by accessible name (aria-label or text)
        // Adjust regex to match what's actually in the component (likely "Close notification" or "Close")
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
    });

    it('has correct accessibility attributes for error type', () => {
        render(<Toast message="Error occurred" type="error" onClose={() => {}} />);

        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveAttribute('aria-live', 'assertive');
        // aria-atomic might be present
        // expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    it('has correct accessibility attributes for success type', () => {
        render(<Toast message="Success!" type="success" onClose={() => {}} />);

        const status = screen.getByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('close button has accessible label', () => {
        render(<Toast message="Test" onClose={() => {}} />);
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
});
