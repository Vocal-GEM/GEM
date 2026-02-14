import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LessonView from './LessonView';
import React from 'react';

// Mock dependencies
vi.mock('react-markdown', () => ({ default: ({ children }) => <div>{children}</div> }));
vi.mock('../viz/PitchVisualizer', () => ({ default: () => <div data-testid="pitch-visualizer" /> }));
vi.mock('../viz/ResonanceOrb', () => ({ default: () => <div data-testid="resonance-orb" /> }));
vi.mock('../viz/VoiceQualityMeter', () => ({ default: () => <div data-testid="voice-quality-meter" /> }));
vi.mock('../viz/VowelSpacePlot', () => ({ default: () => <div data-testid="vowel-space-plot" /> }));
vi.mock('../views/ArticulationView', () => ({ default: () => <div data-testid="articulation-view" /> }));
vi.mock('../viz/ContourVisualizer', () => ({ default: () => <div data-testid="contour-visualizer" /> }));
vi.mock('../viz/QualityVisualizer', () => ({ default: () => <div data-testid="quality-visualizer" /> }));
vi.mock('../viz/HighResSpectrogram', () => ({ default: () => <div data-testid="high-res-spectrogram" /> }));
vi.mock('../views/VocalFoldsView', () => ({ default: () => <div data-testid="vocal-folds-view" /> }));
vi.mock('./ComparisonTool', () => ({ default: () => <div data-testid="comparison-tool" /> }));
vi.mock('./BreathPacer', () => ({ default: () => <div data-testid="breath-pacer" /> }));
vi.mock('./TargetVoicePlayer', () => ({ default: () => <div data-testid="target-voice-player" /> }));
vi.mock('../viz/IntonationTrainer', () => ({ default: () => <div data-testid="intonation-trainer" /> }));
vi.mock('../ui/ResearchCitation', () => ({ default: () => <div data-testid="research-citation" /> }));

// Mock contexts
vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({ dataRef: { current: {} } })
}));
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({ targetRange: {}, calibration: {}, activeProfile: 'female' })
}));
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({ settings: {} })
}));

describe('LessonView', () => {
    const mockLesson = {
        id: 'lesson-1',
        title: 'Test Lesson',
        duration: '5 min',
        content: '# Hello\n\nThis is a test lesson content.',
        type: 'theory',
        citations: []
    };

    it('renders lesson title and content', () => {
        render(
            <LessonView
                lesson={mockLesson}
                onComplete={vi.fn()}
                onNext={vi.fn()}
                onPrevious={vi.fn()}
                hasNext={true}
                hasPrevious={false}
            />
        );

        expect(screen.getByText('Test Lesson')).toBeInTheDocument();
        expect(screen.getByText(/Hello/)).toBeInTheDocument();
    });

    it('renders reading progress bar', () => {
        render(
            <LessonView
                lesson={mockLesson}
                onComplete={vi.fn()}
                onNext={vi.fn()}
                onPrevious={vi.fn()}
                hasNext={true}
                hasPrevious={false}
            />
        );

        const progressBar = screen.getByRole('progressbar', { name: /lesson reading progress/i });
        expect(progressBar).toBeInTheDocument();
    });
});
