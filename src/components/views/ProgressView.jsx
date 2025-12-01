import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar, Clock } from 'lucide-react';
import ProgressCharts from '../viz/ProgressCharts';
import VoiceRangeProfile from '../viz/VoiceRangeProfile';
import EmptyState from '../ui/EmptyState';
import { useCourseProgress } from '../../hooks/useCourseProgress';
import { historyService } from '../../utils/historyService';

const ProgressView = () => {
    const { getProgressPercentage, completedLessons } = useCourseProgress();
    const progress = getProgressPercentage();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                const allSessions = await historyService.getAllSessions();
                setSessions(allSessions);
            } catch (error) {
                console.error("Failed to load sessions:", error);
            } finally {
                setLoading(false);
            }
        };
        loadSessions();
    }, []);

    return (
        <div className="h-full overflow-y-auto p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Your Progress</h1>
                    <p className="text-slate-400">Track your voice journey over time.</p>
                </div>

                {/* Course Stats */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10 flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-pink-400">{progress}%</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Course</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{completedLessons.length}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Lessons</div>
                    </div>
                </div>
            </div>

            {/* Voice Range Profile */}
            <VoiceRangeProfile sessions={sessions} />

            {/* Charts Section */}
            <ProgressCharts />

            {/* Recent Activity (Placeholder for now, can be expanded with Journal List) */}
            <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    Recent Activity
                </h3>
                {sessions.length > 0 ? (
                    <div className="space-y-3">
                        {sessions.slice(0, 5).map(session => (
                            <div key={session.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-500/10 rounded-full text-teal-400">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Practice Session</div>
                                        <div className="text-xs text-slate-500">{new Date(session.date).toLocaleDateString()} • {new Date(session.date).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-slate-400">
                                    {session.duration ? `${Math.round(session.duration / 60)}m` : '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No Activity Yet"
                        description="Complete your first practice session to see it here."
                    />
                )}
            </div>
        </div>
    );
};

export default ProgressView;
