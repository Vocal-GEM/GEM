import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PracticeSessionTimer from './PracticeSessionTimer';

describe('PracticeSessionTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2024, 0, 1, 10, 0, 0)); // Set a fixed start time

        // Mock navigator.vibrate
        Object.defineProperty(navigator, 'vibrate', {
            value: vi.fn(),
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('renders timer with accessibility role', () => {
        render(<PracticeSessionTimer isActive={true} />);
        const timer = screen.getByText('0:00');
        expect(timer).toBeInTheDocument();

        // Check for accessibility role that we plan to add
        expect(screen.getByRole('timer')).toBeInTheDocument();
    });

    it('shows hydration reminder after 15 minutes with haptic feedback and accessibility attributes', () => {
        render(<PracticeSessionTimer isActive={true} />);

        act(() => {
            vi.advanceTimersByTime(15 * 60 * 1000 + 1000); // 15 mins + 1 sec
        });

        // Check text content
        const reminder = screen.getByText('Hydration Break');
        expect(reminder).toBeInTheDocument();

        // Check for vibration (haptic feedback)
        expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100]);

        // Check for accessibility roles
        // We expect the reminder popup to have role="status" (since it's hydration, not urgent)
        const popup = screen.getByRole('status');
        expect(popup).toBeInTheDocument();
        expect(popup).toHaveAttribute('aria-live', 'polite');
    });

    it('shows break reminder after 30 minutes with urgent accessibility attributes', () => {
        render(<PracticeSessionTimer isActive={true} />);

        // 1. Advance to 16 mins (1 min late for hydration)
        act(() => {
            vi.advanceTimersByTime(16 * 60 * 1000);
        });

        // 2. Dismiss hydration
        const dismissButton = screen.getByText("I'll Drink Water");
        fireEvent.click(dismissButton);
        // lastHydration is now set to T=16m

        // 3. Advance to 30 mins total (add 14 mins + 1 sec)
        // This puts us at T=30m 1s.
        // Time since last hydration = 30m 1s - 16m = 14m 1s (< 15m interval)
        // So hydration check fails, and Break check succeeds.
        act(() => {
            vi.advanceTimersByTime(14 * 60 * 1000 + 1000);
        });

        const reminder = screen.getByText('Rest Recommended');
        expect(reminder).toBeInTheDocument();

        // Check for vibration
        expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100]);

        // Check for accessibility roles
        // We expect the reminder popup to have role="alert" (urgent)
        const popup = screen.getByRole('alert');
        expect(popup).toBeInTheDocument();
        expect(popup).toHaveAttribute('aria-live', 'assertive');
    });
});
