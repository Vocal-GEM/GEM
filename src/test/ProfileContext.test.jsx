import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, renderHook, waitFor } from '@testing-library/react';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import { indexedDB } from '../services/IndexedDBManager';

// Mock IndexedDB
const { mockIndexedDB } = vi.hoisted(() => ({
    mockIndexedDB: {
        ensureReady: vi.fn(),
        getProfiles: vi.fn(),
        saveProfile: vi.fn(),
        getSetting: vi.fn(),
        saveSetting: vi.fn(),
        saveSession: vi.fn(),
        getSessions: vi.fn()
    }
}));

vi.mock('../services/IndexedDBManager', () => ({
    indexedDB: mockIndexedDB
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-user' }
    })
}));

describe('ProfileContext Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIndexedDB.ensureReady.mockResolvedValue(true);
        mockIndexedDB.getProfiles.mockResolvedValue([]);
        mockIndexedDB.saveProfile.mockResolvedValue(true);
        mockIndexedDB.getSetting.mockResolvedValue(null);
        mockIndexedDB.saveSetting.mockResolvedValue(true);
        mockIndexedDB.saveSession.mockResolvedValue(true);
        mockIndexedDB.getSessions.mockResolvedValue([]);
    });

    const wrapper = ({ children }) => <ProfileProvider>{children}</ProfileProvider>;

    it('should provide default values', () => {
        const { result } = renderHook(() => useProfile(), { wrapper });

        expect(result.current.activeProfile).toBeDefined();
        expect(result.current.vocalHealth).toBeDefined();
        expect(result.current.skillLevel).toBe('beginner');
    });

    it('should update hydration', () => {
        const { result } = renderHook(() => useProfile(), { wrapper });

        const initialHydration = result.current.vocalHealth.hydration.current;

        act(() => {
            result.current.updateHydration(1);
        });

        expect(result.current.vocalHealth.hydration.current).toBe(initialHydration + 1);
    });

    it('should log fatigue', () => {
        const { result } = renderHook(() => useProfile(), { wrapper });

        act(() => {
            result.current.logFatigue(5);
        });

        expect(result.current.vocalHealth.fatigue.level).toBe(5);
    });

    describe('with multiple profiles', () => {
        beforeEach(() => {
            indexedDB.getProfiles.mockResolvedValue([
                { id: 'p1', name: 'Profile 1', targetRange: { min: 100, max: 200 } },
                { id: 'p2', name: 'Profile 2', targetRange: { min: 150, max: 250 } }
            ]);
        });

        it('should switch profile', async () => {
            const { result } = renderHook(() => useProfile(), { wrapper });

            // Wait for initial load
            await waitFor(() => {
                expect(mockIndexedDB.getProfiles).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(result.current.voiceProfiles.length).toBeGreaterThan(1);
            }, { timeout: 4000 });

            // Create a new profile to switch to
            // Create a new profile to switch to
            act(() => {
                result.current.switchProfile('p2');
            });

            // Check if saveSetting was called
            expect(mockIndexedDB.saveSetting).toHaveBeenCalledWith('active_profile', 'p2');
        }, 30000);
    });
});
