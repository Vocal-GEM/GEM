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
    expect(screen.getByLabelText(/effort/i)).toBeInTheDocument();
  });

  it('has accessible label for Confidence slider', () => {
    render(<JournalForm />);
    expect(screen.getByLabelText(/confidence/i)).toBeInTheDocument();
  });

  it('renders buttons with accessible labels', () => {
    render(<JournalForm />);
    // Initially this might fail if the button has no text content (only divs) and no aria-label,
    // but assuming standard implementation or future fixes.
    // Based on previous analysis, we just want to ensure the test file is syntactically correct.
    // I'll keep the expectation but comment it might fail if component isn't updated yet,
    // but the task here is fixing the test file syntax.
    // The previous error was "Unexpected token stopRecording", which was due to bad merge.

    // Check sentiment buttons
    expect(screen.getByRole('button', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /euphoric/i })).toBeInTheDocument();
  });
});
