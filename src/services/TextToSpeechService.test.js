import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { textToSpeechService } from './TextToSpeechService';

// Mock SpeechSynthesis API
const mockUtterance = {
    volume: 1.0,
    rate: 1.0,
    pitch: 1.0,
    text: '',
    voice: null,
    onstart: null,
    onend: null,
    onerror: null,
};

global.SpeechSynthesisUtterance = vi.fn(function (text) {
    return { ...mockUtterance, text };
});

global.speechSynthesis = {
    speak: vi.fn((utterance) => {
        // Simulate async speech
        setTimeout(() => {
            if (utterance.onstart) utterance.onstart();
            setTimeout(() => {
                if (utterance.onend) utterance.onend();
            }, 10);
        }, 10);
    }),
    cancel: vi.fn(),
    getVoices: vi.fn(() => [
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Google UK English Female', lang: 'en-GB' },
    ]),
};

// Mock Audio API
global.Audio = vi.fn(function (src) {
    this.src = src;
    this.volume = 1.0;
    this.currentTime = 0;
    this.onplay = null;
    this.onended = null;
    this.onerror = null;
    this.play = vi.fn(() => {
        setTimeout(() => {
            if (this.onplay) this.onplay();
            setTimeout(() => {
                if (this.onended) this.onended();
            }, 10);
        }, 10);
        return Promise.resolve();
    });
    this.pause = vi.fn();
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn((blob) => 'blob:mock-url-' + Math.random());

// Mock fetch
global.fetch = vi.fn();

describe('TextToSpeechService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset service state
        textToSpeechService.config = {
            ttsProvider: 'browser',
            voiceId: '21m00Tcm4TlvDq8ikWAM',
            volume: 1.0,
            rate: 1.0,
            pitch: 1.0,
            backendUrl: 'http://localhost:5000',
        };
        textToSpeechService.audioCache = new Map();
        textToSpeechService.currentAudio = null;
        textToSpeechService.isSpeaking = false;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('init', () => {
        it('updates config with provided settings', () => {
            textToSpeechService.init({
                ttsProvider: 'elevenlabs',
                volume: 0.8,
            });

            expect(textToSpeechService.config.ttsProvider).toBe('elevenlabs');
            expect(textToSpeechService.config.volume).toBe(0.8);
        });

        it('preserves default config values not provided', () => {
            textToSpeechService.init({ volume: 0.5 });

            expect(textToSpeechService.config.ttsProvider).toBe('browser');
            expect(textToSpeechService.config.rate).toBe(1.0);
            expect(textToSpeechService.config.pitch).toBe(1.0);
        });
    });

    describe('updateSettings', () => {
        it('updates specific settings', () => {
            textToSpeechService.updateSettings({ rate: 1.5 });

            expect(textToSpeechService.config.rate).toBe(1.5);
            expect(textToSpeechService.config.volume).toBe(1.0); // Unchanged
        });

        it('can update multiple settings at once', () => {
            textToSpeechService.updateSettings({
                volume: 0.7,
                rate: 1.2,
                pitch: 1.1,
            });

            expect(textToSpeechService.config.volume).toBe(0.7);
            expect(textToSpeechService.config.rate).toBe(1.2);
            expect(textToSpeechService.config.pitch).toBe(1.1);
        });
    });

    describe('speak', () => {
        it('routes to browser TTS by default', async () => {
            const speakSpy = vi.spyOn(textToSpeechService, 'speakWithBrowser');

            await textToSpeechService.speak('Hello world');

            expect(speakSpy).toHaveBeenCalledWith('Hello world', {});
        });

        it('routes to ElevenLabs when configured', async () => {
            textToSpeechService.config.ttsProvider = 'elevenlabs';
            const speakSpy = vi.spyOn(textToSpeechService, 'speakWithElevenLabs');
            global.fetch.mockResolvedValueOnce({
                ok: true,
                blob: () => Promise.resolve(new Blob(['audio data'])),
            });

            await textToSpeechService.speak('Hello world');

            expect(speakSpy).toHaveBeenCalledWith('Hello world', {});
        });

        it('stops current speech before starting new', async () => {
            const stopSpy = vi.spyOn(textToSpeechService, 'stop');

            await textToSpeechService.speak('First');
            await textToSpeechService.speak('Second');

            expect(stopSpy).toHaveBeenCalledTimes(2);
        });

        it('respects provider option override', async () => {
            textToSpeechService.config.ttsProvider = 'browser';
            const elevenLabsSpy = vi.spyOn(textToSpeechService, 'speakWithElevenLabs');
            global.fetch.mockResolvedValueOnce({
                ok: true,
                blob: () => Promise.resolve(new Blob(['audio data'])),
            });

            await textToSpeechService.speak('Hello', { ttsProvider: 'elevenlabs' });

            expect(elevenLabsSpy).toHaveBeenCalled();
        });
    });

    describe('stop', () => {
        it('cancels browser speech synthesis', () => {
            textToSpeechService.stop();

            expect(window.speechSynthesis.cancel).toHaveBeenCalled();
        });

        it('pauses current audio if playing', () => {
            const mockAudio = new Audio('test.mp3');
            textToSpeechService.currentAudio = mockAudio;

            textToSpeechService.stop();

            expect(mockAudio.pause).toHaveBeenCalled();
            expect(mockAudio.currentTime).toBe(0);
        });

        it('clears current audio reference', () => {
            textToSpeechService.currentAudio = new Audio('test.mp3');

            textToSpeechService.stop();

            expect(textToSpeechService.currentAudio).toBeNull();
        });

        it('sets isSpeaking to false', () => {
            textToSpeechService.isSpeaking = true;

            textToSpeechService.stop();

            expect(textToSpeechService.isSpeaking).toBe(false);
        });

        it('handles no current audio gracefully', () => {
            textToSpeechService.currentAudio = null;

            expect(() => textToSpeechService.stop()).not.toThrow();
        });
    });

    describe('speakWithBrowser', () => {
        it('creates speech synthesis utterance with text', async () => {
            await textToSpeechService.speakWithBrowser('Hello world');

            expect(SpeechSynthesisUtterance).toHaveBeenCalledWith('Hello world');
        });

        it('applies volume from config', async () => {
            textToSpeechService.config.volume = 0.7;

            await textToSpeechService.speakWithBrowser('Test');

            expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
                expect.objectContaining({ volume: 0.7 })
            );
        });

        it('applies rate from config', async () => {
            textToSpeechService.config.rate = 1.5;

            await textToSpeechService.speakWithBrowser('Test');

            expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
                expect.objectContaining({ rate: 1.5 })
            );
        });

        it('applies pitch from config', async () => {
            textToSpeechService.config.pitch = 1.2;

            await textToSpeechService.speakWithBrowser('Test');

            expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
                expect.objectContaining({ pitch: 1.2 })
            );
        });

        it('allows options to override config', async () => {
            textToSpeechService.config.volume = 0.5;

            await textToSpeechService.speakWithBrowser('Test', { volume: 0.9 });

            expect(window.speechSynthesis.speak).toHaveBeenCalledWith(
                expect.objectContaining({ volume: 0.9 })
            );
        });

        it('selects voice by name if provided', async () => {
            await textToSpeechService.speakWithBrowser('Test', {
                voiceName: 'Google US English',
            });

            const utterance = window.speechSynthesis.speak.mock.calls[0][0];
            expect(utterance.voice).toEqual({ name: 'Google US English', lang: 'en-US' });
        });

        it('handles voice not found gracefully', async () => {
            await textToSpeechService.speakWithBrowser('Test', { voiceName: 'Nonexistent Voice' });

            const utterance = window.speechSynthesis.speak.mock.calls[0][0];
            expect(utterance.voice).toBeNull();
        });

        it('sets isSpeaking to true on start', async () => {
            const promise = textToSpeechService.speakWithBrowser('Test');

            await new Promise((resolve) => setTimeout(resolve, 15));
            expect(textToSpeechService.isSpeaking).toBe(true);

            await promise;
        });

        it('sets isSpeaking to false on end', async () => {
            await textToSpeechService.speakWithBrowser('Test');

            expect(textToSpeechService.isSpeaking).toBe(false);
        });

        it('calls onStart callback', async () => {
            const onStart = vi.fn();

            await textToSpeechService.speakWithBrowser('Test', { onStart });

            expect(onStart).toHaveBeenCalled();
        });

        it('calls onEnd callback', async () => {
            const onEnd = vi.fn();

            await textToSpeechService.speakWithBrowser('Test', { onEnd });

            expect(onEnd).toHaveBeenCalled();
        });

        it('rejects on error', async () => {
            const errorEvent = new Error('Speech synthesis failed');

            window.speechSynthesis.speak.mockImplementationOnce((utterance) => {
                setTimeout(() => {
                    if (utterance.onerror) utterance.onerror(errorEvent);
                }, 10);
            });

            await expect(textToSpeechService.speakWithBrowser('Test')).rejects.toThrow();
        });

        it('sets isSpeaking to false on error', async () => {
            window.speechSynthesis.speak.mockImplementationOnce((utterance) => {
                setTimeout(() => {
                    if (utterance.onerror) utterance.onerror(new Error('Failed'));
                }, 10);
            });

            try {
                await textToSpeechService.speakWithBrowser('Test');
            } catch (e) {
                expect(textToSpeechService.isSpeaking).toBe(false);
            }
        });
    });

    describe('speakWithElevenLabs', () => {
        const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });

        beforeEach(() => {
            global.fetch.mockResolvedValue({
                ok: true,
                blob: () => Promise.resolve(mockBlob),
            });
        });

        it('fetches audio from backend API', async () => {
            await textToSpeechService.speakWithElevenLabs('Hello world');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/tts/synthesize',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })
            );
        });

        it('sends text and voiceId in request body', async () => {
            await textToSpeechService.speakWithElevenLabs('Hello world');

            const call = fetch.mock.calls[0];
            const body = JSON.parse(call[1].body);

            expect(body.text).toBe('Hello world');
            expect(body.voiceId).toBe('21m00Tcm4TlvDq8ikWAM');
            expect(body.modelId).toBe('eleven_turbo_v2_5');
        });

        it('uses voiceId from options if provided', async () => {
            await textToSpeechService.speakWithElevenLabs('Test', { voiceId: 'custom-voice-id' });

            const call = fetch.mock.calls[0];
            const body = JSON.parse(call[1].body);

            expect(body.voiceId).toBe('custom-voice-id');
        });

        it('creates object URL from audio blob', async () => {
            await textToSpeechService.speakWithElevenLabs('Hello');

            expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
        });

        it('caches audio by voiceId and text', async () => {
            await textToSpeechService.speakWithElevenLabs('Hello');

            const cacheKey = '21m00Tcm4TlvDq8ikWAM-Hello';
            expect(textToSpeechService.audioCache.has(cacheKey)).toBe(true);
        });

        it('uses cached audio on second request', async () => {
            await textToSpeechService.speakWithElevenLabs('Hello');
            await textToSpeechService.speakWithElevenLabs('Hello');

            // Should only fetch once
            expect(fetch).toHaveBeenCalledTimes(1);
        });

        it('calls onStartLoading before fetch', async () => {
            const onStartLoading = vi.fn();

            await textToSpeechService.speakWithElevenLabs('Test', { onStartLoading });

            expect(onStartLoading).toHaveBeenCalled();
        });

        it('calls onEndLoading after fetch', async () => {
            const onEndLoading = vi.fn();

            await textToSpeechService.speakWithElevenLabs('Test', { onEndLoading });

            expect(onEndLoading).toHaveBeenCalled();
        });

        it('creates Audio element with URL', async () => {
            await textToSpeechService.speakWithElevenLabs('Hello');

            expect(Audio).toHaveBeenCalledWith(expect.stringContaining('blob:mock-url'));
        });

        it('applies volume to audio', async () => {
            textToSpeechService.config.volume = 0.6;

            await textToSpeechService.speakWithElevenLabs('Test');

            const audioInstance = Audio.mock.results[0].value;
            expect(audioInstance.volume).toBe(0.6);
        });

        it('sets isSpeaking to true on play', async () => {
            const promise = textToSpeechService.speakWithElevenLabs('Test');

            await new Promise((resolve) => setTimeout(resolve, 15));
            expect(textToSpeechService.isSpeaking).toBe(true);

            await promise;
        });

        it('sets isSpeaking to false on ended', async () => {
            await textToSpeechService.speakWithElevenLabs('Test');

            expect(textToSpeechService.isSpeaking).toBe(false);
        });

        it('clears currentAudio on ended', async () => {
            await textToSpeechService.speakWithElevenLabs('Test');

            expect(textToSpeechService.currentAudio).toBeNull();
        });

        it('calls onStart callback', async () => {
            const onStart = vi.fn();

            await textToSpeechService.speakWithElevenLabs('Test', { onStart });

            expect(onStart).toHaveBeenCalled();
        });

        it('calls onEnd callback', async () => {
            const onEnd = vi.fn();

            await textToSpeechService.speakWithElevenLabs('Test', { onEnd });

            expect(onEnd).toHaveBeenCalled();
        });

        it('falls back to browser TTS on fetch error', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const browserSpy = vi.spyOn(textToSpeechService, 'speakWithBrowser');

            await textToSpeechService.speakWithElevenLabs('Test');

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'ElevenLabs TTS Error:',
                expect.any(Error)
            );
            expect(consoleLogSpy).toHaveBeenCalledWith('Falling back to browser TTS...');
            expect(browserSpy).toHaveBeenCalledWith('Test', {});

            consoleErrorSpy.mockRestore();
            consoleLogSpy.mockRestore();
        });

        it('falls back to browser TTS on non-ok response', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Server error' }),
            });

            const browserSpy = vi.spyOn(textToSpeechService, 'speakWithBrowser');

            await textToSpeechService.speakWithElevenLabs('Test');

            expect(browserSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        it('calls onEndLoading before fallback', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const onEndLoading = vi.fn();
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await textToSpeechService.speakWithElevenLabs('Test', { onEndLoading });

            expect(onEndLoading).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
            consoleLogSpy.mockRestore();
        });
    });

    describe('getElevenLabsVoices', () => {
        it('fetches voices from backend API', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        voices: [
                            { voice_id: '1', name: 'Rachel' },
                            { voice_id: '2', name: 'Josh' },
                        ],
                    }),
            });

            const voices = await textToSpeechService.getElevenLabsVoices();

            expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/tts/voices', {
                credentials: 'include',
            });
            expect(voices).toHaveLength(2);
            expect(voices[0].name).toBe('Rachel');
        });

        it('returns empty array on fetch error', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const voices = await textToSpeechService.getElevenLabsVoices();

            expect(voices).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error fetching ElevenLabs voices:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it('returns empty array on non-ok response', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            fetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'Unauthorized' }),
            });

            const voices = await textToSpeechService.getElevenLabsVoices();

            expect(voices).toEqual([]);

            consoleErrorSpy.mockRestore();
        });

        it('handles missing voices array in response', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            });

            const voices = await textToSpeechService.getElevenLabsVoices();

            expect(voices).toEqual([]);
        });
    });
});
