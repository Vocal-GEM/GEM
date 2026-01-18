import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    PRIORITY: { MEDIUM: 2, LOW: 3 }
    PRIORITY: { CRITICAL: 0, MEDIUM: 2 }
  }
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    colorBlindMode: false
  }),
  SettingsProvider: ({ children }) => <div>{children}</div>
}));

// Mock lucide-react
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Wind: () => <div data-testid="icon-wind" />,
    CheckCircle2: () => <div data-testid="icon-check" />,
    AlertTriangle: () => <div data-testid="icon-alert" />,
    Info: () => <div data-testid="icon-info" />,
    Sparkles: () => <div data-testid="icon-sparkles" />,
    Activity: () => <div data-testid="icon-activity" />,
    HelpCircle: () => <div data-testid="icon-help" />
  };
});
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
    dataRef = { current: { breathinessGrbas: { composite_score: 50 }, oq_percent: 50 } };
    vi.clearAllMocks();
    dataRef = {
      current: {
        breathinessGrbas: { composite_score: 40 },
        oq_percent: 50
      }
    };
    vi.clearAllMocks();
    // Mock requestAnimationFrame to avoid loop in current implementation causing issues in tests
    vi.stubGlobal('requestAnimationFrame', vi.fn());
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    cleanup();
  });

  it('subscribes to RenderCoordinator on mount', () => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('subscribes to RenderCoordinator on mount', async () => {
    render(
      <SettingsProvider>
        <BreathinessMeter dataRef={dataRef} />
      </SettingsProvider>
    );

    expect(renderCoordinator.subscribe).toHaveBeenCalled();
    const [, , priority] = renderCoordinator.subscribe.mock.calls[0];
    expect(priority).toBe(renderCoordinator.PRIORITY.MEDIUM);
  });

  it('unsubscribes on unmount', () => {
    await waitFor(() => {
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    const [id, callback, priority] = renderCoordinator.subscribe.mock.calls[0];

    expect(id).toMatch(/breathiness-meter-/);
    expect(priority).toBe(renderCoordinator.PRIORITY.CRITICAL);
    expect(typeof callback).toBe('function');
  });

  it('unsubscribes on unmount', async () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(
      <SettingsProvider>
        <BreathinessMeter dataRef={dataRef} />
      </SettingsProvider>
    );

    await waitFor(() => {
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
