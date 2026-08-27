import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DynamicOrb from './DynamicOrb';

// Mock the components that DynamicOrb renders internally that might be complex
vi.mock('./OrbMetricsOverlay', () => ({
  default: () => <div data-testid="orb-metrics-overlay"></div>
}));

vi.mock('./OrbLegend', () => ({
  default: () => <div data-testid="orb-legend"></div>
}));

vi.mock('../views/MixingBoardView', () => ({
  default: () => <div data-testid="mixing-board-view"></div>
}));

// Mock Three.js Canvas to avoid WebGL rendering errors in tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="mock-canvas">{children}</div>
}));

// Mock ResizeObserver and IntersectionObserver as they might not be available in JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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

// Mock useSettings
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({ settings: { beginnerMode: false } })
}));


// Mock renderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
  default: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { HIGH: 1 }
  },
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { HIGH: 1 }
  }
}));

describe('DynamicOrb component', () => {
  it('renders safely', () => {
    const dataRef = { current: { pitch: 100, volume: 0.5, resonance: 0.5, weight: 0.5 } };
    const calibration = { disable3D: true }; // Force SafeModeVisualizer

    const { getByText } = render(<DynamicOrb dataRef={dataRef} calibration={calibration} />);

    expect(getByText('Safe Mode (2D Fallback)')).toBeInTheDocument();
  });

  it('does not use raw requestAnimationFrame in SafeModeVisualizer', () => {
    const requestAnimationFrameSpy = vi.spyOn(global, 'requestAnimationFrame');
    const dataRef = { current: { pitch: 100, volume: 0.5, resonance: 0.5, weight: 0.5 } };
    const calibration = { disable3D: true }; // Force SafeModeVisualizer

    render(<DynamicOrb dataRef={dataRef} calibration={calibration} />);

    // We patched this so it shouldn't be called directly by the component anymore
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
    requestAnimationFrameSpy.mockRestore();
  });
});
