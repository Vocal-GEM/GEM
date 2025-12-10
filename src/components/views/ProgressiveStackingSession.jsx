import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowLeft, Play, Pause, RotateCcw, CheckCircle, Trophy,
    Music, Sun, Wind, Volume2, AlertTriangle, Lock, Unlock
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useProfile } from '../../context/ProfileContext';
import { ProgressiveStackingService } from '../../services/ProgressiveStackingService';
import { LAYER_STATUS } from '../../data/StackingLayers';

// Icon mapping for layers
const LAYER_ICONS = {
    Music, Sun, Wind, Volume2
};

/**
 * Mini visualization component for each layer
 */
const LayerMeter = ({ layer, state, value, target, isCurrent }) => {
    const IconComponent = LAYER_ICONS[layer.icon] || Music;

    const getStatusColor = () => {
        switch (state.status) {
            case LAYER_STATUS.MASTERED: return 'bg-green-500/20 border-green-500';
            case LAYER_STATUS.HOLDING: return 'bg-amber-500/20 border-amber-500 animate-pulse';
            case LAYER_STATUS.LOST: return 'bg-red-500/20 border-red-500 animate-shake';
            case LAYER_STATUS.EXPLORING: return 'bg-purple-500/20 border-purple-500';
            case LAYER_STATUS.ACTIVE: return 'bg-slate-700/50 border-slate-600';
            default: return 'bg-slate-800/50 border-slate-700 opacity-50';
        }
    };

    const getProgressPercent = () => {
        if (state.status === LAYER_STATUS.MASTERED) return 100;
        if (state.status === LAYER_STATUS.HOLDING) {
            return Math.min(100, (state.holdDuration / layer.masteryHoldTime) * 100);
        }
        if (state.status === LAYER_STATUS.EXPLORING) {
            return state.explorationCoverage * 100;
        }
        return 0;
    };

    const getValueDisplay = () => {
        if (value === null || value === undefined) return '--';
        if (layer.metric === 'pitch') return `${Math.round(value)} Hz`;
        if (layer.metric === 'f2') return `${Math.round(value)} Hz`;
        if (layer.metric === 'tilt') return `${value.toFixed(1)} dB`;
        if (layer.metric === 'volume') return `${Math.round(value * 100)}%`;
        return value.toFixed(1);
    };

    return (
        <div
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${getStatusColor()} ${isCurrent ? 'ring-2 ring-white/30 scale-105' : ''}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${layer.color}33` }}>
                        <IconComponent size={18} style={{ color: layer.color }} />
                    </div>
                    <span className="text-sm font-bold text-white">{layer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    {state.status === LAYER_STATUS.MASTERED && (
                        <CheckCircle size={16} className="text-green-400" />
                    )}
                    {state.status === LAYER_STATUS.LOCKED && (
                        <Lock size={16} className="text-slate-500" />
                    )}
                    <span className="text-xs font-mono text-slate-400">{getValueDisplay()}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-200 rounded-full"
                    style={{
                        width: `${getProgressPercent()}%`,
                        backgroundColor: layer.color
                    }}
                />
            </div>

            {/* Exploration Range Indicator (for exploration layers) */}
            {layer.targetType === 'exploration' && state.status === LAYER_STATUS.EXPLORING && (
                <div className="mt-2 text-xs text-slate-500 flex justify-between">
                    <span>{Object.keys(layer.explorationRange)[0]}</span>
                    <span className="text-center">
                        {Math.round(state.explorationCoverage * 100)}% explored
                    </span>
                    <span>{Object.keys(layer.explorationRange)[1]}</span>
                </div>
            )}
        </div>
    );
};

/**
 * Main Progressive Stacking Session Component
 */
const ProgressiveStackingSession = ({ onClose }) => {
    const { dataRef, isAudioActive, toggleAudio } = useAudio();
    const { calibration, targetRange } = useProfile();

    const [isPlaying, setIsPlaying] = useState(false);
    const [sessionState, setSessionState] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationLayer, setCelebrationLayer] = useState(null);

    const serviceRef = useRef(null);
    const animationRef = useRef(null);

    // Initialize service
    useEffect(() => {
        serviceRef.current = new ProgressiveStackingService();
        serviceRef.current.setCallbacks({
            onMastery: (layer) => {
                setCelebrationLayer(layer);
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 1500);
            },
            onLost: (layer) => {
                setFeedback(prev => [...prev.slice(-2), {
                    type: 'warning',
                    message: `Hold your ${layer.name}!`,
                    timestamp: Date.now()
                }]);
            },
            onLayerAdvance: (layer, index) => {
                setFeedback(prev => [...prev.slice(-2), {
                    type: 'info',
                    message: `New layer: ${layer.name}`,
                    timestamp: Date.now()
                }]);
            }
        });
        setSessionState(serviceRef.current.startSession());

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Animation loop
    useEffect(() => {
        if (!isPlaying || !serviceRef.current) return;

        const loop = () => {
            if (dataRef.current && serviceRef.current) {
                const targets = {
                    pitch: targetRange || { min: 170, max: 220 }
                };
                const newState = serviceRef.current.processAudioData(dataRef.current, targets);
                setSessionState(newState);
            }
            animationRef.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, targetRange]);

    const handleStart = useCallback(() => {
        if (!isAudioActive) toggleAudio();
        setIsPlaying(true);
    }, [isAudioActive, toggleAudio]);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleReset = useCallback(() => {
        if (serviceRef.current) {
            setSessionState(serviceRef.current.resetSession());
            setFeedback([]);
        }
    }, []);

    // Get current values from dataRef
    const getCurrentValues = () => {
        if (!dataRef.current) return {};
        return {
            pitch: dataRef.current.pitch,
            f2: dataRef.current.f2 || dataRef.current.formants?.[1],
            tilt: dataRef.current.tilt || dataRef.current.spectralTilt,
            volume: dataRef.current.volume || dataRef.current.rms
        };
    };

    if (!sessionState) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const currentLayer = sessionState.layers.find(l => l.isCurrent);
    const currentValues = getCurrentValues();

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-300">
            {/* Celebration Overlay */}
            {showCelebration && celebrationLayer && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in zoom-in-95 duration-300">
                    <div className="text-center">
                        <Trophy
                            size={64}
                            className="mx-auto mb-4 animate-bounce"
                            style={{ color: celebrationLayer.color }}
                        />
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {celebrationLayer.name} Mastered!
                        </h2>
                        <p className="text-slate-400">Moving to next layer...</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-bold">Exit</span>
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-white">Progressive Stacking</h1>
                    <p className="text-xs text-slate-500">
                        Layer {sessionState.currentLayerIndex + 1} of {sessionState.totalLayers}
                    </p>
                </div>
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Reset Session"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(serviceRef.current?.getMasteryProgress() || 0)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${serviceRef.current?.getMasteryProgress() || 0}%` }}
                    />
                </div>
            </div>

            {/* Stacked Layer Meters */}
            <div className="flex-1 space-y-3 overflow-y-auto mb-6">
                {sessionState.layers.map((layer) => (
                    <LayerMeter
                        key={layer.id}
                        layer={layer}
                        state={layer.state}
                        value={currentValues[layer.metric]}
                        target={layer.defaultTarget}
                        isCurrent={layer.isCurrent}
                    />
                ))}
            </div>

            {/* Current Layer Instructions */}
            {currentLayer && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6">
                    <div
                        className="text-sm font-bold mb-2"
                        style={{ color: currentLayer.color }}
                    >
                        {currentLayer.name}
                    </div>
                    <p className="text-slate-300 text-sm mb-3">
                        {currentLayer.instruction}
                    </p>
                    {currentLayer.tips && currentLayer.tips.length > 0 && (
                        <div className="text-xs text-slate-500 space-y-1">
                            {currentLayer.tips.map((tip, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className="text-slate-600">•</span>
                                    <span>{tip}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Feedback Messages */}
            {feedback.length > 0 && (
                <div className="space-y-2 mb-4">
                    {feedback.slice(-2).map((f, i) => (
                        <div
                            key={f.timestamp}
                            className={`text-sm px-3 py-2 rounded-lg animate-in slide-in-from-right duration-300 ${f.type === 'warning'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}
                        >
                            {f.message}
                        </div>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                {!isPlaying ? (
                    <button
                        onClick={handleStart}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-3"
                    >
                        <Play size={24} fill="currentColor" />
                        Start Practice
                    </button>
                ) : (
                    <button
                        onClick={handlePause}
                        className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors flex items-center gap-3"
                    >
                        <Pause size={24} />
                        Pause
                    </button>
                )}
            </div>

            {/* Audio Status Indicator */}
            {!isAudioActive && isPlaying && (
                <div className="mt-4 flex items-center justify-center gap-2 text-amber-400 text-sm">
                    <AlertTriangle size={16} />
                    <span>Microphone not active</span>
                </div>
            )}
        </div>
    );
};

export default ProgressiveStackingSession;
