/**
 * VoiceJournalService - Records and stores voice clips with metadata
 * Uses IndexedDB for audio blob storage (large files)
 */

const DB_NAME = 'gem_voice_journal';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

let db = null;

/**
 * Initialize IndexedDB
 */
const initDB = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
            }
        };
    });
};

/**
 * Save a new voice recording
 * @param {Object} recording - { audioBlob, notes, tags, pitchData }
 * @returns {Promise<Object>} The saved recording with ID
 */
export const saveRecording = async ({ audioBlob, notes = '', tags = [], pitchData = null, duration = 0 }) => {
    const database = await initDB();

    const recording = {
        id: `recording_${Date.now()}`,
        timestamp: new Date().toISOString(),
        audioBlob,
        notes,
        tags,
        duration: Math.round(duration),
        pitchData: pitchData ? {
            min: pitchData.min,
            max: pitchData.max,
            avg: pitchData.avg
        } : null
    };

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(recording);

        request.onsuccess = () => resolve(recording);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Get all recordings, sorted by timestamp (newest first)
 */
export const getRecordings = async () => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const recordings = request.result.sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            resolve(recordings);
        };
        request.onerror = () => reject(request.error);
    });
};

/**
 * Get a single recording by ID
 */
export const getRecording = async (id) => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Update a recording's notes or tags
 */
export const updateRecording = async (id, updates) => {
    const database = await initDB();
    const existing = await getRecording(id);

    if (!existing) {
        throw new Error('Recording not found');
    }

    const updated = { ...existing, ...updates };

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(updated);

        request.onsuccess = () => resolve(updated);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Delete a recording
 */
export const deleteRecording = async (id) => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Get recordings from the last N days for progress tracking
 */
export const getRecentRecordings = async (days = 30) => {
    const recordings = await getRecordings();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return recordings.filter(r => new Date(r.timestamp) >= cutoff);
};

/**
 * Get pitch trend data for charting
 */
export const getPitchTrend = async (days = 30) => {
    const recordings = await getRecentRecordings(days);

    return recordings
        .filter(r => r.pitchData)
        .map(r => ({
            date: r.timestamp.split('T')[0],
            min: r.pitchData.min,
            max: r.pitchData.max,
            avg: r.pitchData.avg
        }));
};

export default {
    saveRecording,
    getRecordings,
    getRecording,
    updateRecording,
    deleteRecording,
    getRecentRecordings,
    getPitchTrend
};
