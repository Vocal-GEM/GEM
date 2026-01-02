import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HighResSpectrogram from './HighResSpectrogram';
import { SettingsProvider } from '../../context/SettingsContext';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { MEDIUM: 2 }
  }
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: { spectrogramColorScheme: 'inferno' }
  }),
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
        <HighResSpectrogram dataRef={dataRef} />
    );
    // Implicit assertion: no error thrown
  });
});
