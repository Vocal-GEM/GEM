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

    // These assertions are expected to fail initially
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();

    // Check sliders have labels associated
    const effortSlider = screen.getByLabelText(/effort/i);
    expect(effortSlider).toBeInTheDocument();

    const confidenceSlider = screen.getByLabelText(/confidence/i);
    expect(confidenceSlider).toBeInTheDocument();
  });

  it('renders sentiment buttons with accessible labels', () => {
    render(<JournalForm />);

    // Check sentiment buttons
    expect(screen.getByRole('button', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /euphoric/i })).toBeInTheDocument();
  });
});
