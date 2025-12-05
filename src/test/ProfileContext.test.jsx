import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, renderHook, waitFor } from '@testing-library/react';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import { indexedDB } from '../services/IndexedDBManager';

// Mock IndexedDB
vi.mock('../services/IndexedDBManager', () => ({
    indexedDB: {
        ensureReady: vi.fn().mockResolvedValue(true),
        getProfiles: vi.fn().mockResolvedValue([]),
        saveProfile: vi.fn().mockResolvedValue(true),
        getSetting: vi.fn().mockResolvedValue(null),
        saveSetting: vi.fn().mockResolvedValue(true),
        saveSession: vi.fn().mockResolvedValue(true),
        getSessions: vi.fn().mockResolvedValue([])
    }
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

        it.skip('should switch profile', async () => {
            const { result } = renderHook(() => useProfile(), { wrapper });

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.voiceProfiles.length).toBeGreaterThan(1);
            }, { timeout: 2000 });

            // Create a new profile to switch to
            await act(async () => {
                await result.current.switchProfile('p2');
            });

            // Check if saveSetting was called
            await waitFor(() => {
                expect(indexedDB.saveSetting).toHaveBeenCalledWith('active_profile', 'p2');
            });
        });
    });
});
