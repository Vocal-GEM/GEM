import React from 'react';
import { Info } from 'lucide-react';

const OrbLegend = ({ mode = 'gem' }) => {

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
        <div className="absolute top-4 right-4 z-10 group">
            <button className="p-2 rounded-full bg-slate-800/50 backdrop-blur-md border border-white/10 text-white/70 hover:bg-slate-700/50 transition-all">
                <Info size={20} />
            </button>

            <div className="absolute right-0 top-12 w-72 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider border-b border-white/10 pb-2 flex justify-between items-center">
                    <span>Visual Key</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">{mode.toUpperCase()}</span>
                </h3>

                <div className="space-y-4">
                    {/* Pitch / Color */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{current.pitch.left}</span>
                            <span>{current.pitch.right}</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gradient-to-r from-[rgb(0,100,128)] via-[rgb(0,200,200)] to-[rgb(255,100,200)]" />
                        <div className="text-xs text-white/60 mt-1 text-center font-medium">{current.pitch.label}</div>
                    </div>

                    {/* Resonance */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{current.resonance.left}</span>
                            <span>{current.resonance.right}</span>
                        </div>
                        <div className="flex justify-between items-center h-8 px-2 bg-slate-800/50 rounded-lg border border-white/5">
                            <div className="w-4 h-4 rounded-full bg-slate-400/50" />
                            <div className="text-xs text-white/40">↔</div>
                            <div className="w-4 h-4 rotate-45 bg-slate-400/50 border border-white/80" />
                        </div>
                        <div className="text-xs text-white/60 mt-1 text-center font-medium">{current.resonance.label}</div>
                    </div>

                    {/* Weight */}
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{current.weight.left}</span>
                            <span>{current.weight.right}</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gradient-to-r from-white/20 to-white/90 border border-white/10" />
                        <div className="text-xs text-white/60 mt-1 text-center font-medium">{current.weight.label}</div>
                    </div>

                    {/* Volume */}
                    <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            <span>Glows brighter with Volume</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrbLegend;
