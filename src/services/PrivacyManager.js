import { useRef } from 'react';

/**
 * Service to manage privacy settings and local storage
 */
class PrivacyManager {
    constructor() {
        this.STORAGE_KEY = 'gem_privacy_settings';
        this.defaultSettings = {
            localOnly: true,
            analyticsEnabled: false,
            shareProgress: false, // shareProgress is the intended key
            allowCloudSync: false,
            retentionPeriod: '30d' // 30d, 90d, forever
        };

        this.currentSettings = this.loadSettings();
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return { ...this.defaultSettings, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Failed to load privacy settings', e);
        }
        return { ...this.defaultSettings };
    }

    saveSettings(newSettings) {
        this.currentSettings = { ...this.currentSettings, ...newSettings };
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSettings));
        } catch (e) {
            console.error('Failed to save privacy settings', e);
        }
    }

    getSettings() {
        return this.currentSettings;
    }

    // Check specific permissions
    canCollectAnalytics() {
        return this.currentSettings.analyticsEnabled;
    }

    canShareProgress() {
        return this.currentSettings.shareProgress;
    }

    canSyncCloud() {
        return this.currentSettings.allowCloudSync;
    }
}

export const privacyManager = new PrivacyManager();
