import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { indexedDB } from '../services/IndexedDBManager';
import { textToSpeechService } from '../services/TextToSpeechService';
import i18n from '../i18n';
import { getAdaptiveFeedbackController } from '../services/AdaptiveFeedback';
import { HapticFeedback } from '../services/HapticFeedback';
import { getAudioFeedback } from '../services/AudioFeedback';
import { getThemeService } from '../services/FeedbackThemes';

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

        // Feedback Settings
        feedback: {
            sensitivity: 0.5, // 0 to 1
            hapticEnabled: true,
            hapticIntensity: 1.0,
            audioMode: 'tones', // 'tones', 'verbal', 'chimes', 'off'
            audioVolume: 0.5,
            visualTheme: 'orb', // 'orb', 'graph', 'arrow', 'numeric'
            focusMode: { enabled: false, metric: null }
        },

        genderFeedbackMode: 'neutral', // 'default' | 'neutral' | 'off'

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
        },

        // Visualization
        spectrogramColorScheme: 'heatmap', // 'heatmap' | 'magma' | 'viridis' | 'grayscale'

        // --- NEW: Standardized Voice Goals (Tier 1) ---
        pitchTarget: { min: 170, max: 240, habitual: 210 }, // Hz
        resonanceTarget: 1.0, // AU (1.0 = neutral)

        // Audio Processing
        pitchSmoothing: 'medium', // 'off', 'low', 'medium', 'high'
        signalValidation: true,   // Enable/disable signal quality checks

        // Microphone Profile (from Calibration)
        micProfile: {
            qualityScore: 0,
            noiseFloor: -100,
            gateThreshold: 0.005,
            calibratedAt: null
        }
    });


    const [showSettings, setShowSettings] = useState(false);

    // Voice data collection consent (separate from main settings for privacy)
    const [voiceDataConsent, setVoiceDataConsentState] = useState({
        enabled: false,
        anonymousUpload: false,
        localStorageOnly: true,
        includeGenderLabel: false,
        acknowledgedAt: null
    });

    const setVoiceDataConsent = async (consent) => {
        setVoiceDataConsentState(consent);
        await indexedDB.saveSetting('voice_data_consent', consent);
    };

    // Load Settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                await indexedDB.ensureReady();
                const savedSettings = await indexedDB.getSetting('app_settings');
                if (savedSettings) setSettings(prev => ({ ...prev, ...savedSettings }));

                // Load voice data consent separately
                const savedConsent = await indexedDB.getSetting('voice_data_consent');
                if (savedConsent) setVoiceDataConsentState(savedConsent);
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
    }, [settings.performanceMode, settings.visualizationQuality]);

    // Sync feedback settings to services
    useEffect(() => {
        if (!settings.feedback) return;

        // Sync Adaptive Feedback
        const adaptiveController = getAdaptiveFeedbackController();
        // adaptiveController.updateSensitivity(settings.feedback.sensitivity); (Method to be added or handled by getThresholds param)

        // Sync Haptic
        if (!settings.feedback.hapticEnabled) {
            HapticFeedback.disable();
        } else {
            HapticFeedback.enable();
            HapticFeedback.setIntensity(settings.feedback.hapticIntensity);
        }

        // Sync Audio
        const audioFeedback = getAudioFeedback();
        audioFeedback.setMode(settings.feedback.audioMode);
        audioFeedback.setVolume(settings.feedback.audioVolume);

        // Sync Visual Theme
        const themeService = getThemeService();
        if (settings.feedback.visualTheme !== themeService.currentTheme) {
            themeService.setTheme(settings.feedback.visualTheme);
        }

    }, [settings.feedback]);


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

    const value = useMemo(() => ({
        settings,
        updateSettings,
        showSettings,
        setShowSettings,
        voiceDataConsent,
        setVoiceDataConsent
    }), [settings, showSettings, voiceDataConsent]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
