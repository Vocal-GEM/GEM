import { useState } from 'react';
import { Info, X } from 'lucide-react';

const OrbLegend = ({ mode = 'gem' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const config = {
        gem: {
            pitch: { label: 'Pitch ↔ Color', left: 'Masc (Low)', right: 'Fem (High)' },
            resonance: { label: 'Resonance ↔ Facets', left: 'Smooth (Dark)', right: 'Sharp (Bright)' },
            weight: { label: 'Weight ↔ Clarity', left: 'Glass', right: 'Crystal' }
        },
        fire: {
            pitch: { label: 'Pitch ↔ Heat Color', left: 'Blue (Cool)', right: 'Pink (Hot)' },
            resonance: { label: 'Resonance ↔ Height', left: 'Low/Wide', right: 'Tall/Sharp' },
            weight: { label: 'Weight ↔ Intensity', left: 'Wispy Smoke', right: 'Solid Flame' }
        }
    };

    const current = config[mode] || config.gem;

    return (
        <div className="absolute bottom-4 right-4 z-30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full backdrop-blur-md border transition-all ${isOpen ? 'bg-teal-500 text-white border-teal-400' : 'bg-slate-800/50 border-white/10 text-white/70 hover:bg-slate-700/50'}`}
            >
                {isOpen ? <X size={20} /> : <Info size={20} />}
            </button>

            {isOpen && (
                <div className="absolute right-0 bottom-12 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Visual Key
                        </h3>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/70 font-mono">{mode.toUpperCase()}</span>
                    </div>

                    <div className="space-y-5">
                        {/* Pitch / Color */}
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                                <span>{current.pitch.left}</span>
                                <span>{current.pitch.right}</span>
                            </div>
                            {/* Blue -> Purple -> Pink */}
                            <div className="h-4 w-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-inner border border-white/5" />
                            <div className="text-xs text-white/60 mt-1.5 text-center font-medium">{current.pitch.label}</div>
                        </div>

                        {/* Resonance */}
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                                <span>{current.resonance.left}</span>
                                <span>{current.resonance.right}</span>
                            </div>
                            <div className="flex justify-between items-center h-10 px-3 bg-slate-800/50 rounded-lg border border-white/5">
                                <div className="w-5 h-5 rounded-full bg-slate-400/50 shadow-sm" />
                                <div className="text-xs text-white/40">↔</div>
                                <div className="w-5 h-5 rotate-45 bg-slate-400/50 border border-white/80 shadow-sm" />
                            </div>
                            <div className="text-xs text-white/60 mt-1.5 text-center font-medium">{current.resonance.label}</div>
                        </div>

                        {/* Weight */}
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                                <span>{current.weight.left}</span>
                                <span>{current.weight.right}</span>
                            </div>
                            <div className="h-4 w-full rounded-full bg-gradient-to-r from-white/20 to-white/90 border border-white/10 shadow-inner" />
                            <div className="text-xs text-white/60 mt-1.5 text-center font-medium">{current.weight.label}</div>
                        </div>

                        {/* Volume */}
                        <div className="pt-3 border-t border-white/10">
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                                <span>Glows brighter with Volume</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrbLegend;
