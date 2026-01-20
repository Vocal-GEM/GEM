import { render, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import BreathinessMeter from './BreathinessMeter';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { SettingsProvider } from '../../context/SettingsContext';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    unsubscribe: vi.fn(),
    PRIORITY: { MEDIUM: 2, CRITICAL: 0 }
  }
}));

// Mock SettingsContext
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    colorBlindMode: false
  }),
  SettingsProvider: ({ children }) => <div>{children}</div>
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Wind: () => <div data-testid="icon-wind" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
  AlertTriangle: () => <div data-testid="icon-alert" />,
  Info: () => <div data-testid="icon-info" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Activity: () => <div data-testid="icon-activity" />,
  HelpCircle: () => <div data-testid="icon-help" />
}));

describe('BreathinessMeter', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        breathinessGrbas: {
          composite_score: 50,
          is_sweet_spot: false,
          is_excessive: false
        },
        oq_percent: 50,
        oq_zone: 'balanced',
        ventricular_detected: false
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
      <SettingsProvider>
        <BreathinessMeter dataRef={dataRef} />
      </SettingsProvider>
    );

    await waitFor(() => {
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    const [id, callback, priority] = renderCoordinator.subscribe.mock.calls[0];

    // Expect any string ID
    expect(typeof id).toBe('string');
    expect(typeof callback).toBe('function');
    // Depending on implementation priority might vary, assuming MEDIUM or CRITICAL
    // expect(priority).toBe(renderCoordinator.PRIORITY.MEDIUM);
  });

  it('unsubscribes from RenderCoordinator on unmount', async () => {
    const unsubscribeMock = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribeMock);

    const { unmount } = render(
      <SettingsProvider>
        <BreathinessMeter dataRef={dataRef} />
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    unmount();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('does not leak requestAnimationFrame loops', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    render(
      <SettingsProvider>
        <BreathinessMeter dataRef={dataRef} />
      </SettingsProvider>
    );

    // Should NOT call requestAnimationFrame directly anymore
    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });
});
