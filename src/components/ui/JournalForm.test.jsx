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

  it('renders exactly one Effort and one Confidence slider', () => {
    render(<JournalForm />);
    const effortSliders = screen.getAllByLabelText(/effort/i);
    const confidenceSliders = screen.getAllByLabelText(/confidence/i);

    expect(effortSliders).toHaveLength(1);
    expect(confidenceSliders).toHaveLength(1);
  });

  it('has accessible name for Record button and only one instance', () => {
    render(<JournalForm />);
    const recordButtons = screen.getAllByRole('button', { name: /start recording/i });
    expect(recordButtons).toHaveLength(1);
  });

  it('has accessible radiogroup for Emotional Check-In', () => {
    render(<JournalForm />);

    // Check for radiogroup
    const radiogroup = screen.getByRole('radiogroup', { name: /how does your voice feel/i });
    expect(radiogroup).toBeInTheDocument();

    // Check for radio buttons within
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(5); // 5 sentiments

    // Check specific labels
    expect(screen.getByRole('radio', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /euphoric/i })).toBeInTheDocument();
  });

  it('has accessible name for Prompt button', () => {
     render(<JournalForm />);
     expect(screen.getByRole('button', { name: /get a writing prompt/i })).toBeInTheDocument();
  });
});
