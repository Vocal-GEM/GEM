import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { syncManager } from './SyncManager';
import { indexedDB } from './IndexedDBManager';

// Mock IndexedDB
vi.mock('./IndexedDBManager', () => ({
    indexedDB: {
        ensureReady: vi.fn().mockResolvedValue(true),
        getAll: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(null),
        add: vi.fn().mockResolvedValue(1),
        put: vi.fn().mockResolvedValue(1),
        delete: vi.fn().mockResolvedValue(true),
        clear: vi.fn().mockResolvedValue(true)
    },
    STORES: {
        SYNC_QUEUE: 'sync_queue',
        SYNC_METADATA: 'sync_metadata'
    }
}));

describe('SyncManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        syncManager.queue = [];
        syncManager.retryAttempts.clear();
        syncManager.isSyncing = false;
        syncManager.isReady = true;

        // Mock navigator.onLine
        vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Backoff Calculation', () => {
        it('should increase delay with attempts', () => {
            const delay1 = syncManager.calculateBackoff(1);
            const delay2 = syncManager.calculateBackoff(2);
            const delay3 = syncManager.calculateBackoff(3);

            // Check ranges due to jitter
            expect(delay1).toBeGreaterThan(1500); // ~2000
            expect(delay2).toBeGreaterThan(3000); // ~4000
            expect(delay3).toBeGreaterThan(7000); // ~8000

            expect(delay2).toBeGreaterThan(delay1);
            expect(delay3).toBeGreaterThan(delay2);
        });

        it('should cap delay at max', () => {
            const delay = syncManager.calculateBackoff(10);
            expect(delay).toBeLessThan(70000); // ~60000 + jitter
        });
    });

    describe('Offline Behavior', () => {
        it('should not sync when offline', async () => {
            vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

            syncManager.queue = [{ id: 1, type: 'test' }];
            const result = await syncManager.sync();

            expect(result).toBe(false);
            expect(syncManager.isSyncing).toBe(false);
        });

        it('should forceSyncNow returning false when offline', async () => {
            vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
            const result = await syncManager.forceSyncNow();
            expect(result).toBe(false);
        });
    });

    describe('Queue Management', () => {
        it('should add item to queue and try sync', async () => {
            const syncSpy = vi.spyOn(syncManager, 'sync').mockResolvedValue(true);

            await syncManager.push('journal', { text: 'test' });

            expect(syncManager.queue).toHaveLength(1);
            expect(indexedDB.add).toHaveBeenCalled();
            expect(syncSpy).toHaveBeenCalled();
        });

        it('should remove item on successful sync', async () => {
            syncManager.queue = [{ id: 1, type: 'test' }];

            // Mock successful request
            vi.spyOn(syncManager, 'sendRequest').mockResolvedValue(true);

            await syncManager.sync();

            expect(syncManager.queue).toHaveLength(0);
            expect(indexedDB.delete).toHaveBeenCalledWith('sync_queue', 1);
        });

        it('should keep item on failed sync and increment retries', async () => {
            syncManager.queue = [{ id: 1, type: 'test' }];

            // Mock failed request
            vi.spyOn(syncManager, 'sendRequest').mockResolvedValue(false);

            await syncManager.sync();

            expect(syncManager.queue).toHaveLength(1);
            expect(syncManager.retryAttempts.get(1)).toBe(1);
            // Should NOT delete from DB
            expect(indexedDB.delete).not.toHaveBeenCalled();
        });
    });
});
