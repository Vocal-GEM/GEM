import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
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

// Mock Toast and Button to avoid issues with their internal dependencies or animations
vi.mock('../ui/Toast', () => ({
  default: ({ message, type }) => <div data-testid="toast" data-type={type}>{message}</div>,
}));

// Mock Audio
const mockAudioInstances = [];

// We need a proper constructor function for the mock to work with 'new'
const MockAudioImplementation = function(src) {
    this.src = src;
    this.pause = vi.fn();
    this.play = vi.fn();
    this.onended = null;
    mockAudioInstances.push(this);
};

// We wrap it in vi.fn() to track calls to the constructor
const MockAudio = vi.fn(function(src) {
    return new MockAudioImplementation(src);
});

// Use globalThis for test environment
globalThis.Audio = MockAudio;

describe('SuccessStories Optimization Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAudioInstances.length = 0;

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

    test('renders stories and initializes Audio correctly', async () => {
        render(<SuccessStories />);

        await waitFor(() => {
            expect(screen.getByText('Test Story')).toBeInTheDocument();
        });

        // Expect 2 audio instances (before and after)
        expect(MockAudio).toHaveBeenCalledTimes(2);
        expect(MockAudio).toHaveBeenCalledWith("http://example.com/before.mp3");
        expect(MockAudio).toHaveBeenCalledWith("http://example.com/after.mp3");
    });

    test('does not recreate Audio on re-render', async () => {
        render(<SuccessStories />);

        await waitFor(() => {
            expect(screen.getByText('Test Story')).toBeInTheDocument();
        });

        const initialCallCount = MockAudio.mock.calls.length;
        expect(initialCallCount).toBe(2);

        // Trigger re-render by clicking "Share Your Story"
        const shareButton = screen.getByText('Share Your Story');
        fireEvent.click(shareButton);

        await waitFor(() => {
            expect(screen.getByText('Share Your Journey')).toBeInTheDocument();
        });

        // Audio constructor should NOT be called again
        expect(MockAudio.mock.calls.length).toBe(initialCallCount);
    });
});
