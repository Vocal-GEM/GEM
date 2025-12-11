/* eslint-env node */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioEngine } from './AudioEngine';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
    io: vi.fn()
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
        getFloatFrequencyData: vi.fn()
    }),
    createOscillator: () => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn() }
    }),
    createGain: () => ({
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() }
    }),
    createBiquadFilter: () => ({
        connect: vi.fn(),
        frequency: { value: 0 },
        type: 'lowpass'
    }),
    createBuffer: () => ({}),
    createBufferSource: () => ({
        connect: vi.fn(),
        start: vi.fn()
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

        engine = new AudioEngine(() => { });
    });

    afterEach(() => {
        if (engine) engine.stop();
        vi.clearAllMocks();
    });

    it('should initialize socket on start', async () => {
        await engine.start();
        expect(io).toHaveBeenCalled();
        expect(engine.socket).toBe(mockSocket);
    });

    it('should handle socket connection events', async () => {
        await engine.start();

        // Simulate connect
        mockSocket.connected = true;
        if (socketCallbacks['connect']) socketCallbacks['connect']();

        expect(engine.debugInfo.socketConnected).toBe(true);

        // Simulate disconnect
        mockSocket.connected = false;
        if (socketCallbacks['disconnect']) socketCallbacks['disconnect']('transport close');

        expect(engine.debugInfo.socketConnected).toBe(false);
    });

    it('should emit audio_chunk when connected', async () => {
        await engine.start();
        mockSocket.connected = true;

        const pcmData = new Float32Array(128).fill(0.5);
        engine.sendAudioChunk(pcmData);

        expect(mockSocket.emit).toHaveBeenCalledWith('audio_chunk', expect.objectContaining({
            pcm: pcmData,
            sr: 16000
        }));
    });

    it('should buffer chunks when disconnected and flush on connect', async () => {
        await engine.start();
        mockSocket.connected = false;

        const pcmData = new Float32Array(128).fill(0.5);
        engine.sendAudioChunk(pcmData);

        // Should NOT emit yet
        expect(mockSocket.emit).not.toHaveBeenCalled();
        expect(engine.socketBuffer.length).toBe(1);

        // Simulate connection
        mockSocket.connected = true;
        if (socketCallbacks['connect']) socketCallbacks['connect']();

        // Should flush buffer
        expect(mockSocket.emit).toHaveBeenCalledWith('audio_chunk', expect.objectContaining({
            pcm: pcmData
        }));
        expect(engine.socketBuffer.length).toBe(0);
    });

    it('should update latestBackendAnalysis on analysis_update', async () => {
        await engine.start();

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
