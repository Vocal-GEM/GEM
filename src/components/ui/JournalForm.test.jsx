import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    // Note: In JournalForm.jsx, we fixed duplicate inputs. Now there should be only one input with this label.
    // The previous failure was due to duplicate inputs.
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

     // 1. Initial State: "Get a writing prompt" button
     const getPromptBtn = screen.getByRole('button', { name: /get a writing prompt/i });
     expect(getPromptBtn).toBeInTheDocument();

     // 2. Click it to show the prompt and the refresh button
     fireEvent.click(getPromptBtn);

     // 3. Now "Get another prompt" button should be visible
     const refreshBtn = screen.getByRole('button', { name: /get another prompt/i });
     expect(refreshBtn).toBeInTheDocument();
  });
});
