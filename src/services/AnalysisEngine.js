
class AnalysisEngine {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.metricTimeline = [];
        this.startTime = 0;
        this.stream = null;
    }

    async startRecording() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];
            this.metricTimeline = [];
            this.startTime = Date.now();

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            return true;
        } catch (error) {
            console.error("Error starting recording:", error);
            return false;
        }
    }

    stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) {
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const duration = Date.now() - this.startTime;

                // Stop all tracks to release microphone
                this.stream.getTracks().forEach(track => track.stop());

                resolve({
                    blob: audioBlob,
                    duration: duration,
                    metrics: this.metricTimeline
                });
            };

            this.mediaRecorder.stop();
        });
    }

    logMetric(pitch, resonance, volume) {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.metricTimeline.push({
                timestamp: Date.now() - this.startTime,
                pitch,
                resonance,
                volume
            });
        }
    }

    /**
     * Analyzes the recording against a target range and transcript.
     * @param {Object} recordingData - { blob, duration, metrics }
     * @param {String} transcript - The text spoken by the user
     * @param {Object} targetRange - { min, max } pitch target
     */
    analyze(recordingData, transcript, targetRange) {
        const { duration, metrics } = recordingData;
        const words = transcript.split(' ');
        const issues = [];

        // 1. Analyze Pitch Consistency
        let lowPitchDuration = 0;
        let highPitchDuration = 0;
        let currentIssue = null;

        metrics.forEach((m, index) => {
            if (!m.pitch || m.pitch <= 0 || m.volume < 0.02) return; // Ignore silence/noise

            const isLow = m.pitch < targetRange.min - 5;
            const isHigh = m.pitch > targetRange.max + 5;

            if (isLow) {
                if (!currentIssue || currentIssue.type !== 'low') {
                    if (currentIssue) issues.push(currentIssue);
                    currentIssue = { type: 'low', start: m.timestamp, end: m.timestamp, minPitch: m.pitch };
                } else {
                    currentIssue.end = m.timestamp;
                    currentIssue.minPitch = Math.min(currentIssue.minPitch, m.pitch);
                }
            } else if (isHigh) {
                if (!currentIssue || currentIssue.type !== 'high') {
                    if (currentIssue) issues.push(currentIssue);
                    currentIssue = { type: 'high', start: m.timestamp, end: m.timestamp, maxPitch: m.pitch };
                } else {
                    currentIssue.end = m.timestamp;
                    currentIssue.maxPitch = Math.max(currentIssue.maxPitch, m.pitch);
                }
            } else {
                if (currentIssue) {
                    issues.push(currentIssue);
                    currentIssue = null;
                }
            }
        });

        if (currentIssue) issues.push(currentIssue);

        // Filter insignificant issues (< 300ms)
        const significantIssues = issues.filter(i => (i.end - i.start) > 300);

        // Map issues to words (Approximate)
        const results = significantIssues.map(issue => {
            const startPct = issue.start / duration;
            const endPct = issue.end / duration;

            const startWordIndex = Math.floor(startPct * words.length);
            const endWordIndex = Math.min(words.length - 1, Math.floor(endPct * words.length));

            const affectedWords = words.slice(startWordIndex, endWordIndex + 1).join(' ');

            return {
                ...issue,
                words: affectedWords,
                feedback: issue.type === 'low'
                    ? `You dropped your pitch on "${affectedWords}".`
                    : `You went a bit high on "${affectedWords}".`
            };
        });

        return {
            issues: results,
            overallScore: Math.max(0, 100 - (results.length * 10)),
            summary: results.length === 0
                ? "Perfect! You stayed in range the whole time."
                : `I found ${results.length} moments where you drifted.`
        };
    }
}

export const analysisEngine = new AnalysisEngine();
