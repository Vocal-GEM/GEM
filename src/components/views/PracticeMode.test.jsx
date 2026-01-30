/* eslint-env jest */

import { render, screen, waitFor, act } from '@testing-library/react';

import { vi, describe, it, expect, beforeEach } from 'vitest';
import React, { Suspense } from 'react';
import PracticeMode from './PracticeMode';
import { NavigationProvider } from '../../context/NavigationContext';
import { AudioProvider } from '../../context/AudioContext';
import { ProfileProvider } from '../../context/ProfileContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { TourProvider } from '../../context/TourContext';
import { PracticeCardsProvider } from '../../context/PracticeCardsContext';

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

// Mock lazy-loaded components
// We use a simplified mock that renders synchronously for testing
vi.mock('../viz/DynamicOrb', () => ({ default: () => <div data-testid="dynamic-orb">Dynamic Orb</div> }));
vi.mock('../viz/PitchVisualizer', () => ({ default: () => <div data-testid="pitch-visualizer">Pitch Visualizer</div> }));
vi.mock('../viz/ResonanceOrb', () => ({ default: () => <div data-testid="resonance-orb">Resonance Orb</div> }));
vi.mock('../viz/VoiceQualityMeter', () => ({ default: () => <div data-testid="voice-quality-meter">Voice Quality Meter</div> }));
vi.mock('../viz/VowelSpacePlot', () => ({ default: () => <div data-testid="vowel-space-plot">Vowel Space Plot</div> }));
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

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', async () => {
        await act(async () => {
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
        });

        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Pitch')).toBeInTheDocument();

        // Wait for lazy loaded component
        await waitFor(() => {
            expect(screen.getByTestId('dynamic-orb')).toBeInTheDocument();
        });
    });
});
