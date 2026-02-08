import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AudioProvider, useAudio } from './AudioContext';
// Mock SettingsContext and ProfileContext
vi.mock('./SettingsContext', () => ({
    useSettings: () => ({
        settings: {
            micProfile: {},
            noiseGate: 0.01,
            pitchSmoothing: 'medium',
            signalValidation: true,
            listenMode: false
        }
    }),
    SettingsProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('./ProfileContext', () => ({
    useProfile: () => ({
        filterSettings: { min: 60, max: 800 },
        calibration: { dark: 100, bright: 100 }
    }),
    ProfileProvider: ({ children }) => <div>{children}</div>
}));

// Mock AudioEngine
vi.mock('../engines/AudioEngine', () => {
    return {
        AudioEngine: vi.fn(function(onAudioUpdate) {
            this.start = vi.fn();
            this.stop = vi.fn();
            this.setNoiseGate = vi.fn();
            this.setPitchSmoothing = vi.fn();
            this.setSignalValidation = vi.fn();
            this.setFilters = vi.fn();
            this.setCalibration = vi.fn();
            this.setListenMode = vi.fn();
            this.onAudioUpdate = onAudioUpdate;
            this.isActive = false;
        })
    };
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
    value: {
        getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: vi.fn() }]
        }),
        enumerateDevices: vi.fn().mockResolvedValue([]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    },
    writable: true
});

import { AudioEngine } from '../engines/AudioEngine'; // Need to import mocked engine

const wrapper = ({ children }) => (
    <AudioProvider>{children}</AudioProvider>
);

describe('AudioContext Performance Optimization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should update dataRef in-place and maintain history', async () => {
        const { result } = renderHook(() => useAudio(), { wrapper });

        // Wait for init
        await act(async () => {
            await new Promise(r => setTimeout(r, 0));
        });

        // AudioEngine is a mock function, so .mock.instances should have the instance created with 'new'
        expect(AudioEngine).toHaveBeenCalled();
        const engineInstance = AudioEngine.mock.instances[0];

        // With vi.fn(function), 'this' is returned.
        expect(engineInstance).toBeDefined();

        // Access the callback passed to constructor
        // AudioEngine.mock.calls[0][0] is the onAudioUpdate arg
        const onAudioUpdate = AudioEngine.mock.calls[0][0];

        expect(typeof onAudioUpdate).toBe('function');

        // Initial state
        expect(result.current.dataRef.current.pitch).toBe(0);
        expect(result.current.dataRef.current.history.length).toBe(100);
        expect(result.current.dataRef.current.history[99]).toBe(0);

        // Simulate audio update 1
        const update1 = { pitch: 220, volume: 0.5 };
        act(() => {
            onAudioUpdate(update1);
        });

        expect(result.current.dataRef.current.pitch).toBe(220);
        expect(result.current.dataRef.current.history[99]).toBe(220); // Pushed to end
        expect(result.current.dataRef.current.history[0]).toBe(0); // Shifted

        // Simulate audio update 2
        const update2 = { pitch: 225, volume: 0.6 };
        act(() => {
            onAudioUpdate(update2);
        });

        expect(result.current.dataRef.current.pitch).toBe(225);
        expect(result.current.dataRef.current.history[99]).toBe(225);
        expect(result.current.dataRef.current.history[98]).toBe(220); // Previous value

        // Verify history length is stable
        expect(result.current.dataRef.current.history.length).toBe(100);

        // Verify object identity (ref.current should NOT change)
        const refBefore = result.current.dataRef.current;

        act(() => {
            onAudioUpdate({ pitch: 230 });
        });

        const refAfter = result.current.dataRef.current;
        expect(refAfter).toBe(refBefore); // Identity check
    });
});
