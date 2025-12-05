import React from 'react';
import { Droplets, Battery, Clock, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const VocalHealthPanel = () => {
    const { vocalHealth, updateHydration, logFatigue } = useProfile();

    if (!vocalHealth) return null;

    const { hydration, fatigue, usage } = vocalHealth;

    // Calculate usage percentage
    const usagePercent = Math.min(100, (usage.todaySeconds / (usage.dailyLimitMinutes * 60)) * 100);
    const isOverLimit = usagePercent >= 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Hydration Tracker */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Droplets size={20} />
                        <h3 className="font-bold">Hydration</h3>
                    </div>
                    <span className="text-2xl font-bold text-white">{hydration.current}/{hydration.goal}</span>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => updateHydration(-1)}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    >
                        <Minus size={20} />
                    </button>

                    <div className="flex gap-1">
                        {[...Array(hydration.goal)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-8 rounded-full ${i < hydration.current ? 'bg-blue-500' : 'bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => updateHydration(1)}
                        className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Vocal Fatigue Monitor */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-purple-400">
                        <Battery size={20} />
                        <h3 className="font-bold">Vocal Fatigue</h3>
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
                <div className="flex justify-between text-xs text-slate-500 mt-2">
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
                        <h3 className="font-bold">Daily Usage</h3>
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
    );
};

export default VocalHealthPanel;
