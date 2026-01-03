import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import HighResSpectrogram from './HighResSpectrogram';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { SettingsProvider } from '../../context/SettingsContext';

// Mock RenderCoordinator
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

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  createImageData: vi.fn(() => ({
    data: { buffer: new ArrayBuffer(800 * 512 * 4) },
    width: 800,
    height: 512
  })),
  drawImage: vi.fn(),
  putImageData: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  canvas: { width: 800, height: 512 }
}));

describe('HighResSpectrogram', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = { current: { spectrum: new Float32Array(1024), f1: 0, f2: 0 } };
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
    // Implicit assertion: no error thrown
    vi.clearAllMocks();
  });

  it('subscribes to RenderCoordinator on mount', () => {
    render(
      <SettingsProvider>
        <HighResSpectrogram dataRef={dataRef} />
      </SettingsProvider>
    );

    expect(renderCoordinator.subscribe).toHaveBeenCalled();
    const [id, callback, priority] = renderCoordinator.subscribe.mock.calls[0];

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
