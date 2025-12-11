import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, ChevronRight, Mic } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import RegisterGauge from '../viz/RegisterGauge';

const CoachPanel = ({ dataRef, onNavigate }) => {
    const { targetRange, activeProfile } = useProfile();
    const [metrics, setMetrics] = useState({
        pitch: 0,
        resonance: 0,
        weight: 50,
        tilt: 0,
        register: null
    });

    const [advice, setAdvice] = useState(null);

    const { pitch, weight, resonance } = metrics;

    // Subscribe to Data Stream
    useEffect(() => {
        const updateLoop = () => {
            if (dataRef?.current) {
                const { pitch, resonance, weight, tilt, register } = dataRef.current;
                setMetrics({
                    pitch: pitch || 0,
                    resonance: resonance || 0,
                    weight: weight !== undefined ? weight : 50,
                    tilt: tilt || 0,
                    register: register
                });
            }
            requestAnimationFrame(updateLoop);
        };
        const handle = requestAnimationFrame(updateLoop);
        return () => cancelAnimationFrame(handle);
    }, [dataRef]);

    // Derived Advice Logic
    useEffect(() => {

        // Priority 1: Strain / Pressed Phonation
        // If weight > 65 or Register says 'Strain'
        if (weight > 65) {
            setAdvice({
                type: 'alert',
                title: 'High Tension Detected',
                description: 'Your voice is showing signs of pressed phonation (high closed quotient).',
                action: 'Start Flow Drills',
                targetTab: 'weight', // Assuming 'weight' tab has the flow validator
                icon: AlertTriangle,
                color: 'red'
            });
            return;
        }

        // Priority 2: Pitch out of Target Range
        if (pitch > 0) {
            if (pitch < targetRange.min - 10) {
                setAdvice({
                    type: 'info',
                    title: 'Pitch Below Target',
                    description: `You are below your target floor of ${targetRange.min}Hz.`,
                    action: 'Open Pitch Trainer',
                    targetTab: 'pitch',
                    icon: Activity,
                    color: 'blue'
                });
                return;
            }
            if (pitch > targetRange.max + 10) {
                setAdvice({
                    type: 'info',
                    title: 'Pitch Above Target',
                    description: `You are above your target ceiling of ${targetRange.max}Hz. Relax down.`,
                    action: 'Open Pitch Trainer',
                    targetTab: 'pitch',
                    icon: Activity,
                    color: 'blue'
                });
                return;
            }
        }

        // Priority 3: Resonance Mismatch (Generic logic)
        // Simple logic: if 'fem' profile and resonance < 2200 (Dark)
        if (activeProfile === 'fem' && resonance > 0 && resonance < 2200) {
            setAdvice({
                type: 'suggestion',
                title: 'Resonance is Dark',
                description: 'Try brightening your vowels (smile slightly, raise tongue).',
                action: 'Resonance Lab',
                targetTab: 'resonance',
                icon: Mic,
                color: 'purple'
            });
            return;
        }

        // Default: Good Job
        if (pitch > 0) {
            setAdvice({
                type: 'success',
                title: 'On Track',
                description: 'Your metrics are balanced within your target range.',
                action: 'Keep Going',
                targetTab: null,
                icon: Activity,
                color: 'emerald'
            });
        } else {
            setAdvice(null); // Silent
        }

    }, [pitch, weight, resonance, targetRange, activeProfile]);

    return (
        <div className="h-full flex flex-col gap-4">
            {/* 1. The Coach's Insight (Action Card) */}
            <div className={`p-4 rounded-2xl border transition-all duration-500 ${advice
                ? `bg-${advice.color}-500/10 border-${advice.color}-500/30 shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                : 'bg-slate-900/50 border-slate-800'
                }`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-${advice?.color || 'slate'}-500/20 text-${advice?.color || 'slate'}-400`}>
                        {advice ? <advice.icon size={24} /> : <Activity size={24} />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                            {advice?.title || 'Ready to Practice'}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            {advice?.description || 'Enable the microphone to receive real-time coaching feedback.'}
                        </p>

                        {advice?.targetTab && (
                            <button
                                onClick={() => onNavigate(advice.targetTab)}
                                className={`flex items-center gap-2 text-xs font-bold text-${advice.color}-400 hover:text-white transition-colors group`}
                            >
                                <span className="border-b border-current pb-0.5">{advice.action}</span>
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Acoustic Compass (Gauges) */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 flex-1 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Performance Metrics</h4>

                {/* Metric 1: Pitch (Simple Bar) */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Pitch (Target: {targetRange.min}-{targetRange.max}Hz)</span>
                        <span className="font-mono text-white font-bold">{Math.round(metrics.pitch)} Hz</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                        {/* Target Zone */}
                        <div
                            className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
                            style={{
                                left: `${Math.max(0, Math.min(100, (targetRange.min - 80) / (300 - 80) * 100))}%`,
                                right: `${100 - Math.max(0, Math.min(100, (targetRange.max - 80) / (300 - 80) * 100))}%`
                            }}
                        />
                        {/* Current Value Marker */}
                        {metrics.pitch > 0 && (
                            <div
                                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_white] transition-all duration-200"
                                style={{
                                    left: `${Math.max(0, Math.min(100, (metrics.pitch - 80) / (300 - 80) * 100))}%`
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Metric 2: Register & Strain (Using RegisterGauge) */}
                <div className="mt-2">
                    <RegisterGauge dataRef={dataRef} showHint={false} />
                </div>

                {/* Metric 3: Weight/Flow */}
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Vocal Weight</span>
                        <span className={`font-bold ${metrics.weight > 60 ? 'text-red-400' : 'text-blue-400'}`}>
                            {metrics.weight > 60 ? 'Pressed / Heavy' : metrics.weight < 40 ? 'Breathy / Light' : 'Balanced'}
                        </span>
                    </div>
                    {/* Multi-colored bar */}
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
                        <div className="flex-1 bg-blue-400/50"></div> {/* Breathy */}
                        <div className="flex-1 bg-emerald-400/50"></div> {/* Balanced */}
                        <div className="flex-1 bg-red-400/50"></div> {/* Pressed */}
                    </div>
                    {/* Marker */}
                    <div className="relative h-2 mt-[-5px]">
                        <div
                            className="absolute top-0 w-1.5 h-3 bg-white rounded-full shadow transition-all duration-300"
                            style={{ left: `${metrics.weight}%` }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CoachPanel;
