/**
 * Practice Cards Service
 * IndexedDB storage for custom card sets and practice activity tracking.
 * Follows patterns from historyService.js
 */

const DB_NAME = 'VocalGEM_PracticeCards';
const DB_VERSION = 1;
const CUSTOM_SETS_STORE = 'custom_card_sets';
const ACTIVITY_STORE = 'card_activity';

class PracticeCardsService {
    constructor() {
        this.db = null;
    }

    async open() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('[PracticeCardsService] IndexedDB error:', event.target.error);
                reject('Could not open practice cards database');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store for custom card sets
                if (!db.objectStoreNames.contains(CUSTOM_SETS_STORE)) {
                    const setStore = db.createObjectStore(CUSTOM_SETS_STORE, { keyPath: 'id' });
                    setStore.createIndex('name', 'name', { unique: false });
                    setStore.createIndex('difficulty', 'difficulty', { unique: false });
                    setStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Store for card activity/practice logs
                if (!db.objectStoreNames.contains(ACTIVITY_STORE)) {
                    const activityStore = db.createObjectStore(ACTIVITY_STORE, { keyPath: 'id', autoIncrement: true });
                    activityStore.createIndex('cardId', 'cardId', { unique: false });
                    activityStore.createIndex('recordingId', 'recordingId', { unique: false });
                    activityStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // ============================================
    // Custom Card Set Operations
    // ============================================

    /**
     * Save a new custom card set
     * @param {Object} cardSet - { name, description, difficulty, cards }
     * @returns {Promise<string>} The ID of the created set
     */
    async saveCustomCardSet(cardSet) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CUSTOM_SETS_STORE], 'readwrite');
            const store = transaction.objectStore(CUSTOM_SETS_STORE);

            const setData = {
                id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isDefault: false,
                ...cardSet,
                // Ensure cards have IDs
                cards: (cardSet.cards || []).map((card, index) => ({
                    id: card.id || `card-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
                    text: card.text,
                    focus: card.focus || 'general'
                }))
            };

            const request = store.add(setData);

            request.onsuccess = () => {
                console.log('[PracticeCardsService] Created custom set:', setData.id);
                resolve(setData.id);
            };

            request.onerror = (event) => {
                console.error('[PracticeCardsService] Error saving custom set:', event.target.error);
                reject('Could not save custom card set');
            };
        });
    }

    /**
     * Update an existing custom card set
     * @param {string} setId - The set ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<void>}
     */
    async updateCustomCardSet(setId, updates) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CUSTOM_SETS_STORE], 'readwrite');
            const store = transaction.objectStore(CUSTOM_SETS_STORE);

            const getRequest = store.get(setId);

            getRequest.onsuccess = () => {
                const existing = getRequest.result;
                if (!existing) {
                    reject('Card set not found');
                    return;
                }

                const updated = {
                    ...existing,
                    ...updates,
                    updatedAt: new Date().toISOString()
                };

                const putRequest = store.put(updated);

                putRequest.onsuccess = () => resolve();
                putRequest.onerror = (event) => {
                    console.error('[PracticeCardsService] Error updating set:', event.target.error);
                    reject('Could not update card set');
                };
            };

            getRequest.onerror = () => reject('Could not find card set');
        });
    }

    /**
     * Get all custom card sets
     * @returns {Promise<Array>}
     */
    async getCustomCardSets() {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CUSTOM_SETS_STORE], 'readonly');
            const store = transaction.objectStore(CUSTOM_SETS_STORE);
            const request = store.getAll();

            request.onsuccess = () => {
                const sets = request.result.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                resolve(sets);
            };

            request.onerror = (event) => {
                console.error('[PracticeCardsService] Error fetching custom sets:', event.target.error);
                reject('Could not fetch custom card sets');
            };
        });
    }

    /**
     * Delete a custom card set
     * @param {string} setId - The set ID
     * @returns {Promise<void>}
     */
    async deleteCustomCardSet(setId) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([CUSTOM_SETS_STORE], 'readwrite');
            const store = transaction.objectStore(CUSTOM_SETS_STORE);
            const request = store.delete(setId);

            request.onsuccess = () => {
                console.log('[PracticeCardsService] Deleted custom set:', setId);
                resolve();
            };

            request.onerror = (event) => {
                console.error('[PracticeCardsService] Error deleting set:', event.target.error);
                reject('Could not delete card set');
            };
        });
    }

    // ============================================
    // Practice Activity Operations
    // ============================================

    /**
     * Log practice activity for a card
     * @param {Object} activity - { cardId, recordingId?, durationMs, setId }
     * @returns {Promise<number>} The activity entry ID
     */
    async logCardActivity(activity) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ACTIVITY_STORE], 'readwrite');
            const store = transaction.objectStore(ACTIVITY_STORE);

            const activityData = {
                cardId: activity.cardId,
                setId: activity.setId,
                recordingId: activity.recordingId || null,
                durationMs: activity.durationMs || 0,
                timestamp: new Date().toISOString(),
                saved: !!activity.recordingId // Was this part of a saved recording?
            };

            const request = store.add(activityData);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('[PracticeCardsService] Error logging activity:', event.target.error);
                reject('Could not log card activity');
            };
        });
    }

    /**
     * Get all activity for a specific card
     * @param {string} cardId - The card ID
     * @returns {Promise<Object>} Activity stats { totalPractices, savedRecordings, recentActivity }
     */
    async getCardActivity(cardId) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ACTIVITY_STORE], 'readonly');
            const store = transaction.objectStore(ACTIVITY_STORE);
            const index = store.index('cardId');
            const request = index.getAll(cardId);

            request.onsuccess = () => {
                const activities = request.result;
                const stats = {
                    totalPractices: activities.length,
                    savedRecordings: activities.filter(a => a.saved).length,
                    totalDurationMs: activities.reduce((sum, a) => sum + (a.durationMs || 0), 0),
                    recentActivity: activities
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .slice(0, 10)
                };
                resolve(stats);
            };

            request.onerror = (event) => {
                console.error('[PracticeCardsService] Error fetching activity:', event.target.error);
                reject('Could not fetch card activity');
            };
        });
    }

    /**
     * Get all activities for a specific recording
     * @param {string|number} recordingId - The recording ID
     * @returns {Promise<Array>} List of card activities in this recording
     */
    async getRecordingCards(recordingId) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ACTIVITY_STORE], 'readonly');
            const store = transaction.objectStore(ACTIVITY_STORE);
            const index = store.index('recordingId');
            const request = index.getAll(recordingId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('[PracticeCardsService] Error fetching recording cards:', event.target.error);
                reject('Could not fetch recording cards');
            };
        });
    }

    /**
     * Get all recordings that used a specific card
     * @param {string} cardId - The card ID
     * @returns {Promise<Array>} List of recording IDs
     */
    async getRecordingsForCard(cardId) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ACTIVITY_STORE], 'readonly');
            const store = transaction.objectStore(ACTIVITY_STORE);
            const index = store.index('cardId');
            const request = index.getAll(cardId);

            request.onsuccess = () => {
                const activities = request.result.filter(a => a.saved && a.recordingId);
                const uniqueRecordings = [...new Set(activities.map(a => a.recordingId))];
                resolve(uniqueRecordings);
            };

            request.onerror = (event) => {
                console.error('[PracticeCardsService] Error fetching recordings for card:', event.target.error);
                reject('Could not fetch recordings for card');
            };
        });
    }

    /**
     * Get practice summary stats
     * @returns {Promise<Object>} Overall practice statistics
     */
    async getPracticeSummary() {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ACTIVITY_STORE], 'readonly');
            const store = transaction.objectStore(ACTIVITY_STORE);
            const request = store.getAll();

            request.onsuccess = () => {
                const activities = request.result;
                const uniqueCards = new Set(activities.map(a => a.cardId));
                const savedRecordings = new Set(
                    activities.filter(a => a.saved).map(a => a.recordingId)
                );

                resolve({
                    totalPractices: activities.length,
                    uniqueCardsUsed: uniqueCards.size,
                    savedRecordings: savedRecordings.size,
                    totalDurationMs: activities.reduce((sum, a) => sum + (a.durationMs || 0), 0)
                });
            };

            request.onerror = (event) => {
                console.error('[PracticeCardsService] Error fetching summary:', event.target.error);
                reject('Could not fetch practice summary');
            };
        });
    }
}

export const practiceCardsService = new PracticeCardsService();
