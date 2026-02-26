/* eslint-env node */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioEngine } from './AudioEngine';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
    io: vi.fn()
}));

// Mock pitchfinder
vi.mock('pitchfinder', () => ({
    Macleod: vi.fn(() => vi.fn((buffer) => 440)),
    McLeod: vi.fn(() => vi.fn((buffer) => 440)),
    YIN: vi.fn(() => vi.fn((buffer) => 440))
}));

// Mock AudioContext and browser APIs
const mockAudioContext = {
    createAnalyser: () => ({
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        connect: vi.fn(),
        disconnect: vi.fn(),
        getFloatTimeDomainData: vi.fn(),
        getByteFrequencyData: vi.fn(),
        getFloatFrequencyData: vi.fn(),
        frequencyBinCount: 1024
    }),
    createOscillator: () => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn() }
    }),
    createGain: () => ({
        connect: vi.fn(),
        gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), cancelScheduledValues: vi.fn() }
    }),
    createBiquadFilter: () => ({
        connect: vi.fn(),
        frequency: { value: 0 },
        type: 'lowpass'
    }),
    createBuffer: () => ({}),
    createBufferSource: () => ({
        connect: vi.fn(),
        start: vi.fn(),
        buffer: null
    }),
    createMediaStreamSource: () => ({
        connect: vi.fn(),
        disconnect: vi.fn()
    }),
    resume: vi.fn().mockResolvedValue(),
    suspend: vi.fn().mockResolvedValue(),
    close: vi.fn().mockResolvedValue(),
    destination: {},
    state: 'suspended',
    sampleRate: 44100
};

window.AudioContext = vi.fn().mockImplementation(function () { return mockAudioContext; });
window.webkitAudioContext = window.AudioContext;
window.alert = vi.fn(); // Mock alert to prevent JSDOM error

// Mock MediaRecorder
window.MediaRecorder = vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    ondataavailable: null,
    onstop: null,
    state: 'inactive'
}));

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
        getUserMedia: vi.fn().mockResolvedValue({
            getTracks: () => [{ stop: vi.fn() }]
        })
    },
    writable: true
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

describe('AudioEngine Socket Integration', () => {
    let engine;
    let mockSocket;
    let socketCallbacks = {};

    beforeEach(() => {
        // Setup Mock Socket
        socketCallbacks = {};
        mockSocket = {
            on: vi.fn((event, callback) => {
                socketCallbacks[event] = callback;
            }),
            emit: vi.fn(),
            connect: vi.fn(),
            disconnect: vi.fn(),
            connected: false
        };
        io.mockReturnValue(mockSocket);

        // Mock runtime config to enable backend
        vi.mock('../config/runtime', () => ({
            isBackendEnabled: () => true,
            getBackendUrl: () => 'http://localhost:5000'
        }));

        engine = new AudioEngine(() => { });
    });

    afterEach(() => {
        if (engine) engine.stop();
        vi.clearAllMocks();
    });

    it('should initialize socket on start', async () => {
        // Need to recreate engine because constructor is where socket init happens
        // and we just mocked isBackendEnabled inside beforeEach
        vi.resetModules();
        const { AudioEngine } = await import('./AudioEngine');

        engine = new AudioEngine(() => { });

        expect(io).toHaveBeenCalled();
        expect(engine.socket).toBeDefined();
    });

    it('should handle socket connection events', async () => {
        // Ensure socket is initialized
        const { AudioEngine } = await import('./AudioEngine');
        engine = new AudioEngine(() => { });

        // Simulate connect
        if (socketCallbacks['connect']) socketCallbacks['connect']();

        expect(engine.debugInfo.socketConnected).toBe(true);

        // Simulate disconnect
        if (socketCallbacks['disconnect']) socketCallbacks['disconnect']('transport close');

        expect(engine.debugInfo.socketConnected).toBe(false);
    });

    it('should emit audio_chunk when connected', async () => {
        const { AudioEngine } = await import('./AudioEngine');
        engine = new AudioEngine(() => { });

        // Mock socket connected state
        engine.socket.connected = true;

        const pcmData = new Float32Array(128).fill(0.5);
        engine.sendAudioChunk(pcmData);

        expect(engine.socket.emit).toHaveBeenCalledWith('audio_chunk', expect.objectContaining({
            pcm: pcmData,
            sr: 16000
        }));
    });

    it('should buffer chunks when disconnected and flush on connect', async () => {
        const { AudioEngine } = await import('./AudioEngine');
        engine = new AudioEngine(() => { });

        // Mock disconnected
        engine.socket.connected = false;

        const pcmData = new Float32Array(128).fill(0.5);
        engine.sendAudioChunk(pcmData);

        // Should NOT emit yet
        expect(engine.socket.emit).not.toHaveBeenCalled();
        expect(engine.socketBuffer.length).toBe(1);

        // Simulate connection
        engine.socket.connected = true;
        if (socketCallbacks['connect']) socketCallbacks['connect']();

        // Should flush buffer
        expect(engine.socket.emit).toHaveBeenCalledWith('audio_chunk', expect.objectContaining({
            pcm: pcmData
        }));
        expect(engine.socketBuffer.length).toBe(0);
    });

    it('should update latestBackendAnalysis on analysis_update', async () => {
        const { AudioEngine } = await import('./AudioEngine');
        engine = new AudioEngine(() => { });

        const analysisData = {
            rbi_score: 85,
            breathiness_score: 10,
            roughness_score: 5,
            strain_score: 0
        };

        if (socketCallbacks['analysis_update']) {
            socketCallbacks['analysis_update'](analysisData);
        }

        expect(engine.latestBackendAnalysis).toMatchObject(analysisData);
        expect(engine.latestBackendAnalysis.timestamp).toBeGreaterThan(0);
    });
});
