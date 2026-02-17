/* eslint-env jest */

import { render, screen, waitFor } from '@testing-library/react';

import { vi, describe, it, expect } from 'vitest';
import PracticeMode from './PracticeMode';
import { NavigationProvider } from '../../context/NavigationContext';
import { AudioProvider } from '../../context/AudioContext';
import { ProfileProvider } from '../../context/ProfileContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { TourProvider } from '../../context/TourContext';
import { PracticeCardsProvider } from '../../context/PracticeCardsContext';
import React from 'react';

// Mock navigator.mediaDevices
globalThis.navigator.mediaDevices = {
    enumerateDevices: vi.fn().mockResolvedValue([]),
    getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};

// Mock AudioContext
globalThis.AudioContext = vi.fn().mockImplementation(() => ({
    createGain: vi.fn().mockReturnValue({ gain: { value: 0, setTargetAtTime: vi.fn(), cancelScheduledValues: vi.fn() }, connect: vi.fn() }),
    createOscillator: vi.fn().mockReturnValue({ connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { setValueAtTime: vi.fn() } }),
    createAnalyser: vi.fn().mockReturnValue({ connect: vi.fn(), frequencyBinCount: 1024, getFloatTimeDomainData: vi.fn(), getFloatFrequencyData: vi.fn() }),
    createMediaStreamSource: vi.fn().mockReturnValue({ connect: vi.fn() }),
    createBuffer: vi.fn(),
    createBufferSource: vi.fn().mockReturnValue({ connect: vi.fn(), start: vi.fn() }),
    resume: vi.fn(),
    destination: {}
}));

// Mock Feature Flags
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        dashboard: true,
        practice: true,
        journal: true,
        analysis: true,
        analytics: true,
        library: true,
        'client-dashboard': true,
        capev: true,
        spectrogram: true,
        'pitch-tool': true,
        camera: true,
        settings: true
    }
}));

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

// Mock Visualization Components
vi.mock('../viz/DynamicOrb', () => ({
    default: () => <div data-testid="dynamic-orb">Dynamic Orb</div>
}));
vi.mock('../viz/PitchVisualizer', () => ({ default: () => <div data-testid="pitch-visualizer">Pitch Visualizer</div> }));
vi.mock('../viz/VoiceQualityMeter', () => ({ default: () => <div>Voice Quality Meter</div> }));
vi.mock('../viz/VowelSpacePlot', () => ({ default: () => <div>Vowel Space Plot</div> }));
vi.mock('../viz/ResonanceOrb', () => ({ default: () => <div>Resonance Orb</div> }));
vi.mock('../viz/Spectrogram', () => ({ default: () => <div>Spectrogram</div> }));

// Mock UI Components
vi.mock('../ui/VisualizerSkeleton', () => ({ default: () => <div data-testid="visualizer-skeleton">Loading Visualizer...</div> }));
vi.mock('../ui/ErrorBoundary', () => ({ default: ({ children }) => <div data-testid="error-boundary">{children}</div> }));
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
                    <AudioProvider>
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
                    </AudioProvider>
                </ProfileProvider>
            </SettingsProvider>
        );

        // Verify skeleton appears (proof of mounting) or orb (proof of loading)
        // This makes the test resilient to Suspense resolution timing in JSDOM
        await waitFor(() => {
            const orb = screen.queryByTestId('dynamic-orb');
            const skeleton = screen.queryByTestId('visualizer-skeleton');
            expect(orb || skeleton).toBeInTheDocument();
        });

        expect(screen.getByText('Overview')).toBeInTheDocument();
    });
});
