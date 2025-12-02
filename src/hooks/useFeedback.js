import { useState, useEffect, useRef } from 'react';

export const useFeedback = (audioEngineRef, dataRef, config = {}) => {
    const {
        metric = 'pitch', // 'pitch' | 'resonance' | 'weight'
        target = { min: 170, max: 220 }, // Range
        targetFreq = 190, // Default target for tone
    } = config;

    const [settings, setSettings] = useState({
        haptic: false,
        tone: false,
        condition: 'both', // 'high' | 'low' | 'both'
    });

    const lastTriggerRef = useRef(0);

    useEffect(() => {
        const checkFeedback = () => {
            if (!dataRef.current || !audioEngineRef.current) return;

            // Get current value
            const val = dataRef.current[metric];

            // Skip if invalid or silent
            if (!val || val <= 0 || dataRef.current.isSilent) return;

            const now = Date.now();
            if (now - lastTriggerRef.current < 400) return; // Debounce 400ms

            let shouldTrigger = false;
            let isHigh = val > target.max;
            let isLow = val < target.min;

            if (settings.condition === 'high' && isHigh) shouldTrigger = true;
            if (settings.condition === 'low' && isLow) shouldTrigger = true;
            if (settings.condition === 'both' && (isHigh || isLow)) shouldTrigger = true;

            if (shouldTrigger) {
                if (settings.haptic) {
                    // Pattern: Short pulse for high, Long for low? Or just simple pulse.
                    // Let's do simple pulse for now.
                    audioEngineRef.current.triggerVibration([30]);
                }
                if (settings.tone) {
                    // Play tone at target frequency (e.g. the center of the range or specific target)
                    // If targetFreq is provided use it, otherwise use center of range
                    const freqToPlay = targetFreq || ((target.min + target.max) / 2);
                    audioEngineRef.current.playFeedbackTone(freqToPlay);
                }
                lastTriggerRef.current = now;
            }
        };

        // Only run if feedback is enabled
        if (settings.haptic || settings.tone) {
            const interval = setInterval(checkFeedback, 100); // Check every 100ms
            return () => clearInterval(interval);
        }
    }, [settings, metric, target, targetFreq, dataRef, audioEngineRef]);

    return { settings, setSettings };
};
