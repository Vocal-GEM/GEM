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
vi.mock('../ui/Login', () => ({
    default: ({ onClose, onSwitchToSignup }) => (
        <div data-testid="login-modal">
            Login Modal
            <button onClick={onClose}>Close</button>
            <button onClick={onSwitchToSignup}>To Signup</button>
        </div>
    )
}));
vi.mock('../ui/Signup', () => ({
    default: ({ onClose, onSwitchToLogin }) => (
        <div data-testid="signup-modal">
            Signup Modal
            <button onClick={onClose}>Close</button>
            <button onClick={onSwitchToLogin}>To Login</button>
        </div>
    )
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

// Mock featureFlags to ensure items are visible
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
        // Default auth mock - but Sidebar doesn't actually use AuthContext for display logic currently!
        // It seems the Sidebar component logic changed to remove Auth integration (Sign In/Out buttons),
        // relying on ProfileManager or just being a nav menu.
        // Let's check what it actually renders based on the file content.

        // Based on read_file output of Sidebar.jsx:
        // It renders Nav Items, Search, Header, Footer.
        // It does NOT render Sign In / Sign Out buttons anymore.
        // Instead, it has a "Frontend Demo Mode" footer.
    });

    it('renders navigation items', () => {
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(getByText('Dashboard')).toBeInTheDocument();
        expect(getByText('Practice')).toBeInTheDocument();
        expect(getByText('Settings')).toBeInTheDocument();
    });

    it('calls onViewChange when a nav item is clicked', () => {
        const onViewChange = vi.fn();
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={onViewChange} />, { wrapper: MockNavigationProvider });

        fireEvent.click(getByText('Practice'));
        expect(onViewChange).toHaveBeenCalledWith('practice');
    });

    it('opens modal for modal-type items (Mirror)', () => {
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

    it('highlights active view', () => {
        const { getByText } = render(<Sidebar activeView="practice" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        // Practice button should have active class (blue bg)
        // We can check if it contains the class or just basic rendering
        const practiceBtn = getByText('Practice').closest('button');
        expect(practiceBtn.className).toContain('bg-blue-600');
    });
});
