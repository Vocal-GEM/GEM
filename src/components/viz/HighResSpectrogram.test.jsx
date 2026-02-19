import { render, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HighResSpectrogram from './HighResSpectrogram';
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
  useSettings: () => ({ settings: { spectrogramColorScheme: 'magma' } }),
  SettingsProvider: ({ children }) => <div>{children}</div>
}));

describe('HighResSpectrogram', () => {
  let dataRef;
  let mockContext;
  let drawImageSpy;

  beforeEach(() => {
    dataRef = {
      current: {
        spectrum: new Float32Array(1024).fill(0.5),
        f1: 500,
        f2: 1500
      }
    };

    drawImageSpy = vi.fn();
    mockContext = {
      createImageData: vi.fn((w, h) => ({
        data: { buffer: new ArrayBuffer(w * h * 4) },
        width: w,
        height: h
      })),
      drawImage: drawImageSpy,
      putImageData: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      scale: vi.fn(),
      canvas: { width: 800, height: 512 }
    };

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 512,
      top: 0,
      left: 0,
      right: 800,
      bottom: 512,
    }));

    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders successfully and subscribes to coordinator', () => {
    render(<HighResSpectrogram dataRef={dataRef} />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('cleans up subscription on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(<HighResSpectrogram dataRef={dataRef} />);

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('calls drawImage exactly once per frame (avoids N+1 re-renders)', () => {
    // Capture the callback passed to subscribe
    let drawCallback;
    renderCoordinator.subscribe.mockImplementation((id, cb) => {
      drawCallback = cb;
      return vi.fn();
    });

    render(<HighResSpectrogram dataRef={dataRef} />);

    expect(drawCallback).toBeDefined();

    // Execute one frame
    drawCallback();

    // Verify optimization: drawImage should be called once (to shift canvas), not N times
    expect(drawImageSpy).toHaveBeenCalledTimes(1);
  });
});
