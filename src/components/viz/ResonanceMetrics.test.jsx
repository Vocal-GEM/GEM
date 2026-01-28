import { render, cleanup, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import ResonanceMetrics from './ResonanceMetrics';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { CRITICAL: 0, MEDIUM: 2, LOW: 3 }
  }
}));

describe('ResonanceMetrics', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        f1: 400,
        f2: 1200,
        resonance: 2500,
        resonanceScore: 65
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders metric labels', () => {
    render(<ResonanceMetrics dataRef={dataRef} />);

    expect(screen.getByText('R1 (F1)')).toBeInTheDocument();
    expect(screen.getByText('R2 (F2)')).toBeInTheDocument();
    expect(screen.getByText('Brightness')).toBeInTheDocument();
    expect(screen.getByText('RBI Score')).toBeInTheDocument();
  });

  it('subscribes to RenderCoordinator on mount', async () => {
    render(<ResonanceMetrics dataRef={dataRef} />);

    await waitFor(() => {
      expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });
  });

  it('unsubscribes on unmount', async () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(<ResonanceMetrics dataRef={dataRef} />);

    await waitFor(() => {
      expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
