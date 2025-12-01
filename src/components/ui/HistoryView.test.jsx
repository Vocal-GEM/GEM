import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HistoryView from './HistoryView';

// Mock dependencies
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        getSessions: vi.fn().mockResolvedValue([])
    })
}));

vi.mock('../../utils/pdfReportGenerator', () => ({
    pdfReportGenerator: {
        generate: vi.fn()
    }
}));

// Mock Chart.js to avoid canvas errors
vi.mock('react-chartjs-2', () => ({
    Line: () => null,
    Bar: () => null
}));

describe('HistoryView Component', () => {
    it('renders empty state when no journals are present', async () => {
        render(<HistoryView journals={[]} stats={{}} />);

        // Switch to Journals tab
        const journalsTab = screen.getByText('Journals');
        fireEvent.click(journalsTab);

        // Assuming EmptyState renders "Create First Entry"
        expect(await screen.findByText('Create First Entry')).toBeInTheDocument();
        expect(screen.getByText('Start documenting your journey')).toBeInTheDocument();
    });

    it('renders empty state when no sessions are present', async () => {
        render(<HistoryView journals={[]} stats={{}} />);

        // Switch to Sessions tab
        const sessionsTab = screen.getByText('Sessions');
        fireEvent.click(sessionsTab);

        // Assuming EmptyState renders "Start Practicing"
        expect(await screen.findByText('Start Practicing')).toBeInTheDocument();
        expect(screen.getByText('No practice sessions yet')).toBeInTheDocument();
    });
});
