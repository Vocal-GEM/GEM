/**
 * Default Practice Card Sets
 * Organized by difficulty level for structured voice training.
 * These cannot be edited by users - they can create their own custom sets.
 */

export const DIFFICULTY_LEVELS = {
    beginner: { label: 'Beginner', color: '#22c55e', icon: '🌱' },
    intermediate: { label: 'Intermediate', color: '#f59e0b', icon: '🌿' },
    advanced: { label: 'Advanced', color: '#ef4444', icon: '🌳' }
};

export const FOCUS_AREAS = {
    pitch: { label: 'Pitch', color: '#8b5cf6' },
    resonance: { label: 'Resonance', color: '#06b6d4' },
    intonation: { label: 'Intonation', color: '#ec4899' },
    articulation: { label: 'Articulation', color: '#f97316' },
    general: { label: 'General', color: '#64748b' }
};

export const DEFAULT_CARD_SETS = [
    // ============================================
    // BEGINNER: Simple Words
    // ============================================
    {
        id: 'words-beginner',
        name: 'Essential Words',
        description: 'Simple words to practice pitch and resonance basics',
        difficulty: 'beginner',
        isDefault: true,
        cards: [
            { id: 'w1', text: 'Hello', focus: 'pitch' },
            { id: 'w2', text: 'Hi there', focus: 'intonation' },
            { id: 'w3', text: 'Good morning', focus: 'pitch' },
            { id: 'w4', text: 'Beautiful', focus: 'resonance' },
            { id: 'w5', text: 'Wonderful', focus: 'resonance' },
            { id: 'w6', text: 'Really?', focus: 'intonation' },
            { id: 'w7', text: 'Absolutely', focus: 'resonance' },
            { id: 'w8', text: 'Amazing', focus: 'pitch' },
            { id: 'w9', text: 'Thank you', focus: 'intonation' },
            { id: 'w10', text: 'Please', focus: 'resonance' },
            { id: 'w11', text: 'Excuse me', focus: 'pitch' },
            { id: 'w12', text: 'Lovely', focus: 'resonance' },
            { id: 'w13', text: 'Certainly', focus: 'articulation' },
            { id: 'w14', text: 'Delightful', focus: 'resonance' },
            { id: 'w15', text: 'Fantastic', focus: 'pitch' },
            { id: 'w16', text: 'Exactly', focus: 'articulation' },
            { id: 'w17', text: 'Of course', focus: 'intonation' },
            { id: 'w18', text: 'Welcome', focus: 'resonance' },
            { id: 'w19', text: 'Goodbye', focus: 'intonation' },
            { id: 'w20', text: 'See you soon', focus: 'pitch' }
        ]
    },
    {
        id: 'words-resonance',
        name: 'Resonance Words',
        description: 'Words with nasal consonants (M, N, NG) for forward resonance',
        difficulty: 'beginner',
        isDefault: true,
        cards: [
            { id: 'rw1', text: 'Mmmm-hmmm', focus: 'resonance' },
            { id: 'rw2', text: 'Morning', focus: 'resonance' },
            { id: 'rw3', text: 'Singing', focus: 'resonance' },
            { id: 'rw4', text: 'Meaning', focus: 'resonance' },
            { id: 'rw5', text: 'Naming', focus: 'resonance' },
            { id: 'rw6', text: 'Humming', focus: 'resonance' },
            { id: 'rw7', text: 'Ringing', focus: 'resonance' },
            { id: 'rw8', text: 'Timing', focus: 'resonance' },
            { id: 'rw9', text: 'Coming', focus: 'resonance' },
            { id: 'rw10', text: 'Running', focus: 'resonance' },
            { id: 'rw11', text: 'Shining', focus: 'resonance' },
            { id: 'rw12', text: 'Gleaming', focus: 'resonance' },
            { id: 'rw13', text: 'Beaming', focus: 'resonance' },
            { id: 'rw14', text: 'Dreaming', focus: 'resonance' },
            { id: 'rw15', text: 'Blooming', focus: 'resonance' }
        ]
    },

    // ============================================
    // INTERMEDIATE: Sentences
    // ============================================
    {
        id: 'sentences-pitch',
        name: 'Pitch Practice Sentences',
        description: 'Practice maintaining elevated pitch across full sentences',
        difficulty: 'intermediate',
        isDefault: true,
        cards: [
            { id: 'sp1', text: 'How are you doing today?', focus: 'pitch' },
            { id: 'sp2', text: 'I\'m doing really well, thank you!', focus: 'pitch' },
            { id: 'sp3', text: 'What a beautiful day it is!', focus: 'pitch' },
            { id: 'sp4', text: 'Nice to meet you!', focus: 'pitch' },
            { id: 'sp5', text: 'I love spending time with friends.', focus: 'pitch' },
            { id: 'sp6', text: 'That sounds like so much fun!', focus: 'pitch' },
            { id: 'sp7', text: 'I really appreciate your help.', focus: 'pitch' },
            { id: 'sp8', text: 'Let me know if you need anything.', focus: 'pitch' },
            { id: 'sp9', text: 'I\'m so excited about this!', focus: 'pitch' },
            { id: 'sp10', text: 'Would you like to join us?', focus: 'pitch' }
        ]
    },
    {
        id: 'sentences-intonation',
        name: 'Intonation Patterns',
        description: 'Practice varied intonation with questions and statements',
        difficulty: 'intermediate',
        isDefault: true,
        cards: [
            { id: 'si1', text: 'Really? That\'s amazing!', focus: 'intonation' },
            { id: 'si2', text: 'Oh my goodness, I can\'t believe it!', focus: 'intonation' },
            { id: 'si3', text: 'Wait, what did you just say?', focus: 'intonation' },
            { id: 'si4', text: 'Are you serious right now?', focus: 'intonation' },
            { id: 'si5', text: 'I was wondering if you could help me?', focus: 'intonation' },
            { id: 'si6', text: 'Guess what happened to me today!', focus: 'intonation' },
            { id: 'si7', text: 'You\'ll never believe this...', focus: 'intonation' },
            { id: 'si8', text: 'So anyway, what I was trying to say...', focus: 'intonation' },
            { id: 'si9', text: 'Oh, I almost forgot to tell you!', focus: 'intonation' },
            { id: 'si10', text: 'That reminds me of something...', focus: 'intonation' }
        ]
    },
    {
        id: 'sentences-resonance',
        name: 'Resonance Sentences',
        description: 'Sentences rich in nasal sounds for resonance practice',
        difficulty: 'intermediate',
        isDefault: true,
        cards: [
            { id: 'sr1', text: 'Many men and women came running.', focus: 'resonance' },
            { id: 'sr2', text: 'The morning sun was shining brightly.', focus: 'resonance' },
            { id: 'sr3', text: 'I\'m dreaming of a wonderful morning.', focus: 'resonance' },
            { id: 'sr4', text: 'The singing rang through the evening.', focus: 'resonance' },
            { id: 'sr5', text: 'Mining and farming are morning activities.', focus: 'resonance' },
            { id: 'sr6', text: 'Humming along to my favorite song.', focus: 'resonance' },
            { id: 'sr7', text: 'The timing of the announcement was perfect.', focus: 'resonance' },
            { id: 'sr8', text: 'I\'m planning on coming home soon.', focus: 'resonance' }
        ]
    },

    // ============================================
    // ADVANCED: Short Stories / Paragraphs
    // ============================================
    {
        id: 'stories-casual',
        name: 'Casual Conversations',
        description: 'Extended practice with natural conversational speech',
        difficulty: 'advanced',
        isDefault: true,
        cards: [
            {
                id: 'sc1',
                text: 'Oh my gosh, you won\'t believe what happened at work today! So I was just minding my own business when my coworker came up to me with the most amazing news.',
                focus: 'general'
            },
            {
                id: 'sc2',
                text: 'Okay so basically, I went to this new café downtown and it was absolutely adorable! The barista was so sweet and the lattes were incredible. We should definitely go together sometime!',
                focus: 'general'
            },
            {
                id: 'sc3',
                text: 'I\'ve been thinking about redecorating my room lately. Maybe adding some plants and fairy lights? I saw this gorgeous setup on Instagram and now I\'m totally inspired!',
                focus: 'general'
            },
            {
                id: 'sc4',
                text: 'Have you watched that new show everyone\'s talking about? I finally started it last night and I completely get the hype now. No spoilers, but episode three was wild!',
                focus: 'general'
            },
            {
                id: 'sc5',
                text: 'So the funniest thing happened at the grocery store. I was reaching for the last avocado and this other person reached for it at the exact same time! We both laughed and ended up chatting for like ten minutes.',
                focus: 'general'
            }
        ]
    },
    {
        id: 'stories-professional',
        name: 'Professional Speech',
        description: 'Practice formal and professional communication',
        difficulty: 'advanced',
        isDefault: true,
        cards: [
            {
                id: 'spr1',
                text: 'Good morning, everyone. Thank you for joining today\'s meeting. I wanted to start by going over the agenda and then we can discuss the upcoming project timeline.',
                focus: 'pitch'
            },
            {
                id: 'spr2',
                text: 'I appreciate you taking the time to speak with me today. I\'m very interested in this opportunity and I believe my experience would be a great fit for your team.',
                focus: 'pitch'
            },
            {
                id: 'spr3',
                text: 'Based on the data we\'ve collected, I recommend we proceed with the second option. It offers the best balance of cost efficiency and quality outcomes.',
                focus: 'general'
            },
            {
                id: 'spr4',
                text: 'Hello, this is Sarah calling from the clinic. I\'m calling to confirm your appointment for tomorrow at two o\'clock. Please give us a call back if you need to reschedule.',
                focus: 'pitch'
            }
        ]
    },
    {
        id: 'rainbow-passage',
        name: 'Rainbow Passage',
        description: 'Classic speech pathology assessment passage',
        difficulty: 'advanced',
        isDefault: true,
        cards: [
            {
                id: 'rp1',
                text: 'When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow.',
                focus: 'general'
            },
            {
                id: 'rp2',
                text: 'The rainbow is a division of white light into many beautiful colors.',
                focus: 'general'
            },
            {
                id: 'rp3',
                text: 'These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon.',
                focus: 'general'
            },
            {
                id: 'rp4',
                text: 'There is, according to legend, a boiling pot of gold at one end.',
                focus: 'general'
            },
            {
                id: 'rp5',
                text: 'People look, but no one ever finds it. When a man looks for something beyond his reach, his friends say he is looking for the pot of gold at the end of the rainbow.',
                focus: 'general'
            }
        ]
    }
];

/**
 * Get all card sets (default + custom)
 * @param {Array} customSets - User's custom card sets from storage
 * @returns {Array} Combined array of all card sets
 */
export const getAllCardSets = (customSets = []) => {
    return [...DEFAULT_CARD_SETS, ...customSets];
};

/**
 * Get card sets filtered by difficulty
 * @param {string} difficulty - 'beginner', 'intermediate', or 'advanced'
 * @param {Array} customSets - User's custom card sets
 * @returns {Array} Filtered card sets
 */
export const getCardSetsByDifficulty = (difficulty, customSets = []) => {
    const allSets = getAllCardSets(customSets);
    return allSets.filter(set => set.difficulty === difficulty);
};

/**
 * Find a specific card by ID across all sets
 * @param {string} cardId - The card ID to find
 * @param {Array} customSets - User's custom card sets
 * @returns {Object|null} The card object or null
 */
export const findCardById = (cardId, customSets = []) => {
    const allSets = getAllCardSets(customSets);
    for (const set of allSets) {
        const card = set.cards.find(c => c.id === cardId);
        if (card) {
            return { ...card, setId: set.id, setName: set.name };
        }
    }
    return null;
};
