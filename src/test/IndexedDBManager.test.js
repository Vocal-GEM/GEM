import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { indexedDB, STORES } from '../services/IndexedDBManager';

describe('IndexedDBManager', () => {
    beforeEach(async () => {
        // Reset DB state if possible, or just use unique keys
        // Since it's a singleton, we might need to clear it
        await indexedDB.init();
        await indexedDB.factoryReset();
    });

    it('should initialize correctly', async () => {
        await indexedDB.ensureReady();
        expect(indexedDB.db).toBeDefined();
    });

    it('should save and retrieve a setting', async () => {
        await indexedDB.saveSetting('test_key', 'test_value');
        const value = await indexedDB.getSetting('test_key');
        expect(value).toBe('test_value');
    });

    it('should return default value if setting not found', async () => {
        const value = await indexedDB.getSetting('non_existent', 'default');
        expect(value).toBe('default');
    });

    it('should save and retrieve a profile', async () => {
        const profile = { id: 'p1', name: 'Test Profile' };
        await indexedDB.saveProfile(profile);
        const profiles = await indexedDB.getProfiles();
        expect(profiles).toHaveLength(1);
        expect(profiles[0]).toEqual(profile);
    });

    it('should export all data correctly', async () => {
        await indexedDB.saveSetting('k1', 'v1');
        const data = await indexedDB.exportAllData();

        expect(data).toHaveProperty('version');
        expect(data).toHaveProperty('timestamp');
        expect(data.stores).toBeDefined();
        expect(data.stores[STORES.SETTINGS]).toHaveLength(1);
        expect(data.stores[STORES.SETTINGS][0]).toEqual({ key: 'k1', value: 'v1' });
    });

    it('should import data correctly', async () => {
        const backup = {
            version: 1,
            timestamp: new Date().toISOString(),
            stores: {
                [STORES.SETTINGS]: [{ key: 'imported_key', value: 'imported_value' }]
            }
        };

        const successCount = await indexedDB.importData(backup);
        expect(successCount).toBeGreaterThan(0);

        const value = await indexedDB.getSetting('imported_key');
        expect(value).toBe('imported_value');
    });

    it('should throw error on invalid import format', async () => {
        const invalidBackup = { stores: null };
        await expect(indexedDB.importData(invalidBackup)).rejects.toThrow('Invalid backup file format');
    });

    it('should validate store data before clearing', async () => {
        // Setup initial data
        await indexedDB.saveSetting('existing', 'data');

        const corruptBackup = {
            stores: {
                [STORES.SETTINGS]: "NOT_AN_ARRAY" // Invalid format
            }
        };

        // Should throw validation error
        await expect(indexedDB.importData(corruptBackup)).rejects.toThrow('Invalid data format');

        // Verify existing data was NOT cleared
        const value = await indexedDB.getSetting('existing');
        expect(value).toBe('data');
    });
});
