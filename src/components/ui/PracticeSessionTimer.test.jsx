import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PracticeSessionTimer from './PracticeSessionTimer';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Timer: () => <span data-testid="icon-timer">Timer</span>,
    Droplets: () => <span data-testid="icon-droplets">Droplets</span>,
    Coffee: () => <span data-testid="icon-coffee">Coffee</span>,
    AlertTriangle: () => <span data-testid="icon-alert">AlertTriangle</span>
}));

describe('PracticeSessionTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        if (!global.navigator) {
            global.navigator = {};
        }
        global.navigator.vibrate = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('renders timer with accessibility role', () => {
        render(<PracticeSessionTimer isActive={true} />);
        const timer = screen.getByRole('timer');
        expect(timer).toBeInTheDocument();
        expect(timer).toHaveTextContent('0:00');
    });

    it('shows hydration reminder with status role', () => {
        render(<PracticeSessionTimer isActive={true} />);

        act(() => {
            vi.advanceTimersByTime(15 * 60 * 1000 + 1000); // 15m + 1s buffer
        });

        expect(screen.getByText(/Hydration Break/i)).toBeInTheDocument();
        // Hydration is non-urgent, should be status
        const status = screen.getByRole('status');
        expect(status).toHaveTextContent(/Hydration Break/i);
    });

    it('shows break reminder with alert role (urgent)', async () => {
        render(<PracticeSessionTimer isActive={true} />);

        // 1. Trigger Hydration (15m)
        act(() => {
            vi.advanceTimersByTime(15 * 60 * 1000 + 1000);
        });

        // Dismiss Hydration
        act(() => { screen.getByText("I'll Drink Water").click(); });

        // 2. Trigger Rest (20m)
        act(() => {
             vi.advanceTimersByTime(5 * 60 * 1000); // +5m = 20m
        });

        // Dismiss Rest
        act(() => { screen.getByText("Keep Going").click(); });

        // 3. Trigger Break/Hydration (30m)
        act(() => {
             vi.advanceTimersByTime(10 * 60 * 1000); // +10m = 30m
        });

        // Hydration shows first due to priority (it's been 15m since last hydration dismissal)
        expect(screen.getByText(/Hydration Break/i)).toBeInTheDocument();
        act(() => { screen.getByText("I'll Drink Water").click(); });

        // Now Break should show
        act(() => {
             vi.advanceTimersByTime(1000);
        });

        expect(screen.getByText(/Rest Recommended/i)).toBeInTheDocument();
        // Break is urgent, should be alert
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(/Rest Recommended/i);
    });
});
