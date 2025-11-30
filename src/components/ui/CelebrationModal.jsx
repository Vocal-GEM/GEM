import React, { useEffect } from 'react';
import { Trophy, X, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

const CelebrationModal = ({ achievement, onClose }) => {
    useEffect(() => {
        if (achievement) {
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#14b8a6', '#8b5cf6', '#f59e0b']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#14b8a6', '#8b5cf6', '#f59e0b']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [achievement]);

    if (!achievement) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-8 max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30 animate-bounce">
                    <Trophy size={40} className="text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Achievement Unlocked!</h2>
                <h3 className="text-xl font-bold text-yellow-400 mb-4">{achievement.title}</h3>
                <p className="text-slate-300 mb-6">{achievement.description}</p>

                <div className="flex justify-center gap-1 mb-6">
                    {[...Array(3)].map((_, i) => (
                        <Star key={i} className="text-yellow-500 fill-yellow-500 w-6 h-6 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-lg"
                >
                    Awesome!
                </button>
            </div>
        </div>
    );
};

export default CelebrationModal;
