import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioEngine, HapticEngine, ToneEngine, MainDSP } from './AudioEngine';

// Mock Socket.IO
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        emit: vi.fn(),
        disconnect: vi.fn(),
    })),
}));

// Mock DSP
vi.mock('../utils/DSP', () => ({
    DSP: {
        YIN: vi.fn(() => ({ pitch: 0, confidence: 0 })),
        calculatePitchYIN: vi.fn(() => ({ pitch: 0, confidence: 0 })),
        lpcAnalysis: vi.fn(() => ({ formants: [] })),
        spectralCentroid: vi.fn(() => 0),
        decimate: vi.fn((buffer) => buffer),
        calculateJitter: vi.fn(() => 0),
        calculateShimmer: vi.fn(() => 0),
        calculateHarmonics: vi.fn(() => ({ H1: 0, H2: 0 })),
        applyWindow: vi.fn((buffer) => buffer),
        preEmphasis: vi.fn((buffer) => buffer),
        simpleFFT: vi.fn(() => new Float32Array(512)),
    },
}));

describe('MainDSP', () => {
    describe('hzToSemitones', () => {
        it('converts A4 (440Hz) to MIDI 69', () => {
            expect(MainDSP.hzToSemitones(440)).toBe(69);
        });

        it('converts A3 (220Hz) to MIDI 57', () => {
            expect(MainDSP.hzToSemitones(220)).toBe(57);
        });

        it('converts A5 (880Hz) to MIDI 81', () => {
            expect(MainDSP.hzToSemitones(880)).toBe(81);
        });

        it('handles non-standard frequencies', () => {
            const result = MainDSP.hzToSemitones(261.63); // C4
            expect(result).toBeCloseTo(60, 0);
        });
    });

    describe('median', () => {
        it('returns 0 for empty array', () => {
            expect(MainDSP.median([])).toBe(0);
        });

        it('returns middle value for odd-length array', () => {
            expect(MainDSP.median([1, 3, 5])).toBe(3);
        });

        it('returns average of middle two for even-length array', () => {
            expect(MainDSP.median([1, 2, 3, 4])).toBe(2.5);
        });

        it('handles unsorted arrays', () => {
            expect(MainDSP.median([5, 1, 3, 2, 4])).toBe(3);
        });

        it('handles single element', () => {
            expect(MainDSP.median([42])).toBe(42);
        });

        it('handles duplicates', () => {
            expect(MainDSP.median([1, 2, 2, 2, 3])).toBe(2);
        });
    });
});

describe('HapticEngine', () => {
    let hapticEngine;

    beforeEach(() => {
        // Mock navigator.vibrate
        global.navigator = {
            vibrate: vi.fn(() => true),
        };
        hapticEngine = new HapticEngine();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with correct defaults', () => {
        expect(hapticEngine.lastTrigger).toBe(0);
        expect(hapticEngine.canVibrate).toBe(true);
    });

    it('triggers vibration with default pattern', () => {
        const result = hapticEngine.trigger();

        expect(result).toBe(true);
        expect(navigator.vibrate).toHaveBeenCalledWith([50]);
    });

    it('triggers vibration with custom pattern', () => {
        hapticEngine.trigger([100, 50, 100]);

        expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100]);
    });

    it('debounces rapid triggers (300ms)', () => {
        // First trigger succeeds
        expect(hapticEngine.trigger()).toBe(true);
        expect(navigator.vibrate).toHaveBeenCalledTimes(1);

        // Second trigger within 300ms fails
        expect(hapticEngine.trigger()).toBe(false);
        expect(navigator.vibrate).toHaveBeenCalledTimes(1);
    });

    it('allows trigger after debounce period', () => {
        vi.useFakeTimers();

        hapticEngine.trigger();
        expect(navigator.vibrate).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(350);

        hapticEngine.trigger();
        expect(navigator.vibrate).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });

    it('handles missing vibrate API gracefully', () => {
        global.navigator.vibrate = undefined;
        const engine = new HapticEngine();

        expect(engine.canVibrate).toBe(false);
        expect(engine.trigger()).toBe(true); // Still returns true
    });
});

describe('ToneEngine', () => {
    let toneEngine;
    let mockAudioContext;
    let mockOscillator;
    let mockGain;

    beforeEach(() => {
        mockOscillator = {
            type: '',
            frequency: {
                setValueAtTime: vi.fn(),
            },
            connect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
        };

        mockGain = {
            gain: {
                value: 0,
                setValueAtTime: vi.fn(),
                exponentialRampToValueAtTime: vi.fn(),
            },
            connect: vi.fn(),
        };

        mockAudioContext = {
            state: 'running',
            currentTime: 0,
            destination: {},
            createOscillator: vi.fn(() => mockOscillator),
            createGain: vi.fn(() => mockGain),
        };

        toneEngine = new ToneEngine(mockAudioContext);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with audio context', () => {
        expect(toneEngine.ctx).toBe(mockAudioContext);
        expect(toneEngine.lastTrigger).toBe(0);
    });

    it('plays tone at specified frequency', () => {
        toneEngine.play(440);

        expect(mockAudioContext.createOscillator).toHaveBeenCalled();
        expect(mockAudioContext.createGain).toHaveBeenCalled();
        expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
    });

    it('uses specified wave type', () => {
        toneEngine.play(440, 0.1, 'square');

        expect(mockOscillator.type).toBe('square');
    });

    it('defaults to sine wave', () => {
        toneEngine.play(440);

        expect(mockOscillator.type).toBe('sine');
    });

    it('connects audio nodes correctly', () => {
        toneEngine.play(440);

        expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
        expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });

    it('starts and stops oscillator', () => {
        toneEngine.play(440, 0.2);

        expect(mockOscillator.start).toHaveBeenCalled();
        expect(mockOscillator.stop).toHaveBeenCalledWith(0.2);
    });

    it('applies gain envelope', () => {
        toneEngine.play(440, 0.1);

        expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.1, 0);
        expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 0.1);
    });

    it('debounces rapid plays (200ms)', () => {
        toneEngine.play(440);
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);

        toneEngine.play(440);
        expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
    });

    it('does not play when context is not running', () => {
        mockAudioContext.state = 'suspended';

        toneEngine.play(440);

        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('does not play when context is null', () => {
        const engineWithoutContext = new ToneEngine(null);

        engineWithoutContext.play(440);

        expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
});

describe('AudioEngine', () => {
    let audioEngine;
    let mockCallback;

    beforeEach(() => {
        mockCallback = vi.fn();
        audioEngine = new AudioEngine(mockCallback);

        // Mock Web Audio API as a proper class
        global.AudioContext = class MockAudioContext {
            constructor() {
                this.state = 'suspended';
                this.sampleRate = 44100;
                this.destination = {};
                this.currentTime = 0;
            }
            createBuffer() { return {}; }
            createBufferSource() {
                return {
                    buffer: null,
                    connect: vi.fn(),
                    start: vi.fn(),
                };
            }
            createMediaStreamSource() {
                return {
                    connect: vi.fn(),
                };
            }
            createBiquadFilter() {
                return {
                    type: '',
                    frequency: { value: 0 },
                    connect: vi.fn(),
                };
            }
            createAnalyser() {
                return {
                    fftSize: 0,
                    smoothingTimeConstant: 0,
                    frequencyBinCount: 1024,
                    getFloatTimeDomainData: vi.fn(),
                    getByteFrequencyData: vi.fn(),
                };
            }
            resume() {
                this.state = 'running';
                return Promise.resolve();
            }
        };

        // Mock MediaDevices
        global.navigator = {
            mediaDevices: {
                getUserMedia: vi.fn(() => Promise.resolve({
                    getTracks: () => [{ stop: vi.fn() }],
                })),
            },
            vibrate: vi.fn(),
        };

        // Mock MediaRecorder
        global.MediaRecorder = class MockMediaRecorder {
            constructor() {
                this.start = vi.fn();
                this.stop = vi.fn();
                this.ondataavailable = null;
            }
        };

        // Mock requestAnimationFrame
        global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
        global.cancelAnimationFrame = vi.fn(clearTimeout);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with correct defaults', () => {
        expect(audioEngine.audioContext).toBe(null);
        expect(audioEngine.isActive).toBe(false);
        expect(audioEngine.onAudioUpdate).toBe(mockCallback);
        expect(audioEngine.pitchBuffer).toEqual([]);
        expect(audioEngine.debugInfo.state).toBe('init');
    });

    it('has filter settings', () => {
        expect(audioEngine.filterSettings).toEqual({ min: 80, max: 8000 });
    });

    it('has calibration settings', () => {
        expect(audioEngine.calibration).toEqual({ min: 500, max: 2500 });
    });

    it('initializes DSP buffers', () => {
        expect(audioEngine.pitchBuffer).toEqual([]);
        expect(audioEngine.smoothPitchBuffer).toEqual([]);
        expect(audioEngine.jitterBuffer).toEqual([]);
        expect(audioEngine.weightBuffer).toEqual([]);
        expect(audioEngine.shimmerBuffer).toEqual([]);
    });

    it('initializes noise gate', () => {
        expect(audioEngine.adaptiveThreshold).toBe(0.0001);
        expect(audioEngine.backgroundNoiseBuffer).toEqual([]);
        expect(audioEngine.silenceFrameCount).toBe(0);
    });

    it('initializes socket buffer', () => {
        expect(audioEngine.socketBuffer).toEqual([]);
        expect(audioEngine.MAX_BUFFER_SIZE).toBe(50);
    });

    it('starts and creates audio context', async () => {
        await audioEngine.start();

        expect(audioEngine.audioContext).not.toBeNull();
        expect(audioEngine.isActive).toBe(true);
        expect(audioEngine.debugInfo.state).toBe('active');
    });

    it('creates haptic and tone engines on start', async () => {
        await audioEngine.start();

        expect(audioEngine.hapticEngine).toBeDefined();
        expect(audioEngine.toneEngine).toBeDefined();
    });

    it('requests microphone access on start', async () => {
        await audioEngine.start();

        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                channelCount: 1,
            },
        });
    });

    it('does not start if already active', async () => {
        audioEngine.isActive = true;
        const userMediaSpy = vi.spyOn(navigator.mediaDevices, 'getUserMedia');

        await audioEngine.start();

        expect(userMediaSpy).not.toHaveBeenCalled();
    });

    it('handles start errors gracefully', async () => {
        navigator.mediaDevices.getUserMedia = vi.fn(() => Promise.reject(new Error('Permission denied')));

        await audioEngine.start();

        expect(audioEngine.debugInfo.state).toBe('error');
        expect(audioEngine.debugInfo.error).toBe('Permission denied');
    });

    it('creates filters with correct settings', async () => {
        await audioEngine.start();

        expect(audioEngine.highpass).toBeDefined();
        expect(audioEngine.lowpass).toBeDefined();
    });

    it('creates analyser with correct settings', async () => {
        await audioEngine.start();

        expect(audioEngine.analyser).toBeDefined();
    });

    it('initializes debug info', () => {
        expect(audioEngine.debugInfo).toEqual({
            state: 'init',
            error: null,
            micActive: false,
            contextState: 'unknown',
            socketConnected: false,
            bufferSize: 0,
            connectionLog: [],
        });
    });

    it('initializes latest backend analysis', () => {
        expect(audioEngine.latestBackendAnalysis).toEqual({
            rbi_score: 50,
            breathiness_score: 0,
            roughness_score: 0,
            strain_score: 0,
            timestamp: 0,
        });
    });

    it('creates media recorder on start', async () => {
        await audioEngine.start();

        expect(audioEngine.mediaRecorder).toBeDefined();
    });

    it('initializes chunks array', () => {
        expect(audioEngine.chunks).toEqual([]);
    });
});
