import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to play a reference tone
 * @param {boolean} isEnabled - Master switch
 * @param {number} frequency - Frequency in Hz
 * @param {string} type - Oscillator type (sine, square, etc.)
 */
export const useReferenceTone = (isEnabled = false, frequency = 220, type = 'sine') => {
    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);

    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.connect(audioContextRef.current.destination);
            gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        }
    };

    const playTone = useCallback(() => {
        if (!isEnabled) return;
        initAudio();

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // Avoid multiple oscillators piling up
        if (oscillatorRef.current) return;

        const osc = audioContextRef.current.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

        osc.connect(gainNodeRef.current);
        osc.start();

        // Ramp up
        gainNodeRef.current.gain.cancelScheduledValues(audioContextRef.current.currentTime);
        gainNodeRef.current.gain.setTargetAtTime(0.1, audioContextRef.current.currentTime, 0.05);

        oscillatorRef.current = osc;
    }, [isEnabled, frequency, type]);

    const stopTone = useCallback(() => {
        if (!oscillatorRef.current || !audioContextRef.current) return;

        const now = audioContextRef.current.currentTime;
        gainNodeRef.current.gain.cancelScheduledValues(now);
        gainNodeRef.current.gain.setTargetAtTime(0, now, 0.05);

        const osc = oscillatorRef.current;
        oscillatorRef.current = null;

        setTimeout(() => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {
                // Ignore if already stopped
            }
        }, 100);
    }, []);

    // Effect to handle frequency changes while playing
    useEffect(() => {
        if (oscillatorRef.current && audioContextRef.current) {
            oscillatorRef.current.frequency.setTargetAtTime(frequency, audioContextRef.current.currentTime, 0.1);
        }
    }, [frequency]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (oscillatorRef.current) {
                try {
                    oscillatorRef.current.stop();
                    oscillatorRef.current.disconnect();
                } catch (e) {
                    // Ignore
                }
            }
            if (audioContextRef.current) {
                try {
                    audioContextRef.current.close();
                    audioContextRef.current = null;
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, []);

    return { playTone, stopTone };
};
