import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FEMINIZATION_JOURNEY } from '../data/guidedJourneyData';
import { recordPractice } from '../services/StreakService';
import { generateJourneyReport } from '../services/SessionReportService';

const GuidedJourneyContext = createContext(null);

const STORAGE_KEY = 'gem_journey_progress';

/**
 * Initial state for journey progress
 */
const getInitialState = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load journey progress:', e);
    }
    return {
        currentJourneyId: null,
        currentStepIndex: 0,
        completedSteps: [],
        stepProgress: {}, // { stepId: { completedAt, timeSpent, metrics } }
        baselineRecording: null,
        voiceBaseline: null, // { pitch: {...}, formants: {...}, spl: {...}, analyzedAt }
        progressRecording: null,
        startedAt: null,
        completedAt: null
    };
};

export const GuidedJourneyProvider = ({ children }) => {
    const [state, setState] = useState(getInitialState);
    const [isJourneyActive, setIsJourneyActive] = useState(false);

    // Persist state to localStorage
    useEffect(() => {
        if (state.currentJourneyId) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state]);

    // Get the current journey data
    const getJourneyData = useCallback((journeyId = 'fem-journey') => {
        // For now, only feminization is available
        if (journeyId === 'fem-journey') {
            return FEMINIZATION_JOURNEY;
        }
        return null;
    }, []);

    // Get current step
    const getCurrentStep = useCallback(() => {
        const journeyData = getJourneyData(state.currentJourneyId);
        if (!journeyData) return null;
        return journeyData.steps[state.currentStepIndex] || null;
    }, [state.currentJourneyId, state.currentStepIndex, getJourneyData]);

    // Start a new journey
    const startJourney = useCallback((journeyId = 'fem-journey') => {
        const journeyData = getJourneyData(journeyId);
        if (!journeyData) {
            console.error('Journey not found:', journeyId);
            return false;
        }

        setState({
            currentJourneyId: journeyId,
            currentStepIndex: 0,
            completedSteps: [],
            stepProgress: {},
            baselineRecording: null,
            voiceBaseline: null,
            progressRecording: null,
            startedAt: new Date().toISOString(),
            completedAt: null
        });
        setIsJourneyActive(true);
        return true;
    }, [getJourneyData]);

    // Resume an existing journey
    const resumeJourney = useCallback(() => {
        if (state.currentJourneyId && !state.completedAt) {
            setIsJourneyActive(true);
            return true;
        }
        return false;
    }, [state.currentJourneyId, state.completedAt]);

    // Advance to the next step
    const advanceStep = useCallback(() => {
        const journeyData = getJourneyData(state.currentJourneyId);
        if (!journeyData) return false;

        const currentStep = journeyData.steps[state.currentStepIndex];
        if (currentStep) {
            // Mark current step as completed
            const newCompletedSteps = state.completedSteps.includes(currentStep.id)
                ? state.completedSteps
                : [...state.completedSteps, currentStep.id];

            // Check if this is the last step
            if (state.currentStepIndex >= journeyData.steps.length - 1) {
                // Journey complete!
                setState(prev => ({
                    ...prev,
                    completedSteps: newCompletedSteps,
                    completedAt: new Date().toISOString()
                }));
                return 'complete';
            }

            // Advance to next step
            setState(prev => ({
                ...prev,
                currentStepIndex: prev.currentStepIndex + 1,
                completedSteps: newCompletedSteps
            }));
            return true;
        }
        return false;
    }, [state, getJourneyData]);

    // Go back to the previous step
    const goToPreviousStep = useCallback(() => {
        if (state.currentStepIndex > 0) {
            setState(prev => ({
                ...prev,
                currentStepIndex: prev.currentStepIndex - 1
            }));
            return true;
        }
        return false;
    }, [state.currentStepIndex]);

    // Go to a specific step (for revisiting completed steps)
    const goToStep = useCallback((stepId) => {
        const journeyData = getJourneyData(state.currentJourneyId);
        if (!journeyData) return false;

        const stepIndex = journeyData.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) return false;

        // Can only go to completed steps or the current/next step
        if (stepIndex <= state.currentStepIndex || state.completedSteps.includes(stepId)) {
            setState(prev => ({
                ...prev,
                currentStepIndex: stepIndex
            }));
            return true;
        }
        return false;
    }, [state, getJourneyData]);

    // Mark a step as completed with optional metrics
    const completeStep = useCallback((stepId, metrics = {}) => {
        // Record practice for streak tracking
        recordPractice();

        setState(prev => ({
            ...prev,
            completedSteps: prev.completedSteps.includes(stepId)
                ? prev.completedSteps
                : [...prev.completedSteps, stepId],
            stepProgress: {
                ...prev.stepProgress,
                [stepId]: {
                    completedAt: new Date().toISOString(),
                    ...metrics
                }
            }
        }));
    }, []);

    // Save baseline recording
    const saveBaselineRecording = useCallback((recordingData) => {
        setState(prev => ({
            ...prev,
            baselineRecording: {
                data: recordingData,
                recordedAt: new Date().toISOString()
            }
        }));
    }, []);

    // Save progress recording
    const saveProgressRecording = useCallback((recordingData) => {
        setState(prev => ({
            ...prev,
            progressRecording: {
                data: recordingData,
                recordedAt: new Date().toISOString()
            }
        }));
    }, []);

    // Save voice baseline metrics (pitch, formants, SPL)
    const saveVoiceBaseline = useCallback((metrics) => {
        setState(prev => ({
            ...prev,
            voiceBaseline: {
                ...metrics,
                savedAt: new Date().toISOString()
            }
        }));
    }, []);

    // Exit the journey (pauses, keeps progress, logs report)
    const exitJourney = useCallback(() => {
        // Generate session report if user practiced
        if (state.completedSteps.length > 0 && state.startedAt) {
            const startTime = new Date(state.startedAt);
            const now = new Date();
            const durationMinutes = Math.round((now - startTime) / 60000);

            generateJourneyReport({
                stepsCompleted: state.completedSteps.length,
                moduleName: 'Green Light Protocol',
                durationMinutes: Math.min(durationMinutes, 120), // Cap at 2 hours
                exercises: state.completedSteps.slice(-5) // Last 5 steps
            });
        }
        setIsJourneyActive(false);
    }, [state.completedSteps, state.startedAt]);

    // Reset the journey completely
    const resetJourney = useCallback(() => {
        setState({
            currentJourneyId: null,
            currentStepIndex: 0,
            completedSteps: [],
            stepProgress: {},
            baselineRecording: null,
            voiceBaseline: null,
            progressRecording: null,
            startedAt: null,
            completedAt: null
        });
        setIsJourneyActive(false);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Check if user has an in-progress journey
    const hasInProgressJourney = useCallback(() => {
        return state.currentJourneyId !== null && state.completedAt === null;
    }, [state.currentJourneyId, state.completedAt]);

    // Get journey completion percentage
    const getProgressPercentage = useCallback(() => {
        const journeyData = getJourneyData(state.currentJourneyId);
        if (!journeyData) return 0;
        return Math.round((state.completedSteps.length / journeyData.steps.length) * 100);
    }, [state, getJourneyData]);

    const value = {
        // State
        currentJourneyId: state.currentJourneyId,
        currentStepIndex: state.currentStepIndex,
        completedSteps: state.completedSteps,
        stepProgress: state.stepProgress,
        baselineRecording: state.baselineRecording,
        voiceBaseline: state.voiceBaseline,
        progressRecording: state.progressRecording,
        isJourneyActive,
        isJourneyComplete: state.completedAt !== null,
        startedAt: state.startedAt,
        completedAt: state.completedAt,

        // Computed
        getCurrentStep,
        getJourneyData,
        hasInProgressJourney,
        getProgressPercentage,

        // Actions
        startJourney,
        resumeJourney,
        advanceStep,
        goToPreviousStep,
        goToStep,
        completeStep,
        saveBaselineRecording,
        saveVoiceBaseline,
        saveProgressRecording,
        exitJourney,
        resetJourney
    };

    return (
        <GuidedJourneyContext.Provider value={value}>
            {children}
        </GuidedJourneyContext.Provider>
    );
};

export const useGuidedJourney = () => {
    const context = useContext(GuidedJourneyContext);
    if (!context) {
        throw new Error('useGuidedJourney must be used within a GuidedJourneyProvider');
    }
    return context;
};

export default GuidedJourneyContext;
