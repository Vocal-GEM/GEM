import { useState, useEffect, useCallback } from 'react';

const COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#10b981'];

const Confetti = ({ trigger, duration = 3000, particleCount = 100 }) => {
    const [particles, setParticles] = useState([]);
    const [isActive, setIsActive] = useState(false);

    const createParticle = useCallback((index) => {
        return {
            id: `${Date.now()}-${index}`,
            x: Math.random() * 100,
            y: -10,
            rotation: Math.random() * 360,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 8 + 4,
            speedX: (Math.random() - 0.5) * 4,
            speedY: Math.random() * 3 + 2,
            rotationSpeed: (Math.random() - 0.5) * 10,
            opacity: 1,
            shape: Math.random() > 0.5 ? 'circle' : 'square'
        };
    }, []);

    useEffect(() => {
        if (trigger && !isActive) {
            setIsActive(true);

            // Create initial particles
            const newParticles = Array.from({ length: particleCount }, (_, i) => createParticle(i));
            setParticles(newParticles);

            // Clear after duration
            setTimeout(() => {
                setIsActive(false);
                setParticles([]);
            }, duration);
        }
    }, [trigger, isActive, particleCount, duration, createParticle]);

    // Animation loop
    useEffect(() => {
        if (!isActive || particles.length === 0) return;

        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                x: p.x + p.speedX * 0.5,
                y: p.y + p.speedY,
                rotation: p.rotation + p.rotationSpeed,
                opacity: Math.max(0, p.opacity - 0.01)
            })).filter(p => p.y < 110 && p.opacity > 0));
        }, 16);

        return () => clearInterval(interval);
    }, [isActive, particles.length]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className={p.shape === 'circle' ? 'rounded-full' : ''}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        transform: `rotate(${p.rotation}deg)`,
                        opacity: p.opacity,
                        transition: 'none'
                    }}
                />
            ))}
        </div>
    );
};

// Higher-order component to add confetti to any component
export const withConfetti = (WrappedComponent) => {
    return function WithConfettiComponent(props) {
        const [showConfetti, setShowConfetti] = useState(false);

        const triggerConfetti = () => {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 100);
        };

        return (
            <>
                <Confetti trigger={showConfetti} />
                <WrappedComponent {...props} triggerConfetti={triggerConfetti} />
            </>
        );
    };
};

import { setGlobalConfettiTrigger } from '../../utils/ConfettiUtils';

export default Confetti;
