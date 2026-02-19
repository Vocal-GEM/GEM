import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FlowPhonationMeter from './FlowPhonationMeter';
import renderCoordinator from '../../services/RenderCoordinator';
import { SettingsProvider } from '../../context/SettingsContext';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  default: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    PRIORITY: { MEDIUM: 2 }
  }
}));

// Mock SettingsContext to avoid complex dependencies
vi.mock('../../context/SettingsContext', async () => {
    const actual = await vi.importActual('../../context/SettingsContext');
    const React = await vi.importActual('react');
    const SettingsContext = React.createContext({
        settings: { colorBlindMode: false },
        colorBlindMode: false
    });
    return {
        ...actual,
        useSettings: () => ({ colorBlindMode: false }),
        SettingsProvider: ({ children }) => <SettingsContext.Provider value={{ colorBlindMode: false }}>{children}</SettingsContext.Provider>,
        SettingsContext
    };
});


// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Wind: () => <div data-testid="icon-wind" />,
  Activity: () => <div data-testid="icon-activity" />,
  AlertTriangle: () => <div data-testid="icon-alert" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
  RotateCcw: () => <div data-testid="icon-rotate" />,
  Zap: () => <div data-testid="icon-zap" />
}));

describe('FlowPhonationMeter', () => {
  const mockDataRef = {
    current: {
      phonationState: {
        is_flow: true,
        is_strained: false,
        spectral_tilt: 0
      },
      stabilityScore: 85,
      onsetAnalysis: {
        is_target: true,
        label: 'Soft Onset'
      }
    }
  };

  const renderWithContext = (ui) => {
    return render(
      <SettingsProvider>
        {ui}
      </SettingsProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup subscribe mock to return an unsubscribe function
    renderCoordinator.subscribe.mockReturnValue(vi.fn());
  });

  it('subscribes to RenderCoordinator on mount', () => {
    renderWithContext(<FlowPhonationMeter dataRef={mockDataRef} />);

    expect(renderCoordinator.subscribe).toHaveBeenCalledTimes(1);
    expect(renderCoordinator.subscribe).toHaveBeenCalledWith(
      expect.any(String), // subscriberId
      expect.any(Function), // loop callback
      renderCoordinator.PRIORITY.MEDIUM
    );
  });

  it('unsubscribes from RenderCoordinator on unmount', () => {
    const unsubscribeMock = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribeMock);

    const { unmount } = renderWithContext(<FlowPhonationMeter dataRef={mockDataRef} />);
    unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('renders correctly with flow state', () => {
    const { getByText } = renderWithContext(<FlowPhonationMeter dataRef={mockDataRef} />);
    expect(getByText('Flow Phonation')).toBeTruthy();
    expect(getByText('Optimal Flow - efficient \'touch\' closure')).toBeTruthy();
  });
});
