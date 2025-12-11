import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { indexedDB } from '../services/IndexedDBManager';
import { useAuth } from './AuthContext';

export const ProfileContext = createContext();

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

export const ProfileProvider = ({ children }) => {
    // --- State ---
    const [voiceProfiles, setVoiceProfiles] = useState([
        {
            id: 'fem',
            name: 'Feminization',
            targetRange: { min: 170, max: 220 },
            calibration: { dark: 500, bright: 2500 },
            skillLevel: 'beginner',
            goals: ['control', 'flexibility']
        }
    ]);
    const [activeProfile, setActiveProfile] = useState('fem');
    const [targetRange, setTargetRange] = useState({ min: 170, max: 220 });
    const [calibration, setCalibration] = useState({ dark: 500, bright: 2500 });
    const [calibrationMetadata, setCalibrationMetadata] = useState({
        lastCalibrated: null,
        noiseFloor: -100,
        rms: 0
    });
    const [filterSettings, setFilterSettings] = useState({ min: 80, max: 8000 });
    const [skillLevel, setSkillLevel] = useState('beginner');
    const [goals, setGoals] = useState([]);
    const [showCalibration, setShowCalibration] = useState(false);

    // Vocal Health State
    const [vocalHealth, setVocalHealth] = useState({
        hydration: { current: 0, goal: 8, lastUpdated: Date.now() },
        fatigue: { level: 1, note: '', lastUpdated: Date.now() },
        usage: { dailyLimitMinutes: 30, todaySeconds: 0, lastUpdated: Date.now() }
    });

    // Onboarding State
    const { user } = useAuth();
    const [onboardingStatus, setOnboardingStatus] = useState({
        tutorial: false,
        compass: false,
        calibration: false
    });

    // --- Effects ---

    // Load Onboarding Status
    useEffect(() => {
        const loadOnboarding = async () => {
            try {
                await indexedDB.ensureReady();
                const userId = user ? user.id : 'guest';
                const key = `onboarding_${userId}`;

                let status = await indexedDB.getSetting(key);

                // Migration from localStorage (only for guest or first time)
                if (!status) {
                    const lsTutorial = localStorage.getItem('gem_tutorial_seen') === 'true';
                    const lsCompass = localStorage.getItem('gem_compass_seen') === 'true';
                    const lsCalibration = localStorage.getItem('gem_calibration_done') === 'true';

                    if (lsTutorial || lsCompass || lsCalibration) {
                        status = {
                            tutorial: lsTutorial,
                            compass: lsCompass,
                            calibration: lsCalibration
                        };
                        await indexedDB.saveSetting(key, status);
                    } else {
                        status = { tutorial: false, compass: false, calibration: false };
                    }
                }

                setOnboardingStatus(status);
            } catch (e) {
                console.error("Failed to load onboarding status:", e);
            }
        };
        loadOnboarding();
    }, [user]);

    // Load Profiles & Active Profile
    useEffect(() => {
        const loadProfiles = async () => {
            try {
                await indexedDB.ensureReady();

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
                        if (profile.calibrationMetadata) setCalibrationMetadata(profile.calibrationMetadata);
                        if (profile.filterSettings) setFilterSettings(profile.filterSettings);
                        if (profile.skillLevel) setSkillLevel(profile.skillLevel);
                        if (profile.goals) setGoals(profile.goals);
                    }
                }
            } catch (e) {
                console.error("Failed to load profiles:", e);
            }
        };
        loadProfiles();
    }, []);

    // Load Vocal Health from active profile
    useEffect(() => {
        if (activeProfile) {
            const profile = voiceProfiles.find(p => p.id === activeProfile);
            if (profile && profile.vocalHealth) {
                // Check if it's a new day to reset daily counters
                const lastDate = new Date(profile.vocalHealth.hydration.lastUpdated).getDate();
                const today = new Date().getDate();

                if (lastDate !== today) {
                    setVocalHealth({
                        hydration: { ...profile.vocalHealth.hydration, current: 0, lastUpdated: Date.now() },
                        fatigue: { ...profile.vocalHealth.fatigue, lastUpdated: Date.now() },
                        usage: { ...profile.vocalHealth.usage, todaySeconds: 0, lastUpdated: Date.now() }
                    });
                } else {
                    setVocalHealth(profile.vocalHealth);
                }
            }
        }
    }, [activeProfile, voiceProfiles]);

    // --- Actions ---

    const updateOnboardingStatus = async (updates) => {
        setOnboardingStatus(prev => {
            const newStatus = { ...prev, ...updates };
            const userId = user ? user.id : 'guest';
            indexedDB.saveSetting(`onboarding_${userId}`, newStatus);
            return newStatus;
        });
    };

    const updateTargetRange = (range) => {
        setTargetRange(range);
        if (activeProfile) {
            setVoiceProfiles(prev => {
                const newProfiles = prev.map(p => p.id === activeProfile ? { ...p, targetRange: range } : p);
                const profile = newProfiles.find(p => p.id === activeProfile);
                if (profile) indexedDB.saveProfile(profile);
                return newProfiles;
            });
        }
    };

    const updateCalibration = (dark, bright, metadata = {}) => {
        const newCal = { dark, bright };
        setCalibration(newCal);

        const newMetadata = {
            lastCalibrated: Date.now(),
            ...metadata
        };
        setCalibrationMetadata(newMetadata);

        if (activeProfile) {
            setVoiceProfiles(prev => {
                const newProfiles = prev.map(p => p.id === activeProfile ? {
                    ...p,
                    calibration: newCal,
                    calibrationMetadata: newMetadata
                } : p);
                const profile = newProfiles.find(p => p.id === activeProfile);
                if (profile) indexedDB.saveProfile(profile);
                return newProfiles;
            });
        }
    };

    const updateFilterSettings = (min, max) => {
        const newSettings = { min, max };
        setFilterSettings(newSettings);
        if (activeProfile) {
            setVoiceProfiles(prev => {
                const newProfiles = prev.map(p => p.id === activeProfile ? { ...p, filterSettings: newSettings } : p);
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
            if (profile.calibrationMetadata) setCalibrationMetadata(profile.calibrationMetadata);
            if (profile.filterSettings) setFilterSettings(profile.filterSettings);
            if (profile.skillLevel) setSkillLevel(profile.skillLevel);
            if (profile.goals) setGoals(profile.goals);
            indexedDB.saveSetting('active_profile', profileId);
        }
    };

    const updateVocalHealth = (updates) => {
        setVocalHealth(prev => {
            const newState = { ...prev, ...updates };
            // Persist to profile
            if (activeProfile) {
                setVoiceProfiles(profiles => {
                    const newProfiles = profiles.map(p => p.id === activeProfile ? { ...p, vocalHealth: newState } : p);
                    const profile = newProfiles.find(p => p.id === activeProfile);
                    if (profile) indexedDB.saveProfile(profile);
                    return newProfiles;
                });
            }
            return newState;
        });
    };

    const updateHydration = (amount) => {
        updateVocalHealth({
            hydration: {
                ...vocalHealth.hydration,
                current: Math.max(0, vocalHealth.hydration.current + amount),
                lastUpdated: Date.now()
            }
        });
    };

    const logFatigue = (level, note = '') => {
        updateVocalHealth({
            fatigue: {
                level,
                note,
                lastUpdated: Date.now()
            }
        });
    };

    const updateUsage = (seconds) => {
        updateVocalHealth({
            usage: {
                ...vocalHealth.usage,
                todaySeconds: vocalHealth.usage.todaySeconds + seconds,
                lastUpdated: Date.now()
            }
        });
    };

    const value = {
        voiceProfiles,
        activeProfile,
        targetRange,
        calibration,
        calibrationMetadata,
        filterSettings,
        skillLevel,
        goals,
        showCalibration,
        setShowCalibration,
        updateTargetRange,
        updateCalibration,
        updateFilterSettings,
        switchProfile,
        onboardingStatus,
        updateOnboardingStatus,
        saveSession: indexedDB.saveSession.bind(indexedDB),
        getSessions: indexedDB.getSessions.bind(indexedDB),
        vocalHealth,
        updateHydration,
        logFatigue,
        updateUsage
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
