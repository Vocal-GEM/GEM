import { render, fireEvent } from '@testing-library/react';
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
    NavigationProvider: ({ children }) => <div>{children}</div>
}));

// Mock SearchService
vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
}));

// Mock Feature Flags to enable all for testing
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        dashboard: true,
        practice: true,
        journal: true,
        analysis: true,
        camera: true,
        settings: true
    },
    isFeatureEnabled: (id) => true
}));

const MockNavigationProvider = ({ children }) => <div>{children}</div>;

describe('Sidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProfile.mockReturnValue({ activeProfile: { name: 'LocalUser' } });
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            navigateTo: vi.fn(),
            openModal: vi.fn()
        });
    });

    it('renders navigation items correctly', () => {
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        expect(getByText('Dashboard')).toBeInTheDocument();
        expect(getByText('Practice')).toBeInTheDocument();
        expect(getByText('Voice Log')).toBeInTheDocument();
        expect(getByText('Analysis')).toBeInTheDocument();
    });

    it('opens Camera modal when Mirror button is clicked', () => {
        const openModalSpy = vi.fn();
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            openModal: openModalSpy
        });

        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const mirrorBtn = getByText('Mirror');
        fireEvent.click(mirrorBtn);

        expect(openModalSpy).toHaveBeenCalledWith('camera');
    });
});
