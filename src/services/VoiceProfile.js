/**
 * VoiceProfile.js
 * 
 * Comprehensive voice profile system for capturing and analyzing baseline
 * voice characteristics, tracking progress, and personalizing the user experience.
 */

/**
 * Creates a new voice profile with default values
 * @param {Object} options - Initial profile options
 * @returns {Object} Voice profile object
 */
export const createVoiceProfile = (options = {}) => ({
    id: options.id || generateProfileId(),
    name: options.name || 'Default Profile',
    createdAt: Date.now(),
    updatedAt: Date.now(),

    // Baseline measurements from initial recordings
    baseline: {
        pitchRange: {
            min: options.baseline?.pitchRange?.min || null,
            max: options.baseline?.pitchRange?.max || null,
            habitual: options.baseline?.pitchRange?.habitual || null,
            comfortable: options.baseline?.pitchRange?.comfortable || null
        },
        resonanceRange: {
            brightest: options.baseline?.resonanceRange?.brightest || null,
            darkest: options.baseline?.resonanceRange?.darkest || null,
            habitual: options.baseline?.resonanceRange?.habitual || null
        },
        vocalWeight: {
            lightest: options.baseline?.vocalWeight?.lightest || null,
            heaviest: options.baseline?.vocalWeight?.heaviest || null,
            habitual: options.baseline?.vocalWeight?.habitual || null
        },
        mpt: options.baseline?.mpt || null, // Maximum phonation time in seconds
        jitter: options.baseline?.jitter || null, // Pitch stability %
        shimmer: options.baseline?.shimmer || null, // Amplitude stability %
        spectralTilt: options.baseline?.spectralTilt || null,
        cpp: options.baseline?.cpp || null, // Cepstral Peak Prominence
        capturedAt: options.baseline?.capturedAt || null
    },

    // User-defined goals
    goals: {
        targetPitchRange: {
            min: options.goals?.targetPitchRange?.min || 170,
            max: options.goals?.targetPitchRange?.max || 220
        },
        targetResonance: options.goals?.targetResonance || 0.7,
        targetWeight: options.goals?.targetWeight || 0.4,
        voiceType: options.goals?.voiceType || 'feminine', // 'feminine' | 'masculine' | 'androgynous'
        priority: options.goals?.priority || 'balanced', // 'pitch' | 'resonance' | 'weight' | 'balanced'
        timeline: options.goals?.timeline || 'moderate' // 'aggressive' | 'moderate' | 'gentle'
    },

    // Progress tracking
    progress: {
        currentAverages: {
            pitch: options.progress?.currentAverages?.pitch || null,
            resonance: options.progress?.currentAverages?.resonance || null,
            weight: options.progress?.currentAverages?.weight || null
        },
        weeklyTrend: {
            pitch: options.progress?.weeklyTrend?.pitch || 0,
            resonance: options.progress?.weeklyTrend?.resonance || 0,
            weight: options.progress?.weeklyTrend?.weight || 0
        },
        estimatedTimeToGoal: {
            weeks: options.progress?.estimatedTimeToGoal?.weeks || null,
            confidence: options.progress?.estimatedTimeToGoal?.confidence || 0
        },
        milestones: options.progress?.milestones || []
    },

    // Learning preferences
    preferences: {
        learningStyle: options.preferences?.learningStyle || 'visual', // 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
        learningStyleConfidence: options.preferences?.learningStyleConfidence || 0,
        sessionLength: options.preferences?.sessionLength || 'short', // 'micro' | 'short' | 'standard' | 'long'
        feedbackIntensity: options.preferences?.feedbackIntensity || 'moderate', // 'minimal' | 'moderate' | 'detailed'
        preferredExercises: options.preferences?.preferredExercises || [],
        avoidedExercises: options.preferences?.avoidedExercises || [],
        preferredTimeOfDay: options.preferences?.preferredTimeOfDay || null // 'morning' | 'afternoon' | 'evening'
    },

    // Health factors
    health: {
        hasHadVFS: options.health?.hasHadVFS || false,
        vfsDate: options.health?.vfsDate || null,
        onHRT: options.health?.onHRT || false,
        hrtType: options.health?.hrtType || null, // 'estrogen' | 'testosterone' | 'other'
        hrtStartDate: options.health?.hrtStartDate || null,
        hrtDuration: options.health?.hrtDuration || 0, // months
        singingExperience: options.health?.singingExperience || 'none', // 'none' | 'beginner' | 'intermediate' | 'advanced' | 'professional'
        voiceTrainingExperience: options.health?.voiceTrainingExperience || 'none',
        vocalIssues: options.health?.vocalIssues || [], // Array of strings
        restDays: options.health?.restDays || ['Sunday'],
        dailyPracticeLimit: options.health?.dailyPracticeLimit || 30 // minutes
    },

    // Skill assessment
    skillAssessment: {
        pitchControl: options.skillAssessment?.pitchControl || 0, // 0-1
        resonanceControl: options.skillAssessment?.resonanceControl || 0,
        consistency: options.skillAssessment?.consistency || 0,
        endurance: options.skillAssessment?.endurance || 0,
        overallLevel: options.skillAssessment?.overallLevel || 'beginner', // 'beginner' | 'intermediate' | 'advanced'
        lastAssessed: options.skillAssessment?.lastAssessed || null
    }
});

/**
 * Analyzes recordings to extract baseline voice characteristics
 * @param {Array} recordings - Array of recording objects with analysis data
 * @returns {Object} Baseline measurements
 */
export const analyzeBaseline = (recordings) => {
    if (!recordings || recordings.length === 0) {
        return null;
    }

    const pitches = [];
    const resonances = [];
    const weights = [];
    const jitters = [];
    const shimmers = [];
    const mpts = [];

    // Extract measurements from recordings
    recordings.forEach(recording => {
        if (recording.analysis) {
            if (recording.analysis.pitch) pitches.push(recording.analysis.pitch);
            if (recording.analysis.resonance) resonances.push(recording.analysis.resonance);
            if (recording.analysis.weight) weights.push(recording.analysis.weight);
            if (recording.analysis.jitter) jitters.push(recording.analysis.jitter);
            if (recording.analysis.shimmer) shimmers.push(recording.analysis.shimmer);
            if (recording.duration) mpts.push(recording.duration);
        }
    });

    // Calculate statistics
    const calculateStats = (values) => {
        if (values.length === 0) return { min: null, max: null, habitual: null };
        const sorted = [...values].sort((a, b) => a - b);
        return {
            min: sorted[0],
            max: sorted[sorted.length - 1],
            habitual: median(values),
            comfortable: percentile(sorted, 50)
        };
    };

    return {
        pitchRange: calculateStats(pitches),
        resonanceRange: calculateStats(resonances),
        vocalWeight: calculateStats(weights),
        mpt: mpts.length > 0 ? Math.max(...mpts) : null,
        jitter: jitters.length > 0 ? average(jitters) : null,
        shimmer: shimmers.length > 0 ? average(shimmers) : null,
        capturedAt: Date.now()
    };
};

/**
 * Updates progress tracking based on recent sessions
 * @param {Object} profile - Current voice profile
 * @param {Array} recentSessions - Recent session data
 * @returns {Object} Updated progress object
 */
export const updateProgress = (profile, recentSessions) => {
    if (!recentSessions || recentSessions.length === 0) {
        return profile.progress;
    }

    // Calculate current averages from last 7 days
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentData = recentSessions.filter(s => s.timestamp > sevenDaysAgo);

    const pitches = [];
    const resonances = [];
    const weights = [];

    recentData.forEach(session => {
        if (session.metrics) {
            if (session.metrics.avgPitch) pitches.push(session.metrics.avgPitch);
            if (session.metrics.avgResonance) resonances.push(session.metrics.avgResonance);
            if (session.metrics.avgWeight) weights.push(session.metrics.avgWeight);
        }
    });

    const currentAverages = {
        pitch: pitches.length > 0 ? average(pitches) : profile.progress.currentAverages.pitch,
        resonance: resonances.length > 0 ? average(resonances) : profile.progress.currentAverages.resonance,
        weight: weights.length > 0 ? average(weights) : profile.progress.currentAverages.weight
    };

    // Calculate weekly trend
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    const previousWeekData = recentSessions.filter(s =>
        s.timestamp > twoWeeksAgo && s.timestamp < sevenDaysAgo
    );

    const prevPitches = previousWeekData
        .filter(s => s.metrics?.avgPitch)
        .map(s => s.metrics.avgPitch);
    const prevResonances = previousWeekData
        .filter(s => s.metrics?.avgResonance)
        .map(s => s.metrics.avgResonance);
    const prevWeights = previousWeekData
        .filter(s => s.metrics?.avgWeight)
        .map(s => s.metrics.avgWeight);

    const weeklyTrend = {
        pitch: pitches.length > 0 && prevPitches.length > 0
            ? currentAverages.pitch - average(prevPitches)
            : 0,
        resonance: resonances.length > 0 && prevResonances.length > 0
            ? currentAverages.resonance - average(prevResonances)
            : 0,
        weight: weights.length > 0 && prevWeights.length > 0
            ? currentAverages.weight - average(prevWeights)
            : 0
    };

    return {
        ...profile.progress,
        currentAverages,
        weeklyTrend
    };
};

/**
 * Assesses skill level based on performance data
 * @param {Object} profile - Voice profile
 * @param {Array} sessions - Session history
 * @returns {Object} Updated skill assessment
 */
export const assessSkillLevel = (profile, sessions) => {
    if (!sessions || sessions.length < 5) {
        return profile.skillAssessment;
    }

    const recentSessions = sessions.slice(-20); // Last 20 sessions

    // Pitch control: consistency of hitting targets
    const pitchAccuracies = recentSessions
        .filter(s => s.metrics?.pitchAccuracy)
        .map(s => s.metrics.pitchAccuracy);
    const pitchControl = pitchAccuracies.length > 0 ? average(pitchAccuracies) : 0;

    // Resonance control: consistency of resonance targets
    const resonanceAccuracies = recentSessions
        .filter(s => s.metrics?.resonanceAccuracy)
        .map(s => s.metrics.resonanceAccuracy);
    const resonanceControl = resonanceAccuracies.length > 0 ? average(resonanceAccuracies) : 0;

    // Consistency: variance in performance
    const pitchVariance = pitchAccuracies.length > 0 ? variance(pitchAccuracies) : 1;
    const consistency = Math.max(0, 1 - pitchVariance);

    // Endurance: ability to maintain quality over session duration
    const sessionDurations = recentSessions
        .filter(s => s.duration)
        .map(s => s.duration);
    const avgDuration = sessionDurations.length > 0 ? average(sessionDurations) : 0;
    const endurance = Math.min(1, avgDuration / (20 * 60)); // Normalize to 20 minutes

    // Overall level
    const overallScore = (pitchControl + resonanceControl + consistency + endurance) / 4;
    let overallLevel = 'beginner';
    if (overallScore > 0.7) overallLevel = 'advanced';
    else if (overallScore > 0.4) overallLevel = 'intermediate';

    return {
        pitchControl,
        resonanceControl,
        consistency,
        endurance,
        overallLevel,
        lastAssessed: Date.now()
    };
};

/**
 * Detects learning style from interaction patterns
 * @param {Array} interactions - User interaction history
 * @returns {Object} Learning style and confidence
 */
export const detectLearningStyle = (interactions) => {
    if (!interactions || interactions.length < 10) {
        return { style: 'visual', confidence: 0 };
    }

    const scores = {
        visual: 0,
        auditory: 0,
        kinesthetic: 0
    };

    interactions.forEach(interaction => {
        switch (interaction.type) {
            case 'view_spectrogram':
            case 'view_graph':
            case 'view_chart':
                scores.visual += 1;
                break;
            case 'play_audio':
            case 'listen_example':
            case 'audio_feedback':
                scores.auditory += 1;
                break;
            case 'practice_exercise':
            case 'hands_on_tool':
            case 'interactive_practice':
                scores.kinesthetic += 1;
                break;
        }
    });

    const total = scores.visual + scores.auditory + scores.kinesthetic;
    const maxScore = Math.max(scores.visual, scores.auditory, scores.kinesthetic);

    let style = 'visual';
    if (scores.auditory === maxScore) style = 'auditory';
    else if (scores.kinesthetic === maxScore) style = 'kinesthetic';

    // If scores are close, it's mixed
    const secondMax = [...Object.values(scores)].sort((a, b) => b - a)[1];
    if (maxScore - secondMax < total * 0.1) {
        style = 'mixed';
    }

    const confidence = total > 0 ? maxScore / total : 0;

    return { style, confidence };
};

// Utility functions
const generateProfileId = () => {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const average = (arr) => {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

const median = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
};

const percentile = (sortedArr, p) => {
    const index = (p / 100) * (sortedArr.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
};

const variance = (arr) => {
    const avg = average(arr);
    const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
    return average(squareDiffs);
};

export default {
    createVoiceProfile,
    analyzeBaseline,
    updateProgress,
    assessSkillLevel,
    detectLearningStyle
};
