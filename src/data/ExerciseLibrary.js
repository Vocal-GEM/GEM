export const EXERCISE_LIBRARY = [
    // --- BREATH & WARMUP ---
    {
        id: 'warmup-lip-trills',
        title: 'Lip Trills',
        category: 'warmup',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Gently blow air through your lips to make them vibrate. Slide your pitch up and down comfortably.',
        goals: ['warmup', 'breath'],
        visualization: 'pitch'
    },
    {
        id: 'warmup-humming',
        title: 'Resonant Humming',
        category: 'warmup',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Hum an "M" sound. Focus on feeling the vibration in your lips and nose, not your throat.',
        goals: ['warmup', 'resonance'],
        visualization: 'resonance'
    },
    {
        id: 'breath-hiss',
        title: 'Sustained Hiss',
        category: 'breath',
        difficulty: 'beginner',
        duration: 45,
        instructions: 'Inhale deeply, then exhale on a steady "Sss" sound for as long as you can. Keep the volume consistent.',
        goals: ['breath', 'stability'],
        visualization: 'weight'
    },

    // --- PITCH ---
    {
        id: 'pitch-sirens',
        title: 'Pitch Sirens',
        category: 'pitch',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Glide from your lowest comfortable note to your highest and back down, like a siren.',
        goals: ['pitch', 'range'],
        visualization: 'pitch'
    },
    {
        id: 'pitch-stairs',
        title: 'Pitch Stairs',
        category: 'pitch',
        difficulty: 'intermediate',
        duration: 90,
        instructions: 'Sing a 5-note scale up and down (Do-Re-Mi-Fa-So-Fa-Mi-Re-Do). Move the starting pitch up by a semitone each time.',
        goals: ['pitch', 'control'],
        visualization: 'pitch'
    },
    {
        id: 'pitch-hold',
        title: 'Target Pitch Hold',
        category: 'pitch',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Pick a comfortable note in your target range and hold it steady for 5-10 seconds.',
        goals: ['pitch', 'stability'],
        visualization: 'pitch'
    },

    // --- RESONANCE ---
    {
        id: 'res-forward-focus',
        title: 'Forward Focus "M"',
        category: 'resonance',
        difficulty: 'intermediate',
        duration: 60,
        instructions: 'Sing "Mmm-Ahhh". Try to keep the bright, buzzy feeling of the "M" as you open to the "Ah".',
        goals: ['resonance', 'brightness'],
        visualization: 'resonance'
    },
    {
        id: 'res-ng-glide',
        title: 'NG Glides',
        category: 'resonance',
        difficulty: 'advanced',
        duration: 60,
        instructions: 'Sing the "ng" sound (as in "sing"). Glide up and down while maintaining the nasal resonance.',
        goals: ['resonance', 'control'],
        visualization: 'resonance'
    },
    {
        id: 'res-whisper-siren',
        title: 'Whisper Sirens',
        category: 'resonance',
        difficulty: 'beginner',
        duration: 45,
        instructions: 'Whisper a siren up and down. This helps raise the larynx naturally without strain.',
        goals: ['resonance', 'brightness'],
        visualization: 'resonance'
    },

    // --- WEIGHT / QUALITY ---
    {
        id: 'weight-soft-onset',
        title: 'Soft Onset vowels',
        category: 'weight',
        difficulty: 'intermediate',
        duration: 60,
        instructions: 'Say "Hhh-aaa". Start with a breathy "H" to ensure a gentle start to the vowel. Avoid clicking or hard attacks.',
        goals: ['weight', 'onset'],
        visualization: 'weight'
    },
    {
        id: 'weight-creak-fry',
        title: 'Vocal Fry to Modal',
        category: 'weight',
        difficulty: 'advanced',
        duration: 60,
        instructions: 'Start with a loose vocal fry and slowly slide up into a clear tone. Keep the weight light.',
        goals: ['weight', 'relaxation'],
        visualization: 'weight'
    },

    // --- VOICE CHARACTERISTICS / STYLE ---
    {
        id: 'char-warm-onset',
        title: 'Warm Voice: Soft Onsets',
        category: 'characteristic',
        characteristic: 'warm',
        difficulty: 'beginner',
        duration: 45,
        instructions: 'Practice saying "Mmm-hmm" as if agreeing with a friend. Keep it soft and low. Then try: "I understand how you feel."',
        goals: ['style', 'onset', 'warmth'],
        visualization: 'weight'
    },
    {
        id: 'char-bubbly-greetings',
        title: 'Bubbly Voice: Excited Greetings',
        category: 'characteristic',
        characteristic: 'bubbly',
        difficulty: 'beginner',
        duration: 30,
        instructions: 'Say "Hi!" as if you just saw your best friend unexpectedly. Let your pitch rise at the end with genuine excitement.',
        goals: ['style', 'intonation', 'brightness'],
        visualization: 'pitch'
    },
    {
        id: 'char-professional-articulation',
        title: 'Professional Voice: Crisp Consonants',
        category: 'characteristic',
        characteristic: 'professional',
        difficulty: 'intermediate',
        duration: 60,
        instructions: 'Read: "The TOP TEN TechniqueS for PresenTaTion." Over-articulate T, K, P, S sounds. Be a newscaster.',
        goals: ['style', 'articulation', 'clarity'],
        visualization: 'pitch'
    },
    {
        id: 'char-playful-stretch',
        title: 'Playful Voice: Word Stretching',
        category: 'characteristic',
        characteristic: 'playful',
        difficulty: 'intermediate',
        duration: 45,
        instructions: 'Stretch key words playfully: "That\'s soooo interesting!" and "Reeeally?" Add mischief to your voice.',
        goals: ['style', 'expressiveness', 'range'],
        visualization: 'pitch'
    },
    {
        id: 'char-confident-grounding',
        title: 'Confident Voice: Power Pause',
        category: 'characteristic',
        characteristic: 'confident',
        difficulty: 'intermediate',
        duration: 60,
        instructions: 'Say something authoritative, pause for 2 seconds, then continue. Own the silence. "I know what I\'m talking about. [pause] Let me explain."',
        goals: ['style', 'pacing', 'authority'],
        visualization: 'pitch'
    },
    {
        id: 'char-style-switch',
        title: 'Style Switching Challenge',
        category: 'characteristic',
        difficulty: 'advanced',
        duration: 90,
        instructions: 'Say "Hello, how are you today?" in 5 different styles: Warm, Bubbly, Professional, Playful, Confident. Notice how each feels different.',
        goals: ['style', 'flexibility', 'control'],
        visualization: 'pitch'
    },

    // --- MAINTENANCE & RECOVERY ---
    {
        id: 'maint-cooldown',
        title: 'Gentle Cool-Down',
        category: 'maintenance',
        difficulty: 'beginner',
        duration: 90,
        instructions: 'After practice: 1) Gentle yawn-sigh 5x, 2) Descending humming scales, 3) Slow lip trills descending. Let your voice relax.',
        goals: ['recovery', 'relaxation', 'health'],
        visualization: 'pitch'
    },
    {
        id: 'maint-sovt-recovery',
        title: 'SOVT Recovery',
        category: 'maintenance',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Straw phonation or gentle humming on a comfortable pitch. This balances air pressure and helps tired vocal folds recover.',
        goals: ['recovery', 'health', 'technique'],
        visualization: 'weight'
    },
    {
        id: 'maint-hydration-hum',
        title: 'Hydration Check Humming',
        category: 'maintenance',
        difficulty: 'beginner',
        duration: 30,
        instructions: 'Take a sip of water, then hum gently sliding up and down. Notice how hydration affects your voice\'s smoothness.',
        goals: ['health', 'awareness', 'warmup'],
        visualization: 'resonance'
    }
];

