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

    // These assertions are expected to fail initially (based on comments) but should be checked
    // Assuming the component has been updated to have aria-labels or names
    // If not, we might need to adjust the test or the component, but here we fix the test file syntax first.
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();

    // Check sliders have labels associated
    // Note: getByLabelText might find multiple if the component renders duplicates or uses ambiguous text
    // We use getAllByLabelText and take the first one to be safe in this mock environment,
    // or rely on specific IDs if available. Here we assume unique labeling or just check existence.

    const effortSliders = screen.getAllByLabelText(/effort/i);
    expect(effortSliders[0]).toBeInTheDocument();

    const confidenceSliders = screen.getAllByLabelText(/confidence/i);
    expect(confidenceSliders[0]).toBeInTheDocument();
  });

  it('renders sentiment buttons with accessible labels', () => {
    render(<JournalForm />);

    // Check sentiment buttons
    expect(screen.getByRole('button', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /euphoric/i })).toBeInTheDocument();
  });
});
