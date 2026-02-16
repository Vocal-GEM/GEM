import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VoiceQualityMeter from './VoiceQualityMeter';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    PRIORITY: { CRITICAL: 0 }
  }
}));

vi.mock('../../context/SettingsContext', () => ({
  useSettings: vi.fn(() => ({ colorBlindMode: false }))
}));

vi.mock('../../context/AudioContext', () => ({
  useAudio: vi.fn(() => ({ audioEngineRef: { current: {} } }))
}));

vi.mock('../../hooks/useFeedback', () => ({
  useFeedback: vi.fn(() => ({ settings: {}, setSettings: vi.fn() }))
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Info: () => <div data-testid="info-icon" />
}));

// Mock FeedbackControls
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

  it('renders successfully', () => {
    const { getByText, getByTestId } = render(<VoiceQualityMeter dataRef={dataRef} userMode="default" />);
    expect(getByText('Vocal Weight')).toBeDefined();
    expect(getByTestId('feedback-controls')).toBeDefined();
  });

  it('subscribes to RenderCoordinator on mount', () => {
    render(<VoiceQualityMeter dataRef={dataRef} userMode="default" />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    renderCoordinator.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = render(<VoiceQualityMeter dataRef={dataRef} userMode="default" />);
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
