import { GAVT_REPORT } from './research/GAVT_Report.js';
import { RESEARCH_KB_ENTRIES } from './research/AcousticGenderPerception.js';

export const KNOWLEDGE_BASE = [
    ...GAVT_REPORT,
    ...RESEARCH_KB_ENTRIES,
    {
        id: 'res_01',
        tags: ['resonance', 'bright', 'R1', 'size'],
        question: "How do I brighten my voice?",
        answer: "To brighten your voice, you need to shorten your vocal tract (R1). **Try these techniques:**\n\n1. **Smile:** Spreading your lips slightly shortens the tract.\n2. **Tongue Position:** Keep your tongue high and forward, like saying 'eeee'.\n3. **Larynx Height:** Gently raise your larynx (Adam's apple) as if you are swallowing or speaking like a child.\n\n*Think 'small' and 'bright' like a bell.*",
        category: "Resonance"
    },
    {
        id: 'res_02',
        tags: ['resonance', 'dark', 'R1', 'size'],
        question: "How do I darken my voice?",
        answer: "To darken your voice, you need to lengthen your vocal tract (R1). **Try these techniques:**\n\n1. **Lip Rounding:** Protrude your lips slightly.\n2. **Tongue Position:** Lower the back of your tongue.\n3. **Larynx Height:** Allow your larynx to drop, similar to the beginning of a yawn.\n\n*Think 'large' and 'warm' like a cello.*",
        category: "Resonance"
    },
    {
        id: 'pit_01',
        tags: ['pitch', 'range', 'high'],
        question: "How can I practice raising my pitch?",
        answer: "Raising pitch requires stretching the vocal folds. **Exercises:**\n\n- **Sirens:** Slide from your lowest note to your highest note smoothly.\n- **Staircase:** Speak a sentence, stepping up in pitch with each word.\n- **Humming:** Hum a high note to feel the vibration in your head (head voice).\n\n*Avoid straining! If it hurts, stop and rest.*",
        category: "Pitch"
    },
    {
        id: 'wgt_01',
        tags: ['weight', 'heavy', 'light', 'buzz'],
        question: "What is vocal weight?",
        answer: "Vocal weight refers to how 'thick' or 'thin' your voice sounds. \n\n- **Heavy Weight:** Loud, buzzy, chest resonance (like a shout).\n- **Light Weight:** Soft, breathy, head resonance (like a whisper or flute).\n\nFor feminization, a lighter weight is often desired. For masculinization, a heavier weight is common.",
        category: "Vocal Weight"
    },
    {
        id: 'hlt_01',
        tags: ['health', 'hydration', 'strain'],
        question: "How do I keep my voice healthy?",
        answer: "**Vocal Hygiene Tips:**\n\n1. **Hydrate:** Drink plenty of water.\n2. **Rest:** Take breaks during long practice sessions.\n3. **Warm-up:** Always warm up before intense practice.\n4. **Avoid Irritants:** Smoking and excessive shouting can damage vocal folds.",
        category: "Health"
    },
    {
        id: 'gen_01',
        tags: ['practice', 'schedule', 'routine'],
        question: "How often should I practice?",
        answer: "Consistency is key! Short, frequent sessions are better than one long session.\n\n- **Recommended:** 15-30 minutes a day.\n- **Focus:** mindful practice is better than mindless repetition.\n- **Listen:** Record yourself to track progress.",
        category: "General"
    },
    {
        id: 'mix_01',
        tags: ['mix', 'mixed voice', 'blend', 'chest', 'head'],
        question: "What is mixed voice?",
        answer: "Mixed voice is a blend of chest voice (thick folds) and head voice (thin folds). It allows you to sing or speak in your middle range with power and ease, bridging the gap between low and high notes.",
        category: "Technique"
    },
    {
        id: 'pas_01',
        tags: ['break', 'crack', 'passaggio', 'smooth'],
        question: "How do I smooth my voice break?",
        answer: "The 'break' or passaggio happens when your vocal folds abruptly switch coordination. To smooth it:\n\n1. **Lighten up:** Don't pull heavy chest weight up too high.\n2. **Support:** Keep steady airflow.\n3. **Modify Vowels:** Narrowing vowels (like 'uh' or 'oo') can help navigate the break.",
        category: "Technique"
    },
    {
        id: 'fry_01',
        tags: ['fry', 'creak', 'gravel', 'rough'],
        question: "What is vocal fry?",
        answer: "Vocal fry is the lowest register of your voice, characterized by a popping or creaking sound. It happens when vocal folds are loose and bubbly. While natural, excessive fry can sometimes limit projection or pitch range.",
        category: "Voice Quality"
    },
    {
        id: 'bre_01',
        tags: ['breathy', 'air', 'leak', 'support'],
        question: "How do I stop sounding breathy?",
        answer: "Breathiness is caused by air leaking through the vocal folds. To fix it:\n\n1. **Engage:** Try a gentle 'glottal onset' (say 'apple' with a crisp start).\n2. **Support:** Use your abdominal muscles to control airflow.\n3. **Focus:** Aim for a clear, focused sound like a laser beam, not a fog.",
        category: "Voice Quality"
    },
    {
        id: 'fwd_01',
        tags: ['forward', 'focus', 'mask', 'resonance'],
        question: "What is forward focus?",
        answer: "Forward focus (or 'mask resonance') is the sensation of feeling vibrations in the front of your face (lips, nose, cheekbones) rather than in your throat. It helps project your voice and creates a brighter, clearer tone without strain.",
        category: "Technique"
    },
    {
        id: 'wrm_01',
        tags: ['warmup', 'routine', 'start', 'prepare'],
        question: "What is a good warm-up routine?",
        answer: "A good warm-up prepares your vocal folds and breath support. Try this 5-minute routine:\n\n1. **Body:** Stretch your neck and shoulders.\n2. **Breath:** Take 5 deep, low breaths.\n3. **Sound:** Gentle lip trills or humming for 2 minutes.\n4. **Range:** Gentle sirens up and down your range.",
        category: "Health"
    },
    {
        id: 'int_01',
        tags: ['intonation', 'melody', 'prosody', 'monotone'],
        question: "Why is intonation important?",
        answer: "Intonation is the 'melody' of your speech. \n\n- **Feminine speech** often has more pitch variation and upward inflections.\n- **Masculine speech** tends to be flatter or have downward inflections.\n\nVarying your pitch makes you sound more expressive and engaging.",
        category: "Technique"
    },
    {
        id: 'brt_01',
        tags: ['breath', 'support', 'diaphragm', 'power'],
        question: "How do I improve breath support?",
        answer: "Breath support comes from the diaphragm and intercostal muscles, not the shoulders.\n\n**Technique:**\n1. Place a hand on your belly.\n2. Inhale deeply; feel your belly expand outward.\n3. Exhale slowly on a 'hiss', keeping your belly engaged and resisting the collapse.\n\n*Think of your breath as the fuel for your voice.*",
        category: "Technique"
    },
    {
        id: 'vow_01',
        tags: ['vowel', 'modification', 'bright', 'dark'],
        question: "How do vowels affect my voice gender?",
        answer: "Vowels are shaped by the vocal tract. \n\n- **Feminization:** Brighten vowels by spreading lips and keeping the tongue forward (e.g., 'ee' is naturally bright).\n- **Masculinization:** Darken vowels by rounding lips and creating space in the back (e.g., 'oh' or 'aw').\n\n*Modifying vowels can shift the perceived gender of your entire voice.*",
        category: "Technique"
    },
    {
        id: 'fem_01',
        tags: ['feminization', 'tips', 'summary', 'trans woman'],
        question: "What are the key pillars of voice feminization?",
        answer: "The three main pillars are:\n\n1. **Resonance (R1):** Shortening the vocal tract for a brighter sound (most important).\n2. **Pitch:** Raising the average fundamental frequency (usually above 165Hz).\n3. **Weight:** Reducing vocal weight to avoid 'buzziness'.\n\n*Intonation and articulation also play major roles.*",
        category: "Feminization"
    },
    {
        id: 'masc_01',
        tags: ['masculinization', 'tips', 'summary', 'trans man'],
        question: "What are the key pillars of voice masculinization?",
        answer: "The three main pillars are:\n\n1. **Resonance (R1):** Lengthening the vocal tract for a darker, deeper sound.\n2. **Pitch:** Lowering the average fundamental frequency (usually below 135Hz).\n3. **Weight:** Increasing vocal weight for a fuller, buzzier tone.\n\n*Monotone delivery can also help perceive masculinity.*",
        category: "Masculinization"
    },
    {
        id: 'pitfall_01',
        tags: ['strain', 'pain', 'hoarse', 'danger'],
        question: "Why does my throat hurt?",
        answer: "Throat pain usually indicates **strain** or **tension**.\n\n- **False Vocal Folds:** You might be squeezing your throat. Retract the false folds (laugh gently or inhale on a 'k').\n- **Larynx Height:** You might be forcing your larynx too high or low without relaxation.\n\n*Stop immediately if it hurts. Rest and hydrate.*",
        category: "Health"
    },
    {
        id: 'nonspeech_01',
        tags: ['non-speech', 'laugh', 'cough', 'sneeze', 'feminization', 'resonance'],
        question: "How can I feminize non-speech sounds (laughing, coughing)?",
        answer: "Non-speech sounds like laughing, coughing, and sneezing can reveal your habitual voice settings. To feminize them:\n\n**Make the resonance chamber smaller using an \"E\" shape:**\n\n1. **Spread your lips slightly** (like saying 'ee').\n2. **Keep your tongue high and forward.**\n3. **Maintain your raised larynx position.**\n\n*Practice: Try laughing on a high 'hee hee hee' rather than a low 'hah hah'. The 'ee' vowel naturally creates a smaller, brighter resonance.*",
        category: "Feminization"
    }
];
