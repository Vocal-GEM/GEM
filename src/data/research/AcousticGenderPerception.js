/**
 * Acoustic Gender Perception Research Synthesis
 * 
 * Based on academic literature including meta-analyses by Leung, Oates, and Chan (2018),
 * perception experiments by Skuk & Schweinberger (2014), Hillenbrand & Clark (2009),
 * and comprehensive reviews of gender-affirming voice therapy research.
 */

export const ACOUSTIC_GENDER_RESEARCH = {
    title: "Acoustic Determinants of Gender Perception",
    summary: "Fundamental frequency explains ~42% of gender perception variance, but effective voice training requires targeting multiple acoustic features simultaneously.",

    // Key Finding: The Source-Filter Independence
    coreInsight: {
        title: "The Source-Filter Framework",
        description: "Gender perception arises from the interplay between the laryngeal source (pitch) and the supraglottal filter (resonance). These can be modified independently, which is the mechanism that allows voice gender modification.",
        practicalImplication: "A speaker can decouple pitch from resonance, creating combinations that reinforce or contradict gender perception cues."
    },

    // Hierarchy of acoustic cues by perceptual weight
    cueHierarchy: [
        {
            rank: 1,
            feature: "Resonance (Formant Frequencies)",
            varianceExplained: "~40%",
            evidenceStrength: "Very High",
            description: "Formants dictate the perceived 'size' of the speaker. Without feminized resonance, high pitch is perceived as falsetto.",
            mechanism: "Shortening the vocal tract (raised larynx, forward tongue) raises all formant frequencies.",
            clinicalAlignment: "Strong - 'Brightening' exercises are foundational.",
            targets: {
                feminine: "15-20% higher formants than masculine baseline",
                f1Note: "Influenced by pharyngeal cavity volume. Raised larynx = higher F1.",
                f2Note: "Most critical for gender. Forward tongue = higher F2. The /i/ vowel (as in 'see') naturally maximizes F2.",
                f3f4Note: "Indicative of overall vocal tract length. Contribute to 'timbre' and 'color'."
            }
        },
        {
            rank: 2,
            feature: "Fundamental Frequency (F0 / Pitch)",
            varianceExplained: "~41.6%",
            evidenceStrength: "High",
            description: "Essential for clearing the 'male' range (<135 Hz), but raising pitch alone often fails ('Pitch Fallacy').",
            mechanism: "Cricothyroid muscle tension stretches vocal folds, increasing vibration rate.",
            clinicalAlignment: "Strong, but nuance needed. Target sustainable comfort, not maximum height.",
            ranges: {
                malePrimary: "85-135 Hz",
                ambiguous: "145-175 Hz (resonance becomes deciding factor)",
                femalePrimary: "180-220+ Hz"
            }
        },
        {
            rank: 3,
            feature: "Sibilant Acoustics (/s/, /ʃ/)",
            varianceExplained: "Moderate",
            evidenceStrength: "High",
            description: "Voiceless fricatives have distinct, non-overlapping spectral ranges between genders.",
            mechanism: "Anterior tongue placement and lip spreading raise spectral centroid.",
            clinicalAlignment: "Often overlooked but highly effective for biofeedback.",
            targets: {
                feminine: "/s/ spectral centroid > 6000 Hz (often 8000+ Hz)",
                masculine: "/s/ spectral centroid < 5000 Hz",
                note: "This is a learned behavior, not purely anatomical. Transfeminine speakers can shift /s/ into female range."
            }
        },
        {
            rank: 4,
            feature: "Intonation (F0 Variability)",
            varianceExplained: "Moderate-High",
            evidenceStrength: "Moderate-High",
            description: "Distinguishes 'monotone male' from 'dynamic female' patterns.",
            mechanism: "Breath support and laryngeal flexibility allow pitch excursions.",
            clinicalAlignment: "Strong. Teaching upward inflections and wider semitone range.",
            patterns: {
                feminine: "Wider pitch range, more rising terminals (uptalk), pitch emphasis on key words",
                masculine: "Narrower range, more falling terminals, volume-based emphasis"
            }
        },
        {
            rank: 5,
            feature: "Voice Quality (Breathiness / Soft Onset)",
            varianceExplained: "Moderate",
            evidenceStrength: "Moderate (culturally bound)",
            description: "Softens the voice and signals intimacy/femininity in Western contexts.",
            mechanism: "Higher Open Quotient (vocal folds open longer per cycle), gentle adduction.",
            clinicalAlignment: "Moderate. Useful for health and style, but excessive breathiness causes fatigue.",
            markers: {
                spectralTilt: "Higher H1-H2 indicates breathier phonation",
                onset: "Soft/breathy onset vs. hard glottal attack",
                note: "The 'Billie Eilish Effect' - whisper-singing as hyper-feminine marker."
            }
        },
        {
            rank: 6,
            feature: "Voice Onset Time (VOT)",
            varianceExplained: "Weak-Moderate",
            evidenceStrength: "Moderate",
            description: "Women produce longer aspiration on voiceless stops (/p/, /t/, /k/).",
            mechanism: "Hyper-articulation and clear speech style.",
            clinicalAlignment: "Low (rarely explicitly trained). Emerges from clear articulation practice.",
            note: "Related to general pattern of feminine speech being more 'precise' and articulated."
        },
        {
            rank: 7,
            feature: "Nasality",
            varianceExplained: "Low",
            evidenceStrength: "Low/Conflicting",
            description: "Often cited in lay advice but NOT empirically supported as a gender marker.",
            mechanism: "Velopharyngeal coupling.",
            clinicalAlignment: "CAUTION - Often confused with 'Forward Focus'. Do not teach actual hypernasality.",
            warning: "The target sensation is 'frontal focus' (vibration in mask area), NOT nasal airflow. Hypernasality is a resonance disorder that reduces intelligibility."
        }
    ],

    // The Critical Synergy Finding
    synergy: {
        title: "Pitch-Resonance Interaction Effect",
        finding: "Shifting F0 and formants together achieves ~82% effectiveness in changing perceived speaker sex. Shifting either alone usually fails.",
        source: "Hillenbrand & Clark (2009)",
        implication: "Training programs targeting pitch elevation without resonance modification often disappoint. The 'Pitch Fallacy' occurs when speakers raise only pitch."
    },

    // The "Open Throat" Paradox
    paradox: {
        title: "Classical Singing vs. Gender-Affirming Voice",
        description: "Classical 'Open Throat' techniques (lowered larynx, expanded pharynx) are acoustically MASCULINIZING. They lower all formants.",
        classical: {
            technique: "Gola Aperta / Yawn-Sigh",
            effect: "Lowers formants → Darker, 'richer' tone → Masculine shift"
        },
        genderAffirming: {
            technique: "Swallow-Hold / Whisper / Forward Focus",
            effect: "Raises formants → Brighter, 'lighter' tone → Feminine shift"
        },
        resolution: "Use 'Frontal Focus' rather than 'Open Throat'. Tongue advancement and oral cavity shaping align with higher F2 goals."
    },

    // Key vowel: /i/
    keyVowel: {
        vowel: "/i/ (as in 'see', 'heat', 'fleece')",
        importance: "Critical diagnostic and therapeutic tool. Requires maximum tongue height (low F1) and maximum tongue advancement (high F2).",
        use: "The 'brightness' of /i/ is a potent cue for oral cavity size. Often used in biofeedback targeting F2 maximization.",
        exercise: "The phrase 'heat from fire' forces a high, forward tongue position and bright resonance."
    },

    // Non-Speech Sounds
    nonSpeechSounds: {
        title: "Feminizing Non-Speech Sounds",
        description: "Laughing, coughing, sneezing, and other reflexive sounds can reveal habitual voice settings.",
        technique: "Make the resonance chamber smaller using an 'E' shape: spread lips slightly, keep tongue high and forward, maintain raised larynx.",
        practice: "Laugh on 'hee hee hee' rather than 'hah hah'. The 'ee' vowel naturally creates smaller, brighter resonance."
    },

    // Research Limitations
    limitations: {
        title: "Evidence Base Limitations",
        points: [
            "83% of studies at lowest evidence hierarchy level",
            "Mean sample sizes ~13 participants",
            "RCTs essentially absent from the literature",
            "Long-term outcome data is concerning - gains often regress",
            "Transmasculine and non-binary populations dramatically underrepresented",
            "No head-to-head comparison of app-based vs. in-person SLP services"
        ]
    },

    // Motor Learning Principles
    motorLearning: {
        title: "Evidence-Based Practice Structure",
        principles: [
            { principle: "Random > Blocked Practice", detail: "Random practice yields superior retention despite worse performance during acquisition" },
            { principle: "Minimum 50 Repetitions", detail: "Per target, for motor skill acquisition" },
            { principle: "Distributed Practice", detail: "Shorter, more frequent sessions outperform massed practice for retention" },
            { principle: "Feedback Fading", detail: "High-frequency feedback during acquisition, reduced frequency for retention" },
            { principle: "Hierarchical Progression", detail: "Sustained sounds → Syllables → Words → Phrases → Sentences → Conversation → Generalization" }
        ],
        biofeedback: {
            finding: "Children receiving visual-acoustic biofeedback improved at 2.4x the rate of traditional motor-based treatment (NYU/Syracuse, 2025)",
            caveat: "Persistent visual feedback may suppress feedforward control development. Fade feedback as proficiency increases."
        }
    }
};

// Knowledge base entries derived from research
export const RESEARCH_KB_ENTRIES = [
    {
        id: 'research_hierarchy',
        category: 'Research',
        tags: ['research', 'hierarchy', 'cues', 'perception'],
        question: "What acoustic features matter most for gender perception?",
        answer: "Research establishes this hierarchy:\\n\\n1. **Resonance (Formants)** - Most critical. Dictates perceived 'size'.\\n2. **Pitch (F0)** - The baseline. ~42% of variance.\\n3. **Sibilants (/s/)** - Often overlooked but highly distinct.\\n4. **Intonation** - Dynamic vs. monotone patterns.\\n5. **Voice Quality** - Breathiness, soft onset.\\n6. **VOT** - Aspiration length on stops.\\n\\n*Nasality is NOT a reliable gender marker despite common misconceptions.*"
    },
    {
        id: 'research_synergy',
        category: 'Research',
        tags: ['research', 'pitch', 'resonance', 'synergy'],
        question: "Why doesn't raising pitch alone work?",
        answer: "The **'Pitch Fallacy'** occurs when speakers raise only pitch without modifying resonance. Research shows:\\n\\n- Pitch + Resonance together = **82% effective**\\n- Pitch alone = Often perceived as 'falsetto' or 'artificial'\\n- Resonance alone = Can shift perception even with lower pitch\\n\\n*In the ambiguous range (145-175 Hz), resonance becomes the deciding factor.*"
    },
    {
        id: 'research_formants',
        category: 'Research',
        tags: ['research', 'formants', 'f1', 'f2', 'resonance'],
        question: "What are the formant targets for feminine voice?",
        answer: "Feminine formants are typically **15-20% higher** than masculine baseline:\\n\\n- **F1**: Raise by shrinking pharyngeal cavity (raised larynx)\\n- **F2**: Raise by advancing tongue (forward position)\\n- **F3/F4**: Raise by overall tract shortening\\n\\n*The vowel /i/ (as in 'see') naturally maximizes F2 and is ideal for practice.*"
    },
    {
        id: 'research_sibilants',
        category: 'Research',
        tags: ['research', 'sibilants', 's', 'fricatives'],
        question: "How do I feminize my /s/ sound?",
        answer: "The /s/ sound has distinct gender ranges:\\n\\n- **Feminine /s/**: Spectral centroid > 6000 Hz (often 8000+)\\n- **Masculine /s/**: Spectral centroid < 5000 Hz\\n\\n**Technique**: Move tongue tip forward, spread lips slightly (smile). This raises the spectral centroid.\\n\\n*This is learned behavior, not purely anatomical - it can be trained!*"
    },
    {
        id: 'research_practice',
        category: 'Research',
        tags: ['research', 'practice', 'motor learning'],
        question: "What's the most effective practice structure?",
        answer: "Motor learning research recommends:\\n\\n1. **Random practice** (mixing exercises) > Blocked practice for retention\\n2. **Minimum 50 repetitions** per target\\n3. **Distributed practice** (15-30 min daily) > Long single sessions\\n4. **Fade biofeedback** as proficiency increases\\n5. **Hierarchical progression**: Sounds → Words → Phrases → Sentences → Conversation\\n\\n*Visual biofeedback improves learning 2.4x faster, but should be faded over time.*"
    }
];

export default ACOUSTIC_GENDER_RESEARCH;
