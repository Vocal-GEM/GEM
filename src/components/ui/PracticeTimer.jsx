import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, X, Bell } from 'lucide-react';

const PRESETS = [
    { label: '5 min', seconds: 5 * 60 },
    { label: '10 min', seconds: 10 * 60 },
    { label: '15 min', seconds: 15 * 60 },
    { label: '20 min', seconds: 20 * 60 },
];

const PracticeTimer = ({ onComplete, onClose, compact = false }) => {
    const [duration, setDuration] = useState(PRESETS[1].seconds); // Default 10 min
    const [remaining, setRemaining] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const intervalRef = useRef(null);


    // Create audio context for completion chime
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Timer logic
    useEffect(() => {
        if (isRunning && remaining > 0) {
            intervalRef.current = setInterval(() => {
                setRemaining(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        setIsComplete(true);
                        playCompletionSound();
                        if (onComplete) onComplete(duration);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, remaining, duration, onComplete]);

    // Pause timer when tab is hidden
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden && isRunning) {
                // Pause when hidden (optional: could continue in background)
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [isRunning]);

    const playCompletionSound = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1); // C#6
            osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.2); // E6

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.warn('Could not play completion sound', e);
        }
    }, []);

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setRemaining(duration);
        setIsComplete(false);
    };

    const addTime = (seconds) => {
        setRemaining(prev => prev + seconds);
        setDuration(prev => prev + seconds);
        setIsComplete(false);
    };

    const selectPreset = (seconds) => {
        setDuration(seconds);
        setRemaining(seconds);
        setIsRunning(false);
        setIsComplete(false);
    };

    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    const progress = ((duration - remaining) / duration) * 100;

    // Compact mode for header display
    if (compact) {
        return (
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700">
                <Timer size={14} className="text-teal-400" />
                <span className={`font-mono font-bold text-sm ${remaining < 60 ? 'text-amber-400' : 'text-white'}`}>
                    {formatTime(remaining)}
                </span>
                <button
                    onClick={toggleTimer}
                    className="p-1 rounded-full hover:bg-slate-700 transition-colors"
                >
                    {isRunning ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
                </button>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Timer className="text-teal-400" size={20} />
                    <span className="text-white font-bold">Practice Timer</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Circular Progress */}
            <div className="relative w-48 h-48 mx-auto mb-6">
                {/* Background ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-700"
                    />
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#timerGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                        className="transition-all duration-1000"
                    />
                    <defs>
                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Time display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-4xl font-mono font-bold ${isComplete ? 'text-teal-400 animate-pulse' : remaining < 60 ? 'text-amber-400' : 'text-white'}`}>
                        {formatTime(remaining)}
                    </div>
                    {isComplete && (
                        <div className="flex items-center gap-1 text-teal-400 text-sm mt-1">
                            <Bell size={14} />
                            <span>Complete!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Preset Buttons */}
            <div className="flex justify-center gap-2 mb-6">
                {PRESETS.map(preset => (
                    <button
                        key={preset.seconds}
                        onClick={() => selectPreset(preset.seconds)}
                        disabled={isRunning}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${duration === preset.seconds
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                            }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-3">
                <button
                    onClick={resetTimer}
                    className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-all"
                    title="Reset"
                >
                    <RotateCcw size={20} />
                </button>

                <button
                    onClick={toggleTimer}
                    className={`px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${isRunning
                        ? 'bg-amber-500 hover:bg-amber-400'
                        : 'bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-400 hover:to-purple-400'
                        }`}
                >
                    {isRunning ? (
                        <>
                            <Pause size={20} />
                            Pause
                        </>
                    ) : (
                        <>
                            <Play size={20} fill="currentColor" />
                            {remaining === duration ? 'Start' : 'Resume'}
                        </>
                    )}
                </button>

                <button
                    onClick={() => addTime(5 * 60)}
                    className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-all flex items-center gap-1"
                    title="Add 5 minutes"
                >
                    <Plus size={16} />
                    <span className="text-xs">5m</span>
                </button>
            </div>
        </div>
    );
};

export default PracticeTimer;
