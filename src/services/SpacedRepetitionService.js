/**
 * SpacedRepetitionService.js
 * 
 * Implements spaced repetition for voice training exercises.
 * Tracks exercise performance and schedules reviews at optimal intervals.
 */

import { TRAINING_CATEGORIES } from '../data/trainingData';
import SkillAssessmentService from './SkillAssessmentService';

const STORAGE_KEY = 'gem_spaced_repetition';

// Spaced repetition intervals (in days)
const INTERVALS = [1, 2, 4, 7, 14, 30, 60];

/**
 * Initialize the spaced repetition database
 */
const initDatabase = () => {
    const stored = loadData();
    if (stored && stored.exercises) return stored;

    // Initialize with all exercises
    const exercises = {};

    TRAINING_CATEGORIES.forEach(cat => {
        if (!cat.exercises) return;
        cat.exercises.forEach(ex => {
            exercises[ex.id] = {
                id: ex.id,
                title: ex.title,
                category: cat.id,
                difficulty: ex.difficulty || 'beginner',
                // Spaced repetition data
                interval: 0,        // Current interval index (0 = new)
                easeFactor: 2.5,    // Ease factor (higher = easier)
                lastReview: null,   // Last review date
                nextReview: new Date().toISOString(), // Due immediately
                reviewCount: 0,     // Total times reviewed
                correctStreak: 0,   // Consecutive successful reviews
                quality: 0          // Last quality rating (1-5)
            };
        });
    });

    const data = {
        exercises,
        lastUpdated: new Date().toISOString(),
        stats: {
            totalReviews: 0,
            masteredCount: 0,
            dueToday: Object.keys(exercises).length
        }
    };

    saveData(data);
    return data;
};

/**
 * Get exercises due for review today
 */
export const getDueExercises = (limit = 10) => {
    const data = initDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get assessment to prioritize weak areas
    const assessment = SkillAssessmentService.getStoredAssessment();
    const weakCategories = new Set();

    if (assessment?.weaknesses) {
        assessment.weaknesses.forEach(weakness => {
            const mapping = {
                pitchControl: ['pitch', 'breathing'],
                resonance: ['resonance', 'tonal'],
                vocalWeight: ['sovte', 'relaxation'],
                consistency: ['breathing', 'performance'],
                range: ['pitch', 'sovte']
            };
            (mapping[weakness] || []).forEach(cat => weakCategories.add(cat));
        });
    }

    // Get due exercises
    const dueExercises = Object.values(data.exercises)
        .filter(ex => {
            if (!ex.nextReview) return true;
            const reviewDate = new Date(ex.nextReview);
            reviewDate.setHours(0, 0, 0, 0);
            return reviewDate <= today;
        })
        .map(ex => ({
            ...ex,
            // Prioritize weak categories and unreviewed items
            priority: (weakCategories.has(ex.category) ? 100 : 0) +
                (ex.reviewCount === 0 ? 50 : 0) +
                (5 - ex.interval)  // Lower intervals = higher priority
        }))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);

    return dueExercises;
};

/**
 * Record a review result for an exercise
 * @param {string} exerciseId - The exercise ID
 * @param {number} quality - Quality rating 1-5 (1=failed, 5=perfect)
 */
export const recordReview = (exerciseId, quality) => {
    const data = initDatabase();
    const exercise = data.exercises[exerciseId];
    if (!exercise) return null;

    // Update stats
    exercise.reviewCount++;
    exercise.lastReview = new Date().toISOString();
    exercise.quality = quality;
    data.stats.totalReviews++;

    // SM-2 algorithm (simplified)
    if (quality >= 3) {
        // Successful review
        exercise.correctStreak++;

        // Move to next interval
        if (exercise.interval < INTERVALS.length - 1) {
            exercise.interval++;
        }

        // Calculate ease factor adjustment
        exercise.easeFactor = Math.max(1.3,
            exercise.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );
    } else {
        // Failed review - reset to beginning
        exercise.correctStreak = 0;
        exercise.interval = 0;
        exercise.easeFactor = Math.max(1.3, exercise.easeFactor - 0.2);
    }

    // Calculate next review date
    const intervalDays = INTERVALS[exercise.interval] * exercise.easeFactor;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + Math.round(intervalDays));
    exercise.nextReview = nextDate.toISOString();

    // Update mastered count
    data.stats.masteredCount = Object.values(data.exercises)
        .filter(ex => ex.interval >= 5).length;

    // Update due today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    data.stats.dueToday = Object.values(data.exercises)
        .filter(ex => {
            if (!ex.nextReview) return true;
            const reviewDate = new Date(ex.nextReview);
            reviewDate.setHours(0, 0, 0, 0);
            return reviewDate <= today;
        }).length;

    data.lastUpdated = new Date().toISOString();
    saveData(data);

    return {
        newInterval: Math.round(intervalDays),
        nextReview: exercise.nextReview,
        mastered: exercise.interval >= 5
    };
};

/**
 * Get spaced repetition statistics
 */
export const getStats = () => {
    const data = initDatabase();

    // Calculate due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exercises = Object.values(data.exercises);
    const dueToday = exercises.filter(ex => {
        if (!ex.nextReview) return true;
        const reviewDate = new Date(ex.nextReview);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate <= today;
    }).length;

    const reviewed = exercises.filter(ex => ex.reviewCount > 0).length;
    const mastered = exercises.filter(ex => ex.interval >= 5).length;

    return {
        totalExercises: exercises.length,
        reviewed,
        mastered,
        dueToday,
        totalReviews: data.stats.totalReviews,
        masteryPercent: exercises.length > 0 ? Math.round((mastered / exercises.length) * 100) : 0,
        reviewedPercent: exercises.length > 0 ? Math.round((reviewed / exercises.length) * 100) : 0
    };
};

/**
 * Get exercise by ID with SR data
 */
export const getExercise = (exerciseId) => {
    const data = initDatabase();
    return data.exercises[exerciseId] || null;
};

/**
 * Reset all spaced repetition data
 */
export const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    return initDatabase();
};

// Storage helpers
const saveData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save SR data:', e);
    }
};

const loadData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export default {
    getDueExercises,
    recordReview,
    getStats,
    getExercise,
    resetAll
};
