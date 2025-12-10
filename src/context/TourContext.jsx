import React, { createContext, useContext, useState, useEffect } from 'react';
import { TOURS } from '../config/tours';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
    const [activeTour, setActiveTour] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedTours, setCompletedTours] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('gem_completed_tours');
        if (saved) {
            setCompletedTours(JSON.parse(saved));
        }
    }, []);

    const startTour = React.useCallback((tourId, force = false) => {
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

    const endTour = React.useCallback((completed = true) => {
        if (completed && activeTour) {
            const newCompleted = [...new Set([...completedTours, activeTour])];
            setCompletedTours(newCompleted);
            localStorage.setItem('gem_completed_tours', JSON.stringify(newCompleted));
        }
        setActiveTour(null);
        setCurrentStep(0);
    }, [activeTour, completedTours]);

    const nextStep = React.useCallback(() => {
        if (!activeTour) return;
        const tourConfig = TOURS[activeTour];
        if (currentStep < tourConfig.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            endTour(true);
        }
    }, [activeTour, currentStep, endTour]);

    const prevStep = React.useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const skipTour = React.useCallback(() => {
        endTour(true); // Mark as completed so it doesn't auto-show again
    }, [endTour]);

    const value = React.useMemo(() => ({
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
