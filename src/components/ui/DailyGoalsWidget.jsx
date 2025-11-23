import React from 'react';

const DailyGoalsWidget = ({ goals, compact = false }) => {
    const allComplete = goals.every(g => g.current >= g.target);

    if (compact) {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {goals.map(g => {
                    const pct = Math.min(100, (g.current / g.target) * 100);
                    const isDone = g.completed;
                    return (
                        <div key={g.id} className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border ${isDone ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-800/50 border-white/5'}`}>
                            <div className="relative w-8 h-8 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                    <path className={isDone ? "text-emerald-500" : "text-blue-500"} strokeDasharray={`${pct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                </svg>
                                {isDone && <i data-lucide="check" className="absolute w-4 h-4 text-emerald-500"></i>}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">{g.type}</span>
                                <span className="text-xs font-bold text-white">{isDone ? 'Complete!' : `${Math.floor(g.current)}/${g.target}`}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={`glass-panel p-4 rounded-2xl mb-4 border transition-all duration-500 ${allComplete ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-white/5'}`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <i data-lucide="target" className={allComplete ? "text-emerald-400" : "text-blue-400"}></i> Daily Goals
                </h3>
                {allComplete && <span className="text-[10px] bg-emerald-500 text-black font-bold px-2 py-1 rounded-full">COMPLETE!</span>}
            </div>
            <div className="space-y-3">
                {goals.map(g => {
                    const pct = Math.min(100, (g.current / g.target) * 100);
                    const isDone = g.completed;
                    return (
                        <div key={g.id}>
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span className="flex items-center gap-2">
                                    {g.label}
                                    <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 rounded border border-yellow-500/20">+{g.xp} XP</span>
                                </span>
                                <span className={isDone ? "text-emerald-400 font-bold" : "text-slate-500"}>
                                    {isDone ? <i data-lucide="check" className="w-3 h-3"></i> : `${Math.floor(g.current)}/${g.target}`}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${pct}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DailyGoalsWidget;
