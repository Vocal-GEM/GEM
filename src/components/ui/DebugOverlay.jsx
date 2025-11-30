import React, { useState, useEffect } from 'react';
import { X, Activity, Mic, AlertTriangle, CheckCircle } from 'lucide-react';

const DebugOverlay = ({ audioEngine, dataRef }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);

    const [realtimeData, setRealtimeData] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            if (audioEngine) {
                setDebugInfo(audioEngine.getDebugState());
            }
        }, 500);

        const loop = () => {
            if (dataRef && dataRef.current) {
                setRealtimeData({ ...dataRef.current });
            }
            requestAnimationFrame(loop);
        };
        const rafId = requestAnimationFrame(loop);

        return () => {
            clearInterval(interval);
            cancelAnimationFrame(rafId);
        };
    }, [isOpen, audioEngine, dataRef]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 left-4 z-50 p-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/10 text-slate-400 hover:text-white"
                title="Open Debug Info"
            >
                <Activity size={16} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="text-teal-400" />
                    Audio Debugger
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-white/10 text-white">
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Real-time Metrics */}
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} /> Live Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                            <div className="text-slate-500">Pitch</div>
                            <div className="text-xl font-bold text-white">
                                {realtimeData.pitch > 0 ? realtimeData.pitch.toFixed(1) : '--'} <span className="text-xs text-slate-500">Hz</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-500">Confidence</div>
                            <div className={`text-xl font-bold ${realtimeData.pitchConfidence > 0.8 ? 'text-green-400' : realtimeData.pitchConfidence > 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {(realtimeData.pitchConfidence * 100).toFixed(0)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-500">Resonance</div>
                            <div className="text-lg font-bold text-cyan-400">
                                {realtimeData.resonance ? realtimeData.resonance.toFixed(0) : '--'} <span className="text-xs text-slate-500">Hz</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-500">Res. Conf.</div>
                            <div className="text-lg font-bold text-cyan-400">
                                {(realtimeData.resonanceConfidence * 100).toFixed(0)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-500">Volume (RMS)</div>
                            <div className="text-lg font-bold text-emerald-400">
                                {(realtimeData.volume * 100).toFixed(1)}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-500">Status</div>
                            <div className={`text-lg font-bold ${realtimeData.isSilent ? 'text-slate-500' : 'text-green-400'}`}>
                                {realtimeData.isSilent ? 'SILENT' : 'ACTIVE'}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Audio Context State */}
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Audio Context</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-white">State</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${debugInfo?.contextState === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {debugInfo?.contextState || 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* Microphone State */}
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Microphone</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-white">Active</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${debugInfo?.micActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {debugInfo?.micActive ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>

                {/* Worklet State */}
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Audio Worklet</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-white">Loaded</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${debugInfo?.workletLoaded ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {debugInfo?.workletLoaded ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>

                {/* Socket State */}
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Backend Connection</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-white">Socket Connected</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${debugInfo?.socketConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {debugInfo?.socketConnected ? 'Yes' : 'No'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white">Buffered Chunks</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${debugInfo?.bufferSize > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                                {debugInfo?.bufferSize || 0}
                            </span>
                        </div>
                    </div>

                    {/* Connection Log */}
                    {debugInfo?.connectionLog && debugInfo.connectionLog.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <h4 className="text-xs font-bold text-slate-500 mb-2">Recent Events</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                                {debugInfo.connectionLog.map((log, i) => (
                                    <div key={i} className="text-[10px] font-mono text-slate-400 truncate">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Errors */}
                {debugInfo?.error && (
                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                        <h3 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Error Detected
                        </h3>
                        <p className="text-sm text-red-200 font-mono break-all">
                            {debugInfo.error}
                        </p>
                    </div>
                )}

                {/* Browser Info */}
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">System Info</h3>
                    <div className="space-y-2 text-xs text-slate-300 font-mono">
                        <p>User Agent: {navigator.userAgent}</p>
                        <p>AudioContext Support: {window.AudioContext || window.webkitAudioContext ? 'Yes' : 'No'}</p>
                        <p>Worklet Support: {window.AudioWorklet ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebugOverlay;
