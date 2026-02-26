/**
 * TrendAnalyzer.js
 * 
 * enhanced statistical analysis service for measuring vocal progress over time.
 * capabilities:
 * - linear regression for trend detection
 * - r-squared calculation for confidence
 * - plateau detection using sliding windows
 * - consistency scoring
 * - practice pattern analysis
 */

export class TrendAnalyzer {
    /**
     * analyze progress over a specified timeframe
     * @param {Array} sessions - array of session objects
     * @param {string} timeframe - 'week', 'month', 'quarter', 'year', 'all'
     * @returns {Object} comprehensive analysis
     */
    analyzeProgress(sessions, timeframe = 'month') {
        if (!sessions || sessions.length === 0) {
            return {
                pitch: null,
                resonance: null,
                consistency: 0,
                practiceVolume: null
            };
        }

        // sort sessions by date
        const sortedSessions = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));

        // filter by timeframe if needed (omitted for brevity, assume pre-filtered or handled)

        // group data points
        const values = {
            pitch: sortedSessions.map(s => s.avgPitch).filter(v => v != null),
            resonance: sortedSessions.map(s => s.avgResonance).filter(v => v != null),
            dates: sortedSessions.map(s => new Date(s.date))
        };

        return {
            pitch: this.analyzeTrend(values.pitch),
            resonance: this.analyzeTrend(values.resonance),
            consistency: this.analyzeConsistency(sortedSessions),
            plateau: this.detectPlateau(values.pitch), // primary metric for plateau usually pitch
            practiceVolume: this.analyzePracticePatterns(sortedSessions)
        };
    }

    /**
     * perform linear regression and trend analysis on a dataset
     * @param {Array<number>} values 
     * @returns {Object} trend data
     */
    analyzeTrend(values) {
        if (!values || values.length < 2) {
            return {
                direction: 'stable',
                rateOfChange: 0,
                confidence: 0,
                prediction: null
            };
        }

        const n = values.length;
        // x values are just indices 0 to n-1 for simple linear regression over time
        // using indices assumes uniform spacing, which might not be true, but is a decent approximation for "sessions over time"
        const xMean = (n - 1) / 2;
        const yMean = values.reduce((a, b) => a + b, 0) / n;

        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < n; i++) {
            numerator += (i - xMean) * (values[i] - yMean);
            denominator += (i - xMean) ** 2;
        }

        const slope = denominator === 0 ? 0 : numerator / denominator;
        const intercept = yMean - (slope * xMean);

        const rSquared = this.calculateRSquared(values, slope, intercept);

        return {
            direction: slope > 0.5 ? 'improving' : slope < -0.5 ? 'declining' : 'stable', // threshold depends on metric
            rateOfChange: slope,
            confidence: rSquared,
            prediction: {
                nextSession: intercept + slope * n,
                next10Sessions: intercept + slope * (n + 10)
            }
        };
    }

    /**
     * calculate r-squared value for goodness of fit
     */
    calculateRSquared(values, slope, intercept) {
        const n = values.length;
        const yMean = values.reduce((a, b) => a + b, 0) / n;

        let ssTot = 0; // total sum of squares
        let ssRes = 0; // residual sum of squares

        for (let i = 0; i < n; i++) {
            const yPred = intercept + slope * i;
            ssTot += (values[i] - yMean) ** 2;
            ssRes += (values[i] - yPred) ** 2;
        }

        if (ssTot === 0) return 1; // perfect fit (all values same)
        return 1 - (ssRes / ssTot);
    }

    /**
     * analyze consistency based on variance across sessions
     */
    analyzeConsistency(sessions) {
        if (sessions.length < 3) return 50; // default medium consistency

        // calculate variance in session duration and frequency
        // for this example, we'll look at pitch stability across sessions
        const pitches = sessions.map(s => s.avgPitch).filter(p => p != null);
        if (pitches.length < 2) return 50;

        const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
        const variance = pitches.reduce((a, b) => a + (b - mean) ** 2, 0) / pitches.length;
        const stdDev = Math.sqrt(variance);

        // coefficient of variation (cv) = stdDev / mean
        // lower cv means higher consistency
        // map cv to 0-100 score. assume cv > 0.2 is bad (0 score), cv < 0.01 is perfect (100 score)

        const cv = mean === 0 ? 0 : stdDev / mean;
        const score = Math.max(0, Math.min(100, 100 * (1 - (cv - 0.01) / 0.19)));

        // simpler normalization if needed:
        // consistency is high if you hit the same targets. 
        // real consistency might better be measured by "distance from target" variance.

        return Math.round(score);
    }

    /**
     * detect performance plateaus
     */
    detectPlateau(values, threshold = 0.02) {
        if (!values || values.length < 8) return { detected: false };

        const recent = values.slice(-8); // last 8 sessions
        const range = Math.max(...recent) - Math.min(...recent);
        const avgValue = recent.reduce((a, b) => a + b, 0) / recent.length;

        // if variation is very small over last 8 sessions, it's a plateau
        // absolute growth check: compare first vs last of recent
        const growth = Math.abs(recent[recent.length - 1] - recent[0]) / Math.abs(recent[0]);

        const isPlateau = (range / avgValue) < threshold && growth < threshold;

        if (isPlateau) {
            return {
                detected: true,
                duration: recent.length, // at least 8 sessions
                suggestions: this.getPlateauBreakers()
            };
        }

        return { detected: false };
    }

    getPlateauBreakers() {
        return [
            "Try a different exercise modality (e.g., switch from scales to reading)",
            "Increase session intensity with focused 5-minute drills",
            "Take 2-3 rest days then return with fresh ears",
            "Record yourself in a new context (e.g., phone call simulation)",
            "Book a session with a voice coach for professional feedback"
        ];
    }

    analyzePracticePatterns(sessions) {
        // simple frequency analysis
        const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const count = sessions.length;

        return {
            totalDurationMinutes: Math.round(totalDuration / 60),
            sessionCount: count,
            avgDurationMinutes: count ? Math.round((totalDuration / 60) / count) : 0
        };
    }
}
