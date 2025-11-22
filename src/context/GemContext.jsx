import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioEngine } from '../engines/AudioEngine';

const GemContext = createContext();

export const useGem = () => useContext(GemContext);

// Storage Utility
const Storage = {
    save: (key, data) => { localStorage.setItem(key, JSON.stringify(data)); },
    load: (key, def) => { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; },
    addJournal: (entry) => { const j = Storage.load('journals', []); j.push(entry); Storage.save('journals', j); return j; }
};

export const GemProvider = ({ children }) => {
    // --- State ---
    const [activeTab, setActiveTab] = useState('practice');
    const [userMode, setUserMode] = useState('user'); // 'user' or 'slp'
    const [incognito, setIncognito] = useState(false);

    // Wizards & Modals
    const [showSettings, setShowSettings] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showCompass, setShowCompass] = useState(false);
    const [showCalibration, setShowCalibration] = useState(false);
    const [showJournalForm, setShowJournalForm] = useState(false);

    // Data
    const [targetRange, setTargetRange] = useState(Storage.load('targetRange', { min: 170, max: 220 }));
    const [calibration, setCalibration] = useState(Storage.load('calibration', { dark: 500, bright: 2500 }));
    const [goals, setGoals] = useState(Storage.load('goals', [
        { id: 'time', label: 'Practice Time (min)', target: 15, current: 0 },
        { id: 'score', label: 'Game Score', target: 500, current: 0 }
    ]));
    const [journals, setJournals] = useState(Storage.load('journals', []));
    const [stats, setStats] = useState(Storage.load('stats', { streak: 0, totalSeconds: 0 }));
    const [settings, setSettings] = useState(Storage.load('settings', { vibration: true, tone: false, noiseGate: 0.02, triggerLowPitch: true, triggerDarkRes: true }));

    const [user, setUser] = useState(null); // { id, username }
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Audio Engine
    const audioEngineRef = useRef(null);
    const dataRef = useRef({ pitch: 0, resonance: 0, f1: 0, f2: 0, weight: 0, history: new Array(100).fill(0), spectrum: new Float32Array(512) });
    const [isAudioActive, setIsAudioActive] = useState(false);
    const practiceTimer = useRef(null);

    // --- Effects ---

    // Check Auth & Fetch Data
    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch('/api/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                        // Fetch User Data
                        const dataRes = await fetch('/api/data');
                        if (dataRes.ok) {
                            const userData = await dataRes.json();
                            if (userData.stats) setStats(prev => ({ ...prev, ...userData.stats }));
                            if (userData.journals && userData.journals.length > 0) setJournals(userData.journals);
                        }
                    }
                }
            } catch (e) {
                console.warn("Backend not reachable");
            } finally {
                setIsAuthLoading(false);
            }
        };
        init();
    }, []);

    // Refs for callback access (to avoid stale closures)
    const settingsRef = useRef(settings);
    const targetRangeRef = useRef(targetRange);

    useEffect(() => { settingsRef.current = settings; }, [settings]);
    useEffect(() => { targetRangeRef.current = targetRange; }, [targetRange]);

    // Initialize Audio Engine
    useEffect(() => {
        const isFirstTime = !localStorage.getItem('hasVisited');
        if (isFirstTime) { setShowTutorial(true); localStorage.setItem('hasVisited', 'true'); }

        audioEngineRef.current = new AudioEngine((data) => {
            dataRef.current = { ...data, history: [...dataRef.current.history.slice(1), data.pitch] };

            // Biofeedback Triggers
            if (data.pitch > 0) {
                const s = settingsRef.current;
                const t = targetRangeRef.current;

                // Low Pitch Trigger
                if (s.triggerLowPitch && data.pitch < t.min - 5) {
                    if (s.vibration && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
                    if (s.tone) audioEngineRef.current.playFeedbackTone(220); // Low warning tone
                }

                // High Pitch Trigger (if configured, though user said "no pitch too high unless mickey mouse")
                if (data.pitch > t.max + 50) { // Way over
                    // Maybe warn?
                }
            }
        });
        audioEngineRef.current.setNoiseGate(settings.noiseGate);

        return () => { if (audioEngineRef.current) audioEngineRef.current.stop(); };
    }, []);

    // Update Noise Gate when settings change
    useEffect(() => {
        if (audioEngineRef.current) audioEngineRef.current.setNoiseGate(settings.noiseGate);
    }, [settings.noiseGate]);

    // Practice Timer
    useEffect(() => {
        if (activeTab === 'practice' || activeTab === 'games') {
            practiceTimer.current = setInterval(() => {
                if (audioEngineRef.current && audioEngineRef.current.isActive) {
                    setStats(s => {
                        const newS = { ...s, totalSeconds: s.totalSeconds + 1 };
                        Storage.save('stats', newS);
                        return newS;
                    });
                    setGoals(g => {
                        const newG = g.map(x => x.id === 'time' ? { ...x, current: x.current + (1 / 60) } : x);
                        Storage.save('goals', newG);
                        return newG;
                    });
                }
            }, 1000);
        }
        return () => clearInterval(practiceTimer.current);
    }, [activeTab]);

    // --- Actions ---

    const toggleAudio = async () => {
        if (!audioEngineRef.current) return;
        if (audioEngineRef.current.isActive) {
            audioEngineRef.current.stop();
            setIsAudioActive(false);
        } else {
            await audioEngineRef.current.start();
            setIsAudioActive(true);
        }
    };

    const [highScores, setHighScores] = useState(Storage.load('highScores', { flappy: 0, river: 0, hopper: 0, stairs: 0 }));

    // Ensure totalPoints exists in stats
    useEffect(() => {
        if (stats.totalPoints === undefined) {
            setStats(s => ({ ...s, totalPoints: 0 }));
        }
    }, []);

    // --- Data Sync ---
    const syncData = async (type, payload) => {
        if (!user) return;
        try {
            const body = {};
            if (type === 'stats') body.stats = payload;
            if (type === 'journal') body.journals = [payload]; // Send single entry

            await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch (e) { console.error("Sync failed", e); }
    };

    const submitGameResult = (gameId, score) => {
        // 1. Update High Score
        setHighScores(prev => {
            const newScores = { ...prev, [gameId]: Math.max(prev[gameId] || 0, score) };
            Storage.save('highScores', newScores);
            return newScores;
        });

        // 2. Add to Total Points (Cumulative)
        setStats(s => {
            const newS = { ...s, totalPoints: (s.totalPoints || 0) + score };
            Storage.save('stats', newS);
            syncData('stats', newS); // Sync!
            return newS;
        });

        // 3. Update Daily Goal
        setGoals(g => {
            const newG = g.map(x => x.id === 'score' ? { ...x, current: Math.max(x.current, score) } : x);
            Storage.save('goals', newG);
            return newG;
        });
    };

    const addJournalEntry = (entry) => {
        const newEntry = { ...entry, date: new Date().toISOString() };
        const newJournals = Storage.addJournal(newEntry);
        setJournals(newJournals);
        setShowJournalForm(false);
        syncData('journal', newEntry); // Sync!
    };

    const updateSettings = (newSettings) => {
        setSettings(newSettings);
        Storage.save('settings', newSettings);
    };

    const updateTargetRange = (range) => {
        setTargetRange(range);
        Storage.save('targetRange', range);
    };

    const updateCalibration = (dark, bright) => {
        const newCal = { dark, bright };
        setCalibration(newCal);
        Storage.save('calibration', newCal);
    };

    // --- Auth Actions ---
    const login = async (username, password) => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    };

    const signup = async (username, password) => {
        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    };

    const logout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            setUser(null);
        } catch (e) { console.error(e); }
    };

    const value = {
        // State
        activeTab, setActiveTab,
        userMode, setUserMode,
        incognito, setIncognito,
        showSettings, setShowSettings,
        showTutorial, setShowTutorial,
        showCompass, setShowCompass,
        showCalibration, setShowCalibration,
        showJournalForm, setShowJournalForm,
        targetRange,
        calibration,
        goals,
        journals,
        stats,
        highScores,
        settings,
        isAudioActive,

        // Refs
        audioEngineRef,
        dataRef,

        // Actions
        toggleAudio,
        submitGameResult,
        addJournalEntry,
        updateSettings,
        updateTargetRange,
        updateCalibration,

        // Auth
        user,
        login,
        signup,
        logout
    };

    return <GemContext.Provider value={value}>{children}</GemContext.Provider>;
};
