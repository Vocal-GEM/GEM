/**
 * WarmUpGenerator.js
 * 
 * Generates personalized warm-up routines based on user goals, time availability,
 * and current vocal health.
 */

import { selectExercises } from './ExerciseSelector';

/**
 * Generates a warm-up routine
 * @param {Object} profile - User voice profile
 * @param {Object} options - Configuration options
 * @returns {Object} Generated routine
 */
export const generateWarmUp = (profile, options = {}) => {
    const {
        duration = 5, // minutes
        focus = 'general', // 'general', 'pitch', 'resonance', 'breath'
        energy = 'medium' // 'low', 'medium', 'high'
    } = options;

    const exercises = [];
    let currentDuration = 0;

    // 1. Mandatory Body/Breath Prep (1-2 mins)
    const prep = getPrepExercise(energy);
    exercises.push(prep);
    currentDuration += prep.duration;

    // 2. SOVTEs for safe engagement (Lip trills, humming)
    const sovte = getSovteExercise(profile);
    exercises.push(sovte);
    currentDuration += sovte.duration;

    // 3. Easy Glides/Sirens
    const sirens = {
        id: 'sirens_gentle',
        name: 'Gentle Sirens',
        type: 'pitch',
        duration: 90,
        instructions: 'Slide gently up and down a comfortable 5th interval.'
    };
    exercises.push(sirens);
    currentDuration += sirens.duration;

    // 4. Specific Focus Exercises (fill remaining time)
    const remainingSeconds = (duration * 60) - currentDuration;

    if (remainingSeconds > 60) {
        const focusEx = getFocusExercise(focus, profile, remainingSeconds);
        if (focusEx) exercises.push(focusEx);
    }

    return {
        id: `warmup_${Date.now()}`,
        name: `${focus.charAt(0).toUpperCase() + focus.slice(1)} Warm-Up`,
        totalDuration: duration,
        exercises,
        generatedAt: Date.now()
    };
};

const getPrepExercise = (energy) => {
    if (energy === 'low') {
        return {
            id: 'neck_stretch',
            name: 'Gentle Neck Stretches',
            type: 'physical',
            duration: 60,
            instructions: 'Slowly tilt head side to side. Do not force.'
        };
    }
    return {
        id: 'shoulder_rolls',
        name: 'Shoulder Rolls & Breath',
        type: 'physical',
        duration: 60,
        instructions: 'Roll shoulders back deep breathing interacting with diaphragm.'
    };
};

const getSovteExercise = (profile) => {
    // Check profile for preferred SOVTE
    const preferred = profile.preferences?.preferredExercises?.find(id =>
        ['lip_trills', 'straw_phonation', 'cup_bubbles'].includes(id)
    );

    if (preferred) {
        return {
            id: preferred,
            name: formatName(preferred),
            type: 'sovte',
            duration: 120,
            instructions: 'Maintain steady airflow. Feel the vibration.'
        };
    }

    // Default to Lip Trills
    return {
        id: 'lip_trills',
        name: 'Lip Trills',
        type: 'sovte',
        duration: 120,
        instructions: 'Brrr sound with loose lips. Support from breath.'
    };
};

const getFocusExercise = (focus, profile, maxDuration) => {
    if (focus === 'pitch') {
        return {
            id: 'octave_slides',
            name: 'Octave Slides',
            type: 'pitch',
            duration: Math.min(maxDuration, 180),
            instructions: 'Slide up an octave and back down. Keep it light.'
        };
    }
    if (focus === 'resonance') {
        return {
            id: 'ming_mong',
            name: 'Ming-Mong Chant',
            type: 'resonance',
            duration: Math.min(maxDuration, 180),
            instructions: 'Chant Ming-Mong on a single note. Feel nose vibration.'
        };
    }
    // Default General/Breath
    return {
        id: 'farinelli_breathing',
        name: 'Farinelli Breathing',
        type: 'breath',
        duration: Math.min(maxDuration, 180),
        instructions: 'Inhale 4, Hold 4, Exhale 4. Keep shoulders relaxed.'
    };
};

const formatName = (id) => {
    return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export default {
    generateWarmUp
};
