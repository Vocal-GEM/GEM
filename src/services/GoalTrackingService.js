/**
 * GoalTrackingService.js
 * 
 * Manages user voice training goals with progress tracking.
 * Supports weekly goals, milestones, and goal history.
 */

import { getReports } from './SessionReportService';
import { getStreakData } from './StreakService';
import SkillAssessmentService from './SkillAssessmentService';

const STORAGE_KEY = 'gem_goals';

// Default goal templates
const GOAL_TEMPLATES = [
    {
        id: 'pitch_target',
        title: 'Reach Pitch Target',
        description: 'Average pitch in target range',
        category: 'pitch',
        unit: 'Hz',
        icon: '🎯'
    },
    {
        id: 'practice_days',
        title: 'Weekly Practice Days',
        description: 'Practice consistently each week',
        category: 'consistency',
        unit: 'days',
        icon: '📅'
    },
    {
        id: 'practice_minutes',
        title: 'Weekly Practice Time',
        description: 'Total practice time per week',
        category: 'time',
        unit: 'minutes',
        icon: '⏱️'
    },
    {
        id: 'resonance_score',
        title: 'Resonance Score',
        description: 'Achieve target resonance brightness',
        category: 'resonance',
        unit: '%',
        icon: '✨'
    },
    {
        id: 'streak_goal',
        title: 'Streak Goal',
        description: 'Maintain practice streak',
        category: 'streak',
        unit: 'days',
        icon: '🔥'
    }
];

/**
 * Create a new goal
 */
export const createGoal = (templateId, targetValue, deadline = null) => {
    const template = GOAL_TEMPLATES.find(t => t.id === templateId);
    if (!template) return null;

    const data = loadData();

    const goal = {
        id: `goal-${Date.now()}`,
        templateId,
        title: template.title,
        description: template.description,
        category: template.category,
        icon: template.icon,
        unit: template.unit,
        targetValue,
        currentValue: 0,
        deadline,
        createdAt: new Date().toISOString(),
        completedAt: null,
        isActive: true,
        history: []
    };

    data.goals.push(goal);
    saveData(data);

    return goal;
};

/**
 * Update goal progress
 */
export const updateGoalProgress = (goalId, newValue, note = '') => {
    const data = loadData();
    const goal = data.goals.find(g => g.id === goalId);

    if (!goal) return null;

    goal.currentValue = newValue;
    goal.history.push({
        timestamp: new Date().toISOString(),
        value: newValue,
        note
    });

    // Check if goal is complete
    if (newValue >= goal.targetValue && !goal.completedAt) {
        goal.completedAt = new Date().toISOString();
        goal.isActive = false;
    }

    saveData(data);
    return goal;
};

/**
 * Get all active goals
 */
export const getActiveGoals = () => {
    const data = loadData();
    return data.goals.filter(g => g.isActive);
};

/**
 * Get all completed goals
 */
export const getCompletedGoals = () => {
    const data = loadData();
    return data.goals.filter(g => !g.isActive && g.completedAt);
};

/**
 * Auto-update goals based on activity
 */
export const refreshGoalProgress = () => {
    const data = loadData();
    const reports = getReports();
    const streak = getStreakData();
    const assessment = SkillAssessmentService.getStoredAssessment();

    // Get last 7 days of reports for weekly calculations
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyReports = reports.filter(r => new Date(r.timestamp) >= weekAgo);
    const weeklyDays = new Set(weeklyReports.map(r => r.timestamp.split('T')[0])).size;
    const weeklyMinutes = weeklyReports.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);

    data.goals.forEach(goal => {
        if (!goal.isActive) return;

        let newValue = goal.currentValue;

        switch (goal.category) {
            case 'consistency':
                newValue = weeklyDays;
                break;
            case 'time':
                newValue = weeklyMinutes;
                break;
            case 'streak':
                newValue = streak.currentStreak;
                break;
            case 'pitch':
                // Use assessment if available
                if (assessment?.dimensions?.pitchControl?.score) {
                    // Map skill score (0-100) to Hz estimate based on target
                    newValue = assessment.dimensions.pitchControl.score >= 70 ? goal.targetValue :
                        Math.round(goal.targetValue * (assessment.dimensions.pitchControl.score / 100));
                }
                break;
            case 'resonance':
                if (assessment?.dimensions?.resonance?.score) {
                    newValue = assessment.dimensions.resonance.score;
                }
                break;
        }

        if (newValue !== goal.currentValue) {
            goal.currentValue = newValue;
            goal.history.push({
                timestamp: new Date().toISOString(),
                value: newValue,
                note: 'Auto-updated'
            });

            if (newValue >= goal.targetValue && !goal.completedAt) {
                goal.completedAt = new Date().toISOString();
                goal.isActive = false;
            }
        }
    });

    saveData(data);
    return data.goals;
};

/**
 * Delete a goal
 */
export const deleteGoal = (goalId) => {
    const data = loadData();
    data.goals = data.goals.filter(g => g.id !== goalId);
    saveData(data);
};

/**
 * Get goal templates
 */
export const getGoalTemplates = () => GOAL_TEMPLATES;

/**
 * Get goal statistics
 */
export const getGoalStats = () => {
    const data = loadData();
    const active = data.goals.filter(g => g.isActive);
    const completed = data.goals.filter(g => g.completedAt);

    return {
        totalGoals: data.goals.length,
        activeGoals: active.length,
        completedGoals: completed.length,
        completionRate: data.goals.length > 0
            ? Math.round((completed.length / data.goals.length) * 100)
            : 0
    };
};

// Storage helpers
const loadData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : { goals: [], createdAt: new Date().toISOString() };
    } catch {
        return { goals: [], createdAt: new Date().toISOString() };
    }
};

const saveData = (data) => {
    try {
        data.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save goals:', e);
    }
};

export default {
    createGoal,
    updateGoalProgress,
    getActiveGoals,
    getCompletedGoals,
    refreshGoalProgress,
    deleteGoal,
    getGoalTemplates,
    getGoalStats
};
