import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceProfile } from '../../context/VoiceProfileContext';
import VoiceTwinMatcher from '../../services/VoiceTwinMatcher';

const VoiceTwinDiscovery = () => {
    const { profile, loading } = useVoiceProfile();
    const [optIn, setOptIn] = useState(false);
    const [selectedTwin, setSelectedTwin] = useState(null);

    const matches = useMemo(() => {
        if (!profile || !optIn || loading) return [];
        return VoiceTwinMatcher.findMatches(profile);
    }, [profile, optIn, loading]);

    if (loading || !profile) return null;

    if (!optIn) {
        return (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-4xl mb-3">👯</div>
                <h3 className="text-xl font-bold text-white mb-2">Find Your Voice Twin</h3>
                <p className="text-gray-400 mb-6 text-sm">
                    Connect with others who started where you are and share your goals.
                    See their progress for inspiration!
                </p>

                <div className="bg-purple-900/20 rounded-lg p-3 text-xs text-purple-300 mb-4 border border-purple-500/30">
                    🔒 Privacy First: We only match based on generic metrics (pitch range, goals).
                    No personal info or recordings are shared without explicit consent.
                </div>

                <button
                    onClick={() => setOptIn(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/20"
                >
                    Enable Finding Matches
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>👯</span> Voice Twins
                </h3>
                <button
                    onClick={() => setOptIn(false)}
                    className="text-xs text-gray-500 hover:text-white"
                >
                    Disable
                </button>
            </div>

            <div className="space-y-3">
                {matches.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        Searching for matches...
                    </div>
                ) : (
                    matches.map(match => (
                        <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 rounded-lg p-3 border border-gray-700 flex items-center justify-between group cursor-pointer hover:border-purple-500 transition-colors"
                            onClick={() => setSelectedTwin(selectedTwin === match.id ? null : match.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-2xl bg-gray-800 rounded-full p-2 w-10 h-10 flex items-center justify-center">
                                    {match.avatar}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-200">{match.nickname}</div>
                                    <div className="text-xs text-gray-500">
                                        {(match.matchScore * 100).toFixed(0)}% Match • {match.monthsPracticing}mo exp
                                    </div>
                                </div>
                            </div>

                            <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                &rarr;
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {selectedTwin && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-purple-500/30">
                            <h4 className="font-bold text-white mb-2">Why you match:</h4>
                            <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                                <li>Starting pitch range simliar (~5Hz diff)</li>
                                <li>Both aiming for {profile.goals.voiceType} voice</li>
                                <li>Similar timeline goals</li>
                            </ul>
                            <button className="w-full mt-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-white transition-colors">
                                View Full Journey
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VoiceTwinDiscovery;
