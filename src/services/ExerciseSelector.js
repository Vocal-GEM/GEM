/**
 * ExerciseSelector.js
 * 
 * Intelligent exercise recommendation engine that selects appropriate exercises
 * based on user's skill level, weak areas, and current goals.
 */

// Exercise database with metadata
const EXERCISE_DB = [
    {
        id: 'siren_slides',
        name: 'Siren Slides',
        category: 'pitch',
        difficulty: 'beginner',
        targets: ['range', 'agility'],
        description: 'Smooth sliding from low to high pitch and back.',
        prerequisites: [],
        minDuration: 60
    },
    {
        id: 'lip_trills',
        name: 'Lip Trills',
        category: 'warmup',
        difficulty: 'beginner',
        targets: ['breath_support', 'relaxation'],
        description: 'Vibrating lips with steady airflow.',
        prerequisites: [],
        minDuration: 120
    },
    {
        id: 'resonance_hum',
        name: 'Resonance Humming',
        category: 'resonance',
        difficulty: 'beginner',
        targets: ['forward_resonance', 'sensation'],
        description: 'Humming "Mmm" feel vibrations in lips and nose.',
        prerequisites: [],
        minDuration: 60
    },
    {
        id: 'vocal_fry_slide',
        name: 'Vocal Fry Slides',
        category: 'weight',
        difficulty: 'intermediate',
        targets: ['cord_closure', 'relaxation'],
        description: 'Sliding up from vocal fry into modal voice.',
        prerequisites: ['siren_slides'],
        minDuration: 90
    },
    {
        id: 'pitch_matching',
        name: 'Pitch Matching',
        category: 'pitch',
        difficulty: 'intermediate',
        targets: ['accuracy', 'ear_training'],
        description: 'Listen to a tone and reproduce it exactly.',
        prerequisites: ['siren_slides'],
        minDuration: 180
    },
    {
        id: 'whisper_siren',
        name: 'Whisper Sirens',
        category: 'resonance',
        difficulty: 'intermediate',
        targets: ['tract_shaping', 'control'],
        description: 'Sirens without phonation to isolate resonance changes.',
        prerequisites: ['resonance_hum'],
        minDuration: 60
    },
    {
        id: 'messa_di_voce',
        name: 'Messa di Voce',
        category: 'control',
        difficulty: 'advanced',
        targets: ['dynamics', 'stability'],
        description: 'Crescendo and decrescendo on a single steady note.',
        prerequisites: ['pitch_matching', 'pain_free_range'],
        minDuration: 120
    },
    {
        id: 'reading_passage',
        name: 'Rainbow Passage',
        category: 'application',
        difficulty: 'intermediate',
        targets: ['integration', 'prosody'],
        description: 'Reading a standard text while maintaining target voice.',
        prerequisites: ['siren_slides', 'resonance_hum'],
        minDuration: 300
    },
    {
        id: 'conversation_sim',
        name: 'Conversation Simulator',
        category: 'application',
        difficulty: 'advanced',
        targets: ['spontaneity', 'endurance'],
        description: 'Simulated conversation with AI partner.',
        prerequisites: ['reading_passage'],
        minDuration: 300
    }
];

/**
 * Selects recommended exercises for the current session
 * @param {Object} profile - User's voice profile
 * @param {Object} sessionContext - Current session context (time available, mood, etc.)
 * @returns {Array} List of recommended exercise objects
 */
export const selectExercises = (profile, sessionContext = {}) => {
    const { skillAssessment, goals, preferences } = profile;
    const { timeAvailable = 15, mood = 'neutral' } = sessionContext;

    // 1. Identify weak areas
    const weakAreas = identifyWeakAreas(skillAssessment);

    // 2. Filter available exercises based on skill level
    const candidates = EXERCISE_DB.filter(ex =>
        isAppropriateLevel(ex.difficulty, skillAssessment.overallLevel) &&
        meetsPrerequisites(ex, profile)
    );

    // 3. Score candidates based on relevance to goals and weak areas
    const scoredCandidates = candidates.map(ex => ({
        ...ex,
        score: calculateScore(ex, profile, weakAreas, mood)
    }));

    // 4. Select top exercises balancing categories
    return constructRoutine(scoredCandidates, timeAvailable);
};

/**
 * Identify weak areas based on skill assessment
 */
const identifyWeakAreas = (assessment) => {
    const weaknesses = [];

    if (assessment.pitchControl < 0.6) weaknesses.push('pitch');
    if (assessment.resonanceControl < 0.6) weaknesses.push('resonance');
    if (assessment.consistency < 0.5) weaknesses.push('stability');
    if (assessment.endurance < 0.4) weaknesses.push('endurance');

    return weaknesses;
};

/**
 * Check if exercise difficulty matches user skill level
 */
const isAppropriateLevel = (exDifficulty, userLevel) => {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const exLevelVal = levels[exDifficulty];
    const userLevelVal = levels[userLevel];

    // Can do exercises at or below level, or one level above (challenge)
    return exLevelVal <= userLevelVal + 1;
};

/**
 * Check if user meets exercise prerequisites
 */
const meetsPrerequisites = (exercise, profile) => {
    if (!exercise.prerequisites || exercise.prerequisites.length === 0) return true;

    // In a real implementation, we'd check completion history
    // For now, assume simple skill level check acts as proxy
    if (exercise.difficulty === 'advanced' && profile.skillAssessment.overallLevel === 'beginner') {
        return false;
    }

    return true;
};

/**
 * Calculate relevance score for an exercise
 */
const calculateScore = (exercise, profile, weakAreas, mood) => {
    let score = 0;

    // Relevance to goal priority
    if (profile.goals.priority === 'balanced') score += 1;
    else if (exercise.category === profile.goals.priority) score += 3;

    // Relevance to weak areas
    const targetsWeakness = exercise.targets.some(t => {
        if (t === 'accuracy' && weakAreas.includes('pitch')) return true;
        if (t === 'forward_resonance' && weakAreas.includes('resonance')) return true;
        if (t === 'stability' && weakAreas.includes('stability')) return true;
        return false;
    });

    if (targetsWeakness) score += 2;

    // Preference adjustment
    if (profile.preferences.preferredExercises.includes(exercise.id)) score += 1;
    if (profile.preferences.avoidedExercises.includes(exercise.id)) score -= 2;

    // Mood adjustment
    if (mood === 'tired' || mood === 'low_energy') {
        if (exercise.difficulty === 'advanced') score -= 2;
        if (exercise.category === 'warmup') score += 1;
    } else if (mood === 'energetic') {
        if (exercise.difficulty === 'advanced') score += 1;
    }

    return score;
};

/**
 * Construct a balanced routine fitting the time constraint
 */
const constructRoutine = (scoredExercises, timeAvailableMinutes) => {
    // Sort by score descending
    const sorted = [...scoredExercises].sort((a, b) => b.score - a.score);

    const routine = [];
    let currentDuration = 0;
    const timeAvailableSeconds = timeAvailableMinutes * 60;

    // Always start with a warmup if not specifically excluded
    const warmup = sorted.find(ex => ex.category === 'warmup') ||
        EXERCISE_DB.find(ex => ex.id === 'lip_trills');

    if (warmup) {
        routine.push(warmup);
        currentDuration += warmup.minDuration;
    }

    // Add exercises until time full
    for (const ex of sorted) {
        if (routine.includes(ex)) continue; // Don't duplicate
        if (ex.category === 'warmup') continue; // Already added warmup

        // Ensure variety - check if category already heavily represented
        const categoryCount = routine.filter(r => r.category === ex.category).length;
        if (categoryCount >= 2) continue;

        if (currentDuration + ex.minDuration <= timeAvailableSeconds) {
            routine.push(ex);
            currentDuration += ex.minDuration;
        }
    }

    // If still lots of time, add a cooldown or application exercise
    const remaining = timeAvailableSeconds - currentDuration;
    if (remaining > 180) { // > 3 mins left
        const application = sorted.find(ex => ex.category === 'application' && !routine.includes(ex));
        if (application) {
            routine.push(application);
        }
    }

    return routine;
};

export default {
    selectExercises,
    EXERCISE_DB
};
