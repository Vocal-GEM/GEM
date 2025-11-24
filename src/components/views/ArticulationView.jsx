import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, Info } from 'lucide-react';
import { useGem } from '../../context/GemContext';
import { VoiceAnalyzer } from '../../utils/voiceAnalysis';
import { transcriptionEngine } from '../../utils/transcriptionEngine';
import { convertToIPA, isSibilantWord } from '../../utils/ipaConverter';
import SagittalDiagram from '../viz/SagittalDiagram';
import SibilantGauge from '../viz/SibilantGauge';

const ArticulationView = () => {
    const { audioEngineRef } = useGem();

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
    const lastProcessedTime = useRef(0);

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

        // Start analysis loop
        const loop = () => {
            if (!isRecording) return; // Stop if flag changed (though cleanup handles this)

            const buffer = audioEngineRef.current.getAudioBuffer(); // Assuming this method exists or similar
            // Note: AudioEngine might need a method to get real-time buffer for analysis
            // For now, we'll assume we can tap into the analyser node directly if exposed, 
            // or we might need to modify AudioEngine to expose a real-time analyzer node.

            // FALLBACK: If AudioEngine doesn't expose raw buffer easily, we might need to rely on 
            // the analyzer node attached to the audio context.
            // Let's assume we can get data from the analyzer node in VoiceAnalyzer if we pass it the source.

            // Actually, VoiceAnalyzer takes AudioBuffer in analyzeBuffer. 
            // For real-time, we usually use an AnalyserNode.
            // Let's quick-fix VoiceAnalyzer to support AnalyserNode or add a method here.

            // Real-time analysis using AnalyserNode (if available in AudioEngine)
            if (audioEngineRef.current.analyser) {
                const analyser = audioEngineRef.current.analyser;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Float32Array(bufferLength);
                analyser.getFloatTimeDomainData(dataArray);

                // Analyze
                if (analyzerRef.current) {
                    const results = analyzerRef.current.analyzeBuffer({
                        getChannelData: () => dataArray,
                        sampleRate: audioEngineRef.current.audioContext.sampleRate,
                        length: dataArray.length
                    });

                    setMetrics({
                        sibilance: results.sibilance,
                        formants: results.formants
                    });

                    // Update target phone based on acoustics
                    updateTargetFromAcoustics(results);
                }
            }

            animationRef.current = requestAnimationFrame(loop);
        };

        loop();

        // Start Transcription Stream (Mocked for now as Whisper.js is usually batch or file-based)
        // In a real app, we'd stream audio chunks to the worker.
        // For this demo, we'll simulate transcription updates or use a simple VAD trigger.
    };

    const stopAnalysis = () => {
        setIsRecording(false);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    const updateTargetFromAcoustics = (results) => {
        // Simple heuristic mapping
        const { f1, f2 } = results.formants;
        const { isSibilant } = results.sibilance;

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

    // Mock transcription update for demo purposes
    // (Since real-time streaming Whisper is complex to set up in this snippet)
    const handleSimulatedWord = (word) => {
        const ipa = convertToIPA(word);
        const isSib = isSibilantWord(word);

        setTranscript(prev => [...prev.slice(-4), { text: word, ipa, isSibilant: isSib }]);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Articulation Practice
                    </h1>
                    <p className="text-slate-400">
                        Refine your consonant precision and vowel resonance.
                    </p>
                </div>

                {/* Main Visuals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Sagittal Diagram */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-400" />
                                Tongue Position
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
                            Sibilant Quality
                        </h2>
                        <SibilantGauge
                            centroid={metrics.sibilance.centroid}
                            isSibilant={metrics.sibilance.isSibilant}
                        />

                        {/* Quick Tips */}
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-400">
                            <p className="mb-2"><strong className="text-white">Tip:</strong> For a sharper "S":</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Raise tongue tip to alveolar ridge</li>
                                <li>Groove the tongue center</li>
                                <li>Smile slightly to shorten vocal tract</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Real-time Transcript Stream */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 min-h-[120px]">
                    <h3 className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">
                        Live Transcription (IPA)
                    </h3>
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
                <div className="flex justify-center gap-4">
                    {!isRecording ? (
                        <button
                            onClick={startAnalysis}
                            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full font-bold text-lg hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg shadow-pink-500/20 flex items-center gap-3"
                        >
                            <Mic className="w-6 h-6" />
                            Start Practice
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={stopAnalysis}
                                className="px-8 py-4 bg-slate-800 border border-red-500/50 text-red-400 rounded-full font-bold text-lg hover:bg-red-500/10 transition-all flex items-center gap-3"
                            >
                                <Square className="w-5 h-5" />
                                Stop
                            </button>

                            {/* Reference Buttons */}
                            <div className="flex gap-2 items-center px-4 border-l border-slate-800">
                                <span className="text-xs text-slate-600 font-bold uppercase">Ref:</span>
                                <button onClick={() => handleSimulatedWord('see')} className="px-3 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700 border border-slate-700 transition-colors" title="Target /s/">See</button>
                                <button onClick={() => handleSimulatedWord('she')} className="px-3 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700 border border-slate-700 transition-colors" title="Target /sh/">She</button>
                                <button onClick={() => handleSimulatedWord('hello')} className="px-3 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700 border border-slate-700 transition-colors">Hello</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArticulationView;
