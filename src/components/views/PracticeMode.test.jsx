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

/* eslint-disable no-undef */
// Mock navigator.mediaDevices
global.navigator.mediaDevices = {
    enumerateDevices: vi.fn().mockResolvedValue([]),
    getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
};
/* eslint-enable no-undef */

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const map = {
                'practiceMode.tabs.overview': 'Overview',
                'practiceMode.tabs.pitch': 'Pitch',
                'practiceMode.tabs.resonance': 'Resonance',
                'practiceMode.tabs.weight': 'Weight',
                'practiceMode.tabs.vowel': 'Vowel',
                'practiceMode.tabs.spectrogram': 'Spectrogram',
                'practiceMode.tabs.training': 'Training',
                'practiceMode.actions.assessment': 'Assessment'
            };
            return map[key] || key;
        }
    }),
    initReactI18next: { type: '3rdParty', init: () => { } }
}));

// Mock i18next-browser-languagedetector
const MockLanguageDetector = class {
    constructor() { this.type = 'languageDetector'; }
    init() { }
    detect() { return 'en'; }
    cacheUserLanguage() { }
};
vi.mock('i18next-browser-languagedetector', () => ({ default: MockLanguageDetector }));

// Mock i18n.js
vi.mock('../../i18n', () => ({
    default: {
        use: () => ({
            use: () => ({
                init: () => { }
            })
        }),
        changeLanguage: vi.fn(),
        language: 'en'
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

// Mock child components
// Ensure they render synchronously or simple enough
vi.mock('../viz/DynamicOrb', () => ({ default: () => <div data-testid="dynamic-orb">Dynamic Orb</div> }));
vi.mock('../viz/PitchVisualizer', () => ({ default: () => <div data-testid="pitch-visualizer">Pitch Visualizer</div> }));
vi.mock('../viz/ResonanceOrb', () => ({ default: () => <div>Resonance Orb</div> }));
vi.mock('../viz/VoiceQualityMeter', () => ({ default: () => <div>Voice Quality Meter</div> }));
vi.mock('../viz/VowelSpacePlot', () => ({ default: () => <div data-testid="vowel-space-plot">Vowel Space Plot</div> }));
vi.mock('../viz/Spectrogram', () => ({ default: () => <div>Spectrogram</div> }));
vi.mock('../ui/VisualizerSkeleton', () => ({ default: () => <div data-testid="visualizer-skeleton">Loading...</div> }));

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
vi.mock('./TrainingView', () => ({ default: () => <div>Training View</div> }));
vi.mock('./ProgressiveStackingSession', () => ({ default: () => <div>Progressive Stacking</div> }));
vi.mock('../ui/AssessmentModule', () => ({ default: () => <div>Assessment Module</div> }));

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

        // Check for navigation tabs using getByRole
        // "Switch to Overview" should be the aria-label
        expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();

        // Wait for dynamic orb or skeleton
        await waitFor(() => {
            const orb = screen.queryByTestId('dynamic-orb');
            const skeleton = screen.queryByTestId('visualizer-skeleton');
            expect(orb || skeleton).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
