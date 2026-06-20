import { useState, useEffect, useRef } from 'react';
import { AudioWaveform, DoorOpen, Info } from 'lucide-react';

/**
 * FlowFinisher - Phrase ending decay analysis
 * 
 * Based on research: Closing the mouth too early creates "cave-like, dark sound"
 * and "abrupt blunt endings". Goal: keep sound "alive" with gradual decay.
 */
const FlowFinisher = ({ dataRef, showFeedback = true }) => {
    const [ending, setEnding] = useState({
        opennessScore: 50,
        decayTimeMs: 0,
        quality: 'moderate'
    });
    const [showTooltip, setShowTooltip] = useState(false);
    const [envelope, setEnvelope] = useState([]);
    const animationRef = useRef();

    useEffect(() => {
        const update = () => {
            if (dataRef?.current) {
                const { endingQuality, opennessScore, decayTimeMs, amplitudeEnvelope } = dataRef.current;

                if (endingQuality) {
                    setEnding({
                        opennessScore: opennessScore || 50,
                        decayTimeMs: decayTimeMs || 0,
                        quality: endingQuality || 'moderate'
                    });
                }

                if (amplitudeEnvelope) {
                    setEnvelope(amplitudeEnvelope.slice(-30));
                }
            }
            animationRef.current = requestAnimationFrame(update);
        };

        animationRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationRef.current);
    }, [dataRef]);

    const getQualityConfig = () => {
        switch (ending.quality) {
            case 'abrupt':
                return {
                    color: 'from-red-500 to-orange-500',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/30',
                    textColor: 'text-red-400',
                    label: 'Blunt Stop ⚠️',
                    feedback: 'Keep mouth open longer at phrase end',
                    waveColor: 'stroke-red-500'
                };
            case 'moderate':
                return {
                    color: 'from-yellow-500 to-amber-500',
                    bgColor: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/30',
                    textColor: 'text-yellow-400',
                    label: 'Moderate',
                    feedback: "Try to 'ride out' the vowel more",
                    waveColor: 'stroke-yellow-500'
                };
            default:
                return {
                    color: 'from-emerald-500 to-teal-500',
                    bgColor: 'bg-emerald-500/10',
                    borderColor: 'border-emerald-500/30',
                    textColor: 'text-emerald-400',
                    label: 'Open Ending ✓',
                    feedback: 'Beautiful resonant finish',
                    waveColor: 'stroke-emerald-500'
                };
        }
    };

    const config = getQualityConfig();

    // Generate wave path for envelope visualization
    const generateWavePath = () => {
        if (envelope.length < 2) {
            // Default gradual decay curve for reference
            return 'M0,50 Q50,30 100,80';
        }

        const width = 100;
        const height = 60;
        const points = envelope.map((val, i) => {
            const x = (i / (envelope.length - 1)) * width;
            const y = height - (val * height * 0.8);
            return `${x},${y}`;
        });

        return `M${points.join(' L')}`;
    };

    return (
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                        <AudioWaveform className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Flow Finisher</h3>
                        <p className="text-xs text-slate-400">Phrase ending decay</p>
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
                    Analyzes how you end phrases. Keeping mouth open creates resonant &quot;alive&quot; endings.
                    Closing too early = abrupt, cave-like cutoff.
                </div>
            )}

            {/* Decay Visualization */}
            <div className="relative h-16 bg-slate-800 rounded-xl overflow-hidden mb-4">
                {/* Reference decay curve (ideal) */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                    <path
                        d="M0,15 Q25,20 50,35 T100,60"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                    />
                </svg>

                {/* Actual envelope */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                    <path
                        d={generateWavePath()}
                        fill="none"
                        className={config.waveColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Labels */}
                <div className="absolute bottom-1 left-2 text-[10px] text-slate-500">Phrase End</div>
                <div className="absolute bottom-1 right-2 text-[10px] text-slate-500">Silence</div>
            </div>

            {/* Openness Score */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Openness</span>
                    <span className={`text-sm font-bold ${config.textColor}`}>
                        {Math.round(ending.opennessScore)}%
                    </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${config.color} transition-all duration-300`}
                        style={{ width: `${ending.opennessScore}%` }}
                    />
                </div>
            </div>

            {/* Status */}
            <div className={`flex items-center justify-between p-3 rounded-xl ${config.bgColor} border ${config.borderColor} mb-3`}>
                <div className="flex items-center gap-2">
                    <DoorOpen className={`w-4 h-4 ${config.textColor}`} />
                    <span className={`font-bold ${config.textColor}`}>{config.label}</span>
                </div>
                <span className="text-xs text-slate-400">
                    {ending.decayTimeMs > 0 ? `${Math.round(ending.decayTimeMs)}ms` : '—'}
                </span>
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

export default FlowFinisher;
