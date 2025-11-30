import { io } from 'socket.io-client';

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
        this.workletNode = null;
        this.microphone = null;
        this.onAudioUpdate = onAudioUpdate;
        this.isActive = false;
        this.mediaRecorder = null;
        this.chunks = [];
        this.toneEngine = null;
        this.pitchBuffer = [];
        this.smoothPitchBuffer = [];

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
            workletLoaded: false,
            micActive: false,
            contextState: 'unknown',
            socketConnected: false,
            bufferSize: 0,
            connectionLog: []
        };

        this.socketBuffer = [];
        this.MAX_BUFFER_SIZE = 50; // Store up to 50 chunks (approx 2-3 seconds)

        this.filterSettings = { min: 80, max: 8000 };
        this.calibration = { min: 500, max: 2500 }; // Default calibration
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

            this.socket.on('connect_error', (error) => {
                this.debugInfo.socketConnected = false;
                // Don't log every attempt to avoid spam, or log only unique errors
            });

            this.socket.on('analysis_update', (data) => {
                this.latestBackendAnalysis = { ...data, timestamp: Date.now() };
            });

            console.log("[AudioEngine] Requesting microphone access...");

            // CRITICAL: Explicitly disable audio processing features
            // The browser's noise suppression can be too aggressive and filter out all audio
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 1
                }
            });

            console.log("[AudioEngine] Microphone access granted");

            // Verify stream is active and log detailed info
            const audioTracks = stream.getAudioTracks();
            console.log(`[AudioEngine] Audio tracks: ${audioTracks.length}, Active: ${audioTracks.map(t => t.enabled && t.readyState === 'live').join(', ')}`);

            if (audioTracks.length > 0) {
                const track = audioTracks[0];
                const settings = track.getSettings();
                console.log(`[AudioEngine] Track settings:`, {
                    sampleRate: settings.sampleRate,
                    channelCount: settings.channelCount,
                    echoCancellation: settings.echoCancellation,
                    noiseSuppression: settings.noiseSuppression,
                    autoGainControl: settings.autoGainControl,
                    deviceId: settings.deviceId
                });
            }

            if (audioTracks.length === 0 || !audioTracks[0].enabled) {
                throw new Error("Microphone stream has no active audio tracks");
            }

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

            // CRITICAL: Ensure AudioContext is running after creating microphone source
            if (this.audioContext.state !== 'running') {
                console.log("[AudioEngine] AudioContext not running, resuming...");
                await this.audioContext.resume();
            }
            console.log(`[AudioEngine] AudioContext state: ${this.audioContext.state}`);

            // --- WORKLET SETUP ---
            try {
                // Use the sophisticated resonance processor
                await this.audioContext.audioWorklet.addModule('resonance-processor.js');
                this.debugInfo.workletLoaded = true;
                console.log("[AudioEngine] Worklet loaded (resonance-processor)");
            } catch (e) {
                console.error("[AudioEngine] Failed to load worklet:", e);
                throw new Error("Failed to load audio processor. Please refresh.");
            }

            this.workletNode = new AudioWorkletNode(this.audioContext, 'resonance-processor');

            // Handle messages from worklet
            this.workletNode.port.onmessage = (event) => {
                if (event.data.type === 'update') {
                    const payload = event.data.data;
                    // resonance-processor sends audioBuffer outside the data object
                    if (event.data.audioBuffer) {
                        payload.pcm = event.data.audioBuffer;
                    }
                    this.handleWorkletUpdate(payload);
                } else if (event.data.type === 'diagnostic') {
                    console.log(`[Worklet Diagnostic] ${event.data.message}`);
                }
            };

            this.workletNode.onprocessorerror = (err) => {
                console.error("[AudioEngine] Worklet error:", err);
                this.debugInfo.error = "Worklet crashed";
            };

            // Filters
            this.highpass = this.audioContext.createBiquadFilter();
            this.highpass.type = 'highpass';
            this.highpass.frequency.value = this.filterSettings.min;

            this.lowpass = this.audioContext.createBiquadFilter();
            this.lowpass.type = 'lowpass';
            this.lowpass.frequency.value = this.filterSettings.max;

            console.log(`[AudioEngine] Filter Config - Highpass: ${this.highpass.frequency.value}Hz, Lowpass: ${this.lowpass.frequency.value}Hz`);
            console.log(`[AudioEngine] Sample Rates - Context: ${this.audioContext.sampleRate}Hz, Mic: ${stream.getAudioTracks()[0].getSettings().sampleRate}Hz`);

            // Connect Chain: Mic -> Highpass -> Lowpass -> Worklet -> Destination (Muted)
            const muteGain = this.audioContext.createGain();
            muteGain.gain.value = 0;

            // DEBUG: BYPASS FILTERS TEMPORARILY
            // Original: this.microphone.connect(this.highpass); this.highpass.connect(this.lowpass); this.lowpass.connect(this.workletNode);
            console.log("[AudioEngine] ⚠️ DEBUG MODE: Bypassing filters (Mic -> Worklet directly)");
            this.microphone.connect(this.workletNode);

            this.workletNode.connect(muteGain);
            muteGain.connect(this.audioContext.destination);

            console.log("[AudioEngine] ✅ Audio chain connected: Mic -> Worklet (Filters Bypassed)");

            this.isActive = true;
            this.debugInfo.state = 'active';

        } catch (err) {
            console.error("Audio init error:", err);
            this.debugInfo.error = err.message;
            this.debugInfo.state = 'error';
            alert("Mic access denied or Audio error: " + err.message);
        }
    }

    handleWorkletUpdate(data) {
        if (!this.isActive) return;

        const { pitch, resonance, volume, jitter, shimmer, vowel, spectrum, isSilent, weight, f1, f2, pcm } = data;

        // Send to backend
        if (pcm && !isSilent) {
            this.sendAudioChunk(pcm);
        }

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

        // Resonance Score (Backend or Fallback)
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
            resonance: resonance,
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
                method: 'AudioWorklet (YIN)'
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
        if (this.microphone) this.microphone.disconnect();
        if (this.workletNode) {
            this.workletNode.disconnect();
            this.workletNode = null;
        }
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
        if (this.workletNode) {
            this.workletNode.port.postMessage({
                type: 'config',
                config: { noiseGateThreshold: threshold }
            });
        }
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

        const chunk = { pcm, sr: 16000 }; // Worklet sends 16k

        if (this.socket.connected) {
            this.socket.emit('audio_chunk', chunk);
        } else {
            // Buffer
            if (this.socketBuffer.length < this.MAX_BUFFER_SIZE) {
                this.socketBuffer.push(chunk);
            }
        }
    }

    flushSocketBuffer() {
        if (!this.socket || !this.socket.connected || this.socketBuffer.length === 0) return;

        console.log(`[AudioEngine] Flushing ${this.socketBuffer.length} buffered chunks...`);
        // Send all buffered chunks
        // We could batch them, but sending individually is simpler for now and likely fine for <50 chunks
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
            const startTime = Date.now();

            const collector = (data) => {
                if (data.volume !== undefined) samples.push(data.volume);
                // Check for clipping (assuming volume is RMS, but we can infer clipping if volume is very high or if we had raw peak data)
                // For now, let's assume volume > 0.95 is clipping risk
                if (data.volume > 0.95) clippingCount++;
            };

            // Hook into the update loop temporarily
            const originalHandler = this.onAudioUpdate;
            this.onAudioUpdate = (data) => {
                collector(data);
                if (originalHandler) originalHandler(data);
            };

            setTimeout(() => {
                // Restore handler
                this.onAudioUpdate = originalHandler;

                // Calculate metrics
                if (samples.length === 0) {
                    resolve({ score: 0, noiseFloor: 0, clipping: 0, message: "No audio detected" });
                    return;
                }

                const avgVolume = samples.reduce((a, b) => a + b, 0) / samples.length;
                const maxVolume = Math.max(...samples);
                const noiseFloorDb = 20 * Math.log10(avgVolume + 0.0001); // Approx dB

                let score = 100;
                let message = "Environment is perfect!";

                // Penalize for noise
                if (avgVolume > 0.1) { // Arbitrary threshold for "noisy"
                    score -= 30;
                    message = "Background noise detected. Try to find a quieter spot.";
                } else if (avgVolume > 0.05) {
                    score -= 10;
                    message = "Slight background noise.";
                }

                // Penalize for clipping
                if (clippingCount > 0) {
                    score -= 50;
                    message = "Microphone is clipping! Lower your input gain or move further away.";
                } else if (maxVolume > 0.9) {
                    score -= 20;
                    message = "Input levels are very high. Watch for clipping.";
                } else if (maxVolume < 0.01) {
                    score -= 40;
                    message = "Input level is too low. Move closer to the mic.";
                }

                resolve({
                    score: Math.max(0, Math.round(score)),
                    noiseFloor: Math.round(noiseFloorDb),
                    clipping: clippingCount,
                    avgVolume,
                    message
                });

            }, durationMs);
        });
    }
}
