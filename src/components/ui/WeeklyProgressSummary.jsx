/**
 * WeeklyProgressSummary.jsx
 * 
 * Shows weekly progress with comparison to previous week.
 * Includes trend arrows, insights, and key metrics.
 */

import { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Minus, Calendar, Clock,
    Target, Flame, ChevronRight, BarChart3, Award
} from 'lucide-react';
import { getReports, getActivitySummary } from '../../services/SessionReportService';
import { getStreakData } from '../../services/StreakService';
import { getXPData } from '../../services/XPService';
import SpacedRepetitionService from '../../services/SpacedRepetitionService';

const WeeklyProgressSummary = ({ embedded = false }) => {
    const [currentWeek, setCurrentWeek] = useState(null);
    const [previousWeek, setPreviousWeek] = useState(null);
    const [insights, setInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const reports = getReports();
        const now = new Date();

        // Current week (last 7 days)
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Previous week (8-14 days ago)
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const currentWeekReports = reports.filter(r => {
            const d = new Date(r.timestamp);
            return d >= weekAgo;
        });

        const previousWeekReports = reports.filter(r => {
            const d = new Date(r.timestamp);
            return d >= twoWeeksAgo && d < weekAgo;
        });

        const current = calculateWeekStats(currentWeekReports);
        const previous = calculateWeekStats(previousWeekReports);

        setCurrentWeek(current);
        setPreviousWeek(previous);
        setInsights(generateInsights(current, previous));
        setIsLoading(false);
    };

    const calculateWeekStats = (reports) => {
        const uniqueDays = new Set(reports.map(r => r.timestamp.split('T')[0])).size;
        const totalMinutes = reports.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
        const totalSessions = reports.length;
        const exercisesCompleted = reports.reduce((sum, r) => sum + (r.exercises?.length || 0), 0);

        // Calculate average pitches from reports that have them
        const pitchReports = reports.filter(r => r.avgPitch > 0);
        const avgPitch = pitchReports.length > 0
            ? Math.round(pitchReports.reduce((sum, r) => sum + r.avgPitch, 0) / pitchReports.length)
            : null;

        return {
            sessions: totalSessions,
            minutes: totalMinutes,
            days: uniqueDays,
            exercises: exercisesCompleted,
            avgPitch
        };
    };

    const generateInsights = (current, previous) => {
        const insights = [];
        const streak = getStreakData();
        const xp = getXPData();
        const srStats = SpacedRepetitionService.getStats();

        // Session comparison
        if (current.sessions > previous.sessions) {
            insights.push({
                type: 'positive',
                text: `${current.sessions - previous.sessions} more sessions than last week!`,
                icon: '📈'
            });
        } else if (current.sessions < previous.sessions && previous.sessions > 0) {
            insights.push({
                type: 'neutral',
                text: `${previous.sessions - current.sessions} fewer sessions than last week`,
                icon: '📊'
            });
        }

        // Time comparison
        if (current.minutes > previous.minutes + 10) {
            insights.push({
                type: 'positive',
                text: `${current.minutes - previous.minutes} more minutes of practice!`,
                icon: '⏱️'
            });
        }

        // Streak insight
        if (streak.currentStreak >= 7) {
            insights.push({
                type: 'positive',
                text: `Amazing ${streak.currentStreak} day streak! 🔥`,
                icon: '🔥'
            });
        } else if (streak.currentStreak >= 3) {
            insights.push({
                type: 'positive',
                text: `${streak.currentStreak} day streak - keep it going!`,
                icon: '✨'
            });
        }

        // Mastery insight
        if (srStats.masteredCount > 0) {
            insights.push({
                type: 'positive',
                text: `${srStats.masteredCount} exercises mastered`,
                icon: '🏆'
            });
        }

        // Level up insight
        if (xp.level >= 5) {
            insights.push({
                type: 'positive',
                text: `Level ${xp.level} - You're making great progress!`,
                icon: '⭐'
            });
        }

        return insights.slice(0, 3); // Max 3 insights
    };

    const getTrendIcon = (current, previous) => {
        if (current > previous) return <TrendingUp size={14} className="text-emerald-400" />;
        if (current < previous) return <TrendingDown size={14} className="text-red-400" />;
        return <Minus size={14} className="text-slate-400" />;
    };

    const getTrendColor = (current, previous) => {
        if (current > previous) return 'text-emerald-400';
        if (current < previous) return 'text-red-400';
        return 'text-slate-400';
    };

    if (isLoading) {
        return (
            <div className="animate-pulse p-4 bg-slate-800/50 rounded-2xl">
                <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-slate-700 rounded"></div>
                    <div className="h-16 bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${embedded ? '' : 'p-4'} space-y-4`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-400" />
                    This Week vs Last Week
                </h3>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Sessions */}
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Sessions</span>
                        {getTrendIcon(currentWeek?.sessions || 0, previousWeek?.sessions || 0)}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{currentWeek?.sessions || 0}</span>
                        <span className={`text-xs ${getTrendColor(currentWeek?.sessions || 0, previousWeek?.sessions || 0)}`}>
                            vs {previousWeek?.sessions || 0}
                        </span>
                    </div>
                </div>

                {/* Minutes */}
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Minutes</span>
                        {getTrendIcon(currentWeek?.minutes || 0, previousWeek?.minutes || 0)}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{currentWeek?.minutes || 0}</span>
                        <span className={`text-xs ${getTrendColor(currentWeek?.minutes || 0, previousWeek?.minutes || 0)}`}>
                            vs {previousWeek?.minutes || 0}
                        </span>
                    </div>
                </div>

                {/* Days Practiced */}
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Days Practiced</span>
                        {getTrendIcon(currentWeek?.days || 0, previousWeek?.days || 0)}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{currentWeek?.days || 0}/7</span>
                        <span className={`text-xs ${getTrendColor(currentWeek?.days || 0, previousWeek?.days || 0)}`}>
                            vs {previousWeek?.days || 0}/7
                        </span>
                    </div>
                </div>

                {/* Exercises */}
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Exercises</span>
                        {getTrendIcon(currentWeek?.exercises || 0, previousWeek?.exercises || 0)}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{currentWeek?.exercises || 0}</span>
                        <span className={`text-xs ${getTrendColor(currentWeek?.exercises || 0, previousWeek?.exercises || 0)}`}>
                            vs {previousWeek?.exercises || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Insights</h4>
                    {insights.map((insight, i) => (
                        <div
                            key={i}
                            className={`p-3 rounded-xl border text-sm flex items-center gap-3 ${insight.type === 'positive'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-300'
                                }`}
                        >
                            <span className="text-lg">{insight.icon}</span>
                            <span>{insight.text}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {currentWeek?.sessions === 0 && previousWeek?.sessions === 0 && (
                <div className="text-center py-6 text-slate-400">
                    <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Start practicing to see your weekly progress!</p>
                </div>
            )}
        </div>
    );
};

export default WeeklyProgressSummary;
