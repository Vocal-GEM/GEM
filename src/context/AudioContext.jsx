import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioEngine } from '../engines/AudioEngine';
import { useSettings } from './SettingsContext';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const audioEngineRef = useRef(null);
    const lastLogTimeRef = useRef(0);
    const dataRef = useRef({
        pitch: 0,
        resonance: 0,
        f1: 0,
        f2: 0,
        weight: 0,
        history: new Array(100).fill(0),
        spectrum: new Float32Array(512),
        silenceCounter: 0,
        lastValidPitch: 0
    });
    const [isAudioActive, setIsAudioActive] = useState(false);

    const { settings } = useSettings();
    const settingsRef = useRef(settings);

    useEffect(() => {
        settingsRef.current = settings;
        if (audioEngineRef.current) {
            audioEngineRef.current.setNoiseGate(settings.noiseGate);
        }
    }, [settings]);

    useEffect(() => {
        const isFirstTime = !localStorage.getItem('hasVisited');
        if (isFirstTime) { localStorage.setItem('hasVisited', 'true'); }

        console.log("[AudioContext] Initializing AudioEngine...");
        audioEngineRef.current = new AudioEngine((data) => {
            const currentHistory = dataRef.current.history;
            let pitchToStore = data.pitch;

            if (data.pitch > 0) {
                dataRef.current.silenceCounter = 0;
                dataRef.current.lastValidPitch = data.pitch;
            } else {
                dataRef.current.silenceCounter++;
                if (dataRef.current.silenceCounter < 15 && dataRef.current.lastValidPitch > 0) {
                    pitchToStore = dataRef.current.lastValidPitch;
                } else {
                    pitchToStore = 0;
                }
            }

            dataRef.current = {
                ...data,
                history: [...currentHistory.slice(1), pitchToStore],
                silenceCounter: dataRef.current.silenceCounter,
                lastValidPitch: dataRef.current.lastValidPitch
            };

            // Log audio data periodically for debugging
            const now = Date.now();
            if (now - lastLogTimeRef.current > 2000) {
                if (data.pitch > 0) {
                    console.log(`[AudioContext] 🎤 Audio detected - Pitch: ${data.pitch.toFixed(1)}Hz, Volume: ${(data.volume * 100).toFixed(1)}%, Resonance: ${data.resonance.toFixed(1)}Hz`);
                } else {
                    console.log(`[AudioContext] 🔇 No pitch detected - Volume: ${(data.volume * 100).toFixed(1)}% (${data.volume > 0.01 ? 'Sound detected but no pitch' : 'Silence'})`);
                }
                lastLogTimeRef.current = now;
            }
        });

        if (settings.noiseGate) {
            audioEngineRef.current.setNoiseGate(settings.noiseGate);
        }

        return () => { if (audioEngineRef.current) audioEngineRef.current.stop(); };
    }, []);

    const toggleAudio = async () => {
        if (!audioEngineRef.current) return;
        if (audioEngineRef.current.isActive) {
            audioEngineRef.current.stop();
            setIsAudioActive(false);
        } else {
            await audioEngineRef.current.start();
            setIsAudioActive(true);
        }
    };

    const value = React.useMemo(() => ({
        audioEngineRef,
        dataRef,
        isAudioActive,
        toggleAudio
    }), [isAudioActive]);

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
