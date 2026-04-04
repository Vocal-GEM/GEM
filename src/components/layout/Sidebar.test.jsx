import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';

// Mock contexts
const mockUseProfile = vi.fn();
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}));

// Mock NavigationContext
const mockUseNavigation = vi.fn();
vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => mockUseNavigation(),
}));

// Mock SearchService
vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
}));

// Mock StreakService
const mockCheckStreakStatus = vi.fn();
vi.mock('../../services/StreakService', () => ({
    checkStreakStatus: () => mockCheckStreakStatus()
}));

// Mock FeatureFlags
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        dashboard: true,
        practice: true,
        journal: true,
        settings: true,
        camera: true, // Enable for testing
        analysis: true,
        analytics: true,
        library: true,
        'client-dashboard': true,
        capev: true,
        spectrogram: true,
        'pitch-tool': true
    }
}));

// Mock child components
vi.mock('../ui/ProfileManager', () => ({
    default: ({ onClose }) => <div data-testid="profile-manager">Profile Manager <button onClick={onClose}>Close</button></div>
}));

describe('Sidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProfile.mockReturnValue({ activeProfile: { name: 'LocalUser' } });
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            openModal: vi.fn()
        });
        // Default streak mock
        mockCheckStreakStatus.mockReturnValue({ currentStreak: 0, isActive: false });
    });

    it('renders sidebar with basic navigation', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);
        expect(screen.getByText('Vocal GEM')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
    });

    it('displays "Start Streak" when streak is 0', () => {
        mockCheckStreakStatus.mockReturnValue({ currentStreak: 0, isActive: false });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);
        expect(screen.getByText('Start Streak')).toBeInTheDocument();
    });

    it('displays streak count when streak is > 0', () => {
        mockCheckStreakStatus.mockReturnValue({ currentStreak: 5, isActive: true });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);
        expect(screen.getByText('5 Day Streak')).toBeInTheDocument();
    });

    it('opens Camera modal when Mirror button is clicked', () => {
        const openModalSpy = vi.fn();
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            openModal: openModalSpy
        });

        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);

        const mirrorBtn = screen.getByText('Mirror');
        fireEvent.click(mirrorBtn);

        expect(openModalSpy).toHaveBeenCalledWith('camera');
    });
});
