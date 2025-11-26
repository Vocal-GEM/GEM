import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { indexedDB } from '../services/IndexedDBManager';
import { QuestManager } from '../services/QuestManager';
import { syncManager } from '../services/SyncManager';
import { useAuth } from './AuthContext';

const StatsContext = createContext();

export const useStats = () => useContext(StatsContext);

export const StatsProvider = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ streak: 0, totalSeconds: 0, totalPoints: 0, level: 1 });
    const [goals, setGoals] = useState([]);
    const [highScores, setHighScores] = useState({ flappy: 0, river: 0, hopper: 0, stairs: 0 });
    const syncTimerRef = useRef(null);

    // Load Stats
    useEffect(() => {
        const loadStats = async () => {
            try {
                await indexedDB.ensureReady();

                // Stats
                const savedStats = await indexedDB.getStats();
                if (savedStats) setStats(prev => ({ ...prev, ...savedStats }));

                // High Scores
                const savedHighScores = await indexedDB.getSetting('high_scores');
                if (savedHighScores) setHighScores(savedHighScores);

                // Goals
                const savedGoals = await indexedDB.getGoals();
                const lastLogin = await indexedDB.getSetting('last_login', 0);
                const quests = QuestManager.checkReset(savedGoals.length ? savedGoals : [], lastLogin);

                await indexedDB.saveSetting('last_login', Date.now());
                await indexedDB.saveGoals(quests);
                setGoals(quests);

            } catch (e) {
                console.error("Failed to load stats:", e);
            }
        };
        loadStats();
    }, []);

    // Sync Stats
    useEffect(() => {
        if (!user) return;

        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

        syncTimerRef.current = setTimeout(() => {
            syncManager.push('STATS_UPDATE', {
                totalPoints: stats.totalPoints,
                totalSeconds: stats.totalSeconds,
                level: stats.level,
                highScores: highScores
            });
        }, 2000);

        return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
    }, [stats, highScores, user]);

    const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

    const checkLevelUp = (currentStats) => {
        const xp = (currentStats.totalPoints || 0) + Math.floor((currentStats.totalSeconds || 0) / 60 * 10);
        const newLevel = calculateLevel(xp);
        if (newLevel > (currentStats.level || 1)) {
            console.log(`Level Up! ${currentStats.level} -> ${newLevel}`);
            return newLevel;
        }
        return currentStats.level || 1;
    };

    const submitGameResult = (gameId, score) => {
        // 1. Update High Score
        setHighScores(prev => {
            const newScores = { ...prev, [gameId]: Math.max(prev[gameId] || 0, score) };
            indexedDB.saveSetting('high_scores', newScores);
            return newScores;
        });

        // 2. Add to Total Points & Check Level
        setStats(s => {
            const newPoints = (s.totalPoints || 0) + score;
            const newLevel = checkLevelUp({ ...s, totalPoints: newPoints });

            const newS = { ...s, totalPoints: newPoints, level: newLevel };
            indexedDB.saveStats(newS);
            return newS;
        });

        // 3. Update Daily Quests
        setGoals(g => {
            const newG = g.map(q => {
                if (q.type === 'score' && !q.completed) {
                    const newCurrent = Math.max(q.current, score);
                    if (newCurrent >= q.target) {
                        setStats(s => {
                            const newXP = (s.totalPoints || 0) + q.xp;
                            const newLevel = checkLevelUp({ ...s, totalPoints: newXP });
                            const newS = { ...s, totalPoints: newXP, level: newLevel };
                            indexedDB.saveStats(newS);
                            return newS;
                        });
                        return { ...q, current: newCurrent, completed: true };
                    }
                    return { ...q, current: newCurrent };
                }
                return q;
            });
            indexedDB.saveGoals(newG);
            return newG;
        });
    };

    const updatePracticeTime = (secondsToAdd) => {
        setStats(s => {
            const newSeconds = (s.totalSeconds || 0) + secondsToAdd;
            const newLevel = checkLevelUp({ ...s, totalSeconds: newSeconds });
            const newS = { ...s, totalSeconds: newSeconds, level: newLevel };
            indexedDB.saveStats(newS);
            return newS;
        });
    };

    const updateGoalProgress = (type, amount) => {
        setGoals(g => {
            let changed = false;
            const newG = g.map(q => {
                if (q.type === type && !q.completed) {
                    const newCurrent = q.current + amount;
                    if (newCurrent >= q.target) {
                        setStats(s => {
                            const newXP = (s.totalPoints || 0) + q.xp;
                            const newLevel = checkLevelUp({ ...s, totalPoints: newXP });
                            const newS = { ...s, totalPoints: newXP, level: newLevel };
                            indexedDB.saveStats(newS);
                            return newS;
                        });
                        changed = true;
                        return { ...q, current: newCurrent, completed: true };
                    }
                    changed = true;
                    return { ...q, current: newCurrent };
                }
                return q;
            });
            if (changed) indexedDB.saveGoals(newG);
            return newG;
        });
    };

    const value = {
        stats,
        goals,
        highScores,
        submitGameResult,
        updatePracticeTime,
        updateGoalProgress
    };

    return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
};
