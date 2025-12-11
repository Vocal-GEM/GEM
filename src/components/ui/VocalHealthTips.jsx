import { cloneElement } from 'react';
import { HeartPulse, X } from 'lucide-react';
import { vocalHealthTips } from '../../data/vocalHealthTips';

const VocalHealthTips = ({ onClose }) => {
    // Tips are now imported from data/vocalHealthTips.js

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <HeartPulse className="text-emerald-400" /> Vocal Health
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {vocalHealthTips.map((tip, i) => (
                            <div key={tip.id} className={`bg-slate-800/50 p-4 rounded-xl border border-${tip.color || 'emerald'}-500/20 hover:border-${tip.color || 'emerald'}-500/50 transition-colors`}>
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg bg-${tip.color || 'emerald'}-500/10`}>
                                        {cloneElement(tip.icon, { size: 24 })}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white mb-1">{tip.title}</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed">{tip.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <button onClick={onClose} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                            Got It!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VocalHealthTips;
