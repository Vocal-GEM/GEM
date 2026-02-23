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

    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();

    // Use getAllByLabelText because the component renders duplicates (likely for mobile/desktop layouts)
    // We just ensure at least one exists
    const effortSliders = screen.getAllByLabelText(/effort/i);
    expect(effortSliders.length).toBeGreaterThan(0);
    expect(effortSliders[0]).toBeInTheDocument();

    const confidenceSliders = screen.getAllByLabelText(/confidence/i);
    expect(confidenceSliders.length).toBeGreaterThan(0);
    expect(confidenceSliders[0]).toBeInTheDocument();
  });

  it('renders sentiment buttons with accessible labels', () => {
    render(<JournalForm />);

    expect(screen.getByRole('button', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /euphoric/i })).toBeInTheDocument();
  });
});
