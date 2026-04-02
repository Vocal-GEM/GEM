import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Spectrogram from './Spectrogram';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { MEDIUM: 2 }
  }
}));

// Mock SettingsContext
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ settings: { spectrogramColorScheme: 'heatmap' } })
}));

// Mock AudioContext
const mockDataRef = { current: { spectrum: new Float32Array(1024).fill(0.5) } };
vi.mock('../../context/AudioContext', () => ({
  useAudio: () => ({
    dataRef: mockDataRef,
    isAudioActive: true,
    audioContext: { sampleRate: 44100 }
  })
}));

// Mock colormaps to avoid depending on its implementation details
vi.mock('../../utils/colormaps', () => ({
  generateColormap: vi.fn(() => new Uint32Array(256).fill(0xFF0000FF))
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
  fillRect: vi.fn(),
  canvas: { width: 800, height: 200 }
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

describe('Spectrogram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders without crashing and subscribes to renderCoordinator', () => {
    render(<Spectrogram />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(<Spectrogram />);
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
