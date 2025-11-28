import React, { useState, useEffect } from 'react';
import { X, Activity, Mic, AlertTriangle, CheckCircle } from 'lucide-react';

const DebugOverlay = ({ audioEngine }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            if (audioEngine) {
                setDebugInfo(audioEngine.getDebugState());
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isOpen, audioEngine]);

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
