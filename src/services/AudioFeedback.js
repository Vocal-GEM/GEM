/**
 * AudioFeedback.js
 * Auditory feedback system for pitch guidance and coaching cues
 */

export class AudioFeedback {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.oscillator = null;
        this.enabled = true;
        this.mode = 'tones'; // 'tones', 'verbal', 'chimes'
        this.volume = 0.5;

        this.lastFeedbackTime = 0;
        this.speechSynthesis = window.speechSynthesis;
        this.speechVoice = null;

        this.loadPreferences();
    }

    /**
     * Initialize audio context on user interaction
     */
    init() {
        if (this.audioContext) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0;

            // Load voices for speech synthesis
            if (this.speechSynthesis) {
                // Wait for voices to load
                if (this.speechSynthesis.onvoiceschanged !== undefined) {
                    this.speechSynthesis.onvoiceschanged = () => {
                        this.selectVoice();
                    };
                }
                this.selectVoice();
            }
        } catch (e) {
            console.warn('AudioFeedback initialization failed:', e);
        }
    }

    /**
     * Select a suitable voice for verbal feedback
     */
    selectVoice() {
        if (!this.speechSynthesis) return;

        const voices = this.speechSynthesis.getVoices();

        // Try to find a good English voice
        this.speechVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
            voices.find(v => v.name.includes('Samantha') || v.name.includes('Daniel')) ||
            voices.find(v => v.lang.startsWith('en'));
    }

    /**
     * Play feedback tone
     * @param {number} frequency - Tone frequency in Hz
     * @param {number} duration - Duration in ms
     * @param {string} type - 'success', 'warning', 'info'
     */
    playTone(frequency, duration = 200, type = 'info') {
        if (!this.enabled || this.mode === 'verbal') return;
        if (!this.audioContext) this.init();
        if (this.audioContext.state === 'suspended') this.audioContext.resume();

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        // Configure sound based on type
        if (type === 'success') {
            osc.type = 'sine';
            // Harmony chord effect
            this.playHarmonic(frequency * 1.5, duration, 0.5);
        } else if (type === 'warning') {
            osc.type = 'triangle';
        } else {
            osc.type = 'sine';
        }

        osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Envelope
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration / 1000 + 0.1);
    }

    /**
     * Play harmonic tone (helper)
     */
    playHarmonic(frequency, duration, volumeScale) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(this.volume * volumeScale, this.audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration / 1000 + 0.1);
    }

    /**
     * Speak verbal feedback
     * @param {string} text - Text to speak
     * @param {number} priority - Priority (higher = interrupt current speech)
     */
    speak(text, priority = 1) {
        if (!this.enabled || this.mode === 'tones' || !this.speechSynthesis) return;

        // Don't speak too often
        if (Date.now() - this.lastFeedbackTime < 2000 && priority < 5) return;

        if (this.speechSynthesis.speaking) {
            if (priority > 5) {
                this.speechSynthesis.cancel();
            } else {
                return; // Skip if already speaking and low priority
            }
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.speechVoice) utterance.voice = this.speechVoice;
        utterance.volume = this.volume;
        utterance.rate = 1.1; // Slightly faster

        this.speechSynthesis.speak(utterance);
        this.lastFeedbackTime = Date.now();
    }

    /**
     * Provide feedback for pitch deviation
     */
    feedbackPitch(current, target, tolerance) {
        const deviation = current - target;

        if (Math.abs(deviation) < tolerance) {
            if (this.mode === 'tones') {
                // Success chord periodically
                if (Math.random() < 0.1) this.playTone(880, 150, 'success');
            } else {
                if (Math.random() < 0.1) this.speak("Good", 2);
            }
        } else if (deviation < -tolerance) {
            // Too low
            if (this.mode === 'tones') {
                this.playTone(440, 100, 'info'); // Low tone
            } else {
                this.speak("Higher", 3);
            }
        } else {
            // Too high
            if (this.mode === 'tones') {
                this.playTone(1760, 100, 'info'); // High tone
            } else {
                this.speak("Lower", 3);
            }
        }
    }

    /**
     * Provide feedback for strain
     */
    feedbackStrain() {
        if (this.mode === 'tones') {
            this.playTone(200, 400, 'warning'); // Low "buzz"
        } else {
            this.speak("Relax", 10);
        }
    }

    /**
     * Provide feedback for achievement
     */
    feedbackAchievement() {
        this.playTone(523.25, 100, 'success'); // C5
        setTimeout(() => this.playTone(659.25, 100, 'success'), 100); // E5
        setTimeout(() => this.playTone(783.99, 200, 'success'), 200); // G5
    }

    /**
     * Set volume
     */
    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        this.savePreferences();
    }

    /**
     * Set mode
     */
    setMode(mode) {
        if (['tones', 'verbal', 'chimes', 'off'].includes(mode)) {
            this.mode = mode;
            this.enabled = mode !== 'off';
            this.savePreferences();
        }
    }

    /**
     * Save preferences
     */
    savePreferences() {
        try {
            localStorage.setItem('audioFeedbackPrefs', JSON.stringify({
                mode: this.mode,
                volume: this.volume,
                enabled: this.enabled
            }));
        } catch (e) {
            console.warn('Failed to save audio prefs:', e);
        }
    }

    /**
     * Load preferences
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('audioFeedbackPrefs');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.mode = prefs.mode || 'tones';
                this.volume = prefs.volume !== undefined ? prefs.volume : 0.5;
                this.enabled = prefs.enabled !== undefined ? prefs.enabled : true;
            }
        } catch (e) {
            console.warn('Failed to load audio prefs:', e);
        }
    }
}

// Singleton
let instance = null;

export const getAudioFeedback = () => {
    if (!instance) {
        instance = new AudioFeedback();
    }
    return instance;
};

export default AudioFeedback;
