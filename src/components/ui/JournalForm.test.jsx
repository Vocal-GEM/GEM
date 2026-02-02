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
  it('renders buttons with accessible labels', () => {
    render(<JournalForm />);

    // Check for Record button (aria-label or text)
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument();

    // Check sliders have labels associated
    const effortSlider = screen.getAllByLabelText(/effort/i)[0];
    expect(effortSlider).toBeInTheDocument();

    const confidenceSlider = screen.getAllByLabelText(/confidence/i)[0];
    expect(confidenceSlider).toBeInTheDocument();
  });

  it('renders sentiment buttons with accessible labels', () => {
    render(<JournalForm />);

    expect(screen.getByRole('button', { name: /dysphoric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /euphoric/i })).toBeInTheDocument();
  });
});
