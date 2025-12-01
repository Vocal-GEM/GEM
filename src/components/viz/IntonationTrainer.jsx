import React, { useEffect, useRef, useState, useMemo } from 'react';
import { TrendingUp, RefreshCw, ChevronRight, ChevronLeft, Play, History, Settings, Volume2 } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

// Simple DTW-like scoring (Euclidean distance between resampled curves)
const calculateScore = (trace, patternPoints) => {
    if (!trace || trace.length < 10) return 0;

    // Resample trace to match pattern length (e.g., 50 points)
    const numPoints = 50;
    const resampledTrace = [];

    for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        // Find corresponding point in trace based on x (time)
        // Trace x is 0-1 normalized
        const exactIndex = trace.findIndex(p => p.x >= t);

        let y = 0;
        if (exactIndex === -1) {
            y = trace[trace.length - 1].y;
        } else if (exactIndex === 0) {
            y = trace[0].y;
        } else {
            // Interpolate
            const p1 = trace[exactIndex - 1];
            const p2 = trace[exactIndex];
            const ratio = (t - p1.x) / (p2.x - p1.x);
            y = p1.y + (p2.y - p1.y) * ratio;
        }
        resampledTrace.push(y);
    }

    // Resample Pattern (it's defined by sparse points)
    const resampledPattern = [];
    // Helper to get pattern Y at X
    const getPatternY = (x) => {
        // Find segment
        for (let i = 0; i < patternPoints.length - 1; i++) {
            if (x >= patternPoints[i].x && x <= patternPoints[i + 1].x) {
                const p1 = patternPoints[i];
                const p2 = patternPoints[i + 1];
                const ratio = (x - p1.x) / (p2.x - p1.x);
                return p1.y + (p2.y - p1.y) * ratio;
            }
        }
        return patternPoints[patternPoints.length - 1].y;
    };

    for (let i = 0; i < numPoints; i++) {
        resampledPattern.push(getPatternY(i / (numPoints - 1)));
    }

    // Calculate MSE
    let errorSum = 0;
    for (let i = 0; i < numPoints; i++) {
        const diff = resampledTrace[i] - resampledPattern[i];
        errorSum += diff * diff;
    }
    const mse = errorSum / numPoints;

    // Convert MSE to Score (0-100)
    // MSE of 0.0 = 100%
    // MSE of 0.1 = ~50% (arbitrary scaling)
    const score = Math.max(0, 100 - (mse * 500));
    return Math.round(score);
};

const IntonationTrainer = ({ dataRef, isActive, audioEngine }) => {
    const { targetRange } = useProfile();
    const canvasRef = useRef(null);
    const [selectedPattern, setSelectedPattern] = useState(0);
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [isTracing, setIsTracing] = useState(false);
    const [duration, setDuration] = useState(2.0);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Patterns: Array of { name, points: [{x, y}] } where x,y are 0-1 normalized
    const patterns = [
        {
            name: "Rising Question",
            description: "Start mid, dip slightly, then rise sharply at the end.",
            points: [
                { x: 0, y: 0.5 }, { x: 0.2, y: 0.5 }, { x: 0.4, y: 0.45 },
                { x: 0.6, y: 0.55 }, { x: 0.8, y: 0.75 }, { x: 1, y: 0.9 }
            ]
        },
        {
            name: "Falling Statement",
            description: "Start high, stay level, then fall at the end.",
            points: [
                { x: 0, y: 0.7 }, { x: 0.3, y: 0.7 }, { x: 0.6, y: 0.65 },
                { x: 0.8, y: 0.4 }, { x: 1, y: 0.2 }
            ]
        },
        {
            name: "Hill Contour",
            description: "Rise up and then come back down (emphasis).",
            points: [
                { x: 0, y: 0.4 }, { x: 0.2, y: 0.5 }, { x: 0.5, y: 0.8 },
                { x: 0.8, y: 0.5 }, { x: 1, y: 0.4 }
            ]
        },
        {
            name: "Flat Monotone",
            description: "Keep a steady pitch (control).",
            points: [
                { x: 0, y: 0.5 }, { x: 1, y: 0.5 }
            ]
        }
    ];

    // Trace history: Array of {x, y}
    const traceRef = useRef([]);
    const startTimeRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let animationId;

        const draw = () => {
            // Clear
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);

            // Draw Grid
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 1; i < 4; i++) {
                ctx.moveTo(0, i * height / 4);
                ctx.lineTo(width, i * height / 4);
            }
            ctx.stroke();

            // Draw Target Pattern (Ghost)
            const pattern = patterns[selectedPattern];
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw smooth curve through points
            if (pattern.points.length > 0) {
                const p0 = pattern.points[0];
                ctx.moveTo(p0.x * width, height - p0.y * height);

                for (let i = 1; i < pattern.points.length; i++) {
                    const p = pattern.points[i];
                    ctx.lineTo(p.x * width, height - p.y * height);
                }
            }
            ctx.stroke();

            // Draw User Trace
            if (isActive && dataRef.current && dataRef.current.pitch > 50) {
                if (!isTracing) {
                    setIsTracing(true);
                    traceRef.current = [];
                    startTimeRef.current = Date.now();
                    setScore(null);
                    setFeedback("");
                }

                const elapsed = (Date.now() - startTimeRef.current) / 1000;

                if (elapsed <= duration) {
                    const x = elapsed / duration;
                    const minP = targetRange.min - 20;
                    const maxP = targetRange.max + 20;
                    const pitch = dataRef.current.pitch;
                    const y = Math.max(0, Math.min(1, (pitch - minP) / (maxP - minP)));

                    traceRef.current.push({ x, y });
                } else {
                    // End of trace
                    if (isTracing) {
                        setIsTracing(false);
                        const finalScore = calculateScore(traceRef.current, patterns[selectedPattern].points);
                        setScore(finalScore);

                        // Generate Feedback
                        if (finalScore > 85) setFeedback("Excellent!");
                        else if (finalScore > 70) setFeedback("Good job!");
                        else if (finalScore > 50) setFeedback("Getting there...");
                        else setFeedback("Try again.");

                        // Add to history
                        setHistory(prev => [{
                            pattern: patterns[selectedPattern].name,
                            score: finalScore,
                            date: new Date(),
                            trace: [...traceRef.current] // Deep copy
                        }, ...prev].slice(0, 5));
                    }
                }
            } else if (!isActive || (dataRef.current && dataRef.current.pitch <= 50)) {
                // Silence timeout
                if (isTracing && (Date.now() - startTimeRef.current) > (duration + 0.5) * 1000) {
                    setIsTracing(false);
                    // Calculate partial score if enough data
                    if (traceRef.current.length > 20) {
                        const finalScore = calculateScore(traceRef.current, patterns[selectedPattern].points);
                        setScore(finalScore);
                        setFeedback("Timed out.");
                    }
                }
            }

            // Render Trace
            if (traceRef.current.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = score !== null ? (score > 70 ? '#4ade80' : '#f472b6') : '#f472b6';
                ctx.lineWidth = 3;

                traceRef.current.forEach((p, i) => {
                    if (i === 0) ctx.moveTo(p.x * width, height - p.y * height);
                    else ctx.lineTo(p.x * width, height - p.y * height);
                });
                ctx.stroke();

                // Draw cursor head
                const last = traceRef.current[traceRef.current.length - 1];
                ctx.beginPath();
                ctx.arc(last.x * width, height - last.y * height, 5, 0, Math.PI * 2);
                ctx.fillStyle = score !== null ? (score > 70 ? '#4ade80' : '#f472b6') : '#f472b6';
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'intonation-trainer',
                draw,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
            cancelAnimationFrame(animationId);
        };
    }, [selectedPattern, isActive, isTracing, duration, targetRange]); // Added dependencies

    const nextPattern = () => {
        setSelectedPattern((prev) => (prev + 1) % patterns.length);
        reset();
    };

    const prevPattern = () => {
        setSelectedPattern((prev) => (prev - 1 + patterns.length) % patterns.length);
        reset();
    };

    const reset = () => {
        traceRef.current = [];
        setIsTracing(false);
        setScore(null);
        setFeedback("");
    };

    const playTarget = () => {
        if (!audioEngine) return;
        // Simple sweep synthesis
        const pattern = patterns[selectedPattern];
        const minP = targetRange.min - 20;
        const maxP = targetRange.max + 20;

        const now = audioEngine.audioContext.currentTime;
        const osc = audioEngine.audioContext.createOscillator();
        const gain = audioEngine.audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioEngine.audioContext.destination);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Sweep pitch
        osc.frequency.setValueAtTime(minP + pattern.points[0].y * (maxP - minP), now);
        for (let i = 1; i < pattern.points.length; i++) {
            const p = pattern.points[i];
            const t = now + p.x * duration;
            osc.frequency.linearRampToValueAtTime(minP + p.y * (maxP - minP), t);
        }

        osc.start(now);
        osc.stop(now + duration);
    };

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-pink-500/20 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">Intonation Trainer</div>
                        <div className="text-[10px] text-slate-400">Prosody & Melody</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setShowHistory(!showHistory)} className={`p-1.5 rounded hover:bg-slate-800 ${showHistory ? 'text-blue-400' : 'text-slate-400'}`}>
                        <History size={16} />
                    </button>
                    <div className="flex items-center bg-slate-800 rounded px-1">
                        <button onClick={prevPattern} className="p-1 hover:bg-slate-700 rounded"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
                        <span className="text-xs text-slate-300 font-mono w-4 text-center">{selectedPattern + 1}</span>
                        <button onClick={nextPattern} className="p-1 hover:bg-slate-700 rounded"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
                    </div>
                </div>
            </div>

            {showHistory ? (
                <div className="h-40 w-full bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-y-auto custom-scrollbar">
                    <h4 className="text-xs font-bold text-slate-400 mb-2 sticky top-0 bg-slate-950">Recent Attempts</h4>
                    {history.length === 0 ? (
                        <div className="text-xs text-slate-600 text-center py-4">No history yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {history.map((h, i) => (
                                <div key={i} className="flex justify-between items-center text-xs p-2 bg-slate-900 rounded border border-slate-800">
                                    <div>
                                        <div className="text-white">{h.pattern}</div>
                                        <div className="text-[10px] text-slate-500">{h.date.toLocaleTimeString()}</div>
                                    </div>
                                    <div className={`font-bold ${h.score > 80 ? 'text-green-400' : h.score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {h.score}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative h-40 w-full bg-black rounded-lg overflow-hidden mb-3 border border-slate-800">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={160}
                        className="w-full h-full"
                    />

                    {!isTracing && traceRef.current.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-xs text-white/30 flex items-center gap-2">
                                <Play className="w-3 h-3" /> Speak to start trace
                            </div>
                        </div>
                    )}

                    {score !== null && !isTracing && (
                        <div className="absolute top-2 right-2 flex flex-col items-end animate-in fade-in slide-in-from-right-2">
                            <div className={`text-2xl font-bold ${score > 80 ? 'text-green-400' : score > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {score}%
                            </div>
                            <div className="text-xs text-white font-medium">{feedback}</div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-white">{patterns[selectedPattern].name}</div>
                    <div className="text-[10px] text-slate-500">{patterns[selectedPattern].description}</div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={playTarget}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group"
                        title="Play Target Tone"
                    >
                        <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                    </button>

                    {/* Duration Toggle */}
                    <button
                        onClick={() => setDuration(d => d === 2.0 ? 4.0 : 2.0)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-mono text-slate-400 min-w-[30px]"
                        title="Toggle Duration"
                    >
                        {duration}s
                    </button>

                    <button
                        onClick={reset}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Reset Trace"
                    >
                        <RefreshCw className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntonationTrainer;
