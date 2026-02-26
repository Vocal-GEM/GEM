/**
 * AICoachService - Personalized AI coaching and curriculum generation
 */

import { getActivitySummary, getReports } from './SessionReportService';
import { getStreakData } from './StreakService';
import { generateVoiceFingerprint } from './AdvancedAnalyticsService';
import { TRAINING_CATEGORIES } from '../data/trainingData';
import TechniqueRecognizer from './TechniqueRecognizer';
import ErrorPatternDetector from './ErrorPatternDetector';

// --- Existing Helper Functions (kept for backward compatibility) ---

/**
 * Analyze user's practice patterns and weaknesses
 */
export const analyzeUserProgress = () => {
    const reports = getReports();
    const streak = getStreakData();
    const fingerprint = generateVoiceFingerprint();

    // Count exercises by category
    const categoryStats = {};
    TRAINING_CATEGORIES.forEach(cat => {
        categoryStats[cat.id] = { completed: 0, category: cat };
    });

    reports.forEach(report => {
        if (report.exercises) {
            report.exercises.forEach(ex => {
                TRAINING_CATEGORIES.forEach(cat => {
                    if (cat.exercises.some(e => e.id === ex.id)) {
                        categoryStats[cat.id].completed++;
                    }
                });
            });
        }
    });

    // Find weak categories (least practiced)
    const weakCategories = Object.entries(categoryStats)
        .sort((a, b) => a[1].completed - b[1].completed)
        .slice(0, 3)
        .map(([id, data]) => ({ id, ...data }));

    // Find strong categories
    const strongCategories = Object.entries(categoryStats)
        .sort((a, b) => b[1].completed - a[1].completed)
        .slice(0, 2)
        .map(([id, data]) => ({ id, ...data }));

    return {
        totalSessions: reports.length,
        streak,
        fingerprint,
        weakCategories,
        strongCategories,
        categoryStats
    };
};

/**
 * Generate personalized weekly curriculum
 */
export const generateWeeklyCurriculum = () => {
    const progress = analyzeUserProgress();
    const curriculum = {
        weekOf: new Date().toISOString(),
        days: []
    };

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    daysOfWeek.forEach((day, idx) => {
        const dayPlan = {
            day,
            focus: '',
            exercises: [],
            targetMinutes: 15
        };

        if (idx < 2) {
            // First two days: Focus on weak areas
            const weakCat = progress.weakCategories[idx % progress.weakCategories.length];
            if (weakCat?.category) {
                dayPlan.focus = `Focus: ${weakCat.category.title}`;
                dayPlan.exercises = selectExercises(weakCat.id, 3);
            }
        } else if (idx === 2 || idx === 4) {
            // Mid-week: Resonance focus
            dayPlan.focus = 'Resonance Training';
            dayPlan.exercises = selectExercises('resonance', 3);
        } else if (idx === 3) {
            // Thursday: Pitch work
            dayPlan.focus = 'Pitch Practice';
            dayPlan.exercises = selectExercises('pitch', 3);
        } else if (idx === 5) {
            // Saturday: Fun exercises
            dayPlan.focus = 'Creative Practice';
            dayPlan.exercises = [
                ...selectExercises('sovte', 2),
                ...selectExercises('performance', 1)
            ];
            dayPlan.targetMinutes = 20;
        } else {
            // Sunday: Rest day / Light practice
            dayPlan.focus = 'Rest Day - Light Practice';
            dayPlan.exercises = selectExercises('relaxation', 2);
            dayPlan.targetMinutes = 10;
        }

        curriculum.days.push(dayPlan);
    });

    return curriculum;
};

/**
 * Select random exercises from a category
 */
const selectExercises = (categoryId, count) => {
    const category = TRAINING_CATEGORIES.find(c => c.id === categoryId);
    if (!category || !category.exercises) {
        return [];
    }

    const shuffled = [...category.exercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(ex => ({
        id: ex.id,
        title: ex.title,
        duration: 5
    }));
};

/**
 * Generate real-time coaching feedback based on pitch/formants
 * Preserved for legacy components, but ContextAwareCoach is preferred
 */
export const generateCoachingFeedback = (metrics) => {
    const feedback = [];
    const fingerprint = generateVoiceFingerprint();

    // Pitch feedback
    if (metrics.pitch) {
        if (metrics.pitch < 160) {
            feedback.push({
                type: 'pitch',
                severity: 'suggestion',
                message: 'Try raising your pitch slightly. Aim for the 180-220 Hz range.'
            });
        } else if (metrics.pitch > 280) {
            feedback.push({
                type: 'pitch',
                severity: 'suggestion',
                message: 'Your pitch is quite high. Find a comfortable sustainable range.'
            });
        } else if (metrics.pitch >= 180 && metrics.pitch <= 220) {
            feedback.push({
                type: 'pitch',
                severity: 'praise',
                message: 'Great pitch placement! You\'re in a feminine speech range.'
            });
        }
    }

    // Resonance feedback based on F2
    if (metrics.f2) {
        if (metrics.f2 < 1500) {
            feedback.push({
                type: 'resonance',
                severity: 'suggestion',
                message: 'Bring your resonance forward. Think "bright" and frontal.'
            });
        } else if (metrics.f2 > 1800) {
            feedback.push({
                type: 'resonance',
                severity: 'praise',
                message: 'Excellent forward resonance! Keep that brightness.'
            });
        }
    }

    // Stability feedback
    if (fingerprint && fingerprint.stability.f2 < 60) {
        feedback.push({
            type: 'stability',
            severity: 'tip',
            message: 'Focus on consistency. Try to maintain the same resonance throughout.'
        });
    }

    return feedback;
};

/**
 * Get today's personalized recommendation
 */
export const getTodayRecommendation = () => {
    const progress = analyzeUserProgress();
    const streak = progress.streak;

    // Different recommendations based on context
    if (streak.currentStreak === 0) {
        return {
            title: 'Start Fresh',
            message: 'Let\'s begin with gentle warm-ups to rebuild your practice habit.',
            category: 'breathing',
            urgency: 'normal'
        };
    }

    if (streak.currentStreak >= 7) {
        return {
            title: 'Challenge Yourself',
            message: 'Great streak! Try pushing your range with advanced exercises.',
            category: progress.weakCategories[0]?.id || 'pitch',
            urgency: 'normal'
        };
    }

    if (progress.weakCategories.length > 0) {
        const weak = progress.weakCategories[0];
        return {
            title: `Focus on ${weak.category?.title || 'Practice'}`,
            message: `You haven't practiced this area much. Let's work on it today.`,
            category: weak.id,
            urgency: 'suggested'
        };
    }

    return {
        title: 'Balanced Practice',
        message: 'You\'re doing great! Keep up the varied practice.',
        category: 'resonance',
        urgency: 'normal'
    };
};


// --- New Context-Aware Coach Class ---

export class ContextAwareCoach {
    constructor(profileContext, historyContext) {
        this.profile = profileContext || {};
        this.history = historyContext || {};
        this.conversationHistory = [];
    }

    /**
     * Build full context object for AI
     */
    buildContext(userState) {
        const progress = analyzeUserProgress();

        return {
            // Current session context
            session: {
                currentExercise: userState.currentExercise || 'Free Practice',
                timeInSession: userState.sessionDuration || 0,
                recentMetrics: userState.last5Readings || [],
                currentMood: userState.moodCheck || 'neutral',
                detectedTechnique: userState.detectedTechnique || null
            },

            // Historical context
            history: {
                sessionsThisWeek: progress.streak.count || 0,
                streakDays: progress.streak.currentStreak || 0,
                recentErrors: ErrorPatternDetector.getErrorPatternStats().topErrors,
                recentAchievements: progress.streak.milestones || []
            },

            // Profile context
            profile: {
                voiceGoal: this.profile.voiceGoal || 'feminine_voice',
                experienceLevel: this.profile.experienceLevel || 'beginner',
                preferredStyle: this.profile.coachingStyle || 'encouraging',
                name: this.profile.name || 'Student'
            }
        };
    }

    /**
     * Generate system prompt for AI
     */
    buildSystemPrompt(context) {
        const personaPrompts = {
            encouraging: "You are a warm, supportive voice coach. Celebrate every small win. Use positive reinforcement.",
            technical: "You are a precise, technical voice coach. Focus on acoustics, physiology, and actionable mechanics.",
            balanced: "You are a balanced voice coach. Combine technical accuracy with supportive encouragement."
        };

        const basePrompt = personaPrompts[context.profile.preferredStyle] || personaPrompts.balanced;

        // Ensure voice goal is defined to prevent undefined access
        const voiceGoal = context.profile.voiceGoal || 'feminine_voice';

        let goalContext = "";
        if (voiceGoal === 'feminine_voice') {
            goalContext = "The user's goal is voice feminization. Focus on raising pitch resonance (R1), increasing pitch (F0), and lightening vocal weight.";
        } else if (voiceGoal === 'masculine_voice') {
            goalContext = "The user's goal is voice masculinization. Focus on lowering resonance, lowering pitch, and increasing vocal weight.";
        }

        let sessionContext = `User is currently doing: ${context.session.currentExercise}.`;
        if (context.session.detectedTechnique) {
            sessionContext += ` I detect they are performing: ${context.session.detectedTechnique.technique} (Confidence: ${(context.session.detectedTechnique.confidence * 100).toFixed(0)}%).`;
        }

        let errorContext = "";
        if (context.history.recentErrors && context.history.recentErrors.length > 0) {
            errorContext = `Recent struggle areas: ${context.history.recentErrors.map(e => e.type.replace('_', ' ')).join(', ')}. Offer tips to help with these if relevant.`;
        }

        return `${basePrompt}
        
${goalContext}

${sessionContext}

${errorContext}

Streak: ${context.history.streakDays} days.
Experience Level: ${context.profile.experienceLevel}.

Keep responses concise (under 2 sentences) unless asked for a detailed explanation.`;
    }

    /**
     * Analyze audio buffer for technique and errors
     */
    analyzeAudio(audioData) {
        // 1. Detect Technique
        const technique = TechniqueRecognizer.recognizeTechnique(audioData);

        // 2. Detect Errors
        const errors = ErrorPatternDetector.analyzeSession({
            pitchHistory: audioData.pitchHistory,
            amplitudeHistory: audioData.amplitudeHistory || [],
            resonanceHistory: audioData.resonanceHistory || [],
            currentMetrics: audioData.metrics
        });

        // 3. Record Errors
        if (errors.length > 0) {
            ErrorPatternDetector.recordSessionErrors(errors);
        }

        return {
            technique,
            errors,
            feedback: technique.feedback
        };
    }

    /**
     * Get response from AI (Simulated for now, would connect to backend)
     */
    async getResponse(userMessage, userState = {}) {
        const context = this.buildContext(userState);
        const systemPrompt = this.buildSystemPrompt(context);

        // Add to history
        this.conversationHistory.push({ role: 'user', content: userMessage });

        // TODO: Replace with actual API call to backend
        // const response = await fetch('/api/coach/chat', ...);

        // Simulated response logic for prototype
        let aiContent = "I'm listening. Tell me more about how that felt.";

        if (userMessage.toLowerCase().includes('pitch')) {
            aiContent = "For pitch, focus on where you feel the buzzing sensation. For a higher pitch, try to feel it in your nose or forehead.";
        } else if (userMessage.toLowerCase().includes('tired')) {
            aiContent = "If you're feeling tired, that's a sign to take a break. Vocal fatigue is real. Let's do some gentle lip trills or just rest.";
        } else if (context.session.detectedTechnique && context.session.detectedTechnique.technique !== 'unknown') {
            aiContent = `I hear you doing ${context.session.detectedTechnique.technique}. ${context.session.detectedTechnique.feedback}`;
        } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
            aiContent = "Hello! Ready to work on your voice today? What's your focus?";
        }

        // Add to history
        this.conversationHistory.push({ role: 'assistant', content: aiContent });

        return {
            message: aiContent,
            contextUsed: context
        };
    }
}

export default {
    generateWeeklyCurriculum,
    generateCoachingFeedback,
    getTodayRecommendation,
    analyzeUserProgress,
    ContextAwareCoach
};
