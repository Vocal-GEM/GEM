import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import QualityVisualizer from './QualityVisualizer';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
import { render, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import QualityVisualizer from './QualityVisualizer';

// Mock RenderCoordinator module
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(),
    PRIORITY: { MEDIUM: 2 }
  }
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Waves: () => <div data-testid="icon-waves" />,
  Wind: () => <div data-testid="icon-wind" />,
  Activity: () => <div data-testid="icon-activity" />
}));

describe('QualityVisualizer', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
        current: {
            jitter: 0.005,
            shimmer: 0.2,
            weight: 60
        }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders successfully', () => {
    const { getByText } = render(<QualityVisualizer dataRef={dataRef} />);
    expect(getByText('Voice Quality')).toBeDefined();
    expect(getByText('Jitter')).toBeDefined();
    expect(getByText('Shimmer')).toBeDefined();
    expect(getByText('Breathiness')).toBeDefined();
  });

  it('subscribes to RenderCoordinator on mount', () => {
    render(<QualityVisualizer dataRef={dataRef} />);

    expect(renderCoordinator.subscribe).toHaveBeenCalled();
describe('QualityVisualizer', () => {
  let requestAnimationFrameSpy;
  let mockSubscribe;

  beforeEach(async () => {
    requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 123);

    // Get the mocked instance
    const { renderCoordinator } = await import('../../services/RenderCoordinator');
    mockSubscribe = renderCoordinator.subscribe;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('SHOULD NOT call requestAnimationFrame recursively when driven by RenderCoordinator', async () => {
    const dataRef = { current: { jitter: 0.005, shimmer: 0.2, weight: 60 } };

    let registeredLoopCallback;
    mockSubscribe.mockImplementation((id, cb) => {
      registeredLoopCallback = cb;
      return () => {};
    });

    render(<QualityVisualizer dataRef={dataRef} />);

    // Wait for the dynamic import and subscription
    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith(
        'quality-visualizer',
        expect.any(Function),
        expect.any(Number)
      );
    });

    // Execute the loop callback provided to RenderCoordinator
    // It receives (delta, currentTime)
    act(() => {
      registeredLoopCallback(0.016, performance.now());
    });

    // CRITICAL CHECK: The loop callback should NOT call requestAnimationFrame itself
    // because RenderCoordinator handles the scheduling.
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
  });
});
