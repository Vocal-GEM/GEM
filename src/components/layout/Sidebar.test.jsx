import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';

// Feature Flags Mock
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        camera: true,
        dashboard: true,
        practice: true,
        settings: true,
        journal: true,
        analysis: true,
        analytics: true,
        library: true,
        'client-dashboard': true,
        capev: true,
        spectrogram: true,
        'pitch-tool': true
    },
    isFeatureEnabled: () => true
}));

// Mock contexts
const mockUseProfile = vi.fn();

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

const MockNavigationProvider = ({ children }) => <div>{children}</div>;

describe('Sidebar Integration', () => {
    // Auth tests were removed because Sidebar.jsx no longer includes Auth buttons or logic (Frontend Demo Mode).
    // The component now focuses on navigation and feature toggles.

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProfile.mockReturnValue({ activeProfile: { name: 'LocalUser' } });
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            navigateTo: vi.fn(),
            openModal: vi.fn()
        });
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

    it('has accessible mobile toggle button', () => {
        const { getByLabelText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const toggleBtn = getByLabelText('Open sidebar');
        expect(toggleBtn).toBeInTheDocument();
        expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
        expect(toggleBtn).toHaveAttribute('aria-controls', 'sidebar-menu');

        // Click to open
        fireEvent.click(toggleBtn);

        // Should now indicate open
        expect(toggleBtn).toHaveAttribute('aria-label', 'Close sidebar');
        expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    });
});
