import { render, cleanup } from '@testing-library/react';
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
  canvas: { width: 800, height: 512 }
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('HighResSpectrogram', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        spectrum: new Float32Array(1024).fill(0.5),
        f1: 500,
        f2: 1500
      }
    };

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

  it('executes draw loop correctly using binMap', () => {
    render(<HighResSpectrogram dataRef={dataRef} />);

    // Get the callback passed to subscribe
    const callback = renderCoordinator.subscribe.mock.calls[0][1];
    expect(typeof callback).toBe('function');

    // Execute the callback to test the draw logic
    // This will trigger binMap creation and usage
    callback();

    // Check if drawImage was called (which happens inside draw)
    expect(mockContext.drawImage).toHaveBeenCalled();

    // Verify optimization: drawImage called twice (once for shift, once for pixel fill? No, pixel fill uses putImageData)
    // Wait, my optimization REMOVED one drawImage call.
    // So it should be called ONCE (for shifting).
    // Let's check how many times it was called.
    expect(mockContext.drawImage).toHaveBeenCalledTimes(1);

    // Verify putImageData is called (to put the new strip)
    expect(mockContext.putImageData).toHaveBeenCalled();
  });
});
