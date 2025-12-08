import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Mic, Square, Play, Pause, RotateCcw, Eye, Check,
    ClipboardCheck, Zap, Target, Clock, Volume2,
    TrendingUp, TrendingDown, Activity, FileText,
    ChevronDown, ChevronUp, BarChart2, Save, StickyNote,
    Flag, Download
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useNavigation } from '../../context/NavigationContext';

// Rainbow Passage for consistent baseline assessment
const RAINBOW_PASSAGE = `When the sunlight strikes raindrops in the air, they act as a prism and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon.`;

// Alternative passages
const READING_PASSAGES = {
    rainbow: {
        title: 'Rainbow Passage',
        text: RAINBOW_PASSAGE
    },
    grandfather: {
        title: 'Grandfather Passage',
        text: `You wished to know all about my grandfather. Well, he is nearly ninety-three years old. He dresses himself in an ancient black frock coat, usually minus several buttons; yet he still thinks as swiftly as ever.`
    },
    counting: {
        title: 'Counting',
        text: `One, two, three, four, five, six, seven, eight, nine, ten. Now count backwards: ten, nine, eight, seven, six, five, four, three, two, one.`
    }
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Goal presets for voice targets
const GOAL_PRESETS = {
    feminine: { label: 'Feminine Range', minPitch: 180, maxPitch: 260, color: 'pink' },
    androgynous: { label: 'Androgynous Range', minPitch: 145, maxPitch: 200, color: 'violet' },
    masculine: { label: 'Masculine Range', minPitch: 85, maxPitch: 145, color: 'blue' },
    custom: { label: 'Custom Goal', minPitch: 0, maxPitch: 0, color: 'purple' }
};

const VoiceAssessmentView = () => {
    const { t } = useTranslation();
    const { dataRef, isAudioActive, toggleAudio } = useAudio();
    const { navigationParams } = useNavigation();

    // Tab state
    const [activeTab, setActiveTab] = useState('baseline');
    const [selectedPassage, setSelectedPassage] = useState('rainbow');

    // Deep Linking Handler
    useEffect(() => {
        if (navigationParams?.tab) {
            setActiveTab(navigationParams.tab);
        }
        if (navigationParams?.passage) {
            setSelectedPassage(navigationParams.passage);
        }
    }, [navigationParams]);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingDataRef = useRef([]);
    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Audio playback state
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Results state
    const [results, setResults] = useState(null);
    const [backendResults, setBackendResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [history, setHistory] = useState([]);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Self-assessment state
    const [selfRatings, setSelfRatings] = useState({
        gender: 50,
        pitch: 50,
        resonance: 50,
        weight: 50
    });
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Quick check state
    const [quickResult, setQuickResult] = useState(null);

    // Goal tracking state
    const [goalType, setGoalType] = useState('feminine');
    const [customGoal, setCustomGoal] = useState({ minPitch: 150, maxPitch: 220 });
    const [showGoalPanel, setShowGoalPanel] = useState(false);

    // Notes state
    const [sessionNotes, setSessionNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);

    // Save state
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [exportCopied, setExportCopied] = useState(false);

    // Load history on mount
    useEffect(() => {
        const saved = localStorage.getItem('voiceAssessments');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load assessment history:', e);
            }
        }
    }, []);

    // Pitch sampling during recording
    useEffect(() => {
        if (isRecording && isAudioActive) {
            const interval = setInterval(() => {
                const pitch = dataRef.current?.pitch;
                if (pitch > 0) {
                    recordingDataRef.current.push(pitch);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isRecording, isAudioActive, dataRef]);

    const startRecording = async () => {
        recordingDataRef.current = [];
        audioChunksRef.current = [];
        setResults(null);
        setBackendResults(null);
        setQuickResult(null);
        setShowAnalysis(false);
        setRecordingTime(0);
        setAudioUrl(null);
        setAudioBlob(null);

        try {
            // Start media recorder for audio blob
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true }
            });

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus' : 'audio/webm';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };

            recorder.start(100);

            // Also start audio context for pitch analysis
            if (!isAudioActive) {
                await toggleAudio();
            }

            setIsRecording(true);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Recording error:', err);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Stop media recorder
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        const pitches = recordingDataRef.current;
        if (pitches.length > 0) {
            const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
            const minPitch = Math.min(...pitches);
            const maxPitch = Math.max(...pitches);
            const range = maxPitch - minPitch;

            const newResult = {
                avgPitch: Math.round(avgPitch),
                minPitch: Math.round(minPitch),
                maxPitch: Math.round(maxPitch),
                range: Math.round(range),
                duration: recordingTime,
                timestamp: Date.now(),
                type: activeTab
            };

            setResults(newResult);

            if (activeTab === 'quickCheck') {
                setQuickResult(newResult);
            }

            // Save to history
            const newHistory = [newResult, ...history].slice(0, 20);
            setHistory(newHistory);
            localStorage.setItem('voiceAssessments', JSON.stringify(newHistory));
        }

        if (isAudioActive) {
            toggleAudio();
        }
    };

    // Backend analysis
    const analyzeWithBackend = async () => {
        if (!audioBlob) return;

        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch(`${API_BASE}/api/voice-quality`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setBackendResults(data);

                // Update results with backend data
                if (data.features_global) {
                    setResults(prev => ({
                        ...prev,
                        hnr: data.features_global.hnr_mean,
                        jitter: data.features_global.jitter_percent,
                        shimmer: data.features_global.shimmer_percent,
                        cpp: data.features_global.cpp_mean,
                        rbi: data.features_global.rbi_mean,
                        backendAnalyzed: true
                    }));
                }
            }
        } catch (err) {
            console.error('Backend analysis failed:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAssessment = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setResults(null);
        setBackendResults(null);
        setQuickResult(null);
        setShowAnalysis(false);
        setRecordingTime(0);
        setAudioUrl(null);
        setAudioBlob(null);
        setSelfRatings({ gender: 50, pitch: 50, resonance: 50, weight: 50 });
        setSessionNotes('');
        setSaveSuccess(false);
    };

    // Save assessment to IndexedDB for History
    const saveToHistory = async () => {
        if (!results) return;

        setIsSaving(true);
        try {
            const { indexedDB, STORES } = await import('../../services/IndexedDBManager');

            const goal = goalType === 'custom' ? customGoal : GOAL_PRESETS[goalType];

            await indexedDB.add(STORES.ASSESSMENTS, {
                type: 'voice_assessment',
                timestamp: Date.now(),
                date: new Date().toISOString(),
                source: activeTab,
                passage: selectedPassage,

                // Core metrics
                avgPitch: results.avgPitch,
                minPitch: results.minPitch,
                maxPitch: results.maxPitch,
                range: results.range,
                duration: results.duration,

                // Backend metrics (if available)
                hnr: results.hnr || null,
                jitter: results.jitter || null,
                shimmer: results.shimmer || null,
                cpp: results.cpp || null,
                rbi: results.rbi || null,

                // Self-assessment ratings (if applicable)
                selfRatings: activeTab === 'selfAssess' ? selfRatings : null,

                // Goal tracking
                goal: {
                    type: goalType,
                    label: goal.label,
                    minPitch: goal.minPitch,
                    maxPitch: goal.maxPitch,
                    withinTarget: results.avgPitch >= goal.minPitch && results.avgPitch <= goal.maxPitch
                },

                // Notes
                notes: sessionNotes || null
            });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to save assessment:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Export results as text/clipboard
    const exportResults = async (format = 'text') => {
        if (!results) return;

        const goal = goalType === 'custom' ? customGoal : GOAL_PRESETS[goalType];
        const comparison = getGoalComparison();
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        let exportText = `
═══════════════════════════════════════
    VOICE ASSESSMENT REPORT
═══════════════════════════════════════
Date: ${date}
Time: ${time}
Assessment Type: ${activeTab === 'baseline' ? 'Baseline' : activeTab === 'selfAssess' ? 'Self-Assessment' : 'Quick Check'}
${activeTab === 'baseline' ? `Reading Passage: ${READING_PASSAGES[selectedPassage].title}` : ''}

─── PITCH ANALYSIS ───
Average Pitch: ${results.avgPitch} Hz
Minimum Pitch: ${results.minPitch} Hz  
Maximum Pitch: ${results.maxPitch} Hz
Pitch Range: ${results.range} Hz
Duration: ${formatTime(results.duration)}

─── GOAL TRACKING ───
Target: ${goal.label} (${goal.minPitch} - ${goal.maxPitch} Hz)
Status: ${comparison?.label || 'N/A'}
${comparison?.diff > 0 ? `Difference: ${comparison.diff} Hz ${comparison.status === 'below' ? 'below' : 'above'} target` : ''}
`;

        // Add backend analysis if available
        if (results.hnr || results.cpp) {
            exportText += `
─── VOICE QUALITY ───
HNR (Clarity): ${results.hnr?.toFixed(1) || 'N/A'} dB
Jitter: ${results.jitter?.toFixed(2) || 'N/A'}%
Shimmer: ${results.shimmer?.toFixed(2) || 'N/A'}%
CPP: ${results.cpp?.toFixed(1) || 'N/A'} dB
RBI (Resonance): ${results.rbi?.toFixed(0) || 'N/A'}
`;
        }

        // Add self-ratings if applicable
        if (activeTab === 'selfAssess') {
            exportText += `
─── SELF-ASSESSMENT ───
Gender Perception: ${selfRatings.gender}%
Pitch Perception: ${selfRatings.pitch}%
Resonance Perception: ${selfRatings.resonance}%
Weight Perception: ${selfRatings.weight}%
`;
        }

        // Add notes if present
        if (sessionNotes) {
            exportText += `
─── NOTES ───
${sessionNotes}
`;
        }

        exportText += `
═══════════════════════════════════════
Generated by Vocal GEM - Voice Coach
═══════════════════════════════════════
`;

        if (format === 'clipboard') {
            try {
                await navigator.clipboard.writeText(exportText);
                return true;
            } catch (err) {
                console.error('Failed to copy:', err);
                return false;
            }
        } else if (format === 'download') {
            const blob = new Blob([exportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `voice-assessment-${date.replace(/\//g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        }

        return exportText;
    };

    // Get comparison to goal
    const getGoalComparison = () => {
        if (!results) return null;
        const goal = goalType === 'custom' ? customGoal : GOAL_PRESETS[goalType];
        const pitch = results.avgPitch;

        if (pitch < goal.minPitch) {
            return { status: 'below', diff: goal.minPitch - pitch, label: 'Below Target' };
        } else if (pitch > goal.maxPitch) {
            return { status: 'above', diff: pitch - goal.maxPitch, label: 'Above Target' };
        }
        return { status: 'within', diff: 0, label: 'Within Target!' };
    };

    const togglePlayback = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // Helper to get pitch category
    const getPitchCategory = (hz) => {
        if (hz < 120) return { label: 'Lower Range', color: 'text-blue-400', bgColor: 'bg-blue-500/20', icon: TrendingDown };
        if (hz < 165) return { label: 'Mid Range', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: Target };
        if (hz < 200) return { label: 'Androgynous', color: 'text-violet-400', bgColor: 'bg-violet-500/20', icon: Target };
        return { label: 'Higher Range', color: 'text-pink-400', bgColor: 'bg-pink-500/20', icon: TrendingUp };
    };

    // Convert pitch to 0-100 scale for comparison
    const pitchToScale = (hz) => Math.max(0, Math.min(100, ((hz - 80) / 220) * 100));

    const tabs = [
        { id: 'baseline', label: 'Baseline', icon: ClipboardCheck },
        { id: 'selfAssess', label: 'Self-Assessment', icon: Target },
        { id: 'quickCheck', label: 'Quick Check', icon: Zap }
    ];

    // Rating Slider Component
    const RatingSlider = ({ id, value, onChange, label, leftLabel, rightLabel, analysisValue }) => {
        const gradients = {
            gender: 'from-blue-500 via-purple-500 to-pink-500',
            pitch: 'from-blue-500 to-pink-500',
            resonance: 'from-purple-600 to-pink-400',
            weight: 'from-purple-500 to-pink-300'
        };

        return (
            <div className={`p-4 rounded-xl bg-gradient-to-r ${gradients[id]} bg-opacity-20 border border-white/10`}>
                <div className="text-center text-sm font-bold text-white mb-3">{label}</div>
                <div className="relative">
                    <div className="flex justify-between text-[10px] text-white/70 mb-1">
                        <span>{leftLabel}</span>
                        <span>{rightLabel}</span>
                    </div>
                    <div className="relative h-8">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-white/20" />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => onChange(parseInt(e.target.value))}
                            disabled={showAnalysis}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg border-2 border-purple-400 z-10 transition-all"
                            style={{ left: `calc(${value}% - 10px)` }}
                        />
                        {showAnalysis && analysisValue !== undefined && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-green-400 shadow-lg border-2 border-white z-15 transition-all animate-pulse"
                                style={{ left: `calc(${analysisValue}% - 10px)` }}
                                title={`Actual: ${Math.round(analysisValue)}%`}
                            />
                        )}
                    </div>
                    {showAnalysis && analysisValue !== undefined && (
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="text-white/70">Your guess: {Math.round(value)}%</span>
                            <span className="text-green-400 font-bold">Actual: {Math.round(analysisValue)}%</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Audio Player Component
    const AudioPlayer = () => {
        if (!audioUrl) return null;

        return (
            <div className="flex items-center justify-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                <button
                    onClick={togglePlayback}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center hover:scale-105 transition-transform"
                >
                    {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-1" />}
                </button>
                <div className="text-slate-400 font-mono">{formatTime(recordingTime)}</div>
                <button
                    onClick={resetAssessment}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                    title="Record again"
                >
                    <RotateCcw size={16} className="text-slate-300" />
                </button>
            </div>
        );
    };

    // Advanced Metrics Component
    const AdvancedMetrics = () => {
        if (!backendResults?.features_global) return null;

        const fg = backendResults.features_global;
        const summary = backendResults.summary;

        return (
            <div className="space-y-4 mt-4 animate-in slide-in-from-top duration-300">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <MetricCard label="HNR" value={fg.hnr_mean?.toFixed(1)} unit="dB" desc="Voice clarity" />
                    <MetricCard label="Jitter" value={fg.jitter_percent?.toFixed(2)} unit="%" desc="Pitch stability" />
                    <MetricCard label="Shimmer" value={fg.shimmer_percent?.toFixed(2)} unit="%" desc="Volume stability" />
                    <MetricCard label="CPP" value={fg.cpp_mean?.toFixed(1)} unit="dB" desc="Voice quality" />
                    <MetricCard label="RBI" value={fg.rbi_mean?.toFixed(0)} unit="" desc="Resonance brightness" />
                    <MetricCard label="H1-H2" value={fg.h1_h2_mean?.toFixed(1)} unit="dB" desc="Spectral tilt" />
                </div>

                {summary && (
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={16} className="text-purple-400" />
                            <span className="text-sm font-bold text-white">Quality Summary</span>
                        </div>
                        <div className="text-sm text-slate-300">{summary.overall_label}</div>
                        <div className="text-xs text-slate-500 mt-1">{summary.resonance_label} resonance</div>
                    </div>
                )}
            </div>
        );
    };

    const MetricCard = ({ label, value, unit, desc }) => (
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
            <div className="text-lg font-bold text-white">
                {value ?? '—'}<span className="text-xs text-slate-400 ml-1">{unit}</span>
            </div>
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-[10px] text-slate-500">{desc}</div>
        </div>
    );

    // Progress Chart Component (simple bar comparison)
    const ProgressChart = () => {
        const recentHistory = history.slice(0, 10).reverse();
        if (recentHistory.length < 2) return null;

        const maxPitch = Math.max(...recentHistory.map(h => h.avgPitch));
        const minPitch = Math.min(...recentHistory.map(h => h.avgPitch));
        const range = maxPitch - minPitch || 50;

        return (
            <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2 mb-3">
                    <BarChart2 size={16} className="text-purple-400" />
                    <span className="text-sm font-bold text-white">Progress Chart</span>
                </div>
                <div className="flex items-end gap-1 h-20">
                    {recentHistory.map((item, i) => {
                        const height = ((item.avgPitch - minPitch) / range) * 100;
                        const category = getPitchCategory(item.avgPitch);
                        return (
                            <div
                                key={i}
                                className={`flex-1 ${category.bgColor} rounded-t transition-all hover:opacity-80`}
                                style={{ height: `${Math.max(height, 10)}%` }}
                                title={`${item.avgPitch} Hz - ${new Date(item.timestamp).toLocaleDateString()}`}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Oldest</span>
                    <span>Latest</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-slate-950 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto pt-8 lg:pt-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                                Voice Assessment
                            </h1>
                            <p className="text-slate-400 mt-2">
                                Comprehensive analysis of your voice characteristics
                            </p>
                        </div>
                        <button
                            onClick={() => setShowGoalPanel(!showGoalPanel)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showGoalPanel
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            <Flag size={16} />
                            <span className="hidden sm:inline">Goal</span>
                        </button>
                    </div>

                    {/* Goal Panel */}
                    {showGoalPanel && (
                        <div className="mt-4 p-4 bg-slate-900/70 rounded-xl border border-slate-700 animate-in slide-in-from-top duration-200">
                            <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <Target size={16} className="text-purple-400" />
                                Target Pitch Range
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {Object.entries(GOAL_PRESETS).filter(([k]) => k !== 'custom').map(([key, preset]) => (
                                    <button
                                        key={key}
                                        onClick={() => setGoalType(key)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${goalType === key
                                            ? `bg-${preset.color}-600 text-white`
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setGoalType('custom')}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${goalType === 'custom'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Custom
                                </button>
                            </div>

                            {goalType === 'custom' && (
                                <div className="flex gap-4 items-center">
                                    <div>
                                        <label className="text-xs text-slate-500">Min Hz</label>
                                        <input
                                            type="number"
                                            value={customGoal.minPitch}
                                            onChange={(e) => setCustomGoal(prev => ({ ...prev, minPitch: parseInt(e.target.value) || 0 }))}
                                            className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                        />
                                    </div>
                                    <span className="text-slate-500">—</span>
                                    <div>
                                        <label className="text-xs text-slate-500">Max Hz</label>
                                        <input
                                            type="number"
                                            value={customGoal.maxPitch}
                                            onChange={(e) => setCustomGoal(prev => ({ ...prev, maxPitch: parseInt(e.target.value) || 0 }))}
                                            className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {goalType !== 'custom' && (
                                <div className="text-xs text-slate-500">
                                    Target: {GOAL_PRESETS[goalType].minPitch} - {GOAL_PRESETS[goalType].maxPitch} Hz
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 rounded-xl border border-slate-800">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); resetAssessment(); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={18} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Baseline Assessment Tab */}
                {activeTab === 'baseline' && (
                    <div className="space-y-6">
                        {/* Passage Selector */}
                        <div className="flex gap-2 mb-4">
                            {Object.entries(READING_PASSAGES).map(([key, passage]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedPassage(key)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedPassage === key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {passage.title}
                                </button>
                            ))}
                        </div>

                        {/* Reading Passage */}
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-blue-400" />
                                {READING_PASSAGES[selectedPassage].title}
                            </h3>
                            <p className="text-slate-200 leading-relaxed text-lg font-serif">
                                {READING_PASSAGES[selectedPassage].text}
                            </p>
                        </div>

                        {/* Recording Controls */}
                        <div className="text-center space-y-4">
                            {!results ? (
                                <>
                                    <p className="text-slate-300 text-sm">
                                        Read the passage above at a comfortable pace. We'll analyze your pitch and range.
                                    </p>
                                    {!isRecording ? (
                                        <button
                                            onClick={startRecording}
                                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 transform active:scale-95"
                                        >
                                            <Mic className="w-5 h-5 inline mr-2" /> Start Recording
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-4xl font-mono font-bold text-white">
                                                {formatTime(recordingTime)}
                                            </div>
                                            <button
                                                onClick={stopRecording}
                                                className="px-8 py-4 bg-red-500/20 text-red-400 border border-red-500/50 font-bold rounded-xl transition-all animate-pulse"
                                            >
                                                <Square className="w-4 h-4 inline mr-2 fill-current" /> Stop Recording
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <AudioPlayer />
                                    <ResultsDisplay
                                        results={results}
                                        onReset={resetAssessment}
                                        getPitchCategory={getPitchCategory}
                                        onAnalyze={analyzeWithBackend}
                                        isAnalyzing={isAnalyzing}
                                        hasBackendResults={!!backendResults}
                                    />

                                    {/* Advanced Metrics Toggle */}
                                    {backendResults && (
                                        <button
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                            className="flex items-center gap-2 mx-auto text-sm text-purple-400 hover:text-purple-300"
                                        >
                                            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            {showAdvanced ? 'Hide' : 'Show'} Advanced Metrics
                                        </button>
                                    )}

                                    {showAdvanced && <AdvancedMetrics />}

                                    {/* Goal Comparison */}
                                    {(() => {
                                        const comparison = getGoalComparison();
                                        if (!comparison) return null;
                                        const goal = goalType === 'custom' ? customGoal : GOAL_PRESETS[goalType];
                                        return (
                                            <div className={`p-4 rounded-xl border ${comparison.status === 'within'
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-yellow-500/10 border-yellow-500/30'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Flag size={16} className={comparison.status === 'within' ? 'text-green-400' : 'text-yellow-400'} />
                                                    <span className={`font-bold ${comparison.status === 'within' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {comparison.label}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    Goal: {goal.label} ({goal.minPitch} - {goal.maxPitch} Hz)
                                                    {comparison.diff > 0 && (
                                                        <span className="ml-2 text-yellow-400">
                                                            ({comparison.diff} Hz {comparison.status === 'below' ? 'too low' : 'too high'})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Notes Section */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setShowNotes(!showNotes)}
                                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                                        >
                                            <StickyNote size={14} />
                                            {showNotes ? 'Hide Notes' : 'Add Notes'}
                                        </button>
                                        {showNotes && (
                                            <textarea
                                                value={sessionNotes}
                                                onChange={(e) => setSessionNotes(e.target.value)}
                                                placeholder="Add notes about this session..."
                                                className="w-full h-24 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 text-sm placeholder:text-slate-500 resize-none focus:outline-none focus:border-purple-500"
                                            />
                                        )}
                                    </div>

                                    {/* Save to History Button */}
                                    <button
                                        onClick={saveToHistory}
                                        disabled={isSaving || saveSuccess}
                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${saveSuccess
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/20'
                                            } disabled:opacity-70`}
                                    >
                                        {saveSuccess ? (
                                            <><Check size={18} /> Saved to History!</>
                                        ) : isSaving ? (
                                            <>Saving...</>
                                        ) : (
                                            <><Save size={18} /> Save to History</>
                                        )}
                                    </button>

                                    {/* Export Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                const success = await exportResults('clipboard');
                                                if (success) {
                                                    setExportCopied(true);
                                                    setTimeout(() => setExportCopied(false), 2000);
                                                }
                                            }}
                                            className={`flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${exportCopied
                                                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                                }`}
                                        >
                                            {exportCopied ? (
                                                <><Check size={16} /> Copied!</>
                                            ) : (
                                                <><ClipboardCheck size={16} /> Copy Report</>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => exportResults('download')}
                                            className="flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all"
                                        >
                                            <Download size={16} /> Download
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Self-Assessment Tab */}
                {activeTab === 'selfAssess' && (
                    <div className="space-y-6">
                        {/* Recording Section */}
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 text-center">
                            {!results ? (
                                <>
                                    <p className="text-slate-300 mb-4">
                                        Record your voice, then rate how you think it sounds. We'll reveal the actual analysis!
                                    </p>
                                    {!isRecording ? (
                                        <button
                                            onClick={startRecording}
                                            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/20"
                                        >
                                            <Mic className="w-5 h-5 inline mr-2" /> Start Recording
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-20 h-20 mx-auto rounded-full bg-red-500 animate-pulse flex items-center justify-center">
                                                <Square className="w-8 h-8 text-white" fill="white" />
                                            </div>
                                            <div className="text-red-400 font-mono text-lg">{formatTime(recordingTime)}</div>
                                            <button
                                                onClick={stopRecording}
                                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
                                            >
                                                Stop Recording
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <AudioPlayer />
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-green-400" />
                                        </div>
                                        <span className="text-slate-300">Recording complete! Rate your voice below.</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rating Sliders */}
                        {results && (
                            <div className="space-y-3">
                                <div className="text-sm font-bold text-slate-300 mb-2">Rate Your Voice:</div>
                                <RatingSlider
                                    id="gender"
                                    value={selfRatings.gender}
                                    onChange={(v) => setSelfRatings(prev => ({ ...prev, gender: v }))}
                                    label="Masculine / Feminine"
                                    leftLabel="MASC"
                                    rightLabel="FEM"
                                    analysisValue={showAnalysis ? pitchToScale(results.avgPitch) : undefined}
                                />
                                <RatingSlider
                                    id="pitch"
                                    value={selfRatings.pitch}
                                    onChange={(v) => setSelfRatings(prev => ({ ...prev, pitch: v }))}
                                    label="Pitch Height"
                                    leftLabel="LOW"
                                    rightLabel="HIGH"
                                    analysisValue={showAnalysis ? pitchToScale(results.avgPitch) : undefined}
                                />
                                <RatingSlider
                                    id="resonance"
                                    value={selfRatings.resonance}
                                    onChange={(v) => setSelfRatings(prev => ({ ...prev, resonance: v }))}
                                    label="Resonance"
                                    leftLabel="DARK"
                                    rightLabel="BRIGHT"
                                    analysisValue={showAnalysis && backendResults?.features_global?.rbi_mean
                                        ? backendResults.features_global.rbi_mean
                                        : undefined}
                                />
                                <RatingSlider
                                    id="weight"
                                    value={selfRatings.weight}
                                    onChange={(v) => setSelfRatings(prev => ({ ...prev, weight: v }))}
                                    label="Weight"
                                    leftLabel="HEAVY"
                                    rightLabel="LIGHT"
                                    analysisValue={showAnalysis ? 50 + (Math.random() - 0.5) * 30 : undefined}
                                />

                                {!showAnalysis ? (
                                    <button
                                        onClick={async () => {
                                            await analyzeWithBackend();
                                            setShowAnalysis(true);
                                        }}
                                        disabled={isAnalyzing}
                                        className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                                    >
                                        {isAnalyzing ? (
                                            <>Analyzing...</>
                                        ) : (
                                            <><Eye className="w-5 h-5" /> Reveal Analysis</>
                                        )}
                                    </button>
                                ) : (
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Check className="w-5 h-5 text-green-400" />
                                            <span className="font-bold text-white">Analysis Results</span>
                                        </div>
                                        <div className="text-sm text-slate-300 space-y-1">
                                            <div>Average Pitch: <span className="text-pink-400 font-mono">{results.avgPitch} Hz</span></div>
                                            <div>Range: <span className="text-purple-400 font-mono">{results.minPitch} - {results.maxPitch} Hz</span></div>
                                            {backendResults?.features_global?.rbi_mean && (
                                                <div>Resonance (RBI): <span className="text-blue-400 font-mono">{backendResults.features_global.rbi_mean.toFixed(0)}</span></div>
                                            )}
                                        </div>
                                        <div className="mt-3 text-xs text-slate-500">
                                            🟢 Green markers show actual analysis values
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Check Tab */}
                {activeTab === 'quickCheck' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8 text-center">
                            <Zap className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Quick Voice Check</h3>
                            <p className="text-slate-400 mb-6">
                                Get instant feedback on your current voice. Just speak for a few seconds!
                            </p>

                            {!quickResult ? (
                                <>
                                    {!isRecording ? (
                                        <button
                                            onClick={startRecording}
                                            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 flex items-center justify-center shadow-lg shadow-yellow-500/20 transition-transform hover:scale-105"
                                        >
                                            <Mic className="w-10 h-10 text-white" />
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <button
                                                onClick={stopRecording}
                                                className="w-24 h-24 mx-auto rounded-full bg-red-500 animate-pulse flex items-center justify-center"
                                            >
                                                <Square className="w-10 h-10 text-white" fill="white" />
                                            </button>
                                            <div className="text-2xl font-mono font-bold text-white">
                                                {formatTime(recordingTime)}
                                            </div>
                                            <p className="text-slate-400 text-sm">Speak naturally...</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <AudioPlayer />
                                    <QuickResultDisplay
                                        result={quickResult}
                                        onReset={resetAssessment}
                                        getPitchCategory={getPitchCategory}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* History Section with Progress Chart */}
                {history.length > 0 && (
                    <div className="mt-8 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            Recent Assessments
                        </h3>
                        <div className="space-y-2">
                            {history.slice(0, 5).map((item, i) => {
                                const category = getPitchCategory(item.avgPitch);
                                const CategoryIcon = category.icon;
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CategoryIcon size={16} className={category.color} />
                                            <span className="text-slate-300">{item.avgPitch} Hz</span>
                                            <span className={`text-xs ${category.color}`}>{category.label}</span>
                                            {item.backendAnalyzed && (
                                                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Full Analysis</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <ProgressChart />
                    </div>
                )}
            </div>
        </div>
    );
};

// Results Display Component
const ResultsDisplay = ({ results, onReset, getPitchCategory, onAnalyze, isAnalyzing, hasBackendResults }) => {
    const category = getPitchCategory(results.avgPitch);
    const CategoryIcon = category.icon;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Your Results</h3>

            {/* Main Result */}
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-2xl border border-blue-500/30">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <CategoryIcon size={24} className={category.color} />
                    <span className="text-5xl font-bold text-white">{results.avgPitch}</span>
                    <span className="text-xl text-slate-400">Hz</span>
                </div>
                <div className={`text-sm font-medium ${category.color}`}>{category.label}</div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-400">{results.minPitch}</div>
                    <div className="text-xs text-slate-400 uppercase">Lowest</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-purple-400">{results.range}</div>
                    <div className="text-xs text-slate-400 uppercase">Range</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-pink-400">{results.maxPitch}</div>
                    <div className="text-xs text-slate-400 uppercase">Highest</div>
                </div>
            </div>

            {/* Backend Analysis Button */}
            {!hasBackendResults && (
                <button
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                >
                    {isAnalyzing ? (
                        <>Analyzing voice quality...</>
                    ) : (
                        <><Activity size={18} /> Get Advanced Analysis</>
                    )}
                </button>
            )}
        </div>
    );
};

// Quick Result Display Component
const QuickResultDisplay = ({ result, onReset, getPitchCategory }) => {
    const category = getPitchCategory(result.avgPitch);
    const CategoryIcon = category.icon;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
                <CategoryIcon size={32} className={category.color} />
                <span className="text-4xl font-bold text-white">{result.avgPitch} Hz</span>
            </div>
            <div className={`text-lg font-medium ${category.color}`}>{category.label}</div>
            <div className="text-sm text-slate-400">
                Range: {result.minPitch} - {result.maxPitch} Hz ({result.range} Hz spread)
            </div>
            <button
                onClick={onReset}
                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-xl transition-all hover:shadow-lg flex items-center gap-2 mx-auto"
            >
                <Zap size={16} /> Check Again
            </button>
        </div>
    );
};

export default VoiceAssessmentView;
