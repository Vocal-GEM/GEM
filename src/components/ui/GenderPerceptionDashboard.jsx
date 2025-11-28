import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

const GenderPerceptionDashboard = ({ dataRef }) => {
    const [metrics, setMetrics] = useState({
        perception: 'Androgynous',
        pitch: 0,
        resonance: 0,
        weight: 50,
        f1: 0,
        f2: 0,
        jitter: 0,
        shimmer: 0,
        tilt: 0
    });

    useEffect(() => {
        const loop = () => {
            if (!dataRef.current) return;

            const { pitch, resonance, weight, f1, f2, jitter, shimmer, tilt } = dataRef.current;

            // Calculate gender perception based on pitch
            let perception = 'Androgynous';
            if (pitch > 0) {
                if (pitch < 145) perception = 'Masculine';
                else if (pitch > 175) perception = 'Feminine';
            }

            setMetrics({
                perception,
                pitch: pitch || 0,
                resonance: resonance || 0,
                weight: weight || 50,
                f1: f1 || 0,
                f2: f2 || 0,
                jitter: jitter || 0,
                shimmer: shimmer || 0,
                tilt: tilt || 0
            });
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'gender-perception-dashboard',
                loop,
                renderCoordinator.PRIORITY.HIGH
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef]);

    const getPerceptionColor = () => {
        switch (metrics.perception) {
            case 'Masculine': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
            case 'Feminine': return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
            default: return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
        }
    };

    const getResonanceLabel = () => {
        if (metrics.resonance < 2000) return 'Dark';
        if (metrics.resonance > 2800) return 'Bright';
        return 'Balanced';
    };

    const getWeightLabel = () => {
        if (metrics.weight < 30) return 'Breathy';
        if (metrics.weight > 70) return 'Pressed';
        return 'Balanced';
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 shrink-0">
                <Activity className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender Perception</h3>
            </div>

            {/* Perception Badge */}
            <div className={`mb-4 px-4 py-3 rounded-lg border ${getPerceptionColor()} text-center shrink-0`}>
                <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Current Perception</div>
                <div className="text-2xl font-bold">{metrics.perception}</div>
            </div>

            {/* Scrollable Content Area if needed, or just flex-1 */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    {/* Pitch */}
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                        <div className="text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Pitch (F0)</div>
                        <div className="text-lg font-bold text-white font-mono">{Math.round(metrics.pitch)} Hz</div>
                    </div>

                    {/* Resonance */}
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                        <div className="text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Resonance</div>
                        <div className="text-lg font-bold text-cyan-400 font-mono">{Math.round(metrics.resonance)} Hz</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{getResonanceLabel()}</div>
                    </div>

                    {/* F1 */}
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                        <div className="text-slate-500 uppercase tracking-wider mb-1 text-[10px]">F1 (Openness)</div>
                        <div className="text-lg font-bold text-green-400 font-mono">{Math.round(metrics.f1)} Hz</div>
                    </div>

                    {/* F2 */}
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                        <div className="text-slate-500 uppercase tracking-wider mb-1 text-[10px]">F2 (Brightness)</div>
                        <div className="text-lg font-bold text-green-400 font-mono">{Math.round(metrics.f2)} Hz</div>
                    </div>

                    {/* Weight */}
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30 col-span-2">
                        <div className="text-slate-500 uppercase tracking-wider mb-1 text-[10px]">Weight</div>
                        <div className="flex items-center gap-2">
                            <div className="text-lg font-bold text-yellow-400 font-mono">{Math.round(metrics.weight)}</div>
                            <div className="text-[9px] text-slate-500">{getWeightLabel()}</div>
                        </div>
                    </div>
                </div>

                {/* Quality Metrics */}
                <div className="border-t border-slate-700/30 pt-3 mb-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Voice Quality</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        {/* Jitter */}
                        <div className="bg-slate-800/30 rounded p-2 border border-slate-700/20">
                            <div className="text-slate-500 text-[9px] mb-0.5">Jitter</div>
                            <div className="text-sm font-mono text-orange-400">{(metrics.jitter * 100).toFixed(2)}%</div>
                        </div>

                        {/* Shimmer */}
                        <div className="bg-slate-800/30 rounded p-2 border border-slate-700/20">
                            <div className="text-slate-500 text-[9px] mb-0.5">Shimmer</div>
                            <div className="text-sm font-mono text-orange-400">{(metrics.shimmer * 100).toFixed(2)}%</div>
                        </div>

                        {/* Spectral Tilt */}
                        <div className="bg-slate-800/30 rounded p-2 border border-slate-700/20">
                            <div className="text-slate-500 text-[9px] mb-0.5">Tilt</div>
                            <div className="text-sm font-mono text-purple-400">{metrics.tilt.toFixed(1)} dB</div>
                        </div>
                    </div>
                </div>


            </div>

            {/* Info Footer */}
            <div className="mt-3 pt-3 border-t border-slate-700/30 shrink-0">
                <div className="text-[9px] text-slate-500 text-center">
                    Comprehensive voice analysis metrics
                </div>
            </div>
        </div>
    );
};

export default GenderPerceptionDashboard;
