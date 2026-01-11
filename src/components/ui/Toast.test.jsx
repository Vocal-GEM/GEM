import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast from './Toast';
import React from 'react';

// Mock lucide-react icons to avoid rendering issues
vi.mock('lucide-react', () => ({
  CheckCircle: (props) => <div data-testid="icon-check" {...props} />,
  XCircle: (props) => <div data-testid="icon-error" {...props} />,
  AlertTriangle: (props) => <div data-testid="icon-warning" {...props} />,
  Info: (props) => <div data-testid="icon-info" {...props} />,
  X: (props) => <div data-testid="icon-close" {...props} />,
}));

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

  it('icons are hidden from screen readers', () => {
    render(<Toast message="Test" type="success" onClose={() => {}} />);
    const icon = screen.getByTestId('icon-check');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
