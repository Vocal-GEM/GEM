import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
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
    Mic: () => <div data-testid="mic-icon" />,
    Star: () => <div data-testid="star-icon" />
}));

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
const MockAudio = vi.fn(function(src) {
    this.src = src;
    this.pause = vi.fn();
    this.play = vi.fn();
    this.onended = null;
});

globalThis.Audio = MockAudio;

describe('SuccessStories', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        CommunityService.getSuccessStories.mockResolvedValue({
            stories: [
                {
                    id: 1,
                    title: "Test Story",
                    story: "Content",
                    voice_goal: "feminine",
                    timeline_months: 6,
                    upvotes: 10,
                    before_audio: "http://example.com/before.mp3",
                    after_audio: "http://example.com/after.mp3",
                    created_at: new Date().toISOString()
                }
            ]
        });
    });

    test('renders stories correctly', async () => {
        render(<SuccessStories />);

        await waitFor(() => {
            expect(screen.getByText('Test Story')).toBeInTheDocument();
        });

        // The text matcher failed for "Content" likely due to it being inside quotes in the rendered output
        // Based on the error log: <p ...>"Content"</p>
        // We can search for the text or regex
        expect(screen.getByText(/Content/)).toBeInTheDocument();
    });

    test('shows toast on validation error', async () => {
        // Render with empty stories initially
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

        expect(await screen.findByTestId('toast')).toHaveTextContent(/flagged words/i);
    });
});
