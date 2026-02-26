import { indexedDB, STORES } from './IndexedDBManager';
import { syncManager } from './SyncManager';

class OfflineManager {
    constructor() {
        this.cacheStore = STORES.CONTENT_CACHE;
    }

    /**
     * Cache content for offline usage
     * @param {string} id Unique identifier for the content
     * @param {any} data Content data
     * @param {string} type Content type (e.g., 'lesson', 'exercise', 'article')
     */
    async cacheContent(id, data, type = 'generic') {
        try {
            await indexedDB.saveContent(id, data, type);
            return true;
        } catch (e) {
            console.error('Failed to cache content:', e);
            return false;
        }
    }

    /**
     * Get content from offline cache
     * @param {string} id Unique identifier
     */
    async getCachedContent(id) {
        try {
            return await indexedDB.getContent(id);
        } catch (e) {
            console.error('Failed to retrieve cached content:', e);
            return null;
        }
    }

    /**
     * Check if content is available offline
     * @param {string} id 
     */
    async isContentCached(id) {
        try {
            const content = await this.getCachedContent(id);
            return !!content;
        } catch (e) {
            return false;
        }
    }

    /**
     * Clear specific content from cache
     * @param {string} id 
     */
    async clearContent(id) {
        try {
            await indexedDB.delete(STORES.CONTENT_CACHE, id);
            return true;
        } catch (e) {
            console.error('Failed to clear content:', e);
            return false;
        }
    }

    /**
     * Clear all cached content (e.g., on logout or cleanup)
     */
    async clearAllCache() {
        try {
            await indexedDB.clear(STORES.CONTENT_CACHE);
            return true;
        } catch (e) {
            console.error('Failed to clear cache:', e);
            return false;
        }
    }

    /**
     * Queue an action or data update for when back online
     * Delegates to SyncManager
     * @param {string} type Action type (e.g., 'journal_entry', 'profile_update')
     * @param {any} payload Data to sync
     */
    async queueForSync(type, payload) {
        return await syncManager.push(type, payload);
    }
}

export const offlineManager = new OfflineManager();
