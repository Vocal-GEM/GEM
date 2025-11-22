export const CURRICULUM = [
    {
        id: 'module-1',
        title: 'Foundations of Resonance',
        description: 'Learn to control the size of your vocal tract.',
        lessons: [
            { id: '1-1', title: 'The Yawn (Dark)', type: 'exercise', target: 'dark', duration: 5 },
            { id: '1-2', title: 'The Smile (Bright)', type: 'exercise', target: 'bright', duration: 5 },
            { id: '1-3', title: 'Resonance River', type: 'game', gameId: 'river', duration: 10 }
        ]
    },
    {
        id: 'module-2',
        title: 'Pitch Control',
        description: 'Mastering your fundamental frequency.',
        lessons: [
            { id: '2-1', title: 'Finding Your Range', type: 'calibration', duration: 5 },
            { id: '2-2', title: 'Siren Slides', type: 'exercise', target: 'pitch', duration: 5 },
            { id: '2-3', title: 'Flappy Voice', type: 'game', gameId: 'flappy', duration: 10 }
        ]
    },
    {
        id: 'module-3',
        title: 'Vocal Weight',
        description: 'Balancing thickness and thinness.',
        lessons: [
            { id: '3-1', title: 'Soft Onset', type: 'exercise', target: 'weight', duration: 5 },
            { id: '3-2', title: 'Cloud Hopper', type: 'game', gameId: 'hopper', duration: 10 }
        ]
    },
    {
        id: 'module-4',
        title: 'Intonation & Melody',
        description: 'Adding musicality to your speech.',
        lessons: [
            { id: '4-1', title: 'Staircase Pitch', type: 'game', gameId: 'staircase', duration: 10 },
            { id: '4-2', title: 'Melodic Reading', type: 'exercise', target: 'intonation', duration: 5 }
        ]
    },
    {
        id: 'module-5',
        title: 'Advanced Resonance',
        description: 'Fine-tuning your vocal tract.',
        lessons: [
            { id: '5-1', title: 'Vowel Modification', type: 'exercise', target: 'vowels', duration: 10 },
            { id: '5-2', title: 'Whisper Siren', type: 'exercise', target: 'resonance', duration: 5 }
        ]
    }
];
