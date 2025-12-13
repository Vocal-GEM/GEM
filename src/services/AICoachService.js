/**
 * AICoachService - Personalized AI coaching and curriculum generation
 */

import { getActivitySummary, getReports } from './SessionReportService';
import { getStreakData } from './StreakService';
import { generateVoiceFingerprint } from './AdvancedAnalyticsService';
import { TRAINING_CATEGORIES } from '../data/trainingData';

/**
 * Analyze user's practice patterns and weaknesses
 */
const analyzeUserProgress = () => {
    const reports = getReports();
    const streak = getStreakData();
    const fingerprint = generateVoiceFingerprint();

    // Count exercises by category
    const categoryStats = {};
    TRAINING_CATEGORIES.forEach(cat => {
        categoryStats[cat.id] = { completed: 0, category: cat };
    });

    reports.forEach(report => {
        if (report.exercises) {
            report.exercises.forEach(ex => {
                TRAINING_CATEGORIES.forEach(cat => {
                    if (cat.exercises.some(e => e.id === ex.id)) {
                        categoryStats[cat.id].completed++;
                    }
                });
            });
        }
    });

    // Find weak categories (least practiced)
    const weakCategories = Object.entries(categoryStats)
        .sort((a, b) => a[1].completed - b[1].completed)
        .slice(0, 3)
        .map(([id, data]) => ({ id, ...data }));

    // Find strong categories
    const strongCategories = Object.entries(categoryStats)
        .sort((a, b) => b[1].completed - a[1].completed)
        .slice(0, 2)
        .map(([id, data]) => ({ id, ...data }));

    return {
        totalSessions: reports.length,
        streak,
        fingerprint,
        weakCategories,
        strongCategories,
        categoryStats
    };
};

/**
 * Generate personalized weekly curriculum
 */
export const generateWeeklyCurriculum = () => {
    const progress = analyzeUserProgress();
    const curriculum = {
        weekOf: new Date().toISOString(),
        days: []
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    daysOfWeek.forEach((day, idx) => {
        const dayPlan = {
            day,
            focus: '',
            exercises: [],
            targetMinutes: 15
        };

        if (idx < 2) {
            // First two days: Focus on weak areas
            const weakCat = progress.weakCategories[idx % progress.weakCategories.length];
            if (weakCat?.category) {
                dayPlan.focus = `Focus: ${weakCat.category.title}`;
                dayPlan.exercises = selectExercises(weakCat.id, 3);
            }
        } else if (idx === 2 || idx === 4) {
            // Mid-week: Resonance focus
            dayPlan.focus = 'Resonance Training';
            dayPlan.exercises = selectExercises('resonance', 3);
        } else if (idx === 3) {
            // Thursday: Pitch work
            dayPlan.focus = 'Pitch Practice';
            dayPlan.exercises = selectExercises('pitch', 3);
        } else if (idx === 5) {
            // Saturday: Fun exercises
            dayPlan.focus = 'Creative Practice';
            dayPlan.exercises = [
                ...selectExercises('sovte', 2),
                ...selectExercises('performance', 1)
            ];
            dayPlan.targetMinutes = 20;
        } else {
            // Sunday: Rest day / Light practice
            dayPlan.focus = 'Rest Day - Light Practice';
            dayPlan.exercises = selectExercises('relaxation', 2);
            dayPlan.targetMinutes = 10;
        }

        curriculum.days.push(dayPlan);
    });

    return curriculum;
};

/**
 * Select random exercises from a category
 */
const selectExercises = (categoryId, count) => {
    const category = TRAINING_CATEGORIES.find(c => c.id === categoryId);
    if (!category || !category.exercises) {
        return [];
    }

    const shuffled = [...category.exercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(ex => ({
        id: ex.id,
        title: ex.title,
        duration: 5
    }));
};

/**
 * Generate real-time coaching feedback based on pitch/formants
 */
export const generateCoachingFeedback = (metrics) => {
    const feedback = [];
    const fingerprint = generateVoiceFingerprint();

    // Pitch feedback
    if (metrics.pitch) {
        if (metrics.pitch < 160) {
            feedback.push({
                type: 'pitch',
                severity: 'suggestion',
                message: 'Try raising your pitch slightly. Aim for the 180-220 Hz range.'
            });
        } else if (metrics.pitch > 280) {
            feedback.push({
                type: 'pitch',
                severity: 'suggestion',
                message: 'Your pitch is quite high. Find a comfortable sustainable range.'
            });
        } else if (metrics.pitch >= 180 && metrics.pitch <= 220) {
            feedback.push({
                type: 'pitch',
                severity: 'praise',
                message: 'Great pitch placement! You\'re in a feminine speech range.'
            });
        }
    }

    // Resonance feedback based on F2
    if (metrics.f2) {
        if (metrics.f2 < 1500) {
            feedback.push({
                type: 'resonance',
                severity: 'suggestion',
                message: 'Bring your resonance forward. Think "bright" and frontal.'
            });
        } else if (metrics.f2 > 1800) {
            feedback.push({
                type: 'resonance',
                severity: 'praise',
                message: 'Excellent forward resonance! Keep that brightness.'
            });
        }
    }

    // Stability feedback
    if (fingerprint && fingerprint.stability.f2 < 60) {
        feedback.push({
            type: 'stability',
            severity: 'tip',
            message: 'Focus on consistency. Try to maintain the same resonance throughout.'
        });
    }

    return feedback;
};

/**
 * Get today's personalized recommendation
 */
export const getTodayRecommendation = () => {
    const progress = analyzeUserProgress();
    const streak = progress.streak;

    // Different recommendations based on context
    if (streak.currentStreak === 0) {
        return {
            title: 'Start Fresh',
            message: 'Let\'s begin with gentle warm-ups to rebuild your practice habit.',
            category: 'breathing',
            urgency: 'normal'
        };
    }

    if (streak.currentStreak >= 7) {
        return {
            title: 'Challenge Yourself',
            message: 'Great streak! Try pushing your range with advanced exercises.',
            category: progress.weakCategories[0]?.id || 'pitch',
            urgency: 'normal'
        };
    }

    if (progress.weakCategories.length > 0) {
        const weak = progress.weakCategories[0];
        return {
            title: `Focus on ${weak.category?.title || 'Practice'}`,
            message: `You haven't practiced this area much. Let's work on it today.`,
            category: weak.id,
            urgency: 'suggested'
        };
    }

    return {
        title: 'Balanced Practice',
        message: 'You\'re doing great! Keep up the varied practice.',
        category: 'resonance',
        urgency: 'normal'
    };
};

export default {
    generateWeeklyCurriculum,
    generateCoachingFeedback,
    getTodayRecommendation,
    analyzeUserProgress
};
