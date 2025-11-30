import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CelebrationModal from './CelebrationModal';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn()
}));

describe('CelebrationModal', () => {
    const mockAchievement = {
        title: 'Test Achievement',
        description: 'You did it!',
        icon: '🏆'
    };

    it('should not render when no achievement is provided', () => {
        render(<CelebrationModal achievement={null} />);
        expect(screen.queryByText('Test Achievement')).not.toBeInTheDocument();
    });

    it('should render achievement details when provided', () => {
        render(<CelebrationModal achievement={mockAchievement} />);
        expect(screen.getByText('Test Achievement')).toBeInTheDocument();
        expect(screen.getByText('You did it!')).toBeInTheDocument();
        expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<CelebrationModal achievement={mockAchievement} onClose={onClose} />);
        fireEvent.click(screen.getByText('Awesome!'));
        expect(onClose).toHaveBeenCalled();
    });
});
