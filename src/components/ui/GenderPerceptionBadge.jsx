import { useEffect, useState, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
    predictGenderPerception,
    getPerceptionColor,
    getPerceptionExplanation,
    getPerceptionLabel
} from '../../services/GenderPerceptionPredictor';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { Info } from 'lucide-react';

/**
 * GenderPerceptionBadge - Displays a real-time gender perception prediction
 * based on combined pitch and resonance analysis.
 */
const GenderPerceptionBadge = ({ dataRef, showDetails = false, size = 'normal' }) => {
    const { colorBlindMode, settings } = useSettings();
    const [prediction, setPrediction] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const smoothedRef = useRef({ score: 0.5 });

    useEffect(() => {
        const loop = () => {
            if (dataRef.current) {
                const { pitch, f1, resonanceScore } = dataRef.current;

                if (pitch > 50) {
                    const pred = predictGenderPerception(pitch, f1, resonanceScore);

                    // Smooth the score for less jittery display
                    const alpha = 0.15;
                    smoothedRef.current.score = smoothedRef.current.score * (1 - alpha) + pred.score * alpha;

                    setPrediction({
                        ...pred,
                        smoothedScore: smoothedRef.current.score
                    });
                } else {
                    setPrediction(null);
                }
            }
        };

        const unsubscribe = renderCoordinator.subscribe(
            'gender-perception-badge',
            loop,
            renderCoordinator.PRIORITY.LOW
        );

        return () => unsubscribe();
    }, [dataRef]);

    if (!prediction) {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
                <div className="w-3 h-3 rounded-full bg-slate-600" />
                <span className="text-slate-500 font-medium">--</span>
            </div>
        );
    }

    const color = getPerceptionColor(prediction.smoothedScore, colorBlindMode);
    const label = getPerceptionLabel(prediction.smoothedScore, settings.genderFeedbackMode || 'neutral');
    const explanation = getPerceptionExplanation(prediction, settings.genderFeedbackMode || 'neutral');

    return (
        <div className="relative inline-block">
            <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm transition-all ${size === 'small' ? 'text-xs' : 'text-sm'}`}
                style={{
                    backgroundColor: `${color}15`,
                    borderColor: `${color}40`
                }}
            >
                {/* Score indicator bar */}
                <div className="relative w-16 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                        style={{
                            width: `${prediction.smoothedScore * 100}%`,
                            background: `linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)`
                        }}
                    />
                    {/* Center marker */}
                    <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/30" />
                </div>

                {/* Label */}
                <span
                    className="font-bold min-w-[80px]"
                    style={{ color }}
                >
                    {label}
                </span>

                {/* Info button */}
                <button
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <Info size={14} />
                </button>
            </div>

            {/* Details panel */}
            {showDetails && (
                <div className="mt-2 p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 text-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Pitch contribution:</span>
                        <span className="font-mono" style={{ color: getPerceptionColor(prediction.pitchContribution, colorBlindMode) }}>
                            {Math.round(prediction.pitchContribution * 100)}%
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Resonance contribution:</span>
                        <span className="font-mono" style={{ color: getPerceptionColor(prediction.resonanceContribution, colorBlindMode) }}>
                            {Math.round(prediction.resonanceContribution * 100)}%
                        </span>
                    </div>
                    {prediction.inAmbiguityZone && (
                        <div className="text-purple-400 text-center pt-1 border-t border-slate-700/50">
                            ⚡ Ambiguity Zone: Resonance weight increased
                        </div>
                    )}
                </div>
            )}

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 p-3 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-xs text-slate-300 animate-in fade-in duration-200">
                    <button
                        onClick={() => setShowTooltip(false)}
                        className="absolute top-1 right-1 text-slate-500 hover:text-white"
                    >
                        ✕
                    </button>
                    <p className="mb-2">{explanation}</p>
                    <div className="space-y-1 text-[10px] text-slate-500">
                        <div className="flex justify-between">
                            <span>Pitch weight:</span>
                            <span>{Math.round(prediction.weights.pitch * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Resonance weight:</span>
                            <span>{Math.round(prediction.weights.resonance * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Confidence:</span>
                            <span>{Math.round(prediction.confidence * 100)}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenderPerceptionBadge;
