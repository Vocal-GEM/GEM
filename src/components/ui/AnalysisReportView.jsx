import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, AlertCircle, CheckCircle, X } from 'lucide-react';
import { SessionAnalyzer } from '../../utils/SessionAnalyzer';

const AnalysisReportView = ({ report, audioBlob, onClose }) => {
    const canvasRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            audioRef.current = new Audio(url);
            audioRef.current.onended = () => setIsPlaying(false);
            audioRef.current.ontimeupdate = () => setCurrentTime(audioRef.current.currentTime);
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [audioBlob]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const playSegment = (start, end) => {
        if (audioRef.current) {
            audioRef.current.currentTime = start / 1000;
            audioRef.current.play();
            setIsPlaying(true);

            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                }
            }, end - start + 500);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !report) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const metrics = report.metrics || [];
        const duration = report.duration || 1;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Draw Grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const y = (height / 5) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Draw Issues (Highlights)
        report.issues.forEach(issue => {
            const startX = (issue.start / duration) * width;
            const endX = (issue.end / duration) * width;
            const w = Math.max(2, endX - startX);

            ctx.fillStyle = issue.type === 'low' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)';
            ctx.fillRect(startX, 0, w, height);

            // Marker line
            ctx.strokeStyle = issue.type === 'low' ? '#ef4444' : '#f59e0b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startX, height);
            ctx.lineTo(startX, height - 10);
            ctx.lineTo(endX, height - 10);
            ctx.lineTo(endX, height);
            ctx.stroke();
        });

        // Draw Pitch Curve
        if (metrics.length > 0) {
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();

            metrics.forEach((m, i) => {
                const x = (m.timestamp / duration) * width;
                // Normalize pitch (assuming 100-300Hz range for visualization)
                const normalizedPitch = Math.max(0, Math.min(1, (m.pitch - 80) / 300));
                const y = height - (normalizedPitch * height);

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

        // Draw Playhead
        const playheadX = (currentTime * 1000 / duration) * width;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();

    }, [report, currentTime]);

    return (
        <div className="absolute inset-x-4 bottom-24 top-24 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 z-40">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Analysis Report
                        <span className={`text-sm px-2 py-0.5 rounded-full ${report.overallScore > 80 ? 'bg-teal-500/20 text-teal-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            Score: {report.overallScore}%
                        </span>
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{report.summary}</p>

                    {/* New Stats Row */}
                    <div className="flex gap-4 mt-3">
                        {(() => {
                            const stats = SessionAnalyzer.analyze(report.metrics);
                            if (!stats) return null;
                            return (
                                <>
                                    <div className="px-3 py-1 bg-slate-800 rounded-lg border border-white/10 text-xs">
                                        <span className="text-slate-400">Avg Pitch:</span> <span className="text-white font-bold">{stats.avgF0}Hz</span>
                                    </div>
                                    <div className="px-3 py-1 bg-slate-800 rounded-lg border border-white/10 text-xs">
                                        <span className="text-slate-400">Range:</span> <span className="text-white font-bold">{stats.minF0}-{stats.maxF0}Hz</span>
                                    </div>
                                    <div className="px-3 py-1 bg-slate-800 rounded-lg border border-white/10 text-xs">
                                        <span className="text-slate-400">Avg SPL:</span> <span className="text-white font-bold">{stats.avgSPL}dB</span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl border border-white/5 relative overflow-hidden mb-4">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {report.issues.map((issue, idx) => (
                    <button
                        key={idx}
                        onClick={() => playSegment(issue.start, issue.end)}
                        className={`flex-shrink-0 px-4 py-3 rounded-xl border text-left transition-all ${issue.type === 'low'
                            ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
                            : 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle size={14} className={issue.type === 'low' ? 'text-red-400' : 'text-yellow-400'} />
                            <span className={`text-xs font-bold uppercase ${issue.type === 'low' ? 'text-red-400' : 'text-yellow-400'}`}>
                                {issue.type === 'low' ? 'Pitch Drop' : 'High Pitch'}
                            </span>
                        </div>
                        <div className="text-white text-sm font-medium">&quot;{issue.words}&quot;</div>
                    </button>
                ))}
                {report.issues.length === 0 && (
                    <div className="w-full flex items-center justify-center gap-2 text-teal-400 py-4 bg-teal-500/5 rounded-xl border border-teal-500/20">
                        <CheckCircle size={20} />
                        <span className="font-medium">No issues detected! Perfect run.</span>
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-center">
                <button
                    onClick={togglePlay}
                    className="flex items-center gap-2 px-8 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-full transition-all hover:scale-105"
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    {isPlaying ? 'Pause Replay' : 'Replay Full Recording'}
                </button>
            </div>
        </div>
    );
};



export default AnalysisReportView;
