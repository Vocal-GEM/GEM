// Body Tension Area to Exercise Mapping
// Maps common tension areas to recommended exercises from ExerciseLibrary

export const BODY_TENSION_MAP = {
    jaw: {
        area: 'Jaw & TMJ',
        exercises: ['massage-jaw', 'warmup-tongue-pulls', 'massage-suprahyoid'],
        description: 'Jaw tension can affect vocal quality by restricting the oral cavity and creating unnecessary strain. Relaxing the jaw opens up resonance space.',
        keywords: ['jaw', 'tmj', 'mandible', 'chin', 'teeth', 'bite', 'clench', 'grind']
    },

    throat: {
        area: 'Throat & Larynx',
        exercises: ['massage-circumlaryngeal', 'massage-suprahyoid', 'warmup-humming', 'weight-airy-sigh'],
        description: 'Throat tension directly restricts vocal fold movement and can cause strain. These exercises release extrinsic laryngeal muscles.',
        keywords: ['throat', 'larynx', 'voice box', 'adam\'s apple', 'thyroid cartilage', 'swallow', 'tight throat']
    },

    neck: {
        area: 'Neck Muscles',
        exercises: ['massage-neck', 'massage-circumlaryngeal', 'massage-shoulders', 'warmup-yawn-breath'],
        description: 'Neck tension can pull on the larynx and restrict its natural movement. The neck connects to both breathing and phonation.',
        keywords: ['neck', 'sternocleidomastoid', 'scm', 'cervical', 'nape', 'stiff neck']
    },

    shoulders: {
        area: 'Shoulders & Upper Back',
        exercises: ['massage-shoulders', 'massage-neck', 'warmup-yawn-breath', 'accent-diaphragm-breath'],
        description: 'Shoulder tension affects breathing and posture, which indirectly impacts voice production. Raised shoulders can restrict breath capacity.',
        keywords: ['shoulders', 'trapezius', 'traps', 'upper back', 'shoulder blade', 'scapula', 'hunched']
    },

    tongue: {
        area: 'Tongue & Tongue Root',
        exercises: ['warmup-tongue-pulls', 'massage-suprahyoid', 'res-ng-glide', 'warmup-humming'],
        description: 'Tongue root tension is very common and directly affects resonance and vocal effort. The tongue connects to the hyoid bone and larynx.',
        keywords: ['tongue', 'tongue root', 'tongue base', 'hyoid', 'under chin', 'floor of mouth']
    },

    face: {
        area: 'Face & Facial Muscles',
        exercises: ['massage-jaw', 'warmup-lip-trills', 'singing-puffy-cheeks', 'warmup-humming'],
        description: 'Facial tension can restrict articulation and resonance. Relaxed facial muscles allow for more natural, efficient voice production.',
        keywords: ['face', 'facial', 'cheeks', 'lips', 'forehead', 'eyes', 'nose', 'sinuses']
    },

    chest: {
        area: 'Chest & Breathing',
        exercises: ['breath-hiss', 'accent-diaphragm-breath', 'singing-farinelli', 'singing-pant'],
        description: 'Chest tension can restrict breathing and reduce breath support. Proper breathing is fundamental to healthy voice production.',
        keywords: ['chest', 'ribs', 'sternum', 'breath', 'breathing', 'diaphragm', 'lungs', 'tight chest']
    },

    whole: {
        area: 'General Relaxation',
        exercises: ['warmup-lip-trills', 'warmup-humming', 'warmup-yawn-breath', 'weight-airy-sigh', 'massage-circumlaryngeal'],
        description: 'Overall body tension affects voice. Starting with gentle warmups and breathwork helps release global tension patterns.',
        keywords: ['everywhere', 'all over', 'whole body', 'entire body', 'general', 'overall', 'stressed', 'tense', 'tight']
    }
};

/**
 * Get all keywords across all areas for fuzzy matching
 */
export const getAllKeywords = () => {
    const keywords = [];
    Object.values(BODY_TENSION_MAP).forEach(area => {
        keywords.push(...area.keywords, area.area.toLowerCase());
    });
    return keywords;
};

/**
 * Quick lookup for common synonyms
 */
export const TENSION_SYNONYMS = {
    'tmj': 'jaw',
    'voice box': 'throat',
    'adam\'s apple': 'throat',
    'traps': 'shoulders',
    'upper back': 'shoulders',
    'scm': 'neck',
    'tongue base': 'tongue',
    'tongue root': 'tongue',
    'under chin': 'tongue',
    'diaphragm': 'chest',
    'ribs': 'chest',
    'breathing': 'chest',
    'facial': 'face',
    'sinuses': 'face'
};
