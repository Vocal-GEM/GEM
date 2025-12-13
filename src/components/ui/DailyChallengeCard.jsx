import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle, Star, TrendingUp, Gift } from 'lucide-react';
import { getTodayChallenges, completeChallenge, getXPForNextLevel } from '../../services/DailyChallengeService';

const DailyChallengeCard = () => {
    const [challenges, setChallenges] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [xpData, setXPData] = useState({ current: 0, needed: 100, level: 1, totalXP: 0 });
    const [recentXP, setRecentXP] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const { challenges: todayChallenges, completed: todayCompleted } = getTodayChallenges();
        setChallenges(todayChallenges);
        setCompleted(todayCompleted);
        setXPData(getXPForNextLevel());
    };

    const handleComplete = (challengeId) => {
        const result = completeChallenge(challengeId);
        if (result.success) {
            setRecentXP(result.xpEarned);
            setTimeout(() => setRecentXP(null), 2000);
            loadData();
        }
    };

    const progressPercent = xpData.needed > 0 ? (xpData.current / xpData.needed) * 100 : 0;

    const getCategoryColor = (category) => {
        const colors = {
            pitch: 'from-cyan-500 to-blue-500',
            resonance: 'from-pink-500 to-purple-500',
            breathing: 'from-emerald-500 to-teal-500',
            general: 'from-amber-500 to-orange-500',
            journal: 'from-violet-500 to-purple-500',
            performance: 'from-rose-500 to-pink-500',
            sovte: 'from-blue-500 to-indigo-500',
            relaxation: 'from-green-500 to-emerald-500',
            tonal: 'from-amber-400 to-yellow-500',
            variety: 'from-purple-500 to-pink-500'
        };
        return colors[category] || 'from-slate-500 to-slate-600';
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {/* Header with Level */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                        <Zap className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Daily Challenges</h2>
                        <p className="text-xs text-slate-400">Complete for bonus XP!</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star size={16} fill="currentColor" /> Level {xpData.level}
                    </div>
                    <p className="text-xs text-slate-500">{xpData.totalXP} XP total</p>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress to Level {xpData.level + 1}</span>
                    <span>{Math.round(xpData.current)} / {xpData.needed} XP</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                </div>
            </div>

            {/* XP Popup */}
            {recentXP && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-2xl flex items-center gap-2">
                        <Gift size={24} /> +{recentXP} XP!
                    </div>
                </div>
            )}

            {/* Challenges List */}
            <div className="space-y-3">
                {challenges.map(challenge => {
                    const isComplete = completed.includes(challenge.id);

                    return (
                        <div
                            key={challenge.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isComplete
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer'
                                }`}
                            onClick={() => !isComplete && handleComplete(challenge.id)}
                        >
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${getCategoryColor(challenge.category)}`}>
                                {isComplete ? (
                                    <CheckCircle className="text-white" size={20} />
                                ) : (
                                    <TrendingUp className="text-white" size={20} />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className={`font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                                    {challenge.title}
                                </h3>
                                <p className="text-sm text-slate-400">{challenge.description}</p>
                            </div>

                            <div className={`text-sm font-bold ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {isComplete ? '✓ Done' : `+${challenge.xp} XP`}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* All Complete Message */}
            {completed.length === challenges.length && challenges.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl text-center">
                    <p className="text-emerald-400 font-bold">🎉 All challenges complete!</p>
                    <p className="text-sm text-slate-400">Come back tomorrow for new challenges</p>
                </div>
            )}
        </div>
    );
};

export default DailyChallengeCard;
