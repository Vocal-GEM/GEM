import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import { Sparkles, Info, Play, Pause, RotateCcw, Download, Share2, ChevronLeft, FileText, Activity, BarChart2, Bot, ChevronDown, ChevronUp, Repeat, Gauge, Wand2 } from 'lucide-react';
import MetricCard from '../viz/MetricCard';
import PitchTrace from '../viz/PitchTrace';
import VowelSpacePlot from '../viz/VowelSpacePlot';
import VoiceRangeProfile from '../viz/VoiceRangeProfile';
import Spectrogram from '../viz/Spectrogram';
import AssessmentView from '../coach/AssessmentView';
import Toast from '../ui/Toast';

import { CoachEngine } from '../../utils/coachEngine';
import { getTargetNorms } from '../../data/VoiceNorms';

import ClipCapture from '../ui/ClipCapture';

const AnalysisView = ({ analysisResults: propResults, onClose, targetRange }) => {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const [localResults, setLocalResults] = useState(null);
    const analysisResults = propResults || localResults;

    // Get norms based on settings
    const norms = getTargetNorms(settings.genderTarget || 'feminine');

    const [activeTab, setActiveTab] = useState('transcript');
    const [vizSubTab, setVizSubTab] = useState('pitch');
    const [coachFeedback, setCoachFeedback] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayTime, setCurrentPlayTime] = useState(0);
    const [toast, setToast] = useState(null);
    const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(!settings.beginnerMode);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const audioRef = useRef(null);
    const analyzerRef = useRef(null);
    const currentBlobRef = useRef(null);

    // Playback controls
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [isLooping, setIsLooping] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleRecordingComplete = async (recordingResult) => {
        setIsAnalyzing(true);
        try {
            // AudioEngine returns { blob, url, duration, analysis }
            const { blob, url, duration, analysis } = recordingResult;

            // Store blob for clean audio feature
            currentBlobRef.current = blob;

            // Try backend analysis first
            try {
                const formData = new FormData();
                formData.append('audio', blob, 'recording.webm');

                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Backend unavailable');
                }

                const data = await response.json();

                if (data.words) {
                    const center = targetRange ? (targetRange.min + targetRange.max) / 2 : 200;
                    data.words = data.words.map(word => {
                        let deviations = 0;
                        if (word.metrics && word.metrics.pitch && word.metrics.pitch.mean) {
                            deviations = Math.abs(word.metrics.pitch.mean - center) / center;
                        }
                        return { ...word, deviations };
                    });
                }

                setLocalResults(data);
                showToast(t('analysis.toasts.analysisComplete'), "success");

            } catch (backendError) {
                // Backend unavailable - use client-side fallback
                console.warn("Backend analysis unavailable, using client-side fallback:", backendError);

                // Create fallback results from AudioEngine's realtime analysis
                const fallbackResults = {
                    transcript: `(${t('analysis.transcript.unavailable')})`,
                    duration: duration,
                    overall: {
                        pitch: {
                            mean: analysis?.pitch || 0,
                            min: analysis?.pitch ? analysis.pitch * 0.8 : 0,
                            max: analysis?.pitch ? analysis.pitch * 1.2 : 0
                        },
                        formants: {
                            f1: analysis?.f1 || 0,
                            f2: analysis?.f2 || 0
                        },
                        jitter: analysis?.jitter || 0,
                        shimmer: analysis?.shimmer || 0,
                        hnr: analysis?.hnr || 0,
                        intensity: analysis?.intensity || 0
                    },
                    words: [],
                    isClientSideFallback: true
                };

                setLocalResults(fallbackResults);
                setLocalResults(fallbackResults);
                showToast(t('analysis.toasts.backendUnavailable'), "info");
            }

            // Set audio player source regardless of backend status
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.load();
            }

        } catch (error) {
            console.error("Analysis error:", error);
            showToast(`Error: ${error.message}`, "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCleanAudio = async () => {
        if (!currentBlobRef.current) {
            showToast("No audio to clean", "error");
            return;
        }

        setIsCleaning(true);
        try {
            const formData = new FormData();
            formData.append('audio', currentBlobRef.current, 'audio.wav');

            const response = await fetch('http://localhost:5000/api/voice-quality/clean', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Cleaning failed');
            }

            const cleanedBlob = await response.blob();
            const cleanedUrl = URL.createObjectURL(cleanedBlob);

            // Update audio player
            if (audioRef.current) {
                audioRef.current.src = cleanedUrl;
                audioRef.current.load();
            }

            // Store cleaned blob for potential re-analysis
            currentBlobRef.current = cleanedBlob;

            showToast("Audio cleaned successfully!", "success");
        } catch (error) {
            console.error("Clean audio error:", error);
            showToast("Failed to clean audio. Is the backend running?", "error");
        } finally {
            setIsCleaning(false);
        }
    };

    // Update audio element when playback settings change
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.loop = isLooping;
        }
    }, [playbackSpeed, isLooping]);

    const generateCoachFeedback = async () => {
        // Mock feedback generation
        setCoachFeedback({
            summary: "Great job! Your pitch is within the target range.",
            strengths: ["Stable pitch", "Good resonance"],
            weaknesses: ["Slight breathiness"],
            exercises: ["Siren", "Humming"]
        });
    };

    const handleWordClick = (word) => {
        if (audioRef.current) {
            audioRef.current.currentTime = word.start;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const getWordColor = (deviations) => {
        if (!deviations) return 'text-slate-300';
        if (deviations > 0.25) return 'text-red-400';
        if (deviations > 0.15) return 'text-orange-400';
        if (deviations > 0.05) return 'text-yellow-400';
        return 'text-green-400';
    };

    const generateAnalysisSummary = (results, range) => {
        if (!results || !results.overall) return "No analysis data available.";
        const pitch = results.overall.pitch?.mean;
        if (!pitch) return "Insufficient data.";
        return `${t('analysis.metrics.labels.pitch')} was ${pitch.toFixed(0)}Hz.`;
    };

    // If no analysis results, show a placeholder/recording interface
    if (!analysisResults) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
                        <Activity className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{t('analysis.placeholder.title')}</h2>
                    <p className="text-slate-400">
                        {t('analysis.placeholder.description')}
                    </p>

                    <div className="flex justify-center py-4">
                        {isAnalyzing ? (
                            <div className="flex items-center gap-3 px-6 py-3 bg-slate-800 rounded-full border border-slate-700">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-bold text-blue-400">{t('analysis.placeholder.analyzing')}</span>
                            </div>
                        ) : (
                            <div className="transform scale-125">
                                <ClipCapture onCapture={handleRecordingComplete} />
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-slate-500">
                        {t('analysis.placeholder.instruction')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900 z-10 border-b border-slate-800 p-4 flex items-center justify-between">
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-400" />
                </button>
                <h2 className="text-xl font-bold text-white">{t('analysis.header')}</h2>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            <div className="max-w-6xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-800 pb-1 overflow-x-auto">
                    {[
                        { id: 'transcript', label: t('analysis.tabs.transcript'), icon: FileText },
                        { id: 'metrics', label: t('analysis.tabs.metrics'), icon: Activity },
                        { id: 'viz', label: t('analysis.tabs.visualizations'), icon: BarChart2 },
                        { id: 'coach', label: t('analysis.tabs.coach'), icon: Bot }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === 'coach' && !coachFeedback) {
                                    generateCoachFeedback();
                                }
                            }}
                            className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-slate-400 hover:text-slate-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 min-h-[300px]">
                    {activeTab === 'transcript' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="font-bold text-lg mb-4">{t('analysis.transcript.title')}</h3>
                            {analysisResults?.words && analysisResults.words.length > 0 ? (
                                <>
                                    <div className="text-lg leading-relaxed">
                                        {analysisResults.words.map((word, i) => (
                                            <span
                                                key={i}
                                                onClick={() => handleWordClick(word)}
                                                className={`${getWordColor(word.deviations)} cursor-pointer hover:underline transition-colors mr-2 ${currentPlayTime >= word.start && currentPlayTime <= word.end
                                                    ? 'font-bold underline'
                                                    : ''
                                                    }`}
                                                title={`Pitch: ${word.metrics?.pitch?.mean?.toFixed(1) || 'N/A'} Hz`}
                                            >
                                                {word.text}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Legend */}
                                    <div className="mt-6 pt-4 border-t border-slate-800">
                                        <div className="text-sm text-slate-400 mb-2">{t('analysis.transcript.legend.title')}</div>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-green-400 rounded"></div>
                                                <span>{t('analysis.transcript.legend.good')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                                                <span>{t('analysis.transcript.legend.minor')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-orange-400 rounded"></div>
                                                <span>{t('analysis.transcript.legend.moderate')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-400 rounded"></div>
                                                <span>{t('analysis.transcript.legend.severe')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-slate-400 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                    <p className="mb-2">
                                        <strong>{t('analysis.tabs.transcript')}:</strong> {analysisResults?.transcript || t('analysis.transcript.unavailable')}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-4">
                                        {t('analysis.transcript.error')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'metrics' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Analysis Summary */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-lg">
                                <h3 className="flex items-center gap-2 font-bold text-lg mb-3 text-white">
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                    {t('analysis.metrics.summary.title')}
                                </h3>
                                <p className="text-slate-300 leading-relaxed">
                                    {generateAnalysisSummary(analysisResults, targetRange)}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {/* Pitch Metrics */}
                                <MetricCard
                                    label={t('analysis.metrics.labels.pitch')}
                                    value={analysisResults?.overall?.pitch?.mean?.toFixed(1) || 'N/A'}
                                    unit="Hz"
                                    status={
                                        !analysisResults?.overall?.pitch?.mean ? 'neutral' :
                                            targetRange && (analysisResults.overall.pitch.mean < targetRange.min || analysisResults.overall.pitch.mean > targetRange.max)
                                                ? 'warning'
                                                : 'good'
                                    }
                                    description={t('analysis.metrics.descriptions.pitch')}
                                    details={`Target: ${norms.pitch.min}-${norms.pitch.max} Hz`}
                                />

                                {/* Formants */}
                                <MetricCard
                                    label={t('analysis.metrics.labels.resonance')}
                                    value={`${analysisResults?.overall?.formants?.f1?.toFixed(0) || 'N/A'} / ${analysisResults?.overall?.formants?.f2?.toFixed(0) || 'N/A'}`}
                                    unit="Hz"
                                    status="neutral"
                                    description={t('analysis.metrics.descriptions.resonance')}
                                    details={`F1: ${norms.f1.label} / F2: ${norms.f2.label}`}
                                />

                                {/* Speech Rate */}
                                <MetricCard
                                    label={t('analysis.metrics.labels.rate')}
                                    value={analysisResults?.overall?.speechRate?.toFixed(1) || 'N/A'}
                                    unit="syl/s"
                                    status="neutral"
                                    description={t('analysis.metrics.descriptions.rate')}
                                />

                                {/* Avg Formant */}
                                <MetricCard
                                    label={t('analysis.metrics.labels.avgFormant')}
                                    value={analysisResults?.overall?.avgFormantFreq?.toFixed(0) || 'N/A'}
                                    unit="Hz"
                                    status="neutral"
                                    description={t('analysis.metrics.descriptions.avgFormant')}
                                />
                            </div>

                            {/* Advanced Metrics Toggle */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-full border border-white/5"
                                >
                                    {showAdvancedMetrics ? t('analysis.metrics.advanced.hide') : t('analysis.metrics.advanced.show')}
                                    {showAdvancedMetrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>

                            {showAdvancedMetrics && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    {/* Jitter */}
                                    <MetricCard
                                        label={t('analysis.metrics.labels.jitter')}
                                        value={analysisResults.overall.jitter?.toFixed(2) || 'N/A'}
                                        unit="%"
                                        status={
                                            !analysisResults.overall.jitter ? 'neutral' :
                                                analysisResults.overall.jitter > 1.5 ? 'bad' :
                                                    analysisResults.overall.jitter > 1.0 ? 'warning' : 'good'
                                        }
                                        description={t('analysis.metrics.descriptions.jitter')}
                                        details={`Target: ${norms.jitter.label}`}
                                    />

                                    {/* HNR */}
                                    <MetricCard
                                        label="Voice Quality (HNR)"
                                        value={analysisResults.overall.hnr?.toFixed(1) || 'N/A'}
                                        unit="dB"
                                        status={
                                            !analysisResults.overall.hnr ? 'neutral' :
                                                analysisResults.overall.hnr < 15 ? 'warning' : 'good'
                                        }
                                        description="Harmonics-to-Noise Ratio. Higher values mean a clearer voice with less breathiness or hoarseness."
                                        details={`Target: ${norms.hnr.label}`}
                                    />

                                    {/* Shimmer */}
                                    <MetricCard
                                        label="Amplitude Stability (Shimmer)"
                                        value={analysisResults.overall.shimmer?.toFixed(2) || 'N/A'}
                                        unit="%"
                                        status={
                                            !analysisResults.overall.shimmer ? 'neutral' :
                                                analysisResults.overall.shimmer > 3.8 ? 'warning' : 'good'
                                        }
                                        description="Measures how steady your volume is. Lower values mean a more stable voice."
                                        details={`Target: ${norms.shimmer.label}`}
                                    />

                                    {/* CPPS */}
                                    <MetricCard
                                        label="Breathiness (CPPS)"
                                        value={analysisResults.overall.cpps?.toFixed(1) || 'N/A'}
                                        unit="dB"
                                        status="neutral"
                                        description="Cepstral Peak Prominence. Higher values indicate a clearer, more resonant voice."
                                    />

                                    {/* SPI */}
                                    <MetricCard
                                        label="Soft Phonation (SPI)"
                                        value={analysisResults.overall.spi?.toFixed(2) || 'N/A'}
                                        unit=""
                                        status="neutral"
                                        description="Soft Phonation Index. Higher values indicate a softer, breathier voice quality."
                                    />

                                    {/* Spectral Slope */}
                                    <MetricCard
                                        label="Spectral Slope"
                                        value={analysisResults.overall.spectralSlope?.toFixed(1) || 'N/A'}
                                        unit="dB/dec"
                                        status="neutral"
                                        description="How quickly energy drops off at higher frequencies. Steeper slope (more negative) sounds softer/flutier."
                                    />
                                </div>
                            )}

                            {/* Formant Mismatch Alert */}
                            {analysisResults?.overall?.formantMismatch && (
                                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 flex items-start gap-3">
                                    <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-yellow-400">{t('analysis.metrics.mismatch.title')}</h4>
                                        <p className="text-sm text-yellow-200/80">
                                            {t('analysis.metrics.mismatch.description')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'viz' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Visualization Sub-Navigation */}
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {[
                                    { id: 'pitch', label: t('analysis.vizTabs.pitch') },
                                    { id: 'resonance', label: t('analysis.vizTabs.resonance') },
                                    { id: 'range', label: t('analysis.vizTabs.range') },
                                    { id: 'spectrogram', label: t('analysis.vizTabs.spectrogram') }
                                ].map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setVizSubTab(sub.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${vizSubTab === sub.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                            }`}
                                    >
                                        {sub.label}
                                    </button>
                                ))}
                            </div>

                            {vizSubTab === 'pitch' && (
                                <div>
                                    <h3 className="font-bold text-lg mb-4">Pitch Contour</h3>
                                    <PitchTrace
                                        data={analysisResults?.pitchSeries || []}
                                        targetRange={targetRange}
                                        currentTime={currentPlayTime}
                                        duration={analysisResults?.duration}
                                    />
                                </div>
                            )}

                            {vizSubTab === 'resonance' && (
                                <div>
                                    <h3 className="font-bold text-lg mb-4">Vowel Space (Resonance)</h3>
                                    <VowelSpacePlot
                                        f1={analysisResults?.overall?.formants?.f1}
                                        f2={analysisResults?.overall?.formants?.f2}
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        Shows your average resonance position relative to standard vowel targets.
                                    </p>
                                </div>
                            )}

                            {vizSubTab === 'range' && (
                                <div>
                                    <VoiceRangeProfile
                                        isActive={isPlaying}
                                        dataRef={analyzerRef}
                                        staticData={analysisResults?.pitchSeries}
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        Phonetogram showing your pitch vs volume range. Brighter areas indicate more frequent usage.
                                    </p>
                                </div>
                            )}

                            {vizSubTab === 'spectrogram' && (
                                <div>
                                    <h3 className="font-bold text-lg mb-4">Spectrogram</h3>
                                    <Spectrogram
                                        audioRef={audioRef}
                                        dataRef={analyzerRef}
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        Visualizes frequency intensity over time. Play the audio to see the spectrogram scroll.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'coach' && (
                        <div className="animate-in fade-in duration-300">
                            {coachFeedback ? (
                                <AssessmentView
                                    feedback={coachFeedback}
                                    onClose={() => setActiveTab('transcript')}
                                    onPractice={(exercise) => {
                                        const exerciseDetails = CoachEngine.getExerciseDetails(exercise);
                                        if (exerciseDetails) {
                                            showToast(`Navigate to ${exerciseDetails.route} to practice ${exercise}`, 'success');
                                        } else {
                                            showToast(`Starting ${exercise}...`, 'success');
                                        }
                                    }}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-400">Consulting the coach...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {
                toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
            }

            {/* Playback Controls Bar */}
            {
                analysisResults && (
                    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 p-4 z-40">
                        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                            {/* Play/Pause */}
                            <button
                                onClick={() => {
                                    if (audioRef.current) {
                                        if (isPlaying) {
                                            audioRef.current.pause();
                                        } else {
                                            audioRef.current.play();
                                        }
                                        setIsPlaying(!isPlaying);
                                    }
                                }}
                                className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition-colors"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </button>

                            {/* Speed Control */}
                            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-white/10">
                                <Gauge className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-400">{t('analysis.controls.speed')}</span>
                                <select
                                    value={playbackSpeed}
                                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                                    className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                                >
                                    <option value="0.5">0.5x</option>
                                    <option value="0.75">0.75x</option>
                                    <option value="1.0">1.0x</option>
                                    <option value="1.25">1.25x</option>
                                    <option value="1.5">1.5x</option>
                                    <option value="2.0">2.0x</option>
                                </select>
                            </div>

                            {/* Loop Toggle */}
                            <button
                                onClick={() => setIsLooping(!isLooping)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${isLooping
                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                    : 'bg-slate-800/50 border-white/10 text-slate-400 hover:text-white'
                                    }`}
                            >
                                <Repeat className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('analysis.controls.loop')}</span>
                            </button>

                            {/* Clean Audio Button */}
                            <button
                                onClick={handleCleanAudio}
                                disabled={isCleaning || !currentBlobRef.current}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCleaning ? (
                                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Wand2 className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">
                                    {isCleaning ? t('analysis.controls.cleaning') : t('analysis.controls.clean')}
                                </span>
                            </button>
                        </div>
                    </div>
                )
            }

            <audio
                ref={audioRef}
                className="hidden"
                onTimeUpdate={() => setCurrentPlayTime(audioRef.current?.currentTime || 0)}
                onEnded={() => setIsPlaying(false)}
            />
        </div >
    );
};

export default AnalysisView;
