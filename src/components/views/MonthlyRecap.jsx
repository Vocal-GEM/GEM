import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Flame, Clock, Trophy, BarChart2 } from 'lucide-react';
import { getActivitySummary, getReports } from '../../services/SessionReportService';
import { getStreakData } from '../../services/StreakService';
import { getXPData } from '../../services/DailyChallengeService';

const MonthlyRecap = () => {
    const [recap, setRecap] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        generateRecap();
    }, [selectedMonth, selectedYear]);

    const generateRecap = () => {
        const reports = getReports();
        const streak = getStreakData();
        const xp = getXPData();

        // Filter reports for selected month
        const monthReports = reports.filter(r => {
            const date = new Date(r.timestamp);
            return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        });

        // Calculate stats
        const totalSessions = monthReports.length;
        const totalMinutes = monthReports.reduce((sum, r) => sum + (r.duration || 0), 0);
        const exerciseCount = monthReports.reduce((sum, r) => sum + (r.exercises?.length || 0), 0);

        // Days practiced
        const uniqueDays = new Set(
            monthReports.map(r => new Date(r.timestamp).toISOString().split('T')[0])
        ).size;

        // Longest streak in month
        let longestStreakInMonth = 0;
        let currentStreak = 0;
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const practiced = monthReports.some(r => r.timestamp.startsWith(dateStr));

            if (practiced) {
                currentStreak++;
                longestStreakInMonth = Math.max(longestStreakInMonth, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        setRecap({
            totalSessions,
            totalMinutes,
            exerciseCount,
            uniqueDays,
            longestStreakInMonth,
            daysInMonth,
            currentStreak: streak.currentStreak,
            totalXP: xp.totalXP,
            level: xp.level
        });
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Monthly Recap</h1>
                    <p className="text-slate-400">Your progress at a glance</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                        {monthNames.map((name, idx) => (
                            <option key={idx} value={idx}>{name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                        {[2024, 2025].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {recap && (
                <>
                    {/* Hero Card */}
                    <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-2xl p-8 mb-8 text-center">
                        <Calendar className="mx-auto text-blue-400 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {monthNames[selectedMonth]} {selectedYear}
                        </h2>
                        <p className="text-slate-400">
                            You practiced {recap.uniqueDays} out of {recap.daysInMonth} days
                        </p>
                        <div className="w-full bg-slate-800 rounded-full h-3 mt-4">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${(recap.uniqueDays / recap.daysInMonth) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <StatCard
                            icon={<BarChart2 className="text-emerald-400" size={24} />}
                            label="Total Sessions"
                            value={recap.totalSessions}
                            color="emerald"
                        />
                        <StatCard
                            icon={<Clock className="text-blue-400" size={24} />}
                            label="Practice Time"
                            value={`${recap.totalMinutes}m`}
                            color="blue"
                        />
                        <StatCard
                            icon={<Flame className="text-orange-400" size={24} />}
                            label="Best Streak"
                            value={`${recap.longestStreakInMonth} days`}
                            color="orange"
                        />
                        <StatCard
                            icon={<Trophy className="text-amber-400" size={24} />}
                            label="Exercises Done"
                            value={recap.exerciseCount}
                            color="amber"
                        />
                    </div>

                    {/* Motivational Message */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                        {recap.uniqueDays >= 20 ? (
                            <>
                                <div className="text-4xl mb-2">🏆</div>
                                <h3 className="text-xl font-bold text-white mb-1">Outstanding!</h3>
                                <p className="text-slate-400">You're in the top tier of dedicated practitioners!</p>
                            </>
                        ) : recap.uniqueDays >= 10 ? (
                            <>
                                <div className="text-4xl mb-2">⭐</div>
                                <h3 className="text-xl font-bold text-white mb-1">Great Progress!</h3>
                                <p className="text-slate-400">You're building solid habits. Keep it up!</p>
                            </>
                        ) : recap.uniqueDays >= 5 ? (
                            <>
                                <div className="text-4xl mb-2">🌱</div>
                                <h3 className="text-xl font-bold text-white mb-1">Good Start!</h3>
                                <p className="text-slate-400">Try adding a few more sessions next month.</p>
                            </>
                        ) : (
                            <>
                                <div className="text-4xl mb-2">💪</div>
                                <h3 className="text-xl font-bold text-white mb-1">Room to Grow</h3>
                                <p className="text-slate-400">Every journey starts somewhere. This month, let's aim higher!</p>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4`}>
        <div className="flex items-center gap-3 mb-2">
            {icon}
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
    </div>
);

export default MonthlyRecap;
