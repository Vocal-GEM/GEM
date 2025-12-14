import { useState, useEffect } from 'react';

/**
 * GlowPulse - Subtle celebration effect with pulsing glow
 * More elegant alternative to confetti
 */
const GlowPulse = ({ trigger, duration = 2000, color = 'teal' }) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger && !isActive) {
            setIsActive(true);
            setTimeout(() => setIsActive(false), duration);
        }
    }, [trigger, duration, isActive]);

    const colorMap = {
        teal: 'rgba(20, 184, 166, 0.4)',
        purple: 'rgba(139, 92, 246, 0.4)',
        pink: 'rgba(236, 72, 153, 0.4)',
        blue: 'rgba(59, 130, 246, 0.4)',
        amber: 'rgba(245, 158, 11, 0.4)',
        emerald: 'rgba(16, 185, 129, 0.4)'
    };

    const glowColor = colorMap[color] || colorMap.teal;

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            {/* Radial glow from center */}
            <div
                className="absolute inset-0 animate-pulse-glow-celebration"
                style={{
                    background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`
                }}
            />

            {/* Edge glow effect */}
            <div
                className="absolute inset-0 animate-edge-glow"
                style={{
                    boxShadow: `inset 0 0 100px 20px ${glowColor}`
                }}
            />
        </div>
    );
};

// Global trigger system
let globalGlowTrigger = null;

export const setGlobalGlowTrigger = (trigger) => {
    globalGlowTrigger = trigger;
};

export const triggerGlobalGlow = (color = 'teal') => {
    if (globalGlowTrigger) {
        globalGlowTrigger(color);
    }
};

/**
 * GlowPulseProvider - Wrap your app to enable global glow celebrations
 */
export const GlowPulseProvider = ({ children }) => {
    const [showGlow, setShowGlow] = useState(false);
    const [color, setColor] = useState('teal');

    useEffect(() => {
        setGlobalGlowTrigger((newColor) => {
            setColor(newColor || 'teal');
            setShowGlow(true);
            setTimeout(() => setShowGlow(false), 100);
        });

        return () => setGlobalGlowTrigger(null);
    }, []);

    return (
        <>
            <GlowPulse trigger={showGlow} color={color} />
            {children}
        </>
    );
};

/**
 * Hook for using glow celebration
 */
export const useGlowCelebration = () => {
    const celebrate = (color = 'teal') => {
        triggerGlobalGlow(color);
    };

    return { celebrate };
};

export default GlowPulse;
