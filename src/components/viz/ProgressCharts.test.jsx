import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProgressCharts from './ProgressCharts';
import { indexedDB } from '../../services/IndexedDBManager';

// Mock Chart.js to avoid canvas rendering issues in test environment
vi.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="line-chart">Line Chart</div>,
    Bar: () => <div data-testid="bar-chart">Bar Chart</div>
}));

vi.mock('../../services/IndexedDBManager', () => ({
    indexedDB: {
        getJournals: vi.fn()
    }
}));

describe('ProgressCharts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render loading state initially', () => {
        // Return a promise that never resolves immediately to test loading state
        indexedDB.getJournals.mockReturnValue(new Promise(() => { }));
        render(<ProgressCharts />);
        expect(screen.getByText(/loading progress/i)).toBeInTheDocument();
    });

    it('should render empty state when no data', async () => {
        indexedDB.getJournals.mockResolvedValue([]);
        render(<ProgressCharts />);

        await waitFor(() => {
            expect(screen.getByText(/no practice data yet/i)).toBeInTheDocument();
        });
    });

    it('should render charts when data is present', async () => {
        const mockData = [
            { date: '2023-01-01', averagePitch: 200, duration: 20 },
            { date: '2023-01-02', averagePitch: 210, duration: 30 }
        ];
        indexedDB.getJournals.mockResolvedValue(mockData);

        render(<ProgressCharts />);

        await waitFor(() => {
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });
    });
});
