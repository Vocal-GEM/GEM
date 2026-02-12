import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../../context/AudioContext';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';
import { useReferenceTone } from '../../../hooks/useReferenceTone';
import { Volume2, Smartphone, Mic, MicOff, AlertCircle } from 'lucide-react';

const PITCH_PRESETS = {
    feminization: { label: 'Feminization', min: 165, max: 255 },
    masculinization: { label: 'Masculinization', min: 95, max: 155 },
    custom: { label: 'Custom', min: 140, max: 220 }
};

const ABSOLUTE_MIN = 80;
const ABSOLUTE_MAX = 350;

const PitchFeedbackTool = () => {
    const { dataRef, isAudioActive, toggleAudio, audioError } = useAudio();
    const [currentPitch, setCurrentPitch] = useState(0);
    const [minThreshold, setMinThreshold] = useState(PITCH_PRESETS.feminization.min);
    const [maxThreshold, setMaxThreshold] = useState(PITCH_PRESETS.feminization.max);
    const [selectedPreset, setSelectedPreset] = useState('feminization');
    const [isVibrateEnabled, setIsVibrateEnabled] = useState(false);
    const [isToneEnabled, setIsToneEnabled] = useState(false);

    // Hooks
    const { triggerHaptic, isSupported: hapticSupported } = useHapticFeedback(isVibrateEnabled);
    const { playTone, stopTone } = useReferenceTone(isToneEnabled, minThreshold);

    // Animation loop for smooth updates
    const requestRef = useRef();

    const updatePitch = () => {
        if (dataRef.current) {
            const pitch = dataRef.current.pitch;
            // Simple smoothing or thresholding directly from engine data
            if (pitch > 50 && pitch < 1000) {
                setCurrentPitch(Math.round(pitch));
            } else {
                // Decay to 0 or hold last value? Let's hold for a bit then decay? 
                // For now, simple decay
                // actually just keep last valid or 0 if silence
                if (dataRef.current.silenceCounter > 10) {
                    setCurrentPitch(0);
                }
            }
        }
        requestRef.current = requestAnimationFrame(updatePitch);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updatePitch);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // Feedback Logic
    useEffect(() => {
        if (!isAudioActive) {
            stopTone();
            return;
        }

        const hasValidPitch = currentPitch > 50;
        const isOutsideRange = hasValidPitch && (currentPitch < minThreshold || currentPitch > maxThreshold);

        if (isOutsideRange) {
            // Haptic
            triggerHaptic(200);

            // Tone
            if (isToneEnabled) {
                playTone();
            } else {
                stopTone();
            }
        } else {
            stopTone();
        }
    }, [currentPitch, minThreshold, maxThreshold, isAudioActive, isToneEnabled, triggerHaptic, playTone, stopTone]);



    useEffect(() => {
        if (!isAudioActive) {
            setCurrentPitch(0);
        }
    }, [isAudioActive]);

    // Helper for circle color
    const getCircleColor = () => {
        if (currentPitch === 0) return 'border-slate-700 bg-slate-800';
        if (currentPitch < minThreshold || currentPitch > maxThreshold) return 'border-red-500 bg-red-900/20 shadow-[0_0_30px_rgba(239,68,68,0.4)]';
        return 'border-green-500 bg-green-900/20 shadow-[0_0_30px_rgba(34,197,94,0.4)]';
    };

    const setPresetRange = (presetKey) => {
        const preset = PITCH_PRESETS[presetKey];
        setSelectedPreset(presetKey);
        setMinThreshold(preset.min);
        setMaxThreshold(preset.max);
    };

    const handleMinThresholdChange = (value) => {
        setSelectedPreset('custom');
        const nextMin = Number(value);
        setMinThreshold(nextMin);
        if (nextMin >= maxThreshold) {
            setMaxThreshold(Math.min(ABSOLUTE_MAX, nextMin + 1));
        }
    };

    const handleMaxThresholdChange = (value) => {
        setSelectedPreset('custom');
        const nextMax = Number(value);
        setMaxThreshold(nextMax);
        if (nextMax <= minThreshold) {
            setMinThreshold(Math.max(ABSOLUTE_MIN, nextMax - 1));
        }
    };

    const hasValidPitch = currentPitch > 0;
    const pitchStatus = !hasValidPitch
        ? 'no-signal'
        : currentPitch < minThreshold
            ? 'low'
            : currentPitch > maxThreshold
                ? 'high'
                : 'in-range';

    return (
        <div className="flex flex-col h-full bg-black text-white p-4 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500">
                        Haptic Pitch Feedback
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Real-time tactile feedback with configurable target ranges
                    </p>
                </div>
                <button
                    onClick={toggleAudio}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${isAudioActive
                        ? 'bg-rose-600 hover:bg-rose-500'
                        : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                    aria-pressed={isAudioActive}
                    aria-label={isAudioActive ? 'Stop listening' : 'Start listening'}
                >
                    {isAudioActive ? <MicOff size={16} /> : <Mic size={16} />}
                    {isAudioActive ? 'Stop Listening' : 'Start Listening'}
                </button>
            </div>

            {audioError && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-red-200">{audioError}</p>
                </div>
            )}

            {/* Main Visualizer */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">

                {/* Stats */}
                <div className="absolute top-0 w-full flex justify-between px-8 text-sm font-mono">
                    <div className="text-slate-400">
                        TARGET RANGE: <span className="text-white text-lg">{minThreshold}–{maxThreshold} Hz</span>
                    </div>
                    <div className={`${pitchStatus === 'in-range' || pitchStatus === 'no-signal' ? 'text-green-400' : 'text-red-400'}`}>
                        CURRENT: <span className="text-2xl font-bold">{currentPitch > 0 ? currentPitch : '---'} Hz</span>
                    </div>
                </div>

                {/* Circle */}
                <div
                    className={`w-64 h-64 rounded-full border-8 transition-all duration-200 flex items-center justify-center ${getCircleColor()}`}
                >
                    <div className="text-center">
                        {currentPitch > 0 ? (
                            <>
                                <div className="text-4xl font-bold">{currentPitch}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Hz</div>
                            </>
                        ) : (
                            <div className="text-slate-600 italic">{isAudioActive ? 'Listening...' : 'Microphone paused'}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">

                {/* Presets */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Target Profile</label>
                        <span className="text-xs text-slate-500">Quick ranges for common goals</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(PITCH_PRESETS).map(([key, preset]) => (
                            <button
                                key={key}
                                onClick={() => setPresetRange(key)}
                                className={`p-3 rounded-lg border text-sm transition-all ${selectedPreset === key
                                    ? 'border-emerald-500/60 bg-emerald-900/30 text-emerald-300'
                                    : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                <div className="font-semibold">{preset.label}</div>
                                <div className="text-xs mt-1 opacity-80">{preset.min}–{preset.max} Hz</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Minimum Threshold Slider */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Minimum Pitch Threshold</label>
                        <span className="text-xs text-slate-500">Adjust the lower bound</span>
                    </div>
                    <input
                        type="range"
                        min={ABSOLUTE_MIN}
                        max={maxThreshold - 1}
                        value={minThreshold}
                        onChange={(e) => handleMinThresholdChange(e.target.value)}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                        <span>{ABSOLUTE_MIN} Hz</span>
                        <span>{maxThreshold - 1} Hz</span>
                    </div>
                </div>

                {/* Maximum Threshold Slider */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Maximum Pitch Threshold</label>
                        <span className="text-xs text-slate-500">Adjust the upper bound</span>
                    </div>
                    <input
                        type="range"
                        min={minThreshold + 1}
                        max={ABSOLUTE_MAX}
                        value={maxThreshold}
                        onChange={(e) => handleMaxThresholdChange(e.target.value)}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                        <span>{minThreshold + 1} Hz</span>
                        <span>{ABSOLUTE_MAX} Hz</span>
                    </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsVibrateEnabled(!isVibrateEnabled)}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${isVibrateEnabled
                            ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                            }`}
                    >
                        <Smartphone size={24} className={isVibrateEnabled ? 'animate-pulse' : ''} />
                        <span className="font-semibold">Vibration</span>
                        {!hapticSupported && <span className="text-[10px] text-red-400">(Not Supported)</span>}
                    </button>

                    <button
                        onClick={() => setIsToneEnabled(!isToneEnabled)}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${isToneEnabled
                            ? 'bg-blue-900/20 border-blue-500/50 text-blue-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                            }`}
                    >
                        <Volume2 size={24} />
                        <span className="font-semibold">Ref Tone</span>
                    </button>
                </div>

                <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <p>
                        Vibration primarily works on Android devices. iOS may block haptics in the browser.
                        Tone feedback will play a subtle sine wave when your pitch drops below the target.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PitchFeedbackTool;
