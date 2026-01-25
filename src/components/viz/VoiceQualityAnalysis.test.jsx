import { render, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import VoiceQualityAnalysis from './VoiceQualityAnalysis';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { QuadCoreAnalysisService } from '../../services/QuadCoreAnalysisService';
import { useProfile } from '../../context/ProfileContext';

// Mocks
vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn(),
    PRIORITY: { LOW: 3 }
  }
}));

vi.mock('../../services/QuadCoreAnalysisService');
vi.mock('../../context/ProfileContext');

// Mock Lucide icons to avoid render issues
vi.mock('lucide-react', () => ({
  Activity: () => <div data-testid="icon-activity" />,
  Info: () => <div data-testid="icon-info" />,
  Mic: () => <div data-testid="icon-mic" />,
  MicOff: () => <div data-testid="icon-micoff" />,
  Wind: () => <div data-testid="icon-wind" />,
  Heart: () => <div data-testid="icon-heart" />,
  Sun: () => <div data-testid="icon-sun" />,
  Layers: () => <div data-testid="icon-layers" />,
  AlertTriangle: () => <div data-testid="icon-alert" />,
  CheckCircle: () => <div data-testid="icon-check" />,
  HelpCircle: () => <div data-testid="icon-help" />
}));

describe('VoiceQualityAnalysis', () => {
  let mockAnalyze;
  let mockDataRef;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAnalyze = vi.fn();

    // Mock Service Implementation
    QuadCoreAnalysisService.mockImplementation(function() {
      return {
        analyze: mockAnalyze
      };
    });

    // Mock Profile Context
    useProfile.mockReturnValue({});

    mockDataRef = { current: { volume: 0.5, pitch: 200 } };
  });

  it('renders without crashing', () => {
    render(
      <VoiceQualityAnalysis
        dataRef={mockDataRef}
        colorBlindMode={false}
        toggleAudio={vi.fn()}
        isAudioActive={false}
      />
    );
    expect(screen.getByText('Quad-Core Analyzer')).toBeInTheDocument();
  });

  it('instantiates service only once', () => {
    const { rerender } = render(
      <VoiceQualityAnalysis
        dataRef={mockDataRef}
        colorBlindMode={false}
        toggleAudio={vi.fn()}
        isAudioActive={false}
      />
    );

    expect(QuadCoreAnalysisService).toHaveBeenCalledTimes(1);

    rerender(
      <VoiceQualityAnalysis
        dataRef={mockDataRef}
        colorBlindMode={true}
        toggleAudio={vi.fn()}
        isAudioActive={false}
      />
    );

    expect(QuadCoreAnalysisService).toHaveBeenCalledTimes(1);
  });

  it('subscribes to renderCoordinator when audio is active', () => {
    render(
      <VoiceQualityAnalysis
        dataRef={mockDataRef}
        colorBlindMode={false}
        toggleAudio={vi.fn()}
        isAudioActive={true}
      />
    );

    expect(renderCoordinator.subscribe).toHaveBeenCalledWith(
      expect.stringMatching(/^voice-quality-/),
      expect.any(Function),
      renderCoordinator.PRIORITY.LOW
    );
  });

  it('calls analyze when callback triggers', () => {
    let capturedCallback;
    renderCoordinator.subscribe.mockImplementation((id, cb, priority) => {
      capturedCallback = cb;
      return vi.fn();
    });

    render(
      <VoiceQualityAnalysis
        dataRef={mockDataRef}
        colorBlindMode={false}
        toggleAudio={vi.fn()}
        isAudioActive={true}
      />
    );

    // Mock analyze return
    mockAnalyze.mockReturnValue({
      scores: {
        texture: { score: 1, label: 'Soft', value: -60 },
        health: { status: 'Flow', label: 'Balanced', value: -12 },
        color: { percentage: 80, label: 'On Target', value: 2000 },
        mix: { percentage: 50, label: 'Mix', value: 1.0 }
      },
      feedback: { type: 'success', title: 'Good', message: 'Job' }
    });

    // Manually trigger the callback
    capturedCallback();

    expect(mockAnalyze).toHaveBeenCalledWith(mockDataRef.current, expect.objectContaining({ targetF2: 2000 }));
  });
});
