import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Sparkles, Info, Play, Pause, RotateCcw, Download, Share2, ChevronLeft, FileText, Activity, BarChart2, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import MetricCard from '../viz/MetricCard';
import PitchTrace from '../viz/PitchTrace';
import VowelSpacePlot from '../viz/VowelSpacePlot';
import VoiceRangeProfile from '../viz/VoiceRangeProfile';
import Spectrogram from '../viz/Spectrogram';
import AssessmentView from '../coach/AssessmentView';
import Toast from '../ui/Toast';
import { CoachEngine } from '../../utils/coachEngine';

import ClipCapture from '../ui/ClipCapture';

const AnalysisView = ({ analysisResults: propResults, onClose, targetRange }) => {
    const { settings } = useSettings();
    const [localResults, setLocalResults] = useState(null);
    const analysisResults = propResults || localResults;

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

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleRecordingComplete = async (recordingResult) => {
        setIsAnalyzing(true);
        try {
            // AudioEngine returns { blob, url }
            const { blob, url } = recordingResult;

            const formData = new FormData();
            formData.append('audio', blob, 'recording.wav');

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'Analysis failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // ignore json parse error
                }
                throw new Error(errorMessage);
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

            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.load();
            }

            showToast("Analysis complete!", "success");

        } catch (error) {
            console.error("Analysis error:", error);
            showToast(`Error: ${error.message}`, "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

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
        return `Your average pitch was ${pitch.toFixed(0)}Hz.`;
    };

    // If no analysis results, show a placeholder/recording interface
    if (!analysisResults) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center max-w-md space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
                        <Activity className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Voice Analysis</h2>
                    <p className="text-slate-400">
                        Record a voice sample to get detailed analysis of your pitch, resonance, and voice quality.
                    </p>

                    <div className="flex justify-center py-4">
                        {isAnalyzing ? (
                            <div className="flex items-center gap-3 px-6 py-3 bg-slate-800 rounded-full border border-slate-700">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-bold text-blue-400">Analyzing Audio...</span>
                            </div>
                        ) : (
                            <div className="transform scale-125">
                                <ClipCapture onCapture={handleRecordingComplete} />
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-slate-500">
                        Press the microphone button to start recording. Speak a few sentences for best results.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/80 backdrop-blur z-10 border-b border-slate-800 p-4 flex items-center justify-between">
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-400" />
                </button>
                <h2 className="text-xl font-bold text-white">Analysis Results</h2>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            <div className="max-w-6xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-800 pb-1 overflow-x-auto">
                    {[
                        { id: 'transcript', label: 'Transcript', icon: FileText },
                        { id: 'metrics', label: 'Metrics', icon: Activity },
                        { id: 'viz', label: 'Visualizations', icon: BarChart2 },
                        { id: 'coach', label: 'AI Coach', icon: Bot }
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
                            <h3 className="font-bold text-lg mb-4">Color-Coded Transcript</h3>
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
                                        <div className="text-sm text-slate-400 mb-2">Color Legend:</div>
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-green-400 rounded"></div>
                                                <span>Within target (±5%)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                                                <span>Minor deviation (5-15%)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-orange-400 rounded"></div>
                                                <span>Moderate deviation (15-25%)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-400 rounded"></div>
                                                <span>Significant deviation ({'>'} 25%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-slate-400 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                    <p className="mb-2">
                                        <strong>Transcript:</strong> {analysisResults?.transcript || 'No transcript available'}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-4">
                                        Word-level analysis is unavailable. The transcription model could not be loaded.
                                        You can still view overall voice metrics in the other tabs.
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
                                    Analysis Summary
                                </h3>
                                <p className="text-slate-300 leading-relaxed">
                                    {generateAnalysisSummary(analysisResults, targetRange)}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {/* Pitch Metrics */}
                                <MetricCard
                                    label="Average Pitch"
                                    value={analysisResults?.overall?.pitch?.mean?.toFixed(1) || 'N/A'}
                                    unit="Hz"
                                    status={
                                        !analysisResults?.overall?.pitch?.mean ? 'neutral' :
                                            targetRange && (analysisResults.overall.pitch.mean < targetRange.min || analysisResults.overall.pitch.mean > targetRange.max)
                                                ? 'warning'
                                                : 'good'
                                    }
                                    description="How high or low your voice sounds. Higher values are more feminine, lower values are more masculine."
                                    details={targetRange ? `Target: ${targetRange.min}-${targetRange.max} Hz` : null}
                                />

                                {/* Formants */}
                                <MetricCard
                                    label="Resonance (F1/F2)"
                                    value={`${analysisResults?.overall?.formants?.f1?.toFixed(0) || 'N/A'} / ${analysisResults?.overall?.formants?.f2?.toFixed(0) || 'N/A'}`}
                                    unit="Hz"
                                    status="neutral"
                                    description="The 'brightness' or 'darkness' of your voice. Higher resonance typically sounds brighter and more feminine."
                                    details="F1: Throat size / F2: Tongue position"
                                />

                                {/* Speech Rate */}
                                <MetricCard
                                    label="Speech Rate"
                                    value={analysisResults?.overall?.speechRate?.toFixed(1) || 'N/A'}
                                    unit="syl/s"
                                    status="neutral"
                                    description="How fast you are speaking. Normal conversation is usually 3-5 syllables per second."
                                />

                                {/* Avg Formant */}
                                <MetricCard
                                    label="Avg Resonance"
                                    value={analysisResults?.overall?.avgFormantFreq?.toFixed(0) || 'N/A'}
                                    unit="Hz"
                                    status="neutral"
                                    description="Average of your formant frequencies. Higher average correlates with feminine perception."
                                />
                            </div>

                            {/* Advanced Metrics Toggle */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-full border border-white/5"
                                >
                                    {showAdvancedMetrics ? 'Hide Advanced Metrics' : 'Show Advanced Metrics'}
                                    {showAdvancedMetrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>

                            {showAdvancedMetrics && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    {/* Jitter */}
                                    <MetricCard
                                        label="Pitch Stability (Jitter)"
                                        value={analysisResults.overall.jitter?.toFixed(2) || 'N/A'}
                                        unit="%"
                                        status={
                                            !analysisResults.overall.jitter ? 'neutral' :
                                                analysisResults.overall.jitter > 1.5 ? 'bad' :
                                                    analysisResults.overall.jitter > 1.0 ? 'warning' : 'good'
                                        }
                                        description="Measures how steady your pitch is. Lower values mean a clearer voice."
                                        details="Target: < 1.0%"
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
                                        details="Target: > 15 dB"
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
                                        details="Target: < 3.8%"
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
                                        <h4 className="font-bold text-yellow-400">Resonance Mismatch Detected</h4>
                                        <p className="text-sm text-yellow-200/80">
                                            Your pitch is high, but your resonance (formants) is relatively low. This can sometimes sound "hollow" or unnatural. Try brightening your resonance by smiling slightly or raising your tongue.
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
                                    { id: 'pitch', label: 'Pitch & Stability' },
                                    { id: 'resonance', label: 'Resonance & Vowels' },
                                    { id: 'range', label: 'Voice Range' },
                                    { id: 'spectrogram', label: 'Spectrogram' }
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
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <audio
                ref={audioRef}
                className="hidden"
                onTimeUpdate={() => setCurrentPlayTime(audioRef.current?.currentTime || 0)}
                onEnded={() => setIsPlaying(false)}
            />
        </div>
    );
};

export default AnalysisView;
