import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';

// Mock contexts
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();
const mockUseProfile = vi.fn();

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}));

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}));

// Mock child components to avoid deep rendering issues
vi.mock('../ui/ProfileManager', () => ({
    default: ({ onClose }) => <div data-testid="profile-manager">Profile Manager <button onClick={onClose}>Close</button></div>
}));

// Mock NavigationContext
const mockUseNavigation = vi.fn();
vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => mockUseNavigation(),
    NavigationProvider: ({ children }) => <div>{children}</div>
}));

// Mock SearchService
vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
}));

// Mock feature flags
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        dashboard: true,
        practice: true,
        journal: true,
        settings: true,
        camera: true // Explicitly enable for test
    },
    isFeatureEnabled: (key) => true
}));

const MockNavigationProvider = ({ children }) => <div>{children}</div>;

describe('Sidebar Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProfile.mockReturnValue({ activeProfile: { name: 'LocalUser' } });
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            navigateTo: vi.fn(),
            openModal: vi.fn()
        });
        mockUseAuth.mockReturnValue({ user: null }); // Default no user
    });

    it('renders sidebar navigation items', () => {
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        expect(getByText('Dashboard')).toBeInTheDocument();
        expect(getByText('Practice')).toBeInTheDocument();
        expect(getByText('Voice Log')).toBeInTheDocument();
        expect(getByText('Settings')).toBeInTheDocument();
    });

    it('highlights active view', () => {
        const { getByText } = render(<Sidebar activeView="practice" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        // This is a bit brittle as it depends on classes, but typical for these tests
        // Alternatively check if it has the "active" visual indicator logic
        const practiceBtn = getByText('Practice').closest('button');
        expect(practiceBtn).toHaveClass('bg-blue-600');
    });

    it('calls onViewChange when item clicked', () => {
        const onViewChangeSpy = vi.fn();
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={onViewChangeSpy} />, { wrapper: MockNavigationProvider });

        fireEvent.click(getByText('Practice'));
        expect(onViewChangeSpy).toHaveBeenCalledWith('practice');
    });

    it('opens modal for modal items (Mirror)', () => {
        const openModalSpy = vi.fn();
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            openModal: openModalSpy
        });

        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        fireEvent.click(getByText('Mirror'));
        expect(openModalSpy).toHaveBeenCalledWith('camera');
    });
});
