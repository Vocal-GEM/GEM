import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DynamicOrb from './DynamicOrb';

// Mock dependencies
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({ camera: { position: { set: vi.fn() } } })
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ settings: { debugMode: false } })
}));

vi.mock('./OrbLegend', () => ({
  default: () => <div data-testid="orb-legend" />
}));

vi.mock('./OrbMetricsOverlay', () => ({
  default: () => <div data-testid="orb-metrics-overlay" />
}));

vi.mock('../views/MixingBoardView', () => ({
  default: () => <div data-testid="mixing-board-view" />
}));

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { HIGH: 1 }
  }
}));


// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true }]);
  }
  unobserve() {}
  disconnect() {}
};

describe('DynamicOrb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to RenderCoordinator in safe mode', async () => {
    const renderCoordinatorMock = await import('../../services/RenderCoordinator');
    const subscribeSpy = vi.spyOn(renderCoordinatorMock.renderCoordinator, 'subscribe');

    const dataRef = { current: { pitch: 440, volume: 0.5 } };

    await act(async () => {
      render(
        <DynamicOrb
          dataRef={dataRef}
          calibration={{ disable3D: true }}
          mode="safe"
          setMode={vi.fn()}
        />
      );
    });

    expect(subscribeSpy).toHaveBeenCalledWith(
      'dynamic-orb-safe-mode',
      expect.any(Function),
      renderCoordinatorMock.renderCoordinator.PRIORITY.HIGH
    );
  });
});
