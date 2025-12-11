import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, Info, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../context/AudioContext';
import { VoiceAnalyzer } from '../../utils/voiceAnalysis';
import { transcriptionEngine } from '../../utils/transcriptionEngine';
import { convertToIPA, isSibilantWord } from '../../utils/ipaConverter';
import SagittalDiagram from '../viz/SagittalDiagram';
import SibilantGauge from '../viz/SibilantGauge';
import TouchDetector from '../viz/TouchDetector';

// --- Levenshtein Distance for Scoring ---
const calculateSimilarity = (s1, s2) => {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
};

const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
};

const ArticulationView = () => {
    const { t } = useTranslation();
    const { audioEngineRef } = useAudio();

    // State
    const [isRecording, setIsRecording] = useState(false);
    const [metrics, setMetrics] = useState({
        sibilance: { centroid: 0, score: 0, isSibilant: false },
        formants: { f1: 0, f2: 0 }
    });
    const [transcript, setTranscript] = useState([]); // Array of { text, ipa, isSibilant }
    const [targetPhone, setTargetPhone] = useState('neutral');

    const analyzerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        // Initialize analyzer
        if (audioEngineRef.current?.audioContext) {
            analyzerRef.current = new VoiceAnalyzer(audioEngineRef.current.audioContext);
        }

        // Initialize transcription
        transcriptionEngine.initialize().catch(console.error);

        return () => {
            stopAnalysis();
        };
    }, [audioEngineRef]);

    const startAnalysis = async () => {
        if (!audioEngineRef.current) return;

        // Start audio engine if needed
        if (!audioEngineRef.current.isActive) {
            await audioEngineRef.current.start();
        }

        setIsRecording(true);

        // Setup AnalyserNode for real-time visualization
        const audioCtx = audioEngineRef.current.audioContext;
        const sourceNode = audioEngineRef.current.lowpass || audioEngineRef.current.microphone;

        if (audioCtx && sourceNode) {
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            sourceNode.connect(analyser);

            // Store analyser for cleanup
            analyzerRef.current.realtimeAnalyser = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);

            // Start analysis loop
            const loop = () => {
                if (!isRecording) return;

                analyser.getFloatTimeDomainData(dataArray);

                // Analyze frame
                if (analyzerRef.current) {
                    const results = analyzerRef.current.analyzeFrame(
                        dataArray,
                        audioCtx.sampleRate
                    );

                    setMetrics({
                        sibilance: results.sibilance,
                        formants: results.formants
                    });

                    // Update target phone based on acoustics
                    updateTargetFromAcoustics(results);
                }

                animationRef.current = requestAnimationFrame(loop);
            };

            loop();
        }
    };

    const stopAnalysis = () => {
        setIsRecording(false);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        // Cleanup analyser connection
        if (analyzerRef.current?.realtimeAnalyser) {
            analyzerRef.current.realtimeAnalyser.disconnect();
            analyzerRef.current.realtimeAnalyser = null;
        }
    };

    const updateTargetFromAcoustics = (results) => {
        // Simple heuristic mapping with Confidence Gating
        const { f1, f2 } = results.formants;
        const { isSibilant } = results.sibilance;
        const clarity = results.clarity || 0;

        // Thresholds
        const CONFIDENCE_THRESHOLD = 0.6;

        if (clarity < CONFIDENCE_THRESHOLD) {
            // If low confidence, keep previous or set to neutral if very low
            if (clarity < 0.3) setTargetPhone('neutral');
            return;
        }

        if (isSibilant) {
            setTargetPhone(results.sibilance.centroid > 6000 ? 's' : 'sh');
        } else if (f1 && f2) {
            // Vowel mapping logic
            if (f1 < 400 && f2 > 2000) setTargetPhone('i');
            else if (f1 < 400 && f2 < 1000) setTargetPhone('u');
            else if (f1 > 700) setTargetPhone('a');
            else setTargetPhone('neutral');
        } else {
            setTargetPhone('neutral');
        }
    };

    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionStatus, setTranscriptionStatus] = useState('idle'); // idle, recording, processing, success, error
    const [transcriptionError, setTranscriptionError] = useState(null);

    const startRecording = async () => {
        if (!audioEngineRef.current) return;
        setTranscriptionStatus('recording');
        setTranscriptionError(null);
        await audioEngineRef.current.startAnalysisRecording();
    };

    const stopRecording = async () => {
        if (!audioEngineRef.current) return;

        setIsTranscribing(true);
        setTranscriptionStatus('processing');

        try {
            const result = await audioEngineRef.current.stopAnalysisRecording();

            if (result && result.blob) {
                const transcription = await transcriptionEngine.transcribe(result.blob);

                // Process words
                if (transcription.words && transcription.words.length > 0) {
                    transcription.words.forEach(w => {
                        handleSimulatedWord(w.word);
                    });
                    // For challenge mode, we need the full text
                    if (viewMode === 'challenge') {
                        const fullText = transcription.text || transcription.words.map(w => w.word).join(' ');
                        scoreTwister(fullText);
                    }
                    setTranscriptionStatus('success');
                } else if (transcription.text) {
                    handleSimulatedWord(transcription.text);
                    if (viewMode === 'challenge') {
                        scoreTwister(transcription.text);
                    }
                    setTranscriptionStatus('success');
                } else {
                    setTranscriptionStatus('error');
                    setTranscriptionError("No speech detected.");
                }
            } else {
                throw new Error("No audio recorded");
            }
        } catch (error) {
            console.error("Transcription error:", error);
            setTranscriptionStatus('error');
            setTranscriptionError(error.message || "Transcription failed.");
        } finally {
            setIsTranscribing(false);
            // Reset status after a delay if success
            if (transcriptionStatus === 'success') {
                setTimeout(() => setTranscriptionStatus('idle'), 3000);
            }
        }
    };

    // Helper to process words
    const handleSimulatedWord = (word) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (!cleanWord) return;

        const ipa = convertToIPA(cleanWord);
        const isSib = isSibilantWord(cleanWord);

        setTranscript(prev => [...prev.slice(-4), { text: cleanWord, ipa, isSibilant: isSib }]);
    };

    // --- Challenge Mode Logic ---
    const [viewMode, setViewMode] = useState('practice'); // 'practice' | 'challenge'
    const [activeTwister, setActiveTwister] = useState(null);
    const [twisterScore, setTwisterScore] = useState(null);
    const [twisterFeedback, setTwisterFeedback] = useState(null);

    const TWISTERS = [
        { id: 1, title: 'Sibilant S', text: 'She sells sea shells by the sea shore.', difficulty: 'Easy', focus: 'S/SH' },
        { id: 2, title: 'Red Leather', text: 'Red leather, yellow leather.', difficulty: 'Medium', focus: 'R/L' },
        { id: 3, title: 'Unique New York', text: 'Unique New York, you know you need unique New York.', difficulty: 'Hard', focus: 'N/Y/K' },
        { id: 4, title: 'Peter Piper', text: 'Peter Piper picked a peck of pickled peppers.', difficulty: 'Medium', focus: 'P' },
        { id: 5, title: 'Fuzzy Wuzzy', text: 'Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.', difficulty: 'Easy', focus: 'Z/W' },
        { id: 6, title: 'Sixth Sheep', text: 'The sixth sick sheik\'s sixth sheep\'s sick.', difficulty: 'Hard', focus: 'S/TH/K' }
    ];

    const handleTwisterRecord = async (twisterId) => {
        if (isRecording) {
            // Stop recording
            await stopAnalysis(); // Stops visualizer
            await stopRecording(); // Stops audio capture & triggers transcription
        } else {
            // Start recording
            setActiveTwister(twisterId);
            setTwisterScore(null);
            setTwisterFeedback(null);
            await startAnalysis(); // Start visualizer
            await startRecording(); // Start audio capture
        }
    };

    const scoreTwister = (spokenText) => {
        if (!activeTwister) return;

        const targetTwister = TWISTERS.find(t => t.id === activeTwister);
        if (!targetTwister) return;

        const similarity = calculateSimilarity(targetTwister.text, spokenText);
        const score = Math.round(similarity * 100);

        setTwisterScore(score);

        if (score > 90) setTwisterFeedback("Perfect! Your articulation is razor sharp.");
        else if (score > 75) setTwisterFeedback("Great job! Just a few minor slips.");
        else if (score > 50) setTwisterFeedback("Good effort. Focus on the tricky transitions.");
        else setTwisterFeedback("Keep practicing! Try slowing down to improve precision.");
    };

    return (
        <div className="bg-slate-950 text-white p-4 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header & Mode Switch */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            {t('articulation.title')}
                        </h1>
                        <p className="text-slate-400">
                            {t('articulation.subtitle')}
                        </p>
                    </div>
                    <div className="bg-slate-900 p-1 rounded-lg flex gap-1 w-full md:w-auto">
                        <button onClick={() => setViewMode('practice')} className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'practice' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{t('articulation.modes.practice')}</button>
                        <button onClick={() => setViewMode('challenge')} className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'challenge' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{t('articulation.modes.challenges')}</button>
                    </div>
                </div>

                {viewMode === 'practice' ? (
                    <>
                        {/* Main Visuals Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Sagittal Diagram */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold text-lg flex items-center gap-2">
                                        <Info className="w-5 h-5 text-blue-400" />
                                        {t('articulation.tongue')}
                                    </h2>
                                    <span className="text-xs font-mono text-slate-500">
                                        F1: {metrics.formants.f1?.toFixed(0)} | F2: {metrics.formants.f2?.toFixed(0)}
                                    </span>
                                </div>
                                <SagittalDiagram target={targetPhone} />
                            </div>

                            {/* Right: Sibilant Gauge */}
                            <div className="space-y-4">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <Volume2 className="w-5 h-5 text-green-400" />
                                    {t('articulation.sibilant.title')}
                                </h2>
                                <SibilantGauge
                                    centroid={metrics.sibilance.centroid}
                                    isSibilant={metrics.sibilance.isSibilant}
                                />

                                {/* Touch Detector - Consonant pressure */}
                                {isRecording && (
                                    <TouchDetector
                                        dataRef={audioEngineRef.current?.analysisData || { current: {} }}
                                        showFeedback={true}
                                    />
                                )}

                                {/* Quick Tips */}
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-400">
                                    <p className="mb-2"><strong className="text-white">Tip:</strong> {t('articulation.sibilant.tip')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Real-time Transcript Stream */}
                        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 min-h-[120px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    {t('articulation.transcript')}
                                </h3>
                                {transcriptionStatus === 'error' && (
                                    <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                                        <AlertTriangle size={12} /> {transcriptionError}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-4 items-end">
                                {transcript.length === 0 && !isRecording && (
                                    <span className="text-slate-600 italic">Start recording to see transcription...</span>
                                )}
                                {transcript.map((item, i) => (
                                    <div key={i} className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                                        <span className={`text-lg font-mono font-bold ${item.isSibilant ? 'text-pink-400' : 'text-slate-300'}`}>
                                            {item.ipa}
                                        </span>
                                        <span className="text-xs text-slate-500">{item.text}</span>
                                    </div>
                                ))}
                                {isRecording && (
                                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse mb-2"></div>
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex justify-center gap-4">
                                {!isRecording ? (
                                    <button
                                        onClick={startAnalysis}
                                        className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full font-bold text-lg hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-pink-500/20 flex items-center gap-3"
                                    >
                                        <Mic className="w-6 h-6" />
                                        {t('articulation.controls.start')}
                                    </button>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={stopAnalysis}
                                            className="px-8 py-4 bg-slate-800 border border-red-500/50 text-red-400 rounded-full font-bold text-lg hover:bg-red-500/10 transition-all flex items-center gap-3"
                                        >
                                            <Square className="w-5 h-5" />
                                            {t('articulation.controls.stop')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Transcription Control */}
                            {isRecording && (
                                <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                                    <button
                                        onMouseDown={startRecording}
                                        onMouseUp={stopRecording}
                                        onTouchStart={startRecording}
                                        onTouchEnd={stopRecording}
                                        disabled={isTranscribing}
                                        className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${isTranscribing ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'}`}
                                    >
                                        {isTranscribing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="w-5 h-5" />
                                                Hold to Verify Pronunciation
                                            </>
                                        )}
                                    </button>
                                    {transcriptionStatus === 'error' && (
                                        <span className="text-red-400 text-xs">{transcriptionError}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {TWISTERS.map((t) => (
                                <div key={t.id} className={`bg-slate-900 border ${activeTwister === t.id ? 'border-blue-500 bg-slate-800' : 'border-slate-800'} rounded-xl p-6 transition-all hover:border-slate-600 relative overflow-hidden group`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-white">{t.title}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${t.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : t.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {t.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm">Focus: <span className="text-slate-300">{t.focus}</span></p>
                                        </div>
                                        {activeTwister === t.id && twisterScore !== null && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-bold text-blue-400">{twisterScore}%</span>
                                                <span className="text-[10px] text-slate-500">ACCURACY</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-lg font-serif italic text-slate-300 mb-6 leading-relaxed">
                                        &quot;{t.text}&quot;
                                    </p>

                                    {activeTwister === t.id && twisterFeedback && (
                                        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200 animate-in fade-in">
                                            {twisterFeedback}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleTwisterRecord(t.id)}
                                        disabled={isRecording && activeTwister !== t.id}
                                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${isRecording && activeTwister === t.id
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                            }`}
                                    >
                                        {isRecording && activeTwister === t.id ? (
                                            <>
                                                <Square className="w-4 h-4" /> Stop Recording
                                            </>
                                        ) : (
                                            <>
                                                <Mic className="w-4 h-4" /> {twisterScore !== null ? t('articulation.challenge.tryAgain') : t('articulation.challenge.start')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticulationView;
