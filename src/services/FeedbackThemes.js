/**
 * FeedbackThemes.js
 * Theme configurations for visual feedback components
 */

export const FEEDBACK_THEMES = {
    ORB: 'orb',
    GRAPH: 'graph',
    ARROW: 'arrow',
    NUMERIC: 'numeric'
};

export const themeConfigs = {
    [FEEDBACK_THEMES.ORB]: {
        name: 'Resonance Orb',
        description: 'Organic visualization of voice quality',
        components: {
            useParticles: true,
            useGlow: true,
            showTrails: true,
            minimalUI: true
        },
        colors: {
            perfect: '#10B981', // Emerald 500
            good: '#34D399',    // Emerald 400
            warning: '#F59E0B', // Amber 500
            error: '#EF4444',   // Red 500
            neutral: '#3B82F6'  // Blue 500
        }
    },

    [FEEDBACK_THEMES.GRAPH]: {
        name: 'Analysis Graph',
        description: 'Detailed real-time data plotting',
        components: {
            showGrid: true,
            showTargetLines: true,
            showHistory: true,
            showValues: true
        },
        layout: {
            height: 200,
            showLabels: true
        }
    },

    [FEEDBACK_THEMES.ARROW]: {
        name: 'Directional',
        description: 'Simple up/down guidance',
        components: {
            showLargeArrows: true,
            showProportionalSize: true,
            highContrast: true
        },
        animations: {
            pulse: true,
            slide: true
        }
    },

    [FEEDBACK_THEMES.NUMERIC]: {
        name: 'Data Focus',
        description: 'High-visibility numeric display',
        components: {
            largeNumbers: true,
            colorCoded: true,
            showTargetDiff: true
        },
        typography: {
            size: 'large',
            weight: 'bold'
        }
    }
};

export class FeedbackThemeService {
    constructor() {
        this.currentTheme = FEEDBACK_THEMES.ORB;
        this.preferences = {};
        this.listeners = [];

        this.loadPreferences();
    }

    /**
     * Set current theme
     */
    setTheme(themeId) {
        if (!themeConfigs[themeId]) return;

        this.currentTheme = themeId;
        this.savePreferences();
        this.notifyListeners();
    }

    /**
     * Get current theme config
     */
    getConfig() {
        return {
            id: this.currentTheme,
            ...themeConfigs[this.currentTheme]
        };
    }

    /**
     * Subscribe to theme changes
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify listeners
     */
    notifyListeners() {
        const config = this.getConfig();
        this.listeners.forEach(cb => cb(config));
    }

    /**
     * Save preferences
     */
    savePreferences() {
        try {
            localStorage.setItem('feedbackTheme', this.currentTheme);
        } catch (e) {
            console.warn('Failed to save theme prefs:', e);
        }
    }

    /**
     * Load preferences
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('feedbackTheme');
            if (saved && themeConfigs[saved]) {
                this.currentTheme = saved;
            }
        } catch (e) {
            console.warn('Failed to load theme prefs:', e);
        }
    }
}

// Singleton
let instance = null;

export const getThemeService = () => {
    if (!instance) {
        instance = new FeedbackThemeService();
    }
    return instance;
};

export default FeedbackThemeService;
