import React, { createContext, useContext, useState, useEffect } from 'react';
import { indexedDB } from '../services/IndexedDBManager';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [voiceProfiles, setVoiceProfiles] = useState([
        {
            id: 'fem',
            name: 'Feminine',
            targetRange: { min: 180, max: 220 },
            genderRange: { min: 180, max: 500 },
            calibration: { dark: 500, bright: 2500 },
            filterSettings: { min: 150, max: 8000 },
            skillLevel: 'beginner',
            goals: ['pitch', 'resonance']
        },
        {
            id: 'masc',
            name: 'Masculine',
            targetRange: { min: 90, max: 140 },
            genderRange: { min: 50, max: 145 },
            calibration: { dark: 400, bright: 1800 },
            filterSettings: { min: 70, max: 8000 },
            skillLevel: 'beginner',
            goals: ['weight', 'resonance']
        },
        {
            id: 'neutral',
            name: 'Neutral',
            targetRange: { min: 150, max: 180 },
            genderRange: { min: 145, max: 180 },
            calibration: { dark: 450, bright: 2200 },
            filterSettings: { min: 100, max: 8000 },
            skillLevel: 'intermediate',
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

    // Onboarding State
    const { user } = useAuth();
    const [onboardingStatus, setOnboardingStatus] = useState({
        tutorial: false,
        compass: false,
        calibration: false
    });

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
                        console.log(`[ProfileContext] Migrated onboarding status for ${userId}`);
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

    const updateOnboardingStatus = async (updates) => {
        setOnboardingStatus(prev => {
            const newStatus = { ...prev, ...updates };
            const userId = user ? user.id : 'guest';
            indexedDB.saveSetting(`onboarding_${userId}`, newStatus);
            return newStatus;
        });
    };

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
        getSessions: indexedDB.getSessions.bind(indexedDB)
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
