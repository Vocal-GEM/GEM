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

    // These assertions are expected to fail initially
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();

    // Check sliders have labels associated
    // Using getAllByLabelText because there might be multiple elements matching the regex (label + input)
    // or use exact match if possible.
    // The previous error showed multiple inputs with IDs related to effort.
    // Let's use getByLabelText with exact: false and selector to be specific if needed,
    // or just handle the array if it returns multiple.
    // However, getByLabelText should return the INPUT associated with the label.
    // If there are multiple inputs labeled "Effort", we need to distinguish them.
    // Looking at the logs, it seems there are two inputs with 'effort' related attributes or labels.
    // Let's try to be more specific or just pick the first one if both are valid.
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
