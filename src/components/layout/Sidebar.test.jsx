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

describe('Sidebar UI/UX', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseProfile.mockReturnValue({ activeProfile: { name: 'LocalUser' } });
        mockUseNavigation.mockReturnValue({
            activeView: 'dashboard',
            navigateTo: vi.fn(),
            openModal: vi.fn()
        });
        mockUseAuth.mockReturnValue({ user: null });
    });

    it('has an accessible mobile menu toggle button', () => {
        const { getByTestId } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });

        // Find the button wrapping the menu icon
        const menuIcon = getByTestId('icon-menu');
        const toggleButton = menuIcon.closest('button');

        expect(toggleButton).toHaveAttribute('aria-label', 'Open sidebar menu');
        expect(toggleButton.className).toContain('focus-visible:ring-2');
        expect(toggleButton.className).toContain('focus-visible:outline-none');

        // Click to toggle to 'Close'
        fireEvent.click(toggleButton);
        const closeIcon = getByTestId('icon-x');
        const updatedButton = closeIcon.closest('button');
        expect(updatedButton).toHaveAttribute('aria-label', 'Close sidebar menu');
    });
});
