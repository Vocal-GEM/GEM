import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Breadcrumbs from './Breadcrumbs';
import { useNavigation } from '../../context/NavigationContext';

// Mock context
vi.mock('../../context/NavigationContext', () => ({
    useNavigation: vi.fn()
}));

describe('Breadcrumbs', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render default breadcrumbs when history is empty', () => {
        useNavigation.mockReturnValue({
            history: [],
            navigate: mockNavigate,
            activeView: 'practice'
        });

        render(<Breadcrumbs />);

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
    });

    it('should render history items', () => {
        const history = [
            { label: 'Home', action: vi.fn() },
            { label: 'Practice', action: vi.fn() },
            { label: 'Pitch Tool', action: null }
        ];

        useNavigation.mockReturnValue({
            history,
            navigate: mockNavigate,
            activeView: 'practice'
        });

        render(<Breadcrumbs />);

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByText('Pitch Tool')).toBeInTheDocument();
    });

    it('should call action when clicking a breadcrumb', () => {
        const mockAction = vi.fn();
        const history = [
            { label: 'Home', action: mockAction },
            { label: 'Practice', action: null }
        ];

        useNavigation.mockReturnValue({
            history,
            navigate: mockNavigate,
            activeView: 'practice'
        });

        render(<Breadcrumbs />);

        const homeLink = screen.getByText('Home');
        fireEvent.click(homeLink);

        expect(mockAction).toHaveBeenCalled();
    });
});
