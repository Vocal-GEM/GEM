/**
 * BreathingExercise.jsx
 * 
 * A calming breathing exercise component shown before practice sessions.
 * Uses animated circle visualization for inhale/hold/exhale.
 */

import { useState, useEffect, useCallback } from 'react';
import { X, SkipForward } from 'lucide-react';

// Breathing phases with durations in seconds
const BREATHING_PHASES = [
    { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose', color: 'from-cyan-500 to-blue-500' },
    { name: 'Hold', duration: 4, instruction: 'Hold your breath gently', color: 'from-blue-500 to-purple-500' },
    { name: 'Exhale', duration: 6, instruction: 'Release slowly through your mouth', color: 'from-purple-500 to-pink-500' },
];

const TOTAL_CYCLES = 3;

const BreathingExercise = ({ onComplete, onSkip }) => {
    const [currentPhase, setCurrentPhase] = useState(0);
    const [timeInPhase, setTimeInPhase] = useState(0);
    const [cycle, setCycle] = useState(1);
    const [isComplete, setIsComplete] = useState(false);

    const phase = BREATHING_PHASES[currentPhase];
    const progress = (timeInPhase / phase.duration) * 100;

    // Calculate circle scale based on phase
    const getCircleScale = () => {
        const baseScale = 0.6;
        const maxScale = 1.0;
        const progress = timeInPhase / phase.duration;

        if (phase.name === 'Inhale') {
            return baseScale + (maxScale - baseScale) * progress;
        } else if (phase.name === 'Hold') {
            return maxScale;
        } else { // Exhale
            return maxScale - (maxScale - baseScale) * progress;
        }
    };

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeInPhase(prev => {
                if (prev >= phase.duration - 0.1) {
                    // Move to next phase
                    const nextPhase = (currentPhase + 1) % BREATHING_PHASES.length;

                    if (nextPhase === 0) {
                        // Completed a cycle
                        if (cycle >= TOTAL_CYCLES) {
                            setIsComplete(true);
                            clearInterval(timer);
                            setTimeout(() => onComplete?.(), 500);
                            return 0;
                        }
                        setCycle(c => c + 1);
                    }

                    setCurrentPhase(nextPhase);
                    return 0;
                }
                return prev + 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [currentPhase, cycle, phase.duration, onComplete]);

    const scale = getCircleScale();

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-6">
            {/* Skip button */}
            <button
                onClick={onSkip}
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
            >
                <SkipForward size={16} />
                Skip
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">Calm Your Mind</h2>
            <p className="text-slate-400 mb-8">Cycle {cycle} of {TOTAL_CYCLES}</p>

            {/* Breathing circle */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-slate-700" />

                {/* Animated circle */}
                <div
                    className={`rounded-full bg-gradient-to-br ${phase.color} shadow-2xl transition-transform duration-100 ease-linear flex items-center justify-center`}
                    style={{
                        transform: `scale(${scale})`,
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <span className="text-3xl font-bold text-white">
                        {phase.name}
                    </span>
                </div>

                {/* Progress ring */}
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-slate-800"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="url(#breathGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${progress * 3.01} 301`}
                        className="transition-all duration-100"
                    />
                    <defs>
                        <linearGradient id="breathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Instruction */}
            <p className="text-xl text-slate-300 text-center max-w-sm mb-4">
                {phase.instruction}
            </p>

            {/* Timer */}
            <div className="text-4xl font-mono font-bold text-white">
                {Math.ceil(phase.duration - timeInPhase)}
            </div>

            {/* Phase indicators */}
            <div className="flex gap-2 mt-8">
                {BREATHING_PHASES.map((p, idx) => (
                    <div
                        key={p.name}
                        className={`w-3 h-3 rounded-full transition-all ${idx === currentPhase
                                ? 'bg-white ring-2 ring-white/50 ring-offset-2 ring-offset-black'
                                : idx < currentPhase || (currentPhase === 0 && cycle > 1)
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-700'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default BreathingExercise;
