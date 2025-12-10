import { describe, it, expect, beforeEach, vi } from 'vitest';
import { programService } from './ProgramService';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value; }),
        removeItem: vi.fn(key => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; })
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('ProgramService', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('should return at least 2 programs', () => {
        const programs = programService.getPrograms();
        expect(programs.length).toBeGreaterThanOrEqual(2);
    });

    it('should include the Feminization Course', () => {
        const programs = programService.getPrograms();
        const fem = programs.find(p => p.id === 'fem-4-week');
        expect(fem).toBeDefined();
        expect(fem.title).toContain('Feminization');
    });

    it('should include the Singing Course', () => {
        const programs = programService.getPrograms();
        const singing = programs.find(p => p.id === 'singing-1');
        expect(singing).toBeDefined();
        expect(singing.title).toContain('Singing');
    });

    it('should allow enrolling in the Singing Course', () => {
        programService.enroll('singing-1');
        const active = programService.getActiveProgram();
        expect(active).toBeDefined();
        expect(active.id).toBe('singing-1');
    });
});
