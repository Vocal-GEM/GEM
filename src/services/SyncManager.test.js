import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncManager } from './SyncManager';
import { indexedDB, STORES } from './IndexedDBManager';
import { indexedDB as fakeIndexedDB } from 'fake-indexeddb';

// Mock fetch
global.fetch = vi.fn();

// Explicitly set indexedDB
global.indexedDB = fakeIndexedDB;
global.window.indexedDB = fakeIndexedDB;

describe('SyncManager', () => {
    beforeEach(async () => {
        await indexedDB.clear(STORES.SYNC_QUEUE);
        syncManager.queue = [];
        syncManager.isReady = true;
        vi.clearAllMocks();

        // Mock online status
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: true
        });
    });

    it('should add items to the queue', async () => {
        await syncManager.push('journal', { text: 'test' });
        expect(syncManager.queue.length).toBe(1);

        const dbItems = await indexedDB.getAll(STORES.SYNC_QUEUE);
        expect(dbItems.length).toBe(1);
    });

    it('should attempt to sync when online', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({})
        });

        await syncManager.push('journal', { text: 'test' });

        // sync() is called in push(), wait for it
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(global.fetch).toHaveBeenCalled();
        expect(syncManager.queue.length).toBe(0); // Should be cleared after success
    });

    it('should not sync when offline', async () => {
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: false
        });

        await syncManager.push('journal', { text: 'test' });

        expect(global.fetch).not.toHaveBeenCalled();
        expect(syncManager.queue.length).toBe(1);
    });

    it('should retry on failure', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));

        await syncManager.push('journal', { text: 'test' });

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(global.fetch).toHaveBeenCalled();
        expect(syncManager.queue.length).toBe(1); // Should remain in queue
        expect(syncManager.retryAttempts.size).toBe(1);
    });
});
