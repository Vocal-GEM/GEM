/**
 * ExportService - Export progress reports in various formats
 */

import { getActivitySummary, getReports } from './SessionReportService';
import { getStreakData } from './StreakService';
import { getXPData } from './DailyChallengeService';
import { generateVoiceFingerprint, getFormantTrends } from './AdvancedAnalyticsService';

/**
 * Generate report data object
 */
const generateReportData = () => {
    const activity = getActivitySummary();
    const streak = getStreakData();
    const xp = getXPData();
    const fingerprint = generateVoiceFingerprint();
    const trends = getFormantTrends();
    const recentSessions = getReports().slice(0, 10);

    return {
        generatedAt: new Date().toISOString(),
        summary: {
            totalSessions: activity.last30Days?.sessions || 0,
            totalMinutes: activity.last30Days?.minutes || 0,
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            level: xp.level,
            totalXP: xp.totalXP
        },
        voiceFingerprint: fingerprint,
        formantTrends: trends.slice(-14), // Last 2 weeks
        recentSessions: recentSessions.map(s => ({
            date: s.timestamp,
            duration: s.duration,
            exercises: s.exercises?.length || 0
        }))
    };
};

/**
 * Export as JSON
 */
export const exportAsJSON = () => {
    const data = generateReportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `vocal-gem-report-${formatDate(new Date())}.json`);
};

/**
 * Export as CSV
 */
export const exportAsCSV = () => {
    const data = generateReportData();

    // Build CSV content
    let csv = 'Vocal GEM Progress Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    csv += 'Summary\n';
    csv += 'Metric,Value\n';
    csv += `Total Sessions,${data.summary.totalSessions}\n`;
    csv += `Total Minutes,${data.summary.totalMinutes}\n`;
    csv += `Current Streak,${data.summary.currentStreak}\n`;
    csv += `Longest Streak,${data.summary.longestStreak}\n`;
    csv += `Level,${data.summary.level}\n`;
    csv += `Total XP,${data.summary.totalXP}\n\n`;

    if (data.voiceFingerprint) {
        csv += 'Voice Fingerprint\n';
        csv += 'Metric,Value\n';
        csv += `Average F1,${data.voiceFingerprint.averages.f1} Hz\n`;
        csv += `Average F2,${data.voiceFingerprint.averages.f2} Hz\n`;
        csv += `Average F3,${data.voiceFingerprint.averages.f3} Hz\n`;
        csv += `Average Pitch,${data.voiceFingerprint.averages.pitch} Hz\n`;
        csv += `Resonance Stability,${data.voiceFingerprint.stability.f2}%\n\n`;
    }

    if (data.formantTrends.length > 0) {
        csv += 'Formant Trends (Last 14 Days)\n';
        csv += 'Date,F1 Avg,F2 Avg,Pitch Avg\n';
        data.formantTrends.forEach(t => {
            csv += `${t.date},${Math.round(t.f1Avg)},${Math.round(t.f2Avg)},${Math.round(t.pitchAvg)}\n`;
        });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `vocal-gem-report-${formatDate(new Date())}.csv`);
};

/**
 * Export as PDF (using jsPDF if available)
 */
export const exportAsPDF = async () => {
    const data = generateReportData();

    // Dynamic import jsPDF
    try {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        let y = 20;

        // Title
        doc.setFontSize(20);
        doc.setTextColor(20, 184, 166); // Teal
        doc.text('Vocal GEM Progress Report', 20, y);
        y += 10;

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
        y += 20;

        // Summary Section
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Summary', 20, y);
        y += 10;

        doc.setFontSize(11);
        doc.text(`Total Sessions: ${data.summary.totalSessions}`, 25, y); y += 7;
        doc.text(`Practice Time: ${data.summary.totalMinutes} minutes`, 25, y); y += 7;
        doc.text(`Current Streak: ${data.summary.currentStreak} days`, 25, y); y += 7;
        doc.text(`Longest Streak: ${data.summary.longestStreak} days`, 25, y); y += 7;
        doc.text(`Level: ${data.summary.level}`, 25, y); y += 7;
        doc.text(`Total XP: ${data.summary.totalXP}`, 25, y); y += 15;

        // Voice fingerprint
        if (data.voiceFingerprint) {
            doc.setFontSize(14);
            doc.text('Voice Fingerprint', 20, y);
            y += 10;

            doc.setFontSize(11);
            doc.text(`F1 Average: ${data.voiceFingerprint.averages.f1} Hz`, 25, y); y += 7;
            doc.text(`F2 Average: ${data.voiceFingerprint.averages.f2} Hz`, 25, y); y += 7;
            doc.text(`Average Pitch: ${data.voiceFingerprint.averages.pitch} Hz`, 25, y); y += 7;
            doc.text(`Resonance Stability: ${data.voiceFingerprint.stability.f2}%`, 25, y); y += 15;
        }

        doc.save(`vocal-gem-report-${formatDate(new Date())}.pdf`);
    } catch (error) {
        console.error('PDF export failed:', error);
        // Fall back to CSV
        exportAsCSV();
    }
};

/**
 * Helper: Download blob as file
 */
const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Helper: Format date as YYYY-MM-DD
 */
const formatDate = (date) => date.toISOString().split('T')[0];

export default {
    exportAsJSON,
    exportAsCSV,
    exportAsPDF
};
