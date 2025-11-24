const DB_NAME = 'VocalGEM_DB';
const STORE_NAME = 'analysis_sessions';
const DB_VERSION = 1;

class HistoryService {
    constructor() {
        this.db = null;
    }

    async open() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject('Could not open database');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    async saveSession(sessionData) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const session = {
                id: Date.now(),
                date: new Date().toISOString(),
                ...sessionData
            };

            const request = store.add(session);

            request.onsuccess = () => {
                resolve(session.id);
            };

            request.onerror = (event) => {
                console.error('Error saving session:', event.target.error);
                reject('Could not save session');
            };
        });
    }

    async getAllSessions() {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by date descending
                const sessions = request.result.sort((a, b) => b.id - a.id);
                resolve(sessions);
            };

            request.onerror = (event) => {
                console.error('Error fetching sessions:', event.target.error);
                reject('Could not fetch sessions');
            };
        });
    }

    async getSession(id) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject('Could not fetch session');
            };
        });
    }

    async deleteSession(id) {
        await this.open();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject('Could not delete session');
            };
        });
    }
}

export const historyService = new HistoryService();
