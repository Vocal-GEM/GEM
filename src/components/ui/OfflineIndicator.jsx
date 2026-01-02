import { WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

const OfflineIndicator = () => {
    const { isOnline, syncStatus, forceSync } = useOfflineStatus();

    // Only show if offline or syncing or if there are pending items
    if (isOnline && !syncStatus.isSyncing && syncStatus.pendingCount === 0) return null;

    return (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-2 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-3 transition-all animate-in slide-in-from-bottom-4 fade-in duration-300 ${!isOnline
                ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                : 'bg-blue-900/90 border-blue-700 text-blue-100'
            }`}>
            {!isOnline ? (
                <>
                    <WifiOff size={16} className="text-red-400" />
                    <span className="text-xs font-bold">Offline Mode</span>
                    {syncStatus.pendingCount > 0 && (
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                            {syncStatus.pendingCount} saved
                        </span>
                    )}
                </>
            ) : (
                <>
                    <RefreshCw size={16} className="animate-spin text-blue-300" />
                    <span className="text-xs font-bold">Syncing...</span>
                    {syncStatus.pendingCount > 0 && (
                        <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded-full text-blue-200">
                            {syncStatus.pendingCount} left
                        </span>
                    )}
                    <button
                        onClick={forceSync}
                        className="ml-2 text-[10px] underline hover:text-white"
                        title="Force retry"
                    >
                        Retry
                    </button>
                </>
            )}
        </div>
    );
};

export default OfflineIndicator;
