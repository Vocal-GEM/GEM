import React from 'react';
import { Trophy, Lock } from 'lucide-react';
import { getAllAchievements } from '../../services/AchievementsService';

const AchievementsPanel = () => {
    const achievements = getAllAchievements();
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-amber-400" /> Achievements
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {unlocked.length} of {achievements.length} unlocked
                    </p>
                </div>
                <div className="text-3xl font-bold text-amber-400">
                    {Math.round((unlocked.length / achievements.length) * 100)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                    style={{ width: `${(unlocked.length / achievements.length) * 100}%` }}
                />
            </div>

            {/* Unlocked Achievements */}
            {unlocked.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Unlocked</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {unlocked.map(a => (
                            <div
                                key={a.id}
                                className="bg-gradient-to-br from-amber-900/30 to-slate-900 border border-amber-500/30 rounded-xl p-4 text-center"
                            >
                                <div className="text-3xl mb-2">{a.icon}</div>
                                <div className="font-bold text-white text-sm">{a.title}</div>
                                <div className="text-xs text-slate-400 mt-1">{a.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Achievements */}
            {locked.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Locked</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {locked.map(a => (
                            <div
                                key={a.id}
                                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center opacity-60"
                            >
                                <div className="text-3xl mb-2 grayscale">
                                    <Lock size={24} className="mx-auto text-slate-600" />
                                </div>
                                <div className="font-bold text-slate-500 text-sm">{a.title}</div>
                                <div className="text-xs text-slate-600 mt-1">{a.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementsPanel;
