import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DailyChallengeCard from './DailyChallengeCard';
import * as DailyChallengeService from '../../services/DailyChallengeService';

// Mock the DailyChallengeService
vi.mock('../../services/DailyChallengeService', () => ({
    getTodayChallenges: vi.fn(),
    completeChallenge: vi.fn(),
    getXPForNextLevel: vi.fn(),
    default: {
        getTodayChallenges: vi.fn(),
        completeChallenge: vi.fn(),
        getXPForNextLevel: vi.fn(),
        CHALLENGE_TYPES: []
    }
}));

describe('DailyChallengeCard', () => {
    const mockChallenges = [
        {
            id: 'test-1',
            title: 'Test Challenge 1',
            description: 'Do something cool',
            xp: 50,
            category: 'pitch'
        },
        {
            id: 'test-2',
            title: 'Test Challenge 2',
            description: 'Do something else',
            xp: 30,
            category: 'breathing'
        }
    ];

    const mockXPData = {
        current: 50,
        needed: 100,
        level: 5,
        totalXP: 450
    };

    beforeEach(() => {
        vi.clearAllMocks();

        DailyChallengeService.getTodayChallenges.mockReturnValue({
            challenges: mockChallenges,
            completed: []
        });

        DailyChallengeService.getXPForNextLevel.mockReturnValue(mockXPData);

        DailyChallengeService.completeChallenge.mockReturnValue({
            success: true,
            xpEarned: 50,
            allCompleted: false
        });
    });

    it('renders the component with correct level and XP', () => {
        render(<DailyChallengeCard />);

        expect(screen.getByText('Daily Challenges')).toBeInTheDocument();
        expect(screen.getByText('Level 5')).toBeInTheDocument();
        expect(screen.getByText('450 XP total')).toBeInTheDocument();
    });

    it('renders the XP progress bar with correct accessibility attributes', () => {
        render(<DailyChallengeCard />);

        // This should fail initially as role="progressbar" is missing
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();

        // Calculate expected percentage: (50 / 100) * 100 = 50%
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders challenges as interactive buttons', () => {
        render(<DailyChallengeCard />);

        // This should fail initially as they are divs, not buttons
        const challengeButtons = screen.getAllByRole('button');

        // We might have other buttons (like "Start Recording" etc if they were there, but this component is simple)
        // We expect at least one button for each challenge
        // Actually the current code renders div with onClick, so role="button" should fail

        // Let's verify specifically the items
        expect(screen.getByText('Test Challenge 1').closest('button')).toBeInTheDocument();
        expect(screen.getByText('Test Challenge 2').closest('button')).toBeInTheDocument();
    });
});
