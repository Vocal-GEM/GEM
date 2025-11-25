import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

const VoiceQualityMeter = ({ dataRef, userMode }) => {
    const indicatorRef = useRef(null);
    const valueRef = useRef(null);
    const debugRef = useRef(null);

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
                if (nextLeft > 70) {
                    indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(255,100,100,0.8)] transition-colors duration-75 bg-red-500";
                } else if (nextLeft < 30) {
                    indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(100,200,255,0.8)] transition-colors duration-75 bg-blue-400";
                } else {
                    indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(100,255,100,0.8)] transition-colors duration-75 bg-emerald-500";
                }

                // Update value display
                valueRef.current.innerText = Math.round(weight);

                // Update debug display if available
                if (debugRef.current && dataRef.current.debug) {
                    const { h1db, h2db, diffDb } = dataRef.current.debug;
                    debugRef.current.innerText = `H1-H2: ${diffDb?.toFixed(1) || '0.0'}dB`;
                }
            }
            requestAnimationFrame(loop);
        };
        const id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [dataRef]);

    const labels = userMode === 'slp' ? ['Low Energy', 'Vocal Weight', 'High Energy'] : ['Light / Airy', 'Vocal Weight', 'Heavy / Pressed'];

    // Strain Check
    const isStrained = dataRef.current?.weight > 80;

    return (
        <div className="glass-panel rounded-xl p-6 mb-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">
                <span>{labels[0]}</span>
                <div className="flex flex-col items-center">
                    <span>{labels[1]}</span>
                    <span ref={valueRef} className="text-lg font-mono text-emerald-400 mt-1">0</span>
                </div>
                <span>{labels[2]}</span>
            </div>
            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                {/* Dynamic Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-emerald-500 to-red-500 opacity-30"></div>
                {/* Indicator */}
                <div ref={indicatorRef} className="absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(100,255,100,0.8)] transition-all duration-75 bg-emerald-500" style={{ left: '0%' }}></div>
            </div>
            {/* Debug Info */}
            <div ref={debugRef} className="mt-2 text-[10px] text-slate-500 font-mono text-center">
                H1-H2: 0.0dB
            </div>
            {isStrained && (
                <div className="mt-2 text-[10px] text-red-400 flex items-center justify-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> High Vocal Weight detected. Relax!
                </div>
            )}
        </div>
    );
};

export default VoiceQualityMeter;

