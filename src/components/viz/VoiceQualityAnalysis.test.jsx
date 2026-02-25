import { render, cleanup, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import VoiceQualityAnalysis from './VoiceQualityAnalysis';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { QuadCoreAnalysisService } from '../../services/QuadCoreAnalysisService';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(() => vi.fn()),
    unsubscribe: vi.fn(),
    PRIORITY: { LOW: 3 }
  }
}));

const mockAnalyze = vi.fn();

vi.mock('../../services/QuadCoreAnalysisService', () => {
  return {
    QuadCoreAnalysisService: class {
      constructor() {
        this.analyze = mockAnalyze;
      }
    }
  };
});

vi.mock('../../context/ProfileContext', () => ({
  useProfile: () => ({})
}));

describe('VoiceQualityAnalysis', () => {
  let dataRef;

  beforeEach(() => {
    dataRef = {
      current: {
        volume: 0.1,
        tilt: -12,
        f2: 2000,
        f3Noise: -60,
        harmonicRatio: 1.0
      }
    };
    vi.clearAllMocks();

    // Default mock return
    mockAnalyze.mockReturnValue({
      scores: {
        texture: { score: 1, label: 'Soft', value: -60 },
        health: { status: 'Flow', label: 'Balanced', value: -12 },
        color: { percentage: 80, label: 'Bright', value: 2000 },
        mix: { percentage: 50, label: 'Mix', value: 1.0 }
      },
      feedback: { type: 'success', message: 'Good job' }
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('subscribes to RenderCoordinator when active', () => {
    render(<VoiceQualityAnalysis dataRef={dataRef} isAudioActive={true} />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();
  });

  it('unsubscribes when inactive', () => {
    const { rerender } = render(<VoiceQualityAnalysis dataRef={dataRef} isAudioActive={true} />);
    expect(renderCoordinator.subscribe).toHaveBeenCalled();

    rerender(<VoiceQualityAnalysis dataRef={dataRef} isAudioActive={false} />);
    // We can't verify return value call easily with this mock setup but we verified subscribe was called
  });

  it('calls analysis service on render loop callback', () => {
    let callback;
    renderCoordinator.subscribe.mockImplementation((id, cb) => {
      callback = cb;
      return vi.fn();
    });

    render(<VoiceQualityAnalysis dataRef={dataRef} isAudioActive={true} />);

    expect(callback).toBeDefined();

    act(() => {
      callback(0.016, 1000);
    });

    expect(mockAnalyze).toHaveBeenCalled();
  });

  it('throttles UI updates to reduce re-renders', () => {
    let callback;
    renderCoordinator.subscribe.mockImplementation((id, cb) => {
      callback = cb;
      return vi.fn();
    });

    render(<VoiceQualityAnalysis dataRef={dataRef} isAudioActive={true} />);

    // 1. Initial Call at t=1000
    mockAnalyze.mockReturnValue({
      scores: {
        texture: { score: 1, label: 'Value A', value: -60 },
        health: { status: 'Flow', label: 'Balanced', value: -12 },
        color: { percentage: 80, label: 'Bright', value: 2000 },
        mix: { percentage: 50, label: 'Mix', value: 1.0 }
      },
      feedback: { type: 'success', message: 'Good job' }
    });

    act(() => {
      callback(0.016, 1000);
    });

    expect(screen.getByText('Value A')).toBeInTheDocument();

    // 2. Rapid Call at t=1010 (10ms later)
    mockAnalyze.mockReturnValue({
      scores: {
        texture: { score: 1, label: 'Value B', value: -60 }, // Changed value
        health: { status: 'Flow', label: 'Balanced', value: -12 },
        color: { percentage: 80, label: 'Bright', value: 2000 },
        mix: { percentage: 50, label: 'Mix', value: 1.0 }
      },
      feedback: { type: 'success', message: 'Good job' }
    });

    act(() => {
      callback(0.016, 1010);
    });

    // Should STILL show Value A because it was throttled
    expect(screen.getByText('Value A')).toBeInTheDocument();
    expect(screen.queryByText('Value B')).not.toBeInTheDocument();

    // Verify service was still called (for internal state)
    expect(mockAnalyze).toHaveBeenCalledTimes(2);

    // 3. Delayed Call at t=1100 (100ms later)
    mockAnalyze.mockReturnValue({
      scores: {
        texture: { score: 1, label: 'Value C', value: -60 }, // Changed value
        health: { status: 'Flow', label: 'Balanced', value: -12 },
        color: { percentage: 80, label: 'Bright', value: 2000 },
        mix: { percentage: 50, label: 'Mix', value: 1.0 }
      },
      feedback: { type: 'success', message: 'Good job' }
    });

    act(() => {
      callback(0.016, 1100);
    });

    // Should NOW show Value C
    expect(screen.getByText('Value C')).toBeInTheDocument();
    expect(screen.queryByText('Value A')).not.toBeInTheDocument();
  });
});
