import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';

// Mock contexts
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

// Mock Feature Flags
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        camera: true // Enable Mirror for testing
    }
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
        mockUseAuth.mockReturnValue({}); // Default empty auth
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
