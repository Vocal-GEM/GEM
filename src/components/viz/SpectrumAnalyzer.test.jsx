import { render, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SpectrumAnalyzer from './SpectrumAnalyzer';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { lpcAnalyzer } from '../../utils/lpcAnalysis';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    unsubscribe: vi.fn(),
    PRIORITY: { MEDIUM: 2 }
  }
}));

vi.mock('../../utils/lpcAnalysis', () => ({
  lpcAnalyzer: {
    analyze: vi.fn(() => ({
      envelope: new Float32Array(512).fill(0.5),
      formants: [{ freq: 500, amp: 0.5 }, { freq: 1500, amp: 0.4 }]
    }))
  }
}));

// Mock ResizeObserver
const MockResizeObserver = vi.fn(function() {
  this.observe = vi.fn();
  this.unobserve = vi.fn();
  this.disconnect = vi.fn();
});

if (typeof globalThis !== 'undefined') {
    globalThis.ResizeObserver = MockResizeObserver;
} else if (typeof window !== 'undefined') {
    window.ResizeObserver = MockResizeObserver;
} else {
    global.ResizeObserver = MockResizeObserver;
}

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
  fill: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  arc: vi.fn(),
  canvas: { width: 600, height: 200 }
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

describe('SpectrumAnalyzer', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        spectrum: new Uint8Array(1024).fill(100),
        timeDomainData: new Uint8Array(1024).fill(128)
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders successfully', () => {
    render(<SpectrumAnalyzer dataRef={dataRef} />);
    expect(screen.getByText(/Spectrum & LPC Overlay/i)).toBeDefined();
  });

  it('subscribes to coordinator', async () => {
    render(<SpectrumAnalyzer dataRef={dataRef} />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });
});
