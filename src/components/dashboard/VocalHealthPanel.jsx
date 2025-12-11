import { useState, useEffect, cloneElement } from 'react';
import { Battery, Clock, AlertTriangle, Sparkles, Lightbulb } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { vocalHealthTips } from '../../data/vocalHealthTips';
import VocalHealthTips from '../ui/VocalHealthTips'; // Assuming we'll repurpose or verify this path

const VocalHealthPanel = () => {
    const { vocalHealth, logFatigue } = useProfile();
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [showAllTips, setShowAllTips] = useState(false);

    // Auto-cycle tips every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % vocalHealthTips.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    if (!vocalHealth) return null;

    const { fatigue, usage } = vocalHealth;
    const currentTip = vocalHealthTips[currentTipIndex];

    // Calculate usage percentage
    const usagePercent = Math.min(100, (usage.todaySeconds / (usage.dailyLimitMinutes * 60)) * 100);
    const isOverLimit = usagePercent >= 100;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Vocal Hygiene Tip Card (Replaces Hydration) */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <Sparkles size={20} />
                                    <h3 className="font-bold text-slate-200">Vocal Hygiene</h3>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                                    Tip #{currentTip.id}
                                </span>
                            </div>

                            <div className="flex items-start gap-3 mb-2">
                                <div className={`p-2 rounded-lg bg-${currentTip.color}-500/10 mt-1`}>
                                    {cloneElement(currentTip.icon, { size: 20 })}
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm mb-1 text-${currentTip.color}-400`}>
                                        {currentTip.title}
                                    </h4>
                                    <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                                        {currentTip.desc}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAllTips(true)}
                            className="w-full mt-3 py-2 flex items-center justify-center gap-1 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                        >
                            <Lightbulb size={14} />
                            See All Tips
                        </button>
                    </div>

                    {/* Subtle background gradient based on tip color */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-${currentTip.color}-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`} />
                </div>

                {/* Vocal Fatigue Monitor */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-purple-400">
                            <Battery size={20} />
                            <h3 className="font-bold text-slate-200">Vocal Fatigue</h3>
                        </div>
                        <span className={`text-lg font-bold ${fatigue.level <= 3 ? 'text-green-400' :
                            fatigue.level <= 6 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            Level {fatigue.level}
                        </span>
                    </div>

                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={fatigue.level}
                        onChange={(e) => logFatigue(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>Fresh</span>
                        <span>Moderate</span>
                        <span>Exhausted</span>
                    </div>
                </div>

                {/* Daily Usage Limit */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2 text-orange-400">
                            <Clock size={20} />
                            <h3 className="font-bold text-slate-200">Daily Usage</h3>
                        </div>
                        <span className="text-sm text-slate-400">
                            {Math.round(usage.todaySeconds / 60)} / {usage.dailyLimitMinutes} min
                        </span>
                    </div>

                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden relative z-10">
                        <div
                            className={`h-full transition-all duration-500 ${isOverLimit ? 'bg-red-500' : 'bg-orange-500'
                                }`}
                            style={{ width: `${usagePercent}%` }}
                        />
                    </div>

                    {isOverLimit && (
                        <div className="mt-2 flex items-center gap-2 text-red-400 text-xs font-bold animate-pulse relative z-10">
                            <AlertTriangle size={12} />
                            <span>Daily limit reached. Rest your voice!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for All Tips */}
            {showAllTips && (
                <VocalHealthTips onClose={() => setShowAllTips(false)} />
            )}
        </>
    );
};

export default VocalHealthPanel;
