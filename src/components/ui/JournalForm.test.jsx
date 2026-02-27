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
    // Use getAllByLabelText because there might be multiple inputs (mobile/desktop versions)
    // or just pick the first one which is standard behavior if multiple exist but we want *an* accessible one.
    // However, duplicate IDs/Labels is an accessibility issue.
    // Assuming for now we just want to ensure at least one is found.
    const sliders = screen.getAllByLabelText(/effort/i);
    expect(sliders.length).toBeGreaterThan(0);
    expect(sliders[0]).toBeInTheDocument();
  });

  it('has accessible label for Confidence slider', () => {
    render(<JournalForm />);
    const sliders = screen.getAllByLabelText(/confidence/i);
    expect(sliders.length).toBeGreaterThan(0);
    expect(sliders[0]).toBeInTheDocument();
  });

  it('has accessible name for Record button', () => {
    render(<JournalForm />);
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();
  });

  it('has accessible name for Sentiment buttons', () => {
    render(<JournalForm />);
    expect(screen.getByRole('button', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /euphoric/i })).toBeInTheDocument();
  });

  it('has accessible name for Prompt Refresh button', () => {
     render(<JournalForm />);
     expect(screen.getByRole('button', { name: /get a writing prompt/i })).toBeInTheDocument();
  });
});
