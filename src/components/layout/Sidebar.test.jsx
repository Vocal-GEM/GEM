import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';
import React from 'react';

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

// Mock FeatureFlags
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        camera: true // Enable camera feature for Mirror test
    },
    default: {
        camera: true
    }
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

    // Auth features removed in favor of Frontend Demo Mode
    /*
    it('shows Sign In button when not logged in', () => {
        mockUseAuth.mockReturnValue({ user: null });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(screen.getAllByText('Sign In')[0]).toBeInTheDocument();
    });

    it('shows user info and Sign Out when logged in', () => {
        mockUseAuth.mockReturnValue({ user: { username: 'CloudUser' }, logout: mockLogout });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(screen.getAllByText('CloudUser')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Sign Out')[0]).toBeInTheDocument();
    });

    it('opens Login modal on Sign In click', () => {
        mockUseAuth.mockReturnValue({ user: null });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const signInButtons = screen.getAllByText('Sign In');
        fireEvent.click(signInButtons[0]);
        expect(screen.getByTestId('login-modal')).toBeInTheDocument();
    });

    it('calls logout on Sign Out click', () => {
        mockUseAuth.mockReturnValue({ user: { username: 'CloudUser' }, logout: mockLogout });
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const signOutButtons = screen.getAllByText('Sign Out');
        fireEvent.click(signOutButtons[0]);
        expect(mockLogout).toHaveBeenCalled();
    });
    */

    it('opens Camera modal when Mirror button is clicked', () => {
        mockUseAuth.mockReturnValue({ user: { username: 'TestUser' } });
        const openModalSpy = vi.fn();
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            openModal: openModalSpy
        });

        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        const mirrorBtns = screen.getAllByText('Mirror');
        fireEvent.click(mirrorBtns[0]);

        expect(openModalSpy).toHaveBeenCalledWith('camera');
    });
});
