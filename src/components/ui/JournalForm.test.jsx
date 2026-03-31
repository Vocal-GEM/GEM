import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JournalForm from './JournalForm';

// Mock contexts
vi.mock('../../context/AudioContext', () => ({
  useAudio: () => ({
    audioEngineRef: {
      current: {
        startRecording: vi.fn(),
        stopRecording: vi.fn().mockResolvedValue('mock-url'),
      },
    },
  }),
}));

vi.mock('../../context/JournalContext', () => ({
  useJournal: () => ({
    journalEntryData: null,
  }),
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

    // Check for recording button
    // It starts with "Start recording"
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();

    // Check slider labels
    // We expect these labels to be present
    expect(screen.getByLabelText(/effort/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/confidence/i, { selector: 'input' })).toBeInTheDocument();
  });

  it('renders sentiment buttons with accessible labels', () => {
    render(<JournalForm />);

    // Check sentiment buttons
    expect(screen.getByRole('button', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /euphoric/i })).toBeInTheDocument();
  });

  it('renders prompt button correctly', () => {
      render(<JournalForm />);
      // Initial state: "Need a writing prompt?"
      // Note: aria-label "Get a writing prompt" takes precedence over text content
      expect(screen.getByRole('button', { name: /get a writing prompt/i })).toBeInTheDocument();
  });
});
