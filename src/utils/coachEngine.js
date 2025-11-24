/**
 * CoachEngine.js
 * 
 * A rule-based expert system that analyzes voice metrics and generates 
 * qualitative, educational feedback for the user.
 */

export const CoachEngine = {
    /**
     * Generate a full feedback report based on analysis results and user goals.
     * @param {Object} analysisResults - The results from VoiceAnalyzer
     * @param {Object} userSettings - User preferences (targetPitch, gender, etc.)
     * @returns {Object} Feedback report
     */
    generateFeedback: (analysisResults, userSettings) => {
        const { overall } = analysisResults;
        const targetPitch = userSettings?.targetPitch || { min: 170, max: 220 }; // Default fem
        const genderGoal = userSettings?.gender || 'feminine'; // 'feminine', 'masculine', 'androgynous'

        // 1. Evaluate Core Metrics
        const pitchEval = evaluatePitch(overall.pitch?.mean, targetPitch);
        const resonanceEval = evaluateResonance(overall.formants, genderGoal);
        const stabilityEval = evaluateStability(overall.jitter, overall.shimmer);

        // 2. Determine Primary Focus Area (The "One Thing" to fix)
        const focusArea = determineFocusArea([pitchEval, resonanceEval, stabilityEval]);

        // 3. Generate Summary & Strengths
        const summary = generateSummary(pitchEval, resonanceEval, focusArea);
        const strengths = identifyStrengths([pitchEval, resonanceEval, stabilityEval]);

        return {
            summary,
            strengths,
            focusArea,
            details: {
                pitch: pitchEval,
                resonance: resonanceEval,
                stability: stabilityEval
            }
        };
    }
};

// --- Helper Evaluation Functions ---

const evaluatePitch = (pitch, target) => {
    if (!pitch) return { status: 'unknown', message: "Could not detect pitch." };

    const { min, max } = target;
    const center = (min + max) / 2;

    if (pitch >= min && pitch <= max) {
        return {
            status: 'good',
            score: 10,
            title: 'Pitch',
            message: `Your average pitch (${pitch.toFixed(0)}Hz) is right in your target range.`
        };
    } else if (pitch < min) {
        const diff = min - pitch;
        const severity = diff > 30 ? 'significant' : 'slight';
        return {
            status: 'low',
            score: severity === 'significant' ? 4 : 7,
            title: 'Pitch',
            message: `Your pitch (${pitch.toFixed(0)}Hz) is ${severity === 'significant' ? 'significantly' : 'slightly'} lower than your target (${min}Hz).`
        };
    } else {
        const diff = pitch - max;
        const severity = diff > 30 ? 'significant' : 'slight';
        return {
            status: 'high',
            score: severity === 'significant' ? 4 : 7,
            title: 'Pitch',
            message: `Your pitch (${pitch.toFixed(0)}Hz) is ${severity === 'significant' ? 'significantly' : 'slightly'} higher than your target (${max}Hz).`
        };
    }
};

const evaluateResonance = (formants, genderGoal) => {
    if (!formants || !formants.f1) return { status: 'unknown', message: "Could not detect resonance." };

    // Simplified resonance targets (F1/F2 averages)
    // Feminine: High F1 (>400), High F2 (>1800) - "Bright"
    // Masculine: Low F1 (<350), Low F2 (<1500) - "Dark"

    const { f1, f2 } = formants;
    let status = 'neutral';
    let score = 5;
    let message = "";

    if (genderGoal === 'feminine') {
        if (f1 > 350 && f2 > 1600) {
            status = 'bright';
            score = 9;
            message = "Your resonance is bright and forward, which is great for a feminine voice.";
        } else if (f1 < 300 || f2 < 1400) {
            status = 'dark';
            score = 4;
            message = "Your resonance is a bit dark (low R1). Try to 'smile' with your throat to brighten it.";
        } else {
            status = 'mixed';
            score = 6;
            message = "Your resonance is in a neutral range. You could try to brighten it slightly.";
        }
    } else if (genderGoal === 'masculine') {
        if (f1 < 350 && f2 < 1500) {
            status = 'dark';
            score = 9;
            message = "Your resonance is rich and dark, perfect for a masculine voice.";
        } else if (f1 > 400 || f2 > 1700) {
            status = 'bright';
            score = 4;
            message = "Your resonance is quite bright. Try creating more space in the back of your throat.";
        } else {
            status = 'mixed';
            score = 6;
            message = "Your resonance is neutral. Relaxing the throat might help darken it.";
        }
    }

    return { status, score, title: 'Resonance', message };
};

const evaluateStability = (jitter, shimmer) => {
    if (jitter === undefined) return { status: 'unknown', score: 0 };

    // Jitter < 1% is generally good
    if (jitter < 1.0) {
        return {
            status: 'stable',
            score: 10,
            title: 'Stability',
            message: "Your voice is very stable and clear."
        };
    } else if (jitter < 2.5) {
        return {
            status: 'moderate',
            score: 7,
            title: 'Stability',
            message: "There is some slight wavering or roughness in your voice."
        };
    } else {
        return {
            status: 'unstable',
            score: 3,
            title: 'Stability',
            message: "Your voice shows significant instability (jitter). This might be vocal fry or breathiness."
        };
    }
};

const determineFocusArea = (evals) => {
    // Sort by score (ascending) to find the weakest link
    const sorted = [...evals].sort((a, b) => a.score - b.score);
    const weakest = sorted[0];

    if (weakest.score >= 8) {
        return {
            title: "Maintenance",
            description: "Everything looks great! Keep practicing to build muscle memory.",
            exercise: "Reading Practice"
        };
    }

    // Map weakest area to specific advice
    if (weakest.title === 'Pitch') {
        return {
            title: "Pitch Control",
            description: weakest.message,
            exercise: "Pitch Pipe"
        };
    } else if (weakest.title === 'Resonance') {
        return {
            title: "Resonance Shaping",
            description: weakest.message,
            exercise: "Vowel Practice"
        };
    } else if (weakest.title === 'Stability') {
        return {
            title: "Vocal Stability",
            description: weakest.message,
            exercise: "Breath Support"
        };
    }

    return { title: "General Practice", description: "Continue exploring your voice.", exercise: "Free Play" };
};

const generateSummary = (pitch, resonance, focus) => {
    if (pitch.score > 8 && resonance.score > 8) {
        return "Outstanding session! Your pitch and resonance are perfectly aligned with your goals.";
    } else if (pitch.score > 8) {
        return "Your pitch is excellent, but we can work on your resonance to refine the tone.";
    } else if (resonance.score > 8) {
        return "Great resonance control! Now let's focus on getting your pitch into the target range.";
    } else {
        return "Good start. We have some clear areas to work on to get you closer to your goal.";
    }
};

const identifyStrengths = (evals) => {
    return evals.filter(e => e.score >= 8).map(e => e.message);
};
