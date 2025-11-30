import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { indexedDB as dbManager, STORES } from './IndexedDBManager';
import 'fake-indexeddb/auto'; // If we install this

describe('IndexedDBManager', () => {
    beforeEach(async () => {
        // Reset DB before each test if possible, or use unique keys
    });

    it('should initialize the database', async () => {
        const db = await dbManager.init();
        expect(db).toBeDefined();
        expect(db.objectStoreNames).toContain(STORES.JOURNALS);
    });

    it('should save and retrieve a journal entry', async () => {
        const entry = { text: 'Test entry', mood: 'happy' };
        const id = await dbManager.saveJournal(entry);
        expect(id).toBeDefined();

        const journals = await dbManager.getJournals();
        expect(journals.length).toBeGreaterThan(0);
        expect(journals[0].text).toBe('Test entry');
    });
});
