
import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, HelpCircle, RefreshCw } from 'lucide-react';
import { INTONATION_PATTERNS } from '../../data/IntonationPatterns';
import { BiofeedbackService } from '../../services/BiofeedbackService';

const IntonationCurveModule = ({ audioEngine }) => {
    const [selectedPattern, setSelectedPattern] = useState(INTONATION_PATTERNS[0]);
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, recording, analyzing, complete
    const [userTrace, setUserTrace] = useState([]); // Array of {t, v}
    const [score, setScore] = useState(null); // 0-100

    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const startTimeRef = useRef(0);

    const startRecording = () => {
        setIsRecording(true);
        setStatus('recording');
        setUserTrace([]);
        setScore(null);
        startTimeRef.current = Date.now();

        requestRef.current = requestAnimationFrame(animateLoop);

        // Auto stop after duration
        setTimeout(() => {
            if (isRecording) stopRecording();
        }, selectedPattern.duration);
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        setStatus('analyzing');

        // Calculate Score
        // We need to pass the full arrays. Re-use userTrace state if updated or pull from ref if needed.
        // Actually state updates might lag, let's assume valid data in userTrace by next render or use a Ref for trace data.
        // For simplicity, we'll wait for the state update or just trust the animation loop pushed enough data.

        // Wait a tick for state to settle? Or just calculate now with valid data.
        // Let's use a temp variable in animation loop for robust calculation or use a Ref for the trace.
    };

    // Use a ref for trace to avoid closure staleness in animation loop
    const traceRef = useRef([]);

    useEffect(() => {
        traceRef.current = userTrace;
    }, [userTrace]);

    // Handle Stop logic properly
    useEffect(() => {
        if (status === 'analyzing') {
            const finalTrace = traceRef.current;
            if (finalTrace.length > 5) {
                // Normalize target for scoring? 
                // BiofeedbackService.calculateCurveScore expects normalized arrays.
                // Our target points are already normalized {t:0..1, v:0..1}
                // Our user points are {t:0..1, v:0..1} (calculated in animateLoop)
                const calculatedScore = BiofeedbackService.calculateCurveScore(finalTrace, selectedPattern.points);
                setScore(calculatedScore);
                setStatus('complete');
            } else {
                setScore(0);
                setStatus('complete');
            }
            setIsRecording(false);
        }
    }, [status, selectedPattern.points]);


    const animateLoop = () => {
        if (!audioEngine || !canvasRef.current) return;

        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(1, elapsed / selectedPattern.duration);

        if (progress >= 1) {
            stopRecording();
            return;
        }

        const data = audioEngine.getAnalysisData();
        const pitch = data?.pitch || audioEngine.dataRef?.current?.pitch || 0;

        // Normalize pitch: assume range 100Hz - 300Hz for visualization (can be adjusted per gender profile)
        // 0 = 100Hz, 1 = 300Hz
        let normalizedPitch = (pitch - 100) / 200;
        normalizedPitch = Math.max(0, Math.min(1, normalizedPitch));

        if (pitch > 50) {
            // Add to trace
            traceRef.current.push({ t: progress, v: normalizedPitch });
            // Sync with state for basic reactivity if needed, but throttle it?
            // Actually, setting state every frame is bad. Let's only set state at end or rely on Ref for drawing?
            // We need to draw every frame.
        }

        draw(progress, traceRef.current);

        requestRef.current = requestAnimationFrame(animateLoop);
    };

    const draw = (progress, currentTrace) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Background Grid
        ctx.strokeStyle = '#1e293b'; // Slate-800
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.5); ctx.lineTo(width, height * 0.5); // Center line
        ctx.stroke();

        // Draw Target Curve
        ctx.beginPath();
        ctx.strokeStyle = '#64748b'; // Slate-500
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);

        selectedPattern.points.forEach((pt, i) => {
            const x = pt.t * width;
            const y = height - (pt.v * height); // Invert Y because canvas 0 is top
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw User Trace
        if (currentTrace && currentTrace.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#3b82f6'; // Blue-500
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';

            currentTrace.forEach((pt, i) => {
                const x = pt.t * width;
                const y = height - (pt.v * height);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

        // Draw Playhead
        const playheadX = progress * width;
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444'; // Red-500
        ctx.lineWidth = 2;
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();
    };

    // Initial draw
    useEffect(() => {
        if (canvasRef.current) {
            draw(0, []);
        }
    }, [selectedPattern]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="text-purple-400" /> Intonation Tracing
                    </h3>
                    <p className="text-sm text-slate-400">Mimic the speech pattern displayed.</p>
                </div>
                {(status === 'complete' || score !== null) && (
                    <div className="text-right animate-in fade-in zoom-in">
                        <div className={`text-2xl font-bold font-mono ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-slate-400'}`}>
                            {score !== null ? `${score}%` : '--'}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Accuracy</div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Select Pattern</label>
                    <div className="space-y-2">
                        {INTONATION_PATTERNS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    if (!isRecording) {
                                        setSelectedPattern(p);
                                        setScore(null);
                                        setStatus('idle');
                                    }
                                }}
                                disabled={isRecording}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedPattern.id === p.id ? 'bg-purple-900/20 border-purple-500/50 ring-1 ring-purple-500/30' : 'bg-slate-800 border-slate-700 hover:border-slate-600'} ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold text-sm ${selectedPattern.id === p.id ? 'text-purple-300' : 'text-slate-300'}`}>{p.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : p.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {p.difficulty}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 line-clamp-2">{p.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2 flex flex-col">
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 relative flex-1 min-h-[300px]">
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={300}
                            className="w-full h-full bg-slate-900 rounded-lg"
                        />

                        {/* Overlay Controls */}
                        {!isRecording && status !== 'recording' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-xl">
                                <button
                                    onClick={startRecording}
                                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold text-lg shadow-xl shadow-purple-900/30 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                                >
                                    {status === 'complete' ? <RefreshCw size={20} /> : <Play size={20} fill="currentColor" />}
                                    {status === 'complete' ? 'Try Again' : 'Start Recording'}
                                </button>
                            </div>
                        )}

                        {/* Recording Indicator */}
                        {isRecording && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-bold animate-pulse">
                                <div className="w-2 h-2 bg-red-400 rounded-full" />
                                Recording...
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-4 bg-blue-900/10 border border-blue-500/10 rounded-xl flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-200/80">
                            <strong>Tip:</strong> {selectedPattern.description} Try to match the dotted line closely.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntonationCurveModule;
