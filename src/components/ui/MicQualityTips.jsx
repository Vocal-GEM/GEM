import { cloneElement } from 'react';
import { Mic, X } from 'lucide-react';
import { micQualityTips } from '../../data/micQualityTips';

const MicQualityTips = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Mic className="text-teal-400" /> Recording Tips
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <p className="text-slate-400 text-sm mb-4">
                        Follow these tips to get the best voice analysis results.
                    </p>

                    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {micQualityTips.map((tip) => (
                            <div key={tip.id} className={`bg-slate-800/50 p-4 rounded-xl border border-${tip.color || 'teal'}-500/20 hover:border-${tip.color || 'teal'}-500/50 transition-colors`}>
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg bg-${tip.color || 'teal'}-500/10 flex-shrink-0`}>
                                        {cloneElement(tip.icon, { size: 20 })}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white mb-1 text-sm">{tip.title}</h3>
                                        <p className="text-xs text-slate-300 leading-relaxed">{tip.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <button onClick={onClose} className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/20">
                            Got It!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MicQualityTips;
