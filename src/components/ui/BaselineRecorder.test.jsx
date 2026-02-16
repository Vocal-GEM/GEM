import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BaselineRecorder from './BaselineRecorder';
import { useGuidedJourney } from '../../context/GuidedJourneyContext';

// Mock dependencies
vi.mock('../../context/GuidedJourneyContext', () => ({
  useGuidedJourney: vi.fn()
}));

vi.mock('../../services/IndexedDBManager', () => ({
  indexedDB: {
    saveRecording: vi.fn()
  }
}));

vi.mock('../../services/VoiceCalibrationService', () => ({
  VoiceCalibrationService: {
    analyzeBaseline: vi.fn(),
    saveBaseline: vi.fn()
  }
}));

// Mock MediaRecorder and getUserMedia
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: vi.fn(),
  onstop: vi.fn(),
  state: 'inactive'
};

globalThis.MediaRecorder = class {
  constructor() {
    return mockMediaRecorder;
  }
  static isTypeSupported() { return true; }
};

Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    })
  },
  writable: true
});

globalThis.URL.createObjectURL = vi.fn(() => 'blob:url');
globalThis.URL.revokeObjectURL = vi.fn();

describe('BaselineRecorder Accessibility', () => {
  beforeEach(() => {
    useGuidedJourney.mockReturnValue({
      saveBaselineRecording: vi.fn(),
      saveVoiceBaseline: vi.fn(),
      baselineRecording: null
    });
    vi.clearAllMocks();
    mockMediaRecorder.state = 'inactive';
  });

  it('renders start button with accessible label', () => {
    render(<BaselineRecorder instruction="Test instruction" />);

    const startButton = screen.getByLabelText('Start recording');
    expect(startButton).toBeInTheDocument();

    const helpButton = screen.getByLabelText('Recording tips');
    expect(helpButton).toBeInTheDocument();
  });

  it('renders stop button and timer with accessible attributes when recording', async () => {
    render(<BaselineRecorder instruction="Test instruction" />);

    const startButton = screen.getByLabelText('Start recording');
    fireEvent.click(startButton);

    // Wait for state change (async startRecording)
    await waitFor(() => {
        expect(screen.getByLabelText('Stop recording')).toBeInTheDocument();
    });

    const timer = screen.getByRole('timer');
    expect(timer).toBeInTheDocument();
    expect(timer).toHaveAttribute('aria-label', 'Recording duration');

    const status = screen.getByText('Recording... Click to stop');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('renders playback controls with accessible labels when done', async () => {
    // Pre-populate with existing recording
    useGuidedJourney.mockReturnValue({
      saveBaselineRecording: vi.fn(),
      saveVoiceBaseline: vi.fn(),
      baselineRecording: { data: { url: 'blob:existing-url' } }
    });

    render(<BaselineRecorder instruction="Test instruction" />);

    const playButton = screen.getByLabelText('Play recording');
    expect(playButton).toBeInTheDocument();

    const resetButton = screen.getByLabelText('Record again');
    expect(resetButton).toBeInTheDocument();
  });

  it('toggles play/pause label', () => {
     useGuidedJourney.mockReturnValue({
      saveBaselineRecording: vi.fn(),
      saveVoiceBaseline: vi.fn(),
      baselineRecording: { data: { url: 'blob:existing-url' } }
    });

    render(<BaselineRecorder instruction="Test instruction" />);

    const playButton = screen.getByLabelText('Play recording');

    // Mock audio play/pause since JSDOM doesn't implement HTMLMediaElement completely

    // We need to stub HTMLMediaElement.prototype.play and pause
    window.HTMLMediaElement.prototype.play = vi.fn();
    window.HTMLMediaElement.prototype.pause = vi.fn();

    fireEvent.click(playButton);

    expect(screen.getByLabelText('Pause playback')).toBeInTheDocument();
  });
});
