import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import BaselineRecorder from './BaselineRecorder';
import { useGuidedJourney } from '../../context/GuidedJourneyContext';

// Mock the context hook
vi.mock('../../context/GuidedJourneyContext', () => ({
  useGuidedJourney: vi.fn(),
}));

// Mock the indexedDB service
vi.mock('../../services/IndexedDBManager', () => ({
  indexedDB: {
    saveRecording: vi.fn().mockResolvedValue({}),
  },
}));

// Mock the VoiceCalibrationService
vi.mock('../../services/VoiceCalibrationService', () => ({
  VoiceCalibrationService: {
    analyzeBaseline: vi.fn().mockResolvedValue({}),
    saveBaseline: vi.fn(),
  },
}));

// Mock MicQualityTips to avoid rendering it (and its portal/animations)
vi.mock('./MicQualityTips', () => ({
  default: () => <div data-testid="mic-tips-modal">Mic Tips</div>,
}));

describe('BaselineRecorder Accessibility', () => {
  const mockSaveBaselineRecording = vi.fn();
  const mockSaveVoiceBaseline = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useGuidedJourney.mockReturnValue({
      saveBaselineRecording: mockSaveBaselineRecording,
      saveVoiceBaseline: mockSaveVoiceBaseline,
      baselineRecording: null,
    });

    // Mock MediaRecorder
    globalThis.MediaRecorder = class {
      constructor() {
        this.state = 'inactive';
        this.start = vi.fn().mockImplementation(() => { this.state = 'recording'; });
        this.stop = vi.fn().mockImplementation(() => {
            this.state = 'inactive';
            if (this.onstop) this.onstop();
        });
        this.ondataavailable = null;
        this.onstop = null;
      }
      static isTypeSupported() { return true; }
    };

    // Mock getUserMedia
    globalThis.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    };

    // Mock URL.createObjectURL
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it('has accessible label for recording button', () => {
    render(<BaselineRecorder />);
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    expect(recordButton).toBeInTheDocument();
  });

  it('has accessible label for help button', () => {
    render(<BaselineRecorder />);
    const helpButton = screen.getByRole('button', { name: /recording tips/i });
    expect(helpButton).toBeInTheDocument();
  });

  it('shows stop button and timer with correct roles when recording', async () => {
    render(<BaselineRecorder />);
    const recordButton = screen.getByRole('button', { name: /start recording/i });

    await act(async () => {
        fireEvent.click(recordButton);
    });

    const stopButton = await screen.findByRole('button', { name: /stop recording/i });
    expect(stopButton).toBeInTheDocument();

    const timer = screen.getByRole('timer');
    expect(timer).toBeInTheDocument();
    expect(timer).toHaveTextContent('0:00');
  });

  it('shows playback and reset controls when recording is done', async () => {
    render(<BaselineRecorder />);
    const recordButton = screen.getByRole('button', { name: /start recording/i });

    // Start recording
    await act(async () => {
        fireEvent.click(recordButton);
    });

    // Wait for stop button
    const stopButton = await screen.findByRole('button', { name: /stop recording/i });

    // Stop recording
    await act(async () => {
        fireEvent.click(stopButton);
    });

    // It goes to processing state first, then done.
    // We mocked saveRecording to resolve immediately, but there might be a microtask delay.
    // The component sets 'done' state after save is complete.

    // Wait for playback controls
    const playButton = await screen.findByRole('button', { name: /play recording/i });
    expect(playButton).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /record again/i });
    expect(resetButton).toBeInTheDocument();
  });
});
