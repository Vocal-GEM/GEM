import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TOURS } from '../config/tours';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
    const [activeTour, setActiveTour] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    // Initialize state lazily to avoid useEffect setState on mount
    const [completedTours, setCompletedTours] = useState(() => {
        try {
            const saved = localStorage.getItem('gem_completed_tours');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load tours:", e);
            return [];
        }
    });

    const startTour = useCallback((tourId, force = false) => {
        if (!TOURS[tourId]) {
            console.warn(`Tour ${tourId} not found`);
            return;
        }
        if (!force && completedTours.includes(tourId)) {
            return;
        }
        setActiveTour(tourId);
        setCurrentStep(0);
    }, [completedTours]);

    const endTour = useCallback((completed = true) => {
        if (completed && activeTour) {
            const newCompleted = [...new Set([...completedTours, activeTour])];
            setCompletedTours(newCompleted);
            localStorage.setItem('gem_completed_tours', JSON.stringify(newCompleted));
        }
        setActiveTour(null);
        setCurrentStep(0);
    }, [activeTour, completedTours]);

    const nextStep = useCallback(() => {
        if (!activeTour) return;
        const tourConfig = TOURS[activeTour];
        if (currentStep < tourConfig.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            endTour(true);
        }
    }, [activeTour, currentStep, endTour]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const skipTour = useCallback(() => {
        endTour(true); // Mark as completed so it doesn't auto-show again
    }, [endTour]);

    const value = useMemo(() => ({
        activeTour,
        currentStep,
        completedTours,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        tourConfig: activeTour ? TOURS[activeTour] : null
    }), [activeTour, currentStep, completedTours, startTour, endTour, nextStep, prevStep, skipTour]);

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
};
