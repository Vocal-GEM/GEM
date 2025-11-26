import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioEngine } from '../engines/AudioEngine';
import { useSettings } from './SettingsContext';

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
    const audioEngineRef = useRef(null);
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

    // We need settings to configure the engine (noise gate, etc.)
    // Note: We'll need to make sure SettingsContext is initialized before AudioContext
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

        audioEngineRef.current = new AudioEngine((data) => {
            // Pitch Hold Logic for Continuous Visualization
            const currentHistory = dataRef.current.history;
            let pitchToStore = data.pitch;

            if (data.pitch > 0) {
                // Valid pitch detected - reset silence counter
                dataRef.current.silenceCounter = 0;
                dataRef.current.lastValidPitch = data.pitch;
            } else {
                // No pitch detected - increment silence counter
                dataRef.current.silenceCounter++;

                // Hold last valid pitch for up to 15 frames (~250ms at 60fps)
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

            // Biofeedback Triggers (moved to component level or handled here?)
            // For now, let's keep simple feedback here if possible, or expose data for components to react
            if (data.pitch > 0) {
                const s = settingsRef.current;
                // Note: Target range check removed from here to avoid dependency on ProfileContext
                // Components should handle their own feedback logic based on dataRef

                // Low Pitch Trigger (Global safety/feedback)
                // We can't access targetRange here easily without circular dependency or complex prop drilling
                // So we'll move specific feedback logic to the components that know about targets (e.g. PitchVisualizer)
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

    const value = {
        audioEngineRef,
        dataRef,
        isAudioActive,
        toggleAudio
    };

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
