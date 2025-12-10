import { useState, useEffect } from 'react';
import { X, Activity, RefreshCw } from 'lucide-react';
import { analyticsService } from '../../services/AnalyticsService';

const AnalyticsDashboard = ({ onClose }) => {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);

    const refreshData = () => {
        setEvents([...analyticsService.getEvents()]);
        setStats(analyticsService.getFunnelStats());
    };

    useEffect(() => {
        refreshData();
        // Auto-refresh every 5 seconds
        const interval = setInterval(refreshData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Local Analytics</h2>
                            <p className="text-xs text-slate-400">Data stored locally on your device</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={refreshData} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Funnel Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Tutorial Starts</div>
                            <div className="text-2xl font-bold text-white">{stats?.tutorialStart || 0}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Tutorial Completes</div>
                            <div className="text-2xl font-bold text-white">{stats?.tutorialComplete || 0}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Conversion Rate</div>
                            <div className="text-2xl font-bold text-blue-400">{stats?.conversionRate || 0}%</div>
                        </div>
                    </div>

                    {/* Event Log */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Recent Events</h3>
                        <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 bg-slate-900/50 border-b border-white/5 text-xs font-bold text-slate-500">
                                <div>Time</div>
                                <div>Event Name</div>
                                <div>Properties</div>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {events.length > 0 ? (
                                    events.map((event, idx) => (
                                        <div key={idx} className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 border-b border-white/5 last:border-0 hover:bg-slate-900/30 transition-colors text-xs">
                                            <div className="text-slate-500 font-mono">
                                                {new Date(event.timestamp).toLocaleTimeString()}
                                            </div>
                                            <div className="font-bold text-blue-300">
                                                {event.name}
                                            </div>
                                            <div className="text-slate-400 font-mono truncate max-w-[200px]">
                                                {JSON.stringify(event.properties)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        No events recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
