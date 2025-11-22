import React, { useEffect, useRef } from 'react';

const VoiceQualityMeter = ({ dataRef, userMode }) => {
    const indicatorRef = useRef(null);
    useEffect(() => {
        const loop = () => {
            if (indicatorRef.current) {
                const r = dataRef.current.resonance || 0; const w = dataRef.current.weight || 0; const curLeft = parseFloat(indicatorRef.current.style.left) || 0;
                // Map Resonance: 500Hz (Dark) -> 0%, 2500Hz (Bright) -> 100%
                let target = ((r - 500) / 2000) * 100;
                target = Math.max(0, Math.min(100, target));

                const nextLeft = curLeft + (target - curLeft) * 0.1; indicatorRef.current.style.left = `${nextLeft}%`; indicatorRef.current.style.opacity = w > 10 ? 1 : 0.3; if (nextLeft > 70) indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-colors duration-75 bg-red-500"; else if (nextLeft < 30) indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-colors duration-75 bg-blue-400"; else indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-colors duration-75 bg-emerald-500";
            } requestAnimationFrame(loop);
        };
        const id = requestAnimationFrame(loop); return () => cancelAnimationFrame(id);
    }, []);
    const labels = userMode === 'slp' ? ['Low Energy', 'Vocal Weight', 'High Energy'] : ['Light / Airy', 'Vocal Weight', 'Heavy / Pressed'];
    return (<div className="glass-panel rounded-xl p-4 mb-2"> <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3"> <span>{labels[0]}</span><span>{labels[1]}</span><span>{labels[2]}</span> </div> <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner"> <div className="absolute inset-0 opacity-20 weight-gradient"></div> <div ref={indicatorRef} className="absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-75 bg-emerald-500" style={{ left: '0%' }}></div> </div> </div>);
};

export default VoiceQualityMeter;
