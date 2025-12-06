import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

describe('Sidebar Auth Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProfile.mockReturnValue({ activeProfile: { name: 'LocalUser' } });
    });

    it('shows Sign In button when not logged in', () => {
        mockUseAuth.mockReturnValue({ user: null });
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);
        expect(getByText('Sign In')).toBeInTheDocument();
    });

    it('shows user info and Sign Out when logged in', () => {
        mockUseAuth.mockReturnValue({ user: { username: 'CloudUser' }, logout: mockLogout });
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);
        expect(getByText('CloudUser')).toBeInTheDocument();
        expect(getByText('Sign Out')).toBeInTheDocument();
    });

    it('opens Login modal on Sign In click', () => {
        mockUseAuth.mockReturnValue({ user: null });
        const { getByText, getByTestId } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);

        fireEvent.click(getByText('Sign In'));
        expect(getByTestId('login-modal')).toBeInTheDocument();
    });

    it('calls logout on Sign Out click', () => {
        mockUseAuth.mockReturnValue({ user: { username: 'CloudUser' }, logout: mockLogout });
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);

        fireEvent.click(getByText('Sign Out'));
        expect(mockLogout).toHaveBeenCalled();
    });
});
