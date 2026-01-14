import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BreathinessMeter from './BreathinessMeter';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { SettingsProvider } from '../../context/SettingsContext';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { MEDIUM: 2, LOW: 3 }
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

describe('BreathinessMeter', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = { current: { breathinessGrbas: { composite_score: 50 }, oq_percent: 50 } };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('subscribes to RenderCoordinator on mount', () => {
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
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(
      <SettingsProvider>
        <BreathinessMeter dataRef={dataRef} />
      </SettingsProvider>
    );

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
