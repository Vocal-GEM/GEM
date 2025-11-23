const STORAGE_KEY = 'gem_sync_queue';
const METADATA_KEY = 'gem_sync_metadata';

class SyncManager {
    constructor() {
        this.queue = this.loadQueue();
        this.metadata = this.loadMetadata();
        this.isSyncing = false;
        this.retryAttempts = new Map(); // Track retry counts per item
        this.listeners = new Set(); // Status change listeners

        // Try to sync on load
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.notifyListeners();
                this.sync();
            });
            window.addEventListener('offline', () => this.notifyListeners());
            this.sync();
        }
    }

    loadQueue() {
        try {
            const q = localStorage.getItem(STORAGE_KEY);
            return q ? JSON.parse(q) : [];
        } catch (e) {
            return [];
        }
    }

    loadMetadata() {
        try {
            const m = localStorage.getItem(METADATA_KEY);
            return m ? JSON.parse(m) : { lastSyncTime: null, totalSynced: 0, failedCount: 0 };
        } catch (e) {
            return { lastSyncTime: null, totalSynced: 0, failedCount: 0 };
        }
    }

    saveQueue() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    }

    saveMetadata() {
        localStorage.setItem(METADATA_KEY, JSON.stringify(this.metadata));
    }

    // Subscribe to sync status changes
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners() {
        const status = this.getStatus();
        this.listeners.forEach(cb => cb(status));
    }

    // Get current sync status
    getStatus() {
        return {
            isOnline: navigator.onLine,
            isSyncing: this.isSyncing,
            pendingCount: this.queue.length,
            lastSyncTime: this.metadata.lastSyncTime,
            totalSynced: this.metadata.totalSynced,
            failedCount: this.metadata.failedCount
        };
    }

    async push(type, payload) {
        // Add to queue with metadata
        const item = {
            id: Date.now() + Math.random(),
            type,
            payload,
            timestamp: Date.now(),
            version: 1
        };

        this.queue.push(item);
        this.saveQueue();
        this.notifyListeners();

        // Try to sync immediately
        this.sync();
    }

    // Manual sync trigger
    async forceSyncNow() {
        if (!navigator.onLine) {
            console.warn('Cannot sync: offline');
            return false;
        }
        return await this.sync();
    }

    // Clear all pending items (with caution)
    clearQueue() {
        this.queue = [];
        this.retryAttempts.clear();
        this.saveQueue();
        this.notifyListeners();
    }

    async sync() {
        if (this.isSyncing || this.queue.length === 0 || !navigator.onLine) {
            return false;
        }

        this.isSyncing = true;
        this.notifyListeners();

        // Clone queue to iterate safely
        const currentQueue = [...this.queue];
        const remainingQueue = [];
        let successCount = 0;
        let failCount = 0;

        for (const item of currentQueue) {
            try {
                const success = await this.sendRequest(item);
                if (success) {
                    successCount++;
                    this.retryAttempts.delete(item.id);
                } else {
                    failCount++;
                    const attempts = (this.retryAttempts.get(item.id) || 0) + 1;
                    this.retryAttempts.set(item.id, attempts);

                    // Keep if not exceeded max retries (10 attempts)
                    if (attempts < 10) {
                        remainingQueue.push(item);
                    } else {
                        console.error('Max retries exceeded for item:', item.id);
                    }
                }
            } catch (e) {
                console.error("Sync error:", e);
                failCount++;
                remainingQueue.push(item);
            }
        }

        this.queue = remainingQueue;
        this.saveQueue();

        // Update metadata
        if (successCount > 0) {
            this.metadata.lastSyncTime = Date.now();
            this.metadata.totalSynced += successCount;
        }
        this.metadata.failedCount = failCount;
        this.saveMetadata();

        this.isSyncing = false;
        this.notifyListeners();

        // Exponential backoff for retries
        if (this.queue.length > 0) {
            const maxAttempts = Math.max(...Array.from(this.retryAttempts.values()));
            const delay = Math.min(30000 * Math.pow(2, maxAttempts - 1), 300000); // Max 5 min
            setTimeout(() => this.sync(), delay);
        }

        return successCount > 0;
    }

    async sendRequest(item) {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const body = {};
        if (item.type === 'stats') body.stats = item.payload;
        if (item.type === 'journal') body.journals = [item.payload];

        const res = await fetch(`${API_URL}/api/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        return res.ok;
    }
}

export const syncManager = new SyncManager();

