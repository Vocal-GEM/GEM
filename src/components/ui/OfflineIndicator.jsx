import React, { useState, useEffect } from 'react';
import { syncManager } from '../../services/SyncManager';
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react';

const OfflineIndicator = () => {
    const [status, setStatus] = useState(syncManager.getStatus());

    useEffect(() => {
        const unsubscribe = syncManager.subscribe(setStatus);
        return unsubscribe;
    }, []);

    const handleManualSync = () => {
        syncManager.forceSyncNow();
    };

    const { isOnline, isSyncing, pendingCount, lastSyncTime } = status;

    // Format last sync time
    const formatLastSync = () => {
        if (!lastSyncTime) return 'Never';
        const diff = Date.now() - lastSyncTime;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    return (
        <>
            <div className="flex items-center gap-2">
                {/* Online/Offline Indicator */}
                <div className="relative">
                    {isOnline ? (
                        <Wifi className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <WifiOff className="w-5 h-5 text-red-400" />
                    )}
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                            {pendingCount > 9 ? '9+' : pendingCount}
                        </span>
                    )}
                </div>

                {/* Sync Status */}
                {isSyncing && (
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                )}

                {/* Manual Sync Button (only show if online and has pending items) */}
                {isOnline && pendingCount > 0 && !isSyncing && (
                    <button
                        onClick={handleManualSync}
                        className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        title="Sync now"
                    >
                        Sync
                    </button>
                )}

                {/* Last Sync Time (tooltip on hover) */}
                <div className="hidden md:block text-xs text-slate-400" title={`Last sync: ${formatLastSync()}`}>
                    {formatLastSync()}
                </div>
            </div>

            {/* Offline Banner */}
            {!isOnline && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 backdrop-blur-md border border-red-500/30 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium">You are offline. Changes will sync when you reconnect.</span>
                    {pendingCount > 0 && (
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                            {pendingCount} pending
                        </span>
                    )}
                </div>
            )}
        </>
    );
};

export default OfflineIndicator;
