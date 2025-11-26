import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioEngine } from '../engines/AudioEngine';
import { textToSpeechService } from '../services/TextToSpeechService';
import { syncManager } from '../services/SyncManager';
import { QuestManager } from '../services/QuestManager';
import { indexedDB, STORES } from '../services/IndexedDBManager';

const GemContext = createContext();

export const useGem = () => useContext(GemContext);

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
    const [showVocalHealthTips, setShowVocalHealthTips] = useState(false);
    const [showAssessment, setShowAssessment] = useState(false);
    const [showWarmUp, setShowWarmUp] = useState(false);
    const [showForwardFocus, setShowForwardFocus] = useState(false);

    // Data - Initialize with defaults
    const [voiceProfiles, setVoiceProfiles] = useState([
        {
            id: 'fem',
            name: 'Feminine',
            targetRange: { min: 180, max: 220 },
            genderRange: { min: 180, max: 500 },
            calibration: { dark: 500, bright: 2500 }
        },
        {
            id: 'masc',
            name: 'Masculine',
            targetRange: { min: 90, max: 140 },
            genderRange: { min: 50, max: 145 },
            calibration: { dark: 400, bright: 1800 }
        },
        {
            id: 'neutral',
            name: 'Neutral',
            targetRange: { min: 150, max: 180 },
            genderRange: { min: 145, max: 180 },
            calibration: { dark: 450, bright: 2200 }
        }
    ]);
    const [activeProfile, setActiveProfile] = useState('fem');
    const [targetRange, setTargetRange] = useState({ min: 170, max: 220 });
    const [calibration, setCalibration] = useState({ dark: 500, bright: 2500 });
    const [goals, setGoals] = useState([]);
    const [journals, setJournals] = useState([]);
    const [stats, setStats] = useState({ streak: 0, totalSeconds: 0, totalPoints: 0, level: 1 });
    const [settings, setSettings] = useState({
        vibration: true,
        tone: false,
        noiseGate: 0.02,
        triggerLowPitch: true,
        triggerDarkRes: true,
        notation: 'hz',
        homeNote: 190,
        gamificationEnabled: false,
        theme: 'dark', // 'dark' | 'light'
        ttsProvider: 'elevenlabs', // 'browser' | 'elevenlabs'
        elevenLabsKey: 'sk_d4ebb9d8a3540c49173de9a236f7a1642114d07762414784',
        voiceId: '21m00Tcm4TlvDq8ikWAM' // Default Rachel
    });
    const [highScores, setHighScores] = useState({ flappy: 0, river: 0, hopper: 0, stairs: 0 });

    // SLP Client Management
    const [clients, setClients] = useState([]);
    const [activeClient, setActiveClient] = useState(null);

    const [user, setUser] = useState(null); // { id, username }
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Audio Engine
    const audioEngineRef = useRef(null);
    const dataRef = useRef({ pitch: 0, resonance: 0, f1: 0, f2: 0, weight: 0, history: new Array(100).fill(0), spectrum: new Float32Array(512) });
    const [isAudioActive, setIsAudioActive] = useState(false);
    const practiceTimer = useRef(null);
    const syncTimers = useRef({ stats: null, settings: null });

    // --- Effects ---

    // Apply Theme
    useEffect(() => {
        if (settings.theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
    }, [settings.theme]);

    // Load Data from IndexedDB
    useEffect(() => {
        const loadLocalData = async () => {
            try {
                await indexedDB.ensureReady();

                // Load Settings
                const savedSettings = await indexedDB.getSetting('app_settings');
                if (savedSettings) setSettings(prev => ({ ...prev, ...savedSettings }));

                // Load Profiles
                const profiles = await indexedDB.getProfiles();
                if (profiles.length > 0) setVoiceProfiles(profiles);

                // Load Active Profile
                const savedProfileId = await indexedDB.getSetting('active_profile');
                if (savedProfileId) {
                    setActiveProfile(savedProfileId);
                    const profile = profiles.length > 0 ? profiles.find(p => p.id === savedProfileId) : null;
                    if (profile) {
                        setTargetRange(profile.targetRange);
                        setCalibration(profile.calibration);
                    }
                }

                // Load Stats
                const savedStats = await indexedDB.getStats();
                if (savedStats) setStats(prev => ({ ...prev, ...savedStats }));

                // Load Journals
                const savedJournals = await indexedDB.getJournals();
                if (savedJournals) setJournals(savedJournals);

                // Load High Scores
                const savedHighScores = await indexedDB.getSetting('high_scores');
                if (savedHighScores) setHighScores(savedHighScores);

                // Load User Mode (SLP/User)
                const savedUserMode = await indexedDB.getSetting('user_mode');
                if (savedUserMode) setUserMode(savedUserMode);

                // Load Goals
                const savedGoals = await indexedDB.getGoals();
                const lastLogin = await indexedDB.getSetting('last_login', 0);
                const quests = QuestManager.checkReset(savedGoals.length ? savedGoals : [], lastLogin);

                await indexedDB.saveSetting('last_login', Date.now());
                await indexedDB.saveGoals(quests);
                await indexedDB.saveGoals(quests);
                setGoals(quests);

                // Load Clients (SLP Mode)
                const savedClients = await indexedDB.getClients();
                if (savedClients) setClients(savedClients);

                setIsDataLoaded(true);
            } catch (e) {
                console.error("Failed to load local data:", e);
            }
        };

        loadLocalData();
    }, []);

    // Check Auth & Fetch Remote Data (Sync)
    useEffect(() => {
        const initAuth = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API_URL}/api/me`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                        // Fetch User Data
                        const dataRes = await fetch(`${API_URL}/api/data`);
                        if (dataRes.ok) {
                            const userData = await dataRes.json();
                            // Merge remote data with local if needed, or overwrite
                            // For now, we'll trust local for offline-first, but update if remote is newer?
                            // Simple strategy: If local is empty, use remote.
                            // Or just update stats/journals if they exist
                            if (userData.stats) {
                                setStats(prev => {
                                    const merged = { ...prev, ...userData.stats };
                                    indexedDB.saveStats(merged);
                                    return merged;
                                });
                            }
                            if (userData.journals && userData.journals.length > 0) {
                                // This is tricky without ID matching, but let's assume append or replace
                                // Ideally we'd merge by ID. For now, let's just add unique ones if possible or just rely on local
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Backend not reachable");
            } finally {
                setIsAuthLoading(false);
            }
        };
        initAuth();
    }, []);

    // Refs for callback access (to avoid stale closures)
    const settingsRef = useRef(settings);
    const targetRangeRef = useRef(targetRange);

    useEffect(() => { settingsRef.current = settings; textToSpeechService.init(settings); }, [settings]);
    useEffect(() => { targetRangeRef.current = targetRange; }, [targetRange]);

    // Initialize Audio Engine
    useEffect(() => {
        const isFirstTime = !localStorage.getItem('hasVisited');
        if (isFirstTime) { setShowTutorial(true); localStorage.setItem('hasVisited', 'true'); }

        audioEngineRef.current = new AudioEngine((data) => {
            // Pitch Hold Logic for Continuous Visualization
            const currentHistory = dataRef.current.history;
            let pitchToStore = data.pitch;

            // Track silence duration
            if (!dataRef.current.silenceCounter) dataRef.current.silenceCounter = 0;
            if (!dataRef.current.lastValidPitch) dataRef.current.lastValidPitch = 0;

            if (data.pitch > 0) {
                // Valid pitch detected - reset silence counter
                dataRef.current.silenceCounter = 0;
                dataRef.current.lastValidPitch = data.pitch;
            } else {
                // No pitch detected - increment silence counter
                dataRef.current.silenceCounter++;

                // Hold last valid pitch for up to 15 frames (~250ms at 60fps)
                // This bridges gaps during consonants and brief pauses
                if (dataRef.current.silenceCounter < 15 && dataRef.current.lastValidPitch > 0) {
                    pitchToStore = dataRef.current.lastValidPitch;
                } else {
                    // Silence too long - allow gap
                    pitchToStore = 0;
                }
            }

            dataRef.current = {
                ...data,
                history: [...currentHistory.slice(1), pitchToStore]
            };

            // Biofeedback Triggers
            if (data.pitch > 0) {
                const s = settingsRef.current;
                const t = targetRangeRef.current;

                // Low Pitch Trigger
                if (s.triggerLowPitch && data.pitch < t.min - 5) {
                    if (s.vibration && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
                    if (s.tone) audioEngineRef.current.playFeedbackTone(220); // Low warning tone
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
                        const newSeconds = (s.totalSeconds || 0) + 1;
                        const newLevel = checkLevelUp({ ...s, totalSeconds: newSeconds });

                        const newS = { ...s, totalSeconds: newSeconds, level: newLevel };
                        // Save to DB periodically (every 5s) or on unmount? 
                        // Saving every second might be too much for IDB transaction overhead?
                        // Actually IDB is fast, but let's throttle slightly if needed. 
                        // For now, direct save is fine for single user.
                        indexedDB.saveStats(newS);
                        return newS;
                    });
                    setGoals(g => {
                        let changed = false;
                        const newG = g.map(q => {
                            if (q.type === 'time' && !q.completed) {
                                const newCurrent = q.current + (1 / 60);
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

    // Ensure totalPoints exists in stats
    useEffect(() => {
        if (stats.totalPoints === undefined) {
            setStats(s => ({ ...s, totalPoints: 0 }));
        }
    }, []);

    // --- Data Sync ---
    const syncData = (type, payload) => {
        if (!user) return;
        syncManager.push(type, payload);
    };

    // Sync stats changes (debounced)
    useEffect(() => {
        if (!user || !isDataLoaded) return;

        // Clear existing timer
        if (syncTimers.current.stats) {
            clearTimeout(syncTimers.current.stats);
        }

        // Debounce sync by 2 seconds
        syncTimers.current.stats = setTimeout(() => {
            syncData('STATS_UPDATE', {
                totalPoints: stats.totalPoints,
                totalSeconds: stats.totalSeconds,
                level: stats.level,
                highScores: highScores
            });
        }, 2000);

        return () => {
            if (syncTimers.current.stats) {
                clearTimeout(syncTimers.current.stats);
            }
        };
    }, [stats, highScores, user, isDataLoaded]);

    // Sync settings changes (debounced)
    useEffect(() => {
        if (!user || !isDataLoaded) return;

        // Clear existing timer
        if (syncTimers.current.settings) {
            clearTimeout(syncTimers.current.settings);
        }

        // Debounce sync by 1 second
        syncTimers.current.settings = setTimeout(() => {
            syncData('SETTINGS_UPDATE', settings);
        }, 1000);

        return () => {
            if (syncTimers.current.settings) {
                clearTimeout(syncTimers.current.settings);
            }
        };
    }, [settings, user, isDataLoaded]);

    // --- Gamification Logic ---
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

        // 2. Add to Total Points (Cumulative) & Check Level
        setStats(s => {
            const newPoints = (s.totalPoints || 0) + score;
            const newLevel = checkLevelUp({ ...s, totalPoints: newPoints });

            const newS = { ...s, totalPoints: newPoints, level: newLevel };
            indexedDB.saveStats(newS);
            syncData('stats', newS); // Sync!
            return newS;
        });

        // 3. Update Daily Quests (Score Type)
        setGoals(g => {
            const newG = g.map(q => {
                if (q.type === 'score' && !q.completed) {
                    const newCurrent = Math.max(q.current, score);
                    if (newCurrent >= q.target) {
                        // Quest Completed! Award XP
                        setStats(s => {
                            const newXP = (s.totalPoints || 0) + q.xp; // Add Quest XP to points for now (simplification)
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

    const addJournalEntry = async (entry) => {
        const newEntry = { ...entry, date: new Date().toISOString(), id: Date.now() };
        await indexedDB.saveJournal(newEntry);
        const newJournals = await indexedDB.getJournals();
        setJournals(newJournals);
        setShowJournalForm(false);
        syncData('JOURNAL_ADD', newEntry); // Sync with correct type!
    };

    const updateSettings = (newSettings) => {
        setSettings(newSettings);
        indexedDB.saveSetting('app_settings', newSettings);
    };

    const updateTargetRange = (range) => {
        setTargetRange(range);
        // We save this as part of the active profile usually, or separate setting?
        // Let's save to current profile if possible, or just a setting for now to match previous behavior
        // But better to update the profile in DB
        if (activeProfile) {
            // We need to update the profile in the list and DB
            setVoiceProfiles(prev => {
                const newProfiles = prev.map(p => p.id === activeProfile ? { ...p, targetRange: range } : p);
                // Save all profiles? Or just one. IDB manager has saveProfile.
                // Let's save the specific profile
                const profile = newProfiles.find(p => p.id === activeProfile);
                if (profile) indexedDB.saveProfile(profile);
                return newProfiles;
            });
        }
    };

    const updateCalibration = (dark, bright) => {
        const newCal = { dark, bright };
        setCalibration(newCal);
        if (activeProfile) {
            setVoiceProfiles(prev => {
                const newProfiles = prev.map(p => p.id === activeProfile ? { ...p, calibration: newCal } : p);
                const profile = newProfiles.find(p => p.id === activeProfile);
                if (profile) indexedDB.saveProfile(profile);
                return newProfiles;
            });
        }
    };

    const switchProfile = (profileId) => {
        const profile = voiceProfiles.find(p => p.id === profileId);
        if (profile) {
            setActiveProfile(profileId);
            setTargetRange(profile.targetRange);
            setCalibration(profile.calibration);
            indexedDB.saveSetting('active_profile', profileId);
        }
    };

    // --- Auth Actions ---
    const login = async (username, password) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_URL}/api/login`, {
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
            const API_URL = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_URL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error || 'Signup failed' };
            }
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Network error. Is the backend running?' };
        }
    };

    const logout = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            await fetch(`${API_URL}/api/logout`, { method: 'POST' });
            setUser(null);
        } catch (e) { console.error(e); }
    };

    const updateUserMode = (mode) => {
        setUserMode(mode);
        indexedDB.saveSetting('user_mode', mode);
    };

    // Client Actions
    const addClient = async (clientData) => {
        const newClient = { ...clientData, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        await indexedDB.saveClient(newClient);
        setClients(prev => [...prev, newClient]);
        return newClient;
    };

    const deleteClient = async (clientId) => {
        await indexedDB.deleteClient(clientId);
        setClients(prev => prev.filter(c => c.id !== clientId));
        if (activeClient?.id === clientId) setActiveClient(null);
    };

    const updateClient = async (client) => {
        await indexedDB.saveClient(client);
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
        if (activeClient?.id === client.id) setActiveClient(client);
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
        showVocalHealthTips, setShowVocalHealthTips,
        showAssessment, setShowAssessment,
        showWarmUp, setShowWarmUp,
        showForwardFocus, setShowForwardFocus,
        targetRange,
        calibration,
        voiceProfiles,
        activeProfile,
        goals,
        journals,
        stats,
        highScores,
        settings,
        isAudioActive,
        isDataLoaded,

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
        updateUserMode,
        switchProfile,

        // Auth
        user,
        login,
        signup,
        logout,

        // Client Management
        clients,
        activeClient,
        setActiveClient,
        addClient,
        deleteClient,
        updateClient
    };

    return <GemContext.Provider value={value}>{children}</GemContext.Provider>;
};
