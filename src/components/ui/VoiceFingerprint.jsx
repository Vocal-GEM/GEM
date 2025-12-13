import React, { useState, useEffect } from 'react';
import { Fingerprint, TrendingUp, Brain, RefreshCw, Sparkles } from 'lucide-react';
import {
    generateVoiceFingerprint,
    getFormantTrends,
    generateProgressReport
} from '../../services/AdvancedAnalyticsService';

const VoiceFingerprint = () => {
    const [fingerprint, setFingerprint] = useState(null);
    const [trends, setTrends] = useState([]);
    const [report, setReport] = useState(null);
    const [activeTab, setActiveTab] = useState('fingerprint');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setIsLoading(true);
        setFingerprint(generateVoiceFingerprint());
        setTrends(getFormantTrends());
        setReport(generateProgressReport());
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl">
                        <Fingerprint className="text-white" size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Voice Analytics</h2>
                </div>
                <button onClick={loadData} className="p-2 text-slate-400 hover:text-white">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {['fingerprint', 'trends', 'report'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition-colors ${activeTab === tab
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Voice Fingerprint */}
            {activeTab === 'fingerprint' && (
                <div>
                    {fingerprint ? (
                        <div className="space-y-6">
                            {/* Visual Fingerprint */}
                            <div className="relative h-48 bg-slate-800 rounded-xl overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* Concentric rings representing formants */}
                                    <div className="relative">
                                        <div
                                            className="absolute rounded-full border-2 border-violet-500/50"
                                            style={{
                                                width: `${fingerprint.averages.f1 / 5}px`,
                                                height: `${fingerprint.averages.f1 / 5}px`,
                                                top: '50%', left: '50%',
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                        <div
                                            className="absolute rounded-full border-2 border-pink-500/50"
                                            style={{
                                                width: `${fingerprint.averages.f2 / 10}px`,
                                                height: `${fingerprint.averages.f2 / 10}px`,
                                                top: '50%', left: '50%',
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                        <div
                                            className="absolute rounded-full border-2 border-cyan-500/50"
                                            style={{
                                                width: `${fingerprint.averages.f3 / 15}px`,
                                                height: `${fingerprint.averages.f3 / 15}px`,
                                                top: '50%', left: '50%',
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                        <div className="w-4 h-4 bg-white rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatBox label="F1 (Open)" value={`${fingerprint.averages.f1} Hz`} color="violet" />
                                <StatBox label="F2 (Front)" value={`${fingerprint.averages.f2} Hz`} color="pink" />
                                <StatBox label="F3 (Bright)" value={`${fingerprint.averages.f3} Hz`} color="cyan" />
                                <StatBox label="Pitch Avg" value={`${fingerprint.averages.pitch} Hz`} color="amber" />
                            </div>

                            {/* Stability */}
                            <div className="p-4 bg-slate-800 rounded-xl">
                                <div className="text-sm text-slate-400 mb-2">Resonance Stability</div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                                                style={{ width: `${fingerprint.stability.f2}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="font-bold text-white">{fingerprint.stability.f2}%</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <EmptyState message="Need more recordings to generate fingerprint" />
                    )}
                </div>
            )}

            {/* Formant Trends */}
            {activeTab === 'trends' && (
                <div>
                    {trends.length > 0 ? (
                        <div className="space-y-2">
                            {trends.slice(-7).map((day, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                                    <span className="text-sm text-slate-400 w-24">{day.date}</span>
                                    <div className="flex-1 flex gap-2">
                                        <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-1 rounded">
                                            F1: {Math.round(day.f1Avg)}
                                        </span>
                                        <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded">
                                            F2: {Math.round(day.f2Avg)}
                                        </span>
                                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                                            Pitch: {Math.round(day.pitchAvg)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No trend data yet. Keep practicing!" />
                    )}
                </div>
            )}

            {/* AI Report */}
            {activeTab === 'report' && (
                <div>
                    {report?.available ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-slate-900 border border-purple-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain className="text-purple-400" size={20} />
                                    <span className="font-bold text-white">AI Insights</span>
                                </div>
                                <ul className="space-y-2">
                                    {report.insights.map((insight, idx) => (
                                        <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                                            <Sparkles className="text-purple-400 flex-shrink-0 mt-0.5" size={14} />
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 bg-slate-800 rounded-xl">
                                <div className="text-sm text-slate-400 mb-1">Recommendation</div>
                                <p className="text-white">{report.recommendation}</p>
                            </div>

                            <div className="text-xs text-slate-500 text-center">
                                Generated: {new Date(report.generatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ) : (
                        <EmptyState message={report?.message || 'Need more practice data'} />
                    )}
                </div>
            )}
        </div>
    );
};

const StatBox = ({ label, value, color }) => (
    <div className={`p-3 bg-${color}-500/10 border border-${color}-500/20 rounded-lg text-center`}>
        <div className={`text-lg font-bold text-${color}-400`}>{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="text-center py-12">
        <Fingerprint className="mx-auto text-slate-600 mb-4" size={48} />
        <p className="text-slate-500">{message}</p>
    </div>
);

export default VoiceFingerprint;
