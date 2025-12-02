import React, { useEffect, useRef } from 'react';
import { Activity, Info } from 'lucide-react';

const VoiceQualityAnalysis = ({ dataRef, colorBlindMode, toggleAudio, isAudioActive }) => {
    const metricsRef = useRef({ h1: null, h2: null, diff: null });

    useEffect(() => {
        const loop = () => {
            if (dataRef.current && dataRef.current.debug) {
                const { h1db, h2db, diffDb } = dataRef.current.debug;
                if (metricsRef.current.h1) metricsRef.current.h1.innerText = h1db ? h1db.toFixed(1) : '-';
                if (metricsRef.current.h2) metricsRef.current.h2.innerText = h2db ? h2db.toFixed(1) : '-';
                if (metricsRef.current.diff) metricsRef.current.diff.innerText = diffDb ? diffDb.toFixed(1) : '-';
            }
            requestAnimationFrame(loop);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'voice-quality-analysis',
                loop,
                renderCoordinator.PRIORITY.LOW
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef]);

    return (
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

            {/* Record Button */}
            <button
                onClick={toggleAudio}
                className={`w-full mt-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isAudioActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}
            >
                {isAudioActive ? 'Stop Analysis' : 'Start Analysis'}
            </button>
        </div>
    );
};

export default VoiceQualityAnalysis;
