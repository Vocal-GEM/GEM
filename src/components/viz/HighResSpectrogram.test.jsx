import { render, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HighResSpectrogram from './HighResSpectrogram';
import { SettingsProvider } from '../../context/SettingsContext';
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
const mockSettings = {
  spectrogramColorScheme: 'magma'
};

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ settings: mockSettings }),
  SettingsProvider: ({ children }) => <div>{children}</div>
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(function() {
  this.observe = vi.fn();
  this.unobserve = vi.fn();
  this.disconnect = vi.fn();
});

// Mock Canvas getContext
const mockContext = {
  createImageData: vi.fn((w, h) => ({
    data: { buffer: new ArrayBuffer(w * h * 4) },
    height: h,
    width: w
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

    // Add getBoundingClientRect mock
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
    render(
      <SettingsProvider>
        <HighResSpectrogram dataRef={dataRef} />
      </SettingsProvider>
    );

    // Check if component rendered (by looking for overlay text)
    expect(screen.getByText(/High-Res Spectrogram/i)).toBeDefined();
    expect(renderCoordinator.subscribe).toHaveBeenCalled();

    const [, callback, priority] = renderCoordinator.subscribe.mock.calls[0];
    expect(priority).toBe(renderCoordinator.PRIORITY.MEDIUM);
    expect(typeof callback).toBe('function');
  });

  it('cleans up subscription on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(
      <SettingsProvider>
        <HighResSpectrogram dataRef={dataRef} />
      </SettingsProvider>
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('draws when callback is executed', () => {
     render(
      <SettingsProvider>
        <HighResSpectrogram dataRef={dataRef} />
      </SettingsProvider>
    );

    // Get the draw callback
    const drawCallback = renderCoordinator.subscribe.mock.calls[0][1];

    // Execute it
    drawCallback();

    // Verify canvas calls
    expect(mockContext.drawImage).toHaveBeenCalled();
    // 2 pixels shift
    expect(mockContext.drawImage).toHaveBeenCalledWith(
        expect.anything(),
        2, 0, expect.any(Number), expect.any(Number),
        0, 0, expect.any(Number), expect.any(Number)
    );

    expect(mockContext.putImageData).toHaveBeenCalled();
  });
});
