import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';

const mockUseAuth = vi.fn();
const mockUseProfile = vi.fn();

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}));

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => mockUseProfile()
}));

const mockUseNavigation = vi.fn();
vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => mockUseNavigation(),
    NavigationProvider: ({ children }) => <div>{children}</div>
}));

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
        mockUseAuth.mockReturnValue({ user: { username: 'TestUser' } });
    });

    it('renders without crashing', () => {
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(getByText('Vocal GEM')).toBeInTheDocument();
    });
});
