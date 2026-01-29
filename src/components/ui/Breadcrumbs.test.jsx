import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Breadcrumbs from './Breadcrumbs';
import { useNavigation } from '../../context/NavigationContext';

// Mock context
vi.mock('../../context/NavigationContext', () => ({
    useNavigation: vi.fn()
}));

// Mock lucide-react to verify icons
vi.mock('lucide-react', async () => {
    return {
        ChevronRight: () => <div data-testid="icon-chevron" />,
        Home: () => <div data-testid="icon-home" />,
        Mic: () => <div data-testid="icon-mic" />,
        Activity: () => <div data-testid="icon-activity" />,
        Settings: () => <div data-testid="icon-settings" />,
        Layers: () => <div data-testid="icon-layers" />,
        History: () => <div data-testid="icon-history" />,
        Library: () => <div data-testid="icon-library" />,
        BookA: () => <div data-testid="icon-book" />,
        FileText: () => <div data-testid="icon-file-text" />,
        TrendingUp: () => <div data-testid="icon-trending-up" />,
        BarChart2: () => <div data-testid="icon-bar-chart" />,
        Stethoscope: () => <div data-testid="icon-stethoscope" />,
        Flame: () => <div data-testid="icon-flame" />,
        ClipboardCheck: () => <div data-testid="icon-clipboard" />,
        Music: () => <div data-testid="icon-music" />,
        Cpu: () => <div data-testid="icon-cpu" />,
        GraduationCap: () => <div data-testid="icon-graduation-cap" />,
        BookOpen: () => <div data-testid="icon-book-open" />
    };
});

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

    it('should render default breadcrumbs with icons when history is empty', () => {
        useNavigation.mockReturnValue({
            history: [],
            navigate: mockNavigate,
            activeView: 'practice',
            practiceTab: 'overview',
            switchPracticeTab: mockSwitchPracticeTab
        });

        render(<Breadcrumbs />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('icon-home')).toBeInTheDocument();

        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByTestId('icon-mic')).toBeInTheDocument();
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

    it('should render correct icon for settings view', () => {
        useNavigation.mockReturnValue({
            history: [],
            navigate: mockNavigate,
            activeView: 'settings',
            switchPracticeTab: mockSwitchPracticeTab
        });

        render(<Breadcrumbs />);

        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
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

    it('should render history items override with icons if provided', () => {
        const history = [
            { label: 'Dashboard', action: vi.fn(), icon: () => <div data-testid="custom-icon" /> },
            { label: 'Custom Page', action: null }
        ];

        useNavigation.mockReturnValue({
            history,
            navigate: mockNavigate,
            activeView: 'practice',
            switchPracticeTab: mockSwitchPracticeTab
        });

        render(<Breadcrumbs />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
        expect(screen.getByText('Custom Page')).toBeInTheDocument();
    });
});
