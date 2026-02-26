/**
 * PatternRecognition.js
 * Detect vocal techniques and patterns from audio analysis
 */

export class PatternRecognizer {
    constructor() {
        this.pitchHistory = [];
        this.resonanceHistory = [];
        this.maxHistoryLength = 50; // ~2.5 seconds at 20fps

        this.currentPattern = null;
        this.patternConfidence = 0;
    }

    /**
     * Update with new audio analysis data
     * @param {Object} data - { pitch, resonance, timestamp }
     */
    update(data) {
        // Add to history
        this.pitchHistory.push({
            value: data.pitch,
            timestamp: data.timestamp || Date.now()
        });

        this.resonanceHistory.push({
            value: data.resonance,
            timestamp: data.timestamp || Date.now()
        });

        // Trim history
        if (this.pitchHistory.length > this.maxHistoryLength) {
            this.pitchHistory.shift();
        }
        if (this.resonanceHistory.length > this.maxHistoryLength) {
            this.resonanceHistory.shift();
        }

        // Detect patterns
        this.detectPatterns();
    }

    /**
     * Detect patterns in recent history
     */
    detectPatterns() {
        if (this.pitchHistory.length < 10) {
            this.currentPattern = null;
            return;
        }

        // Check for various patterns
        const patterns = [
            this.detectSiren(),
            this.detectSlide(),
            this.detectSustainedNote(),
            this.detectResonanceShift(),
            this.detectVibrato(),
            this.detectPitchGlide()
        ];

        // Find pattern with highest confidence
        const bestPattern = patterns.reduce((best, current) =>
            current.confidence > best.confidence ? current : best
        );

        if (bestPattern.confidence > 0.5) {
            this.currentPattern = bestPattern.type;
            this.patternConfidence = bestPattern.confidence;
        } else {
            this.currentPattern = null;
            this.patternConfidence = 0;
        }
    }

    /**
     * Detect siren pattern (continuous pitch glide up and down)
     */
    detectSiren() {
        const pitches = this.pitchHistory.map(h => h.value).filter(p => p !== null);
        if (pitches.length < 20) return { type: 'siren', confidence: 0 };

        // Calculate pitch changes
        const changes = [];
        for (let i = 1; i < pitches.length; i++) {
            changes.push(pitches[i] - pitches[i - 1]);
        }

        // Look for direction changes (peaks and valleys)
        let directionChanges = 0;
        for (let i = 1; i < changes.length; i++) {
            if (Math.sign(changes[i]) !== Math.sign(changes[i - 1])) {
                directionChanges++;
            }
        }

        // Siren has multiple direction changes and large range
        const range = Math.max(...pitches) - Math.min(...pitches);
        const hasLargeRange = range > 100; // More than 100 Hz range
        const hasMultipleChanges = directionChanges >= 2;

        const confidence = hasLargeRange && hasMultipleChanges ?
            Math.min(1, (directionChanges / 4) * (range / 200)) : 0;

        return { type: 'siren', confidence };
    }

    /**
     * Detect slide pattern (discrete pitch steps)
     */
    detectSlide() {
        const pitches = this.pitchHistory.map(h => h.value).filter(p => p !== null);
        if (pitches.length < 15) return { type: 'slide', confidence: 0 };

        // Look for plateaus followed by jumps
        const segments = this.findStableSegments(pitches, 5); // 5 Hz tolerance

        if (segments.length < 2) return { type: 'slide', confidence: 0 };

        // Check if segments have different pitch levels
        const avgPitches = segments.map(seg =>
            seg.reduce((sum, p) => sum + p, 0) / seg.length
        );

        let hasJumps = false;
        for (let i = 1; i < avgPitches.length; i++) {
            if (Math.abs(avgPitches[i] - avgPitches[i - 1]) > 20) {
                hasJumps = true;
                break;
            }
        }

        const confidence = hasJumps ? Math.min(1, segments.length / 4) : 0;

        return { type: 'slide', confidence };
    }

    /**
     * Detect sustained note (stable pitch)
     */
    detectSustainedNote() {
        const pitches = this.pitchHistory.map(h => h.value).filter(p => p !== null);
        if (pitches.length < 10) return { type: 'sustained', confidence: 0 };

        // Calculate standard deviation
        const mean = pitches.reduce((sum, p) => sum + p, 0) / pitches.length;
        const variance = pitches.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / pitches.length;
        const stdDev = Math.sqrt(variance);

        // Sustained note has low standard deviation
        const isStable = stdDev < 10; // Less than 10 Hz variation
        const confidence = isStable ? Math.max(0, 1 - stdDev / 10) : 0;

        return { type: 'sustained', confidence };
    }

    /**
     * Detect resonance shift
     */
    detectResonanceShift() {
        const resonances = this.resonanceHistory.map(h => h.value).filter(r => r !== null);
        if (resonances.length < 15) return { type: 'resonance_shift', confidence: 0 };

        // Look for significant change in resonance
        const firstHalf = resonances.slice(0, Math.floor(resonances.length / 2));
        const secondHalf = resonances.slice(Math.floor(resonances.length / 2));

        const avgFirst = firstHalf.reduce((sum, r) => sum + r, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((sum, r) => sum + r, 0) / secondHalf.length;

        const shift = Math.abs(avgSecond - avgFirst);
        const hasShift = shift > 0.15; // More than 0.15 change

        const confidence = hasShift ? Math.min(1, shift / 0.3) : 0;

        return { type: 'resonance_shift', confidence };
    }

    /**
     * Detect vibrato (regular pitch oscillation)
     */
    detectVibrato() {
        const pitches = this.pitchHistory.map(h => h.value).filter(p => p !== null);
        if (pitches.length < 20) return { type: 'vibrato', confidence: 0 };

        // Calculate autocorrelation to find periodicity
        const autocorr = this.calculateAutocorrelation(pitches);

        // Look for peak in autocorrelation (indicating periodicity)
        let maxCorr = 0;
        let peakLag = 0;

        for (let lag = 3; lag < Math.min(10, autocorr.length); lag++) {
            if (autocorr[lag] > maxCorr) {
                maxCorr = autocorr[lag];
                peakLag = lag;
            }
        }

        // Vibrato typically has 5-7 Hz rate, which is ~3-4 samples at 20fps
        const hasVibrato = maxCorr > 0.5 && peakLag >= 3 && peakLag <= 7;
        const confidence = hasVibrato ? maxCorr : 0;

        return { type: 'vibrato', confidence };
    }

    /**
     * Detect pitch glide (smooth continuous pitch change)
     */
    detectPitchGlide() {
        const pitches = this.pitchHistory.map(h => h.value).filter(p => p !== null);
        if (pitches.length < 15) return { type: 'glide', confidence: 0 };

        // Calculate pitch changes
        const changes = [];
        for (let i = 1; i < pitches.length; i++) {
            changes.push(pitches[i] - pitches[i - 1]);
        }

        // Glide has consistent direction and smooth changes
        const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
        const isConsistent = changes.every(c => Math.sign(c) === Math.sign(avgChange) || Math.abs(c) < 2);
        const hasMovement = Math.abs(avgChange) > 1; // At least 1 Hz per frame

        const confidence = isConsistent && hasMovement ?
            Math.min(1, Math.abs(avgChange) / 5) : 0;

        return { type: 'glide', confidence };
    }

    /**
     * Find stable segments in pitch data
     */
    findStableSegments(pitches, tolerance) {
        const segments = [];
        let currentSegment = [pitches[0]];

        for (let i = 1; i < pitches.length; i++) {
            if (Math.abs(pitches[i] - currentSegment[currentSegment.length - 1]) < tolerance) {
                currentSegment.push(pitches[i]);
            } else {
                if (currentSegment.length >= 3) {
                    segments.push(currentSegment);
                }
                currentSegment = [pitches[i]];
            }
        }

        if (currentSegment.length >= 3) {
            segments.push(currentSegment);
        }

        return segments;
    }

    /**
     * Calculate autocorrelation
     */
    calculateAutocorrelation(data) {
        const mean = data.reduce((sum, v) => sum + v, 0) / data.length;
        const centered = data.map(v => v - mean);

        const autocorr = [];
        for (let lag = 0; lag < Math.min(data.length / 2, 20); lag++) {
            let sum = 0;
            for (let i = 0; i < data.length - lag; i++) {
                sum += centered[i] * centered[i + lag];
            }
            autocorr.push(sum / (data.length - lag));
        }

        // Normalize
        const max = autocorr[0];
        return autocorr.map(v => v / max);
    }

    /**
     * Get current pattern
     */
    getCurrentPattern() {
        return {
            pattern: this.currentPattern,
            confidence: this.patternConfidence
        };
    }

    /**
     * Get context-aware feedback based on detected pattern
     */
    getContextualFeedback(metrics) {
        if (!this.currentPattern) {
            return null;
        }

        switch (this.currentPattern) {
            case 'siren':
                return {
                    type: 'technique',
                    message: 'Great siren exercise! Try to keep the glide smooth and even.',
                    icon: '🌊'
                };

            case 'slide':
                return {
                    type: 'technique',
                    message: 'Nice pitch slides! Focus on clean transitions between notes.',
                    icon: '🎵'
                };

            case 'sustained':
                return {
                    type: 'technique',
                    message: 'Excellent sustained note! Work on maintaining consistent resonance.',
                    icon: '🎯'
                };

            case 'resonance_shift':
                return {
                    type: 'technique',
                    message: 'Good resonance control! Practice making the shift even smoother.',
                    icon: '✨'
                };

            case 'vibrato':
                return {
                    type: 'technique',
                    message: 'Nice vibrato! Keep the oscillation regular and controlled.',
                    icon: '〰️'
                };

            case 'glide':
                return {
                    type: 'technique',
                    message: 'Smooth pitch glide! Try varying the speed for more control.',
                    icon: '📈'
                };

            default:
                return null;
        }
    }

    /**
     * Reset pattern history
     */
    reset() {
        this.pitchHistory = [];
        this.resonanceHistory = [];
        this.currentPattern = null;
        this.patternConfidence = 0;
    }
}

export default PatternRecognizer;
