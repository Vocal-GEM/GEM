// Enhanced Speech Recognition Hook with continuous mode, error handling, and push-to-talk
import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = (onResult) => {
    const [listening, setListening] = useState(false);
    const [error, setError] = useState(null);
    const [pushToTalkActive, setPushToTalkActive] = useState(false);
    const recognitionRef = useRef(null);
    const pushToTalkRecognitionRef = useRef(null);
    const shouldBeListeningRef = useRef(false);
    const restartTimeoutRef = useRef(null);

    // Setup continuous recognition for auto-listening
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true; // Keep listening continuously
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setListening(true);
                setError(null);
                console.log('🎤 Speech recognition started (auto-mode)');
            };

            recognition.onend = () => {
                setListening(false);
                console.log('🎤 Speech recognition ended (auto-mode)');

                // Auto-restart if we should still be listening
                if (shouldBeListeningRef.current) {
                    restartTimeoutRef.current = setTimeout(() => {
                        try {
                            recognition.start();
                            console.log('🔄 Auto-restarting recognition...');
                        } catch (e) {
                            console.error("Failed to restart recognition:", e);
                        }
                    }, 100);
                }
            };

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                console.log('📝 Recognized (auto-mode):', transcript);
                onResult(transcript);
            };

            recognition.onerror = (event) => {
                console.error("🚨 Speech recognition error (auto-mode):", event.error);
                setError(event.error);

                // Handle specific errors
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setListening(false);
                    shouldBeListeningRef.current = false;
                    setError('microphone-denied');
                } else if (event.error === 'no-speech') {
                    // This is normal, just continue listening
                    console.log('⏸️ No speech detected, continuing...');
                    setError(null);
                } else if (event.error === 'aborted') {
                    // Recognition was aborted, restart if needed
                    if (shouldBeListeningRef.current) {
                        restartTimeoutRef.current = setTimeout(() => {
                            try {
                                recognition.start();
                            } catch (e) {
                                console.error("Failed to restart after abort:", e);
                            }
                        }, 100);
                    }
                } else if (event.error === 'network') {
                    setError('network-error');
                }
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (restartTimeoutRef.current) {
                clearTimeout(restartTimeoutRef.current);
            }
        };
    }, [onResult]);

    // Setup non-continuous recognition for push-to-talk
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const pttRecognition = new SpeechRecognition();
            pttRecognition.continuous = false; // Stop after speech ends
            pttRecognition.interimResults = false;
            pttRecognition.lang = 'en-US';
            pttRecognition.maxAlternatives = 1;

            pttRecognition.onstart = () => {
                console.log('🎙️ Push-to-talk recognition started');
            };

            pttRecognition.onend = () => {
                console.log('🎙️ Push-to-talk recognition ended');
                // We don't strictly need to set false here if stopPushToTalk handles it,
                // but it's good safety in case recognition ends for other reasons.
                setPushToTalkActive(false);
            };

            pttRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('📝 Recognized (push-to-talk):', transcript);
                onResult(transcript);
            };

            pttRecognition.onerror = (event) => {
                console.error("🚨 Push-to-talk error:", event.error);
                if (event.error === 'no-speech') {
                    console.log('⏸️ No speech detected in push-to-talk');
                    setError(null);
                } else {
                    setError(event.error);
                }
                setPushToTalkActive(false);
            };

            pushToTalkRecognitionRef.current = pttRecognition;
        }
    }, [onResult]);

    const start = useCallback(() => {
        if (recognitionRef.current && !listening) {
            try {
                shouldBeListeningRef.current = true;
                recognitionRef.current.start();
                console.log('▶️ Starting auto-listening...');
            } catch (e) {
                if (e.name !== 'InvalidStateError') {
                    console.error("Recognition start error:", e);
                    setError('start-failed');
                }
            }
        }
    }, [listening]);

    const stop = useCallback(() => {
        shouldBeListeningRef.current = false;
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
        }
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                console.log('⏹️ Stopping auto-listening...');
            } catch (e) {
                console.error("Recognition stop error:", e);
            }
        }
    }, []);

    const startPushToTalk = useCallback(() => {
        // Stop auto-listening first
        if (recognitionRef.current && listening) {
            stop();
        }

        setPushToTalkActive(true);
        if (pushToTalkRecognitionRef.current) {
            try {
                pushToTalkRecognitionRef.current.start();
                console.log('🎙️ Push-to-talk activated - speak now!');
            } catch (e) {
                console.error("Push-to-talk start error:", e);
                setPushToTalkActive(false);
            }
        }
    }, [listening, stop]);

    const stopPushToTalk = useCallback(() => {
        console.log('🎙️ Push-to-talk button released');
        // Reset button visual state immediately
        setPushToTalkActive(false);
        // The non-continuous recognition will stop automatically when speech ends
        // and process the result
    }, []);

    return {
        start,
        stop,
        startPushToTalk,
        stopPushToTalk,
        listening,
        error,
        pushToTalkActive,
        isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
};
