import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { coachMemory } from './CoachMemory';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        },
        removeItem: (key) => {
            delete store[key];
        },
    };
})();

global.localStorage = localStorageMock;

describe('CoachMemory', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset the singleton instance
        coachMemory.history = { sessions: [], milestones: [] };
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('initialization', () => {
        it('loads history from localStorage on construction', () => {
            const testData = {
                sessions: [{ timestamp: Date.now(), duration: 10 }],
                milestones: ['first_session'],
            };
            localStorage.setItem('gem_coach_memory', JSON.stringify(testData));

            const loaded = coachMemory.loadHistory();

            expect(loaded.sessions).toEqual(testData.sessions);
            expect(loaded.milestones).toEqual(testData.milestones);
        });

        it('returns empty history when localStorage is empty', () => {
            const history = coachMemory.loadHistory();

            expect(history).toEqual({ sessions: [], milestones: [] });
        });

        it('handles corrupted localStorage data gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            localStorage.setItem('gem_coach_memory', 'invalid JSON{');

            const history = coachMemory.loadHistory();

            expect(history).toEqual({ sessions: [], milestones: [] });
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to load coach memory',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe('saveHistory', () => {
        it('saves history to localStorage', () => {
            coachMemory.history = {
                sessions: [{ timestamp: 123456, duration: 10 }],
                milestones: ['test_milestone'],
            };

            coachMemory.saveHistory();

            const saved = JSON.parse(localStorage.getItem('gem_coach_memory'));
            expect(saved.sessions).toHaveLength(1);
            expect(saved.milestones).toContain('test_milestone');
        });

        it('handles localStorage errors gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            coachMemory.saveHistory();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to save coach memory',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
            setItemSpy.mockRestore();
        });
    });

    describe('saveSession', () => {
        it('adds session with timestamp', () => {
            const session = {
                duration: 10,
                exercises: ['warmup'],
                avgPitch: 220,
                stability: 85,
            };

            const beforeTime = Date.now();
            coachMemory.saveSession(session);
            const afterTime = Date.now();

            const savedSession = coachMemory.history.sessions[0];
            expect(savedSession.duration).toBe(10);
            expect(savedSession.exercises).toEqual(['warmup']);
            expect(savedSession.timestamp).toBeGreaterThanOrEqual(beforeTime);
            expect(savedSession.timestamp).toBeLessThanOrEqual(afterTime);
        });

        it('persists session to localStorage', () => {
            const session = { duration: 15, exercises: ['siren'], avgPitch: 225, stability: 90 };

            coachMemory.saveSession(session);

            const saved = JSON.parse(localStorage.getItem('gem_coach_memory'));
            expect(saved.sessions).toHaveLength(1);
            expect(saved.sessions[0].duration).toBe(15);
        });

        it('returns array of new milestones', () => {
            const session = { duration: 10, exercises: ['warmup'], avgPitch: 220, stability: 85 };

            const milestones = coachMemory.saveSession(session);

            expect(Array.isArray(milestones)).toBe(true);
            expect(milestones).toContain('First Session Complete!');
        });

        it('accumulates multiple sessions', () => {
            coachMemory.saveSession({ duration: 10 });
            coachMemory.saveSession({ duration: 15 });
            coachMemory.saveSession({ duration: 20 });

            expect(coachMemory.history.sessions).toHaveLength(3);
        });
    });

    describe('checkMilestones', () => {
        it('detects first session milestone', () => {
            coachMemory.history.sessions = [{ timestamp: Date.now() }];

            const milestones = coachMemory.checkMilestones();

            expect(milestones).toContain('First Session Complete!');
        });

        it('detects 5 sessions milestone', () => {
            coachMemory.history.sessions = Array.from({ length: 5 }, () => ({
                timestamp: Date.now(),
            }));

            const milestones = coachMemory.checkMilestones();

            expect(milestones).toContain('5 Sessions Strong!');
        });

        it('detects 10 sessions milestone', () => {
            coachMemory.history.sessions = Array.from({ length: 10 }, () => ({
                timestamp: Date.now(),
            }));

            const milestones = coachMemory.checkMilestones();

            expect(milestones).toContain('Double Digits: 10 Sessions!');
        });

        it('detects 50 sessions milestone', () => {
            coachMemory.history.sessions = Array.from({ length: 50 }, () => ({
                timestamp: Date.now(),
            }));

            const milestones = coachMemory.checkMilestones();

            expect(milestones).toContain('Half Century: 50 Sessions!');
        });

        it('detects 1 hour total practice milestone', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now(), duration: 30 },
                { timestamp: Date.now(), duration: 35 },
            ];

            const milestones = coachMemory.checkMilestones();

            expect(milestones).toContain('1 Hour of Practice Total!');
            expect(coachMemory.hasMilestone('1_hour')).toBe(true);
        });

        it('does not repeat 1 hour milestone', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now(), duration: 30 },
                { timestamp: Date.now(), duration: 35 },
            ];
            coachMemory.history.milestones = ['1_hour'];

            const milestones = coachMemory.checkMilestones();

            expect(milestones).not.toContain('1 Hour of Practice Total!');
        });

        it('returns empty array when no new milestones', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now(), duration: 5 },
                { timestamp: Date.now(), duration: 5 },
            ];

            const milestones = coachMemory.checkMilestones();

            expect(milestones).toEqual([]);
        });

        it('can detect multiple milestones at once', () => {
            coachMemory.history.sessions = Array.from({ length: 5 }, (_, i) => ({
                timestamp: Date.now(),
                duration: 15, // 5 sessions * 15 min = 75 min (triggers 1 hour milestone)
            }));

            const milestones = coachMemory.checkMilestones();

            expect(milestones).toContain('5 Sessions Strong!');
            expect(milestones).toContain('1 Hour of Practice Total!');
        });
    });

    describe('hasMilestone', () => {
        it('returns true when milestone exists', () => {
            coachMemory.history.milestones = ['1_hour', 'test_milestone'];

            expect(coachMemory.hasMilestone('1_hour')).toBe(true);
        });

        it('returns false when milestone does not exist', () => {
            coachMemory.history.milestones = ['1_hour'];

            expect(coachMemory.hasMilestone('nonexistent')).toBe(false);
        });

        it('returns false for empty milestones array', () => {
            coachMemory.history.milestones = [];

            expect(coachMemory.hasMilestone('any')).toBe(false);
        });
    });

    describe('addMilestone', () => {
        it('adds milestone to history', () => {
            coachMemory.addMilestone('custom_milestone');

            expect(coachMemory.history.milestones).toContain('custom_milestone');
        });

        it('persists milestone to localStorage', () => {
            coachMemory.addMilestone('custom_milestone');

            const saved = JSON.parse(localStorage.getItem('gem_coach_memory'));
            expect(saved.milestones).toContain('custom_milestone');
        });

        it('allows adding multiple milestones', () => {
            coachMemory.addMilestone('milestone1');
            coachMemory.addMilestone('milestone2');

            expect(coachMemory.history.milestones).toHaveLength(2);
            expect(coachMemory.history.milestones).toContain('milestone1');
            expect(coachMemory.history.milestones).toContain('milestone2');
        });
    });

    describe('getSuggestion', () => {
        it('suggests warmup for new users with no sessions', () => {
            coachMemory.history.sessions = [];

            const suggestion = coachMemory.getSuggestion();

            expect(suggestion.focus).toBe('warmup');
            expect(suggestion.reason).toContain('basics');
        });

        it('suggests stability when last session had low stability', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now(), stability: 30, exercises: [] },
            ];

            const suggestion = coachMemory.getSuggestion();

            expect(suggestion.focus).toBe('stability');
            expect(suggestion.reason).toContain('stability');
            expect(suggestion.reason).toContain('low');
        });

        it('does not suggest stability when last session had good stability', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now(), stability: 80, exercises: ['warmup'] },
            ];

            const suggestion = coachMemory.getSuggestion();

            expect(suggestion.focus).not.toBe('stability');
        });

        it('suggests resonance when not practiced recently', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now(), stability: 80, exercises: ['warmup'] },
                { timestamp: Date.now(), stability: 85, exercises: ['pitch'] },
                { timestamp: Date.now(), stability: 90, exercises: ['siren'] },
            ];

            const suggestion = coachMemory.getSuggestion();

            expect(suggestion.focus).toBe('resonance');
            expect(suggestion.reason).toContain('resonance');
        });

        it('gives general suggestion when everything is balanced', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now(), stability: 80, exercises: ['warmup', 'resonance'] },
                { timestamp: Date.now(), stability: 85, exercises: ['pitch', 'resonance'] },
                { timestamp: Date.now(), stability: 90, exercises: ['siren', 'resonance'] },
            ];

            const suggestion = coachMemory.getSuggestion();

            expect(suggestion.focus).toBe('any');
            expect(suggestion.reason).toContain('mix it up');
        });

        it('prioritizes stability over variety', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now(), stability: 30, exercises: ['pitch'] }, // Low stability
                // No resonance exercises
            ];

            const suggestion = coachMemory.getSuggestion();

            // Should suggest stability first, not resonance
            expect(suggestion.focus).toBe('stability');
        });
    });

    describe('getLastSessionSummary', () => {
        it('returns null when no sessions exist', () => {
            coachMemory.history.sessions = [];

            const summary = coachMemory.getLastSessionSummary();

            expect(summary).toBeNull();
        });

        it('returns summary with "earlier today" for recent session', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now() - 1000 * 60 * 60, duration: 15 }, // 1 hour ago
            ];

            const summary = coachMemory.getLastSessionSummary();

            expect(summary).toContain('earlier today');
            expect(summary).toContain('15 minutes');
        });

        it('returns summary with "yesterday" for session 1 day ago', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now() - 1000 * 60 * 60 * 24, duration: 20 }, // 1 day ago
            ];

            const summary = coachMemory.getLastSessionSummary();

            expect(summary).toContain('yesterday');
            expect(summary).toContain('20 minutes');
        });

        it('returns summary with days count for session > 1 day ago', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, duration: 10 }, // 3 days ago
            ];

            const summary = coachMemory.getLastSessionSummary();

            expect(summary).toContain('3 days ago');
            expect(summary).toContain('10 minutes');
        });

        it('uses the most recent session when multiple exist', () => {
            coachMemory.history.sessions = [
                { timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, duration: 10 },
                { timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, duration: 25 }, // Most recent
            ];

            const summary = coachMemory.getLastSessionSummary();

            expect(summary).toContain('2 days ago');
            expect(summary).toContain('25 minutes');
        });

        it('includes "Welcome back" greeting', () => {
            coachMemory.history.sessions = [{ timestamp: Date.now(), duration: 15 }];

            const summary = coachMemory.getLastSessionSummary();

            expect(summary).toContain('Welcome back');
        });
    });

    describe('integration', () => {
        it('full workflow: save sessions, check milestones, get suggestion', () => {
            // Save first session
            let milestones = coachMemory.saveSession({
                duration: 10,
                exercises: ['warmup'],
                avgPitch: 220,
                stability: 85,
            });

            expect(milestones).toContain('First Session Complete!');

            // Save more sessions
            coachMemory.saveSession({ duration: 15, exercises: ['siren'], stability: 90 });
            coachMemory.saveSession({ duration: 20, exercises: ['pitch'], stability: 88 });
            coachMemory.saveSession({ duration: 12, exercises: ['warmup'], stability: 92 });
            milestones = coachMemory.saveSession({
                duration: 10,
                exercises: ['siren'],
                stability: 87,
            });

            // Check 5 session milestone
            expect(milestones).toContain('5 Sessions Strong!');

            // Get suggestion (should suggest resonance since not practiced)
            const suggestion = coachMemory.getSuggestion();
            expect(suggestion.focus).toBe('resonance');

            // Verify persistence
            const saved = JSON.parse(localStorage.getItem('gem_coach_memory'));
            expect(saved.sessions).toHaveLength(5);
            expect(saved.milestones).toContain('1_hour'); // Total: 67 minutes
        });

        it('preserves data across instance reloads', () => {
            // Save data
            coachMemory.saveSession({ duration: 10, exercises: ['warmup'], stability: 85 });
            coachMemory.addMilestone('test_persistence');

            // Simulate reload by loading from localStorage
            const reloaded = coachMemory.loadHistory();

            expect(reloaded.sessions).toHaveLength(1);
            expect(reloaded.milestones).toContain('test_persistence');
        });
    });
});
