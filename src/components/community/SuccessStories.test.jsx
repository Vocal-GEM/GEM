import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SuccessStories from './SuccessStories';
import CommunityService from '../../services/CommunityService';
import ModerationService from '../../services/ModerationService';
import React from 'react';

// Mock services
vi.mock('../../services/CommunityService', () => ({
    default: {
        getSuccessStories: vi.fn(),
        submitSuccessStory: vi.fn()
    }
}));

vi.mock('../../services/ModerationService', () => ({
    default: {
        preCheckContent: vi.fn()
    }
}));

// Mock Lucide icons
vi.mock('lucide-react', async () => {
    const React = await import('react');
    const createIcon = (name) => {
        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': `${name}-icon` });
        Icon.displayName = name;
        return Icon;
    };
    return {
        Play: createIcon('play'),
        Pause: createIcon('pause'),
        Heart: createIcon('heart'),
        MessageCircle: createIcon('msg'),
        Mic: createIcon('mic'),
        Star: createIcon('star')
    };
});

// Mock Toast and Button
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

// Mock Audio
const MockAudioImplementation = function(src) {
    this.src = src;
    this.pause = vi.fn();
    this.play = vi.fn();
    this.onended = null;
};

const MockAudio = vi.fn(function(src) {
    return new MockAudioImplementation(src);
});

globalThis.Audio = MockAudio;

describe('SuccessStories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        MockAudio.mockClear();

        CommunityService.getSuccessStories.mockResolvedValue({
            stories: [
                {
                    id: 1,
                    title: "Test Story",
                    story: "This is a test story.",
                    voice_goal: "feminine",
                    timeline_months: 6,
                    upvotes: 10,
                    before_audio: "http://example.com/before.mp3",
                    after_audio: "http://example.com/after.mp3",
                    created_at: new Date().toISOString()
                }
            ]
        });

        ModerationService.preCheckContent.mockReturnValue({ safe: true });
    });

    it('renders stories and initializes Audio correctly', async () => {
        render(<SuccessStories />);

        await waitFor(() => {
            expect(screen.getByText('Test Story')).toBeInTheDocument();
        });

        expect(screen.getByText('"This is a test story."')).toBeInTheDocument();

        // Expect 2 audio instances (before and after)
        expect(MockAudio).toHaveBeenCalledTimes(2);
        expect(MockAudio).toHaveBeenCalledWith("http://example.com/before.mp3");
        expect(MockAudio).toHaveBeenCalledWith("http://example.com/after.mp3");
    });

    it('shows toast on validation error', async () => {
        // Override mock for this test
        CommunityService.getSuccessStories.mockResolvedValue({ stories: [] });

        render(<SuccessStories />);

        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

        const shareButton = screen.getByText('Share Your Story');
        fireEvent.click(shareButton);

        // Fill form
        fireEvent.change(screen.getByPlaceholderText(/e.g., My 6-month progress update/i), {
            target: { value: 'Bad Title' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Share your experience/i), {
            target: { value: 'Bad Story' },
        });

        // Mock validation failure
        ModerationService.preCheckContent.mockReturnValue({ safe: false });

        const submitButton = screen.getByText('Submit Story');
        fireEvent.click(submitButton);

        expect(await screen.findByTestId('toast')).toHaveTextContent('Your story contains flagged words. Please revise.');
    });
});
