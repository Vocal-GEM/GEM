import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceProfile } from '../../context/VoiceProfileContext';

// Mood options with emojis and internal IDs
const MOODS = [
    { id: 'energetic', emoji: '⚡', label: 'Energetic', color: 'bg-yellow-500' },
    { id: 'focused', emoji: '🎯', label: 'Focused', color: 'bg-blue-500' },
    { id: 'relaxed', emoji: '🌿', label: 'Relaxed', color: 'bg-green-500' },
    { id: 'tired', emoji: '😴', label: 'Tired', color: 'bg-indigo-400' },
    { id: 'frustrated', emoji: '😤', label: 'Frustrated', color: 'bg-red-500' }
];

const MoodCheckIn = () => {
    const { checkInMood, adaptation } = useVoiceProfile();
    const [selectedMood, setSelectedMood] = useState(null);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!selectedMood) return;
        checkInMood(selectedMood, energyLevel);
        setIsSubmitted(true);
    };

    if (isSubmitted && adaptation) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 h-full flex flex-col justify-center text-center"
            >
                <div className="text-3xl mb-3">
                    {MOODS.find(m => m.id === selectedMood)?.emoji}
                </div>
                <h3 className="font-bold text-white mb-1">{adaptation.greeting}</h3>
                <p className="text-sm text-gray-400">
                    Session Goal: <span className="text-purple-400">{adaptation.sessionGoal}</span>
                </p>
            </motion.div>
        );
    }

    return (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🌡️</span> Mood Check
            </h3>

            <div className="space-y-4">
                {/* Mood Selection */}
                <div className="flex justify-between gap-2">
                    {MOODS.map(mood => (
                        <button
                            key={mood.id}
                            onClick={() => setSelectedMood(mood.id)}
                            className={`flex flex-col items-center p-2 rounded-lg transition-all flex-1 ${selectedMood === mood.id
                                    ? 'bg-gray-700 ring-2 ring-purple-500 scale-105'
                                    : 'hover:bg-gray-700/50 opacity-70 hover:opacity-100'
                                }`}
                        >
                            <span className="text-2xl mb-1">{mood.emoji}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">{mood.label}</span>
                        </button>
                    ))}
                </div>

                {/* Energy Slider */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                        <span>Low Energy</span>
                        <span>Energy: {energyLevel}/10</span>
                        <span>High Energy</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!selectedMood}
                    className={`w-full py-2 rounded-lg font-medium transition-all ${selectedMood
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    Start Session
                </button>
            </div>
        </div>
    );
};

export default MoodCheckIn;
