import { useState, useEffect } from 'react';

export const useOnboarding = (steps = []) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);

    // Lazy initialize to avoid setState in effect
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
        return !!localStorage.getItem('gem_onboarding_seen');
    });

    const startOnboarding = () => {
        setCurrentStepIndex(0);
        setIsActive(true);
    };

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            completeOnboarding();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const completeOnboarding = () => {
        setIsActive(false);
        setHasSeenOnboarding(true);
        localStorage.setItem('gem_onboarding_seen', 'true');
    };

    const skipOnboarding = () => {
        completeOnboarding();
    };

    return {
        isActive,
        currentStepIndex,
        currentStep: steps[currentStepIndex],
        isFirstStep: currentStepIndex === 0,
        isLastStep: currentStepIndex === steps.length - 1,
        startOnboarding,
        nextStep,
        prevStep,
        skipOnboarding,
        hasSeenOnboarding
    };
};
