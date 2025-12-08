import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Check, ChevronRight, Wind, Music, Volume2 } from 'lucide-react';

/**
 * WarmupRoutine - Guided vocal warmup exercises before practice
 * Includes breathing, humming, and pitch siren exercises
 */
const WarmupRoutine = ({ onComplete, onSkip }) => {
    const [currentExercise, setCurrentExercise] = useState(0);
    const [exerciseState, setExerciseState] = useState('ready'); // ready, active, complete
    const [timer, setTimer] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const timerRef = useRef(null);
    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);

    const exercises = [
        {
            id: 'breathing',
            name: 'Diaphragmatic Breathing',
            icon: Wind,
            duration: 30,
            description: 'Deep belly breathing to relax vocal cords',
            instruction: 'Breathe in for 4 counts, hold for 4, exhale for 6. Repeat.',
            color: 'from-blue-500 to-cyan-500',
            phases: [
                { action: 'Inhale', duration: 4 },
                { action: 'Hold', duration: 4 },
                { action: 'Exhale', duration: 6 }
            ]
        },
        {
            id: 'humming',
            name: 'Gentle Humming',
            icon: Music,
            duration: 30,
            description: 'Warm up vocal folds with gentle vibration',
            instruction: 'Hum gently on "mmm", feeling vibration in your lips and nose.',
            color: 'from-purple-500 to-pink-500',
            targetHz: 180
        },
        {
            id: 'siren',
            name: 'Pitch Sirens',
            icon: Volume2,
            duration: 30,
            description: 'Slide through your range to stretch vocal folds',
            instruction: 'Glide from low to high on "ooo", then back down. Like a siren.',
            color: 'from-pink-500 to-rose-500',
            lowHz: 120,
            highHz: 300
        },
        {
            id: 'lip-trill',
            name: 'Lip Trills',
            icon: Wind,
            duration: 20,
            description: 'Relax lips and connect breath to voice',
            instruction: 'Blow air through loosely closed lips to make a "brrr" sound.',
            color: 'from-emerald-500 to-teal-500'
        }
    ];

    const currentEx = exercises[currentExercise];
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const completedDuration = exercises.slice(0, currentExercise).reduce((sum, ex) => sum + ex.duration, 0) + timer;
    const overallProgress = (completedDuration / totalDuration) * 100;

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopTone();
        };
    }, []);

    // Timer logic
    useEffect(() => {
        if (exerciseState === 'active') {
            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev >= currentEx.duration) {
                        setExerciseState('complete');
                        clearInterval(timerRef.current);
                        stopTone();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [exerciseState, currentEx]);

    const getAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContextRef.current;
    };

    const playTone = (hz) => {
        stopTone();
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(hz, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = { osc, gain };
    };

    const stopTone = () => {
        if (oscillatorRef.current) {
            oscillatorRef.current.gain.gain.setValueAtTime(0, audioContextRef.current?.currentTime || 0);
            setTimeout(() => {
                oscillatorRef.current?.osc.stop();
                oscillatorRef.current = null;
            }, 50);
        }
    };

    const startExercise = () => {
        setExerciseState('active');
        setTimer(0);

        // Play reference tone for humming exercise
        if (currentEx.id === 'humming' && currentEx.targetHz) {
            playTone(currentEx.targetHz);
        }
    };

    const nextExercise = () => {
        stopTone();
        if (currentExercise < exercises.length - 1) {
            setCurrentExercise(prev => prev + 1);
            setExerciseState('ready');
            setTimer(0);
        } else {
            // All exercises complete
            onComplete?.();
        }
    };

    const resetRoutine = () => {
        stopTone();
        setCurrentExercise(0);
        setExerciseState('ready');
        setTimer(0);
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // Get current breathing phase
    const getBreathingPhase = () => {
        if (currentEx.id !== 'breathing' || !currentEx.phases) return null;
        const cycleDuration = currentEx.phases.reduce((sum, p) => sum + p.duration, 0);
        const cyclePosition = timer % cycleDuration;

        let elapsed = 0;
        for (const phase of currentEx.phases) {
            if (cyclePosition < elapsed + phase.duration) {
                return {
                    action: phase.action,
                    remaining: phase.duration - (cyclePosition - elapsed)
                };
            }
            elapsed += phase.duration;
        }
        return currentEx.phases[0];
    };

    const breathingPhase = getBreathingPhase();

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">Vocal Warmup</h2>
                    <p className="text-sm text-slate-400">
                        {Math.ceil(totalDuration / 60)} min routine • {exercises.length} exercises
                    </p>
                </div>
                {onSkip && (
                    <button
                        onClick={onSkip}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Skip
                    </button>
                )}
            </div>

            {/* Overall Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Overall Progress</span>
                    <span>{Math.round(overallProgress)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            </div>

            {/* Exercise Steps */}
            <div className="flex gap-2 mb-6">
                {exercises.map((ex, i) => (
                    <div
                        key={ex.id}
                        className={`flex-1 h-2 rounded-full transition-all ${i < currentExercise ? 'bg-green-500' :
                                i === currentExercise ? `bg-gradient-to-r ${ex.color}` :
                                    'bg-slate-700'
                            }`}
                    />
                ))}
            </div>

            {/* Current Exercise Card */}
            <div className={`p-6 rounded-xl bg-gradient-to-br ${currentEx.color} bg-opacity-20 border border-white/10 mb-4`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-white/20">
                        <currentEx.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{currentEx.name}</h3>
                        <p className="text-sm text-white/70">{currentEx.description}</p>
                    </div>
                </div>

                {/* Timer Display */}
                <div className="text-center mb-4">
                    <div className="text-4xl font-mono font-bold text-white mb-1">
                        {formatTime(currentEx.duration - timer)}
                    </div>
                    {exerciseState === 'active' && breathingPhase && (
                        <div className={`text-2xl font-bold animate-pulse ${breathingPhase.action === 'Inhale' ? 'text-cyan-300' :
                                breathingPhase.action === 'Hold' ? 'text-yellow-300' :
                                    'text-pink-300'
                            }`}>
                            {breathingPhase.action}
                        </div>
                    )}
                </div>

                {/* Instruction */}
                <div className="bg-black/20 rounded-lg p-3 text-center">
                    <p className="text-sm text-white/90">{currentEx.instruction}</p>
                </div>

                {/* Timer Bar */}
                {exerciseState === 'active' && (
                    <div className="mt-4 h-2 bg-black/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white/50 transition-all duration-1000"
                            style={{ width: `${(timer / currentEx.duration) * 100}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
                {exerciseState === 'ready' && (
                    <button
                        onClick={startExercise}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-500/20 transition-all"
                    >
                        <Play className="w-5 h-5" fill="currentColor" />
                        Start Exercise
                    </button>
                )}

                {exerciseState === 'active' && (
                    <button
                        onClick={() => { setExerciseState('complete'); stopTone(); }}
                        className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-600 transition-all"
                    >
                        <Pause className="w-5 h-5" />
                        End Early
                    </button>
                )}

                {exerciseState === 'complete' && (
                    <button
                        onClick={nextExercise}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/20 transition-all"
                    >
                        {currentExercise < exercises.length - 1 ? (
                            <>Next Exercise <ChevronRight className="w-5 h-5" /></>
                        ) : (
                            <><Check className="w-5 h-5" /> Complete Warmup</>
                        )}
                    </button>
                )}
            </div>

            {/* Reset */}
            {(exerciseState !== 'ready' || currentExercise > 0) && (
                <button
                    onClick={resetRoutine}
                    className="w-full mt-3 py-2 text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                </button>
            )}
        </div>
    );
};

export default WarmupRoutine;
