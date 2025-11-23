/**
 * IndexedDB Manager for Vocal GEM
 * Provides a simple API for storing and retrieving data with better performance
 * and larger storage capacity than localStorage.
 */

const DB_NAME = 'VocalGEM';
const DB_VERSION = 1;

// Store names
const STORES = {
    JOURNALS: 'journals',
    STATS: 'stats',
    GOALS: 'goals',
    SETTINGS: 'settings',
    PROFILES: 'profiles',
    SYNC_QUEUE: 'sync_queue',
    SYNC_METADATA: 'sync_metadata'
};

class IndexedDBManager {
    constructor() {
        this.db = null;
        this.initPromise = this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

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

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, value) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async add(storeName, value) {
        await this.ensureReady();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(value);

            request.onsuccess = () => resolve(request.result);
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

    // High-level API for common operations
    async saveJournal(entry) {
        if (!entry.timestamp) entry.timestamp = Date.now();
        if (!entry.date) entry.date = new Date().toISOString().split('T')[0];
        return await this.add(STORES.JOURNALS, entry);
    }

    async getJournals() {
        const journals = await this.getAll(STORES.JOURNALS);
        return journals.sort((a, b) => b.timestamp - a.timestamp);
    }

    async saveStats(stats) {
        return await this.put(STORES.STATS, { id: 'current', ...stats });
    }

    async getStats() {
        const stats = await this.get(STORES.STATS, 'current');
        return stats || { streak: 0, totalSeconds: 0 };
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

            console.log('✅ Migration from localStorage to IndexedDB complete');
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
}

// Export singleton instance
export const indexedDB = new IndexedDBManager();
export { STORES };
