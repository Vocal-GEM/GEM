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

// Mock Toast and Button to avoid issues with their internal dependencies or animations
vi.mock('../ui/Toast', () => ({
  default: ({ message, type }) => <div data-testid="toast" data-type={type}>{message}</div>,
}));

// We can use the real Button if it's simple, but mocking ensures isolation
// However, the real Button is imported as { Button }
vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, isLoading, ...props }) => (
    <button onClick={onClick} disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  ),
}));

describe('SuccessStories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
