const STORAGE_KEY = 'gem_sync_queue';

class SyncManager {
    constructor() {
        this.queue = this.loadQueue();
        this.isSyncing = false;

        // Try to sync on load
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.sync());
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

    saveQueue() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    }

    async push(type, payload) {
        // Add to queue
        this.queue.push({
            id: Date.now() + Math.random(),
            type,
            payload,
            timestamp: Date.now()
        });
        this.saveQueue();

        // Try to sync immediately
        this.sync();
    }

    async sync() {
        if (this.isSyncing || this.queue.length === 0 || !navigator.onLine) return;

        this.isSyncing = true;

        // Clone queue to iterate safely
        const currentQueue = [...this.queue];
        const remainingQueue = [];

        for (const item of currentQueue) {
            try {
                const success = await this.sendRequest(item);
                if (!success) {
                    remainingQueue.push(item); // Keep if failed
                }
            } catch (e) {
                console.error("Sync error:", e);
                remainingQueue.push(item); // Keep if error
            }
        }

        this.queue = remainingQueue;
        this.saveQueue();
        this.isSyncing = false;

        // If items remain, retry later (could use exponential backoff here)
        if (this.queue.length > 0) {
            setTimeout(() => this.sync(), 30000);
        }
    }

    async sendRequest(item) {
        const body = {};
        if (item.type === 'stats') body.stats = item.payload;
        if (item.type === 'journal') body.journals = [item.payload];

        const res = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        return res.ok;
    }
}

export const syncManager = new SyncManager();
