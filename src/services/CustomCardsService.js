/**
 * CustomCardsService - Create and manage user's personal practice cards
 */

const STORAGE_KEY = 'gem_custom_cards';

/**
 * Get all custom card collections
 */
export const getCollections = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('CustomCardsService: Failed to load', e);
    }
    return [];
};

/**
 * Save collections to storage
 */
const saveCollections = (collections) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch (e) {
        console.error('CustomCardsService: Failed to save', e);
    }
};

/**
 * Create a new collection
 */
export const createCollection = (name, description = '') => {
    const collections = getCollections();
    const newCollection = {
        id: `collection_${Date.now()}`,
        name,
        description,
        cards: [],
        createdAt: new Date().toISOString()
    };

    collections.push(newCollection);
    saveCollections(collections);
    return newCollection;
};

/**
 * Delete a collection
 */
export const deleteCollection = (collectionId) => {
    let collections = getCollections();
    collections = collections.filter(c => c.id !== collectionId);
    saveCollections(collections);
};

/**
 * Add a card to a collection
 */
export const addCard = (collectionId, { text, notes = '', difficulty = 'intermediate' }) => {
    const collections = getCollections();
    const collection = collections.find(c => c.id === collectionId);

    if (!collection) {
        throw new Error('Collection not found');
    }

    const newCard = {
        id: `card_${Date.now()}`,
        text,
        notes,
        difficulty,
        starred: false,
        createdAt: new Date().toISOString(),
        practicedCount: 0
    };

    collection.cards.push(newCard);
    saveCollections(collections);
    return newCard;
};

/**
 * Update a card
 */
export const updateCard = (collectionId, cardId, updates) => {
    const collections = getCollections();
    const collection = collections.find(c => c.id === collectionId);

    if (!collection) return null;

    const cardIndex = collection.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return null;

    collection.cards[cardIndex] = { ...collection.cards[cardIndex], ...updates };
    saveCollections(collections);
    return collection.cards[cardIndex];
};

/**
 * Delete a card
 */
export const deleteCard = (collectionId, cardId) => {
    const collections = getCollections();
    const collection = collections.find(c => c.id === collectionId);

    if (!collection) return;

    collection.cards = collection.cards.filter(c => c.id !== cardId);
    saveCollections(collections);
};

/**
 * Toggle star on a card
 */
export const toggleStar = (collectionId, cardId) => {
    const collections = getCollections();
    const collection = collections.find(c => c.id === collectionId);

    if (!collection) return;

    const card = collection.cards.find(c => c.id === cardId);
    if (card) {
        card.starred = !card.starred;
        saveCollections(collections);
        return card.starred;
    }
    return false;
};

/**
 * Get all starred cards across all collections
 */
export const getStarredCards = () => {
    const collections = getCollections();
    return collections.flatMap(c =>
        c.cards.filter(card => card.starred).map(card => ({
            ...card,
            collectionId: c.id,
            collectionName: c.name
        }))
    );
};

/**
 * Import cards from clipboard text (one sentence per line)
 */
export const importFromText = (collectionId, text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const cards = [];

    for (const line of lines) {
        const card = addCard(collectionId, { text: line.trim() });
        cards.push(card);
    }

    return cards;
};

/**
 * Record that a card was practiced
 */
export const recordPractice = (collectionId, cardId) => {
    const collections = getCollections();
    const collection = collections.find(c => c.id === collectionId);

    if (!collection) return;

    const card = collection.cards.find(c => c.id === cardId);
    if (card) {
        card.practicedCount = (card.practicedCount || 0) + 1;
        card.lastPracticedAt = new Date().toISOString();
        saveCollections(collections);
    }
};

export default {
    getCollections,
    createCollection,
    deleteCollection,
    addCard,
    updateCard,
    deleteCard,
    toggleStar,
    getStarredCards,
    importFromText,
    recordPractice
};
