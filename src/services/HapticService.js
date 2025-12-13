/**
 * HapticService - Provides haptic feedback on supported devices
 */

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = () => {
    return 'vibrate' in navigator;
};

/**
 * Trigger a light haptic tap
 */
export const lightTap = () => {
    if (isHapticSupported()) {
        navigator.vibrate(10);
    }
};

/**
 * Trigger a medium haptic feedback
 */
export const mediumTap = () => {
    if (isHapticSupported()) {
        navigator.vibrate(25);
    }
};

/**
 * Trigger a strong haptic feedback
 */
export const strongTap = () => {
    if (isHapticSupported()) {
        navigator.vibrate(50);
    }
};

/**
 * Trigger success pattern (double tap)
 */
export const successPattern = () => {
    if (isHapticSupported()) {
        navigator.vibrate([30, 50, 30]);
    }
};

/**
 * Trigger error pattern (long buzz)
 */
export const errorPattern = () => {
    if (isHapticSupported()) {
        navigator.vibrate([100, 50, 100]);
    }
};

/**
 * Trigger celebration pattern
 */
export const celebrationPattern = () => {
    if (isHapticSupported()) {
        navigator.vibrate([50, 30, 50, 30, 100]);
    }
};

/**
 * Custom vibration pattern
 */
export const customPattern = (pattern) => {
    if (isHapticSupported() && Array.isArray(pattern)) {
        navigator.vibrate(pattern);
    }
};

export default {
    isHapticSupported,
    lightTap,
    mediumTap,
    strongTap,
    successPattern,
    errorPattern,
    celebrationPattern,
    customPattern
};
