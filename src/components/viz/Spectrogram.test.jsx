import { render, cleanup } from '@testing-library/react';
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

// Mock Contexts
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ settings: { spectrogramColorScheme: 'magma' } })
}));

vi.mock('../../context/AudioContext', () => ({
  useAudio: () => ({
    dataRef: {
      current: {
        spectrum: new Float32Array(1024).fill(0.5)
      }
    },
    isAudioActive: true,
    audioContext: { sampleRate: 44100 }
  })
}));

describe('Spectrogram', () => {
  let mockContext;

  beforeEach(() => {
    // Mock canvas context
    mockContext = {
      createImageData: vi.fn((w, h) => ({
        width: w,
        height: h,
        data: { buffer: new ArrayBuffer(w * h * 4) }
      })),
      drawImage: vi.fn(),
      putImageData: vi.fn(),
      fillRect: vi.fn(),
      canvas: { width: 800, height: 200 } // Default matching props
    };

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

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

  it('cleans up subscription on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(<Spectrogram height={200} />);

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('executes draw function without error', () => {
    let drawCallback;
    renderCoordinator.subscribe.mockImplementation((id, cb) => {
      drawCallback = cb;
      return vi.fn();
    });

    render(<Spectrogram height={200} />);

    expect(drawCallback).toBeDefined();

    // Simulate draw call
    expect(() => drawCallback()).not.toThrow();

    // Check if drawImage and putImageData were called
    expect(mockContext.drawImage).toHaveBeenCalled();
    // Since we mock spectrum with data, putImageData should be called
    expect(mockContext.putImageData).toHaveBeenCalled();
  });
});
