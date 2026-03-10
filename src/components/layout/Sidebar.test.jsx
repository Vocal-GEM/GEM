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

// Mock ProfileManager to avoid rendering issues
vi.mock('../ui/ProfileManager', () => ({
    default: ({ onClose }) => <div data-testid="profile-manager">Profile Manager <button onClick={onClose}>Close</button></div>
}));

// Mock SearchService
vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
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
    });

    it('renders navigation items', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('has accessible mobile menu toggle', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        // This checks for the button by its accessible name
        const toggleBtn = screen.getByRole('button', { name: /toggle navigation|open menu|toggle sidebar/i });
        expect(toggleBtn).toBeInTheDocument();
    });

    it('has accessible search input', () => {
        render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        // This checks for the input by its accessible name
        const searchInput = screen.getByRole('textbox', { name: /search/i });
        expect(searchInput).toBeInTheDocument();
    });
});
