import React, { createContext, useContext, useState, useEffect } from 'react';
import { indexedDB } from '../services/IndexedDBManager';
import { textToSpeechService } from '../services/TextToSpeechService';
import i18n from '../i18n';

const SettingsContext = createContext(null);

// Export the hook
export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        vibration: true,
        tone: false,
        noiseGate: 0.05,
        triggerLowPitch: true,
        triggerDarkRes: true,
        notation: 'hz',
        homeNote: 190,
        language: 'en', // 'en' | 'es'
        showNorms: true, // Show standardized gender norms on charts

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

        disable3D: false, // Safe Mode (2D Fallback)
        beginnerMode: true, // Default to true for new users
        analyticsEnabled: false, // Privacy by default

        // Dashboard Configuration
        dashboardConfig: {
            showStreak: true,
            showTotalPractice: true,
            showWeeklyActivity: true,
            showProgressTrends: true
        },

        // Audio Settings
        listenMode: false, // Monitor own voice (requires headphones)

        // Accessibility
        accessibility: {
            highContrast: false,
            fontSize: 'normal' // 'normal' | 'large' | 'xl'
        }
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

    // Apply Theme and Accessibility
    useEffect(() => {
        const root = document.documentElement;

        // Theme
        if (settings.theme === 'light') {
            root.classList.add('light-mode');
        } else {
            root.classList.remove('light-mode');
        }

        // High Contrast
        if (settings.accessibility?.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Font Size
        root.classList.remove('font-normal', 'font-large', 'font-xl');
        if (settings.accessibility?.fontSize) {
            root.classList.add(`font-${settings.accessibility.fontSize}`);
        }
    }, [settings.theme, settings.accessibility]);

    // Init TTS
    useEffect(() => {
        textToSpeechService.init(settings);
    }, [settings]);

    // specific effect for language
    useEffect(() => {
        if (settings.language && i18n.language !== settings.language) {
            i18n.changeLanguage(settings.language);
        }
    }, [settings.language]);

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

        // Debounced sync to server
        if (window.syncTimeout) clearTimeout(window.syncTimeout);
        window.syncTimeout = setTimeout(() => {
            import('../services/SyncManager').then(({ syncManager }) => {
                syncManager.push('SETTINGS_UPDATE', newSettings);
            });
        }, 2000);
    };

    const value = React.useMemo(() => ({
        settings,
        updateSettings,
        showSettings,
        setShowSettings
    }), [settings, showSettings]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
