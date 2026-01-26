import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BreathVisualizer from './BreathVisualizer';

describe('BreathVisualizer', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('renders with initial state', () => {
        render(<BreathVisualizer type="square" />);
        expect(screen.getByText('Square Breathing')).toBeInTheDocument();
        expect(screen.getByText('Ready?')).toBeInTheDocument();
    });

    it('has an accessible reset button', () => {
        render(<BreathVisualizer />);
        const resetButton = screen.getByRole('button', { name: /reset breathing exercise/i });
        expect(resetButton).toBeInTheDocument();
    });

    it('has a live region for phase announcements', () => {
        render(<BreathVisualizer />);
        // Look for the live region container
        // Note: We might need to query by specific attributes if role="status" or similar isn't used
        // But for now, we'll check if the text container has aria-live
        const liveRegion = screen.getByText('Ready?').closest('[aria-live="assertive"]');
        expect(liveRegion).toBeInTheDocument();
    });

    it('announces phase changes when active', () => {
        render(<BreathVisualizer type="square" />);

        // Start the exercise
        const startButton = screen.getByRole('button', { name: /start/i });
        fireEvent.click(startButton);

        // Should immediately show first phase
        expect(screen.getByText('Inhale')).toBeInTheDocument();

        // Advance timer by 4000ms (Inhale duration for square breathing)
        act(() => {
            vi.advanceTimersByTime(4000);
        });

        // Should now show "Hold"
        expect(screen.getByText('Hold')).toBeInTheDocument();

        // Advance timer by 4000ms
        act(() => {
            vi.advanceTimersByTime(4000);
        });

        // Should now show "Exhale"
        expect(screen.getByText('Exhale')).toBeInTheDocument();
    });
});
