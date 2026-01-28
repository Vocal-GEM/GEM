import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to handle haptic feedback (vibration)
 * @param {boolean} isEnabled - Master switch for vibration
 * @param {number} cooldownMs - Minimum time between vibrations
 * @returns {Object} - { triggerHaptic, isSupported }
 */
export const useHapticFeedback = (isEnabled = true, cooldownMs = 1000) => {
    const lastVibrateRef = useRef(0);
    const isSupported = typeof navigator !== 'undefined' && !!navigator.vibrate;

    const triggerHaptic = useCallback((pattern = 200) => {
        if (!isEnabled || !isSupported) return;

        const now = Date.now();
        if (now - lastVibrateRef.current >= cooldownMs) {
            try {
                navigator.vibrate(pattern);
                lastVibrateRef.current = now;
            } catch (e) {
                console.warn('Haptic feedback failed:', e);
            }
        }
    }, [isEnabled, isSupported, cooldownMs]);

    // Cleanup on unmount (stop vibration)
    useEffect(() => {
        return () => {
            if (isSupported) {
                try {
                    navigator.vibrate(0);
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, [isSupported]);

    return { triggerHaptic, isSupported };
};
