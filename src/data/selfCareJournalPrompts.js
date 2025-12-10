/**
 * Self-Care Journal Prompts
 * Optional prompts for journal entries related to voice training wellness
 */

export const SELF_CARE_JOURNAL_PROMPTS = [
    // Reflection prompts
    {
        id: 'body-check',
        category: 'Self-Awareness',
        prompt: "What physical sensations am I noticing right now? Any tension, fatigue, or discomfort?",
        icon: '💆'
    },
    {
        id: 'emotional-check',
        category: 'Self-Awareness',
        prompt: "How am I feeling emotionally about my voice practice today?",
        icon: '💭'
    },
    {
        id: 'wins',
        category: 'Progress',
        prompt: "What went well in my practice today? Even small wins count!",
        icon: '✨'
    },
    {
        id: 'challenges',
        category: 'Progress',
        prompt: "What felt challenging? What would I like to try differently next time?",
        icon: '🔄'
    },
    {
        id: 'stuck',
        category: 'Troubleshooting',
        prompt: "Am I feeling stuck anywhere? What might help me move forward?",
        icon: '🚧'
    },
    {
        id: 'support',
        category: 'Community',
        prompt: "Who could I reach out to for support or encouragement right now?",
        icon: '🤝'
    },
    {
        id: 'gratitude',
        category: 'Mindset',
        prompt: "What am I grateful for in my voice journey, even if things are hard?",
        icon: '💜'
    },
    {
        id: 'boundaries',
        category: 'Self-Care',
        prompt: "Did I respect my limits today? Did I push too hard or stop when I needed to?",
        icon: '⚖️'
    },
    {
        id: 'next-session',
        category: 'Planning',
        prompt: "What would I like to focus on in my next practice session?",
        icon: '📍'
    },
    {
        id: 'kind-words',
        category: 'Self-Compassion',
        prompt: "What would I say to a friend who is where I am in their voice journey?",
        icon: '💛'
    }
];

// Grouped by category for UI
export const JOURNAL_PROMPT_CATEGORIES = [
    { id: 'Self-Awareness', label: 'Self-Awareness', icon: '🔍' },
    { id: 'Progress', label: 'Progress & Growth', icon: '📈' },
    { id: 'Troubleshooting', label: 'Troubleshooting', icon: '🔧' },
    { id: 'Community', label: 'Community & Support', icon: '🌐' },
    { id: 'Mindset', label: 'Mindset', icon: '🧠' },
    { id: 'Self-Care', label: 'Self-Care', icon: '💆' },
    { id: 'Planning', label: 'Planning', icon: '📋' },
    { id: 'Self-Compassion', label: 'Self-Compassion', icon: '💜' }
];

/**
 * Get a random prompt, optionally filtered by category
 */
export const getRandomPrompt = (category = null) => {
    let prompts = SELF_CARE_JOURNAL_PROMPTS;
    if (category) {
        prompts = prompts.filter(p => p.category === category);
    }
    return prompts[Math.floor(Math.random() * prompts.length)];
};

/**
 * Get prompts by category
 */
export const getPromptsByCategory = (category) => {
    return SELF_CARE_JOURNAL_PROMPTS.filter(p => p.category === category);
};
