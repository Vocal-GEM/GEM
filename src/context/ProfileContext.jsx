import React, { createContext, useContext, useState, useEffect } from 'react';
import { indexedDB } from '../services/IndexedDBManager';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
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
    const [showCalibration, setShowCalibration] = useState(false);

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

    const value = {
        voiceProfiles,
        activeProfile,
        targetRange,
        calibration,
        showCalibration,
        setShowCalibration,
        updateTargetRange,
        updateCalibration,
        switchProfile
    };

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
