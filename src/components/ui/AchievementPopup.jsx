import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { gamificationService } from '../../services/GamificationService';

const AchievementPopup = () => {
    const [achievement, setAchievement] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = gamificationService.subscribe((event) => {
            if (event.type === 'ACHIEVEMENT_UNLOCKED') {
                setAchievement(event.achievement);
                setIsVisible(true);

                // Auto hide after 5 seconds
                setTimeout(() => {
                    setIsVisible(false);
                }, 5000);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!isVisible || !achievement) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right fade-in duration-500">
            <div className="bg-slate-900 border border-yellow-500/50 rounded-xl p-4 shadow-2xl shadow-yellow-500/20 max-w-sm relative overflow-hidden">
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shine pointer-events-none"></div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-2xl border border-yellow-500/50">
                        {achievement.icon || '🏆'}
                    </div>
                    <div>
                        <h4 className="text-yellow-400 font-bold text-sm uppercase tracking-wider mb-1">
                            Achievement Unlocked!
                        </h4>
                        <h3 className="text-white font-bold text-lg leading-none mb-1">
                            {achievement.title}
                        </h3>
                        <p className="text-slate-400 text-sm">
                            {achievement.description}
                        </p>
                        <div className="mt-2 text-xs font-mono text-yellow-500/80">
                            +{achievement.xp} XP
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AchievementPopup;
