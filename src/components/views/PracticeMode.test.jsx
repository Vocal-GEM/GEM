/* eslint-env jest */

import { render, screen, waitFor } from '@testing-library/react';

import { vi, describe, it, expect } from 'vitest';
import PracticeMode from './PracticeMode';
import { NavigationProvider } from '../../context/NavigationContext';
import { ProfileProvider } from '../../context/ProfileContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { TourProvider } from '../../context/TourContext';
import { PracticeCardsProvider } from '../../context/PracticeCardsContext';
import React from 'react';

/* eslint-disable no-undef */
// Mock navigator.mediaDevices
global.navigator.mediaDevices = {
    enumerateDevices: vi.fn().mockResolvedValue([]),
    getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};
/* eslint-enable no-undef */

// Mock dependencies
vi.mock('../../context/NavigationContext', () => ({
    NavigationProvider: ({ children }) => <div>{children}</div>,
    useNavigation: () => ({
        practiceTab: 'overview',
        switchPracticeTab: vi.fn(),
        openModal: vi.fn(),
        navigationParams: {}
    })
}));

vi.mock('../../context/AudioContext', () => ({
    AudioProvider: ({ children }) => <div>{children}</div>,
    useAudio: () => ({
        audioEngineRef: { current: { startRecording: vi.fn(), stopRecording: vi.fn() } },
        isAudioActive: false,
        toggleAudio: vi.fn()
    })
}));

// Mock Lazy Components
vi.mock('../viz/DynamicOrb', () => ({ default: () => <div data-testid="dynamic-orb">Dynamic Orb</div> }));
vi.mock('../viz/PitchVisualizer', () => ({ default: () => <div data-testid="pitch-visualizer">Pitch Visualizer</div> }));
vi.mock('../viz/ResonanceOrb', () => ({ default: () => <div data-testid="resonance-orb">Resonance Orb</div> }));
vi.mock('../viz/VoiceQualityMeter', () => ({ default: () => <div data-testid="quality-meter">Quality Meter</div> }));
vi.mock('../viz/VowelSpacePlot', () => ({ default: () => <div data-testid="vowel-plot">Vowel Plot</div> }));
vi.mock('../viz/Spectrogram', () => ({ default: () => <div data-testid="spectrogram">Spectrogram</div> }));

vi.mock('../ui/ResizablePanel', () => ({
    default: ({ children, className }) => <div className={className} data-testid="resizable-panel">{children}</div>
}));
vi.mock('../ui/GenderPerceptionDashboard', () => ({ default: () => <div>Gender Dashboard</div> }));
vi.mock('../ui/PitchTargets', () => ({ default: () => <div>Pitch Targets</div> }));
vi.mock('../ui/PitchPipe', () => ({ default: () => <div>Pitch Pipe</div> }));
vi.mock('../viz/VoiceQualityAnalysis', () => ({ default: () => <div>Voice Quality Analysis</div> }));
vi.mock('../viz/VowelAnalysis', () => ({ default: () => <div>Vowel Analysis</div> }));
vi.mock('../ui/ToolExercises', () => ({ default: () => <div>Tool Exercises</div> }));
vi.mock('../ui/ComparisonTool', () => ({ default: () => <div>Comparison Tool</div> }));
vi.mock('../ui/CoachPanel', () => ({ default: () => <div>Coach Panel</div> })); // Mock CoachPanel to avoid loop issues

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ user: { id: 'test-user', username: 'Tester' } }),
    AuthProvider: ({ children }) => <div>{children}</div>
}));
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        saveSession: vi.fn(),
        calibration: {},
        targetRange: { min: 100, max: 200 },
        voiceProfiles: [],
        currentProfile: null
    }),
    ProfileProvider: ({ children }) => <div>{children}</div>
}));

describe('PracticeMode', () => {
    const mockDataRef = { current: { pitch: 200, resonance: 100, volume: 0.5 } };

    it('renders without crashing', async () => {

        render(
            <SettingsProvider>
                <ProfileProvider>
                    <NavigationProvider>
                        <TourProvider>
                            <PracticeCardsProvider>
                                <PracticeMode
                                    dataRef={mockDataRef}
                                    calibration={{}}
                                    targetRange={{ min: 100, max: 200 }}
                                    goals={{}}
                                    settings={{}}
                                />
                            </PracticeCardsProvider>
                        </TourProvider>
                    </NavigationProvider>
                </ProfileProvider>
            </SettingsProvider>
        );

        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Pitch')).toBeInTheDocument();

        // Wait for lazy loaded component
        await waitFor(() => {
            expect(screen.getByTestId('dynamic-orb')).toBeInTheDocument();
        }, { timeout: 5000 });
    });
});
