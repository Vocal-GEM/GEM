import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import BreathinessMeter from './BreathinessMeter';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    unsubscribe: vi.fn(),
    PRIORITY: { CRITICAL: 0, MEDIUM: 2, LOW: 3 }
  }
}));

// Mock SettingsContext
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    colorBlindMode: false
  })
}));

describe('BreathinessMeter', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        breathinessGrbas: { composite_score: 50 },
        oq_percent: 50,
        oq_zone: 'balanced',
        ventricular_detected: false
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('subscribes to RenderCoordinator on mount', () => {
    render(<BreathinessMeter dataRef={dataRef} />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(<BreathinessMeter dataRef={dataRef} />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('does not leak requestAnimationFrame loops', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    render(<BreathinessMeter dataRef={dataRef} />);

    // Should NOT call requestAnimationFrame directly anymore
    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });
});
