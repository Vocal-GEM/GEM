import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DailyGoalsWidget from './DailyGoalsWidget';

describe('DailyGoalsWidget Accessibility', () => {
    const mockGoals = [
        { id: 1, type: 'practice', current: 15, target: 30, completed: false, label: 'Practice Minutes', xp: 50 },
        { id: 2, type: 'exercises', current: 2, target: 5, completed: false, label: 'Exercises', xp: 30 }
    ];

    it('renders with accessibility attributes', () => {
        render(<DailyGoalsWidget goals={mockGoals} />);

        // Check for progressbar roles
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars).toHaveLength(mockGoals.length);

        progressBars.forEach((bar, index) => {
            expect(bar).toHaveAttribute('aria-valuenow');
            expect(bar).toHaveAttribute('aria-valuemin', '0');
            expect(bar).toHaveAttribute('aria-valuemax', '100');
            expect(bar).toHaveAttribute('aria-label', mockGoals[index].label);
        });
    });

    it('renders compact mode with accessibility attributes', () => {
        render(<DailyGoalsWidget goals={mockGoals} compact={true} />);

        // In compact mode, we also expect progressbar roles
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars).toHaveLength(mockGoals.length);

         progressBars.forEach((bar, index) => {
            expect(bar).toHaveAttribute('aria-valuenow');
            expect(bar).toHaveAttribute('aria-label', mockGoals[index].label);
        });
    });
});
