import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfflineIndicator from './OfflineIndicator';
import { syncManager } from '../../services/SyncManager';

// Mock SyncManager
vi.mock('../../services/SyncManager', () => ({
    syncManager: {
        getStatus: vi.fn(),
        subscribe: vi.fn(() => vi.fn()),
        forceSyncNow: vi.fn()
    }
}));

describe('OfflineIndicator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show offline banner when offline', () => {
        syncManager.getStatus.mockReturnValue({
            isOnline: false,
            isSyncing: false,
            pendingCount: 0
        });

        render(<OfflineIndicator />);

        expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
    });

    it('should show pending count when offline with items', () => {
        syncManager.getStatus.mockReturnValue({
            isOnline: false,
            isSyncing: false,
            pendingCount: 5
        });

        render(<OfflineIndicator />);

        expect(screen.getByText(/5 pending/i)).toBeInTheDocument();
    });

    it('should show online status when online', () => {
        syncManager.getStatus.mockReturnValue({
            isOnline: true,
            isSyncing: false,
            pendingCount: 0
        });

        render(<OfflineIndicator />);

        expect(screen.queryByText(/You are offline/i)).not.toBeInTheDocument();
    });
});
