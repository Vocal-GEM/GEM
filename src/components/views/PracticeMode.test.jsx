import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PracticeMode from './PracticeMode';
import React from 'react';

// Mock all external dependencies to isolate PracticeMode
vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => ({
        practiceTab: 'pitch',
        switchPracticeTab: vi.fn(),
        openModal: vi.fn(),
        navigationParams: {}
    })
}));

vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        audioEngineRef: { current: null },
        isAudioActive: false,
        toggleAudio: vi.fn()
    })
}));

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        saveSession: vi.fn()
    })
}));

vi.mock('../../context/TourContext', () => ({
    useTour: () => ({
        startTour: vi.fn()
    })
}));

// Mock child components that might cause issues in JSDOM
vi.mock('../viz/DynamicOrb', () => ({
    default: () => <div data-testid="dynamic-orb">Dynamic Orb Visualization</div>
}));

vi.mock('../viz/PitchVisualizer', () => ({
    default: () => <div data-testid="pitch-visualizer">Pitch Visualizer</div>
}));

vi.mock('../viz/ResonanceOrb', () => ({
    default: () => <div data-testid="resonance-orb">Resonance Orb</div>
}));

vi.mock('../ui/CoachPanel', () => ({
    default: () => <div data-testid="coach-panel">Coach Panel</div>
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'practiceMode.tabs.overview': 'Overview',
                'practiceMode.tabs.pitch': 'Pitch',
                'practiceMode.tabs.resonance': 'Resonance',
                'practiceMode.tabs.weight': 'Weight',
                'practiceMode.tabs.vowel': 'Vowel',
                'practiceMode.tabs.spectrogram': 'Spectrogram',
                'practiceMode.tabs.training': 'Training',
                'practiceMode.actions.assessment': 'Assessment',
                'practiceMode.session.start': 'Enable Microphone',
                'practiceMode.session.stop': 'Stop Microphone'
            };
            return translations[key] || key;
        }
    }),
    initReactI18next: { type: '3rdParty', init: () => {} }
}));

describe('PracticeMode', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                pitch: 200,
                volume: -20,
                clarity: 90,
                resonance: 50
            }
        };
        vi.clearAllMocks();
    });

    it('renders without crashing', async () => {
        render(
            <PracticeMode
                dataRef={dataRef}
                calibration={{}}
                targetRange={{ min: 180, max: 220 }}
                settings={{ colorBlindMode: false }}
            />
        );

        // Check if main elements are present
        expect(screen.getByText('Pitch')).toBeInTheDocument();

        // Check for visualization area - should be mocked PitchVisualizer since practiceTab is 'pitch'
        expect(await screen.findByTestId('pitch-visualizer')).toBeInTheDocument();
    });
});
