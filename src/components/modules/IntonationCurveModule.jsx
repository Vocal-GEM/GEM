import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { INTONATION_PATTERNS } from '../../data/IntonationPatterns';
import { BiofeedbackService } from '../../services/BiofeedbackService';
import { Play, RefreshCw } from 'lucide-react';

const IntonationCurveModule = ({ embedded = false }) => {
    const { dataRef, isAudioActive, toggleAudio } = useAudio();
    const [pattern, setPattern] = useState(INTONATION_PATTERNS.statement);
    const [isRecording, setIsRecording] = useState(false);
    const [userTrace, setUserTrace] = useState([]); // Array of {t, v}
    const [score, setScore] = useState(null);
    const canvasRef = useRef(null);
    const startTimeRef = useRef(null);

    const DURATION = 2000; // 2 seconds per phrase

    const startRecording = () => {
        if (!isAudioActive) toggleAudio();
        setUserTrace([]);
        setScore(null);
        setIsRecording(true);
        startTimeRef.current = Date.now();
    };

    useEffect(() => {
        if (!isRecording) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - startTimeRef.current;
            const t = elapsed / DURATION;

            if (t >= 1.0) {
                // Stop
                setIsRecording(false);
                const finalScore = BiofeedbackService.calculateCurveScore(userTrace, pattern.points);
                setScore(finalScore);
                return;
            }

            const pitch = dataRef.current?.pitch;
            if (pitch && pitch > 50) {
                // Normalize pitch roughly between 150Hz and 300Hz (can be adaptive later)
                // Let's map 150-300Hz to 0-1 for visualization
                const minHz = 150;
                const maxHz = 300;
                const v = Math.max(0, Math.min(1, (pitch - minHz) / (maxHz - minHz)));

                setUserTrace(prev => [...prev, { t, v }]);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [isRecording, userTrace, pattern]);

    // Draw Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 4; i++) {
            ctx.moveTo(0, i * height / 4);
            ctx.lineTo(width, i * height / 4);
        }
        ctx.stroke();

        // Draw Target Curve
        ctx.strokeStyle = '#2dd4bf'; // Teal
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        pattern.points.forEach((p, i) => {
            const x = p.t * width;
            const y = height - (p.v * height);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw User Trace
        if (userTrace.length > 0) {
            ctx.strokeStyle = '#f472b6'; // Pink
            ctx.lineWidth = 3;
            ctx.beginPath();
            userTrace.forEach((p, i) => {
                const x = p.t * width;
                const y = height - (p.v * height);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

        // Draw Cursor if recording
        if (isRecording) {
            const elapsed = Date.now() - startTimeRef.current;
            const t = Math.min(1, elapsed / DURATION);
            const x = t * width;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

    }, [pattern, userTrace, isRecording]);

    return (
        <div className={`flex flex-col h-full ${embedded ? '' : 'p-6 bg-slate-900 text-white'}`}>
            {!embedded && <h2 className="text-xl font-bold mb-4">Intonation Tracing</h2>}

            <div className="flex gap-2 mb-4">
                {Object.values(INTONATION_PATTERNS).map(p => (
                    <button
                        key={p.id}
                        onClick={() => setPattern(p)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${pattern.id === p.id
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 relative bg-slate-900 rounded-xl border border-white/10 overflow-hidden mb-4">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="w-full h-full object-contain"
                />

                {score !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">{score}%</div>
                            <div className="text-sm text-slate-300">Match Score</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mb-4">
                <p className="text-sm text-slate-300">{pattern.description}</p>
            </div>

            <button
                onClick={startRecording}
                disabled={isRecording}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isRecording
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-purple-500 text-white hover:shadow-lg hover:shadow-teal-500/20'
                    }`}
            >
                {isRecording ? 'Recording...' : score !== null ? <><RefreshCw className="w-4 h-4" /> Try Again</> : <><Play className="w-4 h-4" /> Start Phrase</>}
            </button>
        </div>
    );
};

export default IntonationCurveModule;
