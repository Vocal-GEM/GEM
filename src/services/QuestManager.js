const QUEST_TYPES = [
    { id: 'time_5', label: 'Practice for 5 minutes', target: 5, type: 'time', xp: 50 },
    { id: 'time_15', label: 'Practice for 15 minutes', target: 15, type: 'time', xp: 150 },
    { id: 'score_100', label: 'Score 100 points in any game', target: 100, type: 'score', xp: 50 },
    { id: 'score_500', label: 'Score 500 points in any game', target: 500, type: 'score', xp: 200 },
    { id: 'journal_1', label: 'Log a Journal Entry', target: 1, type: 'journal', xp: 100 },
    { id: 'coach_1', label: 'Chat with Coach GEM', target: 1, type: 'coach', xp: 50 },
    { id: 'carryover_call', label: 'Use your voice on a phone call', target: 1, type: 'carryover', xp: 200 },
    { id: 'carryover_order', label: 'Order something using your voice', target: 1, type: 'carryover', xp: 200 },
    { id: 'carryover_intro', label: 'Introduce yourself to someone new', target: 1, type: 'carryover', xp: 250 },
    { id: 'hydrate', label: 'Drink 8 glasses of water today', target: 8, type: 'hydration', xp: 50 }
];

export const QuestManager = {
    generateDailyQuests: () => {
        // Pick 3 random quests
        const shuffled = [...QUEST_TYPES].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3).map(q => ({
            ...q,
            current: 0,
            completed: false
        }));
    },

    checkReset: (currentQuests, lastLoginDate) => {
        const now = new Date();
        const last = new Date(lastLoginDate || 0);

        // Reset if different day
        if (now.getDate() !== last.getDate() || now.getMonth() !== last.getMonth()) {
            return QuestManager.generateDailyQuests();
        }
        return currentQuests;
    }
};
