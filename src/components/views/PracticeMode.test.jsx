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

// Mock IndexedDB to prevent SettingsProvider crashes
vi.mock('../../services/IndexedDBManager', () => ({
    indexedDB: {
        ensureReady: vi.fn().mockResolvedValue(true),
        getSetting: vi.fn().mockResolvedValue({}),
        saveSetting: vi.fn(),
        getJournals: vi.fn().mockResolvedValue([]),
        getSessions: vi.fn().mockResolvedValue([])
    }
}));

// Mock TTS
vi.mock('../../services/TextToSpeechService', () => ({
    textToSpeechService: {
        init: vi.fn(),
        speak: vi.fn()
    }
}));

// Mock lazy-loaded components
vi.mock('../viz/DynamicOrb', () => ({
    __esModule: true,
    default: () => <div data-testid="dynamic-orb">Dynamic Orb</div>
}));
vi.mock('../viz/PitchVisualizer', () => ({
    __esModule: true,
    default: () => <div data-testid="pitch-visualizer">Pitch Visualizer</div>
}));
vi.mock('../ui/ResizablePanel', () => ({
    default: ({ children, className }) => <div className={className} data-testid="resizable-panel">{children}</div>
}));
vi.mock('../ui/VisualizerSkeleton', () => ({ default: () => <div data-testid="visualizer-skeleton">Skeleton</div> }));
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
        // Pitch tab might be hidden on small screens or text might be split
        // Using getByRole for tabs is safer if implemented, but here text is fine if visible.

        // Check for other tabs to confirm rendering
        expect(screen.getByText('Resonance')).toBeInTheDocument();
        expect(screen.getByText('Weight')).toBeInTheDocument();

        // Note: Lazy loaded components like DynamicOrb are difficult to test with vi.mock
        // in this environment without proper Suspense/Act handling or eager loading mocks.
        // We assume if the container renders, the lazy load would trigger in a real browser.
    });
});
