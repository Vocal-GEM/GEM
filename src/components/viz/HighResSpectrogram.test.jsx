import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HighResSpectrogram from './HighResSpectrogram';
import { render, screen, cleanup, act } from '@testing-library/react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HighResSpectrogram from './HighResSpectrogram';
import { SettingsProvider } from '../../context/SettingsContext';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';
import HighResSpectrogram from './HighResSpectrogram';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { SettingsProvider } from '../../context/SettingsContext';
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
  useSettings: () => ({
    settings: { spectrogramColorScheme: 'inferno' }
  }),
  SettingsProvider: ({ children }) => <div>{children}</div>
}));

// Mock Canvas
const mockSettings = {
  spectrogramColorScheme: 'magma'
};

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ settings: mockSettings }),
  SettingsProvider: ({ children }) => <div>{children}</div>
}));

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  createImageData: vi.fn((w, h) => ({
    data: { buffer: new ArrayBuffer(w * h * 4) },
    height: h,
    width: w
  createImageData: vi.fn(() => ({
    data: { buffer: new ArrayBuffer(800 * 512 * 4) },
    width: 800,
    height: 512
    height: 512,
    width: 2
  })),
  drawImage: vi.fn(),
  putImageData: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  canvas: { width: 800, height: 512 },
  fillRect: vi.fn(),
  fillText: vi.fn(),
  canvas: { width: 800, height: 512 }
}));

// Mock URL.createObjectURL for screenshot test
globalThis.URL.createObjectURL = vi.fn();

describe('HighResSpectrogram', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = { current: { spectrum: new Float32Array(1024), f1: 0, f2: 0 } };
    // Add getBoundingClientRect mock
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 512,
      top: 0,
      left: 0,
      right: 800,
      bottom: 512,
    }));
    dataRef = {
        current: {
            spectrum: new Float32Array(1024).fill(0.5),
            f1: 500,
            f2: 1500
        }
    };
      current: {
        spectrum: new Float32Array(1024).fill(0.5),
        f1: 500,
        f2: 1500
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('subscribes to RenderCoordinator on mount', () => {
  it('renders successfully', () => {
    render(
      <SettingsProvider>
        <HighResSpectrogram dataRef={dataRef} />
      </SettingsProvider>
    );

    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('subscribes with correct priority', () => {
    // Check if component rendered (by looking for overlay text)
    expect(screen.getByText(/High-Res Spectrogram/i)).toBeDefined();
    // Implicit assertion: no error thrown
        <SettingsProvider>
            <HighResSpectrogram dataRef={dataRef} />
        </SettingsProvider>
    );
    // Implicit assertion: no error thrown
      <SettingsProvider>
        <HighResSpectrogram dataRef={dataRef} />
      </SettingsProvider>
    );

    expect(renderCoordinator.subscribe).toHaveBeenCalled();
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

    expect(renderCoordinator.subscribe).toHaveBeenCalled();
    const [, callback, priority] = renderCoordinator.subscribe.mock.calls[0];

    // Priority check
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
});
