import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import VoiceQualityMeter from './VoiceQualityMeter';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    unsubscribe: vi.fn(),
    PRIORITY: { CRITICAL: 0, MEDIUM: 2, LOW: 3 }
  }
}));

// Mock SettingsContext
vi.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    colorBlindMode: false
  })
}));

// Mock AudioContext
vi.mock('../../context/AudioContext', () => ({
  useAudio: () => ({
    audioEngineRef: { current: {} }
  })
}));

// Mock useFeedback hook
vi.mock('../../hooks/useFeedback', () => ({
  useFeedback: () => ({
    settings: {},
    setSettings: vi.fn()
  })
}));

// Mock FeedbackControls component
vi.mock('../ui/FeedbackControls', () => ({
  default: () => <div data-testid="feedback-controls" />
}));

describe('VoiceQualityMeter', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        weight: 50,
        isSilent: false,
        debug: { h1: 10, h2: 5, centroid: 1000 }
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    render(<VoiceQualityMeter dataRef={dataRef} />);
    expect(document.querySelector('.glass-panel')).toBeInTheDocument();
  });

  it('subscribes to RenderCoordinator on mount', () => {
    render(<VoiceQualityMeter dataRef={dataRef} />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(<VoiceQualityMeter dataRef={dataRef} />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('initializes with correct structure', () => {
    const { getByText } = render(<VoiceQualityMeter dataRef={dataRef} />);
    expect(getByText('Vocal Weight')).toBeInTheDocument();
    expect(getByText('Light / Airy')).toBeInTheDocument();
    expect(getByText('Heavy / Pressed')).toBeInTheDocument();
  });
});
