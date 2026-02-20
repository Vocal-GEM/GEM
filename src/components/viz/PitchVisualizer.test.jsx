import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PitchVisualizer from './PitchVisualizer';
import { ProfileProvider } from '../../context/ProfileContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { AudioProvider } from '../../context/AudioContext';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { HIGH: 1 }
    }
}));

vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        audioEngineRef: { current: {} }
    }),
    AudioProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        voiceProfiles: [],
        activeProfile: 'neutral'
    }),
    ProfileProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        colorBlindMode: false,
        settings: {}
    }),
    SettingsProvider: ({ children }) => <div>{children}</div>
}));

describe('PitchVisualizer', () => {
    const mockDataRef = {
        current: {
            pitch: 200,
            history: new Array(100).fill(0),
            clarity: 0.9,
            volume: 0.5
        }
    };

    beforeEach(() => {
        // Mock HTMLCanvasElement.prototype.getContext
        HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
            clearRect: vi.fn(),
            scale: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fillText: vi.fn(),
            fillRect: vi.fn(),
            setLineDash: vi.fn(),
            drawImage: vi.fn(),
        }));

        // Mock ResizeObserver
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        };
    });

    it('renders without crashing', () => {
        render(
            <SettingsProvider>
                <ProfileProvider>
                    <AudioProvider>
                        <PitchVisualizer
                            dataRef={mockDataRef}
                            targetRange={{ min: 100, max: 200 }}
                        />
                    </AudioProvider>
                </ProfileProvider>
            </SettingsProvider>
        );

        // It renders a canvas
        // Note: The component returns a div wrapper around the canvas
        // We can check if the container renders
        // The label "Pitch" (or F0) is rendered
        expect(screen.getByText('Pitch')).toBeInTheDocument();
    });
});
