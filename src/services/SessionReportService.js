/**
 * SessionReportService - Generates practice session summaries
 */

const STORAGE_KEY = 'gem_session_reports';

/**
 * Get all stored session reports
 */
export const getReports = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('SessionReportService: Failed to load', e);
    }
    return [];
};

/**
 * Save a new session report
 * @param {Object} report - The session report data
 */
export const saveReport = (report) => {
    const reports = getReports();
    const newReport = {
        id: `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...report
    };

    reports.unshift(newReport); // Add to front (most recent first)

    // Keep only last 50 reports
    const trimmedReports = reports.slice(0, 50);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedReports));
    } catch (e) {
        console.error('SessionReportService: Failed to save', e);
    }

    return newReport;
};

/**
 * Generate a report from journey session data
 */
export const generateJourneyReport = ({
    stepsCompleted = 0,
    moduleName = 'Practice',
    durationMinutes = 0,
    exercises = []
}) => {
    return saveReport({
        type: 'journey',
        moduleName,
        stepsCompleted,
        durationMinutes: Math.round(durationMinutes),
        exerciseCount: exercises.length,
        exercises: exercises.slice(0, 5) // Store up to 5 exercise names
    });
};

/**
 * Generate a report from free practice session
 */
export const generatePracticeReport = ({
    toolsUsed = [],
    durationMinutes = 0,
    pitchData = null,
    resonanceData = null
}) => {
    return saveReport({
        type: 'practice',
        toolsUsed: toolsUsed.slice(0, 5),
        durationMinutes: Math.round(durationMinutes),
        pitchRange: pitchData ? { min: pitchData.min, max: pitchData.max, avg: pitchData.avg } : null,
        resonanceAvg: resonanceData?.avg || null
    });
};

/**
 * Get a summary of recent activity
 */
export const getActivitySummary = () => {
    const reports = getReports();
    const last7Days = reports.filter(r => {
        const reportDate = new Date(r.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return reportDate >= weekAgo;
    });

    const totalMinutes = last7Days.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
    const totalSessions = last7Days.length;
    const totalSteps = last7Days.reduce((sum, r) => sum + (r.stepsCompleted || 0), 0);

    return {
        last7Days: {
            sessions: totalSessions,
            minutes: totalMinutes,
            stepsCompleted: totalSteps
        },
        recentReports: reports.slice(0, 5)
    };
};

export default {
    getReports,
    saveReport,
    generateJourneyReport,
    generatePracticeReport,
    getActivitySummary
};
