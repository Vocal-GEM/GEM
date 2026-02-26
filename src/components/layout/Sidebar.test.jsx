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
    NavigationProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../ui/ProfileManager', () => ({
    default: ({ onClose }) => <div data-testid="profile-manager">Profile Manager <button onClick={onClose}>Close</button></div>
}));

// Mock SearchService
vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
}));

// Mock Feature Flags - Ensure camera is enabled
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        camera: true,
        dashboard: true,
        practice: true
    }
}));

const MockNavigationProvider = ({ children }) => <div>{children}</div>;

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
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
    });

    it('opens Camera modal when Mirror button is clicked', () => {
        const openModalSpy = vi.fn();
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            openModal: openModalSpy
        });

        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const mirrorBtn = screen.getByText('Mirror');
        fireEvent.click(mirrorBtn);

        expect(openModalSpy).toHaveBeenCalledWith('camera');
    });

    it('shows version info in footer', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(screen.getByText(/Frontend Demo Mode/i)).toBeInTheDocument();
    });
});
