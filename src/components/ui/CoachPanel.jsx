import { useState, useEffect, useRef, memo } from 'react';
import { Activity, AlertTriangle, ChevronRight, Mic } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import RegisterGauge from '../viz/RegisterGauge';

// Memoize CoachPanel to prevent re-renders from parent
const CoachPanel = memo(({ dataRef, onNavigate }) => {
    const { targetRange, activeProfile } = useProfile();

    // Refs for DOM elements
    const pitchValueRef = useRef(null);
    const pitchMarkerRef = useRef(null);

    const weightValueRef = useRef(null); // The text "Pressed / Heavy"
    const weightMarkerRef = useRef(null);

    // State for advice only (low frequency updates)
    const [advice, setAdvice] = useState(null);
    const lastAdviceCheck = useRef(0);

    // Subscribe to Data Stream
    useEffect(() => {
        let animationFrameId;

        const updateLoop = () => {
            if (dataRef?.current) {
                const { pitch, resonance, weight } = dataRef.current;

                // 1. Update Pitch DOM
                if (pitchValueRef.current) {
                    pitchValueRef.current.textContent = `${Math.round(pitch || 0)} Hz`;
                }

                if (pitchMarkerRef.current && targetRange) {
                    const min = 80;
                    const max = 300;
                    const range = max - min;
                    // Clamp and calculate percentage
                    const p = Math.max(0, Math.min(100, ((pitch || 0) - min) / range * 100));
                    pitchMarkerRef.current.style.left = `${p}%`;
                    pitchMarkerRef.current.style.opacity = pitch > 0 ? '1' : '0';
                }

                // 2. Update Weight DOM
                if (weightMarkerRef.current) {
                    const w = weight !== undefined ? weight : 50;
                    weightMarkerRef.current.style.left = `${w}%`;
                }

                if (weightValueRef.current) {
                    const w = weight !== undefined ? weight : 50;
                    let text = 'Balanced';
                    let colorClass = 'text-blue-400';

                    if (w > 60) {
                        text = 'Pressed / Heavy';
                        colorClass = 'text-red-400';
                    } else if (w < 40) {
                        text = 'Breathy / Light';
                        colorClass = 'text-blue-400';
                    }

                    // Only update if text changes to avoid thrashing
                    if (weightValueRef.current.textContent !== text) {
                        weightValueRef.current.textContent = text;
                        // Reset classes and add new one
                        weightValueRef.current.className = `font-bold ${colorClass}`;
                    }
                }

                // 3. Update Advice (Low Frequency / Conditional)
                const now = Date.now();
                if (now - lastAdviceCheck.current > 500) { // Check every 500ms
                    lastAdviceCheck.current = now;

                    let newAdvice = null;

                    if (weight > 65) {
                        newAdvice = {
                            type: 'alert',
                            title: 'High Tension Detected',
                            description: 'Your voice is showing signs of pressed phonation (high closed quotient).',
                            action: 'Start Flow Drills',
                            targetTab: 'weight',
                            icon: AlertTriangle,
                            color: 'red'
                        };
                    } else if (pitch > 0) {
                        if (pitch < targetRange.min - 10) {
                            newAdvice = {
                                type: 'info',
                                title: 'Pitch Below Target',
                                description: `You are below your target floor of ${targetRange.min}Hz.`,
                                action: 'Open Pitch Trainer',
                                targetTab: 'pitch',
                                icon: Activity,
                                color: 'blue'
                            };
                        } else if (activeProfile === 'masc' && pitch > targetRange.max + 10) {
                            newAdvice = {
                                type: 'info',
                                title: 'Pitch Above Target',
                                description: `You are above your target ceiling of ${targetRange.max}Hz for masculine voice. Try relaxing down.`,
                                action: 'Open Pitch Trainer',
                                targetTab: 'pitch',
                                icon: Activity,
                                color: 'blue'
                            };
                        } else if (activeProfile === 'fem' && resonance > 0 && resonance < 2200) {
                            newAdvice = {
                                type: 'suggestion',
                                title: 'Resonance is Dark',
                                description: 'Try brightening your vowels (smile slightly, raise tongue).',
                                action: 'Resonance Lab',
                                targetTab: 'resonance',
                                icon: Mic,
                                color: 'purple'
                            };
                        } else {
                            newAdvice = {
                                type: 'success',
                                title: 'On Track',
                                description: 'Your metrics are balanced within your target range.',
                                action: 'Keep Going',
                                targetTab: null,
                                icon: Activity,
                                color: 'emerald'
                            };
                        }
                    }

                    // Only set if changed
                    setAdvice(prev => {
                        if (prev === newAdvice) return prev;
                        if (!prev && !newAdvice) return null; // Handle null correctly
                        if (!prev || !newAdvice) return newAdvice; // One is null, one is not
                        if (prev.title === newAdvice.title && prev.type === newAdvice.type) return prev;
                        return newAdvice;
                    });
                }
            }
            animationFrameId = requestAnimationFrame(updateLoop);
        };
        animationFrameId = requestAnimationFrame(updateLoop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [dataRef, targetRange, activeProfile]);

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
                        <span className="text-slate-400">
                            Pitch (Target: {activeProfile === 'fem' ? `>${targetRange.min}Hz` : `${targetRange.min}-${targetRange.max}Hz`})
                        </span>
                        <span ref={pitchValueRef} className="font-mono text-white font-bold">0 Hz</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                        {/* Target Zone */}
                        <div
                            className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
                            style={{
                                left: `${Math.max(0, Math.min(100, (targetRange.min - 80) / (300 - 80) * 100))}%`,
                                right: activeProfile === 'fem'
                                    ? '0%'
                                    : `${100 - Math.max(0, Math.min(100, (targetRange.max - 80) / (300 - 80) * 100))}%`
                            }}
                        />
                        {/* Current Value Marker */}
                        <div
                            ref={pitchMarkerRef}
                            className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_white] transition-all duration-200"
                            style={{ left: '0%', opacity: '0' }}
                        />
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
                        <span ref={weightValueRef} className="font-bold text-blue-400">
                            Balanced
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
                            ref={weightMarkerRef}
                            className="absolute top-0 w-1.5 h-3 bg-white rounded-full shadow transition-all duration-300"
                            style={{ left: '50%' }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
});

CoachPanel.displayName = 'CoachPanel';
export default CoachPanel;
