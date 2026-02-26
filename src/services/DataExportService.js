/**
 * DataExportService.js
 * 
 * Comprehensive data export for progress reports, session data, and analytics.
 * Supports CSV, JSON, and integrates with existing PDF generator.
 */

import { getReports, getActivitySummary } from './SessionReportService';
import { getStreakData } from './StreakService';
import { getXPData } from './XPService';
import GoalTrackingService from './GoalTrackingService';
import SpacedRepetitionService from './SpacedRepetitionService';
import { getSummaries } from './SessionSummaryService';
import SkillAssessmentService from './SkillAssessmentService';

/**
 * Export session history as CSV
 */
export const exportSessionsCSV = () => {
    const reports = getReports();

    if (reports.length === 0) {
        return { success: false, error: 'No sessions to export' };
    }

    const headers = ['Date', 'Duration (min)', 'Exercises', 'Avg Pitch', 'Notes'];

    const rows = reports.map(r => [
        new Date(r.timestamp).toLocaleDateString(),
        r.durationMinutes || 0,
        r.exercises?.length || 0,
        r.avgPitch || '',
        (r.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, `vocal-gem-sessions-${getDateStamp()}.csv`, 'text/csv');

    return { success: true, count: reports.length };
};

/**
 * Export progress summary as CSV
 */
export const exportProgressCSV = () => {
    const activity = getActivitySummary();
    const streak = getStreakData();
    const xp = getXPData();
    const goals = GoalTrackingService.getActiveGoals();
    const srStats = SpacedRepetitionService.getStats();

    const data = [
        ['Metric', 'Value'],
        ['Current Streak', streak.currentStreak],
        ['Longest Streak', streak.longestStreak],
        ['Total XP', xp.totalXP],
        ['Level', xp.level],
        ['Sessions (Last 7 Days)', activity.last7Days?.sessions || 0],
        ['Minutes (Last 7 Days)', activity.last7Days?.minutes || 0],
        ['Active Goals', goals.length],
        ['Exercises Mastered', srStats.mastered],
        ['Exercises Reviewed', srStats.reviewed]
    ];

    const csv = data.map(r => r.join(',')).join('\n');
    downloadFile(csv, `vocal-gem-progress-${getDateStamp()}.csv`, 'text/csv');

    return { success: true };
};

/**
 * Export complete data backup as JSON
 */
export const exportFullBackup = () => {
    const reports = getReports();
    const streak = getStreakData();
    const xp = getXPData();
    const goals = GoalTrackingService.getActiveGoals();
    const completedGoals = GoalTrackingService.getCompletedGoals();
    const srStats = SpacedRepetitionService.getStats();
    const summaries = getSummaries();
    const assessment = SkillAssessmentService.getStoredAssessment();

    const backup = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: {
            sessions: reports,
            streak,
            xp,
            goals: {
                active: goals,
                completed: completedGoals
            },
            spacedRepetition: srStats,
            sessionSummaries: summaries,
            skillAssessment: assessment
        }
    };

    const json = JSON.stringify(backup, null, 2);
    downloadFile(json, `vocal-gem-backup-${getDateStamp()}.json`, 'application/json');

    return { success: true };
};

/**
 * Export SLP-formatted report
 * More clinical format for speech-language pathologists
 */
export const exportSLPReport = () => {
    const reports = getReports();
    const assessment = SkillAssessmentService.getStoredAssessment();

    // Calculate metrics
    const recentReports = reports.slice(0, 30);
    const pitchData = recentReports.filter(r => r.avgPitch > 0);
    const avgPitch = pitchData.length > 0
        ? Math.round(pitchData.reduce((sum, r) => sum + r.avgPitch, 0) / pitchData.length)
        : 'N/A';

    const totalMinutes = recentReports.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
    const totalSessions = recentReports.length;

    const lines = [
        'VOICE TRAINING PROGRESS REPORT',
        '='.repeat(40),
        `Report Date: ${new Date().toLocaleDateString()}`,
        `Reporting Period: Last 30 days`,
        '',
        'PRACTICE SUMMARY',
        '-'.repeat(40),
        `Total Sessions: ${totalSessions}`,
        `Total Practice Time: ${totalMinutes} minutes`,
        `Average Pitch: ${avgPitch} Hz`,
        '',
        'SKILL ASSESSMENT',
        '-'.repeat(40),
        assessment ? [
            `Overall Level: ${assessment.level || 'Not assessed'}`,
            `Pitch Control: ${assessment.dimensions?.pitchControl?.score || 'N/A'}/100`,
            `Resonance: ${assessment.dimensions?.resonance?.score || 'N/A'}/100`,
            `Vocal Weight: ${assessment.dimensions?.vocalWeight?.score || 'N/A'}/100`,
            `Consistency: ${assessment.dimensions?.consistency?.score || 'N/A'}/100`,
            `Range: ${assessment.dimensions?.range?.score || 'N/A'}/100`
        ].join('\n') : 'Not yet assessed',
        '',
        'SESSION LOG',
        '-'.repeat(40),
        recentReports.slice(0, 10).map(r =>
            `${new Date(r.timestamp).toLocaleDateString()} - ${r.durationMinutes || 0} min - ${r.exercises?.length || 0} exercises`
        ).join('\n'),
        '',
        'Generated by Vocal GEM Voice Training App'
    ];

    const text = lines.join('\n');
    downloadFile(text, `vocal-gem-slp-report-${getDateStamp()}.txt`, 'text/plain');

    return { success: true };
};

/**
 * Get available export options
 */
export const getExportOptions = () => [
    {
        id: 'sessions_csv',
        title: 'Session History',
        description: 'All practice sessions as CSV',
        format: 'CSV',
        icon: '📊',
        action: exportSessionsCSV
    },
    {
        id: 'progress_csv',
        title: 'Progress Summary',
        description: 'Current stats and metrics',
        format: 'CSV',
        icon: '📈',
        action: exportProgressCSV
    },
    {
        id: 'slp_report',
        title: 'SLP Report',
        description: 'Clinical format for professionals',
        format: 'TXT',
        icon: '📋',
        action: exportSLPReport
    },
    {
        id: 'full_backup',
        title: 'Full Backup',
        description: 'Complete data export',
        format: 'JSON',
        icon: '💾',
        action: exportFullBackup
    }
];

// Helpers
const getDateStamp = () => new Date().toISOString().split('T')[0];

const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default {
    exportSessionsCSV,
    exportProgressCSV,
    exportFullBackup,
    exportSLPReport,
    getExportOptions
};
