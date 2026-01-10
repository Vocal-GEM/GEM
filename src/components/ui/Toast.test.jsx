
import { render, screen, act, fireEvent } from '@testing-library/react';
import { render, screen, act } from '@testing-library/react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
  it('renders message correctly', () => {
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders message correctly', () => {
    render(<Toast message="Test message" onClose={() => {}} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  it('renders with correct message', () => {
    render(<Toast message="Test Message" onClose={() => {}} />);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls onClose after duration', () => {
    const onClose = vi.fn();
    render(<Toast message="Test message" onClose={onClose} duration={3000} />);
    render(<Toast message="Test" onClose={onClose} duration={3000} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('has accessible role for error', () => {
    render(<Toast message="Error" type="error" onClose={() => {}} />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('has accessible role for success', () => {
    render(<Toast message="Success" type="success" onClose={() => {}} />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  it('has correct role and aria attributes for success', () => {
    render(<Toast message="Success" type="success" onClose={() => {}} />);
    const toast = screen.getByRole('status');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('has correct role and aria attributes for error', () => {
    render(<Toast message="Error" type="error" onClose={() => {}} />);
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute('aria-live', 'assertive');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);

    // Updated to look for the accessible label we added
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    render(<Toast message="Test Message" onClose={onClose} />);
    // Finding by role button is safe even if aria-label is missing, as long as it's a <button>

    // Now we can find by label since we added it
    const closeButton = screen.getByLabelText('Close notification');
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  // Accessibility tests
  it('has correct accessibility attributes for error type', () => {
    render(<Toast message="Error occurred" type="error" onClose={() => {}} />);

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
  it('close button has accessible label', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" onClose={onClose} />);

    // Look for button by label
    const button = screen.getByRole('button', { name: /close notification/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onClose).toHaveBeenCalled();
    render(<Toast message="Test" onClose={() => {}} />);
    const button = screen.getByRole('button', { name: /close/i });
    expect(button).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /close notification/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
    // This will pass only if the button has aria-label="Close"
    // Using getAllByRole because sometimes buttons might be rendered multiple times in bad implementations, but here we expect one.
    // However, if the button has no accessible name, this query will fail to find it by name.
    // But we are asserting it IS in the document, so we expect it to exist.
    // If it doesn't have the label, screen.getByRole('button', { name: /close/i }) will throw.
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});
