import React from 'react';

const VocalHealthTips = ({ onClose }) => {
    const tips = [
        { icon: '💧', title: 'Stay Hydrated', desc: 'Drink plenty of water throughout the day. Avoid caffeine and alcohol before practice.' },
        { icon: '🤫', title: 'Avoid Strain', desc: 'Never push through pain. If your voice hurts, stop and rest.' },
        { icon: '😴', title: 'Rest Your Voice', desc: 'Take breaks during long practice sessions. Silence is healing.' },
        { icon: '🚭', title: 'Avoid Irritants', desc: 'Smoking, vaping, and shouting can damage your vocal cords.' },
        { icon: '🌡️', title: 'Warm Up First', desc: 'Always do gentle humming or sirens before intense exercises.' },
        { icon: '🩺', title: 'See a Professional', desc: 'If you experience persistent hoarseness or pain, consult an SLP or ENT doctor.' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <i data-lucide="heart-pulse" className="text-emerald-400"></i> Vocal Health
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <i data-lucide="x" className="w-5 h-5 text-slate-400"></i>
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {tips.map((tip, i) => (
                            <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl">{tip.icon}</div>
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
