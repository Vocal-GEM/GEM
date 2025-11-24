import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Square, RotateCcw } from 'lucide-react';

const MPTTracker = ({ dataRef, isActive }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [time, setTime] = useState(0);
    const [lastResult, setLastResult] = useState(null);
    const [threshold, setThreshold] = useState(0.02); // Volume threshold
    const [autoMode, setAutoMode] = useState(true);

    const startTimeRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!autoMode || !isActive) return;

        const checkAudio = () => {
            if (dataRef.current) {
                const vol = dataRef.current.volume || 0;

                if (!isRecording && vol > threshold) {
                    // Auto-start
                    startTimer();
                } else if (isRecording && vol < threshold) {
                    // Auto-stop (with debounce? for now instant)
                    // Maybe wait 500ms of silence?
                    // Let's keep it simple: if silence for > 500ms, stop
                    if (!startTimeRef.current.silenceStart) {
                        startTimeRef.current.silenceStart = Date.now();
                    } else if (Date.now() - startTimeRef.current.silenceStart > 500) {
                        stopTimer();
                    }
                } else if (isRecording && vol >= threshold) {
                    // Reset silence timer
                    if (startTimeRef.current) {
                        startTimeRef.current.silenceStart = null;
                    }
                }
            }
            animationRef.current = requestAnimationFrame(checkAudio);
        };

        animationRef.current = requestAnimationFrame(checkAudio);
        return () => cancelAnimationFrame(animationRef.current);
    }, [autoMode, isActive, isRecording, threshold, dataRef]);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setTime((Date.now() - startTimeRef.current.time) / 1000);
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startTimer = () => {
        setIsRecording(true);
        startTimeRef.current = { time: Date.now(), silenceStart: null };
        setTime(0);
    };

    const stopTimer = () => {
        setIsRecording(false);
        setLastResult(time);
        if (startTimeRef.current?.silenceStart) {
            // Adjust time to exclude silence
            // setTime(prev => prev - 0.5); 
        }
    };

    const reset = () => {
        setIsRecording(false);
        setTime(0);
        setLastResult(null);
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                        <Timer className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">MPT Tracker</div>
                        <div className="text-[10px] text-slate-400">Max Phonation Time</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Auto</span>
                    <button
                        onClick={() => setAutoMode(!autoMode)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${autoMode ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoMode ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
                <div className="text-4xl font-mono font-bold text-white mb-1">
                    {time.toFixed(1)}<span className="text-lg text-slate-500">s</span>
                </div>
                {lastResult !== null && !isRecording && (
                    <div className="text-xs text-slate-400">
                        Last: {lastResult.toFixed(1)}s
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-2">
                {!isRecording ? (
                    <button
                        onClick={startTimer}
                        disabled={autoMode}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-sm"
                    >
                        <Play className="w-4 h-4" /> Start
                    </button>
                ) : (
                    <button
                        onClick={stopTimer}
                        disabled={autoMode}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-sm"
                    >
                        <Square className="w-4 h-4 fill-current" /> Stop
                    </button>
                )}

                <button
                    onClick={reset}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Threshold Slider (only visible in auto mode) */}
            {autoMode && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Sensitivity</span>
                        <span>{Math.round(threshold * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0.01"
                        max="0.2"
                        step="0.01"
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            )}
        </div>
    );
};

export default MPTTracker;
