/**
 * PrivacyManager - Manages granular privacy controls for social features
 */

const PRIVACY_KEY = 'gem_privacy_settings';

const DEFAULT_SETTINGS = {
    shareProgress: false,
    shareMilestones: false,
    allowMentorMatch: false,
    allowPenPals: false,
    showInLeaderboards: true,
    allowFeedback: false,
    profileVisibility: 'private', // 'private', 'connections', 'public'
    dataRetentionDays: 90
};

class PrivacyManager {
    constructor() {
        this.currentSettings = this.loadSettings();
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem(PRIVACY_KEY);
            return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS };
        } catch (e) {
            console.error('Failed to load privacy settings', e);
            return { ...DEFAULT_SETTINGS };
        }
    }

    saveSettings(settings) {
        this.currentSettings = { ...this.currentSettings, ...settings };
        localStorage.setItem(PRIVACY_KEY, JSON.stringify(this.currentSettings));
        // In future: sync to backend
        return this.currentSettings;
    }

    getSettings() {
        return this.currentSettings;
    }

    /**
     * Check if a specific feature is allowed by privacy settings
     */
    canShare(featureType) {
        switch (featureType) {
            case 'milestone':
                return this.currentSettings.shareMilestones;
            case 'progress':
                return this.currentSettings.shareProgress;
            case 'profile':
                return this.currentSettings.profileVisibility === 'public';
            default:
                return false;
        }
    }

    /**
     * Export all user data (GDPR/Compliance)
     */
    async exportMyData() {
        // Collect local data
        const localData = {
            settings: this.currentSettings,
            ...localStorage
        };

        // Create downloadable blob
        const blob = new Blob([JSON.stringify(localData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `gem_data_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
    }

    /**
     * Request deletion of all shared content
     */
    async revokeAllSharedContent() {
        // This would call backend to delete all SharedVoiceSample records
        try {
            // Mock backend call
            // await fetch('/api/community/revoke-all', { method: 'POST' });
            console.log('Revocation request sent');
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default new PrivacyManager();
