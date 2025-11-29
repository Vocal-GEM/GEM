import React, { useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { AlertTriangle, Activity, Info } from 'lucide-react';

const VoiceQualityMeter = ({ dataRef, userMode }) => {
    const { colorBlindMode } = useSettings();
    const indicatorRef = useRef(null);
    const valueRef = useRef(null);
    const metricsRef = useRef({ h1: null, h2: null, diff: null });

    useEffect(() => {
        const loop = () => {
            if (indicatorRef.current && valueRef.current) {
                const weight = dataRef.current.weight || 0;
                const curLeft = parseFloat(indicatorRef.current.style.left) || 0;

                // Map Weight: 0 (Airy) -> 0%, 100 (Pressed) -> 100%
                let target = weight;
                target = Math.max(0, Math.min(100, target));

                const nextLeft = curLeft + (target - curLeft) * 0.1;
                indicatorRef.current.style.left = `${nextLeft}%`;

                // Color based on position
                if (colorBlindMode) {
                    if (nextLeft > 70) {
                        indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)] transition-colors duration-75 bg-orange-500";
                    } else if (nextLeft < 30) {
                        indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)] transition-colors duration-75 bg-teal-400";
                    } else {
                        indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] transition-colors duration-75 bg-purple-500";
                    }
                } else {
                    if (nextLeft > 70) {
                        indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(255,100,100,0.8)] transition-colors duration-75 bg-red-500";
                    } else if (nextLeft < 30) {
                        indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(100,200,255,0.8)] transition-colors duration-75 bg-blue-400";
                    } else {
                        indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(100,255,100,0.8)] transition-colors duration-75 bg-emerald-500";
                    }
                }

                // Update value display
                valueRef.current.innerText = Math.round(weight);

                // Update metrics display
                if (dataRef.current.debug) {
                    const { h1db, h2db, diffDb } = dataRef.current.debug;
                    if (metricsRef.current.h1) metricsRef.current.h1.innerText = h1db ? h1db.toFixed(1) : '-';
                    if (metricsRef.current.h2) metricsRef.current.h2.innerText = h2db ? h2db.toFixed(1) : '-';
                    if (metricsRef.current.diff) metricsRef.current.diff.innerText = diffDb ? diffDb.toFixed(1) : '-';
                }
            }
            requestAnimationFrame(loop);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'voice-quality-meter',
                loop,
                renderCoordinator.PRIORITY.CRITICAL
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef, colorBlindMode]);

    const labels = userMode === 'slp' ? ['Low Energy', 'Vocal Weight', 'High Energy'] : ['Light / Airy', 'Vocal Weight', 'Heavy / Pressed'];

    // Strain Check
    const isStrained = dataRef.current?.weight > 80;

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-center">
            {/* Header */}
            <div className="flex justify-between items-end text-xs font-bold text-slate-400 tracking-wider mb-4">
                <span className="w-24 text-left">{labels[0]}</span>
                <div className="flex flex-col items-center">
                    <span className="text-slate-500 mb-1 uppercase tracking-widest text-[10px]">{labels[1]}</span>
                    <span ref={valueRef} className={`text-4xl font-mono font-bold tabular-nums leading-none ${colorBlindMode ? 'text-purple-400' : 'text-emerald-400'}`}>0</span>
                </div>
                <span className="w-24 text-right">{labels[2]}</span>
            </div>

            {/* Meter Bar */}
            <div className="relative h-10 bg-slate-900/80 rounded-full overflow-hidden shadow-inner border border-white/5 mb-6">
                {/* Dynamic Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colorBlindMode ? 'from-orange-500/20 via-purple-500/20 to-teal-500/20' : 'from-red-500/20 via-emerald-500/20 to-blue-500/20'}`}></div>

                {/* Grid Lines */}
                <div className="absolute left-[30%] top-0 bottom-0 w-px bg-white/10 dashed-line"></div>
                <div className="absolute left-[70%] top-0 bottom-0 w-px bg-white/10 dashed-line"></div>
                <div className="absolute left-[50%] top-2 bottom-2 w-px bg-white/5"></div>

                {/* Indicator */}
                <div
                    ref={indicatorRef}
                    className={`absolute top-1 bottom-1 w-2 rounded-full shadow-[0_0_15px_rgba(100,255,100,0.6)] border border-white/50 transition-all duration-100 ease-out z-10 ${colorBlindMode ? 'bg-purple-500' : 'bg-emerald-500'}`}
                    style={{ left: '0%' }}
                ></div>
            </div>

            {/* Analysis Panel */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-center gap-2 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Activity size={12} /> Real-Time Analysis
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-white/5">
                        <div className="text-[10px] text-slate-500 mb-1">H1 (Fund.)</div>
                        <div ref={el => metricsRef.current.h1 = el} className={`text-lg font-mono font-bold ${colorBlindMode ? 'text-teal-300' : 'text-blue-300'}`}>-</div>
                        <div className="text-[9px] text-slate-600">dB</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-white/5">
                        <div className="text-[10px] text-slate-500 mb-1">H2 (Harm.)</div>
                        <div ref={el => metricsRef.current.h2 = el} className={`text-lg font-mono font-bold ${colorBlindMode ? 'text-purple-300' : 'text-purple-300'}`}>-</div>
                        <div className="text-[9px] text-slate-600">dB</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-white/10 shadow-lg">
                        <div className={`text-[10px] mb-1 font-bold ${colorBlindMode ? 'text-purple-500' : 'text-emerald-500'}`}>Diff</div>
                        <div ref={el => metricsRef.current.diff = el} className="text-lg font-mono text-white font-bold">-</div>
                        <div className="text-[9px] text-slate-600">dB</div>
                    </div>
                </div>
                <div className="mt-3 flex items-start gap-2 text-[10px] text-slate-500 leading-tight bg-slate-800/30 p-2 rounded-lg">
                    <Info size={12} className="shrink-0 mt-0.5 text-slate-400" />
                    <div>
                        Weight is calculated from the difference between H1 and H2.
                        <div className="mt-1 flex gap-2">
                            <span className={`${colorBlindMode ? 'text-teal-400' : 'text-blue-400'} font-medium`}>&gt;10dB = Airy</span>
                            <span className="text-slate-600">•</span>
                            <span className={`${colorBlindMode ? 'text-orange-400' : 'text-red-400'} font-medium`}>&lt;0dB = Pressed</span>
                        </div>
                    </div>
                </div>
            </div>

            {isStrained && (
                <div className={`mt-4 text-sm flex items-center justify-center gap-2 animate-pulse font-bold py-3 rounded-xl border shadow-[0_0_20px_rgba(239,68,68,0.2)] ${colorBlindMode ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                    <AlertTriangle className="w-5 h-5" /> High Vocal Weight detected. Relax!
                </div>
            )}
        </div>
    );
};

export default VoiceQualityMeter;

