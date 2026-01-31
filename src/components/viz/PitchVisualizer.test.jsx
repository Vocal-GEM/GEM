import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import PitchVisualizer from './PitchVisualizer';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    unsubscribe: vi.fn(),
    PRIORITY: { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
  }
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    colorBlindMode: false,
    settings: {
        genderFeedbackMode: 'neutral',
        showNorms: true,
        micProfile: { gateThreshold: 0.005 },
        noiseGate: 0.005,
        pitchSmoothing: 0.8,
        signalValidation: true,
        listenMode: 'microphone'
    }
  })
}));

vi.mock('../../context/ProfileContext', () => ({
  useProfile: () => ({
    voiceProfiles: [{ id: 'fem', targetRange: { min: 170, max: 220 } }],
    activeProfile: 'fem',
    filterSettings: { min: 80, max: 8000 },
    calibration: { dark: 500, bright: 2500 }
  })
}));

vi.mock('../../context/AudioContext', () => ({
  useAudio: () => ({
    audioEngineRef: { current: null }
  })
}));

vi.mock('../../hooks/useFeedback', () => ({
  useFeedback: () => ({
    settings: {},
    setSettings: vi.fn()
  })
}));

// Mock simple utils
vi.mock('../../utils/musicUtils', () => ({
    frequencyToNote: (f) => 'A4',
    getCentsDeviation: (f) => 0
}));

vi.mock('../../services/NormsService', () => ({
    NormsService: {
        getNorms: () => ({ pitch: { min: 100, max: 200, label: 'Test' } })
    }
}));

vi.mock('../../services/GenderPerceptionPredictor', () => ({
    predictGenderPerception: () => ({ score: 0.5, label: 'Androgynous' }),
    getPerceptionColor: () => '#ffffff',
    AMBIGUITY_ZONE: { min: 165, max: 185 }
}));

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        RotateCcw: (props) => <div {...props} data-testid="icon-rotate" />,
        HelpCircle: (props) => <div {...props} data-testid="icon-help" />,
        AlertTriangle: (props) => <div {...props} data-testid="icon-alert" />,
        X: (props) => <div {...props} data-testid="icon-x" />,
        Sparkles: (props) => <div {...props} data-testid="icon-sparkles" />,
        BarChart2: (props) => <div {...props} data-testid="icon-chart" />,
    };
});

describe('PitchVisualizer', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        pitch: 200,
        history: new Array(100).fill(0),
        clarity: 0.9,
        formants: { f1: 500, f2: 1500 }
      }
    };

    // ResizeObserver mock
    global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };

    // Canvas mock
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        scale: vi.fn(),
        setLineDash: vi.fn(),
    }));

    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<PitchVisualizer dataRef={dataRef} targetRange={{ min: 170, max: 220 }} />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('executes the draw loop without error', () => {
    render(<PitchVisualizer dataRef={dataRef} targetRange={{ min: 170, max: 220 }} />);

    // Get the callback passed to subscribe
    const loopCallback = renderCoordinator.subscribe.mock.calls[0][1];
    expect(typeof loopCallback).toBe('function');

    // Trigger the loop
    loopCallback();
  });
});
