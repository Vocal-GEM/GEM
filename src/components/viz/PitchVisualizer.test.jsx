import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import PitchVisualizer from './PitchVisualizer';
import { ProfileProvider } from '../../context/ProfileContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { AudioProvider } from '../../context/AudioContext';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Canvas
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    scale: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    setLineDash: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  }));

  // Mock getBoundingClientRect
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 500,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 500,
  }));

  // Mock navigator.mediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [],
        getAudioTracks: () => []
      }),
      enumerateDevices: vi.fn().mockResolvedValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    writable: true
  });
});

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    setPerformanceMode: vi.fn(),
    PRIORITY: { HIGH: 1 }
  }
}));

vi.mock('../../utils/musicUtils', () => ({
  frequencyToNote: vi.fn(() => 'A4'),
  getCentsDeviation: vi.fn(() => 0)
}));

vi.mock('../../hooks/useFeedback', () => ({
  useFeedback: () => ({
    settings: {},
    setSettings: vi.fn()
  })
}));

vi.mock('../../services/NormsService', () => ({
  NormsService: {
    getNorms: vi.fn(() => null)
  }
}));

vi.mock('../../services/GenderPerceptionPredictor', () => ({
  predictGenderPerception: vi.fn(),
  getPerceptionColor: vi.fn(),
  AMBIGUITY_ZONE: { min: 165, max: 185 }
}));

// Mock useAuth since ProfileProvider uses it
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    loading: false
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('PitchVisualizer', () => {
  it('renders without crashing', () => {
    const dataRef = { current: { pitch: 200, history: [190, 200, 210] } };
    const targetRange = { min: 180, max: 220 };
    const settings = {};

    const { container } = render(
      <ProfileProvider>
        <SettingsProvider>
          <AudioProvider>
            <PitchVisualizer
              dataRef={dataRef}
              targetRange={targetRange}
              userMode="user"
              settings={settings}
            />
          </AudioProvider>
        </SettingsProvider>
      </ProfileProvider>
    );

    // Check for canvas
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
