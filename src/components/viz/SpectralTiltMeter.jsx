import { useEffect, useRef, useId } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Info, TrendingDown } from 'lucide-react';
import { renderCoordinator } from '../../services/RenderCoordinator';

const SpectralTiltMeter = ({ dataRef, userMode, targetRange = { min: -12, max: -6 } }) => {
    const { colorBlindMode } = useSettings();
    const componentId = useId();
    const indicatorRef = useRef(null);
    const valueRef = useRef(null);

    useEffect(() => {
        const loop = () => {
            if (indicatorRef.current && valueRef.current && dataRef.current) {
                const tilt = dataRef.current.tilt || 0;

                // Map Tilt: Typically -24dB/oct (Steep) to 0dB/oct (Flat)
                const minDisp = -24;
                const maxDisp = 0;

                // Normalize to 0-100%
                let percent = ((tilt - minDisp) / (maxDisp - minDisp)) * 100;
                percent = Math.max(0, Math.min(100, percent));

                // Indicator styling based on target
                const isWithinTarget = tilt >= targetRange.min && tilt <= targetRange.max;
                const indicatorColor = isWithinTarget
                    ? (colorBlindMode ? 'bg-amber-500' : 'bg-emerald-500')
                    : 'bg-slate-400';

                const shadowColor = isWithinTarget
                    ? 'rgba(100,255,100,0.8)'
                    : 'rgba(100,200,255,0.8)';

                // Update styles
                indicatorRef.current.style.left = `${percent}%`;
                indicatorRef.current.className = `absolute top-1 bottom-1 w-2 rounded-full border border-white/50 transition-all duration-100 ease-out z-10 ${indicatorColor}`;
                indicatorRef.current.style.boxShadow = `0 0 15px ${shadowColor}`;

                // Update value display
                valueRef.current.innerText = tilt.toFixed(1);
            }
        };

        const unsubscribe = renderCoordinator.subscribe(
            componentId,
            loop,
            renderCoordinator.PRIORITY.MEDIUM
        );

        return () => {
            unsubscribe();
        };
    }, [dataRef, targetRange, colorBlindMode, componentId]);

    // Calculate target zone position for rendering
    const minDisp = -24;
    const maxDisp = 0;
    const targetLeft = ((targetRange.min - minDisp) / (maxDisp - minDisp)) * 100;
    const targetWidth = ((targetRange.max - targetRange.min) / (maxDisp - minDisp)) * 100;

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
                <div
                    className={`absolute top-0 bottom-0 border-x ${colorBlindMode ? 'bg-amber-500/20 border-amber-500/30' : 'bg-emerald-500/20 border-emerald-500/30'}`}
                    style={{ left: `${targetLeft}%`, width: `${targetWidth}%` }}
                >
                    <div className={`absolute top-1 left-1 text-[8px] font-bold uppercase tracking-wider ${colorBlindMode ? 'text-amber-400' : 'text-emerald-400'}`}>Target</div>
                </div>

                {/* Grid Lines */}
                <div className="absolute left-[25%] top-2 bottom-2 w-px bg-white/5"></div>
                <div className="absolute left-[50%] top-2 bottom-2 w-px bg-white/5"></div>
                <div className="absolute left-[75%] top-2 bottom-2 w-px bg-white/5"></div>

                {/* Indicator */}
                <div
                    ref={indicatorRef}
                    className="absolute top-1 bottom-1 w-2 rounded-full bg-slate-400 border border-white/50 z-10"
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
