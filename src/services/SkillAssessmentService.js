/**
 * SkillAssessmentService.js
 * 
 * Assesses user skill level across voice training dimensions.
 * Powers adaptive learning by identifying strengths, weaknesses, and next steps.
 */

import { getReports } from './SessionReportService';
import { getStreakData } from './StreakService';
import { VoiceCalibrationService } from './VoiceCalibrationService';

const STORAGE_KEY = 'gem_skill_assessment';

// Skill dimensions with assessment criteria
const SKILL_DIMENSIONS = {
    pitchControl: {
        name: 'Pitch Control',
        description: 'Ability to hit and maintain target pitch',
        weight: 1.0,
        assess: (data) => {
            // Based on pitch consistency and target adherence
            const { avgPitchVariance, targetAccuracy } = data;
            if (targetAccuracy > 80 && avgPitchVariance < 15) return 5;
            if (targetAccuracy > 60 && avgPitchVariance < 25) return 4;
            if (targetAccuracy > 40) return 3;
            if (targetAccuracy > 20) return 2;
            return 1;
        }
    },
    resonance: {
        name: 'Resonance Placement',
        description: 'Forward, bright resonance vs chest voice',
        weight: 1.0,
        assess: (data) => {
            const { avgResonance } = data;
            if (avgResonance > 70) return 5;
            if (avgResonance > 55) return 4;
            if (avgResonance > 40) return 3;
            if (avgResonance > 25) return 2;
            return 1;
        }
    },
    vocalWeight: {
        name: 'Vocal Weight',
        description: 'Control of heavy vs light voice production',
        weight: 0.8,
        assess: (data) => {
            // Goal varies by user, assess consistency
            const { weightConsistency } = data;
            if (weightConsistency > 80) return 5;
            if (weightConsistency > 60) return 4;
            if (weightConsistency > 40) return 3;
            if (weightConsistency > 20) return 2;
            return 1;
        }
    },
    consistency: {
        name: 'Consistency',
        description: 'Maintaining voice quality over time',
        weight: 0.9,
        assess: (data) => {
            const streak = getStreakData();
            if (streak.currentStreak >= 14) return 5;
            if (streak.currentStreak >= 7) return 4;
            if (streak.currentStreak >= 3) return 3;
            if (streak.currentStreak >= 1) return 2;
            return 1;
        }
    },
    range: {
        name: 'Vocal Range',
        description: 'Usable pitch range in semitones',
        weight: 0.7,
        assess: (data) => {
            const baseline = VoiceCalibrationService.getBaseline();
            if (!baseline?.pitch) return 3; // Neutral if no data
            const range = baseline.pitch.max - baseline.pitch.min;
            const semitones = 12 * Math.log2((baseline.pitch.max) / (baseline.pitch.min));
            if (semitones >= 24) return 5; // 2 octaves
            if (semitones >= 18) return 4;
            if (semitones >= 12) return 3; // 1 octave
            if (semitones >= 6) return 2;
            return 1;
        }
    }
};

// Skill level thresholds
const SKILL_LEVELS = [
    { name: 'Beginner', minScore: 0, maxScore: 1.9, color: 'blue', description: 'Starting your voice journey' },
    { name: 'Novice', minScore: 2.0, maxScore: 2.9, color: 'cyan', description: 'Building foundational skills' },
    { name: 'Intermediate', minScore: 3.0, maxScore: 3.9, color: 'green', description: 'Developing competence' },
    { name: 'Advanced', minScore: 4.0, maxScore: 4.4, color: 'purple', description: 'Refining your technique' },
    { name: 'Expert', minScore: 4.5, maxScore: 5.0, color: 'amber', description: 'Mastering your voice' }
];

/**
 * Perform a comprehensive skill assessment
 */
export const assessSkills = () => {
    const reports = getReports();
    const baseline = VoiceCalibrationService.getBaseline();

    // Extract metrics from recent sessions
    const recentReports = reports.slice(-20);

    // Calculate aggregate data for assessment
    const data = {
        avgPitchVariance: calculateAveragePitchVariance(recentReports),
        targetAccuracy: calculateTargetAccuracy(recentReports),
        avgResonance: calculateAverageResonance(recentReports),
        weightConsistency: calculateWeightConsistency(recentReports),
        sessionCount: reports.length
    };

    // Assess each dimension
    const dimensions = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.entries(SKILL_DIMENSIONS).forEach(([key, dim]) => {
        const score = dim.assess(data);
        dimensions[key] = {
            name: dim.name,
            description: dim.description,
            score,
            maxScore: 5
        };
        totalWeightedScore += score * dim.weight;
        totalWeight += dim.weight;
    });

    // Calculate overall score
    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 2.5;

    // Determine skill level
    const level = SKILL_LEVELS.find(l => overallScore >= l.minScore && overallScore <= l.maxScore)
        || SKILL_LEVELS[0];

    // Identify strengths and weaknesses
    const sortedDimensions = Object.entries(dimensions)
        .sort((a, b) => b[1].score - a[1].score);

    const strengths = sortedDimensions.slice(0, 2).map(([key]) => key);
    const weaknesses = sortedDimensions.slice(-2).map(([key]) => key);

    const assessment = {
        overallScore: parseFloat(overallScore.toFixed(2)),
        level,
        dimensions,
        strengths,
        weaknesses,
        recommendations: generateRecommendations(weaknesses, dimensions),
        assessedAt: new Date().toISOString(),
        dataPoints: reports.length
    };

    // Save assessment
    saveAssessment(assessment);

    return assessment;
};

/**
 * Get stored assessment (without recalculating)
 */
export const getStoredAssessment = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

/**
 * Save assessment to storage
 */
const saveAssessment = (assessment) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assessment));
    } catch (e) {
        console.error('Failed to save skill assessment:', e);
    }
};

/**
 * Generate personalized recommendations based on weaknesses
 */
const generateRecommendations = (weaknesses, dimensions) => {
    const recommendations = [];

    weaknesses.forEach(weakness => {
        switch (weakness) {
            case 'pitchControl':
                recommendations.push({
                    area: 'Pitch Control',
                    exercise: 'Pitch Glides',
                    tip: 'Practice slow sirens from low to high, focusing on smooth transitions.',
                    priority: 'high'
                });
                break;
            case 'resonance':
                recommendations.push({
                    area: 'Resonance',
                    exercise: 'Forward Placement',
                    tip: 'Try "ng" humming and feel the vibration in your face, not chest.',
                    priority: 'high'
                });
                break;
            case 'vocalWeight':
                recommendations.push({
                    area: 'Vocal Weight',
                    exercise: 'Light Phonation',
                    tip: 'Practice speaking on a gentle sigh to reduce vocal weight.',
                    priority: 'medium'
                });
                break;
            case 'consistency':
                recommendations.push({
                    area: 'Consistency',
                    exercise: 'Daily Practice',
                    tip: 'Even 5 minutes daily builds muscle memory. Set a reminder!',
                    priority: 'high'
                });
                break;
            case 'range':
                recommendations.push({
                    area: 'Vocal Range',
                    exercise: 'Range Extension',
                    tip: 'Gentle lip trills help safely explore your upper range.',
                    priority: 'low'
                });
                break;
        }
    });

    return recommendations;
};

// Helper functions for metric calculation
const calculateAveragePitchVariance = (reports) => {
    const variances = reports
        .filter(r => r.pitch?.variance)
        .map(r => r.pitch.variance);
    return variances.length > 0
        ? variances.reduce((a, b) => a + b, 0) / variances.length
        : 30; // Default moderate variance
};

const calculateTargetAccuracy = (reports) => {
    // Simulate based on available data
    const accuracies = reports
        .filter(r => r.targetAccuracy)
        .map(r => r.targetAccuracy);
    if (accuracies.length > 0) {
        return accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    }
    // Estimate from session count
    return Math.min(80, 30 + (reports.length * 2));
};

const calculateAverageResonance = (reports) => {
    const resonances = reports
        .filter(r => r.resonance)
        .map(r => r.resonance);
    return resonances.length > 0
        ? resonances.reduce((a, b) => a + b, 0) / resonances.length
        : 45;
};

const calculateWeightConsistency = (reports) => {
    // Simulate consistency based on practice frequency
    const streak = getStreakData();
    return Math.min(90, 40 + (streak.currentStreak * 5));
};

export default {
    assessSkills,
    getStoredAssessment,
    SKILL_DIMENSIONS,
    SKILL_LEVELS
};
