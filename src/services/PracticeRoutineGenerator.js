import { EXERCISE_LIBRARY } from '../data/ExerciseLibrary';

export class PracticeRoutineGenerator {
    static generateRoutine(profile, durationMinutes = 10) {
        const { skillLevel = 'beginner', goals = [] } = profile;

        // 1. Filter by Skill Level
        // Beginners get only beginner exercises.
        // Intermediates get beginner + intermediate.
        // Advanced get all.
        let allowedDifficulty = ['beginner'];
        if (skillLevel === 'intermediate') allowedDifficulty.push('intermediate');
        if (skillLevel === 'advanced') allowedDifficulty.push('intermediate', 'advanced');

        let candidates = EXERCISE_LIBRARY.filter(ex => allowedDifficulty.includes(ex.difficulty));

        // 2. Score Candidates based on Goals
        // If a user has a goal (e.g., 'resonance'), exercises with that goal get a boost.
        const scoredCandidates = candidates.map(ex => {
            let score = 0;
            // Base score for variety
            score += Math.random() * 2;

            // Goal boost
            if (goals.length > 0) {
                const matches = ex.goals.filter(g => goals.includes(g)).length;
                score += matches * 5;
            }

            // Category balance logic could go here (ensure we don't just do one type)

            return { ...ex, score };
        });

        // 3. Sort by Score
        scoredCandidates.sort((a, b) => b.score - a.score);

        // 4. Build Routine
        // Always start with a warmup if possible
        const routine = [];
        let currentDuration = 0;
        const targetSeconds = durationMinutes * 60;

        // Find a warmup
        const warmup = scoredCandidates.find(ex => ex.category === 'warmup');
        if (warmup) {
            routine.push(warmup);
            currentDuration += warmup.duration;
            // Remove from pool to avoid duplicates
            const index = scoredCandidates.indexOf(warmup);
            if (index > -1) scoredCandidates.splice(index, 1);
        }

        // Fill the rest
        for (const ex of scoredCandidates) {
            if (currentDuration + ex.duration <= targetSeconds) {
                routine.push(ex);
                currentDuration += ex.duration;
            }
            if (currentDuration >= targetSeconds) break;
        }

        return routine;
    }
}
