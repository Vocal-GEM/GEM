import { io } from 'socket.io-client';
import { DSP } from '../utils/DSP';
import { PitchDetector } from '../utils/PitchDetector';
import { ResonanceCalculator } from '../utils/ResonanceCalculator';
import { FormantAnalyzer } from '../utils/FormantAnalyzer';

const MainDSP = {
    hzToSemitones: (hz) => 12 * Math.log2(hz / 440) + 69,
    median: (values) => {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const half = Math.floor(sorted.length / 2);
        if (sorted.length % 2) return sorted[half];
        return (sorted[half - 1] + sorted[half]) / 2.0;
    }
};

export class HapticEngine {
    constructor() { this.lastTrigger = 0; this.canVibrate = typeof navigator !== 'undefined' && !!navigator.vibrate; }
    trigger(pattern = [50]) { const now = Date.now(); if (now - this.lastTrigger < 300) return false; if (this.canVibrate) { try { navigator.vibrate(pattern); } catch (e) { } } this.lastTrigger = now; return true; }
}

export class ToneEngine {
    constructor(audioContext) { this.ctx = audioContext; this.lastTrigger = 0; }
    play(freq, duration = 0.1, type = 'sine') {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const now = Date.now(); if (now - this.lastTrigger < 200) return; this.lastTrigger = now;
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + duration);
    }
}



export class AudioEngine {
    constructor(onAudioUpdate) {
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.onAudioUpdate = onAudioUpdate;
        this.isActive = false;
        this.mediaRecorder = null;
        this.chunks = [];
        this.toneEngine = null;
        this.animationFrameId = null;

        // DSP State
        this.pitchBuffer = [];
        this.smoothPitchBuffer = [];
        this.pitchDetector = new PitchDetector({ minConfidence: 0.6 });
        this.resonanceCalculator = new ResonanceCalculator();
        this.formantAnalyzer = new FormantAnalyzer();
        this.jitterBuffer = [];
        this.weightBuffer = [];
        this.smoothedH1 = 0;
        this.smoothedH2 = 0;
        this.lastResonance = 0;
        this.smoothedCentroid = 0;
        this.smoothedF1 = 0;
        this.smoothedF2 = 0;
        this.shimmerBuffer = [];
        this.lastAmp = 0;

        // Noise Gate
        this.adaptiveThreshold = 0.0001;
        this.backgroundNoiseBuffer = [];
        this.silenceFrameCount = 0;
        // Socket.IO
        this.socket = null;
        this.latestBackendAnalysis = {
            rbi_score: 50,
            breathiness_score: 0,
            roughness_score: 0,
            strain_score: 0,
            timestamp: 0
        };

        // DEBUG STATE
        this.debugInfo = {
            state: 'init',
            error: null,
            micActive: false,
            contextState: 'unknown',
            socketConnected: false,
            bufferSize: 0,
            connectionLog: []
        };
        this.audioContext = new AudioContext({ latencyHint: 'interactive' });
        this.debugInfo.contextState = this.audioContext.state;

        // Unlock AudioContext
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);

        this.toneEngine = new ToneEngine(this.audioContext);
        this.hapticEngine = new HapticEngine();

        // Initialize Socket
        const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        this.socket = io(BACKEND_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        this.socket.on('connect', () => {
            this.debugInfo.socketConnected = true;
            this.logConnectionEvent('Connected');
            this.flushSocketBuffer();
        });

        this.socket.on('disconnect', (reason) => {
            this.debugInfo.socketConnected = false;
            this.logConnectionEvent(`Disconnected: ${reason}`);
        });

        this.socket.on('analysis_update', (data) => {
            this.latestBackendAnalysis = { ...data, timestamp: Date.now() };
        });

        // Clinical Metrics
        this.calibrationOffset = 90;
        this.hnrBuffer = [];
    }

    async start() {
        if (this.isActive) return;

        try {
            await this.audioContext.resume();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.microphone.connect(this.analyser);

            this.isActive = true;
            this.debugInfo.state = 'running';
            this.debugInfo.micActive = true;

            this.startProcessing();
        } catch (error) {
            console.error('AudioEngine start error:', error);
            this.debugInfo.error = error.message;
            this.debugInfo.state = 'error';
        }
    }

    logConnectionEvent(msg) {
        const time = new Date().toLocaleTimeString();
        this.debugInfo.connectionLog.unshift(`[${time}] ${msg}`);
        if (this.debugInfo.connectionLog.length > 10) this.debugInfo.connectionLog.pop();
    }

    sendAudioChunk(pcm) {
        if (!this.socket) return;
        const chunk = { pcm, sr: 16000 };
        if (this.socket.connected) {
            this.socket.emit('audio_chunk', chunk);
        } else {
            if (this.socketBuffer && this.socketBuffer.length < this.MAX_BUFFER_SIZE) {
                this.socketBuffer.push(chunk);
            }
        }
    }

    flushSocketBuffer() {
        if (!this.socket || !this.socket.connected || !this.socketBuffer || this.socketBuffer.length === 0) return;
        while (this.socketBuffer.length > 0) {
            const chunk = this.socketBuffer.shift();
            this.socket.emit('audio_chunk', chunk);
        }
    }

    async analyzeEnvironment(durationMs = 3000) {
        if (!this.isActive) await this.start();
        return new Promise((resolve) => {
            const samples = [];
            let clippingCount = 0;
            const collector = (data) => {
                if (data.volume !== undefined) samples.push(data.volume);
                if (data.volume > 0.95) clippingCount++;
            };
            const originalHandler = this.onAudioUpdate;
            this.onAudioUpdate = (data) => {
                collector(data);
                if (originalHandler) originalHandler(data);
            };
            setTimeout(() => {
                this.onAudioUpdate = originalHandler;
                if (samples.length === 0) {
                    resolve({ score: 0, noiseFloor: 0, clipping: 0, message: "No audio detected" });
                    return;
                }
                const avgVolume = samples.reduce((a, b) => a + b, 0) / samples.length;
                const maxVolume = Math.max(...samples);
                const noiseFloorDb = 20 * Math.log10(avgVolume + 0.0001);
                let score = 100;
                let message = "Environment is perfect!";
                if (avgVolume > 0.1) { score -= 30; message = "Background noise detected. Try to find a quieter spot."; }
                else if (avgVolume > 0.05) { score -= 10; message = "Slight background noise."; }
                if (clippingCount > 0) { score -= 50; message = "Microphone is clipping! Lower your input gain or move further away."; }
                else if (maxVolume > 0.9) { score -= 20; message = "Input levels are very high. Watch for clipping."; }
                else if (maxVolume < 0.01) { score -= 40; message = "Input level is too low. Move closer to the mic."; }
                resolve({ score: Math.max(0, Math.round(score)), noiseFloor: Math.round(noiseFloorDb), clipping: clippingCount, avgVolume, message });
            }, durationMs);
        });
    }

    async startLiveAnalysis() {
        if (this.isLiveAnalysisActive) return;

        try {
            if (!this.isActive) await this.start();

            // Load AudioWorklet if not already loaded
            try {
                await this.audioContext.audioWorklet.addModule(new URL('../audio/voice-quality-processor.js', import.meta.url));
            } catch (e) {
                // Ignore if already added or handle specific errors
                console.warn("AudioWorklet addModule warning:", e);
            }

            this.workletNode = new AudioWorkletNode(this.audioContext, 'voice-quality-processor');

            // Configure the worklet
            this.workletNode.port.postMessage({
                type: 'config',
                sampleRate: this.audioContext.sampleRate,
                targetSamples: Math.round(this.audioContext.sampleRate * 0.25)
            });

            this.workletNode.port.onmessage = (e) => {
                if (e.data.type === 'chunk') {
                    const pcm = new Float32Array(e.data.pcm);

                    // Calculate Intensity locally for UI responsiveness
                    const rms = DSP.calculateRMS(pcm);
                    const intensity = DSP.calculateDB(rms, this.calibrationOffset);

                    // Update latest analysis with local intensity
                    this.latestBackendAnalysis = {
                        ...this.latestBackendAnalysis,
                        intensity: intensity,
                        timestamp: Date.now()
                    };

                    // Emit to socket
                    if (this.socket && this.socket.connected) {
                        this.socket.emit('audio_chunk', {
                            pcm: e.data.pcm,
                            sr: e.data.sr
                        });
                    }

                    // Trigger update
                    if (this.onAudioUpdate) {
                        this.onAudioUpdate({
                            ...this.latestBackendAnalysis,
                            live: true
                        });
                    }
                }
            };

            // Connect: Source -> Worklet -> Destination (mute)
            // We need to connect the microphone to the worklet
            if (this.microphone) {
                this.microphone.connect(this.workletNode);
                this.workletNode.connect(this.audioContext.destination); // Needed for processing to happen? Usually yes, but maybe gain 0
            }

            this.isLiveAnalysisActive = true;
            this.debugInfo.state = 'live_analysis';

        } catch (error) {
            console.error("Failed to start live analysis:", error);
            throw error;
        }
    }

    stopLiveAnalysis() {
        if (!this.isLiveAnalysisActive) return;

        if (this.workletNode) {
            this.workletNode.disconnect();
            this.workletNode.port.onmessage = null;
            this.workletNode = null;
        }

        this.isLiveAnalysisActive = false;
        this.debugInfo.state = 'running'; // Revert to normal running state
    }

    startProcessing() {
        if (!this.isActive) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);

        const loop = () => {
            if (!this.isActive) return;
            this.animationFrameId = requestAnimationFrame(loop);

            this.analyser.getFloatTimeDomainData(dataArray);

            // Calculate Intensity
            const rms = DSP.calculateRMS(dataArray);
            const intensity = DSP.calculateDB(rms, this.calibrationOffset);

            // Process audio data here (simplified for brevity)
            // In a real implementation, you would call pitchDetector, resonanceCalculator, etc.

            // For now, just call the update handler with some dummy data or processed data
            if (this.onAudioUpdate) {
                this.onAudioUpdate({
                    volume: Math.max(...dataArray),
                    pitch: 0, // Placeholder
                    clarity: 0, // Placeholder
                    intensity: intensity
                });
            }
        };

        loop();
    }

    stop() {
        this.isActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.suspend();
        }
    }
}
