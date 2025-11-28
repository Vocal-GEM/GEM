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
        this.workletNode = null;
        this.microphone = null;
        this.onAudioUpdate = onAudioUpdate;
        this.isActive = false;
        this.mediaRecorder = null;
        this.analysisRecorder = null; // Separate recorder for WAV analysis
        this.chunks = [];
        this.analysisChunks = [];
        this.toneEngine = null;
        this.pitchBuffer = [];
        // Median Smoothing Buffer
        this.smoothPitchBuffer = [];
        this.isRecordingForAnalysis = false;
    }

    async start() {
        if (this.isActive) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({ latencyHint: 'interactive' });

            // MOBILE UNLOCK: Play a silent buffer immediately to unlock the AudioContext
            // This is critical for iOS and some Android browsers
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            this.toneEngine = new ToneEngine(this.audioContext);

            // Load Worklet from public file with cache busting
            try {
                const timestamp = Date.now();
                await this.audioContext.audioWorklet.addModule(`/resonance-processor.js?v=${timestamp}`);
            } catch (e) {
                console.error("Failed to load worklet from /resonance-processor.js, trying relative path...", e);
                // Fallback if needed
                const timestamp = Date.now();
                await this.audioContext.audioWorklet.addModule(`resonance-processor.js?v=${timestamp}`);
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.workletNode = new AudioWorkletNode(this.audioContext, 'resonance-processor');

            this.workletNode.port.onmessage = (event) => {
                if (event.data.type === 'update') {
                    const { pitch, resonance, resonanceScore, spectralCentroid, f1, f2, weight, spectrum, jitter, shimmer, vowel, volume, debug } = event.data.data;

                    // --- MEDIAN SMOOTHING LOGIC ---
                    // FIX: Previously, raw pitch caused jitter. Now we buffer 5 frames and take median.
                    let smoothPitch = pitch;
                    if (pitch > 0) {
                        this.smoothPitchBuffer.push(pitch);
                        if (this.smoothPitchBuffer.length > 3) this.smoothPitchBuffer.shift();
                        smoothPitch = MainDSP.median(this.smoothPitchBuffer);
                    } else {
                        this.smoothPitchBuffer = [];
                        smoothPitch = -1;
                    }

                    const prosody = this.analyzeProsody(smoothPitch);

                    this.onAudioUpdate({
                        pitch: smoothPitch,
                        resonance,
                        resonanceScore,
                        spectralCentroid,
                        f1,
                        f2,
                        weight,
                        volume,
                        jitter,
                        shimmer,
                        vowel,
                        prosody,
                        spectrum,
                        debug
                    });
                }
            };

            // --- BANDPASS FILTER (Clean Signal) ---
            this.highpass = this.audioContext.createBiquadFilter();
            this.highpass.type = 'highpass';
            this.highpass.frequency.value = 100; // Cut rumble

            this.lowpass = this.audioContext.createBiquadFilter();
            this.lowpass.type = 'lowpass';
            this.lowpass.frequency.value = 5000; // Cut hiss (Raised to 5k for resonance)

            // Connect: Mic -> Highpass -> Lowpass -> Worklet
            this.microphone.connect(this.highpass);
            this.highpass.connect(this.lowpass);
            this.lowpass.connect(this.workletNode);

            this.workletNode.connect(this.audioContext.destination);
            this.mediaRecorder = new MediaRecorder(stream); this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
            this.isActive = true;
        } catch (err) {
            console.error("Audio init error:", err);
            console.error("Error details:", {
                name: err.name,
                message: err.message,
                state: this.audioContext ? this.audioContext.state : 'no-context'
            });
            alert("Mic access denied or Worklet error: " + err.message);
        }
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

    // Original recording methods (OGG format for journal/comparison)
    startRecording() { if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') { this.chunks = []; this.mediaRecorder.start(); } }
    async stopRecording() { return new Promise((resolve) => { if (this.mediaRecorder && this.mediaRecorder.state === 'recording') { this.mediaRecorder.onstop = () => { const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' }); resolve(window.URL.createObjectURL(blob)); }; this.mediaRecorder.stop(); } else { resolve(null); } }); }

    // New WAV recording methods for voice analysis
    async startAnalysisRecording() {
        if (!this.isActive || !this.microphone) {
            console.error('Audio engine not active');
            return false;
        }

        try {
            // Create a destination node to capture processed audio
            const dest = this.audioContext.createMediaStreamDestination();

            // Connect the filtered audio to destination
            this.lowpass.connect(dest);

            // Create MediaRecorder with WAV support if available
            const mimeType = MediaRecorder.isTypeSupported('audio/wav')
                ? 'audio/wav'
                : MediaRecorder.isTypeSupported('audio/webm;codecs=pcm')
                    ? 'audio/webm;codecs=pcm'
                    : 'audio/webm'; // Fallback

            this.analysisRecorder = new MediaRecorder(dest.stream, { mimeType });
            this.analysisChunks = [];

            this.analysisRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.analysisChunks.push(e.data);
                }
            };

            this.analysisRecorder.start();
            this.isRecordingForAnalysis = true;
            return true;
        } catch (err) {
            console.error('Failed to start analysis recording:', err);
            return false;
        }
    }

    async stopAnalysisRecording() {
        return new Promise((resolve) => {
            if (this.analysisRecorder && this.analysisRecorder.state === 'recording') {
                this.analysisRecorder.onstop = () => {
                    const blob = new Blob(this.analysisChunks, { type: this.analysisRecorder.mimeType });
                    this.isRecordingForAnalysis = false;

                    // Disconnect the extra connection
                    try {
                        this.lowpass.disconnect(this.analysisRecorder.stream);
                    } catch (e) {
                        // Already disconnected
                    }

                    resolve({
                        blob: blob,
                        url: window.URL.createObjectURL(blob),
                        mimeType: this.analysisRecorder.mimeType
                    });
                };
                this.analysisRecorder.stop();
            } else {
                this.isRecordingForAnalysis = false;
                resolve(null);
            }
        });
    }

    // Convert blob to AudioBuffer for analysis
    async blobToAudioBuffer(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
    }
    stop() { if (!this.isActive) return; this.workletNode.disconnect(); this.microphone.disconnect(); this.audioContext.close(); this.isActive = false; }

    setNoiseGate(threshold) {
        if (this.workletNode) {
            this.workletNode.port.postMessage({
                type: 'config',
                config: { threshold: threshold }
            });
        }
    }
}
