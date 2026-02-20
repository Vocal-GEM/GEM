import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LiveMetricsBar from './LiveMetricsBar';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { CRITICAL: 0, MEDIUM: 2, LOW: 3 }
  }
}));

describe('LiveMetricsBar', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        pitch: 0,
        f1: 0,
        f2: 0,
        weight: 0
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<LiveMetricsBar dataRef={dataRef} />);

    // Initially F0 should be '--' because pitch is 0
    expect(screen.getByText(/F0:/)).toHaveTextContent('F0: --Hz');
    expect(screen.getByText(/F1:/)).toHaveTextContent('F1: 0Hz');
    expect(screen.getByText(/F2:/)).toHaveTextContent('F2: 0Hz');
    expect(screen.getByText(/W:/)).toHaveTextContent('W: 0');
  });

  it('subscribes to RenderCoordinator on mount', () => {
    render(<LiveMetricsBar dataRef={dataRef} />);
    expect(renderCoordinator.subscribe).toHaveBeenCalledWith(
      'live-metrics-bar',
      expect.any(Function),
      renderCoordinator.PRIORITY.CRITICAL
    );
  });

  it('updates metrics when loop callback runs', () => {
    let loopCallback;
    renderCoordinator.subscribe.mockImplementation((id, cb) => {
      loopCallback = cb;
      return vi.fn();
    });

    render(<LiveMetricsBar dataRef={dataRef} />);

    // Update dataRef
    dataRef.current = {
      pitch: 220.5,
      f1: 800.2,
      f2: 1200.8,
      weight: 45.4
    };

    // Trigger loop callback
    if (loopCallback) loopCallback();

    // Check DOM updates (should be rounded)
    expect(screen.getByText(/F0:/)).toHaveTextContent('F0: 221Hz');
    expect(screen.getByText(/F1:/)).toHaveTextContent('F1: 800Hz');
    expect(screen.getByText(/F2:/)).toHaveTextContent('F2: 1201Hz');
    expect(screen.getByText(/W:/)).toHaveTextContent('W: 45');
  });

  it('shows -- for F0 when pitch is 0', () => {
    let loopCallback;
    renderCoordinator.subscribe.mockImplementation((id, cb) => {
      loopCallback = cb;
      return vi.fn();
    });

    render(<LiveMetricsBar dataRef={dataRef} />);

    // Update dataRef with 0 pitch
    dataRef.current = {
      pitch: 0,
      f1: 500,
      f2: 1000,
      weight: 50
    };

    // Trigger loop callback
    if (loopCallback) loopCallback();

    expect(screen.getByText(/F0:/)).toHaveTextContent('F0: --Hz');
  });
});
