/**
 * AccessibilityService - Manages accessibility settings
 */

const STORAGE_KEY = 'gem_accessibility';

const DEFAULT_SETTINGS = {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderMode: false,
    fontSize: 100 // percentage
};

/**
 * Get accessibility settings
 */
export const getAccessibilitySettings = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('AccessibilityService: Failed to load', e);
    }
    return { ...DEFAULT_SETTINGS };
};

/**
 * Save accessibility settings
 */
export const saveAccessibilitySettings = (settings) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        applyAccessibilitySettings(settings);
    } catch (e) {
        console.error('AccessibilityService: Failed to save', e);
    }
};

/**
 * Apply settings to document
 */
export const applyAccessibilitySettings = (settings) => {
    const root = document.documentElement;

    // High Contrast Mode
    if (settings.highContrast) {
        root.classList.add('high-contrast');
    } else {
        root.classList.remove('high-contrast');
    }

    // Large Text Mode
    if (settings.largeText) {
        root.classList.add('large-text');
    } else {
        root.classList.remove('large-text');
    }

    // Reduced Motion
    if (settings.reducedMotion) {
        root.classList.add('reduced-motion');
    } else {
        root.classList.remove('reduced-motion');
    }

    // Font Size
    root.style.setProperty('--accessibility-font-scale', `${settings.fontSize / 100}`);
};

/**
 * Toggle specific setting
 */
export const toggleSetting = (settingName) => {
    const settings = getAccessibilitySettings();
    if (typeof settings[settingName] === 'boolean') {
        settings[settingName] = !settings[settingName];
        saveAccessibilitySettings(settings);
    }
    return settings;
};

/**
 * Update font size
 */
export const updateFontSize = (percentage) => {
    const settings = getAccessibilitySettings();
    settings.fontSize = Math.max(75, Math.min(150, percentage));
    saveAccessibilitySettings(settings);
    return settings;
};

/**
 * Initialize on app load
 */
export const initializeAccessibility = () => {
    const settings = getAccessibilitySettings();
    applyAccessibilitySettings(settings);

    // Check system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (!settings.reducedMotion) {
            settings.reducedMotion = true;
            saveAccessibilitySettings(settings);
        }
    }
};

export default {
    getAccessibilitySettings,
    saveAccessibilitySettings,
    applyAccessibilitySettings,
    toggleSetting,
    updateFontSize,
    initializeAccessibility,
    DEFAULT_SETTINGS
};
