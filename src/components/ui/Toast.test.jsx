import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
  it('renders with correct message', () => {
    render(<Toast message="Test Message" onClose={() => {}} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls onClose after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} />);

    // We expect this to be improved with a proper label
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  // Accessibility tests - These are expected to fail initially
  it('has correct accessibility attributes for error type', () => {
    render(<Toast message="Error occurred" type="error" onClose={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    // Error messages should be assertive
    // Note: The implementation might use aria-live on the container
  });

  it('has correct accessibility attributes for success type', () => {
    render(<Toast message="Success!" type="success" onClose={() => {}} />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  it('close button has accessible label', () => {
    render(<Toast message="Test" onClose={() => {}} />);

    // This checks for aria-label="Close" or similar
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});
