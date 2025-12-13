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

    // --- WARM-UP MASSAGES ---
    // Release tension before phonation exercises
    {
        id: 'massage-circumlaryngeal',
        title: 'Circumlaryngeal Massage',
        category: 'warmup',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Gently massage around the larynx (voice box) in small circular motions. Work the muscles on both sides of the thyroid cartilage. This releases extrinsic laryngeal tension.',
        goals: ['warmup', 'relaxation'],
        visualization: null
    },
    {
        id: 'massage-jaw',
        title: 'Jaw & TMJ Massage',
        category: 'warmup',
        difficulty: 'beginner',
        duration: 45,
        instructions: 'Place fingers on the masseter muscles (at the jaw hinge). Massage in circles while gently opening and closing your mouth. Continue until the jaw feels loose and "numb".',
        goals: ['warmup', 'relaxation'],
        visualization: null
    },
    {
        id: 'massage-suprahyoid',
        title: 'Suprahyoid Massage',
        category: 'warmup',
        difficulty: 'beginner',
        duration: 45,
        instructions: 'Find the U-shaped hyoid bone under your chin. Gently massage the muscles above it (suprahyoids) and move the hyoid side to side. There should be no clicking or resistance.',
        goals: ['warmup', 'relaxation'],
        visualization: null
    },
    {
        id: 'massage-neck',
        title: 'Neck Muscle Massage',
        category: 'warmup',
        difficulty: 'beginner',
        duration: 45,
        instructions: 'Massage down the sternocleidomastoid muscles on both sides of your neck. Use gentle pressure and long strokes until you feel the tension release.',
        goals: ['warmup', 'relaxation'],
        visualization: null
    },
    {
        id: 'massage-shoulders',
        title: 'Shoulder & Trapezius Release',
        category: 'warmup',
        difficulty: 'beginner',
        duration: 45,
        instructions: 'Massage the trapezius muscles (top of shoulders). Roll shoulders back and forth. Tension here can affect the larynx, so release it before voice work.',
        goals: ['warmup', 'relaxation'],
        visualization: null
    },
    {
        id: 'warmup-tongue-pulls',
        title: 'Tongue Pulls',
        category: 'warmup',
        difficulty: 'beginner',
        duration: 30,
        instructions: 'Gently grasp the tip of your tongue with a clean cloth or tissue. Pull it forward gently and hold for 5 seconds, then release. Repeat 5-10 times. This releases tension in the tongue root, which connects to the larynx.',
        goals: ['warmup', 'relaxation'],
        visualization: null
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
    // --- THIN VOCAL FOLD MASS EXERCISES ---
    // These exercises help find a lighter, thinner vocal fold configuration
    {
        id: 'weight-airy-sigh',
        title: 'Light Airy Sigh',
        category: 'weight',
        difficulty: 'beginner',
        duration: 45,
        instructions: 'Take a relaxed breath and release it on a light, airy sigh - like a contented "ahh" after a long day. Let air escape freely without pressing or holding. This encourages thin, relaxed vocal folds.',
        goals: ['weight', 'relaxation', 'thin-folds'],
        visualization: 'weight'
    },
    {
        id: 'weight-high-low-glide',
        title: 'High-to-Low Glissando',
        category: 'weight',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Start at a comfortable high pitch and glide smoothly down to your lowest note. Keep the sound light and effortless as you descend. The high starting point encourages thinner vocal fold mass.',
        goals: ['weight', 'range', 'thin-folds'],
        visualization: 'pitch'
    },
    {
        id: 'weight-thin-flow',
        title: 'Thin Fold Flow Phonation',
        category: 'weight',
        difficulty: 'intermediate',
        duration: 60,
        instructions: 'Sustain a gentle "oo" or "ee" vowel with maximum airflow and minimum vocal effort. Imagine your vocal folds are thin ribbons barely touching. If you feel pressing or tightness, add more breath.',
        goals: ['weight', 'flow', 'thin-folds'],
        visualization: 'flow'
    },

    // --- SINGING ---
    {
        id: 'singing-squat',
        title: 'The Singing Squat',
        category: 'singing',
        difficulty: 'beginner',
        duration: 120,
        instructions: 'Stand tall, take your breath. As you sing your exercise, slowly squat until the phrase ends. Return to standing to breathe again.',
        goals: ['breath', 'support', 'singing'],
        visualization: 'pitch'
    },
    {
        id: 'singing-yawn-breath',
        title: 'The Yawn Breath',
        category: 'singing',
        difficulty: 'beginner',
        duration: 90,
        instructions: 'Take in a yawn to lift the soft palate and lower the larynx. Then release on a gentle descending siren on any vowel.',
        goals: ['breath', 'relaxation', 'singing'],
        visualization: 'pitch'
    },
    {
        id: 'singing-farinelli',
        title: 'Farinelli Breath',
        category: 'singing',
        difficulty: 'beginner',
        duration: 120,
        instructions: 'Inhale for 4 counts, suspend breath for 4 counts, exhale for 4 counts. Gradually increase the duration as you improve.',
        goals: ['breath', 'capacity', 'singing'],
        visualization: 'weight'
    },
    {
        id: 'singing-pant',
        title: 'The Pant',
        category: 'singing',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Pant like a dog with your tongue out. Place one hand on your chest and one on your belly. Notice where the movement is.',
        goals: ['breath', 'awareness', 'singing'],
        visualization: 'weight'
    },
    {
        id: 'singing-lip-trills',
        title: 'Lip Trills for Singing',
        category: 'singing',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Relax your lips and allow them to vibrate freely. If you struggle, try a rolled R or straw phonation instead.',
        goals: ['warmup', 'relaxation', 'singing'],
        visualization: 'pitch'
    },
    {
        id: 'singing-puffy-cheeks',
        title: 'Puffy Cheeks',
        category: 'singing',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Gently inflate your cheeks and form a small /w/ opening. Blow air gently through, maintaining air in front of the teeth.',
        goals: ['resonance', 'relaxation', 'singing'],
        visualization: 'resonance'
    },
    {
        id: 'singing-boat-motor',
        title: 'Boat Motor Scales',
        category: 'singing',
        difficulty: 'intermediate',
        duration: 90,
        instructions: 'Sing a scale on "buh" with puffy cheeks. You may feel like a boat motor. This frees the voice from pressing.',
        goals: ['resonance', 'freedom', 'singing'],
        visualization: 'resonance'
    },
    {
        id: 'singing-wee-triad',
        title: 'Wee 5-3-1 Pattern',
        category: 'singing',
        difficulty: 'intermediate',
        duration: 90,
        instructions: 'Sing "Wee" on a descending 5-3-1 pattern. Use a really closed "w" sound, almost like "oo", to travel between notes.',
        goals: ['pitch', 'head-voice', 'singing'],
        visualization: 'pitch'
    },
    {
        id: 'singing-bubble-blows',
        title: 'Bubble Blows',
        category: 'singing',
        difficulty: 'beginner',
        duration: 90,
        instructions: 'Blow bubbles into a straw submerged in water while singing a simple scale (1-2-3-4-3-2-1).',
        goals: ['breath', 'support', 'singing'],
        visualization: 'weight'
    },

    // --- FLOW PHONATION / SOVT ---
    // Based on "Applying Flow Phonation in Voice Care for Transgender Women"
    {
        id: 'flow-u-sustained',
        title: 'Sustained /u/ Flow',
        category: 'flow',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Hold an "oo" (as in "who") sound with light, easy airflow. Feel the vibration in your lips, not tension in your throat. This is your Flow calibration vowel.',
        goals: ['flow', 'efficiency'],
        visualization: 'flow'
    },
    {
        id: 'flow-u-glides',
        title: '/u/ Pitch Glides',
        category: 'flow',
        difficulty: 'intermediate',
        duration: 90,
        instructions: 'Glide up and down your range on "oo". Maintain the easy Flow feeling throughout. If you feel strain, return to the basic sustained /u/.',
        goals: ['flow', 'pitch'],
        visualization: 'flow'
    },
    {
        id: 'flow-straw-phonation',
        title: 'Straw Phonation',
        category: 'flow',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Hum through a straw (or into a cup of water). This creates back pressure that helps your vocal folds find efficient "touch" closure.',
        goals: ['flow', 'sovt'],
        visualization: 'flow'
    },

    // --- ACCENT METHOD ---
    // Based on Accent Method voice therapy research
    {
        id: 'accent-diaphragm-breath',
        title: 'Diaphragmatic Breathing',
        category: 'breath',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Breathe using your stomach muscles. Feel them expand like a balloon as you inhale, and contract as you exhale. Keep shoulders and throat relaxed.',
        goals: ['breath', 'relaxation'],
        visualization: 'weight'
    },
    {
        id: 'accent-voiceless-series',
        title: 'Voiceless Sound Series',
        category: 'flow',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Practice voiceless sounds rhythmically: blow (like blowing out candles), "sss", "fff", "shh". Power from diaphragm, no throat tension.',
        goals: ['flow', 'breath'],
        visualization: 'weight'
    },
    {
        id: 'accent-voiced-series',
        title: 'Voiced Sound Series',
        category: 'flow',
        difficulty: 'intermediate',
        duration: 60,
        instructions: 'Practice voiced sounds rhythmically: "vvv", "zzz", voiced "th", "zh". Keep throat relaxed, power from stomach muscles.',
        goals: ['flow', 'breath'],
        visualization: 'flow'
    },
    {
        id: 'accent-mixed-sounds',
        title: 'Mixed Sound Transitions',
        category: 'flow',
        difficulty: 'intermediate',
        duration: 90,
        instructions: 'Alternate between voiceless and voiced: "fff-vvv", "sss-zzz", "shh-zh". Ensure open throat and smooth transitions.',
        goals: ['flow', 'coordination'],
        visualization: 'flow'
    },
    {
        id: 'accent-pulses',
        title: 'Diaphragmatic Pulses',
        category: 'flow',
        difficulty: 'advanced',
        duration: 90,
        instructions: 'On a sustained sound, create small pulses by squeezing your stomach muscles (like pressing a car accelerator). Practice on "sss" then "zzz".',
        goals: ['flow', 'control'],
        visualization: 'weight'
    },

    // --- LAX VOX SERIES ---
    // Progressive SOVT technique for minimal-effort voice production
    {
        id: 'laxvox-bubbles',
        title: 'Lax Vox: Steady Bubbles',
        category: 'flow',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'Blow steady bubbles into a cup of water through a straw or tube. Keep facial muscles relaxed and maintain a consistent airflow. This balances pressure above and below your vocal cords.',
        goals: ['flow', 'relaxation', 'sovt'],
        visualization: 'weight'
    },
    {
        id: 'laxvox-voiced',
        title: 'Lax Vox: Adding Voice',
        category: 'flow',
        difficulty: 'beginner',
        duration: 60,
        instructions: 'While blowing bubbles, add a continuous "ooo" sound. Your cheeks should flutter slightly. Keep throat and shoulders relaxed - let the diaphragm do the work.',
        goals: ['flow', 'phonation', 'sovt'],
        visualization: 'flow'
    },
    {
        id: 'laxvox-sustained',
        title: 'Lax Vox: Extended Sounds',
        category: 'flow',
        difficulty: 'intermediate',
        duration: 60,
        instructions: 'Extend your "ooo" sound through the tube as long as comfortable. Maintain steady bubbles and don\'t run out of breath. Build capacity gradually.',
        goals: ['flow', 'breath', 'sovt'],
        visualization: 'flow'
    },
    {
        id: 'laxvox-glides',
        title: 'Lax Vox: Pitch Glides',
        category: 'flow',
        difficulty: 'intermediate',
        duration: 90,
        instructions: 'Glide up and down in pitch through the tube. Always start with bubbles first. Ensure cheeks flutter and throat/shoulders stay relaxed throughout the range.',
        goals: ['flow', 'pitch', 'sovt'],
        visualization: 'pitch'
    },
    {
        id: 'laxvox-melody',
        title: 'Lax Vox: Singing Through Tube',
        category: 'flow',
        difficulty: 'intermediate',
        duration: 90,
        instructions: 'Sing a simple tune through the straw while bubbling. Start with bubbles, then add the melody. Keep the easy, open feeling in your throat.',
        goals: ['flow', 'singing', 'sovt'],
        visualization: 'pitch'
    },
    {
        id: 'laxvox-transition',
        title: 'Lax Vox: Water Exit',
        category: 'flow',
        difficulty: 'advanced',
        duration: 60,
        instructions: 'While sustaining sound, gradually lift the tube out of the water. Maintain the same easy airflow and effort. Feel how the voice stays relaxed.',
        goals: ['flow', 'carryover', 'sovt'],
        visualization: 'flow'
    },
    {
        id: 'laxvox-to-hum',
        title: 'Lax Vox: To Open Voice',
        category: 'flow',
        difficulty: 'advanced',
        duration: 60,
        instructions: 'Remove the tube from your mouth while continuing the sound into a hum, then open to "mmm-ahhh". Carry the released, open feeling into your natural voice.',
        goals: ['flow', 'carryover', 'resonance'],
        visualization: 'resonance'
    }
];
