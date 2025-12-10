import { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Square, Target, Info } from 'lucide-react';

const ResonanceTrainingModule = ({ targetVowel = 'i', onComplete: _onComplete }) => {
    const { dataRef, isAudioActive, toggleAudio } = useAudio();
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('Ready');
    const [feedbackColor, setFeedbackColor] = useState('text-slate-400');

    const canvasRef = useRef(null);
    const scoreRef = useRef(0);

    // Vowel Targets (Approximate centers for average adult)
    // F1 (x-axis in standard phonetics is usually inverted, but we'll map to canvas X/Y)
    // Standard Plot: F1 (Height) on Y (inverted), F2 (Backness) on X (inverted)
    // Let's use: X = F2 (2500 -> 800), Y = F1 (200 -> 1000)
    const targets = {
        'i': { f1: 270, f2: 2300, label: '/i/ (heed)', color: '#2dd4bf' },
        'u': { f1: 300, f2: 870, label: '/u/ (who\'d)', color: '#a78bfa' },
        'a': { f1: 730, f2: 1090, label: '/a/ (hod)', color: '#fbbf24' }
    };

    const currentTarget = targets[targetVowel] || targets['i'];

    useEffect(() => {
        let animationId;

        const draw = () => {
            if (!canvasRef.current || !isPlaying) return;
            const ctx = canvasRef.current.getContext('2d');
            const width = canvasRef.current.width;
            const height = canvasRef.current.height;

            // Clear
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);

            // Grid
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Draw grid lines
            for (let i = 0; i < width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
            for (let i = 0; i < height; i += 50) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
            ctx.stroke();

            // Mapping Functions
            // F2: 2500Hz (Left) -> 800Hz (Right)
            const mapX = (f2) => {
                const minF2 = 800;
                const maxF2 = 2500;
                return width - ((f2 - minF2) / (maxF2 - minF2)) * width;
            };

            // F1: 200Hz (Top) -> 1000Hz (Bottom)
            const mapY = (f1) => {
                const minF1 = 200;
                const maxF1 = 1000;
                return ((f1 - minF1) / (maxF1 - minF1)) * height;
            };

            // Draw Target Zone
            const tx = mapX(currentTarget.f2);
            const ty = mapY(currentTarget.f1);
            const radius = 40; // Tolerance radius

            ctx.beginPath();
            ctx.arc(tx, ty, radius, 0, Math.PI * 2);
            ctx.fillStyle = `${currentTarget.color}33`; // Low opacity
            ctx.fill();
            ctx.strokeStyle = currentTarget.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            ctx.fillStyle = currentTarget.color;
            ctx.font = '14px monospace';
            ctx.fillText(currentTarget.label, tx - 30, ty - 50);

            // Draw User Cursor
            if (dataRef.current && dataRef.current.f1 > 0 && dataRef.current.f2 > 0) {
                const { f1, f2 } = dataRef.current;
                const ux = mapX(f2);
                const uy = mapY(f1);

                // Smoothing could be added here, but raw for now
                ctx.beginPath();
                ctx.arc(ux, uy, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                // Trail or glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffffff';

                // Hit Detection
                const dist = Math.sqrt(Math.pow(ux - tx, 2) + Math.pow(uy - ty, 2));
                if (dist < radius) {
                    setFeedback('Holding...');
                    setFeedbackColor('text-teal-400');
                    scoreRef.current += 0.2;

                    // Visual feedback on hit
                    ctx.beginPath();
                    ctx.arc(tx, ty, radius + 5, 0, Math.PI * 2);
                    ctx.strokeStyle = '#ffffff';
                    ctx.stroke();
                } else {
                    setFeedback('Adjust Vowel...');
                    setFeedbackColor('text-slate-400');
                }

                setScore(Math.floor(scoreRef.current));
            } else {
                setFeedback('Sing a vowel...');
                setFeedbackColor('text-slate-500');
            }

            animationId = requestAnimationFrame(draw);
        };

        if (isPlaying) {
            draw();
        } else {
            cancelAnimationFrame(animationId);
        }

        return () => cancelAnimationFrame(animationId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, currentTarget]);

    const handleStart = () => {
        if (!isAudioActive) toggleAudio();
        setIsPlaying(true);
        scoreRef.current = 0;
        setScore(0);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
            {/* Header */}
            <div className="flex justify-between w-full mb-6 items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Target className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Resonance Target</h3>
                        <div className="text-slate-400 text-xs">Match the vowel shape</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-bold">Score</div>
                    <div className="text-2xl font-mono font-bold text-white">{score}</div>
                </div>
            </div>

            {/* Plot */}
            <div className="relative w-full h-80 bg-slate-950 rounded-xl border border-slate-800 mb-6 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={460}
                    height={320}
                    className="w-full h-full"
                />
                <div className="absolute bottom-2 left-2 text-xs text-slate-600">High F2 (Front)</div>
                <div className="absolute bottom-2 right-2 text-xs text-slate-600">Low F2 (Back)</div>
                <div className="absolute top-2 left-2 text-xs text-slate-600">Low F1 (Close)</div>
                <div className="absolute bottom-10 left-2 text-xs text-slate-600">High F1 (Open)</div>
            </div>

            {/* Feedback */}
            <div className={`text-xl font-bold mb-6 h-8 transition-colors duration-200 ${feedbackColor}`}>
                {feedback}
            </div>

            {/* Controls */}
            <div className="w-full">
                {!isPlaying ? (
                    <button
                        onClick={handleStart}
                        className="w-full py-3 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Play size={20} /> Start Resonance Training
                    </button>
                ) : (
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Square size={20} /> Stop
                    </button>
                )}
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-950 p-3 rounded-lg">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>
                    Move the white dot into the colored circle by changing your mouth shape.
                    <br />• <strong>/i/ (Heed)</strong>: Tongue high and front. Smile.
                    <br />• <strong>/u/ (Who)</strong>: Tongue high and back. Lips rounded.
                    <br />• <strong>/a/ (Hot)</strong>: Tongue low. Jaw open.
                </p>
            </div>
        </div>
    );
};

export default ResonanceTrainingModule;
