/**
 * CoachEngine.js
 * 
 * Enhanced rule-based expert system that analyzes voice metrics and generates 
 * qualitative, educational, and actionable feedback for the user.
 * 
 * Features:
 * - Pitch, Resonance, Stability, and Voice Quality analysis
 * - Contextual multi-metric feedback
 * - Actionable exercise recommendations with navigation
 * - Progress tracking support
 */

import { KnowledgeService } from '../services/KnowledgeService';

// Exercise mapping to actual app routes/components
const EXERCISE_MAP = {
    'Pitch Pipe': { route: '/tools', component: 'PitchPipe', difficulty: 'beginner', duration: 5 },
    'Pitch Staircase': { route: '/games', component: 'StaircaseGame', difficulty: 'intermediate', duration: 3 },
    'Vowel Practice': { route: '/articulation', component: 'ArticulationView', difficulty: 'beginner', duration: 10 },
    'Breath Support': { route: '/tools', component: 'BreathPacer', difficulty: 'beginner', duration: 5 },
    'Reading Practice': { route: '/practice', component: 'PracticeView', difficulty: 'intermediate', duration: 15 },
    'Resonance River': { route: '/games', component: 'ResonanceRiverGame', difficulty: 'intermediate', duration: 5 },
    'Intonation Exercise': { route: '/tools', component: 'IntonationExercise', difficulty: 'advanced', duration: 10 },
    'Forward Focus': { route: '/tools', component: 'ForwardFocusDrill', difficulty: 'intermediate', duration: 5 },
    'Warm Up': { route: '/tools', component: 'WarmUpModule', difficulty: 'beginner', duration: 5 },
    // Thin Fold Mass Exercises
    'Airy Sigh': { route: '/practice', component: 'ExerciseView', exerciseId: 'weight-airy-sigh', difficulty: 'beginner', duration: 2 },
    'High-to-Low Glide': { route: '/practice', component: 'ExerciseView', exerciseId: 'weight-high-low-glide', difficulty: 'beginner', duration: 2 },
    'Thin Fold Flow': { route: '/practice', component: 'ExerciseView', exerciseId: 'weight-thin-flow', difficulty: 'intermediate', duration: 3 }
};

// --- Helper Evaluation Functions ---

const evaluatePitch = (pitch, target) => {
    if (!pitch) return { status: 'unknown', score: 0, title: 'Pitch', message: "Could not detect pitch." };

    const { min, max } = target;
    const center = (min + max) / 2;
    const range = max - min;

    if (pitch >= min && pitch <= max) {
        // Within range - check how centered
        const deviation = Math.abs(pitch - center) / (range / 2);
        const score = deviation < 0.3 ? 10 : (deviation < 0.6 ? 9 : 8);
        return {
            status: 'good',
            score,
            title: 'Pitch',
            message: `Your average pitch (${pitch.toFixed(0)}Hz) is right in your target range.`,
            value: pitch
        };
    } else if (pitch < min) {
        const diff = min - pitch;
        const severity = diff > 30 ? 'significant' : (diff > 15 ? 'moderate' : 'slight');
        const score = severity === 'significant' ? 3 : (severity === 'moderate' ? 5 : 7);
        return {
            status: 'low',
            score,
            title: 'Pitch',
            message: `Your pitch (${pitch.toFixed(0)}Hz) is ${severity === 'significant' ? 'significantly' : severity === 'moderate' ? 'moderately' : 'slightly'} lower than your target (${min}Hz).`,
            value: pitch,
            target: min,
            diff: -diff
        };
    } else {
        const diff = pitch - max;
        const severity = diff > 30 ? 'significant' : (diff > 15 ? 'moderate' : 'slight');
        const score = severity === 'significant' ? 3 : (severity === 'moderate' ? 5 : 7);
        return {
            status: 'high',
            score,
            title: 'Pitch',
            message: `Your pitch (${pitch.toFixed(0)}Hz) is ${severity === 'significant' ? 'significantly' : severity === 'moderate' ? 'moderately' : 'slightly'} higher than your target (${max}Hz).`,
            value: pitch,
            target: max,
            diff: diff
        };
    }
};

const evaluateResonance = (formants, genderGoal, calibration) => {
    if (!formants || !formants.f1) return { status: 'unknown', score: 0, title: 'Resonance', message: "Could not detect resonance." };

    const { f1, f2 } = formants;
    let status = 'neutral';
    let score = 5;
    let message = "";
    let advice = "";

    // Use calibration if available for personalized thresholds
    // Default thresholds
    let thresholds = {
        fem: { f1: 450, f2: 1800 },
        masc: { f1: 350, f2: 1500 }
    };

    if (calibration) {
        // Interpolate or use calibration values
        // If user has calibrated 'bright' (fem target) and 'dark' (masc target)
        if (calibration.bright) {
            thresholds.fem.f1 = calibration.bright; // Simplified: using single value for F1 proxy
            // We might need to estimate F2 or just use F1 for now if calibration is simple
        }
        if (calibration.dark) {
            thresholds.masc.f1 = calibration.dark;
        }
    }

    if (genderGoal === 'feminine') {
        if (f1 > thresholds.fem.f1 && f2 > thresholds.fem.f2) {
            status = 'bright';
            score = 10;
            message = "Your resonance is bright and forward, which is excellent for a feminine voice.";
        } else if (f1 > (thresholds.fem.f1 - 50) && f2 > (thresholds.fem.f2 - 200)) {
            status = 'moderately-bright';
            score = 8;
            message = "Your resonance is fairly bright. You're on the right track!";
            advice = "Try raising your larynx slightly and smiling with your throat to brighten it further.";
        } else if (f1 < thresholds.masc.f1 || f2 < thresholds.masc.f2) {
            status = 'dark';
            score = 3;
            message = "Your resonance is quite dark (low R1). This can make your voice sound more masculine.";
            advice = "Focus on 'small dog' exercises - imagine a small dog barking in your throat. This raises the larynx and brightens resonance.";
        } else {
            status = 'neutral';
            score = 6;
            message = "Your resonance is in a neutral range.";
            advice = "Try to brighten it by raising your soft palate and creating more space in the front of your mouth.";
        }
    } else if (genderGoal === 'masculine') {
        if (f1 < thresholds.masc.f1 && f2 < thresholds.masc.f2) {
            status = 'dark';
            score = 10;
            message = "Your resonance is rich and dark, perfect for a masculine voice.";
        } else if (f1 < (thresholds.masc.f1 + 50) && f2 < (thresholds.masc.f2 + 200)) {
            status = 'moderately-dark';
            score = 8;
            message = "Your resonance is fairly dark. Good progress!";
            advice = "Try relaxing your throat and lowering your larynx slightly to darken it more.";
        } else if (f1 > thresholds.fem.f1 || f2 > thresholds.fem.f2) {
            status = 'bright';
            score = 3;
            message = "Your resonance is quite bright. This can make your voice sound more feminine.";
            advice = "Focus on creating more space in the back of your throat. Think 'big dog' - a deep, resonant bark.";
        } else {
            status = 'neutral';
            score = 6;
            message = "Your resonance is neutral.";
            advice = "Try to darken it by relaxing your throat and creating more space in the pharynx.";
        }
    } else {
        // Androgynous goal
        if (f1 >= thresholds.masc.f1 && f1 <= thresholds.fem.f1) {
            status = 'neutral';
            score = 10;
            message = "Your resonance is perfectly balanced in the androgynous range.";
        } else {
            status = f1 > thresholds.fem.f1 ? 'bright' : 'dark';
            score = 7;
            message = `Your resonance is slightly ${status}. For an androgynous voice, aim for the middle ground.`;
        }
    }

    return { status, score, title: 'Resonance', message, advice, f1, f2 };
};

const evaluateStability = (jitter, shimmer) => {
    if (jitter === undefined) return { status: 'unknown', score: 0, title: 'Stability' };

    // Jitter < 1% is good, shimmer < 3% is good
    const jitterScore = jitter < 1.0 ? 10 : (jitter < 2.0 ? 7 : (jitter < 3.5 ? 4 : 2));
    const shimmerScore = shimmer !== undefined ? (shimmer < 3.0 ? 10 : (shimmer < 6.0 ? 6 : 3)) : 10;

    const avgScore = Math.round((jitterScore + shimmerScore) / 2);

    if (avgScore >= 9) {
        return {
            status: 'stable',
            score: avgScore,
            title: 'Stability',
            message: "Your voice is very stable and clear.",
            jitter,
            shimmer
        };
    } else if (avgScore >= 6) {
        return {
            status: 'moderate',
            score: avgScore,
            title: 'Stability',
            message: "There is some slight wavering in your voice.",
            advice: "Focus on breath support and avoid pushing too hard. Gentle, supported airflow creates stability.",
            jitter,
            shimmer
        };
    } else {
        return {
            status: 'unstable',
            score: avgScore,
            title: 'Stability',
            message: "Your voice shows instability. This might be vocal fry, breathiness, or tension.",
            advice: "Practice breath support exercises and ensure you're not straining. Vocal fry often happens when pitch is too low for your anatomy.",
            jitter,
            shimmer
        };
    }
};

const evaluateVoiceQuality = (hnr, shimmer) => {
    if (hnr === undefined) return { status: 'unknown', score: 0, title: 'Voice Quality' };

    // HNR (Harmonics-to-Noise Ratio)
    // > 15 dB = Good (clear, resonant)
    // 10-15 dB = Moderate (some breathiness)
    // < 10 dB = Poor (very breathy or harsh)

    let status, score, message, advice;

    if (hnr > 15) {
        status = 'clear';
        score = 10;
        message = "Your voice quality is excellent - clear and resonant.";
    } else if (hnr > 12) {
        status = 'good';
        score = 8;
        message = "Your voice quality is good with minimal breathiness.";
    } else if (hnr > 10) {
        status = 'moderate';
        score = 6;
        message = "Your voice has some breathiness.";
        advice = "Try to engage your vocal folds more fully. Avoid whispery or overly breathy phonation.";
    } else {
        status = 'breathy';
        score = 3;
        message = "Your voice is quite breathy or harsh.";
        advice = "This could be from incomplete vocal fold closure or excessive tension. Practice gentle 'vocal fry to clear voice' exercises.";
    }

    return { status, score, title: 'Voice Quality', message, advice, hnr, shimmer };
};

const determineFocusArea = (evals) => {
    // Sort by score (ascending) to find the weakest link
    const sorted = [...evals].filter(e => e.score > 0).sort((a, b) => a.score - b.score);
    const weakest = sorted[0];

    if (!weakest || weakest.score >= 8) {
        return {
            title: "Maintenance & Refinement",
            description: "Everything looks great! Keep practicing to build muscle memory and consistency.",
            exercise: "Reading Practice",
            exerciseDetails: EXERCISE_MAP["Reading Practice"],
            priority: "low"
        };
    }

    // Map weakest area to specific advice and exercises
    if (weakest.title === 'Pitch') {
        const isLow = weakest.status === 'low';
        return {
            title: "Pitch Control",
            description: weakest.message + (weakest.advice ? ` ${weakest.advice}` : ''),
            exercise: isLow ? "Pitch Staircase" : "Pitch Pipe",
            exerciseDetails: EXERCISE_MAP[isLow ? "Pitch Staircase" : "Pitch Pipe"],
            advice: isLow
                ? "Practice raising your pitch gradually. Start with humming at your current pitch, then slide up slowly."
                : "Practice lowering your pitch gently. Avoid vocal fry - aim for a clear, supported tone.",
            priority: weakest.score < 5 ? "high" : "medium"
        };
    } else if (weakest.title === 'Resonance') {
        return {
            title: "Resonance Shaping",
            description: weakest.message,
            exercise: "Vowel Practice",
            exerciseDetails: EXERCISE_MAP["Vowel Practice"],
            advice: weakest.advice || "Focus on oral space and larynx position. Vowel exercises help train resonance control.",
            priority: weakest.score < 5 ? "high" : "medium"
        };
    } else if (weakest.title === 'Stability') {
        return {
            title: "Vocal Stability",
            description: weakest.message,
            exercise: "Breath Support",
            exerciseDetails: EXERCISE_MAP["Breath Support"],
            advice: weakest.advice || "Stability comes from good breath support. Practice diaphragmatic breathing.",
            priority: weakest.score < 4 ? "high" : "medium"
        };
    } else if (weakest.title === 'Voice Quality') {
        return {
            title: "Voice Quality",
            description: weakest.message,
            exercise: "Breath Support",
            exerciseDetails: EXERCISE_MAP["Breath Support"],
            advice: weakest.advice || "Clear voice quality requires balanced vocal fold closure and airflow.",
            priority: weakest.score < 5 ? "high" : "medium"
        };
    }

    return {
        title: "General Practice",
        description: "Continue exploring your voice.",
        exercise: "Reading Practice",
        exerciseDetails: EXERCISE_MAP["Reading Practice"],
        priority: "low"
    };
};

const generateContextualSummary = (pitch, resonance, voiceQuality, focus) => {
    // Generate smart, contextual summaries based on metric combinations

    const allGood = pitch.score >= 8 && resonance.score >= 8 && voiceQuality.score >= 8;
    const pitchGood = pitch.score >= 8;
    const resonanceGood = resonance.score >= 8;
    const qualityGood = voiceQuality.score >= 8;

    if (allGood) {
        return "Outstanding session! Your pitch, resonance, and voice quality are all aligned with your goals. Keep up the excellent work!";
    }

    // Contextual combinations
    if (pitchGood && !resonanceGood && qualityGood) {
        return "Your pitch and voice quality are excellent! Now let's refine your resonance to complete the picture.";
    }

    if (!pitchGood && resonanceGood && qualityGood) {
        return "Great resonance and voice quality! Your pitch needs some adjustment to hit your target range.";
    }

    if (pitchGood && resonanceGood && !qualityGood) {
        return "Your pitch and resonance are spot-on! Let's work on voice quality to make your voice clearer and more resonant.";
    }

    if (!pitchGood && !resonanceGood) {
        return "We have clear areas to work on. Let's start with your primary focus area and build from there.";
    }

    return "Good effort! We've identified some areas for improvement. Focus on one thing at a time for best results.";
};

const identifyStrengths = (evals) => {
    return evals.filter(e => e.score >= 8).map(e => e.message);
};

const generateContextualTips = (pitch, resonance, voiceQuality, genderGoal) => {
    const tips = [];

    // Add specific tips based on metric combinations
    if (pitch.score < 7 && resonance.score < 7) {
        tips.push("💡 Pitch and resonance work together. As you adjust pitch, your resonance may naturally shift too.");
    }

    if (voiceQuality.score < 7) {
        tips.push("💡 Voice quality improves with proper breath support. Never strain or push your voice.");
    }

    if (resonance.status === 'dark' && genderGoal === 'feminine') {
        tips.push("💡 Try the 'small dog' exercise: imagine a small, yappy dog barking in your throat. This raises the larynx and brightens resonance.");
    }

    if (resonance.status === 'bright' && genderGoal === 'masculine') {
        tips.push("💡 Try the 'big dog' exercise: imagine a large dog's deep bark. This lowers the larynx and darkens resonance.");
    }

    if (pitch.score >= 8 && resonance.score < 6) {
        tips.push("💡 You've mastered pitch! Resonance is the next frontier. It's often more important than pitch for gender perception.");
    }

    return tips;
};

export const CoachEngine = {
    /**
     * Generate a full feedback report based on analysis results and user goals.
     * @param {Object} analysisResults - The results from VoiceAnalyzer
     * @param {Object} userSettings - User preferences (targetPitch, gender, etc.)
     * @param {Object} calibration - User calibration data (optional)
     * @returns {Object} Feedback report
     */
    generateFeedback: (analysisResults, userSettings, calibration = null) => {
        const { overall } = analysisResults;
        const targetPitch = userSettings?.targetPitch || { min: 170, max: 220 }; // Default fem
        const genderGoal = userSettings?.gender || 'feminine'; // 'feminine', 'masculine', 'androgynous'

        // 1. Evaluate Core Metrics
        const pitchEval = evaluatePitch(overall.pitch?.mean, targetPitch);
        const resonanceEval = evaluateResonance(overall.formants, genderGoal, calibration);
        const stabilityEval = evaluateStability(overall.jitter, overall.shimmer);
        const voiceQualityEval = evaluateVoiceQuality(overall.hnr, overall.shimmer);

        // 2. Determine Primary Focus Area (The "One Thing" to fix)
        const focusArea = determineFocusArea([pitchEval, resonanceEval, stabilityEval, voiceQualityEval]);

        // 3. Generate Contextual Summary & Strengths
        const summary = generateContextualSummary(pitchEval, resonanceEval, voiceQualityEval, focusArea);
        const strengths = identifyStrengths([pitchEval, resonanceEval, stabilityEval, voiceQualityEval]);

        // 4. Generate Contextual Tips
        const tips = generateContextualTips(pitchEval, resonanceEval, voiceQualityEval, genderGoal);

        return {
            summary,
            strengths,
            focusArea,
            tips,
            details: {
                pitch: pitchEval,
                resonance: resonanceEval,
                stability: stabilityEval,
                voiceQuality: voiceQualityEval
            }
        };
    },

    /**
     * Process a natural language query from the user.
     * @param {string} query - The user's question
     * @param {Object} context - Real-time context { metrics, history, settings }
     * @returns {Object} { text, relatedTopics }
     */
    processUserQuery: (query, context) => {
        const lowerQuery = query.toLowerCase();

        // 1. Check for "Real-time" questions (Metrics)
        if (lowerQuery.includes('how do i sound') || lowerQuery.includes('current') || lowerQuery.includes('am i')) {
            if (context?.metrics && context.metrics.pitch) {
                const metrics = context.metrics;
                const target = context.settings?.targetRange || { min: 170, max: 220 };

                let feedback = "";

                // Pitch Check
                if (metrics.pitch < target.min) {
                    feedback += `Your pitch is currently ${Math.round(metrics.pitch)}Hz, which is a bit low. Aim for above ${target.min}Hz. `;
                } else if (metrics.pitch > target.max) {
                    feedback += `Your pitch is ${Math.round(metrics.pitch)}Hz, which is a bit high. Relax it down to below ${target.max}Hz. `;
                } else {
                    feedback += `Your pitch is great at ${Math.round(metrics.pitch)}Hz! `;
                }

                // Resonance Check (Simple proxy)
                if (metrics.resonance) {
                    feedback += `Resonance seems ${metrics.resonance > 1000 ? 'bright' : 'dark'}. `;
                }

                return { text: feedback + "\n\nNeed a specific exercise?" };
            } else {
                return { text: "I can't hear you right now. Make sure your microphone is on in the Practice tab!" };
            }
        }

        // 2. Check for "Progress" questions (History)
        if (lowerQuery.includes('progress') || lowerQuery.includes('how am i doing') || lowerQuery.includes('stats')) {
            if (context?.history && context.history.length > 0) {
                const lastSession = context.history[0];
                const feedback = CoachEngine.generateFeedback(
                    { overall: lastSession.overall },
                    { targetPitch: context.settings?.targetRange, gender: context.settings?.genderGoal },
                    context.settings?.calibration
                );
                return {
                    text: `Based on your last session (${new Date(lastSession.date).toLocaleDateString()}):\n\n${feedback.summary}\n\n**Focus:** ${feedback.focusArea.title}`
                };
            } else {
                return { text: "I don't have enough history yet. Record a session in the Analysis tab!" };
            }
        }

        // 3. Fallback to Knowledge Base
        const kbResults = KnowledgeService.search(query);
        if (kbResults.length > 0) {
            const topResult = kbResults[0];
            return {
                text: `**${topResult.question}**\n\n${topResult.answer}`,
                relatedTopics: kbResults.slice(1, 3).map(r => r.category)
            };
        }

        // 4. Default Fallback
        return {
            text: "I'm not sure about that. Try asking about 'pitch', 'resonance', 'breath support', or 'vowels'."
        };
    },

    /**
     * Get exercise details for navigation
     */
    getExerciseDetails: (exerciseName) => {
        return EXERCISE_MAP[exerciseName] || null;
    }
};
