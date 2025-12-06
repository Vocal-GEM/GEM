
export const INTONATION_PATTERNS = [
    {
        id: 'statement_flat',
        name: 'Flat Statement',
        description: 'Keep a steady pitch for a monotone or neutral statement.',
        duration: 3000,
        difficulty: 'Easy',
        points: [
            { t: 0.0, v: 0.5 },
            { t: 0.2, v: 0.5 },
            { t: 0.8, v: 0.5 },
            { t: 1.0, v: 0.45 }
        ]
    },
    {
        id: 'statement_falling',
        name: 'Falling Statement',
        description: 'Start neutral and drop pitch at the end to signal completion.',
        duration: 3000,
        difficulty: 'Easy',
        points: [
            { t: 0.0, v: 0.6 },
            { t: 0.5, v: 0.6 },
            { t: 0.8, v: 0.4 },
            { t: 1.0, v: 0.3 }
        ]
    },
    {
        id: 'question_rising',
        name: 'Rising Question',
        description: 'Raise your pitch at the end to ask a Yes/No question.',
        duration: 2500,
        difficulty: 'Medium',
        points: [
            { t: 0.0, v: 0.4 },
            { t: 0.5, v: 0.45 },
            { t: 0.8, v: 0.6 },
            { t: 1.0, v: 0.8 }
        ]
    },
    {
        id: 'enthusiasm',
        name: 'Enthusiasm (Rise-Fall)',
        description: 'Go up in pitch to emphasize a word, then return to neutral.',
        duration: 3000,
        difficulty: 'Hard',
        points: [
            { t: 0.0, v: 0.4 },
            { t: 0.3, v: 0.7 }, // Peak emphasis
            { t: 0.4, v: 0.7 },
            { t: 0.7, v: 0.4 },
            { t: 1.0, v: 0.35 }
        ]
    },
    {
        id: 'doubt',
        name: 'Doubt (Dip-Rise)',
        description: 'Dip down and come back up, indicating uncertainty.',
        duration: 3000,
        difficulty: 'Hard',
        points: [
            { t: 0.0, v: 0.5 },
            { t: 0.3, v: 0.3 },
            { t: 0.7, v: 0.6 },
            { t: 1.0, v: 0.55 }
        ]
    }
];
