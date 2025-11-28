
export const textToSpeechService = {
    // Configuration
    config: {
        ttsProvider: 'browser', // 'browser' | 'elevenlabs'
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Default Rachel
        volume: 1.0,
        rate: 1.0,
        pitch: 1.0,
        backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
    },

    // State
    audioCache: new Map(),
    currentAudio: null,
    isSpeaking: false,

    // Initialize with settings
    init(settings) {
        this.config = { ...this.config, ...settings };
    },

    // Update specific settings
    updateSettings(newSettings) {
        this.config = { ...this.config, ...newSettings };
    },

    // Main speak function
    async speak(text, options = {}) {
        this.stop(); // Stop any current speech

        const provider = options.ttsProvider || this.config.ttsProvider;

        if (provider === 'elevenlabs') {
            return this.speakWithElevenLabs(text, options);
        } else {
            return this.speakWithBrowser(text, options);
        }
    },

    // Stop speaking
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
    },

    // Browser TTS Implementation
    speakWithBrowser(text, options = {}) {
        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);

            // Apply settings
            utterance.volume = options.volume || this.config.volume;
            utterance.rate = options.rate || this.config.rate;
            utterance.pitch = options.pitch || this.config.pitch;

            // Select voice if specified (name based for browser)
            if (options.voiceName) {
                const voices = window.speechSynthesis.getVoices();
                const voice = voices.find(v => v.name === options.voiceName);
                if (voice) utterance.voice = voice;
            }

            utterance.onstart = () => {
                this.isSpeaking = true;
                if (options.onStart) options.onStart();
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                if (options.onEnd) options.onEnd();
                resolve();
            };

            utterance.onerror = (e) => {
                this.isSpeaking = false;
                reject(e);
            };

            window.speechSynthesis.speak(utterance);
        });
    },

    // ElevenLabs TTS Implementation (via backend proxy)
    async speakWithElevenLabs(text, options = {}) {
        const voiceId = options.voiceId || this.config.voiceId;
        const cacheKey = `${voiceId}-${text}`;

        try {
            let audioUrl;

            // Check cache first
            if (this.audioCache.has(cacheKey)) {
                audioUrl = this.audioCache.get(cacheKey);
            } else {
                // Fetch from backend proxy
                if (options.onStartLoading) options.onStartLoading();

                const response = await fetch(`${this.config.backendUrl}/api/tts/synthesize`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include cookies for CSRF
                    body: JSON.stringify({
                        text: text,
                        voiceId: voiceId,
                        modelId: "eleven_turbo_v2_5"
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Backend TTS request failed: ${response.status}`);
                }

                const blob = await response.blob();
                audioUrl = URL.createObjectURL(blob);
                this.audioCache.set(cacheKey, audioUrl);

                if (options.onEndLoading) options.onEndLoading();
            }

            // Play Audio
            return new Promise((resolve, reject) => {
                const audio = new Audio(audioUrl);
                this.currentAudio = audio;

                audio.volume = options.volume || this.config.volume;

                audio.onplay = () => {
                    this.isSpeaking = true;
                    if (options.onStart) options.onStart();
                };

                audio.onended = () => {
                    this.isSpeaking = false;
                    this.currentAudio = null;
                    if (options.onEnd) options.onEnd();
                    resolve();
                };

                audio.onerror = (e) => {
                    this.isSpeaking = false;
                    this.currentAudio = null;
                    reject(e);
                };

                audio.play().catch(reject);
            });

        } catch (error) {
            console.error("ElevenLabs TTS Error:", error);
            // Fallback to browser
            console.log("Falling back to browser TTS...");
            if (options.onEndLoading) options.onEndLoading();
            return this.speakWithBrowser(text, options);
        }
    },

    // Helper to get available voices from ElevenLabs via backend
    async getElevenLabsVoices() {
        try {
            const response = await fetch(`${this.config.backendUrl}/api/tts/voices`, {
                credentials: 'include' // Include cookies for CSRF
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch voices');
            }
            const data = await response.json();
            return data.voices || [];
        } catch (e) {
            console.error('Error fetching ElevenLabs voices:', e);
            return [];
        }
    }
};
