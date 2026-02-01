
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';
import { ProfileProvider } from '../../context/ProfileContext';
import { NavigationProvider } from '../../context/NavigationContext';
import { SettingsProvider } from '../../context/SettingsContext';

// Mock Lucide icons
vi.mock('lucide-react', () => {
    return {
        Home: () => <svg data-testid="icon-home" />,
        BookOpen: () => <svg data-testid="icon-book-open" />,
        Activity: () => <svg data-testid="icon-activity" />,
        BarChart2: () => <svg data-testid="icon-bar-chart-2" />,
        Settings: () => <svg data-testid="icon-settings" />,
        Menu: () => <svg data-testid="icon-menu" />,
        X: () => <svg data-testid="icon-x" />,
        ChevronRight: () => <svg data-testid="icon-chevron-right" />,
        Waves: () => <svg data-testid="icon-waves" />,
        Search: () => <svg data-testid="icon-search" />,
        FileText: () => <svg data-testid="icon-file-text" />,
        HelpCircle: () => <svg data-testid="icon-help-circle" />,
        Layers: () => <svg data-testid="icon-layers" />,
        BookMarked: () => <svg data-testid="icon-book-marked" />,
        Camera: () => <svg data-testid="icon-camera" />,
        Briefcase: () => <svg data-testid="icon-briefcase" />,
        ClipboardCheck: () => <svg data-testid="icon-clipboard-check" />,
        Mic: () => <svg data-testid="icon-mic" />
    };
});

// Mock hooks
vi.mock('../../context/ProfileContext', () => ({
    ProfileProvider: ({ children }) => <div>{children}</div>,
    useProfile: () => ({
        user: { name: 'Test User', email: 'test@example.com' },
        logout: vi.fn()
    })
}));

vi.mock('../../context/NavigationContext', () => ({
    NavigationProvider: ({ children }) => <div>{children}</div>,
    useNavigation: () => ({
        activeView: 'dashboard',
        navigate: vi.fn(),
        openModal: vi.fn()
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    SettingsProvider: ({ children }) => <div>{children}</div>,
    useSettings: () => ({
        settings: { theme: 'dark' }
    })
}));

// Mock Feature Flags
vi.mock('../../config/featureFlags', () => ({
    FEATURES: {
        dashboard: true,
        practice: true,
        journal: true,
        analysis: true,
        analytics: true,
        library: true,
        'client-dashboard': true,
        capev: true,
        spectrogram: true,
        'pitch-tool': true,
        camera: true, // Enable camera for test
        settings: true
    }
}));

describe('Sidebar', () => {
    const onViewChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderSidebar = () => {
        render(
            <SettingsProvider>
                <ProfileProvider>
                    <NavigationProvider>
                        <Sidebar activeView="dashboard" onViewChange={onViewChange} />
                    </NavigationProvider>
                </ProfileProvider>
            </SettingsProvider>
        );
    };

    it('renders the sidebar with correct title', () => {
        renderSidebar();
        expect(screen.getByText('Vocal GEM')).toBeInTheDocument();
        expect(screen.getByText('Gender Expression Modulator')).toBeInTheDocument();
    });

    it('renders navigation items', () => {
        renderSidebar();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Practice')).toBeInTheDocument();
        expect(screen.getByText('Voice Log')).toBeInTheDocument();
        expect(screen.getByText('Analysis')).toBeInTheDocument();
        expect(screen.getByText('Mirror')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders version info', () => {
        renderSidebar();
        // Version might change, just check for v* format or specific mock if needed
        expect(screen.getByTitle('App Version')).toBeInTheDocument();
    });

    it('renders search bar', () => {
        renderSidebar();
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('renders mobile toggle button', () => {
        renderSidebar();
        expect(screen.getByTestId('icon-menu')).toBeInTheDocument();
    });

    it('renders frontend demo mode footer', () => {
        renderSidebar();
        expect(screen.getByText('Frontend Demo Mode')).toBeInTheDocument();
    });
});
