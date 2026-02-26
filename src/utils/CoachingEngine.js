export class CoachingEngine {
    constructor(config = {}) {
        this.config = {
            cooldownMs: 4000,
            stabilityThreshold: 3.0, // Hz variance
            driftThreshold: 2.0, // Semitones
            silenceThreshold: 5000, // ms
            ...config
        };

        this.state = {
            lastPromptTime: 0,
            history: [],
            lastPitch: 0,
            silenceStart: Date.now(),
            currentPhraseStartPitch: null,
            isVoiced: false
        };

        this.rules = [
            this.checkStability.bind(this),
            this.checkResonance.bind(this),
            this.checkDrift.bind(this),
            this.checkSilence.bind(this)
        ];
    }

    process(data) {
        const now = Date.now();
        const { pitch, resonance, volume } = data;
        const isVoiced = pitch > 50 && volume > 0.01;

        // Update History
        if (isVoiced) {
            this.state.history.push({ pitch, resonance, time: now });
            if (this.state.history.length > 50) this.state.history.shift(); // Keep last ~1-2s
            this.state.silenceStart = null;

            if (!this.state.isVoiced) {
                // Phrase start
                this.state.currentPhraseStartPitch = pitch;
            }
        } else {
            if (this.state.isVoiced) {
                // Phrase end
                this.state.currentPhraseStartPitch = null;
                this.state.history = []; // Clear history on silence? Or keep for a bit?
            }
            if (!this.state.silenceStart) this.state.silenceStart = now;
        }
        this.state.isVoiced = isVoiced;
        this.state.lastPitch = pitch;

        // Check Cooldown
        if (now - this.state.lastPromptTime < this.config.cooldownMs) {
            return null;
        }

        // Evaluate Rules
        for (const rule of this.rules) {
            const prompt = rule(data, now);
            if (prompt) {
                this.state.lastPromptTime = now;
                return prompt;
            }
        }

        return null;
    }

    checkStability(data, now) {
        if (!this.state.isVoiced || this.state.history.length < 20) return null;

        // Calculate variance of last 20 frames
        const recent = this.state.history.slice(-20);
        const pitches = recent.map(h => h.pitch);
        const avg = pitches.reduce((a, b) => a + b, 0) / pitches.length;
        const variance = pitches.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / pitches.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev < this.config.stabilityThreshold) {
            // Only trigger if we haven't praised stability recently? 
            // The main cooldown handles general spam, but maybe we want specific cooldowns.
            // For now, simple return.
            return { type: 'success', message: "Great stability! Keep it steady." };
        }
        return null;
    }

    checkResonance(data, now) {
        if (!this.state.isVoiced || this.state.history.length < 10) return null;

        // Simple heuristic: if pitch is stable but resonance is low (e.g. < 1000Hz for fem voice? Need context)
        // For now, let's just look for very low resonance if pitch is high (strain risk)
        // Or generic "Try raising resonance" if it's stable but low.

        // Let's assume a target range exists, but we don't have it here yet. 
        // We'll use a generic check for now.
        if (data.pitch > 160 && data.resonance < 800) {
            return { type: 'info', message: "Pitch is good, try brightening the resonance." };
        }
        return null;
    }

    checkDrift(data, now) {
        if (!this.state.isVoiced || !this.state.currentPhraseStartPitch) return null;

        const startPitch = this.state.currentPhraseStartPitch;
        const currentPitch = data.pitch;

        // hz to semitones
        const semitoneDiff = 12 * Math.log2(currentPitch / startPitch);

        if (Math.abs(semitoneDiff) > this.config.driftThreshold) {
            return { type: 'warning', message: `Pitch drifting ${semitoneDiff > 0 ? 'up' : 'down'}. Try to hold steady.` };
        }
        return null;
    }

    checkSilence(data, now) {
        if (this.state.isVoiced || !this.state.silenceStart) return null;

        const duration = now - this.state.silenceStart;
        if (duration > this.config.silenceThreshold && duration < this.config.silenceThreshold + 1000) {
            // Only trigger once when crossing the threshold
            return { type: 'neutral', message: "Ready when you are! Take a deep breath." };
        }
        return null;
    }
}
