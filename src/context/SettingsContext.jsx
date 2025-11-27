import React, { createContext, useContext, useState, useEffect } from 'react';
import { indexedDB } from '../services/IndexedDBManager';
import { textToSpeechService } from '../services/TextToSpeechService';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        vibration: true,
        tone: false,
        noiseGate: 0.05,
        triggerLowPitch: true,
        triggerDarkRes: true,
        notation: 'hz',
        homeNote: 190,

        theme: 'dark', // 'dark' | 'light'
        ttsProvider: 'elevenlabs', // 'browser' | 'elevenlabs'
        elevenLabsKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
        voiceId: '21m00Tcm4TlvDq8ikWAM' // Default Rachel
    });

    const [showSettings, setShowSettings] = useState(false);

    // Load Settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                await indexedDB.ensureReady();
                const savedSettings = await indexedDB.getSetting('app_settings');
                if (savedSettings) setSettings(prev => ({ ...prev, ...savedSettings }));
            } catch (e) {
                console.error("Failed to load settings:", e);
            }
        };
        loadSettings();
    }, []);

    // Apply Theme
    useEffect(() => {
        if (settings.theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
    }, [settings.theme]);

    // Init TTS
    useEffect(() => {
        textToSpeechService.init(settings);
    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(newSettings);
        indexedDB.saveSetting('app_settings', newSettings);
    };

    const value = React.useMemo(() => ({
        settings,
        updateSettings,
        showSettings,
        setShowSettings
    }), [settings, showSettings]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
