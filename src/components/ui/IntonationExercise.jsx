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
            for (let i = 0; i < 800; i++) {
                // Sine wave pattern based on variance
                const y = center + Math.sin(i * 0.02 * speed) * variance;
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

            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(0, yMax, canvas.width, yMin - yMax);

            // Draw Target Path
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.lineWidth = 4;
            stateRef.current.targetPath.forEach((p, i) => {
                const x = i * 2 - (stateRef.current.x % 1600); // Loop
                const y = 600 - ((p - 50) / 300) * 600;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Draw User Path (Live)
            ctx.beginPath();
            ctx.strokeStyle = '#eab308'; // Yellow
            ctx.lineWidth = 3;
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

            // Current Pitch Indicator
            if (pitch > 0) {
                const y = 600 - ((pitch - 50) / 300) * 600;
                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.arc(canvas.width / 2, y, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            // Tone Generator (Guide)
            if (isPlaying && audioEngineRef.current) {
                // Calculate current target pitch at center screen
                const centerIdx = Math.floor((stateRef.current.x + canvas.width / 2) / 2) % 800;
                const targetPitch = stateRef.current.targetPath[centerIdx];
                if (targetPitch) {
                    audioEngineRef.current.playFeedbackTone(targetPitch); // Needs update to support continuous tone
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
