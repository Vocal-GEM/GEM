import { useState, useEffect } from 'react';

export const useAchievements = (stats) => {
    const [unlockedAchievement, setUnlockedAchievement] = useState(null);

    const achievements = [
        { id: 'first_session', title: 'First Steps', description: 'Completed your first practice session.', condition: (s) => s.totalSessions >= 1 },
        { id: 'streak_3', title: 'Consistency is Key', description: 'Practiced for 3 days in a row.', condition: (s) => s.currentStreak >= 3 },
        { id: 'master_10', title: 'Dedicated', description: 'Completed 10 practice sessions.', condition: (s) => s.totalSessions >= 10 },
    ];

    useEffect(() => {
        if (!stats) return;

        const unlocked = JSON.parse(localStorage.getItem('gem_achievements') || '[]');

        for (const achievement of achievements) {
            if (!unlocked.includes(achievement.id) && achievement.condition(stats)) {
                // New achievement unlocked!
                setUnlockedAchievement(achievement);
                unlocked.push(achievement.id);
                localStorage.setItem('gem_achievements', JSON.stringify(unlocked));
                break; // Only show one at a time
            }
        }
    }, [stats]);

    const closeAchievement = () => {
        setUnlockedAchievement(null);
    };

    return {
        unlockedAchievement,
        closeAchievement
    };
};
