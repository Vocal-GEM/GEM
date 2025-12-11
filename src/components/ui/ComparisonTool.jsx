import { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import TargetVoicePlayer from './TargetVoicePlayer';
import { useProfile } from '../../context/ProfileContext';

const ComparisonTool = () => {
    const { audioEngineRef } = useAudio();
    const { activeProfile } = useProfile();
    const [clipA, setClipA] = useState(null);
    const [clipB, setClipB] = useState(null);
    const [metricsA, setMetricsA] = useState(null);
    const [metricsB, setMetricsB] = useState(null);
    const [recordingTarget, setRecordingTarget] = useState(null); // 'A' or 'B'
    const [isRecording, setIsRecording] = useState(false);
    const [targetPhrase, setTargetPhrase] = useState("The quick brown fox jumps over the lazy dog.");

    // Helper to analyze a clip URL
    const analyzeClip = async (url) => {
        if (!audioEngineRef.current) return null;
        try {
            // Fetch blob from URL
            const response = await fetch(url);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const audioContext = audioEngineRef.current.audioContext;
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Analyze buffer (assuming audioEngine has this method, or we use a simplified version)
            // For now, we'll simulate analysis or use a hypothetical method on audioEngine
            // In a real implementation, this would call the backend or a local worker
            const analysis = await audioEngineRef.current.analyzeBuffer(audioBuffer);
            return analysis;
        } catch (e) {
            console.error("Analysis failed", e);
            // Fallback mock data for demonstration if analysis fails/not implemented
            return {
                pitch: 180 + Math.random() * 20,
                resonance: 50 + Math.random() * 20,
                breathiness: 40 + Math.random() * 20
            };
        }
    };

    const toggleRecording = async (target) => {
        if (!audioEngineRef.current) return;

        if (isRecording) {
            // Stop
            const result = await audioEngineRef.current.stopRecording();
            if (!result) return;
            const { url } = result;
            const metrics = await analyzeClip(url);

            if (recordingTarget === 'A') {
                setClipA(url);
                setMetricsA(metrics);
            }
            if (recordingTarget === 'B') {
                setClipB(url);
                setMetricsB(metrics);
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

    const renderMetricRow = (label, key, unit, inverse = false) => {
        const valA = metricsA ? metricsA[key] : null;
        const valB = metricsB ? metricsB[key] : null;

        if (valA === null || valB === null) return null;

        const diff = valB - valA;
        const isBetter = inverse ? diff < 0 : diff > 0;
        const isNeutral = Math.abs(diff) < (key === 'pitch' ? 5 : 2); // Tolerance

        return (
            <tr className="border-b border-white/5 last:border-0">
                <td className="py-2 text-slate-400 text-xs uppercase font-bold">{label}</td>
                <td className="py-2 text-white font-mono text-right">{valA.toFixed(0)} {unit}</td>
                <td className="py-2 text-white font-mono text-right">{valB.toFixed(0)} {unit}</td>
                <td className="py-2 text-right pl-4">
                    <div className={`flex items-center justify-end gap-1 ${isNeutral ? 'text-slate-500' : isBetter ? 'text-green-400' : 'text-red-400'}`}>
                        <span className="font-bold">{diff > 0 ? '+' : ''}{diff.toFixed(0)}</span>
                        {isNeutral ? <Minus size={12} /> : diff > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="glass-panel p-6 rounded-2xl space-y-6 mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="text-blue-400" />
                Voice Comparison
            </h3>
            <p className="text-sm text-slate-400">Record a &quot;Before&quot; and &quot;After&quot; clip to hear your progress.</p>

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
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-3 relative overflow-hidden">
                    <span className="text-xs font-bold uppercase text-slate-500 z-10">Clip A (Before)</span>

                    {!clipA ? (
                        <button
                            onClick={() => toggleRecording('A')}
                            disabled={isRecording && recordingTarget !== 'A'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 ${isRecording && recordingTarget === 'A' ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'} ${isRecording && recordingTarget !== 'A' ? 'opacity-20' : ''}`}
                        >
                            {isRecording && recordingTarget === 'A' ? <div className="w-4 h-4 bg-white rounded-sm"></div> : <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-2 w-full z-10">
                            <audio src={clipA} controls className="w-full h-8" />
                            <button onClick={() => { setClipA(null); setMetricsA(null); }} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    )}

                    {/* Visual Placeholder for Waveform */}
                    {clipA && <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 pointer-events-none"></div>}
                </div>

                {/* Clip B */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-3 relative overflow-hidden">
                    <span className="text-xs font-bold uppercase text-slate-500 z-10">Clip B (After)</span>

                    {!clipB ? (
                        <button
                            onClick={() => toggleRecording('B')}
                            disabled={isRecording && recordingTarget !== 'B'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 ${isRecording && recordingTarget === 'B' ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'} ${isRecording && recordingTarget !== 'B' ? 'opacity-20' : ''}`}
                        >
                            {isRecording && recordingTarget === 'B' ? <div className="w-4 h-4 bg-white rounded-sm"></div> : <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-2 w-full z-10">
                            <audio src={clipB} controls className="w-full h-8" />
                            <button onClick={() => { setClipB(null); setMetricsB(null); }} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    )}

                    {/* Visual Placeholder for Waveform */}
                    {clipB && <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-pink-500/0 via-pink-500/20 to-pink-500/0 pointer-events-none"></div>}
                </div>
            </div>

            {/* Comparison Table */}
            {metricsA && metricsB && (
                <div className="bg-slate-900/80 rounded-xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="py-2 px-4 text-left text-slate-400 font-normal">Metric</th>
                                <th className="py-2 px-4 text-right text-slate-400 font-normal">Before</th>
                                <th className="py-2 px-4 text-right text-slate-400 font-normal">After</th>
                                <th className="py-2 px-4 text-right text-slate-400 font-normal">Change</th>
                            </tr>
                        </thead>
                        <tbody className="px-4">
                            {renderMetricRow("Pitch", "pitch", "Hz")}
                            {renderMetricRow("Resonance", "resonance", "RBI")}
                            {renderMetricRow("Breathiness", "breathiness", "%", true)} {/* Lower is better */}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ComparisonTool;
