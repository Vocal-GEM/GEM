import React, { useState, useEffect } from 'react';
import { Mic, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

const EnvironmentCheck = ({ onComplete, onCancel }) => {
    const { runEnvironmentCheck } = useAudio();
    const [status, setStatus] = useState('idle'); // idle, checking, success, warning, error
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        startCheck();
    }, []);

    const startCheck = async () => {
        setStatus('checking');
        setProgress(0);
        setResult(null);

        // Simulate progress bar
        const interval = setInterval(() => {
            setProgress(p => Math.min(p + 5, 95));
        }, 150);

        try {
            const data = await runEnvironmentCheck();
            clearInterval(interval);
            setProgress(100);
            setResult(data);

            if (data.score >= 80) {
                setStatus('success');
            } else if (data.score >= 50) {
                setStatus('warning');
            } else {
                setStatus('error');
            }
        } catch (error) {
            clearInterval(interval);
            console.error("Environment check failed:", error);
            setStatus('error');
            setResult({ message: "Failed to access microphone or audio engine." });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Environment Check</h2>
                    <p className="text-slate-400">Ensuring optimal audio conditions for your practice.</p>
                </div>

                {/* Content */}
                <div className="min-h-[200px] flex flex-col items-center justify-center">

                    {status === 'checking' && (
                        <div className="w-full space-y-4">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <Mic className="w-12 h-12 text-blue-500 animate-pulse" />
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full transition-all duration-150 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center text-sm text-blue-400 font-medium animate-pulse">Listening to room noise...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-green-400">Ready to Practice!</h3>
                            <p className="text-slate-300">{result?.message}</p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-slate-800 p-3 rounded-xl">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Noise Floor</div>
                                    <div className="text-lg font-mono text-white">{result?.noiseFloor} dB</div>
                                </div>
                                <div className="bg-slate-800 p-3 rounded-xl">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Score</div>
                                    <div className="text-lg font-mono text-green-400">{result?.score}/100</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'warning' && (
                        <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-10 h-10 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-bold text-yellow-400">Check Audio</h3>
                            <p className="text-slate-300">{result?.message}</p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-slate-800 p-3 rounded-xl">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Noise Floor</div>
                                    <div className="text-lg font-mono text-white">{result?.noiseFloor} dB</div>
                                </div>
                                <div className="bg-slate-800 p-3 rounded-xl">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Score</div>
                                    <div className="text-lg font-mono text-yellow-400">{result?.score}/100</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center space-y-4 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-red-400">Environment Issue</h3>
                            <p className="text-slate-300">{result?.message || "Unknown error occurred."}</p>
                            {result?.clipping > 0 && (
                                <p className="text-sm text-red-300 bg-red-900/20 p-2 rounded">
                                    ⚠️ Clipping detected ({result.clipping} samples). Lower your mic gain.
                                </p>
                            )}
                        </div>
                    )}

                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>

                    {status !== 'checking' && (
                        <>
                            {status === 'error' ? (
                                <button
                                    onClick={startCheck}
                                    className="flex-1 py-3 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <Loader2 size={18} /> Try Again
                                </button>
                            ) : (
                                <button
                                    onClick={onComplete}
                                    className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2
                                        ${status === 'warning'
                                            ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20'
                                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                                        }`}
                                >
                                    {status === 'warning' ? 'Practice Anyway' : 'Start Practice'}
                                </button>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EnvironmentCheck;
