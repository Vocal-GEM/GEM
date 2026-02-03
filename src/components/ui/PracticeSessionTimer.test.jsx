import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import PracticeSessionTimer from './PracticeSessionTimer';

// Mock icons
vi.mock('lucide-react', () => ({
  Timer: () => <span data-testid="icon-timer">Timer</span>,
  Droplets: () => <span data-testid="icon-droplets">Droplets</span>,
  Coffee: () => <span data-testid="icon-coffee">Coffee</span>,
  AlertTriangle: () => <span data-testid="icon-alert">AlertTriangle</span>,
}));

describe('PracticeSessionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows hydration reminder after 15 minutes with accessibility attributes', () => {
    render(<PracticeSessionTimer isActive={true} />);

    // Advance time by 15 minutes + 1 second
    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000 + 1000);
    });

    // These assertions expect the accessibility improvements
    // The role="dialog" might not exist yet, so this test might fail initially
    // which is good for TDD/verification.
    const popup = screen.getByRole('dialog');
    expect(popup).toBeInTheDocument();

    // Check accessible name and description
    expect(popup).toHaveAttribute('aria-labelledby', 'reminder-title');
    expect(popup).toHaveAttribute('aria-describedby', 'reminder-message');

    // Check live region
    expect(popup).toHaveAttribute('aria-live', 'polite');

    // Check content IDs
    expect(screen.getByText('Hydration Break')).toHaveAttribute('id', 'reminder-title');
    expect(screen.getByText(/Time for a sip of water/)).toHaveAttribute('id', 'reminder-message');
  });
});
