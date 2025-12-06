/**
 * Haptic Feedback Utility
 * Provides tactile feedback for mobile devices
 */

export const HapticPattern = {
    LIGHT: [10],
    MEDIUM: [20],
    HEAVY: [30],
    SUCCESS: [10, 50, 10],
    ERROR: [50, 100, 50],
    WARNING: [20, 50, 20],
    SELECTION: [5],
    IMPACT: [15]
};

/**
 * Trigger haptic feedback if supported by the device
 * @param {string|number[]} pattern - Predefined pattern name or custom vibration pattern
 */
export const triggerHaptic = (pattern = 'LIGHT') => {
    // Check if vibration API is supported
    if (!('vibrate' in navigator)) {
        return false;
    }

    try {
        // If pattern is a string, use predefined pattern
        const vibrationPattern = typeof pattern === 'string'
            ? HapticPattern[pattern] || HapticPattern.LIGHT
            : pattern;

        navigator.vibrate(vibrationPattern);
        return true;
    } catch (error) {
        console.warn('Haptic feedback failed:', error);
        return false;
    }
};

/**
 * Cancel any ongoing vibration
 */
export const cancelHaptic = () => {
    if ('vibrate' in navigator) {
        navigator.vibrate(0);
    }
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = () => {
    return 'vibrate' in navigator;
};

export default {
    triggerHaptic,
    cancelHaptic,
    isHapticSupported,
    HapticPattern
};
