import { useState, useEffect, useRef, useId } from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { ChevronUp, ChevronDown, CheckCircle2, AlertTriangle, Wind, Info, Mic2 } from 'lucide-react';

/**
 * SpectralTiltMeter
 *
 * Visualizes the energy drop-off from low to high frequencies (H1-H2, etc).
 * - Steeper tilt (more high-freq drop-off) = breathy/softer quality
 * - Flatter tilt (more high-freq energy) = pressed/brassy quality
 */
const SpectralTiltMeter = ({ dataRef, targetZone = 'balanced', showAdvanced = false }) => {
    // Current tilt in dB/octave (approximate)
    const [tilt, setTilt] = useState(0);
    // Recent history for smoothing/sparkline
    const historyRef = useRef([]);
    const maxHistory = 30;

    // Status metrics
    const [status, setStatus] = useState({
        zone: 'balanced',
        h1h2: 0,
        cpp: 0
    });

    const [showTooltip, setShowTooltip] = useState(false);

    const componentId = useId();

    useEffect(() => {
        const loop = () => {
            if (!dataRef?.current) return;

            const { spectralTilt, h1h2, cpp } = dataRef.current;

            // Assuming spectralTilt is something like -12dB/octave
            // H1-H2 often correlated with tilt (higher H1-H2 = steeper tilt = more breathy)

            const currentTilt = spectralTilt || -12;
            const currentH1H2 = h1h2 || 5;

            setTilt(currentTilt);

            // Determine zone based on H1-H2 and tilt
            // These thresholds would need empirical tuning based on the audio engine
            let zone = 'balanced';
            if (currentH1H2 > 8) {
                zone = 'breathy'; // High H1 relative to H2, steep drop-off
            } else if (currentH1H2 < 2) {
                zone = 'pressed'; // Strong higher harmonics, flat tilt
            }

            setStatus({
                zone,
                h1h2: currentH1H2,
                cpp: cpp || 0
            });

            // Update history
            historyRef.current.push(currentTilt);
            if (historyRef.current.length > maxHistory) {
                historyRef.current.shift();
            }
        };

        const unsubscribe = renderCoordinator.subscribe(
            `spectral-tilt-meter-${componentId}`,
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };
    }, [dataRef, componentId]);

    // Render logic remains the same...
    const getZoneConfig = () => {
        switch (status.zone) {
            case 'breathy':
                return {
                    label: 'Breathy',
                    icon: <Wind size={16} />,
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-500/10',
                    border: 'border-cyan-500/30',
                    gradient: 'from-cyan-500/20 to-transparent',
                    msg: 'Steep spectral tilt. Good for softening, but watch for weakness.'
                };
            case 'pressed':
                return {
                    label: 'Pressed',
                    icon: <AlertTriangle size={16} />,
                    color: 'text-orange-400',
                    bg: 'bg-orange-500/10',
                    border: 'border-orange-500/30',
                    gradient: 'from-orange-500/20 to-transparent',
                    msg: 'Flat spectral tilt. Strong, brassy, but may be straining.'
                };
            default:
                return {
                    label: 'Balanced',
                    icon: <CheckCircle2 size={16} />,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/30',
                    gradient: 'from-emerald-500/20 to-transparent',
                    msg: 'Balanced harmonic energy distribution.'
                };
        }
    };

    const config = getZoneConfig();

    return (
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                        <Mic2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                            Spectral Tilt
                        </h3>
                        <p className="text-xs text-slate-400">Harmonic Energy Distribution</p>
                    </div>
                </div>

                <button
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute z-50 mt-[-80px] right-4 p-3 bg-slate-900/95 backdrop-blur border border-white/10 rounded-lg text-xs text-slate-300 max-w-xs shadow-xl">
                    <p className="mb-2"><strong>Spectral Tilt</strong> measures how fast sound energy drops off in higher frequencies.</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Steep:</strong> More breathy/soft (feminine tendency)</li>
                        <li><strong>Flat:</strong> More pressed/brassy (masculine tendency)</li>
                    </ul>
                </div>
            )}

            {/* Main Visualization (Tilt Graph) */}
            <div className="relative h-32 bg-slate-950/50 rounded-xl border border-white/5 overflow-hidden mb-4 p-4">
                {/* Axes */}
                <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-700"></div>
                <div className="absolute left-4 right-4 bottom-4 h-px bg-slate-700"></div>

                {/* Labels */}
                <div className="absolute left-1 top-2 text-[9px] text-slate-500">dB</div>
                <div className="absolute right-2 bottom-0 text-[9px] text-slate-500">Freq</div>

                {/* The "Tilt" Line */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                        {/*
                            Visualizing tilt.
                            Start high on Y axis (left side).
                            End lower on Y axis (right side).
                            Steeper tilt = lower end point.
                        */}
                        <line
                            x1="10%"
                            y1="20%"
                            x2="90%"
                            // Map tilt (e.g., -6 to -18) to a y2 percentage (e.g., 40% to 90%)
                            // Rough mapping for visual effect:
                            // tilt -6 (flat) -> y2 = 40%
                            // tilt -18 (steep) -> y2 = 90%
                            y2={`${Math.min(95, Math.max(30, (Math.abs(tilt) / 20) * 100))}%`}
                            stroke="currentColor"
                            strokeWidth="3"
                            className={`${config.color} transition-all duration-300 ease-out`}
                            strokeLinecap="round"
                        />

                        {/* Harmonic peaks representation (static for visual context) */}
                        <path
                            d="M 10% 20% Q 15% 10%, 20% 30% T 30% 40% T 40% 50% T 50% 60% T 60% 70% T 70% 80% T 80% 85% T 90% 90%"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                    </svg>
                </div>

                {/* Current Value Badge */}
                <div className="absolute top-2 right-2 bg-slate-800/80 px-2 py-1 rounded text-xs font-mono font-bold text-white border border-slate-700 backdrop-blur">
                    {tilt.toFixed(1)} dB/oct
                </div>
            </div>

            {/* Status & Feedback */}
            <div className={`flex items-start gap-3 p-3 rounded-xl ${config.bg} border ${config.border}`}>
                <div className={`mt-0.5 ${config.color}`}>
                    {config.icon}
                </div>
                <div>
                    <h4 className={`text-sm font-bold ${config.color}`}>{config.label}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {config.msg}
                    </p>
                </div>
            </div>

            {/* Advanced Metrics (Optional) */}
            {showAdvanced && (
                <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">H1-H2 Diff</div>
                        <div className="text-lg font-mono text-white">
                            {status.h1h2.toFixed(1)} <span className="text-xs text-slate-500">dB</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">CPP (Clarity)</div>
                        <div className="text-lg font-mono text-white">
                            {status.cpp.toFixed(1)} <span className="text-xs text-slate-500">dB</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpectralTiltMeter;
