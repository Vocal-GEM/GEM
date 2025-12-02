import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSpeechRecognition } from './useSpeechRecognition';

// Mock SpeechRecognition API
class MockSpeechRecognition {
    constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.lang = '';
        this.maxAlternatives = 1;
        this.onstart = null;
        this.onend = null;
        this.onresult = null;
        this.onerror = null;
        MockSpeechRecognition.instances.push(this);
    }

    start() {
        if (this.onstart) {
            this.onstart();
        }
    }

    stop() {
        if (this.onend) {
            this.onend();
        }
    }

    static instances = [];
    static reset() {
        MockSpeechRecognition.instances = [];
    }
}

describe('useSpeechRecognition', () => {
    let originalSpeechRecognition;

    beforeEach(() => {
        originalSpeechRecognition = window.SpeechRecognition;
        window.SpeechRecognition = MockSpeechRecognition;
        window.webkitSpeechRecognition = MockSpeechRecognition;
        MockSpeechRecognition.reset();
    });

    afterEach(() => {
        window.SpeechRecognition = originalSpeechRecognition;
        delete window.webkitSpeechRecognition;
        vi.clearAllMocks();
    });

    it('initializes with correct default state', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        expect(result.current.listening).toBe(false);
        expect(result.current.error).toBe(null);
        expect(result.current.pushToTalkActive).toBe(false);
        expect(result.current.isSupported).toBe(true);
    });

    it('creates two recognition instances (auto and push-to-talk)', () => {
        const onResult = vi.fn();
        renderHook(() => useSpeechRecognition(onResult));

        expect(MockSpeechRecognition.instances.length).toBe(2);
        expect(MockSpeechRecognition.instances[0].continuous).toBe(true); // Auto-listening
        expect(MockSpeechRecognition.instances[1].continuous).toBe(false); // Push-to-talk
    });

    it('starts listening when start is called', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        act(() => {
            result.current.start();
        });

        expect(result.current.listening).toBe(true);
    });

    it('stops listening when stop is called', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        act(() => {
            result.current.start();
        });

        expect(result.current.listening).toBe(true);

        act(() => {
            result.current.stop();
        });

        expect(result.current.listening).toBe(false);
    });

    it('calls onResult when speech is recognized in auto mode', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        act(() => {
            result.current.start();
        });

        // Simulate recognition result
        const mockEvent = {
            results: [
                [{
                    transcript: 'hello world',
                    confidence: 0.9
                }]
            ]
        };

        act(() => {
            const recognition = MockSpeechRecognition.instances[0];
            if (recognition.onresult) {
                recognition.onresult(mockEvent);
            }
        });

        expect(onResult).toHaveBeenCalledWith('hello world');
    });

    it('activates push-to-talk when startPushToTalk is called', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        act(() => {
            result.current.startPushToTalk();
        });

        expect(result.current.pushToTalkActive).toBe(true);
    });

    it('deactivates push-to-talk when stopPushToTalk is called', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        act(() => {
            result.current.startPushToTalk();
        });

        expect(result.current.pushToTalkActive).toBe(true);

        act(() => {
            result.current.stopPushToTalk();
        });

        expect(result.current.pushToTalkActive).toBe(false);
    });

    it('calls onResult when speech is recognized in push-to-talk mode', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        act(() => {
            result.current.startPushToTalk();
        });

        // Simulate recognition result
        const mockEvent = {
            results: [
                [{
                    transcript: 'push to talk test',
                    confidence: 0.95
                }]
            ]
        };

        act(() => {
            const pttRecognition = MockSpeechRecognition.instances[1];
            if (pttRecognition.onresult) {
                pttRecognition.onresult(mockEvent);
            }
        });

        expect(onResult).toHaveBeenCalledWith('push to talk test');
    });

    it('handles microphone permission denied error', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        act(() => {
            result.current.start();
        });

        act(() => {
            const recognition = MockSpeechRecognition.instances[0];
            if (recognition.onerror) {
                recognition.onerror({ error: 'not-allowed' });
            }
        });

        expect(result.current.error).toBe('microphone-denied');
        expect(result.current.listening).toBe(false);
    });

    it('handles network error', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        act(() => {
            result.current.start();
        });

        act(() => {
            const recognition = MockSpeechRecognition.instances[0];
            if (recognition.onerror) {
                recognition.onerror({ error: 'network' });
            }
        });

        expect(result.current.error).toBe('network-error');
    });

    it('clears no-speech errors automatically', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        act(() => {
            result.current.start();
        });

        act(() => {
            const recognition = MockSpeechRecognition.instances[0];
            if (recognition.onerror) {
                recognition.onerror({ error: 'no-speech' });
            }
        });

        // no-speech error should not set error state
        expect(result.current.error).toBeNull();
    });

    it('reports unsupported when SpeechRecognition is not available', () => {
        window.SpeechRecognition = undefined;
        window.webkitSpeechRecognition = undefined;

        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        expect(result.current.isSupported).toBe(false);

        // Restore for other tests
        window.SpeechRecognition = MockSpeechRecognition;
    });

    it('stops auto-listening before starting push-to-talk', () => {
        const onResult = vi.fn();
        const { result } = renderHook(() => useSpeechRecognition(onResult));

        // Start auto-listening
        act(() => {
            result.current.start();
        });

        expect(result.current.listening).toBe(true);

        // Start push-to-talk
        act(() => {
            result.current.startPushToTalk();
        });

        // Auto-listening should be stopped
        expect(result.current.listening).toBe(false);
        expect(result.current.pushToTalkActive).toBe(true);
    });

    it('configures auto-listening recognition with correct settings', () => {
        const onResult = vi.fn();
        renderHook(() => useSpeechRecognition(onResult));

        const autoRecognition = MockSpeechRecognition.instances[0];
        expect(autoRecognition.continuous).toBe(true);
        expect(autoRecognition.interimResults).toBe(false);
        expect(autoRecognition.lang).toBe('en-US');
        expect(autoRecognition.maxAlternatives).toBe(1);
    });

    it('configures push-to-talk recognition with correct settings', () => {
        const onResult = vi.fn();
        renderHook(() => useSpeechRecognition(onResult));

        const pttRecognition = MockSpeechRecognition.instances[1];
        expect(pttRecognition.continuous).toBe(false);
        expect(pttRecognition.interimResults).toBe(false);
        expect(pttRecognition.lang).toBe('en-US');
        expect(pttRecognition.maxAlternatives).toBe(1);
    });
});
