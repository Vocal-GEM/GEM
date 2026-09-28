import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Mic, Square, Play, Pause, Trash2, Calendar, Clock, Music, Plus, X, Tag, FileText, Search, Filter, TrendingUp, ChevronDown } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { getRecordings, saveRecording, deleteRecording, updateRecording } from '../../services/VoiceJournalService';
import { recordPractice } from '../../services/StreakService';
import { JOURNAL_TEMPLATES, getTemplateById, formatTemplateAsEntry } from '../../data/journalTemplates';

// Waveform Visualization Component
const WaveformVisualizer = ({ audioBlob, isPlaying, onSeek }) => {
    const canvasRef = useRef(null);
    const [waveformData, setWaveformData] = useState([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!audioBlob) return;

        const analyzeAudio = async () => {
            try {
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const channelData = audioBuffer.getChannelData(0);

                // Downsample to ~100 points for visualization
                const samples = 100;
                const blockSize = Math.floor(channelData.length / samples);
                const dataPoints = [];

                for (let i = 0; i < samples; i++) {
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(channelData[i * blockSize + j]);
                    }
                    dataPoints.push(sum / blockSize);
                }

                // Normalize
                const max = Math.max(...dataPoints);
                const normalized = dataPoints.map(d => d / max);
                setWaveformData(normalized);
                audioContext.close();
            } catch (err) {
                console.error('Failed to analyze audio:', err);
            }
        };

        analyzeAudio();
    }, [audioBlob]);

    useEffect(() => {
        if (!canvasRef.current || waveformData.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const barWidth = width / waveformData.length;

        ctx.clearRect(0, 0, width, height);

        waveformData.forEach((value, index) => {
            const barHeight = value * height * 0.8;
            const x = index * barWidth;
            const y = (height - barHeight) / 2;

            // Color based on progress
            const progressIndex = Math.floor(progress * waveformData.length);
            if (index < progressIndex) {
                ctx.fillStyle = '#ec4899'; // Pink for played
            } else {
                ctx.fillStyle = '#475569'; // Slate for unplayed
            }

            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
    }, [waveformData, progress]);

    const handleClick = (e) => {
        if (!onSeek) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = x / rect.width;
        onSeek(progress);
    };

    return (
        <canvas
            ref={canvasRef}
            width={200}
            height={40}
            className="cursor-pointer rounded"
            onClick={handleClick}
        />
    );
};

// Mini Pitch Trend Chart
const PitchTrendChart = ({ recordings }) => {
    const canvasRef = useRef(null);

    const pitchData = useMemo(() => {
        return recordings
            .filter(r => r.pitchData?.avg)
            .slice(-10) // Last 10 recordings
            .map(r => ({
                pitch: r.pitchData.avg,
                date: new Date(r.timestamp)
            }));
    }, [recordings]);

    useEffect(() => {
        if (!canvasRef.current || pitchData.length < 2) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 10;

        ctx.clearRect(0, 0, width, height);

        const pitches = pitchData.map(d => d.pitch);
        const minPitch = Math.min(...pitches) - 20;
        const maxPitch = Math.max(...pitches) + 20;
        const range = maxPitch - minPitch;

        // Draw trend line
        ctx.beginPath();
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 2;

        pitchData.forEach((point, i) => {
            const x = padding + (i / (pitchData.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((point.pitch - minPitch) / range) * (height - 2 * padding);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw points
        pitchData.forEach((point, i) => {
            const x = padding + (i / (pitchData.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((point.pitch - minPitch) / range) * (height - 2 * padding);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#14b8a6';
            ctx.fill();
        });
    }, [pitchData]);

    if (pitchData.length < 2) {
        return (
            <div className="text-center py-4 text-slate-500 text-sm">
                Record more sessions to see pitch trends
            </div>
        );
    }

    const avgPitch = pitchData.reduce((sum, d) => sum + d.pitch, 0) / pitchData.length;
    const firstPitch = pitchData[0].pitch;
    const lastPitch = pitchData[pitchData.length - 1].pitch;
    const trend = lastPitch - firstPitch;

    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp size={16} className="text-teal-400" />
                    Pitch Trend
                </h3>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Avg: {Math.round(avgPitch)}Hz</span>
                    <span className={trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}>
                        {trend > 0 ? '+' : ''}{Math.round(trend)}Hz
                    </span>
                </div>
            </div>
            <canvas ref={canvasRef} width={280} height={60} className="w-full" />
        </div>
    );
};

// Available tags
const AVAILABLE_TAGS = [
    { id: 'morning', label: 'Morning', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'evening', label: 'Evening', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { id: 'tired', label: 'Tired', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    { id: 'energized', label: 'Energized', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { id: 'practice', label: 'Practice', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { id: 'test', label: 'Voice Test', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'milestone', label: 'Milestone', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    { id: 'difficult', label: 'Difficult', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

const VoiceJournalView = () => {
    const { showError } = useToast();
    const [recordings, setRecordings] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [playingId, setPlayingId] = useState(null);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [notes, setNotes] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [currentBlob, setCurrentBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedTags, setSelectedTags] = useState([]);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTag, setFilterTag] = useState(null);
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
    const [showFilters, setShowFilters] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    // ⚡ Bolt: Use useRef(null) and lazy init to avoid creating Audio objects on every render
    const audioRef = useRef(null);
    const timerRef = useRef(null);

    // Filtered recordings
    const filteredRecordings = useMemo(() => {
        return recordings.filter(recording => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesNotes = recording.notes?.toLowerCase().includes(query);
                const matchesTags = recording.tags?.some(t => t.toLowerCase().includes(query));
                if (!matchesNotes && !matchesTags) return false;
            }

            // Tag filter
            if (filterTag && !recording.tags?.includes(filterTag)) {
                return false;
            }

            // Date filter
            if (dateFilter !== 'all') {
                const recordingDate = new Date(recording.timestamp);
                const now = new Date();

                if (dateFilter === 'today') {
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    if (recordingDate < today) return false;
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (recordingDate < weekAgo) return false;
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (recordingDate < monthAgo) return false;
                }
            }

            return true;
        });
    }, [recordings, searchQuery, filterTag, dateFilter]);

    const toggleTag = useCallback((tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        );
    }, []);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        loadRecordings();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const loadRecordings = async () => {
        try {
            const data = await getRecordings();
            setRecordings(data);
        } catch (err) {
            console.error('Failed to load recordings:', err);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setCurrentBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Failed to start recording:', err);
            showError('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleSave = async () => {
        if (!currentBlob) return;

        setIsSaving(true);
        try {
            await saveRecording({
                audioBlob: currentBlob,
                notes,
                duration: recordingTime,
                tags: selectedTags
            });
            recordPractice(); // Count as practice for streak
            setShowRecordModal(false);
            setCurrentBlob(null);
            setNotes('');
            setRecordingTime(0);
            setSelectedTags([]);
            loadRecordings();
        } catch (err) {
            console.error('Failed to save recording:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePlay = (recording) => {
        if (playingId === recording.id) {
            audioRef.current.pause();
            setPlayingId(null);
        } else {
            const url = URL.createObjectURL(recording.audioBlob);
            audioRef.current.src = url;
            audioRef.current.play();
            setPlayingId(recording.id);

            audioRef.current.onended = () => {
                setPlayingId(null);
                URL.revokeObjectURL(url);
            };
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this recording?')) {
            await deleteRecording(id);
            loadRecordings();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Voice Journal</h1>
                    <p className="text-slate-400">Track your voice progress over time</p>
                </div>
                <button
                    onClick={() => setShowRecordModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
                >
                    <Plus size={20} /> New Recording
                </button>
            </div>

            {/* Pitch Trend Chart */}
            {recordings.length > 0 && (
                <div className="mb-6">
                    <PitchTrendChart recordings={recordings} />
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="mb-6 space-y-3">
                <div className="flex gap-3">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search recordings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${showFilters ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                        <Filter size={18} />
                        <span className="hidden sm:inline">Filters</span>
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Date Filter */}
                        <div>
                            <label className="text-sm text-slate-400 mb-2 block">Date Range</label>
                            <div className="flex gap-2 flex-wrap">
                                {[
                                    { id: 'all', label: 'All Time' },
                                    { id: 'today', label: 'Today' },
                                    { id: 'week', label: 'This Week' },
                                    { id: 'month', label: 'This Month' },
                                ].map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => setDateFilter(option.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${dateFilter === option.id
                                            ? 'bg-pink-500 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tag Filter */}
                        <div>
                            <label className="text-sm text-slate-400 mb-2 block">Filter by Tag</label>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setFilterTag(null)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filterTag === null
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    All
                                </button>
                                {AVAILABLE_TAGS.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={() => setFilterTag(tag.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${filterTag === tag.id
                                            ? tag.color
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-transparent'
                                            }`}
                                    >
                                        {tag.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(searchQuery || filterTag || dateFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterTag(null);
                                    setDateFilter('all');
                                }}
                                className="text-sm text-pink-400 hover:text-pink-300"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}

                {/* Active Filters Summary */}
                {(searchQuery || filterTag || dateFilter !== 'all') && (
                    <div className="text-sm text-slate-400">
                        Showing {filteredRecordings.length} of {recordings.length} recordings
                    </div>
                )}
            </div>

            {/* Recordings Timeline */}
            <div className="space-y-4">
                {filteredRecordings.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800">
                        <Mic size={48} className="mx-auto text-slate-600 mb-4" />
                        {recordings.length === 0 ? (
                            <>
                                <p className="text-slate-400">No recordings yet</p>
                                <p className="text-slate-500 text-sm">Start journaling to track your voice progress!</p>
                            </>
                        ) : (
                            <>
                                <p className="text-slate-400">No recordings match your filters</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterTag(null);
                                        setDateFilter('all');
                                    }}
                                    className="text-pink-400 hover:text-pink-300 text-sm mt-2"
                                >
                                    Clear filters
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    filteredRecordings.map(recording => (
                        <div
                            key={recording.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Play Button */}
                                <button
                                    onClick={() => handlePlay(recording)}
                                    aria-label={playingId === recording.id ? "Pause recording" : "Play recording"}
                                    className={`p-4 rounded-full transition-colors flex-shrink-0 ${playingId === recording.id
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                        }`}
                                >
                                    {playingId === recording.id ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
                                </button>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 text-sm text-slate-400 mb-2 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} /> {formatDate(recording.timestamp)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} /> {formatTime(recording.duration)}
                                        </span>
                                        {recording.pitchData && (
                                            <span className="flex items-center gap-1 text-pink-400">
                                                <Music size={14} /> {Math.round(recording.pitchData.avg)}Hz
                                            </span>
                                        )}
                                    </div>

                                    {/* Waveform Visualization */}
                                    {recording.audioBlob && (
                                        <div className="mb-3">
                                            <WaveformVisualizer
                                                audioBlob={recording.audioBlob}
                                                isPlaying={playingId === recording.id}
                                            />
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {recording.tags && recording.tags.length > 0 && (
                                        <div className="flex gap-1.5 flex-wrap mb-2">
                                            {recording.tags.map(tagId => {
                                                const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                                                return tag ? (
                                                    <span
                                                        key={tagId}
                                                        className={`px-2 py-0.5 rounded text-xs border ${tag.color}`}
                                                    >
                                                        {tag.label}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}

                                    {recording.notes && (
                                        <p className="text-slate-300 text-sm line-clamp-2">{recording.notes}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <button
                                    onClick={() => handleDelete(recording.id)}
                                    aria-label="Delete recording"
                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                                >
                                    <Trash2 size={18} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Record Modal */}
            {showRecordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 rounded-2xl p-6 border border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">New Recording</h2>
                            <button
                                onClick={() => { setShowRecordModal(false); setCurrentBlob(null); setSelectedTags([]); }}
                                className="text-slate-400 hover:text-white"
                                aria-label="Close modal"
                            >
                                <X size={20} aria-hidden="true" />
                            </button>
                        </div>

                        {/* Recording UI */}
                        <div className="text-center mb-6">
                            {!currentBlob ? (
                                <>
                                    <div className="text-4xl font-mono text-white mb-4" role="timer" aria-label="Recording duration">{formatTime(recordingTime)}</div>
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        aria-label={isRecording ? "Stop recording" : "Start recording"}
                                        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${isRecording
                                            ? 'bg-red-500 animate-pulse'
                                            : 'bg-pink-500 hover:bg-pink-400'
                                            }`}
                                    >
                                        {isRecording ? <Square size={32} className="text-white" aria-hidden="true" /> : <Mic size={32} className="text-white" aria-hidden="true" />}
                                    </button>
                                    <p className="text-slate-400 text-sm mt-4" aria-live="polite">
                                        {isRecording ? 'Tap to stop' : 'Tap to start recording'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-emerald-400 text-lg mb-4">Recording saved ({formatTime(recordingTime)})</div>

                                    {/* Template Selector */}
                                    <div className="mb-4">
                                        <label id="template-label" className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                            <FileText size={14} aria-hidden="true" />
                                            Use a template (optional)
                                        </label>
                                        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="template-label">
                                            {JOURNAL_TEMPLATES.slice(0, 4).map(template => (
                                                <button
                                                    key={template.id}
                                                    onClick={() => {
                                                        setSelectedTemplate(template.id);
                                                        setNotes(formatTemplateAsEntry(template));
                                                    }}
                                                    aria-pressed={selectedTemplate === template.id}
                                                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all ${selectedTemplate === template.id
                                                            ? 'bg-purple-500 text-white'
                                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                        }`}
                                                >
                                                    <span aria-hidden="true">{template.icon}</span>
                                                    {template.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tags Selector */}
                                    <div className="mb-4">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                            <Tag size={14} aria-hidden="true" />
                                            Add tags
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_TAGS.map(tag => (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedTags.includes(tag.id)
                                                        ? tag.color
                                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-transparent'
                                                        }`}
                                                >
                                                    {tag.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add notes about this recording..."
                                        aria-label="Recording notes"
                                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                        rows={4}
                                    />
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        {currentBlob && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setCurrentBlob(null); setRecordingTime(0); }}
                                    className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                                    disabled={isSaving}
                                >
                                    Re-record
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                >
                                    {isSaving ? (
                                        <>
                                            <LoadingSpinner size="sm" variant="current" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceJournalView;
