import { io } from 'socket.io-client';

export const MainDSP = {
    hzToSemitones: (hz) => 12 * Math.log2(hz / 440) + 69,
    // FEATURE: MEDIAN SMOOTHING
    // Helps remove jitter from the pitch graph by taking the median of the last N frames
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
        this.analyser = null;
        this.microphone = null;
        this.onAudioUpdate = onAudioUpdate;
        this.isActive = false;
        this.mediaRecorder = null;
        this.analysisRecorder = null;
        this.chunks = [];
        this.analysisChunks = [];
        this.toneEngine = null;
        this.pitchBuffer = [];
        this.smoothPitchBuffer = [];
        this.isRecordingForAnalysis = false;
        this.animationFrameId = null;

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
            workletLoaded: false, // Legacy flag
            micActive: false,
            contextState: 'unknown',
            socketConnected: false
        };
    }

    async start() {
        if (this.isActive) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({ latencyHint: 'interactive' });
            this.debugInfo.contextState = this.audioContext.state;

            // Unlock AudioContext
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.debugInfo.contextState = this.audioContext.state;
            this.toneEngine = new ToneEngine(this.audioContext);

            // Initialize Socket
            const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            console.log(`[AudioEngine] Connecting to backend at: ${BACKEND_URL}`);

            this.socket = io(BACKEND_URL);
            this.socket.on('connect', () => {
                console.log("[AudioEngine] Socket connected");
                this.debugInfo.socketConnected = true;
            });
            this.socket.on('disconnect', () => {
                console.log("[AudioEngine] Socket disconnected");
                this.debugInfo.socketConnected = false;
            });
            this.socket.on('analysis_update', (data) => {
                this.latestBackendAnalysis = { ...data, timestamp: Date.now() };
            });

            console.log("[AudioEngine] Requesting microphone access...");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 1
                }
            });
            console.log("[AudioEngine] Microphone access granted");

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.debugInfo.micActive = true;

            // --- ANALYSER NODE SETUP (Fallback Implementation) ---
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.1;

            // Filters
            this.highpass = this.audioContext.createBiquadFilter();
            this.highpass.type = 'highpass';
            this.highpass.frequency.value = 80;

            this.lowpass = this.audioContext.createBiquadFilter();
            this.lowpass.type = 'lowpass';
            this.lowpass.frequency.value = 8000;

            // Connect Chain: Mic -> Highpass -> Lowpass -> Analyser
            this.microphone.connect(this.highpass);
            this.highpass.connect(this.lowpass);
            this.lowpass.connect(this.analyser);

            // Also connect to a destination to ensure flow, but mute it to avoid feedback
            // (Some browsers optimize away unconnected nodes)
            // const muteGain = this.audioContext.createGain();
            // muteGain.gain.value = 0;
            // this.analyser.connect(muteGain);
            // muteGain.connect(this.audioContext.destination);

            console.log("[AudioEngine] ✅ Audio chain connected: Mic -> Filters -> Analyser");

            this.isActive = true;
            this.debugInfo.state = 'active';

            // Start Analysis Loop
            this.startAnalysisLoop();

        } catch (err) {
            console.error("Audio init error:", err);
            this.debugInfo.error = err.message;
            this.debugInfo.state = 'error';
            alert("Mic access denied or Audio error: " + err.message);
        }
    }

    startAnalysisLoop() {
        const bufferLength = this.analyser.fftSize;
        const timeData = new Float32Array(bufferLength);
        const freqData = new Uint8Array(bufferLength / 2);

        const loop = () => {
            if (!this.isActive) return;
            this.animationFrameId = requestAnimationFrame(loop);

            this.analyser.getFloatTimeDomainData(timeData);
            this.analyser.getByteFrequencyData(freqData);

            // 1. Calculate RMS (Volume)
            let rms = 0;
            for (let i = 0; i < bufferLength; i++) {
                rms += timeData[i] * timeData[i];
            }
            rms = Math.sqrt(rms / bufferLength);

            // 2. Pitch Detection (YIN Algorithm - Simplified)
            let pitch = -1;
            // Only calculate pitch if volume is above threshold
            if (rms > 0.01) {
                pitch = this.calculatePitchYIN(timeData, this.audioContext.sampleRate);
            }

            // 3. Spectral Centroid (Resonance)
            let spectralCentroid = 0;
            let sumMag = 0;
            let sumWeighted = 0;
            for (let i = 0; i < freqData.length; i++) {
                const mag = freqData[i];
                const freq = i * this.audioContext.sampleRate / this.analyser.fftSize;
                sumMag += mag;
                sumWeighted += freq * mag;
            }
            if (sumMag > 0) spectralCentroid = sumWeighted / sumMag;

            // 4. Smoothing
            let smoothPitch = pitch;
            if (pitch > 0) {
                this.smoothPitchBuffer.push(pitch);
                if (this.smoothPitchBuffer.length > 5) this.smoothPitchBuffer.shift();
                smoothPitch = MainDSP.median(this.smoothPitchBuffer);
            } else {
                this.smoothPitchBuffer = [];
                smoothPitch = -1;
            }

            // 5. Prosody
            const prosody = this.analyzeProsody(smoothPitch);

            // 6. Resonance Score (Fallback)
            let finalScore = 50;
            let isBackendActive = false;
            const now = Date.now();
            const lastUpdate = this.latestBackendAnalysis.timestamp || 0;

            if (this.socket && this.socket.connected && (now - lastUpdate < 2000)) {
                finalScore = this.latestBackendAnalysis.rbi_score || 50;
                isBackendActive = true;
            } else {
                if (spectralCentroid > 0) {
                    const minC = 500;
                    const maxC = 2500;
                    const norm = Math.max(0, Math.min(1, (spectralCentroid - minC) / (maxC - minC)));
                    finalScore = norm * 100;
                } else {
                    finalScore = 0;
                }
            }

            // Send Update
            this.onAudioUpdate({
                pitch: smoothPitch,
                resonance: spectralCentroid,
                resonanceScore: finalScore,
                rbi: finalScore,
                isBackendActive,
                spectralCentroid,
                f1: 0, // Not calculated in fallback
                f2: 0, // Not calculated in fallback
                weight: 50, // Placeholder
                volume: rms,
                jitter: 0,
                shimmer: 0,
                vowel: '',
                prosody,
                spectrum: freqData,
                debug: {
                    backend: this.latestBackendAnalysis,
                    method: 'AnalyserNode (Fallback)'
                }
            });
        };
        loop();
    }

    calculatePitchYIN(buffer, sampleRate) {
        const threshold = 0.15;
        const bufferSize = buffer.length;
        const halfSize = Math.floor(bufferSize / 2);
        const yinBuffer = new Float32Array(halfSize);

        // Difference function
        for (let tau = 0; tau < halfSize; tau++) {
            for (let i = 0; i < halfSize; i++) {
                const delta = buffer[i] - buffer[i + tau];
                yinBuffer[tau] += delta * delta;
            }
        }

        // Cumulative mean normalized difference function
        yinBuffer[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < halfSize; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] *= tau / runningSum;
        }

        // Absolute threshold
        let tau = 0;
        for (tau = 2; tau < halfSize; tau++) {
            if (yinBuffer[tau] < threshold) {
                while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                break;
            }
        }

        if (tau == halfSize || yinBuffer[tau] >= threshold) return -1;

        // Parabolic interpolation
        let betterTau = tau;
        if (tau > 0 && tau < halfSize - 1) {
            const s0 = yinBuffer[tau - 1];
            const s1 = yinBuffer[tau];
            const s2 = yinBuffer[tau + 1];
            let adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
            betterTau += adjustment;
        }

        const pitch = sampleRate / betterTau;
        if (pitch < 50 || pitch > 1000) return -1;
        return pitch;
    }

    analyzeProsody(currentPitch) {
        if (currentPitch > 0) this.pitchBuffer.push(currentPitch); else if (this.pitchBuffer.length > 0) this.pitchBuffer.push(0);
        if (this.pitchBuffer.length > 100) this.pitchBuffer.shift();
        const validP = this.pitchBuffer.filter(p => p > 50 && p < 600);
        if (validP.length < 10) return { semitoneRange: 0, slopeDirection: 'flat' };
        let minP = Math.min(...validP); let maxP = Math.max(...validP); const stRange = MainDSP.hzToSemitones(maxP) - MainDSP.hzToSemitones(minP);
        const contour = Math.min(1, stRange / 12); // Normalize 0-12 semitones to 0-1
        const recent = validP.slice(-20); if (recent.length < 5) return { semitoneRange: stRange, slopeDirection: 'flat', contour };
        const first = recent[0]; const last = recent[recent.length - 1]; const diff = last - first; let direction = 'flat'; if (diff > 5) direction = 'rising'; if (diff < -5) direction = 'falling';
        return { semitoneRange: stRange, slopeDirection: direction, contour };
    }

    playFeedbackTone(freq) { if (this.toneEngine) this.toneEngine.play(freq, 0.15, 'sine'); }

    startRecording() { if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') { this.chunks = []; this.mediaRecorder.start(); } }
    async stopRecording() { return new Promise((resolve) => { if (this.mediaRecorder && this.mediaRecorder.state === 'recording') { this.mediaRecorder.onstop = () => { const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' }); resolve(window.URL.createObjectURL(blob)); }; this.mediaRecorder.stop(); } else { resolve(null); } }); }

    async startAnalysisRecording() {
        // Placeholder for now
        return false;
    }
    async stopAnalysisRecording() { return null; }
    async blobToAudioBuffer(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }

    stop() {
        if (!this.isActive) return;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.microphone) this.microphone.disconnect();
        if (this.analyser) this.analyser.disconnect();
        if (this.audioContext) this.audioContext.close();
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isActive = false;
    }

    setNoiseGate(threshold) {
        // Not implemented in fallback
    }

    getDebugState() {
        return this.debugInfo;
    }
}
