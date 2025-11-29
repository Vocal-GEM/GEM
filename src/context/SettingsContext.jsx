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
        ttsProvider: 'browser', // 'browser' | 'elevenlabs'
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Default Rachel
        tiltTarget: { min: -12, max: -6 }, // Spectral tilt target range

        // Performance Settings
        performanceMode: 'high', // 'low' | 'medium' | 'high'
        visualizationQuality: {
            fpsTarget: 60,
            spectrum: true
        },
        disable3D: false // Safe Mode (2D Fallback)
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

    // Sync performance mode with RenderCoordinator
    useEffect(() => {
        import('../services/RenderCoordinator').then(({ renderCoordinator }) => {
            renderCoordinator.setPerformanceMode(settings.performanceMode);

            // Update quality settings based on mode
            const qualityPresets = {
                low: { fpsTarget: 30, fftSize: 1024, spectrumDetail: 'low' },
                medium: { fpsTarget: 45, fftSize: 2048, spectrumDetail: 'medium' },
                high: { fpsTarget: 60, fftSize: 2048, spectrumDetail: 'high' }
            };

            const newQuality = qualityPresets[settings.performanceMode] || qualityPresets.high;
            if (JSON.stringify(settings.visualizationQuality) !== JSON.stringify(newQuality)) {
                setSettings(prev => ({
                    ...prev,
                    visualizationQuality: newQuality
                }));
            }
        });
    }, [settings.performanceMode]);


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
