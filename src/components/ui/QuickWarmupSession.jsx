/**
 * QuickWarmupSession.jsx
 * 
 * A streamlined 5-minute warmup session that can be launched from the dashboard.
 * Auto-advances through a curated set of exercises for quick vocal warm-up.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    X, Play, Pause, SkipForward, CheckCircle, Timer,
    Volume2, Wind, Music, Sparkles
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

// Curated 5-minute warmup routine
const WARMUP_EXERCISES = [
    {
        id: 'breath',
        name: 'Deep Breathing',
        duration: 45,
        icon: Wind,
        color: 'from-cyan-500 to-blue-500',
        instruction: 'Take 3 deep breaths. Inhale through nose (4 counts), hold (4 counts), exhale slowly (6 counts).',
        tips: ['Shoulders relaxed', 'Belly expands on inhale', 'Release all tension']
    },
    {
        id: 'humming',
        name: 'Gentle Humming',
        duration: 60,
        icon: Music,
        color: 'from-purple-500 to-pink-500',
        instruction: 'Hum gently at a comfortable pitch. Feel the vibration in your face and chest.',
        tips: ['Lips lightly closed', 'Jaw relaxed', 'Feel the buzz in your nose']
    },
    {
        id: 'lip-trills',
        name: 'Lip Trills',
        duration: 60,
        icon: Volume2,
        color: 'from-orange-500 to-red-500',
        instruction: 'Blow air through your lips to make them vibrate. Slide your pitch up and down.',
        tips: ['Use fingers on cheeks if needed', 'Keep breathing steady', 'Explore your range']
    },
    {
        id: 'pitch-glide',
        name: 'Gentle Sirens',
        duration: 60,
        icon: Sparkles,
        color: 'from-teal-500 to-emerald-500',
        instruction: 'Glide smoothly from low to high and back down. Keep it light and easy.',
        tips: ["Don't push at the top", 'Stay relaxed throughout', 'Explore head voice gently']
    },
    {
        id: 'vocal-stretch',
        name: 'Speak & Stretch',
        duration: 75,
        icon: Music,
        color: 'from-amber-500 to-orange-500',
        instruction: 'Count from 1 to 10 at your target pitch. Then say "Hello, how are you today?" with melodyful intonation.',
        tips: ['Apply what you warmed up', 'Keep it light', 'Notice how ready your voice feels']
    }
];

const QuickWarmupSession = ({ onClose }) => {
    const { isAudioActive, toggleAudio } = useAudio();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(WARMUP_EXERCISES[0].duration);
    const [completedExercises, setCompletedExercises] = useState([]);
    const [sessionComplete, setSessionComplete] = useState(false);

    const timerRef = useRef(null);
    const currentExercise = WARMUP_EXERCISES[currentIndex];

    // Calculate total and elapsed time
    const totalTime = WARMUP_EXERCISES.reduce((sum, ex) => sum + ex.duration, 0);
    const elapsedTime = completedExercises.reduce((sum, idx) => sum + WARMUP_EXERCISES[idx].duration, 0)
        + (currentExercise.duration - timeRemaining);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer logic
    useEffect(() => {
        if (isPlaying && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0 && isPlaying) {
            // Auto-advance to next exercise
            handleNext();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, timeRemaining]);

    const handleNext = useCallback(() => {
        // Mark current as completed
        setCompletedExercises(prev => [...prev, currentIndex]);

        if (currentIndex < WARMUP_EXERCISES.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setTimeRemaining(WARMUP_EXERCISES[nextIndex].duration);
        } else {
            // Session complete!
            setSessionComplete(true);
            setIsPlaying(false);
        }
    }, [currentIndex]);

    const handlePlayPause = () => {
        if (!isAudioActive) {
            toggleAudio();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSkip = () => {
        handleNext();
    };

    // Session complete screen
    if (sessionComplete) {
        return (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-3xl p-8 max-w-md w-full border border-emerald-500/30 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center animate-pulse">
                        <CheckCircle size={40} className="text-white" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Warmup Complete! 🎉</h2>
                    <p className="text-emerald-200 mb-6">Your voice is ready for practice!</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="text-2xl font-bold text-white">{formatTime(totalTime)}</div>
                            <div className="text-sm text-emerald-300">Total Time</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="text-2xl font-bold text-white">{WARMUP_EXERCISES.length}</div>
                            <div className="text-sm text-emerald-300">Exercises</div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl transition-all"
                    >
                        Start Practice
                    </button>
                </div>
            </div>
        );
    }

    const IconComponent = currentExercise.icon;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <Timer size={20} className="text-amber-400" />
                    <span className="text-white font-bold">5-Min Warmup</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-800">
                <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                    style={{ width: `${(elapsedTime / totalTime) * 100}%` }}
                />
            </div>

            {/* Exercise dots */}
            <div className="flex justify-center gap-2 py-4">
                {WARMUP_EXERCISES.map((ex, idx) => (
                    <div
                        key={ex.id}
                        className={`w-3 h-3 rounded-full transition-all ${completedExercises.includes(idx)
                                ? 'bg-emerald-500'
                                : idx === currentIndex
                                    ? 'bg-amber-500 ring-2 ring-amber-500/50 ring-offset-2 ring-offset-black'
                                    : 'bg-slate-700'
                            }`}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                {/* Exercise icon */}
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentExercise.color} flex items-center justify-center mb-8 shadow-2xl ${isPlaying ? 'animate-pulse' : ''}`}>
                    <IconComponent size={56} className="text-white" />
                </div>

                {/* Exercise name */}
                <h2 className="text-3xl font-bold text-white mb-2">{currentExercise.name}</h2>

                {/* Timer */}
                <div className="text-6xl font-mono font-bold text-amber-400 mb-6">
                    {formatTime(timeRemaining)}
                </div>

                {/* Instruction */}
                <p className="text-xl text-slate-300 max-w-md mb-6">{currentExercise.instruction}</p>

                {/* Tips */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {currentExercise.tips.map((tip, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">
                            {tip}
                        </span>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePlayPause}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-xl ${isPlaying
                                ? 'bg-amber-600 hover:bg-amber-500'
                                : 'bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400'
                            }`}
                    >
                        {isPlaying ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
                    </button>

                    <button
                        onClick={handleSkip}
                        className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors"
                        title="Skip to next exercise"
                    >
                        <SkipForward size={24} />
                    </button>
                </div>
            </div>

            {/* Footer - remaining time */}
            <div className="p-4 border-t border-slate-800 text-center">
                <span className="text-slate-400">
                    {currentIndex + 1} of {WARMUP_EXERCISES.length} • {formatTime(totalTime - elapsedTime)} remaining
                </span>
            </div>
        </div>
    );
};

export default QuickWarmupSession;
