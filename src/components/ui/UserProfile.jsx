import React, { useState, useEffect } from 'react';
import { X, LogOut, Trophy, Flame, Clock, Star, Lock, Award } from 'lucide-react';
import { gamificationService, ACHIEVEMENTS } from '../../services/GamificationService';
import { indexedDB } from '../../services/IndexedDBManager';
import { useSettings } from '../../context/SettingsContext';

const UserProfile = ({ user, onClose, onLogout }) => {
    const { settings } = useSettings();
    const [gamificationStats, setGamificationStats] = useState({
        xp: 0,
        level: { level: 1, xp: 0, title: 'Novice' },
        streak: 0,
        lastPractice: null,
        achievements: []
    });
    const [totalSeconds, setTotalSeconds] = useState(0);

    useEffect(() => {
        const loadStats = async () => {
            const stats = await gamificationService.getStats();
            setGamificationStats(stats);

            // Get totalSeconds from IndexedDB directly
            const dbStats = await indexedDB.getStats();
            setTotalSeconds(dbStats.totalSeconds || 0);
        };
        loadStats();

        // Subscribe to gamification updates
        const unsubscribe = gamificationService.subscribe((event) => {
            loadStats(); // Reload stats on any gamification event
        });

        return unsubscribe;
    }, []);

    const getNextLevel = () => {
        return gamificationService.getNextLevel(gamificationStats.xp);
    };

    const getProgressToNextLevel = () => {
        const current = gamificationStats.level;
        const next = getNextLevel();
        if (current.level === next.level) return 100; // Max level
        const progress = ((gamificationStats.xp - current.xp) / (next.xp - current.xp)) * 100;
        return Math.min(100, Math.max(0, progress));
    };

    const formatPracticeTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const isAchievementUnlocked = (achievementId) => {
        return gamificationStats.achievements.includes(achievementId);
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md p-6 border-b border-white/5 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-white">Profile</h2>
                    <button onClick={onClose} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Account Info Section */}
                    <section className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="text-3xl">👤</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white">{user.username}</h3>
                                <p className="text-sm text-slate-400">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full p-4 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded-xl text-left flex items-center gap-3 transition-colors"
                        >
                            <LogOut className="w-5 h-5 text-red-400" />
                            <span className="text-sm font-bold text-red-200">Log Out</span>
                        </button>
                    </section>

                    {/* Gamification Stats Section */}
                    {/* Gamification Stats Section */}
                    {settings.gamificationEnabled ? (
                        <section className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                Your Progress
                            </h3>

                            {/* Level & XP */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <span className="text-3xl font-bold text-white">Level {gamificationStats.level.level}</span>
                                        <span className="ml-3 text-sm text-purple-400 font-bold">{gamificationStats.level.title}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-400">XP</div>
                                        <div className="text-xl font-bold text-white">{gamificationStats.xp}</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-violet-500 rounded-full transition-all duration-500"
                                        style={{ width: `${getProgressToNextLevel()}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>{gamificationStats.level.xp} XP</span>
                                    <span>{getNextLevel().xp} XP</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                                    <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-white">{gamificationStats.streak}</div>
                                    <div className="text-xs text-slate-400 uppercase">Day Streak</div>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-white">{formatPracticeTime(totalSeconds)}</div>
                                    <div className="text-xs text-slate-400 uppercase">Practice Time</div>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                                    <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-white">{gamificationStats.achievements.length}</div>
                                    <div className="text-xs text-slate-400 uppercase">Achievements</div>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Usage Stats
                            </h3>
                            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
                                <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">{formatPracticeTime(totalSeconds)}</div>
                                <div className="text-xs text-slate-400 uppercase">Total Practice Time</div>
                            </div>
                        </section>
                    )}

                    {/* Achievements Section - Only show if gamification is enabled */}
                    {settings.gamificationEnabled && (
                        <section className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Achievements
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ACHIEVEMENTS.map(achievement => {
                                    const unlocked = isAchievementUnlocked(achievement.id);
                                    return (
                                        <div
                                            key={achievement.id}
                                            className={`p-4 rounded-xl border transition-all ${unlocked
                                                ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30'
                                                : 'bg-slate-900/50 border-slate-700 opacity-60'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`text-3xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
                                                    {unlocked ? achievement.icon : <Lock className="w-8 h-8 text-slate-600" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`font-bold text-sm ${unlocked ? 'text-yellow-400' : 'text-slate-500'}`}>
                                                            {achievement.title}
                                                        </h4>
                                                        {unlocked && <span className="text-xs text-yellow-600 bg-yellow-400/10 px-2 py-0.5 rounded">+{achievement.xp} XP</span>}
                                                    </div>
                                                    <p className={`text-xs ${unlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                                                        {achievement.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
