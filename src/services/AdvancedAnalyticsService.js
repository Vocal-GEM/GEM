/**
 * AnalyticsService - Advanced voice analytics and formant tracking
 */

const FORMANT_HISTORY_KEY = 'gem_formant_history';

/**
 * Get formant history data
 */
export const getFormantHistory = () => {
    try {
        const stored = localStorage.getItem(FORMANT_HISTORY_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('AnalyticsService: Failed to load formant history', e);
    }
    return [];
};

/**
 * Save formant reading
 */
export const saveFormantReading = (reading) => {
    const history = getFormantHistory();

    const entry = {
        id: `formant_${Date.now()}`,
        timestamp: new Date().toISOString(),
        f1: reading.f1 || 0,
        f2: reading.f2 || 0,
        f3: reading.f3 || 0,
        pitch: reading.pitch || 0
    };

    history.push(entry);

    // Keep last 100 readings
    if (history.length > 100) {
        history.shift();
    }

    localStorage.setItem(FORMANT_HISTORY_KEY, JSON.stringify(history));
    return entry;
};

/**
 * Get formant trends (daily averages over last 30 days)
 */
export const getFormantTrends = () => {
    const history = getFormantHistory();
    const last30Days = {};

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    history.forEach(entry => {
        const date = new Date(entry.timestamp);
        if (date >= cutoff) {
            const dateStr = date.toISOString().split('T')[0];
            if (!last30Days[dateStr]) {
                last30Days[dateStr] = { f1: [], f2: [], f3: [], pitch: [], count: 0 };
            }
            last30Days[dateStr].f1.push(entry.f1);
            last30Days[dateStr].f2.push(entry.f2);
            last30Days[dateStr].f3.push(entry.f3);
            last30Days[dateStr].pitch.push(entry.pitch);
            last30Days[dateStr].count++;
        }
    });

    return Object.entries(last30Days).map(([date, data]) => ({
        date,
        f1Avg: data.f1.reduce((a, b) => a + b, 0) / data.f1.length,
        f2Avg: data.f2.reduce((a, b) => a + b, 0) / data.f2.length,
        f3Avg: data.f3.reduce((a, b) => a + b, 0) / data.f3.length,
        pitchAvg: data.pitch.reduce((a, b) => a + b, 0) / data.pitch.length,
        readings: data.count
    })).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Generate voice fingerprint (unique signature based on formants)
 */
export const generateVoiceFingerprint = () => {
    const history = getFormantHistory();

    if (history.length < 5) {
        return null; // Need more data
    }

    // Use last 20 readings
    const recent = history.slice(-20);

    const avgF1 = recent.reduce((sum, r) => sum + r.f1, 0) / recent.length;
    const avgF2 = recent.reduce((sum, r) => sum + r.f2, 0) / recent.length;
    const avgF3 = recent.reduce((sum, r) => sum + r.f3, 0) / recent.length;
    const avgPitch = recent.reduce((sum, r) => sum + r.pitch, 0) / recent.length;

    // Calculate variance
    const varianceF1 = recent.reduce((sum, r) => sum + Math.pow(r.f1 - avgF1, 2), 0) / recent.length;
    const varianceF2 = recent.reduce((sum, r) => sum + Math.pow(r.f2 - avgF2, 2), 0) / recent.length;

    return {
        averages: {
            f1: Math.round(avgF1),
            f2: Math.round(avgF2),
            f3: Math.round(avgF3),
            pitch: Math.round(avgPitch)
        },
        stability: {
            f1: Math.round(100 - Math.min(Math.sqrt(varianceF1) / 10, 100)),
            f2: Math.round(100 - Math.min(Math.sqrt(varianceF2) / 20, 100))
        },
        readingCount: recent.length,
        generatedAt: new Date().toISOString()
    };
};

/**
 * Generate weekly AI progress report (simulated)
 */
export const generateProgressReport = () => {
    const trends = getFormantTrends();
    const fingerprint = generateVoiceFingerprint();

    if (trends.length < 3 || !fingerprint) {
        return {
            available: false,
            message: 'Need more practice data to generate report'
        };
    }

    const firstWeek = trends.slice(0, Math.floor(trends.length / 2));
    const secondWeek = trends.slice(Math.floor(trends.length / 2));

    const avgFirst = firstWeek.reduce((sum, d) => sum + d.pitchAvg, 0) / firstWeek.length;
    const avgSecond = secondWeek.reduce((sum, d) => sum + d.pitchAvg, 0) / secondWeek.length;
    const pitchChange = avgSecond - avgFirst;

    const insights = [];

    if (pitchChange > 5) {
        insights.push('Your average pitch has increased, showing progress toward your goal.');
    } else if (pitchChange < -5) {
        insights.push('Your pitch has lowered slightly. Focus on pitch exercises this week.');
    } else {
        insights.push('Your pitch is stable. Try pushing your range higher in exercises.');
    }

    if (fingerprint.stability.f2 > 70) {
        insights.push('Great resonance consistency! Your forward focus is improving.');
    } else {
        insights.push('Work on resonance exercises to improve consistency.');
    }

    return {
        available: true,
        generatedAt: new Date().toISOString(),
        pitchTrend: pitchChange > 0 ? 'increasing' : 'stable',
        pitchChangeHz: Math.round(pitchChange),
        fingerprint,
        insights,
        recommendation: 'Continue with daily practice and focus on resonance exercises this week.'
    };
};

export default {
    getFormantHistory,
    saveFormantReading,
    getFormantTrends,
    generateVoiceFingerprint,
    generateProgressReport
};
