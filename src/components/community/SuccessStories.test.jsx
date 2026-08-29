import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, test, it, expect, beforeEach } from 'vitest';
import SuccessStories from './SuccessStories';
import CommunityService from '../../services/CommunityService';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Play: () => <div data-testid="play-icon" />,
    Pause: () => <div data-testid="pause-icon" />,
    Heart: () => <div data-testid="heart-icon" />,
    MessageCircle: () => <div data-testid="msg-icon" />,
    Mic: () => <div data-testid="mic-icon" />,
    Star: () => <div data-testid="star-icon" />
}));

// Mock services globally
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

// Mock Toast and Button to avoid issues with their internal dependencies or animations
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

globalThis.Audio = MockAudio;

describe('SuccessStories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAudioInstances.length = 0;
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
                },
            ],
        });

        render(<SuccessStories />);

        expect(await screen.findByText('Test Story')).toBeInTheDocument();
        expect(screen.getByText('"This is a test story."')).toBeInTheDocument();
    });
});
