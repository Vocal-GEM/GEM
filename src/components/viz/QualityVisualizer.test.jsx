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
