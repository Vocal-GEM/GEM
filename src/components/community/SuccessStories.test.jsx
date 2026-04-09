import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': `${name.toLowerCase()}-icon` });
        Icon.displayName = name;
        return Icon;
    };
    return {
        Play: createIcon('Play'),
        Pause: createIcon('Pause'),
        Heart: createIcon('Heart'),
        MessageCircle: createIcon('MessageCircle'),
        Mic: createIcon('Mic'),
        Star: createIcon('Star')
    };
});

// Mock Toast
vi.mock('../ui/Toast', () => ({
  default: ({ message, type }) => <div data-testid="toast" data-type={type}>{message}</div>,
}));

// Mock Button
vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, isLoading, ...props }) => (
    <button onClick={onClick} disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  ),
}));

// Mock Audio
const mockAudioInstances = [];
const MockAudioImplementation = function(src) {
    this.src = src;
    this.pause = vi.fn();
    this.play = vi.fn();
    this.onended = null;
    mockAudioInstances.push(this);
};
const MockAudio = vi.fn(function(src) {
    return new MockAudioImplementation(src);
});
globalThis.Audio = MockAudio;

describe('SuccessStories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAudioInstances.length = 0;

        // Default moderation pass
        ModerationService.preCheckContent.mockReturnValue({ safe: true });
    });

    it('renders success stories', async () => {
        CommunityService.getSuccessStories.mockResolvedValue({
            stories: [
                {
                    id: 1,
                    title: 'Test Story',
                    story: 'This is a test story.',
                    timeline_months: 6,
                    voice_goal: 'feminine',
                    upvotes: 10,
                    before_audio: "http://example.com/before.mp3",
                    after_audio: "http://example.com/after.mp3",
                    created_at: new Date().toISOString()
                }
            ]
        });

        render(<SuccessStories />);

        await waitFor(() => {
            expect(screen.getByText('Test Story')).toBeInTheDocument();
        });
        expect(screen.getByText('"This is a test story."')).toBeInTheDocument();

        // Expect audio instances
        expect(MockAudio).toHaveBeenCalledTimes(2);
    });

    it('does not recreate Audio on re-render', async () => {
        CommunityService.getSuccessStories.mockResolvedValue({
            stories: [{
                id: 1, title: 'Test', story: 'Content', voice_goal: 'fem', timeline_months: 6, upvotes: 1,
                before_audio: "a.mp3", after_audio: "b.mp3", created_at: new Date().toISOString()
            }]
        });

        render(<SuccessStories />);
        await waitFor(() => expect(screen.getByText('Test')).toBeInTheDocument());

        const initialCallCount = MockAudio.mock.calls.length;
        expect(initialCallCount).toBe(2);

        // Trigger re-render by clicking "Share Your Story" (opens modal)
        const shareButton = screen.getByText('Share Your Story');
        fireEvent.click(shareButton);

        await waitFor(() => {
            expect(screen.getByText('Share Your Journey')).toBeInTheDocument();
        });

        // Audio constructor should NOT be called again
        expect(MockAudio.mock.calls.length).toBe(initialCallCount);
    });

    it('shows toast on validation error', async () => {
        CommunityService.getSuccessStories.mockResolvedValue({ stories: [] });
        render(<SuccessStories />);

        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

        const shareButton = screen.getByText('Share Your Story');
        fireEvent.click(shareButton);

        fireEvent.change(screen.getByPlaceholderText(/e.g., My 6-month progress update/i), {
            target: { value: 'Bad Title' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Share your experience/i), {
            target: { value: 'Bad Story' },
        });

        ModerationService.preCheckContent.mockReturnValue({ safe: false });

        const submitButton = screen.getByText('Submit Story');
        fireEvent.click(submitButton);

        expect(await screen.findByTestId('toast')).toHaveTextContent('Your story contains flagged words. Please revise.');
    });
});
