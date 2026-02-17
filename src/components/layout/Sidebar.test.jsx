import { render, fireEvent, waitFor } from '@testing-library/react';
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

// Mock Feature Flags to ensure all items are visible
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
        camera: true, // Ensure Mirror is enabled
        settings: true
    }
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

// Mock Camera Icon
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const React = await import('react');
    return {
        ...actual,
        Camera: (props) => React.createElement('div', { ...props, 'data-testid': 'icon-camera', 'aria-label': 'Camera Icon' }, null),
    };
});

const MockNavigationProvider = ({ children }) => <div>{children}</div>;

describe('Sidebar Auth Integration', () => {
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
        mockUseAuth.mockReturnValue({ user: null });
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(getByText('Dashboard')).toBeInTheDocument();
        expect(getByText('Practice')).toBeInTheDocument();
    });

    it('opens Camera modal when Mirror button is clicked', async () => {
        mockUseAuth.mockReturnValue({ user: { username: 'TestUser' } });
        const openModalSpy = vi.fn();
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            openModal: openModalSpy
        });

        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        await waitFor(() => expect(getByText('Mirror')).toBeInTheDocument());

        const mirrorBtn = getByText('Mirror');
        fireEvent.click(mirrorBtn);

        expect(openModalSpy).toHaveBeenCalledWith('camera');
    });
});
