/**
 * Feature Flags Configuration
 * 
 * Toggle features on/off by setting true/false.
 * Start with minimal features enabled, then progressively enable more.
 * 
 * To enable a feature: change `false` to `true` and save.
 * Hot reload will apply changes immediately.
 */

export const FEATURES = {
    // ═══════════════════════════════════════════════════════════
    // CORE FEATURES (Minimal App)
    // ═══════════════════════════════════════════════════════════
    dashboard: true,
    practice: true,
    settings: true,

    // ═══════════════════════════════════════════════════════════
    // ANALYSIS & ANALYTICS
    // ═══════════════════════════════════════════════════════════
    analysis: false,
    analytics: false,

    // ═══════════════════════════════════════════════════════════
    // CONTENT & LEARNING
    // ═══════════════════════════════════════════════════════════
    library: false,
    glossary: false,
    journal: true,
    history: true,
    progress: false,
    program: false,
    learn: false,

    // ═══════════════════════════════════════════════════════════
    // PROFESSIONAL TOOLS
    // ═══════════════════════════════════════════════════════════
    assessment: false,
    capev: false,
    'client-dashboard': false,
    spectrogram: false,

    // ═══════════════════════════════════════════════════════════
    // MODALS & OVERLAYS
    // ═══════════════════════════════════════════════════════════
    camera: true,
    adaptiveSession: false,
    guidedJourney: false,
    practiceCards: false,
};

/**
 * Helper to check if a feature is enabled
 * @param {string} featureId - The feature ID to check
 * @returns {boolean} - Whether the feature is enabled
 */
export const isFeatureEnabled = (featureId) => {
    return FEATURES[featureId] === true;
};
