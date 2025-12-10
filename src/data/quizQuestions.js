/**
 * Quiz Questions for the Learn Module
 * 
 * Organized by module ID matching LearnView.jsx modules.
 * Each question has 4 multiple choice options with one correct answer.
 */

export const quizQuestions = [
    // ==========================================
    // PITCH & FUNDAMENTAL FREQUENCY
    // ==========================================
    {
        id: 'pitch-1',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'What is the typical pitch range perceived as masculine?',
        options: [
            '180-250 Hz',
            '85-165 Hz',
            '300-400 Hz',
            '50-75 Hz'
        ],
        correctIndex: 1,
        explanation: 'Masculine-perceived voices typically fall in the 85-165 Hz range, while feminine-perceived voices are usually above 165 Hz.'
    },
    {
        id: 'pitch-2',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'What happens to pitch when vocal folds are stretched more tightly?',
        options: [
            'It decreases',
            'It increases',
            'It stays the same',
            'It becomes breathy'
        ],
        correctIndex: 1,
        explanation: 'Just like a guitar string, tighter vocal folds vibrate faster, producing a higher pitch.'
    },
    {
        id: 'pitch-3',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'What is F0 (Fundamental Frequency)?',
        options: [
            'The first formant frequency',
            'The rate at which vocal folds vibrate',
            'The breathing rate during speech',
            'The loudness of the voice'
        ],
        correctIndex: 1,
        explanation: 'F0 is the fundamental frequency - the number of times your vocal folds open and close per second, measured in Hz.'
    },
    {
        id: 'pitch-4',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'Which pitch range is considered the "ambiguous zone" where gender perception is less clear?',
        options: [
            '100-120 Hz',
            '145-175 Hz',
            '200-250 Hz',
            '300-350 Hz'
        ],
        correctIndex: 1,
        explanation: 'The 145-175 Hz range is often perceived as androgynous, where other voice qualities become more important for gender perception.'
    },
    {
        id: 'pitch-5',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'Is pitch the most important factor in voice gender perception?',
        options: [
            'Yes, it is the only factor that matters',
            'No, resonance is equally or more important',
            'Yes, if pitch is right, everything else follows',
            'No, only breathiness matters'
        ],
        correctIndex: 1,
        explanation: 'While pitch is important, research shows resonance is equally or more important. A feminine-resonating voice at a lower pitch can still be perceived as feminine.'
    },
    {
        id: 'pitch-6',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'What muscle primarily controls pitch?',
        options: [
            'The diaphragm',
            'The cricothyroid muscle',
            'The tongue',
            'The jaw muscles'
        ],
        correctIndex: 1,
        explanation: 'The cricothyroid muscle tilts the thyroid cartilage, stretching the vocal folds to increase pitch.'
    },
    {
        id: 'pitch-7',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'What is a safe approach to raising habitual pitch?',
        options: [
            'Force your voice as high as possible immediately',
            'Gradually work up in small increments over time',
            'Only speak in falsetto',
            'Hold your breath while speaking high'
        ],
        correctIndex: 1,
        explanation: 'Gradual training prevents strain and allows your voice to adapt safely. Rushing can cause vocal fatigue or damage.'
    },
    {
        id: 'pitch-8',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'What unit is pitch measured in?',
        options: [
            'Decibels (dB)',
            'Hertz (Hz)',
            'Meters per second',
            'Watts'
        ],
        correctIndex: 1,
        explanation: 'Pitch is measured in Hertz (Hz), representing cycles per second of vocal fold vibration.'
    },
    {
        id: 'pitch-9',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'What typically happens to pitch during puberty for those with testosterone?',
        options: [
            'It increases significantly',
            'It drops by about an octave',
            'It stays the same',
            'It becomes more variable'
        ],
        correctIndex: 1,
        explanation: 'Testosterone causes the vocal folds to thicken and lengthen, lowering the pitch by approximately an octave.'
    },
    {
        id: 'pitch-10',
        moduleId: 'pitch',
        moduleName: 'Pitch & Fundamental Frequency',
        question: 'What is "pitch variability"?',
        options: [
            'Having an unstable, shaky voice',
            'The range of pitches used during natural speech',
            'Being unable to match a pitch',
            'Speaking in monotone'
        ],
        correctIndex: 1,
        explanation: 'Pitch variability refers to the range of pitches (highs and lows) used during natural conversation. Feminine speech patterns typically have more variability.'
    },

    // ==========================================
    // VOCAL FORMANTS
    // ==========================================
    {
        id: 'formants-1',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'What are formants?',
        options: [
            'The shape of your lips during speech',
            'Resonance frequencies amplified by the vocal tract',
            'The volume of your voice',
            'Breathing patterns during speech'
        ],
        correctIndex: 1,
        explanation: 'Formants are specific frequencies that are amplified by the resonating chambers of your vocal tract (throat, mouth, nasal cavity).'
    },
    {
        id: 'formants-2',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'Which formant is most associated with tongue height (open vs closed mouth)?',
        options: [
            'F1',
            'F2',
            'F3',
            'F4'
        ],
        correctIndex: 0,
        explanation: 'F1 (the first formant) is primarily influenced by tongue height and jaw opening. Lower F1 = higher tongue position.'
    },
    {
        id: 'formants-3',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'Which formant is most associated with tongue front-back position?',
        options: [
            'F1',
            'F2',
            'F3',
            'F0'
        ],
        correctIndex: 1,
        explanation: 'F2 (second formant) is primarily influenced by tongue advancement. Higher F2 = more forward tongue position.'
    },
    {
        id: 'formants-4',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'What typically happens to formant frequencies when the vocal tract is shortened?',
        options: [
            'They decrease',
            'They increase',
            'They stay the same',
            'Only F1 changes'
        ],
        correctIndex: 1,
        explanation: 'A shorter vocal tract (like raising the larynx) produces higher formant frequencies, similar to how a shorter tube produces higher pitches.'
    },
    {
        id: 'formants-5',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'Feminine voices typically have formant frequencies that are approximately what percentage higher than masculine voices?',
        options: [
            '5-10% higher',
            '15-20% higher',
            '30-40% higher',
            '50-60% higher'
        ],
        correctIndex: 1,
        explanation: 'Due to shorter vocal tracts on average, feminine voices typically have formant frequencies about 15-20% higher than masculine voices.'
    },
    {
        id: 'formants-6',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'Formants distinguish which aspect of speech?',
        options: [
            'Volume',
            'Different vowel sounds',
            'Breathing rate',
            'Emotional state only'
        ],
        correctIndex: 1,
        explanation: 'Formant patterns are what allow us to distinguish different vowel sounds. Each vowel has a characteristic F1/F2 pattern.'
    },
    {
        id: 'formants-7',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'What does a vowel space plot show?',
        options: [
            'Pitch over time',
            'F1 vs F2 frequencies for different vowels',
            'Breathing patterns',
            'Loudness levels'
        ],
        correctIndex: 1,
        explanation: 'A vowel space plot maps F1 (vertical axis, inverted) against F2 (horizontal axis) to show how different vowels are produced.'
    },
    {
        id: 'formants-8',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'The vowel /i/ (as in "heed") has what characteristic?',
        options: [
            'Low F1, Low F2',
            'Low F1, High F2',
            'High F1, Low F2',
            'High F1, High F2'
        ],
        correctIndex: 1,
        explanation: 'The vowel /i/ has a low F1 (high tongue) and high F2 (front tongue position), making it a "bright" vowel useful for resonance training.'
    },
    {
        id: 'formants-9',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'Which vowel is most useful for practicing forward resonance?',
        options: [
            '/u/ (as in "boot")',
            '/a/ (as in "father")',
            '/i/ (as in "heed")',
            '/o/ (as in "boat")'
        ],
        correctIndex: 2,
        explanation: 'The vowel /i/ (ee) naturally encourages forward tongue position and higher F2, making it excellent for forward resonance practice.'
    },
    {
        id: 'formants-10',
        moduleId: 'formants',
        moduleName: 'Vocal Formants',
        question: 'What physical change can raise all formant frequencies?',
        options: [
            'Lowering the larynx',
            'Raising the larynx',
            'Speaking more quietly',
            'Breathing more deeply'
        ],
        correctIndex: 1,
        explanation: 'Raising the larynx shortens the overall vocal tract length, which raises all formant frequencies and creates a brighter, smaller-sounding voice.'
    },

    // ==========================================
    // RESONANCE & BRIGHTNESS
    // ==========================================
    {
        id: 'resonance-1',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'Raising the larynx typically makes the voice sound:',
        options: [
            'Darker and deeper',
            'Brighter and smaller',
            'Breathier',
            'Lower in pitch only'
        ],
        correctIndex: 1,
        explanation: 'A raised larynx shortens the vocal tract, increasing resonant frequencies and creating a brighter, smaller-sounding voice.'
    },
    {
        id: 'resonance-2',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'What is "forward resonance"?',
        options: [
            'Speaking very loudly',
            'Focusing vibrations toward the front of the face/mouth',
            'A breathing technique',
            'Using falsetto voice'
        ],
        correctIndex: 1,
        explanation: 'Forward resonance refers to techniques that shift the perceived focus of sound vibrations toward the front of the face, creating a brighter quality.'
    },
    {
        id: 'resonance-3',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'Which sound is often used to practice forward resonance?',
        options: [
            'The "ah" sound',
            'The "ng" or "mm" hum',
            'The "oh" sound',
            'Whispering'
        ],
        correctIndex: 1,
        explanation: 'Nasal consonants like "ng" and "mm" naturally resonate in the front of the face and help you feel forward placement.'
    },
    {
        id: 'resonance-4',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'What is the "big dog, small dog" exercise about?',
        options: [
            'Volume control',
            'Feeling the difference between dark and bright resonance',
            'Pitch range expansion',
            'Breathing exercises'
        ],
        correctIndex: 1,
        explanation: 'This exercise helps you feel the physical difference between low/dark resonance (big dog panting) and high/bright resonance (small dog panting).'
    },
    {
        id: 'resonance-5',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'Can resonance be changed independently of pitch?',
        options: [
            'No, they are always linked',
            'Yes, they are separate qualities',
            'Only with surgery',
            'Only in singing'
        ],
        correctIndex: 1,
        explanation: 'Resonance and pitch are controlled by different mechanisms. You can have a bright resonance at a lower pitch or a dark resonance at a higher pitch.'
    },
    {
        id: 'resonance-6',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'What does RBI stand for in voice analysis?',
        options: [
            'Resonance Balance Index',
            'Respiratory Breathing Indicator',
            'Relative Brightness Intensity',
            'Register Blend Integration'
        ],
        correctIndex: 0,
        explanation: 'RBI (Resonance Balance Index) measures the balance between lower and higher frequency energy to indicate bright vs. dark voice quality.'
    },
    {
        id: 'resonance-7',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'What does "twang" refer to in voice training?',
        options: [
            'A Southern accent',
            'A bright, ringing quality created by narrowing the epilaryngeal tube',
            'Strain in the voice',
            'Pitch breaks'
        ],
        correctIndex: 1,
        explanation: 'Twang is a technique that creates brightness and projection by narrowing the space above the vocal folds (epilaryngeal tube).'
    },
    {
        id: 'resonance-8',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'A person with a naturally larger vocal tract will have:',
        options: [
            'Higher formant frequencies',
            'Lower formant frequencies',
            'No formants',
            'Identical formants to everyone else'
        ],
        correctIndex: 1,
        explanation: 'Larger vocal tracts produce lower resonant frequencies, similar to how a larger organ pipe produces lower notes.'
    },
    {
        id: 'resonance-9',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'Why is resonance considered so important for gender perception?',
        options: [
            'It is not important at all',
            'It affects the overall "size" perception of the voice',
            'It only matters for singing',
            'It only affects volume'
        ],
        correctIndex: 1,
        explanation: 'Resonance affects whether a voice sounds like it comes from a larger or smaller instrument, which strongly influences gender perception.'
    },
    {
        id: 'resonance-10',
        moduleId: 'resonance',
        moduleName: 'Resonance & Brightness',
        question: 'What happens if you try to raise resonance without proper technique?',
        options: [
            'Nothing, it always works',
            'You may create tension or a strained quality',
            'Your pitch automatically rises',
            'Your voice becomes quieter'
        ],
        correctIndex: 1,
        explanation: 'Improper technique can lead to muscle tension and strain. Learning to raise resonance with relaxation is key to a sustainable voice.'
    },

    // ==========================================
    // VOICE QUALITY & TIMBRE
    // ==========================================
    {
        id: 'quality-1',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'What does "breathy" voice quality indicate about vocal fold closure?',
        options: [
            'Complete, tight closure',
            'Incomplete closure with air escaping',
            'Wet vocal folds',
            'Cold symptoms'
        ],
        correctIndex: 1,
        explanation: 'Breathiness occurs when the vocal folds don\'t close completely, allowing air to escape through the glottis during phonation.'
    },
    {
        id: 'quality-2',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'What does HNR (Harmonics-to-Noise Ratio) measure?',
        options: [
            'Pitch height',
            'Voice loudness',
            'Voice clarity vs. noisiness',
            'Breathing rate'
        ],
        correctIndex: 2,
        explanation: 'HNR measures how much of the voice signal is clear harmonic sound versus noise. Higher HNR = clearer voice.'
    },
    {
        id: 'quality-3',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'Slight breathiness in a voice is:',
        options: [
            'Always unhealthy',
            'Sometimes used as a stylistic feminine quality',
            'Impossible to achieve',
            'Only found in sick people'
        ],
        correctIndex: 1,
        explanation: 'Slight breathiness can add a soft, feminine quality to the voice. However, excessive breathiness can cause vocal fatigue.'
    },
    {
        id: 'quality-4',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'What is "vocal weight" or "spectral tilt"?',
        options: [
            'How heavy your throat feels',
            'The balance of low vs. high frequency energy in the voice',
            'Your body weight affecting your voice',
            'The speed of speech'
        ],
        correctIndex: 1,
        explanation: 'Vocal weight refers to the spectral tilt - how much energy is in lower vs. higher frequencies. Lighter weight = less bass, more delicate sound.'
    },
    {
        id: 'quality-5',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'What is "pressed" or "strained" phonation?',
        options: [
            'Speaking very quietly',
            'Excessive tension causing tight vocal fold closure',
            'Speaking with a cold',
            'Yawning while speaking'
        ],
        correctIndex: 1,
        explanation: 'Pressed phonation occurs when the vocal folds are pressed together too tightly, creating a tense, effortful sound quality.'
    },
    {
        id: 'quality-6',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'What is "flow phonation"?',
        options: [
            'Speaking underwater',
            'Relaxed, efficient vocal fold vibration with good airflow',
            'Speaking while running',
            'Whispering'
        ],
        correctIndex: 1,
        explanation: 'Flow phonation is an optimal voice production mode with relaxed, efficient vocal fold vibration and smooth airflow - the ideal for voice training.'
    },
    {
        id: 'quality-7',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'What is CPP (Cepstral Peak Prominence)?',
        options: [
            'A measure of pitch',
            'A measure of voice quality and periodicity',
            'A breathing measurement',
            'A resonance measurement'
        ],
        correctIndex: 1,
        explanation: 'CPP measures how regular and periodic the voice signal is. Higher CPP indicates a clearer, healthier voice quality.'
    },
    {
        id: 'quality-8',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'Jitter and shimmer are measures of:',
        options: [
            'Pitch height',
            'Voice stability and regularity',
            'Loudness',
            'Resonance'
        ],
        correctIndex: 1,
        explanation: 'Jitter measures pitch cycle-to-cycle variation, and shimmer measures amplitude variation. Low values indicate a stable, regular voice.'
    },
    {
        id: 'quality-9',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'What is the GRBAS scale used for?',
        options: [
            'Measuring pitch',
            'Rating voice quality characteristics',
            'Measuring lung capacity',
            'Grading singing ability'
        ],
        correctIndex: 1,
        explanation: 'GRBAS is a clinical scale rating Grade (overall), Roughness, Breathiness, Asthenia (weakness), and Strain to assess voice quality.'
    },
    {
        id: 'quality-10',
        moduleId: 'voice-quality',
        moduleName: 'Voice Quality & Timbre',
        question: 'What does H1-H2 measure?',
        options: [
            'The difference between two pitch notes',
            'The spectral tilt/vocal fold closure pattern',
            'Hydrogen levels',
            'Two different formants'
        ],
        correctIndex: 1,
        explanation: 'H1-H2 measures the difference between the first two harmonics, indicating open quotient and whether the voice is breathy or pressed.'
    },

    // ==========================================
    // INTONATION & PROSODY
    // ==========================================
    {
        id: 'intonation-1',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'What is intonation?',
        options: [
            'The average pitch of your voice',
            'The melody and pitch patterns of speech',
            'How loudly you speak',
            'Your accent'
        ],
        correctIndex: 1,
        explanation: 'Intonation is the melody of speech - how pitch rises and falls during sentences to convey meaning and emotion.'
    },
    {
        id: 'intonation-2',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'Feminine speech patterns in English typically have:',
        options: [
            'Flat, monotone intonation',
            'More pitch variation and melodic patterns',
            'Identical patterns to masculine speech',
            'Only rising patterns'
        ],
        correctIndex: 1,
        explanation: 'Research shows feminine speech patterns in English tend to have wider pitch ranges and more dynamic, melodic intonation.'
    },
    {
        id: 'intonation-3',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'What is "uptalk" or "high rising terminal"?',
        options: [
            'Speaking very high',
            'Rising pitch at the end of statements',
            'Speaking quickly',
            'Using high notes in singing'
        ],
        correctIndex: 1,
        explanation: 'Uptalk is a pitch rise at the end of a statement, making it sound like a question. It\'s more common in some feminine speech patterns.'
    },
    {
        id: 'intonation-4',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'What is prosody?',
        options: [
            'A type of poetry',
            'The rhythm, stress, and intonation of speech',
            'How fast you talk',
            'A medical condition'
        ],
        correctIndex: 1,
        explanation: 'Prosody encompasses all the suprasegmental features of speech: rhythm, stress, intonation, and timing patterns.'
    },
    {
        id: 'intonation-5',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'Word emphasis in feminine speech patterns is often expressed through:',
        options: [
            'Increased volume only',
            'Pitch rise on the emphasized word',
            'Speaking more slowly',
            'Whispering'
        ],
        correctIndex: 1,
        explanation: 'Feminine speech patterns often emphasize words by raising pitch, while masculine patterns may use more volume-based emphasis.'
    },
    {
        id: 'intonation-6',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'Is intonation pattern gendering culturally dependent?',
        options: [
            'No, all cultures have identical gender patterns',
            'Yes, different languages have different gendered patterns',
            'Intonation has no relation to gender',
            'Only English has gendered intonation'
        ],
        correctIndex: 1,
        explanation: 'Intonation gender patterns vary significantly by language and culture. What sounds feminine in English may differ in Japanese, French, etc.'
    },
    {
        id: 'intonation-7',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'What is pitch range in the context of prosody?',
        options: [
            'The highest note you can sing',
            'The span between highest and lowest pitches in speech',
            'Your speaking pitch',
            'The volume range'
        ],
        correctIndex: 1,
        explanation: 'Pitch range refers to the difference between the highest and lowest pitches used in natural speech. Wider range often sounds more expressive.'
    },
    {
        id: 'intonation-8',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'Monotone speech is characterized by:',
        options: [
            'Very wide pitch variation',
            'Limited pitch variation',
            'High pitch only',
            'Fast speaking rate'
        ],
        correctIndex: 1,
        explanation: 'Monotone speech has little pitch variation, staying close to one pitch level. This is often perceived as less engaging or more masculine in English.'
    },
    {
        id: 'intonation-9',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'How can you practice more expressive intonation?',
        options: [
            'Speak in a whisper only',
            'Read aloud with exaggerated emotions',
            'Speak as fast as possible',
            'Only practice singing'
        ],
        correctIndex: 1,
        explanation: 'Reading aloud with exaggerated emotion helps develop the neural pathways for more varied, expressive intonation in everyday speech.'
    },
    {
        id: 'intonation-10',
        moduleId: 'intonation',
        moduleName: 'Intonation & Prosody',
        question: 'What is a "pitch contour"?',
        options: [
            'A makeup technique',
            'The shape of pitch changes over a phrase or sentence',
            'Your larynx shape',
            'Breathing pattern'
        ],
        correctIndex: 1,
        explanation: 'A pitch contour is the visual representation of how pitch rises and falls over a phrase, showing the melodic pattern of speech.'
    },

    // ==========================================
    // ARTICULATION & SPEECH
    // ==========================================
    {
        id: 'articulation-1',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'What is articulation?',
        options: [
            'How loudly you speak',
            'How you shape sounds with your mouth, tongue, and lips',
            'Your accent',
            'Your breathing pattern'
        ],
        correctIndex: 1,
        explanation: 'Articulation refers to how we use our articulators (tongue, lips, jaw, palate) to shape speech sounds.'
    },
    {
        id: 'articulation-2',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'Vowels are primarily shaped by:',
        options: [
            'Lip rounding and tongue position',
            'Volume',
            'Breath control only',
            'Larynx position only'
        ],
        correctIndex: 0,
        explanation: 'Vowels are created by specific combinations of tongue height, tongue advancement, and lip rounding, which shape the vocal tract.'
    },
    {
        id: 'articulation-3',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'What is "vowel space" in voice analysis?',
        options: [
            'The space between your teeth',
            'The acoustic range where different vowels are produced',
            'How many vowels a language has',
            'Dental health measurement'
        ],
        correctIndex: 1,
        explanation: 'Vowel space is the acoustic area (typically F1 vs F2) that maps where different vowels are produced. Feminine voices often have expanded vowel spaces.'
    },
    {
        id: 'articulation-4',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'Clear articulation, especially of consonants, is:',
        options: [
            'Only important for singers',
            'Associated with more feminine speech patterns',
            'Unnecessary for voice training',
            'A sign of medical issues'
        ],
        correctIndex: 1,
        explanation: 'Research shows crisp, clear consonant articulation is often perceived as more feminine, while mumbling or dropped consonants can sound more masculine.'
    },
    {
        id: 'articulation-5',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'The /s/ sound (as in "see") is relevant to gender perception because:',
        options: [
            'It is always gendered',
            'Its spectral characteristics differ between masculine and feminine productions',
            'Only women can produce it',
            'It has no relevance'
        ],
        correctIndex: 1,
        explanation: 'The /s/ sound has different acoustic properties when produced with different tongue positions and tract sizes, contributing to gender perception.'
    },
    {
        id: 'articulation-6',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'Speech rate is:',
        options: [
            'Identical across all genders',
            'Sometimes slightly different between masculine and feminine speakers',
            'Only affected by age',
            'Fixed from birth'
        ],
        correctIndex: 1,
        explanation: 'Research shows some patterns in speech rate between genders, though individual variation is high. Adjusting speech rate can affect perception.'
    },
    {
        id: 'articulation-7',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'What is "coarticulation"?',
        options: [
            'Speaking with someone else',
            'How adjacent sounds influence each other',
            'Speaking two languages',
            'A type of accent'
        ],
        correctIndex: 1,
        explanation: 'Coarticulation is how sounds blend and influence each other in connected speech. Smooth coarticulation creates natural-sounding speech.'
    },
    {
        id: 'articulation-8',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'Lip spreading (smiling slightly while speaking) tends to:',
        options: [
            'Lower formant frequencies',
            'Raise formant frequencies, especially F2',
            'Have no effect on sound',
            'Make speech unclear'
        ],
        correctIndex: 1,
        explanation: 'Spreading the lips shortens the front of the vocal tract and raises F2, contributing to a brighter sound quality.'
    },
    {
        id: 'articulation-9',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'What is "vocal fry"?',
        options: [
            'Cooking with your voice',
            'A low, creaky phonation pattern',
            'A high-pitched voice',
            'A medical condition'
        ],
        correctIndex: 1,
        explanation: 'Vocal fry is a low, creaky phonation pattern where the vocal folds vibrate irregularly. It\'s a stylistic choice that can affect perception.'
    },
    {
        id: 'articulation-10',
        moduleId: 'articulation',
        moduleName: 'Articulation & Speech',
        question: 'Which articulators are most mobile in speech?',
        options: [
            'The hard palate and teeth',
            'The tongue and lips',
            'The larynx and lungs',
            'The nasal cavity'
        ],
        correctIndex: 1,
        explanation: 'The tongue and lips are the primary mobile articulators, capable of rapid, precise movements to shape different speech sounds.'
    },

    // ==========================================
    // VOCAL ANATOMY
    // ==========================================
    {
        id: 'anatomy-1',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'Where are the vocal folds located?',
        options: [
            'In the nose',
            'In the larynx (voice box)',
            'In the lungs',
            'In the mouth'
        ],
        correctIndex: 1,
        explanation: 'The vocal folds are located in the larynx, a cartilage structure in the neck commonly called the voice box.'
    },
    {
        id: 'anatomy-2',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'The vocal folds are made of:',
        options: [
            'Bone',
            'Muscle and mucous membrane',
            'Cartilage only',
            'Fat tissue'
        ],
        correctIndex: 1,
        explanation: 'Vocal folds consist of the vocalis muscle covered by layers of mucous membrane, which vibrate to produce sound.'
    },
    {
        id: 'anatomy-3',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'What is the glottis?',
        options: [
            'A type of throat disease',
            'The space between the vocal folds',
            'The roof of the mouth',
            'Part of the nose'
        ],
        correctIndex: 1,
        explanation: 'The glottis is the opening between the vocal folds. It opens for breathing and closes for phonation.'
    },
    {
        id: 'anatomy-4',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'The thyroid cartilage is commonly called:',
        options: [
            'The windpipe',
            'The Adam\'s apple',
            'The tongue bone',
            'The voice muscle'
        ],
        correctIndex: 1,
        explanation: 'The thyroid cartilage is the largest laryngeal cartilage and forms the protrusion known as the Adam\'s apple.'
    },
    {
        id: 'anatomy-5',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'What does testosterone do to the vocal folds during puberty?',
        options: [
            'Makes them shorter and thinner',
            'Makes them longer and thicker',
            'Has no effect',
            'Removes them entirely'
        ],
        correctIndex: 1,
        explanation: 'Testosterone causes the vocal folds to grow longer and thicker, which is why voices typically drop during testosterone-dominant puberty.'
    },
    {
        id: 'anatomy-6',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'The vocal tract includes:',
        options: [
            'Only the mouth',
            'The pharynx (throat), oral cavity, and nasal cavity',
            'Only the lungs',
            'Only the larynx'
        ],
        correctIndex: 1,
        explanation: 'The vocal tract is the resonating chamber above the vocal folds, including the pharynx, oral cavity, and nasal cavity.'
    },
    {
        id: 'anatomy-7',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'The cricothyroid muscle is responsible for:',
        options: [
            'Breathing',
            'Stretching the vocal folds to raise pitch',
            'Moving the tongue',
            'Opening the mouth'
        ],
        correctIndex: 1,
        explanation: 'The cricothyroid muscle tilts the cricoid and thyroid cartilages, stretching the vocal folds to increase pitch.'
    },
    {
        id: 'anatomy-8',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'What provides the power source for voice production?',
        options: [
            'The brain',
            'The respiratory system (lungs and diaphragm)',
            'The heart',
            'The mouth'
        ],
        correctIndex: 1,
        explanation: 'Airflow from the lungs, powered by the diaphragm and other respiratory muscles, provides the energy that sets the vocal folds vibrating.'
    },
    {
        id: 'anatomy-9',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'Can the size of the vocal folds be changed through training?',
        options: [
            'Yes, significantly with exercise',
            'No, but how they are used can be modified',
            'Yes, by surgery only',
            'No, voice training is impossible'
        ],
        correctIndex: 1,
        explanation: 'While vocal fold size is physically fixed, voice training teaches you to use them differently - varying closure patterns, tension, and coordination.'
    },
    {
        id: 'anatomy-10',
        moduleId: 'anatomy',
        moduleName: 'Vocal Anatomy',
        question: 'What are the "false vocal folds"?',
        options: [
            'A made-up term',
            'Structures above the true vocal folds that can cause strained voice quality',
            'Baby vocal folds',
            'Vocal folds in disease'
        ],
        correctIndex: 1,
        explanation: 'The false vocal folds (vestibular folds) sit above the true vocal folds. When they engage, they can cause a strained or pressed voice quality.'
    },

    // ==========================================
    // GENDER PERCEPTION
    // ==========================================
    {
        id: 'perception-1',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'Voice gender perception is based on:',
        options: [
            'Only pitch',
            'Multiple acoustic and social cues combined',
            'Only resonance',
            'Appearance only'
        ],
        correctIndex: 1,
        explanation: 'Gender perception comes from a combination of pitch, resonance, intonation, articulation, language use, and other factors.'
    },
    {
        id: 'perception-2',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'Research shows which quality is often considered most important for voice gender perception?',
        options: [
            'Volume',
            'Resonance and formant frequencies',
            'Breathing sounds',
            'Speech rate'
        ],
        correctIndex: 1,
        explanation: 'Studies consistently show resonance (particularly formant frequencies) is one of the strongest cues for voice gender perception, often more so than pitch alone.'
    },
    {
        id: 'perception-3',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'Is there a clear "passing" threshold for voice?',
        options: [
            'Yes, at exactly 180 Hz',
            'No, perception is continuous and multifactorial',
            'Yes, only at certain formant values',
            'Yes, based on volume alone'
        ],
        correctIndex: 1,
        explanation: 'Voice gender perception is not binary - it exists on a continuum influenced by many factors, and different listeners may perceive the same voice differently.'
    },
    {
        id: 'perception-4',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'Context and expectations affect voice perception:',
        options: [
            'Not at all',
            'Significantly - listeners\' expectations influence what they hear',
            'Only in noisy environments',
            'Only for children\'s voices'
        ],
        correctIndex: 1,
        explanation: 'Research shows listeners\' expectations strongly influence perception. Visual cues, name, context all affect how a voice is perceived.'
    },
    {
        id: 'perception-5',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'What is "voice congruence" in the context of gender-affirming voice training?',
        options: [
            'Having a voice identical to a celebrity',
            'Having a voice that aligns with your gender identity',
            'Speaking in unison with others',
            'Matching pitch exactly'
        ],
        correctIndex: 1,
        explanation: 'Voice congruence means having a voice that feels right and aligns with your gender identity - an important goal beyond just "passing."'
    },
    {
        id: 'perception-6',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'Perception studies show that a lower-pitched voice with bright resonance:',
        options: [
            'Always sounds masculine',
            'Can still be perceived as feminine',
            'Is impossible to achieve',
            'Sounds robotic'
        ],
        correctIndex: 1,
        explanation: 'Research demonstrates that bright resonance can create feminine perception even with lower pitches, showing the importance of resonance.'
    },
    {
        id: 'perception-7',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'Listener familiarity with diverse voices:',
        options: [
            'Has no effect on perception',
            'Increases accuracy and reduces binary thinking',
            'Makes perception impossible',
            'Only matters for professionals'
        ],
        correctIndex: 1,
        explanation: 'Listeners familiar with voice diversity tend to perceive voices more accurately and with less rigid binary categorization.'
    },
    {
        id: 'perception-8',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'What is meant by the "ambiguous zone" in voice gender perception?',
        options: [
            'When you can\'t hear clearly',
            'The range where gender perception is less clear-cut',
            'A recording studio term',
            'A medical condition'
        ],
        correctIndex: 1,
        explanation: 'The ambiguous zone refers to voice qualities (often certain pitch and resonance combinations) where gender perception is less definitive.'
    },
    {
        id: 'perception-9',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'Why might setting rigid "passing" goals be problematic?',
        options: [
            'It\'s never problematic',
            'It can create unrealistic expectations and ignore individual satisfaction',
            'Goals are always helpful',
            'Passing is the only important outcome'
        ],
        correctIndex: 1,
        explanation: 'Rigid goals can ignore the reality that voice gender perception is complex, subjective, and that personal satisfaction with your voice matters most.'
    },
    {
        id: 'perception-10',
        moduleId: 'perception',
        moduleName: 'Gender Perception',
        question: 'Voice training success is best measured by:',
        options: [
            'Hitting specific frequency targets only',
            'Personal satisfaction and comfort with your voice',
            'What strangers think',
            'How high you can speak'
        ],
        correctIndex: 1,
        explanation: 'While acoustic measures are useful tools, the best measure of success is how you feel about your voice and whether it represents you authentically.'
    }
];

/**
 * Get questions by module ID
 */
export const getQuestionsByModule = (moduleId) => {
    return quizQuestions.filter(q => q.moduleId === moduleId);
};

/**
 * Get all unique module IDs
 */
export const getModuleIds = () => {
    return [...new Set(quizQuestions.map(q => q.moduleId))];
};

/**
 * Get module names map
 */
export const getModuleNames = () => {
    const names = {};
    quizQuestions.forEach(q => {
        if (!names[q.moduleId]) {
            names[q.moduleId] = q.moduleName;
        }
    });
    return names;
};

export default quizQuestions;
