import { useEffect, useRef, useId } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { renderCoordinator } from '../../services/RenderCoordinator';
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
 *
 * Performance Optimization:
 * - Uses RenderCoordinator for centralized animation loop control
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
    const componentId = useId();
    const indicatorRef = useRef(null);
    const valueRef = useRef(null);
    const zoneRef = useRef(null);
    const feedbackRef = useRef(null);
    const lastValueRef = useRef(50);
    const id = useId();

    // NEW: Refs for OQ and ventricular displays
    const oqValueRef = useRef(null);
    const oqZoneRef = useRef(null);
    const oqIndicatorRef = useRef(null);
    const lastOqRef = useRef(50);
    const ventricularRef = useRef(null);

    // Optimized: Use RenderCoordinator to manage animation loop
    useEffect(() => {
        const update = () => {
            if (!dataRef.current) return;
        const updateMeter = () => {
            if (!dataRef.current) return;
        const loop = () => {
            if (!dataRef.current) return;
        const loop = (delta, currentTime) => {
            if (!dataRef.current) {
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
        };

        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            update,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return unsubscribe;
};
