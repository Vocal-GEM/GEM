import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, BarChart2, Info, Brain } from 'lucide-react';
import { analyzeClip, formatAnalysisForDisplay } from '../../services/ClipAnalysisService';
import { getPerceptionColor } from '../../services/GenderPerceptionPredictor';
import { useSettings } from '../../context/SettingsContext';
import MLComparisonPanel from './MLComparisonPanel';

/**
 * ClipAnalysisModal - Displays gender analysis results for a recorded clip
 * 
 * Shows:
 * - Audio waveform with playback controls
 * - Gender timeline (pink/blue bars like Genderfluent)
 * - Pitch trace synchronized with timeline
 * - Summary statistics
 */
const ClipAnalysisModal = ({ audioBlob, audioUrl, onClose }) => {
    const { colorBlindMode } = useSettings();
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const [analysis, setAnalysis] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Run analysis when component mounts
    useEffect(() => {
        if (!audioBlob) return;

        setIsLoading(true);
        setError(null);

        analyzeClip(audioBlob)
            .then(result => {
                setAnalysis(result);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Analysis failed:', err);
                setError('Failed to analyze audio clip');
                setIsLoading(false);
            });
    }, [audioBlob]);

    // Draw visualization when analysis is ready
    useEffect(() => {
        if (!analysis || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Layout
        const genderBarHeight = 40;
        const pitchChartTop = genderBarHeight + 10;
        const pitchChartHeight = height - genderBarHeight - 40;
        const padding = { left: 45, right: 10 };

        // Clear
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        const { windows, pitchTrace, duration } = analysis;
        const xScale = (width - padding.left - padding.right) / duration;

        // Draw gender estimation bars
        windows.forEach(w => {
            const x = padding.left + w.startTime * xScale;
            const barWidth = (w.endTime - w.startTime) * xScale;

            ctx.fillStyle = getPerceptionColor(w.genderScore, colorBlindMode);
            ctx.globalAlpha = 0.85;
            ctx.fillRect(x, 5, barWidth - 1, genderBarHeight);
            ctx.globalAlpha = 1;
        });

        // Border for gender bar
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.strokeRect(padding.left, 5, width - padding.left - padding.right, genderBarHeight);

        // Draw pitch grid
        const PITCH_MIN = 80;
        const PITCH_MAX = 300;

        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let p = 100; p <= 250; p += 50) {
            const y = pitchChartTop + pitchChartHeight * (1 - (p - PITCH_MIN) / (PITCH_MAX - PITCH_MIN));
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${p}`, padding.left - 5, y + 3);
        }

        // Draw pitch trace
        const voicedPoints = pitchTrace.filter(p => p.pitch !== null);

        if (voicedPoints.length > 0) {
            // Draw line
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(45, 212, 191, 0.5)';

            voicedPoints.forEach((pt, i) => {
                const x = padding.left + pt.time * xScale;
                const y = pitchChartTop + pitchChartHeight * (1 - (pt.pitch - PITCH_MIN) / (PITCH_MAX - PITCH_MIN));

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Draw points with gender color
            voicedPoints.forEach(pt => {
                const x = padding.left + pt.time * xScale;
                const y = pitchChartTop + pitchChartHeight * (1 - (pt.pitch - PITCH_MIN) / (PITCH_MAX - PITCH_MIN));

                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = getPerceptionColor(pt.genderScore, colorBlindMode);
                ctx.fill();
            });
        }

        // Draw time axis
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        for (let t = 0; t <= duration; t += 1) {
            const x = padding.left + t * xScale;
            ctx.fillText(`${t}s`, x, height - 5);
        }

        // Draw playback position
        if (currentTime > 0) {
            const x = padding.left + currentTime * xScale;
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 5);
            ctx.lineTo(x, height - 20);
            ctx.stroke();
        }

        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Estimated Gender', padding.left + 5, 20);

        ctx.save();
        ctx.translate(12, pitchChartTop + pitchChartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Pitch (Hz)', 0, 0);
        ctx.restore();

    }, [analysis, currentTime, colorBlindMode]);

    // Handle audio playback
    const togglePlayback = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const displayData = analysis ? formatAnalysisForDisplay(analysis) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-500/20">
                            <BarChart2 className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Gender Analysis</h2>
                            <p className="text-xs text-slate-400">Genderfluent-style visualization</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-slate-400">Analyzing audio...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
                            {error}
                        </div>
                    )}

                    {analysis && displayData && (
                        <>
                            {/* Audio Player */}
                            <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <button
                                    onClick={togglePlayback}
                                    className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all"
                                >
                                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                                <div className="flex-1">
                                    <div className="text-sm font-mono text-slate-300">
                                        {currentTime.toFixed(1)}s / {displayData.duration}
                                    </div>
                                    <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                            style={{ width: `${(currentTime / analysis.duration) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <audio
                                    ref={audioRef}
                                    src={audioUrl}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleEnded}
                                />
                            </div>

                            {/* Timeline Visualization */}
                            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full h-48 rounded-lg"
                                />
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Overall</div>
                                    <div
                                        className="text-lg font-bold"
                                        style={{ color: displayData.genderColor }}
                                    >
                                        {displayData.genderLabel}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Avg Pitch</div>
                                    <div className="text-lg font-bold text-teal-400 font-mono">
                                        {displayData.avgPitch}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Stability</div>
                                    <div className="text-lg font-bold text-emerald-400">
                                        {displayData.stability}%
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Voiced</div>
                                    <div className="text-lg font-bold text-blue-400">
                                        {displayData.voicedPercent}%
                                    </div>
                                </div>
                            </div>

                            {/* ML vs Heuristic Comparison */}
                            {analysis.audioSamples && (
                                <MLComparisonPanel
                                    pitch={analysis.summary.avgPitch}
                                    f1={analysis.summary.avgF1 || 0}
                                    audioSamples={analysis.audioSamples}
                                    sampleRate={analysis.sampleRate || 16000}
                                />
                            )}

                            {/* Info */}
                            <div className="flex items-start gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200">
                                <Info size={14} className="flex-shrink-0 mt-0.5" />
                                <p>
                                    This analysis combines pitch and resonance (F1) to estimate gender perception.
                                    Unlike pitch-only approaches, resonance is weighted heavily—especially in the
                                    ambiguous 135–175 Hz range where it becomes the deciding factor.
                                    <span className="block mt-1 text-purple-300">
                                        <Brain size={10} className="inline mr-1" />
                                        ML comparison uses spectral analysis for an additional perspective.
                                    </span>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClipAnalysisModal;
