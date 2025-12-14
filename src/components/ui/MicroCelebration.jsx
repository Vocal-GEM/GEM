/**
 * MicroCelebration.jsx
 * 
 * Quick, delightful celebrations for small wins during practice.
 * Shows encouraging messages with visual effects without interrupting flow.
 */

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Star, Heart, Award, Flame, Zap, Music } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

// Celebration messages for different achievement types
const CELEBRATION_MESSAGES = {
    streak: [
        { text: 'Keep it up! 🔥', color: 'orange' },
        { text: 'On fire! 🔥', color: 'orange' },
        { text: 'Hot streak! 🎯', color: 'amber' }
    ],
    pitch: [
        { text: 'Perfect pitch! ✨', color: 'purple' },
        { text: 'Nailed it! 🎯', color: 'violet' },
        { text: 'So in tune! 🎵', color: 'indigo' }
    ],
    resonance: [
        { text: 'Beautiful resonance! ✨', color: 'pink' },
        { text: 'Bright and clear! 💎', color: 'rose' },
        { text: 'Gorgeous tone! 🌟', color: 'fuchsia' }
    ],
    consistency: [
        { text: 'So consistent! 💪', color: 'teal' },
        { text: 'Steady and strong! 🏆', color: 'emerald' },
        { text: 'Rock solid! 💎', color: 'cyan' }
    ],
    milestone: [
        { text: 'Milestone reached! 🎉', color: 'yellow' },
        { text: 'Achievement unlocked! 🏆', color: 'amber' },
        { text: 'You did it! 🌟', color: 'gold' }
    ],
    general: [
        { text: 'Great job! ⭐', color: 'blue' },
        { text: 'Wonderful! ✨', color: 'sky' },
        { text: 'Amazing! 💫', color: 'indigo' }
    ]
};

const ICONS = {
    streak: Flame,
    pitch: Music,
    resonance: Sparkles,
    consistency: Zap,
    milestone: Award,
    general: Star
};

const MicroCelebration = ({ type = 'general', trigger, position = 'center', onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState(null);
    const [particles, setParticles] = useState([]);

    // Generate floating particles
    const createParticles = useCallback(() => {
        const newParticles = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            x: Math.random() * 60 + 20, // 20-80% from left
            delay: Math.random() * 0.3,
            size: Math.random() * 8 + 4,
            duration: Math.random() * 0.5 + 1
        }));
        setParticles(newParticles);
    }, []);

    useEffect(() => {
        if (trigger) {
            // Pick a random message for this type
            const messages = CELEBRATION_MESSAGES[type] || CELEBRATION_MESSAGES.general;
            const selected = messages[Math.floor(Math.random() * messages.length)];
            setMessage(selected);

            createParticles();
            setIsVisible(true);
            triggerHaptic('SUCCESS');

            // Auto-hide after animation
            const timer = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [trigger, type, createParticles, onComplete]);

    if (!isVisible || !message) return null;

    const Icon = ICONS[type] || Star;
    const positionClass = {
        'top': 'top-20',
        'center': 'top-1/2 -translate-y-1/2',
        'bottom': 'bottom-24'
    }[position];

    return (
        <div className={`fixed inset-x-0 ${positionClass} z-50 pointer-events-none flex justify-center`}>
            {/* Floating particles */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className={`absolute bottom-0 w-2 h-2 rounded-full bg-${message.color}-400 animate-float-up`}
                    style={{
                        left: `${p.x}%`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        width: p.size,
                        height: p.size
                    }}
                />
            ))}

            {/* Main celebration banner */}
            <div className={`
                inline-flex items-center gap-3 px-6 py-3 
                bg-gradient-to-r from-${message.color}-500/20 to-${message.color}-600/20 
                backdrop-blur-xl rounded-full border border-${message.color}-500/30
                shadow-lg shadow-${message.color}-500/20
                animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300
            `}>
                <div className={`p-2 rounded-full bg-${message.color}-500/30 animate-pulse`}>
                    <Icon className={`text-${message.color}-400`} size={20} />
                </div>
                <span className={`text-lg font-bold text-${message.color}-200`}>
                    {message.text}
                </span>
            </div>
        </div>
    );
};

/**
 * Hook to manage micro-celebrations
 */
export const useMicroCelebration = () => {
    const [celebration, setCelebration] = useState(null);

    const celebrate = useCallback((type = 'general') => {
        setCelebration({ type, trigger: Date.now() });
    }, []);

    const CelebrationComponent = celebration ? (
        <MicroCelebration
            type={celebration.type}
            trigger={celebration.trigger}
            onComplete={() => setCelebration(null)}
        />
    ) : null;

    return { celebrate, CelebrationComponent };
};

export default MicroCelebration;
