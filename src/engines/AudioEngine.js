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
        this.chunks = [];
        this.toneEngine = null;
        this.pitchBuffer = [];
        // Median Smoothing Buffer
        this.smoothPitchBuffer = [];
    }

    async start() {
        if (this.isActive) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({ latencyHint: 'interactive' });
            if (this.audioContext.state === 'suspended') await this.audioContext.resume();
            this.toneEngine = new ToneEngine(this.audioContext);

            // Load Worklet from public file
            try {
                await this.audioContext.audioWorklet.addModule('/resonance-processor.js');
            } catch (e) {
                console.error("Failed to load worklet from /resonance-processor.js, trying relative path...", e);
                // Fallback if needed, but /resonance-processor.js should work for Vite/public
                await this.audioContext.audioWorklet.addModule('resonance-processor.js');
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.workletNode = new AudioWorkletNode(this.audioContext, 'resonance-processor');

            this.workletNode.port.onmessage = (event) => {
                if (event.data.type === 'update') {
                    const { pitch, resonance, f1, f2, weight, spectrum, jitter, vowel, volume } = event.data.data;

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
                        formants: { f1, f2 },
                        weight,
                        volume,
                        jitter,
                        vowel,
                        prosody,
                        spectrum
                    });
                }
            };

            // --- BANDPASS FILTER (Clean Signal) ---
            this.highpass = this.audioContext.createBiquadFilter();
            this.highpass.type = 'highpass';
            this.highpass.frequency.value = 80; // Cut rumble

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
        } catch (err) { console.error("Audio init error:", err); alert("Mic access denied or Worklet error: " + err.message); }
    }
    analyzeProsody(currentPitch) {
        if (currentPitch > 0) this.pitchBuffer.push(currentPitch); else if (this.pitchBuffer.length > 0) this.pitchBuffer.push(0);
        if (this.pitchBuffer.length > 100) this.pitchBuffer.shift();
        const validP = this.pitchBuffer.filter(p => p > 50 && p < 600);
        if (validP.length < 10) return { semitoneRange: 0, slopeDirection: 'flat' };
        let minP = Math.min(...validP); let maxP = Math.max(...validP); const stRange = MainDSP.hzToSemitones(maxP) - MainDSP.hzToSemitones(minP);
        const recent = validP.slice(-20); if (recent.length < 5) return { semitoneRange: stRange, slopeDirection: 'flat' };
        const first = recent[0]; const last = recent[recent.length - 1]; const diff = last - first; let direction = 'flat'; if (diff > 5) direction = 'rising'; if (diff < -5) direction = 'falling';
        return { semitoneRange: stRange, slopeDirection: direction };
    }
    playFeedbackTone(freq) { if (this.toneEngine) this.toneEngine.play(freq, 0.15, 'sine'); }
    startRecording() { if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') { this.chunks = []; this.mediaRecorder.start(); } }
    async stopRecording() { return new Promise((resolve) => { if (this.mediaRecorder && this.mediaRecorder.state === 'recording') { this.mediaRecorder.onstop = () => { const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' }); resolve(window.URL.createObjectURL(blob)); }; this.mediaRecorder.stop(); } else { resolve(null); } }); }
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
