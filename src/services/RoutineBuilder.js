
// Exercise Templates
const EXERCISES = [
    {
        id: 'siren',
        type: 'siren',
        name: 'Pitch Siren',
        minDuration: 30,
        intensity: 3,
        focus: ['range', 'warmup', 'flexibility'],
        instructions: [
            "Start low, slide up to your highest comfortable note, and then slide back down.",
            "Focus on a smooth transition between registers.",
            "Keep the sound light and easy."
        ]
    },
    {
        id: 'hold',
        type: 'hold',
        name: 'Pitch Hold',
        minDuration: 30,
        intensity: 2,
        focus: ['stability', 'control', 'warmup'],
        instructions: [
            "Pick a comfortable note and hold it steady.",
            "Focus on keeping the pitch consistent without wobbling.",
            "Breathe deeply and support the tone."
        ]
    },
    {
        id: 'resonance_bright',
        type: 'resonance',
        subtype: 'bright',
        name: 'Bright Resonance',
        minDuration: 45,
        intensity: 3,
        focus: ['resonance', 'brightness', 'tone'],
        instructions: [
            "Say 'Eeee' and try to make it very bright and small.",
            "Imagine the sound vibrating in your front teeth.",
            "Smile slightly to help brighten the tone."
        ]
    },
    {
        id: 'resonance_dark',
        type: 'resonance',
        subtype: 'dark',
        name: 'Dark Resonance',
        minDuration: 45,
        intensity: 3,
        focus: ['resonance', 'darkness', 'tone'],
        instructions: [
            "Say 'Oooo' and try to make it very dark and hollow.",
            "Create space in the back of your throat.",
            "Lower your larynx slightly if it feels comfortable."
        ]
    },
    {
        id: 'mimic',
        type: 'mimic',
        name: 'Mimic Me',
        minDuration: 60,
        intensity: 4,
        focus: ['intonation', 'listening', 'flexibility'],
        instructions: [
            "I'm going to set a pitch pattern. Listen closely, then copy me.",
            "Try to match my pitch exactly.",
            "Pay attention to the melody."
        ]
    },
    {
        id: 'reading',
        type: 'reading',
        name: 'Reading Practice',
        minDuration: 60,
        intensity: 2,
        focus: ['speech', 'articulation', 'naturalness'],
        instructions: [
            "Read the passage aloud. Try to vary your pitch and be expressive.",
            "Focus on clear articulation.",
            "Make it sound like a natural conversation."
        ]
    },
    {
        id: 'rest',
        type: 'rest',
        name: 'Rest Break',
        minDuration: 15,
        intensity: 0,
        focus: ['rest', 'recovery'],
        instructions: [
            "Take a deep breath and relax.",
            "Sip some water if you have it.",
            "Shake out any tension in your shoulders."
        ]
    }
];

/**
 * Generates a practice routine based on duration and focus.
 * @param {number} durationMinutes - Total duration in minutes.
 * @param {string} focus - Focus area (e.g., 'warmup', 'range', 'resonance', 'any').
 * @param {number} difficulty - Difficulty level (1-5) - currently unused but reserved for future.
 * @returns {Array} Array of exercise objects for the routine.
 */
export const generateRoutine = (durationMinutes = 5, focus = 'any', difficulty = 1) => {
    const totalSeconds = durationMinutes * 60;
    let currentSeconds = 0;
    const routine = [];

    // Filter exercises based on focus
    let availableExercises = EXERCISES.filter(ex => {
        if (ex.type === 'rest') return false; // Don't pick rest as a primary exercise
        if (focus === 'any') return true;
        return ex.focus.includes(focus) || ex.focus.includes('warmup'); // Always allow warmups
    });

    // Fallback if no specific exercises found
    if (availableExercises.length === 0) {
        availableExercises = EXERCISES.filter(ex => ex.type !== 'rest');
    }

    // Always start with a warmup exercise if the routine is long enough (> 2 mins)
    if (totalSeconds > 120 && focus !== 'warmup') {
        const warmup = EXERCISES.find(ex => ex.id === 'hold') || availableExercises[0];
        routine.push({
            ...warmup,
            duration: 60,
            instruction: warmup.instructions[0]
        });
        currentSeconds += 60;
    }

    // Build the routine
    while (currentSeconds < totalSeconds - 30) { // Leave buffer
        // Pick a random exercise
        const exercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];

        // Determine duration (between minDuration and 2 mins)
        const duration = Math.min(120, Math.max(exercise.minDuration, Math.floor((totalSeconds - currentSeconds) / 2)));

        // Add to routine
        routine.push({
            ...exercise,
            duration: duration,
            instruction: exercise.instructions[Math.floor(Math.random() * exercise.instructions.length)]
        });
        currentSeconds += duration;

        // Add a rest if the routine is long and we've done a few exercises
        if (totalSeconds > 300 && routine.length % 3 === 0 && currentSeconds < totalSeconds - 60) {
            const rest = EXERCISES.find(ex => ex.type === 'rest');
            routine.push({
                ...rest,
                duration: 30,
                instruction: rest.instructions[0]
            });
            currentSeconds += 30;
        }
    }

    return routine;
};

export const getRoutineSummary = (routine) => {
    const duration = Math.floor(routine.reduce((acc, ex) => acc + ex.duration, 0) / 60);
    const types = [...new Set(routine.map(ex => ex.name))].join(', ');
    return `${duration} minute routine featuring ${types}.`;
};
