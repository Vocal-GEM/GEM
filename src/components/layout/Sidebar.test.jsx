import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';

// Mock contexts
const mockUseProfile = vi.fn();
const mockUseNavigation = vi.fn();

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}));

vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => mockUseNavigation(),
}));

// Mock SearchService
vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
}));

// Mock Feature Flags
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        dashboard: true,
        practice: true,
        journal: true,
        analysis: true,
        analytics: true,
        library: true,
        'client-dashboard': true,
        capev: true,
        spectrogram: true,
        'pitch-tool': true,
        camera: true,
        settings: true
    }
}));

describe('Sidebar Navigation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProfile.mockReturnValue({ activeProfile: { name: 'LocalUser' } });
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            navigateTo: vi.fn(),
            openModal: vi.fn()
        });
    });

    it('renders navigation items', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByText('Voice Log')).toBeInTheDocument();
        expect(screen.getByText('Analysis')).toBeInTheDocument();
        expect(screen.getByText('Mirror')).toBeInTheDocument();
    });

    it('calls onViewChange when a nav item is clicked', () => {
        const onViewChange = vi.fn();
        render(<Sidebar activeView="dashboard" onViewChange={onViewChange} />);

        fireEvent.click(screen.getByText('Practice'));
        expect(onViewChange).toHaveBeenCalledWith('practice');
    });

    it('opens modal when a modal item (Mirror) is clicked', () => {
        const openModal = vi.fn();
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            openModal: openModal
        });

        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);

        fireEvent.click(screen.getByText('Mirror'));
        expect(openModal).toHaveBeenCalledWith('camera');
    });

    it('highlights the active view', () => {
        render(<Sidebar activeView="practice" onViewChange={() => { }} />);

        const practiceButton = screen.getByText('Practice').closest('button');
        expect(practiceButton).toHaveClass('bg-blue-600');

        const dashboardButton = screen.getByText('Dashboard').closest('button');
        expect(dashboardButton).not.toHaveClass('bg-blue-600');
    });
});
