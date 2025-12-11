import { useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Wind, CheckCircle2, AlertTriangle, Info, Sparkles, Activity, HelpCircle } from 'lucide-react';

/**
 * BreathinessMeter Component
 * 
 * A zone-based visualization for breathiness feedback, aligned with the GRBAS scale.
 * Based on research: "Breathiness as a Feminine Voice Characteristic: A Perceptual Approach"
 * 
 * Key Features:
 * - 4-zone visual meter (Modal → Slight → Moderate → Severe)
 * - "Sweet Spot" indicator for Score 1 (slight breathiness)
 * - Pitch-independent feedback
 * - Warnings for excessive breathiness
 * - NEW: Estimated Open Quotient display
 * - NEW: Ventricular (false vocal fold) engagement warning
 */

// Zone configuration based on research
const ZONES = [
    { id: 0, label: 'Clear', color: 'slate', range: [0, 25], feedback: 'Modal Voice', icon: 'info' },
    { id: 1, label: 'Slight', color: 'emerald', range: [25, 50], feedback: 'Soft/Feminine Cue ✓', icon: 'check', isSweetSpot: true },
    { id: 2, label: 'Moderate', color: 'amber', range: [50, 75], feedback: 'Very Breathy', icon: 'warning' },
    { id: 3, label: 'Severe', color: 'red', range: [75, 100], feedback: 'Excessive ⚠', icon: 'warning' }
];



const BreathinessMeter = ({ dataRef, showDetails = true }) => {
    const { colorBlindMode } = useSettings();
    const indicatorRef = useRef(null);
    const valueRef = useRef(null);
    const zoneRef = useRef(null);
    const feedbackRef = useRef(null);
    const lastValueRef = useRef(50);

    // NEW: Refs for OQ and ventricular displays
    const oqValueRef = useRef(null);
    const oqZoneRef = useRef(null);
    const oqIndicatorRef = useRef(null);
    const lastOqRef = useRef(50);
    const ventricularRef = useRef(null);

    useEffect(() => {
        const loop = () => {
            if (!dataRef.current) {
                requestAnimationFrame(loop);
                return;
            }

            const { breathinessGrbas, oq_percent, oq_zone, ventricular_detected, ventricular_severity, ventricular_feedback } = dataRef.current;

            // Get composite score (0-100)
            let score = 50; // Default neutral
            if (breathinessGrbas) {
                score = breathinessGrbas.composite_score ?? 50;
            } else if (dataRef.current.breathinessScore !== undefined) {
                score = dataRef.current.breathinessScore;
            }

            // Smooth interpolation
            const alpha = 0.08;
            const smoothedScore = lastValueRef.current + (score - lastValueRef.current) * alpha;
            lastValueRef.current = smoothedScore;

            // Update indicator position
            if (indicatorRef.current) {
                indicatorRef.current.style.left = `${smoothedScore}%`;

                // Determine zone and apply color
                const zone = ZONES.find(z => smoothedScore >= z.range[0] && smoothedScore < z.range[1]) || ZONES[3];

                // Update indicator color based on zone
                const colorMap = colorBlindMode
                    ? { slate: 'bg-slate-400', emerald: 'bg-teal-400', amber: 'bg-orange-400', red: 'bg-pink-500' }
                    : { slate: 'bg-slate-400', emerald: 'bg-emerald-400', amber: 'bg-amber-400', red: 'bg-red-500' };

                const shadowMap = colorBlindMode
                    ? { slate: 'rgba(148,163,184,0.6)', emerald: 'rgba(45,212,191,0.6)', amber: 'rgba(249,115,22,0.6)', red: 'rgba(236,72,153,0.6)' }
                    : { slate: 'rgba(148,163,184,0.6)', emerald: 'rgba(52,211,153,0.6)', amber: 'rgba(251,191,36,0.6)', red: 'rgba(239,68,68,0.6)' };

                indicatorRef.current.className = `absolute top-1 bottom-1 w-2 rounded-full border border-white/50 transition-all duration-100 ease-out z-10 ${colorMap[zone.color]}`;
                indicatorRef.current.style.boxShadow = `0 0 15px ${shadowMap[zone.color]}`;

                // Update zone label
                if (zoneRef.current) {
                    zoneRef.current.innerText = zone.label;
                    zoneRef.current.className = `text-xs font-bold uppercase tracking-wider ${zone.color === 'emerald' ? (colorBlindMode ? 'text-teal-400' : 'text-emerald-400') :
                        zone.color === 'amber' ? (colorBlindMode ? 'text-orange-400' : 'text-amber-400') :
                            zone.color === 'red' ? (colorBlindMode ? 'text-pink-400' : 'text-red-400') :
                                'text-slate-400'
                        }`;
                }

                // Update feedback
                if (feedbackRef.current) {
                    feedbackRef.current.innerText = zone.feedback;
                }
            }

            // Update value display
            if (valueRef.current) {
                valueRef.current.innerText = Math.round(smoothedScore);
            }

            // NEW: Update Open Quotient display
            if (oq_percent !== undefined) {
                const smoothedOq = lastOqRef.current + (oq_percent - lastOqRef.current) * alpha;
                lastOqRef.current = smoothedOq;

                if (oqValueRef.current) {
                    oqValueRef.current.innerText = Math.round(smoothedOq);
                }

                if (oqIndicatorRef.current) {
                    oqIndicatorRef.current.style.left = `${smoothedOq}%`;

                    // Color based on zone
                    const zone = oq_zone || (smoothedOq < 35 ? 'low' : smoothedOq < 65 ? 'balanced' : 'high');
                    const colors = colorBlindMode
                        ? { low: 'bg-orange-400', balanced: 'bg-teal-400', high: 'bg-blue-400' }
                        : { low: 'bg-amber-400', balanced: 'bg-emerald-400', high: 'bg-cyan-400' };

                    oqIndicatorRef.current.className = `absolute top-0.5 bottom-0.5 w-1.5 rounded-full transition-all duration-100 ${colors[zone]}`;
                }

                if (oqZoneRef.current) {
                    const zone = oq_zone || (smoothedOq < 35 ? 'low' : smoothedOq < 65 ? 'balanced' : 'high');
                    const labels = { low: 'Pressed', balanced: 'Balanced', high: 'Breathy' };
                    const colors = colorBlindMode
                        ? { low: 'text-orange-400', balanced: 'text-teal-400', high: 'text-blue-400' }
                        : { low: 'text-amber-400', balanced: 'text-emerald-400', high: 'text-cyan-400' };

                    oqZoneRef.current.innerText = labels[zone];
                    oqZoneRef.current.className = `text-[10px] font-bold uppercase ${colors[zone]}`;
                }
            }

            // NEW: Update ventricular warning
            if (ventricularRef.current) {
                if (ventricular_detected && ventricular_severity !== 'none') {
                    ventricularRef.current.style.display = 'flex';
                    ventricularRef.current.querySelector('.ventricular-feedback').innerText = ventricular_feedback || 'Strain detected';
                } else {
                    ventricularRef.current.style.display = 'none';
                }
            }

            requestAnimationFrame(loop);
        };

        // Start the animation loop
        requestAnimationFrame(loop);
    }, [dataRef, colorBlindMode]);

    // Determine if in sweet spot for static rendering
    const breathinessGrbas = dataRef.current?.breathinessGrbas;
    const isSweetSpot = breathinessGrbas?.is_sweet_spot ?? false;
    const isExcessive = breathinessGrbas?.is_excessive ?? false;

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Wind className={`w-5 h-5 ${colorBlindMode ? 'text-teal-400' : 'text-emerald-400'}`} />
                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Breathiness</span>
                </div>
                <div className="flex items-center gap-2">
                    <span ref={zoneRef} className="text-xs font-bold uppercase tracking-wider text-slate-400">-</span>
                    <span ref={valueRef} className={`text-2xl font-mono font-bold tabular-nums ${colorBlindMode ? 'text-teal-400' : 'text-emerald-400'}`}>50</span>
                </div>
            </div>

            {/* Zone Meter */}
            <div className="relative h-10 bg-slate-900/80 rounded-full overflow-hidden shadow-inner border border-white/5 mb-4">
                {/* Zone Background Gradient */}
                <div className="absolute inset-0 flex">
                    <div className={`flex-1 ${colorBlindMode ? 'bg-slate-600/30' : 'bg-slate-500/30'}`} />
                    <div className={`flex-1 ${colorBlindMode ? 'bg-teal-500/30' : 'bg-emerald-500/30'}`} />
                    <div className={`flex-1 ${colorBlindMode ? 'bg-orange-500/30' : 'bg-amber-500/30'}`} />
                    <div className={`flex-1 ${colorBlindMode ? 'bg-pink-500/30' : 'bg-red-500/30'}`} />
                </div>

                {/* Zone Dividers */}
                <div className="absolute left-[25%] top-0 bottom-0 w-px bg-white/20" />
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/20" />
                <div className="absolute left-[75%] top-0 bottom-0 w-px bg-white/20" />

                {/* Sweet Spot Indicator */}
                <div className="absolute left-[25%] right-[50%] top-0 bottom-0 pointer-events-none">
                    <div className={`absolute inset-0 border-2 border-dashed rounded ${colorBlindMode ? 'border-teal-400/50' : 'border-emerald-400/50'}`} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Sparkles className={`w-3 h-3 ${colorBlindMode ? 'text-teal-400/60' : 'text-emerald-400/60'}`} />
                    </div>
                </div>

                {/* Zone Labels */}
                <div className="absolute inset-0 flex pointer-events-none">
                    <div className="flex-1 flex items-center justify-center text-[8px] font-bold text-white/40 uppercase">Clear</div>
                    <div className="flex-1 flex items-center justify-center text-[8px] font-bold text-white/50 uppercase">Target</div>
                    <div className="flex-1 flex items-center justify-center text-[8px] font-bold text-white/40 uppercase">High</div>
                    <div className="flex-1 flex items-center justify-center text-[8px] font-bold text-white/40 uppercase">Excess</div>
                </div>

                {/* Indicator */}
                <div
                    ref={indicatorRef}
                    className="absolute top-1 bottom-1 w-2 rounded-full bg-emerald-400 border border-white/50 shadow-lg z-10"
                    style={{ left: '50%' }}
                />
            </div>

            {/* Feedback Area */}
            <div className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${isSweetSpot
                ? (colorBlindMode ? 'bg-teal-500/10 border-teal-500/30' : 'bg-emerald-500/10 border-emerald-500/30')
                : isExcessive
                    ? (colorBlindMode ? 'bg-orange-500/10 border-orange-500/30' : 'bg-amber-500/10 border-amber-500/30')
                    : 'bg-slate-800/50 border-white/5'
                }`}>
                {isSweetSpot ? (
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${colorBlindMode ? 'text-teal-400' : 'text-emerald-400'}`} />
                ) : isExcessive ? (
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${colorBlindMode ? 'text-orange-400' : 'text-amber-400'}`} />
                ) : (
                    <Info className="w-4 h-4 shrink-0 text-slate-400" />
                )}
                <span ref={feedbackRef} className={`text-sm font-medium ${isSweetSpot
                    ? (colorBlindMode ? 'text-teal-300' : 'text-emerald-300')
                    : isExcessive
                        ? (colorBlindMode ? 'text-orange-300' : 'text-amber-300')
                        : 'text-slate-300'
                    }`}>
                    Analyzing...
                </span>
            </div>

            {/* NEW: Open Quotient Meter */}
            <div className="mt-4 bg-slate-900/50 rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <Activity className={`w-3.5 h-3.5 ${colorBlindMode ? 'text-blue-400' : 'text-cyan-400'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Open Quotient</span>
                        <div className="group relative">
                            <HelpCircle className="w-3 h-3 text-slate-600 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-slate-800 rounded-lg border border-white/10 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                Open Quotient = % of time vocal folds are open. Higher = breathy, Lower = pressed. Estimated from acoustic features.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span ref={oqZoneRef} className="text-[10px] font-bold uppercase text-slate-400">Balanced</span>
                        <span ref={oqValueRef} className={`text-lg font-mono font-bold tabular-nums ${colorBlindMode ? 'text-blue-400' : 'text-cyan-400'}`}>50</span>
                        <span className="text-[10px] text-slate-500">%</span>
                    </div>
                </div>

                {/* OQ Meter Bar */}
                <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                    {/* Zone Gradient Background */}
                    <div className="absolute inset-0 flex">
                        <div className={`flex-[35] ${colorBlindMode ? 'bg-orange-500/20' : 'bg-amber-500/20'}`} />
                        <div className={`flex-[30] ${colorBlindMode ? 'bg-teal-500/20' : 'bg-emerald-500/20'}`} />
                        <div className={`flex-[35] ${colorBlindMode ? 'bg-blue-500/20' : 'bg-cyan-500/20'}`} />
                    </div>

                    {/* Zone Dividers */}
                    <div className="absolute left-[35%] top-0 bottom-0 w-px bg-white/10" />
                    <div className="absolute left-[65%] top-0 bottom-0 w-px bg-white/10" />

                    {/* Target Zone Indicator (Balanced) */}
                    <div className="absolute left-[35%] right-[35%] top-0 bottom-0 pointer-events-none">
                        <div className={`absolute inset-0 border border-dashed rounded opacity-40 ${colorBlindMode ? 'border-teal-400' : 'border-emerald-400'}`} />
                    </div>

                    {/* Zone Labels */}
                    <div className="absolute inset-0 flex pointer-events-none">
                        <div className="flex-[35] flex items-center justify-center text-[7px] font-bold text-white/30 uppercase">Pressed</div>
                        <div className="flex-[30] flex items-center justify-center text-[7px] font-bold text-white/40 uppercase">Balanced</div>
                        <div className="flex-[35] flex items-center justify-center text-[7px] font-bold text-white/30 uppercase">Breathy</div>
                    </div>

                    {/* OQ Indicator */}
                    <div
                        ref={oqIndicatorRef}
                        className={`absolute top-0.5 bottom-0.5 w-1.5 rounded-full transition-all duration-100 ${colorBlindMode ? 'bg-teal-400' : 'bg-emerald-400'}`}
                        style={{ left: '50%' }}
                    />
                </div>
            </div>

            {/* NEW: Ventricular Engagement Warning */}
            <div
                ref={ventricularRef}
                className={`mt-3 p-2.5 rounded-lg border items-center gap-2 ${colorBlindMode
                    ? 'bg-pink-500/10 border-pink-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                    }`}
                style={{ display: 'none' }}
            >
                <AlertTriangle className={`w-4 h-4 shrink-0 animate-pulse ${colorBlindMode ? 'text-pink-400' : 'text-red-400'}`} />
                <div className="flex-1">
                    <div className={`text-[10px] font-bold uppercase tracking-wide ${colorBlindMode ? 'text-pink-400' : 'text-red-400'}`}>
                        Strain Detected
                    </div>
                    <span className={`ventricular-feedback text-xs ${colorBlindMode ? 'text-pink-300' : 'text-red-300'}`}>
                        Constriction detected - try relaxing
                    </span>
                </div>
            </div>

            {/* Details Panel */}
            {showDetails && (
                <div className="mt-4 bg-slate-900/50 rounded-xl p-4 border border-white/5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
                        Research Note
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Studies show that <span className={colorBlindMode ? 'text-teal-400 font-medium' : 'text-emerald-400 font-medium'}>slight breathiness</span> (Score 1)
                        increases perceived femininity by ~15-20%, while excessive breathiness may cause vocal strain.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-4 text-[10px]">
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${colorBlindMode ? 'bg-teal-400' : 'bg-emerald-400'}`} />
                            <span className="text-slate-500">Target Zone</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${colorBlindMode ? 'bg-orange-400' : 'bg-amber-400'}`} />
                            <span className="text-slate-500">Reduce Air</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Excessive Warning */}
            {isExcessive && (
                <div className={`mt-4 p-3 rounded-lg border flex items-center gap-2 animate-pulse ${colorBlindMode
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium">
                        Try reducing airflow. Excessive breathiness may cause vocal fatigue.
                    </span>
                </div>
            )}
        </div>
    );
};

export default BreathinessMeter;
