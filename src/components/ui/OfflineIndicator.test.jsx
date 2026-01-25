import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfflineIndicator from './OfflineIndicator';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

// Mock the hook directly
vi.mock('../../hooks/useOfflineStatus', () => ({
    useOfflineStatus: vi.fn()
}));

describe('OfflineIndicator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show offline banner when offline', () => {
        useOfflineStatus.mockReturnValue({
            isOnline: false,
            syncStatus: { isSyncing: false, pendingCount: 0 },
            forceSync: vi.fn()
        });

        render(<OfflineIndicator />);

        expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show pending count when offline with items', () => {
        useOfflineStatus.mockReturnValue({
            isOnline: false,
            syncStatus: { isSyncing: false, pendingCount: 5 },
            forceSync: vi.fn()
        });

        render(<OfflineIndicator />);

        expect(screen.getByText(/5 saved/i)).toBeInTheDocument();
    });

    it('should show syncing status when online and syncing', () => {
         useOfflineStatus.mockReturnValue({
            isOnline: true,
            syncStatus: { isSyncing: true, pendingCount: 2 },
            forceSync: vi.fn()
        });

        render(<OfflineIndicator />);
        expect(screen.getByText(/Syncing.../i)).toBeInTheDocument();
        expect(screen.getByText(/2 left/i)).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render nothing when online and synced', () => {
        useOfflineStatus.mockReturnValue({
            isOnline: true,
            syncStatus: { isSyncing: false, pendingCount: 0 },
            forceSync: vi.fn()
        });

        const { container } = render(<OfflineIndicator />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should have accessible retry button', () => {
        useOfflineStatus.mockReturnValue({
            isOnline: true,
            syncStatus: { isSyncing: true, pendingCount: 2 },
            forceSync: vi.fn()
        });

        render(<OfflineIndicator />);
        const button = screen.getByRole('button', { name: /force sync retry/i });
        expect(button).toBeInTheDocument();
    });
});
