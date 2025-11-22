import React, { useEffect, useRef } from 'react';

const VowelSpacePlot = ({ dataRef, userMode }) => {
    const dotRef = useRef(null);
    useEffect(() => { const loop = () => { if (dotRef.current) { const f1 = dataRef.current.f1; const f2 = dataRef.current.f2; const tx = Math.max(0, Math.min(100, ((f1 - 200) / (900 - 200)) * 100)); const ty = Math.max(0, Math.min(100, ((f2 - 800) / (2500 - 800)) * 100)); const curX = parseFloat(dotRef.current.style.left) || 0; const curY = parseFloat(dotRef.current.style.bottom) || 0; const nextX = curX + (tx - curX) * 0.1; const nextY = curY + (ty - curY) * 0.1; dotRef.current.style.left = `${nextX}%`; dotRef.current.style.bottom = `${nextY}%`; dotRef.current.style.opacity = f1 > 0 ? 1 : 0; } requestAnimationFrame(loop); }; const id = requestAnimationFrame(loop); return () => cancelAnimationFrame(id); }, []);
    const xLabel = userMode === 'slp' ? 'F1 (Hz)' : 'Throat Openness'; const yLabel = userMode === 'slp' ? 'F2 (Hz)' : 'Mouth Shape';
    return (<div className="h-48 relative overflow-hidden rounded-xl bg-slate-900 border border-white/5"> <div className="absolute inset-0 w-full h-full opacity-20"> <div className="absolute top-[10%] right-[10%] w-20 h-20 bg-pink-500 rounded-full blur-xl"></div> <div className="absolute bottom-[10%] left-[10%] w-20 h-20 bg-blue-500 rounded-full blur-xl"></div> </div> <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-600">{xLabel}</div> <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-slate-600">{yLabel}</div> <div ref={dotRef} className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] border-2 border-slate-900 transition-all duration-75" style={{ left: '0%', bottom: '0%' }}></div> </div>);
};

export default VowelSpacePlot;
