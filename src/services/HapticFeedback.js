/**
 * HapticFeedback.js
 * Vibration patterns for mobile and laptop haptic feedback
 */

export class HapticFeedback {
    static patterns = {
        // Pitch feedback
        pitchLow: [100, 50, 100], // Two short pulses
        pitchHigh: [200], // One long pulse
        pitchPerfect: [50], // Quick tap

        // Resonance feedback
        resonanceDark: [100, 100, 100, 100], // Rumble
        resonanceBright: [30, 30, 30], // Quick taps
        resonancePerfect: [50, 50], // Double tap

        // General feedback
        onTarget: [50], // Quick tap
        offTarget: [100, 50, 100], // Warning pattern

        // Strain and warnings
        strain: [500], // Long warning
        strainWarning: [200, 100, 200], // Urgent warning

        // Achievements and celebrations
        achievement: [50, 50, 50, 100, 200], // Celebration
        milestone: [100, 50, 100, 50, 100, 50, 300], // Big celebration
        targetHit: [30, 30, 100], // Success

        // Drift alerts
        driftAlert: [150, 100, 150], // Gentle reminder

        // Focus mode
        focusEnter: [50, 50], // Focus mode activated
        focusExit: [100], // Focus mode deactivated
    };

    static isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
    static enabled = true;
    static intensity = 1.0; // 0.0 to 1.0

    /**
     * Play a named haptic pattern
     * @param {string} patternName - Name of the pattern to play
     */
    static play(patternName) {
        if (!this.isSupported || !this.enabled) return;

        const pattern = this.patterns[patternName];
        if (!pattern) {
            console.warn(`Unknown haptic pattern: ${patternName}`);
            return;
        }

        // Apply intensity scaling
        const scaledPattern = this.scalePattern(pattern, this.intensity);

        try {
            navigator.vibrate(scaledPattern);
        } catch (e) {
            console.warn('Haptic feedback failed:', e);
        }
    }

    /**
     * Play a custom pattern
     * @param {Array<number>} pattern - Custom vibration pattern
     */
    static playCustom(pattern) {
        if (!this.isSupported || !this.enabled) return;

        const scaledPattern = this.scalePattern(pattern, this.intensity);

        try {
            navigator.vibrate(scaledPattern);
        } catch (e) {
            console.warn('Haptic feedback failed:', e);
        }
    }

    /**
     * Play proportional vibration based on deviation from target
     * @param {number} value - Current value
     * @param {number} min - Minimum acceptable value
     * @param {number} max - Maximum acceptable value
     */
    static playProportional(value, min, max) {
        if (!this.isSupported || !this.enabled) return;

        const center = (min + max) / 2;
        const range = (max - min) / 2;
        const deviation = Math.abs(value - center) / range;

        // Clamp deviation to 0-1
        const clampedDeviation = Math.max(0, Math.min(1, deviation));

        // Calculate duration: 50ms at center, up to 250ms at extremes
        const duration = Math.round(50 + clampedDeviation * 200);

        try {
            navigator.vibrate(duration * this.intensity);
        } catch (e) {
            console.warn('Haptic feedback failed:', e);
        }
    }

    /**
     * Play pitch deviation feedback
     * @param {number} currentPitch - Current pitch in Hz
     * @param {number} targetPitch - Target pitch in Hz
     * @param {number} tolerance - Acceptable deviation in Hz
     */
    static playPitchFeedback(currentPitch, targetPitch, tolerance = 20) {
        if (!this.isSupported || !this.enabled) return;

        const deviation = currentPitch - targetPitch;

        // On target
        if (Math.abs(deviation) < tolerance * 0.3) {
            this.play('pitchPerfect');
            return;
        }

        // Too low
        if (deviation < -tolerance) {
            this.play('pitchLow');
            return;
        }

        // Too high
        if (deviation > tolerance) {
            this.play('pitchHigh');
            return;
        }

        // Close to target - proportional feedback
        this.playProportional(currentPitch, targetPitch - tolerance, targetPitch + tolerance);
    }

    /**
     * Play resonance feedback
     * @param {number} currentResonance - Current resonance (0-1)
     * @param {number} targetResonance - Target resonance (0-1)
     * @param {number} tolerance - Acceptable deviation (0-1)
     */
    static playResonanceFeedback(currentResonance, targetResonance, tolerance = 0.15) {
        if (!this.isSupported || !this.enabled) return;

        const deviation = currentResonance - targetResonance;

        // On target
        if (Math.abs(deviation) < tolerance * 0.3) {
            this.play('resonancePerfect');
            return;
        }

        // Too dark
        if (deviation < -tolerance) {
            this.play('resonanceDark');
            return;
        }

        // Too bright
        if (deviation > tolerance) {
            this.play('resonanceBright');
            return;
        }

        // Close to target - proportional feedback
        this.playProportional(currentResonance, targetResonance - tolerance, targetResonance + tolerance);
    }

    /**
     * Scale pattern by intensity
     * @param {Array<number>} pattern - Original pattern
     * @param {number} intensity - Intensity multiplier (0-1)
     * @returns {Array<number>} Scaled pattern
     */
    static scalePattern(pattern, intensity) {
        return pattern.map(duration => Math.round(duration * intensity));
    }

    /**
     * Enable haptic feedback
     */
    static enable() {
        this.enabled = true;
        this.savePreferences();
    }

    /**
     * Disable haptic feedback
     */
    static disable() {
        this.enabled = false;
        this.savePreferences();
    }

    /**
     * Set haptic intensity
     * @param {number} intensity - Intensity level (0-1)
     */
    static setIntensity(intensity) {
        this.intensity = Math.max(0, Math.min(1, intensity));
        this.savePreferences();
    }

    /**
     * Stop all vibrations
     */
    static stop() {
        if (!this.isSupported) return;

        try {
            navigator.vibrate(0);
        } catch (e) {
            console.warn('Failed to stop haptic feedback:', e);
        }
    }

    /**
     * Test haptic feedback
     */
    static test() {
        if (!this.isSupported) {
            console.warn('Haptic feedback not supported on this device');
            return false;
        }

        this.play('achievement');
        return true;
    }

    /**
     * Save preferences to localStorage
     */
    static savePreferences() {
        try {
            localStorage.setItem('hapticPreferences', JSON.stringify({
                enabled: this.enabled,
                intensity: this.intensity
            }));
        } catch (e) {
            console.warn('Failed to save haptic preferences:', e);
        }
    }

    /**
     * Load preferences from localStorage
     */
    static loadPreferences() {
        try {
            const saved = localStorage.getItem('hapticPreferences');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.enabled = prefs.enabled !== undefined ? prefs.enabled : true;
                this.intensity = prefs.intensity !== undefined ? prefs.intensity : 1.0;
            }
        } catch (e) {
            console.warn('Failed to load haptic preferences:', e);
        }
    }
}

// Load preferences on module load
if (typeof window !== 'undefined') {
    HapticFeedback.loadPreferences();
}

export default HapticFeedback;
