import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Wind, Activity, AlertTriangle, CheckCircle2, RotateCcw, Zap } from 'lucide-react';

/**
 * FlowPhonationMeter Component
 * 
 * Visualizes the 4-state phonation spectrum based on research:
 * "Applying Flow Phonation in Voice Care for Transgender Women"
 * 
 * States: Breathy ← Flow (TARGET) → Neutral → Pressed
 * 
 * Key Features:
 * - Horizontal spectrum with Flow Zone highlighted
 * - Onset quality indicator (soft vs hard attack)
 * - Stability score display
 * - Auto-reset prompt after 5 seconds of pressed phonation
 */

// Phonation states from research
const STATES = [
    { id: 'breathy', label: 'Breathy', color: 'blue', range: [75, 100], feedback: 'Too Loose' },
    { id: 'flow', label: 'Flow', color: 'emerald', range: [40, 75], feedback: 'Optimal ✓', isTarget: true },
    { id: 'neutral', label: 'Neutral', color: 'slate', range: [20, 40], feedback: 'Baseline' },
    { id: 'pressed', label: 'Pressed', color: 'red', range: [0, 20], feedback: 'Strain ⚠', isDanger: true }
];

const FlowPhonationMeter = ({ dataRef, onReset, showDetails = true }) => {
    const { colorBlindMode } = useSettings();
    const indicatorRef = useRef(null);
    const stateRef = useRef(null);
    const stabilityRef = useRef(null);
    const lastValueRef = useRef(50);
    const [pressedDuration, setPressedDuration] = useState(0);
    const [showResetPrompt, setShowResetPrompt] = useState(false);
    const pressedStartRef = useRef(null);

    useEffect(() => {
        const loop = () => {
            if (!dataRef.current) {
                requestAnimationFrame(loop);
                return;
            }

            const { phonationState, stabilityScore } = dataRef.current;

            // Map spectral tilt to 0-100 position
            // Breathy (high tilt) = right, Pressed (low tilt) = left
            let position = 50;
            if (phonationState?.spectral_tilt !== undefined) {
                // Spectral tilt range: -6 (pressed) to +12 (breathy)
                // Map to: 0 (pressed) to 100 (breathy)
                position = ((phonationState.spectral_tilt + 6) / 18) * 100;
                position = Math.max(0, Math.min(100, position));
            }

            // Smooth interpolation
            const alpha = 0.1;
            const smoothed = lastValueRef.current + (position - lastValueRef.current) * alpha;
            lastValueRef.current = smoothed;

            // Update indicator
            if (indicatorRef.current) {
                indicatorRef.current.style.left = `${smoothed}%`;

                // Determine current state
                const state = STATES.find(s =>
                    smoothed >= s.range[0] && smoothed < s.range[1]
                ) || STATES[3];

                // Color mapping
                const colorMap = colorBlindMode
                    ? { blue: 'bg-sky-400', emerald: 'bg-teal-400', slate: 'bg-slate-400', red: 'bg-pink-500' }
                    : { blue: 'bg-blue-400', emerald: 'bg-emerald-400', slate: 'bg-slate-400', red: 'bg-red-500' };

                indicatorRef.current.className = `absolute top-1 bottom-1 w-3 rounded-full border-2 border-white/70 shadow-lg transition-colors duration-150 z-10 ${colorMap[state.color]}`;

                // Update state label
                if (stateRef.current) {
                    stateRef.current.innerText = state.label;
                }
            }

            // Update stability
            if (stabilityRef.current && stabilityScore !== undefined) {
                const stability = Math.round(stabilityScore ?? 70);
                stabilityRef.current.innerText = `${stability}%`;
            }

            // Track pressed duration for reset prompt
            if (phonationState?.is_strained) {
                if (!pressedStartRef.current) {
                    pressedStartRef.current = Date.now();
                }
                const elapsed = (Date.now() - pressedStartRef.current) / 1000;
                setPressedDuration(elapsed);
                if (elapsed >= 5 && !showResetPrompt) {
                    setShowResetPrompt(true);
                }
            } else {
                pressedStartRef.current = null;
                setPressedDuration(0);
                if (showResetPrompt) {
                    setShowResetPrompt(false);
                }
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }, [dataRef, colorBlindMode, showResetPrompt]);

    const handleReset = () => {
        setShowResetPrompt(false);
        setPressedDuration(0);
        pressedStartRef.current = null;
        if (onReset) onReset();
    };

    // Get current state info
    const phonationState = dataRef.current?.phonationState;
    const onsetAnalysis = dataRef.current?.onsetAnalysis;
    const isFlow = phonationState?.is_flow ?? false;
    const isStrained = phonationState?.is_strained ?? false;

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Wind className={`w-5 h-5 ${colorBlindMode ? 'text-teal-400' : 'text-emerald-400'}`} />
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Flow Phonation</span>
                </div>
                <div className="flex items-center gap-3">
                    <span ref={stateRef} className={`text-sm font-bold uppercase ${isFlow ? (colorBlindMode ? 'text-teal-400' : 'text-emerald-400') :
                            isStrained ? (colorBlindMode ? 'text-pink-400' : 'text-red-400') :
                                'text-slate-400'
                        }`}>Neutral</span>
                </div>
            </div>

            {/* Spectrum Meter */}
            <div className="relative h-12 bg-slate-900/80 rounded-full overflow-hidden shadow-inner border border-white/5 mb-4">
                {/* Zone backgrounds */}
                <div className="absolute inset-0 flex">
                    <div className={`w-[20%] ${colorBlindMode ? 'bg-pink-500/25' : 'bg-red-500/25'}`} />
                    <div className={`w-[20%] bg-slate-500/25`} />
                    <div className={`w-[35%] ${colorBlindMode ? 'bg-teal-500/30' : 'bg-emerald-500/30'}`} />
                    <div className={`w-[25%] ${colorBlindMode ? 'bg-sky-500/25' : 'bg-blue-500/25'}`} />
                </div>

                {/* Flow Zone highlight */}
                <div className="absolute left-[40%] right-[25%] top-0 bottom-0 pointer-events-none">
                    <div className={`absolute inset-0 border-2 border-dashed rounded ${colorBlindMode ? 'border-teal-400/60' : 'border-emerald-400/60'}`} />
                </div>

                {/* Zone dividers */}
                <div className="absolute left-[20%] top-0 bottom-0 w-px bg-white/20" />
                <div className="absolute left-[40%] top-0 bottom-0 w-px bg-white/20" />
                <div className="absolute left-[75%] top-0 bottom-0 w-px bg-white/20" />

                {/* Zone labels */}
                <div className="absolute inset-0 flex items-center pointer-events-none">
                    <div className="w-[20%] text-center text-[9px] font-bold text-white/40 uppercase">Pressed</div>
                    <div className="w-[20%] text-center text-[9px] font-bold text-white/40 uppercase">Neutral</div>
                    <div className="w-[35%] text-center text-[9px] font-bold text-white/60 uppercase">Flow ✓</div>
                    <div className="w-[25%] text-center text-[9px] font-bold text-white/40 uppercase">Breathy</div>
                </div>

                {/* Indicator */}
                <div
                    ref={indicatorRef}
                    className="absolute top-1 bottom-1 w-3 rounded-full bg-emerald-400 border-2 border-white/70 shadow-lg z-10"
                    style={{ left: '50%' }}
                />
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Onset Quality */}
                <div className={`p-3 rounded-lg border ${onsetAnalysis?.is_target
                        ? (colorBlindMode ? 'bg-teal-500/10 border-teal-500/30' : 'bg-emerald-500/10 border-emerald-500/30')
                        : 'bg-slate-800/50 border-white/5'
                    }`}>
                    <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${onsetAnalysis?.is_target ? (colorBlindMode ? 'text-teal-400' : 'text-emerald-400') : 'text-slate-400'}`} />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Onset</span>
                    </div>
                    <div className={`text-sm font-medium mt-1 ${onsetAnalysis?.is_target
                            ? (colorBlindMode ? 'text-teal-300' : 'text-emerald-300')
                            : 'text-slate-300'
                        }`}>
                        {onsetAnalysis?.label ?? 'Analyzing...'}
                    </div>
                </div>

                {/* Stability */}
                <div className="p-3 rounded-lg border bg-slate-800/50 border-white/5">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Stability</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span ref={stabilityRef} className="text-sm font-medium text-slate-300">70%</span>
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${colorBlindMode ? 'bg-teal-400' : 'bg-emerald-400'}`}
                                style={{ width: `${dataRef.current?.stabilityScore ?? 70}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Flow Zone Badge */}
            {isFlow && (
                <div className={`flex items-center gap-2 p-3 rounded-lg border ${colorBlindMode ? 'bg-teal-500/10 border-teal-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
                    }`}>
                    <CheckCircle2 className={`w-4 h-4 ${colorBlindMode ? 'text-teal-400' : 'text-emerald-400'}`} />
                    <span className={`text-sm font-medium ${colorBlindMode ? 'text-teal-300' : 'text-emerald-300'}`}>
                        Optimal Flow - efficient &apos;touch&apos; closure
                    </span>
                </div>
            )}

            {/* Reset Prompt */}
            {showResetPrompt && (
                <div className={`mt-3 p-4 rounded-lg border animate-pulse ${colorBlindMode
                        ? 'bg-pink-500/15 border-pink-500/40'
                        : 'bg-red-500/15 border-red-500/40'
                    }`}>
                    <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${colorBlindMode ? 'text-pink-400' : 'text-red-400'}`} />
                        <div className="flex-1">
                            <div className={`text-sm font-bold ${colorBlindMode ? 'text-pink-300' : 'text-red-300'}`}>
                                Tension Detected ({Math.round(pressedDuration)}s)
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                                Let&apos;s reset to re-establish healthy phonation
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${colorBlindMode
                                    ? 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30'
                                    : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                }`}
                        >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Info Panel */}
            {showDetails && !showResetPrompt && !isFlow && (
                <div className="mt-3 bg-slate-900/50 rounded-xl p-3 border border-white/5">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        <span className={colorBlindMode ? 'text-teal-400 font-medium' : 'text-emerald-400 font-medium'}>Flow phonation</span> is the
                        &quot;Goldilocks zone&quot; - optimal for healthy voice modification without strain.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FlowPhonationMeter;
