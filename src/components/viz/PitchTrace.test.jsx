import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PitchTrace from './PitchTrace';

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('PitchTrace', () => {
  let ctxMock;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock Canvas Context
    ctxMock = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      setLineDash: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      canvas: { width: 800, height: 200 }
    };

    // Mock getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctxMock);

    // Mock getBoundingClientRect
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
        top: 0,
        left: 0,
        width: 800,
        height: 200
    }));
  });

  it('renders without crashing', () => {
    render(<PitchTrace data={[]} />);
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
  });

  it('calls stroke fewer times (after optimization)', () => {
    // Create mock data
    const data = [];
    for (let i = 0; i < 50; i++) {
      data.push({ time: i * 0.1, frequency: 200 + Math.sin(i) * 50 });
    }

    render(<PitchTrace data={data} duration={5} />);

    // With optimization, we batch strokes by color.
    // Max 3 colors (Green, Red, Yellow) = 3 strokes for trace.
    // Maybe axis lines or cursor add a few.
    // Definitely much less than 49.

    expect(ctxMock.stroke.mock.calls.length).toBeLessThan(10);
    // Also ensure it drew something
    expect(ctxMock.stroke).toHaveBeenCalled();
  });
});
