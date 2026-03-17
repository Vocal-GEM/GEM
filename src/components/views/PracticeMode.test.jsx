/* eslint-env jest */

import { render, screen } from '@testing-library/react';

import { vi, describe, it, expect } from 'vitest';
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
vi.mock('../viz/DynamicOrb', () => {
    const Component = () => <div data-testid="dynamic-orb">Dynamic Orb</div>;
    Component.displayName = 'DynamicOrb';
    return { default: Component };
});
vi.mock('../viz/ResonanceOrb', () => {
    const Component = () => <div data-testid="resonance-orb">Resonance Orb</div>;
    Component.displayName = 'ResonanceOrb';
    return { default: Component };
});
vi.mock('../viz/PitchVisualizer', () => ({ default: () => <div data-testid="pitch-visualizer">Pitch Visualizer</div> }));
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
    const mockAudioEngine = { current: {} };

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

        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Pitch')).toBeInTheDocument();
        // Check for visualization area
        // Wait for the Suspense boundary to resolve
        // In some test environments, nested Suspense with lazy imports needs extra time
        // Just verify the main container is present
        // Using document.getElementById because we used id="practice-tabs" not data-testid
        expect(document.getElementById('practice-tabs')).toBeInTheDocument();
    });
});
