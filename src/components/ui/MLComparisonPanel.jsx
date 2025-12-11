import { useState, useEffect } from 'react';
import { Brain, Cpu, RefreshCw, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { initializeModel, isModelReady, getModelStatus, comparePredictons } from '../../services/MLGenderClassifier';
import { getPerceptionColor } from '../../services/GenderPerceptionPredictor';
import { useSettings } from '../../context/SettingsContext';

/**
 * MLComparisonPanel - Shows comparison between ML and Heuristic gender predictions
 * 
 * Displays both prediction methods side-by-side to help users understand
 * the difference between pitch-based heuristics and spectral ML analysis.
 */
const MLComparisonPanel = ({
    pitch = 0,
    f1 = 0,
    audioSamples = null,
    sampleRate = 16000,
    compact = false
}) => {
    const { colorBlindMode } = useSettings();
    const [modelStatus, setModelStatus] = useState(getModelStatus());
    const [comparison, setComparison] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize model on mount (lazy load)
    useEffect(() => {
        const checkModel = async () => {
            if (!isModelReady()) {
                setModelStatus({ loading: true, error: null, available: false });
                await initializeModel();
                setModelStatus(getModelStatus());
            }
        };
        checkModel();
    }, []);

    // Run comparison when we have data
    useEffect(() => {
        if (!audioSamples || !pitch || pitch < 50) {
            setComparison(null);
            return;
        }

        const runComparison = async () => {
            setIsLoading(true);
            try {
                const result = await comparePredictons(pitch, f1, audioSamples, sampleRate);
                setComparison(result);
            } catch (err) {
                console.error('Comparison failed:', err);
            } finally {
                setIsLoading(false);
            }
        };

        runComparison();
    }, [pitch, f1, audioSamples, sampleRate]);

    const handleRetryLoad = async () => {
        setModelStatus({ loading: true, error: null, available: false });
        await initializeModel();
        setModelStatus(getModelStatus());
    };

    // Compact mode for inline display
    if (compact) {
        return (
            <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                    <Brain size={12} className="text-purple-400" />
                    <span className="text-slate-400">ML:</span>
                    {comparison?.ml ? (
                        <span style={{ color: getPerceptionColor(comparison.ml.score, colorBlindMode) }}>
                            {comparison.ml.label}
                        </span>
                    ) : (
                        <span className="text-slate-500">--</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Cpu size={12} className="text-teal-400" />
                    <span className="text-slate-400">Heuristic:</span>
                    {comparison?.heuristic ? (
                        <span style={{ color: getPerceptionColor(comparison.heuristic.score, colorBlindMode) }}>
                            {comparison.heuristic.label}
                        </span>
                    ) : (
                        <span className="text-slate-500">--</span>
                    )}
                </div>
                {comparison && (
                    <div className={`flex items-center gap-1 ${comparison.agreement > 0.7 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {comparison.agreement > 0.7 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        <span>{Math.round(comparison.agreement * 100)}%</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-teal-500/20">
                        <Brain size={16} className="text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">ML vs Heuristic</h3>
                        <p className="text-[10px] text-slate-400">Compare prediction methods</p>
                    </div>
                </div>

                {/* Model Status */}
                <div className="flex items-center gap-2">
                    {modelStatus.loading && (
                        <div className="flex items-center gap-2">
                            <RefreshCw size={12} className="animate-spin text-blue-400" />
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-blue-400">Loading model...</span>
                                {modelStatus.progress > 0 && (
                                    <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden mt-0.5">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${modelStatus.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {modelStatus.error && (
                        <button
                            onClick={handleRetryLoad}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                        >
                            <AlertTriangle size={12} />
                            <span>Retry</span>
                        </button>
                    )}
                    {modelStatus.available && (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                            <CheckCircle size={12} />
                            <span>Ready</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Comparison Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <RefreshCw size={20} className="animate-spin text-purple-400" />
                </div>
            ) : comparison ? (
                <div className="grid grid-cols-2 gap-4">
                    {/* ML Prediction */}
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Brain size={14} className="text-purple-400" />
                            <span className="text-xs font-bold text-purple-300">ML (Spectral)</span>
                        </div>
                        <div
                            className="text-2xl font-bold"
                            style={{ color: getPerceptionColor(comparison.ml.score, colorBlindMode) }}
                        >
                            {comparison.ml.label}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            Score: {Math.round(comparison.ml.score * 100)}%
                        </div>
                        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: `${comparison.ml.score * 100}%`,
                                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Heuristic Prediction */}
                    <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Cpu size={14} className="text-teal-400" />
                            <span className="text-xs font-bold text-teal-300">Heuristic (F0+F1)</span>
                        </div>
                        <div
                            className="text-2xl font-bold"
                            style={{ color: getPerceptionColor(comparison.heuristic.score, colorBlindMode) }}
                        >
                            {comparison.heuristic.label}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            Score: {Math.round(comparison.heuristic.score * 100)}%
                        </div>
                        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: `${comparison.heuristic.score * 100}%`,
                                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                    <Info size={20} className="mx-auto mb-2 opacity-50" />
                    <p>Record or provide audio to compare predictions</p>
                </div>
            )}

            {/* Agreement Score */}
            {comparison && (
                <div className={`p-3 rounded-xl border ${comparison.agreement > 0.7
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {comparison.agreement > 0.7 ? (
                                <CheckCircle size={16} className="text-green-400" />
                            ) : (
                                <AlertTriangle size={16} className="text-yellow-400" />
                            )}
                            <span className={`text-sm font-bold ${comparison.agreement > 0.7 ? 'text-green-300' : 'text-yellow-300'
                                }`}>
                                {Math.round(comparison.agreement * 100)}% Agreement
                            </span>
                        </div>
                        <span className="text-xs text-slate-400">
                            Δ{Math.round(comparison.difference * 100)}%
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {comparison.recommendation}
                    </p>
                </div>
            )}

            {/* Info */}
            <div className="text-[10px] text-slate-500 flex items-start gap-1">
                <Info size={10} className="flex-shrink-0 mt-0.5" />
                <p>
                    <strong>ML</strong> analyzes spectral features (MFCC-like).
                    <strong>Heuristic</strong> uses pitch + first formant (F1).
                    High agreement suggests a reliable prediction.
                </p>
            </div>
        </div>
    );
};

export default MLComparisonPanel;
