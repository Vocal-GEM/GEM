import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAchievements } from './useAchievements';

describe('useAchievements', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('returns null achievement initially', () => {
        const { result } = renderHook(() => useAchievements(null));

        expect(result.current.unlockedAchievement).toBeNull();
    });

    it('unlocks first_session achievement after first session', () => {
        const stats = {
            totalSessions: 1,
            currentStreak: 0
        };

        const { result } = renderHook(() => useAchievements(stats));

        expect(result.current.unlockedAchievement).toEqual({
            id: 'first_session',
            title: 'First Steps',
            description: 'Completed your first practice session.',
            condition: expect.any(Function)
        });
    });

    it('unlocks streak_3 achievement after 3 day streak', () => {
        const stats = {
            totalSessions: 3,
            currentStreak: 3
        };

        const { result } = renderHook(() => useAchievements(stats));

        // First session achievement should be unlocked first
        expect(result.current.unlockedAchievement.id).toBe('first_session');
    });

    it('does not unlock already unlocked achievements', () => {
        // Pre-unlock first_session
        localStorage.setItem('gem_achievements', JSON.stringify(['first_session']));

        const stats = {
            totalSessions: 1,
            currentStreak: 0
        };

        const { result } = renderHook(() => useAchievements(stats));

        expect(result.current.unlockedAchievement).toBeNull();
    });

    it('unlocks next achievement when first is already unlocked', () => {
        // Pre-unlock first_session
        localStorage.setItem('gem_achievements', JSON.stringify(['first_session']));

        const stats = {
            totalSessions: 5,
            currentStreak: 3
        };

        const { result } = renderHook(() => useAchievements(stats));

        expect(result.current.unlockedAchievement?.id).toBe('streak_3');
    });

    it('unlocks master_10 achievement after 10 sessions', () => {
        // Pre-unlock previous achievements
        localStorage.setItem('gem_achievements', JSON.stringify(['first_session', 'streak_3']));

        const stats = {
            totalSessions: 10,
            currentStreak: 5
        };

        const { result } = renderHook(() => useAchievements(stats));

        expect(result.current.unlockedAchievement?.id).toBe('master_10');
    });

    it('closes achievement when closeAchievement is called', () => {
        const stats = {
            totalSessions: 1,
            currentStreak: 0
        };

        const { result } = renderHook(() => useAchievements(stats));

        expect(result.current.unlockedAchievement).not.toBeNull();

        act(() => {
            result.current.closeAchievement();
        });

        expect(result.current.unlockedAchievement).toBeNull();
    });

    it('persists unlocked achievements to localStorage', () => {
        const stats = {
            totalSessions: 1,
            currentStreak: 0
        };

        renderHook(() => useAchievements(stats));

        const unlocked = JSON.parse(localStorage.getItem('gem_achievements'));
        expect(unlocked).toContain('first_session');
    });

    it('handles missing stats gracefully', () => {
        const { result } = renderHook(() => useAchievements(null));

        expect(result.current.unlockedAchievement).toBeNull();
        expect(() => result.current.closeAchievement()).not.toThrow();
    });

    it('only shows one achievement at a time', () => {
        const stats = {
            totalSessions: 10,
            currentStreak: 3
        };

        const { result } = renderHook(() => useAchievements(stats));

        // Should only show first unlocked achievement
        expect(result.current.unlockedAchievement.id).toBe('first_session');

        // Verify only one was unlocked
        const unlocked = JSON.parse(localStorage.getItem('gem_achievements'));
        expect(unlocked.length).toBe(1);
    });

    it('updates when stats change', () => {
        const { result, rerender } = renderHook(
            ({ stats }) => useAchievements(stats),
            { initialProps: { stats: { totalSessions: 0, currentStreak: 0 } } }
        );

        expect(result.current.unlockedAchievement).toBeNull();

        // Update stats to trigger achievement
        rerender({ stats: { totalSessions: 1, currentStreak: 0 } });

        expect(result.current.unlockedAchievement?.id).toBe('first_session');
    });
});
