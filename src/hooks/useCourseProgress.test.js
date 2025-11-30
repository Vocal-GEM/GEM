import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCourseProgress } from '../hooks/useCourseProgress';
import { useProfile } from '../context/ProfileContext';

// Mock dependencies
vi.mock('../context/ProfileContext', () => ({
    useProfile: vi.fn()
}));

vi.mock('../data/courseData', () => ({
    getCourseForProfile: vi.fn((profileId) => {
        if (profileId === 'masc') return [{ title: 'Masc Module', lessons: [{ id: 'l1' }] }];
        return [{ title: 'Fem Module', lessons: [{ id: 'l1' }, { id: 'l2' }] }];
    })
}));

describe('useCourseProgress', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should initialize with empty progress', () => {
        useProfile.mockReturnValue({ activeProfile: 'fem' });
        const { result } = renderHook(() => useCourseProgress());

        expect(result.current.completedLessons).toEqual([]);
        expect(result.current.getProgressPercentage()).toBe(0);
    });

    it('should mark lesson as complete', () => {
        useProfile.mockReturnValue({ activeProfile: 'fem' });
        const { result } = renderHook(() => useCourseProgress());

        act(() => {
            result.current.markLessonComplete('l1');
        });

        expect(result.current.completedLessons).toContain('l1');
        expect(result.current.getProgressPercentage()).toBe(50); // 1 out of 2 lessons
    });

    it('should get next lesson correctly', () => {
        useProfile.mockReturnValue({ activeProfile: 'fem' });
        const { result } = renderHook(() => useCourseProgress());

        expect(result.current.getNextLesson().id).toBe('l1');

        act(() => {
            result.current.markLessonComplete('l1');
        });

        expect(result.current.getNextLesson().id).toBe('l2');
    });

    it('should switch course based on profile', () => {
        useProfile.mockReturnValue({ activeProfile: 'masc' });
        const { result } = renderHook(() => useCourseProgress());

        expect(result.current.currentCourse[0].title).toBe('Masc Module');
    });
});
