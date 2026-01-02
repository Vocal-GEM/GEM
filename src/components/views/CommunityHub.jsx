import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Award, MessageSquare, Shield, Smile } from 'lucide-react';
import CommunityBenchmarks from '../community/CommunityBenchmarks';
import GroupChallenges from '../community/GroupChallenges';
import SuccessStories from '../community/SuccessStories';
import MentorFinder from '../community/MentorFinder';
import CelebrationWall from '../community/CelebrationWall';
import PrivacyManager from '../../services/PrivacyManager';

const CommunityHub = () => {
    const [activeTab, setActiveTab] = useState('benchmarks');

    const tabs = [
        { id: 'benchmarks', label: 'Benchmarks', icon: TrendingUp },
        { id: 'challenges', label: 'Challenges', icon: Award },
        { id: 'stories', label: 'Success Stories', icon: Smile },
        { id: 'mentors', label: 'Mentors', icon: Users },
        { id: 'wall', label: 'Celebration Wall', icon: MessageSquare },
    ];

    const handlePrivacySettings = () => {
        // Navigate to settings or show modal
        // For now, simpler alert/dummy
        alert("Privacy Settings would open here (Tier 6)");
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white p-6 overflow-hidden">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Community Hub
                </h1>
                <p className="text-slate-400">Connect, share, and grow with the Vocal GEM community.</p>
            </header>

            {/* Navigation Tabs */}
            <nav className="flex space-x-2 mb-6 overflow-x-auto pb-2 noscrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${isActive
                                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-transparent'
                                }`}
                        >
                            <Icon size={16} className="mr-2" />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm relative">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTab === 'benchmarks' && <CommunityBenchmarks />}
                        {activeTab === 'challenges' && <GroupChallenges />}
                        {activeTab === 'stories' && <SuccessStories />}
                        {activeTab === 'mentors' && <MentorFinder />}
                        {activeTab === 'wall' && <CelebrationWall />}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <Shield size={12} />
                    <span>Community Guidelines Apply</span>
                </div>
                <button onClick={handlePrivacySettings} className="hover:text-purple-400 transition-colors">Privacy Settings</button>
            </div>
        </div>
    );
};

export default CommunityHub;
