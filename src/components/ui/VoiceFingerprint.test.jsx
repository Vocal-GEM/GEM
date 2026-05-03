import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VoiceFingerprint from './VoiceFingerprint';

// Mock the services
vi.mock('../../services/AdvancedAnalyticsService', () => ({
    generateVoiceFingerprint: vi.fn(() => ({
        averages: { f1: 500, f2: 1500, f3: 2500, pitch: 200 },
        stability: { f2: 85 }
    })),
    getFormantTrends: vi.fn(() => [
        { date: 'Mon', f1Avg: 490, f2Avg: 1480, pitchAvg: 195 }
    ]),
    generateProgressReport: vi.fn(() => ({
        available: true,
        insights: ['Good resonance'],
        recommendation: 'Keep practicing',
        generatedAt: new Date().toISOString()
    }))
}));

describe('VoiceFingerprint', () => {
    it('renders and allows tab switching', () => {
        render(<VoiceFingerprint />);

        expect(screen.getByText('Voice Analytics')).toBeInTheDocument();

        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(3);

        // Check fingerprint tab content
        expect(screen.getByText('F1 (Open)')).toBeInTheDocument();

        // Switch to trends tab
        fireEvent.click(screen.getByText('trends'));
        expect(screen.getByText('Mon')).toBeInTheDocument();

        // Switch to report tab
        fireEvent.click(screen.getByText('report'));
        expect(screen.getByText('Good resonance')).toBeInTheDocument();
    });
});
