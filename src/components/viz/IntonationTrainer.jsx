import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, RefreshCw, ChevronRight, ChevronLeft, Play } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const IntonationTrainer = ({ dataRef, isActive }) => {
    const { targetRange } = useProfile();
    const canvasRef = useRef(null);
    const [selectedPattern, setSelectedPattern] = useState(0);
    const [score, setScore] = useState(0);
    const [isTracing, setIsTracing] = useState(false);

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
                }

                const elapsed = (Date.now() - startTimeRef.current) / 1000;
                const duration = 2.0; // 2 seconds to complete pattern

                if (elapsed <= duration) {
                    const x = elapsed / duration;
                    const minP = targetRange.min - 20;
                    const maxP = targetRange.max + 20;
                    const pitch = dataRef.current.pitch;
                    const y = Math.max(0, Math.min(1, (pitch - minP) / (maxP - minP)));

                    traceRef.current.push({ x, y });
                } else {
                    setIsTracing(false);
                }
            } else if (!isActive || (dataRef.current && dataRef.current.pitch <= 50)) {
                if (isTracing && (Date.now() - startTimeRef.current) > 2000) {
                    setIsTracing(false);
                }
            }

            // Render Trace
            if (traceRef.current.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#f472b6';
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
                ctx.fillStyle = '#f472b6';
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
        };
    }, [selectedPattern, isActive, isTracing]);

    const nextPattern = () => {
        setSelectedPattern((prev) => (prev + 1) % patterns.length);
        traceRef.current = [];
        setIsTracing(false);
    };

    const prevPattern = () => {
        setSelectedPattern((prev) => (prev - 1 + patterns.length) % patterns.length);
        traceRef.current = [];
        setIsTracing(false);
    };

    const reset = () => {
        traceRef.current = [];
        setIsTracing(false);
        setScore(0);
    };

    // Calculate score using Dynamic Time Warping (DTW)
    const calculateScore = (userTrace, targetPattern) => {
        if (userTrace.length === 0 || targetPattern.length === 0) return 0;

        // Simple DTW implementation
        const n = userTrace.length;
        const m = targetPattern.length;
        const dtw = Array(n + 1).fill(null).map(() => Array(m + 1).fill(Infinity));
        dtw[0][0] = 0;

        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                // Find closest point in target pattern by x-coordinate
                const targetX = targetPattern[j - 1].x;
                const targetY = targetPattern[j - 1].y;
                const userY = userTrace[i - 1].y;

                // Euclidean distance between y-values (pitch)
                const cost = Math.abs(targetY - userY);

                dtw[i][j] = cost + Math.min(
                    dtw[i - 1][j],     // insertion
                    dtw[i][j - 1],     // deletion
                    dtw[i - 1][j - 1]  // match
                );
            }
        }

        // Normalize score to 0-100 (lower DTW distance = higher score)
        const maxDistance = 2.0; // Maximum expected distance
        const normalizedDistance = Math.min(dtw[n][m] / Math.max(n, m), maxDistance);
        const score = Math.max(0, Math.min(100, 100 - (normalizedDistance * 50)));

        return Math.round(score);
    };

    // Check if tracing just completed and calculate score
    useEffect(() => {
        if (!isTracing && traceRef.current.length > 5) {
            const calculatedScore = calculateScore(traceRef.current, patterns[selectedPattern].points);
            setScore(calculatedScore);
        }
    }, [isTracing, selectedPattern]);

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

                <div className="flex gap-1">
                    <button onClick={prevPattern} className="p-1 hover:bg-slate-800 rounded"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
                    <span className="text-xs text-slate-300 font-mono w-4 text-center">{selectedPattern + 1}</span>
                    <button onClick={nextPattern} className="p-1 hover:bg-slate-800 rounded"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
                </div>
            </div>

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
            </div>

            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="text-xs font-bold text-white">{patterns[selectedPattern].name}</div>
                    <div className="text-[10px] text-slate-500">{patterns[selectedPattern].description}</div>
                </div>

                {score > 0 && (
                    <div className="flex items-center gap-2 mr-3">
                        <div className="text-right">
                            <div className="text-xs text-slate-400">Score</div>
                            <div className={`text-lg font-bold ${
                                score >= 80 ? 'text-green-400' :
                                score >= 60 ? 'text-yellow-400' :
                                'text-orange-400'
                            }`}>
                                {score}%
                            </div>
                        </div>
                        <div className={`text-2xl ${
                            score >= 80 ? '🎉' :
                            score >= 60 ? '👍' :
                            '💪'
                        }`} />
                    </div>
                )}

                <button
                    onClick={reset}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Reset Trace"
                >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                </button>
            </div>
        </div>
    );
};

export default IntonationTrainer;
