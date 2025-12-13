import React, { useState, useEffect } from 'react';
import { Trophy, Star, Lock, Sparkles } from 'lucide-react';

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first-session', title: 'First Steps', description: 'Complete your first practice session', icon: '🎤', xp: 50 },
    { id: 'streak-3', title: 'On a Roll', description: 'Maintain a 3-day streak', icon: '🔥', xp: 100 },
    { id: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', xp: 200 },
    { id: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆', xp: 500 },
    { id: 'sessions-10', title: 'Dedicated', description: 'Complete 10 practice sessions', icon: '⭐', xp: 150 },
    { id: 'sessions-50', title: 'Committed', description: 'Complete 50 practice sessions', icon: '💎', xp: 300 },
    { id: 'level-5', title: 'Rising Star', description: 'Reach level 5', icon: '🌟', xp: 200 },
    { id: 'level-10', title: 'Voice Pro', description: 'Reach level 10', icon: '👑', xp: 400 },
    { id: 'journal-5', title: 'Documenter', description: 'Record 5 voice journal entries', icon: '📝', xp: 100 },
    { id: 'explore-all', title: 'Explorer', description: 'Try all exercise categories', icon: '🧭', xp: 150 }
];

/**
 * Get user's unlocked achievements
 */
const getUnlockedAchievements = () => {
    try {
        const stored = localStorage.getItem('gem_achievements');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const AchievementShowcase = ({ compact = false }) => {
    const [unlocked, setUnlocked] = useState([]);
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    useEffect(() => {
        setUnlocked(getUnlockedAchievements());
    }, []);

    const unlockedCount = unlocked.length;
    const totalCount = ACHIEVEMENTS.length;
    const progress = (unlockedCount / totalCount) * 100;

    if (compact) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-amber-400" size={18} />
                        <span className="font-bold text-white">Achievements</span>
                    </div>
                    <span className="text-sm text-slate-400">{unlockedCount}/{totalCount}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex gap-1 mt-3 flex-wrap">
                    {ACHIEVEMENTS.slice(0, 8).map(achievement => {
                        const isUnlocked = unlocked.includes(achievement.id);
                        return (
                            <div
                                key={achievement.id}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${isUnlocked
                                        ? 'bg-amber-500/20'
                                        : 'bg-slate-800 grayscale opacity-50'
                                    }`}
                                title={achievement.title}
                            >
                                {achievement.icon}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="text-amber-400" size={28} />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Achievements</h2>
                        <p className="text-slate-400">{unlockedCount} of {totalCount} unlocked</p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-center text-sm text-slate-400 mt-2">
                    {Math.round(progress)}% Complete
                </p>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ACHIEVEMENTS.map(achievement => {
                    const isUnlocked = unlocked.includes(achievement.id);
                    return (
                        <button
                            key={achievement.id}
                            onClick={() => setSelectedAchievement(achievement)}
                            className={`p-4 rounded-xl text-left transition-all ${isUnlocked
                                    ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 hover:border-amber-400'
                                    : 'bg-slate-900 border border-slate-800 opacity-60'
                                }`}
                        >
                            <div className="text-3xl mb-2">
                                {isUnlocked ? achievement.icon : <Lock size={24} className="text-slate-600" />}
                            </div>
                            <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                {achievement.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {isUnlocked ? `+${achievement.xp} XP` : achievement.description}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Selected Achievement Modal */}
            {selectedAchievement && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                    onClick={() => setSelectedAchievement(null)}
                >
                    <div
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center max-w-sm"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-6xl mb-4">{selectedAchievement.icon}</div>
                        <h3 className="text-xl font-bold text-white mb-2">{selectedAchievement.title}</h3>
                        <p className="text-slate-400 mb-4">{selectedAchievement.description}</p>
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                            <Star size={14} />
                            {selectedAchievement.xp} XP
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { ACHIEVEMENTS, getUnlockedAchievements };
export default AchievementShowcase;
