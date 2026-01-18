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

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Info: () => <div data-testid="icon-info" />
}));

describe('ResonanceMetrics', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        f1: 400,
        f2: 1200,
        resonance: 2500, // centroid
        resonanceScore: 65 // RBI
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('subscribes to RenderCoordinator on mount', async () => {
    render(
      <ResonanceMetrics dataRef={dataRef} />
    );

    await waitFor(() => {
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    const [id, callback, priority] = renderCoordinator.subscribe.mock.calls[0];

    expect(id).toMatch(/resonance-metrics-/);
    // We expect LOW priority for text metrics
    expect(priority).toBe(renderCoordinator.PRIORITY.LOW);
    expect(typeof callback).toBe('function');
  });

  it('updates metrics when render loop fires', async () => {
    render(
      <ResonanceMetrics dataRef={dataRef} />
    );

    await waitFor(() => {
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    const callback = renderCoordinator.subscribe.mock.calls[0][1];

    // Initial render might show 0 or default state depending on implementation
    // Trigger update
    callback();

    await waitFor(() => {
        expect(screen.getByText('400')).toBeInTheDocument();
        expect(screen.getByText('1200')).toBeInTheDocument();
        expect(screen.getByText('2500')).toBeInTheDocument();
        expect(screen.getByText('65')).toBeInTheDocument();
    });

    // Update data and trigger again
    dataRef.current = {
        f1: 500,
        f2: 1500,
        resonance: 3000,
        resonanceScore: 80
    };

    callback();

    await waitFor(() => {
        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('1500')).toBeInTheDocument();
        expect(screen.getByText('3000')).toBeInTheDocument();
        expect(screen.getByText('80')).toBeInTheDocument();
    });
  });

  it('unsubscribes on unmount', async () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(
      <ResonanceMetrics dataRef={dataRef} />
    );

    await waitFor(() => {
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
