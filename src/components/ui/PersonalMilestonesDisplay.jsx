import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceProfile } from '../../context/VoiceProfileContext';
import PersonalMilestonesService from '../../services/PersonalMilestonesService';

const PersonalMilestonesDisplay = () => {
    const { profile, loading } = useVoiceProfile();

    const milestones = useMemo(() => {
        if (!profile || loading) return [];

        // Generate potential milestones based on profile
        const allMilestones = PersonalMilestonesService.generateMilestones(profile);

        // In a real app, we'd filter by completion status stored in profile
        // For now, mock some progress visualization
        return allMilestones.slice(0, 3);
    }, [profile, loading]);

    if (loading || !profile) return null;
    if (milestones.length === 0) return null;

    return (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🏆</span> Next Milestones
            </h3>

            <div className="space-y-4">
                {milestones.map((ms, index) => (
                    <div key={ms.id} className="relative">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-medium text-gray-200">{ms.title}</span>
                            <span className="text-xs text-purple-400 font-bold">{ms.reward}</span>
                        </div>

                        {/* Progress Bar (Mocked to 30-70% for visual demo) */}
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${30 + (index * 20)}%` }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            />
                        </div>

                        <p className="text-xs text-gray-500 mt-1">{ms.description}</p>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 text-xs text-gray-400 hover:text-white transition-colors">
                View All Achievements &rarr;
            </button>
        </div>
    );
};

export default PersonalMilestonesDisplay;
