import React, { useEffect, useState } from 'react';
import { Activity, Target, Lightbulb } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useProfile } from '../../context/ProfileContext';
import { predictGenderPerception, getPerceptionLabel, getPerceptionColor } from '../../services/GenderPerceptionPredictor';

const GenderPerceptionDashboard = ({ dataRef, view }) => {
    const { settings } = useSettings();
    const { activeProfile, targetRange } = useProfile();
    const { colorBlindMode, genderFeedbackMode = 'neutral' } = settings;

    const [metrics, setMetrics] = useState({
        perception: '--',
        pitch: 0,
        resonance: 0,
        weight: 50,
        f1: 0,
        f2: 0,
        jitter: 0,
        shimmer: 0,
        tilt: 0,
        score: 0.5
    });

    useEffect(() => {
        const loop = () => {
            if (!dataRef.current) return;

            const { pitch, resonance, weight, f1, f2, jitter, shimmer, tilt } = dataRef.current;

            let perception = '--';
            let score = 0.5;

            if (pitch > 0) {
                // Use shared logic for consistent scoring/labeling across the app
                const prediction = predictGenderPerception(pitch, f1);
                perception = getPerceptionLabel(prediction.score, genderFeedbackMode);
                score = prediction.score;
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
                tilt: tilt || 0,
                score
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
    }, [dataRef, genderFeedbackMode]);

    const getDashboardColor = () => {
        if (metrics.perception === '--') return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
        // Reuse shared color logic but adapt for background styles
        const hex = getPerceptionColor(metrics.score, colorBlindMode);

        // We need to return tailwind classes, so this is a bit of a hybrid approach
        // ideally we'd rewrite getPerceptionColor to return semantic names, but for now we'll match manually
        // based on the score to keep visual consistency with the Badge

        if (colorBlindMode) {
            if (metrics.score < 0.3) return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
            if (metrics.score > 0.7) return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
            return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
        }

        if (metrics.score < 0.25) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
        if (metrics.score > 0.75) return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
        if (metrics.score >= 0.45 && metrics.score <= 0.55) return 'text-purple-400 bg-purple-500/10 border-purple-500/30';

        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
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

    // --- New Logic for Targets and Advice ---

    const getTargetInfo = () => {
        if (!activeProfile) return null;
        const isFem = activeProfile === 'fem';
        const isMasc = activeProfile === 'masc';

        switch (view) {
            case 'pitch':
                return { label: 'Target Pitch', value: `${targetRange.min}-${targetRange.max} Hz` };
            case 'resonance':
                return { label: 'Target Resonance', value: isFem ? 'Bright (High R1)' : isMasc ? 'Dark (Low R1)' : 'Balanced' };
            case 'weight':
                return { label: 'Target Weight', value: isFem ? 'Light / Soft' : isMasc ? 'Heavy / Full' : 'Balanced' };
            case 'tilt':
                return { label: 'Target Tilt', value: isFem ? '-6dB (Less Steep)' : isMasc ? '-12dB (Steeper)' : '-9dB' };
            case 'vowel':
                return { label: 'Target Vowel', value: 'Clear Formants' };
            case 'quality':
                return { label: 'Target Quality', value: 'High Stability' };
            default:
                return null;
        }
    };

    const getAdvice = () => {
        if (!activeProfile) return null;
        const isFem = activeProfile === 'fem';
        const isMasc = activeProfile === 'masc';
        const { pitch, resonance, weight, tilt } = metrics;

        if (view === 'pitch') {
            if (pitch === 0) return "Speak to see your pitch.";
            if (pitch < targetRange.min) return "Pitch is too low. Try sliding up.";
            if (pitch > targetRange.max) return "Pitch is too high. Relax down.";
            return "Perfect pitch! Hold it steady.";
        }

        if (view === 'resonance') {
            if (resonance === 0) return "Speak to see resonance.";
            if (isFem) {
                if (resonance < 2500) return "Resonance is dark. Raise your larynx (smile/swallow).";
                return "Great brightness! Keep it forward.";
            }
            if (isMasc) {
                if (resonance > 2000) return "Resonance is bright. Lower your larynx (yawn).";
                return "Nice dark resonance.";
            }
        }

        if (view === 'weight') {
            if (isFem) {
                if (weight > 60) return "Voice is heavy. Add breathiness, soften the onset.";
                return "Good light weight.";
            }
            if (isMasc) {
                if (weight < 40) return "Voice is too light. Add vocal fold closure.";
                return "Good heavy weight.";
            }
        }

        if (view === 'tilt') {
            if (isFem) {
                if (tilt < -10) return "Sound is too breathy/steep. Project more.";
                return "Good projection.";
            }
        }

        return "Practice consistently to build muscle memory.";
    };

    const targetInfo = getTargetInfo();
    const advice = getAdvice();

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 shrink-0">
                <Activity className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {genderFeedbackMode === 'neutral' ? 'Range Analysis' : 'Gender Perception'}
                </h3>
            </div>

            {/* Perception Badge - Hidden in 'off' mode */}
            {genderFeedbackMode !== 'off' && (
                <div className={`mb-2 px-4 py-3 rounded-lg border ${getDashboardColor()} text-center shrink-0`}>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                        {genderFeedbackMode === 'neutral' ? 'Current Range' : 'Current Perception'}
                    </div>
                    <div className="text-2xl font-bold">{metrics.perception}</div>
                </div>
            )}

            {/* Target & Advice Section (New) */}
            {(targetInfo || advice) && (
                <div className="mb-2 space-y-1 shrink-0">
                    {targetInfo && (
                        <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-slate-300">{targetInfo.label}</span>
                            </div>
                            <span className="text-xs font-mono text-emerald-400">{targetInfo.value}</span>
                        </div>
                    )}
                    {advice && (
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                            <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-200 leading-relaxed">{advice}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    {/* Pitch */}
                    {/* Pitch */}
                    <div className={`bg-slate-800/50 rounded-lg p-3 border ${view === 'pitch' ? 'border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.1)]' : 'border-slate-700/30'}`}>
                        <div className="text-slate-400 uppercase tracking-wider mb-1 text-[10px]">Pitch (F0)</div>
                        <div className="text-lg font-bold text-white font-mono">{Math.round(metrics.pitch)} Hz</div>
                    </div>

                    {/* Resonance */}
                    <div className={`bg-slate-800/50 rounded-lg p-3 border ${view === 'resonance' ? 'border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.1)]' : 'border-slate-700/30'}`}>
                        <div className="text-slate-400 uppercase tracking-wider mb-1 text-[10px]">Resonance</div>
                        <div className="text-lg font-bold text-cyan-400 font-mono">{Math.round(metrics.resonance)} Hz</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{getResonanceLabel()}</div>
                    </div>

                    {/* F1 */}
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                        <div className="text-slate-400 uppercase tracking-wider mb-1 text-[10px]">F1 (Openness)</div>
                        <div className="text-lg font-bold text-green-400 font-mono">{Math.round(metrics.f1)} Hz</div>
                    </div>

                    {/* F2 */}
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                        <div className="text-slate-400 uppercase tracking-wider mb-1 text-[10px]">F2 (Brightness)</div>
                        <div className="text-lg font-bold text-green-400 font-mono">{Math.round(metrics.f2)} Hz</div>
                    </div>

                    {/* Weight */}
                    <div className={`bg-slate-800/50 rounded-lg p-3 border ${view === 'weight' ? 'border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.1)]' : 'border-slate-700/30'} col-span-2`}>
                        <div className="text-slate-400 uppercase tracking-wider mb-1 text-[10px]">Weight</div>
                        <div className="flex items-center gap-2">
                            <div className="text-lg font-bold text-yellow-400 font-mono">{Math.round(metrics.weight)}</div>
                            <div className="text-[9px] text-slate-500">{getWeightLabel()}</div>
                        </div>
                    </div>
                </div>

                {/* Quality Metrics */}
                <div className="border-t border-slate-700/30 pt-2 mb-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Voice Quality</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        {/* Jitter */}
                        <div className="bg-slate-800/30 rounded p-2 border border-slate-700/20">
                            <div className="text-slate-400 text-[9px] mb-0.5">Jitter</div>
                            <div className="text-sm font-mono text-orange-400">{(metrics.jitter * 100).toFixed(2)}%</div>
                        </div>

                        {/* Shimmer */}
                        <div className="bg-slate-800/30 rounded p-2 border border-slate-700/20">
                            <div className="text-slate-400 text-[9px] mb-0.5">Shimmer</div>
                            <div className="text-sm font-mono text-orange-400">{(metrics.shimmer * 100).toFixed(2)}%</div>
                        </div>

                        {/* Spectral Tilt */}
                        <div className={`bg-slate-800/30 rounded p-2 border ${view === 'tilt' ? 'border-teal-500/50' : 'border-slate-700/20'}`}>
                            <div className="text-slate-400 text-[9px] mb-0.5">Tilt</div>
                            <div className="text-sm font-mono text-purple-400">{metrics.tilt.toFixed(1)} dB</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-2 pt-2 border-t border-slate-700/30 shrink-0">
                <div className="text-[9px] text-slate-500 text-center">
                    Comprehensive voice analysis metrics
                </div>
            </div>
        </div>
    );
};

export default GenderPerceptionDashboard;
