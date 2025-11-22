import React from 'react';

const HistoryView = ({ stats, journals }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Streak</div>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                        {stats.streak} <span className="text-sm text-slate-500 font-normal">days</span>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Practice</div>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                        {Math.floor(stats.totalSeconds / 60)} <span className="text-sm text-slate-500 font-normal">mins</span>
                    </div>
                </div>
            </div>

            {/* Journal Feed */}
            <h3 className="text-lg font-bold mb-4 px-1">Journal History</h3>
            <div className="space-y-4">
                {journals.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <p>No entries yet. Start practicing!</p>
                    </div>
                ) : (
                    journals.slice().reverse().map((entry, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-slate-400 font-mono">{new Date(entry.timestamp).toLocaleDateString()} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <div className="flex gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${entry.effort > 7 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        Effort: {entry.effort}
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${entry.confidence > 7 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        Conf: {entry.confidence}
                                    </span>
                                </div>
                            </div>

                            {entry.script && (
                                <div className="mb-3 p-2 bg-slate-950 rounded border border-slate-800 text-xs text-slate-400 italic">
                                    "{entry.script.length > 50 ? entry.script.substring(0, 50) + '...' : entry.script}"
                                </div>
                            )}

                            {entry.audioUrl && (
                                <div className="mb-3">
                                    <audio src={entry.audioUrl.startsWith('http') ? entry.audioUrl : `http://localhost:5000${entry.audioUrl}`} controls className="w-full h-8" />
                                </div>
                            )}

                            <p className="text-sm text-slate-300 leading-relaxed">{entry.notes}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryView;
