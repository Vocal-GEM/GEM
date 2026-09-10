import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ user: null })
}));

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({ activeProfile: { name: 'LocalUser' } })
}));

vi.mock('../../context/NavigationContext', () => ({
    useNavigation: () => ({ activeView: 'dashboard', navigateTo: vi.fn(), openModal: vi.fn() }),
    NavigationProvider: ({ children }) => <div>{children}</div>
}));

describe('Sidebar', () => {
    it('renders without crashing', () => {
        const { getByText } = render(<Sidebar activeView="dashboard" onViewChange={() => { }} />);
        expect(getByText('Vocal GEM')).toBeInTheDocument();
    });
});
