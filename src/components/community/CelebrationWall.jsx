import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Award, Trophy, Star, Share2 } from 'lucide-react';
import CommunityService from '../../services/CommunityService';
import PrivacyManager from '../../services/PrivacyManager';

const MilestoneCard = ({ milestone, onCheer }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4 hover:border-slate-600 transition-colors"
        >
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ${milestone.type === 'streak' ? 'bg-orange-500' :
                        milestone.type === 'level_up' ? 'bg-purple-500' :
                            'bg-blue-500'
                    }`}>
                    {milestone.type === 'streak' ? <Star size={18} /> :
                        milestone.type === 'level_up' ? <Trophy size={18} /> :
                            <Award size={18} />}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-semibold text-white">{milestone.displayName}</span>
                            <span className="text-slate-400 text-sm ml-2">achieved</span>
                        </div>
                        <span className="text-xs text-slate-500">{milestone.timeAgo}</span>
                    </div>

                    <h4 className="text-purple-300 font-medium mt-1">{milestone.title}</h4>
                    <p className="text-slate-400 text-sm mt-0.5">{milestone.description}</p>

                    <div className="flex items-center gap-4 mt-3">
                        <button
                            onClick={() => onCheer(milestone.id)}
                            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${milestone.cheered ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'
                                }`}
                        >
                            <Heart size={14} fill={milestone.cheered ? "currentColor" : "none"} />
                            {milestone.cheers + (milestone.cheered ? 1 : 0)} Cheers
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const CelebrationWall = () => {
    const [feed, setFeed] = useState([]);

    useEffect(() => {
        // Load simulated feed
        setFeed([
            {
                id: 1,
                displayName: 'VoiceJourney22',
                type: 'level_up',
                title: 'Reached Level 10!',
                description: 'Unlocked Advanced Pitch Exercises',
                timeAgo: '2m ago',
                cheers: 12,
                cheered: false
            },
            {
                id: 2,
                displayName: 'SarahV',
                type: 'streak',
                title: '30 Day Streak',
                description: 'Practiced every day for a month!',
                timeAgo: '15m ago',
                cheers: 45,
                cheered: true
            },
            {
                id: 3,
                displayName: 'Mike_Voice',
                type: 'achievement',
                title: 'Resonance Master',
                description: 'Scored 95% on Brighton exercises',
                timeAgo: '1h ago',
                cheers: 8,
                cheered: false
            }
        ]);
    }, []);

    const handleCheer = (id) => {
        setFeed(prev => prev.map(m =>
            m.id === id ? { ...m, cheered: !m.cheered } : m
        ));
    };

    const handleShareMilestone = () => {
        if (!PrivacyManager.canShare('milestone')) {
            const confirm = window.confirm("Sharing is currently disabled in your privacy settings. Would you like to enable it?");
            if (confirm) {
                // Redirect to settings or toggle
                alert("Please go to Privacy Settings to enable sharing.");
            }
            return;
        }

        // Add optimistic new item
        const newItem = {
            id: Date.now(),
            displayName: 'You',
            type: 'achievement',
            title: 'Shared a Milestone',
            description: 'Just completed a great session!',
            timeAgo: 'Just now',
            cheers: 0,
            cheered: false
        };

        setFeed([newItem, ...feed]);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-white">Celebration Wall</h2>
                    <p className="text-sm text-slate-400">Cheer on your fellow community members!</p>
                </div>
                <button
                    onClick={handleShareMilestone}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                    <Share2 size={16} /> Share Milestone
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                <AnimatePresence initial={false}>
                    {feed.map(item => (
                        <MilestoneCard
                            key={item.id}
                            milestone={item}
                            onCheer={handleCheer}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
                <button className="text-sm text-purple-400 hover:text-purple-300">
                    Load more activity...
                </button>
            </div>
        </div>
    );
};

export default CelebrationWall;
