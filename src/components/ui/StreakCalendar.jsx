import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { getStreakData } from '../../services/StreakService';
import { getReports } from '../../services/SessionReportService';

const StreakCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [practiceDays, setPracticeDays] = useState(new Set());
    const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });

    useEffect(() => {
        loadData();
    }, [currentMonth]);

    const loadData = () => {
        const streakData = getStreakData();
        setStreak(streakData);

        // Get practice days for current month
        const reports = getReports();
        const daysSet = new Set();

        reports.forEach(report => {
            const date = new Date(report.timestamp);
            if (date.getMonth() === currentMonth.getMonth() &&
                date.getFullYear() === currentMonth.getFullYear()) {
                daysSet.add(date.getDate());
            }
        });

        setPracticeDays(daysSet);
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const isCurrentMonth = currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear();

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Flame className="text-orange-400" size={24} />
                    <div>
                        <h3 className="font-bold text-white">Practice Streak</h3>
                        <p className="text-sm text-slate-400">
                            {streak.currentStreak} day streak • {streak.longestStreak} best
                        </p>
                    </div>
                </div>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-2 text-slate-400 hover:text-white"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                    onClick={nextMonth}
                    className="p-2 text-slate-400 hover:text-white"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day, idx) => (
                    <div key={idx} className="text-center text-xs text-slate-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDay }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="aspect-square" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const isPracticed = practiceDays.has(day);
                    const isToday = isCurrentMonth && day === today.getDate();

                    return (
                        <div
                            key={day}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-colors ${isPracticed
                                    ? 'bg-orange-500 text-white font-bold'
                                    : isToday
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                                        : 'bg-slate-800 text-slate-400'
                                }`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-500 rounded" />
                    <span>Practiced</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500/30 border border-blue-500 rounded" />
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
};

export default StreakCalendar;
