/**
 * RecommendationService - Suggests exercises based on user's practice patterns
 */

import { getReports } from './SessionReportService';
import { getStreakData } from './StreakService';
import { TRAINING_CATEGORIES } from '../data/trainingData';

/**
 * Get recommended exercises based on recent activity
 */
export const getRecommendations = () => {
    const reports = getReports();
    const streakData = getStreakData();
    const recommendations = [];

    // 1. New user or no recent practice - suggest fundamentals
    if (reports.length === 0) {
        recommendations.push({
            priority: 1,
            reason: 'Start your journey with breath support',
            category: 'breathing',
            exercise: getRandomExercise('breathing')
        });
        recommendations.push({
            priority: 2,
            reason: 'Warm up with relaxation',
            category: 'relaxation',
            exercise: getRandomExercise('relaxation')
        });
    }

    // 2. If streak is at risk, suggest quick exercise
    if (streakData.currentStreak > 0 && !reports.some(r => isToday(r.timestamp))) {
        recommendations.unshift({
            priority: 0,
            reason: '🔥 Keep your streak! Quick practice:',
            category: 'sovte',
            exercise: getRandomExercise('sovte')
        });
    }

    // 3. Based on recent focus areas, suggest variety
    const recentCategories = getRecentCategoryFocus(reports);
    const underutilized = getUnderutilizedCategories(recentCategories);

    if (underutilized.length > 0) {
        const category = underutilized[0];
        recommendations.push({
            priority: 3,
            reason: `Try something new in ${getCategoryTitle(category)}`,
            category,
            exercise: getRandomExercise(category)
        });
    }

    // 4. Always have a monologue option for Performance
    if (!recommendations.some(r => r.category === 'performance')) {
        recommendations.push({
            priority: 4,
            reason: 'Practice prosody with a monologue',
            category: 'performance',
            exercise: getRandomExercise('performance')
        });
    }

    // Sort by priority and return top 3
    return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 3);
};

/**
 * Helper: Get random exercise from a category
 */
const getRandomExercise = (categoryId) => {
    const category = TRAINING_CATEGORIES.find(c => c.id === categoryId);
    if (!category || category.exercises.length === 0) return null;
    return category.exercises[Math.floor(Math.random() * category.exercises.length)];
};

/**
 * Helper: Check if timestamp is today
 */
const isToday = (isoString) => {
    const date = new Date(isoString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

/**
 * Helper: Analyze recent category focus
 */
const getRecentCategoryFocus = (reports) => {
    // This is simplified - in reality we'd track which exercises were done
    // For now, return an empty array since we don't store category info in reports
    return [];
};

/**
 * Helper: Find underutilized categories
 */
const getUnderutilizedCategories = (recentCategories) => {
    const allCategories = TRAINING_CATEGORIES.map(c => c.id);
    return allCategories.filter(c => !recentCategories.includes(c));
};

/**
 * Helper: Get category title
 */
const getCategoryTitle = (categoryId) => {
    const category = TRAINING_CATEGORIES.find(c => c.id === categoryId);
    return category?.title || categoryId;
};

export default {
    getRecommendations
};
