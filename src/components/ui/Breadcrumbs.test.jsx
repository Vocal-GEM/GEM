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
    const mockSwitchPracticeTab = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should NOT render on dashboard view', () => {
        useNavigation.mockReturnValue({
            history: [],
            navigate: mockNavigate,
            activeView: 'dashboard'
        });

        const { container } = render(<Breadcrumbs />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render default breadcrumbs when history is empty', () => {
        useNavigation.mockReturnValue({
            history: [],
            navigate: mockNavigate,
            activeView: 'practice',
            practiceTab: 'overview',
            switchPracticeTab: mockSwitchPracticeTab
        });

        render(<Breadcrumbs />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
    });

    it('should render practice tab breadcrumbs', () => {
        useNavigation.mockReturnValue({
            history: [],
            navigate: mockNavigate,
            activeView: 'practice',
            practiceTab: 'pitch',
            switchPracticeTab: mockSwitchPracticeTab
        });

        render(<Breadcrumbs />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByText('Pitch')).toBeInTheDocument();
    });

    it('should call switchPracticeTab when clicking Practice in tab view', () => {
        useNavigation.mockReturnValue({
            history: [],
            navigate: mockNavigate,
            activeView: 'practice',
            practiceTab: 'pitch',
            switchPracticeTab: mockSwitchPracticeTab
        });

        render(<Breadcrumbs />);

        const practiceLink = screen.getByText('Practice');
        fireEvent.click(practiceLink);

        expect(mockSwitchPracticeTab).toHaveBeenCalledWith('overview');
    });

    it('should render history items override', () => {
        const history = [
            { label: 'Dashboard', action: vi.fn() },
            { label: 'Practice', action: vi.fn() },
            { label: 'Pitch Tool', action: null }
        ];

        useNavigation.mockReturnValue({
            history,
            navigate: mockNavigate,
            activeView: 'practice',
            switchPracticeTab: mockSwitchPracticeTab
        });

        render(<Breadcrumbs />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByText('Pitch Tool')).toBeInTheDocument();
    });

    it('should render custom items passed as prop', () => {
        useNavigation.mockReturnValue({
            history: [],
            navigate: mockNavigate,
            activeView: 'dashboard' // Normally would return null
        });

        const customItems = [
            { label: 'Course', action: vi.fn() },
            { label: 'Module 1', action: vi.fn() },
            { label: 'Lesson 1', action: null }
        ];

        render(<Breadcrumbs items={customItems} />);

        expect(screen.getByText('Course')).toBeInTheDocument();
        expect(screen.getByText('Module 1')).toBeInTheDocument();
        expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        useNavigation.mockReturnValue({
            history: [],
            navigate: mockNavigate,
            activeView: 'practice'
        });

        const { container } = render(<Breadcrumbs className="custom-class" />);
        expect(container.firstChild).toHaveClass('custom-class');
        expect(container.firstChild).not.toHaveClass('mb-4');
    });
});
