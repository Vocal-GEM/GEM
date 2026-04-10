import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SuccessStories from './SuccessStories';
import CommunityService from '../../services/CommunityService';
import ModerationService from '../../services/ModerationService';

// Mock services
vi.mock('../../services/CommunityService', () => ({
    default: {
        getSuccessStories: vi.fn(),
        submitSuccessStory: vi.fn()
    }
}));

vi.mock('../../services/ModerationService', () => ({
    default: {
        preCheckContent: vi.fn().mockReturnValue({ safe: true })
    }
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Play: () => <div data-testid="play-icon" />,
    Pause: () => <div data-testid="pause-icon" />,
    Heart: () => <div data-testid="heart-icon" />,
    MessageCircle: () => <div data-testid="msg-icon" />,
    Share2: () => <div data-testid="share-icon" />,
    Star: () => <div data-testid="star-icon" />
}));

vi.mock('../ui/Toast', () => ({
    default: ({ message, type }) => <div data-testid="toast" data-type={type}>{message}</div>,
}));

vi.mock('../ui/button', () => ({
    Button: ({ children, onClick, isLoading, ...props }) => (
        <button onClick={onClick} disabled={isLoading} {...props}>
        {isLoading ? 'Loading...' : children}
        </button>
    ),
}));

describe('SuccessStories Component', () => {
    let MockAudio;
    let initialCallCount;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock global Audio
        MockAudio = vi.fn().mockImplementation(() => ({
            play: vi.fn().mockResolvedValue(undefined),
            pause: vi.fn(),
            currentTime: 0,
            src: '',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }));
        global.Audio = MockAudio;
        initialCallCount = MockAudio.mock.calls.length;

        CommunityService.getSuccessStories.mockResolvedValue({
            stories: [
                {
                    id: 1,
                    title: 'My Journey',
                    story: 'It was hard but worth it.',
                    timeline_months: 6,
                    voice_goal: 'feminine',
                    upvotes: 12
                }
            ]
        });
    });

    afterEach(() => {
        delete global.Audio;
    });

    it('renders stories correctly', async () => {
        render(<SuccessStories />);
        expect(await screen.findByText('My Journey')).toBeInTheDocument();
    });
});
