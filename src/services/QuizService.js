/**
 * QuizService - Spaced Repetition System for Quiz Questions
 * 
 * Implements a simplified SM-2 algorithm for optimal learning retention.
 * Questions progress through states: new → learning → reviewing → mastered
 * 
 * Module-based progression: Users must master module 1 questions before
 * unlocking module 2, following the Feminization Course structure.
 */

import { quizQuestions, getQuestionsByModule } from '../data/quizQuestions';

const STORAGE_KEY = 'gem_quiz_progress';

// Module order matching the course structure
export const MODULE_ORDER = [
    'pitch',        // Module 1: Pitch & Fundamental Frequency
    'formants',     // Module 2: Vocal Formants
    'resonance',    // Module 3: Resonance & Brightness
    'voice-quality',// Module 4: Voice Quality & Timbre
    'intonation',   // Module 5: Intonation & Prosody
    'articulation', // Module 6: Articulation & Speech
    'anatomy',      // Module 7: Vocal Anatomy
    'perception'    // Module 8: Gender Perception
];

export const MODULE_NAMES = {
    'pitch': 'Pitch & Fundamental Frequency',
    'formants': 'Vocal Formants',
    'resonance': 'Resonance & Brightness',
    'voice-quality': 'Voice Quality & Timbre',
    'intonation': 'Intonation & Prosody',
    'articulation': 'Articulation & Speech',
    'anatomy': 'Vocal Anatomy',
    'perception': 'Gender Perception'
};

// Question states
export const QuestionState = {
    NEW: 'new',
    LEARNING: 'learning',
    REVIEWING: 'reviewing',
    MASTERED: 'mastered'
};

// Default question progress
const defaultQuestionProgress = {
    attempts: 0,
    correctCount: 0,
    consecutiveCorrect: 0,
    lastAttempt: null,
    interval: 0, // days until next review
    easeFactor: 2.5,
    dueDate: null,
    state: QuestionState.NEW
};

// Default stats
const defaultStats = {
    totalCorrect: 0,
    totalAttempted: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastSessionDate: null,
    currentModuleIndex: 0, // Start at module 1 (index 0)
    sessionsCompleted: 0
};

class QuizService {
    constructor() {
        this.progress = this.loadProgress();
    }

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading quiz progress:', e);
        }
        return {
            questions: {},
            stats: { ...defaultStats }
        };
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
        } catch (e) {
            console.error('Error saving quiz progress:', e);
        }
    }

    /**
     * Get or create progress for a question
     */
    getQuestionProgress(questionId) {
        if (!this.progress.questions[questionId]) {
            this.progress.questions[questionId] = { ...defaultQuestionProgress };
        }
        return this.progress.questions[questionId];
    }

    /**
     * Get current stats
     */
    getStats() {
        return { ...this.progress.stats };
    }

    /**
     * Get current module ID based on progress
     */
    getCurrentModuleId() {
        const moduleIndex = this.progress.stats.currentModuleIndex || 0;
        return MODULE_ORDER[Math.min(moduleIndex, MODULE_ORDER.length - 1)];
    }

    /**
     * Check if a module is fully mastered
     */
    isModuleMastered(moduleId) {
        const moduleQuestions = getQuestionsByModule(moduleId);
        return moduleQuestions.every(q => {
            const progress = this.progress.questions[q.id];
            return progress && progress.state === QuestionState.MASTERED;
        });
    }

    /**
     * Get module progress stats
     */
    getModuleProgress(moduleId) {
        const moduleQuestions = getQuestionsByModule(moduleId);
        let mastered = 0;
        let learning = 0;
        let notStarted = 0;

        moduleQuestions.forEach(q => {
            const progress = this.progress.questions[q.id];
            if (!progress || progress.state === QuestionState.NEW) {
                notStarted++;
            } else if (progress.state === QuestionState.MASTERED) {
                mastered++;
            } else {
                learning++;
            }
        });

        return {
            moduleId,
            moduleName: MODULE_NAMES[moduleId],
            total: moduleQuestions.length,
            mastered,
            learning,
            notStarted,
            isComplete: mastered === moduleQuestions.length,
            percentComplete: Math.round((mastered / moduleQuestions.length) * 100)
        };
    }

    /**
     * Get questions for the next quiz session
     * Uses module-based progression: starts with current module,
     * prioritizing due reviews, then learning, then new questions
     * @param {number} count - Number of questions to return
     */
    getNextQuestions(count = 10) {
        const now = new Date();

        // Check if current module is mastered and advance if needed
        this.checkAndAdvanceModule();

        const currentModuleId = this.getCurrentModuleId();
        const moduleQuestions = getQuestionsByModule(currentModuleId);

        // Categorize questions from current module
        const dueReviews = [];
        const learning = [];
        const newQuestions = [];

        moduleQuestions.forEach(q => {
            const progress = this.progress.questions[q.id];

            if (!progress || progress.state === QuestionState.NEW) {
                newQuestions.push(q);
            } else if (progress.state === QuestionState.MASTERED) {
                // Include mastered questions that are due for review
                if (progress.dueDate && new Date(progress.dueDate) <= now) {
                    dueReviews.push(q);
                }
            } else if (progress.state === QuestionState.REVIEWING) {
                if (!progress.dueDate || new Date(progress.dueDate) <= now) {
                    dueReviews.push(q);
                }
            } else if (progress.state === QuestionState.LEARNING) {
                learning.push(q);
            }
        });

        // Shuffle arrays for variety
        const shuffle = arr => arr.sort(() => Math.random() - 0.5);
        shuffle(dueReviews);
        shuffle(learning);
        shuffle(newQuestions);

        // Combine prioritizing due reviews, then learning, then new
        const combined = [...dueReviews, ...learning, ...newQuestions];

        return combined.slice(0, count);
    }

    /**
     * Check if current module is mastered and advance to next
     */
    checkAndAdvanceModule() {
        const currentModuleId = this.getCurrentModuleId();
        const currentIndex = this.progress.stats.currentModuleIndex || 0;

        if (this.isModuleMastered(currentModuleId) && currentIndex < MODULE_ORDER.length - 1) {
            this.progress.stats.currentModuleIndex = currentIndex + 1;
            this.saveProgress();
            return {
                advanced: true,
                newModuleId: MODULE_ORDER[currentIndex + 1],
                newModuleName: MODULE_NAMES[MODULE_ORDER[currentIndex + 1]]
            };
        }
        return { advanced: false };
    }

    /**
     * Record an answer and update question state
     * @param {string} questionId 
     * @param {boolean} isCorrect 
     */
    recordAnswer(questionId, isCorrect) {
        const progress = this.getQuestionProgress(questionId);
        const stats = this.progress.stats;
        const now = new Date();

        // Update attempt counts
        progress.attempts++;
        progress.lastAttempt = now.toISOString();
        stats.totalAttempted++;

        if (isCorrect) {
            progress.correctCount++;
            progress.consecutiveCorrect++;
            stats.totalCorrect++;
            stats.currentStreak++;

            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }

            // Update state based on consecutive correct answers
            if (progress.state === QuestionState.NEW) {
                progress.state = QuestionState.LEARNING;
                progress.interval = 1;
            } else if (progress.state === QuestionState.LEARNING) {
                if (progress.consecutiveCorrect >= 2) {
                    progress.state = QuestionState.REVIEWING;
                    progress.interval = 3;
                } else {
                    progress.interval = 1;
                }
            } else if (progress.state === QuestionState.REVIEWING) {
                if (progress.consecutiveCorrect >= 4) {
                    progress.state = QuestionState.MASTERED;
                    progress.interval = 7;
                } else {
                    // Increase interval with ease factor
                    progress.interval = Math.round(progress.interval * progress.easeFactor);
                }
                // Increase ease factor (max 2.5)
                progress.easeFactor = Math.min(2.5, progress.easeFactor + 0.1);
            } else if (progress.state === QuestionState.MASTERED) {
                // Mastered questions get longer intervals
                progress.interval = Math.round(progress.interval * progress.easeFactor);
            }
        } else {
            // Wrong answer
            progress.consecutiveCorrect = 0;
            stats.currentStreak = 0;

            // Decrease ease factor (min 1.3)
            progress.easeFactor = Math.max(1.3, progress.easeFactor - 0.2);

            // Reset to learning state if was reviewing/mastered
            if (progress.state === QuestionState.MASTERED || progress.state === QuestionState.REVIEWING) {
                progress.state = QuestionState.LEARNING;
            }

            // Short interval for relearning
            progress.interval = 1;
        }

        // Calculate next due date
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + progress.interval);
        progress.dueDate = dueDate.toISOString();

        this.saveProgress();

        return {
            isCorrect,
            newState: progress.state,
            consecutiveCorrect: progress.consecutiveCorrect,
            streak: stats.currentStreak
        };
    }

    /**
     * Complete a quiz session and check for module advancement
     * @param {number} correctInSession - Number of correct answers in this session
     */
    completeSession(correctInSession) {
        const stats = this.progress.stats;
        stats.lastSessionDate = new Date().toISOString();
        stats.sessionsCompleted++;

        // Check if module advanced
        const advancement = this.checkAndAdvanceModule();

        this.saveProgress();

        return {
            correctInSession,
            moduleAdvanced: advancement.advanced,
            newModuleId: advancement.newModuleId || null,
            newModuleName: advancement.newModuleName || null,
            currentModuleId: this.getCurrentModuleId(),
            currentModuleName: MODULE_NAMES[this.getCurrentModuleId()]
        };
    }

    /**
     * Get progress summary with module information
     */
    getProgressSummary() {
        const stats = this.progress.stats;
        const currentModuleId = this.getCurrentModuleId();
        const currentModuleIndex = stats.currentModuleIndex || 0;

        let totalMastered = 0;
        let totalLearning = 0;
        let totalNew = 0;

        // Calculate overall progress
        quizQuestions.forEach(q => {
            const progress = this.progress.questions[q.id];
            if (!progress || progress.state === QuestionState.NEW) {
                totalNew++;
            } else if (progress.state === QuestionState.MASTERED) {
                totalMastered++;
            } else {
                totalLearning++;
            }
        });

        // Get current module progress
        const currentModuleProgress = this.getModuleProgress(currentModuleId);

        // Get all module progress for display
        const allModulesProgress = MODULE_ORDER.map((moduleId, index) => ({
            ...this.getModuleProgress(moduleId),
            isUnlocked: index <= currentModuleIndex,
            isCurrent: index === currentModuleIndex
        }));

        return {
            totalQuestions: quizQuestions.length,
            totalMastered,
            totalLearning,
            totalNew: quizQuestions.length - totalMastered - totalLearning,
            totalCorrect: stats.totalCorrect,
            totalAttempted: stats.totalAttempted,
            accuracy: stats.totalAttempted > 0
                ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100)
                : 0,
            currentStreak: stats.currentStreak,
            bestStreak: stats.bestStreak,
            sessionsCompleted: stats.sessionsCompleted,
            // Module-specific info
            currentModuleId,
            currentModuleName: MODULE_NAMES[currentModuleId],
            currentModuleIndex: currentModuleIndex + 1, // 1-indexed for display
            totalModules: MODULE_ORDER.length,
            currentModuleProgress,
            allModulesProgress
        };
    }

    /**
     * Get due questions count for current module
     */
    getDueCount() {
        const now = new Date();
        let dueCount = 0;

        const currentModuleId = this.getCurrentModuleId();
        const moduleQuestions = getQuestionsByModule(currentModuleId);

        moduleQuestions.forEach(q => {
            const progress = this.progress.questions[q.id];
            if (!progress || progress.state === QuestionState.NEW) {
                dueCount++;
            } else if (progress.dueDate && new Date(progress.dueDate) <= now) {
                dueCount++;
            } else if (progress.state === QuestionState.LEARNING) {
                dueCount++;
            }
        });

        return dueCount;
    }

    /**
     * Reset all progress (for testing)
     */
    resetProgress() {
        this.progress = {
            questions: {},
            stats: { ...defaultStats }
        };
        this.saveProgress();
    }
}

// Export singleton instance
export const quizService = new QuizService();
export default quizService;
