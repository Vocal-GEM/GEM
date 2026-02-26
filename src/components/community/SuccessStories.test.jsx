import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SuccessStories from './SuccessStories';
import CommunityService from '../../services/CommunityService';
import ModerationService from '../../services/ModerationService';

// Mock services
vi.mock('../../services/CommunityService', () => ({
  default: {
    getSuccessStories: vi.fn(),
    submitSuccessStory: vi.fn(),
  },
}));

vi.mock('../../services/ModerationService', () => ({
  default: {
    preCheckContent: vi.fn(),
  },
}));

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const createIcon = (name) => {
        const Icon = (props) => <div data-testid={`${name.toLowerCase()}-icon`} {...props} />;
        Icon.displayName = name;
        return Icon;
    };
    return {
        ...actual,
        Play: createIcon('Play'),
        Pause: createIcon('Pause'),
        Heart: createIcon('Heart'),
        MessageCircle: createIcon('MessageCircle'),
        Mic: createIcon('Mic'),
        Star: createIcon('Star')
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
  });

  it('renders success stories and initializes Audio', async () => {
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
        },
      ],
    });

    render(<SuccessStories />);

    expect(await screen.findByText('Test Story')).toBeInTheDocument();
    expect(screen.getByText('"This is a test story."')).toBeInTheDocument();

    // Check Audio initialization
    expect(MockAudio).toHaveBeenCalledTimes(2);
  });

  it('shows toast on validation error', async () => {
    CommunityService.getSuccessStories.mockResolvedValue({ stories: [] });
    render(<SuccessStories />);

    // Wait for loading to finish
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
