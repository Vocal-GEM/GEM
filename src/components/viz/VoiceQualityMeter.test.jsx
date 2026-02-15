import { render, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VoiceQualityMeter from './VoiceQualityMeter';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { CRITICAL: 1 }
  }
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: vi.fn(() => ({
    colorBlindMode: false,
    settings: {}
  }))
}));

vi.mock('../../context/AudioContext', () => ({
  useAudio: vi.fn(() => ({
    audioEngineRef: { current: {} }
  }))
}));

vi.mock('../../hooks/useFeedback', () => ({
  useFeedback: vi.fn(() => ({
    settings: {},
    setSettings: vi.fn()
  }))
}));

// Mock FeedbackControls component
vi.mock('../ui/FeedbackControls', () => ({
  default: () => <div data-testid="feedback-controls">Feedback Controls</div>
}));

describe('VoiceQualityMeter', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        weight: 50,
        isSilent: false,
        debug: { h1: 10, h2: 5, centroid: 200 }
      }
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders successfully', () => {
    render(<VoiceQualityMeter dataRef={dataRef} userMode="user" showAnalysis={true} />);
    expect(screen.getByText('Light / Airy')).toBeDefined();
    expect(screen.getByText('Vocal Weight')).toBeDefined();
    expect(screen.getByText('Heavy / Pressed')).toBeDefined();
    expect(screen.getByText('Real-Time Analysis')).toBeDefined();
    expect(screen.getByTestId('feedback-controls')).toBeDefined();
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

  it('updates DOM elements during animation loop', () => {
    // We need to capture the loop callback passed to subscribe
    let loopCallback;
    renderCoordinator.subscribe.mockImplementation((id, cb) => {
      loopCallback = cb;
      return vi.fn();
    });

    const { container } = render(<VoiceQualityMeter dataRef={dataRef} />);

    expect(loopCallback).toBeDefined();

    // Set some data
    dataRef.current.weight = 20; // Target = 80

    // Run the loop manually
    loopCallback();

    // Verify indicator position updated
    // 0 + (80-0)*0.05 = 4%
    // Find the indicator by searching for the style or class
    // It's the only div with style.left set in this component (mostly)
    const indicator = container.querySelector('div[style*="left"]');
    expect(indicator).toBeDefined();
    expect(indicator.style.left).toBe('4%');
  });
});
