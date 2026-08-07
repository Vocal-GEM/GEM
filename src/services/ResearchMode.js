/**
 * Research Mode Controller
 * Manages clinical trials, research studies, and participant data collection
 */

import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

export class ResearchModeController {
    constructor(studyConfig) {
        this.studyId = studyConfig.id;
        this.protocol = studyConfig.protocol;
        this.consentVersion = studyConfig.consentVersion;
        this.dataRetention = studyConfig.dataRetention;
        this.isActive = false;
    }

    /**
     * Enroll a participant in the research study
     * @param {string} userId - User ID (will be anonymized)
     * @param {Object} consentSignature - Electronic signature data
     * @returns {Promise<Object>} Enrollment details
     */
    async enrollParticipant(userId, consentSignature) {
        // Verify consent signature
        const consent = await this.recordConsent(userId, consentSignature);

        if (!consent.valid) {
            throw new Error('Invalid consent signature');
        }

        // Assign to study arm (if randomized)
        const arm = this.protocol.randomize ? this.randomizeArm() : 'single';

        // Generate participant ID (de-identified, non-reversible)
        const participantId = this.generateParticipantId(userId);

        // Initialize data collection
        const enrollment = {
            participantId,
            studyArm: arm,
            startDate: new Date().toISOString(),
            protocol: this.protocol,
            dataCollectionSchedule: this.getCollectionSchedule(arm),
            consentVersion: this.consentVersion,
            status: 'active'
        };

        // Store enrollment (backend call would go here)
        await this.storeEnrollment(enrollment);

        return enrollment;
    }

    /**
     * Generate a non-reversible participant ID
     * @param {string} userId - Original user ID
     * @returns {string} Anonymized participant ID
     */
    generateParticipantId(userId) {
        // Use cryptographic hash with study-specific salt
        const salt = this.studyId + process.env.REACT_APP_RESEARCH_SALT;
        const hash = CryptoJS.SHA256(userId + salt).toString();

        // Take first 16 characters for readability
        return `P-${hash.substring(0, 16).toUpperCase()}`;
    }

    /**
     * Randomize participant to study arm
     * @returns {string} Study arm assignment
     */
    randomizeArm() {
        const arms = this.protocol.studyArms || ['control', 'intervention'];
        const weights = this.protocol.armWeights || arms.map(() => 1 / arms.length);

        // Weighted random selection
        const random = Math.random();
        let cumulative = 0;

        for (let i = 0; i < arms.length; i++) {
            cumulative += weights[i];
            if (random < cumulative) {
                return arms[i];
            }
        }

        return arms[0]; // Fallback
    }

    /**
     * Record consent with audit trail
     * @param {string} userId - User ID
     * @param {Object} signature - Electronic signature
     * @returns {Promise<Object>} Consent record
     */
    async recordConsent(userId, signature) {
        const consent = {
            userId,
            studyId: this.studyId,
            consentVersion: this.consentVersion,
            signedAt: new Date().toISOString(),
            signature: signature.data,
            ipAddress: signature.ipAddress, // For audit purposes
            userAgent: signature.userAgent,
            valid: this.validateSignature(signature)
        };

        // Store consent record (backend call)
        await this.storeConsent(consent);

        return consent;
    }

    /**
     * Validate electronic signature
     * @param {Object} signature - Signature data
     * @returns {boolean} Whether signature is valid
     */
    validateSignature(signature) {
        // Check required fields
        if (!signature.data || !signature.timestamp || !signature.fullName) {
            return false;
        }

        // Verify signature was created recently (within 5 minutes)
        const signatureAge = Date.now() - new Date(signature.timestamp).getTime();
        if (signatureAge > 5 * 60 * 1000) {
            return false;
        }

        return true;
    }

    /**
     * Collect a research data point
     * @param {string} participantId - Participant ID
     * @param {string} dataType - Type of data being collected
     * @param {Object} data - Raw data
     * @returns {Promise<Object>} Anonymized data point
     */
    async collectDataPoint(participantId, dataType, data) {
        const anonymizedData = {
            participantId, // Already de-identified
            timestamp: Date.now(),
            dataType,
            studyId: this.studyId,
            // Extract only aggregate acoustic features (no raw audio)
            acousticFeatures: this.extractAnonymousFeatures(data),
            sessionMetadata: this.extractSessionMetadata(data)
        };

        // Store research data (backend call)
        await this.storeResearchData(anonymizedData);

        return anonymizedData;
    }

    /**
     * Extract anonymous acoustic features from audio data
     * @param {Object} audioData - Audio analysis data
     * @returns {Object} Anonymized features
     */
    extractAnonymousFeatures(audioData) {
        // Extract only aggregate acoustic features
        // No spectrograms (voice fingerprint risk)
        // No raw audio data
        return {
            // Pitch metrics
            pitchMean: audioData.pitch?.mean || null,
            pitchStd: audioData.pitch?.std || null,
            pitchMin: audioData.pitch?.min || null,
            pitchMax: audioData.pitch?.max || null,
            pitchMedian: audioData.pitch?.median || null,

            // Formant metrics
            f1Mean: audioData.formants?.f1?.mean || null,
            f2Mean: audioData.formants?.f2?.mean || null,
            f3Mean: audioData.formants?.f3?.mean || null,
            f4Mean: audioData.formants?.f4?.mean || null,

            // Voice quality metrics
            cppMean: audioData.cpp?.mean || null,
            hnrMean: audioData.hnr?.mean || null,
            jitter: audioData.jitter || null,
            shimmer: audioData.shimmer || null,

            // Spectral metrics
            spectralTilt: audioData.spectralTilt || null,
            spectralCentroid: audioData.spectralCentroid || null,

            // Duration metrics
            duration: audioData.duration || null,
            voicedFrames: audioData.voicedFrames || null,
            unvoicedFrames: audioData.unvoicedFrames || null
        };
    }

    /**
     * Extract session metadata (non-identifying)
     * @param {Object} data - Session data
     * @returns {Object} Metadata
     */
    extractSessionMetadata(data) {
        return {
            exerciseType: data.exerciseType || null,
            sessionDuration: data.sessionDuration || null,
            timeOfDay: this.getTimeOfDayCategory(data.timestamp),
            dayOfWeek: new Date(data.timestamp).getDay(),
            // No specific dates (privacy risk)
            daysIntoStudy: data.daysIntoStudy || null
        };
    }

    /**
     * Get time of day category
     * @param {number} timestamp - Timestamp
     * @returns {string} Time category
     */
    getTimeOfDayCategory(timestamp) {
        const hour = new Date(timestamp).getHours();
        if (hour < 6) return 'night';
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    /**
     * Get data collection schedule for study arm
     * @param {string} arm - Study arm
     * @returns {Object} Collection schedule
     */
    getCollectionSchedule(arm) {
        const baseSchedule = {
            baseline: { day: 0, required: true },
            week1: { day: 7, required: true },
            week2: { day: 14, required: true },
            week4: { day: 28, required: true },
            week8: { day: 56, required: false },
            week12: { day: 84, required: true }
        };

        // Customize schedule based on arm
        if (this.protocol.armSchedules && this.protocol.armSchedules[arm]) {
            return { ...baseSchedule, ...this.protocol.armSchedules[arm] };
        }

        return baseSchedule;
    }

    /**
     * Withdraw participant from study
     * @param {string} participantId - Participant ID
     * @param {string} reason - Withdrawal reason
     * @returns {Promise<Object>} Withdrawal record
     */
    async withdrawParticipant(participantId, reason = 'participant_request') {
        const withdrawal = {
            participantId,
            studyId: this.studyId,
            withdrawnAt: new Date().toISOString(),
            reason,
            dataRetention: this.dataRetention.onWithdrawal || 'delete_all'
        };

        // Process withdrawal (backend call)
        await this.processWithdrawal(withdrawal);

        return withdrawal;
    }

    /**
     * Check if participant is due for data collection
     * @param {string} participantId - Participant ID
     * @param {Date} enrollmentDate - Enrollment date
     * @returns {Object} Collection status
     */
    isDueForCollection(participantId, enrollmentDate) {
        const daysInStudy = Math.floor(
            (Date.now() - new Date(enrollmentDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        const schedule = this.getCollectionSchedule(this.protocol.studyArm);
        const duePoints = [];

        for (const [name, point] of Object.entries(schedule)) {
            if (daysInStudy >= point.day && daysInStudy < point.day + 3) {
                duePoints.push({ name, day: point.day, required: point.required });
            }
        }

        return {
            isDue: duePoints.length > 0,
            duePoints,
            daysInStudy
        };
    }

    // Backend integration methods (to be implemented with actual API calls)

    async storeEnrollment(enrollment) {
        // TODO: Implement backend API call
        console.log('Storing enrollment:', enrollment);
        return enrollment;
    }

    async storeConsent(consent) {
        // TODO: Implement backend API call
        console.log('Storing consent:', consent);
        return consent;
    }

    async storeResearchData(data) {
        // TODO: Implement backend API call
        console.log('Storing research data:', data);
        return data;
    }

    async processWithdrawal(withdrawal) {
        // TODO: Implement backend API call
        console.log('Processing withdrawal:', withdrawal);
        return withdrawal;
    }
}

/**
 * Create a research study configuration
 * @param {Object} config - Study configuration
 * @returns {Object} Study config
 */
export const createStudyConfig = (config) => ({
    id: config.id || uuidv4(),
    title: config.title,
    description: config.description,
    protocol: {
        randomize: config.randomize || false,
        studyArms: config.studyArms || ['single'],
        armWeights: config.armWeights || null,
        armSchedules: config.armSchedules || null,
        duration: config.duration || 84, // days
        ...config.protocol
    },
    consentVersion: config.consentVersion || '1.0',
    dataRetention: {
        duration: config.dataRetention?.duration || 'indefinite',
        onWithdrawal: config.dataRetention?.onWithdrawal || 'delete_all',
        onCompletion: config.dataRetention?.onCompletion || 'retain_anonymized'
    },
    irbApprovalNumber: config.irbApprovalNumber || null,
    principalInvestigator: config.principalInvestigator || null,
    institution: config.institution || null
});

export default ResearchModeController;
