import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { BiofeedbackService } from '../../services/BiofeedbackService';
import { Check, ArrowUp, ArrowDown } from 'lucide-react';

const NOTES = [
    { note: 'C3', freq: 130.81 },
    { note: 'D3', freq: 146.83 },
    { note: 'E3', freq: 164.81 },
    { note: 'F3', freq: 174.61 },
    { note: 'G3', freq: 196.00 },
    { note: 'A3', freq: 220.00 },
    { note: 'B3', freq: 246.94 },
    { note: 'C4', freq: 261.63 },
    { note: 'D4', freq: 293.66 },
    { note: 'E4', freq: 329.63 },
    { note: 'F4', freq: 349.23 },
    { note: 'G4', freq: 392.00 },
    { note: 'A4', freq: 440.00 }
];

const PitchMatchingModule = ({ embedded = false }) => {
    const { dataRef, isAudioActive, toggleAudio } = useAudio();
    const [targetNote, setTargetNote] = useState(NOTES[5]); // Default A3
    const [feedback, setFeedback] = useState({ score: 0, status: 'no_input', diff: 0 });
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (!isAudioActive) return;

        const interval = setInterval(() => {
            const currentPitch = dataRef.current?.pitch;
            if (currentPitch && currentPitch > 50) {
                const result = BiofeedbackService.calculatePitchScore(currentPitch, targetNote.freq);
                setFeedback(result);

                if (result.status === 'perfect') {
                    setStreak(s => Math.min(s + 1, 100));
                } else {
                    setStreak(s => Math.max(0, s - 2));
                }
            } else {
                setFeedback({ score: 0, status: 'no_input', diff: 0 });
                setStreak(s => Math.max(0, s - 1));
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isAudioActive, targetNote]);

    return (
        <div className={`flex flex-col h-full ${embedded ? '' : 'p-6 bg-slate-900 text-white'}`}>
            {!embedded && <h2 className="text-xl font-bold mb-4">Pitch Matching</h2>}

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                {/* Target Selection */}
                <div className="flex gap-2 overflow-x-auto max-w-full pb-2">
                    {NOTES.map(n => (
                        <button
                            key={n.note}
                            onClick={() => setTargetNote(n)}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${targetNote.note === n.note
                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {n.note}
                        </button>
                    ))}
                </div>

                {/* Visual Feedback */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Outer Ring */}
                    <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-300 ${feedback.status === 'perfect' ? 'border-green-500' :
                        feedback.status === 'good' ? 'border-teal-500' :
                            'border-slate-700'
                        }`}></div>

                    {/* Streak Glow */}
                    <div
                        className="absolute inset-0 rounded-full bg-green-500 blur-3xl transition-opacity duration-500"
                        style={{ opacity: streak / 100 }}
                    ></div>

                    {/* Center Indicator */}
                    <div className="flex flex-col items-center z-10">
                        <div className="text-6xl font-bold mb-2">
                            {targetNote.note}
                        </div>
                        <div className={`text-lg font-bold flex items-center gap-2 ${feedback.status === 'perfect' ? 'text-green-400' :
                            feedback.status === 'high' ? 'text-yellow-400' :
                                feedback.status === 'low' ? 'text-blue-400' :
                                    'text-slate-500'
                            }`}>
                            {feedback.status === 'perfect' && <><Check className="w-5 h-5" /> Perfect</>}
                            {feedback.status === 'high' && <><ArrowDown className="w-5 h-5" /> Too High</>}
                            {feedback.status === 'low' && <><ArrowUp className="w-5 h-5" /> Too Low</>}
                            {feedback.status === 'no_input' && "Sing..."}
                        </div>
                        {feedback.status !== 'no_input' && (
                            <div className="text-xs text-slate-400 mt-1">
                                {feedback.diff > 0 ? '+' : ''}{feedback.diff.toFixed(1)} semitones
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Bar */}
                <div className="w-full max-w-xs bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-300"
                        style={{ width: `${feedback.score}%` }}
                    ></div>
                </div>
            </div>

            {!isAudioActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl z-20">
                    <button
                        onClick={toggleAudio}
                        className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105"
                    >
                        Start Microphone
                    </button>
                </div>
            )}
        </div>
    );
};

export default PitchMatchingModule;
