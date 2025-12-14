/**
 * MicroSession.jsx
 * 
 * Quick 5-10 minute focused practice sessions.
 * Automatically selects exercises based on skill weaknesses and spaced repetition.
 */

import { useState, useEffect, useRef } from 'react';
import {
    Clock, Zap, CheckCircle, ChevronRight,
    X, Play, Pause, SkipForward
} from 'lucide-react';
import SpacedRepetitionService from '../../services/SpacedRepetitionService';
import { addXP } from '../../services/XPService';
import { recordPractice } from '../../services/StreakService';

const DURATIONS = [
    { minutes: 5, label: '5 min', exercises: 2, xp: 25 },
    { minutes: 7, label: '7 min', exercises: 3, xp: 35 },
    { minutes: 10, label: '10 min', exercises: 4, xp: 50 }
];

const MicroSession = ({ onClose }) => {
    const [phase, setPhase] = useState('select'); // select, practice, review, complete
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const timerRef = useRef(null);

    // Generate session based on spaced repetition
    const startSession = (duration) => {
        setSelectedDuration(duration);

        // Get due exercises prioritized by skill assessment
        const dueExercises = SpacedRepetitionService.getDueExercises(duration.exercises);

        if (dueExercises.length === 0) {
            // No due exercises, get some random ones
            setExercises([]);
        } else {
            setExercises(dueExercises.map(ex => ({
                ...ex,
                timePerExercise: Math.floor((duration.minutes * 60) / duration.exercises)
            })));
        }

        setTimeLeft(Math.floor((duration.minutes * 60) / duration.exercises));
        setPhase('practice');
    };

    // Timer effect
    useEffect(() => {
        if (phase !== 'practice' || isPaused) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up for this exercise
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [phase, isPaused, currentIndex]);

    // Handle exercise completion
    const completeExercise = (quality) => {
        const currentExercise = exercises[currentIndex];

        // Record in spaced repetition
        if (currentExercise) {
            SpacedRepetitionService.recordReview(currentExercise.id, quality);
        }

        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setTimeLeft(exercises[currentIndex + 1]?.timePerExercise || 60);
        } else {
            // Session complete
            completeSession();
        }
    };

    const completeSession = () => {
        // Award XP and record practice
        addXP(selectedDuration.xp, 'Micro Session');
        recordPractice();

        setPhase('complete');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Rating buttons component
    const RatingButtons = ({ onRate }) => (
        <div className="flex gap-2 justify-center">
            {[
                { quality: 1, label: 'Struggled', color: 'red' },
                { quality: 3, label: 'Okay', color: 'amber' },
                { quality: 5, label: 'Nailed It', color: 'emerald' }
            ].map(({ quality, label, color }) => (
                <button
                    key={quality}
                    onClick={() => onRate(quality)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all bg-${color}-500/20 hover:bg-${color}-500/40 text-${color}-300 border border-${color}-500/30`}
                >
                    {label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                            <Zap className="text-teal-400" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white">Micro Session</h2>
                            <p className="text-xs text-slate-400">Quick focused practice</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Select Phase */}
                {phase === 'select' && (
                    <div className="p-6">
                        <p className="text-slate-300 text-center mb-6">
                            Choose your session length
                        </p>
                        <div className="space-y-3">
                            {DURATIONS.map(duration => (
                                <button
                                    key={duration.minutes}
                                    onClick={() => startSession(duration)}
                                    className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 rounded-2xl flex items-center justify-between transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                            <Clock className="text-teal-400" size={24} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-white">{duration.label}</div>
                                            <div className="text-xs text-slate-400">
                                                {duration.exercises} exercises • +{duration.xp} XP
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-500 group-hover:text-teal-400 transition-colors" size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Practice Phase */}
                {phase === 'practice' && exercises.length > 0 && (
                    <div className="p-6">
                        {/* Progress */}
                        <div className="flex gap-1 mb-6">
                            {exercises.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 h-1 rounded-full ${idx < currentIndex ? 'bg-teal-500' :
                                        idx === currentIndex ? 'bg-teal-400' : 'bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Timer */}
                        <div className="text-center mb-6">
                            <div className={`text-5xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                                Exercise {currentIndex + 1} of {exercises.length}
                            </p>
                        </div>

                        {/* Current Exercise */}
                        <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">
                                {exercises[currentIndex]?.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${exercises[currentIndex]?.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                                exercises[currentIndex]?.difficulty === 'intermediate' ? 'bg-amber-500/20 text-amber-300' :
                                    'bg-red-500/20 text-red-300'
                                }`}>
                                {exercises[currentIndex]?.difficulty || 'beginner'}
                            </span>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-colors"
                            >
                                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button
                                onClick={() => completeExercise(3)}
                                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-colors"
                            >
                                <SkipForward size={18} />
                                Done
                            </button>
                        </div>

                        {/* Quick rating */}
                        <div className="mt-4">
                            <p className="text-xs text-slate-400 text-center mb-2">How&apos;d it go?</p>
                            <RatingButtons onRate={completeExercise} />
                        </div>
                    </div>
                )}

                {/* Complete Phase */}
                {phase === 'complete' && (
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-emerald-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Session Complete!</h3>
                        <p className="text-slate-400 mb-6">
                            +{selectedDuration?.xp} XP earned
                        </p>

                        {/* Summary */}
                        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-white">{exercises.length}</div>
                                    <div className="text-xs text-slate-400">Exercises</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{selectedDuration?.minutes}</div>
                                    <div className="text-xs text-slate-400">Minutes</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-colors"
                        >
                            Done
                        </button>
                    </div>
                )}

                {/* No exercises fallback */}
                {phase === 'practice' && exercises.length === 0 && (
                    <div className="p-6 text-center">
                        <p className="text-slate-400 mb-4">No exercises available right now.</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MicroSession;
