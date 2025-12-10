import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, RefreshCw, Volume2, XCircle, ArrowLeft } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

/**
 * ShadowingExercise Component
 * Allows users to practice mimicking target audio clips.
 * Features:
 * - Play target audio (TTS) with visual pitch curve
 * - Record user's attempt
 * - Overlay comparison of both pitch curves
 * - Simple similarity scoring
 */

const TARGET_CLIPS = [
    {
        id: 'greeting-1',
        title: 'Friendly Greeting',
        description: 'Practice a warm, upward inflected greeting.',
        text: 'Hi there! How are you doing today?',
        difficulty: 'Easy',
        rate: 1.0,
        pitch: 1.2
    },
    {
        id: 'question-1',
        title: 'Rising Question',
        description: 'Practice the rising intonation of a question.',
        text: 'Would you like to grab coffee?',
        difficulty: 'Easy',
        rate: 0.9,
        pitch: 1.1
    },
    {
        id: 'excited-1',
        title: 'Expressing Excitement',
        description: 'Practice enthusiastic, varied pitch.',
        text: 'Oh my gosh, that is so amazing!',
        difficulty: 'Medium',
        rate: 1.1,
        pitch: 1.3
    },
    {
        id: 'statement-1',
        title: 'Confident Statement',
        description: 'Practice a steady, downward inflection.',
        text: 'I am confident in my voice.',
        difficulty: 'Hard',
        rate: 0.9,
        pitch: 0.9
    }
];

const ShadowingExercise = ({ embedded = false, onClose }) => {
    const { dataRef, isAudioActive, toggleAudio } = useAudio();

    const [selectedClip, setSelectedClip] = useState(null); // customized to null initially to show selection
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [userPitchCurve, setUserPitchCurve] = useState([]);
    const [targetPitchCurve, setTargetPitchCurve] = useState([]);
    const [score, setScore] = useState(null);
    const [phase, setPhase] = useState('select'); // 'select', 'listen', 'record', 'compare'

    // Pitch detection interval
    const pitchIntervalRef = useRef(null);

    // Simulated target pitch curve (Idealized)
    useEffect(() => {
        if (!selectedClip) return;

        // Generate a simulated 'ideal' pitch curve based on the clip type
        const curve = [];
        const baseFreq = 180 + (selectedClip.pitch * 20); // Adjust base by pitch setting
        const length = 50;

        for (let i = 0; i < length; i++) {
            let freq = baseFreq;
            const progress = i / length;

            if (selectedClip.id.includes('question')) {
                // Dip then Rise
                freq += Math.sin(progress * Math.PI) * -10 + (progress * 60);
            } else if (selectedClip.id.includes('excited')) {
                // High variation
                freq += Math.sin(progress * Math.PI * 4) * 30 + (progress * 20);
            } else if (selectedClip.id.includes('greeting')) {
                // Rise-Fall-Rise
                freq += Math.sin(progress * Math.PI * 2) * 20;
            } else {
                // Steady with slight fall (statement)
                freq -= progress * 20;
            }
            // Add some jitter
            freq += Math.random() * 5;
            curve.push(freq);
        }
        setTargetPitchCurve(curve);
    }, [selectedClip]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (pitchIntervalRef.current) clearInterval(pitchIntervalRef.current);
        };
    }, []);

    // Capture user pitch during recording
    useEffect(() => {
        if (isRecording && isAudioActive) {
            pitchIntervalRef.current = setInterval(() => {
                if (dataRef.current && dataRef.current.pitch > 0) {
                    setUserPitchCurve(prev => {
                        const newCurve = [...prev, dataRef.current.pitch];
                        // Keep last 50 points to match target resolution approximately
                        return newCurve.slice(-50);
                    });
                }
            }, 100);
        } else {
            if (pitchIntervalRef.current) clearInterval(pitchIntervalRef.current);
        }
        return () => {
            if (pitchIntervalRef.current) clearInterval(pitchIntervalRef.current);
        };
    }, [isRecording, isAudioActive, dataRef]);

    const speakText = (text, rate = 1.0, pitch = 1.0) => {
        window.speechSynthesis.cancel(); // Stop any previous
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;

        // Try to pick a female voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha')));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => {
            setIsPlaying(false);
            // Auto advance phase if in listen mode
            if (phase === 'listen') {
                setTimeout(() => setPhase('record'), 500);
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const handlePlayTarget = useCallback(() => {
        if (selectedClip) {
            setPhase('listen');
            speakText(selectedClip.text, selectedClip.rate, selectedClip.pitch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClip]);

    const handleStartRecording = useCallback(async () => {
        if (!isAudioActive) {
            await toggleAudio();
        }

        setUserPitchCurve([]);
        setIsRecording(true);
        setPhase('record');

        // Allow manual stop, or auto-stop after generous timeout
        setTimeout(() => {
            if (isRecording) handleStopRecording();
        }, 8000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAudioActive, toggleAudio]);

    const handleStopRecording = useCallback(() => {
        setIsRecording(false);
        setPhase('compare');

        if (pitchIntervalRef.current) clearInterval(pitchIntervalRef.current);

        // Calculate Score
        if (userPitchCurve.length > 5) {
            const similarity = calculateSimilarity(targetPitchCurve, userPitchCurve);
            setScore(similarity);
        } else {
            setScore(0);
        }
    }, [targetPitchCurve, userPitchCurve]);

    const calculateSimilarity = (target, user) => {
        if (!target.length || !user.length) return 0;

        // Normalize to similar lengths via sampling isn't perfect but works for simple scoring
        // Here we just compare averages and general trend direction for a "fun" score

        const targetAvg = target.reduce((a, b) => a + b, 0) / target.length;
        const userAvg = user.reduce((a, b) => a + b, 0) / user.length;

        // 1. Average Pitch Proximity (50% of score)
        const diff = Math.abs(targetAvg - userAvg);
        const pitchScore = Math.max(0, 50 - (diff / 2)); // Lose 1 point per 2Hz diff

        // 2. Range/Variation match (50% of score)
        const targetRange = Math.max(...target) - Math.min(...target);
        const userRange = Math.max(...user) - Math.min(...user);
        const rangeDiff = Math.abs(targetRange - userRange);
        const rangeScore = Math.max(0, 50 - (rangeDiff));

        return Math.min(100, Math.round(pitchScore + rangeScore));
    };

    const handleTryAgain = () => {
        setPhase('listen');
        setUserPitchCurve([]);
        setScore(null);
        handlePlayTarget();
    };

    // Render SVG Pitch Curve
    const renderPitchCurve = (data, color) => {
        if (!data || data.length === 0) return null;

        // Normalize for SVG
        const width = 400;
        const height = 100; // viewBox height
        const minFreq = 100;
        const maxFreq = 350; // clamp range

        const points = data.map((freq, i) => {
            const x = (i / (data.length - 1)) * width;
            const clampedFreq = Math.max(minFreq, Math.min(maxFreq, freq));
            const y = height - ((clampedFreq - minFreq) / (maxFreq - minFreq)) * height;
            return `${x},${y}`;
        }).join(' ');

        return (
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        );
    };

    return (
        <div className={`flex flex-col h-full w-full ${embedded ? '' : 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto'}`}>
            <div className={`flex flex-col w-full mx-auto ${embedded ? '' : 'bg-slate-900 rounded-2xl border border-white/10 max-w-lg shadow-2xl overflow-hidden'}`}>

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/5 bg-slate-900/50">
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        {phase !== 'select' && (
                            <button onClick={() => setPhase('select')} className="mr-2 text-slate-400 hover:text-white">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        Shadowing & Mimicry
                    </h2>
                    {!embedded && onClose && (
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                            <XCircle size={24} />
                        </button>
                    )}
                </div>

                <div className="p-4 sm:p-6 flex-1 overflow-y-auto">

                    {/* SELECT PHASE */}
                    {phase === 'select' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <p className="text-slate-400 text-sm">
                                Choose a phrase to practice. Listen to the intonation, then record yourself mimicking it.
                            </p>
                            <div className="grid gap-3">
                                {TARGET_CLIPS.map(clip => (
                                    <button
                                        key={clip.id}
                                        onClick={() => { setSelectedClip(clip); handlePlayTarget(); }} // Select and auto-start
                                        className="p-4 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-500/50 text-left transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{clip.title}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${clip.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                                clip.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-red-500/10 text-red-400'
                                                }`}>
                                                {clip.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300 italic mb-2">&quot;{clip.text}&quot;</p>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <Volume2 size={12} /> Click to start
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* LISTEN PHASE */}
                    {phase === 'listen' && selectedClip && (
                        <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-in fade-in zoom-in-95 duration-300">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">Listen</h3>
                                <p className="text-slate-400">Hear the target intonation</p>
                            </div>

                            <div className="relative">
                                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${isPlaying ? 'border-blue-500 animate-pulse' : 'border-slate-700 bg-slate-800'}`}>
                                    <Volume2 size={48} className={isPlaying ? 'text-blue-400' : 'text-slate-500'} />
                                </div>
                                {isPlaying && (
                                    <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20"></div>
                                )}
                            </div>

                            <div className="bg-slate-800/80 p-6 rounded-2xl w-full max-w-sm text-center border border-white/5">
                                <p className="text-lg text-white font-medium">&quot;{selectedClip.text}&quot;</p>
                            </div>

                            <button
                                onClick={() => speakText(selectedClip.text, selectedClip.rate, selectedClip.pitch)}
                                className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2"
                            >
                                <RefreshCw size={14} /> Replay Audio
                            </button>
                        </div>
                    )}

                    {/* RECORD PHASE */}
                    {phase === 'record' && selectedClip && (
                        <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-in fade-in zoom-in-95 duration-300">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">Your Turn</h3>
                                <p className="text-slate-400">Mimic the pitch pattern</p>
                            </div>

                            <div className="w-full h-32 bg-slate-900/50 rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                                {/* Ghost Target Curve */}
                                <svg viewBox="0 0 400 100" className="absolute inset-0 w-full h-full opacity-30">
                                    {renderPitchCurve(targetPitchCurve, '#3b82f6')}
                                </svg>

                                {/* Live User Curve */}
                                <svg viewBox="0 0 400 100" className="absolute inset-0 w-full h-full">
                                    {renderPitchCurve(userPitchCurve, '#22c55e')}
                                </svg>

                                {!isRecording && userPitchCurve.length === 0 && (
                                    <span className="text-slate-600 text-sm">Visualization area</span>
                                )}
                            </div>

                            <button
                                onClick={isRecording ? handleStopRecording : handleStartRecording}
                                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${isRecording ? 'bg-red-500 border-4 border-red-400' : 'bg-blue-600 border-4 border-blue-500'
                                    }`}
                            >
                                {isRecording ? (
                                    <Square size={32} fill="currentColor" className="text-white" />
                                ) : (
                                    <Mic size={36} className="text-white" />
                                )}
                            </button>

                            <p className="text-slate-400 text-sm animate-pulse">
                                {isRecording ? 'Listening... Say the phrase!' : 'Tap mic to start'}
                            </p>
                        </div>
                    )}

                    {/* COMPARE PHASE */}
                    {phase === 'compare' && selectedClip && (
                        <div className="flex flex-col items-center space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500">

                            {/* Score Card */}
                            <div className="flex flex-col items-center">
                                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 mb-2">
                                    {score}%
                                </div>
                                <div className={`px-4 py-1 rounded-full text-sm font-bold ${score > 80 ? 'bg-green-500/20 text-green-400' :
                                    score > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                    {score > 80 ? 'Excellent Match!' : score > 50 ? 'Good Effort' : 'Keep Practicing'}
                                </div>
                            </div>

                            {/* Visualization Comparison */}
                            <div className="w-full bg-slate-800/30 rounded-xl p-4 border border-white/5">
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pattern Match</span>
                                    <div className="flex gap-3 text-[10px] font-bold">
                                        <span className="text-blue-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> TARGET</span>
                                        <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> YOU</span>
                                    </div>
                                </div>
                                <div className="h-32 w-full relative border-b border-l border-white/10 bg-slate-900/50 rounded-lg">
                                    <svg viewBox="0 0 400 100" className="absolute inset-0 w-full h-full">
                                        {renderPitchCurve(targetPitchCurve, '#3b82f6')}
                                        {renderPitchCurve(userPitchCurve, '#22c55e')}
                                    </svg>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                <button
                                    onClick={handleTryAgain}
                                    className="p-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold flex flex-col items-center justify-center gap-2 transition-all"
                                >
                                    <RefreshCw size={24} className="text-slate-400" />
                                    <span>Try Again</span>
                                </button>
                                <button
                                    onClick={() => setPhase('select')}
                                    className="p-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <ArrowLeft size={24} />
                                    <span>New Phrase</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShadowingExercise;
