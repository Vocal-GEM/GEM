import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, ThumbsUp, ThumbsDown, ArrowLeft, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { PracticeRoutineGenerator } from '../../services/PracticeRoutineGenerator';
import DynamicOrb from '../viz/DynamicOrb';
import PitchVisualizer from '../viz/PitchVisualizer';
import ResonanceOrb from '../viz/ResonanceOrb';
import VoiceQualityMeter from '../viz/VoiceQualityMeter';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdaptivePracticeSession = ({ onClose }) => {
    const { activeProfile, skillLevel, goals, calibration } = useProfile();
    const { audioEngineRef, dataRef, isAudioActive, toggleAudio } = useAudio();

    const [routine, setRoutine] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [feedbackGiven, setFeedbackGiven] = useState(false);

    const [hasGenerated, setHasGenerated] = useState(false);

    // Initialize Routine
    useEffect(() => {
        const generated = PracticeRoutineGenerator.generateRoutine({ skillLevel, goals });
        setRoutine(generated);
        setHasGenerated(true);
        if (generated.length > 0) {
            setTimeLeft(generated[0].duration);
        }
    }, [skillLevel, goals]);

    // ... (Timer useEffect)

    // Handlers
    const handleRestart = () => {
        setCurrentIndex(0);
        setIsComplete(false);
        setFeedbackGiven(false);
        if (routine.length > 0) setTimeLeft(routine[0].duration);
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            // Logic to start audio engine or timer
            toggleAudio();
        }
    };

    const handleSkip = () => {
        if (currentIndex < routine.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setTimeLeft(routine[currentIndex + 1].duration);
            setFeedbackGiven(false);
        } else {
            setIsComplete(true);
        }
    };

    const handleFeedback = (type) => {
        setFeedbackGiven(true);
        // Log feedback logic here
        console.log('Feedback:', type);
        // Auto advance after feedback?
        setTimeout(() => handleSkip(), 1000);
    };

    if (!hasGenerated) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <LoadingSpinner />
                <p className="mt-4">Generating your personalized routine...</p>
            </div>
        );
    }

    if (routine.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Exercises Found</h2>
                <p className="text-center max-w-md mb-6">
                    We couldn't find any exercises matching your current profile settings.
                    Try adjusting your skill level or goals.
                </p>
                <button onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
                <p className="text-slate-400 mb-8 text-center max-w-md">Great job! You've completed your personalized practice routine.</p>

                <div className="flex gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors">
                        Back to Dashboard
                    </button>
                    <button onClick={handleRestart} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center gap-2">
                        <RefreshCw size={18} /> Practice Again
                    </button>
                </div>
            </div>
        );
    }

    const currentExercise = routine[currentIndex];

    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={onClose} className="text-slate-400 hover:text-white flex items-center gap-2">
                    <ArrowLeft size={20} /> <span className="font-bold">Exit Session</span>
                </button>
                <div className="text-sm font-bold text-slate-500">
                    Exercise {currentIndex + 1} of {routine.length}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Visualization Area */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-900/50 border border-white/5 shadow-2xl min-h-[400px]">
                    {currentExercise.visualization === 'pitch' && <PitchVisualizer dataRef={dataRef} />}
                    {currentExercise.visualization === 'resonance' && (
                        <ResonanceOrb
                            dataRef={dataRef}
                            calibration={calibration}
                            showDebug={false}
                        />
                    )}
                    {currentExercise.visualization === 'weight' && <VoiceQualityMeter dataRef={dataRef} userMode="user" showAnalysis={false} />}

                    {/* Overlay Timer */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <span className={`font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Instructions & Controls */}
                <div className="flex flex-col justify-center space-y-8 p-4">
                    <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                            {currentExercise.category}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">{currentExercise.title}</h2>
                        <p className="text-lg text-slate-300 leading-relaxed">{currentExercise.instructions}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePlayPause}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${isPlaying
                                ? 'bg-yellow-500 text-white hover:bg-yellow-400 shadow-yellow-500/20'
                                : 'bg-green-500 text-white hover:bg-green-400 shadow-green-500/20 pl-1'
                                }`}
                        >
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                        </button>

                        <button
                            onClick={handleSkip}
                            className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
                            title="Skip Exercise"
                        >
                            <SkipForward size={24} />
                        </button>
                    </div>

                    {/* Feedback */}
                    {!feedbackGiven && (
                        <div className="pt-8 border-t border-white/5 animate-in fade-in duration-500">
                            <p className="text-sm text-slate-500 mb-3 font-bold uppercase">How was this exercise?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleFeedback('good')}
                                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-green-400 transition-colors flex items-center gap-2"
                                >
                                    <ThumbsUp size={16} /> Good
                                </button>
                                <button
                                    onClick={() => handleFeedback('hard')}
                                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 transition-colors flex items-center gap-2"
                                >
                                    <ThumbsDown size={16} /> Too Hard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdaptivePracticeSession;
