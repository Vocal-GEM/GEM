import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { AudioEngine } from '../engines/AudioEngine';
import { useSettings } from './SettingsContext';
import { useProfile } from './ProfileContext';

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
    const [isRecording, setIsRecording] = useState(false);

    const { settings } = useSettings();
    const { filterSettings, calibration } = useProfile();
    const settingsRef = useRef(settings);

    useEffect(() => {
        settingsRef.current = settings;
        if (audioEngineRef.current) {
            audioEngineRef.current.setNoiseGate(settings.noiseGate);
        }
    }, [settings]);

    useEffect(() => {
        if (audioEngineRef.current && filterSettings) {
            audioEngineRef.current.setFilters(filterSettings.min, filterSettings.max);
        }
    }, [filterSettings]);

    useEffect(() => {
        if (audioEngineRef.current && calibration) {
            audioEngineRef.current.setCalibration(calibration.dark, calibration.bright);
        }
    }, [calibration]);

    useEffect(() => {
        if (audioEngineRef.current) {
            audioEngineRef.current.setListenMode(settings.listenMode);
        }
    }, [settings.listenMode]);

    useEffect(() => {
        const isFirstTime = !localStorage.getItem('hasVisited');
        if (isFirstTime) { localStorage.setItem('hasVisited', 'true'); }

        try {
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
                    // Log buffer diagnostics if available
                    lastLogTimeRef.current = now;
                }
            });

            if (settings.noiseGate) {
                audioEngineRef.current.setNoiseGate(settings.noiseGate);
            }
        } catch (err) {
            console.error("[AudioContext] Failed to initialize AudioEngine:", err);
            setAudioError("Audio initialization failed. Your browser may not support required features.");
        }

        // iOS Audio Unlock
        const unlockAudio = () => {
            if (audioEngineRef.current && audioEngineRef.current.context && audioEngineRef.current.context.state === 'suspended') {
                audioEngineRef.current.context.resume().then(() => {
                });
            }
        };

        window.addEventListener('touchstart', unlockAudio, { passive: true });
        window.addEventListener('click', unlockAudio, { passive: true });

        return () => {
            if (audioEngineRef.current) audioEngineRef.current.stop();
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('click', unlockAudio);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [audioError, setAudioError] = useState(null);

    const toggleAudio = async () => {
        if (!audioEngineRef.current) return;

        setAudioError(null);

        try {
            if (audioEngineRef.current.isActive) {
                audioEngineRef.current.stop();
                setIsAudioActive(false);
            } else {
                await audioEngineRef.current.start();
                setIsAudioActive(true);
            }
        } catch (err) {
            console.error("[AudioContext] Failed to toggle audio:", err);
            setAudioError(err.message || "Failed to start audio engine");
            setIsAudioActive(false);
        }
    };

    const runEnvironmentCheck = async () => {
        if (!audioEngineRef.current) return null;
        return await audioEngineRef.current.analyzeEnvironment();
    };

    const startRecording = async () => {
        if (audioEngineRef.current) {
            try {
                await audioEngineRef.current.startRecording();
                setIsRecording(true);
            } catch (error) {
                console.error('[AudioContext] Failed to start recording:', error);
                setAudioError(error.message || 'Failed to start recording');
            }
        }
    };

    const stopRecording = async () => {
        if (audioEngineRef.current) {
            const result = await audioEngineRef.current.stopRecording();
            setIsRecording(false);
            return result;
        }
        return null;
    };

    const value = useMemo(() => ({
        audioEngineRef,
        dataRef,
        isAudioActive,
        toggleAudio,
        runEnvironmentCheck,
        setPassthrough: (enabled) => audioEngineRef.current?.setPassthrough(enabled),
        startRecording,
        stopRecording,
        isRecording,
        audioError,
        audioContext: audioEngineRef.current?.audioContext
    }), [isAudioActive, isRecording, audioError]);

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
