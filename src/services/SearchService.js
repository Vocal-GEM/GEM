/**
 * SearchService - Global search across all app content
 * 
 * Aggregates and searches content from:
 * - Exercises (ExerciseLibrary.js)
 * - Glossary (glossaryData.js)
 * - Knowledge Base (knowledgeBase.js)
 * - Course Modules (courseData.js)
 * - Practice Cards (PracticeCardsData.js)
 * - Navigation views
 */

import { EXERCISE_LIBRARY } from '../data/ExerciseLibrary';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { FEMINIZATION_COURSE } from '../data/courseData';
import { DEFAULT_CARD_SETS } from '../data/PracticeCardsData';

// Navigation items for quick access
const NAVIGATION_ITEMS = [
    { id: 'nav-dashboard', title: 'Dashboard', subtitle: 'View your progress and stats', view: 'dashboard' },
    { id: 'nav-practice', title: 'Practice Mode', subtitle: 'Start voice training exercises', view: 'practice' },
    { id: 'nav-analysis', title: 'Analysis Hub', subtitle: 'Analyze your voice in detail', view: 'analysis' },
    { id: 'nav-history', title: 'History', subtitle: 'View past sessions and journals', view: 'history' },
    { id: 'nav-journal', title: 'Voice Journal', subtitle: 'Record and track voice clips over time', view: 'journal' },
    { id: 'nav-progress', title: 'Progress Dashboard', subtitle: 'View trends and analytics', view: 'progress' },
    { id: 'nav-community', title: 'Community', subtitle: 'Leaderboard and weekly challenges', view: 'community' },
    { id: 'nav-coach', title: 'Coach', subtitle: 'AI-guided voice coaching', view: 'coach' },
    { id: 'nav-settings', title: 'Settings', subtitle: 'Configure app preferences', view: 'settings' },
    { id: 'nav-glossary', title: 'Glossary', subtitle: 'Voice training terminology', view: 'glossary' },
    { id: 'nav-research', title: 'Research', subtitle: 'The science behind the app', view: 'research' },
    { id: 'nav-assessment', title: 'Clinical Assessment', subtitle: 'Comprehensive voice evaluation', view: 'assessment' },
];

/**
 * Normalize text for search matching
 */
const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase().trim();
};

/**
 * Calculate match score for ranking results
 * Higher score = better match
 */
const calculateScore = (query, text, isExactField = false) => {
    const normalizedQuery = normalizeText(query);
    const normalizedText = normalizeText(text);

    if (!normalizedText || !normalizedQuery) return 0;

    // Exact match in title/primary field
    if (normalizedText === normalizedQuery) return 100;

    // Starts with query
    if (normalizedText.startsWith(normalizedQuery)) return isExactField ? 90 : 80;

    // Contains query as whole word
    const wordBoundary = new RegExp(`\\b${normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (wordBoundary.test(normalizedText)) return isExactField ? 70 : 60;

    // Contains query anywhere
    if (normalizedText.includes(normalizedQuery)) return isExactField ? 50 : 40;

    return 0;
};

/**
 * Build searchable items from all data sources
 */
const buildSearchIndex = () => {
    const items = [];

    // Navigation items
    NAVIGATION_ITEMS.forEach(nav => {
        items.push({
            id: nav.id,
            type: 'navigation',
            title: nav.title,
            subtitle: nav.subtitle,
            icon: 'navigation',
            action: { type: 'navigate', view: nav.view }
        });
    });

    // Exercises
    EXERCISE_LIBRARY.forEach(exercise => {
        items.push({
            id: `exercise-${exercise.id}`,
            type: 'exercise',
            title: exercise.title,
            subtitle: `${exercise.category} • ${exercise.difficulty}`,
            description: exercise.instructions,
            icon: 'activity',
            action: { type: 'exercise', exerciseId: exercise.id, category: exercise.category }
        });
    });

    // Glossary terms
    GLOSSARY_TERMS.forEach((term, index) => {
        items.push({
            id: `glossary-${index}`,
            type: 'glossary',
            title: term.term,
            subtitle: term.definition.substring(0, 80) + (term.definition.length > 80 ? '...' : ''),
            description: term.definition,
            icon: 'book',
            action: { type: 'navigate', view: 'glossary', term: term.term }
        });
    });

    // Knowledge base
    KNOWLEDGE_BASE.forEach(item => {
        items.push({
            id: `kb-${item.id}`,
            type: 'knowledge',
            title: item.question,
            subtitle: item.category || 'Knowledge Base',
            description: item.answer,
            tags: item.tags || [],
            icon: 'help-circle',
            action: { type: 'knowledge', itemId: item.id }
        });
    });

    // Course modules and lessons
    FEMINIZATION_COURSE.forEach(module => {
        items.push({
            id: `course-${module.id}`,
            type: 'course',
            title: module.title,
            subtitle: module.description,
            icon: 'book-open',
            action: { type: 'navigate', view: 'coach', moduleId: module.id }
        });

        // Add individual lessons
        if (module.lessons) {
            module.lessons.forEach(lesson => {
                items.push({
                    id: `lesson-${lesson.id}`,
                    type: 'lesson',
                    title: lesson.title,
                    subtitle: `${module.title} • ${lesson.duration || ''}`,
                    icon: 'file-text',
                    action: { type: 'lesson', moduleId: module.id, lessonId: lesson.id }
                });
            });
        }
    });

    // Practice card sets
    DEFAULT_CARD_SETS.forEach(set => {
        items.push({
            id: `cardset-${set.id}`,
            type: 'practice-cards',
            title: set.name,
            subtitle: set.description,
            icon: 'layers',
            action: { type: 'practiceCards', setId: set.id }
        });
    });

    return items;
};

// Cache the search index
let searchIndex = null;

/**
 * Get all searchable items (builds index on first call)
 */
export const getSearchableItems = () => {
    if (!searchIndex) {
        searchIndex = buildSearchIndex();
    }
    return searchIndex;
};

/**
 * Refresh the search index (call if data changes)
 */
export const refreshSearchIndex = () => {
    searchIndex = buildSearchIndex();
    return searchIndex;
};

/**
 * Search across all content
 * 
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @param {string[]} options.types - Filter by content types (e.g., ['exercise', 'glossary'])
 * @param {number} options.limit - Max results to return (default: 20)
 * @returns {Array} Sorted search results with scores
 */
export const search = (query, options = {}) => {
    const { types = null, limit = 20 } = options;

    if (!query || query.trim().length === 0) {
        return [];
    }

    const items = getSearchableItems();
    const results = [];

    items.forEach(item => {
        // Filter by type if specified
        if (types && !types.includes(item.type)) {
            return;
        }

        // Calculate score based on multiple fields
        let score = 0;
        score = Math.max(score, calculateScore(query, item.title, true));
        score = Math.max(score, calculateScore(query, item.subtitle, false));

        if (item.description) {
            score = Math.max(score, calculateScore(query, item.description, false) * 0.8);
        }

        if (item.tags) {
            item.tags.forEach(tag => {
                score = Math.max(score, calculateScore(query, tag, false) * 0.9);
            });
        }

        if (score > 0) {
            results.push({ ...item, score });
        }
    });

    // Sort by score (highest first), then alphabetically
    results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.title.localeCompare(b.title);
    });

    return results.slice(0, limit);
};

/**
 * Get type label for display
 */
export const getTypeLabel = (type) => {
    const labels = {
        'navigation': 'Navigation',
        'exercise': 'Exercise',
        'glossary': 'Glossary',
        'knowledge': 'Knowledge Base',
        'course': 'Course',
        'lesson': 'Lesson',
        'practice-cards': 'Practice Cards'
    };
    return labels[type] || type;
};

/**
 * Group results by type for categorized display
 */
export const groupResultsByType = (results) => {
    const groups = {};

    results.forEach(result => {
        const type = result.type;
        if (!groups[type]) {
            groups[type] = {
                label: getTypeLabel(type),
                items: []
            };
        }
        groups[type].items.push(result);
    });

    // Return in a consistent order
    const order = ['navigation', 'exercise', 'glossary', 'knowledge', 'course', 'lesson', 'practice-cards'];
    return order
        .filter(type => groups[type])
        .map(type => groups[type]);
};

export default {
    search,
    getSearchableItems,
    refreshSearchIndex,
    getTypeLabel,
    groupResultsByType
};
