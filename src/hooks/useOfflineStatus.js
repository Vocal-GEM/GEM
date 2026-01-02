import { useState, useEffect } from 'react';
import { syncManager } from '../services/SyncManager';

export const useOfflineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState(syncManager.getStatus());

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Subscribe to SyncManager updates
        const unsubscribe = syncManager.subscribe((status) => {
            setSyncStatus(status);
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            unsubscribe();
        };
    }, []);

    const isFeatureAvailable = (feature) => {
        if (isOnline) return true;

        // Define offline-capable features
        const offlineFeatures = [
            'pitch_visualizer',
            'resonance_orb',
            'spectrogram',
            'warmup',
            'practice_mode'
        ];

        // Check if feature is in the allowed list
        // Or if it's a "local" feature by default
        return offlineFeatures.includes(feature) || feature.startsWith('local_');
    };

    return {
        isOnline,
        syncStatus,
        isFeatureAvailable,
        forceSync: () => syncManager.forceSyncNow()
    };
};
