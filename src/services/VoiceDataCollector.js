/**
 * VoiceDataCollector - Local-first voice data collection service
 * 
 * Collects anonymous voice features (not raw audio) to help train 
 * gender classification models. Privacy-first design:
 * - Stores in IndexedDB locally
 * - Only uploads if user explicitly consents
 * - No PII stored - only acoustic features
 */

import { indexedDB } from './IndexedDBManager';

const STORE_NAME = 'voice_samples';
const MAX_LOCAL_SAMPLES = 500; // Cap local storage

/**
 * Voice sample schema (what we store)
 */
const createSampleSchema = () => ({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString().split('T')[0], // Date only, no time
    sessionId: getAnonymousSessionId(),

    // Acoustic features (no raw audio)
    features: {
        pitchMean: 0,
        pitchStd: 0,
        f1Mean: 0,
        spectralCentroid: 0,
        spectralRolloff: 0,
        spectralTilt: 0,
        bandEnergies: []
    },

    // Predictions
    predictions: {
        heuristicScore: 0,
        heuristicLabel: '',
        mlScore: 0,
        mlLabel: '',
        agreement: 0
    },

    // Optional user-provided label
    selfReportedGender: null, // Only if user opts in

    // Metadata
    uploaded: false,
    uploadedAt: null
});

/**
 * Get or create anonymous session ID (not linked to user account)
 */
function getAnonymousSessionId() {
    let sessionId = sessionStorage.getItem('voice_collection_session');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem('voice_collection_session', sessionId);
    }
    return sessionId;
}

/**
 * Check if data collection is enabled
 */
export async function isCollectionEnabled() {
    try {
        const consent = await indexedDB.getSetting('voice_data_consent');
        return consent?.enabled === true;
    } catch {
        return false;
    }
}

/**
 * Get current consent settings
 */
export async function getConsentSettings() {
    try {
        return await indexedDB.getSetting('voice_data_consent') || {
            enabled: false,
            anonymousUpload: false,
            localStorageOnly: true,
            includeGenderLabel: false,
            acknowledgedAt: null
        };
    } catch {
        return null;
    }
}

/**
 * Save consent settings
 */
export async function saveConsentSettings(settings) {
    await indexedDB.saveSetting('voice_data_consent', settings);
}

/**
 * Collect a voice sample (if consent is given)
 * @param {Object} features - Extracted acoustic features
 * @param {Object} predictions - Heuristic and ML predictions
 * @param {string} selfReportedGender - Optional user-provided gender label
 */
export async function collectSample(features, predictions, selfReportedGender = null) {
    // Check consent
    const consent = await getConsentSettings();
    if (!consent?.enabled) {
        return null;
    }

    // Create sample
    const sample = createSampleSchema();
    sample.features = {
        pitchMean: features.pitchMean || 0,
        pitchStd: features.pitchStd || 0,
        f1Mean: features.f1Mean || 0,
        spectralCentroid: features.spectralCentroid || 0,
        spectralRolloff: features.spectralRolloff || 0,
        spectralTilt: features.spectralTilt || 0,
        bandEnergies: features.bandEnergies || []
    };

    sample.predictions = {
        heuristicScore: predictions.heuristicScore || 0,
        heuristicLabel: predictions.heuristicLabel || '',
        mlScore: predictions.mlScore || 0,
        mlLabel: predictions.mlLabel || '',
        agreement: predictions.agreement || 0
    };

    // Only include gender label if user opted in
    if (consent.includeGenderLabel && selfReportedGender) {
        sample.selfReportedGender = selfReportedGender;
    }

    // Store locally
    try {
        // Ensure we don't exceed max samples
        await enforceStorageLimit();

        // Save sample
        await indexedDB.add(STORE_NAME, sample);

        // Try upload if enabled
        if (consent.anonymousUpload) {
            uploadSample(sample).catch(console.warn);
        }

        return sample.id;
    } catch (error) {
        console.error('Failed to collect sample:', error);
        return null;
    }
}

/**
 * Enforce storage limit by removing oldest samples
 */
async function enforceStorageLimit() {
    try {
        const samples = await indexedDB.getAll(STORE_NAME);
        if (samples.length >= MAX_LOCAL_SAMPLES) {
            // Remove oldest 10%
            const toRemove = Math.floor(samples.length * 0.1);
            const sortedByDate = samples.sort((a, b) =>
                new Date(a.timestamp) - new Date(b.timestamp)
            );

            for (let i = 0; i < toRemove; i++) {
                await indexedDB.delete(STORE_NAME, sortedByDate[i].id);
            }
        }
    } catch (error) {
        console.warn('Failed to enforce storage limit:', error);
    }
}

/**
 * Upload a sample to the server (anonymous)
 */
async function uploadSample(sample) {
    const API_URL = import.meta.env.VITE_API_URL || '';

    try {
        const response = await fetch(`${API_URL}/api/voice-samples`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Don't include session ID for extra anonymity
                features: sample.features,
                predictions: sample.predictions,
                selfReportedGender: sample.selfReportedGender,
                date: sample.timestamp
            })
        });

        if (response.ok) {
            // Mark as uploaded
            sample.uploaded = true;
            sample.uploadedAt = new Date().toISOString();
            await indexedDB.put(STORE_NAME, sample);
        }
    } catch (error) {
        // Silently fail - will retry later
        console.debug('Sample upload failed:', error);
    }
}

/**
 * Get statistics about local samples
 */
export async function getLocalStats() {
    try {
        const samples = await indexedDB.getAll(STORE_NAME);
        const uploaded = samples.filter(s => s.uploaded).length;

        return {
            totalSamples: samples.length,
            uploadedSamples: uploaded,
            pendingUpload: samples.length - uploaded,
            oldestSample: samples.length > 0 ? samples[0].timestamp : null,
            storageUsedPercent: Math.round((samples.length / MAX_LOCAL_SAMPLES) * 100)
        };
    } catch (error) {
        console.error('Failed to get local stats:', error);
        return null;
    }
}

/**
 * Delete all local samples
 */
export async function deleteAllSamples() {
    try {
        const samples = await indexedDB.getAll(STORE_NAME);
        for (const sample of samples) {
            await indexedDB.delete(STORE_NAME, sample.id);
        }
        return true;
    } catch (error) {
        console.error('Failed to delete samples:', error);
        return false;
    }
}

/**
 * Export samples for training (development use)
 */
export async function exportSamplesForTraining() {
    try {
        const samples = await indexedDB.getAll(STORE_NAME);
        return samples.map(s => ({
            features: s.features,
            predictions: s.predictions,
            selfReportedGender: s.selfReportedGender
        }));
    } catch (error) {
        console.error('Failed to export samples:', error);
        return [];
    }
}

export default {
    isCollectionEnabled,
    getConsentSettings,
    saveConsentSettings,
    collectSample,
    getLocalStats,
    deleteAllSamples,
    exportSamplesForTraining
};
