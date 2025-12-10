/**
 * StackingLayers.js - Layer definitions for Progressive Stacking Practice
 * 
 * Layers are ordered from foundational (pitch) to advanced (volume control).
 * Each layer builds on the previous, requiring the user to maintain mastery
 * of earlier layers while learning new ones.
 */

export const STACKING_LAYERS = [
    {
        id: 'pitch',
        name: 'Pitch Control',
        description: 'Find and sustain your target pitch',
        icon: 'Music', // Lucide icon name
        color: '#2dd4bf', // Teal
        metric: 'pitch',
        targetType: 'range', // 'range' | 'exploration' | 'exact'
        defaultTarget: { min: 170, max: 220 }, // Hz, will be overridden by user calibration
        tolerance: 15, // Hz tolerance for "on target"
        masteryHoldTime: 3000, // ms to sustain for mastery
        explorationPrompt: null, // First layer, no exploration needed
        instruction: 'Find and hold your target pitch. Watch the meter and stay in the green zone.',
        tips: [
            'Start with a comfortable "hmm" sound',
            'Gradually slide up or down to find the target',
            'Focus on relaxed, steady breath support'
        ]
    },
    {
        id: 'resonance',
        name: 'Resonance Brightness',
        description: 'Shift your resonance from dark to bright',
        icon: 'Sun', // Lucide icon name
        color: '#a78bfa', // Purple
        metric: 'f2', // F2 frequency indicates frontness/brightness
        targetType: 'exploration', // Must explore range before locking
        explorationRange: {
            dark: 1200,  // Low F2 = back/dark resonance
            bright: 2800 // High F2 = front/bright resonance
        },
        lockTarget: 2400, // Where to "lock" after exploration (bright-ish)
        tolerance: 200, // Hz tolerance for F2
        masteryHoldTime: 2500, // ms
        explorationPrompt: 'While holding your pitch, explore from dark (back resonance) to bright (front resonance).',
        instruction: 'Maintain your pitch. Now shift resonance from dark "oo" to bright "ee" and back.',
        tips: [
            'Think of moving sound forward in your mouth',
            'Smiling slightly raises F2 (brighter)',
            'Keep throat relaxed as you shift'
        ]
    },
    {
        id: 'breathiness',
        name: 'Phonation Control',
        description: 'Control breathiness vs. pressed voice quality',
        icon: 'Wind', // Lucide icon name  
        color: '#f472b6', // Pink
        metric: 'tilt', // Spectral tilt
        targetType: 'exploration',
        explorationRange: {
            pressed: -6,   // dB/octave - pressed/strained
            breathy: -20   // dB/octave - very breathy
        },
        lockTarget: -12, // Healthy flow phonation target
        tolerance: 3, // dB tolerance
        masteryHoldTime: 2500, // ms
        explorationPrompt: 'While holding pitch and resonance, explore from pressed to breathy voice.',
        instruction: 'Maintain pitch + resonance. Vary your breathiness from pressed to airy, then find the sweet spot.',
        tips: [
            'Pressed = tight, effortful (avoid this normally)',
            'Breathy = airy, whisper-like (tiring long-term)',
            'Flow phonation = balanced, easy airflow'
        ]
    },
    {
        id: 'volume',
        name: 'Dynamic Control',
        description: 'Control loudness while maintaining all other parameters',
        icon: 'Volume2', // Lucide icon name
        color: '#fbbf24', // Amber
        metric: 'volume',
        targetType: 'exploration',
        explorationRange: {
            soft: 0.15,  // Relative volume level
            loud: 0.85
        },
        lockTarget: 0.5, // Medium volume
        tolerance: 0.1,
        masteryHoldTime: 2000, // ms
        explorationPrompt: 'While holding everything steady, explore soft to loud dynamics.',
        instruction: 'Maintain all controls. Smoothly vary volume from whisper-soft to projection-loud.',
        tips: [
            'Keep all other parameters stable as you change volume',
            'Louder should not mean more pressed',
            'Softer should not mean breathier'
        ]
    }
];

/**
 * Layer state types for tracking progress
 */
export const LAYER_STATUS = {
    LOCKED: 'locked',       // Not yet unlocked
    ACTIVE: 'active',       // Currently being practiced
    EXPLORING: 'exploring', // In exploration phase
    HOLDING: 'holding',     // Holding target, building mastery
    MASTERED: 'mastered',   // Successfully mastered
    LOST: 'lost'            // Fell out of target range
};

/**
 * Default session configuration
 */
export const DEFAULT_SESSION_CONFIG = {
    showTips: true,
    autoAdvance: true,        // Automatically advance to next layer on mastery
    celebrationDuration: 1500, // ms to show celebration before advancing
    requireExplorationCoverage: 0.7, // % of range to cover before lock-in allowed
    lostGracePeriod: 500,     // ms before layer is marked as "lost"
};

export default STACKING_LAYERS;
