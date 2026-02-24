import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PitchVisualizer from './PitchVisualizer';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { HIGH: 3 }
  }
}));

vi.mock('../../context/ProfileContext', () => ({
  useProfile: () => ({
    voiceProfiles: [{ id: 'fem', genderRange: { min: 180, max: 240 } }],
    activeProfile: 'fem'
  })
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: { genderFeedbackMode: 'neutral' },
    colorBlindMode: false
  })
}));

vi.mock('../../context/AudioContext', () => ({
  useAudio: () => ({
    audioEngineRef: { current: {} }
  })
}));

vi.mock('../../hooks/useFeedback', () => ({
  useFeedback: () => ({
    settings: {},
    setSettings: vi.fn()
  })
}));

vi.mock('../ui/FeedbackControls', () => ({
  default: () => <div data-testid="feedback-controls" />
}));

vi.mock('../../services/NormsService', () => ({
  NormsService: {
    getNorms: vi.fn(() => ({ pitch: { min: 100, max: 200, label: 'Norm' } }))
  }
}));

vi.mock('../../services/GenderPerceptionPredictor', () => ({
  predictGenderPerception: vi.fn(),
  getPerceptionColor: vi.fn(),
  AMBIGUITY_ZONE: { min: 155, max: 185 }
}));

vi.mock('./GenderTimeline', () => ({
  default: () => <div data-testid="gender-timeline" />
}));

vi.mock('./FeedbackManager', () => ({
  default: () => <div data-testid="feedback-manager" />
}));

// Mock Lucide icons
vi.mock('lucide-react', () => {
  const Icon = () => <svg />;
  return {
    RotateCcw: Icon,
    HelpCircle: Icon,
    AlertTriangle: Icon,
    X: Icon,
    Sparkles: Icon,
    BarChart2: Icon
  };
});

// Mock Canvas
const mockContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  fillRect: vi.fn(),
  scale: vi.fn(),
  setLineDash: vi.fn(),
  drawImage: vi.fn(),
  measureText: vi.fn(() => ({ width: 10 })),
  font: '',
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  lineCap: '',
  lineJoin: '',
  shadowBlur: 0,
  shadowColor: '',
  textAlign: ''
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

describe('PitchVisualizer', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        pitch: 200,
        clarity: 0.95,
        history: Array(100).fill(200),
        formants: { f1: 500, f2: 1500 },
        resonanceScore: 80
      }
    };

    // Mock ResizeObserver
    globalThis.ResizeObserver = class {
      observe() {}
      disconnect() {}
    };

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 400,
      top: 0,
      left: 0,
      right: 800,
      bottom: 400,
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders successfully and subscribes to renderCoordinator', () => {
    render(
      <PitchVisualizer
        dataRef={dataRef}
        targetRange={{ min: 180, max: 220 }}
        userMode="practice"
      />
    );
    expect(renderCoordinator.subscribe).toHaveBeenCalledWith(
      'pitch-visualizer',
      expect.any(Function),
      expect.anything()
    );
  });
});
