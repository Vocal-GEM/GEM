import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useVoiceProfile } from '../../context/VoiceProfileContext';
import { useNavigation } from '../../context/NavigationContext';

// Mapping internal tool IDs to routes and visual assets
const TOOL_METADATA = {
    'pitch_visualizer': {
        name: 'Pitch Visualizer',
        view: 'practice',
        icon: '📊',
        color: 'from-blue-500 to-cyan-500',
        description: 'Real-time pitch tracking'
    },
    'spectrogram': {
        name: 'Spectrogram',
        view: 'analysis',
        icon: '🌈',
        color: 'from-purple-500 to-pink-500',
        description: 'See your voice resonance'
    },
    'analysis': {
        name: 'Voice Analysis',
        view: 'analysis',
        icon: '📈',
        color: 'from-green-500 to-emerald-500',
        description: 'Detailed metrics breakdown'
    },
    'sirens': {
        name: 'Siren Practice',
        view: 'practice',
        icon: '🚑',
        color: 'from-orange-500 to-red-500',
        description: 'Range extension exercise'
    },
    'resonance_orb': {
        name: 'Resonance Orb',
        view: 'practice',
        icon: '🔮',
        color: 'from-indigo-500 to-violet-500',
        description: 'Visual biofeedback'
    }
};

const RecommendedToolsWidget = () => {
    const { profile, recommendations, learningStyle, loading } = useVoiceProfile();
    const { navigate } = useNavigation();

    // Determine recommendations based on profile state
    const recommendedTools = useMemo(() => {
        if (!profile || loading) return [];

        const tools = [];

        // 1. Based on Weak Areas (Mock logic for now, would use ExerciseSelector in full integration)
        const assessment = profile.skillAssessment || {};
        if ((assessment.pitchControl || 0) < 0.6) {
            tools.push('pitch_visualizer');
        }
        if ((assessment.resonanceControl || 0) < 0.6) {
            tools.push('spectrogram');
            tools.push('resonance_orb');
        }

        // 2. Based on Learning Style
        if (learningStyle.style === 'visual') {
            if (!tools.includes('spectrogram')) tools.push('spectrogram');
        }

        // 3. Defaults if empty
        if (tools.length === 0) {
            tools.push('pitch_visualizer');
            tools.push('analysis');
        }

        // Ensure max 3
        return tools.slice(0, 3);
    }, [profile, learningStyle, loading]);

    if (loading || !profile) {
        return <div className=&quot;animate-pulse h-32 bg-gray-800 rounded-xl&quot; />;
    }

    return (
        <div className=&quot;bg-gray-800/50 rounded-xl p-5 border border-gray-700&quot;>
            <div className=&quot;flex justify-between items-center mb-4&quot;>
                <h3 className=&quot;text-lg font-bold text-white flex items-center gap-2&quot;>
                    <span>💡</span> Recommended for You
                </h3>
                <span className=&quot;text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded&quot;>
                    AI Curated
                </span>
            </div>

            <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-3&quot;>
                {recommendedTools.map(toolId => {
                    const tool = TOOL_METADATA[toolId] || TOOL_METADATA['pitch_visualizer'];
                    return (
                        <motion.button
                            key={toolId}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(tool.view)}
                            className=&quot;relative overflow-hidden group rounded-lg p-3 text-left border border-gray-700 bg-gray-900 hover:border-gray-500 transition-all&quot;
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${tool.color} transition-opacity`} />

                            <div className=&quot;relative z-10 flex items-start justify-between&quot;>
                                <span className=&quot;text-2xl mb-2 block&quot;>{tool.icon}</span>
                                <span className=&quot;text-xs text-gray-500&quot;>Go &rarr;</span>
                            </div>

                            <div className=&quot;relative z-10&quot;>
                                <div className=&quot;font-bold text-gray-200 text-sm&quot;>{tool.name}</div>
                                <div className=&quot;text-xs text-gray-500 line-clamp-1&quot;>{tool.description}</div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {recommendations?.rationale && (
                <div className=&quot;mt-4 text-xs text-gray-500 italic border-t border-gray-700 pt-2&quot;>
                    &quot;{recommendations.rationale.split('.')[0]}.&quot;
                </div>
            )}
        </div>
    );
};

export default RecommendedToolsWidget;
