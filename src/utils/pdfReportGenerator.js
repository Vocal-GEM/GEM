/**
 * pdfReportGenerator.js
 * 
 * Generates professional PDF progress reports for SLPs and clients.
 * Includes session data, metric trends, and coach feedback.
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class PDFReportGenerator {
    constructor() {
        this.doc = null;
    }

    /**
     * Generate a comprehensive progress report
     * @param {Object} options - Report configuration
     * @returns {Blob} PDF blob
     */
    async generateProgressReport(options) {
        const {
            clientName = 'Client',
            dateRange = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
            sessions = [],
            currentMetrics = {},
            targetMetrics = {},
            coachNotes = [],
            includeGraphs = true
        } = options;

        this.doc = new jsPDF();
        let yPos = 20;

        // Header
        yPos = this.addHeader(clientName, dateRange, yPos);

        // Executive Summary
        yPos = this.addExecutiveSummary(sessions, yPos);

        // Current Status Table
        yPos = this.addCurrentStatus(currentMetrics, targetMetrics, yPos);

        // Metric Trends
        if (includeGraphs && sessions.length > 1) {
            yPos = this.addMetricTrends(sessions, yPos);
        }

        // Coach Notes
        if (coachNotes.length > 0) {
            yPos = this.addCoachNotes(coachNotes, yPos);
        }

        // Session Log
        yPos = this.addSessionLog(sessions, yPos);

        // Footer
        this.addFooter();

        return this.doc;
    }

    /**
     * Add report header
     */
    addHeader(clientName, dateRange, yPos) {
        const { doc } = this;

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Voice Therapy Progress Report', 105, yPos, { align: 'center' });

        yPos += 10;

        // Client info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Client: ${clientName}`, 20, yPos);

        yPos += 7;

        const startDate = this.formatDate(dateRange.start);
        const endDate = this.formatDate(dateRange.end);
        doc.text(`Report Period: ${startDate} - ${endDate}`, 20, yPos);

        yPos += 10;

        // Horizontal line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, 190, yPos);

        return yPos + 10;
    }

    /**
     * Add executive summary
     */
    addExecutiveSummary(sessions, yPos) {
        const { doc } = this;

        this.checkPageBreak(yPos, 40);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', 20, yPos);

        yPos += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const sessionCount = sessions.length;
        const avgFrequency = this.calculateSessionFrequency(sessions);
        const overallProgress = this.calculateOverallProgress(sessions);

        doc.text(`Total Sessions: ${sessionCount}`, 25, yPos);
        yPos += 6;

        doc.text(`Session Frequency: ${avgFrequency.toFixed(1)} sessions/week`, 25, yPos);
        yPos += 6;

        doc.text(`Overall Progress: ${overallProgress}`, 25, yPos);
        yPos += 6;

        return yPos + 5;
    }

    /**
     * Add current status table
     */
    addCurrentStatus(currentMetrics, targetMetrics, yPos) {
        const { doc } = this;

        this.checkPageBreak(yPos, 60);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Current Status', 20, yPos);

        yPos += 8;

        const tableData = [
            ['Pitch (Hz)',
                currentMetrics.pitch?.toFixed(0) || 'N/A',
                `${targetMetrics.pitchMin || 170}-${targetMetrics.pitchMax || 220}`,
                this.getStatus(currentMetrics.pitch, targetMetrics.pitchMin, targetMetrics.pitchMax)],
            ['Resonance F1 (Hz)',
                currentMetrics.f1?.toFixed(0) || 'N/A',
                targetMetrics.f1Target || '>450',
                this.getResonanceStatus(currentMetrics.f1, targetMetrics.f1Target)],
            ['Resonance F2 (Hz)',
                currentMetrics.f2?.toFixed(0) || 'N/A',
                targetMetrics.f2Target || '>1800',
                this.getResonanceStatus(currentMetrics.f2, targetMetrics.f2Target)],
            ['CPP (dB)',
                currentMetrics.cpp?.toFixed(1) || 'N/A',
                '>10',
                this.getCPPStatus(currentMetrics.cpp)],
            ['Jitter (%)',
                currentMetrics.jitter?.toFixed(2) || 'N/A',
                '<1.0',
                this.getJitterStatus(currentMetrics.jitter)],
        ];

        doc.autoTable({
            startY: yPos,
            head: [['Metric', 'Current', 'Target', 'Status']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 40, halign: 'center' },
                2: { cellWidth: 40, halign: 'center' },
                3: { cellWidth: 50, halign: 'center' }
            }
        });

        return doc.lastAutoTable.finalY + 10;
    }

    /**
     * Add metric trends (simplified text-based for now)
     */
    addMetricTrends(sessions, yPos) {
        const { doc } = this;

        this.checkPageBreak(yPos, 80);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Metric Trends (Last 30 Days)', 20, yPos);

        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Calculate trends
        const trends = this.calculateTrends(sessions);

        Object.entries(trends).forEach(([metric, trend]) => {
            const arrow = trend.direction === 'improving' ? '↑' : trend.direction === 'declining' ? '↓' : '→';
            const color = trend.direction === 'improving' ? [34, 197, 94] : trend.direction === 'declining' ? [239, 68, 68] : [148, 163, 184];

            doc.setTextColor(...color);
            doc.text(`${metric}: ${arrow} ${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}% (${trend.description})`, 25, yPos);
            doc.setTextColor(0, 0, 0);

            yPos += 6;
        });

        return yPos + 5;
    }

    /**
     * Add coach notes
     */
    addCoachNotes(coachNotes, yPos) {
        const { doc } = this;

        this.checkPageBreak(yPos, 40);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Coach Notes & Recommendations', 20, yPos);

        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        coachNotes.slice(0, 5).forEach((note, index) => {
            const noteText = `${index + 1}. ${note.text || note}`;
            const lines = doc.splitTextToSize(noteText, 170);

            this.checkPageBreak(yPos, lines.length * 6);

            lines.forEach(line => {
                doc.text(line, 25, yPos);
                yPos += 6;
            });
        });

        return yPos + 5;
    }

    /**
     * Add session log table
     */
    addSessionLog(sessions, yPos) {
        const { doc } = this;

        this.checkPageBreak(yPos, 60);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Session Log', 20, yPos);

        yPos += 8;

        const tableData = sessions.slice(0, 20).map(session => [
            this.formatDate(new Date(session.timestamp || session.date)),
            session.duration ? `${Math.round(session.duration / 60)}min` : 'N/A',
            session.pitch?.toFixed(0) || 'N/A',
            session.f1?.toFixed(0) || 'N/A',
            session.cpp?.toFixed(1) || 'N/A',
            session.notes?.substring(0, 30) || '-'
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Date', 'Duration', 'Pitch', 'F1', 'CPP', 'Notes']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 20 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 70 }
            }
        });

        return doc.lastAutoTable.finalY + 10;
    }

    /**
     * Add footer
     */
    addFooter() {
        const { doc } = this;
        const pageCount = doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Generated by Vocal GEM - ${this.formatDate(new Date())}`, 105, 285, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
        }
    }

    /**
     * Check if we need a page break
     */
    checkPageBreak(yPos, requiredSpace) {
        if (yPos + requiredSpace > 270) {
            this.doc.addPage();
            return 20;
        }
        return yPos;
    }

    /**
     * Helper: Format date
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Helper: Calculate session frequency
     */
    calculateSessionFrequency(sessions) {
        if (sessions.length < 2) return 0;

        const dates = sessions.map(s => new Date(s.timestamp || s.date).getTime()).sort();
        const daysBetween = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
        const weeks = daysBetween / 7;

        return weeks > 0 ? sessions.length / weeks : 0;
    }

    /**
     * Helper: Calculate overall progress
     */
    calculateOverallProgress(sessions) {
        if (sessions.length < 2) return 'Insufficient data';

        const recent = sessions.slice(0, Math.ceil(sessions.length / 3));
        const older = sessions.slice(Math.ceil(sessions.length * 2 / 3));

        const recentAvg = this.averageMetrics(recent);
        const olderAvg = this.averageMetrics(older);

        const improvements = [];
        if (recentAvg.pitch > olderAvg.pitch) improvements.push('pitch');
        if (recentAvg.cpp > olderAvg.cpp) improvements.push('voice quality');
        if (recentAvg.f1 > olderAvg.f1) improvements.push('resonance');

        if (improvements.length >= 2) return 'Improving';
        if (improvements.length === 1) return 'Stable with some improvement';
        return 'Stable';
    }

    /**
     * Helper: Average metrics
     */
    averageMetrics(sessions) {
        const sum = sessions.reduce((acc, s) => ({
            pitch: acc.pitch + (s.pitch || 0),
            cpp: acc.cpp + (s.cpp || 0),
            f1: acc.f1 + (s.f1 || 0)
        }), { pitch: 0, cpp: 0, f1: 0 });

        return {
            pitch: sum.pitch / sessions.length,
            cpp: sum.cpp / sessions.length,
            f1: sum.f1 / sessions.length
        };
    }

    /**
     * Helper: Calculate trends
     */
    calculateTrends(sessions) {
        const trends = {};
        const metrics = ['pitch', 'cpp', 'f1', 'f2'];

        metrics.forEach(metric => {
            const values = sessions.map(s => s[metric]).filter(v => v != null);
            if (values.length < 2) return;

            const recent = values.slice(0, Math.ceil(values.length / 2));
            const older = values.slice(Math.ceil(values.length / 2));

            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

            const change = ((recentAvg - olderAvg) / olderAvg) * 100;
            const direction = change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable';

            trends[metric.toUpperCase()] = {
                change,
                direction,
                description: direction === 'improving' ? 'Improving' : direction === 'declining' ? 'Needs attention' : 'Stable'
            };
        });

        return trends;
    }

    /**
     * Helper: Get status for pitch
     */
    getStatus(value, min, max) {
        if (!value) return 'N/A';
        if (value >= min && value <= max) return '✓ On Target';
        if (value < min) return '↓ Below Target';
        return '↑ Above Target';
    }

    /**
     * Helper: Get resonance status
     */
    getResonanceStatus(value, target) {
        if (!value) return 'N/A';
        const targetNum = parseInt(target.replace('>', ''));
        return value >= targetNum ? '✓ On Target' : '↓ Below Target';
    }

    /**
     * Helper: Get CPP status
     */
    getCPPStatus(value) {
        if (!value) return 'N/A';
        if (value > 10) return '✓ Excellent';
        if (value > 8) return '○ Good';
        if (value > 6) return '△ Fair';
        return '✗ Needs Work';
    }

    /**
     * Helper: Get jitter status
     */
    getJitterStatus(value) {
        if (!value) return 'N/A';
        if (value < 1.0) return '✓ Good';
        if (value < 2.0) return '○ Fair';
        return '✗ High';
    }

    /**
     * Save PDF to file
     */
    save(filename = 'voice-therapy-report.pdf') {
        if (this.doc) {
            this.doc.save(filename);
        }
    }

    /**
     * Get PDF as blob
     */
    getBlob() {
        if (this.doc) {
            return this.doc.output('blob');
        }
        return null;
    }
}

// Export singleton instance
export const pdfReportGenerator = new PDFReportGenerator();
