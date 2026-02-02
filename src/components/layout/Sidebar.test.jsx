import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';

// Mock feature flags
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        dashboard: true,
        practice: true,
        camera: true, // Enable for test
        settings: true
    },
    isFeatureEnabled: () => true
}));

// Mock contexts
const mockUseNavigation = vi.fn();
const mockUseProfile = vi.fn();

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}));

vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => mockUseNavigation(),
    NavigationProvider: ({ children }) => <div>{children}</div>
}));

// Mock child components
vi.mock('../ui/ProfileManager', () => ({
    default: ({ onClose }) => <div data-testid="profile-manager">Profile Manager <button onClick={onClose}>Close</button></div>
}));

// Mock SearchService
vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
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

    it('focuses search input when Cmd+K is pressed', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const searchInput = screen.getByPlaceholderText('Search...');

        // Ensure input is not focused initially
        expect(document.activeElement).not.toBe(searchInput);

        // Simulate Cmd+K
        fireEvent.keyDown(document, { key: 'k', metaKey: true });

        expect(document.activeElement).toBe(searchInput);
    });

    it('focuses search input when Ctrl+K is pressed', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const searchInput = screen.getByPlaceholderText('Search...');

        fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

        expect(document.activeElement).toBe(searchInput);
    });

    it('mobile toggle button has accessible label', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const toggleBtn = screen.getByLabelText('Toggle navigation menu');
        expect(toggleBtn).toBeInTheDocument();
        expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
        expect(toggleBtn).toHaveAttribute('aria-controls', 'sidebar-navigation');

        // Click to expand
        fireEvent.click(toggleBtn);
        expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    });

    it('active navigation item has aria-current="page"', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        // Find dashboard button (which is active)
        const dashboardSpan = screen.getByText('Dashboard');
        const dashboardBtn = dashboardSpan.closest('button');

        expect(dashboardBtn).toHaveAttribute('aria-current', 'page');

        // Check inactive item
        const practiceSpan = screen.getByText('Practice');
        const practiceBtn = practiceSpan.closest('button');
        expect(practiceBtn).not.toHaveAttribute('aria-current');
    });
});
