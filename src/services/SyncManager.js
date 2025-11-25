import { indexedDB, STORES } from './IndexedDBManager';

class SyncManager {
    constructor() {
        this.queue = [];
        this.metadata = { lastSyncTime: null, totalSynced: 0, failedCount: 0 };
        this.isSyncing = false;
        this.retryAttempts = new Map(); // Track retry counts per item
        this.listeners = new Set(); // Status change listeners
        this.isReady = false;

        // Initialize
        this.init();
        this.registerBackgroundSync();

        // Event listeners
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.notifyListeners();
                this.sync();
            });
            window.addEventListener('offline', () => this.notifyListeners());
        }
    }

    async init() {
        try {
            await indexedDB.ensureReady();

            // Load queue
            const queueItems = await indexedDB.getAll(STORES.SYNC_QUEUE);
            this.queue = queueItems.sort((a, b) => a.timestamp - b.timestamp);

            // Load metadata
            const meta = await indexedDB.get(STORES.SYNC_METADATA, 'main');
            if (meta) {
                this.metadata = meta;
            }

            this.isReady = true;
            this.notifyListeners();

            // Try to sync on load if online
            if (navigator.onLine) {
                this.sync();
            }
        } catch (e) {
            console.error('SyncManager init failed:', e);
        }
    }

    async saveQueue() {
        // We handle individual item saves/deletes in push/sync to be more efficient
        // This method might not be needed if we manage DB state incrementally, 
        // but for consistency with previous API:
        // In IndexedDB, we usually don't "save the whole queue", we add/remove items.
        // So we'll leave this empty or deprecated, as we'll handle DB updates in place.
    }

    async saveMetadata() {
        await indexedDB.put(STORES.SYNC_METADATA, { key: 'main', ...this.metadata });
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
            failedCount: this.metadata.failedCount,
            isReady: this.isReady
        };
    }

    async push(type, payload) {
        if (!this.isReady) await this.init();

        // Add to queue with metadata
        const item = {
            id: Date.now() + Math.random(),
            type,
            payload,
            timestamp: Date.now(),
            version: 1
        };

        this.queue.push(item);
        await indexedDB.add(STORES.SYNC_QUEUE, item);

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
    async clearQueue() {
        this.queue = [];
        this.retryAttempts.clear();
        await indexedDB.clear(STORES.SYNC_QUEUE);
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
                    // Remove from DB
                    await indexedDB.delete(STORES.SYNC_QUEUE, item.id);
                } else {
                    failCount++;
                    const attempts = (this.retryAttempts.get(item.id) || 0) + 1;
                    this.retryAttempts.set(item.id, attempts);

                    // Keep if not exceeded max retries (10 attempts)
                    if (attempts < 10) {
                        remainingQueue.push(item);
                    } else {
                        console.error('Max retries exceeded for item:', item.id);
                        // Remove from DB if max retries exceeded? Or keep for manual intervention?
                        // For now, remove to prevent blocking
                        await indexedDB.delete(STORES.SYNC_QUEUE, item.id);
                    }
                }
            } catch (e) {
                console.error("Sync error:", e);
                failCount++;
                remainingQueue.push(item);
            }
        }

        this.queue = remainingQueue;

        // Update metadata
        if (successCount > 0) {
            this.metadata.lastSyncTime = Date.now();
            this.metadata.totalSynced += successCount;
        }
        this.metadata.failedCount = failCount;
        await this.saveMetadata();

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

        try {
            const res = await fetch(`${API_URL}/api/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ queue: [item] })
            });

            if (res.status === 409) {
                // Conflict detected
                const serverData = await res.json();
                return await this.resolveConflict(item, serverData);
            }

            return res.ok;
        } catch (e) {
            return false;
        }
    }

    async resolveConflict(localItem, serverData) {
        console.log('Resolving conflict for', localItem.id);
        // Simple strategy: Server wins for settings/profile, Merge for journals
        if (localItem.type === 'journal') {
            // If server has a newer version, maybe we duplicate our local one as a "copy"
            // For now, we'll just acknowledge success to remove it from queue, 
            // assuming the user will pull the latest data next load.
            return true;
        }
        return true; // Default to "handled" to clear queue
    }

    registerBackgroundSync() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register('sync-data');
            }).catch(err => console.log('Background sync registration failed:', err));
        }
    }
}

export const syncManager = new SyncManager();

