import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analysisEngine } from './AnalysisEngine';

// Mock MediaDevices
const mockStream = {
    getTracks: vi.fn(() => [{ stop: vi.fn() }]),
};

global.navigator.mediaDevices = {
    getUserMedia: vi.fn(() => Promise.resolve(mockStream)),
};

// Mock MediaRecorder
class MockMediaRecorder {
    constructor(stream) {
        this.stream = stream;
        this.state = 'inactive';
        this.ondataavailable = null;
        this.onstop = null;
    }

    start() {
        this.state = 'recording';
    }

    stop() {
        this.state = 'inactive';
        if (this.onstop) {
            this.onstop();
        }
    }
}

global.MediaRecorder = MockMediaRecorder;

describe('AnalysisEngine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset the singleton instance state
        analysisEngine.mediaRecorder = null;
        analysisEngine.audioChunks = [];
        analysisEngine.metricTimeline = [];
        analysisEngine.startTime = 0;
        analysisEngine.stream = null;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('startRecording', () => {
        it('requests microphone access', async () => {
            await analysisEngine.startRecording();

            expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
        });

        it('initializes MediaRecorder with stream', async () => {
            await analysisEngine.startRecording();

            expect(analysisEngine.mediaRecorder).toBeInstanceOf(MockMediaRecorder);
            expect(analysisEngine.mediaRecorder.stream).toBe(mockStream);
        });

        it('clears previous audio chunks', async () => {
            analysisEngine.audioChunks = [new Blob(['old data'])];

            await analysisEngine.startRecording();

            expect(analysisEngine.audioChunks).toEqual([]);
        });

        it('clears previous metric timeline', async () => {
            analysisEngine.metricTimeline = [{ timestamp: 100, pitch: 220 }];

            await analysisEngine.startRecording();

            expect(analysisEngine.metricTimeline).toEqual([]);
        });

        it('sets start time', async () => {
            const beforeTime = Date.now();
            await analysisEngine.startRecording();
            const afterTime = Date.now();

            expect(analysisEngine.startTime).toBeGreaterThanOrEqual(beforeTime);
            expect(analysisEngine.startTime).toBeLessThanOrEqual(afterTime);
        });

        it('starts MediaRecorder', async () => {
            await analysisEngine.startRecording();

            expect(analysisEngine.mediaRecorder.state).toBe('recording');
        });

        it('sets up ondataavailable handler', async () => {
            await analysisEngine.startRecording();

            expect(analysisEngine.mediaRecorder.ondataavailable).toBeInstanceOf(Function);
        });

        it('returns true on success', async () => {
            const result = await analysisEngine.startRecording();

            expect(result).toBe(true);
        });

        it('handles getUserMedia errors gracefully', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(
                new Error('Permission denied')
            );

            const result = await analysisEngine.startRecording();

            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error starting recording:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it('stores audio chunks when ondataavailable fires', async () => {
            await analysisEngine.startRecording();

            const mockData = new Blob(['audio data']);
            analysisEngine.mediaRecorder.ondataavailable({ data: mockData });

            expect(analysisEngine.audioChunks).toContain(mockData);
        });
    });

    describe('stopRecording', () => {
        beforeEach(async () => {
            await analysisEngine.startRecording();
        });

        it('returns null if no media recorder', async () => {
            analysisEngine.mediaRecorder = null;

            const result = await analysisEngine.stopRecording();

            expect(result).toBeNull();
        });

        it('stops the MediaRecorder', async () => {
            const stopPromise = analysisEngine.stopRecording();

            expect(analysisEngine.mediaRecorder.state).toBe('inactive');

            await stopPromise;
        });

        it('creates audio blob from chunks', async () => {
            const chunk1 = new Blob(['chunk1']);
            const chunk2 = new Blob(['chunk2']);
            analysisEngine.audioChunks = [chunk1, chunk2];

            const result = await analysisEngine.stopRecording();

            expect(result.blob).toBeInstanceOf(Blob);
            expect(result.blob.type).toBe('audio/webm');
        });

        it('calculates duration from start time', async () => {
            analysisEngine.startTime = Date.now() - 5000; // 5 seconds ago

            const result = await analysisEngine.stopRecording();

            expect(result.duration).toBeGreaterThanOrEqual(4900);
            expect(result.duration).toBeLessThanOrEqual(5100);
        });

        it('includes metric timeline in result', async () => {
            const mockMetrics = [
                { timestamp: 0, pitch: 220, resonance: 50, volume: 0.5 },
                { timestamp: 100, pitch: 225, resonance: 55, volume: 0.6 },
            ];
            analysisEngine.metricTimeline = mockMetrics;

            const result = await analysisEngine.stopRecording();

            expect(result.metrics).toEqual(mockMetrics);
        });

        it('stops all stream tracks', async () => {
            const stopTrack = vi.fn();
            mockStream.getTracks.mockReturnValueOnce([
                { stop: stopTrack },
                { stop: stopTrack },
            ]);

            await analysisEngine.stopRecording();

            expect(mockStream.getTracks).toHaveBeenCalled();
            expect(stopTrack).toHaveBeenCalledTimes(2);
        });

        it('returns recording data object with blob, duration, metrics', async () => {
            const result = await analysisEngine.stopRecording();

            expect(result).toHaveProperty('blob');
            expect(result).toHaveProperty('duration');
            expect(result).toHaveProperty('metrics');
        });
    });

    describe('logMetric', () => {
        it('does not log when not recording', () => {
            analysisEngine.logMetric(220, 50, 0.5);

            expect(analysisEngine.metricTimeline).toEqual([]);
        });

        it('logs metrics when recording', async () => {
            await analysisEngine.startRecording();
            analysisEngine.startTime = Date.now() - 1000; // 1 second ago

            analysisEngine.logMetric(220, 50, 0.5);

            expect(analysisEngine.metricTimeline).toHaveLength(1);
            expect(analysisEngine.metricTimeline[0]).toMatchObject({
                pitch: 220,
                resonance: 50,
                volume: 0.5,
            });
        });

        it('calculates timestamp relative to start time', async () => {
            await analysisEngine.startRecording();
            analysisEngine.startTime = Date.now() - 2500; // 2.5 seconds ago

            analysisEngine.logMetric(220, 50, 0.5);

            expect(analysisEngine.metricTimeline[0].timestamp).toBeGreaterThanOrEqual(2400);
            expect(analysisEngine.metricTimeline[0].timestamp).toBeLessThanOrEqual(2600);
        });

        it('accumulates multiple metrics', async () => {
            await analysisEngine.startRecording();

            analysisEngine.logMetric(220, 50, 0.5);
            analysisEngine.logMetric(225, 55, 0.6);
            analysisEngine.logMetric(230, 60, 0.7);

            expect(analysisEngine.metricTimeline).toHaveLength(3);
        });
    });

    describe('analyze', () => {
        const mockRecordingData = {
            blob: new Blob(['audio']),
            duration: 3000, // 3 seconds
            metrics: [],
        };

        const mockTranscript = 'hello world test';
        const mockTargetRange = { min: 200, max: 250 };

        it('returns analysis with issues, score, and summary', () => {
            const result = analysisEngine.analyze(
                mockRecordingData,
                mockTranscript,
                mockTargetRange
            );

            expect(result).toHaveProperty('issues');
            expect(result).toHaveProperty('overallScore');
            expect(result).toHaveProperty('summary');
        });

        it('detects no issues when all metrics are in range', () => {
            const recordingData = {
                ...mockRecordingData,
                metrics: [
                    { timestamp: 0, pitch: 220, volume: 0.5 },
                    { timestamp: 500, pitch: 225, volume: 0.5 },
                    { timestamp: 1000, pitch: 230, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.issues).toEqual([]);
            expect(result.overallScore).toBe(100);
            expect(result.summary).toBe('Perfect! You stayed in range the whole time.');
        });

        it('detects low pitch issues', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 2000,
                metrics: [
                    { timestamp: 0, pitch: 180, volume: 0.5 }, // Below min (200-5=195)
                    { timestamp: 500, pitch: 180, volume: 0.5 },
                    { timestamp: 1000, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].type).toBe('low');
            expect(result.issues[0].minPitch).toBe(180);
        });

        it('detects high pitch issues', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 2000,
                metrics: [
                    { timestamp: 0, pitch: 260, volume: 0.5 }, // Above max (250+5=255)
                    { timestamp: 500, pitch: 260, volume: 0.5 },
                    { timestamp: 1000, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.issues[0].type).toBe('high');
            expect(result.issues[0].maxPitch).toBe(260);
        });

        it('ignores silent/noise segments (volume < 0.02)', () => {
            const recordingData = {
                ...mockRecordingData,
                metrics: [
                    { timestamp: 0, pitch: 180, volume: 0.01 }, // Too quiet
                    { timestamp: 500, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.issues).toEqual([]);
        });

        it('ignores metrics with invalid pitch values', () => {
            const recordingData = {
                ...mockRecordingData,
                metrics: [
                    { timestamp: 0, pitch: 0, volume: 0.5 }, // Invalid pitch
                    { timestamp: 500, pitch: null, volume: 0.5 }, // Invalid pitch
                    { timestamp: 1000, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.issues).toEqual([]);
        });

        it('filters out insignificant issues (< 300ms)', () => {
            const recordingData = {
                ...mockRecordingData,
                metrics: [
                    { timestamp: 0, pitch: 180, volume: 0.5 },
                    { timestamp: 200, pitch: 180, volume: 0.5 }, // Only 200ms duration
                    { timestamp: 400, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.issues).toEqual([]);
        });

        it('includes significant issues (>= 300ms)', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 2000,
                metrics: [
                    { timestamp: 0, pitch: 180, volume: 0.5 },
                    { timestamp: 200, pitch: 180, volume: 0.5 },
                    { timestamp: 400, pitch: 180, volume: 0.5 }, // 400ms total
                    { timestamp: 600, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.issues.length).toBeGreaterThan(0);
        });

        it('maps issues to affected words', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 3000,
                metrics: [
                    { timestamp: 0, pitch: 180, volume: 0.5 }, // First third
                    { timestamp: 500, pitch: 180, volume: 0.5 },
                    { timestamp: 1000, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, 'hello world test', mockTargetRange);

            expect(result.issues[0]).toHaveProperty('words');
            expect(result.issues[0].words).toBeTruthy();
        });

        it('generates feedback for low pitch issues', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 2000,
                metrics: [
                    { timestamp: 0, pitch: 180, volume: 0.5 },
                    { timestamp: 500, pitch: 180, volume: 0.5 },
                    { timestamp: 1000, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, 'hello world', mockTargetRange);

            expect(result.issues[0].feedback).toContain('dropped your pitch');
        });

        it('generates feedback for high pitch issues', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 2000,
                metrics: [
                    { timestamp: 0, pitch: 260, volume: 0.5 },
                    { timestamp: 500, pitch: 260, volume: 0.5 },
                    { timestamp: 1000, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, 'hello world', mockTargetRange);

            expect(result.issues[0].feedback).toContain('went a bit high');
        });

        it('calculates score based on number of issues', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 4000,
                metrics: [
                    // Issue 1
                    { timestamp: 0, pitch: 180, volume: 0.5 },
                    { timestamp: 500, pitch: 180, volume: 0.5 },
                    // In range
                    { timestamp: 1000, pitch: 220, volume: 0.5 },
                    // Issue 2
                    { timestamp: 2000, pitch: 260, volume: 0.5 },
                    { timestamp: 2500, pitch: 260, volume: 0.5 },
                    // In range
                    { timestamp: 3000, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            // 2 issues = 100 - (2 * 10) = 80
            expect(result.overallScore).toBe(80);
        });

        it('does not return negative scores', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 15000,
                metrics: Array.from({ length: 50 }, (_, i) => ({
                    timestamp: i * 300,
                    pitch: 180, // All low
                    volume: 0.5,
                })),
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.overallScore).toBeGreaterThanOrEqual(0);
        });

        it('generates summary based on issue count', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 4000,
                metrics: [
                    { timestamp: 0, pitch: 180, volume: 0.5 },
                    { timestamp: 500, pitch: 180, volume: 0.5 },
                    { timestamp: 1000, pitch: 220, volume: 0.5 },
                    { timestamp: 2000, pitch: 260, volume: 0.5 },
                    { timestamp: 2500, pitch: 260, volume: 0.5 },
                    { timestamp: 3000, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.summary).toContain('found');
            expect(result.summary).toContain('drifted');
        });

        it('merges consecutive issues of the same type', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 3000,
                metrics: [
                    { timestamp: 0, pitch: 180, volume: 0.5 },
                    { timestamp: 500, pitch: 180, volume: 0.5 },
                    { timestamp: 1000, pitch: 180, volume: 0.5 },
                    { timestamp: 1500, pitch: 220, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            // Should merge into one continuous low issue
            expect(result.issues).toHaveLength(1);
            expect(result.issues[0].type).toBe('low');
        });

        it('separates issues of different types', () => {
            const recordingData = {
                ...mockRecordingData,
                duration: 4000,
                metrics: [
                    { timestamp: 0, pitch: 180, volume: 0.5 }, // Low issue
                    { timestamp: 500, pitch: 180, volume: 0.5 },
                    { timestamp: 1000, pitch: 220, volume: 0.5 }, // In range
                    { timestamp: 2000, pitch: 260, volume: 0.5 }, // High issue
                    { timestamp: 2500, pitch: 260, volume: 0.5 },
                ],
            };

            const result = analysisEngine.analyze(recordingData, mockTranscript, mockTargetRange);

            expect(result.issues).toHaveLength(2);
            expect(result.issues[0].type).toBe('low');
            expect(result.issues[1].type).toBe('high');
        });
    });
});
