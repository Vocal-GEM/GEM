import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { getReports } from '../../services/SessionReportService';

const BeforeAfterCompare = () => {
    const [recordings, setRecordings] = useState({ before: null, after: null });
    const [isPlaying, setIsPlaying] = useState({ before: false, after: false });
    const [sessions, setSessions] = useState([]);
    const [selectedBefore, setSelectedBefore] = useState(null);
    const [selectedAfter, setSelectedAfter] = useState(null);

    const beforeAudioRef = useRef(null);
    const afterAudioRef = useRef(null);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = () => {
        const reports = getReports();
        // Filter sessions that have recordings
        const withRecordings = reports.filter(r => r.recordingUrl || r.audioBlob);
        setSessions(withRecordings);

        if (withRecordings.length >= 2) {
            setSelectedBefore(withRecordings[withRecordings.length - 1]); // Oldest
            setSelectedAfter(withRecordings[0]); // Most recent
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const togglePlay = (which) => {
        const audioRef = which === 'before' ? beforeAudioRef : afterAudioRef;

        if (isPlaying[which]) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }

        setIsPlaying(prev => ({ ...prev, [which]: !prev[which] }));
    };

    const getComparisonStats = () => {
        if (!selectedBefore || !selectedAfter) return null;

        const pitchBefore = selectedBefore.avgPitch || 0;
        const pitchAfter = selectedAfter.avgPitch || 0;
        const pitchChange = pitchAfter - pitchBefore;

        return {
            pitchChange,
            daysBetween: Math.floor((new Date(selectedAfter.timestamp) - new Date(selectedBefore.timestamp)) / (1000 * 60 * 60 * 24))
        };
    };

    const stats = getComparisonStats();

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Before & After</h1>
                    <p className="text-slate-400">Compare your voice progress over time</p>
                </div>
                <button
                    onClick={loadSessions}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {sessions.length < 2 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                    <TrendingUp className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">Not Enough Data</h3>
                    <p className="text-slate-400">
                        Record at least two sessions to compare your progress.
                    </p>
                </div>
            ) : (
                <>
                    {/* Comparison Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Before */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <SkipBack className="text-blue-400" size={20} />
                                <h3 className="font-bold text-white">Before</h3>
                            </div>

                            <select
                                value={selectedBefore?.id || ''}
                                onChange={(e) => setSelectedBefore(sessions.find(s => s.id === e.target.value))}
                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mb-4"
                            >
                                {sessions.map(session => (
                                    <option key={session.id} value={session.id}>
                                        {formatDate(session.timestamp)}
                                    </option>
                                ))}
                            </select>

                            {selectedBefore && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                        <span className="text-slate-400">Avg Pitch</span>
                                        <span className="font-bold text-white">
                                            {selectedBefore.avgPitch || '--'} Hz
                                        </span>
                                    </div>

                                    {selectedBefore.recordingUrl && (
                                        <button
                                            onClick={() => togglePlay('before')}
                                            className="w-full py-3 bg-blue-600/20 text-blue-400 font-bold rounded-lg flex items-center justify-center gap-2"
                                        >
                                            {isPlaying.before ? <Pause size={18} /> : <Play size={18} />}
                                            {isPlaying.before ? 'Pause' : 'Play Recording'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* After */}
                        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <SkipForward className="text-emerald-400" size={20} />
                                <h3 className="font-bold text-white">After</h3>
                            </div>

                            <select
                                value={selectedAfter?.id || ''}
                                onChange={(e) => setSelectedAfter(sessions.find(s => s.id === e.target.value))}
                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mb-4"
                            >
                                {sessions.map(session => (
                                    <option key={session.id} value={session.id}>
                                        {formatDate(session.timestamp)}
                                    </option>
                                ))}
                            </select>

                            {selectedAfter && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                        <span className="text-slate-400">Avg Pitch</span>
                                        <span className="font-bold text-white">
                                            {selectedAfter.avgPitch || '--'} Hz
                                        </span>
                                    </div>

                                    {selectedAfter.recordingUrl && (
                                        <button
                                            onClick={() => togglePlay('after')}
                                            className="w-full py-3 bg-emerald-600/20 text-emerald-400 font-bold rounded-lg flex items-center justify-center gap-2"
                                        >
                                            {isPlaying.after ? <Pause size={18} /> : <Play size={18} />}
                                            {isPlaying.after ? 'Pause' : 'Play Recording'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Summary */}
                    {stats && (
                        <div className="bg-gradient-to-r from-blue-900/30 to-emerald-900/30 border border-blue-500/20 rounded-2xl p-6 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Calendar className="text-blue-400" size={20} />
                                <span className="text-slate-400">
                                    {stats.daysBetween} days of progress
                                </span>
                            </div>

                            <div className="text-4xl font-bold mb-2">
                                <span className={stats.pitchChange > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                                    {stats.pitchChange > 0 ? '+' : ''}{Math.round(stats.pitchChange)} Hz
                                </span>
                            </div>
                            <p className="text-slate-400">
                                {stats.pitchChange > 0
                                    ? 'Your pitch has increased! Keep up the great work.'
                                    : stats.pitchChange < 0
                                        ? 'Your pitch has lowered. Focus on pitch exercises.'
                                        : 'Your pitch is consistent.'}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BeforeAfterCompare;
