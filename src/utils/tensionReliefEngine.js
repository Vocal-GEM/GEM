// Tension Relief Recommendation Engine
// Parses user input and recommends exercises for body tension areas

import { BODY_TENSION_MAP, TENSION_SYNONYMS } from '../data/bodyTensionMapping';
import { EXERCISE_LIBRARY } from '../data/ExerciseLibrary';

/**
 * Parse user input to extract body area mentions
 * @param {string} input - User's text or voice input
 * @returns {Array<string>} - Array of detected area keys
 */
export const parseBodyArea = (input) => {
    if (!input || typeof input !== 'string') return [];

    const normalizedInput = input.toLowerCase().trim();
    const detectedAreas = [];

    // Check each area's keywords
    Object.entries(BODY_TENSION_MAP).forEach(([key, areaData]) => {
        const matches = areaData.keywords.some(keyword =>
            normalizedInput.includes(keyword.toLowerCase())
        );

        if (matches) {
            detectedAreas.push(key);
        }
    });

    // If no direct match, check synonyms
    if (detectedAreas.length === 0) {
        Object.entries(TENSION_SYNONYMS).forEach(([synonym, mainArea]) => {
            if (normalizedInput.includes(synonym.toLowerCase())) {
                if (!detectedAreas.includes(mainArea)) {
                    detectedAreas.push(mainArea);
                }
            }
        });
    }

    // If still no match but input seems to be asking for help, suggest general
    if (detectedAreas.length === 0) {
        const helpKeywords = ['help', 'tense', 'tight', 'sore', 'pain', 'hurt', 'strain', 'stiff'];
        const seemsLikeRequest = helpKeywords.some(word => normalizedInput.includes(word));

        if (seemsLikeRequest) {
            detectedAreas.push('whole');
        }
    }

    return detectedAreas;
};

/**
 * Get exercise recommendations for a body area
 * @param {string} areaKey - Key from BODY_TENSION_MAP
 * @returns {Object} - Area info and exercise details
 */
export const getRecommendations = (areaKey) => {
    const areaData = BODY_TENSION_MAP[areaKey];

    if (!areaData) {
        return null;
    }

    // Get full exercise details from library
    const exercises = areaData.exercises
        .map(exerciseId => EXERCISE_LIBRARY.find(ex => ex.id === exerciseId))
        .filter(Boolean); // Remove any not found

    return {
        area: areaData.area,
        description: areaData.description,
        exercises: exercises,
        count: exercises.length
    };
};

/**
 * Get recommendations for multiple areas
 * @param {Array<string>} areaKeys - Array of area keys
 * @returns {Array<Object>} - Array of recommendation objects
 */
export const getMultipleRecommendations = (areaKeys) => {
    return areaKeys
        .map(key => getRecommendations(key))
        .filter(Boolean);
};

/**
 * Process user input and return comprehensive recommendations
 * @param {string} input - User's text or voice input
 * @returns {Object} - Recommendations with metadata
 */
export const processUserInput = (input) => {
    const detectedAreas = parseBodyArea(input);

    if (detectedAreas.length === 0) {
        return {
            success: false,
            message: "I couldn't identify a specific body area. Try mentioning areas like: jaw, throat, neck, shoulders, tongue, face, or chest.",
            suggestions: ['jaw', 'throat', 'neck', 'shoulders'],
            recommendations: []
        };
    }

    const recommendations = getMultipleRecommendations(detectedAreas);

    return {
        success: true,
        detectedAreas: detectedAreas.map(key => BODY_TENSION_MAP[key].area),
        message: detectedAreas.length === 1
            ? `Found exercises for ${BODY_TENSION_MAP[detectedAreas[0]].area}`
            : `Found exercises for ${detectedAreas.length} areas`,
        recommendations: recommendations
    };
};

/**
 * Get all available tension areas for UI hints
 * @returns {Array<Object>} - Array of area info
 */
export const getAllTensionAreas = () => {
    return Object.entries(BODY_TENSION_MAP).map(([key, data]) => ({
        key,
        name: data.area,
        keywords: data.keywords.slice(0, 3) // First 3 keywords for hints
    }));
};

/**
 * Rank exercises based on user context (difficulty level, history, etc.)
 * @param {Array<Object>} exercises - Exercise objects
 * @param {Object} userContext - User preferences and history
 * @returns {Array<Object>} - Sorted exercises
 */
export const rankExercises = (exercises, userContext = {}) => {
    const { preferredDifficulty = 'beginner' } = userContext;

    // Sort by difficulty match, then by whether it requires equipment (null visualization = no equipment)
    return exercises.sort((a, b) => {
        // Prefer matching difficulty
        const aDiffMatch = a.difficulty === preferredDifficulty ? 1 : 0;
        const bDiffMatch = b.difficulty === preferredDifficulty ? 1 : 0;

        if (aDiffMatch !== bDiffMatch) {
            return bDiffMatch - aDiffMatch;
        }

        // Prefer exercises that don't need equipment (null visualization)
        const aNoEquip = a.visualization === null ? 1 : 0;
        const bNoEquip = b.visualization === null ? 1 : 0;

        return bNoEquip - aNoEquip;
    });
};
