import React from 'react';

const DailyGoalsWidget = ({ goals }) => {
    const allComplete = goals.every(g => g.current >= g.target);

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
                    const isDone = pct >= 100;
                    return (
                        <div key={g.id}>
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span>{g.label}</span>
                                <span className={isDone ? "text-emerald-400 font-bold" : "text-slate-500"}>{Math.floor(g.current)}/{g.target}</span>
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
