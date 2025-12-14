/**
 * journalTemplates.js
 * 
 * Pre-made templates for voice journal entries.
 * Each template provides structured prompts for different journaling scenarios.
 */

export const JOURNAL_TEMPLATES = [
    {
        id: 'daily',
        name: 'Daily Practice',
        icon: '📝',
        color: 'blue',
        description: 'Reflect on your daily practice session',
        prompts: [
            'What exercises did you work on today?',
            'How did your voice feel during practice?',
            'Did you notice any improvements or challenges?',
            'What will you focus on in your next session?'
        ]
    },
    {
        id: 'milestone',
        name: 'Milestone Reached',
        icon: '🎉',
        color: 'green',
        description: 'Celebrate a voice training achievement',
        prompts: [
            'What milestone did you reach?',
            'How long have you been working toward this?',
            'How do you feel about this accomplishment?',
            'What helped you get here?',
            'What is your next goal?'
        ]
    },
    {
        id: 'challenge',
        name: 'Working Through a Challenge',
        icon: '💪',
        color: 'orange',
        description: 'Process a difficult moment in your training',
        prompts: [
            'What challenge are you facing?',
            'How is this affecting your practice?',
            'What have you tried so far?',
            'What support might help you?',
            'Remember: progress is not linear. What would you tell a friend in this situation?'
        ]
    },
    {
        id: 'emotions',
        name: 'Emotional Check-In',
        icon: '💭',
        color: 'purple',
        description: 'Process feelings that came up during practice',
        prompts: [
            'What emotions came up during practice?',
            'Were there any specific triggers?',
            'How did you respond to these feelings?',
            'What self-care will you practice today?'
        ]
    },
    {
        id: 'progress',
        name: 'Progress Reflection',
        icon: '📊',
        color: 'teal',
        description: 'Review how far you\'ve come',
        prompts: [
            'Compare your voice today to when you started. What changes do you notice?',
            'Which skills have improved the most?',
            'What are you most proud of?',
            'What would past-you think of your progress?'
        ]
    },
    {
        id: 'gratitude',
        name: 'Voice Gratitude',
        icon: '💖',
        color: 'pink',
        description: 'Practice gratitude for your voice',
        prompts: [
            'What are you grateful for about your voice today?',
            'How has your voice served you recently?',
            'What unique qualities does your voice have?',
            'Write a thank-you note to your voice.'
        ]
    },
    {
        id: 'freeform',
        name: 'Free Write',
        icon: '✍️',
        color: 'slate',
        description: 'Write whatever is on your mind',
        prompts: [
            'Write freely about your voice journey...'
        ]
    }
];

/**
 * Get a template by ID
 */
export const getTemplateById = (id) => {
    return JOURNAL_TEMPLATES.find(t => t.id === id) || JOURNAL_TEMPLATES[0];
};

/**
 * Format prompts into a journal entry starter
 */
export const formatTemplateAsEntry = (template) => {
    return template.prompts.map(prompt => `**${prompt}**\n\n`).join('\n');
};

export default JOURNAL_TEMPLATES;
