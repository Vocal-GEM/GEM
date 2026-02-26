/**
 * AdaptiveCurriculumService.js
 * 
 * Generates personalized multi-week training curricula based on skill assessment.
 * Uses skill levels and weaknesses to create targeted, progressive training plans.
 */

import SkillAssessmentService from './SkillAssessmentService';
import { TRAINING_CATEGORIES } from '../data/trainingData';
import { getStreakData } from './StreakService';

const STORAGE_KEY = 'gem_adaptive_curriculum';

// Map skill dimensions to training categories
const SKILL_TO_CATEGORY = {
    pitchControl: ['pitch', 'breathing'],
    resonance: ['resonance', 'tonal'],
    vocalWeight: ['sovte', 'relaxation'],
    consistency: ['breathing', 'performance'],
    range: ['pitch', 'sovte']
};

// Difficulty progression based on skill level
const LEVEL_TO_DIFFICULTY = {
    1: ['beginner'],
    2: ['beginner'],
    3: ['beginner', 'intermediate'],
    4: ['intermediate', 'advanced'],
    5: ['intermediate', 'advanced']
};

// Session lengths based on skill level (minutes)
const LEVEL_TO_DURATION = {
    1: 10,
    2: 12,
    3: 15,
    4: 18,
    5: 20
};

/**
 * Generate a personalized curriculum based on current skill assessment
 */
export const generateAdaptiveCurriculum = () => {
    const assessment = SkillAssessmentService.assessSkills();
    const streak = getStreakData();

    // Get overall level (1-5)
    const levelIndex = Math.max(1, Math.min(5, Math.round(assessment.overallScore)));

    // Create 4-week curriculum
    const curriculum = {
        id: `curriculum-${Date.now()}`,
        createdAt: new Date().toISOString(),
        level: assessment.level.name,
        overallScore: assessment.overallScore,
        weeks: [],
        currentWeek: 0,
        currentDay: 0
    };

    // Generate 4 weeks
    for (let week = 0; week < 4; week++) {
        const weekPlan = generateWeekPlan(week, assessment, levelIndex, streak);
        curriculum.weeks.push(weekPlan);
    }

    // Save curriculum
    saveCurriculum(curriculum);

    return curriculum;
};

/**
 * Generate a single week's training plan
 */
const generateWeekPlan = (weekIndex, assessment, levelIndex, streak) => {
    const weekPlan = {
        week: weekIndex + 1,
        theme: getWeekTheme(weekIndex, assessment),
        days: [],
        targetMinutes: LEVEL_TO_DURATION[levelIndex] * 6, // 6 practice days
        completedDays: 0
    };

    // Week 1: Focus on weakest skills
    // Week 2: Balance weak + strong
    // Week 3: Challenge with harder exercises
    // Week 4: Integration and consistency

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    daysOfWeek.forEach((dayName, dayIndex) => {
        if (dayIndex === 6) {
            // Sunday rest day
            weekPlan.days.push({
                day: dayName,
                isRestDay: true,
                focus: 'Rest & Recovery',
                exercises: [],
                targetMinutes: 0,
                completed: false
            });
            return;
        }

        const dayPlan = createDayPlan(dayName, dayIndex, weekIndex, assessment, levelIndex);
        weekPlan.days.push(dayPlan);
    });

    return weekPlan;
};

/**
 * Create a single day's training plan
 */
const createDayPlan = (dayName, dayIndex, weekIndex, assessment, levelIndex) => {
    let focus, categoryIds;

    // Determine focus based on day and week
    if (dayIndex < 2) {
        // Mon-Tue: Focus on weakest skills
        const weakness = assessment.weaknesses[dayIndex % assessment.weaknesses.length];
        focus = `${assessment.dimensions[weakness]?.name || 'Foundation'} Focus`;
        categoryIds = SKILL_TO_CATEGORY[weakness] || ['breathing'];
    } else if (dayIndex === 2) {
        // Wed: Resonance
        focus = 'Resonance Training';
        categoryIds = ['resonance', 'tonal'];
    } else if (dayIndex === 3) {
        // Thu: Pitch
        focus = 'Pitch Practice';
        categoryIds = ['pitch'];
    } else if (dayIndex === 4) {
        // Fri: Strength building
        const strength = assessment.strengths[0];
        focus = `${assessment.dimensions[strength]?.name || 'Performance'} Refinement`;
        categoryIds = SKILL_TO_CATEGORY[strength] || ['performance'];
    } else {
        // Sat: Fun/variety
        focus = 'Creative Practice';
        categoryIds = ['performance', 'sovte'];
    }

    // Select exercises based on difficulty level
    const exercises = selectExercisesForLevel(categoryIds, levelIndex, weekIndex);

    return {
        day: dayName,
        isRestDay: false,
        focus,
        exercises,
        targetMinutes: LEVEL_TO_DURATION[levelIndex],
        completed: false,
        notes: ''
    };
};

/**
 * Select appropriate exercises based on skill level
 */
const selectExercisesForLevel = (categoryIds, levelIndex, weekIndex) => {
    const allowedDifficulties = LEVEL_TO_DIFFICULTY[levelIndex];

    // In later weeks, allow slightly harder exercises
    if (weekIndex >= 2) {
        const idx = Math.min(levelIndex + 1, 5);
        allowedDifficulties.push(...(LEVEL_TO_DIFFICULTY[idx] || []));
    }

    const exercises = [];

    categoryIds.forEach(catId => {
        const category = TRAINING_CATEGORIES.find(c => c.id === catId);
        if (!category?.exercises) return;

        // Filter by difficulty
        const suitable = category.exercises.filter(ex =>
            !ex.difficulty || allowedDifficulties.includes(ex.difficulty)
        );

        if (suitable.length > 0) {
            // Pick 1-2 random exercises from this category
            const shuffled = [...suitable].sort(() => Math.random() - 0.5);
            const count = Math.min(2, shuffled.length);

            shuffled.slice(0, count).forEach(ex => {
                exercises.push({
                    id: ex.id,
                    title: ex.title,
                    category: catId,
                    difficulty: ex.difficulty || 'beginner',
                    duration: getDurationForExercise(ex, levelIndex),
                    completed: false
                });
            });
        }
    });

    // Limit to 4 exercises per day
    return exercises.slice(0, 4);
};

/**
 * Get duration for an exercise based on level
 */
const getDurationForExercise = (exercise, levelIndex) => {
    const base = 3; // 3 minutes minimum
    const levelBonus = Math.floor(levelIndex / 2); // +0/+1/+2 based on level
    return base + levelBonus;
};

/**
 * Get theme description for a week
 */
const getWeekTheme = (weekIndex, assessment) => {
    const themes = [
        {
            title: 'Foundation Building',
            description: `Focus on ${assessment.weaknesses[0] ? assessment.dimensions[assessment.weaknesses[0]]?.name : 'basics'}`
        },
        {
            title: 'Balance & Growth',
            description: 'Building on your strengths while addressing gaps'
        },
        {
            title: 'Challenge Week',
            description: 'Pushing your boundaries with more demanding exercises'
        },
        {
            title: 'Integration & Mastery',
            description: 'Combining all skills for natural, consistent voice use'
        }
    ];

    return themes[weekIndex] || themes[0];
};

/**
 * Get the current curriculum or generate a new one
 */
export const getCurrentCurriculum = () => {
    const stored = loadCurriculum();

    if (stored) {
        // Check if curriculum is still valid (less than 4 weeks old)
        const createdAt = new Date(stored.createdAt);
        const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

        if (ageInDays < 28) {
            return stored;
        }
    }

    // Generate new curriculum
    return generateAdaptiveCurriculum();
};

/**
 * Get today's recommended session
 */
export const getTodaySession = () => {
    const curriculum = getCurrentCurriculum();
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Map to our week structure (0 = Monday)
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const currentWeek = curriculum.weeks[curriculum.currentWeek];
    if (!currentWeek) return null;

    const todayPlan = currentWeek.days[dayIndex];

    return {
        ...todayPlan,
        weekNumber: curriculum.currentWeek + 1,
        weekTheme: currentWeek.theme,
        level: curriculum.level
    };
};

/**
 * Mark a day as completed
 */
export const markDayComplete = (weekIndex, dayIndex) => {
    const curriculum = loadCurriculum();
    if (!curriculum) return false;

    if (curriculum.weeks[weekIndex]?.days[dayIndex]) {
        curriculum.weeks[weekIndex].days[dayIndex].completed = true;
        curriculum.weeks[weekIndex].completedDays++;

        // Auto-advance week if all days complete
        if (curriculum.weeks[weekIndex].completedDays >= 6 &&
            weekIndex === curriculum.currentWeek &&
            weekIndex < 3) {
            curriculum.currentWeek++;
        }

        saveCurriculum(curriculum);
        return true;
    }

    return false;
};

/**
 * Mark an exercise as completed
 */
export const markExerciseComplete = (weekIndex, dayIndex, exerciseId) => {
    const curriculum = loadCurriculum();
    if (!curriculum) return false;

    const exercise = curriculum.weeks[weekIndex]?.days[dayIndex]?.exercises
        ?.find(ex => ex.id === exerciseId);

    if (exercise) {
        exercise.completed = true;
        saveCurriculum(curriculum);
        return true;
    }

    return false;
};

/**
 * Get curriculum progress
 */
export const getCurriculumProgress = () => {
    const curriculum = getCurrentCurriculum();

    let totalDays = 0;
    let completedDays = 0;
    let totalExercises = 0;
    let completedExercises = 0;

    curriculum.weeks.forEach(week => {
        week.days.forEach(day => {
            if (!day.isRestDay) {
                totalDays++;
                if (day.completed) completedDays++;

                day.exercises.forEach(ex => {
                    totalExercises++;
                    if (ex.completed) completedExercises++;
                });
            }
        });
    });

    return {
        weeksComplete: curriculum.currentWeek,
        totalWeeks: 4,
        daysComplete: completedDays,
        totalDays,
        exercisesComplete: completedExercises,
        totalExercises,
        percentComplete: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
        level: curriculum.level
    };
};

// Storage functions
const saveCurriculum = (curriculum) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(curriculum));
    } catch (e) {
        console.error('Failed to save curriculum:', e);
    }
};

const loadCurriculum = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const clearCurriculum = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export default {
    generateAdaptiveCurriculum,
    getCurrentCurriculum,
    getTodaySession,
    markDayComplete,
    markExerciseComplete,
    getCurriculumProgress,
    clearCurriculum
};
