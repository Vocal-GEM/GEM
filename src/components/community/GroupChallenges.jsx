import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Users, Clock, ArrowRight, Zap } from 'lucide-react';
import CommunityService from '../../services/CommunityService';

const ChallengeCard = ({ challenge, onJoin, joined }) => {
    // Calculate progress percentage
    const progress = Math.min(100, (challenge.total_progress / challenge.goal) * 100) || 0;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy size={64} className="text-yellow-500 transform rotate-12" />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1 block">Weekly Challenge</span>
                    <h3 className="text-xl font-bold text-white mb-1">{challenge.title || challenge.challenge_id}</h3>
                    <p className="text-sm text-slate-400">{challenge.description || "Join the community to reach this goal!"}</p>
                </div>
                <div className="bg-slate-700/50 p-2 rounded-lg text-center min-w-[60px]">
                    <div className="text-xs text-slate-400">Reward</div>
                    <div className="text-yellow-400 font-bold flex items-center justify-center gap-1">
                        <Zap size={12} fill="currentColor" />
                        {challenge.xpReward || 100}XP
                    </div>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Group Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>{challenge.total_progress || 0} / {challenge.goal || 1000}</span>
                        <span className="flex items-center gap-1">
                            <Users size={12} /> {challenge.participant_count || 124} participants
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={12} />
                        <span>Ends in 3 days</span>
                    </div>

                    {joined ? (
                        <button disabled className="bg-green-500/20 text-green-400 border border-green-500/50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                            Joined <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={() => onJoin(challenge.id)}
                            className="bg-white text-slate-900 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-white/10"
                        >
                            Join Challenge
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const GroupChallenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinedIds, setJoinedIds] = useState([]);

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        setLoading(true);
        try {
            const data = await CommunityService.getWeeklyChallenges();
            setChallenges(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (id) => {
        try {
            await CommunityService.joinGroupChallenge(id);
            setJoinedIds([...joinedIds, id]);
            // Optimistically update participant count
            setChallenges(prev => prev.map(c =>
                c.id === id ? { ...c, participant_count: (c.participant_count || 0) + 1 } : c
            ));
        } catch (e) {
            // Fallback for simulation/offline
            setJoinedIds([...joinedIds, id]);
            alert("Joined! (Simulation)");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-semibold text-white">Weekly Group Challenges</h2>
                    <p className="text-sm text-slate-400">Work together with the community to unlock rewards.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-sm text-slate-400">Your Contribution</div>
                    <div className="text-xl font-bold text-white">1,250 XP</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {challenges.map((challenge, idx) => (
                    <ChallengeCard
                        key={challenge.id || idx}
                        challenge={challenge}
                        onJoin={() => handleJoin(challenge.id || idx)}
                        joined={joinedIds.includes(challenge.id || idx)}
                    />
                ))}
            </div>

            {/* Mini Leaderboard for Challenge #1 */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mt-8">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Target size={18} className="text-pink-500" />
                    Top Contributors
                </h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((rank) => (
                        <div key={rank} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                                        rank === 2 ? 'bg-slate-400 text-slate-900' :
                                            'bg-orange-700 text-orange-200'
                                    }`}>
                                    {rank}
                                </div>
                                <span className="text-slate-200 text-sm">User_{9000 + rank}</span>
                            </div>
                            <span className="text-purple-400 font-mono text-sm">{500 - (rank * 45)} pts</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroupChallenges;
