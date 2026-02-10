/* eslint-env jest */

import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import React, { Suspense } from 'react';
import PracticeMode from './PracticeMode';
import { NavigationProvider } from '../../context/NavigationContext';
import { AudioProvider } from '../../context/AudioContext';
import { ProfileProvider } from '../../context/ProfileContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { TourProvider } from '../../context/TourContext';
import { PracticeCardsProvider } from '../../context/PracticeCardsContext';

// Mock global objects
globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

globalThis.navigator = {
    mediaDevices: {
        enumerateDevices: vi.fn().mockResolvedValue([]),
        getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    }
};

// Mock i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { changeLanguage: vi.fn() }
    }),
    initReactI18next: {
        type: '3rdParty',
        init: vi.fn()
    }
}));

// Mock Navigation Context
vi.mock('../../context/NavigationContext', () => ({
    NavigationProvider: ({ children }) => <div data-testid="nav-provider">{children}</div>,
    useNavigation: () => ({
        practiceTab: 'overview',
        switchPracticeTab: vi.fn(),
        openModal: vi.fn(),
        navigationParams: {}
    })
}));

// Mock VisualizerSkeleton
vi.mock('../ui/VisualizerSkeleton', () => ({
    default: () => <div data-testid="visualizer-skeleton">Loading...</div>
}));

// Mock Lazy Components
// We use a promise that resolves immediately for the lazy import to work smoothly in tests
const MockDynamicOrb = () => <div data-testid="dynamic-orb">Dynamic Orb</div>;
vi.mock('../viz/DynamicOrb', () => ({ default: MockDynamicOrb }));

vi.mock('../viz/PitchVisualizer', () => ({ default: () => <div data-testid="pitch-visualizer">Pitch Visualizer</div> }));
vi.mock('../viz/ResonanceOrb', () => ({ default: () => <div data-testid="resonance-orb">Resonance Orb</div> }));
vi.mock('../viz/Spectrogram', () => ({ default: () => <div data-testid="spectrogram">Spectrogram</div> }));
vi.mock('../viz/VoiceQualityMeter', () => ({ default: () => <div data-testid="voice-quality-meter">Voice Quality Meter</div> }));
vi.mock('../viz/VowelSpacePlot', () => ({ default: () => <div data-testid="vowel-space-plot">Vowel Space Plot</div> }));

// Mock other UI components to reduce noise
vi.mock('../ui/CoachPanel', () => ({ default: () => <div>Coach Panel</div> }));
vi.mock('../viz/ProgressCharts', () => ({ default: () => <div>Progress Charts</div> }));
vi.mock('../ui/PracticeCardsPanel', () => ({ default: () => <div>Practice Cards</div> }));
vi.mock('../ui/ResizablePanel', () => ({
    default: ({ children, className }) => <div className={className} data-testid="resizable-panel">{children}</div>
}));
vi.mock('../ui/GenderPerceptionBadge', () => ({ default: () => <div>Gender Badge</div> }));
vi.mock('../viz/PitchResonanceQuadrant', () => ({ default: () => <div>Quadrant</div> }));
vi.mock('../ui/ContextualTips', () => ({ default: () => <div>Tips</div> }));

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

// Mock ErrorBoundary
vi.mock('../ui/ErrorBoundary', () => ({
    default: ({ children }) => <div data-testid="error-boundary">{children}</div>
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
                                        settings={{ colorBlindMode: false }}
                                    />
                                </PracticeCardsProvider>
                            </TourProvider>
                        </NavigationProvider>
                    </AudioProvider>
                </ProfileProvider>
            </SettingsProvider>
        );

        // Check for static content first
        expect(screen.getByText('practiceMode.tabs.overview')).toBeInTheDocument();

        // Wait for lazy loaded component
        // Depending on timing, we might see the skeleton first or the orb immediately
        await waitFor(() => {
            const orb = screen.queryByTestId('dynamic-orb');
            const skeleton = screen.queryByTestId('visualizer-skeleton');

            // If we see the skeleton, we are still loading, so we throw to retry
            if (skeleton && !orb) {
                throw new Error('Still loading skeleton...');
            }

            expect(orb).toBeInTheDocument();
        }, { timeout: 4000 });
    });
});
