import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioProvider, useAudio } from './AudioContext';
import { SettingsProvider } from './SettingsContext';
import { ProfileProvider } from './ProfileContext';

// Mock AuthContext
vi.mock('./AuthContext', () => ({
    useAuth: () => ({ user: { id: 'test' } }),
    AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock IndexedDBManager
vi.mock('../services/IndexedDBManager', () => ({
    indexedDB: {
        ensureReady: vi.fn().mockResolvedValue(true),
        getSetting: vi.fn().mockResolvedValue({}),
        saveSetting: vi.fn(),
        getProfiles: vi.fn().mockResolvedValue([]),
        saveProfile: vi.fn(),
        saveSession: vi.fn(),
        getSessions: vi.fn().mockResolvedValue([])
    }
}));

// Mock AudioEngine
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockSetNoiseGate = vi.fn();
const mockSetFilters = vi.fn();
const mockSetCalibration = vi.fn();

let audioUpdateCallback = null;

vi.mock('../engines/AudioEngine', () => {
    return {
        AudioEngine: class {
            constructor(onUpdate) {
                audioUpdateCallback = onUpdate;
                this.isActive = false;
            }
            start() {
                this.isActive = true;
                return mockStart();
            }
            stop() {
                this.isActive = false;
                mockStop();
            }
            setNoiseGate(val) { mockSetNoiseGate(val); }
            setFilters(min, max) { mockSetFilters(min, max); }
            setCalibration(min, max) { mockSetCalibration(min, max); }
        }
    };
});

// Wrapper for providers
const wrapper = ({ children }) => (
    <SettingsProvider>
        <ProfileProvider>
            <AudioProvider>
                {children}
            </AudioProvider>
        </ProfileProvider>
    </SettingsProvider>
);

describe('AudioContext Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        audioUpdateCallback = null;
    });

    it('should initialize AudioEngine on mount', () => {
        renderHook(() => useAudio(), { wrapper });
        expect(audioUpdateCallback).toBeDefined();
    });

    it('should toggle audio state', async () => {
        const { result } = renderHook(() => useAudio(), { wrapper });

        expect(result.current.isAudioActive).toBe(false);

        await act(async () => {
            await result.current.toggleAudio();
        });

        expect(result.current.isAudioActive).toBe(true);
        expect(mockStart).toHaveBeenCalled();

        await act(async () => {
            await result.current.toggleAudio();
        });

        expect(result.current.isAudioActive).toBe(false);
        expect(mockStop).toHaveBeenCalled();
    });

    it('should update dataRef when AudioEngine sends updates', () => {
        const { result } = renderHook(() => useAudio(), { wrapper });

        const testData = {
            pitch: 440,
            volume: 0.5,
            resonance: 1000,
            f1: 500,
            f2: 1500,
            history: [],
            debug: {}
        };

        act(() => {
            if (audioUpdateCallback) {
                audioUpdateCallback(testData);
            }
        });

        expect(result.current.dataRef.current.pitch).toBe(440);
        expect(result.current.dataRef.current.volume).toBe(0.5);
    });
});
