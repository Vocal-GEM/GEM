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

    // Now we can find by label since we added it
    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('has correct accessibility attributes for error type', () => {
    render(<Toast message="Error occurred" type="error" onClose={() => {}} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('has correct accessibility attributes for success type', () => {
    render(<Toast message="Success!" type="success" onClose={() => {}} />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('close button has accessible label', () => {
    render(<Toast message="Test" onClose={() => {}} />);

    const button = screen.getByRole('button', { name: /close notification/i });
    expect(button).toBeInTheDocument();
  });
});
