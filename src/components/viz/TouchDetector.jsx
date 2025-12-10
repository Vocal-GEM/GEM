import { useState, useEffect, useRef } from 'react';
import { Hand, Zap, Info } from 'lucide-react';

/**
 * TouchDetector - Articulatory pressure indicator for consonant production
 * 
 * Based on research: Voiced stops (b, d, g) and nasals (m, n, ng) should
 * use "light touch" to avoid dark resonance. Hard contact = masculine.
 */
const TouchDetector = ({ dataRef, showFeedback = true }) => {
    const [touch, setTouch] = useState({
        burstEnergy: 0,
        quality: 'soft',
        numBursts: 0
    });
    const [showTooltip, setShowTooltip] = useState(false);
    const [history, setHistory] = useState([]);
    const animationRef = useRef();

    useEffect(() => {
        const update = () => {
            if (dataRef?.current) {
                const { touchQuality, burstEnergy, numBursts } = dataRef.current;

                if (touchQuality) {
                    setTouch({
                        burstEnergy: burstEnergy || 0,
                        quality: touchQuality || 'soft',
                        numBursts: numBursts || 0
                    });

                    // Add to history for visualization
                    if (burstEnergy > 0) {
                        setHistory(prev => [...prev.slice(-20), burstEnergy]);
                    }
                }
            }
            animationRef.current = requestAnimationFrame(update);
        };

        animationRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationRef.current);
    }, [dataRef]);

    const getQualityConfig = () => {
        switch (touch.quality) {
            case 'hard':
                return {
                    color: 'from-red-500 to-orange-500',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/30',
                    textColor: 'text-red-400',
                    label: 'Hard Press',
                    feedback: 'Relax - use lighter articulation',
                    icon: '⚠️'
                };
            case 'medium':
                return {
                    color: 'from-yellow-500 to-amber-500',
                    bgColor: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/30',
                    textColor: 'text-yellow-400',
                    label: 'Medium Touch',
                    feedback: 'A bit softer would be ideal',
                    icon: '👌'
                };
            default:
                return {
                    color: 'from-emerald-500 to-teal-500',
                    bgColor: 'bg-emerald-500/10',
                    borderColor: 'border-emerald-500/30',
                    textColor: 'text-emerald-400',
                    label: 'Soft Touch ✓',
                    feedback: 'Perfect - light and forward',
                    icon: '✨'
                };
        }
    };

    const config = getQualityConfig();

    return (
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                        <Hand className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Touch Detector</h3>
                        <p className="text-xs text-slate-400">Articulation pressure</p>
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
                    Detects how hard you're pressing consonants like B, D, G, M, N.
                    Light touch = bright, forward sound. Hard press = dark, masculine sound.
                </div>
            )}

            {/* Pressure Gauge */}
            <div className="relative h-16 bg-slate-800 rounded-xl overflow-hidden mb-4">
                {/* Background zones */}
                <div className="absolute inset-0 flex">
                    <div className="flex-1 bg-emerald-900/30 border-r border-slate-700" />
                    <div className="flex-1 bg-yellow-900/30 border-r border-slate-700" />
                    <div className="flex-1 bg-red-900/30" />
                </div>

                {/* Zone labels */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[10px] text-slate-500">
                    <span>Soft</span>
                    <span>Medium</span>
                    <span>Hard</span>
                </div>

                {/* Burst history bars */}
                <div className="absolute inset-x-2 top-2 bottom-6 flex items-end gap-0.5">
                    {history.map((energy, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-t transition-all ${energy > 70 ? 'bg-red-500' :
                                    energy > 40 ? 'bg-yellow-500' :
                                        'bg-emerald-500'
                                }`}
                            style={{ height: `${Math.min(100, energy)}%` }}
                        />
                    ))}
                </div>

                {/* Current indicator */}
                <div
                    className={`absolute top-2 w-1 h-10 rounded-full bg-gradient-to-b ${config.color} shadow-lg transition-all duration-150`}
                    style={{ left: `${Math.min(95, Math.max(5, touch.burstEnergy))}%` }}
                />
            </div>

            {/* Current Status */}
            <div className={`flex items-center justify-between p-3 rounded-xl ${config.bgColor} border ${config.borderColor} mb-3`}>
                <div className="flex items-center gap-2">
                    <span className="text-lg">{config.icon}</span>
                    <span className={`font-bold ${config.textColor}`}>{config.label}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Zap size={12} />
                    <span>{touch.numBursts} bursts</span>
                </div>
            </div>

            {/* Feedback */}
            {showFeedback && (
                <p className="text-xs text-slate-400 text-center">
                    {config.feedback}
                </p>
            )}
        </div>
    );
};

export default TouchDetector;
