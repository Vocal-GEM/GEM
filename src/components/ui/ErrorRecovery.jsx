import React from 'react';
import { AlertTriangle, RefreshCw, MicOff } from 'lucide-react';

const ErrorRecovery = ({ error, onRetry, onDismiss }) => {
    if (!error) return null;

    const isAudioError = error.toLowerCase().includes('audio') || error.toLowerCase().includes('microphone');

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl p-4 shadow-xl flex items-start gap-4">
                <div className="p-2 bg-red-500/20 rounded-lg text-red-400 shrink-0">
                    {isAudioError ? <MicOff size={20} /> : <AlertTriangle size={20} />}
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-200 mb-1">Something went wrong</h3>
                    <p className="text-xs text-red-300/80 mb-3 leading-relaxed">{error}</p>

                    <div className="flex gap-2">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <RefreshCw size={12} /> Retry
                            </button>
                        )}
                        <button
                            onClick={onDismiss}
                            className="px-3 py-1.5 hover:bg-white/5 text-red-300/60 hover:text-red-200 text-xs font-bold rounded-lg transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorRecovery;
