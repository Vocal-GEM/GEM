/**
 * TargetRecommender.js
 * 
 * AI-based target recommendation engine that suggests realistic voice goals
 * based on baseline measurements, health factors, and vocal anatomy.
 */

/**
 * Recommends realistic voice targets based on user profile
 * @param {Object} profile - Voice profile object
 * @returns {Object} Recommended targets with timeline and rationale
 */
export const recommendTargets = (profile) => {
    const { baseline, goals, health } = profile;

    // If no baseline, return conservative defaults
    if (!baseline || !baseline.pitchRange.habitual) {
        return getDefaultRecommendations(goals.voiceType);
    }

    const targetPitch = calculatePitchTarget(baseline, goals, health);
    const targetResonance = calculateResonanceTarget(baseline, goals);
    const targetWeight = calculateWeightTarget(baseline, goals);

    // Generate progressive timeline
    const shortTerm = generateShortTermTargets(baseline, targetPitch, targetResonance, targetWeight);
    const mediumTerm = generateMediumTermTargets(baseline, targetPitch, targetResonance, targetWeight);
    const longTerm = generateLongTermTargets(targetPitch, targetResonance, targetWeight);

    // Calculate confidence based on various factors
    const confidence = calculateConfidence(baseline, targetPitch, health);

    // Generate explanation
    const rationale = explainRecommendation(baseline, targetPitch, targetResonance, targetWeight, health);

    return {
        shortTerm,
        mediumTerm,
        longTerm,
        confidence,
        rationale,
        generatedAt: Date.now()
    };
};

/**
 * Calculate recommended pitch target
 */
const calculatePitchTarget = (baseline, goals, health) => {
    const startingPitch = baseline.pitchRange.habitual;
    const desiredMin = goals.targetPitchRange.min;
    const desiredMax = goals.targetPitchRange.max;
    const desiredMid = (desiredMin + desiredMax) / 2;

    let targetPitch = desiredMid;

    // Adjust based on voice type
    if (goals.voiceType === 'feminine') {
        // Typical feminine range: 165-255 Hz
        targetPitch = Math.max(165, Math.min(255, desiredMid));
    } else if (goals.voiceType === 'masculine') {
        // Typical masculine range: 85-180 Hz
        targetPitch = Math.max(85, Math.min(180, desiredMid));
    } else if (goals.voiceType === 'androgynous') {
        // Androgynous range: 145-185 Hz
        targetPitch = Math.max(145, Math.min(185, desiredMid));
    }

    // Adjust for HRT
    if (health.onHRT) {
        if (health.hrtType === 'estrogen') {
            // Estrogen doesn't significantly change pitch, focus on resonance
            // But if they've been on HRT for a while, vocal cords may have adapted slightly
            const hrtMonths = health.hrtDuration || 0;
            if (hrtMonths > 12) {
                targetPitch = Math.min(targetPitch, startingPitch + 15); // Slight natural rise
            }
        } else if (health.hrtType === 'testosterone') {
            // Testosterone lowers pitch significantly
            const hrtMonths = health.hrtDuration || 0;
            if (hrtMonths < 6) {
                // Still in transition, pitch will continue to drop
                targetPitch = Math.max(targetPitch, startingPitch - 30);
            } else {
                // Pitch has likely stabilized
                targetPitch = Math.max(85, Math.min(targetPitch, startingPitch - 50));
            }
        }
    }

    // Adjust for VFS (Vocal Feminization Surgery)
    if (health.hasHadVFS) {
        // Post-surgery, more aggressive pitch targets are achievable
        if (goals.voiceType === 'feminine') {
            targetPitch = Math.max(targetPitch, 180); // VFS typically raises pitch to 180+ Hz
        }
    }

    // Adjust based on timeline preference
    if (goals.timeline === 'gentle') {
        // More conservative target
        const maxChange = 40; // Hz
        if (Math.abs(targetPitch - startingPitch) > maxChange) {
            targetPitch = startingPitch + Math.sign(targetPitch - startingPitch) * maxChange;
        }
    } else if (goals.timeline === 'aggressive') {
        // More ambitious target (but still realistic)
        const maxChange = 80; // Hz
        if (Math.abs(targetPitch - startingPitch) > maxChange) {
            targetPitch = startingPitch + Math.sign(targetPitch - startingPitch) * maxChange;
        }
    } else {
        // Moderate timeline
        const maxChange = 60; // Hz
        if (Math.abs(targetPitch - startingPitch) > maxChange) {
            targetPitch = startingPitch + Math.sign(targetPitch - startingPitch) * maxChange;
        }
    }

    return targetPitch;
};

/**
 * Calculate recommended resonance target
 */
const calculateResonanceTarget = (baseline, goals) => {
    let targetResonance = goals.targetResonance;

    // Resonance is more trainable than pitch
    // 0 = dark/back, 1 = bright/forward

    if (goals.voiceType === 'feminine') {
        // Feminine voices typically have brighter resonance (0.6-0.8)
        targetResonance = Math.max(0.6, Math.min(0.85, targetResonance));
    } else if (goals.voiceType === 'masculine') {
        // Masculine voices typically have darker resonance (0.3-0.5)
        targetResonance = Math.max(0.25, Math.min(0.5, targetResonance));
    } else {
        // Androgynous: middle range (0.5-0.65)
        targetResonance = Math.max(0.45, Math.min(0.65, targetResonance));
    }

    return targetResonance;
};

/**
 * Calculate recommended vocal weight target
 */
const calculateWeightTarget = (baseline, goals) => {
    let targetWeight = goals.targetWeight;

    // Vocal weight: 0 = light/thin, 1 = heavy/thick

    if (goals.voiceType === 'feminine') {
        // Feminine voices typically lighter (0.3-0.5)
        targetWeight = Math.max(0.25, Math.min(0.5, targetWeight));
    } else if (goals.voiceType === 'masculine') {
        // Masculine voices typically heavier (0.6-0.8)
        targetWeight = Math.max(0.55, Math.min(0.85, targetWeight));
    } else {
        // Androgynous: middle range (0.45-0.6)
        targetWeight = Math.max(0.4, Math.min(0.65, targetWeight));
    }

    return targetWeight;
};

/**
 * Generate short-term targets (4 weeks)
 */
const generateShortTermTargets = (baseline, targetPitch, targetResonance, targetWeight) => {
    const startingPitch = baseline.pitchRange.habitual || 140;
    const startingResonance = baseline.resonanceRange.habitual || 0.5;
    const startingWeight = baseline.vocalWeight.habitual || 0.6;

    return {
        weeks: 4,
        pitch: startingPitch + (targetPitch - startingPitch) * 0.25,
        resonance: startingResonance + (targetResonance - startingResonance) * 0.3,
        weight: startingWeight + (targetWeight - startingWeight) * 0.3,
        description: 'Initial adaptation phase - building muscle memory and awareness'
    };
};

/**
 * Generate medium-term targets (12 weeks)
 */
const generateMediumTermTargets = (baseline, targetPitch, targetResonance, targetWeight) => {
    const startingPitch = baseline.pitchRange.habitual || 140;
    const startingResonance = baseline.resonanceRange.habitual || 0.5;
    const startingWeight = baseline.vocalWeight.habitual || 0.6;

    return {
        weeks: 12,
        pitch: startingPitch + (targetPitch - startingPitch) * 0.6,
        resonance: startingResonance + (targetResonance - startingResonance) * 0.7,
        weight: startingWeight + (targetWeight - startingWeight) * 0.65,
        description: 'Consolidation phase - consistent control in practice settings'
    };
};

/**
 * Generate long-term targets (6+ months)
 */
const generateLongTermTargets = (targetPitch, targetResonance, targetWeight) => {
    return {
        weeks: 26,
        pitch: targetPitch,
        resonance: targetResonance,
        weight: targetWeight,
        description: 'Mastery phase - natural integration into daily speech'
    };
};

/**
 * Calculate confidence score for recommendations
 */
const calculateConfidence = (baseline, targetPitch, health) => {
    let confidence = 0.7; // Base confidence

    // Higher confidence if we have good baseline data
    if (baseline.pitchRange.habitual && baseline.resonanceRange.habitual) {
        confidence += 0.1;
    }

    // Adjust based on target ambition
    const startingPitch = baseline.pitchRange.habitual || 140;
    const pitchChange = Math.abs(targetPitch - startingPitch);

    if (pitchChange < 30) {
        confidence += 0.1; // Conservative target, high confidence
    } else if (pitchChange > 70) {
        confidence -= 0.15; // Ambitious target, lower confidence
    }

    // VFS increases confidence for high pitch targets
    if (health.hasHadVFS && targetPitch > 180) {
        confidence += 0.15;
    }

    // Singing experience increases confidence
    if (health.singingExperience === 'intermediate' || health.singingExperience === 'advanced') {
        confidence += 0.1;
    }

    return Math.max(0.3, Math.min(0.95, confidence));
};

/**
 * Generate explanation for recommendations
 */
const explainRecommendation = (baseline, targetPitch, targetResonance, targetWeight, health) => {
    const reasons = [];
    const startingPitch = baseline.pitchRange.habitual || 140;
    const pitchChange = targetPitch - startingPitch;

    // Pitch explanation
    if (Math.abs(pitchChange) < 20) {
        reasons.push(`Your target pitch (${Math.round(targetPitch)} Hz) is close to your current habitual pitch, making it highly achievable with focused practice.`);
    } else if (pitchChange > 0) {
        reasons.push(`Raising pitch from ${Math.round(startingPitch)} Hz to ${Math.round(targetPitch)} Hz (+${Math.round(pitchChange)} Hz) is achievable through consistent practice over several months.`);
    } else {
        reasons.push(`Lowering pitch from ${Math.round(startingPitch)} Hz to ${Math.round(targetPitch)} Hz (${Math.round(pitchChange)} Hz) is achievable with dedicated training.`);
    }

    // HRT considerations
    if (health.onHRT) {
        if (health.hrtType === 'testosterone') {
            reasons.push(`Testosterone HRT will naturally lower your pitch over time. Your target accounts for this ongoing change.`);
        } else if (health.hrtType === 'estrogen') {
            reasons.push(`While estrogen HRT doesn't directly change pitch, we're focusing on resonance and weight, which are highly trainable.`);
        }
    }

    // VFS considerations
    if (health.hasHadVFS) {
        reasons.push(`Having had VFS, your vocal cords are already optimized for higher pitch. Focus on resonance and consistency.`);
    }

    // Resonance explanation
    if (targetResonance > 0.6) {
        reasons.push(`Brighter resonance (${(targetResonance * 100).toFixed(0)}%) is achieved through forward placement and oral space modification - highly trainable skills.`);
    } else if (targetResonance < 0.4) {
        reasons.push(`Darker resonance (${(targetResonance * 100).toFixed(0)}%) emphasizes chest resonance and back placement.`);
    }

    // Experience considerations
    if (health.singingExperience !== 'none') {
        reasons.push(`Your ${health.singingExperience} singing experience gives you an advantage in pitch control and vocal awareness.`);
    }

    return reasons.join(' ');
};

/**
 * Get default recommendations when no baseline exists
 */
const getDefaultRecommendations = (voiceType) => {
    const defaults = {
        feminine: {
            pitch: 200,
            resonance: 0.7,
            weight: 0.4
        },
        masculine: {
            pitch: 120,
            resonance: 0.4,
            weight: 0.7
        },
        androgynous: {
            pitch: 165,
            resonance: 0.55,
            weight: 0.5
        }
    };

    const target = defaults[voiceType] || defaults.feminine;

    return {
        shortTerm: {
            weeks: 4,
            ...target,
            description: 'Initial exploration phase - complete baseline assessment first for personalized targets'
        },
        mediumTerm: {
            weeks: 12,
            ...target,
            description: 'Complete baseline assessment for accurate medium-term targets'
        },
        longTerm: {
            weeks: 26,
            ...target,
            description: 'Complete baseline assessment for accurate long-term targets'
        },
        confidence: 0.3,
        rationale: 'These are general targets. Complete a baseline voice assessment for personalized recommendations.',
        generatedAt: Date.now()
    };
};

export default {
    recommendTargets
};
