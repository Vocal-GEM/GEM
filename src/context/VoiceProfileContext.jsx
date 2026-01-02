import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProfile } from './ProfileContext';
import VoiceProfileService from '../services/VoiceProfile';
import TargetRecommender from '../services/TargetRecommender';
import ProgressPredictor from '../services/ProgressPredictor';
import LearningStyleDetector from '../services/LearningStyleDetector';
import MoodAdaptiveService from '../services/MoodAdaptiveService';

const VoiceProfileContext = createContext();

export const useVoiceProfile = () => {
    const context = useContext(VoiceProfileContext);
    if (!context) {
        throw new Error('useVoiceProfile must be used within a VoiceProfileProvider');
    }
    return context;
};

export const VoiceProfileProvider = ({ children }) => {
    const { activeProfile, switchProfile: legacySwitchProfile } = useProfile();

    // Detailed Voice Profile State
    const [currentProfile, setCurrentProfile] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [learningStyle, setLearningStyle] = useState({ style: 'visual', confidence: 0 });
    const [adaptation, setAdaptation] = useState(null); // Mood-based adaptation
    const [loading, setLoading] = useState(true);

    // Initialize or Load Profile
    useEffect(() => {
        if (activeProfile) {
            loadDeepProfile(activeProfile);
        } else {
            setLoading(false);
        }
    }, [activeProfile]);

    const loadDeepProfile = async (profileId) => {
        setLoading(true);
        try {
            // In a real app, this would fetch from IndexedDB or backend
            // For now, we simulate loading or create a fresh structure if missing
            // const saved = await loadFromDB(profileId);
            const saved = null; // Force create for now

            if (saved) {
                setCurrentProfile(saved);
                setLearningStyle(saved.preferences?.learningStyle ?
                    { style: saved.preferences.learningStyle, confidence: 0.8 } :
                    { style: 'visual', confidence: 0 }
                );
            } else {
                // Create new default structure wrapping the legacy profile info
                const newProfile = VoiceProfileService.createVoiceProfile({
                    id: profileId,
                    name: 'My Voice Journey' // Default name
                });
                setCurrentProfile(newProfile);
            }
        } catch (err) {
            console.error("Failed to load voice profile:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    /**
     * Update baseline measurements based on calibration recording
     */
    const updateBaseline = useCallback((recordingAnalysis) => {
        if (!currentProfile) return;

        const updatedBaseline = VoiceProfileService.analyzeBaseline([recordingAnalysis]);

        setCurrentProfile(prev => {
            const updated = {
                ...prev,
                baseline: { ...prev.baseline, ...updatedBaseline }
            };

            // Auto-generate recommendations when baseline changes
            const newRecs = TargetRecommender.recommendTargets(updated);
            setRecommendations(newRecs);

            return updated;
        });
    }, [currentProfile]);

    /**
     * Update user goals and regenerate recommendations
     */
    const updateGoals = useCallback((newGoals) => {
        setCurrentProfile(prev => {
            const updated = {
                ...prev,
                goals: { ...prev.goals, ...newGoals }
            };

            // Regenerate recommendations
            const newRecs = TargetRecommender.recommendTargets(updated);
            setRecommendations(newRecs);

            return updated;
        });
    }, [currentProfile]);

    /**
     * Update health factors
     */
    const updateHealth = useCallback((healthUpdates) => {
        setCurrentProfile(prev => ({
            ...prev,
            health: { ...prev.health, ...healthUpdates }
        }));
    }, []);

    /**
     * Track a user interaction to refine learning style
     */
    const trackInteraction = useCallback((interactionType) => {
        if (!currentProfile) return;

        // Use the service to update logic
        // In reality we'd store the full learning style object
        // Here we just update local state for UI
        const currentStyleObj = {
            scores: {}, // simplified
            totalInteractions: 0
        };

        const result = LearningStyleDetector.trackInteraction(currentStyleObj, interactionType);

        // Only update state if confidence increases significantly or style changes
        if (result.dominantStyle !== learningStyle.style) {
            setLearningStyle({
                style: result.dominantStyle,
                confidence: result.confidence
            });

            // Persist to profile preferences
            setCurrentProfile(prev => ({
                ...prev,
                preferences: { ...prev.preferences, learningStyle: result.dominantStyle }
            }));
        }
    }, [currentProfile, learningStyle]);

    /**
     * Check in with mood to adapt UI
     */
    const checkInMood = useCallback((mood, energyLevel) => {
        const adaptationSettings = MoodAdaptiveService.getAdaptation(mood, energyLevel);
        setAdaptation(adaptationSettings);

        // Log this check-in?
    }, []);

    /**
     * Generate progress predictions based on history
     */
    const refreshPredictions = useCallback(() => {
        if (!currentProfile) return;

        const preds = ProgressPredictor.predictProgress(currentProfile);
        setPredictions(preds);
    }, [currentProfile]);

    const value = {
        profile: currentProfile,
        recommendations,
        predictions,
        learningStyle,
        adaptation,
        loading,
        updateBaseline,
        updateGoals,
        updateHealth,
        trackInteraction,
        checkInMood,
        refreshPredictions
    };

    return (
        <VoiceProfileContext.Provider value={value}>
            {children}
        </VoiceProfileContext.Provider>
    );
};
