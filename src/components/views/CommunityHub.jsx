import React, { useState, useEffect } from 'react';
import { Users, Trophy, Medal, Star, Share2, Settings, ChevronRight } from 'lucide-react';
import {
    getPublicProfile,
    updatePublicProfile,
    getWeeklyChallenges,
    getLeaderboard
} from '../../services/CommunityService';
import { getXPForNextLevel } from '../../services/DailyChallengeService';

const CommunityHub = () => {
    const [profile, setProfile] = useState(getPublicProfile());
    const [challenges, setChallenges] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState('leaderboard');
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        setChallenges(getWeeklyChallenges());
        setLeaderboard(getLeaderboard());
    }, []);

    const handleProfileUpdate = (key, value) => {
        const updated = updatePublicProfile({ [key]: value });
        setProfile(updated);
    };

    const xpData = getXPForNextLevel();

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
                    <p className="text-slate-400">Connect and compete with others</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Profile Settings */}
            {showSettings && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 animate-in slide-in-from-top">
                    <h2 className="text-lg font-bold text-white mb-4">Public Profile</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Display Name</label>
                            <input
                                value={profile.displayName}
                                onChange={(e) => handleProfileUpdate('displayName', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                placeholder="Anonymous"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-white">Share Progress</div>
                                <div className="text-sm text-slate-400">Let others see your milestones</div>
                            </div>
                            <button
                                onClick={() => handleProfileUpdate('shareProgress', !profile.shareProgress)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${profile.shareProgress ? 'bg-blue-600' : 'bg-slate-600'
                                    }`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.shareProgress ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {['leaderboard', 'challenges'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Leaderboard */}
            {activeTab === 'leaderboard' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Trophy className="text-amber-400" size={24} />
                        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
                    </div>

                    <div className="space-y-2">
                        {leaderboard.map((user, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${user.isYou
                                        ? 'bg-blue-600/20 border border-blue-500/30'
                                        : 'bg-slate-800/50 hover:bg-slate-800'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? 'bg-amber-500 text-black' :
                                        user.rank === 2 ? 'bg-slate-400 text-black' :
                                            user.rank === 3 ? 'bg-amber-700 text-white' :
                                                'bg-slate-700 text-slate-300'
                                    }`}>
                                    {user.rank}
                                </div>

                                <div className="flex-1">
                                    <div className="font-bold text-white flex items-center gap-2">
                                        {user.displayName}
                                        {user.isYou && <span className="text-xs text-blue-400">(You)</span>}
                                    </div>
                                    <div className="text-sm text-slate-400">Level {user.level}</div>
                                </div>

                                <div className="text-right">
                                    <div className="font-bold text-amber-400">{user.xp.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500">XP</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Challenges */}
            {activeTab === 'challenges' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Medal className="text-purple-400" size={24} />
                        <h2 className="text-xl font-bold text-white">Weekly Challenges</h2>
                    </div>

                    <div className="space-y-4">
                        {challenges.map((challenge, idx) => (
                            <div
                                key={idx}
                                className="bg-gradient-to-r from-purple-900/30 to-slate-900 border border-purple-500/20 rounded-xl p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{challenge.title}</h3>
                                        <p className="text-slate-400">{challenge.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-purple-400">+{challenge.xpReward}</div>
                                        <div className="text-xs text-slate-500">XP</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-sm text-slate-500 mt-4">
                        Week {challenges[0]?.weekNumber} • Resets Sunday
                    </p>
                </div>
            )}
        </div>
    );
};

export default CommunityHub;
