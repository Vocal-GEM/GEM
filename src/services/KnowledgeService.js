import { KNOWLEDGE_BASE } from '../data/knowledgeBase.js';

export const KnowledgeService = {
    /**
     * Search the knowledge base for a query string.
     * @param {string} query - The user's question or keywords.
     * @returns {Array} - Array of matching knowledge entries.
     */
    search: (query) => {
        if (!query) return [];

        const lowerQuery = query.toLowerCase();
        const stopWords = ['how', 'what', 'can', 'the', 'and', 'for', 'are', 'you', 'does'];
        const terms = lowerQuery.split(' ')
            .filter(term => term.length > 2) // Ignore short words
            .filter(term => !stopWords.includes(term)); // Ignore stop words

        return KNOWLEDGE_BASE.filter(entry => {
            // 1. Check for exact tag matches (high priority)
            const tagMatch = entry.tags.some(tag => lowerQuery.includes(tag.toLowerCase()));

            // 2. Check if question contains terms
            const questionMatch = terms.some(term => entry.question.toLowerCase().includes(term));

            // 3. Check if answer contains terms (lower priority, but useful)
            const answerMatch = terms.some(term => entry.answer.toLowerCase().includes(term));

            return tagMatch || questionMatch || answerMatch;
        }).sort((a, b) => {
            // Simple relevance sorting
            const aScore = calculateScore(a, lowerQuery, terms);
            const bScore = calculateScore(b, lowerQuery, terms);
            return bScore - aScore;
        });
    },

    /**
     * Get all available categories.
     * @returns {Array} - List of unique categories.
     */
    getCategories: () => {
        const categories = new Set(KNOWLEDGE_BASE.map(item => item.category));
        return Array.from(categories);
    },

    /**
     * Get entries by category.
     * @param {string} category 
     * @returns {Array}
     */
    getByCategory: (category) => {
        return KNOWLEDGE_BASE.filter(item => item.category === category);
    }
};

// Helper to score relevance
function calculateScore(entry, query, terms) {
    let score = 0;

    // Exact tag match is strong
    if (entry.tags.some(tag => query.includes(tag.toLowerCase()))) score += 10;

    // Question match is good
    if (entry.question.toLowerCase().includes(query)) score += 5;

    // Term matches
    terms.forEach(term => {
        if (entry.question.toLowerCase().includes(term)) score += 2;
        if (entry.tags.some(tag => tag.toLowerCase().includes(term))) score += 2;
        if (entry.answer.toLowerCase().includes(term)) score += 1;
    });

    return score;
}
