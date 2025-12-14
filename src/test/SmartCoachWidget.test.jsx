import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SmartCoachWidget from '../components/dashboard/SmartCoachWidget';
import { ProfileContext } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

// Mock Lucide icons to avoid issues
vi.mock('lucide-react', () => ({
    Sparkles: () => <div data-testid="icon-sparkles" />,
    Play: () => <div data-testid="icon-play" />,
    Target: () => <div data-testid="icon-target" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    Calendar: () => <div data-testid="icon-calendar" />
}));

// Mock IndexedDBManager
vi.mock('../services/IndexedDBManager', () => ({
    indexedDB: {
        ensureReady: vi.fn().mockResolvedValue(true),
        getProfiles: vi.fn().mockResolvedValue([]),
        saveProfile: vi.fn().mockResolvedValue(true),
        getSetting: vi.fn().mockResolvedValue(null),
        saveSetting: vi.fn().mockResolvedValue(true)
    }
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('SmartCoachWidget', () => {
    const mockOnOpenAdaptiveSession = vi.fn();

    beforeEach(() => {
        // Default mock implementation
        useAuth.mockReturnValue({ user: { username: 'Riley' } });
    });

    const renderWidget = (profileData = {}) => {
        const defaultProfile = {
            activeProfile: 'p1',
            voiceProfiles: [{ id: 'p1', name: 'Riley' }],
            goals: ['pitch', 'stability'],
            ...profileData
        };

        return render(
            <ProfileContext.Provider value={defaultProfile}>
                <SmartCoachWidget onStartSession={mockOnOpenAdaptiveSession} />
            </ProfileContext.Provider>
        );
    };

    it('should render the user name and ignore profile name', () => {
        // Set profile name to 'Feminization' to simulate the bug scenario
        renderWidget({ voiceProfiles: [{ id: 'p1', name: 'Feminization' }] });

        // Should show 'Riley' (from Auth mock)
        expect(screen.getByText(/Riley/)).toBeInTheDocument();
        // Should NOT show 'Feminization'
        expect(screen.queryByText(/Feminization/)).not.toBeInTheDocument();
    });

    it('should not render any name if user is not logged in', () => {
        // Mock no user
        useAuth.mockReturnValue({ user: null });

        renderWidget();

        // Should match "Good [Time]" but not have a name
        // We can check that "Riley" is NOT there
        expect(screen.queryByText(/Riley/)).not.toBeInTheDocument();
        // And check for basic greeting part
        const hour = new Date().getHours();
        let greeting = 'Good Evening';
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 18) greeting = 'Good Afternoon';
        expect(screen.getByText(new RegExp(greeting))).toBeInTheDocument();
    });

    it('should display a daily focus based on goals', () => {
        renderWidget({ goals: ['resonance'] });
        expect(screen.getByText(/Daily Focus/i)).toBeInTheDocument();
    });

    it('should call onOpenAdaptiveSession when button is clicked', () => {
        renderWidget();
        const button = screen.getByText(/Start Guided Session/i);
        fireEvent.click(button);
        expect(mockOnOpenAdaptiveSession).toHaveBeenCalledTimes(1);
    });

    it('should render stats placeholders', () => {
        renderWidget();
        expect(screen.getByText(/15 min/i)).toBeInTheDocument(); // Goal
        expect(screen.getByText(/3 Days/i)).toBeInTheDocument(); // Streak
    });
});
