// Exercise Search and Filter Engine
// Powers the Exercise Library browser with search and filtering

import { EXERCISE_LIBRARY } from '../data/ExerciseLibrary';

/**
 * Search exercises by query across all fields
 * @param {string} query - Search query
 * @returns {Array<Object>} - Matching exercises
 */
export const searchExercises = (query) => {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return EXERCISE_LIBRARY;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const matches = [];

    EXERCISE_LIBRARY.forEach(exercise => {
        let score = 0;
        let matchedFields = [];

        // Title match (highest priority)
        if (exercise.title.toLowerCase().includes(normalizedQuery)) {
            score += 100;
            matchedFields.push('title');
        }

        // Category match
        if (exercise.category.toLowerCase().includes(normalizedQuery)) {
            score += 60;
            matchedFields.push('category');
        }

        // Instructions match
        if (exercise.instructions.toLowerCase().includes(normalizedQuery)) {
            score += 40;
            matchedFields.push('instructions');
        }

        // Goals match
        if (exercise.goals && exercise.goals.some(goal => goal.toLowerCase().includes(normalizedQuery))) {
            score += 50;
            matchedFields.push('goals');
        }

        // Difficulty match
        if (exercise.difficulty.toLowerCase().includes(normalizedQuery)) {
            score += 30;
            matchedFields.push('difficulty');
        }

        if (score > 0) {
            matches.push({
                ...exercise,
                _searchScore: score,
                _matchedFields: matchedFields
            });
        }
    });

    // Sort by score
    return matches.sort((a, b) => b._searchScore - a._searchScore);
};

/**
 * Filter exercises by category
 * @param {Array<Object>} exercises - Exercises to filter
 * @param {string} category - Category to filter by
 * @returns {Array<Object>} - Filtered exercises
 */
export const filterByCategory = (exercises, category) => {
    if (!category || category === 'all') return exercises;
    return exercises.filter(ex => ex.category === category);
};

/**
 * Filter exercises by difficulty
 * @param {Array<Object>} exercises - Exercises to filter
 * @param {string} difficulty - Difficulty to filter by
 * @returns {Array<Object>} - Filtered exercises
 */
export const filterByDifficulty = (exercises, difficulty) => {
    if (!difficulty || difficulty === 'all') return exercises;
    return exercises.filter(ex => ex.difficulty === difficulty);
};

/**
 * Filter exercises by goals
 * @param {Array<Object>} exercises - Exercises to filter
 * @param {Array<string>} goals - Goals to filter by
 * @returns {Array<Object>} - Filtered exercises
 */
export const filterByGoals = (exercises, goals) => {
    if (!goals || goals.length === 0) return exercises;
    return exercises.filter(ex =>
        ex.goals && ex.goals.some(goal => goals.includes(goal))
    );
};

/**
 * Sort exercises
 * @param {Array<Object>} exercises - Exercises to sort
 * @param {string} sortBy - Sort method: 'name', 'duration', 'difficulty', 'category'
 * @returns {Array<Object>} - Sorted exercises
 */
export const sortExercises = (exercises, sortBy = 'name') => {
    const sorted = [...exercises];

    switch (sortBy) {
        case 'name':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));

        case 'duration':
            return sorted.sort((a, b) => a.duration - b.duration);

        case 'difficulty': {
            const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
            return sorted.sort((a, b) =>
                difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
            );
        }

        case 'category':
            return sorted.sort((a, b) => a.category.localeCompare(b.category));

        default:
            return sorted;
    }
};

/**
 * Apply all filters and search
 * @param {Object} options - Filter options
 * @returns {Array<Object>} - Filtered and sorted exercises
 */
export const applyFilters = (options = {}) => {
    const {
        query = '',
        category = 'all',
        difficulty = 'all',
        goals = [],
        sortBy = 'name'
    } = options;

    let results = query ? searchExercises(query) : EXERCISE_LIBRARY;
    results = filterByCategory(results, category);
    results = filterByDifficulty(results, difficulty);
    results = filterByGoals(results, goals);
    results = sortExercises(results, sortBy);

    return results;
};

/**
 * Get unique categories from exercise library
 * @returns {Array<string>} - Unique categories
 */
export const getCategories = () => {
    const categories = [...new Set(EXERCISE_LIBRARY.map(ex => ex.category))];
    return categories.sort();
};

/**
 * Get unique difficulties from exercise library
 * @returns {Array<string>} - Unique difficulties
 */
export const getDifficulties = () => {
    return ['beginner', 'intermediate', 'advanced'];
};

/**
 * Get exercise statistics
 * @returns {Object} - Statistics about exercises
 */
export const getExerciseStats = () => {
    const stats = {
        total: EXERCISE_LIBRARY.length,
        byCategory: {},
        byDifficulty: {},
        avgDuration: 0
    };

    EXERCISE_LIBRARY.forEach(ex => {
        // Count by category
        stats.byCategory[ex.category] = (stats.byCategory[ex.category] || 0) + 1;

        // Count by difficulty
        stats.byDifficulty[ex.difficulty] = (stats.byDifficulty[ex.difficulty] || 0) + 1;

        // Sum duration
        stats.avgDuration += ex.duration;
    });

    stats.avgDuration = Math.round(stats.avgDuration / EXERCISE_LIBRARY.length);

    return stats;
};
