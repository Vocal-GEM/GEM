import { useState, useEffect } from 'react';

export const useOnboarding = (steps = []) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem('gem_onboarding_seen');
        if (seen) {
            setHasSeenOnboarding(true);
        } else {
            // Start onboarding automatically if not seen
            // You might want to delay this or trigger it manually depending on UX preference
            // setIsActive(true); 
        }
    }, []);

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
