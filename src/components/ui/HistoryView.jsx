import React, { useState, useEffect } from 'react';
import { Book, FileText, TrendingUp, Calendar, Clock, Activity, BarChart2, List, Mic } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { pdfReportGenerator } from '../../utils/pdfReportGenerator';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement
);

const HistoryView = ({ stats, journals, onLogClick, userMode }) => {
    const { getSessions } = useProfile();
    const [sessions, setSessions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, sessions, journals

    useEffect(() => {
        const loadSessions = async () => {
            if (getSessions) {
                const loaded = await getSessions(50);
                setSessions(loaded);
            }
        };
        loadSessions();
    }, [getSessions]);

    // Calculate Streak Dynamically
    const streak = React.useMemo(() => {
        if (sessions.length === 0) return 0;
        const dates = [...new Set(sessions.map(s => new Date(s.timestamp).toDateString()))];
        // Sort descending
        dates.sort((a, b) => new Date(b) - new Date(a));

        let currentStreak = 0;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        // Check if practiced today or yesterday to keep streak alive
        if (dates[0] !== today && dates[0] !== yesterday) return 0;

        let lastDate = new Date(dates[0]);
        currentStreak = 1;

        for (let i = 1; i < dates.length; i++) {
            const d = new Date(dates[i]);
            const diffTime = Math.abs(lastDate - d);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                lastDate = d;
            } else {
                break;
            }
        }
        return currentStreak;
    }, [sessions]);

    // Weekly Activity Data
    const weeklyData = React.useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const practiceTimeData = last7Days.map(day => {
            const daySessions = sessions.filter(s =>
                new Date(s.timestamp).toLocaleDateString('en-US', { weekday: 'short' }) === day &&
                (Date.now() - s.timestamp) < 7 * 24 * 60 * 60 * 1000
            );
            const seconds = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
            return Math.round(seconds / 60);
        });

        return {
            labels: last7Days,
            datasets: [{
                label: 'Minutes',
                data: practiceTimeData,
                backgroundColor: 'rgba(96, 165, 250, 0.5)',
                borderColor: 'rgba(96, 165, 250, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        };
    }, [sessions]);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const recentSessions = journals
                .filter(j => j.timestamp > thirtyDaysAgo)
                .map(j => ({
                    timestamp: j.timestamp,
                    duration: j.duration || 0,
                    pitch: j.pitch,
                    f1: j.f1,
                    f2: j.f2,
                    cpp: j.cpp,
                    jitter: j.jitter,
                    notes: j.notes
                }));

            const doc = await pdfReportGenerator.generateProgressReport({
                clientName: 'Client',
                dateRange: { start: new Date(thirtyDaysAgo), end: new Date() },
                sessions: recentSessions,
                currentMetrics: recentSessions[0] || {},
                targetMetrics: { pitchMin: 170, pitchMax: 220, f1Target: '>450', f2Target: '>1800' },
                coachNotes: ['Continue practicing pitch control exercises', 'Focus on resonance shaping']
            });

            doc.save(`voice-therapy-report-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Chart Data Preparation
    const chartData = {
        labels: sessions.slice().reverse().map(s => new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Avg Pitch (Hz)',
                data: sessions.slice().reverse().map(s => s.pitch),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                yAxisID: 'y',
            },
            {
                label: 'Resonance (Hz)',
                data: sessions.slice().reverse().map(s => s.resonance),
                borderColor: 'rgb(236, 72, 153)',
                backgroundColor: 'rgba(236, 72, 153, 0.5)',
                yAxisID: 'y1',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        stacked: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8' } },
            title: { display: false },
        },
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                ticks: { color: '#94a3b8' },
                grid: { color: '#334155' },
                title: { display: true, text: 'Pitch (Hz)', color: '#6366f1' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: '#94a3b8' },
                title: { display: true, text: 'Resonance (Hz)', color: '#ec4899' }
            },
        },
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            {/* Header / Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    <TrendingUp size={16} /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'sessions' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    <Activity size={16} /> Sessions
                </button>
                <button
                    onClick={() => setActiveTab('journals')}
                    className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'journals' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    <Book size={16} /> Journals
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Streak</div>
                            <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                                <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                                    {streak} <span className="text-sm text-slate-500 font-normal">days</span>
                                </div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Practice</div>
                                <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                                    {Math.floor(stats.totalSeconds / 60)} <span className="text-sm text-slate-500 font-normal">mins</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Activity Chart */}
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><Calendar size={16} /> Weekly Activity</h3>
                        <div className="h-48">
                            <Bar
                                data={weeklyData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Progress Trends Chart */}
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><BarChart2 size={16} /> Progress Trends</h3>
                        <div className="h-64">
                            {sessions.length > 0 ? (
                                <Line options={chartOptions} data={chartData} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                    No session data available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold mb-2 px-1">Recent Sessions</h3>
                    {sessions.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>No practice sessions recorded yet.</p>
                        </div>
                    ) : (
                        sessions.map((session, i) => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-white">{new Date(session.timestamp).toLocaleDateString()}</span>
                                        <span className="text-xs text-slate-500">{new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {Math.round(session.duration)}s</span>
                                        <span className="flex items-center gap-1"><Mic size={12} /> {Math.round(session.pitch)} Hz</span>
                                        <span className="flex items-center gap-1"><Activity size={12} /> {Math.round(session.stability)}%</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Activity size={20} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Journals Tab */}
            {activeTab === 'journals' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold px-1">Journal Entries</h3>
                        <button
                            onClick={onLogClick}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition-colors"
                        >
                            + New Entry
                        </button>
                    </div>

                    {userMode === 'slp' && (
                        <button
                            onClick={handleGenerateReport}
                            disabled={isGenerating || journals.length === 0}
                            className="w-full mb-4 p-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-bold"
                        >
                            <FileText size={16} />
                            {isGenerating ? 'Generating...' : 'Generate PDF Report'}
                        </button>
                    )}

                    {journals.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>No journal entries yet.</p>
                        </div>
                    ) : (
                        journals.slice().reverse().map((entry, i) => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-slate-400 font-mono">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${entry.effort > 7 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            Effort: {entry.effort}
                                        </span>
                                    </div>
                                </div>
                                {entry.notes && <p className="text-sm text-slate-300 leading-relaxed">{entry.notes}</p>}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default HistoryView;
