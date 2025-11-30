import { io } from 'socket.io-client';
import { DSP } from '../utils/DSP';

export const MainDSP = {
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
        this.pitchBuffer = [];
        this.smoothPitchBuffer = [];
        this.lastPitch = 0;
        this.lastValidPitch = 0; // For octave jump protection
        this.pitchConfidenceThreshold = 0.6; // Minimum confidence to accept pitch
        this.jitterBuffer = [];
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

        this.socketBuffer = [];
        this.MAX_BUFFER_SIZE = 50;

        this.filterSettings = { min: 80, max: 8000 };
        this.calibration = { min: 500, max: 2500 };
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

            this.toneEngine = new ToneEngine(this.audioContext);

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

            // Initialize MediaRecorder
            if (stream) {
                try {
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.mediaRecorder.ondataavailable = (e) => {
                        if (e.data.size > 0) this.chunks.push(e.data);
                    };
                } catch (e) {
                    console.error("MediaRecorder init failed:", e);
                }
            }

            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.debugInfo.micActive = true;

            // Filters
            this.highpass = this.audioContext.createBiquadFilter();
            this.highpass.type = 'highpass';
            this.highpass.frequency.value = this.filterSettings.min;

            this.lowpass = this.audioContext.createBiquadFilter();
            this.lowpass.type = 'lowpass';
            this.lowpass.frequency.value = this.filterSettings.max;

            // Analyser for Main Thread Processing
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0;

            // Connect Chain: Mic -> Highpass -> Lowpass -> Analyser
            this.microphone.connect(this.highpass);
            this.highpass.connect(this.lowpass);
            this.lowpass.connect(this.analyser);

            console.log("[AudioEngine] ✅ Audio chain connected: Mic -> Filters -> Analyser (Main Thread)");

            this.isActive = true;
            this.debugInfo.state = 'active';

            // Start Processing Loop
            this.processAudioFrame();

        } catch (err) {
            console.error("Audio init error:", err);
            this.debugInfo.error = err.message;
            this.debugInfo.state = 'error';
            alert("Mic access denied or Audio error: " + err.message);
        }
    }

    processAudioFrame() {
        if (!this.isActive) return;

        this.animationFrameId = requestAnimationFrame(() => this.processAudioFrame());

        const buffer = new Float32Array(this.analyser.fftSize);
        this.analyser.getFloatTimeDomainData(buffer);

        // Calculate RMS
        let rms = 0;
        for (let x of buffer) rms += x * x;
        rms = Math.sqrt(rms / buffer.length);

        // Adaptive Noise Gate
        if (rms <= this.adaptiveThreshold) {
            this.silenceFrameCount++;
            if (this.silenceFrameCount > 10) { // ~160ms
                this.backgroundNoiseBuffer.push(rms);
                if (this.backgroundNoiseBuffer.length > 50) this.backgroundNoiseBuffer.shift();
                if (this.backgroundNoiseBuffer.length > 10) {
                    const median = DSP.median(this.backgroundNoiseBuffer);
                    this.adaptiveThreshold = Math.max(0.0001, Math.min(0.02, median * 2.5));
                }
            }
        } else {
            this.silenceFrameCount = 0;
        }

        // Process if signal present (or always for now to be safe)
        if (rms >= 0) {
            const fs = this.audioContext.sampleRate;
            const TARGET_RATE = 16000;
            const dsBuffer = DSP.decimate(buffer, fs, TARGET_RATE);

            // Send to backend (decimated)
            if (rms > this.adaptiveThreshold) {
                this.sendAudioChunk(dsBuffer);
            }

            // DSP Analysis
            const preEmphasized = new Float32Array(dsBuffer.length);
            preEmphasized[0] = dsBuffer[0];
            for (let i = 1; i < dsBuffer.length; i++) {
                preEmphasized[i] = dsBuffer[i] - 0.97 * dsBuffer[i - 1];
            }

            const windowed = DSP.applyWindow(preEmphasized);

            // Pitch
            const dynamicThreshold = 0.15;
            const { pitch: rawPitch, confidence: pitchConfidence } = DSP.calculatePitchYIN(buffer, fs, dynamicThreshold);

            let pitch = rawPitch;

            // Octave Jump Protection & Confidence Check
            if (pitch > 0 && pitchConfidence > this.pitchConfidenceThreshold) {
                // Check for octave jumps if we have a valid previous pitch
                if (this.lastValidPitch > 0) {
                    const ratio = pitch / this.lastValidPitch;
                    // If pitch jumps ~2x (octave up) or ~0.5x (octave down) suddenly
                    // We only allow it if confidence is VERY high, otherwise we might stick to previous
                    // or if it persists (handled by smoothing buffer usually, but here we reject outliers)

                    const isOctaveJump = (ratio > 1.8 && ratio < 2.2) || (ratio > 0.4 && ratio < 0.6);

                    if (isOctaveJump && pitchConfidence < 0.9) {
                        // Likely an octave error, ignore this frame's pitch or use last valid
                        pitch = -1;
                    } else {
                        this.lastValidPitch = pitch;
                    }
                } else {
                    this.lastValidPitch = pitch;
                }
            } else {
                pitch = -1; // Treat low confidence as no pitch
            }

            const spectrum = DSP.simpleFFT(windowed);

            // Vowel Analysis (Only if not silent and has pitch/resonance)
            let vowel = '';
            // Only run expensive formant analysis if we have significant signal
            if (rms > this.adaptiveThreshold * 2) {
                const lpcOrder = 12;
                const r = DSP.computeAutocorrelation(windowed, lpcOrder);
                const { a, error } = DSP.levinsonDurbin(r, lpcOrder);
                const lpcEnvelope = DSP.computeLPCSpectrum(a, error, 512);
                const formantCandidates = DSP.findPeaks(lpcEnvelope, TARGET_RATE);

                let p1 = { freq: 0, amp: -Infinity };
                let p2 = { freq: 0, amp: -Infinity };

                for (let candidate of formantCandidates) {
                    if (candidate.freq >= 200 && candidate.freq <= 1200) {
                        if (candidate.amp > p1.amp) p1 = candidate;
                    }
                }
                for (let candidate of formantCandidates) {
                    if (candidate.freq >= 1200 && candidate.freq <= 3500) {
                        if (candidate.amp > p2.amp) p2 = candidate;
                    }
                }

                // Formant Smoothing
                if (!this.smoothedF1) this.smoothedF1 = p1.freq;
                if (!this.smoothedF2) this.smoothedF2 = p2.freq;

                if (p1.freq > 0) {
                    const diff = Math.abs(p1.freq - this.smoothedF1);
                    const alpha = diff > 100 ? 0.3 : 0.1;
                    this.smoothedF1 = this.smoothedF1 * (1 - alpha) + p1.freq * alpha;
                }
                if (p2.freq > 0) {
                    const diff = Math.abs(p2.freq - this.smoothedF2);
                    const alpha = diff > 150 ? 0.3 : 0.1;
                    this.smoothedF2 = this.smoothedF2 * (1 - alpha) + p2.freq * alpha;
                }

                vowel = DSP.estimateVowel(this.smoothedF1, this.smoothedF2);
            } else {
                // Reset formants on silence to prevent "ghost" dots
                this.smoothedF1 = 0;
                this.smoothedF2 = 0;
                vowel = '';
            }

            // Prepare Update
            this.handleUpdate({
            });
        }
    }

    handleUpdate(data) {
        if (!this.isActive) return;

        const { pitch, pitchConfidence, resonance, resonanceConfidence, volume, jitter, shimmer, vowel, spectrum, isSilent, weight, f1, f2 } = data;

        // Smoothing for UI
        let smoothPitch = pitch;
        if (pitch > 0) {
            this.smoothPitchBuffer.push(pitch);
            if (this.smoothPitchBuffer.length > 5) this.smoothPitchBuffer.shift();
            smoothPitch = MainDSP.median(this.smoothPitchBuffer);
        } else {
            this.smoothPitchBuffer = [];
            smoothPitch = -1;
        }

        // Prosody
        const prosody = this.analyzeProsody(smoothPitch);

        // Resonance Score
        let finalScore = 50;
        let isBackendActive = false;
        const now = Date.now();
        const lastUpdate = this.latestBackendAnalysis.timestamp || 0;

        if (this.socket && this.socket.connected && (now - lastUpdate < 2000)) {
            finalScore = this.latestBackendAnalysis.rbi_score || 50;
            isBackendActive = true;
        } else {
            if (resonance > 0) {
                const minC = this.calibration.min;
                const maxC = this.calibration.max;
                const norm = Math.max(0, Math.min(1, (resonance - minC) / (maxC - minC)));
                finalScore = norm * 100;
            } else {
                finalScore = 0;
            }
        }

        this.onAudioUpdate({
            pitch: smoothPitch,
            pitchConfidence,
            resonance: resonance,
            resonanceConfidence,
            resonanceScore: finalScore,
            rbi: finalScore,
            isBackendActive,
            spectralCentroid: resonance,
            f1: f1 || 0,
            f2: f2 || 0,
            weight: weight || 50,
            volume: volume,
            jitter: jitter,
            shimmer: shimmer,
            vowel: vowel || '',
            prosody,
            spectrum: spectrum,
            debug: {
                backend: this.latestBackendAnalysis,
                method: 'MainThread (YIN)',
                pitchConfidence,
                resonanceConfidence
            }
        });
    }

    analyzeProsody(currentPitch) {
        if (currentPitch > 0) this.pitchBuffer.push(currentPitch); else if (this.pitchBuffer.length > 0) this.pitchBuffer.push(0);
        if (this.pitchBuffer.length > 100) this.pitchBuffer.shift();
        const validP = this.pitchBuffer.filter(p => p > 50 && p < 600);
        if (validP.length < 10) return { semitoneRange: 0, slopeDirection: 'flat' };
        let minP = Math.min(...validP); let maxP = Math.max(...validP); const stRange = MainDSP.hzToSemitones(maxP) - MainDSP.hzToSemitones(minP);
        const contour = Math.min(1, stRange / 12);
        const recent = validP.slice(-20); if (recent.length < 5) return { semitoneRange: stRange, slopeDirection: 'flat', contour };
        const first = recent[0]; const last = recent[recent.length - 1]; const diff = last - first; let direction = 'flat'; if (diff > 5) direction = 'rising'; if (diff < -5) direction = 'falling';
        return { semitoneRange: stRange, slopeDirection: direction, contour };
    }

    playFeedbackTone(freq) { if (this.toneEngine) this.toneEngine.play(freq, 0.15, 'sine'); }

    startRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
            this.chunks = [];
            this.mediaRecorder.start();
            console.log("[AudioEngine] Recording started");
        }
    }

    async stopRecording() {
        return new Promise((resolve) => {
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' });
                    console.log("[AudioEngine] Recording stopped, blob size:", blob.size);
                    resolve({ blob, url: window.URL.createObjectURL(blob) });
                };
                this.mediaRecorder.stop();
            } else {
                resolve(null);
            }
        });
    }

    async blobToAudioBuffer(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }

    stop() {
        if (!this.isActive) return;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.microphone) this.microphone.disconnect();
        if (this.audioContext) this.audioContext.close();
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isActive = false;
    }

    setFilters(lowCutoff, highCutoff) {
        this.filterSettings = { min: lowCutoff, max: highCutoff };
        if (this.highpass) this.highpass.frequency.value = lowCutoff;
        if (this.lowpass) this.lowpass.frequency.value = highCutoff;
    }

    setCalibration(min, max) {
        this.calibration = { min, max };
    }

    setNoiseGate(threshold) {
        // No-op for now, or update adaptiveThreshold logic
    }

    getDebugState() {
        return {
            ...this.debugInfo,
            bufferSize: this.socketBuffer.length
        };
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
            if (this.socketBuffer.length < this.MAX_BUFFER_SIZE) {
                this.socketBuffer.push(chunk);
            }
        }
    }

    flushSocketBuffer() {
        if (!this.socket || !this.socket.connected || this.socketBuffer.length === 0) return;
        console.log(`[AudioEngine] Flushing ${this.socketBuffer.length} buffered chunks...`);
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
}
