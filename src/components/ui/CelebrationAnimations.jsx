/**
 * CelebrationAnimations.jsx
 * Positive reinforcement animations for vocal achievements
 */

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Star, Trophy, ThumbsUp, Sparkles, TrendingUp } from 'lucide-react';
import { getHapticFeedback } from '../../services/HapticFeedback'; // Import if singleton wrapper exists, or just use HapticFeedback
import HapticFeedback from '../../services/HapticFeedback';
import AudioFeedback, { getAudioFeedback } from '../../services/AudioFeedback';

const CelebrationAnimations = ({
    trigger, // 'target_hit', 'streak', 'milestone', 'level_up'
    type = 'particle', // 'particle', 'confetti', 'popup', 'glow'
    customText = null,
    onComplete
}) => {

    // Trigger animations when prop changes
    useEffect(() => {
        if (!trigger) return;

        // Haptic feedback
        if (trigger === 'milestone' || trigger === 'level_up') {
            HapticFeedback.play('achievement');
            getAudioFeedback().feedbackAchievement();
        } else if (trigger === 'target_hit') {
            HapticFeedback.play('targetHit');
        }

        // Confetti for big achievements
        if (trigger === 'milestone' || trigger === 'level_up' || type === 'confetti') {
            fireConfetti();
        }

        // Auto-dismiss after animation
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [trigger, type, onComplete]);

    const fireConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    };

    // Popup content based on trigger
    const getPopupContent = () => {
        switch (trigger) {
            case 'target_hit':
                return { icon: <Sparkles className="w-6 h-6 text-yellow-400" />, text: customText || "Perfect!" };
            case 'streak':
                return { icon: <TrendingUp className="w-6 h-6 text-green-400" />, text: customText || "On a Roll!" };
            case 'milestone':
                return { icon: <Trophy className="w-8 h-8 text-yellow-500" />, text: customText || "Milestone Reached!" };
            case 'level_up':
                return { icon: <Star className="w-8 h-8 text-purple-500" />, text: customText || "Level Up!" };
            default:
                return { icon: <ThumbsUp className="w-6 h-6 text-blue-400" />, text: customText || "Great Job!" };
        }
    };

    if (!trigger) return null;

    const content = getPopupContent();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
                <div className="flex flex-col items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-xl border border-white/20">
                    <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 0.5 }}
                        className="mb-2"
                    >
                        {content.icon}
                    </motion.div>

                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                        {content.text}
                    </span>

                    {/* Particle burst effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                                animate={{
                                    opacity: 0,
                                    scale: 2,
                                    x: (Math.random() - 0.5) * 100,
                                    y: (Math.random() - 0.5) * 100
                                }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-yellow-400"
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CelebrationAnimations;
