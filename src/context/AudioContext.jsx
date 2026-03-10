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
            // Prioritize calibrated threshold if available
            const gate = settings.micProfile?.gateThreshold || settings.noiseGate || 0.005;
            audioEngineRef.current.setNoiseGate(gate);

            // Sync Tier 1 Settings
            if (audioEngineRef.current.setPitchSmoothing) {
                audioEngineRef.current.setPitchSmoothing(settings.pitchSmoothing);
            }
            if (audioEngineRef.current.setSignalValidation) {
                audioEngineRef.current.setSignalValidation(settings.signalValidation);
            }
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

    const [availableDevices, setAvailableDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(localStorage.getItem('selectedMicId') || 'default');

    useEffect(() => {
        // Enumerate devices
        const loadDevices = async () => {
            try {
                // Request permission first to get labels
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(t => t.stop()); // Stop immediately

                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter(d => d.kind === 'audioinput');
                setAvailableDevices(audioInputs);
            } catch (e) {
                console.error("Failed to load devices", e);
            }
        };

        loadDevices();
        navigator.mediaDevices.addEventListener('devicechange', loadDevices);
        return () => navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    }, []);

    useEffect(() => {
        const isFirstTime = !localStorage.getItem('hasVisited');
        if (isFirstTime) { localStorage.setItem('hasVisited', 'true'); }
        // ... (rest of init)

        try {
            audioEngineRef.current = new AudioEngine((data) => {
                // ... (data handler)
                const ref = dataRef.current;

                // OPTIMIZATION: Mutate in-place to avoid creating new objects/arrays
                let pitchToStore = data.pitch;

                if (data.pitch > 0) {
                    ref.silenceCounter = 0;
                    ref.lastValidPitch = data.pitch;
                } else {
                    ref.silenceCounter++;
                    if (ref.silenceCounter < 15 && ref.lastValidPitch > 0) {
                        pitchToStore = ref.lastValidPitch;
                    } else {
                        pitchToStore = 0;
                    }
                }

                // Update history in-place
                const history = ref.history;
                history.shift();
                history.push(pitchToStore);

                // Update properties in-place (shallow copy is safe as sub-objects are reused in AudioEngine)
                Object.assign(ref, data);

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
            setAudioError(`Audio initialization failed: ${err.message}. Your browser may not support required features.`);
        }

        // ... (audio unlock logic)
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
                await audioEngineRef.current.start(selectedDeviceId !== 'default' ? selectedDeviceId : null);
                setIsAudioActive(true);
            }
        } catch (err) {
            console.error("[AudioContext] Failed to toggle audio:", err);
            setAudioError(err.message || "Failed to start audio engine");
            setIsAudioActive(false);
        }
    };

    const selectDevice = async (deviceId) => {
        setSelectedDeviceId(deviceId);
        localStorage.setItem('selectedMicId', deviceId);

        // If active, restart with new device
        if (audioEngineRef.current?.isActive) {
            audioEngineRef.current.stop();
            // Short delay to ensure clean stop
            await new Promise(r => setTimeout(r, 100));
            await audioEngineRef.current.start(deviceId !== 'default' ? deviceId : null);
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
        availableDevices,
        selectedDeviceId,
        selectDevice,
        audioContext: audioEngineRef.current?.audioContext
    }), [isAudioActive, isRecording, audioError, availableDevices, selectedDeviceId]);

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
