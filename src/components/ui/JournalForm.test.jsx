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

    // These assertions are expected to fail initially if the component isn't accessible
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();

    // Check sliders have labels associated
    // Assuming sliders are accessible via aria-label or associated label
    // If multiple "Effort" labels exist (one for slider, one for display), getAllByLabelText might be needed.
    // Based on previous memory, getAllByLabelText was suggested.
    const effortLabels = screen.getAllByLabelText(/effort/i);
    expect(effortLabels.length).toBeGreaterThan(0);

    const confidenceLabels = screen.getAllByLabelText(/confidence/i);
    expect(confidenceLabels.length).toBeGreaterThan(0);
  });

  it('renders sentiment buttons with accessible labels', () => {
    render(<JournalForm />);

    // Check sentiment buttons
    expect(screen.getByRole('button', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /euphoric/i })).toBeInTheDocument();
  });
});
