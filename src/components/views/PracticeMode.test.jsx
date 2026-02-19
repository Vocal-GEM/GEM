/* eslint-env jest */

import { render, screen, act } from '@testing-library/react';

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

// Mock AudioContext
global.AudioContext = vi.fn().mockImplementation(() => ({
    createGain: vi.fn().mockReturnValue({ gain: { value: 0 }, connect: vi.fn() }),
    createOscillator: vi.fn().mockReturnValue({ start: vi.fn(), stop: vi.fn(), connect: vi.fn() }),
    createAnalyser: vi.fn().mockReturnValue({ frequencyBinCount: 1024, getByteFrequencyData: vi.fn(), getByteTimeDomainData: vi.fn() }),
    destination: {},
    currentTime: 0,
    resume: vi.fn(),
    suspend: vi.fn()
}));

// Mock AudioWorkletNode
global.AudioWorkletNode = vi.fn().mockImplementation(() => ({
    port: {
        postMessage: vi.fn(),
        onmessage: null
    },
    connect: vi.fn(),
    disconnect: vi.fn()
}));

// Setup global requestAnimationFrame mock to prevent timeouts
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

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

        // Use act to wrap render since it triggers effects
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
        // Practice mode has tabs, Pitch is one of them
        expect(screen.getByLabelText(/Switch to Pitch/i)).toBeInTheDocument();

        // Wait for Suspense to resolve (VisualizerSkeleton might be present first)
        // We use a generous timeout because of Suspense + ErrorBoundary + Lazy Load
        // NOTE: DynamicOrb mock is just a div with data-testid="dynamic-orb"
        // If Suspense is working correctly, it should eventually replace VisualizerSkeleton
        try {
            await screen.findByTestId('dynamic-orb', {}, { timeout: 8000 });
        } catch (e) {
            // Fallback: Check if skeleton is still there (meaning Suspense stuck or mock failed)
            // But if test failed, it means it couldn't find dynamic-orb.
            // Let's try debug
            // screen.debug();
            throw e;
        }
    }, 15000); // Set test timeout to 15s
});
