import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JournalForm from './JournalForm';

// Mock contexts
vi.mock('../../context/AudioContext', () => ({
  useAudio: () => ({
    audioEngineRef: {
      current: {
        startRecording: vi.fn(),
        stopRecording: vi.fn().mockResolvedValue('mock-url'),
      }
    }
  })
}));

vi.mock('../../context/JournalContext', () => ({
  useJournal: () => ({
    journalEntryData: null
  })
}));

// Mock data
vi.mock('../../data/selfCareJournalPrompts', () => ({
  getRandomPrompt: () => ({
    id: 'test-prompt',
    category: 'Test Category',
    prompt: 'This is a test prompt',
    icon: '🧪',
  }),
}));

describe('JournalForm Accessibility', () => {
  it('renders buttons with accessible labels', () => {
    render(<JournalForm />);

    // These assertions are expected to fail initially
    // We expect button names to be present (e.g. from aria-label or text content)
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  it('renders sentiment buttons with accessible labels', () => {
    render(<JournalForm />);

    // Check sentiment buttons
    expect(screen.getByRole('button', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /euphoric/i })).toBeInTheDocument();
  });

  it('has accessible label for Reading Script textarea', () => {
    render(<JournalForm />);
    // This looks for a label associated with the input
    expect(screen.getByLabelText(/reading script/i)).toBeInTheDocument();
  });

  it('has accessible label for Notes textarea', () => {
    render(<JournalForm />);
    expect(screen.getByLabelText(/how did it feel/i)).toBeInTheDocument();
  });

  it('has accessible label for Effort slider', () => {
    render(<JournalForm />);
    expect(screen.getByLabelText(/effort/i)).toBeInTheDocument();
  });

  it('has accessible label for Confidence slider', () => {
    render(<JournalForm />);
    expect(screen.getByLabelText(/confidence/i)).toBeInTheDocument();
  });
});
