import React from 'react';
import { Clock, CheckCircle, Activity, Calendar } from 'lucide-react';
import { getActivitySummary } from '../../services/SessionReportService';

const SessionSummaryCard = () => {
    const summary = getActivitySummary();
    const { last7Days, recentReports } = summary;

    const formatTime = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="text-blue-400" size={20} />
                This Week's Activity
            </h3>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{last7Days.sessions}</div>
                    <div className="text-xs text-slate-400">Sessions</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{formatTime(last7Days.minutes)}</div>
                    <div className="text-xs text-slate-400">Practice Time</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{last7Days.stepsCompleted}</div>
                    <div className="text-xs text-slate-400">Steps Done</div>
                </div>
            </div>

            {/* Recent Sessions */}
            {recentReports.length > 0 ? (
                <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent</div>
                    {recentReports.map(report => (
                        <div key={report.id} className="flex items-center justify-between py-2 border-t border-slate-800">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-emerald-500" />
                                <span className="text-sm text-white">
                                    {report.moduleName || report.type === 'practice' ? 'Free Practice' : 'Session'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {report.durationMinutes || 0}m
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {formatDate(report.timestamp)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                    No sessions yet this week. Start practicing! 💪
                </div>
            )}
        </div>
    );
};

export default SessionSummaryCard;
