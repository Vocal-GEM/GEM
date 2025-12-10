import { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Square, TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';

const IntonationTrainingModule = ({ patternType = 'rising', onComplete }) => {
    const { dataRef, isAudioActive, toggleAudio } = useAudio();
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('Ready');
    const [progress, setProgress] = useState(0);

    const canvasRef = useRef(null);
    const scoreAccumulator = useRef(0);
    const sampleCount = useRef(0);
    const startTimeRef = useRef(0);
    const duration = 3000; // 3 seconds per attempt

    // Define Patterns (Normalized 0-1 for Time, 0-1 for Pitch Range)
    const patterns = {
        rising: {
            label: 'Rising (Question)',
            color: '#2dd4bf',
            fn: (t) => 0.3 + (t * 0.5) // Start low, end high
        },
        falling: {
            label: 'Falling (Statement)',
            color: '#f43f5e',
            fn: (t) => 0.8 - (t * 0.5) // Start high, end low
        },
        hill: {
            label: 'Hill (Emphasis)',
            color: '#fbbf24',
            fn: (t) => 0.3 + Math.sin(t * Math.PI) * 0.5 // Arc
        }
    };

    const currentPattern = patterns[patternType] || patterns.rising;

    useEffect(() => {
        let animationId;

        const draw = () => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext('2d');
            const width = canvasRef.current.width;
            const height = canvasRef.current.height;

            // Clear
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);

            // Draw Grid
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
            for (let i = 0; i < height; i += 50) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
            ctx.stroke();

            // Draw Target Curve
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';

            for (let x = 0; x <= width; x += 5) {
                const t = x / width;
                const yNorm = currentPattern.fn(t);
                const y = height - (yNorm * height); // Invert Y
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Draw Playhead & User Pitch
            if (isPlaying) {
                const elapsed = Date.now() - startTimeRef.current;
                const t = Math.min(1, elapsed / duration);
                setProgress(t * 100);

                const playheadX = t * width;

                // Draw Playhead Line
                ctx.beginPath();
                ctx.moveTo(playheadX, 0);
                ctx.lineTo(playheadX, height);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Get User Pitch
                if (dataRef.current && dataRef.current.pitch > 0) {
                    // Map Pitch to Y (Assuming range 150Hz - 300Hz for demo, ideally dynamic)
                    // Let's use a relative range based on starting pitch or fixed generic range
                    const minHz = 150;
                    const maxHz = 350;
                    const pitch = dataRef.current.pitch;
                    const yNorm = (pitch - minHz) / (maxHz - minHz);
                    const y = height - (Math.max(0, Math.min(1, yNorm)) * height);

                    // Draw Cursor
                    ctx.beginPath();
                    ctx.arc(playheadX, y, 8, 0, Math.PI * 2);
                    ctx.fillStyle = currentPattern.color;
                    ctx.fill();

                    // Calculate Error
                    const targetYNorm = currentPattern.fn(t);
                    const error = Math.abs(yNorm - targetYNorm);

                    // Score logic
                    if (error < 0.15) { // Within 15% range
                        scoreAccumulator.current += (1 - error) * 10;
                        setFeedback('Good!');
                    } else {
                        setFeedback('Adjust Pitch...');
                    }
                    sampleCount.current++;
                }

                if (t >= 1) {
                    setIsPlaying(false);
                    const finalScore = sampleCount.current > 0 ? Math.floor(scoreAccumulator.current / sampleCount.current * 10) : 0;
                    setScore(finalScore);
                    setFeedback(finalScore > 70 ? 'Great Job!' : 'Try Again');
                    if (onComplete) onComplete(finalScore);
                } else {
                    animationId = requestAnimationFrame(draw);
                }
            } else {
                // Idle state
                setFeedback('Press Start');
            }
        };

        draw(); // Draw once initially
        if (isPlaying) draw();

        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, currentPattern]);

    const handleStart = () => {
        if (!isAudioActive) toggleAudio();
        startTimeRef.current = Date.now();
        scoreAccumulator.current = 0;
        sampleCount.current = 0;
        setScore(0);
        setIsPlaying(true);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
            {/* Header */}
            <div className="flex justify-between w-full mb-6 items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                        {patternType === 'rising' && <TrendingUp className="text-teal-400" size={24} />}
                        {patternType === 'falling' && <TrendingDown className="text-rose-400" size={24} />}
                        {patternType === 'hill' && <Activity className="text-amber-400" size={24} />}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">{currentPattern.label}</h3>
                        <div className="text-slate-400 text-xs">Match the curve</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-bold">Score</div>
                    <div className="text-2xl font-mono font-bold text-white">{score}</div>
                </div>
            </div>

            {/* Canvas */}
            <div className="relative w-full h-64 bg-slate-950 rounded-xl border border-slate-800 mb-6 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={460}
                    height={256}
                    className="w-full h-full"
                />
                <div className="absolute bottom-2 left-2 text-xs text-slate-600">Start</div>
                <div className="absolute bottom-2 right-2 text-xs text-slate-600">End</div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-800 w-full">
                    <div
                        className="h-full transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%`, backgroundColor: currentPattern.color }}
                    />
                </div>
            </div>

            {/* Feedback */}
            <div className="text-xl font-bold text-white mb-6 h-8">
                {feedback}
            </div>

            {/* Controls */}
            <div className="w-full">
                {!isPlaying ? (
                    <button
                        onClick={handleStart}
                        className="w-full py-3 bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {score > 0 ? <RefreshCw size={20} /> : <Play size={20} />}
                        {score > 0 ? 'Try Again' : 'Start Pattern'}
                    </button>
                ) : (
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Recording...
                    </button>
                )}
            </div>
        </div>
    );
};

export default IntonationTrainingModule;
