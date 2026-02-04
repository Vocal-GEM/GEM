
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('WaveformService', () => {
    let mockDecodeAudioData;
    let mockGetChannelData;
    let WaveformService;

    beforeEach(async () => {
        vi.resetModules(); // Reset modules to clear singleton

        mockGetChannelData = vi.fn().mockReturnValue(new Float32Array(1000).fill(0.5));
        mockDecodeAudioData = vi.fn().mockResolvedValue({
            getChannelData: mockGetChannelData
        });

        class MockAudioContext {
            constructor() {
                this.state = 'running';
                this.close = vi.fn();
            }
            decodeAudioData(buffer) {
                return mockDecodeAudioData(buffer);
            }
        }

        globalThis.window.AudioContext = MockAudioContext;
        globalThis.window.webkitAudioContext = MockAudioContext;

        // Mock Blob
        globalThis.Blob = class {
            constructor(content) {
                this.content = content;
            }
            arrayBuffer() {
                return Promise.resolve(new ArrayBuffer(8));
            }
        };

        // Re-import the service after resetting modules
        const module = await import('./WaveformService');
        WaveformService = module;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should generate waveform data from a blob', async () => {
        const blob = new Blob(['dummy']);
        const waveform = await WaveformService.getWaveform(blob);

        expect(waveform).toHaveLength(100);
        expect(mockDecodeAudioData).toHaveBeenCalled();
        expect(waveform[0]).toBe(1);
    });

    it('should cache waveform data by ID', async () => {
        const blob = new Blob(['dummy']);
        const id = 'rec_123';

        await WaveformService.getWaveform(blob, id);
        expect(mockDecodeAudioData).toHaveBeenCalledTimes(1);

        const cachedWaveform = await WaveformService.getWaveform(blob, id);
        expect(mockDecodeAudioData).toHaveBeenCalledTimes(1);
        expect(cachedWaveform).toHaveLength(100);
    });

    it('should handle concurrency limit', async () => {
        // Mock slow decode
        mockDecodeAudioData.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            return { getChannelData: mockGetChannelData };
        });

        const blob = new Blob(['dummy']);
        const promises = [
            WaveformService.getWaveform(blob),
            WaveformService.getWaveform(blob),
            WaveformService.getWaveform(blob),
            WaveformService.getWaveform(blob)
        ];

        await Promise.all(promises);
        expect(mockDecodeAudioData).toHaveBeenCalledTimes(4);
    });
});
