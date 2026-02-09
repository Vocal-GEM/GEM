import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import QualityVisualizer from './QualityVisualizer';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { MEDIUM: 2 }
  }
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
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(<QualityVisualizer dataRef={dataRef} />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('does not call requestAnimationFrame directly', () => {
    // Mock global window if in environment where window exists
    if (typeof window !== 'undefined') {
        const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
        render(<QualityVisualizer dataRef={dataRef} />);
        expect(rafSpy).not.toHaveBeenCalled();
        rafSpy.mockRestore();
    }
  });
});
