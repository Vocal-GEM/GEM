export const INTONATION_PATTERNS = {
    statement: {
        id: 'statement',
        label: 'Statement (Falling)',
        description: 'Standard declarative sentence. Pitch rises slightly then falls at the end.',
        // t: normalized time (0-1), v: normalized pitch (0-1, relative to range)
        points: [
            { t: 0.0, v: 0.5 },
            { t: 0.2, v: 0.6 },
            { t: 0.5, v: 0.5 },
            { t: 0.8, v: 0.3 },
            { t: 1.0, v: 0.2 }
        ]
    },
    question: {
        id: 'question',
        label: 'Question (Rising)',
        description: 'Yes/No question. Pitch rises significantly at the end.',
        points: [
            { t: 0.0, v: 0.4 },
            { t: 0.3, v: 0.4 },
            { t: 0.6, v: 0.5 },
            { t: 0.8, v: 0.7 },
            { t: 1.0, v: 0.9 }
        ]
    },
    exclamation: {
        id: 'exclamation',
        label: 'Exclamation (High-Fall)',
        description: 'Excited statement. Starts high and falls sharply.',
        points: [
            { t: 0.0, v: 0.8 },
            { t: 0.2, v: 0.9 },
            { t: 0.4, v: 0.7 },
            { t: 0.7, v: 0.4 },
            { t: 1.0, v: 0.3 }
        ]
    }
};
