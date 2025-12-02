import React, { useState, useRef } from 'react';
import { ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import TargetVoicePlayer from './TargetVoicePlayer';
import { useProfile } from '../../context/ProfileContext';
import { VoiceAnalyzer } from '../../utils/voiceAnalysis';

const ComparisonTool = () => {
    const { audioEngineRef } = useAudio();
    const { activeProfile } = useProfile();
    const [clipA, setClipA] = useState(null);
    const [clipB, setClipB] = useState(null);
    const [recordingTarget, setRecordingTarget] = useState(null); // 'A' or 'B'
    const [isRecording, setIsRecording] = useState(false);
    const [targetPhrase, setTargetPhrase] = useState("The quick brown fox jumps over the lazy dog.");
    const [analysisA, setAnalysisA] = useState(null);
    const [analysisB, setAnalysisB] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const analyzerRef = useRef(null);

    const toggleRecording = async (target) => {
        if (!audioEngineRef.current) return;

        if (isRecording) {
            // Stop
            const url = await audioEngineRef.current.stopRecording();
            if (recordingTarget === 'A') {
                setClipA(url);
                analyzeClip(url, 'A');
            }
            if (recordingTarget === 'B') {
                setClipB(url);
                analyzeClip(url, 'B');
            }
            setIsRecording(false);
            setRecordingTarget(null);
        } else {
            // Start
            setRecordingTarget(target);
            audioEngineRef.current.startRecording();
            setIsRecording(true);
        }
    };

    const analyzeClip = async (audioUrl, target) => {
        try {
            setIsAnalyzing(true);

            // Fetch the audio blob
            const response = await fetch(audioUrl);
            const blob = await response.blob();

            // Create AudioContext if needed
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Initialize analyzer if needed
            if (!analyzerRef.current) {
                analyzerRef.current = new VoiceAnalyzer(audioContext);
            }

            // Decode audio data
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Analyze
            const metrics = analyzerRef.current.analyzeBuffer(audioBuffer);

            // Store results
            if (target === 'A') {
                setAnalysisA(metrics);
            } else {
                setAnalysisB(metrics);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl space-y-6 mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="text-blue-400" />
                Voice Comparison
            </h3>
            <p className="text-sm text-slate-400">Record a "Before" and "After" clip to hear your progress.</p>

            {/* Target Phrase & TTS */}
            <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5 space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 block">Target Phrase</label>
                <input
                    type="text"
                    value={targetPhrase}
                    onChange={(e) => setTargetPhrase(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                />
                <TargetVoicePlayer text={targetPhrase} gender={activeProfile} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Clip A */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-3">
                    <span className="text-xs font-bold uppercase text-slate-500">Clip A (Before)</span>

                    {!clipA ? (
                        <button
                            onClick={() => toggleRecording('A')}
                            disabled={isRecording && recordingTarget !== 'A'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording && recordingTarget === 'A' ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'} ${isRecording && recordingTarget !== 'A' ? 'opacity-20' : ''}`}
                        >
                            {isRecording && recordingTarget === 'A' ? <div className="w-4 h-4 bg-white rounded-sm"></div> : <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-2 w-full">
                            <audio src={clipA} controls className="w-full h-8" />
                            <button onClick={() => setClipA(null)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    )}
                </div>

                {/* Clip B */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-3">
                    <span className="text-xs font-bold uppercase text-slate-500">Clip B (After)</span>

                    {!clipB ? (
                        <button
                            onClick={() => toggleRecording('B')}
                            disabled={isRecording && recordingTarget !== 'B'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording && recordingTarget === 'B' ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'} ${isRecording && recordingTarget !== 'B' ? 'opacity-20' : ''}`}
                        >
                            {isRecording && recordingTarget === 'B' ? <div className="w-4 h-4 bg-white rounded-sm"></div> : <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-2 w-full">
                            <audio src={clipB} controls className="w-full h-8" />
                            <button onClick={() => setClipB(null)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Comparison Results */}
            {isAnalyzing && (
                <div className="text-center text-sm text-slate-400 py-4">
                    Analyzing...
                </div>
            )}

            {analysisA && analysisB && !isAnalyzing && (
                <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                        Metric Comparison
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-700">
                                    <th className="text-left py-2">Metric</th>
                                    <th className="text-center py-2">Before</th>
                                    <th className="text-center py-2">After</th>
                                    <th className="text-center py-2">Change</th>
                                </tr>
                            </thead>
                            <tbody className="text-white">
                                {renderMetricRow('Pitch (Hz)', analysisA.pitch?.mean, analysisB.pitch?.mean, 'higher')}
                                {renderMetricRow('F1 (Hz)', analysisA.formants?.f1, analysisB.formants?.f1, 'neutral')}
                                {renderMetricRow('F2 (Hz)', analysisA.formants?.f2, analysisB.formants?.f2, 'higher')}
                                {renderMetricRow('HNR (dB)', analysisA.hnr, analysisB.hnr, 'higher')}
                                {renderMetricRow('Jitter (%)', analysisA.jitter, analysisB.jitter, 'lower')}
                                {renderMetricRow('Shimmer (%)', analysisA.shimmer, analysisB.shimmer, 'lower')}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    function renderMetricRow(label, valueA, valueB, betterDirection) {
        if (valueA == null || valueB == null) return null;

        const diff = valueB - valueA;
        const percentChange = valueA !== 0 ? ((diff / Math.abs(valueA)) * 100) : 0;

        let isImprovement = false;
        if (betterDirection === 'higher') isImprovement = diff > 0;
        else if (betterDirection === 'lower') isImprovement = diff < 0;

        const changeColor = Math.abs(diff) < 0.01 ? 'text-slate-400' :
                           isImprovement ? 'text-green-400' : 'text-orange-400';

        return (
            <tr key={label} className="border-b border-slate-800">
                <td className="py-2 text-slate-300">{label}</td>
                <td className="text-center py-2">{valueA.toFixed(1)}</td>
                <td className="text-center py-2">{valueB.toFixed(1)}</td>
                <td className={`text-center py-2 font-bold ${changeColor} flex items-center justify-center gap-1`}>
                    {diff > 0 ? <TrendingUp className="w-3 h-3" /> : diff < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                    {Math.abs(percentChange) > 0.1 && (
                        <span className="text-[10px] opacity-70">
                            ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(0)}%)
                        </span>
                    )}
                </td>
            </tr>
        );
    }
};

export default ComparisonTool;
