/**
 * SmartPracticeService - Generates personalized practice sessions based on user data
 */

import { getActivitySummary, getReports } from './SessionReportService';
import { getStreakData } from './StreakService';
import { TRAINING_CATEGORIES } from '../data/trainingData';

/**
 * Analyze user's practice history to find weak areas
 */
const analyzeWeakAreas = () => {
    const reports = getReports();
    const last30Days = reports.filter(r => {
        const date = new Date(r.timestamp);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return date >= cutoff;
    });

    // Count exercises by category
    const categoryCounts = {};
    TRAINING_CATEGORIES.forEach(cat => {
        categoryCounts[cat.id] = 0;
    });

    last30Days.forEach(report => {
        if (report.exercises) {
            report.exercises.forEach(ex => {
                // Try to match exercise to category
                TRAINING_CATEGORIES.forEach(cat => {
                    if (cat.exercises.some(e => e.id === ex.id || e.title === ex.title)) {
                        categoryCounts[cat.id]++;
                    }
                });
            });
        }
    });

    // Find least practiced categories
    const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => a[1] - b[1])
        .map(([id, count]) => ({ id, count }));

    return sortedCategories;
};

/**
 * Get recommended focus areas based on weak areas
 */
export const getRecommendedFocusAreas = () => {
    const weakAreas = analyzeWeakAreas();
    const streak = getStreakData();
    const activity = getActivitySummary();

    const recommendations = [];

    // If new user (< 3 sessions), recommend fundamentals
    if (activity.last30Days.sessions < 3) {
        recommendations.push({
            category: 'breathing',
            reason: 'Build your foundation with breathing exercises',
            priority: 'high'
        });
        recommendations.push({
            category: 'relaxation',
            reason: 'Start with relaxation techniques',
            priority: 'medium'
        });
    } else {
        // Recommend least practiced areas
        weakAreas.slice(0, 2).forEach(area => {
            const category = TRAINING_CATEGORIES.find(c => c.id === area.id);
            if (category) {
                recommendations.push({
                    category: category.id,
                    reason: `You haven't practiced ${category.title} much lately`,
                    priority: area.count === 0 ? 'high' : 'medium'
                });
            }
        });
    }

    // If streak is low, add quick wins
    if (streak.currentStreak < 3) {
        recommendations.push({
            category: 'sovte',
            reason: 'Quick SOVTE exercises to build your streak',
            priority: 'medium'
        });
    }

    return recommendations.slice(0, 3);
};

/**
 * Generate a smart practice session
 */
export const generateSmartSession = (durationMinutes = 15) => {
    const recommendations = getRecommendedFocusAreas();
    const session = {
        id: `smart_session_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        targetDuration: durationMinutes,
        steps: []
    };

    // Calculate time per section
    const sectionsCount = Math.min(recommendations.length + 1, 4); // warmup + focus areas
    const timePerSection = Math.floor(durationMinutes / sectionsCount);

    // Always start with a warmup
    session.steps.push({
        type: 'warmup',
        title: 'Warm Up',
        description: 'Start with gentle stretches and breathing',
        duration: Math.min(timePerSection, 3),
        exercises: getExercisesFromCategory('breathing', 2)
    });

    // Add focus area exercises
    recommendations.forEach((rec, index) => {
        const category = TRAINING_CATEGORIES.find(c => c.id === rec.category);
        if (category) {
            const exerciseCount = rec.priority === 'high' ? 3 : 2;
            session.steps.push({
                type: 'focus',
                title: category.title,
                description: rec.reason,
                duration: timePerSection,
                priority: rec.priority,
                exercises: getExercisesFromCategory(category.id, exerciseCount)
            });
        }
    });

    // Add cool down
    session.steps.push({
        type: 'cooldown',
        title: 'Cool Down',
        description: 'Finish with relaxation',
        duration: 2,
        exercises: getExercisesFromCategory('relaxation', 1)
    });

    return session;
};

/**
 * Get random exercises from a category
 */
const getExercisesFromCategory = (categoryId, count) => {
    const category = TRAINING_CATEGORIES.find(c => c.id === categoryId);
    if (!category || !category.exercises) return [];

    const shuffled = [...category.exercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(ex => ({
        id: ex.id,
        title: ex.title,
        content: ex.content,
        difficulty: ex.difficulty || 'intermediate'
    }));
};

/**
 * Get session recommendations for different time budgets
 */
export const getSessionOptions = () => {
    return [
        {
            id: 'quick',
            title: 'Quick Practice',
            duration: 5,
            description: 'Perfect for maintaining your streak'
        },
        {
            id: 'standard',
            title: 'Standard Session',
            duration: 15,
            description: 'Balanced practice covering multiple areas'
        },
        {
            id: 'deep',
            title: 'Deep Practice',
            duration: 30,
            description: 'Comprehensive training for maximum progress'
        }
    ];
};

export default {
    getRecommendedFocusAreas,
    generateSmartSession,
    getSessionOptions
};
