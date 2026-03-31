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
  it('has accessible label for Reading Script textarea', () => {
    render(<JournalForm />);
    expect(screen.getByLabelText(/reading script/i)).toBeInTheDocument();
  });

  it('has accessible label for Notes textarea', () => {
    render(<JournalForm />);
    expect(screen.getByLabelText(/how did it feel/i)).toBeInTheDocument();
  });

  it('has accessible label for Effort slider', () => {
    render(<JournalForm />);
    // "Effort (1-10)" is the label text
    expect(screen.getByLabelText(/effort/i)).toBeInTheDocument();
  });

  it('has accessible label for Confidence slider', () => {
    render(<JournalForm />);
    expect(screen.getByLabelText(/confidence/i)).toBeInTheDocument();
  });

  it('has accessible name for Record button', () => {
    render(<JournalForm />);
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  it('has accessible Emotional Check-In section', () => {
    render(<JournalForm />);

    // Check for radiogroup role
    const radioGroup = screen.getByRole('radiogroup', { name: /how does your voice feel/i });
    expect(radioGroup).toBeInTheDocument();

    // Check for radio buttons within the group
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(5);

    // Verify specific radio buttons have correct labels
    expect(screen.getByRole('radio', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /euphoric/i })).toBeInTheDocument();

    // Verify default checked state (neutral/3)
    expect(screen.getByRole('radio', { name: /neutral/i })).toBeChecked();
  });

  it('has accessible name for Prompt Refresh button', () => {
     render(<JournalForm />);
     expect(screen.getByRole('button', { name: /get a writing prompt/i })).toBeInTheDocument();
  });
});
