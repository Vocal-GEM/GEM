import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Play } from 'lucide-react';
import { checkStreakStatus } from '../../services/StreakService';
import { useNavigation } from '../../context/NavigationContext';

const PracticeReminderBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [streakData, setStreakData] = useState(null);
    const { navigate } = useNavigation();

    useEffect(() => {
        checkIfShouldShow();
    }, []);

    const checkIfShouldShow = () => {
        const status = checkStreakStatus();
        setStreakData(status);

        // Show if user hasn't practiced today and has an existing streak
        if (status.needsPracticeToday && status.currentStreak > 0) {
            // Check if dismissed today
            const dismissedDate = localStorage.getItem('gem_reminder_dismissed');
            const today = new Date().toISOString().split('T')[0];

            if (dismissedDate !== today) {
                setIsVisible(true);
            }
        }
    };

    const handleDismiss = () => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('gem_reminder_dismissed', today);
        setIsVisible(false);
    };

    const handleStartPractice = () => {
        navigate('practice');
        setIsVisible(false);
    };

    if (!isVisible || !streakData) return null;

    return (
        <div className="fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:max-w-md z-40 animate-in slide-in-from-bottom duration-300">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-xl flex-shrink-0">
                        <AlertCircle className="text-white" size={24} />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">
                            Don't break your {streakData.currentStreak}-day streak! 🔥
                        </h3>
                        <p className="text-white/80 text-sm mb-3">
                            You haven't practiced today. A quick session will keep your momentum going.
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleStartPractice}
                                className="px-4 py-2 bg-white text-orange-600 font-bold text-sm rounded-lg flex items-center gap-1 hover:bg-white/90 transition-colors"
                            >
                                <Play size={14} /> Practice Now
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 bg-white/20 text-white font-medium text-sm rounded-lg hover:bg-white/30 transition-colors"
                            >
                                Later
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="text-white/60 hover:text-white p-1"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PracticeReminderBanner;
