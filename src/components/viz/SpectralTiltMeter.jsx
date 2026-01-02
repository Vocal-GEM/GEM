import { useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Info, TrendingDown } from 'lucide-react';

const SpectralTiltMeter = ({ dataRef, userMode, targetRange = { min: -12, max: -6 } }) => {
    const { colorBlindMode } = useSettings();
    const indicatorRef = useRef(null);
    const valueRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const loop = () => {
            if (indicatorRef.current && valueRef.current) {
                const tilt = dataRef.current.tilt || 0;

                // Map Tilt: Typically -20dB/oct (Masc/Steep?) to 0dB/oct (Flat/Bright?)
                // Wait, spectral tilt:
                // Steep tilt (more negative) = Feminine (breathy/fluty) or just less high freq energy?
                // Actually:
                // Masculine voices often have MORE high frequency energy (brassier) -> Flatter tilt (closer to 0 or -6dB/oct)
                // Feminine voices often have STEEPER tilt (less high freq energy, softer) -> Steeper tilt (closer to -12dB/oct)
                // BUT, "Bright" resonance usually means MORE high freq energy.
                // Let's stick to the user request: "Feminine voices typically have steeper tilt (faster energy falloff)"
                // So Fem target: -6 to -12 dB/octave? Wait, -12 is steeper than -6.
                // Let's assume the range passed in is correct.

                // Visualization Range: -24 dB/oct to 0 dB/oct
                const minDisp = -24;
                const maxDisp = 0;

                // Normalize to 0-100%
                // -24 -> 0%, 0 -> 100%
                let percent = ((tilt - minDisp) / (maxDisp - minDisp)) * 100;
                percent = Math.max(0, Math.min(100, percent));

                const curLeft = parseFloat(indicatorRef.current.style.left) || 0;
                const nextLeft = curLeft + (percent - curLeft) * 0.1;
                indicatorRef.current.style.left = `${nextLeft}%`;

                // Color based on target range
                // targetRange e.g. { min: -12, max: -6 }
                const isWithinTarget = tilt >= targetRange.min && tilt <= targetRange.max;

                if (isWithinTarget) {
                    indicatorRef.current.className = `absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(100,255,100,0.8)] transition-colors duration-75 ${colorBlindMode ? 'bg-amber-500' : 'bg-emerald-500'}`;
                } else {
                    indicatorRef.current.className = "absolute top-0 bottom-0 w-1.5 rounded-full shadow-[0_0_10px_rgba(100,200,255,0.8)] transition-colors duration-75 bg-slate-400";
                }

                // Update value display
                valueRef.current.innerText = tilt.toFixed(1);
            }
            requestAnimationFrame(loop);
        };

        let unsubscribe;
        import('../../services/RenderCoordinator').then(({ renderCoordinator }) => {
            unsubscribe = renderCoordinator.subscribe(
                'spectral-tilt-meter',
                loop,
                renderCoordinator.PRIORITY.MEDIUM
            );
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [dataRef, targetRange, colorBlindMode]);

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-center">
            {/* Header */}
            <div className="flex justify-between items-end text-xs font-bold text-slate-300 tracking-wider mb-4">
                <span className="w-24 text-left opacity-75">Steep (-24)</span>
                <div className="flex flex-col items-center">
                    <span className="text-slate-400 mb-1 uppercase tracking-widest text-[10px]">Spectral Tilt</span>
                    <div className="flex items-baseline gap-1">
                        <span ref={valueRef} className={`text-4xl font-mono font-bold tabular-nums leading-none ${colorBlindMode ? 'text-amber-400' : 'text-emerald-400'}`}>-0.0</span>
                        <span className="text-xs text-slate-400">dB/oct</span>
                    </div>
                </div>
                <span className="w-24 text-right opacity-75">Flat (0)</span>
            </div>

            {/* Meter Bar */}
            <div className="relative h-10 bg-slate-900/80 rounded-full overflow-hidden shadow-inner border border-white/5 mb-6">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colorBlindMode ? 'from-purple-900/40 to-teal-500/10' : 'from-indigo-900/40 to-blue-500/10'}`}></div>

                {/* Target Range Zone */}
                {/* Map target range to percentage */}
                {(() => {
                    const minDisp = -24;
                    const maxDisp = 0;
                    const left = ((targetRange.min - minDisp) / (maxDisp - minDisp)) * 100;
                    const width = ((targetRange.max - targetRange.min) / (maxDisp - minDisp)) * 100;
                    return (
                        <div
                            className={`absolute top-0 bottom-0 border-x ${colorBlindMode ? 'bg-amber-500/20 border-amber-500/30' : 'bg-emerald-500/20 border-emerald-500/30'}`}
                            style={{ left: `${left}%`, width: `${width}%` }}
                        >
                            <div className={`absolute top-0 left-0 right-0 h-[2px] ${colorBlindMode ? 'bg-amber-500/50' : 'bg-emerald-500/50'}`}></div>
                            <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${colorBlindMode ? 'bg-amber-500/50' : 'bg-emerald-500/50'}`}></div>
                            <div className={`absolute top-1 left-1 text-[8px] font-bold uppercase tracking-wider ${colorBlindMode ? 'text-amber-400' : 'text-emerald-400'}`}>Target</div>
                        </div>
                    );
                })()}

                {/* Grid Lines */}
                <div className="absolute left-[25%] top-2 bottom-2 w-px bg-white/5"></div>
                <div className="absolute left-[50%] top-2 bottom-2 w-px bg-white/5"></div>
                <div className="absolute left-[75%] top-2 bottom-2 w-px bg-white/5"></div>

                {/* Indicator */}
                <div
                    ref={indicatorRef}
                    className={`absolute top-1 bottom-1 w-2 rounded-full shadow-[0_0_15px_rgba(100,255,100,0.6)] border border-white/50 transition-all duration-100 ease-out z-10 ${colorBlindMode ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ left: '50%' }}
                ></div>
            </div>

            {/* Info Panel */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-center gap-2 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <TrendingDown size={12} /> What is Spectral Tilt?
                </div>
                <div className="flex items-start gap-2 text-[10px] text-slate-400 leading-tight bg-slate-800/30 p-2 rounded-lg">
                    <Info size={12} className="shrink-0 mt-0.5 text-slate-400" />
                    <div>
                        <span className="text-slate-300">Spectral tilt measures how fast energy drops off as frequency increases.</span>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                <span className={`font-bold block mb-1 ${colorBlindMode ? 'text-purple-400' : 'text-blue-400'}`}>Steeper (-12dB)</span>
                                <span className="text-slate-300">Softer, breathier, more feminine quality.</span>
                            </div>
                            <div className="bg-slate-800/50 p-2 rounded border border-white/5">
                                <span className={`font-bold block mb-1 ${colorBlindMode ? 'text-teal-400' : 'text-purple-400'}`}>Flatter (-6dB)</span>
                                <span className="text-slate-300">Brassier, buzzier, more masculine quality.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpectralTiltMeter;
