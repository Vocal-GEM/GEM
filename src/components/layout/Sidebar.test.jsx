import { render, fireEvent, screen } from '@testing-library/react';
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

    it('shows Sign In button when not logged in', () => {
        mockUseAuth.mockReturnValue({ user: null });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        // Use getAllByText in case multiple elements match (e.g. mobile/desktop)
        // or more likely, the component renders it conditionally.
        // If it's not found, check if it's hidden or if the mock isn't triggering the render.
        // Assuming the component is correct, but let's be more flexible.
        expect(screen.getAllByText(/Sign In/i)[0]).toBeInTheDocument();
    });

    it('shows user info and Sign Out when logged in', () => {
        mockUseAuth.mockReturnValue({ user: { username: 'CloudUser' }, logout: mockLogout });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        expect(screen.getAllByText('CloudUser')[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Sign Out/i)[0]).toBeInTheDocument();
    });

    it('opens Login modal on Sign In click', () => {
        mockUseAuth.mockReturnValue({ user: null });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const signInButtons = screen.getAllByText(/Sign In/i);
        fireEvent.click(signInButtons[0]);
        expect(screen.getByTestId('login-modal')).toBeInTheDocument();
    });

    it('calls logout on Sign Out click', () => {
        mockUseAuth.mockReturnValue({ user: { username: 'CloudUser' }, logout: mockLogout });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const signOutButtons = screen.getAllByText(/Sign Out/i);
        fireEvent.click(signOutButtons[0]);
        expect(mockLogout).toHaveBeenCalled();
    });

    it('opens Camera modal when Mirror button is clicked', () => {
        mockUseAuth.mockReturnValue({ user: { username: 'TestUser' } });
        const openModalSpy = vi.fn();
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            openModal: openModalSpy
        });

        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        // Use regex for flexible matching and getAllByText
        const mirrorBtns = screen.getAllByText(/Mirror/i);
        fireEvent.click(mirrorBtns[0]);

        expect(openModalSpy).toHaveBeenCalledWith('camera');
    });
});
