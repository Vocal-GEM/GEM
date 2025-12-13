import { useState, useEffect, useRef } from 'react';
import { Mic, Upload, Play, Activity, FileText, Info, Save, History, Calendar, Trash2, Pause, Eye, HelpCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Toast from '../ui/Toast';
import { indexedDB, STORES } from '../../services/IndexedDBManager';
import Spectrogram from '../viz/Spectrogram';
import FileSpectrogram from '../viz/FileSpectrogram';
import RegisterGauge from '../viz/RegisterGauge';
import MicQualityTips from '../ui/MicQualityTips';
import { AudioEnhancer } from '../../utils/AudioEnhancer';

import { useAudio } from '../../context/AudioContext';

const VoiceQualityView = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('recorded'); // 'recorded' or 'live'
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [goal, setGoal] = useState('transfem_soft_slightly_breathy');
    const [toast, setToast] = useState(null);

    const [includeTranscript, setIncludeTranscript] = useState(true);

    // Mic Tips Modal State
    const [showMicTips, setShowMicTips] = useState(false);

    // Audio Enhancement State
    const [enhanceAudio, setEnhanceAudio] = useState(true);
    const [isEnhancing, setIsEnhancing] = useState(false);

    // History State
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Live Analysis State
    const [isLive, setIsLive] = useState(false);
    const [liveMetrics, setLiveMetrics] = useState(null);

    // Use Audio Engine
    const { audioEngineRef, setPassthrough } = useAudio();
    const audioEngine = audioEngineRef.current;

    // Metrics Ref for 60fps components
    const metricsRef = useRef(null);
    useEffect(() => {
        metricsRef.current = liveMetrics;
    }, [liveMetrics]);

    // Listen Mode
    const [isListenMode, setIsListenMode] = useState(false);
    const [showFeedbackWarning, setShowFeedbackWarning] = useState(false);

    // Audio playback for uploaded files
    const audioRef = useRef(null);
    const [audioBuffer, setAudioBuffer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [fileDuration, setFileDuration] = useState(0);
    const [showSpectrogram, setShowSpectrogram] = useState(false);

    // Toggle Listen Mode
    const toggleListenMode = () => {
        if (!isListenMode) {
            setShowFeedbackWarning(true);
        } else {
            setIsListenMode(false);
            setPassthrough(false);
        }
    };

    const confirmListenMode = () => {
        setIsListenMode(true);
        setPassthrough(true);
        setShowFeedbackWarning(false);
    };

    // --- Recorded Analysis ---

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setResults(null);
            setError(null);
            setAudioBuffer(null);
            setShowSpectrogram(false);

            // Decode audio for spectrogram visualization
            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const decoded = await audioCtx.decodeAudioData(arrayBuffer);
                setAudioBuffer(decoded);
                setFileDuration(decoded.duration);

                // Create audio element for playback
                const url = URL.createObjectURL(selectedFile);
                if (audioRef.current) {
                    audioRef.current.src = url;
                }
            } catch (err) {
                console.error('Failed to decode audio:', err);
            }
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            let audioToUpload = file;

            // Apply audio enhancement if enabled
            if (enhanceAudio && audioBuffer) {
                setIsEnhancing(true);
                try {
                    const enhancedBuffer = await AudioEnhancer.enhance(audioBuffer);
                    audioToUpload = await AudioEnhancer.bufferToBlob(enhancedBuffer);
                    // Preserve original filename
                    audioToUpload = new File([audioToUpload], file.name, { type: 'audio/wav' });
                } catch (enhanceErr) {
                    console.warn('Audio enhancement failed, using original:', enhanceErr);
                    // Fall back to original file
                }
                setIsEnhancing(false);
            }

            const formData = new FormData();
            formData.append('audio', audioToUpload);
            formData.append('goal', goal);
            formData.append('include_transcript', includeTranscript.toString());

            // Assuming backend is on same host/port or proxied. 
            // If dev, might need localhost:5000. 
            // Using relative path assuming proxy or same origin.
            const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${BACKEND_URL}/api/voice-quality/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Analysis failed');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
            setIsEnhancing(false);
        }
    };

    // --- Live Analysis ---

    const startLiveAnalysis = async () => {
        if (!audioEngine) {
            setError("Audio Engine not initialized");
            return;
        }

        try {
            setError(null);
            await audioEngine.startLiveAnalysis();
            setIsLive(true);

            // Subscribe to updates via a temporary listener or polling?
            // AudioEngine calls onAudioUpdate which updates AudioContext state.
            // But VoiceQualityView needs specific metrics.
            // We can hook into the socket events on AudioEngine or just rely on the onAudioUpdate callback if we can register one.
            // The current AudioEngine takes a single onAudioUpdate callback in constructor.
            // We might need to add a listener mechanism to AudioEngine.

            // For now, let's assume we can poll `audioEngine.latestBackendAnalysis` or add a listener.
            // Let's add a listener method to AudioEngine? Or just use an interval to read `latestBackendAnalysis`.
            // Interval is easiest for now without changing AudioEngine architecture too much.
        } catch (err) {
            console.error(err);
            setError('Failed to start live analysis: ' + err.message);
        }
    };

    const stopLiveAnalysis = () => {
        if (audioEngine) {
            audioEngine.stopLiveAnalysis();
        }
        setIsLive(false);
        setLiveMetrics(null);
    };

    useEffect(() => {
        let interval;
        if (isLive && audioEngine) {
            interval = setInterval(() => {
                const data = audioEngine.latestBackendAnalysis;
                if (data) {
                    setLiveMetrics(data);
                }
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
            if (isLive) stopLiveAnalysis(); // Cleanup on unmount
        };
    }, [isLive, audioEngine]);

    // --- History Logic ---

    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const allAssessments = await indexedDB.getAll(STORES.ASSESSMENTS);
            // Filter for voice_quality type if we have multiple types, but for now show all sorted descending
            const sorted = allAssessments
                .filter(a => a.type === 'voice_quality')
                .sort((a, b) => b.timestamp - a.timestamp);
            setHistory(sorted);
        } catch (err) {
            console.error("Failed to load history:", err);
            setError("Failed to load history.");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSaveResult = async (dataToSave, source = 'file') => {
        try {
            const record = {
                type: 'voice_quality',
                timestamp: Date.now(),
                date: new Date().toISOString(),
                source: source,
                // Spread metrics
                rbi_score: dataToSave.rbi_score || 0,
                jitter: dataToSave.jitter || 0,
                shimmer: dataToSave.shimmer || 0,
                metrics: {
                    breathiness: dataToSave.breathiness_score,
                    roughness: dataToSave.roughness_score,
                    strain: dataToSave.strain_score
                },
                goal_label: dataToSave.goals?.goal_label || goal
            };

            await indexedDB.saveAssessment(record);
            setToast({ message: t('voiceQuality.live.save') + "!", type: 'success' });
        } catch (err) {
            console.error(err);
            setToast({ message: "Failed to save result: " + err.message, type: 'error' });
        }
    };

    // Auto-calculate average for live session when stopping? 
    // For now, let's just save the LAST frame or require user to click "Save" while running?
    // Better: Button "Snapshot & Save"
    const handleSnapshot = () => {
        if (!liveMetrics) return;
        handleSaveResult(liveMetrics, 'live');
    };

    const handleDeleteHistory = async (id) => {
        if (confirm("Delete this record?")) {
            await indexedDB.delete(STORES.ASSESSMENTS, id);
            loadHistory();
        }
    };

    // Audio playback controls
    const togglePlayback = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // Update current time during playback
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('ended', onEnded);
        };
    }, []);

    // --- Rendering Helpers ---

    const renderGoalStatus = (goals) => {
        if (!goals) return null;
        return (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/10">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-400" />
                    Goal Comparison: <span className="text-teal-400">{goals.goal_label}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['breathiness', 'roughness', 'strain'].map(metric => (
                        <div key={metric} className="p-3 bg-slate-900/50 rounded-lg">
                            <div className="text-xs uppercase text-slate-400 mb-1">{metric}</div>
                            <div className={`font-bold ${goals[`${metric}_flag`] === 'within_target' ? 'text-green-400' :
                                goals[`${metric}_flag`] === 'unknown' ? 'text-slate-400' : 'text-yellow-400'
                                }`}>
                                {goals[`${metric}_flag`]?.replace('_', ' ')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTranscript = (transcript) => {
        if (!transcript || !transcript.words) return null;

        const getColor = (label) => {
            switch (label) {
                case 'back_dark': return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
                case 'neutral': return 'bg-green-500/20 text-green-200 border-green-500/30';
                case 'bright_forward': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
                case 'sharp': return 'bg-pink-500/20 text-pink-200 border-pink-500/30';
                default: return 'bg-slate-700/30 text-slate-400 border-transparent';
            }
        };

        return (
            <div className="mt-6 p-6 bg-slate-800/50 rounded-xl border border-white/10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Voice Quality Transcript
                </h3>
                <div className="flex flex-wrap gap-2 leading-relaxed">
                    {transcript.words.map((word, idx) => (
                        <div
                            key={idx}
                            className={`px-2 py-1 rounded border text-sm transition-all cursor-help relative group ${getColor(word.label)}`}
                        >
                            {word.text}
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 rounded-lg border border-white/10 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-xl">
                                <div className="font-bold mb-1 capitalize">{word.label.replace('_', ' ')}</div>
                                <div>RBI Score: {word.rbi_score}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getMetricValue = (val) => val !== undefined && val !== null ? val : 0;

    const renderGauges = () => {
        if (!liveMetrics && isLive) return <div className="text-slate-400 italic text-center p-8">{t('voiceQuality.history.loading')}</div>;

        return (
            <div className="mt-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Jitter Gauge */}
                    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 relative group hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">Jitter (Roughness)</h3>
                            <Info className="w-4 h-4 text-slate-600" />
                        </div>

                        <div className="relative h-32 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#1e293b" strokeWidth="4" />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                                        fill="none"
                                        stroke={liveMetrics?.jitter > 1.0 ? '#ef4444' : '#10b981'}
                                        strokeWidth="4"
                                        strokeDasharray={`${Math.min(100, (getMetricValue(liveMetrics?.jitter) / 2.0) * 100)}, 100`}
                                    />
                                </svg>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                        {isLive ? getMetricValue(liveMetrics?.jitter).toFixed(2) : '—'}%
                                    </div>
                                    <div className="text-[9px] text-slate-500 uppercase">Target &lt; 1.0%</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-center text-slate-500 mt-2">
                            {liveMetrics?.jitter > 1.0 ? 'Rough / Unsteady' : 'Stable'}
                        </div>
                    </div>

                    {/* Shimmer Gauge */}
                    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 relative group hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">Shimmer (Breathiness)</h3>
                            <Info className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="relative h-32 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#1e293b" strokeWidth="4" />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                                        fill="none"
                                        stroke={liveMetrics?.shimmer > 3.8 ? '#ef4444' : '#10b981'}
                                        strokeWidth="4"
                                        strokeDasharray={`${Math.min(100, (getMetricValue(liveMetrics?.shimmer) / 5.0) * 100)}, 100`}
                                    />
                                </svg>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                        {isLive ? getMetricValue(liveMetrics?.shimmer).toFixed(2) : '—'}%
                                    </div>
                                    <div className="text-[9px] text-slate-500 uppercase">Target &lt; 3.8%</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-center text-slate-500 mt-2">
                            {liveMetrics?.shimmer > 3.8 ? 'Breathy / Hoarse' : 'Clear'}
                        </div>
                    </div>

                    {/* HNR Gauge */}
                    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 relative group hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">HNR (Noise Ratio)</h3>
                            <Info className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="relative h-32 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#1e293b" strokeWidth="4" />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                                        fill="none"
                                        stroke={liveMetrics?.hnr < 20 ? '#eab308' : '#10b981'}
                                        strokeWidth="4"
                                        strokeDasharray={`${Math.min(100, (getMetricValue(liveMetrics?.hnr) / 30.0) * 100)}, 100`}
                                    />
                                </svg>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                        {isLive ? getMetricValue(liveMetrics?.hnr).toFixed(1) : '—'}
                                    </div>
                                    <div className="text-[9px] text-slate-500 uppercase">dB (Target &gt; 20)</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-center text-slate-500 mt-2">
                            {liveMetrics?.hnr < 20 ? 'Noisy' : 'Clean Tone'}
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg text-sm text-slate-300 flex items-center justify-center">
                    <Info className="w-4 h-4 mr-2 text-teal-400" />
                    <span>Sustain a steady vowel (&quot;ahhh&quot;) for accurate clinical metrics.</span>
                </div>

                {/* NEW: Laryngeal Register Gauge */}
                <div className="mt-6">
                    <RegisterGauge dataRef={metricsRef} />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                        {t('voiceQuality.title')}
                    </h1>
                    <p className="text-slate-400 text-sm">{t('voiceQuality.subtitle')}</p>
                </div>

                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setActiveTab('recorded')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'recorded' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t('voiceQuality.tabs.upload')}
                    </button>
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'live' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t('voiceQuality.tabs.live')}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t('voiceQuality.tabs.history')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {activeTab === 'history' ? (
                <div className="animate-in fade-in duration-500">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <History className="text-teal-400" /> {t('voiceQuality.history.title')}
                    </h2>

                    {historyLoading ? (
                        <div className="text-center text-slate-500 py-12">{t('voiceQuality.history.loading')}</div>
                    ) : history.length === 0 ? (
                        <div className="text-center text-slate-500 py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                            {t('voiceQuality.history.empty')}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map(item => (
                                <div key={item.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.timestamp).toLocaleString()}
                                            <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-500 uppercase">{item.source}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="font-bold text-white text-lg">
                                                Jitter: <span className={item.jitter > 1 ? 'text-red-400' : 'text-green-400'}>{item.jitter?.toFixed(2)}%</span>
                                            </div>
                                            <div className="font-bold text-white text-lg">
                                                Shimmer: <span className={item.shimmer > 3.8 ? 'text-red-400' : 'text-green-400'}>{item.shimmer?.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteHistory(item.id)}
                                        className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : activeTab === 'live' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {!isLive ? (
                        <div className="max-w-md py-12 relative">
                            {/* Mic Quality Tips Button */}
                            <button
                                onClick={() => setShowMicTips(true)}
                                className="absolute top-4 right-0 p-2 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Recording Tips"
                            >
                                <HelpCircle size={20} />
                            </button>

                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-800">
                                <Mic size={32} className="text-teal-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-3">{t('voiceQuality.live.title')}</h2>
                            <p className="text-slate-400 mb-8">
                                {t('voiceQuality.live.desc')}
                            </p>
                            <button
                                onClick={startLiveAnalysis}
                                className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 mx-auto"
                            >
                                <Play size={18} fill="currentColor" />
                                {t('voiceQuality.live.start')}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    {t('voiceQuality.live.metrics')}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={toggleListenMode}
                                        className={`px-3 py-1 rounded text-xs font-bold border transition-colors flex items-center gap-1 ${isListenMode ? 'bg-teal-500/20 text-teal-300 border-teal-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                                    >
                                        {isListenMode ? '🎧 ' + t('voiceQuality.live.monitor') + ' On' : '🎧 ' + t('voiceQuality.live.monitor')}
                                    </button>
                                    <button
                                        onClick={stopLiveAnalysis}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors border border-slate-700"
                                    >
                                        {t('voiceQuality.live.stop')}
                                    </button>
                                    <button
                                        onClick={handleSnapshot}
                                        className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg text-sm font-bold transition-colors border border-teal-500/30 flex items-center gap-2"
                                    >
                                        <Save size={16} /> {t('voiceQuality.live.save')}
                                    </button>
                                </div>
                            </div>

                            {showFeedbackWarning && (
                                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl animate-in zoom-in-95 duration-200">
                                    <h4 className="flex items-center gap-2 text-yellow-400 font-bold mb-2">
                                        <Info className="w-5 h-5" />
                                        {t('voiceQuality.warning.title')}
                                    </h4>
                                    <p className="text-sm text-yellow-200/80 mb-4">
                                        {t('voiceQuality.warning.desc')}
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={confirmListenMode}
                                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-lg text-sm"
                                        >
                                            {t('voiceQuality.warning.confirm')}
                                        </button>
                                        <button
                                            onClick={() => setShowFeedbackWarning(false)}
                                            className="px-4 py-2 bg-black/20 hover:bg-black/30 text-yellow-200 font-bold rounded-lg text-sm"
                                        >
                                            {t('voiceQuality.warning.cancel')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {renderGauges()}

                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <div className="text-sm text-slate-400 mb-2 text-left">Real-time Spectrogram</div>
                                <Spectrogram height={150} />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1">
                    {/* Existing Upload UI (mostly unchanged but wrapped cleaner) */}
                    {!results && (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-12 relative">
                            {/* Mic Quality Tips Button */}
                            <button
                                onClick={() => setShowMicTips(true)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Recording Tips"
                            >
                                <HelpCircle size={20} />
                            </button>

                            <Upload size={48} className="text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">{t('voiceQuality.upload.title')}</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-sm text-center">
                                {t('voiceQuality.upload.desc')}
                            </p>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="audio-upload"
                            />
                            <label
                                htmlFor="audio-upload"
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer transition-colors border border-slate-700"
                            >
                                {t('voiceQuality.upload.browse')}
                            </label>
                            {file && (
                                <div className="mt-6 flex flex-col items-center gap-4">
                                    <div className="text-teal-400 font-mono text-sm">{file.name}</div>

                                    {/* Audio Enhancement Toggle */}
                                    <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors group">
                                        <input
                                            type="checkbox"
                                            checked={enhanceAudio}
                                            onChange={(e) => setEnhanceAudio(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${enhanceAudio ? 'bg-teal-500' : 'bg-slate-600'
                                            }`}>
                                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enhanceAudio ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={16} className={enhanceAudio ? 'text-teal-400' : 'text-slate-500'} />
                                            <span className="text-sm font-medium text-slate-300">Enhance Audio Quality</span>
                                        </div>
                                    </label>
                                    <p className="text-xs text-slate-500 max-w-xs text-center">
                                        Applies noise reduction and normalization for clearer analysis
                                    </p>

                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing || isEnhancing}
                                        className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isEnhancing ? 'Enhancing...' : isAnalyzing ? t('voiceQuality.upload.analyzing') : t('voiceQuality.upload.run')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* File with spectrogram visualization (before or after analysis) */}
                    {file && audioBuffer && (
                        <div className="mt-6">
                            {/* Hidden audio element for playback */}
                            <audio ref={audioRef} className="hidden" />

                            {/* Toggle and controls */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setShowSpectrogram(!showSpectrogram)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${showSpectrogram
                                        ? 'bg-teal-500/20 text-teal-400 border-teal-500/50'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                >
                                    <Eye size={16} />
                                    {showSpectrogram ? 'Hide Spectrogram' : 'Show Spectrogram'}
                                </button>

                                {showSpectrogram && (
                                    <button
                                        onClick={togglePlayback}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors border border-slate-700"
                                    >
                                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                        {isPlaying ? 'Pause' : 'Play'}
                                    </button>
                                )}
                            </div>

                            {/* Spectrogram visualization */}
                            {showSpectrogram && (
                                <FileSpectrogram
                                    audioBuffer={audioBuffer}
                                    currentTime={currentTime}
                                    duration={fileDuration}
                                    onSeek={handleSeek}
                                />
                            )}
                        </div>
                    )}

                    {results && (
                        <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
                            <button
                                onClick={() => setResults(null)}
                                className="mb-6 text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                            >
                                ← Analyze Another File
                            </button>

                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => handleSaveResult(results, 'file')}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold text-sm transition-colors border border-slate-700"
                                >
                                    <Save size={16} /> Save to History
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">RBI Index</div>
                                    <div className="flex items-end gap-3">
                                        <div className="text-5xl font-bold text-white">{results.rbi_score ? results.rbi_score.toFixed(0) : '—'}</div>
                                        <div className="text-sm text-slate-400 mb-2">/ 100</div>
                                    </div>
                                    <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500" style={{ width: `${results.rbi_score || 0}%` }}></div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                    <h3 className="font-bold text-white mb-4">Quality Metrics</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Breathiness', val: results.breathiness_score, color: 'bg-blue-500' },
                                            { label: 'Roughness', val: results.roughness_score, color: 'bg-orange-500' },
                                            { label: 'Strain', val: results.strain_score, color: 'bg-red-500' }
                                        ].map(m => (
                                            <div key={m.label}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-400">{m.label}</span>
                                                    <span className="text-white font-mono">{m.val ? m.val.toFixed(1) : 0}</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full ${m.color}`} style={{ width: `${(m.val || 0) * 10}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {renderGoalStatus(results.goals)}
                            {renderTranscript(results.transcript)}
                        </div>
                    )}
                </div>
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Mic Quality Tips Modal */}
            {showMicTips && (
                <MicQualityTips onClose={() => setShowMicTips(false)} />
            )}
        </div>
    );
};

export default VoiceQualityView;
