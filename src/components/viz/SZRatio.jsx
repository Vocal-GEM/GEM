import React, { useState, useRef, useEffect } from 'react';
import { Timer, Play, Square, RotateCcw, Divide } from 'lucide-react';

const SZRatio = ({ dataRef, isActive }) => {
    const [mode, setMode] = useState('s'); // 's' or 'z'
    const [sTime, setSTime] = useState(0);
    const [zTime, setZTime] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const [threshold, setThreshold] = useState(0.02);

    const startTimeRef = useRef(null);
    const animationRef = useRef(null);

    // Auto-detection logic (similar to MPT)
    useEffect(() => {
        if (!autoMode || !isActive) return;

        const checkAudio = () => {
            if (dataRef.current) {
                const vol = dataRef.current.volume || 0;

                if (!isRecording && vol > threshold) {
                    startTimer();
                } else if (isRecording && vol < threshold) {
                    // Debounce silence? 
                    if (!startTimeRef.current.silenceStart) {
                        startTimeRef.current.silenceStart = Date.now();
                    } else if (Date.now() - startTimeRef.current.silenceStart > 500) {
                        stopTimer();
                    }
                } else if (isRecording && vol >= threshold) {
                    if (startTimeRef.current) startTimeRef.current.silenceStart = null;
                }
            }
            animationRef.current = requestAnimationFrame(checkAudio);
        };

        animationRef.current = requestAnimationFrame(checkAudio);
        return () => cancelAnimationFrame(animationRef.current);
    }, [autoMode, isActive, isRecording, threshold, dataRef]);

    // Timer update
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                const elapsed = (Date.now() - startTimeRef.current.time) / 1000;
                if (mode === 's') setSTime(elapsed);
                else setZTime(elapsed);
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isRecording, mode]);

    const startTimer = () => {
        setIsRecording(true);
        startTimeRef.current = { time: Date.now(), silenceStart: null };
        // Reset current mode time
        if (mode === 's') setSTime(0);
        else setZTime(0);
    };

    const stopTimer = () => {
        setIsRecording(false);
    };

    const reset = () => {
        setSTime(0);
        setZTime(0);
        setIsRecording(false);
        setMode('s');
    };

    const ratio = zTime > 0 ? (sTime / zTime).toFixed(2) : '0.00';

    // Interpretation
    let interpretation = 'N/A';
    let color = 'text-slate-500';

    if (sTime > 0 && zTime > 0) {
        const r = parseFloat(ratio);
        if (r >= 0.9 && r <= 1.2) {
            interpretation = 'Normal (Efficient)';
            color = 'text-emerald-400';
        } else if (r > 1.4) {
            interpretation = 'Possible Pathology';
            color = 'text-red-400';
        } else if (r < 0.8) {
            interpretation = 'Respiratory Inefficiency'; // Or hyperfunction
            color = 'text-amber-400';
        } else {
            interpretation = 'Borderline';
            color = 'text-yellow-400';
        }
    }

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                        <Divide className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">S/Z Ratio</div>
                        <div className="text-[10px] text-slate-400">Laryngeal Efficiency</div>
                    </div>
                </div>

                {/* Auto Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Auto</span>
                    <button
                        onClick={() => setAutoMode(!autoMode)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${autoMode ? 'bg-cyan-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoMode ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                </div>
            </div>

            {/* Timers Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* S Timer */}
                <div
                    onClick={() => !isRecording && setMode('s')}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${mode === 's' ? 'bg-slate-800 border-cyan-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                >
                    <div className="text-xs text-slate-400 mb-1 font-bold">/s/ Duration</div>
                    <div className={`text-2xl font-mono font-bold ${mode === 's' && isRecording ? 'text-cyan-400' : 'text-white'}`}>
                        {sTime.toFixed(1)}s
                    </div>
                </div>

                {/* Z Timer */}
                <div
                    onClick={() => !isRecording && setMode('z')}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${mode === 'z' ? 'bg-slate-800 border-cyan-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                >
                    <div className="text-xs text-slate-400 mb-1 font-bold">/z/ Duration</div>
                    <div className={`text-2xl font-mono font-bold ${mode === 'z' && isRecording ? 'text-cyan-400' : 'text-white'}`}>
                        {zTime.toFixed(1)}s
                    </div>
                </div>
            </div>

            {/* Result */}
            <div className="bg-slate-950 rounded-lg p-3 mb-3 text-center border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Ratio (S ÷ Z)</div>
                <div className="text-3xl font-bold text-white mb-1">{ratio}</div>
                <div className={`text-xs font-bold ${color}`}>{interpretation}</div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                {!isRecording ? (
                    <button
                        onClick={startTimer}
                        disabled={autoMode}
                        className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-sm"
                    >
                        <Play className="w-4 h-4" /> Record /{mode}/
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

            <div className="mt-3 text-[9px] text-slate-500 text-center">
                Normal ratio is ~1.0. Ratio &gt; 1.4 suggests laryngeal pathology.
            </div>
        </div>
    );
};

export default SZRatio;
