import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';

// Mock contexts
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ user: { username: 'TestUser' } })
}));

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({ activeProfile: { name: 'LocalUser' } })
}));

vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => ({
        activeView: 'dashboard',
        navigateTo: vi.fn(),
        openModal: vi.fn()
    }),
    NavigationProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../../services/SearchService', () => ({
    search: vi.fn(() => []),
    groupResultsByType: vi.fn(() => []),
}));

const MockNavigationProvider = ({ children }) => <div>{children}</div>;

describe('Sidebar', () => {
    it('renders dashboard link', () => {
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders Frontend Demo Mode footer', () => {
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />, { wrapper: MockNavigationProvider });
        expect(getByText('Frontend Demo Mode')).toBeInTheDocument();
    });
});
