import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TourProvider, useTour } from './TourContext';
import { TOURS } from '../config/tours';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TourContext', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    const wrapper = ({ children }) => <TourProvider>{children}</TourProvider>;

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useTour(), { wrapper });
        expect(result.current.activeTour).toBeNull();
        expect(result.current.currentStep).toBe(0);
        expect(result.current.completedTours).toEqual([]);
    });

    it('should start a tour', () => {
        const { result } = renderHook(() => useTour(), { wrapper });

        act(() => {
            result.current.startTour('practice_mode');
        });

        expect(result.current.activeTour).toBe('practice_mode');
        expect(result.current.currentStep).toBe(0);
        expect(result.current.tourConfig).toEqual(TOURS['practice_mode']);
    });

    it('should not start a completed tour unless forced', () => {
        window.localStorage.setItem('gem_completed_tours', JSON.stringify(['practice_mode']));
        const { result } = renderHook(() => useTour(), { wrapper });

        // Initial state should reflect storage
        expect(result.current.completedTours).toEqual(['practice_mode']);

        act(() => {
            result.current.startTour('practice_mode');
        });

        expect(result.current.activeTour).toBeNull();

        act(() => {
            result.current.startTour('practice_mode', true); // Force start
        });

        expect(result.current.activeTour).toBe('practice_mode');
    });

    it('should navigate through steps', () => {
        const { result } = renderHook(() => useTour(), { wrapper });

        act(() => {
            result.current.startTour('practice_mode');
        });

        act(() => {
            result.current.nextStep();
        });

        expect(result.current.currentStep).toBe(1);

        act(() => {
            result.current.prevStep();
        });

        expect(result.current.currentStep).toBe(0);
    });

    it('should complete tour when finishing last step', () => {
        const { result } = renderHook(() => useTour(), { wrapper });
        const tourLength = TOURS['practice_mode'].length;

        act(() => {
            result.current.startTour('practice_mode');
        });

        // Fast forward to last step
        for (let i = 0; i < tourLength - 1; i++) {
            act(() => {
                result.current.nextStep();
            });
        }

        expect(result.current.currentStep).toBe(tourLength - 1);

        // Finish
        act(() => {
            result.current.nextStep();
        });

        expect(result.current.activeTour).toBeNull();
        expect(result.current.completedTours).toContain('practice_mode');
        expect(JSON.parse(window.localStorage.getItem('gem_completed_tours'))).toContain('practice_mode');
    });

    it('should skip tour', () => {
        const { result } = renderHook(() => useTour(), { wrapper });

        act(() => {
            result.current.startTour('practice_mode');
        });

        act(() => {
            result.current.skipTour();
        });

        expect(result.current.activeTour).toBeNull();
        expect(result.current.completedTours).toContain('practice_mode');
    });
});
