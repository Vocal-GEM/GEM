import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { indexedDB } from '../services/IndexedDBManager';

// Mock dependencies
vi.mock('../services/IndexedDBManager', () => ({
    indexedDB: {
        ensureReady: vi.fn().mockResolvedValue(),
        getSetting: vi.fn().mockResolvedValue(null),
        saveSetting: vi.fn(),
    }
}));

vi.mock('../services/TextToSpeechService', () => ({
    textToSpeechService: {
        init: vi.fn(),
    }
}));

describe('SettingsContext Personalization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should have default dashboard config', async () => {
        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });

        // Wait for initial load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.settings.dashboardConfig).toEqual({
            showStreak: true,
            showTotalPractice: true,
            showWeeklyActivity: true,
            showProgressTrends: true
        });
    });

    it('should update dashboard config', async () => {
        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });

        await act(async () => {
            result.current.updateSettings({
                ...result.current.settings,
                dashboardConfig: {
                    ...result.current.settings.dashboardConfig,
                    showStreak: false
                }
            });
        });

        expect(result.current.settings.dashboardConfig.showStreak).toBe(false);
        expect(indexedDB.saveSetting).toHaveBeenCalledWith('app_settings', expect.objectContaining({
            dashboardConfig: expect.objectContaining({ showStreak: false })
        }));
    });
});
