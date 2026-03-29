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
vi.mock('../viz/DynamicOrb', () => ({ default: () => <div data-testid="dynamic-orb">Dynamic Orb</div> }));
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
vi.mock('../ui/ContextualTips', () => ({ default: () => <div>Contextual Tips</div> }));
vi.mock('../../utils/CoachingEngine', () => ({
    CoachingEngine: class {
        process() { return null; }
    }
}));
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
vi.mock('../../context/TourContext', () => ({
    useTour: () => ({ startTour: vi.fn() }),
    TourProvider: ({ children }) => <div>{children}</div>
}));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (k, d) => {
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
            return map[k] || d || k;
        }
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => {}
    }
}));
vi.mock('../ui/VisualizerSkeleton', () => ({ default: () => <div data-testid="visualizer-skeleton">Skeleton</div> }));
vi.mock('../ui/PracticeCardsPanel', () => ({ default: () => <div>Practice Cards</div> }));
vi.mock('../ui/CoachPanel', () => ({ default: () => <div>Coach Panel</div> }));
vi.mock('./TrainingView', () => ({ default: () => <div>Training View</div> }));
vi.mock('./ProgressiveStackingSession', () => ({ default: () => <div>Progressive Stacking</div> }));
vi.mock('../ui/AssessmentModule', () => ({ default: () => <div>Assessment Module</div> }));

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
        expect(await screen.findByTestId('dynamic-orb', {}, { timeout: 3000 })).toBeInTheDocument();
    });
});
