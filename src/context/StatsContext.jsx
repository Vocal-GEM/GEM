import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { indexedDB } from '../services/IndexedDBManager';
import { syncManager } from '../services/SyncManager';
import { useAuth } from './AuthContext';

const StatsContext = createContext();

export const useStats = () => useContext(StatsContext);

export const StatsProvider = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalSeconds: 0 });
    const syncTimerRef = useRef(null);

    // Load Stats
    useEffect(() => {
        const loadStats = async () => {
            try {
                await indexedDB.ensureReady();

                // Stats
                const savedStats = await indexedDB.getStats();
                if (savedStats) setStats(prev => ({ ...prev, ...savedStats }));

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
                totalSeconds: stats.totalSeconds
            });
        }, 2000);

        return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
    }, [stats, user]);



    const updatePracticeTime = (secondsToAdd) => {
        setStats(s => {
            const newSeconds = (s.totalSeconds || 0) + secondsToAdd;
            const newS = { ...s, totalSeconds: newSeconds };
            indexedDB.saveStats(newS);
            return newS;
        });
    };



    const value = {
        stats,
        updatePracticeTime
    };

    return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
};
