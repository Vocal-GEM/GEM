import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, BarChart3, FileText, Activity, History, Save, Trash2, ChevronLeft, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useGem } from '../../context/GemContext';
import { VoiceAnalyzer } from '../../utils/voiceAnalysis';
import { transcriptionEngine } from '../../utils/transcriptionEngine';
import { historyService } from '../../utils/historyService';
import { CoachEngine } from '../../utils/coachEngine';
import PitchTrace from '../viz/PitchTrace';
import VowelSpacePlot from '../viz/VowelSpacePlot';
import Toast from '../ui/Toast';
import AssessmentView from './AssessmentView';

const AnalysisView = () => {
    const { audioEngineRef, targetRange, userSettings } = useGem();

    // State management
    const [mode, setMode] = useState('record'); // 'record' | 'analyzing' | 'results' | 'history'
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioData, setAudioData] = useState(null);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [activeTab, setActiveTab] = useState('transcript'); // 'transcript' | 'metrics' | 'viz' | 'coach'
    const [currentPlayTime, setCurrentPlayTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [historySessions, setHistorySessions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }
    const [coachFeedback, setCoachFeedback] = useState(null);

    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const analyzerRef = useRef(null);

    useEffect(() => {
        // Initialize analyzer
        if (audioEngineRef.current?.audioContext) {
            analyzerRef.current = new VoiceAnalyzer(audioEngineRef.current.audioContext);
        }

        // Pre-load transcription model
        transcriptionEngine.initialize().catch(console.error);
    }, [audioEngineRef]);

    useEffect(() => {
        // Cleanup timer on unmount
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleStartRecording = async () => {
        if (!audioEngineRef.current) return;

        // Ensure audio engine is active
        if (!audioEngineRef.current.isActive) {
            await audioEngineRef.current.start();
        }

        // Start analysis recording
        const success = await audioEngineRef.current.startAnalysisRecording();
        if (success) {
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(t => t + 1);
            }, 1000);
        }
    };

    const handleStopRecording = async () => {
        if (!audioEngineRef.current) return;

        setIsRecording(false);
        clearInterval(timerRef.current);

        // Stop recording and get audio data
        const recordingData = await audioEngineRef.current.stopAnalysisRecording();

        if (recordingData) {
            setAudioData(recordingData);
            setMode('analyzing');
            setStatusMessage('Initializing analysis...');

            // Start analysis
            await performAnalysis(recordingData);
        }
    };

    const performAnalysis = async (recordingData) => {
        try {
            // Convert blob to AudioBuffer
            setStatusMessage('Processing audio...');
            const audioBuffer = await audioEngineRef.current.blobToAudioBuffer(recordingData.blob);

            // Get transcription
            setStatusMessage('Transcribing speech (this may take a moment)...');
            const transcription = await transcriptionEngine.transcribe(recordingData.blob);

            if (!transcription || !transcription.text) {
                throw new Error('Transcription failed to produce text');
            }

            // Analyze overall metrics
            setStatusMessage('Calculating voice metrics...');
            const overallMetrics = analyzerRef.current.analyzeBuffer(audioBuffer);

            // Analyze each word
            const wordsWithMetrics = transcription.words.map(word => {
                const wordMetrics = analyzerRef.current.analyzeBuffer(
                    audioBuffer,
                    word.start,
                    word.end
                );

                // Calculate deviations from target
                const deviations = calculateDeviations(wordMetrics, targetRange);

                return {
                    ...word,
                    metrics: wordMetrics,
                    deviations: deviations
                };
            });

            // Prepare results
            const results = {
                transcript: transcription.text,
                words: wordsWithMetrics,
                overall: overallMetrics,
                duration: audioBuffer.duration,
                audioUrl: recordingData.url,
                blob: recordingData.blob, // Keep blob for saving
                pitchSeries: overallMetrics.pitchSeries // Pass pitch series
            };

            setAnalysisResults(results);
            setCoachFeedback(null); // Reset coach feedback
            setMode('results');

        } catch (error) {
            console.error('Analysis error:', error);
            showToast('Analysis failed: ' + error.message, 'error');
            setMode('record');
        }
    };

    const generateCoachFeedback = () => {
        if (!analysisResults) return;

        const feedback = CoachEngine.generateFeedback(analysisResults, {
            targetPitch: targetRange,
            gender: userSettings?.gender || 'feminine' // Default or from settings
        });

        setCoachFeedback(feedback);
        setActiveTab('coach');
    };

    const saveSession = async () => {
        if (!analysisResults || isSaving) return;

        setIsSaving(true);
        try {
            await historyService.saveSession({
                duration: analysisResults.duration,
                overall: analysisResults.overall,
                transcript: analysisResults.transcript,
                words: analysisResults.words,
                audioBlob: analysisResults.blob,
                pitchSeries: analysisResults.pitchSeries
            });
            showToast('Session saved to history!', 'success');
        } catch (error) {
            console.error('Failed to save session:', error);
            showToast('Failed to save session', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const loadHistory = async () => {
        try {
            const sessions = await historyService.getAllSessions();
            setHistorySessions(sessions);
            setMode('history');
        } catch (error) {
            console.error('Failed to load history:', error);
            showToast('Failed to load history', 'error');
        }
    };

    const loadSession = (session) => {
        // Reconstruct audio URL from blob
        const audioUrl = URL.createObjectURL(session.audioBlob);

        setAnalysisResults({
            ...session,
            audioUrl,
            blob: session.audioBlob
        });
        setCoachFeedback(null); // Reset feedback on load
        setMode('results');
    };

    const deleteSession = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                await historyService.deleteSession(id);
                loadHistory(); // Refresh list
                showToast('Session deleted', 'success');
            } catch (error) {
                console.error('Failed to delete session:', error);
                showToast('Failed to delete session', 'error');
            }
        }
    };

    const calculateDeviations = (metrics, targets) => {
        const deviations = {};

        if (metrics.pitch && targets) {
            const pitchMean = metrics.pitch.mean;
            if (pitchMean < targets.min) {
                deviations.pitch = ((targets.min - pitchMean) / targets.min) * 100;
                deviations.pitchDirection = 'low';
            } else if (pitchMean > targets.max) {
                deviations.pitch = ((pitchMean - targets.max) / targets.max) * 100;
                deviations.pitchDirection = 'high';
            } else {
                deviations.pitch = 0;
                deviations.pitchDirection = 'good';
            }
        }

        return deviations;
    };

    const getWordColor = (deviations) => {
        if (!deviations || !deviations.pitch) return 'text-green-400';

        const absDev = Math.abs(deviations.pitch);
        if (absDev < 5) return 'text-green-400';
        if (absDev < 15) return 'text-yellow-400';
        if (absDev < 25) return 'text-orange-400';
        return 'text-red-400';
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleWordClick = (word) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = word.start;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            Voice Analysis
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Record your voice and get detailed feedback on pitch, resonance, and voice quality
                        </p>
                    </div>
                    {mode !== 'history' && (
                        <button
                            onClick={loadHistory}
                            className="p-3 bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800"
                            title="View History"
                        >
                            <History className="w-5 h-5 text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Record Mode */}
                {mode === 'record' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Recording Control */}
                        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                            <div className="text-center space-y-6">
                                {!isRecording ? (
                                    <>
                                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <Mic className="w-16 h-16" />
                                        </div>
                                        <button
                                            onClick={handleStartRecording}
                                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg hover:from-blue-500 hover:to-purple-500 transition-all transform active:scale-95 shadow-lg"
                                        >
                                            Start Recording
                                        </button>
                                        <p className="text-slate-400 text-sm">
                                            Speak naturally for 10-30 seconds
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-32 h-32 mx-auto bg-red-500/20 border-4 border-red-500 rounded-full flex items-center justify-center animate-pulse">
                                            <div className="w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
                                        </div>
                                        <div className="text-4xl font-mono font-bold text-red-400">
                                            {formatTime(recordingTime)}
                                        </div>
                                        <button
                                            onClick={handleStopRecording}
                                            className="px-8 py-4 bg-red-500/20 border border-red-500 rounded-xl font-bold text-lg text-red-400 hover:bg-red-500/30 transition-all transform active:scale-95"
                                        >
                                            <Square className="w-5 h-5 inline mr-2" />
                                            Stop & Analyze
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-400" />
                                Tips for Best Results
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li>• Speak naturally - read a paragraph or describe your day</li>
                                <li>• Aim for 15-30 seconds of continuous speech</li>
                                <li>• Use a quiet environment with minimal background noise</li>
                                <li>• Speak at a comfortable volume and pace</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Analyzing Mode */}
                {mode === 'analyzing' && (
                    <div className="bg-slate-900 rounded-2xl p-12 border border-slate-800 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-24 h-24 mx-auto mb-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <h2 className="text-2xl font-bold mb-2">Analyzing Your Voice...</h2>
                        <p className="text-slate-400">
                            {statusMessage || 'Extracting pitch, formants, and voice quality metrics'}
                        </p>
                    </div>
                )}

                {/* History Mode */}
                {mode === 'history' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <button
                            onClick={() => setMode('record')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back to Recording
                        </button>

                        <div className="grid gap-4">
                            {historySessions.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                                    <p className="mb-4">No history yet.</p>
                                    <button
                                        onClick={() => setMode('record')}
                                        className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors"
                                    >
                                        Record your first session
                                    </button>
                                </div>
                            ) : (
                                historySessions.map(session => (
                                    <div
                                        key={session.id}
                                        onClick={() => loadSession(session)}
                                        className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group relative"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">{formatDate(session.date)}</div>
                                                    <div className="text-sm text-slate-400">{formatTime(session.duration)} duration</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => deleteSession(e, session.id)}
                                                className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <div className="text-slate-500">Avg Pitch</div>
                                                <div className="font-bold text-blue-400">
                                                    {session.overall.pitch?.mean?.toFixed(0) || 'N/A'} Hz
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Resonance</div>
                                                <div className="font-bold text-purple-400">
                                                    {session.overall.formants?.f1?.toFixed(0) || 'N/A'} Hz
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500">Jitter</div>
                                                <div className="font-bold text-green-400">
                                                    {session.overall.jitter?.toFixed(2) || 'N/A'}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Results Mode */}
                {mode === 'results' && analysisResults && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Playback Controls */}
                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                            <audio
                                ref={audioRef}
                                src={analysisResults.audioUrl}
                                onTimeUpdate={(e) => setCurrentPlayTime(e.target.currentTime)}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePlayPause}
                                    className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                                </button>

                                <div className="flex-1">
                                    <div className="text-sm text-slate-400 mb-1">
                                        {formatTime(currentPlayTime)} / {formatTime(analysisResults.duration)}
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                            style={{ width: `${(currentPlayTime / analysisResults.duration) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <button
                                    onClick={saveSession}
                                    disabled={isSaving}
                                    className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
                                    title="Save to History"
                                >
                                    <Save className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => setMode('record')}
                                    className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                                >
                                    New Recording
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-slate-800 overflow-x-auto">
                            {[
                                { id: 'transcript', label: 'Transcript', icon: FileText },
                                { id: 'metrics', label: 'Metrics', icon: BarChart3 },
                                { id: 'viz', label: 'Visualizations', icon: Waveform },
                                { id: 'coach', label: 'AI Coach', icon: Sparkles }
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
                                    <div className="text-lg leading-relaxed">
                                        {analysisResults.words.map((word, i) => (
                                            <span
                                                key={i}
                                                onClick={() => handleWordClick(word)}
                                                className={`${getWordColor(word.deviations)} cursor-pointer hover:underline transition-colors mr-2 ${currentPlayTime >= word.start && currentPlayTime <= word.end
                                                    ? 'font-bold underline'
                                                    : ''
                                                    }`}
                                                title={`Pitch: ${word.metrics.pitch?.mean?.toFixed(1) || 'N/A'} Hz`}
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
                                                <span>Significant deviation ({'>'}25%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'metrics' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    {/* Pitch Metrics */}
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <div className="text-sm text-slate-400 mb-1">Average Pitch</div>
                                        <div className="text-3xl font-bold text-blue-400">
                                            {analysisResults.overall.pitch?.mean?.toFixed(1) || 'N/A'} Hz
                                        </div>
                                        {targetRange && (
                                            <div className="text-xs text-slate-500 mt-1">
                                                Target: {targetRange.min}-{targetRange.max} Hz
                                            </div>
                                        )}
                                    </div>

                                    {/* Formants */}
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <div className="text-sm text-slate-400 mb-1">Resonance (F1/F2)</div>
                                        <div className="text-2xl font-bold text-purple-400">
                                            {analysisResults.overall.formants?.f1?.toFixed(0) || 'N/A'} / {analysisResults.overall.formants?.f2?.toFixed(0) || 'N/A'} Hz
                                        </div>
                                    </div>

                                    {/* Jitter */}
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <div className="text-sm text-slate-400 mb-1">Jitter</div>
                                        <div className="text-2xl font-bold text-green-400">
                                            {analysisResults.overall.jitter?.toFixed(2) || 'N/A'}%
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Normal: {'<'}1%
                                        </div>
                                    </div>

                                    {/* HNR */}
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <div className="text-sm text-slate-400 mb-1">Voice Quality (HNR)</div>
                                        <div className="text-2xl font-bold text-yellow-400">
                                            {analysisResults.overall.hnr?.toFixed(1) || 'N/A'} dB
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Normal: {'>'}15 dB
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'viz' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Pitch Contour</h3>
                                        <PitchTrace
                                            data={analysisResults.pitchSeries || []}
                                            targetRange={targetRange}
                                            currentTime={currentPlayTime}
                                            duration={analysisResults.duration}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg mb-4">Vowel Space (Resonance)</h3>
                                        <VowelSpacePlot
                                            f1={analysisResults.overall.formants?.f1}
                                            f2={analysisResults.overall.formants?.f2}
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            Shows your average resonance position relative to standard vowel targets.
                                        </p>
                                    </div>
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
                                                    // Note: Full navigation would require router integration
                                                    // For now, we show helpful guidance
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
                )}
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default AnalysisView;
