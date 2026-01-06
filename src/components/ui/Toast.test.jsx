import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
  it('renders message correctly', () => {
    render(<Toast message="Test Message" onClose={() => {}} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls onClose after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);

    // Updated to look for the accessible label we added
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('renders different types', () => {
    const { rerender } = render(<Toast message="Success" type="success" onClose={() => {}} />);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<Toast message="Error" type="error" onClose={() => {}} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
      render(<Toast message="Error occurred" type="error" onClose={() => {}} />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
  });
});
