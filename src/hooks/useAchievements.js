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
        let newAchievement = null;

        for (const achievement of achievements) {
            if (!unlocked.includes(achievement.id) && achievement.condition(stats)) {
                // New achievement unlocked!
                newAchievement = achievement;
                unlocked.push(achievement.id);
                localStorage.setItem('gem_achievements', JSON.stringify(unlocked));
                break; // Only show one at a time
            }
        }

        if (newAchievement) {
            setUnlockedAchievement(newAchievement);
        }
    }, [stats]); // Missing 'achievements' dependency is expected if it's static, but let's keep it clean.
    // Ideally achievements should be memoized or outside component if static.
    // Since it's inside, we should probably suppress the warning or move it out.
    // But sticking to the fix for setState in effect: logic is fine, it's just triggered by stats change.
    // The previous error was specifically about calling it synchronously?
    // "Calling setState synchronously within an effect body causes cascading renders"
    // It happens because stats might change, triggering effect -> setState -> re-render.
    // This is actually valid use case for effect (syncing state with props/external).
    // However, if stats changes often, this is bad.
    // The fix is usually to not do it if value hasn't changed, but here we only set if unlocked.
    // Maybe checking if (newAchievement && newAchievement !== unlockedAchievement) would help?
    // But we are in a loop.

    const closeAchievement = () => {
        setUnlockedAchievement(null);
    };

    return {
        unlockedAchievement,
        closeAchievement
    };
};
