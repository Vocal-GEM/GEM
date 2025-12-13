import { io } from 'socket.io-client';
import { DSP } from '../utils/DSP';
import { PitchDetector } from '../utils/PitchDetector';
import { ResonanceCalculator } from '../utils/ResonanceCalculator';
import { FormantAnalyzer } from '../utils/FormantAnalyzer';



export class HapticEngine {
    constructor() { this.lastTrigger = 0; this.canVibrate = typeof navigator !== 'undefined' && !!navigator.vibrate; }
    trigger(pattern = [50]) { const now = Date.now(); if (now - this.lastTrigger < 300) return false; if (this.canVibrate) { try { navigator.vibrate(pattern); } catch (e) { /* ignore */ } } this.lastTrigger = now; return true; }
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
        this.socketBuffer = [];
        this.MAX_BUFFER_SIZE = 50;
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

        // Unlock AudioContext logic moved to start()

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
            this.retryCount = 0; // Reset retry count on successful connection
            this.logConnectionEvent('Connected');
            this.flushSocketBuffer();
        });

        this.socket.on('disconnect', (reason) => {
            this.debugInfo.socketConnected = false;
            this.logConnectionEvent(`Disconnected: ${reason}`);
        });

        this.socket.on('connect_error', (error) => {
            this.debugInfo.socketConnected = false;
            this.debugInfo.error = 'Connection failed. Retrying...';
            this.logConnectionEvent(`Connection error: ${error.message}`);

            // Exponential backoff retry (max 10 seconds)
            const retryDelay = Math.min(1000 * Math.pow(2, this.retryCount), 10000);
            this.retryCount = (this.retryCount || 0) + 1;

            setTimeout(() => {
                if (!this.debugInfo.socketConnected && this.socket) {
                    this.socket.connect();
                }
            }, retryDelay);
        });

        this.socket.on('analysis_update', (data) => {
            this.latestBackendAnalysis = { ...data, timestamp: Date.now() };
        });

        // Clinical Metrics
        this.calibrationOffset = 90;
        this.hnrBuffer = [];

        // Listen Mode (Passthrough)
        this.passthroughGain = this.audioContext.createGain();
        this.passthroughGain.gain.value = 0; // Muted by default
        this.passthroughGain.connect(this.audioContext.destination);
    }

    async start() {
        if (this.isActive) return;

        try {
            await this.audioContext.resume();

            // Unlock AudioContext with silent buffer
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.fftSize = 2048;
            this.microphone.connect(this.analyser);

            // Connect to passthrough (already connected to destination, but gain is 0)
            this.microphone.connect(this.passthroughGain);

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

                    // --- Jitter / Shimmer Calculation (Main Thread from Worklet Chunks) ---
                    // Note: Worklet chunks might be small (e.g. 128 or 4096 frames). 
                    // YIN needs ~2048 for good low pitch detection.

                    // We can reuse the buffers we defined (ensure they are initialized)
                    if (!this.analysisPitchBuffer) this.analysisPitchBuffer = [];
                    if (!this.analysisAmpBuffer) this.analysisAmpBuffer = [];

                    // Calculate Pitch on this chunk (might be less accurate if chunk is small)
                    // If chunk is small, we might want to circular buffer Pcm data?
                    // Assuming chunk size is decent (set to 0.25s in config -> ~11000 samples? No, 4096 usually)
                    const { pitch, confidence } = DSP.calculatePitchYIN(pcm, this.audioContext.sampleRate, 0.2);

                    let jitter = 0;
                    let shimmer = 0;
                    let hnr = 0;

                    let maxAmp = 0;
                    for (let i = 0; i < pcm.length; i++) if (Math.abs(pcm[i]) > maxAmp) maxAmp = Math.abs(pcm[i]);

                    if (pitch > 50 && confidence > 0.8) {
                        const period = 1.0 / pitch;
                        this.analysisPitchBuffer.push(period);
                        this.analysisAmpBuffer.push(maxAmp);

                        if (this.analysisPitchBuffer.length > 15) this.analysisPitchBuffer.shift();
                        if (this.analysisAmpBuffer.length > 15) this.analysisAmpBuffer.shift();

                        if (this.analysisPitchBuffer.length > 5) {
                            jitter = DSP.calculateJitter(this.analysisPitchBuffer);
                            shimmer = DSP.calculateShimmer(this.analysisAmpBuffer);
                        }

                        // Simple HNR proxy from confidence
                        hnr = 10 * Math.log10(confidence / (1.001 - confidence));
                    } else {
                        // Decay
                        if (Math.random() > 0.9) { // Slow decay
                            this.analysisPitchBuffer = [];
                            this.analysisAmpBuffer = [];
                        }
                    }

                    // Update latest analysis with local metrics
                    this.latestBackendAnalysis = {
                        ...this.latestBackendAnalysis,
                        intensity: intensity,
                        pitch: pitch,
                        jitter: jitter,
                        shimmer: shimmer,
                        hnr: hnr,
                        clarity: confidence,
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

        const bufferLength = this.analyser.frequencyBinCount; // 1024 if fftSize is 2048
        const dataArray = new Float32Array(bufferLength);

        // Buffers for calculating perturbation metrics over time (e.g., last 10-20 frames)
        this.visualPitchBuffer = []; // Store 1/F0
        this.visualAmpBuffer = [];   // Store Peak Amplitude

        const loop = () => {
            if (!this.isActive) return;
            this.animationFrameId = requestAnimationFrame(loop);

            // If Live Analysis (Worklet) is active, it handles the metrics and updates.
            // We exit here to avoid redundant processing and double-updates.
            if (this.isLiveAnalysisActive) return;

            this.analyser.getFloatTimeDomainData(dataArray);

            // --- NEW: Spectral Tilt Calculation ---
            // We need frequency data for tilt/weight analysis
            const freqBufferLength = this.analyser.frequencyBinCount;
            const freqData = new Float32Array(freqBufferLength);
            this.analyser.getFloatFrequencyData(freqData);

            // Approximate Spectral Tilt (db/octave proxy)
            // Compare Energy in 0-1kHz vs 1kHz-4kHz
            // Bin size = SampleRate / FFTSize = 44100 / 2048 ~ 21.5 Hz
            // (Assuming Default AudioContext SampleRate, typically 44.1k or 48k. Using safe defaults)
            const sr = this.audioContext.sampleRate;
            const binSize = sr / (bufferLength * 2); // bufferLength is fftSize/2 e.g. 1024. Wait, fftSize is 2048. So binSize = sr/2048.

            // Define bands
            const bin1k = Math.floor(1000 / binSize);
            const bin4k = Math.floor(4000 / binSize);

            let sumLow = 0;
            let sumHigh = 0;

            // Sum Energy (not dB)
            for (let i = 1; i < bin1k; i++) { // Skip DC
                sumLow += Math.pow(10, freqData[i] / 10);
            }
            for (let i = bin1k; i < bin4k; i++) {
                sumHigh += Math.pow(10, freqData[i] / 10);
            }

            const dbLow = 10 * Math.log10(sumLow + 1e-10);
            const dbHigh = 10 * Math.log10(sumHigh + 1e-10);

            // 1k to 4k is 2 octaves.
            // Tilt = (High - Low) / Octaves
            const tilt = (dbHigh - dbLow) / 2.0;

            // --- VOCAL WEIGHT CALCULATION ---
            // Map spectral tilt to vocal weight (0-100 scale)
            // Tilt typically ranges from -20 (very heavy/pressed) to +10 (very light/airy)
            // We invert and scale: negative tilt = high weight, positive tilt = low weight
            // Center around tilt of -5 dB/octave as "neutral" (weight = 50)
            // Weight = 50 - (tilt * 5)  clamped to 0-100
            // So tilt of -10 -> weight = 50 - (-10 * 5) = 100 (heavy)
            // tilt of 0 -> weight = 50 - (0 * 5) = 50 (neutral)
            // tilt of +10 -> weight = 50 - (10 * 5) = 0 (light)
            let rawWeight = 50 - (tilt * 5);
            rawWeight = Math.max(0, Math.min(100, rawWeight));

            // Smooth the weight value
            this.smoothedWeight = this.smoothedWeight || 50;
            this.smoothedWeight = this.smoothedWeight * 0.85 + rawWeight * 0.15;
            const weight = this.smoothedWeight;
            // ---------------------------------

            // 1. Basic Signal Stats
            const rms = DSP.calculateRMS(dataArray);
            const intensity = DSP.calculateDB(rms, this.calibrationOffset);
            let maxAmp = 0;
            for (let i = 0; i < dataArray.length; i++) {
                if (Math.abs(dataArray[i]) > maxAmp) maxAmp = Math.abs(dataArray[i]);
            }

            // Noise Gate check
            if (maxAmp < (this.noiseGateThreshold || 0.01)) {
                if (this.onAudioUpdate) {
                    this.onAudioUpdate({
                        volume: 0,
                        pitch: 0,
                        clarity: 0,
                        intensity: -100,
                        jitter: 0,
                        shimmer: 0,
                        hnr: 0,
                        tilt: -20, // Default steep tilt for silence
                        weight: this.smoothedWeight || 50, // Preserve last weight value
                        isSilent: true // Flag for UI to handle silence
                    });
                }
                return; // Skip further processing for this frame
            }

            // 2. Pitch Detection (YIN)
            // Use local DSP static for synchronous calculation or this.pitchDetector if preferred.
            // Using DSP.calculatePitchYIN for direct access.
            const { pitch, confidence } = DSP.calculatePitchYIN(dataArray, this.audioContext.sampleRate, 0.2);

            // --- QUAD-CORE ANALYSIS METRICS ---
            let f3Noise = -100;
            let harmonicRatio = 0;

            if (pitch > 50) {
                // Module A: Texture (F3 Noise 2.3k-3.5k)
                f3Noise = DSP.calculateSpectralBalance(freqData, 2300, 3500, this.audioContext.sampleRate);

                // Module D: Mix/Registration (Harmonic Ratio)
                harmonicRatio = DSP.calculateHarmonicRatio(freqData, pitch, this.audioContext.sampleRate);
            }
            // ----------------------------------

            let jitter = 0;
            let shimmer = 0;
            let hnr = 0;

            if (pitch > 50 && confidence > 0.8) {
                const period = 1.0 / pitch;

                // Update Buffers
                this.visualPitchBuffer.push(period);
                this.visualAmpBuffer.push(maxAmp);

                // Keep last 15 frames (~250ms at 60fps) for smoothing
                if (this.visualPitchBuffer.length > 15) this.visualPitchBuffer.shift();
                if (this.visualAmpBuffer.length > 15) this.visualAmpBuffer.shift();

                // 3. Calculate Perturbation Metrics
                if (this.visualPitchBuffer.length > 5) {
                    jitter = DSP.calculateJitter(this.visualPitchBuffer);
                    shimmer = DSP.calculateShimmer(this.visualAmpBuffer);
                }

                // 4. Calculate HNR
                // We need autocorrelation. YIN does difference, but let's do a quick autocorr for HNR at the pitch lag.
                // Downsample for performance? 
                // Let's rely on a simplified check: 
                // HNR is related to YIN confidence (aperiodicity). 
                // HNR approx = 10 * log10(confidence / (1 - confidence)) ? 
                // Actually YIN 'confidence' = 1 - minDifference. 
                // So if confidence is 1.0, error is 0. HNR is infinite.
                // Let's use the explicit HNR function but only for the lag found by YIN.
                // Optimization: Only compute autocorr at the specific lag? 
                // No, calculateHNR needs the peak vs total power.
                // Let's use a simpler proxy for real-time: mapped confidence.
                // Clinical HNR usually requires full autocorr. 
                // Let's interpret YIN confidence as a quality metric directly for now to save CPU.
                // 0.8 confidence -> "Okay", 0.98 -> "Clean". 
                // Map 0.8-1.0 to 0-30dB range approx.
                hnr = 10 * Math.log10(confidence / (1.001 - confidence));
            } else {
                // Decay metrics if voice lost
                this.visualPitchBuffer = [];
                this.visualAmpBuffer = [];
            }

            // Process audio data here (simplified for brevity)
            // In a real implementation, you would call pitchDetector, resonanceCalculator, etc.

            // For now, just call the update handler with some dummy data or processed data
            if (this.onAudioUpdate) {
                this.onAudioUpdate({
                    volume: maxAmp,
                    pitch: pitch || 0,
                    clarity: confidence || 0,
                    intensity: intensity,
                    jitter: jitter,
                    shimmer: shimmer,
                    hnr: hnr,
                    tilt: tilt || -20,
                    weight: weight,
                    f3Noise: f3Noise,
                    harmonicRatio: harmonicRatio
                });
            }
        };

        loop();
    }

    // Explicitly add HNR calculation if needed for high precision mode, 
    // but the loop above uses a heuristic for performance.

    stop() {
        this.isActive = false;

        // Mute passthrough on stop
        if (this.passthroughGain) {
            this.passthroughGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
        }

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

    /**
     * Enable or disable audio passthrough (monitoring).
     * @param {boolean} enabled 
     */
    setPassthrough(enabled) {
        if (!this.passthroughGain) return;
        const now = this.audioContext.currentTime;
        // Ramp to avoid clicks
        this.passthroughGain.gain.cancelScheduledValues(now);
        this.passthroughGain.gain.setTargetAtTime(enabled ? 1.0 : 0, now, 0.1);
    }

    /**
     * Enable or disable listen mode (alias for setPassthrough for backward compatibility)
     * @param {boolean} enabled 
     */
    setListenMode(enabled) {
        this.setPassthrough(enabled);
    }

    /**
     * Set noise gate threshold
     * @param {number} threshold - Threshold value (0-1)
     */
    setNoiseGate(threshold) {
        // Store noise gate setting for use in processing loop
        this.noiseGateThreshold = threshold || 0.01;
    }

    /**
     * Set calibration values for dark/bright resonance
     * @param {number} dark - Dark resonance calibration value
     * @param {number} bright - Bright resonance calibration value
     */
    setCalibration(dark, bright) {
        this.calibrationDark = dark;
        this.calibrationBright = bright;
    }

    /**
     * Set frequency filters for pitch detection
     * @param {number} min - Minimum frequency filter
     * @param {number} max - Maximum frequency filter
     */
    setFilters(min, max) {
        this.filterMin = min;
        this.filterMax = max;
    }

    /**
     * Start recording audio to a clip
     * Uses MediaRecorder to capture audio data
     */
    async startRecording() {
        if (this.isRecording) return;

        // Make sure audio is active first
        if (!this.isActive) {
            await this.start();
        }

        try {
            // Get a fresh stream for recording
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            this.recordingChunks = [];
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm'
            });

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordingChunks.push(e.data);
                }
            };

            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            console.log('[AudioEngine] Recording started');
        } catch (error) {
            console.error('[AudioEngine] Failed to start recording:', error);
            throw error;
        }
    }

    /**
     * Stop recording and return the audio blob and analysis
     * @returns {Promise<{blob: Blob, url: string, duration: number, analysis: Object}>}
     */
    async stopRecording() {
        if (!this.mediaRecorder || !this.isRecording) {
            return null;
        }

        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordingChunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const duration = (Date.now() - this.recordingStartTime) / 1000;

                // Stop the recording stream tracks
                if (this.mediaRecorder.stream) {
                    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                }

                this.isRecording = false;
                this.recordingChunks = [];
                console.log('[AudioEngine] Recording stopped, duration:', duration, 's');

                resolve({
                    blob,
                    url,
                    duration,
                    analysis: {
                        // Return latest analysis data
                        ...this.latestBackendAnalysis
                    }
                });
            };

            this.mediaRecorder.stop();
        });
    }
}
