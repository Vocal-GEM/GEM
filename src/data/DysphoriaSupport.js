/**
 * DysphoriaSupport.js
 * 
 * Resources and tools for managing voice dysphoria, including
 * grounding exercises, affirmations, mood tracking, and crisis resources.
 */

// Grounding exercises for when dysphoria feels overwhelming
export const GROUNDING_EXERCISES = [
    {
        id: 'ground-5-4-3-2-1',
        name: '5-4-3-2-1 Sensory Grounding',
        duration: 120,
        emoji: '🌱',
        description: 'Reconnect with the present moment through your senses.',
        steps: [
            'Name 5 things you can SEE right now',
            'Name 4 things you can TOUCH or feel',
            'Name 3 things you can HEAR',
            'Name 2 things you can SMELL',
            'Name 1 thing you can TASTE'
        ],
        tip: 'Take your time with each sense. There\'s no rush.'
    },
    {
        id: 'ground-breath-anchor',
        name: 'Breath Anchor',
        duration: 60,
        emoji: '🫁',
        description: 'Use your breath to anchor yourself in the present.',
        steps: [
            'Place one hand on your chest, one on your belly',
            'Breathe in slowly for 4 counts',
            'Hold gently for 4 counts',
            'Exhale slowly for 6 counts',
            'Repeat 4-5 times'
        ],
        tip: 'Focus on the feeling of your hands rising and falling.'
    },
    {
        id: 'ground-body-scan',
        name: 'Quick Body Scan',
        duration: 90,
        emoji: '🧘',
        description: 'Release tension by scanning through your body.',
        steps: [
            'Close your eyes or soften your gaze',
            'Notice your feet - wiggle your toes',
            'Notice your legs - are they tense?',
            'Notice your belly - let it soften',
            'Notice your shoulders - let them drop',
            'Notice your jaw - unclench it',
            'Take three deep breaths'
        ],
        tip: 'You don\'t need to change anything, just notice.'
    },
    {
        id: 'ground-cold-water',
        name: 'Cold Water Reset',
        duration: 30,
        emoji: '💧',
        description: 'A quick physical reset using cold water.',
        steps: [
            'Run cold water over your wrists for 30 seconds',
            'Or splash cold water on your face',
            'Focus entirely on the sensation',
            'Take 3 slow breaths'
        ],
        tip: 'The cold activates your dive reflex, naturally calming your nervous system.'
    }
];

// Affirmations specifically for voice journey
export const VOICE_AFFIRMATIONS = [
    {
        id: 'affirm-1',
        text: 'My voice is valid exactly as it is today.',
        category: 'acceptance'
    },
    {
        id: 'affirm-2',
        text: 'Voice training is a journey, not a race. I honor my pace.',
        category: 'patience'
    },
    {
        id: 'affirm-3',
        text: 'Every practice session is an act of self-love.',
        category: 'compassion'
    },
    {
        id: 'affirm-4',
        text: 'My voice does not define my gender. I do.',
        category: 'identity'
    },
    {
        id: 'affirm-5',
        text: 'Progress isn\'t always linear, and that\'s okay.',
        category: 'growth'
    },
    {
        id: 'affirm-6',
        text: 'I am allowed to take breaks and still be committed.',
        category: 'rest'
    },
    {
        id: 'affirm-7',
        text: 'I celebrate the small victories along the way.',
        category: 'celebration'
    },
    {
        id: 'affirm-8',
        text: 'My authentic self deserves to be heard.',
        category: 'authenticity'
    },
    {
        id: 'affirm-9',
        text: 'Difficult days don\'t erase my progress.',
        category: 'resilience'
    },
    {
        id: 'affirm-10',
        text: 'I am learning to love my whole self, including my voice.',
        category: 'self-love'
    }
];

// Mood check-in options
export const MOOD_OPTIONS = [
    { id: 'great', emoji: '😊', label: 'Feeling great', color: 'bg-green-500' },
    { id: 'good', emoji: '🙂', label: 'Doing okay', color: 'bg-teal-500' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-slate-500' },
    { id: 'low', emoji: '😔', label: 'Feeling low', color: 'bg-amber-500' },
    { id: 'struggling', emoji: '😢', label: 'Struggling', color: 'bg-red-500' }
];

// Voice-specific dysphoria triggers
export const DYSPHORIA_TRIGGERS = [
    { id: 'phone', label: 'Phone calls', icon: '📱' },
    { id: 'video', label: 'Video calls', icon: '📹' },
    { id: 'public', label: 'Speaking in public', icon: '🎤' },
    { id: 'strangers', label: 'Talking to strangers', icon: '👥' },
    { id: 'recording', label: 'Hearing recordings', icon: '🎧' },
    { id: 'morning', label: 'Morning voice', icon: '🌅' },
    { id: 'tired', label: 'When tired/sick', icon: '😴' },
    { id: 'comparison', label: 'Comparing to others', icon: '⚖️' }
];

// Crisis resources
export const CRISIS_RESOURCES = [
    {
        id: 'trans-lifeline',
        name: 'Trans Lifeline',
        description: 'Hotline staffed by trans people, for trans people',
        phone: '877-565-8860',
        url: 'https://translifeline.org',
        region: 'US'
    },
    {
        id: 'trevor-project',
        name: 'Trevor Project',
        description: 'LGBTQ+ youth crisis support',
        phone: '866-488-7386',
        text: 'Text START to 678-678',
        url: 'https://www.thetrevorproject.org',
        region: 'US'
    },
    {
        id: '988-lifeline',
        name: '988 Suicide & Crisis Lifeline',
        description: 'National crisis support (press 3 for LGBTQ+ support)',
        phone: '988',
        url: 'https://988lifeline.org',
        region: 'US'
    },
    {
        id: 'crisis-text',
        name: 'Crisis Text Line',
        description: 'Text-based crisis support',
        text: 'Text HOME to 741741',
        url: 'https://www.crisistextline.org',
        region: 'US'
    }
];

// Coping strategies for different situations
export const COPING_STRATEGIES = [
    {
        id: 'cope-before-call',
        situation: 'Before a phone call',
        emoji: '📞',
        strategies: [
            'Do a quick warm-up (humming, lip trills)',
            'Take 3 deep breaths',
            'Remind yourself: You can hang up anytime',
            'Have water nearby',
            'Use text/email if voice feels unsafe today'
        ]
    },
    {
        id: 'cope-bad-voice-day',
        situation: 'Having a bad voice day',
        emoji: '🌧️',
        strategies: [
            'This is temporary - bad days pass',
            'Rest your voice if needed',
            'Do a grounding exercise',
            'Skip practice today if it hurts',
            'Journal about your feelings'
        ]
    },
    {
        id: 'cope-misgendered',
        situation: 'After being misgendered',
        emoji: '💔',
        strategies: [
            'It\'s okay to feel hurt - your feelings are valid',
            'Their perception doesn\'t define you',
            'Reach out to someone who sees you correctly',
            'Do something affirming for yourself',
            'Remember: This gets easier with time'
        ]
    },
    {
        id: 'cope-comparison',
        situation: 'Comparing yourself to others',
        emoji: '📊',
        strategies: [
            'Everyone starts somewhere different',
            'Focus on YOUR progress, not others\' results',
            'Unfollow accounts that trigger comparison',
            'Celebrate others\' wins without diminishing yours',
            'Your voice journey is unique to you'
        ]
    }
];

// Self-compassion prompts
export const SELF_COMPASSION_PROMPTS = [
    'What would you say to a friend going through this?',
    'What do you need right now that you can give yourself?',
    'Can you place a hand on your heart and breathe?',
    'What\'s one kind thing you can do for yourself today?',
    'Can you acknowledge how hard this is and still be gentle?'
];

/**
 * Get a random affirmation
 */
export const getRandomAffirmation = () => {
    return VOICE_AFFIRMATIONS[Math.floor(Math.random() * VOICE_AFFIRMATIONS.length)];
};

/**
 * Get grounding exercise by ID
 */
export const getGroundingExercise = (id) => {
    return GROUNDING_EXERCISES.find(ex => ex.id === id);
};

/**
 * Get coping strategies for a situation
 */
export const getCopingStrategies = (situationId) => {
    return COPING_STRATEGIES.find(cs => cs.id === situationId);
};

/**
 * Get appropriate support message based on mood
 */
export const getSupportMessage = (moodId) => {
    const messages = {
        'great': 'Wonderful! Let\'s channel that energy into practice! 🌟',
        'good': 'That\'s great! You\'re showing up for yourself today. 💪',
        'neutral': 'Thanks for being here. Every session counts. 🌱',
        'low': 'I\'m glad you\'re here. We can take it gentle today. 💜',
        'struggling': 'I see you. It\'s okay to just breathe right now. Would you like a grounding exercise or affirmation? 🫂'
    };
    return messages[moodId] || messages['neutral'];
};

export default {
    GROUNDING_EXERCISES,
    VOICE_AFFIRMATIONS,
    MOOD_OPTIONS,
    DYSPHORIA_TRIGGERS,
    CRISIS_RESOURCES,
    COPING_STRATEGIES,
    SELF_COMPASSION_PROMPTS,
    getRandomAffirmation,
    getGroundingExercise,
    getCopingStrategies,
    getSupportMessage
};
