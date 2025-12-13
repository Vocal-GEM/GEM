/**
 * DataBackupService - Export and restore all user data
 */

const BACKUP_VERSION = '1.0';

// All localStorage keys used by the app
const STORAGE_KEYS = [
    'gem_streak',
    'gem_xp_data',
    'gem_community',
    'gem_public_profile',
    'gem_accessibility',
    'gem_notification_settings',
    'gem_theme',
    'gem_formant_history',
    'gem_custom_cards',
    'gem_user_profile',
    'gem_session_reports',
    'gem_course_progress',
    'gem_achievements'
];

/**
 * Export all user data as a downloadable JSON file
 */
export const exportAllData = () => {
    const backup = {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        appName: 'Vocal GEM',
        data: {}
    };

    STORAGE_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                backup.data[key] = JSON.parse(value);
            } catch {
                backup.data[key] = value;
            }
        }
    });

    // Create and download file
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocal-gem-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, keysExported: Object.keys(backup.data).length };
};

/**
 * Import data from backup file
 */
export const importBackup = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const backup = JSON.parse(event.target.result);

                // Validate backup structure
                if (!backup.version || !backup.data || backup.appName !== 'Vocal GEM') {
                    reject(new Error('Invalid backup file format'));
                    return;
                }

                // Restore each key
                let restoredCount = 0;
                Object.entries(backup.data).forEach(([key, value]) => {
                    if (STORAGE_KEYS.includes(key)) {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        restoredCount++;
                    }
                });

                resolve({
                    success: true,
                    keysRestored: restoredCount,
                    backupDate: backup.exportedAt
                });
            } catch (error) {
                reject(new Error('Failed to parse backup file: ' + error.message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};

/**
 * Get summary of stored data
 */
export const getDataSummary = () => {
    const summary = {
        totalKeys: 0,
        totalSizeBytes: 0,
        categories: {}
    };

    STORAGE_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            summary.totalKeys++;
            summary.totalSizeBytes += value.length * 2; // UTF-16 encoding

            // Categorize
            const category = key.replace('gem_', '').split('_')[0];
            if (!summary.categories[category]) {
                summary.categories[category] = { count: 0, sizeBytes: 0 };
            }
            summary.categories[category].count++;
            summary.categories[category].sizeBytes += value.length * 2;
        }
    });

    return summary;
};

/**
 * Clear all app data
 */
export const clearAllData = () => {
    STORAGE_KEYS.forEach(key => {
        localStorage.removeItem(key);
    });
    return { success: true, keysCleared: STORAGE_KEYS.length };
};

export default {
    exportAllData,
    importBackup,
    getDataSummary,
    clearAllData,
    STORAGE_KEYS
};
