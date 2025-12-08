/**
 * IndexedDB Manager for Vocal GEM
 * Provides a simple API for storing and retrieving data with better performance
 * and larger storage capacity than localStorage.
 */

const DB_NAME = 'VocalGEM';
const DB_VERSION = 4;

// Store names
const STORES = {
    JOURNALS: 'journals',
    STATS: 'stats',
    GOALS: 'goals',
    SETTINGS: 'settings',
    PROFILES: 'profiles',
    SYNC_QUEUE: 'sync_queue',
    SYNC_METADATA: 'sync_metadata',
    CLIENTS: 'clients',
    SESSIONS: 'sessions',
    ASSESSMENTS: 'assessments',
    RECORDINGS: 'recordings',
    MODULE_NOTES: 'module_notes'
};

class IndexedDBManager {
    constructor() {
        this.db = null;
        this.initPromise = this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            // Version 4 adds MODULE_NOTES store
            const request = window.indexedDB.open(DB_NAME, 4);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains(STORES.JOURNALS)) {
                    const journalStore = db.createObjectStore(STORES.JOURNALS, { keyPath: 'id', autoIncrement: true });
                    journalStore.createIndex('timestamp', 'timestamp', { unique: false });
                    journalStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.STATS)) {
                    db.createObjectStore(STORES.STATS, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(STORES.GOALS)) {
                    const goalsStore = db.createObjectStore(STORES.GOALS, { keyPath: 'id', autoIncrement: true });
                    goalsStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }

                if (!db.objectStoreNames.contains(STORES.PROFILES)) {
                    db.createObjectStore(STORES.PROFILES, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                    const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
                    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.SYNC_METADATA)) {
                    db.createObjectStore(STORES.SYNC_METADATA, { keyPath: 'key' });
                }

                if (!db.objectStoreNames.contains(STORES.CLIENTS)) {
                    const clientStore = db.createObjectStore(STORES.CLIENTS, { keyPath: 'id' });
                    clientStore.createIndex('name', 'name', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
                    const sessionStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id', autoIncrement: true });
                    sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
                    sessionStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
                    const assessmentStore = db.createObjectStore(STORES.ASSESSMENTS, { keyPath: 'id', autoIncrement: true });
                    assessmentStore.createIndex('timestamp', 'timestamp', { unique: false });
                    assessmentStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.RECORDINGS)) {
                    const recordingStore = db.createObjectStore(STORES.RECORDINGS, { keyPath: 'id' });
                    recordingStore.createIndex('timestamp', 'timestamp', { unique: false });
                    recordingStore.createIndex('type', 'type', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.MODULE_NOTES)) {
                    // Key is moduleId (string)
                    db.createObjectStore(STORES.MODULE_NOTES, { keyPath: 'moduleId' });
                }
            };
        });
    }

    async ensureReady() {
        if (!this.db) {
            await this.initPromise;
        }
    }

    // Generic CRUD operations
    async get(storeName, key) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, value) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value);

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async add(storeName, value) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(value);

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async saveGoals(goals) {
        await this.clear(STORES.GOALS);
        for (const goal of goals) {
            await this.add(STORES.GOALS, goal);
        }
    }

    async getGoals() {
        return await this.getAll(STORES.GOALS);
    }

    async saveSetting(key, value) {
        return await this.put(STORES.SETTINGS, { key, value });
    }

    async getSetting(key, defaultValue) {
        const setting = await this.get(STORES.SETTINGS, key);
        return setting ? setting.value : defaultValue;
    }

    async saveProfile(profile) {
        return await this.put(STORES.PROFILES, profile);
    }

    async getProfiles() {
        return await this.getAll(STORES.PROFILES);
    }

    async saveClient(client) {
        if (!client.id) client.id = crypto.randomUUID();
        if (!client.createdAt) client.createdAt = new Date().toISOString();
        return await this.put(STORES.CLIENTS, client);
    }

    async getClients() {
        return await this.getAll(STORES.CLIENTS);
    }

    async deleteClient(id) {
        return await this.delete(STORES.CLIENTS, id);
    }

    async saveSession(session) {
        if (!session.timestamp) session.timestamp = Date.now();
        if (!session.date) session.date = new Date().toISOString().split('T')[0];
        return await this.add(STORES.SESSIONS, session);
    }

    async getSessions(limit = 50) {
        const sessions = await this.getAll(STORES.SESSIONS);
        return sessions.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }

    async saveAssessment(assessment) {
        if (!assessment.timestamp) assessment.timestamp = Date.now();
        if (!assessment.date) assessment.date = new Date().toISOString().split('T')[0];
        return await this.add(STORES.ASSESSMENTS, assessment);
    }

    async getAssessments(limit = 50) {
        const assessments = await this.getAll(STORES.ASSESSMENTS);
        return assessments.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }

    async saveRecording(recording) {
        if (!recording.id) recording.id = crypto.randomUUID();
        if (!recording.timestamp) recording.timestamp = Date.now();
        // If blob is present, we might want to ensure it's an ArrayBuffer for compatibility
        // But IndexedDB supports Blobs well in modern browsers. 
        // We will store as is, but if we need serialization we can convert.
        return await this.put(STORES.RECORDINGS, recording);
    }

    async getRecordings() {
        const recordings = await this.getAll(STORES.RECORDINGS);
        return recordings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async deleteRecording(id) {
        return await this.delete(STORES.RECORDINGS, id);
    }

    /**
     * Save a note for a learning module
     * @param {string} moduleId 
     * @param {string} content 
     */
    async saveModuleNote(moduleId, content) {
        return await this.put(STORES.MODULE_NOTES, {
            moduleId,
            content,
            updatedAt: Date.now()
        });
    }

    /**
     * Get a note for a learning module
     * @param {string} moduleId 
     * @returns {Promise<Object>} The note object or undefined
     */
    async getModuleNote(moduleId) {
        return await this.get(STORES.MODULE_NOTES, moduleId);
    }

    // Migration helper: Import from localStorage
    async migrateFromLocalStorage() {
        try {
            // Migrate journals
            const journals = JSON.parse(localStorage.getItem('journals') || '[]');
            for (const journal of journals) {
                await this.saveJournal(journal);
            }

            // Migrate stats
            const stats = JSON.parse(localStorage.getItem('stats') || '{}');
            if (Object.keys(stats).length > 0) {
                await this.saveStats(stats);
            }

            // Migrate goals
            const goals = JSON.parse(localStorage.getItem('goals') || '[]');
            if (goals.length > 0) {
                await this.saveGoals(goals);
            }

            // Migrate settings
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            for (const [key, value] of Object.entries(settings)) {
                await this.saveSetting(key, value);
            }

            // Migrate profiles
            const profiles = JSON.parse(localStorage.getItem('voiceProfiles') || '[]');
            for (const profile of profiles) {
                await this.saveProfile(profile);
            }

            // Mark migration as complete
            localStorage.setItem('indexeddb_migrated', 'true');

            localStorage.setItem('indexeddb_migrated', 'true');
            return true;
        } catch (error) {
            console.error('❌ Migration failed:', error);
            return false;
        }
    }

    // Check if migration is needed
    async needsMigration() {
        const migrated = localStorage.getItem('indexeddb_migrated');
        if (migrated === 'true') return false;

        // Check if there's data in localStorage
        const hasData = localStorage.getItem('journals') ||
            localStorage.getItem('stats') ||
            localStorage.getItem('goals');

        return !!hasData;
    }
    // Data Management
    async exportAllData() {
        await this.ensureReady();
        const exportData = {
            version: 1,
            timestamp: new Date().toISOString(),
            stores: {}
        };

        for (const storeName of Object.values(STORES)) {
            try {
                exportData.stores[storeName] = await this.getAll(storeName);
            } catch (e) {
                console.warn(`Failed to export store ${storeName}:`, e);
                exportData.stores[storeName] = [];
            }
        }

        return exportData;
    }

    async importData(jsonData) {
        await this.ensureReady();
        if (!jsonData || !jsonData.stores) {
            throw new Error('Invalid backup file format');
        }

        const stores = Object.values(STORES);

        // 1. Validate all data first
        for (const storeName of stores) {
            if (jsonData.stores[storeName] && !Array.isArray(jsonData.stores[storeName])) {
                throw new Error(`Invalid data format for store: ${storeName}`);
            }
        }

        let successCount = 0;

        // 2. Import store by store
        // Ideally we would use a single transaction for all, but that locks the whole DB.
        // We will do it sequentially to be safer than parallel.
        for (const storeName of stores) {
            if (jsonData.stores[storeName] && Array.isArray(jsonData.stores[storeName])) {
                try {
                    // Clear and Import within a transaction if possible, but our wrapper is simple.
                    // We will clear then add. If add fails, we at least tried.
                    await this.clear(storeName);

                    for (const item of jsonData.stores[storeName]) {
                        await this.put(storeName, item);
                    }
                    successCount++;
                } catch (e) {
                    console.error(`Failed to import store ${storeName}:`, e);
                    // Continue to next store? Or stop? 
                    // Stopping is probably better to alert user of partial failure.
                    throw new Error(`Import failed for ${storeName}: ${e.message}`);
                }
            }
        }

        return successCount;
    }

    async factoryReset() {
        await this.ensureReady();
        const stores = Object.values(STORES);
        for (const storeName of stores) {
            await this.clear(storeName);
        }
        localStorage.clear(); // Also clear localStorage
        return true;
    }

    /**
     * Get all journals
     * @returns {Promise<Array>}
     */
    async getJournals() {
        return await this.getAll(STORES.JOURNALS);
    }

    /**
     * Save a journal entry
     * @param {Object} entry - Journal entry data
     * @returns {Promise<number>} - ID of saved entry
     */
    async saveJournal(entry) {
        return await this.add(STORES.JOURNALS, {
            ...entry,
            timestamp: entry.timestamp || Date.now(),
            date: entry.date || new Date().toISOString().split('T')[0]
        });
    }

    /**
     * Get all stats
     * @returns {Promise<Array>}
     */
    async getStats() {
        return await this.getAll(STORES.STATS);
    }

    /**
     * Save stats
     * @param {Object} stats - Stats data
     * @returns {Promise}
     */
    async saveStats(stats) {
        return await this.put(STORES.STATS, {
            id: 'current',
            ...stats,
            lastUpdated: Date.now()
        });
    }
}

// Export singleton instance
export const indexedDB = new IndexedDBManager();
export { STORES };
