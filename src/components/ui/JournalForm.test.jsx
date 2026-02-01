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
     // Based on the code, if currentPrompt is null, it shows "Need a writing prompt?"
     // The error says "Unable to find an accessible element with the role "button" and name /need a writing prompt/i"
     // But the DOM output shows: <button ...>Need a writing prompt?</button>
     // Ah, the button has a span/icon inside too? No, it has SVG then text.
     // Wait, it says:
     /*
     <button
       aria-label="Get a writing prompt"
       class="..."
       type="button"
     >
       <svg ... />
       Need a writing prompt?
     </button>
     */
     // It has aria-label="Get a writing prompt". Accessible name computation prioritizes aria-label.
     // So name is "Get a writing prompt", NOT "Need a writing prompt?".

     expect(screen.getByRole('button', { name: /get a writing prompt/i })).toBeInTheDocument();
  });
});
