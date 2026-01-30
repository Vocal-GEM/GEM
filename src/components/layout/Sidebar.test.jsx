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

// Mock SearchService
vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
}));

// Mock feature flags to enable camera for testing
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        dashboard: true,
        practice: true,
        settings: true,
        camera: true // Enable for test
    },
    isFeatureEnabled: (id) => id !== 'disabled'
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
        expect(screen.getByText('Settings')).toBeInTheDocument();
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

    it('calls onViewChange when a nav item is clicked', () => {
        const onViewChangeSpy = vi.fn();
        render(<Sidebar activeView="dashboard" onViewChange={onViewChangeSpy} />, { wrapper: MockNavigationProvider });

        const practiceBtn = screen.getByText('Practice');
        fireEvent.click(practiceBtn);

        expect(onViewChangeSpy).toHaveBeenCalledWith('practice');
    });
});
