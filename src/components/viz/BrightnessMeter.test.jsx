import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';


// Mock dependencies
const mockRenderCoordinator = {
  subscribe: vi.fn(() => vi.fn()),
  PRIORITY: { LOW: 1 }
};

vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: mockRenderCoordinator
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: { colorBlindMode: false }
  })
}));

// Use dynamic import instead of require for ESM compatibility
const BrightnessMeter = (await import('./BrightnessMeter')).default;

// Mock canvas context
const mockContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  roundRect: vi.fn(),
  canvas: { width: 200, height: 60 }
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

describe('BrightnessMeter', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        spectralCentroid: 2500, // Balanced
        spectralRolloff: 3000
      }
    };
    vi.clearAllMocks();
  });

  it('renders successfully', () => {
    render(<BrightnessMeter dataRef={dataRef} />);
    expect(screen.getByText('Brightness')).toBeDefined();
  });

  it('subscribes to render coordinator', () => {
    render(<BrightnessMeter dataRef={dataRef} />);
    expect(mockRenderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('displays correct label for balanced input', async () => {
    render(<BrightnessMeter dataRef={dataRef} />);
    // Initial state is "Neutral" or similar based on logic
    expect(screen.getByText(/Neutral|Balanced/)).toBeDefined();
  });
});
