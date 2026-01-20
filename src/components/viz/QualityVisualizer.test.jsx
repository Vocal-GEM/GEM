import { render, waitFor, act, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import QualityVisualizer from './QualityVisualizer';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock RenderCoordinator module
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
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
    vi.clearAllMocks();
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
  });

  it('SHOULD NOT call requestAnimationFrame recursively when driven by RenderCoordinator', async () => {
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 123);
    let registeredLoopCallback;

    renderCoordinator.subscribe.mockImplementation((id, cb) => {
      registeredLoopCallback = cb;
      return () => {};
    });

    render(<QualityVisualizer dataRef={dataRef} />);

    // Wait for the subscription
    await waitFor(() => {
      expect(renderCoordinator.subscribe).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function),
        expect.any(Number)
      );
    });

    // Execute the loop callback provided to RenderCoordinator
    act(() => {
      if (registeredLoopCallback) {
        registeredLoopCallback(0.016, performance.now());
      }
    });

    // CRITICAL CHECK: The loop callback should NOT call requestAnimationFrame itself
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();

    requestAnimationFrameSpy.mockRestore();
  });
});
