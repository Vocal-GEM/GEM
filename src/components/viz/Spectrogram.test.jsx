import { render, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Spectrogram from './Spectrogram';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { MEDIUM: 2 }
  }
}));

// Mock SettingsContext
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ settings: { spectrogramColorScheme: 'magma' } }),
  SettingsProvider: ({ children }) => <div>{children}</div>
}));

// Mock AudioContext
const mockDataRef = {
  current: {
    spectrum: new Float32Array(1024).fill(0.5),
  }
};

const mockAudioContextValue = {
  dataRef: mockDataRef,
  isAudioActive: true,
  audioContext: { sampleRate: 44100 }
};

vi.mock('../../context/AudioContext', () => ({
  useAudio: () => mockAudioContextValue
}));

// Mock Canvas getContext
const mockContext = {
  createImageData: vi.fn((w, h) => ({
    data: { buffer: new ArrayBuffer(w * h * 4) },
    width: w,
    height: h
  })),
  drawImage: vi.fn(),
  putImageData: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  scale: vi.fn(),
  canvas: { width: 800, height: 200 }
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

describe('Spectrogram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders successfully and subscribes to coordinator', () => {
    render(<Spectrogram height={200} />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(<Spectrogram height={200} />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('calls draw function via coordinator', () => {
    render(<Spectrogram height={200} />);

    // Get the callback passed to subscribe
    const drawCallback = renderCoordinator.subscribe.mock.calls[0][1];

    // Execute the callback (simulate a frame)
    drawCallback();

    // Expect canvas operations
    expect(mockContext.drawImage).toHaveBeenCalled();
    expect(mockContext.putImageData).toHaveBeenCalled();
  });
});
