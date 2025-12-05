import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Square, Trophy, Target, Volume2 } from 'lucide-react';

const PitchTrainingModule = ({ targetNote = 'A3', targetFreq = 220, tolerance = 5, onComplete }) => {
    const { dataRef, isAudioActive, toggleAudio, audioEngine } = useAudio();
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState('Ready');
    const [feedbackColor, setFeedbackColor] = useState('text-slate-400');

    const canvasRef = useRef(null);
    const scoreRef = useRef(0);

    // Game Loop
    useEffect(() => {
        let animationId;

        const draw = () => {
            if (!canvasRef.current || !isPlaying) return;
            const ctx = canvasRef.current.getContext('2d');
            const width = canvasRef.current.width;
            const height = canvasRef.current.height;

            // Clear
            ctx.clearRect(0, 0, width, height);

            // Draw Target Line
            const centerY = height / 2;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Draw Tolerance Zone
            const pxPerHz = 2; // Scale
            const zoneHeight = tolerance * pxPerHz * 2;
            ctx.fillStyle = 'rgba(45, 212, 191, 0.1)'; // Teal tint
            ctx.fillRect(0, centerY - zoneHeight / 2, width, zoneHeight);

            // Draw User Pitch
            if (dataRef.current && dataRef.current.pitch > 0) {
                const pitch = dataRef.current.pitch;
                const diff = pitch - targetFreq;
                const y = centerY - (diff * pxPerHz);

                // Clamp y
                const clampedY = Math.max(10, Math.min(height - 10, y));

                // Check if hit
                const isHit = Math.abs(diff) <= tolerance;

                // Draw Ball
                ctx.beginPath();
                ctx.arc(width / 2, clampedY, 12, 0, Math.PI * 2);
                ctx.fillStyle = isHit ? '#2dd4bf' : '#f43f5e'; // Teal or Rose
                ctx.fill();
                ctx.shadowBlur = 15;
                ctx.shadowColor = ctx.fillStyle;

                // Feedback Text
                if (isHit) {
                    setFeedback('Perfect!');
                    setFeedbackColor('text-teal-400');
                    scoreRef.current += 0.5; // Add score
                    setStreak(s => s + 1);
                } else {
                    setFeedback(diff > 0 ? 'Too High' : 'Too Low');
                    setFeedbackColor('text-rose-400');
                    setStreak(0);
                }

                setScore(Math.floor(scoreRef.current));
            } else {
                setFeedback('Sing now...');
                setFeedbackColor('text-slate-400');
            }

            animationId = requestAnimationFrame(draw);
        };

        if (isPlaying) {
            draw();
        } else {
            cancelAnimationFrame(animationId);
        }

        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, targetFreq, tolerance]);

    const handleStart = () => {
        if (!isAudioActive) toggleAudio();
        setIsPlaying(true);
        scoreRef.current = 0;
        setScore(0);
        setStreak(0);
    };

    const handleStop = () => {
        setIsPlaying(false);
        if (onComplete) onComplete(score);
    };

    const playReference = () => {
        if (audioEngine && audioEngine.toneEngine) {
            audioEngine.toneEngine.play(targetFreq, 1.0, 'sine');
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
            {/* Header */}
            <div className="flex justify-between w-full mb-6 items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                        <Target className="text-teal-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Pitch Match</h3>
                        <div className="text-slate-400 text-xs">Target: {targetNote} ({targetFreq} Hz)</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-bold">Score</div>
                    <div className="text-2xl font-mono font-bold text-white">{score}</div>
                </div>
            </div>

            {/* Visualization */}
            <div className="relative w-full h-64 bg-slate-950 rounded-xl border border-slate-800 mb-6 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={256}
                    className="w-full h-full"
                />

                {/* Center Line Label */}
                <div className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-slate-600 font-mono pointer-events-none">
                    {targetFreq} Hz
                </div>
            </div>

            {/* Feedback Area */}
            <div className={`text-xl font-bold mb-8 h-8 transition-colors duration-200 ${feedbackColor}`}>
                {feedback}
            </div>

            {/* Controls */}
            <div className="flex gap-4 w-full">
                <button
                    onClick={playReference}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Volume2 size={20} /> Hear Tone
                </button>

                {!isPlaying ? (
                    <button
                        onClick={handleStart}
                        className="flex-[2] py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Play size={20} /> Start Practice
                    </button>
                ) : (
                    <button
                        onClick={handleStop}
                        className="flex-[2] py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Square size={20} /> Stop
                    </button>
                )}
            </div>
        </div>
    );
};

export default PitchTrainingModule;
