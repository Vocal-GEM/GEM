import React, { useState, useEffect, useRef } from 'react';
import { useGem } from '../../context/GemContext';

const IntonationExercise = () => {
    const { dataRef, audioEngineRef, targetRange } = useGem();
    const canvasRef = useRef(null);

    // Settings
    const [speed, setSpeed] = useState(3); // 1-5
    const [variance, setVariance] = useState(30); // 10-100Hz
    const [volume, setVolume] = useState(0.5);
    const [isPlaying, setIsPlaying] = useState(false);

    // Animation State
    const stateRef = useRef({
        x: 0,
        targetPath: [],
        userPath: []
    });

    // Generate Target Path
    useEffect(() => {
        const generatePath = () => {
            const path = [];
            const center = (targetRange.min + targetRange.max) / 2;
            // Create a more natural speech-like curve
            // Instead of pure sine, use Perlin-like noise or combined sines
            for (let i = 0; i < 800; i++) {
                // Combine slow wave (phrase arch) and fast wave (syllable variation)
                const slow = Math.sin(i * 0.005 * speed);
                const fast = Math.sin(i * 0.03 * speed) * 0.3;
                const y = center + (slow + fast) * variance;
                path.push(y);
            }
            stateRef.current.targetPath = path;
        };
        generatePath();
    }, [speed, variance, targetRange]);

    // Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        const loop = () => {
            const { pitch } = dataRef.current;

            // Update User Path
            if (pitch > 0) {
                stateRef.current.userPath.push(pitch);
            } else {
                stateRef.current.userPath.push(null);
            }
            if (stateRef.current.userPath.length > 800) stateRef.current.userPath.shift();

            // Scroll
            stateRef.current.x += speed * 0.5;

            // Render
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Grid (Target Range)
            const yMin = 600 - ((targetRange.min - 50) / 300) * 600;
            const yMax = 600 - ((targetRange.max - 50) / 300) * 600;

            // Target Range Band
            ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
            ctx.fillRect(0, yMax, canvas.width, yMin - yMax);

            // Center Line
            const yCenter = 600 - (((targetRange.min + targetRange.max) / 2 - 50) / 300) * 600;
            ctx.beginPath();
            ctx.moveTo(0, yCenter);
            ctx.lineTo(canvas.width, yCenter);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw Target Path
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.6)'; // Blue-400
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            stateRef.current.targetPath.forEach((p, i) => {
                const x = i * 2 - (stateRef.current.x % 1600); // Loop
                const y = 600 - ((p - 50) / 300) * 600;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Draw User Path (Live)
            ctx.beginPath();
            ctx.strokeStyle = '#fbbf24'; // Amber-400
            ctx.lineWidth = 4;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 10;
            const userLen = stateRef.current.userPath.length;
            stateRef.current.userPath.forEach((p, i) => {
                if (p) {
                    const x = (canvas.width / 2) - (userLen - i) * 2;
                    const y = 600 - ((p - 50) / 300) * 600;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Current Pitch Indicator
            if (pitch > 0) {
                const y = 600 - ((pitch - 50) / 300) * 600;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(canvas.width / 2, y, 6, 0, Math.PI * 2);
                ctx.fill();

                // Feedback Ring
                const centerIdx = Math.floor((stateRef.current.x + canvas.width / 2) / 2) % 800;
                const targetPitch = stateRef.current.targetPath[centerIdx];
                const diff = Math.abs(pitch - targetPitch);

                if (diff < 20) {
                    ctx.strokeStyle = '#4ade80'; // Green
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, y, 12, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // Tone Generator (Guide)
            if (isPlaying && audioEngineRef.current) {
                // Calculate current target pitch at center screen
                const centerIdx = Math.floor((stateRef.current.x + canvas.width / 2) / 2) % 800;
                const targetPitch = stateRef.current.targetPath[centerIdx];
                if (targetPitch) {
                    // Use a more continuous tone approach if possible, or rapid updates
                    // For now, we just trigger. Ideally, AudioEngine should support setFrequency() on a running oscillator.
                    // Since we don't have that exposed yet, we'll skip the tone or accept the stutter.
                    // Let's try to just play it less frequently to avoid stutter, or implement a continuous oscillator in AudioEngine later.
                    // For this step, we'll just keep it as is but maybe lower volume.
                    if (stateRef.current.x % 10 < 1) { // Throttle
                        audioEngineRef.current.playFeedbackTone(targetPitch);
                    }
                }
            }

            animationId = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(animationId);
    }, [speed, variance, isPlaying, targetRange]);

    const [textPrompt, setTextPrompt] = useState("Hello, how are you today?");
    const [isEditingText, setIsEditingText] = useState(false);

    return (
        <div className="glass-panel p-4 rounded-2xl space-y-4 mb-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Intonation Flow</h3>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${isPlaying ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                    {isPlaying ? 'Stop Guide' : 'Play Guide Tone'}
                </button>
            </div>

            <div className="relative h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                <canvas ref={canvasRef} width={400} height={600} className="w-full h-full" />
            </div>

            {/* Text Prompt Area */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 text-center">
                {isEditingText ? (
                    <input
                        type="text"
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        onBlur={() => setIsEditingText(false)}
                        autoFocus
                        className="w-full bg-transparent text-center text-lg font-serif text-white outline-none border-b border-blue-500"
                    />
                ) : (
                    <p
                        onClick={() => setIsEditingText(true)}
                        className="text-lg font-serif text-slate-200 cursor-pointer hover:text-blue-300 transition-colors"
                        title="Click to edit text"
                    >
                        "{textPrompt}"
                    </p>
                )}
                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Read this while following the line</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Speed</label>
                    <input type="range" min="1" max="10" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Variance</label>
                    <input type="range" min="10" max="100" value={variance} onChange={(e) => setVariance(parseInt(e.target.value))} className="w-full accent-purple-500" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Volume</label>
                    <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
                </div>
            </div>
        </div>
    );
};

export default IntonationExercise;
