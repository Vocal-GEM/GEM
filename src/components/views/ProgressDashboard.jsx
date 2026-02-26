import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Calendar, Target, Clock, Flame, Award } from 'lucide-react';
import { getActivitySummary, getReports } from '../../services/SessionReportService';
import { getStreakData } from '../../services/StreakService';
import { getPitchTrend } from '../../services/VoiceJournalService';

const ProgressDashboard = () => {
    const [activityData, setActivityData] = useState(null);
    const [streakData, setStreakData] = useState(null);
    const [pitchTrend, setPitchTrend] = useState([]);
    const [calendarData, setCalendarData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const activity = getActivitySummary();
            const streak = getStreakData();
            const pitch = await getPitchTrend(30);
            const reports = getReports();

            // Build calendar heatmap data (last 30 days)
            const calendar = buildCalendarData(reports);

            setActivityData(activity);
            setStreakData(streak);
            setPitchTrend(pitch);
            setCalendarData(calendar);
        } catch (err) {
            console.error('Failed to load progress data:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const buildCalendarData = (reports) => {
        const days = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayReports = reports.filter(r =>
                r.timestamp.split('T')[0] === dateStr
            );

            days.push({
                date: dateStr,
                day: date.getDate(),
                weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
                sessions: dayReports.length,
                minutes: dayReports.reduce((sum, r) => sum + (r.durationMinutes || 0), 0)
            });
        }
        return days;
    };

    const getHeatmapColor = (sessions) => {
        if (sessions === 0) return 'bg-slate-800';
        if (sessions === 1) return 'bg-emerald-900';
        if (sessions === 2) return 'bg-emerald-700';
        return 'bg-emerald-500';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Progress Dashboard</h1>
                <p className="text-slate-400">Track your voice training journey</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<Flame className="text-orange-400" />}
                    value={streakData?.currentStreak || 0}
                    label="Day Streak"
                    color="orange"
                />
                <StatCard
                    icon={<Clock className="text-blue-400" />}
                    value={activityData?.last7Days?.minutes || 0}
                    label="Minutes This Week"
                    color="blue"
                />
                <StatCard
                    icon={<Target className="text-emerald-400" />}
                    value={activityData?.last7Days?.sessions || 0}
                    label="Sessions This Week"
                    color="emerald"
                />
                <StatCard
                    icon={<Award className="text-purple-400" />}
                    value={streakData?.longestStreak || 0}
                    label="Longest Streak"
                    color="purple"
                />
            </div>

            {/* Practice Calendar Heatmap */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="text-emerald-400" size={20} />
                    Activity (Last 30 Days)
                </h2>

                <div className="grid grid-cols-10 gap-1">
                    {calendarData.map((day, idx) => (
                        <div
                            key={idx}
                            className={`aspect-square rounded-sm ${getHeatmapColor(day.sessions)} transition-colors cursor-pointer hover:ring-2 hover:ring-white/30`}
                            title={`${day.weekday} ${day.day}: ${day.sessions} session(s), ${day.minutes}m`}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-slate-800" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-900" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-700" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span>More</span>
                </div>
            </div>

            {/* Pitch Trend */}
            {pitchTrend.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-pink-400" size={20} />
                        Pitch Trend
                    </h2>

                    <div className="space-y-2">
                        {pitchTrend.slice(0, 7).map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 w-20">{entry.date}</span>
                                <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden relative">
                                    <div
                                        className="absolute h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                                        style={{
                                            left: `${((entry.min - 80) / 300) * 100}%`,
                                            width: `${((entry.max - entry.min) / 300) * 100}%`
                                        }}
                                    />
                                    <div
                                        className="absolute w-2 h-full bg-white rounded-full"
                                        style={{ left: `${((entry.avg - 80) / 300) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-pink-400 w-16 text-right">{Math.round(entry.avg)}Hz</span>
                            </div>
                        ))}
                    </div>

                    {pitchTrend.length === 0 && (
                        <p className="text-slate-500 text-center py-4">
                            Record voice journal entries to track pitch trends
                        </p>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'journal' }))}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-left transition-colors"
                >
                    <div className="text-lg font-bold text-white mb-1">Voice Journal</div>
                    <div className="text-sm text-slate-400">Record new voice clip</div>
                </button>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'practice' }))}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-left transition-colors"
                >
                    <div className="text-lg font-bold text-white mb-1">Practice Mode</div>
                    <div className="text-sm text-slate-400">Continue training</div>
                </button>
            </div>
        </div>
    );
};

const StatCard = ({ icon, value, label, color }) => (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-${color}-500/30 transition-colors`}>
        <div className="flex items-center gap-2 mb-2">
            {icon}
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
    </div>
);

export default ProgressDashboard;
