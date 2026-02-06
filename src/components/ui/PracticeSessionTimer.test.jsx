import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PracticeSessionTimer from './PracticeSessionTimer';

describe('PracticeSessionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders initial timer state', () => {
    render(<PracticeSessionTimer isActive={true} />);
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('triggers hydration reminder after 15 minutes', () => {
    render(<PracticeSessionTimer isActive={true} />);

    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000 + 1000);
    });

    const reminder = screen.getByText('Hydration Break');
    expect(reminder).toBeInTheDocument();
  });

  it('triggers break reminder after 30 minutes', async () => {
    render(<PracticeSessionTimer isActive={true} />);

    // Advance 30 mins
    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1000 + 1000);
    });

    // Hydration triggers first
    expect(screen.getByText('Hydration Break')).toBeInTheDocument();

    // Dismiss hydration
    fireEvent.click(screen.getByText("I'll Drink Water"));

    // Ensure it's gone
    expect(screen.queryByText('Hydration Break')).not.toBeInTheDocument();

    // Advance 1 sec to trigger effect loop
    act(() => {
        vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Rest Recommended')).toBeInTheDocument();
  });
});
