/**
 * VoiceCharacteristics.js
 * 
 * Defines different voice "characters" or styles users can explore.
 * Each character has acoustic targets and practice exercises.
 */

export const VOICE_CHARACTERISTICS = [
    {
        id: 'warm',
        name: 'Warm',
        emoji: '☕',
        color: 'from-amber-500 to-orange-600',
        description: 'A cozy, comforting voice that puts people at ease. Think of a trusted friend or a therapist.',
        acousticTargets: {
            resonanceBrightness: { min: 55, max: 70, label: 'Moderate-Dark' },
            pitchVariation: { min: 20, max: 40, label: 'Gentle curves' },
            onsetType: 'soft',
            paceWPM: { min: 120, max: 140 },
            weight: { min: 40, max: 55, label: 'Light-Moderate' }
        },
        keyTraits: [
            'Soft onsets (no hard attacks)',
            'Gentle pitch curves',
            'Slightly lower resonance',
            'Slower, deliberate pacing',
            'Relaxed breathiness'
        ],
        examplePhrases: [
            "I understand how you're feeling.",
            "Take your time, there's no rush.",
            "Let's work through this together.",
            "That sounds really challenging."
        ],
        exercises: [
            {
                id: 'warm-1',
                title: 'Soft "Mmm-hmm" Agreement',
                instructions: 'Practice saying "Mmm-hmm" as if agreeing with a friend. Keep it soft and low in your register.',
                duration: 30
            },
            {
                id: 'warm-2',
                title: 'Lullaby Pacing',
                instructions: 'Read a phrase slowly, imagining you\'re soothing a child to sleep. No urgency.',
                duration: 60
            },
            {
                id: 'warm-3',
                title: 'Gentle Onset Vowels',
                instructions: 'Start each vowel with a soft "h" sound: "haa", "hee", "hoo". Avoid any clicks or pops.',
                duration: 45
            }
        ]
    },
    {
        id: 'bubbly',
        name: 'Bubbly',
        emoji: '✨',
        color: 'from-pink-500 to-rose-500',
        description: 'An energetic, cheerful voice full of enthusiasm. Think of a barista greeting you or an excited friend.',
        acousticTargets: {
            resonanceBrightness: { min: 70, max: 85, label: 'Bright' },
            pitchVariation: { min: 50, max: 80, label: 'Expressive range' },
            onsetType: 'coordinated',
            paceWPM: { min: 150, max: 180 },
            weight: { min: 30, max: 45, label: 'Light' }
        },
        keyTraits: [
            'Higher pitch variability',
            'Upward inflections',
            'Forward, bright resonance',
            'Faster pacing',
            'Animated emphasis'
        ],
        examplePhrases: [
            "Oh my gosh, that's so exciting!",
            "I can't wait to tell you about this!",
            "This is going to be amazing!",
            "Hi! How are you today?"
        ],
        exercises: [
            {
                id: 'bubbly-1',
                title: 'Excited Greetings',
                instructions: 'Say "Hi!" as if you just saw your best friend unexpectedly. Let pitch rise at the end.',
                duration: 30
            },
            {
                id: 'bubbly-2',
                title: 'Question Lifts',
                instructions: 'End every sentence like it\'s a question with an upward pitch sweep. Even statements!',
                duration: 45
            },
            {
                id: 'bubbly-3',
                title: 'Word Emphasis Dance',
                instructions: 'Pick random words in a sentence to emphasize by raising pitch. "I LOVE this!" vs "I love THIS!"',
                duration: 60
            }
        ]
    },
    {
        id: 'professional',
        name: 'Professional',
        emoji: '💼',
        color: 'from-slate-500 to-blue-600',
        description: 'A clear, authoritative voice that commands respect. Think of a news anchor or confident presenter.',
        acousticTargets: {
            resonanceBrightness: { min: 50, max: 65, label: 'Balanced' },
            pitchVariation: { min: 25, max: 45, label: 'Controlled' },
            onsetType: 'coordinated',
            paceWPM: { min: 130, max: 150 },
            weight: { min: 45, max: 55, label: 'Moderate' }
        },
        keyTraits: [
            'Clear articulation',
            'Downward (authoritative) inflections',
            'Controlled pitch range',
            'Moderate pacing',
            'Crisp consonants'
        ],
        examplePhrases: [
            "Let me explain the key points.",
            "The data clearly indicates...",
            "I'd like to draw your attention to...",
            "In conclusion, we can see that..."
        ],
        exercises: [
            {
                id: 'prof-1',
                title: 'Newscaster Read',
                instructions: 'Read headlines as if you\'re a news anchor. Clear, measured, and authoritative.',
                duration: 60
            },
            {
                id: 'prof-2',
                title: 'Statement Drops',
                instructions: 'End sentences with a downward pitch. Practice: "The meeting is at three." (drop on "three")',
                duration: 45
            },
            {
                id: 'prof-3',
                title: 'Consonant Crispness',
                instructions: 'Over-articulate T, K, P, and S sounds. "The TOP TEN TechniqueS for PresenTaTion."',
                duration: 45
            }
        ]
    },
    {
        id: 'playful',
        name: 'Playful',
        emoji: '🎭',
        color: 'from-purple-500 to-fuchsia-500',
        description: 'A teasing, mischievous voice full of personality. Think of flirting or joking with friends.',
        acousticTargets: {
            resonanceBrightness: { min: 60, max: 80, label: 'Varied' },
            pitchVariation: { min: 60, max: 90, label: 'Highly expressive' },
            onsetType: 'varied',
            paceWPM: { min: 130, max: 160 },
            weight: { min: 25, max: 45, label: 'Light-Varied' }
        },
        keyTraits: [
            'Dramatic pitch swings',
            'Playful pauses',
            'Breathy asides',
            'Exaggerated emphasis',
            'Lilting rhythm'
        ],
        examplePhrases: [
            "Oh reaaally? Tell me more...",
            "I *might* know something about that.",
            "Wouldn't you like to know?",
            "Guess what I found out!"
        ],
        exercises: [
            {
                id: 'play-1',
                title: 'Dramatic Pauses',
                instructions: 'Say a sentence with a long pause before the key word: "And then... she said... YES!"',
                duration: 45
            },
            {
                id: 'play-2',
                title: 'Breathy Aside',
                instructions: 'Practice whispering a word conspiratorially mid-sentence, then returning to normal.',
                duration: 45
            },
            {
                id: 'play-3',
                title: 'Word Stretching',
                instructions: 'Stretch key words playfully: "That\'s soooo interesting!" or "Reeeally?"',
                duration: 30
            }
        ]
    },
    {
        id: 'confident',
        name: 'Confident',
        emoji: '💪',
        color: 'from-emerald-500 to-teal-600',
        description: 'A self-assured, grounded voice. Think of someone who knows their worth and speaks with certainty.',
        acousticTargets: {
            resonanceBrightness: { min: 50, max: 70, label: 'Grounded' },
            pitchVariation: { min: 30, max: 50, label: 'Steady' },
            onsetType: 'coordinated',
            paceWPM: { min: 120, max: 145 },
            weight: { min: 45, max: 60, label: 'Moderate-Full' }
        },
        keyTraits: [
            'Steady pitch baseline',
            'No uptalk (avoiding question inflections)',
            'Solid breath support',
            'Deliberate pauses',
            'Grounded resonance'
        ],
        examplePhrases: [
            "I know what I'm talking about.",
            "This is the right decision.",
            "I stand by my work.",
            "Let me be clear about this."
        ],
        exercises: [
            {
                id: 'conf-1',
                title: 'Grounding Breath',
                instructions: 'Take a deep breath, feel your feet on the floor, then speak from that centered place.',
                duration: 45
            },
            {
                id: 'conf-2',
                title: 'No Uptalk Challenge',
                instructions: 'Make every sentence a statement, never a question. Drop pitch at the end.',
                duration: 60
            },
            {
                id: 'conf-3',
                title: 'Power Pause',
                instructions: 'Say something, then pause for 2 seconds before continuing. Own the silence.',
                duration: 45
            }
        ]
    }
];

/**
 * Get a characteristic by ID
 */
export const getCharacteristic = (id) => {
    return VOICE_CHARACTERISTICS.find(c => c.id === id);
};

/**
 * Get all exercise IDs for a characteristic
 */
export const getCharacteristicExercises = (characterId) => {
    const char = getCharacteristic(characterId);
    return char ? char.exercises : [];
};

/**
 * Tips for transitioning between characters
 */
export const CHARACTER_TRANSITION_TIPS = [
    {
        from: 'professional',
        to: 'warm',
        tip: 'Soften your onset, slow down slightly, and let your pitch curves be gentler.'
    },
    {
        from: 'professional',
        to: 'bubbly',
        tip: 'Add more upward inflections, speed up slightly, and brighten your resonance.'
    },
    {
        from: 'warm',
        to: 'professional',
        tip: 'Crisp up your consonants, add some authority with downward inflections.'
    },
    {
        from: 'bubbly',
        to: 'confident',
        tip: 'Ground your pitch, reduce variation, and speak with deliberate pacing.'
    }
];

export default VOICE_CHARACTERISTICS;
