/**
 * DataSyncService - High-level service for syncing user data to/from server
 * 
 * Handles:
 * - Pushing local data to server on demand (before logout, periodically)
 * - Pulling user data from server on login
 * - Merging local and server data intelligently
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://vocalgem.onrender.com';

/**
 * Collect all syncable local data
 * @returns {Object} All data that should be synced to server
 */
export const collectLocalData = () => {
    const data = {
        // Journey progress
        journeyProgress: JSON.parse(localStorage.getItem('gem_journey_state') || 'null'),

        // Voice calibration/baseline
        voiceBaseline: JSON.parse(localStorage.getItem('gem_voice_baseline') || 'null'),

        // Skill assessment
        skillAssessment: JSON.parse(localStorage.getItem('gem_skill_assessment') || 'null'),

        // Course progress
        courseProgress: JSON.parse(localStorage.getItem('gem_course_progress') || 'null'),

        // Streak data
        streakData: JSON.parse(localStorage.getItem('gem_streak_data') || 'null'),

        // Practice goals
        practiceGoals: JSON.parse(localStorage.getItem('gem_practice_goals') || 'null'),

        // Self-care plan
        selfCarePlan: JSON.parse(localStorage.getItem('gem_selfcare') || 'null'),

        // Program progress
        programProgress: JSON.parse(localStorage.getItem('gem_program_progress') || 'null'),

        // Onboarding state
        onboardingComplete: localStorage.getItem('gem_onboarding_complete') === 'true',
        tutorialSeen: localStorage.getItem('gem_tutorial_seen') === 'true',
        compassSeen: localStorage.getItem('gem_compass_seen') === 'true',
        calibrationDone: localStorage.getItem('gem_calibration_done') === 'true',

        // Timestamp for merge conflict resolution
        collectedAt: new Date().toISOString()
    };

    return data;
};

/**
 * Push all local data to server
 * @returns {Promise<boolean>} Success status
 */
export const syncToServer = async () => {
    try {
        const localData = collectLocalData();

        console.log('[DataSync] Pushing data to server...');

        const res = await fetch(`${API_URL}/api/user-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(localData)
        });

        if (res.ok) {
            console.log('[DataSync] Data synced to server successfully');
            return true;
        } else {
            console.error('[DataSync] Server rejected sync:', res.status);
            return false;
        }
    } catch (e) {
        console.error('[DataSync] Failed to sync to server:', e);
        return false;
    }
};

/**
 * Pull user data from server and restore to local storage
 * @returns {Promise<boolean>} Success status
 */
export const syncFromServer = async () => {
    try {
        console.log('[DataSync] Pulling data from server...');

        const res = await fetch(`${API_URL}/api/user-data`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) {
            console.warn('[DataSync] No server data found or not logged in');
            return false;
        }

        const serverData = await res.json();

        // Restore data to localStorage
        if (serverData.journeyProgress) {
            localStorage.setItem('gem_journey_state', JSON.stringify(serverData.journeyProgress));
        }
        if (serverData.voiceBaseline) {
            localStorage.setItem('gem_voice_baseline', JSON.stringify(serverData.voiceBaseline));
        }
        if (serverData.skillAssessment) {
            localStorage.setItem('gem_skill_assessment', JSON.stringify(serverData.skillAssessment));
        }
        if (serverData.courseProgress) {
            localStorage.setItem('gem_course_progress', JSON.stringify(serverData.courseProgress));
        }
        if (serverData.streakData) {
            localStorage.setItem('gem_streak_data', JSON.stringify(serverData.streakData));
        }
        if (serverData.practiceGoals) {
            localStorage.setItem('gem_practice_goals', JSON.stringify(serverData.practiceGoals));
        }
        if (serverData.selfCarePlan) {
            localStorage.setItem('gem_selfcare', JSON.stringify(serverData.selfCarePlan));
        }
        if (serverData.programProgress) {
            localStorage.setItem('gem_program_progress', JSON.stringify(serverData.programProgress));
        }

        // Restore onboarding state
        if (serverData.onboardingComplete) {
            localStorage.setItem('gem_onboarding_complete', 'true');
        }
        if (serverData.tutorialSeen) {
            localStorage.setItem('gem_tutorial_seen', 'true');
        }
        if (serverData.compassSeen) {
            localStorage.setItem('gem_compass_seen', 'true');
        }
        if (serverData.calibrationDone) {
            localStorage.setItem('gem_calibration_done', 'true');
        }

        console.log('[DataSync] Data restored from server successfully');
        return true;
    } catch (e) {
        console.error('[DataSync] Failed to pull from server:', e);
        return false;
    }
};

/**
 * Sync data before logout (push to server to preserve)
 * @returns {Promise<boolean>}
 */
export const syncBeforeLogout = async () => {
    console.log('[DataSync] Syncing before logout...');
    return await syncToServer();
};

export default {
    collectLocalData,
    syncToServer,
    syncFromServer,
    syncBeforeLogout
};
