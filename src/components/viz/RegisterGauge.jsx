import { useState, useEffect, useRef } from 'react';
import { Layers, Activity, AlertTriangle, Wind, Info } from 'lucide-react';

/**
 * RegisterGauge - Visualize Laryngeal Mechanisms (M0-M3)
 * 
 * Based on "Registers—The Snake Pit of Voice Pedagogy" logic.
 * Classifies mechanics based on F0 and Spectral Slope.
 */
const RegisterGauge = ({ dataRef, showHint = true }) => {
    const [registerData, setRegisterData] = useState({
        mechanism: 'M1',
        label: 'Chest / Modal (M1)',
        description: 'Thick folds',
        color: 'amber',
        confidence: 0.0,
        mixRatio: 0, // for gauge
        slope: -6.0
    });
    const [f0, setF0] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);
    const animationRef = useRef();

    useEffect(() => {
        const update = () => {
            if (dataRef?.current) {
                // Get register data from socket stream
                const reg = dataRef.current.register; // dataRef.current.register from sockets.py
                const currentF0 = dataRef.current.f0 || 0;
                const slope = dataRef.current.spectral_slope || -6.0;

                if (reg) {
                    setRegisterData({
                        mechanism: reg.mechanism,
                        label: reg.label,
                        description: reg.description,
                        color: reg.color,
                        confidence: reg.confidence || 0,
                        mixRatio: reg.mix_ratio || (reg.mechanism === 'M1' ? 100 : reg.mechanism === 'M2' ? 0 : 50),
                        slope: slope
                    });
                }
                setF0(currentF0);
            }
            animationRef.current = requestAnimationFrame(update);
        };

        animationRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationRef.current);
    }, [dataRef]);

    // Helpers
    const getIcon = () => {
        switch (registerData.mechanism) {
            case 'M0': return <Activity className="w-4 h-4 text-purple-400" />;
            case 'M3': return <Wind className="w-4 h-4 text-cyan-400" />;
            case 'Strain': return <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />;
            case 'Mix': return <Layers className="w-4 h-4 text-green-400" />;
            default: return <Layers className={`w-4 h-4 text-${registerData.color}-400`} />;
        }
    };

    const getGradient = () => {
        // Gradient representing M2 (blue) -> Mix (green) -> M1 (amber)
        // We want to position the needle based on "Mix Ratio" (0% = M2, 100% = M1)
        return "bg-gradient-to-r from-blue-900 via-green-900 to-amber-900";
    };

    // F0 Threshold Check (300 Hz)
    const showChestWarning = f0 > 300 && registerData.mechanism === 'M1';

    return (
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-${registerData.color}-500/10 border border-${registerData.color}-500/30`}>
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Laryngeal Register</h3>
                        <p className="text-xs text-slate-400">Mechanism: {registerData.mechanism}</p>
                    </div>
                </div>
                <button
                    className="text-slate-600 hover:text-slate-300 transition-colors"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute z-50 mt-2 p-3 bg-slate-900/95 backdrop-blur border border-white/10 rounded-lg text-xs text-slate-300 max-w-xs shadow-xl">
                    Detects vocal fold vibration mechanism.
                    M1 (Chest) = Thick folds.
                    M2 (Head) = Thin folds.
                    Mix = Blending zone.
                </div>
            )}

            {/* Gauge: M2 <-> M1 */}
            <div className="relative h-12 bg-slate-800 rounded-xl overflow-hidden mb-2">
                <div className={`absolute inset-0 ${getGradient()} opacity-50`} />

                {/* Zones Labels */}
                <div className="absolute inset-0 flex justify-between px-3 items-center text-[10px] font-bold text-white/50">
                    <span>M2 (Head)</span>
                    <span>Mix</span>
                    <span>M1 (Chest)</span>
                </div>

                {/* Needle */}
                {/* Mix Ratio 0 = M2 (Left), 100 = M1 (Right) */}
                <div
                    className="absolute top-1 bottom-1 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300 ease-out"
                    style={{
                        left: `${Math.max(5, Math.min(95, registerData.mixRatio))}%`
                    }}
                />
            </div>

            {/* Slope Value (Debug/Technical) */}
            <div className="flex justify-end mb-3">
                <span className="text-[10px] text-slate-500 font-mono">
                    Tilt: {registerData.slope.toFixed(1)} dB/oct
                </span>
            </div>

            {/* Current Mechanism Card */}
            <div className={`flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-3`}>
                <span className={`font-bold text-${registerData.color}-400 text-sm`}>
                    {registerData.label}
                </span>
                <span className="text-xs text-slate-400">
                    {registerData.description}
                </span>
            </div>

            {/* Proprioception Hints */}
            {showHint && (
                <div className="space-y-2">
                    {/* Chest Vibration Limit Warning */}
                    {f0 > 290 && (
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                            <Info className="w-3 h-3 mt-0.5 shrink-0" />
                            <p>
                                Chest vibration naturally fades above 300Hz ({f0.toFixed(0)}Hz).
                                Don't push to "feel" it here.
                            </p>
                        </div>
                    )}

                    {/* Strain Warning */}
                    {registerData.mechanism === 'Strain' && (
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 animate-pulse">
                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                            <p>High pressure detected! Relax the throat or reduce volume.</p>
                        </div>
                    )}

                    {/* Passaggio Hint */}
                    {registerData.mechanism === 'Mix' && (
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-300">
                            <Info className="w-3 h-3 mt-0.5 shrink-0" />
                            <p>You are in the blending zone. Keep airflow steady to navigate smoothly.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RegisterGauge;
