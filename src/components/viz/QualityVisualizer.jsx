import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Waves, Wind, Activity } from 'lucide-react';

const QualityVisualizer = ({ dataRef }) => {
    const [metrics, setMetrics] = useState({
        jitter: 0,
        shimmer: 0,
        weight: 50
    });

    // History buffers for sparklines
    const historyRef = useRef({
        jitter: [],
        shimmer: [],
        weight: []
    });
    const maxHistory = 100;

    useEffect(() => {
        const loop = () => {
            if (!dataRef.current) return;
            const data = dataRef.current;

            // Update local state
            // Jitter/Shimmer are often small values (e.g. 0.01), we might want to scale them for display
            // Jitter > 0.01 (1%) is often considered rough
            // Shimmer > 0.35 dB (or 3-4%) is often considered rough. 
            // Assuming the engine returns raw values.

            setMetrics({
                jitter: data.jitter || 0,
                shimmer: data.shimmer || 0,
                weight: data.weight || 50
            });

            // Update history
            ['jitter', 'shimmer', 'weight'].forEach(key => {
                historyRef.current[key].push(data[key] || 0);
                if (historyRef.current[key].length > maxHistory) {
                    historyRef.current[key].shift();
                }
            });

            requestAnimationFrame(loop);
        };
        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [dataRef]);

    // Helper to render sparkline
    const renderSparkline = (key, colorClass, height = 40) => {
        const data = historyRef.current[key];
        if (data.length < 2) return null;

        const max = Math.max(...data, key === 'weight' ? 100 : 0.05); // Dynamic max or fixed
        const min = 0;

        const points = data.map((val, i) => {
            const x = (i / (maxHistory - 1)) * 100;
            const y = 100 - ((val - min) / (max - min)) * 100;
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={colorClass}
                />
            </svg>
        );
    };

    // Helper for status labels
    const getStatus = (type, val) => {
        if (type === 'jitter') {
            // Thresholds for Jitter (approximate for visual feedback)
            if (val < 0.004) return { label: 'Stable', color: 'text-emerald-400' };
            if (val < 0.01) return { label: 'Normal', color: 'text-blue-400' };
            return { label: 'Rough', color: 'text-orange-400' };
        }
        if (type === 'shimmer') {
            // Thresholds for Shimmer
            if (val < 0.15) return { label: 'Stable', color: 'text-emerald-400' };
            if (val < 0.35) return { label: 'Normal', color: 'text-blue-400' };
            return { label: 'Breathy/Rough', color: 'text-orange-400' };
        }
        if (type === 'weight') {
            if (val < 30) return { label: 'Breathy', color: 'text-cyan-400' };
            if (val > 70) return { label: 'Pressed', color: 'text-orange-400' };
            return { label: 'Balanced', color: 'text-emerald-400' };
        }
        return { label: '-', color: 'text-slate-400' };
    };

    return (
        <div className="h-full flex flex-col p-6">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    Voice Quality
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                    Analyze the texture and stability of your voice.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                {/* Jitter Card */}
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Jitter</h4>
                            <p className="text-xs text-slate-500">Frequency Instability</p>
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col justify-end mb-4">
                        <div className="h-24 w-full bg-slate-950/50 rounded-lg border border-white/5 p-2 mb-2">
                            {renderSparkline('jitter', 'text-blue-500')}
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="text-3xl font-mono font-bold text-white">
                                {(metrics.jitter * 100).toFixed(2)}<span className="text-sm text-slate-500 ml-1">%</span>
                            </div>
                            <div className={`text-sm font-bold uppercase ${getStatus('jitter', metrics.jitter).color}`}>
                                {getStatus('jitter', metrics.jitter).label}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Micro-fluctuations in pitch. Lower values indicate a smoother, more stable tone. High jitter is perceived as roughness.
                    </p>
                </div>

                {/* Shimmer Card */}
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Waves size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Shimmer</h4>
                            <p className="text-xs text-slate-500">Amplitude Instability</p>
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col justify-end mb-4">
                        <div className="h-24 w-full bg-slate-950/50 rounded-lg border border-white/5 p-2 mb-2">
                            {renderSparkline('shimmer', 'text-purple-500')}
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="text-3xl font-mono font-bold text-white">
                                {metrics.shimmer.toFixed(2)}<span className="text-sm text-slate-500 ml-1">dB</span>
                            </div>
                            <div className={`text-sm font-bold uppercase ${getStatus('shimmer', metrics.shimmer).color}`}>
                                {getStatus('shimmer', metrics.shimmer).label}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Micro-fluctuations in loudness. High shimmer can sound breathy or hoarse. Lower is generally clearer.
                    </p>
                </div>

                {/* Weight/Breathiness Card */}
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                            <Wind size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Breathiness</h4>
                            <p className="text-xs text-slate-500">Vocal Weight Inverse</p>
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col justify-end mb-4">
                        <div className="h-24 w-full bg-slate-950/50 rounded-lg border border-white/5 p-2 mb-2 relative">
                            {/* Custom visualization for weight range */}
                            <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-orange-500 rounded-full opacity-30"></div>
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-100"
                                style={{ left: `${metrics.weight}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="text-3xl font-mono font-bold text-white">
                                {metrics.weight.toFixed(0)}<span className="text-sm text-slate-500 ml-1">/100</span>
                            </div>
                            <div className={`text-sm font-bold uppercase ${getStatus('weight', metrics.weight).color}`}>
                                {getStatus('weight', metrics.weight).label}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Indicates vocal fold closure. Lower values are breathier (softer), higher values are pressed (harder).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QualityVisualizer;
