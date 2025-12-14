/**
 * LiveCoachingService.js
 * 
 * Real-time voice coaching with pattern detection and contextual messages.
 * Analyzes voice patterns over time and provides timely, relevant feedback.
 */

import { VoiceCalibrationService } from './VoiceCalibrationService';

const FEEDBACK_COOLDOWN_MS = 10000; // 10 seconds between same-type feedback

// Coaching messages organized by type and severity
const COACHING_MESSAGES = {
    pitch: {
        tooLow: [
            { message: "Try lifting your pitch just a bit", tip: "Think 'hmm?' as a question" },
            { message: "Your pitch dropped a little", tip: "Imagine speaking to a child" },
            { message: "Bring it up slightly", tip: "Start from your 'morning voice' anchor" }
        ],
        tooHigh: [
            { message: "Ease back a bit on the pitch", tip: "Find your sustainable sweet spot" },
            { message: "That's quite high - find your comfort zone", tip: "Strain leads to fatigue" },
            { message: "Lower just slightly for sustainability", tip: "Practice makes consistent" }
        ],
        inRange: [
            { message: "Perfect pitch placement! 🎯", tip: "Remember how this feels" },
            { message: "You're hitting your target!", tip: "Keep that up!" },
            { message: "Great work on your pitch!", tip: "This is your zone" }
        ],
        unstable: [
            { message: "Try to steady your pitch", tip: "Breath support helps consistency" },
            { message: "Your pitch is jumping around", tip: "Focus on one note at a time" }
        ]
    },
    resonance: {
        dark: [
            { message: "Bring your resonance forward", tip: "Think 'ng' humming in your face" },
            { message: "More brightness needed", tip: "Smile slightly while speaking" },
            { message: "Your voice sounds a bit back", tip: "Imagine the sound on your lips" }
        ],
        bright: [
            { message: "Excellent forward resonance! ✨", tip: "You're getting that feminine placement" },
            { message: "Nice bright tone", tip: "This is the forward focus you want" }
        ]
    },
    weight: {
        tooHeavy: [
            { message: "Try lightening your voice", tip: "Less pressure, more air" },
            { message: "Your voice sounds weighty", tip: "Think of a gentle sigh" },
            { message: "Ease off the vocal weight", tip: "Softer is often more feminine" }
        ],
        tooLight: [
            { message: "Add a little more body", tip: "Don't go too breathy" },
            { message: "A bit more support needed", tip: "Find the balance" }
        ],
        balanced: [
            { message: "Great vocal weight!", tip: "You found the sweet spot" }
        ]
    },
    strain: {
        detected: [
            { message: "⚠️ I'm hearing some strain", tip: "Take a breath, reset gently" },
            { message: "Your voice sounds tight", tip: "Do a quick lip trill to relax" },
            { message: "Ease up - protect your voice", tip: "Strain now = fatigue later" }
        ],
        healthy: [
            { message: "Your voice sounds healthy 💚", tip: "Good phonation quality" }
        ]
    },
    encouragement: [
        { message: "You're doing great! Keep going 💪", tip: null },
        { message: "Nice work! Every session matters", tip: null },
        { message: "Great practice session!", tip: null },
        { message: "You're making progress! 🌟", tip: null }
    ]
};

class LiveCoachingServiceClass {
    constructor() {
        this.lastFeedbackTime = {};
        this.patternHistory = [];
        this.sessionStartTime = null;
        this.feedbackCount = 0;
    }

    /**
     * Start a coaching session
     */
    startSession() {
        this.sessionStartTime = Date.now();
        this.feedbackCount = 0;
        this.patternHistory = [];
        this.lastFeedbackTime = {};
    }

    /**
     * End session and return summary
     */
    endSession() {
        const duration = Date.now() - this.sessionStartTime;
        const summary = {
            durationMs: duration,
            feedbackGiven: this.feedbackCount,
            patterns: this.analyzePatterns()
        };
        this.sessionStartTime = null;
        return summary;
    }

    /**
     * Analyze voice metrics and provide real-time coaching
     * @param {Object} metrics - Current voice metrics { pitch, resonance, weight, tilt }
     * @param {Object} targets - User's target ranges
     * @returns {Object|null} Coaching message or null if on cooldown
     */
    getRealtimeFeedback(metrics, targets = {}) {
        if (!this.sessionStartTime) {
            this.startSession();
        }

        const now = Date.now();
        const feedback = [];

        // Store pattern for trend analysis
        this.patternHistory.push({
            timestamp: now,
            ...metrics
        });

        // Keep only last 60 seconds of data
        const cutoff = now - 60000;
        this.patternHistory = this.patternHistory.filter(p => p.timestamp > cutoff);

        // Check pitch
        if (metrics.pitch > 0) {
            const pitchFeedback = this.analyzePitch(metrics.pitch, targets.pitch, now);
            if (pitchFeedback) feedback.push(pitchFeedback);
        }

        // Check resonance
        if (metrics.resonance !== undefined) {
            const resFeedback = this.analyzeResonance(metrics.resonance, now);
            if (resFeedback) feedback.push(resFeedback);
        }

        // Check weight
        if (metrics.weight !== undefined) {
            const weightFeedback = this.analyzeWeight(metrics.weight, now);
            if (weightFeedback) feedback.push(weightFeedback);
        }

        // Check for strain (based on tilt)
        if (metrics.tilt !== undefined) {
            const strainFeedback = this.analyzeStrain(metrics.tilt, now);
            if (strainFeedback) feedback.push(strainFeedback);
        }

        // Occasional encouragement (every 2 minutes if doing well)
        if (this.shouldEncourage(now)) {
            feedback.push(this.getEncouragement());
        }

        // Return highest priority feedback (if any)
        if (feedback.length > 0) {
            this.feedbackCount++;
            return this.prioritizeFeedback(feedback);
        }

        return null;
    }

    analyzePitch(pitch, target = { min: 160, max: 260 }, now) {
        const key = 'pitch';

        if (this.isOnCooldown(key, now)) return null;

        // Check for pitch instability
        const recentPitches = this.patternHistory
            .filter(p => p.timestamp > now - 5000 && p.pitch > 0)
            .map(p => p.pitch);

        if (recentPitches.length >= 10) {
            const variance = this.calculateVariance(recentPitches);
            if (variance > 400) { // High variance = unstable
                this.markFeedback(key, now);
                return this.getRandomMessage('pitch', 'unstable', 'warning');
            }
        }

        if (pitch < target.min) {
            this.markFeedback(key, now);
            return this.getRandomMessage('pitch', 'tooLow', 'suggestion');
        }

        if (pitch > target.max) {
            this.markFeedback(key, now);
            return this.getRandomMessage('pitch', 'tooHigh', 'suggestion');
        }

        // Only praise occasionally when in range
        if (Math.random() < 0.1 && !this.isOnCooldown('pitch_praise', now)) {
            this.markFeedback('pitch_praise', now);
            return this.getRandomMessage('pitch', 'inRange', 'praise');
        }

        return null;
    }

    analyzeResonance(resonance, now) {
        const key = 'resonance';
        if (this.isOnCooldown(key, now)) return null;

        if (resonance < 40) {
            this.markFeedback(key, now);
            return this.getRandomMessage('resonance', 'dark', 'suggestion');
        }

        if (resonance > 65 && Math.random() < 0.15) {
            this.markFeedback(key + '_praise', now);
            return this.getRandomMessage('resonance', 'bright', 'praise');
        }

        return null;
    }

    analyzeWeight(weight, now) {
        const key = 'weight';
        if (this.isOnCooldown(key, now)) return null;

        if (weight > 70) {
            this.markFeedback(key, now);
            return this.getRandomMessage('weight', 'tooHeavy', 'suggestion');
        }

        if (weight < 25) {
            this.markFeedback(key, now);
            return this.getRandomMessage('weight', 'tooLight', 'tip');
        }

        return null;
    }

    analyzeStrain(tilt, now) {
        const key = 'strain';
        if (this.isOnCooldown(key, now)) return null;

        // Tilt closer to 0 = pressed/strained
        if (tilt > -4) {
            this.markFeedback(key, now);
            return this.getRandomMessage('strain', 'detected', 'warning');
        }

        return null;
    }

    shouldEncourage(now) {
        const key = 'encouragement';
        const lastEncouragement = this.lastFeedbackTime[key] || 0;
        const timeSinceStart = now - this.sessionStartTime;

        // Encourage every 2 minutes, starting after 1 minute
        if (timeSinceStart > 60000 && now - lastEncouragement > 120000) {
            this.markFeedback(key, now);
            return true;
        }
        return false;
    }

    getEncouragement() {
        const messages = COACHING_MESSAGES.encouragement;
        const msg = messages[Math.floor(Math.random() * messages.length)];
        return {
            type: 'encouragement',
            severity: 'praise',
            ...msg
        };
    }

    getRandomMessage(category, subtype, severity) {
        const messages = COACHING_MESSAGES[category]?.[subtype] || [];
        if (messages.length === 0) return null;

        const msg = messages[Math.floor(Math.random() * messages.length)];
        return {
            type: category,
            severity,
            ...msg
        };
    }

    isOnCooldown(key, now) {
        return (now - (this.lastFeedbackTime[key] || 0)) < FEEDBACK_COOLDOWN_MS;
    }

    markFeedback(key, now) {
        this.lastFeedbackTime[key] = now;
    }

    prioritizeFeedback(feedbackList) {
        // Priority: warning > suggestion > tip > praise
        const priority = { warning: 4, suggestion: 3, tip: 2, praise: 1 };
        return feedbackList.sort((a, b) =>
            (priority[b.severity] || 0) - (priority[a.severity] || 0)
        )[0];
    }

    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    analyzePatterns() {
        if (this.patternHistory.length < 10) return null;

        const pitches = this.patternHistory.filter(p => p.pitch > 0).map(p => p.pitch);
        const avgPitch = pitches.length > 0
            ? pitches.reduce((a, b) => a + b, 0) / pitches.length
            : 0;

        const resonances = this.patternHistory.filter(p => p.resonance).map(p => p.resonance);
        const avgResonance = resonances.length > 0
            ? resonances.reduce((a, b) => a + b, 0) / resonances.length
            : 0;

        return {
            avgPitch: Math.round(avgPitch),
            pitchStability: 100 - Math.min(100, this.calculateVariance(pitches) / 10),
            avgResonance: Math.round(avgResonance)
        };
    }
}

export const LiveCoachingService = new LiveCoachingServiceClass();
export default LiveCoachingService;
