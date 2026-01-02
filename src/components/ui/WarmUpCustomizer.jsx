import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceProfile } from '../../context/VoiceProfileContext';
import WarmUpGenerator from '../../services/WarmUpGenerator';

const WarmUpCustomizer = ({ onStart }) => {
    const { profile, loading } = useVoiceProfile();
    const [duration, setDuration] = useState(5);
    const [focus, setFocus] = useState('general');
    const [energy, setEnergy] = useState('medium');

    const routine = useMemo(() => {
        if (!profile || loading) return null;
        return WarmUpGenerator.generateWarmUp(profile, {
            duration,
            focus,
            energy
        });
    }, [profile, loading, duration, focus, energy]);

    if (loading || !profile) return null;

    return (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🔥</span> Custom Warm-Up
            </h3>

            <div className="space-y-4">
                {/* Duration Slider */}
                <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Duration</span>
                        <span className="text-white font-bold">{duration} min</span>
                    </div>
                    <div className="flex gap-2">
                        {[5, 10, 15, 20].map(m => (
                            <button
                                key={m}
                                onClick={() => setDuration(m)}
                                className={`flex-1 py-1 rounded text-sm transition-colors ${duration === m
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                {m}m
                            </button>
                        ))}
                    </div>
                </div>

                {/* Focus Selection */}
                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Focus Area</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['general', 'pitch', 'resonance', 'breath'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFocus(f)}
                                className={`py-2 px-3 rounded text-sm capitalize text-left transition-all ${focus === f
                                        ? 'bg-orange-600/20 border border-orange-500 text-orange-200'
                                        : 'bg-gray-700 border border-transparent text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                    <div className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">
                        Routine Preview
                    </div>
                    <div className="space-y-2">
                        {routine?.exercises.map((ex, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-300">{idx + 1}. {ex.name}</span>
                                <span className="text-gray-500">{ex.duration}s</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => onStart && onStart(routine)}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-white font-bold shadow-lg hover:shadow-orange-900/20 transition-all hover:scale-[1.02]"
                >
                    Start Warm-Up
                </button>
            </div>
        </div>
    );
};

export default WarmUpCustomizer;
