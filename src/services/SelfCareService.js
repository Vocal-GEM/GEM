/**
 * SelfCareService.js
 * Stores and manages user's self-care plan and wellness data.
 * Based on the foundational self-care checklist for voice feminization work.
 */

const STORAGE_KEY = 'gem_self_care_plan';
const WELLNESS_LOG_KEY = 'gem_wellness_log';

// The 5 reflection prompts from the self-care curriculum
export const SELF_CARE_PROMPTS = [
    {
        id: 'body-signals',
        question: "How will my body tell me when I'm reaching my emotional or physical limits?",
        hint: "Think about physical sensations: tension in chest, throat, stomach, feeling tired, distracted, or wanting to avoid practice.",
        placeholder: "e.g., I feel tension in my shoulders, I start getting distracted, my throat gets sore...",
        icon: '💆'
    },
    {
        id: 'process-feelings',
        question: "What actions can I take to process feelings that come up during this work?",
        hint: "This could be journaling, talking to a friend, going for a walk, stretching, taking a nap, or reaching out to community.",
        placeholder: "e.g., I'll journal, take a walk, message a friend, or post in the community...",
        icon: '💭'
    },
    {
        id: 'feeling-stuck',
        question: "What will I do when I feel stuck in this work?",
        hint: "It's not IF you feel stuck, it's WHEN. Maybe take a break, ask for help, try a different exercise, or accept a plateau period.",
        placeholder: "e.g., I'll take a few days off, ask in the community, or try a different approach...",
        icon: '🔄'
    },
    {
        id: 'support-people',
        question: "Who can I invite into my life to support me during this process?",
        hint: "Friends, family, chosen family, online community, a private teacher, or others doing this work.",
        placeholder: "e.g., My partner, my best friend, people in online trans communities...",
        icon: '🤝'
    },
    {
        id: 'find-community',
        question: "How can I find and connect with people who are also doing this work?",
        hint: "Discord servers, TikTok comments, local trans organizations, voice training communities.",
        placeholder: "e.g., Join Discord communities, follow voice teachers on social media, local LGBTQ+ groups...",
        icon: '🌐'
    }
];

// Resources referenced in the curriculum
// Resources referenced in the curriculum
export const SELF_CARE_RESOURCES = [];

class SelfCareServiceClass {
    /**
     * Get stored self-care plan
     * @returns {Object|null} The self-care plan or null
     */
    getSelfCarePlan() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('[SelfCare] Failed to load plan:', e);
            return null;
        }
    }

    /**
     * Save self-care plan
     * @param {Object} plan - Object with prompt ID keys and answer values
     */
    saveSelfCarePlan(plan) {
        try {
            const data = {
                ...plan,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            console.log('[SelfCare] Plan saved:', data);
            return true;
        } catch (e) {
            console.error('[SelfCare] Failed to save plan:', e);
            return false;
        }
    }

    /**
     * Check if user has completed self-care plan
     */
    hasCompletedPlan() {
        const plan = this.getSelfCarePlan();
        if (!plan) return false;

        // Check if all prompts have answers
        return SELF_CARE_PROMPTS.every(p => plan[p.id] && plan[p.id].trim().length > 0);
    }

    /**
     * Clear self-care plan
     */
    clearPlan() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Get wellness log entries
     */
    getWellnessLog() {
        try {
            const stored = localStorage.getItem(WELLNESS_LOG_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('[SelfCare] Failed to load wellness log:', e);
            return [];
        }
    }

    /**
     * Log a wellness check (post-session)
     * @param {Object} entry - { fatigue: 1-5, tension: 1-5, mood: 1-5, notes: string }
     */
    logWellnessCheck(entry) {
        try {
            const log = this.getWellnessLog();
            const newEntry = {
                ...entry,
                timestamp: new Date().toISOString(),
                id: Date.now()
            };
            log.push(newEntry);

            // Keep only last 100 entries
            const trimmedLog = log.slice(-100);
            localStorage.setItem(WELLNESS_LOG_KEY, JSON.stringify(trimmedLog));

            return newEntry;
        } catch (e) {
            console.error('[SelfCare] Failed to log wellness check:', e);
            return null;
        }
    }

    /**
     * Get relevant self-care reminder based on context
     * @param {string} context - 'feeling-stuck' | 'fatigued' | 'long-session'
     */
    getSelfCareReminder(context) {
        const plan = this.getSelfCarePlan();
        if (!plan) return null;

        switch (context) {
            case 'feeling-stuck':
                return {
                    type: 'stuck',
                    title: "Feeling Stuck?",
                    message: "You planned for this moment. Here's what you told yourself to do:",
                    userAnswer: plan['feeling-stuck'],
                    icon: '🔄'
                };
            case 'fatigued':
                return {
                    type: 'fatigue',
                    title: "Time for a Break?",
                    message: "You identified these signs that you need rest:",
                    userAnswer: plan['body-signals'],
                    icon: '💆'
                };
            case 'long-session':
                return {
                    type: 'break',
                    title: "You've Been Practicing a While!",
                    message: "Remember: the voice will always find a way to compensate—to its detriment. Consider a break.",
                    userAnswer: plan['process-feelings'],
                    icon: '⏰'
                };
            default:
                return null;
        }
    }

    /**
     * Check if user hasn't practiced recently (potential "stuck" state)
     * @param {number} daysSinceLastSession - Days since last practice
     */
    shouldShowStuckReminder(daysSinceLastSession) {
        return daysSinceLastSession >= 7;
    }
}

// Singleton export
export const SelfCareService = new SelfCareServiceClass();
