/**
 * IPA Converter Utility
 * Converts English text to Broad IPA (International Phonetic Alphabet)
 * Uses a dictionary-based approach with rule-based fallbacks
 */

// Common English to IPA dictionary (Subset for demo)
// In a full app, this would be a larger JSON file or API
const IPA_DICT = {
    "the": "ðə",
    "quick": "kwɪk",
    "brown": "braʊn",
    "fox": "fɒks",
    "jumps": "dʒʌmps",
    "over": "ˈəʊvə",
    "lazy": "ˈleɪzi",
    "dog": "dɒg",
    "hello": "həˈləʊ",
    "world": "wɜːld",
    "voice": "vɔɪs",
    "training": "ˈtreɪnɪŋ",
    "pitch": "pɪtʃ",
    "resonance": "ˈrezənəns",
    "see": "siː",
    "she": "ʃiː",
    "s": "ɛs",
    "sh": "ʃ",
    "seat": "siːt",
    "sheet": "ʃiːt",
    "sip": "sɪp",
    "ship": "ʃɪp",
    "save": "seɪv",
    "shave": "ʃeɪv",
    "sue": "suː",
    "shoe": "ʃuː",
    "sock": "sɒk",
    "shock": "ʃɒk",
    "fizz": "fɪz",
    "fish": "fɪʃ",
    "lease": "liːs",
    "leash": "liːʃ",
    "mess": "mes",
    "mesh": "meʃ",
    "class": "klɑːs",
    "clash": "klæʃ"
};

// Simple rule-based fallback for unknown words
const RULES = [
    { regex: /sh/g, replacement: 'ʃ' },
    { regex: /ch/g, replacement: 'tʃ' },
    { regex: /th/g, replacement: 'θ' }, // or ð
    { regex: /ng/g, replacement: 'ŋ' },
    { regex: /ee/g, replacement: 'iː' },
    { regex: /oo/g, replacement: 'uː' },
    { regex: /a/g, replacement: 'æ' }, // Default 'a'
    { regex: /e/g, replacement: 'e' },
    { regex: /i/g, replacement: 'ɪ' },
    { regex: /o/g, replacement: 'ɒ' },
    { regex: /u/g, replacement: 'ʌ' },
    { regex: /y$/g, replacement: 'i' }
];

export const convertToIPA = (text) => {
    if (!text) return '';

    const words = text.toLowerCase().split(/\s+/);

    const ipaWords = words.map(word => {
        // Clean punctuation
        const cleanWord = word.replace(/[.,!?;:"()]/g, '');

        // Check dictionary
        if (IPA_DICT[cleanWord]) {
            return IPA_DICT[cleanWord];
        }

        // Apply fallback rules
        let ipa = cleanWord;
        RULES.forEach(rule => {
            ipa = ipa.replace(rule.regex, rule.replacement);
        });

        return `[${ipa}]`; // Mark generated IPA with brackets
    });

    return ipaWords.join(' ');
};

export const isSibilantWord = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return lower.includes('s') || lower.includes('sh') || lower.includes('z') || lower.includes('ch') || lower.includes('j');
};
