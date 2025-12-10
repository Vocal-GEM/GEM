/**
 * Quad-Core Voice Analysis Service
 * Implements the "Quad-Core" architecture for voice analysis:
 * 1. Texture (Breathiness) - F3 Noise
 * 2. Health (Flow Phonation) - Spectral Tilt / Onset
 * 3. Color (Resonance) - F2 Frequency
 * 4. Mix (Registration) - Harmonic/Fundamental Ratio
 */
export class QuadCoreAnalysisService {
    constructor() {
        this.history = [];
        this.lastOnset = 0;
        this.isSpeaking = false;
    }

    /**
     * Analyze a single frame of audio data
     * @param {Object} data - Audio data from AudioEngine (pitch, tilt, f2, f3Noise, harmonicRatio)
     * @param {Object} targets - User targets (targetPitch, targetF2, etc.)
     * @returns {Object} Analysis results { scores, feedback }
     */
    analyze(data, targets) {
        if (!data || data.volume < 0.01) {
            this.isSpeaking = false;
            return null;
        }

        // Detect Onset (start of phonation)
        if (!this.isSpeaking && data.volume > 0.02) {
            this.isSpeaking = true;
            this.lastOnset = Date.now();
            // TODO: Analyze onset quality (hard vs soft) based on volume slope
        }

        const scores = {
            texture: this.evaluateTexture(data.f3Noise),
            health: this.evaluateHealth(data.tilt, data.volume),
            color: this.evaluateColor(data.f2, targets.targetF2),
            mix: this.evaluateMix(data.harmonicRatio)
        };

        const feedback = this.generateFeedback(scores);

        return {
            timestamp: Date.now(),
            scores,
            feedback
        };
    }

    /**
     * Module A: Texture (Breathiness)
     * Goal: Detect gender-affirming softness (slight breathiness) vs pressed or whispery.
     * Input: F3 Band Noise (dB)
     */
    evaluateTexture(f3Noise) {
        // Approximate thresholds (dB)
        // -80dB: Very clear/dead silence
        // -60dB to -50dB: Slight Breathiness (Target)
        // > -40dB: Turbulent/Whispery

        let score = 0; // 0=Modal/Pressed, 1=Target, 2=Excessive
        let label = 'Clear';

        if (f3Noise > -45) {
            score = 2; // Excessive
            label = 'Whispery';
        } else if (f3Noise > -65) {
            score = 1; // Target
            label = 'Soft';
        } else {
            score = 0; // Modal
            label = 'Pressed/Clear';
        }

        return { score, label, value: f3Noise };
    }

    /**
     * Module B: Health (Flow Phonation)
     * Goal: Prevent strain.
     * Input: Spectral Tilt (dB/octave estimate)
     */
    evaluateHealth(tilt, volume) {
        // Tilt > -6: Shallow (High high-freq energy) -> Pressed/Bright
        // Tilt < -18: Steep (Low high-freq energy) -> Breathy/Hollow
        // Target: -10 to -15 (Balanced)

        let status = 'Flow'; // Green
        let val = 'Balanced';

        if (tilt > -8) {
            status = 'Pressed'; // Red
            val = 'Strained';
        } else if (tilt < -20) {
            status = 'Breathy'; // Red
            val = 'Weak';
        }

        return { status, label: val, value: tilt };
    }

    /**
     * Module C: Color (Resonance)
     * Goal: Gender brightness.
     * Input: F2 (Hz)
     */
    evaluateColor(f2, targetF2) {
        // Percentage Brightness relative to target
        if (!f2 || !targetF2) return { percentage: 50, label: 'Neutral' };

        // Normalize: <1000Hz (Dark) ... 2500Hz (Bright)
        // If target is 2000Hz (Fem), and user is 1500Hz, they are 75% there?
        // Let's use simpler logic: Deviation from target.

        const diff = f2 - targetF2;
        let percentage = 0;
        let label = 'Neutral';

        if (Math.abs(diff) < 200) {
            percentage = 100;
            label = 'On Target';
        } else if (diff < -200) {
            percentage = Math.max(0, 100 + (diff / 5)); // Drop off
            label = 'Dark';
        } else {
            percentage = Math.max(0, 100 - (diff / 5));
            label = 'Too Bright';
        }

        return { percentage, label, value: f2 };
    }

    /**
     * Module D: Mix (Registration)
     * Goal: Smooth continuity.
     * Input: Harmonic/Fundamental Ratio
     */
    evaluateMix(ratio) {
        // Ratio > 2.0: Harmonic Dominant (Chest/M1)
        // Ratio < 0.5: Fundamental Dominant (Falsetto/M2)
        // 0.5 - 2.0: Mix

        let mixPct = 50; // 50 = Balanced Mix
        let label = 'Mix';

        if (ratio > 2.0) {
            mixPct = 100; // Chest
            label = 'Chest (M1)';
        } else if (ratio < 0.5) {
            mixPct = 0; // Head
            label = 'Head (M2)';
        } else {
            // Linear interpolate between 0.5 and 2.0
            // 0.5 -> 0%, 2.0 -> 100%
            // Normalized: (ratio - 0.5) / 1.5
            mixPct = Math.round(((ratio - 0.5) / 1.5) * 100);
            label = 'Mix';
        }

        return { percentage: mixPct, label, value: ratio };
    }

    /**
     * Synthesis & User Feedback
     * Generates actionable advice based on the combination of modules.
     */
    generateFeedback(scores) {
        // Scenario 1: The "Strain" Trap
        // Pressed (Health=Pressed) + High Brightness (Color > 80%) + Chest Dominant (Mix > 80%)
        if (scores.health.status === 'Pressed' && scores.mix.percentage > 70) {
            return {
                type: 'warning',
                title: 'Strain Detected',
                message: "You are hitting the pitch, but you are **squeezing**. Try to add a little 'softness' to release the tension."
            };
        }

        // Scenario 2: The "Hollow" Trap
        // Good Texture (Soft) + Flow + Dark (Color < 40%)
        if (scores.texture.label === 'Soft' && scores.health.status === 'Flow' && scores.color.label === 'Dark') {
            return {
                type: 'info',
                title: 'Hollow Tone',
                message: "Great flow and softness! But the tone is a bit dark. Try to **smile slightly** or think of the 'ee' sound."
            };
        }

        // Scenario 3: The "Goldilocks" Result
        // Soft + Flow + On-Target Color + Mix
        if (scores.texture.label === 'Soft' && scores.health.status === 'Flow') {
            // Broad success bucket
            if (scores.color.percentage > 70) {
                return {
                    type: 'success',
                    title: 'Perfect!',
                    message: "This is a healthy, feminine, and resonant tone."
                };
            }
        }

        // Default: Specific corrections
        if (scores.mix.percentage < 20) return { type: 'info', message: "Very light/falsetto. Try to add a bit more vocal weight for a stronger mix." };
        if (scores.mix.percentage > 90) return { type: 'warning', message: "Heavy chest resonance. Try to lighten the weight." };

        return { type: 'neutral', message: "Listening..." };
    }
}
