import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VoiceQualityAnalysis from './VoiceQualityAnalysis';
import { useProfile } from '../../context/ProfileContext';

// Mock dependencies
vi.mock('../../context/ProfileContext', () => ({
  useProfile: vi.fn(),
}));

vi.mock('../../services/QuadCoreAnalysisService', () => {
  return {
    QuadCoreAnalysisService: class MockQuadCoreAnalysisService {
      analyze() {
        return {
          scores: {
            texture: { score: 1, label: 'Balanced', value: -15 },
            health: { status: 'Flow', label: 'Flow', value: 0 },
            color: { percentage: 50, label: 'Neutral', value: 2000 },
            mix: { percentage: 50, label: 'Mix', value: 0.5 },
          },
          feedback: { type: 'success', message: 'Good job!' }
        };
      }
    },
  };
});

vi.mock('../../services/RenderCoordinator', () => ({
  renderCoordinator: {
    subscribe: vi.fn().mockReturnValue(vi.fn()),
    PRIORITY: { LOW: 10 },
  },
}));

describe('VoiceQualityAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProfile.mockReturnValue({ profile: {} });
  });

  it('renders without crashing', () => {
    const dataRef = { current: { spectrum: [] } };
    render(<VoiceQualityAnalysis dataRef={dataRef} isAudioActive={false} toggleAudio={() => {}} colorBlindMode={false} />);
    expect(screen.getByText('Quad-Core Analyzer')).toBeInTheDocument();
  });
});
