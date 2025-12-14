
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

    logMetric(pitch, resonance, volume, options = {}) {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            const metric = {
                timestamp: Date.now() - this.startTime,
                pitch,
                resonance,
                volume
            };

            // Include optional vocal quality metrics
            if (options.vocalWeight !== undefined) {
                metric.vocalWeight = options.vocalWeight;
            }
            if (options.h1h2 !== undefined) {
                metric.h1h2 = options.h1h2;
            }
            if (options.f2 !== undefined) {
                metric.f2 = options.f2;
            }

            this.metricTimeline.push(metric);
        }
    }

    /**
     * Analyzes the recording against target ranges and transcript.
     * Now supports vocal weight and F2 analysis alongside pitch.
     * @param {Object} recordingData - { blob, duration, metrics }
     * @param {String} transcript - The text spoken by the user
     * @param {Object} targetRange - { min, max } pitch target
     * @param {Object} options - Optional targets { vocalWeight: {min, max}, f2: {min, max} }
     */
    analyze(recordingData, transcript, targetRange, options = {}) {
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

        // Analyze vocal weight consistency if target provided
        if (options.vocalWeightTarget) {
            const { min, max } = options.vocalWeightTarget;
            let vocalWeightIssue = null;

            metrics.forEach((m) => {
                if (!m.pitch || m.pitch <= 0 || m.volume < 0.02) return; // Skip silence
                if (m.vocalWeight === undefined && m.h1h2 === undefined) return; // Skip if no data

                const weight = m.vocalWeight !== undefined ? m.vocalWeight : (m.h1h2 / 10) * 100;
                const isTooHeavy = weight < min;
                const isTooLight = weight > max;

                if (isTooHeavy) {
                    if (!vocalWeightIssue || vocalWeightIssue.type !== 'heavy') {
                        if (vocalWeightIssue) issues.push(vocalWeightIssue);
                        vocalWeightIssue = { type: 'heavy', start: m.timestamp, end: m.timestamp };
                    } else {
                        vocalWeightIssue.end = m.timestamp;
                    }
                } else if (isTooLight) {
                    if (!vocalWeightIssue || vocalWeightIssue.type !== 'light') {
                        if (vocalWeightIssue) issues.push(vocalWeightIssue);
                        vocalWeightIssue = { type: 'light', start: m.timestamp, end: m.timestamp };
                    } else {
                        vocalWeightIssue.end = m.timestamp;
                    }
                } else {
                    if (vocalWeightIssue) {
                        issues.push(vocalWeightIssue);
                        vocalWeightIssue = null;
                    }
                }
            });

            if (vocalWeightIssue) issues.push(vocalWeightIssue);
        }

        // Analyze F2 consistency if target provided
        if (options.f2Target) {
            const { min, max } = options.f2Target;
            let f2Issue = null;

            metrics.forEach((m) => {
                if (!m.pitch || m.pitch <= 0 || m.volume < 0.02) return; // Skip silence
                if (m.f2 === undefined || m.f2 === 0) return; // Skip if no F2 data

                const isTooLow = m.f2 < min;
                const isTooHigh = m.f2 > max;

                if (isTooLow) {
                    if (!f2Issue || f2Issue.type !== 'f2_low') {
                        if (f2Issue) issues.push(f2Issue);
                        f2Issue = { type: 'f2_low', start: m.timestamp, end: m.timestamp };
                    } else {
                        f2Issue.end = m.timestamp;
                    }
                } else if (isTooHigh) {
                    if (!f2Issue || f2Issue.type !== 'f2_high') {
                        if (f2Issue) issues.push(f2Issue);
                        f2Issue = { type: 'f2_high', start: m.timestamp, end: m.timestamp };
                    } else {
                        f2Issue.end = m.timestamp;
                    }
                } else {
                    if (f2Issue) {
                        issues.push(f2Issue);
                        f2Issue = null;
                    }
                }
            });

            if (f2Issue) issues.push(f2Issue);
        }

        // Filter insignificant issues (< 300ms)
        const significantIssues = issues.filter(i => (i.end - i.start) > 300);

        // Map issues to words (Approximate)
        const results = significantIssues.map(issue => {
            const startPct = issue.start / duration;
            const endPct = issue.end / duration;

            const startWordIndex = Math.floor(startPct * words.length);
            const endWordIndex = Math.min(words.length - 1, Math.floor(endPct * words.length));

            const affectedWords = words.slice(startWordIndex, endWordIndex + 1).join(' ');

            let feedback = '';
            switch (issue.type) {
                case 'low':
                    feedback = `You dropped your pitch on "${affectedWords}".`;
                    break;
                case 'high':
                    feedback = `You went a bit high on "${affectedWords}".`;
                    break;
                case 'heavy':
                    feedback = `Your voice was too heavy/pressed on "${affectedWords}".`;
                    break;
                case 'light':
                    feedback = `Your voice was too light/breathy on "${affectedWords}".`;
                    break;
                case 'f2_low':
                    feedback = `Your resonance (F2) was too dark on "${affectedWords}".`;
                    break;
                case 'f2_high':
                    feedback = `Your resonance (F2) was too bright on "${affectedWords}".`;
                    break;
                default:
                    feedback = `Issue detected on "${affectedWords}".`;
            }

            return {
                ...issue,
                words: affectedWords,
                feedback
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
