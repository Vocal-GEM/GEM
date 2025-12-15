/**
 * Achievements & Milestones System
 *
 * Tracks progress milestones and celebrates user achievements
 * throughout their voice training journey.
 */

export const ACHIEVEMENT_CATEGORIES = {
    PRACTICE: 'practice',
    SKILL: 'skill',
    MILESTONE: 'milestone',
    CONSISTENCY: 'consistency',
    EXPLORATION: 'exploration'
};

export const ACHIEVEMENTS = [
    // Practice & Consistency Achievements
    {
        id: 'first-session',
        category: ACHIEVEMENT_CATEGORIES.PRACTICE,
        title: 'First Steps',
        description: 'Complete your first practice session',
        icon: '🌱',
        points: 10,
        condition: (progress) => progress.sessionsCompleted >= 1
    },
    {
        id: 'week-streak',
        category: ACHIEVEMENT_CATEGORIES.CONSISTENCY,
        title: 'One Week Strong',
        description: 'Practice at least 4 days in a single week',
        icon: '💪',
        points: 25,
        condition: (progress) => progress.maxWeeklyStreak >= 4
    },
    {
        id: 'two-week-streak',
        category: ACHIEVEMENT_CATEGORIES.CONSISTENCY,
        title: 'Commitment',
        description: 'Practice for 2 weeks consistently',
        icon: '🔥',
        points: 50,
        condition: (progress) => progress.currentStreak >= 14
    },
    {
        id: 'month-warrior',
        category: ACHIEVEMENT_CATEGORIES.CONSISTENCY,
        title: 'Month Warrior',
        description: 'Complete 30 days of practice',
        icon: '⭐',
        points: 100,
        condition: (progress) => progress.totalDaysPracticed >= 30
    },

    // Skill-Based Achievements (Feminization)
    {
        id: 'pitch-master',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'fem',
        title: 'Pitch Master',
        description: 'Maintain 170-220Hz pitch for 30 consecutive seconds',
        icon: '🎵',
        points: 30,
        condition: (progress) => progress.skills?.pitchControl >= 30
    },
    {
        id: 'resonance-explorer',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'fem',
        title: 'Resonance Explorer',
        description: 'Complete all Module 3 (Resonance) lessons',
        icon: '🔮',
        points: 40,
        condition: (progress) => {
            const module3Lessons = ['lesson-1-3', 'lesson-3-1'];
            return module3Lessons.every(id => progress.completedLessons?.includes(id));
        }
    },
    {
        id: 'vocal-weight-champion',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'fem',
        title: 'Light as a Feather',
        description: 'Successfully maintain light vocal weight for 20 seconds',
        icon: '🪶',
        points: 35,
        condition: (progress) => progress.skills?.lightWeight >= 20
    },
    {
        id: 'vowel-sculptor',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'fem',
        title: 'Vowel Sculptor',
        description: 'Complete all vowel modification exercises',
        icon: '🎨',
        points: 30,
        condition: (progress) => progress.completedLessons?.includes('lesson-3-1')
    },
    {
        id: 'intonation-artist',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'fem',
        title: 'Melody Maker',
        description: 'Complete all intonation and prosody lessons',
        icon: '🎼',
        points: 40,
        condition: (progress) => {
            const module4Lessons = ['lesson-4-1', 'lesson-4-2'];
            return module4Lessons.every(id => progress.completedLessons?.includes(id));
        }
    },

    // Skill-Based Achievements (Masculinization)
    {
        id: 'deep-voice-discoverer',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'masc',
        title: 'Deep Voice Discoverer',
        description: 'Maintain 85-135Hz pitch for 30 consecutive seconds',
        icon: '🎺',
        points: 30,
        condition: (progress) => progress.skills?.lowPitchControl >= 30
    },
    {
        id: 'dark-resonance-master',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'masc',
        title: 'Dark Resonance Master',
        description: 'Complete all Module 2 (Dark Resonance) lessons',
        icon: '🌑',
        points: 40,
        condition: (progress) => {
            const module2Lessons = ['lesson-m-2-1', 'lesson-m-2-2', 'lesson-m-2-3'];
            return module2Lessons.every(id => progress.completedLessons?.includes(id));
        }
    },
    {
        id: 'weight-builder',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'masc',
        title: 'Weight Builder',
        description: 'Maintain heavy vocal weight for 20 seconds',
        icon: '🏋️',
        points: 35,
        condition: (progress) => progress.skills?.heavyWeight >= 20
    },

    // Skill-Based Achievements (Androgyny)
    {
        id: 'neutral-navigator',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'neutral',
        title: 'Neutral Navigator',
        description: 'Maintain 135-175Hz neutral zone for 30 seconds',
        icon: '⚖️',
        points: 30,
        condition: (progress) => progress.skills?.neutralPitch >= 30
    },
    {
        id: 'code-switcher',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'neutral',
        title: 'Code Switcher',
        description: 'Successfully demonstrate all 3 vocal modes (neutral, femme, masc)',
        icon: '🎭',
        points: 50,
        condition: (progress) => progress.skills?.codeSwitching === true
    },
    {
        id: 'balanced-resonator',
        category: ACHIEVEMENT_CATEGORIES.SKILL,
        profile: 'neutral',
        title: 'Balanced Resonator',
        description: 'Complete all balanced resonance lessons',
        icon: '☯️',
        points: 40,
        condition: (progress) => {
            const module2Lessons = ['lesson-n-2-1', 'lesson-n-2-2', 'lesson-n-2-3'];
            return module2Lessons.every(id => progress.completedLessons?.includes(id));
        }
    },

    // Milestone Achievements
    {
        id: 'first-module-complete',
        category: ACHIEVEMENT_CATEGORIES.MILESTONE,
        title: 'Module Master',
        description: 'Complete your first module',
        icon: '📚',
        points: 50,
        condition: (progress) => progress.completedModules >= 1
    },
    {
        id: 'halfway-hero',
        category: ACHIEVEMENT_CATEGORIES.MILESTONE,
        title: 'Halfway Hero',
        description: 'Complete 50% of your course',
        icon: '🎯',
        points: 75,
        condition: (progress) => {
            const totalLessons = progress.totalLessons || 18;
            const completed = progress.completedLessons?.length || 0;
            return completed >= (totalLessons * 0.5);
        }
    },
    {
        id: 'journey-graduate',
        category: ACHIEVEMENT_CATEGORIES.MILESTONE,
        title: 'Journey Graduate',
        description: 'Complete the entire Guided Journey',
        icon: '🎓',
        points: 150,
        condition: (progress) => progress.journeyCompleted === true
    },
    {
        id: 'course-champion',
        category: ACHIEVEMENT_CATEGORIES.MILESTONE,
        title: 'Course Champion',
        description: 'Complete all modules in your course',
        icon: '👑',
        points: 200,
        condition: (progress) => progress.courseCompleted === true
    },

    // Exploration Achievements
    {
        id: 'vocal-hygiene-champion',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        title: 'Vocal Health Champion',
        description: 'Complete the Vocal Safety & Health Guide',
        icon: '💚',
        points: 15,
        condition: (progress) => {
            return progress.completedLessons?.includes('lesson-1-0') ||
                   progress.completedLessons?.includes('lesson-m-1-0') ||
                   progress.completedLessons?.includes('lesson-n-1-0');
        }
    },
    {
        id: 'tool-explorer',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        title: 'Tool Explorer',
        description: 'Use at least 5 different interactive tools',
        icon: '🔧',
        points: 25,
        condition: (progress) => (progress.toolsUsed?.length || 0) >= 5
    },
    {
        id: 'recording-artist',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        title: 'Recording Artist',
        description: 'Record and save 10 voice samples',
        icon: '🎙️',
        points: 30,
        condition: (progress) => (progress.recordingsMade || 0) >= 10
    },
    {
        id: 'self-analyzer',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        title: 'Self Analyzer',
        description: 'Compare before/after recordings using the comparison tool',
        icon: '📊',
        points: 20,
        condition: (progress) => progress.comparisonsMade >= 1
    }
];

// Milestone definitions for progress tracking
export const MILESTONES = {
    FEMINIZATION: [
        {
            id: 'fem-safety-first',
            title: 'Safety First',
            description: 'You completed the Vocal Safety & Health Guide. You know how to protect your voice!',
            lessonId: 'lesson-1-0',
            celebration: 'Your voice is precious, and now you know how to keep it safe! 💜'
        },
        {
            id: 'fem-foundations',
            title: 'Foundations Complete',
            description: 'You understand the 3 Pillars: Pitch, Resonance, and Weight',
            moduleId: 'module-1',
            celebration: 'You have the knowledge foundation! Now let\'s build the skills. 🌸'
        },
        {
            id: 'fem-resonance-unlocked',
            title: 'Resonance Unlocked',
            description: 'You can control bright resonance - the most important skill!',
            moduleId: 'module-3',
            celebration: 'Resonance is THE key to feminization, and you\'ve mastered it! ✨'
        },
        {
            id: 'fem-weight-mastery',
            title: 'Light as Air',
            description: 'You can maintain light vocal weight consistently',
            moduleId: 'module-2',
            celebration: 'Your voice has that light, clear quality now! 🪶'
        },
        {
            id: 'fem-melody-master',
            title: 'Melody Master',
            description: 'You can add feminine intonation and prosody',
            moduleId: 'module-4',
            celebration: 'Your voice dances and flows with natural melody! 🎼'
        },
        {
            id: 'fem-graduate',
            title: 'Voice Feminization Graduate',
            description: 'You completed all 7 modules!',
            celebration: 'You did it! You have all the tools for a natural feminine voice. Keep practicing and celebrating your progress! 🎓💖'
        }
    ],
    MASCULINIZATION: [
        {
            id: 'masc-safety-first',
            title: 'Safety First',
            description: 'You completed the Vocal Safety & Health Guide',
            lessonId: 'lesson-m-1-0',
            celebration: 'You know how to train smart and protect your voice! 💪'
        },
        {
            id: 'masc-foundations',
            title: 'Foundations Complete',
            description: 'You understand the 3 Pillars for masculinization',
            moduleId: 'module-m-1',
            celebration: 'You have the knowledge foundation! Time to deepen that voice. 🎺'
        },
        {
            id: 'masc-dark-resonance',
            title: 'Dark Resonance Master',
            description: 'You can control dark resonance consistently',
            moduleId: 'module-m-2',
            celebration: 'Your voice has that rich, dark quality now! 🌑'
        },
        {
            id: 'masc-weight-builder',
            title: 'Full Voice Achieved',
            description: 'You can maintain heavy vocal weight',
            moduleId: 'module-m-3',
            celebration: 'Your voice has presence and fullness! 🏋️'
        },
        {
            id: 'masc-graduate',
            title: 'Voice Masculinization Graduate',
            description: 'You completed all 4 modules!',
            celebration: 'You did it! You have a confident, masculine voice. Keep using it with pride! 🎓💙'
        }
    ],
    ANDROGYNY: [
        {
            id: 'neutral-safety-first',
            title: 'Safety First',
            description: 'You completed the Vocal Safety & Health Guide',
            lessonId: 'lesson-n-1-0',
            celebration: 'You know how to explore your voice safely! ✨'
        },
        {
            id: 'neutral-foundations',
            title: 'Balance Point Found',
            description: 'You understand the neutral zone',
            moduleId: 'module-n-1',
            celebration: 'You found your balance point - the foundation of androgyny! ⚖️'
        },
        {
            id: 'neutral-resonance',
            title: 'Neutral Resonance Master',
            description: 'You can maintain balanced resonance',
            moduleId: 'module-n-2',
            celebration: 'Your voice sits perfectly in the middle - neither one nor the other! ☯️'
        },
        {
            id: 'neutral-flexibility',
            title: 'Code Switcher',
            description: 'You can shift between neutral, femme, and masc at will',
            moduleId: 'module-n-3',
            celebration: 'You have vocal freedom! You can be whoever you want to be, whenever you want. 🎭'
        },
        {
            id: 'neutral-graduate',
            title: 'Androgynous Voice Graduate',
            description: 'You completed all 3 modules!',
            celebration: 'You did it! You have vocal flexibility and control. Your voice is YOUR choice! 🎓💚'
        }
    ]
};

// Helper function to check which achievements are unlocked
export const checkAchievements = (progress, profile = 'fem') => {
    const unlocked = [];
    const locked = [];

    ACHIEVEMENTS.forEach(achievement => {
        // Skip profile-specific achievements for other profiles
        if (achievement.profile && achievement.profile !== profile) {
            return;
        }

        if (achievement.condition(progress)) {
            unlocked.push({
                ...achievement,
                unlockedAt: progress.achievementTimestamps?.[achievement.id] || new Date().toISOString()
            });
        } else {
            locked.push(achievement);
        }
    });

    return { unlocked, locked };
};

// Helper function to check milestone completion
export const checkMilestones = (progress, profile = 'fem') => {
    const profileKey = profile === 'fem' ? 'FEMINIZATION' :
                       profile === 'masc' ? 'MASCULINIZATION' :
                       'ANDROGYNY';

    const milestones = MILESTONES[profileKey] || [];
    const completed = [];
    const upcoming = [];

    milestones.forEach(milestone => {
        let isComplete = false;

        if (milestone.lessonId) {
            isComplete = progress.completedLessons?.includes(milestone.lessonId);
        } else if (milestone.moduleId) {
            // Check if all lessons in module are complete
            const moduleLessons = getModuleLessons(milestone.moduleId, profile);
            isComplete = moduleLessons.every(id => progress.completedLessons?.includes(id));
        }

        if (isComplete) {
            completed.push({
                ...milestone,
                completedAt: progress.milestoneTimestamps?.[milestone.id] || new Date().toISOString()
            });
        } else {
            upcoming.push(milestone);
        }
    });

    return { completed, upcoming };
};

// Helper to get all lesson IDs in a module
const getModuleLessons = (moduleId, profile) => {
    // This would ideally import from courseData, but to avoid circular dependencies
    // we'll use a simplified version
    const moduleLessons = {
        'module-1': ['lesson-1-0', 'lesson-1-1', 'lesson-1-2', 'lesson-1-3'],
        'module-2': ['lesson-2-1', 'lesson-2-2', 'lesson-2-3'],
        'module-3': ['lesson-3-1', 'lesson-3-2'],
        'module-4': ['lesson-4-1', 'lesson-4-2'],
        'module-m-1': ['lesson-m-1-0', 'lesson-m-1-1', 'lesson-m-1-2'],
        'module-m-2': ['lesson-m-2-1', 'lesson-m-2-2', 'lesson-m-2-3'],
        'module-m-3': ['lesson-m-3-1', 'lesson-m-3-2'],
        'module-m-4': ['lesson-m-4-1', 'lesson-m-4-2'],
        'module-n-1': ['lesson-n-1-0', 'lesson-n-1-1', 'lesson-n-1-2'],
        'module-n-2': ['lesson-n-2-1', 'lesson-n-2-2', 'lesson-n-2-3'],
        'module-n-3': ['lesson-n-3-1', 'lesson-n-3-2', 'lesson-n-3-3']
    };

    return moduleLessons[moduleId] || [];
};

// Calculate total achievement points
export const calculateTotalPoints = (unlockedAchievements) => {
    return unlockedAchievements.reduce((total, achievement) => total + achievement.points, 0);
};

// Get progress percentage
export const getProgressPercentage = (progress, profile = 'fem') => {
    const totalLessons = profile === 'fem' ? 19 : // 7 modules + safety lesson
                        profile === 'masc' ? 11 : // 4 modules + safety lesson
                        10; // 3 modules + safety lesson

    const completed = progress.completedLessons?.length || 0;
    return Math.round((completed / totalLessons) * 100);
};

export default {
    ACHIEVEMENTS,
    MILESTONES,
    ACHIEVEMENT_CATEGORIES,
    checkAchievements,
    checkMilestones,
    calculateTotalPoints,
    getProgressPercentage
};
